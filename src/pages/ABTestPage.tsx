import React, { useState, useEffect } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { FREQUENCY_BANDS } from '../data/iso226';
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  Upload,
  ArrowRight,
  ArrowLeft,
  Sliders,
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
  const [isBypass, setIsBypass] = useState<boolean>(false); // false = 보정 후(EQ 적용), true = 보정 전(원본)
  const [gainMatchEnabled, setGainMatchEnabled] = useState<boolean>(true);
  const [customFileName, setCustomFileName] = useState<string | null>(null);

  // 31밴드 데이터 조합
  const bandData = FREQUENCY_BANDS.map((b, i) => ({
    freq: b.freq,
    leftDb: calibrations[i]?.leftDb || 0,
    rightDb: calibrations[i]?.rightDb || 0,
  }));

  // A/B 테스트 재생 토글
  const handleTogglePlay = async () => {
    if (isPlaying) {
      audioEngine.stopABTest();
      setIsPlaying(false);
    } else {
      await audioEngine.startABTest(bandData, isBypass);
      setIsPlaying(true);
    }
  };

  // 보정 전 / 보정 후 스위치 전환
  const handleToggleBypass = (bypass: boolean) => {
    setIsBypass(bypass);
    if (isPlaying) {
      audioEngine.toggleABBypass(bypass, bandData);
    }
  };

  // 사용자 지정 오디오 파일 업로드
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

  // 보정 커브 SVG 패스 계산
  const svgWidth = 560;
  const svgHeight = 160;
  const zeroY = svgHeight / 2;
  const dbScale = 5; // 1 dB당 5픽셀

  const leftPoints = bandData.map((b, i) => {
    const x = (i / (bandData.length - 1)) * (svgWidth - 40) + 20;
    const y = zeroY - b.leftDb * dbScale;
    return `${x},${Math.max(10, Math.min(svgHeight - 10, y))}`;
  }).join(' ');

  const rightPoints = bandData.map((b, i) => {
    const x = (i / (bandData.length - 1)) * (svgWidth - 40) + 20;
    const y = zeroY - b.rightDb * dbScale;
    return `${x},${Math.max(10, Math.min(svgHeight - 10, y))}`;
  }).join(' ');

  return (
    <div className="space-y-6">
      {/* 타이틀 및 안내 */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
          <Headphones className="w-5 h-5 text-blue-400" />
          <span>보정 전 소리 vs 보정 후 소리 비교해보기 (A/B 테스트)</span>
        </h2>
        <p className="text-xs text-slate-400">
          내 귀에 맞춘 캘리브레이션 전후를 버튼 한 번으로 즉시 비교 청취할 수 있습니다.
        </p>
      </div>

      {/* 대형 A/B 비교 스위칭 컨트롤러 */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all duration-200 ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40 hover:scale-102'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>비교 음악 멈추기</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>비교 음악 재생하기</span>
              </>
            )}
          </button>

          {/* 오디오 소스 선택 */}
          <div className="flex items-center gap-2 text-xs bg-slate-950 p-2 rounded-xl border border-slate-800">
            <Music className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 max-w-[160px] truncate">
              {customFileName ? customFileName : '기본 내장 앰비언트 코드'}
            </span>
            <label className="cursor-pointer px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1">
              <Upload className="w-3 h-3" />
              <span>내 음악 파일 열기</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 핵심 비교 전환 스위치 토글 (A vs B) */}
        <div className="max-w-md mx-auto p-1.5 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-2 gap-2 shadow-inner">
          <button
            onClick={() => handleToggleBypass(true)}
            className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl transition-all ${
              isBypass
                ? 'bg-slate-800 text-white shadow-lg border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Option A</span>
            <span className="text-base font-bold mt-0.5">보정 전 (원본 소리)</span>
            <span className="text-[11px] text-slate-500 mt-1">균형 맞추기 전 평소 소리</span>
          </button>

          <button
            onClick={() => handleToggleBypass(false)}
            className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl transition-all ${
              !isBypass
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/40 border border-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">Option B (추천)</span>
            <span className="text-base font-bold mt-0.5 flex items-center gap-1.5">
              <span>내 귀 맞춤 소리</span>
              <CheckCircle className="w-4 h-4 text-emerald-300" />
            </span>
            <span className="text-[11px] text-blue-200 mt-1">양쪽 균형 보정 적용</span>
          </button>
        </div>

        {/* 체감 음량 자동 맞춤 (Gain Matching) 설명 토글 */}
        <div className="max-w-md mx-auto p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Scale className="w-4 h-4 text-blue-400" />
            <span>체감 음량 자동 맞춤 (소리가 커서 더 좋게 들리는 착각 방지)</span>
          </div>
          <span className="text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 text-[11px]">
            기본 활성화됨
          </span>
        </div>
      </div>

      {/* 31밴드 좌/우 보정 곡선 미리보기 그래프 */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">내 청각 캘리브레이션 주파수 곡선</span>
          <div className="flex items-center gap-4 text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-blue-400 inline-block rounded" /> 왼쪽 귀 (L)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-purple-400 inline-block rounded" /> 오른쪽 귀 (R)
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-950 rounded-xl p-3 border border-slate-800 overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-36">
            {/* 기준 0 dB 선 */}
            <line
              x1="0"
              y1={zeroY}
              x2={svgWidth}
              y2={zeroY}
              stroke="#334155"
              strokeDasharray="3 3"
              strokeWidth="1.5"
            />
            <text x="5" y={zeroY - 4} fill="#64748b" fontSize="10">0 dB</text>
            <text x="5" y={22} fill="#64748b" fontSize="9">+10 dB</text>
            <text x="5" y={svgHeight - 8} fill="#64748b" fontSize="9">-10 dB</text>

            {/* 왼쪽 귀 커브 (Blue) */}
            <polyline
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2.5"
              points={leftPoints}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 오른쪽 귀 커브 (Purple) */}
            <polyline
              fill="none"
              stroke="#c084fc"
              strokeWidth="2.5"
              points={rightPoints}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* 주파수 축 레이블 */}
          <div className="flex justify-between text-[10px] text-slate-500 px-2 mt-1">
            <span>20 Hz (극저음)</span>
            <span>250 Hz</span>
            <span>1 kHz (중음)</span>
            <span>4 kHz</span>
            <span>20 kHz (극고음)</span>
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 버튼 */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBackToCalibration}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>다시 세부 조절하기</span>
        </button>

        <button
          onClick={onGoToExport}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-900/40 hover:scale-102"
        >
          <span>Equalizer APO에 저장하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
