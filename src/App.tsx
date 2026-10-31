import React, { useState } from 'react';
import { audioEngine } from './audio/AudioEngine';
import { getDefaultBands, BandState } from './store/calibrationStore';
import { WizardCalibration } from './pages/WizardCalibration';
import { ABTestPage } from './pages/ABTestPage';
import { ExportAPOPage } from './pages/ExportAPOPage';
import {
  SlidersHorizontal,
  Volume2,
  Headphones,
  Sparkles,
  FolderOutput,
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'calibrate' | 'abtest' | 'export'>('calibrate');
  const [mode, setMode] = useState<'10-band' | '31-band'>('10-band');
  const [calibrations, setCalibrations] = useState<BandState[]>(() => getDefaultBands());
  const [masterVolume, setMasterVolume] = useState<number>(0.5);

  const handleVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    audioEngine.setMasterVolume(vol);
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col justify-between select-none font-sans">
      {/* 1. 상단 글로벌 헤더 (컴팩트 흑백 모노크롬 바) */}
      <header className="flex-shrink-0 bg-zinc-900 border-b border-zinc-800 px-4 py-2 shadow-sm z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* 로고 & 타이틀 */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold shadow">
              <Headphones className="w-4 h-4 text-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm tracking-tight text-white">EarBalancer EQ</h1>
                <span className="px-1.5 py-0.2 text-[9px] bg-zinc-800 text-zinc-300 rounded font-semibold border border-zinc-700">
                  양쪽 청각 보정
                </span>
              </div>
            </div>
          </div>

          {/* 단계 네비게이션 탭 */}
          <nav className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setActiveTab('calibrate')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'calibrate'
                  ? 'bg-zinc-100 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>1. 소리 맞춤</span>
            </button>

            <button
              onClick={() => setActiveTab('abtest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'abtest'
                  ? 'bg-zinc-100 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>2. 전/후 비교</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'export'
                  ? 'bg-zinc-100 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FolderOutput className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. APO 저장</span>
            </button>
          </nav>

          {/* 우측 마스터 볼륨 (패닉 버튼 제거됨) */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-zinc-950 rounded-lg border border-zinc-800 text-xs">
            <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              title="앱 마스터 볼륨"
            />
            <span className="font-mono text-[10px] text-zinc-400 w-6">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>
        </div>
      </header>

      {/* 2. 메인 컨텐츠 영역 (노스크롤: flex-1 내에서 화면 높이에 딱 맞춤) */}
      <main className="flex-1 overflow-hidden p-3 max-w-5xl w-full mx-auto flex flex-col justify-between">
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

      {/* 3. 하단 푸터 (요청된 저작권 표시 https://github.com/CHJMCMXCIII) */}
      <footer className="flex-shrink-0 bg-zinc-950 border-t border-zinc-900 py-1.5 px-4 text-center text-[11px] text-zinc-500">
        <p>
          EarBalancer EQ • Copyright ©{' '}
          <a
            href="https://github.com/CHJMCMXCIII"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white underline transition-colors"
          >
            https://github.com/CHJMCMXCIII
          </a>
          . All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
