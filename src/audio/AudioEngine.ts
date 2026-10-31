// Web Audio API Audio Engine
// 실시간 소리 생성, 31밴드 필터링, 안전 볼륨 리미터 및 패닉(긴급 정지) 제어

export interface BandCalibration {
  leftDb: number;   // -15 dB ~ +15 dB
  rightDb: number;  // -15 dB ~ +15 dB
  phaseInvert: boolean; // 180도 위상 반전
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;

  // 톤 제너레이터 (단일 주파수 테스트용)
  private osc: OscillatorNode | null = null;
  private oscLeftGain: GainNode | null = null;
  private oscRightGain: GainNode | null = null;
  private oscMerger: ChannelMergerNode | null = null;
  private toneActive: boolean = false;
  private currentFrequency: number = 1000;

  // A/B 테스트용 오디오 재생기
  private abSourceNode: AudioBufferSourceNode | null = null;
  private abAudioBuffer: AudioBuffer | null = null;
  private abGainNode: GainNode | null = null;
  private abFilters: { left: BiquadFilterNode; right: BiquadFilterNode }[] = [];
  private abIsPlaying: boolean = false;
  private abBypass: boolean = false;

  // 상태 플래그
  private isMuted: boolean = false;

  constructor() {
    // 생성자에서는 AudioContext를 브라우저 정책(Autoplay) 때문에 대기
  }

  /**
   * 사용자 제스처(클릭) 시 AudioContext 초기화 및 오디오 그래프 구축
   */
  public async ensureContext(): Promise<AudioContext> {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // [안전 장치] 소프트 리미터 (과도한 피크로 인한 청력 손상 및 스피커 손상 방지)
      this.limiter = this.ctx.createDynamicsCompressor();
      this.limiter.threshold.setValueAtTime(-3.0, this.ctx.currentTime); // -3dB에서 리미팅 시작
      this.limiter.knee.setValueAtTime(6.0, this.ctx.currentTime);
      this.limiter.ratio.setValueAtTime(20.0, this.ctx.currentTime);     // 강력한 압축으로 클리핑 방지
      this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);  // 3ms 초고속 반응
      this.limiter.release.setValueAtTime(0.1, this.ctx.currentTime);   // 100ms 복귀

