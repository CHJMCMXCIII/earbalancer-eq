// Web Audio API Audio Engine
// 실시간 소리 생성, 좌/우 개별 채널 제어, ISO 226 자동 연동,
// 무중단 A/B 전환, 일시정지(Pause)/재개(Resume), 탐색(Seek), 게인 매칭, 소프트 리미터

export interface BandCalibration {
  leftDb: number;
  rightDb: number;
  phaseInvert: boolean;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;

  // 톤 제너레이터 (단일 주파수 순음 생성기)
  private osc: OscillatorNode | null = null;
  private oscLeftGain: GainNode | null = null;
  private oscRightGain: GainNode | null = null;
  private oscMerger: ChannelMergerNode | null = null;
  private toneActive: boolean = false;
  private currentFrequency: number = 1000;
  private currentChannelMode: 'left' | 'center' | 'right' = 'center';

  // A/B 테스트용 오디오 재생기 (재생/일시정지/탐색 지원)
  private abSourceNode: AudioBufferSourceNode | null = null;
  private abAudioBuffer: AudioBuffer | null = null;
  private abBypassGain: GainNode | null = null;
  private abEqGain: GainNode | null = null;
  private abIsPlaying: boolean = false;
  private abIsPaused: boolean = false;
  private abBypass: boolean = false;

  // 핑크 노이즈 재생기 (전 대역 중심 음상 정위 확인용)
  private pnBuffer: AudioBuffer | null = null;
  private pnSource: AudioBufferSourceNode | null = null;
  private pnEqGain: GainNode | null = null;
  private pnBypassGain: GainNode | null = null;
  private pnMainGain: GainNode | null = null;
  private pnFilters: { left: BiquadFilterNode; right: BiquadFilterNode; freq: number }[] = [];
  private pnIsPlaying: boolean = false;
  private pnBypass: boolean = false;

  // 재생 위치 추적
  private abStartedAt: number = 0;
  private abPausedAt: number = 0;
  private abDuration: number = 0;

  constructor() {}

  public async ensureContext(): Promise<AudioContext> {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // 청각 보호 소프트 리미터
      this.limiter = this.ctx.createDynamicsCompressor();
      this.limiter.threshold.setValueAtTime(-3.0, this.ctx.currentTime);
      this.limiter.knee.setValueAtTime(6.0, this.ctx.currentTime);
      this.limiter.ratio.setValueAtTime(20.0, this.ctx.currentTime);
      this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.limiter.release.setValueAtTime(0.1, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      this.masterGain.connect(this.limiter);
      this.limiter.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    return this.ctx;
  }

  public setMasterVolume(vol: number) {
    if (!this.masterGain || !this.ctx) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.masterGain.gain.setTargetAtTime(clamped * 0.5, this.ctx.currentTime, 0.02);
  }

  public async startTone(
    freq: number,
    leftDb: number = 0,
    rightDb: number = 0,
    phaseInvert: boolean = false,
    isoOffsetDb: number = 0,
    channelMode: 'left' | 'center' | 'right' = 'center'
  ) {
    await this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    this.stopTone();
    this.stopPinkNoise();

    this.currentFrequency = freq;
    this.currentChannelMode = channelMode;
    const now = this.ctx.currentTime;

    this.osc = this.ctx.createOscillator();
    this.osc.type = 'sine';
    this.osc.frequency.setValueAtTime(freq, now);

    const baseLinear = 0.15;
    // 등청감 보정 오프셋 적용:
    // 고역대/중고역대 감쇄(음수 dB)는 인간 청각 보호 및 균일 체감 음량을 위해 온전히 반영 (최대 -12dB)
    // 저역대 증폭(양수 dB)은 디지털 클리핑 방지를 위해 적절히 스케일링 (최대 +16dB)
    const effectiveIso = isoOffsetDb <= 0
      ? Math.max(-12, isoOffsetDb)
      : Math.min(16, isoOffsetDb * 0.55);

    const effectiveLeftDb = leftDb + effectiveIso;
    const effectiveRightDb = rightDb + effectiveIso;

    let leftLinear = baseLinear * Math.pow(10, effectiveLeftDb / 20);
    let rightLinear = baseLinear * Math.pow(10, effectiveRightDb / 20) * (phaseInvert ? -1 : 1);

    // L, Center, R 단독/양쪽 채널 제어
    if (this.currentChannelMode === 'left') {
      rightLinear = 0.0001;
    } else if (this.currentChannelMode === 'right') {
      leftLinear = 0.0001;
    }

    this.oscLeftGain = this.ctx.createGain();
    this.oscRightGain = this.ctx.createGain();

    this.oscLeftGain.gain.setValueAtTime(0.0001, now);
    this.oscLeftGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, Math.abs(leftLinear)), now + 0.025);

