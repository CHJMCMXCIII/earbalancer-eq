import React, { useState, useEffect } from 'react';
import {
  FREQUENCY_BANDS_61,
  THIRTY_ONE_BAND_INDICES_IN_61,
  FrequencyBand,
  interpolate31to61Bands,
  autoFill31Bands,
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
  Info,
  Sparkles,
} from 'lucide-react';
import { BandState } from '../store/calibrationStore';

interface WizardCalibrationProps {
  eqMode: '31-band' | '61-band';
  setEqMode: (mode: '31-band' | '61-band') => void;
  calibrations: BandState[];
  setCalibrations: React.Dispatch<React.SetStateAction<BandState[]>>;
  onGoToABTest: () => void;
  onGoToExport: () => void;
}

export const WizardCalibration: React.FC<WizardCalibrationProps> = ({
  eqMode,
  setEqMode,
  calibrations,
  setCalibrations,
  onGoToABTest,
}) => {
  // 31밴드 모드: 61개 중 31개 표준 짝수 대역만 활성화
  // 61밴드 모드: 1/6 옥타브 전체 61개 대역 활성화
  const activeBandIndices =
    eqMode === '61-band'
      ? FREQUENCY_BANDS_61.map((_, i) => i)
      : THIRTY_ONE_BAND_INDICES_IN_61;

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [channelMode, setChannelMode] = useState<'left' | 'center' | 'right'>('center');

  const currentBandId = activeBandIndices[currentStepIndex] ?? 0;
  const rawBandInfo = FREQUENCY_BANDS_61[currentBandId] || FREQUENCY_BANDS_61[0];
  const currentBandInfo: FrequencyBand = {
    ...rawBandInfo,
    q: eqMode === '61-band' ? 8.65 : 4.31,
  };

  const currentBandCalib = calibrations[currentBandId] || {
    leftDb: 0,
    rightDb: 0,
    phaseInvert: false,
  };

  // 모드 변경 (31밴드 <-> 61밴드) 시 현재 주파수 위치를 가장 가까운 스텝으로 보존
  const handleModeChange = (newMode: '31-band' | '61-band') => {
    if (newMode === eqMode) return;
    const prevBandId = currentBandId;
    setEqMode(newMode);

    const newActiveIndices =
      newMode === '61-band'
        ? FREQUENCY_BANDS_61.map((_, i) => i)
        : THIRTY_ONE_BAND_INDICES_IN_61;

    let targetStep = newActiveIndices.indexOf(prevBandId);
    if (targetStep === -1) {
      let closestStep = 0;
      let minDiff = 999999;
      newActiveIndices.forEach((id, step) => {
        const diff = Math.abs(id - prevBandId);
        if (diff < minDiff) {
          minDiff = diff;
          closestStep = step;
        }
      });
      targetStep = closestStep;
    }
    setCurrentStepIndex(targetStep);
  };

  // 31밴드 모드에서 조절한 주요 주파수를 바탕으로 31개 전체 대역 자동 보간 채우기
  const handleAutoFill31 = () => {
    const calibratedCount = THIRTY_ONE_BAND_INDICES_IN_61.filter(
      (idx) => calibrations[idx]?.leftDb !== 0 || calibrations[idx]?.rightDb !== 0
    ).length;

    if (calibratedCount === 0) {
      setActionNotice('💡 먼저 기준이 되는 주파수를 1개 이상 조절한 후 자동 채우기를 눌러주세요.');
      setTimeout(() => setActionNotice(null), 3500);
      return;
    }

    const updated = autoFill31Bands(calibrations);
    setCalibrations(updated);
    setActionNotice('✨ 조절하신 주파수를 바탕으로 31개 전체 대역이 부드럽게 자동 완성되었습니다.');
    setTimeout(() => setActionNotice(null), 3500);

    if (isPlaying) {
      const activeId = activeBandIndices[currentStepIndex] ?? 0;
      const bInfo = FREQUENCY_BANDS_61[activeId];
      const bCalib = updated[activeId] || { leftDb: 0, rightDb: 0, phaseInvert: false };
      audioEngine.updateToneParams(
        bCalib.leftDb,
        bCalib.rightDb,
        bCalib.phaseInvert,
        bInfo.isoCompDb,
        channelMode
      );
    }
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
        currentBandInfo.isoCompDb,
        channelMode
      );
      setIsPlaying(true);
    }
  };

  const handleSelectChannelMode = (mode: 'left' | 'center' | 'right') => {
    setChannelMode(mode);
    if (isPlaying) {
      audioEngine.updateToneParams(
        currentBandCalib.leftDb,
        currentBandCalib.rightDb,
        currentBandCalib.phaseInvert,
        currentBandInfo.isoCompDb,
        mode
      );
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
        currentBandInfo.isoCompDb,
        channelMode
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
        currentBandInfo.isoCompDb,
        channelMode
      );
    }
  };

  const handleResetCurrent = () => {
    const updated = [...calibrations];
    updated[currentBandId] = { leftDb: 0, rightDb: 0, phaseInvert: false };
    setCalibrations(updated);
    if (isPlaying) {
      audioEngine.updateToneParams(0, 0, false, currentBandInfo.isoCompDb, channelMode);
    }
  };

  const handleStepChange = (newStep: number) => {
    if (newStep < 0 || newStep >= activeBandIndices.length) return;
    setCurrentStepIndex(newStep);

    const nextBandId = activeBandIndices[newStep];
    const nextBandInfo = FREQUENCY_BANDS_61[nextBandId];
    const nextCalib = calibrations[nextBandId] || { leftDb: 0, rightDb: 0, phaseInvert: false };

    if (isPlaying) {
      audioEngine.startTone(
        nextBandInfo.freq,
        nextCalib.leftDb,
        nextCalib.rightDb,
        nextCalib.phaseInvert,
        nextBandInfo.isoCompDb,
        channelMode
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
      {/* 1. 최상단으로 이동한 핵심 내비게이션 & 제어 바 (IBM Carbon Card) - 31/61밴드 좌우 꽉 차게 배치 */}
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

        {/* 주파수 대역 인터랙티브 내비게이션 바 (반응형으로 좌우 꽉 차고 클릭하기 편한 크기로 개편) */}
        <div className="flex-1 flex items-center justify-between gap-0.5 sm:gap-1 py-1 px-1 min-w-0">
          {activeBandIndices.map((bIdx, idx) => {
            const isDone =
              calibrations[bIdx]?.leftDb !== 0 ||
              calibrations[bIdx]?.rightDb !== 0 ||
              calibrations[bIdx]?.phaseInvert;
            const isCurrent = idx === currentStepIndex;

            return (
              <button
                key={bIdx}
                onClick={() => handleStepChange(idx)}
                title={`${FREQUENCY_BANDS_61[bIdx].label} (${FREQUENCY_BANDS_61[bIdx].freq}Hz)${isDone ? ' [보정됨]' : ''}`}
                className={`flex-1 h-5 sm:h-6 min-w-[3px] sm:min-w-[6px] rounded-xs sm:rounded-sm transition-all duration-150 cursor-pointer relative ${
                  isCurrent
                    ? 'bg-[#0f62fe] ring-2 ring-[#0f62fe]/50 scale-y-110 z-10 shadow-xs'
                    : isDone
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-[#d0d0d0] dark:bg-[#393939] hover:bg-[#8d8d8d] dark:hover:bg-[#525252]'
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
            actionNotice={actionNotice}
            channelMode={channelMode}
            onSelectChannelMode={handleSelectChannelMode}
          />
        </div>

        {/* 우측 7컬럼: 좌/우 채널 분리 조절 슬라이더 및 보조 도구 패널 (h-full & justify-between) */}
        <div className="md:col-span-7 h-full p-4 carbon-card rounded-xl shadow-xs flex flex-col justify-between gap-3.5">
          {/* [우측 카드 최상단] 31밴드 / 61밴드 정밀 모드 토글 (자동 채우기 기능은 추후 재검토 후 도입을 위해 임시 숨김 처리) */}
          <div className="flex items-center justify-start gap-2 p-1.5 bg-[#f4f4f4] dark:bg-[#161616] rounded-lg border border-[#e0e0e0] dark:border-[#393939]">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleModeChange('31-band')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  eqMode === '31-band'
                    ? 'bg-white dark:bg-[#262626] text-[#0f62fe] dark:text-[#78a9ff] shadow-xs font-bold'
                    : 'text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616] dark:hover:text-[#ffffff]'
                }`}
                title="1/3 옥타브 표준 31밴드 (Q=4.31)"
              >
                31밴드 표준 (Q=4.31)
              </button>
              <button
                onClick={() => handleModeChange('61-band')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  eqMode === '61-band'
                    ? 'bg-[#0f62fe] text-white shadow-xs font-bold'
                    : 'text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616] dark:hover:text-[#ffffff]'
                }`}
                title="1/6 옥타브 초정밀 61밴드 (Q=8.65)"
              >
                61밴드 초정밀 (Q=8.65)
              </button>
            </div>

            {/* 자동 채우기 버튼은 임시 숨김 처리 */}
          </div>

          {/* 보청기 원리 기반 권장 안내 팁 배너, 볼륨/청력 안전 주의 문구 및 착용상태/이압 안내 요약 */}
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
            <div className="flex items-start gap-2 text-[#525252] dark:text-[#c6c6c6] pt-1.5 border-t border-[#d0e2ff]/60 dark:border-[#0043ce]/40">
              <span className="flex-shrink-0 text-xs mt-0.5">🎧</span>
              <span className="leading-tight">
                <strong>착용 방식 및 이압 안내:</strong> 이어폰 삽입 깊이, 헤드폰 착용 각도·밀폐도 및 당일의 귀 압력(이압)에 따라 좌우 감도가 달라질 수 있습니다. 평소 감상 시 어색함이 느껴지면 언제든 재설정하세요.
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
                  인간 청각 특성에 맞춰 시스템이 자동 보정 ({eqMode === '61-band' ? '61밴드 초정밀 Q=8.65' : '31밴드 표준 Q=4.31'})
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] px-2 py-0.5 rounded font-mono text-[11px] font-bold text-[#161616] dark:text-[#f4f4f4] flex-shrink-0 shadow-xs">
              {currentBandInfo.isoCompDb > 0
                ? `+${currentBandInfo.isoCompDb.toFixed(1)} dB (음량 보강)`
                : currentBandInfo.isoCompDb < 0
                ? `${currentBandInfo.isoCompDb.toFixed(1)} dB (음량 감쇄)`
                : '0.0 dB (기준음)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
