import React from 'react';
import { VolumeX, ShieldAlert } from 'lucide-react';

interface PanicButtonProps {
  onPanic: () => void;
  isAudioActive: boolean;
}

export const PanicButton: React.FC<PanicButtonProps> = ({ onPanic, isAudioActive }) => {
  return (
    <button
      onClick={onPanic}
      title="긴급 상황 시 모든 소리를 즉시 차단합니다"
      className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-full font-semibold text-xs tracking-wide shadow-lg transition-all duration-200 border ${
        isAudioActive
          ? 'bg-red-600 hover:bg-red-700 text-white border-red-500 shadow-red-900/50 animate-pulse ring-2 ring-red-400/50'
          : 'bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-800/60'
      }`}
    >
      <ShieldAlert className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
      <span>소리 즉시 끄기</span>
      <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-red-900/80 rounded border border-red-700/60">
        긴급
      </span>
    </button>
  );
};
