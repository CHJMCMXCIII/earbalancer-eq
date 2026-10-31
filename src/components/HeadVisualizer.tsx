import React from 'react';
import { FrequencyBand } from '../data/iso226';
import { Volume2, CheckCircle2, Waves, Radio } from 'lucide-react';

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
  // 좌/우 독립 진폭 배율 (0dB 기준 1.0, -10dB는 0.4, +10dB는 2.0)
  const leftAmp = Math.max(0.3, Math.min(2.2, 1.0 + leftDb / 10));
  const rightAmp = Math.max(0.3, Math.min(2.2, 1.0 + rightDb / 10));

  // 좌/우 밸런스 차이
  const diffDb = Number((rightDb - leftDb).toFixed(1));
  const isBalanced = Math.abs(diffDb) < 0.2;

  // 좌/우 독립 음파 오프셋
  const leftWaveOffset = leftDb * 3; // 픽셀 단위
  const rightWaveOffset = rightDb * 3;

  return (
    <div className="relative flex flex-col items-center justify-between p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden h-full">
      {/* 배경 미세 그리드 */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:14px_14px] opacity-30 pointer-events-none" />

      {/* 상단 밸런스 상태 텍스트 (컴팩트) */}
      <div className="w-full flex items-center justify-between text-xs text-zinc-400 z-10 pb-1">
        <div className="flex items-center gap-1.5 font-medium">
          <Radio className="w-3.5 h-3.5 text-zinc-300" />
          <span className="text-zinc-300">중심 음파 방사 가이드</span>
        </div>

        <div>
          {isBalanced ? (
            <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-zinc-950 px-2.5 py-0.5 rounded-lg border border-emerald-900/60 text-[11px]">
              <CheckCircle2 className="w-3 h-3" /> 양쪽 귀 균형 일치
            </span>
          ) : diffDb < 0 ? (
            <span className="text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-700 text-[11px]">
              왼쪽이 <strong className="text-blue-400">+{Math.abs(diffDb)} dB</strong> 더 큼
            </span>
          ) : (
            <span className="text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-700 text-[11px]">
              오른쪽이 <strong className="text-blue-400">+{diffDb} dB</strong> 더 큼
            </span>
          )}
        </div>
      </div>

      {/* 머리 중심 방사형 음파 일러스트레이션 (SVG) */}
      <div className="relative w-full max-w-[320px] h-44 flex items-center justify-center z-10">
        <svg viewBox="0 0 320 180" className="w-full h-full">
          <defs>
            <radialGradient id="centerCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#93c5fd" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="headMono" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#18181b" />
            </linearGradient>
          </defs>

          {/* 중앙 수직 기준선 */}
          <line
            x1="160"
            y1="10"
            x2="160"
            y2="170"
            stroke="#27272a"
            strokeDasharray="3 3"
            strokeWidth="1.5"
          />

          {/* 1. 머리 중심부에서 퍼져나가는 동심원 음파 (Concentric Expanding Waves) */}
          {isPlaying && (
            <g transform="translate(160, 95)">
              {/* 기본 중심 파동 */}
              <circle
                cx="0"
                cy="0"
                r="18"
                fill="none"
                stroke="#52525b"
                strokeWidth="1.5"
                className="animate-ping opacity-60"
                style={{ animationDuration: '1.2s' }}
              />
              <circle
                cx="0"
                cy="0"
                r="36"
                fill="none"
                stroke="#3f3f46"
                strokeWidth="1.2"
                className="animate-ping opacity-40"
                style={{ animationDuration: '2.0s' }}
              />
              <circle
                cx="0"
                cy="0"
                r="56"
                fill="none"
                stroke="#27272a"
                strokeWidth="1"
                className="animate-ping opacity-20"
                style={{ animationDuration: '2.8s' }}
              />
            </g>
          )}

          {/* 2. 좌측 귀 개인화 독립 음파 (leftDb 반영) */}
          <g
            transform={`translate(${108 - leftWaveOffset * 0.4}, 95)`}
            style={{ transition: 'transform 0.15s ease-out' }}
          >
            {/* 좌측 귀 파동 호 (Arc) */}
            <path
              d="M -5 -25 A 30 30 0 0 0 -5 25"
              fill="none"
              stroke="#60a5fa"
              strokeWidth={Math.max(1.5, 2 * leftAmp)}
              opacity={isPlaying ? 0.9 : 0.4}
              strokeLinecap="round"
            />
            <path
              d="M -15 -35 A 44 44 0 0 0 -15 35"
              fill="none"
              stroke="#3b82f6"
              strokeWidth={Math.max(1, 1.5 * leftAmp)}
              opacity={isPlaying ? 0.6 : 0.2}
              strokeLinecap="round"
            />
            {/* 좌측 파동 포커스 점 */}
            <circle
              cx="-24"
              cy="0"
              r={Math.max(3, 4 * leftAmp)}
              fill="#60a5fa"
              opacity={isPlaying ? 0.9 : 0.4}
            />
          </g>

          {/* 3. 우측 귀 개인화 독립 음파 (rightDb 반영) */}
          <g
            transform={`translate(${212 + rightWaveOffset * 0.4}, 95)`}
            style={{ transition: 'transform 0.15s ease-out' }}
          >
            {/* 우측 귀 파동 호 (Arc) */}
            <path
              d="M 5 -25 A 30 30 0 0 1 5 25"
              fill="none"
              stroke="#60a5fa"
              strokeWidth={Math.max(1.5, 2 * rightAmp)}
              opacity={isPlaying ? 0.9 : 0.4}
              strokeLinecap="round"
            />
            <path
              d="M 15 -35 A 44 44 0 0 1 15 35"
              fill="none"
              stroke="#3b82f6"
              strokeWidth={Math.max(1, 1.5 * rightAmp)}
              opacity={isPlaying ? 0.6 : 0.2}
              strokeLinecap="round"
            />
            {/* 우측 파동 포커스 점 */}
            <circle
              cx="24"
              cy="0"
              r={Math.max(3, 4 * rightAmp)}
              fill="#60a5fa"
              opacity={isPlaying ? 0.9 : 0.4}
            />
          </g>

          {/* 4. 사람 머리 두상 (Top-down Head View - Monochrome) */}
          <g transform="translate(160, 95)">
            {/* 코 (위쪽) */}
            <path
              d="M -6 -42 Q 0 -58 6 -42 Z"
              fill="#3f3f46"
              stroke="#52525b"
              strokeWidth="1.5"
            />
            {/* 두상 본체 */}
            <ellipse
              cx="0"
              cy="0"
              rx="48"
              ry="44"
              fill="url(#headMono)"
              stroke="#52525b"
              strokeWidth="2"
            />

            {/* 좌측 귀 */}
            <rect
              x="-56"
              y="-12"
              width="9"
              height="24"
              rx="4.5"
              fill="#3f3f46"
              stroke="#71717a"
              strokeWidth="1.5"
            />
            <text x="-70" y="4" fill="#a1a1aa" fontSize="10" fontWeight="bold" textAnchor="middle">
              L
            </text>

            {/* 우측 귀 */}
            <rect
              x="47"
              y="-12"
              width="9"
              height="24"
              rx="4.5"
              fill="#3f3f46"
              stroke="#71717a"
              strokeWidth="1.5"
            />
            <text x="70" y="4" fill="#a1a1aa" fontSize="10" fontWeight="bold" textAnchor="middle">
              R
            </text>

            {/* 머리 중심 발원 코어 (Center Core) */}
            <circle
              cx="0"
              cy="0"
              r={isBalanced ? 12 : 9}
              fill={isBalanced ? '#10b981' : '#3b82f6'}
              opacity={isPlaying ? 0.8 : 0.3}
              className={isPlaying ? 'animate-pulse' : ''}
            />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />

            <text x="0" y="-18" fill="#71717a" fontSize="8" textAnchor="middle" letterSpacing="1">
              ▲ 정면 (모니터)
            </text>
          </g>
        </svg>

        {phaseInvert && (
          <div className="absolute bottom-0 bg-purple-950/90 text-purple-200 border border-purple-500/50 text-[10px] font-medium px-2 py-0.5 rounded-full shadow">
            180° 위상 반전 적용됨
          </div>
        )}
      </div>

      {/* 하단 주파수 대역 표시 박스 (주파수 바뀔 때마다 갱신) */}
      <div className="w-full mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500">현재 대역:</span>
          <span className="font-mono font-bold text-sm text-zinc-100 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
            {currentBand.label}
          </span>
          <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">
            ({currentBand.freq} Hz)
          </span>
        </div>

        <div className="text-[11px] text-zinc-400 truncate max-w-[170px] text-right">
          {currentBand.description}
        </div>
      </div>
    </div>
  );
};
