import React, { useState, useEffect } from 'react';
import {
  FREQUENCY_BANDS,
  TEN_BAND_INDICES,
  FrequencyBand,
  interpolate10to31Bands,
} from '../data/iso226';
import { audioEngine } from '../audio/AudioEngine';
import { HeadVisualizer } from '../components/HeadVisualizer';
import {
  Play,
  Square,
  ChevronLeft,
  ChevronRight,
  Wand2,
  RotateCcw,
  Lock,
  ArrowRight,
  ArrowLeftRight,
  Activity,
  Info,
} from 'lucide-react';

interface WizardCalibrationProps {
  mode: '10-band' | '31-band';
  setMode: (mode: '10-band' | '31-band') => void;
  calibrations: { leftDb: number; rightDb: number; phaseInvert: boolean }[];
  setCalibrations: React.Dispatch<
    React.SetStateAction<{ leftDb: number; rightDb: number; phaseInvert: boolean }[]>
  >;
  onGoToABTest: () => void;
  onGoToExport: () => void;
}

export const WizardCalibration: React.FC<WizardCalibrationProps> = ({
  mode,
  setMode,
  calibrations,
  setCalibrations,
  onGoToABTest,
}) => {
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

  const handleToggleSound = async () => {
    if (isPlaying) {
      audioEngine.stopTone();
      setIsPlaying(false);
    } else {
      await audioEngine.startTone(
        currentBandInfo.freq,
        currentBandCalib.leftDb,
        currentBandCalib.rightDb,
        currentBandCalib.phaseInvert,
        currentBandInfo.isoCompDb
      );
      setIsPlaying(true);
    }
  };

  // 0.1 dB 단위로 고정 업데이트
  const handleUpdateLeft = (db: number) => {
    const rounded = Number(db.toFixed(1));
    const updated = [...calibrations];
    updated[currentBandId] = {
      ...updated[currentBandId],
      leftDb: rounded,
    };
    setCalibrations(updated);

    if (isPlaying) {
      audioEngine.updateToneParams(
        rounded,
        currentBandCalib.rightDb,
        currentBandCalib.phaseInvert,
        currentBandInfo.isoCompDb
      );
    }
  };

  const handleUpdateRight = (db: number) => {
    const rounded = Number(db.toFixed(1));
    const updated = [...calibrations];
    updated[currentBandId] = {
      ...updated[currentBandId],
      rightDb: rounded,
    };
    setCalibrations(updated);

    if (isPlaying) {
      audioEngine.updateToneParams(
        currentBandCalib.leftDb,
        rounded,
        currentBandCalib.phaseInvert,
        currentBandInfo.isoCompDb
      );
    }
  };

  // 좌우 채널 반전 (Swap L/R) 기능 - 검증 및 완벽 구현
  const handleSwapChannels = () => {
    const currentL = currentBandCalib.leftDb;
    const currentR = currentBandCalib.rightDb;

    if (currentL === 0 && currentR === 0) {
      setInterpNotice('💡 현재 좌/우 보정값이 모두 0.0 dB라 동일합니다. 슬라이더를 조절한 후 맞바꿔보세요.');
      setTimeout(() => setInterpNotice(null), 3000);
      return;
    }

    const updated = [...calibrations];
    updated[currentBandId] = {
      ...updated[currentBandId],
      leftDb: currentR,
      rightDb: currentL,
    };
    setCalibrations(updated);

    if (isPlaying) {
      audioEngine.updateToneParams(
        currentR,
        currentL,
        currentBandCalib.phaseInvert,
        currentBandInfo.isoCompDb
      );
    }

    setInterpNotice(`⇄ 좌/우 채널 보정값이 맞바뀌었습니다! (L: ${currentR > 0 ? '+' : ''}${currentR.toFixed(1)} dB / R: ${currentL > 0 ? '+' : ''}${currentL.toFixed(1)} dB)`);
    setTimeout(() => setInterpNotice(null), 3500);
  };

  // 위상 반전 (Phase Invert) 기능
  const handleTogglePhase = () => {
    const newPhase = !currentBandCalib.phaseInvert;
    const updated = [...calibrations];
    updated[currentBandId] = {
      ...updated[currentBandId],
      phaseInvert: newPhase,
    };
    setCalibrations(updated);

    if (isPlaying) {
      audioEngine.updateToneParams(
        currentBandCalib.leftDb,
        currentBandCalib.rightDb,
        newPhase,
        currentBandInfo.isoCompDb
      );
    }

    setInterpNotice(newPhase ? '⚡ 180° 위상 반전이 켜졌습니다 (소리를 모아줍니다).' : '위상이 정상(0°)으로 복구되었습니다.');
    setTimeout(() => setInterpNotice(null), 3000);
  };

  const handleResetCurrent = () => {
    const updated = [...calibrations];
    updated[currentBandId] = { leftDb: 0, rightDb: 0, phaseInvert: false };
    setCalibrations(updated);
    if (isPlaying) {
      audioEngine.updateToneParams(0, 0, false, currentBandInfo.isoCompDb);
    }
  };

  const handleStepChange = (newStep: number) => {
    if (newStep < 0 || newStep >= activeBandIndices.length) return;
    setCurrentStepIndex(newStep);

    const nextBandId = activeBandIndices[newStep];
    const nextBandInfo = FREQUENCY_BANDS[nextBandId];
    const nextCalib = calibrations[nextBandId] || { leftDb: 0, rightDb: 0, phaseInvert: false };

    if (isPlaying) {
      audioEngine.startTone(
        nextBandInfo.freq,
        nextCalib.leftDb,
        nextCalib.rightDb,
        nextCalib.phaseInvert,
        nextBandInfo.isoCompDb
      );
    }
  };

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
    setInterpNotice('✨ 31개 전체 주파수가 좌/우 맞춤값에 맞춰 자동 계산되었습니다!');
    setTimeout(() => setInterpNotice(null), 3500);
  };

  useEffect(() => {
    return () => {
      audioEngine.stopTone();
    };
  }, []);

  return (
    <div className="flex flex-col justify-start items-stretch gap-3 w-full">
      {/* 1. 최상단으로 이동한 핵심 내비게이션 & 제어 바 */}
      <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs transition-colors">
        {/* 이전 / 다음 음높이 버튼 & 도트 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStepChange(currentStepIndex - 1)}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>이전</span>
          </button>

          {/* 주파수 스텝 인디케이터 도트 */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[160px] sm:max-w-xs px-1">
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
                  title={`${FREQUENCY_BANDS[bIdx].label}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    isCurrent
                      ? 'w-5 bg-blue-500'
                      : isDone
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-500'
                  }`}
                />
              );
            })}
          </div>

          {currentStepIndex < activeBandIndices.length - 1 ? (
            <button
              onClick={() => handleStepChange(currentStepIndex + 1)}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow cursor-pointer"
            >
              <span>다음</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onGoToABTest}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow cursor-pointer"
            >
              <span>비교하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 10단계 간편 모드 시에만 노출되는 '한 번에 채우기' (토글 좌측에 배치) & 모드 토글 */}
        <div className="flex items-center gap-2">
          {interpNotice && (
            <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold hidden sm:inline">
              {interpNotice}
            </span>
          )}

          {/* 10단계 간편 모드 활성화 시에만 토글 좌측에 노출 */}
          {mode === '10-band' && (
            <button
              onClick={handleInterpolateAll}
              title="10개 주파수 값을 바탕으로 31개 전체 대역을 보간합니다"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-blue-700 dark:text-zinc-100 rounded-lg border border-blue-200 dark:border-zinc-700 transition-colors shadow-xs cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-blue-500" />
              <span>한 번에 채우기</span>
            </button>
          )}

          {/* 10단계 / 31단계 모드 토글 */}
          <div className="inline-flex p-0.5 bg-zinc-100 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => {
                setMode('10-band');
                setCurrentStepIndex(0);
              }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all text-xs cursor-pointer ${
                mode === '10-band'
                  ? 'bg-white dark:bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              10단계 간편
            </button>
            <button
              onClick={() => {
                setMode('31-band');
                setCurrentStepIndex(0);
              }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all text-xs cursor-pointer ${
                mode === '31-band'
                  ? 'bg-white dark:bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              31단계 정밀
            </button>
          </div>
        </div>
      </div>

      {/* 2. 메인 2컬럼 레이아웃 (items-stretch: 긴 쪽 길이로 맞추고, 짧은 쪽은 상-하로 퍼지도록 justify-between) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch w-full">
        {/* 좌측 5컬럼: 머리 중심 방사형 음파 시각 가이드 (h-full & justify-between) */}
        <div className="md:col-span-5 h-full w-full">
          <HeadVisualizer
            leftDb={currentBandCalib.leftDb}
            rightDb={currentBandCalib.rightDb}
            phaseInvert={currentBandCalib.phaseInvert}
            isPlaying={isPlaying}
            currentBand={currentBandInfo}
          />
        </div>

        {/* 우측 7컬럼: 좌/우 채널 분리 조절 슬라이더 및 보조 도구 패널 (h-full & justify-between) */}
        <div className="md:col-span-7 h-full p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl flex flex-col justify-between gap-3 transition-colors">
          {/* 소리 듣기/멈추기 & 리셋 */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <button
              onClick={handleToggleSound}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs shadow-md transition-all duration-150 cursor-pointer ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>소리 멈추기</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>소리 듣고 맞추기</span>
                </>
              )}
            </button>

            <button
              onClick={handleResetCurrent}
              className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>현재 음높이 리셋</span>
            </button>
          </div>

          {/* 왼쪽 귀 (Left Channel) 채널 분리 슬라이더 (0.1 dB 단위 고정) */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5 transition-colors">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                <span>왼쪽 귀 (Channel: L) 소리 크기 보정</span>
              </span>
              <span className="font-mono text-blue-600 dark:text-blue-400 text-xs font-bold">
                {currentBandCalib.leftDb > 0 ? `+${currentBandCalib.leftDb.toFixed(1)}` : currentBandCalib.leftDb.toFixed(1)} dB
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">-12.0 dB</span>
              <input
                type="range"
                min="-12.0"
                max="12.0"
                step="0.1"
                value={currentBandCalib.leftDb}
                onChange={(e) => handleUpdateLeft(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">+12.0 dB</span>
            </div>
          </div>

          {/* 오른쪽 귀 (Right Channel) 채널 분리 슬라이더 (0.1 dB 단위 고정) */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5 transition-colors">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                <span>오른쪽 귀 (Channel: R) 소리 크기 보정</span>
              </span>
              <span className="font-mono text-blue-600 dark:text-blue-400 text-xs font-bold">
                {currentBandCalib.rightDb > 0 ? `+${currentBandCalib.rightDb.toFixed(1)}` : currentBandCalib.rightDb.toFixed(1)} dB
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">-12.0 dB</span>
              <input
                type="range"
                min="-12.0"
                max="12.0"
                step="0.1"
                value={currentBandCalib.rightDb}
                onChange={(e) => handleUpdateRight(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">+12.0 dB</span>
            </div>
          </div>

          {/* ISO 226 표준 전체 음량 자동 연동 상태 */}
          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs transition-colors">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-200 text-[11px]">
                  ISO 226 표준 전체 음량 자동 연동 (Default)
                </div>
                <div className="text-[10px] text-zinc-600 dark:text-zinc-400">
                  인간 청각 특성에 맞춰 시스템이 자동 보정 (임의 변경 잠금)
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 px-2 py-1 rounded font-mono text-[11px] text-zinc-800 dark:text-zinc-200 font-bold flex-shrink-0 shadow-xs">
              +{currentBandInfo.isoCompDb.toFixed(1)} dB 보정됨
            </div>
          </div>

          {/* 보조 기능 1: 좌우 채널 반전 (Swap L/R) */}
          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs transition-colors">
            <div className="space-y-0.5">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-[11px]">
                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-500" />
                <span>좌/우 채널 반전 (Swap L/R)</span>
              </div>
              <div className="text-[10px] text-zinc-600 dark:text-zinc-400">
                헤드폰 착용 상태를 점검하거나 양쪽 밸런스를 반대로 비교해볼 때 좌우 값을 맞바꿉니다
              </div>
            </div>
            <button
              onClick={handleSwapChannels}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer shadow-xs"
            >
              채널 맞바꾸기
            </button>
          </div>

          {/* 보조 기능 2: 위상(Phase) 180° 반전 및 알기 쉬운 설명 */}
          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs transition-colors">
            <div className="space-y-0.5">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-[11px]">
                <Activity className="w-3.5 h-3.5 text-purple-500" />
                <span>소리가 머리 밖으로 흩어질 때: 위상(Phase) 반전</span>
              </div>
              <div className="text-[10px] text-zinc-600 dark:text-zinc-400">
                소리가 중심에 맺히지 않고 귓속이 텅 빈 것처럼 흩어질 때 켜면 180도 위상을 뒤집어 소리를 모아줍니다
              </div>
            </div>
            <button
              onClick={handleTogglePhase}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                currentBandCalib.phaseInvert
                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                  : 'bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
              }`}
            >
              {currentBandCalib.phaseInvert ? '위상 반전 ON (180°)' : '위상 정상 (0°)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