    this.oscRightGain.gain.setValueAtTime(0.0001, now);
    this.oscRightGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, Math.abs(rightLinear)), now + 0.025);

    this.oscMerger = this.ctx.createChannelMerger(2);

    this.osc.connect(this.oscLeftGain);
    this.osc.connect(this.oscRightGain);

    this.oscLeftGain.connect(this.oscMerger, 0, 0);
    this.oscRightGain.connect(this.oscMerger, 0, 1);

    this.oscMerger.connect(this.masterGain);

    this.osc.start(now);
    this.toneActive = true;
  }

  public updateToneParams(
    leftDb: number,
    rightDb: number,
    phaseInvert: boolean,
    isoOffsetDb: number = 0,
    channelMode?: 'left' | 'center' | 'right'
  ) {
    if (!this.ctx || !this.toneActive || !this.oscLeftGain || !this.oscRightGain) return;

    if (channelMode) {
      this.currentChannelMode = channelMode;
    }

    const now = this.ctx.currentTime;
    const baseLinear = 0.15;
    const effectiveIso = isoOffsetDb <= 0
      ? Math.max(-12, isoOffsetDb)
      : Math.min(16, isoOffsetDb * 0.55);

    const effectiveLeftDb = leftDb + effectiveIso;
    const effectiveRightDb = rightDb + effectiveIso;

    let leftLinear = Math.max(0.0001, baseLinear * Math.pow(10, effectiveLeftDb / 20));
    let rightLinear = (phaseInvert ? -1 : 1) * Math.max(0.0001, baseLinear * Math.pow(10, effectiveRightDb / 20));

    // L, Center, R 단독/양쪽 채널 제어
    if (this.currentChannelMode === 'left') {
      rightLinear = 0.0001;
    } else if (this.currentChannelMode === 'right') {
      leftLinear = 0.0001;
    }

    this.oscLeftGain.gain.setTargetAtTime(leftLinear, now, 0.015);
    this.oscRightGain.gain.setTargetAtTime(rightLinear, now, 0.015);
  }

  public stopTone() {
    if (!this.toneActive || !this.osc || !this.ctx) return;

    const now = this.ctx.currentTime;
    try {
      if (this.oscLeftGain && this.oscRightGain) {
        this.oscLeftGain.gain.setTargetAtTime(0.0001, now, 0.015);
        this.oscRightGain.gain.setTargetAtTime(0.0001, now, 0.015);
      }
      this.osc.stop(now + 0.03);
    } catch {
      // ignore
    }

    this.toneActive = false;
    this.osc = null;
  }

  public isToneActive(): boolean {
    return this.toneActive;
  }

  /**
   * 전 가청 주파수가 고르게 감쇄(1/f)되는 표준 핑크 노이즈 버퍼 생성 (10초 무한 루프)
   * 좌/우 채널에 동일한 코릴레이티드(상관) 모노 핑크 노이즈를 출력하여 음상 중심점을 정밀 검증
   */
  public createPinkNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not ready');

    const sampleRate = this.ctx.sampleRate;
    const duration = 10.0;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(2, length, sampleRate);

    const leftData = buffer.getChannelData(0);
    const rightData = buffer.getChannelData(1);

    // Paul Kellet의 정밀 핑크 노이즈 필터 알고리즘 (옥타브당 -3dB 균등 에너지)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    // 초기 DC 오프셋 안정화를 위한 웜업
    for (let i = 0; i < 2000; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      b6 = white * 0.115926;
    }

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
      b6 = white * 0.115926;

      // 양쪽 귀에 동일 신호 입력 (중심 음상 정위 확인용 코릴레이티드 신호)
      leftData[i] = pink;
      rightData[i] = pink;
    }

    // 버퍼 끝부분 50ms 크로스페이드로 루프 시 팝/클릭 노이즈 완벽 제거
    const fadeLen = Math.floor(sampleRate * 0.05);
    for (let i = 0; i < fadeLen; i++) {
      const w = i / fadeLen;
      leftData[i] *= w;
      rightData[i] *= w;
      leftData[length - 1 - i] *= w;
      rightData[length - 1 - i] *= w;
    }

    return buffer;
  }

  /**
   * 핑크 노이즈 실시간 재생 시작 (현재 조정한 EQ 보정 필터 체인 통과)
   */
  public async startPinkNoise(
    calibrations: { freq: number; leftDb: number; rightDb: number; q?: number }[],
    bypass: boolean = false
  ) {
    const ctx = await this.ensureContext();
    if (!this.masterGain) return;

    this.stopTone();
    this.stopPinkNoise();

    if (!this.pnBuffer) {
      this.pnBuffer = this.createPinkNoiseBuffer();
    }

    const now = ctx.currentTime;
    this.pnSource = ctx.createBufferSource();
    this.pnSource.buffer = this.pnBuffer;
    this.pnSource.loop = true;

    // 체감 음량 보정
    const totalBoost = calibrations.reduce((sum, b) => sum + (b.leftDb + b.rightDb) / 2, 0);
    const avgBoostDb = calibrations.length > 0 ? totalBoost / calibrations.length : 0;
    const gainMatchLinear = Math.pow(10, (-avgBoostDb * 0.75) / 20);

    this.pnBypassGain = ctx.createGain();
    this.pnBypassGain.gain.setValueAtTime(bypass ? 1.0 : 0.0, now);

    this.pnEqGain = ctx.createGain();
    this.pnEqGain.gain.setValueAtTime(!bypass ? gainMatchLinear : 0.0, now);

    this.pnMainGain = ctx.createGain();
    this.pnMainGain.gain.setValueAtTime(0.001, now);
    this.pnMainGain.gain.exponentialRampToValueAtTime(1.0, now + 0.03);

    // 캘리브레이션 필터 체인 구성
    const splitter = ctx.createChannelSplitter(2);
    const merger = ctx.createChannelMerger(2);

    let prevLeft: AudioNode = splitter;
    let prevRight: AudioNode = splitter;

    const defaultQ = calibrations.length > 31 ? 8.65 : 4.31;
    this.pnFilters = [];

    calibrations.forEach((b, idx) => {
      const qVal = b.q !== undefined ? b.q : defaultQ;

      const leftFilt = ctx.createBiquadFilter();
      leftFilt.type = 'peaking';
      leftFilt.frequency.setValueAtTime(b.freq, now);
      leftFilt.Q.setValueAtTime(qVal, now);
      leftFilt.gain.setValueAtTime(b.leftDb, now);

      const rightFilt = ctx.createBiquadFilter();
      rightFilt.type = 'peaking';
      rightFilt.frequency.setValueAtTime(b.freq, now);
      rightFilt.Q.setValueAtTime(qVal, now);
      rightFilt.gain.setValueAtTime(b.rightDb, now);

      this.pnFilters.push({ left: leftFilt, right: rightFilt, freq: b.freq });

      if (idx === 0) {
        splitter.connect(leftFilt, 0);
        splitter.connect(rightFilt, 1);
      } else {
        prevLeft.connect(leftFilt);
        prevRight.connect(rightFilt);
      }

      prevLeft = leftFilt;
      prevRight = rightFilt;
    });

    prevLeft.connect(merger, 0, 0);
    prevRight.connect(merger, 0, 1);

    // 1. 원본 바이패스 경로
    this.pnSource.connect(this.pnBypassGain);
    this.pnBypassGain.connect(this.pnMainGain);

    // 2. EQ 보정 통과 경로
    this.pnSource.connect(splitter);
    merger.connect(this.pnEqGain);
    this.pnEqGain.connect(this.pnMainGain);

    this.pnMainGain.connect(this.masterGain);

    this.pnSource.start(now);
    this.pnIsPlaying = true;
    this.pnBypass = bypass;
  }

  /**
   * 핑크 노이즈 재생 중 슬라이더 변경 시 필터 게인 실시간 즉시 갱신
   */
  public updatePinkNoiseGains(calibrations: { freq: number; leftDb: number; rightDb: number }[]) {
    if (!this.ctx || !this.pnIsPlaying) return;
    const now = this.ctx.currentTime;

    this.pnFilters.forEach((filt, idx) => {
      const c = calibrations[idx];
      if (c) {
        filt.left.gain.setTargetAtTime(c.leftDb, now, 0.015);
        filt.right.gain.setTargetAtTime(c.rightDb, now, 0.015);
      }
    });

    if (this.pnEqGain && !this.pnBypass) {
      const totalBoost = calibrations.reduce((sum, b) => sum + (b.leftDb + b.rightDb) / 2, 0);
      const avgBoostDb = calibrations.length > 0 ? totalBoost / calibrations.length : 0;
      const gainMatchLinear = Math.pow(10, (-avgBoostDb * 0.75) / 20);
      this.pnEqGain.gain.setTargetAtTime(gainMatchLinear, now, 0.02);
    }
  }

  /**
   * 핑크 노이즈 보정 적용(EQ) <-> 원본(Bypass) 실시간 무중단 전환
   */
  public togglePinkNoiseBypass(bypass: boolean, calibrations: { freq: number; leftDb: number; rightDb: number }[]) {
    if (!this.ctx || !this.pnIsPlaying || !this.pnBypassGain || !this.pnEqGain) return;
    const now = this.ctx.currentTime;
    this.pnBypass = bypass;

    const totalBoost = calibrations.reduce((sum, b) => sum + (b.leftDb + b.rightDb) / 2, 0);
    const avgBoostDb = calibrations.length > 0 ? totalBoost / calibrations.length : 0;
    const gainMatchLinear = Math.pow(10, (-avgBoostDb * 0.75) / 20);

    if (bypass) {
      this.pnEqGain.gain.setTargetAtTime(0.0001, now, 0.02);
      this.pnBypassGain.gain.setTargetAtTime(1.0, now, 0.02);
    } else {
      this.pnBypassGain.gain.setTargetAtTime(0.0001, now, 0.02);
      this.pnEqGain.gain.setTargetAtTime(gainMatchLinear, now, 0.02);
    }
  }

  /**
   * 핑크 노이즈 정지
   */
  public stopPinkNoise() {
    if (!this.pnIsPlaying || !this.ctx) return;
    const now = this.ctx.currentTime;
    try {
      if (this.pnMainGain) {
        this.pnMainGain.gain.setTargetAtTime(0.0001, now, 0.02);
      }
      if (this.pnSource) {
        this.pnSource.stop(now + 0.03);
      }
    } catch {
      // ignore
    }
    this.pnIsPlaying = false;
    this.pnSource = null;
    this.pnFilters = [];
  }

  public isPinkNoiseActive(): boolean {
    return this.pnIsPlaying;
  }

  public createAmbientTestBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not ready');

    const sampleRate = this.ctx.sampleRate;
    const duration = 16.0;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(2, length, sampleRate);

    const leftData = buffer.getChannelData(0);
    const rightData = buffer.getChannelData(1);

    const chordFrequencies = [
      [130.81, 164.81, 196.00, 246.94, 293.66, 523.25, 1046.50, 2093.00],
      [110.00, 164.81, 220.00, 261.63, 329.63, 659.25, 1318.51, 2637.02],
      [87.31, 130.81, 174.61, 220.00, 349.23, 698.46, 1396.91, 2793.83],
      [98.00, 146.83, 196.00, 293.66, 392.00, 783.99, 1567.98, 3135.96],
    ];

    const chordDuration = duration / 4;

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const chordIndex = Math.floor(t / chordDuration) % 4;
      const freqs = chordFrequencies[chordIndex];

      let leftSample = 0;
      let rightSample = 0;

      for (let f = 0; f < freqs.length; f++) {
        const freq = freqs[f];
        const amp = 0.08 / (f * 0.4 + 1);
        const lPhase = f % 2 === 0 ? 0 : 0.5;
        const rPhase = f % 2 === 0 ? 0.3 : 0.8;
        const lfo = 0.8 + 0.2 * Math.sin(2 * Math.PI * 0.4 * t + f);

        leftSample += Math.sin(2 * Math.PI * freq * t + lPhase) * amp * lfo;
        rightSample += Math.sin(2 * Math.PI * freq * t + rPhase) * amp * lfo;
      }

      const noise = (Math.random() * 2 - 1) * 0.005;
      leftData[i] = leftSample + noise;
      rightData[i] = rightSample + noise;
    }

    return buffer;
  }

  public async loadAudioFile(file: File): Promise<AudioBuffer> {
    const ctx = await this.ensureContext();
    const arrayBuffer = await file.arrayBuffer();
    const decoded = await ctx.decodeAudioData(arrayBuffer);
    this.abAudioBuffer = decoded;
    this.abDuration = decoded.duration;
    this.abPausedAt = 0;
    return decoded;
  }

  /**
   * A/B 비교 테스트 재생 (특정 오프셋 위치에서 시작 가능)
   */
  public async startABTest(
    calibrations: { freq: number; leftDb: number; rightDb: number; q?: number }[],
    bypass: boolean = false,
    offsetSeconds: number = 0
  ) {
    const ctx = await this.ensureContext();
    if (!this.masterGain) return;

    this.stopABTestInternal();

    if (!this.abAudioBuffer) {
      this.abAudioBuffer = this.createAmbientTestBuffer();
    }
    this.abDuration = this.abAudioBuffer.duration;

    const now = ctx.currentTime;
    this.abSourceNode = ctx.createBufferSource();
    this.abSourceNode.buffer = this.abAudioBuffer;
    this.abSourceNode.loop = true;

    // 체감 음량 자동 매칭
    const totalBoost = calibrations.reduce((sum, b) => sum + (b.leftDb + b.rightDb) / 2, 0);
    const avgBoostDb = calibrations.length > 0 ? totalBoost / calibrations.length : 0;
    const gainMatchLinear = Math.pow(10, (-avgBoostDb * 0.75) / 20);

    // 1. 원본 바이패스 게인 (Option A)
    this.abBypassGain = ctx.createGain();
    this.abBypassGain.gain.setValueAtTime(bypass ? 1.0 : 0.0, now);

    // 2. EQ 통과 게인 (Option B)
    this.abEqGain = ctx.createGain();
    this.abEqGain.gain.setValueAtTime(!bypass ? gainMatchLinear : 0.0, now);

    // 3. 다중 밴드(31/61밴드) 스테레오 필터 체인
    const splitter = ctx.createChannelSplitter(2);
    const merger = ctx.createChannelMerger(2);

    let prevLeft: AudioNode = splitter;
    let prevRight: AudioNode = splitter;

    const defaultQ = calibrations.length > 31 ? 8.65 : 4.31;

    calibrations.forEach((b, idx) => {
      const qVal = b.q !== undefined ? b.q : defaultQ;

      const leftFilt = ctx.createBiquadFilter();
      leftFilt.type = 'peaking';
      leftFilt.frequency.setValueAtTime(b.freq, now);
      leftFilt.Q.setValueAtTime(qVal, now);
      leftFilt.gain.setValueAtTime(b.leftDb, now);

      const rightFilt = ctx.createBiquadFilter();
      rightFilt.type = 'peaking';
      rightFilt.frequency.setValueAtTime(b.freq, now);
      rightFilt.Q.setValueAtTime(qVal, now);
      rightFilt.gain.setValueAtTime(b.rightDb, now);

      if (idx === 0) {
        splitter.connect(leftFilt, 0);
        splitter.connect(rightFilt, 1);
      } else {
        prevLeft.connect(leftFilt);
        prevRight.connect(rightFilt);
      }

      prevLeft = leftFilt;
      prevRight = rightFilt;
    });

    prevLeft.connect(merger, 0, 0);
    prevRight.connect(merger, 0, 1);

    // 경로 A
    this.abSourceNode.connect(this.abBypassGain);
    this.abBypassGain.connect(this.masterGain);

    // 경로 B
    this.abSourceNode.connect(splitter);
    merger.connect(this.abEqGain);
    this.abEqGain.connect(this.masterGain);

    // 오프셋 위치에서 재생 시작
    const safeOffset = Math.max(0, offsetSeconds % this.abDuration);
    this.abSourceNode.start(now, safeOffset);
    this.abStartedAt = now - safeOffset;
    this.abIsPlaying = true;
    this.abIsPaused = false;
    this.abBypass = bypass;
  }

  /**
   * 일시정지 (Pause)
   */
  public pauseABTest() {
    if (!this.abIsPlaying || !this.ctx) return;

    const now = this.ctx.currentTime;
    if (this.abDuration > 0) {
      this.abPausedAt = (now - this.abStartedAt) % this.abDuration;
    }

    this.stopABTestInternal();
    this.abIsPlaying = false;
    this.abIsPaused = true;
  }

  /**
   * 일시정지 후 재개 (Resume)
   */
  public async resumeABTest(calibrations: { freq: number; leftDb: number; rightDb: number; q?: number }[]) {
    await this.startABTest(calibrations, this.abBypass, this.abPausedAt);
  }

  /**
   * 재생 구간 탐색 (Seek)
   */
  public async seekABTest(
    targetSeconds: number,
    calibrations: { freq: number; leftDb: number; rightDb: number; q?: number }[]
  ) {
    this.abPausedAt = targetSeconds;
    if (this.abIsPlaying) {
      await this.startABTest(calibrations, this.abBypass, targetSeconds);
    }
  }

  /**
   * 현재 재생 시간 및 총 길이 반환
   */
  public getCurrentPlaybackInfo(): { currentTime: number; duration: number } {
    if (!this.abAudioBuffer) {
      return { currentTime: 0, duration: 16 };
    }

    const duration = this.abAudioBuffer.duration;
    if (this.abIsPaused) {
      return { currentTime: this.abPausedAt, duration };
    }

    if (!this.abIsPlaying || !this.ctx) {
      return { currentTime: 0, duration };
    }

    const elapsed = (this.ctx.currentTime - this.abStartedAt) % duration;
    return { currentTime: elapsed, duration };
  }

  /**
   * 무중단 실시간 A/B 전환
   */
  public toggleABBypass(
    bypass: boolean,
    calibrations: { freq: number; leftDb: number; rightDb: number }[]
  ) {
    this.abBypass = bypass;
    if (!this.abIsPlaying || !this.ctx || !this.abBypassGain || !this.abEqGain) return;

    const now = this.ctx.currentTime;
    const timeConstant = 0.015;

    const totalBoost = calibrations.reduce((sum, b) => sum + (b.leftDb + b.rightDb) / 2, 0);
    const avgBoostDb = calibrations.length > 0 ? totalBoost / calibrations.length : 0;
    const gainMatchLinear = Math.pow(10, (-avgBoostDb * 0.75) / 20);

    if (bypass) {
      this.abBypassGain.gain.setTargetAtTime(1.0, now, timeConstant);
      this.abEqGain.gain.setTargetAtTime(0.0001, now, timeConstant);
    } else {
      this.abBypassGain.gain.setTargetAtTime(0.0001, now, timeConstant);
      this.abEqGain.gain.setTargetAtTime(gainMatchLinear, now, timeConstant);
    }
  }

  private stopABTestInternal() {
    if (this.abSourceNode) {
      try {
        this.abSourceNode.stop();
        this.abSourceNode.disconnect();
      } catch {
        // ignore
      }
      this.abSourceNode = null;
    }
  }

  public stopABTest() {
    this.stopABTestInternal();
    this.abIsPlaying = false;
    this.abIsPaused = false;
    this.abPausedAt = 0;
  }

  public isABPlaying(): boolean {
    return this.abIsPlaying;
  }

  public isABPaused(): boolean {
    return this.abIsPaused;
  }
}

export const audioEngine = new AudioEngine();