      // 마스터 볼륨 게인
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime); // 기본 -10dB 안전 레벨

      // 마스터 체인 연결: masterGain -> limiter -> destination
      this.masterGain.connect(this.limiter);
      this.limiter.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    return this.ctx;
  }

  /**
   * 마스터 볼륨 설정 (0.0 ~ 1.0)
   */
  public setMasterVolume(vol: number) {
    if (!this.masterGain || !this.ctx) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.masterGain.gain.setTargetAtTime(clamped * 0.5, this.ctx.currentTime, 0.02);
  }

  /**
   * [비상 정지 버튼 (Panic Button)]
   * 모든 소리를 1ms 이내로 즉시 뮤트하고 톤 및 재생을 정지
   */
  public panicStop() {
    this.stopTone();
    this.stopABTest();

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
    this.isMuted = true;
  }

  /**
   * 비상 정지 해제 및 사운드 시스템 복구
   */
  public async unpause() {
    if (!this.ctx) {
      await this.ensureContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    }
    this.isMuted = false;
  }

  /**
   * 단일 주파수 순음(Sine wave) 재생 시작
   * @param freq 주파수 (Hz)
   * @param leftDb 좌측 게인 (dB)
   * @param rightDb 우측 게인 (dB)
   * @param phaseInvert 위상 180도 반전 여부
   * @param isoOffsetDb ISO 226 사람 청각 보정 dB 오프셋
   */
  public async startTone(
    freq: number,
    leftDb: number = 0,
    rightDb: number = 0,
    phaseInvert: boolean = false,
    isoOffsetDb: number = 0
  ) {
    await this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    this.stopTone(); // 이전 톤이 있다면 부드럽게 정지

    this.currentFrequency = freq;
    const now = this.ctx.currentTime;

    // 1. 발진기 생성 (Sine wave)
    this.osc = this.ctx.createOscillator();
    this.osc.type = 'sine';
    this.osc.frequency.setValueAtTime(freq, now);

    // 2. 좌우 개별 게인 노드 (dB -> Linear 진폭 변환)
    // 청각 보호를 위해 기준 진폭 0.2에 offset 적용
    const baseLinear = 0.15;
    // ISO 보정은 지나치게 큰 소리가 나지 않도록 클램프
    const clampedIso = Math.min(20, Math.max(-10, isoOffsetDb * 0.6));
    const effectiveLeftDb = leftDb + clampedIso;
    const effectiveRightDb = rightDb + clampedIso;

    const leftLinear = baseLinear * Math.pow(10, effectiveLeftDb / 20);
    const rightLinear = baseLinear * Math.pow(10, effectiveRightDb / 20) * (phaseInvert ? -1 : 1);

    this.oscLeftGain = this.ctx.createGain();
    this.oscRightGain = this.ctx.createGain();

    // 팝노이즈 방지를 위해 0에서 시작하여 20ms 동안 부드럽게 상승 (Smooth Ramp)
    this.oscLeftGain.gain.setValueAtTime(0.0001, now);
    this.oscLeftGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, Math.abs(leftLinear)), now + 0.025);

    this.oscRightGain.gain.setValueAtTime(0.0001, now);
    this.oscRightGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, Math.abs(rightLinear)), now + 0.025);

    // 3. 스테레오 채널 병합 (Left -> ch 0, Right -> ch 1)
    this.oscMerger = this.ctx.createChannelMerger(2);

    this.osc.connect(this.oscLeftGain);
    this.osc.connect(this.oscRightGain);

    this.oscLeftGain.connect(this.oscMerger, 0, 0); // merger 좌측 입력
    this.oscRightGain.connect(this.oscMerger, 0, 1); // merger 우측 입력

    this.oscMerger.connect(this.masterGain);

    this.osc.start(now);
    this.toneActive = true;
  }

  /**
   * 실시간 슬라이더 조작 시 톤 파라미터 업데이트 (클릭/노이즈 없이 매끄러운 보간)
   */
  public updateToneParams(
    leftDb: number,
    rightDb: number,
    phaseInvert: boolean,
    isoOffsetDb: number = 0
  ) {
    if (!this.ctx || !this.toneActive || !this.oscLeftGain || !this.oscRightGain) return;

    const now = this.ctx.currentTime;
    const baseLinear = 0.15;
    const clampedIso = Math.min(20, Math.max(-10, isoOffsetDb * 0.6));
    const effectiveLeftDb = leftDb + clampedIso;
    const effectiveRightDb = rightDb + clampedIso;

    const leftLinear = Math.max(0.0001, baseLinear * Math.pow(10, effectiveLeftDb / 20));
    const rightLinear = Math.max(0.0001, baseLinear * Math.pow(10, effectiveRightDb / 20));

    // Linear Ramp 대신 setTargetAtTime을 사용하여 15ms 시정수로 부드럽게 실시간 추종
    this.oscLeftGain.gain.setTargetAtTime(leftLinear, now, 0.015);
    this.oscRightGain.gain.setTargetAtTime(rightLinear, now, 0.015);
  }

  /**
   * 현재 재생 중인 톤 정지 (클릭 팝 방지 Ramp Down)
   */
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
      // 이미 정지된 경우 무시
    }

    this.toneActive = false;
    this.osc = null;
  }

  public isToneActive(): boolean {
    return this.toneActive;
  }

  /**
   * 내장 편안한 오디오 샘플 버퍼 생성 (외부 음원 다운로드 없이 즉시 작동)
   * 풍부한 배음의 따뜻한 앰비언트 코드 진행 생성 (Warm Pad with gentle harmonics)
   */
  public createAmbientTestBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not ready");

    const sampleRate = this.ctx.sampleRate;
    const duration = 12.0; // 12초 루프
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(2, length, sampleRate);

    const leftData = buffer.getChannelData(0);
    const rightData = buffer.getChannelData(1);

    // Cmaj9 -> Am9 -> Fmaj7 -> G9sus4 코드 주파수 구성
    const chordFrequencies = [
      [130.81, 164.81, 196.00, 246.94, 293.66, 523.25, 1046.50, 2093.00], // C chord
      [110.00, 164.81, 220.00, 261.63, 329.63, 659.25, 1318.51, 2637.02], // Am chord
      [87.31, 130.81, 174.61, 220.00, 349.23, 698.46, 1396.91, 2793.83],  // F chord
      [98.00, 146.83, 196.00, 293.66, 392.00, 783.99, 1567.98, 3135.96],  // G chord
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
        // 위상 및 앰비언트 스테레오 너비 적용
        const amp = 0.08 / (f * 0.4 + 1);
        const lPhase = (f % 2 === 0 ? 0 : 0.5);
        const rPhase = (f % 2 === 0 ? 0.3 : 0.8);

        // 부드러운 엔벨로프 (LFO 코러스 효과)
        const lfo = 0.8 + 0.2 * Math.sin(2 * Math.PI * 0.4 * t + f);

        leftSample += Math.sin(2 * Math.PI * freq * t + lPhase) * amp * lfo;
        rightSample += Math.sin(2 * Math.PI * freq * t + rPhase) * amp * lfo;
      }

      // 부드러운 아날로그 핑크 노이즈 성분 살짝 가미 (공간감 형성)
      const noise = (Math.random() * 2 - 1) * 0.005;

      leftData[i] = leftSample + noise;
      rightData[i] = rightSample + noise;
    }

    return buffer;
  }

  /**
   * 사용자 커스텀 오디오 파일 로드
   */
  public async loadAudioFile(file: File): Promise<AudioBuffer> {
    const ctx = await this.ensureContext();
    const arrayBuffer = await file.arrayBuffer();
    const decoded = await ctx.decodeAudioData(arrayBuffer);
    this.abAudioBuffer = decoded;
    return decoded;
  }

  /**
   * A/B 비교 테스트 재생
   * @param calibrations 31개 밴드의 보정값 목록
   * @param bypass True일 경우 보정 전(원본), False일 경우 보정 후(EQ 적용)
   */
  public async startABTest(
    calibrations: { freq: number; leftDb: number; rightDb: number }[],
    bypass: boolean = false
  ) {
    const ctx = await this.ensureContext();
    if (!this.masterGain) return;

    this.stopABTest();

    if (!this.abAudioBuffer) {
      this.abAudioBuffer = this.createAmbientTestBuffer();
    }

    this.abSourceNode = ctx.createBufferSource();
    this.abSourceNode.buffer = this.abAudioBuffer;
    this.abSourceNode.loop = true;

    this.abGainNode = ctx.createGain();
    this.abBypass = bypass;

    // A/B 필터 뱅크 구성 (GraphicEQ 시뮬레이션: 31 Peaking EQ)
    if (!bypass) {
      // 보정 후 소리: 31밴드 필터 체인 통과
      // 좌/우 분리 처리를 위해 Splitter & Merger 사용
      const splitter = ctx.createChannelSplitter(2);
      const merger = ctx.createChannelMerger(2);

      let prevLeft: AudioNode = splitter;
      let prevRight: AudioNode = splitter;

      calibrations.forEach((b, idx) => {
        // Left Filter
        const leftFilt = ctx.createBiquadFilter();
        leftFilt.type = 'peaking';
        leftFilt.frequency.setValueAtTime(b.freq, ctx.currentTime);
        leftFilt.Q.setValueAtTime(4.31, ctx.currentTime); // plan.md 규격 Q 4.31
        leftFilt.gain.setValueAtTime(b.leftDb, ctx.currentTime);

        // Right Filter
        const rightFilt = ctx.createBiquadFilter();
        rightFilt.type = 'peaking';
        rightFilt.frequency.setValueAtTime(b.freq, ctx.currentTime);
        rightFilt.Q.setValueAtTime(4.31, ctx.currentTime);
        rightFilt.gain.setValueAtTime(b.rightDb, ctx.currentTime);

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

      this.abSourceNode.connect(splitter);
      merger.connect(this.abGainNode);
    } else {
      // 보정 전 소리 (Bypass): 다이렉트 통과
      this.abSourceNode.connect(this.abGainNode);
    }

    this.abGainNode.connect(this.masterGain);
    this.abSourceNode.start(0);
    this.abIsPlaying = true;
  }

  /**
   * A/B 비교 전환 (보정 전 vs 보정 후)
   */
  public toggleABBypass(
    bypass: boolean,
    calibrations: { freq: number; leftDb: number; rightDb: number }[]
  ) {
    if (!this.abIsPlaying) return;
    this.abBypass = bypass;
    this.startABTest(calibrations, bypass);
  }

  public stopABTest() {
    if (this.abSourceNode) {
      try {
        this.abSourceNode.stop();
        this.abSourceNode.disconnect();
      } catch {
        // 이미 정지됨
      }
      this.abSourceNode = null;
    }
    this.abIsPlaying = false;
  }

  public isABPlaying(): boolean {
    return this.abIsPlaying;
  }
}

// 싱글톤 인스턴스 내보내기
export const audioEngine = new AudioEngine();
