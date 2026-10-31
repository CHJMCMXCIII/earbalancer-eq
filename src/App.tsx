import React, { useState, useEffect } from 'react';
import { audioEngine } from './audio/AudioEngine';
import { getDefaultBands, BandState } from './store/calibrationStore';
import { GuidePage } from './pages/GuidePage';
import { WizardCalibration } from './pages/WizardCalibration';
import { ABTestPage } from './pages/ABTestPage';
import { ExportAPOPage } from './pages/ExportAPOPage';
import {
  SlidersHorizontal,
  Volume2,
  Headphones,
  Sparkles,
  FolderOutput,
  Sun,
  Moon,
  BookOpen,
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'guide' | 'calibrate' | 'abtest' | 'export'>('calibrate');
  const [mode, setMode] = useState<'10-band' | '31-band'>('10-band');
  const [calibrations, setCalibrations] = useState<BandState[]>(() => getDefaultBands());
  const [masterVolume, setMasterVolume] = useState<number>(0.5);

  // 라이트/다크 모드 상태 (기본 다크 모드, LocalStorage 연동)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('earbalancer_theme');
      if (saved) return saved === 'dark';
      return true; // 기본 다크 모드
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDarkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
      localStorage.setItem('earbalancer_theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      localStorage.setItem('earbalancer_theme', 'light');
    }
  }, [isDarkMode]);

  const handleVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    audioEngine.setMasterVolume(vol);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-start select-none font-sans transition-colors duration-200 ${
        isDarkMode
          ? 'dark acoustic-pattern-dark text-zinc-100'
          : 'acoustic-pattern-light text-zinc-900'
      }`}
    >
      {/* 1. 상단 글로벌 헤더 */}
      <header className="flex-shrink-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-2 shadow-xs z-30 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* 로고 & 타이틀 */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-bold shadow-xs">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">
                  EarBalancer EQ
                </h1>
                <span className="px-1.5 py-0.2 text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded font-semibold border border-zinc-300 dark:border-zinc-700">
                  양쪽 청각 보정
                </span>
              </div>
            </div>
          </div>

          {/* 중앙 단계 네비게이션 탭 (소개/가이드 포함) */}
          <nav className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs transition-colors">
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-white dark:bg-zinc-100 text-zinc-950 shadow-sm font-bold'
                  : 'text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>소개/가이드</span>
            </button>

            <button
              onClick={() => setActiveTab('calibrate')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'calibrate'
                  ? 'bg-white dark:bg-zinc-100 text-zinc-950 shadow-sm font-bold'
                  : 'text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>1. 소리 맞춤</span>
            </button>

            <button
              onClick={() => setActiveTab('abtest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'abtest'
                  ? 'bg-white dark:bg-zinc-100 text-zinc-950 shadow-sm font-bold'
                  : 'text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>2. 전/후 비교</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-white dark:bg-zinc-100 text-zinc-950 shadow-sm font-bold'
                  : 'text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <FolderOutput className="w-3.5 h-3.5 text-emerald-500" />
              <span>3. APO 저장</span>
            </button>
          </nav>

          {/* 우측 볼륨 & 좌우 스위치 토글 방식의 라이트/다크 모드 */}
          <div className="flex items-center gap-2.5">
            {/* 좌우 스위치 토글 버튼 (Sliding Pill Switch Toggle) */}
            <div className="flex items-center p-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full border border-zinc-300 dark:border-zinc-700 relative text-[11px] font-semibold select-none shadow-xs">
              <button
                onClick={() => setIsDarkMode(false)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  !isDarkMode
                    ? 'bg-white text-zinc-950 shadow-sm font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                title="밝고 선명한 라이트 모드"
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>라이트</span>
              </button>

              <button
                onClick={() => setIsDarkMode(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  isDarkMode
                    ? 'bg-zinc-900 text-white shadow-sm font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                title="눈이 편안한 다크 모드"
              >
                <Moon className="w-3 h-3 text-zinc-300" />
                <span>다크</span>
              </button>
            </div>

            {/* 마스터 볼륨 슬라이더 */}
            <div className="flex items-center gap-2 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs transition-colors">
              <Volume2 className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={masterVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 h-1.5 bg-zinc-300 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                title="앱 마스터 볼륨"
              />
              <span className="font-mono text-[10px] text-zinc-700 dark:text-zinc-300 w-6 font-semibold">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. 메인 컨텐츠 영역 (상단 정렬: justify-start) */}
      <main className="flex-1 p-3.5 max-w-5xl w-full mx-auto flex flex-col justify-start items-stretch gap-3">
        {activeTab === 'guide' && (
          <GuidePage onStartCalibration={() => setActiveTab('calibrate')} />
        )}

        {activeTab === 'calibrate' && (
          <WizardCalibration
            mode={mode}
            setMode={setMode}
            calibrations={calibrations}
            setCalibrations={setCalibrations}
            onGoToABTest={() => setActiveTab('abtest')}
            onGoToExport={() => setActiveTab('export')}
          />
        )}

        {activeTab === 'abtest' && (
          <ABTestPage
            calibrations={calibrations}
            onBackToCalibration={() => setActiveTab('calibrate')}
            onGoToExport={() => setActiveTab('export')}
          />
        )}

        {activeTab === 'export' && (
          <ExportAPOPage
            calibrations={calibrations}
            setCalibrations={setCalibrations}
            mode={mode}
            onBackToABTest={() => setActiveTab('abtest')}
          />
        )}
      </main>

      {/* 3. 하단 푸터 (chjmcmxciii 텍스트 단독 표기, 링크 x) */}
      <footer className="flex-shrink-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xs border-t border-zinc-200 dark:border-zinc-900 py-2 px-4 text-center text-[11px] text-zinc-600 dark:text-zinc-400 font-medium transition-colors">
        <p>EarBalancer EQ • chjmcmxciii</p>
      </footer>
    </div>
  );
}

export default App;
