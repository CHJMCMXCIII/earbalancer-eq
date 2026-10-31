import React, { useState, useEffect } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { FREQUENCY_BANDS } from '../data/iso226';
import {
  Play,
  Square,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Headphones,
  Music,
  Scale,
} from 'lucide-react';

interface ABTestPageProps {
  calibrations: { leftDb: number; rightDb: number; phaseInvert: boolean }[];
  onBackToCalibration: () => void;
  onGoToExport: () => void;
}

export const ABTestPage: React.FC<ABTestPageProps> = ({
  calibrations,
  onBackToCalibration,
  onGoToExport,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBypass, setIsBypass] = useState<boolean>(false);
  const [customFileName, setCustomFileName] = useState<string | null>(null);

  const bandData = FREQUENCY_BANDS.map((b, i) => ({
    freq: b.freq,
    leftDb: calibrations[i]?.leftDb || 0,
    rightDb: calibrations[i]?.rightDb || 0,
  }));

  const handleTogglePlay = async () => {
    if (isPlaying) {
      audioEngine.stopABTest();
      setIsPlaying(false);
    } else {
      await audioEngine.startABTest(bandData, isBypass);
      setIsPlaying(true);
    }
  };

  const handleToggleBypass = (bypass: boolean) => {
    setIsBypass(bypass);
    if (isPlaying) {
      audioEngine.toggleABBypass(bypass, bandData);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFileName(file.name);
      await audioEngine.loadAudioFile(file);
      if (isPlaying) {
        audioEngine.stopABTest();
        await audioEngine.startABTest(bandData, isBypass);
      }
    }
  };

  useEffect(() => {
    return () => {
      audioEngine.stopABTest();
    };
  }, []);

  const svgWidth = 560;
  const svgHeight = 110;
  const zeroY = svgHeight / 2;
  const dbScale = 4;

  const leftPoints = bandData
    .map((b, i) => {
      const x = (i / (bandData.length - 1)) * (svgWidth - 30) + 15;
      const y = zeroY - b.leftDb * dbScale;
      return `${x},${Math.max(8, Math.min(svgHeight - 8, y))}`;
    })
    .join(' ');

  const rightPoints = bandData
    .map((b, i) => {
      const x = (i / (bandData.length - 1)) * (svgWidth - 30) + 15;
      const y = zeroY - b.rightDb * dbScale;
      return `${x},${Math.max(8, Math.min(svgHeight - 8, y))}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col justify-between h-full space-y-3">
      {/* 상단 비교 컨트롤 바 */}
      <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-zinc-300" />
          <span className="font-semibold text-zinc-200">
            보정 전(원본) vs 보정 후(내 귀 맞춤) 청음 비교
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-xs shadow transition-all ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>음악 멈추기</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>비교 음악 재생</span>
              </>
            )}
          </button>

          <label className="cursor-pointer px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition-colors flex items-center gap-1">
            <Upload className="w-3 h-3" />
            <span className="max-w-[120px] truncate">
              {customFileName ? customFileName : '내 음악 열기'}
            </span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* A / B 핵심 전환 스위치 (흑백 모노크롬 카드에 선택 항목만 하이라이트) */}
      <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Option A: 보정 전 */}
          <button
            onClick={() => handleToggleBypass(true)}
            className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl border transition-all ${
              isBypass
                ? 'bg-zinc-100 text-zinc-950 font-bold border-white shadow-lg'
                : 'bg-zinc-950/70 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <span className="text-[10px] tracking-wider uppercase opacity-70">Option A</span>
            <span className="text-base font-bold mt-0.5">보정 전 (원본 소리)</span>
            <span className="text-[11px] opacity-75 mt-0.5">양쪽 귀 불균형 상태 그대로</span>
          </button>

          {/* Option B: 보정 후 */}
          <button
            onClick={() => handleToggleBypass(false)}
            className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl border transition-all ${
              !isBypass
                ? 'bg-blue-600 text-white font-bold border-blue-400 shadow-lg shadow-blue-900/40'
                : 'bg-zinc-950/70 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <span className="text-[10px] tracking-wider uppercase text-blue-200">Option B (추천)</span>
            <span className="text-base font-bold mt-0.5 flex items-center gap-1.5">
              <span>내 귀 맞춤 소리</span>
              <CheckCircle className="w-4 h-4 text-emerald-300" />
            </span>
            <span className="text-[11px] text-blue-100 mt-0.5">좌/우 귀 감도 차이 보정 적용됨</span>
          </button>
        </div>

        {/* 체감 음량 게인 매칭 배너 */}
        <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-zinc-300" />
            <span>체감 음량 자동 매칭 (볼륨 차이로 인한 착시 제거)</span>
          </div>
          <span className="text-emerald-400 text-[11px] font-semibold">자동 연동 활성</span>
        </div>
      </div>

      {/* 31밴드 좌/우 보정 곡선 미리보기 그래프 (컴팩트) */}
      <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-300">내 청각 캘리브레이션 주파수 곡선</span>
          <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-blue-400 inline-block rounded" /> L (왼쪽 귀)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-purple-400 inline-block rounded" /> R (오른쪽 귀)
            </span>
          </div>
        </div>

        <div className="bg-zinc-950 rounded-lg p-2 border border-zinc-800">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-24">
            <line
              x1="0"
              y1={zeroY}
              x2={svgWidth}
              y2={zeroY}
              stroke="#3f3f46"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
            <text x="4" y={zeroY - 3} fill="#71717a" fontSize="9">
              0 dB
            </text>
            <polyline
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2"
              points={leftPoints}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              fill="none"
              stroke="#c084fc"
              strokeWidth="2"
              points={rightPoints}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between p-2 bg-zinc-900/90 rounded-xl border border-zinc-800 text-xs">
        <button
          onClick={onBackToCalibration}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>다시 세부 조절하기</span>
        </button>

        <button
          onClick={onGoToExport}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow"
        >
          <span>Equalizer APO에 저장하기</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
