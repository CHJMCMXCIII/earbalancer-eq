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
  Music,
} from 'lucide-react';

interface ABTestPageProps {
  calibrations: { leftDb: number; rightDb: number; phaseInvert: boolean }[];
  customFileName: string | null;
  setCustomFileName: (name: string | null) => void;
  onBackToCalibration: () => void;
  onGoToExport: () => void;
}

export const ABTestPage: React.FC<ABTestPageProps> = ({
  calibrations,
  customFileName,
  setCustomFileName,
  onBackToCalibration,
  onGoToExport,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isBypass, setIsBypass] = useState<boolean>(false);

  // 재생 시간 및 타임라인 상태
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(16);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);

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
      if (!isSeeking) {
        const info = audioEngine.getCurrentPlaybackInfo();
        setCurrentTime(info.currentTime);
        if (info.duration > 0) {
          setDuration(info.duration);
        }
      }
      setIsPlaying(audioEngine.isABPlaying());
      setIsPaused(audioEngine.isABPaused());
      animId = requestAnimationFrame(updateProgress);
    };

    animId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animId);
  }, [isSeeking]);

  // 재생 / 일시정지 / 재개 핸들러
  const handleTogglePlay = async () => {
    if (isPlaying) {
      audioEngine.pauseABTest();
      setIsPlaying(false);
      setIsPaused(true);
    } else if (isPaused) {
      await audioEngine.resumeABTest(bandData);
      setIsPlaying(true);
      setIsPaused(false);
    } else {
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

  // 파일 업로드 (선택된 파일명은 상위 App에 전달되어 탭 전환 시에도 영구 유지)
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

  // 타임라인 재생 구간 조정 (IBM Carbon Design System Motion 적용)
  const calculateTargetSeconds = (clientX: number) => {
    if (!progressBarRef.current || duration <= 0) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (clickX / rect.width) * duration;
  };

  const handleMouseDown = async (e: React.MouseEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    const targetSeconds = calculateTargetSeconds(e.clientX);
    setCurrentTime(targetSeconds);
  };

  const handleSeek = async (e: React.MouseEvent<HTMLDivElement>) => {
    const targetSeconds = calculateTargetSeconds(e.clientX);
    setCurrentTime(targetSeconds);
    await audioEngine.seekABTest(targetSeconds, bandData);
    setIsSeeking(false);
  };

  // 타임라인 마우스 오버 시 초 표시 및 드래그 추적
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const moveX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const sec = (moveX / rect.width) * duration;
    setHoverTime(sec);
    setHoverX(moveX);

    if (isSeeking) {
      setCurrentTime(sec);
    }
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
    if (isSeeking) {
      setIsSeeking(false);
      audioEngine.seekABTest(currentTime, bandData);
    }
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
      {/* 1. 최상단으로 이동한 내비게이션 바 (IBM Carbon Card) */}
      <div className="flex items-center justify-between p-2.5 carbon-card rounded-xl shadow-xs text-xs">
        <button
          onClick={onBackToCalibration}
          className="flex items-center gap-1 px-3 py-1.5 rounded font-semibold bg-[#e8e8e8] hover:bg-[#d0d0d0] dark:bg-[#393939] dark:hover:bg-[#525252] text-[#161616] dark:text-[#f4f4f4] transition-colors duration-150 cursor-pointer text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>다시 세부 조절하기</span>
        </button>

        <span className="text-[11px] text-[#525252] dark:text-[#8d8d8d] font-medium hidden sm:inline">
          🎧 양쪽 귀 감도 보정 전/후 소리를 실시간으로 비교해보세요
        </span>

        <button
          onClick={onGoToExport}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded font-bold bg-[#0f62fe] hover:bg-[#0353e9] text-white transition-all duration-150 shadow-xs cursor-pointer text-xs"
        >
          <span>Equalizer APO에 저장하기</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. 향상된 오디오 플레이어 (파일명 유지, 빠른 반응 재생바, IBM Carbon Motion) */}
      <div className="p-3 carbon-card rounded-xl shadow-xs space-y-2">
        {/* 상단 정보: 좌측 파일명 / 우측 재생·일시정지 컨트롤 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* 좌측: 현재 음원 파일명 및 업로드 버튼 (탭 전환 시에도 유지) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 carbon-subcard px-2.5 py-1 rounded text-[#161616] dark:text-[#f4f4f4] font-medium max-w-[220px] sm:max-w-xs shadow-xs">
              <Music className="w-3.5 h-3.5 text-[#0f62fe] flex-shrink-0" />
              <span className="truncate text-xs font-semibold">
                {customFileName ? customFileName : '기본 내장 앰비언트 코드'}
              </span>
            </div>

            <label className="cursor-pointer px-2.5 py-1 bg-[#e8e8e8] hover:bg-[#d0d0d0] dark:bg-[#393939] dark:hover:bg-[#525252] text-[#161616] dark:text-[#f4f4f4] rounded text-xs font-medium border border-[#e0e0e0] dark:border-[#525252] transition-colors duration-150 flex items-center gap-1 shadow-xs">
              <Upload className="w-3.5 h-3.5 text-[#0f62fe]" />
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
            <span className="font-mono text-[10px] sm:text-[11px] text-[#525252] dark:text-[#8d8d8d]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* 재생 / 일시정지 토글 버튼 */}
            <button
              onClick={handleTogglePlay}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded font-bold text-xs shadow-xs transition-all duration-150 cursor-pointer ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-[#0f62fe] hover:bg-[#0353e9] text-white'
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
                className="p-1.5 rounded bg-[#e8e8e8] hover:bg-[#d0d0d0] dark:bg-[#393939] dark:hover:bg-[#525252] text-[#161616] dark:text-[#f4f4f4] border border-[#e0e0e0] dark:border-[#525252] transition-colors duration-150 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
          </div>
        </div>

        {/* 인터랙티브 타임라인 트랙 (IBM Carbon Motion 100ms cubic-bezier(0.2, 0, 0.38, 0.9) 및 마우스 즉시 반응) */}
        <div
          ref={progressBarRef}
          onMouseDown={handleMouseDown}
          onClick={handleSeek}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full h-2.5 bg-[#e0e0e0] dark:bg-[#393939] rounded-full cursor-pointer overflow-visible group"
        >
          {/* 채워진 진행 바: 드래그/클릭 시 transition-none으로 지연 없이 즉각 추적, 일반 재생 시 100ms Carbon curve 적용 */}
          <div
            className={`h-full bg-[#0f62fe] rounded-full relative ${
              isSeeking ? 'transition-none' : 'transition-[width] duration-100 ease-[cubic-bezier(0.2,0,0.38,0.9)]'
            }`}
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-[#0f62fe] rounded-full shadow-xs scale-0 group-hover:scale-100 transition-transform duration-100" />
          </div>

          {/* 마우스 올렸을 때 나타나는 툴팁 (현재 가리키는 초 표시) */}
          {hoverTime !== null && (
            <div
              className="absolute -top-6 -translate-x-1/2 bg-[#161616] text-[#f4f4f4] dark:bg-[#f4f4f4] dark:text-[#161616] text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow pointer-events-none z-20"
              style={{ left: `${hoverX}px` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>
      </div>

      {/* 3. A / B 핵심 전환 스위치 (무중단 끊김 없는 실시간 전환) */}
      <div className="p-3.5 carbon-card rounded-xl shadow-xs">
        <div className="grid grid-cols-2 gap-3">
          {/* Option A: 보정 전 */}
          <button
            onClick={() => handleToggleBypass(true)}
            className={`flex flex-col items-center justify-center py-3.5 px-3 rounded-lg border transition-all duration-150 cursor-pointer ${
              isBypass
                ? 'bg-[#161616] text-white dark:bg-[#f4f4f4] dark:text-[#161616] font-bold border-[#161616] dark:border-white shadow-md'
                : 'carbon-subcard hover:border-[#8d8d8d]'
            }`}
          >
            <span className="text-[10px] tracking-wider uppercase opacity-75 font-semibold">Option A</span>
            <span className="text-sm sm:text-base font-bold mt-0.5">보정 전 (원본 소리)</span>
            <span className="text-[11px] opacity-75 mt-0.5">양쪽 귀 불균형 상태 그대로</span>
          </button>

          {/* Option B: 보정 후 (라이트/다크 모드 고대비 가독성 최적화) */}
          <button
            onClick={() => handleToggleBypass(false)}
            className={`flex flex-col items-center justify-center py-3.5 px-3 rounded-lg border transition-all duration-150 cursor-pointer ${
              !isBypass
                ? 'bg-[#0f62fe] text-white font-bold border-[#0f62fe] shadow-lg shadow-[#0f62fe]/20'
                : 'carbon-subcard hover:border-[#0f62fe]'
            }`}
          >
            <span
              className={`text-[10px] tracking-wider uppercase font-semibold ${
                !isBypass ? 'text-white/90' : 'text-[#0f62fe] dark:text-[#78a9ff]'
              }`}
            >
              Option B (추천)
            </span>
            <span
              className={`text-sm sm:text-base font-bold mt-0.5 flex items-center gap-1.5 ${
                !isBypass ? 'text-white' : 'text-[#161616] dark:text-[#f4f4f4]'
              }`}
            >
              <span>내 귀 맞춤 소리</span>
              <CheckCircle
                className={`w-3.5 h-3.5 ${
                  !isBypass ? 'text-emerald-300' : 'text-[#198038] dark:text-[#42be65]'
                }`}
              />
            </span>
            <span
              className={`text-[11px] mt-0.5 font-medium ${
                !isBypass ? 'text-blue-100' : 'text-[#525252] dark:text-[#c6c6c6]'
              }`}
            >
              좌/우 귀 감도 차이 보정 적용됨
            </span>
          </button>
        </div>
      </div>

      {/* 4. 31밴드 좌/우 보정 곡선 미리보기 그래프 (인터랙티브 Legend 클릭 시 강조 및 투명도 조절) */}
      <div className="p-3 carbon-card rounded-xl shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-xs text-[#161616] dark:text-[#f4f4f4]">
            내 청각 캘리브레이션 주파수 곡선
          </span>

          {/* 클릭 가능한 범례(Legend) 버튼 그룹 */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] text-[#525252] dark:text-[#8d8d8d] mr-1 hidden sm:inline">채널 선택:</span>
            
            {/* 전체 보기 */}
            <button
              onClick={() => setActiveLegend('all')}
              className={`px-2 py-0.5 rounded font-semibold text-[11px] transition-all duration-150 border cursor-pointer ${
                activeLegend === 'all'
                  ? 'bg-[#161616] text-white dark:bg-[#f4f4f4] dark:text-[#161616] border-[#161616] dark:border-white shadow-xs'
                  : 'bg-[#e8e8e8] dark:bg-[#393939] text-[#525252] dark:text-[#c6c6c6] border-transparent hover:border-[#8d8d8d]'
              }`}
            >
              전체 보기
            </button>

            {/* 왼쪽 귀 L 버튼 */}
            <button
              onClick={() => setActiveLegend((prev) => (prev === 'left' ? 'all' : 'left'))}
              className={`flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-[11px] transition-all duration-150 border cursor-pointer ${
                activeLegend === 'left'
                  ? 'bg-[#edf5ff] dark:bg-[#002d9c]/60 text-[#0f62fe] dark:text-[#78a9ff] border-[#0f62fe] shadow-xs'
                  : 'bg-[#e8e8e8] dark:bg-[#393939] text-[#525252] dark:text-[#c6c6c6] border-transparent hover:border-[#8d8d8d]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#0f62fe] inline-block" />
              <span>L (왼쪽 귀)</span>
            </button>

            {/* 오른쪽 귀 R 버튼 */}
            <button
              onClick={() => setActiveLegend((prev) => (prev === 'right' ? 'all' : 'right'))}
              className={`flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-[11px] transition-all duration-150 border cursor-pointer ${
                activeLegend === 'right'
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border-purple-400 shadow-xs'
                  : 'bg-[#e8e8e8] dark:bg-[#393939] text-[#525252] dark:text-[#c6c6c6] border-transparent hover:border-[#8d8d8d]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
              <span>R (오른쪽 귀)</span>
            </button>
          </div>
        </div>

        {/* SVG 주파수 곡선 뷰어 */}
        <div className="carbon-subcard rounded-lg p-2">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-24">
            <line
              x1="0"
              y1={zeroY}
              x2={svgWidth}
              y2={zeroY}
              stroke="currentColor"
              className="text-[#d0d0d0] dark:text-[#525252]"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
            <text x="6" y={zeroY - 3} fill="currentColor" className="text-[#8d8d8d] text-[10px] font-mono font-medium" fontSize="10">
              0 dB
            </text>

            {/* 왼쪽 귀 커브 (L) */}
            <polyline
              fill="none"
              stroke="#0f62fe"
              strokeWidth={leftStrokeWidth}
              opacity={leftOpacity}
              points={leftPoints}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: 'opacity 0.15s ease, stroke-width 0.15s ease' }}
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
              style={{ transition: 'opacity 0.15s ease, stroke-width 0.15s ease' }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
