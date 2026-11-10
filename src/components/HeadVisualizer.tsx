import React, { useState, useEffect } from 'react';
import { FrequencyBand } from '../data/iso226';
import { CheckCircle2, Radio, Play, Square, RotateCcw, Compass } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';

interface HeadVisualizerProps {
  leftDb: number;
  rightDb: number;
  phaseInvert: boolean;
  isPlaying: boolean;
  currentBand: FrequencyBand;
  onToggleSound?: () => void;
  onResetCurrent?: () => void;
  actionNotice?: string | null;
  channelMode?: 'left' | 'center' | 'right' | '360';
  onSelectChannelMode?: (mode: 'left' | 'center' | 'right' | '360') => void;
}

export const HeadVisualizer: React.FC<HeadVisualizerProps> = ({
  leftDb,
  rightDb,
  phaseInvert,
  isPlaying,
  currentBand,
  onToggleSound,
  onResetCurrent,
  actionNotice,
  channelMode = 'center',
  onSelectChannelMode,
}) => {
  const [spatialAngle, setSpatialAngle] = useState<number>(0);

  // 360도 바이노럴 회전 재생 시 실시간 각도 추적 애니메이션
  useEffect(() => {
    let animId: number;
    if (isPlaying && channelMode === '360') {
      const loop = () => {
        setSpatialAngle(audioEngine.get360Angle());
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    } else {
      setSpatialAngle(0);
    }
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, channelMode]);

  const leftAmp = Math.max(0.3, Math.min(2.0, 1.0 + leftDb / 12));
  const rightAmp = Math.max(0.3, Math.min(2.0, 1.0 + rightDb / 12));

  const diffDb = Number((rightDb - leftDb).toFixed(1));
  const isBalanced = Math.abs(diffDb) < 0.2;

  // 좌/우 파동 변위 이동 거리 대폭 확대 (더 두드러진 시각적 피드백 제공)
  const leftWaveMove = leftDb * 2.0;
  const rightWaveMove = rightDb * 2.0;

  // 소리 중심점(음상) 좌우 이동 거리 (diffDb에 따라 두상 내부에서 ±32px까지 두드러지게 이동, L/R 단독 선택 시 해당 방향으로 이동)
  const soundCenterShift = channelMode === 'left'
    ? -32
    : channelMode === 'right'
    ? 32
    : Math.max(-32, Math.min(32, diffDb * 2.8));

  const isLeftActive = channelMode === 'left' || channelMode === 'center' || channelMode === '360';
  const isRightActive = channelMode === 'right' || channelMode === 'center' || channelMode === '360';

  // 360도 궤도 반경 및 현재 소리 위치 좌표 산출 (머리와 음파를 가리지 않도록 넉넉하게 확장된 궤도)
  const centerX = 170;
  const centerY = 135;
  const orbitRx = 120;
  const orbitRy = 90;

  let soundX = centerX + soundCenterShift;
  let soundY = centerY;

  if (channelMode === '360') {
    const rad = (spatialAngle * Math.PI) / 180;
    soundX = centerX + orbitRx * Math.sin(rad);
    soundY = centerY - orbitRy * Math.cos(rad);
  } else if (channelMode === 'left') {
    soundX = centerX - orbitRx;
    soundY = centerY;
  } else if (channelMode === 'right') {
    soundX = centerX + orbitRx;
    soundY = centerY;
  }

  const getSoundLocationText = () => {
    if (channelMode === '360') {
      let dir = '정면';
      if (spatialAngle >= 45 && spatialAngle < 135) dir = '우측';
      else if (spatialAngle >= 135 && spatialAngle < 225) dir = '후면';
      else if (spatialAngle >= 225 && spatialAngle < 315) dir = '좌측';
      return `360° 회전 (${dir} ${Math.round(spatialAngle)}°)`;
    }
    if (channelMode === 'left') return '왼쪽 귀 (L 단독)';
    if (channelMode === 'right') return '오른쪽 귀 (R 단독)';
    return isBalanced ? '두상 정중앙 (Center)' : soundCenterShift < 0 ? '중앙 좌측 편향' : '중앙 우측 편향';
  };

  return (
    <div className="relative flex flex-col items-center justify-between p-4 carbon-card rounded-xl shadow-xs overflow-hidden h-full">
      {/* 상단 밸런스 상태 텍스트 (사용자 친화적 용어로 변경) */}
      <div className="w-full flex items-center justify-between text-xs sm:text-sm text-[#525252] dark:text-[#c6c6c6] z-10 pb-1.5">
        <div className="flex items-center gap-1.5 font-medium">
          <Radio className="w-4 h-4 text-[#0f62fe]" />
          <span className="font-semibold text-xs sm:text-sm text-[#161616] dark:text-[#f4f4f4]">
            소리 위치 가이드
          </span>
        </div>

        <div>
          {isBalanced ? (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-[#161616] px-2.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> 양쪽 귀 균형 일치
            </span>
          ) : diffDb < 0 ? (
            <span className="text-[#161616] dark:text-[#f4f4f4] bg-[#f4f4f4] dark:bg-[#161616] px-2 py-0.5 rounded border border-[#e0e0e0] dark:border-[#393939] text-[11px]">
              왼쪽이 <strong className="text-[#0f62fe] dark:text-[#78a9ff]">+{Math.abs(diffDb).toFixed(1)} dB</strong> 더 큼
            </span>
          ) : (
            <span className="text-[#161616] dark:text-[#f4f4f4] bg-[#f4f4f4] dark:bg-[#161616] px-2 py-0.5 rounded border border-[#e0e0e0] dark:border-[#393939] text-[11px]">
              오른쪽이 <strong className="text-[#0f62fe] dark:text-[#78a9ff]">+{diffDb.toFixed(1)} dB</strong> 더 큼
            </span>
          )}
        </div>
      </div>

      {/* 미니멀한 얇은 선 두상 및 방사형 음파 일러스트레이션 (상하 길이 연장된 두상 그래픽) */}
      <div className="relative w-full max-w-[340px] sm:max-w-[360px] h-56 sm:h-60 flex items-center justify-center z-10 my-auto">
        {/* 상단 소리 위치 실시간 인디케이터 배너 (머리 모양 앞부분 중앙 상단으로 이동) */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/95 dark:bg-[#161616]/95 border border-[#e0e0e0] dark:border-[#393939] text-[10px] font-semibold text-[#161616] dark:text-[#f4f4f4] shadow-xs backdrop-blur-xs z-20 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0f62fe] animate-pulse inline-block" />
          <span className="text-[#525252] dark:text-[#8d8d8d]">소리 위치:</span>
          <span className="text-[#0f62fe] dark:text-[#78a9ff] font-bold">{getSoundLocationText()}</span>
        </div>

        <svg viewBox="0 0 340 240" className="w-full h-full">
          {/* 중앙 수직 점선 기준선 */}
          <line
            x1="170"
            y1="45"
            x2="170"
            y2="225"
            stroke="currentColor"
            className="text-[#e0e0e0] dark:text-[#393939]"
            strokeDasharray="2 3"
            strokeWidth="1"
          />

          {/* 360도 바이노럴 서라운드 궤도 가이드 트랙 (머리 모양 및 기존 그래픽을 전혀 가리지 않는 확장 궤도) */}
          <ellipse
            cx="170"
            cy="135"
            rx="120"
            ry="90"
            fill="none"
            stroke="currentColor"
            className={
              channelMode === '360'
                ? "text-[#0f62fe] dark:text-[#78a9ff]"
                : "text-[#d0d0d0] dark:text-[#393939]"
            }
            strokeDasharray={channelMode === '360' ? "none" : "3 3"}
            strokeWidth={channelMode === '360' ? "1.4" : "0.8"}
            opacity={channelMode === '360' ? (isPlaying ? 0.85 : 0.5) : 0.25}
          />

          {/* 360도 방위 표시 마커 (0°, 90°, 180°, 270°) */}
          <g className="text-[9px] fill-[#8d8d8d] dark:fill-[#525252] font-semibold select-none" textAnchor="middle">
            <text x="170" y="38">0°</text>
            <text x="304" y="138">90°</text>
            <text x="170" y="237">180°</text>
            <text x="36" y="138">270°</text>
          </g>

          {/* 1. 머리 중심부에서 퍼져나가는 동심원 음파 (IBM Carbon Blue & Gray, 소리 위치 이동 반영) */}
          {isPlaying && (
            <g
              transform={`translate(${170 + soundCenterShift}, 135)`}
              style={{ transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.38, 0.9)' }}
            >
              <circle
                cx="0"
                cy="0"
                r="22"
                fill="none"
                stroke="currentColor"
                className="text-[#0f62fe] dark:text-[#78a9ff] animate-ping opacity-60"
                strokeWidth="1"
                style={{ animationDuration: '1.4s' }}
              />
              <circle
                cx="0"
                cy="0"
                r="44"
                fill="none"
                stroke="currentColor"
                className="text-[#8d8d8d] dark:text-[#525252] animate-ping opacity-40"
                strokeWidth="0.8"
                style={{ animationDuration: '2.2s' }}
              />
              <circle
                cx="0"
                cy="0"
                r="66"
                fill="none"
                stroke="currentColor"
                className="text-[#c6c6c6] dark:text-[#393939] animate-ping opacity-25"
                strokeWidth="0.6"
                style={{ animationDuration: '3.0s' }}
              />
            </g>
          )}

          {/* 2. 좌측 귀 개인화 독립 음파 (L) - 이동 거리 2.0px/dB로 확대 */}
          <g
            transform={`translate(${118 - leftWaveMove}, 135)`}
            style={{ transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.38, 0.9)' }}
          >
            <path
              d="M -5 -28 A 32 32 0 0 0 -5 28"
              fill="none"
              stroke={isLeftActive ? "#0f62fe" : "#8d8d8d"}
              strokeWidth={Math.max(1.2, 1.8 * leftAmp)}
              opacity={isPlaying && isLeftActive ? 0.95 : isLeftActive ? 0.4 : 0.08}
              strokeLinecap="round"
            />
            <path
              d="M -16 -40 A 48 48 0 0 0 -16 40"
              fill="none"
              stroke={isLeftActive ? "#4589ff" : "#8d8d8d"}
              strokeWidth={Math.max(0.8, 1.2 * leftAmp)}
              opacity={isPlaying && isLeftActive ? 0.7 : isLeftActive ? 0.25 : 0.05}
              strokeLinecap="round"
            />
            <circle
              cx="-24"
              cy="0"
              r={Math.max(2.5, 3.5 * leftAmp)}
              fill={isLeftActive ? "#0f62fe" : "#8d8d8d"}
              opacity={isPlaying && isLeftActive ? 0.95 : isLeftActive ? 0.4 : 0.08}
            />
          </g>

          {/* 3. 우측 귀 개인화 독립 음파 (R) - 이동 거리 2.0px/dB로 확대 */}
          <g
            transform={`translate(${222 + rightWaveMove}, 135)`}
            style={{ transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.38, 0.9)' }}
          >
            <path
              d="M 5 -28 A 32 32 0 0 1 5 28"
              fill="none"
              stroke={isRightActive ? "#0f62fe" : "#8d8d8d"}
              strokeWidth={Math.max(1.2, 1.8 * rightAmp)}
              opacity={isPlaying && isRightActive ? 0.95 : isRightActive ? 0.4 : 0.08}
              strokeLinecap="round"
            />
            <path
              d="M 16 -40 A 48 48 0 0 1 16 40"
              fill="none"
              stroke={isRightActive ? "#4589ff" : "#8d8d8d"}
              strokeWidth={Math.max(0.8, 1.2 * rightAmp)}
              opacity={isPlaying && isRightActive ? 0.7 : isRightActive ? 0.25 : 0.05}
              strokeLinecap="round"
            />
            <circle
              cx="24"
              cy="0"
              r={Math.max(2.5, 3.5 * rightAmp)}
              fill={isRightActive ? "#0f62fe" : "#8d8d8d"}
              opacity={isPlaying && isRightActive ? 0.95 : isRightActive ? 0.4 : 0.08}
            />
          </g>

          {/* 4. 미니멀한 두상 */}
          <g transform="translate(170, 135)">
            {/* 정면 방향을 가리키는 간접 화살표 그래픽 */}
            <g transform="translate(0, -68)">
              <path
                d="M -4 4 L 0 -2 L 4 4"
                fill="none"
                stroke="currentColor"
                className="text-[#0f62fe] dark:text-[#78a9ff]"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="0" cy="-6" r="1.2" fill="currentColor" className="text-[#0f62fe] dark:text-[#78a9ff]" />
            </g>

            {/* 코 (위쪽 시선) */}
            <path
              d="M -5 -54 Q 0 -68 5 -54 Z"
              className="fill-[#e8e8e8] dark:fill-[#393939] stroke-[#525252] dark:stroke-[#8d8d8d]"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* 두상 외곽선 */}
            <ellipse
              cx="0"
              cy="0"
              rx="47"
              ry="54"
              className="fill-[#ffffff] dark:fill-[#262626] stroke-[#525252] dark:stroke-[#8d8d8d]"
              strokeWidth="1.2"
            />

            {/* 좌측 귀 (L) */}
            <rect
              x="-55"
              y="-14"
              width="8"
              height="28"
              rx="4"
              className="fill-[#f4f4f4] dark:fill-[#393939] stroke-[#525252] dark:stroke-[#8d8d8d]"
              strokeWidth="1.2"
            />
            <text
              x="-68"
              y="4"
              className="fill-[#161616] dark:text-[#f4f4f4] font-bold"
              fontSize="11"
              textAnchor="middle"
            >
              L
            </text>

            {/* 우측 귀 (R) */}
            <rect
              x="47"
              y="-14"
              width="8"
              height="28"
              rx="4"
              className="fill-[#f4f4f4] dark:fill-[#393939] stroke-[#525252] dark:stroke-[#8d8d8d]"
              strokeWidth="1.2"
            />
            <text
              x="68"
              y="4"
              className="fill-[#161616] dark:text-[#f4f4f4] font-bold"
              fontSize="11"
              textAnchor="middle"
            >
              R
            </text>

            {/* 머리 중심 타깃 링 (기준선) */}
            <circle
              cx="0"
              cy="0"
              r="7"
              fill="none"
              stroke="currentColor"
              className="text-[#8d8d8d] dark:text-[#525252]"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />

            {/* 머리 중심 발원 코어 (소리 크기 편향에 따라 좌우로 두드러지게 이동) */}
            <g
              transform={`translate(${soundCenterShift}, 0)`}
              style={{ transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.38, 0.9)' }}
            >
              <circle
                cx="0"
                cy="0"
                r={isBalanced ? 10 : 8}
                fill={isBalanced ? '#198038' : '#0f62fe'}
                opacity={isPlaying && channelMode === 'center' ? 0.95 : 0.4}
                className={isPlaying && channelMode === 'center' ? 'animate-pulse' : ''}
              />
              <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
            </g>
          </g>

          {/* 360도 바이노럴 서라운드 회전 레이더 빔 */}
          {channelMode === '360' && isPlaying && (
            <line
              x1="170"
              y1="135"
              x2={soundX}
              y2={soundY}
              stroke="currentColor"
              className="text-[#0f62fe] dark:text-[#78a9ff]"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              opacity="0.6"
            />
          )}

          {/* 실시간 각 소리 위치 지점 오버레이 오브 (Sound Location Indicator Orb) */}
          <g
            transform={`translate(${soundX}, ${soundY})`}
            style={{ transition: channelMode === '360' ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0.38, 0.9)' }}
          >
            {isPlaying && (
              <circle
                cx="0"
                cy="0"
                r="13"
                fill="none"
                stroke={channelMode === 'center' && isBalanced ? '#198038' : '#0f62fe'}
                className="animate-ping opacity-60"
                strokeWidth="1.2"
              />
            )}
            <circle
              cx="0"
              cy="0"
              r={channelMode === '360' ? 6.5 : channelMode === 'center' ? 4 : 6}
              fill={channelMode === 'center' && isBalanced ? '#198038' : '#0f62fe'}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="shadow-md"
            />
            <circle cx="0" cy="0" r="2" fill="#ffffff" />
          </g>
        </svg>

        {/* 안내 알림 토스트 (소리 위치 가이드 그래픽 아래에 absolute로 배치하여 레이아웃 변경 방지) */}
        {actionNotice && (
          <div className="absolute -bottom-1 left-2 right-2 z-30 bg-[#161616]/95 dark:bg-[#ffffff]/95 text-white dark:text-[#161616] text-[11px] font-medium py-1.5 px-3 rounded-lg shadow-xl text-center backdrop-blur-xs border border-white/20 dark:border-black/20 pointer-events-none transition-all duration-150 animate-in fade-in">
            {actionNotice}
          </div>
        )}
      </div>

      {/* L, center, R, 360° 채널 단독/양쪽/회전 재생 전환 버튼 */}
      <div className="w-full flex items-center justify-center my-1 z-10">
        <div className="inline-flex p-0.5 rounded-lg bg-[#e8e8e8] dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] text-xs shadow-xs">
          <button
            type="button"
            onClick={() => onSelectChannelMode?.('left')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all duration-150 cursor-pointer ${
              channelMode === 'left'
                ? 'bg-[#0f62fe] text-white shadow-xs'
                : 'text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616] dark:hover:text-[#ffffff]'
            }`}
            title="왼쪽(L) 채널만 단독 재생"
          >
            L
          </button>
          <button
            type="button"
            onClick={() => onSelectChannelMode?.('center')}
            className={`px-3.5 py-1 rounded-md text-xs font-bold transition-all duration-150 cursor-pointer ${
              channelMode === 'center'
                ? 'bg-[#161616] dark:bg-[#f4f4f4] text-white dark:text-[#161616] shadow-xs'
                : 'text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616] dark:hover:text-[#ffffff]'
            }`}
            title="양쪽 채널 함께 재생 (기본값)"
          >
            center
          </button>
          <button
            type="button"
            onClick={() => onSelectChannelMode?.('right')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all duration-150 cursor-pointer ${
              channelMode === 'right'
                ? 'bg-[#0f62fe] text-white shadow-xs'
                : 'text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616] dark:hover:text-[#ffffff]'
            }`}
            title="오른쪽(R) 채널만 단독 재생"
          >
            R
          </button>
          <button
            type="button"
            onClick={() => onSelectChannelMode?.('360')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1 ${
              channelMode === '360'
                ? 'bg-[#0f62fe] text-white shadow-xs'
                : 'text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616] dark:hover:text-[#ffffff]'
            }`}
            title="바이노럴 360° 서라운드 회전 재생"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>360°</span>
          </button>
        </div>
      </div>

      {/* 하단 주파수 대역 표시 박스 (10~12px) */}
      <div className="w-full mt-2 pt-2 border-t border-[#e0e0e0] dark:border-[#393939] flex flex-col items-center justify-between text-xs z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#525252] dark:text-[#8d8d8d]">현재 대역:</span>
          <span className="font-mono font-bold text-xs text-[#161616] dark:text-[#f4f4f4] bg-[#f4f4f4] dark:bg-[#161616] px-2 py-0.5 rounded border border-[#e0e0e0] dark:border-[#393939]">
            {currentBand.label}
          </span>
          <span className="text-[10px] text-[#525252] dark:text-[#8d8d8d] font-medium hidden sm:inline">
            ({currentBand.freq} Hz)
          </span>
        </div>

        <div className="mt-1 text-[11px] text-[#525252] dark:text-[#c6c6c6] text-center">
          {currentBand.description}
        </div>
      </div>

      {/* 하단 사운드 제어 버튼 영역 (머리 그래픽 하단 수직 정렬) */}
      {onToggleSound && (
        <div className="w-full mt-3 pt-3 border-t border-[#e0e0e0] dark:border-[#393939] flex flex-col items-center gap-2 z-10">
          <button
            onClick={onToggleSound}
            className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all duration-150 cursor-pointer ${
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

          {onResetCurrent && (
            <button
              onClick={onResetCurrent}
              className="flex items-center justify-center gap-1.5 py-1 text-xs text-[#525252] dark:text-[#8d8d8d] hover:text-[#161616] dark:hover:text-[#ffffff] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>현재 음높이 리셋</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
