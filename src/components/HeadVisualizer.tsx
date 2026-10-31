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
    <div className="relative flex flex-col items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl overflow-hidden h-full transition-colors">
      {/* 상단 밸런스 상태 텍스트 */}
      <div className="w-full flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 z-10 pb-1">
        <div className="flex items-center gap-1.5 font-medium">
          <Radio className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
          <span className="font-semibold text-[11px]">
            중심 음파 방사 가이드
          </span>
        </div>

        <div>
          {isBalanced ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-zinc-950 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 text-[11px]">
              <CheckCircle2 className="w-3 h-3" /> 양쪽 귀 균형 일치
            </span>
          ) : diffDb < 0 ? (
            <span className="text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-[11px]">
              왼쪽이 <strong className="text-blue-600 dark:text-blue-400">+{Math.abs(diffDb).toFixed(1)} dB</strong> 더 큼
            </span>
          ) : (
            <span className="text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-[11px]">
              오른쪽이 <strong className="text-blue-600 dark:text-blue-400">+{diffDb.toFixed(1)} dB</strong> 더 큼
            </span>
          )}
        </div>
      </div>

      {/* 미니멀한 얇은 선 두상 및 방사형 음파 일러스트레이션 (SVG) */}
      <div className="relative w-full max-w-[320px] h-44 flex items-center justify-center z-10 my-auto">
        <svg viewBox="0 0 320 180" className="w-full h-full">
          {/* 중앙 수직 점선 기준선 */}
          <line
            x1="160"
            y1="10"
            x2="160"
            y2="170"
            stroke="currentColor"
            className="text-zinc-300 dark:text-zinc-800"
            strokeDasharray="2 3"
            strokeWidth="1"
          />

          {/* 1. 머리 중심부에서 퍼져나가는 동심원 음파 (미니멀 얇은 선) */}
          {isPlaying && (
            <g transform="translate(160, 95)">
              <circle
                cx="0"
                cy="0"
                r="20"
                fill="none"
                stroke="currentColor"
                className="text-zinc-400 dark:text-zinc-500 animate-ping opacity-60"
                strokeWidth="1"
                style={{ animationDuration: '1.4s' }}
              />
              <circle
                cx="0"
                cy="0"
                r="40"
                fill="none"
                stroke="currentColor"
                className="text-zinc-300 dark:text-zinc-600 animate-ping opacity-40"
                strokeWidth="0.8"
                style={{ animationDuration: '2.2s' }}
              />
              <circle
                cx="0"
                cy="0"
                r="60"
                fill="none"
                stroke="currentColor"
                className="text-zinc-200 dark:text-zinc-700 animate-ping opacity-25"
                strokeWidth="0.6"
                style={{ animationDuration: '3.0s' }}
              />
            </g>
          )}

          {/* 2. 좌측 귀 개인화 독립 음파 (L) */}
          <g
            transform={`translate(${108 - leftWaveOffset * 0.4}, 95)`}
            style={{ transition: 'transform 0.15s ease-out' }}
          >
            <path
              d="M -5 -24 A 28 28 0 0 0 -5 24"
              fill="none"
              stroke="#3b82f6"
              strokeWidth={Math.max(1.2, 1.8 * leftAmp)}
              opacity={isPlaying ? 0.95 : 0.4}
              strokeLinecap="round"
            />
            <path
              d="M -15 -34 A 42 42 0 0 0 -15 34"
              fill="none"
              stroke="#60a5fa"
              strokeWidth={Math.max(0.8, 1.2 * leftAmp)}
              opacity={isPlaying ? 0.7 : 0.25}
              strokeLinecap="round"
            />
            <circle
              cx="-22"
              cy="0"
              r={Math.max(2.5, 3.5 * leftAmp)}
              fill="#3b82f6"
              opacity={isPlaying ? 0.95 : 0.4}
            />
          </g>

          {/* 3. 우측 귀 개인화 독립 음파 (R) */}
          <g
            transform={`translate(${212 + rightWaveOffset * 0.4}, 95)`}
            style={{ transition: 'transform 0.15s ease-out' }}
          >
            <path
              d="M 5 -24 A 28 28 0 0 1 5 24"
              fill="none"
              stroke="#3b82f6"
              strokeWidth={Math.max(1.2, 1.8 * rightAmp)}
              opacity={isPlaying ? 0.95 : 0.4}
              strokeLinecap="round"
            />
            <path
              d="M 15 -34 A 42 42 0 0 1 15 34"
              fill="none"
              stroke="#60a5fa"
              strokeWidth={Math.max(0.8, 1.2 * rightAmp)}
              opacity={isPlaying ? 0.7 : 0.25}
              strokeLinecap="round"
            />
            <circle
              cx="22"
              cy="0"
              r={Math.max(2.5, 3.5 * rightAmp)}
              fill="#3b82f6"
              opacity={isPlaying ? 0.95 : 0.4}
            />
          </g>

          {/* 4. 미니멀한 두상 (선 굵기 얇고 명확한 고대비) */}
          <g transform="translate(160, 95)">
            {/* 코 (위쪽 시선) */}
            <path
              d="M -5 -43 Q 0 -56 5 -43 Z"
              className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-500 dark:stroke-zinc-500"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* 두상 외곽선 */}
            <ellipse
              cx="0"
              cy="0"
              rx="47"
              ry="43"
              className="fill-zinc-50 dark:fill-zinc-900 stroke-zinc-600 dark:stroke-zinc-400"
              strokeWidth="1.2"
            />

            {/* 좌측 귀 (L) */}
            <rect
              x="-55"
              y="-11"
              width="8"
              height="22"
              rx="4"
              className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-600 dark:stroke-zinc-400"
              strokeWidth="1.2"
            />
            <text
              x="-68"
              y="4"
              className="fill-zinc-800 dark:fill-zinc-200 font-bold"
              fontSize="10"
              textAnchor="middle"
            >
              L
            </text>

            {/* 우측 귀 (R) */}
            <rect
              x="47"
              y="-11"
              width="8"
              height="22"
              rx="4"
              className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-600 dark:stroke-zinc-400"
              strokeWidth="1.2"
            />
            <text
              x="68"
              y="4"
              className="fill-zinc-800 dark:fill-zinc-200 font-bold"
              fontSize="10"
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
              className="text-zinc-400 dark:text-zinc-600"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />

            {/* 머리 중심 발원 코어 (명확한 색상 톤) */}
            <circle
              cx="0"
              cy="0"
              r={isBalanced ? 10 : 8}
              fill={isBalanced ? '#10b981' : '#3b82f6'}
              opacity={isPlaying ? 0.9 : 0.4}
              className={isPlaying ? 'animate-pulse' : ''}
            />
            <circle cx="0" cy="0" r="2.5" fill="#ffffff" />

            <text
              x="0"
              y="-16"
              className="fill-zinc-500 dark:fill-zinc-400 font-medium"
              fontSize="7.5"
              textAnchor="middle"
              letterSpacing="0.5"
            >
              ▲ 정면
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

        <div className="text-[11px] text-zinc-700 dark:text-zinc-300 truncate max-w-[170px] text-right font-medium">
          {currentBand.description}
        </div>
      </div>
    </div>
  );
};
