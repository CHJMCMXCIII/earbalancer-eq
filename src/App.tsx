import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from './audio/AudioEngine';
import { getDefaultBands, BandState } from './store/calibrationStore';
import { GuidePage } from './pages/GuidePage';
import { WizardCalibration } from './pages/WizardCalibration';
import { ABTestPage } from './pages/ABTestPage';
import { ExportAPOPage } from './pages/ExportAPOPage';
import { useLanguage } from './i18n/LanguageContext';
import {
  SlidersHorizontal,
  Volume2,
  Headphones,
  Sparkles,
  FolderOutput,
  Sun,
  Moon,
  BookOpen,
  Globe,
  ChevronDown,
  Check,
} from 'lucide-react';
import GitHubButton from 'react-github-btn';

export function App() {
  const { lang, setLang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'guide' | 'calibrate' | 'abtest' | 'export'>('guide');
  const [eqMode, setEqMode] = useState<'31-band' | '61-band'>('31-band');
  const [calibrations, setCalibrations] = useState<BandState[]>(() => getDefaultBands());
  const [masterVolume, setMasterVolume] = useState<number>(0.5);
  // 내 음악 파일명 상태를 상위 App으로 승격하여 탭 전환 시에도 유지
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState<boolean>(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // 언어 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    if (isLangMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLangMenuOpen]);

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
      root.setAttribute('data-theme', 'dark');
      body.classList.add('dark');
      body.setAttribute('data-theme', 'dark');
      localStorage.setItem('earbalancer_theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      body.classList.remove('dark');
      body.setAttribute('data-theme', 'light');
      localStorage.setItem('earbalancer_theme', 'light');
    }
  }, [isDarkMode]);

  const handleVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    audioEngine.setMasterVolume(vol);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-start select-none transition-colors duration-150 ${
        isDarkMode
          ? 'dark acoustic-pattern-dark text-[#f4f4f4]'
          : 'acoustic-pattern-light text-[#161616]'
      }`}
    >
      {/* 1. 상단 글로벌 헤더 (IBM Carbon Gray 90 / White) */}
      <header className="flex-shrink-0 bg-white/95 dark:bg-[#262626]/95 backdrop-blur-md border-b border-[#e0e0e0] dark:border-[#393939] px-4 py-2 shadow-xs z-30 transition-colors duration-150">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* 로고 & 타이틀 및 언어 전환 드롭다운 */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#161616] dark:bg-[#f4f4f4] text-white dark:text-[#161616] flex items-center justify-center font-bold shadow-xs">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm tracking-tight text-[#161616] dark:text-[#f4f4f4]">
                  {t.common.appName}
                </h1>
              </div>
            </div>

            {/* 헤더 로고 우측 언어 전환 드롭다운 (KO / EN) */}
            <div className="relative ml-1" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#f4f4f4] dark:bg-[#161616] hover:bg-[#e8e8e8] dark:hover:bg-[#393939] border border-[#e0e0e0] dark:border-[#393939] text-[#161616] dark:text-[#f4f4f4] transition-all duration-150 shadow-xs cursor-pointer select-none"
                title={lang === 'ko' ? '언어 선택 (Select Language)' : 'Select Language'}
              >
                <Globe className="w-3.5 h-3.5 text-[#0f62fe] dark:text-[#78a9ff]" />
                <span>{lang === 'ko' ? '한국어' : 'English'}</span>
                <ChevronDown
                  className={`w-3 h-3 text-[#525252] dark:text-[#8d8d8d] transition-transform duration-150 ${
                    isLangMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isLangMenuOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-32 bg-white dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] rounded-lg shadow-lg py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setLang('ko');
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-left font-medium hover:bg-[#f4f4f4] dark:hover:bg-[#393939] transition-colors cursor-pointer ${
                      lang === 'ko'
                        ? 'text-[#0f62fe] dark:text-[#78a9ff] font-bold bg-[#edf5ff] dark:bg-[#002d9c]/30'
                        : 'text-[#161616] dark:text-[#f4f4f4]'
                    }`}
                  >
                    <span>🇰🇷 한국어</span>
                    {lang === 'ko' && <Check className="w-3.5 h-3.5 text-[#0f62fe] dark:text-[#78a9ff]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLang('en');
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-left font-medium hover:bg-[#f4f4f4] dark:hover:bg-[#393939] transition-colors cursor-pointer ${
                      lang === 'en'
                        ? 'text-[#0f62fe] dark:text-[#78a9ff] font-bold bg-[#edf5ff] dark:bg-[#002d9c]/30'
                        : 'text-[#161616] dark:text-[#f4f4f4]'
                    }`}
                  >
                    <span>🇺🇸 English</span>
                    {lang === 'en' && <Check className="w-3.5 h-3.5 text-[#0f62fe] dark:text-[#78a9ff]" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 우측 볼륨 & 좌우 스위치 토글 방식의 라이트/다크 모드 */}
          <div className="flex items-center gap-2.5">
            {/* 좌우 스위치 토글 버튼 (Sliding Pill Switch Toggle) */}
            <div className="flex items-center p-0.5 bg-[#e0e0e0] dark:bg-[#393939] rounded-full border border-[#d0d0d0] dark:border-[#525252] relative text-[11px] font-semibold select-none shadow-xs">
              <button
                onClick={() => setIsDarkMode(false)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer ${
                  !isDarkMode
                    ? 'bg-white text-[#161616] shadow-xs font-bold'
                    : 'text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616] dark:hover:text-[#ffffff]'
                }`}
                title={lang === 'ko' ? '밝고 선명한 라이트 모드' : 'Light Mode'}
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>{t.common.lightMode}</span>
              </button>

              <button
                onClick={() => setIsDarkMode(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#161616] text-[#f4f4f4] shadow-xs font-bold'
                    : 'text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616] dark:hover:text-[#ffffff]'
                }`}
                title={lang === 'ko' ? '눈이 편안한 다크 모드' : 'Dark Mode'}
              >
                <Moon className="w-3 h-3 text-[#c6c6c6]" />
                <span>{t.common.darkMode}</span>
              </button>
            </div>

            {/* 마스터 볼륨 슬라이더 */}
            <div className="flex items-center gap-2 px-2.5 py-1 bg-[#e8e8e8] dark:bg-[#161616] rounded border border-[#e0e0e0] dark:border-[#393939] text-xs transition-colors duration-150">
              <Volume2 className="w-3.5 h-3.5 text-[#525252] dark:text-[#c6c6c6]" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={masterVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 h-1.5 bg-[#d0d0d0] dark:bg-[#393939] rounded appearance-none cursor-pointer accent-[#0f62fe]"
                title={t.common.masterVolume}
              />
              <span className="font-mono text-[10px] text-[#161616] dark:text-[#f4f4f4] w-6 font-semibold">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. 헤더 바로 아래 페이지 공통 고정 단계 표시 네비게이션 (가운데 정렬) */}
      <div className="flex-shrink-0 bg-white/80 dark:bg-[#161616]/80 backdrop-blur-xs border-b border-[#e0e0e0] dark:border-[#393939] py-1.5 px-4 z-20 transition-colors duration-150">
        <div className="max-w-5xl mx-auto flex items-center justify-center">
          <nav className="flex items-center gap-1 bg-[#e8e8e8] dark:bg-[#262626] p-1 rounded-lg border border-[#e0e0e0] dark:border-[#393939] text-xs transition-colors duration-150 shadow-xs">
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-white dark:bg-[#161616] text-[#0f62fe] dark:text-[#78a9ff] shadow-xs font-bold'
                  : 'text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616] dark:hover:text-[#ffffff]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#0f62fe]" />
              <span>{t.nav.guide}</span>
            </button>

            <button
              onClick={() => setActiveTab('calibrate')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === 'calibrate'
                  ? 'bg-white dark:bg-[#161616] text-[#0f62fe] dark:text-[#78a9ff] shadow-xs font-bold'
                  : 'text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616] dark:hover:text-[#ffffff]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t.nav.calibrate}</span>
            </button>

            <button
              onClick={() => setActiveTab('abtest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === 'abtest'
                  ? 'bg-white dark:bg-[#161616] text-[#0f62fe] dark:text-[#78a9ff] shadow-xs font-bold'
                  : 'text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616] dark:hover:text-[#ffffff]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>{t.nav.abtest}</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-white dark:bg-[#161616] text-[#0f62fe] dark:text-[#78a9ff] shadow-xs font-bold'
                  : 'text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616] dark:hover:text-[#ffffff]'
              }`}
            >
              <FolderOutput className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.nav.export}</span>
            </button>
          </nav>
        </div>
      </div>

      {/* 2. 메인 컨텐츠 영역 (상단 정렬: justify-start) */}
      <main className="flex-1 p-3.5 max-w-5xl w-full mx-auto flex flex-col justify-start items-stretch gap-3">
        {activeTab === 'guide' && (
          <GuidePage onStartCalibration={() => setActiveTab('calibrate')} />
        )}

        {activeTab === 'calibrate' && (
          <WizardCalibration
            eqMode={eqMode}
            setEqMode={setEqMode}
            calibrations={calibrations}
            setCalibrations={setCalibrations}
            onGoToABTest={() => setActiveTab('abtest')}
            onGoToExport={() => setActiveTab('export')}
          />
        )}

        {activeTab === 'abtest' && (
          <ABTestPage
            eqMode={eqMode}
            calibrations={calibrations}
            customFileName={customFileName}
            setCustomFileName={setCustomFileName}
            onBackToCalibration={() => setActiveTab('calibrate')}
            onGoToExport={() => setActiveTab('export')}
          />
        )}

        {activeTab === 'export' && (
          <ExportAPOPage
            eqMode={eqMode}
            calibrations={calibrations}
            setCalibrations={setCalibrations}
            onBackToABTest={() => setActiveTab('abtest')}
            onGoToCalibration={() => setActiveTab('calibrate')}
          />
        )}
      </main>

      {/* 3. 하단 푸터 (IBM Carbon 미니멀 스타일, chjmcmxciii 단독 표기, 링크 x, Windows 환경 전용 명시) */}
      <footer className="flex-shrink-0 bg-white/80 dark:bg-[#161616]/80 backdrop-blur-xs border-t border-[#e0e0e0] dark:border-[#393939] py-2 px-4 text-center text-[11px] text-[#525252] dark:text-[#8d8d8d] font-medium transition-colors duration-150">
        <p className="flex items-center justify-center gap-2 flex-wrap text-[11px]">
          <span>EarBalancer EQ</span>
          <span>•</span>
          <span> 
            <a href="https://github.com/CHJMCMXCIII/earbalancer-eq" target="_blank" rel="noopener noreferrer" className="text-[#0f62fe] dark:text-[#78a9ff] hover:underline">
              chjmcmxciii
            </a>
          </span>
          <span>
            <GitHubButton href="https://github.com/chjmcmxciii/earbalancer-eq" data-icon="octicon-star" data-show-count="true" aria-label="Star chjmcmxciii/earbalancer-eq on GitHub">Star</GitHubButton>
          </span>
          </p>
      </footer>
    </div>
  );
}

export default App;
