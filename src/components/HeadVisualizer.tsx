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
  const leftAmp = Math.max(0.3, Math.min(2.2, 1.0 + leftDb / 10));
  const rightAmp = Math.max(0.3, Math.min(2.2, 1.0 + rightDb / 10));

  const diffDb = Number((rightDb - leftDb).toFixed(1));
  const isBalanced = Math.abs(diffDb) < 0.2;

  const leftWaveOffset = leftDb * 3;
  const rightWaveOffset = rightDb * 3;

  return (
    <div className="relative flex flex-col items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl overflow-hidden h-full transition-colors">
      {/* 상단 밸런스 상태 텍스트 */}
      <div className="w-full flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 z-10 pb-1">
        <div className="flex items-center gap-1.5 font-medium">
          <Radio className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
          <span className="text-zinc-800 dark:text-zinc-200 font-semibold text-[11px]">
            중심 음파 방사 가이드
          </span>
        </div>

        <div>
          {isBalanced ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-zinc-950 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 text-[11px]">
              <CheckCircle2 className="w-3 h-3" /> 양쪽 귀 균형 일치
            </span>
          ) : diffDb < 0 ? (
            <span className="text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-[11px]">
              왼쪽이 <strong className="text-blue-600 dark:text-blue-400">+{Math.abs(diffDb).toFixed(1)} dB</strong> 더 큼
            </span>
          ) : (
            <span className="text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-[11px]">
              오른쪽이 <strong className="text-blue-600 dark:text-blue-400">+{diffDb.toFixed(1)} dB</strong> 더 큼
            </span>
          )}
        </div>
      </div>

      {/* 머리 중심 방사형 음파 일러스트레이션 (SVG) */}
      <div className="relative w-full max-w-[320px] h-44 flex items-center justify-center z-10 my-auto">
        <svg viewBox="0 0 320 180" className="w-full h-full">
          {/* 중앙 수직 기준선 */}
          <line
            x1="160"
            y1="10"
            x2="160"
            y2="170"
            stroke="currentColor"
            className="text-zinc-300 dark:text-zinc-800"
            strokeDasharray="3 3"
            strokeWidth="1.5"
          />

          {/* 1. 머리 중심부에서 퍼져나가는 동심원 음파 */}
          {isPlaying && (
            <g transform="translate(160, 95)">
              <circle
                cx="0"
                cy="0"
                r="18"
                fill="none"
                stroke="currentColor"
                className="text-zinc-400 dark:text-zinc-500 animate-ping opacity-60"
                strokeWidth="1.5"
                style={{ animationDuration: '1.2s' }}
              />
              <circle
                cx="0"
                cy="0"
                r="36"
                fill="none"
                stroke="currentColor"
                className="text-zinc-300 dark:text-zinc-600 animate-ping opacity-40"
                strokeWidth="1.2"
                style={{ animationDuration: '2.0s' }}
              />
              <circle
                cx="0"
                cy="0"
                r="56"
                fill="none"
                stroke="currentColor"
                className="text-zinc-200 dark:text-zinc-700 animate-ping opacity-20"
                strokeWidth="1"
                style={{ animationDuration: '2.8s' }}
              />
            </g>
          )}

          {/* 2. 좌측 귀 개인화 독립 음파 */}
          <g
            transform={`translate(${108 - leftWaveOffset * 0.4}, 95)`}
            style={{ transition: 'transform 0.15s ease-out' }}
          >
            <path
              d="M -5 -25 A 30 30 0 0 0 -5 25"
              fill="none"
              stroke="#3b82f6"
              strokeWidth={Math.max(1.5, 2 * leftAmp)}
              opacity={isPlaying ? 0.95 : 0.4}
              strokeLinecap="round"
            />
            <path
              d="M -15 -35 A 44 44 0 0 0 -15 35"
              fill="none"
              stroke="#60a5fa"
              strokeWidth={Math.max(1, 1.5 * leftAmp)}
              opacity={isPlaying ? 0.65 : 0.25}
              strokeLinecap="round"
            />
            <circle
              cx="-24"
              cy="0"
              r={Math.max(3, 4 * leftAmp)}
              fill="#3b82f6"
              opacity={isPlaying ? 0.95 : 0.4}
            />
          </g>

          {/* 3. 우측 귀 개인화 독립 음파 */}
          <g
            transform={`translate(${212 + rightWaveOffset * 0.4}, 95)`}
            style={{ transition: 'transform 0.15s ease-out' }}
          >
            <path
              d="M 5 -25 A 30 30 0 0 1 5 25"
              fill="none"
              stroke="#3b82f6"
              strokeWidth={Math.max(1.5, 2 * rightAmp)}
              opacity={isPlaying ? 0.95 : 0.4}
              strokeLinecap="round"
            />
            <path
              d="M 15 -35 A 44 44 0 0 1 15 35"
              fill="none"
              stroke="#60a5fa"
              strokeWidth={Math.max(1, 1.5 * rightAmp)}
              opacity={isPlaying ? 0.65 : 0.25}
              strokeLinecap="round"
            />
            <circle
              cx="24"
              cy="0"
              r={Math.max(3, 4 * rightAmp)}
              fill="#3b82f6"
              opacity={isPlaying ? 0.95 : 0.4}
            />
          </g>

          {/* 4. 사람 머리 두상 (Light / Dark 지원) */}
          <g transform="translate(160, 95)">
            <path
              d="M -6 -42 Q 0 -58 6 -42 Z"
              className="fill-zinc-300 dark:fill-zinc-700 stroke-zinc-400 dark:stroke-zinc-600"
              strokeWidth="1.5"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="48"
              ry="44"
              className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-400 dark:stroke-zinc-600"
              strokeWidth="2"
            />

            {/* 좌측 귀 */}
            <rect
              x="-56"
              y="-12"
              width="9"
              height="24"
              rx="4.5"
              className="fill-zinc-300 dark:fill-zinc-700 stroke-zinc-400 dark:stroke-zinc-500"
              strokeWidth="1.5"
            />
            <text
              x="-70"
              y="4"
              className="fill-zinc-600 dark:fill-zinc-400 font-bold"
              fontSize="10"
              textAnchor="middle"
            >
              L
            </text>

            {/* 우측 귀 */}
            <rect
              x="47"
              y="-12"
              width="9"
              height="24"
              rx="4.5"
              className="fill-zinc-300 dark:fill-zinc-700 stroke-zinc-400 dark:stroke-zinc-500"
              strokeWidth="1.5"
            />
            <text
              x="70"
              y="4"
              className="fill-zinc-600 dark:fill-zinc-400 font-bold"
              fontSize="10"
              textAnchor="middle"
            >
              R
            </text>

            {/* 머리 중심 발원 코어 */}
            <circle
              cx="0"
              cy="0"
              r={isBalanced ? 12 : 9}
              fill={isBalanced ? '#10b981' : '#3b82f6'}
              opacity={isPlaying ? 0.85 : 0.35}
              className={isPlaying ? 'animate-pulse' : ''}
            />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />

            <text
              x="0"
              y="-18"
              className="fill-zinc-500 dark:fill-zinc-500"
              fontSize="8"
              textAnchor="middle"
              letterSpacing="1"
            >
              ▲ 정면 (모니터)
            </text>
          </g>
        </svg>

        {phaseInvert && (
          <div className="absolute bottom-0 bg-purple-100 dark:bg-purple-950/90 text-purple-700 dark:text-purple-200 border border-purple-300 dark:border-purple-500/50 text-[10px] font-medium px-2 py-0.5 rounded-full shadow">
            180° 위상 반전 적용됨
          </div>
        )}
      </div>

      {/* 하단 주파수 대역 표시 박스 */}
      <div className="w-full mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-zinc-500">현재 대역:</span>
          <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-950 px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-800">
            {currentBand.label}
          </span>
          <span className="text-[11px] text-zinc-500 font-medium hidden sm:inline">
            ({currentBand.freq} Hz)
          </span>
        </div>

        <div className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate max-w-[170px] text-right">
          {currentBand.description}
        </div>
      </div>
    </div>
  );
};
