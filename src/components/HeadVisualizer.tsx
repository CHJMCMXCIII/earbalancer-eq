import React from 'react';
import { FrequencyBand } from '../data/iso226';
import { CheckCircle2, Radio } from 'lucide-react';

interface HeadVisualizerProps {
  leftDb: number;
  rightDb: number;
  phaseInvert: boolean;
  isPlaying: boolean;
  currentBand: FrequencyBand;
}

export const HeadVisualizer: React.FC<HeadVisualizerProps> = ({
  leftDb,
  rightDb,
  phaseInvert,
  isPlaying,
  currentBand,
}) => {
  const leftAmp = Math.max(0.3, Math.min(2.0, 1.0 + leftDb / 12));
  const rightAmp = Math.max(0.3, Math.min(2.0, 1.0 + rightDb / 12));

  const diffDb = Number((rightDb - leftDb).toFixed(1));
  const isBalanced = Math.abs(diffDb) < 0.2;

  const leftWaveOffset = leftDb * 2.5;
  const rightWaveOffset = rightDb * 2.5;

  return (
    <div className="relative flex flex-col items-center justify-between p-4 carbon-card rounded-xl shadow-xs overflow-hidden h-full">
      {/* 상단 밸런스 상태 텍스트 (최소 12px) */}
      <div className="w-full flex items-center justify-between text-xs sm:text-sm text-[#525252] dark:text-[#c6c6c6] z-10 pb-1.5">
        <div className="flex items-center gap-1.5 font-medium">
          <Radio className="w-4 h-4 text-[#0f62fe]" />
          <span className="font-semibold text-xs sm:text-sm text-[#161616] dark:text-[#f4f4f4]">
            중심 음파 방사 가이드
          </span>
        </div>

        <div>
          {isBalanced ? (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-[#161616] px-3 py-1 rounded border border-emerald-300 dark:border-emerald-800 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" /> 양쪽 귀 균형 일치
            </span>
          ) : diffDb < 0 ? (
            <span className="text-[#161616] dark:text-[#f4f4f4] bg-[#f4f4f4] dark:bg-[#161616] px-2.5 py-1 rounded border border-[#e0e0e0] dark:border-[#393939] text-xs">
              왼쪽이 <strong className="text-[#0f62fe] dark:text-[#78a9ff]">+{Math.abs(diffDb).toFixed(1)} dB</strong> 더 큼
            </span>
          ) : (
            <span className="text-[#161616] dark:text-[#f4f4f4] bg-[#f4f4f4] dark:bg-[#161616] px-2.5 py-1 rounded border border-[#e0e0e0] dark:border-[#393939] text-xs">
              오른쪽이 <strong className="text-[#0f62fe] dark:text-[#78a9ff]">+{diffDb.toFixed(1)} dB</strong> 더 큼
            </span>
          )}
        </div>
      </div>

      {/* 미니멀한 얇은 선 두상 및 방사형 음파 일러스트레이션 (상하 길이 연장된 두상 그래픽) */}
      <div className="relative w-full max-w-[320px] h-48 sm:h-52 flex items-center justify-center z-10 my-auto">
        <svg viewBox="0 0 320 210" className="w-full h-full">
          {/* 중앙 수직 점선 기준선 */}
          <line
            x1="160"
            y1="8"
            x2="160"
            y2="202"
            stroke="currentColor"
            className="text-[#e0e0e0] dark:text-[#393939]"
            strokeDasharray="2 3"
            strokeWidth="1"
          />

          {/* 1. 머리 중심부에서 퍼져나가는 동심원 음파 (IBM Carbon Blue & Gray) */}
          {isPlaying && (
            <g transform="translate(160, 105)">
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

          {/* 2. 좌측 귀 개인화 독립 음파 (L) */}
          <g
            transform={`translate(${108 - leftWaveOffset * 0.4}, 105)`}
            style={{ transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.38, 0.9)' }}
          >
            <path
              d="M -5 -28 A 32 32 0 0 0 -5 28"
              fill="none"
              stroke="#0f62fe"
              strokeWidth={Math.max(1.2, 1.8 * leftAmp)}
              opacity={isPlaying ? 0.95 : 0.4}
              strokeLinecap="round"
            />
            <path
              d="M -16 -40 A 48 48 0 0 0 -16 40"
              fill="none"
              stroke="#4589ff"
              strokeWidth={Math.max(0.8, 1.2 * leftAmp)}
              opacity={isPlaying ? 0.7 : 0.25}
              strokeLinecap="round"
            />
            <circle
              cx="-24"
              cy="0"
              r={Math.max(2.5, 3.5 * leftAmp)}
              fill="#0f62fe"
              opacity={isPlaying ? 0.95 : 0.4}
            />
          </g>

          {/* 3. 우측 귀 개인화 독립 음파 (R) */}
          <g
            transform={`translate(${212 + rightWaveOffset * 0.4}, 105)`}
            style={{ transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.38, 0.9)' }}
          >
            <path
              d="M 5 -28 A 32 32 0 0 1 5 28"
              fill="none"
              stroke="#0f62fe"
              strokeWidth={Math.max(1.2, 1.8 * rightAmp)}
              opacity={isPlaying ? 0.95 : 0.4}
              strokeLinecap="round"
            />
            <path
              d="M 16 -40 A 48 48 0 0 1 16 40"
              fill="none"
              stroke="#4589ff"
              strokeWidth={Math.max(0.8, 1.2 * rightAmp)}
              opacity={isPlaying ? 0.7 : 0.25}
              strokeLinecap="round"
            />
            <circle
              cx="24"
              cy="0"
              r={Math.max(2.5, 3.5 * rightAmp)}
              fill="#0f62fe"
              opacity={isPlaying ? 0.95 : 0.4}
            />
          </g>

          {/* 4. 미니멀한 두상 */}
          <g transform="translate(160, 105)">
            {/* 정면 방향을 가리키는 간접 화살표 그래픽 (텍스트 및 특수문자 제거 완료) */}
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

            {/* 머리 중심 타깃 링 */}
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

            {/* 머리 중심 발원 코어 */}
            <circle
              cx="0"
              cy="0"
              r={isBalanced ? 10 : 8}
              fill={isBalanced ? '#198038' : '#0f62fe'}
              opacity={isPlaying ? 0.95 : 0.4}
              className={isPlaying ? 'animate-pulse' : ''}
            />
            <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
          </g>
        </svg>

        {phaseInvert && (
          <div className="absolute bottom-0 bg-purple-100 dark:bg-purple-950/90 text-purple-700 dark:text-purple-200 border border-purple-300 dark:border-purple-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
            180° 위상 반전 적용됨
          </div>
        )}
      </div>

      {/* 하단 주파수 대역 표시 박스 (최소 12px) */}
      <div className="w-full mt-2 pt-2 border-t border-[#e0e0e0] dark:border-[#393939] flex flex-col items-center justify-between text-xs sm:text-sm z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#525252] dark:text-[#8d8d8d]">현재 대역:</span>
          <span className="font-mono font-bold text-sm text-[#161616] dark:text-[#f4f4f4] bg-[#f4f4f4] dark:bg-[#161616] px-2.5 py-1 rounded border border-[#e0e0e0] dark:border-[#393939]">
            {currentBand.label}
          </span>
          <span className="text-xs text-[#525252] dark:text-[#8d8d8d] font-medium hidden sm:inline">
            ({currentBand.freq} Hz)
          </span>
        </div>

        <div className="mt-2 text-xs xs:text-xs text-[#525252] dark:text-[#c6c6c6] text-center font-small">
          {currentBand.description}
        </div>
      </div>
    </div>
  );
};
