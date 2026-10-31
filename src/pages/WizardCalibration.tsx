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
    <div className="flex flex-col justify-start items-stretch gap-3.5 w-full">
      {/* 1. 최상단으로 이동한 핵심 내비게이션 & 제어 바 (IBM Carbon Card) */}
      <div className="p-3 carbon-card rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm">
        {/* 이전 / 다음 음높이 버튼 & 도트 */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleStepChange(currentStepIndex - 1)}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold bg-[#e8e8e8] hover:bg-[#d0d0d0] dark:bg-[#393939] dark:hover:bg-[#525252] disabled:opacity-30 disabled:pointer-events-none text-[#161616] dark:text-[#f4f4f4] transition-colors duration-150 cursor-pointer text-xs sm:text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
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
                  className={`h-2.5 rounded-full transition-all duration-150 cursor-pointer ${
                    isCurrent
                      ? 'w-5 bg-[#0f62fe]'
                      : isDone
                      ? 'w-2.5 bg-emerald-500'
                      : 'w-2.5 bg-[#c6c6c6] dark:bg-[#525252] hover:bg-[#8d8d8d]'
                  }`}
                />
              );
            })}
          </div>

          {currentStepIndex < activeBandIndices.length - 1 ? (
            <button
              onClick={() => handleStepChange(currentStepIndex + 1)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded font-semibold bg-[#0f62fe] hover:bg-[#0353e9] text-white transition-all duration-150 shadow-xs cursor-pointer text-xs sm:text-sm"
            >
              <span>다음</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onGoToABTest}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded font-bold bg-[#198038] hover:bg-[#0e6027] text-white transition-all duration-150 shadow-xs cursor-pointer text-xs sm:text-sm"
            >
              <span>비교하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 10단계 간편 모드 시에만 노출되는 '한 번에 채우기' (토글 좌측에 배치) & 모드 토글 */}
        <div className="flex items-center gap-2.5">
          {interpNotice && (
            <span className="text-emerald-700 dark:text-emerald-400 text-xs font-semibold hidden sm:inline">
              {interpNotice}
            </span>
          )}

          {/* 10단계 간편 모드 활성화 시에만 토글 좌측에 노출 */}
          {mode === '10-band' && (
            <button
              onClick={handleInterpolateAll}
              title="10개 주파수 값을 바탕으로 31개 전체 대역을 보간합니다"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#edf5ff] hover:bg-[#d0e2ff] dark:bg-[#002d9c]/40 dark:hover:bg-[#002d9c]/60 text-[#0f62fe] dark:text-[#78a9ff] rounded border border-[#d0e2ff] dark:border-[#0043ce] transition-colors duration-150 shadow-xs cursor-pointer"
            >
              <Wand2 className="w-4 h-4 text-[#0f62fe]" />
              <span>한 번에 채우기</span>
            </button>
          )}

          {/* 10단계 / 31단계 모드 토글 */}
          <div className="inline-flex p-0.5 bg-[#e8e8e8] dark:bg-[#161616] rounded border border-[#e0e0e0] dark:border-[#393939]">
            <button
              onClick={() => {
                setMode('10-band');
                setCurrentStepIndex(0);
              }}
              className={`px-3 py-1 rounded font-semibold transition-all duration-150 text-xs sm:text-sm cursor-pointer ${
                mode === '10-band'
                  ? 'bg-white dark:bg-[#262626] text-[#0f62fe] dark:text-[#0f62fe] shadow-xs'
                  : 'text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616] dark:hover:text-[#ffffff]'
              }`}
            >
              10단계 간편
            </button>
            <button
              onClick={() => {
                setMode('31-band');
                setCurrentStepIndex(0);
              }}
              className={`px-3 py-1 rounded font-semibold transition-all duration-150 text-xs sm:text-sm cursor-pointer ${
                mode === '31-band'
                  ? 'bg-white dark:bg-[#262626] text-[#0f62fe] dark:text-[#0f62fe] shadow-xs'
                  : 'text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616] dark:hover:text-[#ffffff]'
              }`}
            >
              31단계 정밀
            </button>
          </div>
        </div>
      </div>

      {/* 2. 메인 2컬럼 레이아웃 (items-stretch: 긴 쪽 길이로 맞추고, 짧은 쪽은 상-하로 퍼지도록 justify-between) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch w-full">
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
        <div className="md:col-span-7 h-full p-4 carbon-card rounded-xl shadow-xs flex flex-col justify-between gap-3.5">
          {/* 소리 듣기/멈추기 & 리셋 */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#e0e0e0] dark:border-[#393939]">
            <button
              onClick={handleToggleSound}
              className={`flex items-center gap-2 px-5 py-2.5 rounded font-bold text-xs sm:text-sm shadow-xs transition-all duration-150 cursor-pointer ${
                isPlaying
                  ? 'bg-[#da1e28] hover:bg-[#ba1b23] text-white'
                  : 'bg-[#0f62fe] hover:bg-[#0353e9] text-white shadow-[#0f62fe]/20'
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
                  <span>소리 듣고 맞추기</span>
                </>
              )}
            </button>

            <button
              onClick={handleResetCurrent}
              className="flex items-center gap-1.5 text-xs text-[#525252] dark:text-[#8d8d8d] hover:text-[#161616] dark:hover:text-[#ffffff] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>현재 음높이 리셋</span>
            </button>
          </div>

          {/* 왼쪽 귀 (Left Channel) 채널 분리 슬라이더 (0.1 dB 단위 고정) */}
          <div className="p-3.5 carbon-subcard rounded-lg space-y-2">
            <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
              <span className="text-[#161616] dark:text-[#f4f4f4] flex items-center gap-2 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0f62fe] inline-block" />
                <span>왼쪽 귀 (Channel: L) 소리 크기 보정</span>
              </span>
              <span className="font-mono text-[#0f62fe] dark:text-[#78a9ff] text-sm font-bold">
                {currentBandCalib.leftDb > 0 ? `+${currentBandCalib.leftDb.toFixed(1)}` : currentBandCalib.leftDb.toFixed(1)} dB
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#525252] dark:text-[#8d8d8d] font-mono">-12.0 dB</span>
              <input
                type="range"
                min="-12.0"
                max="12.0"
                step="0.1"
                value={currentBandCalib.leftDb}
                onChange={(e) => handleUpdateLeft(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-[#d0d0d0] dark:bg-[#393939] rounded appearance-none cursor-pointer accent-[#0f62fe]"
              />
              <span className="text-xs text-[#525252] dark:text-[#8d8d8d] font-mono">+12.0 dB</span>
            </div>
          </div>

          {/* 오른쪽 귀 (Right Channel) 채널 분리 슬라이더 (0.1 dB 단위 고정) */}
          <div className="p-3.5 carbon-subcard rounded-lg space-y-2">
            <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
              <span className="text-[#161616] dark:text-[#f4f4f4] flex items-center gap-2 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0f62fe] inline-block" />
                <span>오른쪽 귀 (Channel: R) 소리 크기 보정</span>
              </span>
              <span className="font-mono text-[#0f62fe] dark:text-[#78a9ff] text-sm font-bold">
                {currentBandCalib.rightDb > 0 ? `+${currentBandCalib.rightDb.toFixed(1)}` : currentBandCalib.rightDb.toFixed(1)} dB
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#525252] dark:text-[#8d8d8d] font-mono">-12.0 dB</span>
              <input
                type="range"
                min="-12.0"
                max="12.0"
                step="0.1"
                value={currentBandCalib.rightDb}
                onChange={(e) => handleUpdateRight(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-[#d0d0d0] dark:bg-[#393939] rounded appearance-none cursor-pointer accent-[#0f62fe]"
              />
              <span className="text-xs text-[#525252] dark:text-[#8d8d8d] font-mono">+12.0 dB</span>
            </div>
          </div>

          {/* ISO 226 표준 전체 음량 자동 연동 상태 (i 아이콘 툴팁 추가) */}
          <div className="p-3 carbon-subcard rounded-lg flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-[#525252] dark:text-[#8d8d8d] flex-shrink-0" />
              <div>
                <div className="font-semibold text-[#161616] dark:text-[#f4f4f4] text-xs sm:text-sm flex items-center gap-1.5">
                  <span>ISO 226 표준 전체 음량 자동 연동 (Default)</span>
                  <div className="relative group/tip inline-flex items-center">
                    <Info className="w-3.5 h-3.5 text-[#0f62fe] cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:block w-72 p-2.5 bg-[#161616] dark:bg-[#f4f4f4] text-white dark:text-[#161616] text-xs rounded-lg shadow-2xl z-50 pointer-events-none leading-relaxed">
                      <strong>ISO 226 등청감 곡선 표준이란?</strong><br />
                      사람 귀는 낮은 저음과 높은 고음을 상대적으로 작게 듣습니다. 어떤 음높이를 선택해도 귀에 부담 없이 편안하고 똑같은 크기로 들리도록 시스템이 자동 보정해줍니다.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#161616] dark:border-t-[#f4f4f4]" />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-[#525252] dark:text-[#8d8d8d] mt-0.5">
                  인간 청각 특성에 맞춰 시스템이 자동 보정 (임의 변경 잠금)
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] px-2.5 py-1 rounded font-mono text-xs font-bold text-[#161616] dark:text-[#f4f4f4] flex-shrink-0 shadow-xs">
              +{currentBandInfo.isoCompDb.toFixed(1)} dB 보정됨
            </div>
          </div>

          {/* 보조 기능 1: 좌우 채널 반전 (Swap L/R) (i 아이콘 툴팁 추가) */}
          <div className="p-3 carbon-subcard rounded-lg flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="space-y-0.5">
              <div className="font-bold text-[#161616] dark:text-[#f4f4f4] flex items-center gap-1.5 text-xs sm:text-sm">
                <ArrowLeftRight className="w-4 h-4 text-[#0f62fe]" />
                <span>좌/우 채널 반전 (Swap L/R)</span>
                <div className="relative group/tip inline-flex items-center">
                  <Info className="w-3.5 h-3.5 text-[#0f62fe] cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:block w-72 p-2.5 bg-[#161616] dark:bg-[#f4f4f4] text-white dark:text-[#161616] text-xs rounded-lg shadow-2xl z-50 pointer-events-none leading-relaxed">
                    <strong>좌우 채널 반전이란?</strong><br />
                    이어폰을 반대로 착용했는지 점검하거나, 양쪽 귀의 감도 균형을 서로 맞바꾸어 역비교해보고 싶을 때 버튼 하나로 왼쪽과 오른쪽 수치를 즉시 교체합니다.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#161616] dark:border-t-[#f4f4f4]" />
                  </div>
                </div>
              </div>
              <div className="text-xs text-[#525252] dark:text-[#8d8d8d]">
                헤드폰 착용 상태를 점검하거나 양쪽 밸런스를 반대로 비교해볼 때 좌우 값을 맞바꿉니다
              </div>
            </div>
            <button
              onClick={handleSwapChannels}
              className="flex-shrink-0 px-3.5 py-2 rounded text-xs font-semibold bg-white hover:bg-[#e8e8e8] dark:bg-[#393939] dark:hover:bg-[#525252] text-[#161616] dark:text-[#f4f4f4] border border-[#e0e0e0] dark:border-[#525252] transition-colors duration-150 cursor-pointer shadow-xs"
            >
              채널 맞바꾸기
            </button>
          </div>

          {/* 보조 기능 2: 위상(Phase) 180° 반전 (i 아이콘 툴팁 추가 & 고정 너비) */}
          <div className="p-3 carbon-subcard rounded-lg flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="space-y-0.5">
              <div className="font-bold text-[#161616] dark:text-[#f4f4f4] flex items-center gap-1.5 text-xs sm:text-sm">
                <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>소리가 머리 밖으로 흩어질 때: 위상(Phase) 반전</span>
                <div className="relative group/tip inline-flex items-center">
                  <Info className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:block w-72 p-2.5 bg-[#161616] dark:bg-[#f4f4f4] text-white dark:text-[#161616] text-xs rounded-lg shadow-2xl z-50 pointer-events-none leading-relaxed">
                    <strong>위상(Phase) 180° 반전이란?</strong><br />
                    소리가 머리 정중앙에 맺히지 않고 귀 바깥으로 흩어지거나 귓속이 텅 빈 것처럼 멍멍할 때 켜보세요. 180도 위상을 뒤집어 소리를 정중앙으로 모아줍니다.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#161616] dark:border-t-[#f4f4f4]" />
                  </div>
                </div>
              </div>
              <div className="text-xs text-[#525252] dark:text-[#8d8d8d]">
                소리가 중심에 맺히지 않고 귓속이 텅 빈 것처럼 흩어질 때 켜면 180도 위상을 뒤집어 소리를 모아줍니다
              </div>
            </div>
            <button
              onClick={handleTogglePhase}
              className={`flex-shrink-0 w-36 min-w-[144px] text-center px-3 py-2 rounded text-xs font-semibold border transition-all duration-150 cursor-pointer shadow-xs ${
                currentBandCalib.phaseInvert
                  ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600 font-bold'
                  : 'bg-white hover:bg-[#e8e8e8] dark:bg-[#393939] dark:hover:bg-[#525252] text-[#161616] dark:text-[#f4f4f4] border-[#e0e0e0] dark:border-[#525252]'
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
