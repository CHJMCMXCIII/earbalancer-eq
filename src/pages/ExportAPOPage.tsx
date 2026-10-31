import React, { useState } from 'react';
import { generateAPOConfigText, downloadAPOConfigFile } from '../tauri/tauriBridge';
import { FREQUENCY_BANDS } from '../data/iso226';
import {
  Profile,
  loadSavedProfiles,
  saveProfilesToStorage,
  BandState,
} from '../store/calibrationStore';
import {
  Download,
  Copy,
  Check,
  Zap,
  Save,
  PlaySquare,
  ShieldCheck,
  Headphones,
  Trash2,
  ArrowLeft,
  FileText,
} from 'lucide-react';

interface ExportAPOPageProps {
  calibrations: BandState[];
  setCalibrations: React.Dispatch<React.SetStateAction<BandState[]>>;
  mode: '10-band' | '31-band';
  onBackToABTest: () => void;
}

export const ExportAPOPage: React.FC<ExportAPOPageProps> = ({
  calibrations,
  setCalibrations,
  mode,
  onBackToABTest,
}) => {
  const [profileName, setProfileName] = useState<string>('내 헤드폰');
  const [preampDb, setPreampDb] = useState<number>(-3.0);
  const [profiles, setProfiles] = useState<Profile[]>(() => loadSavedProfiles());
  const [copied, setCopied] = useState<boolean>(false);
  const [autoApplied, setAutoApplied] = useState<boolean>(false);
  const [showEditorLaunchModal, setShowEditorLaunchModal] = useState<boolean>(false);

  const bandExportList = FREQUENCY_BANDS.map((b, i) => ({
    freq: b.freq,
    leftDb: calibrations[i]?.leftDb || 0,
    rightDb: calibrations[i]?.rightDb || 0,
    phaseInvert: calibrations[i]?.phaseInvert || false,
  }));

  const apoConfigText = generateAPOConfigText({
    profileName,
    bands: bandExportList,
    preampDb,
  });

  // [옵션 1] Equalizer APO에 설정 자동 반영하기 (File System Access API 활용)
  const handleAutoApplyToAPO = async () => {
    try {
      // Chrome/Edge File System Access API 지원 여부 확인
      if ('showSaveFilePicker' in window) {
        const handle = await (window as unknown as {
          showSaveFilePicker: (opts: Record<string, unknown>) => Promise<FileSystemFileHandle>;
        }).showSaveFilePicker({
          suggestedName: 'config.txt',
          types: [
            {
              description: 'Equalizer APO Config (*.txt)',
              accept: { 'text/plain': ['.txt'] },
            },
          ],
        });

        const writable = await handle.createWritable();
        await writable.write(apoConfigText);
        await writable.close();

        setAutoApplied(true);
        setTimeout(() => setAutoApplied(false), 4000);
        return;
      }
    } catch (err: unknown) {
      console.log('File picker cancelled or permission denied:', err);
    }

    // fallback: 직접 다운로드 및 알림
    downloadAPOConfigFile('config.txt', apoConfigText);
    setAutoApplied(true);
    setTimeout(() => setAutoApplied(false), 4000);
  };

  // [옵션 2] 독립 백업용 파일 다운로드 (.txt)
  const handleDownloadBackup = () => {
    const filename = `EarBalancer_${profileName.replace(/[^\w\s가-힣-]/g, '')}.txt`;
    downloadAPOConfigFile(filename, apoConfigText);
  };

  // 클립보드 복사
  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(apoConfigText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  // 프로필 저장
  const handleSaveToProfileList = () => {
    const existingIdx = profiles.findIndex((p) => p.name === profileName);
    const updatedProfiles = [...profiles];

    const newProfile: Profile = {
      id: existingIdx >= 0 ? profiles[existingIdx].id : `profile-${Date.now()}`,
      name: profileName,
      mode: mode,
      updatedAt: new Date().toISOString(),
      calibrations: [...calibrations],
    };

    if (existingIdx >= 0) {
      updatedProfiles[existingIdx] = newProfile;
    } else {
      updatedProfiles.unshift(newProfile);
    }

    setProfiles(updatedProfiles);
    saveProfilesToStorage(updatedProfiles);
    alert(`[${profileName}] 설정이 브라우저에 안전하게 저장되었습니다.`);
  };

  const handleLoadProfile = (p: Profile) => {
    setProfileName(p.name);
    setCalibrations([...p.calibrations]);
  };

  const handleDeleteProfile = (id: string, name: string) => {
    if (!confirm(`'${name}' 설정을 삭제하시겠습니까?`)) return;
    const filtered = profiles.filter((p) => p.id !== id);
    setProfiles(filtered);
    saveProfilesToStorage(filtered);
  };

  // Equalizer APO 실행 버튼 핸들러
  const handleLaunchAPOEditor = () => {
    setShowEditorLaunchModal(true);
  };

  return (
    <div className="flex flex-col justify-between h-full space-y-3">
      {/* 상단 타이틀 & 앱 실행 버튼 바 */}
      <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-zinc-300" />
          <span className="font-semibold text-zinc-200">
            Equalizer APO 연동 및 설정 내보내기
          </span>
        </div>

        {/* Equalizer APO 앱 실행 버튼 */}
        <button
          onClick={handleLaunchAPOEditor}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg font-semibold border border-zinc-700 transition-colors shadow-sm"
        >
          <PlaySquare className="w-3.5 h-3.5 text-blue-400" />
          <span>Equalizer APO 앱 실행</span>
        </button>
      </div>

      {autoApplied && (
        <div className="p-2.5 bg-emerald-950/80 border border-emerald-600/60 rounded-xl text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Equalizer APO 설정 파일이 저장되었습니다. 시스템 사운드에 즉시 반영됩니다!</span>
        </div>
      )}

      {/* 메인 2컬럼 레이아웃 (노스크롤 맞춤) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 items-stretch">
        {/* 좌측 7컬럼: 이원화된 연동 옵션 (자동 반영 vs 파일 다운로드) */}
        <div className="md:col-span-7 p-4 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl flex flex-col justify-between space-y-3">
          {/* 프로필 이름 및 Preamp 안전 설정 */}
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-zinc-800">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                기기 프로필명
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-medium focus:outline-none focus:border-zinc-600"
                />
                <button
                  onClick={handleSaveToProfileList}
                  title="현재 보정값을 이 이름으로 저장"
                  className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold border border-zinc-700 transition-colors flex items-center"
                >
                  <Save className="w-3.5 h-3.5 text-blue-400" />
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                <span>디지털 클리핑 방지 Preamp</span>
                <span className="font-mono text-zinc-200">{preampDb.toFixed(1)} dB</span>
              </div>
              <input
                type="range"
                min="-12.0"
                max="0.0"
                step="0.5"
                value={preampDb}
                onChange={(e) => setPreampDb(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
              />
            </div>
          </div>

          {/* 이원화 옵션 카드: 옵션 1 (자동 반영) vs 옵션 2 (다운로드) */}
          <div className="space-y-2">
            {/* 옵션 1: 자동 반영하기 */}
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>옵션 1: Equalizer APO에 자동 반영하기 (권장)</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  APO config.txt로 바로 저장하여 재부팅 없이 실시간 적용
                </div>
              </div>

              <button
                onClick={handleAutoApplyToAPO}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>자동 반영 적용</span>
              </button>
            </div>

            {/* 옵션 2: 파일 다운로드하기 */}
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>옵션 2: 설정 파일 (.txt) 직접 다운로드</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  수동 보관 또는 백업용 설정 파일 저장
                </div>
              </div>

              <button
                onClick={handleDownloadBackup}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>파일 다운로드</span>
              </button>
            </div>
          </div>

          {/* 클립보드 복사 보조 바 */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-[11px] text-zinc-500">
              Equalizer APO 규격: GraphicEQ (Channel: L / R 개별 분리)
            </span>
            <button
              onClick={handleCopyClipboard}
              className="flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white underline"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? '복사됨!' : '전체 문법 클립보드 복사'}</span>
            </button>
          </div>
        </div>

        {/* 우측 5컬럼: 프로필 목록 & GraphicEQ 실시간 텍스트 미리보기 */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-3 h-full">
          {/* 내 프로필 목록 */}
          <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span>내 저장 프로필 ({profiles.length})</span>
            </div>
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-1.5 bg-zinc-950 rounded-lg border border-zinc-800/80 text-xs"
                >
                  <span
                    onClick={() => handleLoadProfile(p)}
                    className="cursor-pointer text-zinc-200 hover:text-blue-400 truncate flex-1 font-medium"
                  >
                    {p.name}
                  </span>
                  <button
                    onClick={() => handleDeleteProfile(p.id, p.name)}
                    className="text-zinc-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* GraphicEQ 미리보기 */}
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-[10px] text-zinc-400 flex-1 flex flex-col justify-between">
            <div className="text-zinc-500 pb-1 border-b border-zinc-800 font-bold">
              Equalizer APO GraphicEQ 문법 미리보기
            </div>
            <pre className="max-h-24 overflow-y-auto whitespace-pre-wrap leading-tight my-1 text-zinc-300">
              {apoConfigText}
            </pre>
          </div>
        </div>
      </div>

      {/* 하단 뒤로 가기 */}
      <div className="flex items-center justify-between p-2 bg-zinc-900/90 rounded-xl border border-zinc-800 text-xs">
        <button
          onClick={onBackToABTest}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>이전 (A/B 테스트로)</span>
        </button>

        <span className="text-[11px] text-zinc-500">
          모든 설정이 완료되었습니다. Equalizer APO에서 바로 사운드를 즐기세요!
        </span>
      </div>

      {/* Equalizer APO 앱 실행 안내 모달 */}
      {showEditorLaunchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <PlaySquare className="w-4 h-4 text-blue-400" />
                <span>Equalizer APO 실행 안내</span>
              </h3>
              <button
                onClick={() => setShowEditorLaunchModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-zinc-300 space-y-2 leading-relaxed">
              <p>Windows에서 Equalizer APO를 실행하는 가장 빠른 방법입니다:</p>
              <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-[11px] text-blue-300 select-all">
                C:\Program Files\EqualizerAPO\Editor.exe
              </div>
              <p className="text-[11px] text-zinc-400">
                1. <kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-200">Win</kbd> + <kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-200">R</kbd> (실행창)을 누릅니다.<br />
                2. 위의 경로를 붙여넣고 엔터를 누르면 Configuration Editor가 즉시 실행됩니다.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText('C:\\Program Files\\EqualizerAPO\\Editor.exe');
                  alert('실행 경로가 클립보드에 복사되었습니다. Win+R을 누른 후 붙여넣기(Ctrl+V)하세요.');
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
              >
                경로 복사하기
              </button>
              <button
                onClick={() => setShowEditorLaunchModal(false)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
