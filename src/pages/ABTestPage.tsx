import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { FREQUENCY_BANDS } from '../data/iso226';
import {
  Play,
  Pause,
  Square,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Headphones,
  Music,
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
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isBypass, setIsBypass] = useState<boolean>(false);
  const [customFileName, setCustomFileName] = useState<string | null>(null);

  // 재생 시간 및 타임라인 상태
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(16);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);

  // 주파수 곡선 범례(Legend) 클릭 선택 상태 ('all' | 'left' | 'right')
  const [activeLegend, setActiveLegend] = useState<'all' | 'left' | 'right'>('all');

  const progressBarRef = useRef<HTMLDivElement>(null);

  const bandData = FREQUENCY_BANDS.map((b, i) => ({
    freq: b.freq,
    leftDb: calibrations[i]?.leftDb || 0,
    rightDb: calibrations[i]?.rightDb || 0,
  }));

  // 재생 시간 실시간 업데이트 타이머
  useEffect(() => {
    let animId: number;
    const updateProgress = () => {
      const info = audioEngine.getCurrentPlaybackInfo();
      setCurrentTime(info.currentTime);
      if (info.duration > 0) {
        setDuration(info.duration);
      }
      setIsPlaying(audioEngine.isABPlaying());
      setIsPaused(audioEngine.isABPaused());
      animId = requestAnimationFrame(updateProgress);
    };

    animId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animId);
  }, []);

  // 재생 / 일시정지 / 재개 핸들러
  const handleTogglePlay = async () => {
    if (isPlaying) {
      // 재생 중이면 일시정지
      audioEngine.pauseABTest();
      setIsPlaying(false);
      setIsPaused(true);
    } else if (isPaused) {
      // 일시정지 상태이면 이어서 재생
      await audioEngine.resumeABTest(bandData);
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      // 완전 정지 상태이면 처음부터 재생
      await audioEngine.startABTest(bandData, isBypass, 0);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    audioEngine.stopABTest();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
  };

  // 무중단 A/B 전환
  const handleToggleBypass = (bypass: boolean) => {
    setIsBypass(bypass);
    audioEngine.toggleABBypass(bypass, bandData);
  };

  // 파일 업로드
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFileName(file.name);
      const decoded = await audioEngine.loadAudioFile(file);
      setDuration(decoded.duration);
      setCurrentTime(0);
      if (isPlaying) {
        await audioEngine.startABTest(bandData, isBypass, 0);
      }
    }
  };

  // 타임라인 클릭으로 재생 구간 이동 (Seek)
  const handleSeek = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const targetSeconds = (clickX / rect.width) * duration;
    setCurrentTime(targetSeconds);
    await audioEngine.seekABTest(targetSeconds, bandData);
  };

  // 타임라인 마우스 오버 시 초 표시
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const moveX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const sec = (moveX / rect.width) * duration;
    setHoverTime(sec);
    setHoverX(moveX);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const leftOpacity = activeLegend === 'left' ? 1.0 : activeLegend === 'all' ? 0.95 : 0.15;
  const leftStrokeWidth = activeLegend === 'left' ? 3.5 : 2;

  const rightOpacity = activeLegend === 'right' ? 1.0 : activeLegend === 'all' ? 0.95 : 0.15;
  const rightStrokeWidth = activeLegend === 'right' ? 3.5 : 2;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col justify-start items-stretch gap-3 w-full">
      {/* 1. 최상단으로 이동한 내비게이션 바 */}
      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs transition-colors">
        <button
          onClick={onBackToCalibration}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>다시 세부 조절하기</span>
        </button>

        <span className="text-[11px] text-zinc-500 font-medium hidden sm:inline">
          🎧 양쪽 귀 감도 보정 전/후 소리를 실시간으로 비교해보세요
        </span>

        <button
          onClick={onGoToExport}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow cursor-pointer"
        >
          <span>Equalizer APO에 저장하기</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. 향상된 오디오 플레이어 (파일명 표기, 재생/일시정지/정지, 마우스 탐색 타임라인) */}
      <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2.5 transition-colors">
        {/* 상단 정보: 좌측 파일명 / 우측 재생·일시정지 컨트롤 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* 좌측: 현재 음원 파일명 및 업로드 버튼 */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium max-w-[220px] sm:max-w-xs">
              <Music className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="truncate text-xs font-semibold">
                {customFileName ? customFileName : '기본 내장 앰비언트 코드'}
              </span>
            </div>

            <label className="cursor-pointer px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-1">
              <Upload className="w-3 h-3 text-blue-500" />
              <span>내 음악 열기</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* 우측: 재생 / 일시정지 / 정지 버튼 및 시간 표시 */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* 재생 / 일시정지 토글 버튼 */}
            <button
              onClick={handleTogglePlay}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-xs shadow transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : isPaused
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>일시정지</span>
                </>
              ) : isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>이어서 재생</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>음악 재생</span>
                </>
              )}
            </button>

            {/* 정지(Stop) 버튼 */}
            {(isPlaying || isPaused) && (
              <button
                onClick={handleStop}
                title="처음으로 되돌리기"
                className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
          </div>
        </div>

        {/* 인터랙티브 타임라인 트랙 (마우스로 구간 조정 및 마우스 오버 시 초 표시) */}
        <div
          ref={progressBarRef}
          onClick={handleSeek}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full cursor-pointer overflow-visible group"
        >
          {/* 채워진 진행 바 */}
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-75 relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-blue-600 rounded-full shadow-sm scale-0 group-hover:scale-100 transition-transform" />
          </div>

          {/* 마우스 올렸을 때 나타나는 툴팁 (현재 가리키는 초 표시) */}
          {hoverTime !== null && (
            <div
              className="absolute -top-7 -translate-x-1/2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow pointer-events-none z-20"
              style={{ left: `${hoverX}px` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>
      </div>

      {/* 3. A / B 핵심 전환 스위치 (무중단 끊김 없는 실시간 전환) */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl transition-colors">
        <div className="grid grid-cols-2 gap-3">
          {/* Option A: 보정 전 */}
          <button
            onClick={() => handleToggleBypass(true)}
            className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl border transition-all cursor-pointer ${
              isBypass
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold border-zinc-900 dark:border-white shadow-md'
                : 'bg-zinc-50 dark:bg-zinc-950/70 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <span className="text-[10px] tracking-wider uppercase opacity-70">Option A</span>
            <span className="text-base font-bold mt-0.5">보정 전 (원본 소리)</span>
            <span className="text-[11px] opacity-75 mt-0.5">양쪽 귀 불균형 상태 그대로</span>
          </button>

          {/* Option B: 보정 후 */}
          <button
            onClick={() => handleToggleBypass(false)}
            className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl border transition-all cursor-pointer ${
              !isBypass
                ? 'bg-blue-600 text-white font-bold border-blue-400 shadow-lg shadow-blue-900/40'
                : 'bg-zinc-50 dark:bg-zinc-950/70 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
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
      </div>

      {/* 4. 31밴드 좌/우 보정 곡선 미리보기 그래프 (인터랙티브 Legend 클릭 시 강조 및 투명도 조절) */}
      <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            내 청각 캘리브레이션 주파수 곡선
          </span>

          {/* 클릭 가능한 범례(Legend) 버튼 그룹 */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] text-zinc-500 mr-1 hidden sm:inline">채널 선택:</span>
            
            {/* 전체 보기 */}
            <button
              onClick={() => setActiveLegend('all')}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition-all border cursor-pointer ${
                activeLegend === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              전체 보기
            </button>

            {/* 왼쪽 귀 L 버튼 */}
            <button
              onClick={() => setActiveLegend((prev) => (prev === 'left' ? 'all' : 'left'))}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold text-[11px] transition-all border cursor-pointer ${
                activeLegend === 'left'
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border-blue-400 shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              <span>L (왼쪽 귀)</span>
            </button>

            {/* 오른쪽 귀 R 버튼 */}
            <button
              onClick={() => setActiveLegend((prev) => (prev === 'right' ? 'all' : 'right'))}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold text-[11px] transition-all border cursor-pointer ${
                activeLegend === 'right'
                  ? 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 border-purple-400 shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
              <span>R (오른쪽 귀)</span>
            </button>
          </div>
        </div>

        {/* SVG 주파수 곡선 뷰어 */}
        <div className="bg-zinc-50 dark:bg-zinc-950 rounded-lg p-2 border border-zinc-200 dark:border-zinc-800 transition-colors">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-24">
            <line
              x1="0"
              y1={zeroY}
              x2={svgWidth}
              y2={zeroY}
              stroke="currentColor"
              className="text-zinc-300 dark:text-zinc-700"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
            <text x="4" y={zeroY - 3} fill="currentColor" className="text-zinc-400 dark:text-zinc-500" fontSize="9">
              0 dB
            </text>

            {/* 왼쪽 귀 커브 (L) */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth={leftStrokeWidth}
              opacity={leftOpacity}
              points={leftPoints}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: 'opacity 0.2s ease, stroke-width 0.2s ease' }}
            />

            {/* 오른쪽 귀 커브 (R) */}
            <polyline
              fill="none"
              stroke="#a855f7"
              strokeWidth={rightStrokeWidth}
              opacity={rightOpacity}
              points={rightPoints}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: 'opacity 0.2s ease, stroke-width 0.2s ease' }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
