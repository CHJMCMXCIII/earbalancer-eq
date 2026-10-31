import React, { useState, useEffect } from 'react';
import { audioEngine } from './audio/AudioEngine';
import { getDefaultBands, BandState } from './store/calibrationStore';
import { PanicButton } from './components/PanicButton';
import { WizardCalibration } from './pages/WizardCalibration';
import { ABTestPage } from './pages/ABTestPage';
import { ExportAPOPage } from './pages/ExportAPOPage';
import {
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Headphones,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  FolderOutput,
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'calibrate' | 'abtest' | 'export'>('calibrate');
  const [mode, setMode] = useState<'10-band' | '31-band'>('10-band');
  const [calibrations, setCalibrations] = useState<BandState[]>(() => getDefaultBands());
  const [isoEnabled, setIsoEnabled] = useState<boolean>(true);
  const [masterVolume, setMasterVolume] = useState<number>(0.5);
  const [isAudioInitialized, setIsAudioInitialized] = useState<boolean>(false);
  const [isPanicMuted, setIsPanicMuted] = useState<boolean>(false);

  // 사용자 마스터 볼륨 변경
  const handleVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    audioEngine.setMasterVolume(vol);
  };

  // 패닉(비상 정지) 핸들러
  const handlePanic = () => {
    audioEngine.panicStop();
    setIsPanicMuted(true);
  };

  // 비상 정지 해제
  const handleUnpause = async () => {
    await audioEngine.unpause();
    setIsPanicMuted(false);
  };

  // 최초 오디오 활성화 (Autoplay 정책 대응)
  const handleStartAudioSystem = async () => {
    await audioEngine.ensureContext();
    setIsAudioInitialized(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 상단 네비게이션 & 글로벌 헤더 */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* 로고 & 타이틀 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-white">EarBalancer EQ</h1>
                <span className="px-1.5 py-0.5 text-[10px] bg-blue-900/60 text-blue-300 rounded font-semibold border border-blue-700/60">
                  APO 자동 캘리브레이션
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                일상적인 언어와 그림 가이드로 맞추는 나만의 헤드폰/이어폰 사운드
              </p>
            </div>
          </div>

          {/* 중앙 단계 탭 버튼 */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('calibrate')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'calibrate'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>1. 소리 맞춤</span>
            </button>

            <button
              onClick={() => setActiveTab('abtest')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'abtest'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>2. 전/후 비교 (A/B)</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'export'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderOutput className="w-3.5 h-3.5" />
              <span>3. APO 저장</span>
            </button>
          </nav>

          {/* 우측 볼륨 & 상시 노출 비상 정지(Panic Button) */}
          <div className="flex items-center gap-3">
            {/* 마스터 볼륨 슬라이더 */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={masterVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                title="앱 마스터 볼륨"
              />
              <span className="font-mono text-[10px] text-slate-400 w-7">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>

            {/* 패닉 버튼 */}
            <PanicButton onPanic={handlePanic} isAudioActive={!isPanicMuted} />
          </div>
        </div>

        {/* 모바일 탭 바 */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950 px-2 py-1 text-xs">
          <button
            onClick={() => setActiveTab('calibrate')}
            className={`py-1.5 px-3 rounded-lg font-medium ${
              activeTab === 'calibrate' ? 'text-blue-400 font-bold' : 'text-slate-400'
            }`}
          >
            1. 소리 맞춤
          </button>
          <button
            onClick={() => setActiveTab('abtest')}
            className={`py-1.5 px-3 rounded-lg font-medium ${
              activeTab === 'abtest' ? 'text-blue-400 font-bold' : 'text-slate-400'
            }`}
          >
            2. 비교 (A/B)
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-1.5 px-3 rounded-lg font-medium ${
              activeTab === 'export' ? 'text-blue-400 font-bold' : 'text-slate-400'
            }`}
          >
            3. APO 저장
          </button>
        </div>
      </header>

      {/* 비상 정지 활성화 시 복구 배너 */}
      {isPanicMuted && (
        <div className="bg-red-950 border-b border-red-800 py-2.5 px-4 text-center text-xs text-red-200 flex items-center justify-center gap-3">
          <VolumeX className="w-4 h-4 text-red-400" />
          <span>[비상 정지됨] 모든 소리가 즉시 차단되었습니다.</span>
          <button
            onClick={handleUnpause}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs shadow transition-all"
          >
            소리 다시 켜기
          </button>
        </div>
      )}

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'calibrate' && (
          <WizardCalibration
            mode={mode}
            setMode={setMode}
            calibrations={calibrations}
            setCalibrations={setCalibrations}
            isoEnabled={isoEnabled}
            setIsoEnabled={setIsoEnabled}
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

      {/* 하단 푸터 */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500 space-y-1">
        <p>EarBalancer EQ v0.1.0 Prototype • Designed for Equalizer APO on Windows</p>
        <p className="text-[11px] text-slate-600">
          청각 안전 보호 리미터 상시 동작 중 (Peak Limit -3.0 dBFS)
        </p>
      </footer>
    </div>
  );
}

export default App;
