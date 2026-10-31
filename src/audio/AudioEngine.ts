// Web Audio API Audio Engine
// 실시간 소리 생성, 좌/우 개별 채널 제어, ISO 226 자동 연동, 체감 음량 자동 매칭 (Gain Matching), 소프트 리미터

export interface BandCalibration {
  leftDb: number;       // -15 dB ~ +15 dB (사용자 좌측 귀 보정)
  rightDb: number;      // -15 dB ~ +15 dB (사용자 우측 귀 보정)
  phaseInvert: boolean; // 180도 위상 반전
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

  // A/B 테스트용 오디오 재생기
  private abSourceNode: AudioBufferSourceNode | null = null;
  private abAudioBuffer: AudioBuffer | null = null;
  private abGainNode: GainNode | null = null;
  private abIsPlaying: boolean = false;
  private abBypass: boolean = false;

  constructor() {}

  /**
   * 사용자 제스처 시 AudioContext 초기화 및 오디오 그래프 구축
   */
  public async ensureContext(): Promise<AudioContext> {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // [안전 장치] 소프트 리미터 (과도한 피크로 인한 청력 손상 방지)
      this.limiter = this.ctx.createDynamicsCompressor();
      this.limiter.threshold.setValueAtTime(-3.0, this.ctx.currentTime);
      this.limiter.knee.setValueAtTime(6.0, this.ctx.currentTime);
      this.limiter.ratio.setValueAtTime(20.0, this.ctx.currentTime);
      this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.limiter.release.setValueAtTime(0.1, this.ctx.currentTime);

      // 마스터 볼륨 게인
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      // masterGain -> limiter -> destination
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
   * 단일 주파수 순음(Sine wave) 재생 시작
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

    this.stopTone();

    this.currentFrequency = freq;
    const now = this.ctx.currentTime;

    // 1. 발진기 생성
    this.osc = this.ctx.createOscillator();
    this.osc.type = 'sine';
    this.osc.frequency.setValueAtTime(freq, now);

    // 2. 좌우 개별 게인 노드
    const baseLinear = 0.15;
    const clampedIso = Math.min(22, Math.max(-10, isoOffsetDb * 0.6));
    const effectiveLeftDb = leftDb + clampedIso;
    const effectiveRightDb = rightDb + clampedIso;

    const leftLinear = baseLinear * Math.pow(10, effectiveLeftDb / 20);
    const rightLinear = baseLinear * Math.pow(10, effectiveRightDb / 20) * (phaseInvert ? -1 : 1);

    this.oscLeftGain = this.ctx.createGain();
    this.oscRightGain = this.ctx.createGain();

    this.oscLeftGain.gain.setValueAtTime(0.0001, now);
    this.oscLeftGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, Math.abs(leftLinear)), now + 0.025);

    this.oscRightGain.gain.setValueAtTime(0.0001, now);
    this.oscRightGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, Math.abs(rightLinear)), now + 0.025);

    // 3. 스테레오 채널 분리 병합
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
    isoOffsetDb: number = 0
  ) {
    if (!this.ctx || !this.toneActive || !this.oscLeftGain || !this.oscRightGain) return;

    const now = this.ctx.currentTime;
    const baseLinear = 0.15;
    const clampedIso = Math.min(22, Math.max(-10, isoOffsetDb * 0.6));
    const effectiveLeftDb = leftDb + clampedIso;
    const effectiveRightDb = rightDb + clampedIso;

    const leftLinear = Math.max(0.0001, baseLinear * Math.pow(10, effectiveLeftDb / 20));
    const rightLinear = Math.max(0.0001, baseLinear * Math.pow(10, effectiveRightDb / 20));

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

  public createAmbientTestBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not ready');

    const sampleRate = this.ctx.sampleRate;
    const duration = 12.0;
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
    return decoded;
  }

  /**
   * A/B 비교 테스트 재생
   * [체감 음량 자동 매칭 (Gain Matching) 엔진]:
   * EQ 적용 시 주파수 증폭에 따른 볼륨 상승분을 계산하여,
   * 보정 전(Bypass)과 보정 후의 체감 음량을 동일하게 일치시킴으로써
   * 소리가 단지 커서 더 좋게 들리는 심리음향학적 착시를 원천 방지
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

    // 체감 음량 자동 매칭 (Gain Matching) 계산
    const totalBoost = calibrations.reduce(
      (acc, c) => acc + (c.leftDb + c.rightDb) / 2,
      0
    );
    const avgBoostDb = calibrations.length > 0 ? totalBoost / calibrations.length : 0;
    // EQ 적용 시 평균 증폭분을 마이너스 보정하여 바이패스와 실효 음량 일치
    const gainMatchCompDb = !bypass ? -avgBoostDb * 0.75 : 0;
    const gainMatchLinear = Math.pow(10, gainMatchCompDb / 20);

    this.abGainNode.gain.setValueAtTime(gainMatchLinear, ctx.currentTime);

    if (!bypass) {
      const splitter = ctx.createChannelSplitter(2);
      const merger = ctx.createChannelMerger(2);

      let prevLeft: AudioNode = splitter;
      let prevRight: AudioNode = splitter;

      calibrations.forEach((b, idx) => {
        const leftFilt = ctx.createBiquadFilter();
        leftFilt.type = 'peaking';
        leftFilt.frequency.setValueAtTime(b.freq, ctx.currentTime);
        leftFilt.Q.setValueAtTime(4.31, ctx.currentTime);
        leftFilt.gain.setValueAtTime(b.leftDb, ctx.currentTime);

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
      this.abSourceNode.connect(this.abGainNode);
    }

    this.abGainNode.connect(this.masterGain);
    this.abSourceNode.start(0);
    this.abIsPlaying = true;
  }

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
        // ignore
      }
      this.abSourceNode = null;
    }
    this.abIsPlaying = false;
  }

  public isABPlaying(): boolean {
    return this.abIsPlaying;
  }
}

export const audioEngine = new AudioEngine();
