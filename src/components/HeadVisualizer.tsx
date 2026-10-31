import React from 'react';
import { Volume2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HeadVisualizerProps {
  leftDb: number;
  rightDb: number;
  phaseInvert: boolean;
  isPlaying: boolean;
  freqLabel: string;
}

export const HeadVisualizer: React.FC<HeadVisualizerProps> = ({
  leftDb,
  rightDb,
  phaseInvert,
  isPlaying,
  freqLabel,
}) => {
  // dB 차이를 -100% ~ +100% 수평 오프셋으로 환산 (차이가 0이면 0%)
  // diff > 0 -> 오른쪽이 큼, diff < 0 -> 왼쪽이 큼
  const diffDb = rightDb - leftDb;
  // 최대 6dB 차이를 양 끝(100%)으로 매핑
  const clampedRatio = Math.max(-1, Math.min(1, diffDb / 6));
  const orbTranslateX = clampedRatio * 90; // SVG viewBox 내 픽셀 단위

  const isBalanced = Math.abs(diffDb) < 0.2;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* 배경 은은한 그리드 & 가이드라인 */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      {/* 상태 헤더 */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 z-10">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping inline-block" />
          <span>현재 테스트 음높이:</span>
          <span className="text-blue-400 font-bold text-sm bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
            {freqLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isBalanced ? (
            <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              <CheckCircle2 className="w-3.5 h-3.5" /> 정중앙 (완벽한 균형)
            </span>
          ) : diffDb < 0 ? (
            <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
              <ArrowLeft className="w-3.5 h-3.5" /> 왼쪽으로 {Math.abs(diffDb).toFixed(1)} dB 치우침
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
              오른쪽으로 {Math.abs(diffDb).toFixed(1)} dB 치우침 <ArrowRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>

      {/* 머리 및 사운드 위치 일러스트레이션 (SVG) */}
      <div className="relative w-full max-w-[340px] h-52 flex items-center justify-center my-1 z-10">
        <svg viewBox="0 0 340 200" className="w-full h-full">
          <defs>
            {/* 사운드 방울 글로우 효과 필터 */}
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="headGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <radialGradient id="soundOrbGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="60%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </radialGradient>
            <radialGradient id="soundOrbBalanced" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="60%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </radialGradient>
          </defs>

          {/* 중앙 수직 기준 점선 */}
          <line
            x1="170"
            y1="20"
            x2="170"
            y2="180"
            stroke="#475569"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />

          {/* 좌/우 음파 애니메이션 (재생 중일 때) */}
          {isPlaying && (
            <>
              {/* 왼쪽 귀 음파 */}
              <circle
                cx="110"
                cy="105"
                r="22"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                className="animate-ping opacity-60"
                style={{ animationDuration: '1.4s' }}
              />
              <circle
                cx="110"
                cy="105"
                r="36"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                className="animate-ping opacity-30"
                style={{ animationDuration: '2s' }}
              />

              {/* 오른쪽 귀 음파 */}
              <circle
                cx="230"
                cy="105"
                r="22"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                className="animate-ping opacity-60"
                style={{ animationDuration: '1.4s' }}
              />
              <circle
                cx="230"
                cy="105"
                r="36"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                className="animate-ping opacity-30"
                style={{ animationDuration: '2s' }}
              />
            </>
          )}

          {/* 머리 위에서 본 형상 (Top-down Head View) */}
          <g transform="translate(170, 105)">
            {/* 코 (위쪽을 향함) */}
            <path
              d="M -7 -45 Q 0 -62 7 -45 Z"
              fill="#475569"
              stroke="#64748b"
              strokeWidth="2"
            />
            {/* 두상 (타원형) */}
            <ellipse
              cx="0"
              cy="0"
              rx="52"
              ry="48"
              fill="url(#headGrad)"
              stroke="#64748b"
              strokeWidth="2.5"
            />
            {/* 왼쪽 귀 */}
            <rect
              x="-60"
              y="-12"
              width="10"
              height="24"
              rx="5"
              fill="#475569"
              stroke="#64748b"
              strokeWidth="2"
            />
            <text x="-76" y="4" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
              L (좌)
            </text>

            {/* 오른쪽 귀 */}
            <rect
              x="50"
              y="-12"
              width="10"
              height="24"
              rx="5"
              fill="#475569"
              stroke="#64748b"
              strokeWidth="2"
            />
            <text x="76" y="4" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
              R (우)
            </text>

            {/* 눈/시선 방향 안내 라벨 */}
            <text x="0" y="-20" fill="#64748b" fontSize="9" textAnchor="middle" letterSpacing="1">
              ▲ 앞방향 (모니터)
            </text>

            {/* 정중앙 타겟 마커 */}
            <circle cx="0" cy="0" r="10" fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="2 2" />
            <circle cx="0" cy="0" r="3" fill="#64748b" />
          </g>

          {/* 소리 중심 위치 표시 구체 (Sound Orb) - 수평 위치가 실시간 이동 */}
          <g
            style={{
              transform: `translate(${170 + orbTranslateX}px, 105px)`,
              transition: 'transform 0.12s cubic-bezier(0.2, 0.8, 0.4, 1)',
            }}
          >
            {/* 소리 방울 후광 효과 */}
            <circle
              cx="0"
              cy="0"
              r="20"
              fill={isBalanced ? '#10b981' : '#3b82f6'}
              opacity="0.35"
              className={isPlaying ? 'animate-pulse' : ''}
              filter="url(#glow)"
            />
            {/* 소리 방울 본체 */}
            <circle
              cx="0"
              cy="0"
              r="12"
              fill={isBalanced ? 'url(#soundOrbBalanced)' : 'url(#soundOrbGrad)'}
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* 중앙 포인트 */}
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>
        </svg>

        {/* 위상 반전 배지 알림 */}
        {phaseInvert && (
          <div className="absolute bottom-1 bg-purple-950/90 text-purple-200 border border-purple-500/60 text-[11px] font-medium px-2.5 py-0.5 rounded-full shadow-md backdrop-blur-sm">
            ⚡ 180° 위상 반전 활성화됨 (소리 뭉침 방지)
          </div>
        )}
      </div>

      {/* 사용자 직관 안내 텍스트 */}
      <div className="mt-1 text-center text-xs text-slate-300 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 max-w-sm">
        💡 <strong className="text-blue-300">목표:</strong> 소리가 내 머리의 <strong>정중앙 한가운데</strong>에서 똑바로 들리도록 아래 슬라이더를 부드럽게 움직여 맞추세요.
      </div>
    </div>
  );
};
