import React, { useState, useEffect } from 'react';
import {
  FREQUENCY_BANDS,
  TEN_BAND_INDICES,
  FrequencyBand,
  interpolate10to31Bands,
} from '../data/iso226';
import { audioEngine, BandCalibration } from '../audio/AudioEngine';
import { HeadVisualizer } from '../components/HeadVisualizer';
import {
  Play,
  Square,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Volume2,
  Sliders,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle,
} from 'lucide-react';

interface WizardCalibrationProps {
  mode: '10-band' | '31-band';
  setMode: (mode: '10-band' | '31-band') => void;
  calibrations: { leftDb: number; rightDb: number; phaseInvert: boolean }[];
  setCalibrations: React.Dispatch<
    React.SetStateAction<{ leftDb: number; rightDb: number; phaseInvert: boolean }[]>
  >;
  isoEnabled: boolean;
  setIsoEnabled: (enabled: boolean) => void;
  onGoToABTest: () => void;
  onGoToExport: () => void;
}

export const WizardCalibration: React.FC<WizardCalibrationProps> = ({
  mode,
  setMode,
  calibrations,
  setCalibrations,
  isoEnabled,
  setIsoEnabled,
  onGoToABTest,
  onGoToExport,
}) => {
  // 모드에 따라 활성화된 인덱스 목록
  const activeBandIndices =
    mode === '10-band' ? TEN_BAND_INDICES : FREQUENCY_BANDS.map((_, i) => i);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [interpNotice, setInterpNotice] = useState<string | null>(null);

  const currentBandId = activeBandIndices[currentStepIndex] ?? 0;
  const currentBandInfo: FrequencyBand = FREQUENCY_BANDS[currentBandId];
  const currentBandCalib = calibrations[currentBandId] || {
    leftDb: 0,
    rightDb: 0,
    phaseInvert: false,
  };

  // 소리 시작 / 정지 토글
  const handleToggleSound = async () => {
    if (isPlaying) {
      audioEngine.stopTone();
      setIsPlaying(false);
    } else {
      const isoOffset = isoEnabled ? currentBandInfo.isoCompDb : 0;
      await audioEngine.startTone(
        currentBandInfo.freq,
        currentBandCalib.leftDb,
        currentBandCalib.rightDb,
        currentBandCalib.phaseInvert,
        isoOffset
      );
      setIsPlaying(true);
    }
  };

  // 슬라이더 변경 시 실시간 오디오 및 상태 업데이트
  const handleUpdateBalance = (balanceOffset: number) => {
    // balanceOffset: -6 dB (왼쪽 큼) ~ +6 dB (오른쪽 큼)
    // 중심 0일 때 leftDb = 0, rightDb = 0
    let left = 0;
    let right = 0;
    if (balanceOffset < 0) {
      left = Math.abs(balanceOffset);
      right = 0;
    } else {
      left = 0;
      right = balanceOffset;
    }

    const updated = [...calibrations];
    updated[currentBandId] = {
      ...updated[currentBandId],
      leftDb: Number(left.toFixed(1)),
      rightDb: Number(right.toFixed(1)),
    };
    setCalibrations(updated);

    if (isPlaying) {
      const isoOffset = isoEnabled ? currentBandInfo.isoCompDb : 0;
      audioEngine.updateToneParams(
        left,
        right,
        currentBandCalib.phaseInvert,
        isoOffset
      );
    }
  };

  const handleUpdateVolumeGain = (dB: number) => {
    // 양쪽 볼륨 동시 미세 조절 (-10 dB ~ +10 dB)
    const diff = currentBandCalib.rightDb - currentBandCalib.leftDb;
    let newLeft = dB;
    let newRight = dB;
    if (diff > 0) {
      newRight += diff;
    } else {
      newLeft += Math.abs(diff);
    }

    const updated = [...calibrations];
    updated[currentBandId] = {
      ...updated[currentBandId],
      leftDb: Number(newLeft.toFixed(1)),
      rightDb: Number(newRight.toFixed(1)),
    };
    setCalibrations(updated);

    if (isPlaying) {
      const isoOffset = isoEnabled ? currentBandInfo.isoCompDb : 0;
      audioEngine.updateToneParams(
        newLeft,
        newRight,
        currentBandCalib.phaseInvert,
        isoOffset
      );
    }
  };

  const handleTogglePhase = () => {
    const newPhase = !currentBandCalib.phaseInvert;
    const updated = [...calibrations];
    updated[currentBandId] = {
      ...updated[currentBandId],
      phaseInvert: newPhase,
    };
    setCalibrations(updated);

    if (isPlaying) {
      const isoOffset = isoEnabled ? currentBandInfo.isoCompDb : 0;
      // 위상 변경 시 톤 재시작
      audioEngine.startTone(
        currentBandInfo.freq,
        currentBandCalib.leftDb,
        currentBandCalib.rightDb,
        newPhase,
        isoOffset
      );
    }
  };

  const handleResetBand = () => {
    const updated = [...calibrations];
    updated[currentBandId] = { leftDb: 0, rightDb: 0, phaseInvert: false };
    setCalibrations(updated);
    if (isPlaying) {
      const isoOffset = isoEnabled ? currentBandInfo.isoCompDb : 0;
      audioEngine.updateToneParams(0, 0, false, isoOffset);
    }
  };

  // 단계 이동 시 톤 주파수 즉시 갱신
  const handleStepChange = (newStep: number) => {
    if (newStep < 0 || newStep >= activeBandIndices.length) return;
    setCurrentStepIndex(newStep);

    const nextBandId = activeBandIndices[newStep];
    const nextBandInfo = FREQUENCY_BANDS[nextBandId];
    const nextCalib = calibrations[nextBandId] || { leftDb: 0, rightDb: 0, phaseInvert: false };

    if (isPlaying) {
      const isoOffset = isoEnabled ? nextBandInfo.isoCompDb : 0;
      audioEngine.startTone(
        nextBandInfo.freq,
        nextCalib.leftDb,
        nextCalib.rightDb,
        nextCalib.phaseInvert,
        isoOffset
      );
    }
  };

  // "비슷한 주파수 한 번에 채우기" (10밴드 보정치로 전체 31밴드 자동 스플라인 보간)
  const handleInterpolateAll = () => {
    const tenBandMap: { [id: number]: { leftDb: number; rightDb: number; phaseDeg: number } } = {};
    TEN_BAND_INDICES.forEach((idx) => {
      const c = calibrations[idx] || { leftDb: 0, rightDb: 0, phaseInvert: false };
      tenBandMap[idx] = {
        leftDb: c.leftDb,
        rightDb: c.rightDb,
        phaseDeg: c.phaseInvert ? 180 : 0,
      };
    });

    const interpolated = interpolate10to31Bands(tenBandMap);
    const newCalibs = interpolated.map((item) => ({
      leftDb: item.leftDb,
      rightDb: item.rightDb,
      phaseInvert: item.phaseDeg >= 90,
    }));

    setCalibrations(newCalibs);
    setInterpNotice('✨ 10개 핵심 주파수 값을 바탕으로 31개 전체 주파수가 부드럽게 자동 계산되었습니다!');
    setTimeout(() => setInterpNotice(null), 4500);
  };

  // 컴포넌트 언마운트 시 톤 정지
  useEffect(() => {
    return () => {
      audioEngine.stopTone();
    };
  }, []);

  // 현재 좌우 밸런스 오프셋 (-6 ~ +6)
  const currentBalanceOffset =
    currentBandCalib.rightDb > 0
      ? currentBandCalib.rightDb
      : -currentBandCalib.leftDb;

  return (
    <div className="space-y-6">
      {/* 상단 컨트롤 바: 모드 선택 (10단계 vs 31단계) & 청각 보정 토글 */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">맞춤 모드:</span>
          <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                setMode('10-band');
                setCurrentStepIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                mode === '10-band'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🚀 쉽고 빠른 10단계 모드 (추천)
            </button>
            <button
              onClick={() => {
                setMode('31-band');
                setCurrentStepIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                mode === '31-band'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🎯 정밀 31단계 모드
            </button>
          </div>
        </div>

        {/* 자동 채우기 및 청각 보정 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleInterpolateAll}
            title="현재 입력된 값을 기준으로 31개 주파수 전체를 매끄럽게 연결합니다"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 rounded-xl border border-indigo-800/60 transition-colors shadow-sm"
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>비슷한 주파수 한 번에 채우기</span>
          </button>

          <button
            onClick={() => setIsoEnabled(!isoEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
              isoEnabled
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title="인간 귀 특성상 잘 안 들리는 저음/초고음을 귀에 편안하도록 자동 볼륨 보정합니다"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>청각 편안 보정 (ISO 226): {isoEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {interpNotice && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-emerald-200 text-xs font-medium flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{interpNotice}</span>
        </div>
      )}

      {/* 중앙 레이아웃: 시각 가이드 (머리 & 소리 중심) */}
      <HeadVisualizer
        leftDb={currentBandCalib.leftDb}
        rightDb={currentBandCalib.rightDb}
        phaseInvert={currentBandCalib.phaseInvert}
        isPlaying={isPlaying}
        freqLabel={currentBandInfo.label}
      />

      {/* 음역대 쉬운 설명 박스 */}
      <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>
            <strong className="text-white">{currentBandInfo.label}</strong> 특징: {currentBandInfo.description}
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          진행: {currentStepIndex + 1} / {activeBandIndices.length} 단계
        </span>
      </div>

      {/* 소리 제어 및 슬라이더 카드 */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        {/* 재생 / 정지 버튼 & 안내 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSound}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all duration-200 ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40 hover:scale-102'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>소리 멈추기</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>소리 듣고 맞추기 (시작)</span>
                </>
              )}
            </button>

            <span className="text-xs text-slate-400">
              {isPlaying
                ? '🎧 소리를 들으면서 양쪽 귀 중앙에서 울리도록 조절하세요.'
                : '버튼을 눌러 톤을 재생한 후 조절하세요.'}
            </span>
          </div>

          <button
            onClick={handleResetBand}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 hover:underline px-2 py-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>이 음높이 초기화</span>
          </button>
        </div>

        {/* 핵심 슬라이더 1: 소리의 중심 위치 맞추기 (좌 / 우) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-semibold">
            <label className="text-slate-200 flex items-center gap-2">
              <span>소리의 중심 위치 맞추기 (좌/우 밸런스)</span>
              <span className="text-xs font-normal text-slate-400">
                {currentBalanceOffset === 0
                  ? '정중앙 (0 dB)'
                  : currentBalanceOffset < 0
                  ? `왼쪽으로 +${Math.abs(currentBalanceOffset).toFixed(1)} dB 보정`
                  : `오른쪽으로 +${currentBalanceOffset.toFixed(1)} dB 보정`}
              </span>
            </label>
            <button
              onClick={() => handleUpdateBalance(0)}
              className="text-xs text-blue-400 hover:text-blue-300 font-normal"
            >
              중앙으로 리셋
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 w-12 text-left">◀ 왼쪽</span>
            <input
              type="range"
              min="-6.0"
              max="6.0"
              step="0.2"
              value={currentBalanceOffset}
              onChange={(e) => handleUpdateBalance(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-xs font-bold text-slate-400 w-12 text-right">오른쪽 ▶</span>
          </div>
        </div>

        {/* 보조 옵션: 위상 뒤집기 (Phase Invert) & 미세 볼륨 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* 위상 반전 버튼 */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-slate-200">
                소리가 머리 밖으로 흩어질 때 (위상 뒤집기)
              </div>
              <div className="text-[11px] text-slate-500">
                소리가 머리 안에서 모이지 않고 흩어지면 켜보세요
              </div>
            </div>
            <button
              onClick={handleTogglePhase}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                currentBandCalib.phaseInvert
                  ? 'bg-purple-600 text-white border-purple-400'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {currentBandCalib.phaseInvert ? '위상 반전 ON' : '위상 정상'}
            </button>
          </div>

          {/* 전체 미세 음량 게인 조절 */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-200">이 음높이 전체 음량 미세 조절</span>
              <span className="text-blue-400 font-mono">
                {Math.max(currentBandCalib.leftDb, currentBandCalib.rightDb).toFixed(1)} dB
              </span>
            </div>
            <input
              type="range"
              min="-8.0"
              max="8.0"
              step="0.5"
              value={Math.max(currentBandCalib.leftDb, currentBandCalib.rightDb)}
              onChange={(e) => handleUpdateVolumeGain(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 하단 네비게이션: 이전 / 다음 음높이 및 결과 이동 */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => handleStepChange(currentStepIndex - 1)}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>이전 음높이</span>
        </button>

        {/* 주파수 바로가기 인디케이터 도트 */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-xs sm:max-w-md py-1">
          {activeBandIndices.map((bIdx, idx) => {
            const isDone =
              calibrations[bIdx].leftDb !== 0 ||
              calibrations[bIdx].rightDb !== 0 ||
              calibrations[bIdx].phaseInvert;
            const isCurrent = idx === currentStepIndex;

            return (
              <button
                key={bIdx}
                onClick={() => handleStepChange(idx)}
                title={`${FREQUENCY_BANDS[bIdx].label} ${isDone ? '(조정됨)' : ''}`}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  isCurrent
                    ? 'w-6 bg-blue-500'
                    : isDone
                    ? 'bg-emerald-500'
                    : 'bg-slate-700 hover:bg-slate-500'
                }`}
              />
            );
          })}
        </div>

        {currentStepIndex < activeBandIndices.length - 1 ? (
          <button
            onClick={() => handleStepChange(currentStepIndex + 1)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-900/30"
          >
            <span>다음 음높이</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onGoToABTest}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-900/40"
          >
            <span>보정 완료 & 소리 비교하기</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
