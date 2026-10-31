import React, { useState, useEffect } from 'react';
import {
  FREQUENCY_BANDS,
  FrequencyBand,
} from '../data/iso226';
import { audioEngine } from '../audio/AudioEngine';
import { HeadVisualizer } from '../components/HeadVisualizer';
import {
  Play,
  Square,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Lock,
  ArrowRight,
  ArrowLeftRight,
  Activity,
  Info,
} from 'lucide-react';

interface WizardCalibrationProps {
  mode?: '10-band' | '31-band';
  setMode?: (mode: '10-band' | '31-band') => void;
  calibrations: { leftDb: number; rightDb: number; phaseInvert: boolean }[];
  setCalibrations: React.Dispatch<
    React.SetStateAction<{ leftDb: number; rightDb: number; phaseInvert: boolean }[]>
  >;
  onGoToABTest: () => void;
  onGoToExport: () => void;
}

export const WizardCalibration: React.FC<WizardCalibrationProps> = ({
  calibrations,
  setCalibrations,
  onGoToABTest,
}) => {
  // 31단계 단독 전면 제공
  const activeBandIndices = FREQUENCY_BANDS.map((_, i) => i);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

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
      setActionNotice('💡 현재 좌/우 보정값이 모두 0.0 dB라 동일합니다. 슬라이더를 조절한 후 맞바꿔보세요.');
      setTimeout(() => setActionNotice(null), 3000);
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

    setActionNotice(`⇄ 좌/우 채널 보정값이 맞바뀌었습니다! (L: ${currentR > 0 ? '+' : ''}${currentR.toFixed(1)} dB / R: ${currentL > 0 ? '+' : ''}${currentL.toFixed(1)} dB)`);
    setTimeout(() => setActionNotice(null), 3500);
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

    setActionNotice(newPhase ? '⚡ 180° 위상 반전이 켜졌습니다 (소리를 모아줍니다).' : '위상이 정상(0°)으로 복구되었습니다.');
    setTimeout(() => setActionNotice(null), 3000);
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

  useEffect(() => {
    return () => {
      audioEngine.stopTone();
    };
  }, []);

  return (
    <div className="flex flex-col justify-start items-stretch gap-3.5 w-full">
      {/* 1. 최상단으로 이동한 핵심 내비게이션 & 제어 바 (IBM Carbon Card) - 31밴드 좌우 꽉 차게 배치 */}
      <div className="p-2.5 carbon-card rounded-xl shadow-xs flex items-center justify-between gap-2 sm:gap-3 text-xs w-full">
        {/* 이전 음높이 버튼 */}
        <button
          onClick={() => handleStepChange(currentStepIndex - 1)}
          disabled={currentStepIndex === 0}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded font-semibold bg-[#e8e8e8] hover:bg-[#d0d0d0] dark:bg-[#393939] dark:hover:bg-[#525252] disabled:opacity-30 disabled:pointer-events-none text-[#161616] dark:text-[#f4f4f4] transition-colors duration-150 cursor-pointer text-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>이전</span>
        </button>

        {/* 31개 주파수 스텝 인디케이터 도트 (좌우 꽉 차게 균등 배치) */}
        <div className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 overflow-x-auto py-1 px-1">
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
                title={`${FREQUENCY_BANDS[bIdx].label} (${FREQUENCY_BANDS[bIdx].freq}Hz)`}
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-150 cursor-pointer flex-shrink-0 ${
                  isCurrent
                    ? 'w-5 sm:w-6 bg-[#0f62fe]'
                    : isDone
                    ? 'w-2 sm:w-2.5 bg-emerald-500'
                    : 'w-2 sm:w-2.5 bg-[#c6c6c6] dark:bg-[#525252] hover:bg-[#8d8d8d]'
                }`}
              />
            );
          })}
        </div>

        {/* 다음 음높이 버튼 또는 비교하기 이동 버튼 */}
        {currentStepIndex < activeBandIndices.length - 1 ? (
          <button
            onClick={() => handleStepChange(currentStepIndex + 1)}
            className="flex-shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded font-semibold bg-[#0f62fe] hover:bg-[#0353e9] text-white transition-all duration-150 shadow-xs cursor-pointer text-xs"
          >
            <span>다음</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={onGoToABTest}
            className="flex-shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded font-bold bg-[#198038] hover:bg-[#0e6027] text-white transition-all duration-150 shadow-xs cursor-pointer text-xs"
          >
            <span>비교하기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. 메인 2컬럼 레이아웃 (items-stretch: 긴 쪽 길이로 맞추고, 짧은 쪽은 상-하로 퍼지도록 justify-between) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch w-full">
        {/* 좌측 5컬럼: 머리 중심 방사형 음파 시각 가이드 및 하단 소리 제어 버튼 (h-full & justify-between) */}
        <div className="md:col-span-5 h-full w-full">
          <HeadVisualizer
            leftDb={currentBandCalib.leftDb}
            rightDb={currentBandCalib.rightDb}
            phaseInvert={currentBandCalib.phaseInvert}
            isPlaying={isPlaying}
            currentBand={currentBandInfo}
            onToggleSound={handleToggleSound}
            onResetCurrent={handleResetCurrent}
          />
        </div>

        {/* 우측 7컬럼: 좌/우 채널 분리 조절 슬라이더 및 보조 도구 패널 (h-full & justify-between) */}
        <div className="md:col-span-7 h-full p-4 carbon-card rounded-xl shadow-xs flex flex-col justify-between gap-3.5">
          {actionNotice && (
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-600 text-xs font-semibold text-emerald-800 dark:text-emerald-200 transition-all duration-150">
              {actionNotice}
            </div>
          )}

          {/* 보청기 원리 기반 권장 안내 팁 배너 및 볼륨/청력 안전 주의 문구 */}
          <div className="p-2.5 rounded-lg bg-[#edf5ff] dark:bg-[#002d9c]/25 border border-[#d0e2ff] dark:border-[#0043ce]/60 space-y-1.5 text-[11px]">
            <div className="flex items-start gap-2 text-[#0043ce] dark:text-[#78a9ff]">
              <span className="flex-shrink-0 text-xs mt-0.5">💡</span>
              <span className="leading-tight">
                <strong>조절 팁:</strong> 잘 들리는 쪽을 낮추기보다, 보청기처럼 <strong>덜 들리는 쪽 귀의 볼륨을 올려서(+)</strong> 머리 중심으로 맞추면 소리가 답답해지지 않고 시원하게 들려요.
              </span>
            </div>
            <div className="flex items-start gap-2 text-[#da1e28] dark:text-[#fa4d56] font-medium pt-1.5 border-t border-[#d0e2ff]/60 dark:border-[#0043ce]/40">
              <span className="flex-shrink-0 text-xs mt-0.5">⚠️</span>
              <span className="leading-tight">
                <strong>주의:</strong> 볼륨을 과도하게 키우면 이어폰·헤드폰의 드라이버가 고장나거나 청력이 손상될 수 있으니, 적정 음량에서 안전하게 조절해주세요.
              </span>
            </div>
          </div>

          {/* 왼쪽 귀 (Left Channel) 채널 분리 슬라이더 (0.1 dB 단위 고정) */}
          <div className="p-3 carbon-subcard rounded-lg space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-[#161616] dark:text-[#f4f4f4] flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#0f62fe] inline-block" />
                <span>왼쪽 귀 (Channel: L) 소리 크기 보정</span>
              </span>
              <span className="font-mono text-[#0f62fe] dark:text-[#78a9ff] text-xs sm:text-sm font-bold">
                {currentBandCalib.leftDb > 0 ? `+${currentBandCalib.leftDb.toFixed(1)}` : currentBandCalib.leftDb.toFixed(1)} dB
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] text-[#525252] dark:text-[#8d8d8d] font-mono">-12.0 dB</span>
              <input
                type="range"
                min="-12.0"
                max="12.0"
                step="0.1"
                value={currentBandCalib.leftDb}
                onChange={(e) => handleUpdateLeft(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#d0d0d0] dark:bg-[#393939] rounded appearance-none cursor-pointer accent-[#0f62fe]"
              />
              <span className="text-[10px] text-[#525252] dark:text-[#8d8d8d] font-mono">+12.0 dB</span>
            </div>
          </div>

          {/* 오른쪽 귀 (Right Channel) 채널 분리 슬라이더 (0.1 dB 단위 고정) */}
          <div className="p-3 carbon-subcard rounded-lg space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-[#161616] dark:text-[#f4f4f4] flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#0f62fe] inline-block" />
                <span>오른쪽 귀 (Channel: R) 소리 크기 보정</span>
              </span>
              <span className="font-mono text-[#0f62fe] dark:text-[#78a9ff] text-xs sm:text-sm font-bold">
                {currentBandCalib.rightDb > 0 ? `+${currentBandCalib.rightDb.toFixed(1)}` : currentBandCalib.rightDb.toFixed(1)} dB
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] text-[#525252] dark:text-[#8d8d8d] font-mono">-12.0 dB</span>
              <input
                type="range"
                min="-12.0"
                max="12.0"
                step="0.1"
                value={currentBandCalib.rightDb}
                onChange={(e) => handleUpdateRight(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#d0d0d0] dark:bg-[#393939] rounded appearance-none cursor-pointer accent-[#0f62fe]"
              />
              <span className="text-[10px] text-[#525252] dark:text-[#8d8d8d] font-mono">+12.0 dB</span>
            </div>
          </div>

          {/* ISO 226 표준 전체 음량 자동 연동 상태 (i 아이콘 툴팁 추가) */}
          <div className="p-2.5 carbon-subcard rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#525252] dark:text-[#8d8d8d] flex-shrink-0" />
              <div>
                <div className="font-semibold text-[#161616] dark:text-[#f4f4f4] text-xs flex items-center gap-1.5">
                  <span>ISO 226 표준 전체 음량 자동 연동 (Default)</span>
                  <div className="relative group/tip inline-flex items-center">
                    <Info className="w-3.5 h-3.5 text-[#0f62fe] cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:block w-72 p-2.5 bg-[#161616] dark:bg-[#f4f4f4] text-white dark:text-[#161616] text-[11px] rounded-lg shadow-2xl z-50 pointer-events-none leading-relaxed">
                      <strong>ISO 226 등청감 곡선 표준이란?</strong><br />
                      사람 귀는 낮은 저음과 높은 고음을 상대적으로 작게 듣습니다. 어떤 음높이를 선택해도 귀에 부담 없이 편안하고 똑같은 크기로 들리도록 시스템이 자동 보정해줍니다.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#161616] dark:border-t-[#f4f4f4]" />
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-[#525252] dark:text-[#8d8d8d] mt-0.5">
                  인간 청각 특성에 맞춰 시스템이 자동 보정 (임의 변경 잠금)
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] px-2 py-0.5 rounded font-mono text-[11px] font-bold text-[#161616] dark:text-[#f4f4f4] flex-shrink-0 shadow-xs">
              +{currentBandInfo.isoCompDb.toFixed(1)} dB 보정됨
            </div>
          </div>

          {/* 보조 기능 1: 좌우 채널 반전 (Swap L/R) (i 아이콘 툴팁 추가) */}
          <div className="p-2.5 carbon-subcard rounded-lg flex items-center justify-between gap-2.5 text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-[#161616] dark:text-[#f4f4f4] flex items-center gap-1.5 text-xs">
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#0f62fe]" />
                <span>좌/우 채널 반전 (Swap L/R)</span>
                <div className="relative group/tip inline-flex items-center">
                  <Info className="w-3.5 h-3.5 text-[#0f62fe] cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:block w-72 p-2.5 bg-[#161616] dark:bg-[#f4f4f4] text-white dark:text-[#161616] text-[11px] rounded-lg shadow-2xl z-50 pointer-events-none leading-relaxed">
                    <strong>좌우 채널 반전이란?</strong><br />
                    이어폰을 반대로 착용했는지 점검하거나, 양쪽 귀의 감도 균형을 서로 맞바꾸어 역비교해보고 싶을 때 버튼 하나로 왼쪽과 오른쪽 수치를 즉시 교체합니다.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#161616] dark:border-t-[#f4f4f4]" />
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-[#525252] dark:text-[#8d8d8d]">
                헤드폰 착용 상태를 점검하거나 양쪽 밸런스를 반대로 비교해볼 때 좌우 값을 맞바꿉니다
              </div>
            </div>
            <button
              onClick={handleSwapChannels}
              className="flex-shrink-0 px-3 py-1.5 rounded text-xs font-semibold bg-white hover:bg-[#e8e8e8] dark:bg-[#393939] dark:hover:bg-[#525252] text-[#161616] dark:text-[#f4f4f4] border border-[#e0e0e0] dark:border-[#525252] transition-colors duration-150 cursor-pointer shadow-xs"
            >
              채널 맞바꾸기
            </button>
          </div>

          {/* 보조 기능 2: 위상(Phase) 180° 반전 (i 아이콘 툴팁 추가 & 고정 너비) */}
          <div className="p-2.5 carbon-subcard rounded-lg flex items-center justify-between gap-2.5 text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-[#161616] dark:text-[#f4f4f4] flex items-center gap-1.5 text-xs">
                <Activity className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>소리가 머리 밖으로 흩어질 때: 위상(Phase) 반전</span>
                <div className="relative group/tip inline-flex items-center">
                  <Info className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:block w-72 p-2.5 bg-[#161616] dark:bg-[#f4f4f4] text-white dark:text-[#161616] text-[11px] rounded-lg shadow-2xl z-50 pointer-events-none leading-relaxed">
                    <strong>위상(Phase) 180° 반전이란?</strong><br />
                    소리가 머리 정중앙에 맺히지 않고 귀 바깥으로 흩어지거나 귓속이 텅 빈 것처럼 멍멍할 때 켜보세요. 180도 위상을 뒤집어 소리를 정중앙으로 모아줍니다.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#161616] dark:border-t-[#f4f4f4]" />
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-[#525252] dark:text-[#8d8d8d]">
                소리가 중심에 맺히지 않고 귓속이 텅 빈 것처럼 흩어질 때 켜면 180도 위상을 뒤집어 소리를 모아줍니다
              </div>
            </div>
            <button
              onClick={handleTogglePhase}
              className={`flex-shrink-0 w-36 min-w-[144px] text-center px-3 py-1.5 rounded text-xs font-semibold border transition-all duration-150 cursor-pointer shadow-xs ${
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
