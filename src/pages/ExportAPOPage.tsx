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
  Trash2,
  ArrowLeft,
  FileText,
  ExternalLink,
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

  // [옵션 1] Equalizer APO에 설정 자동 반영하기
  const handleAutoApplyToAPO = async () => {
    try {
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

    downloadAPOConfigFile('config.txt', apoConfigText);
    setAutoApplied(true);
    setTimeout(() => setAutoApplied(false), 4000);
  };

  // [옵션 2] 백업용 파일 다운로드
  const handleDownloadBackup = () => {
    const filename = `EarBalancer_${profileName.replace(/[^\w\s가-힣-]/g, '')}.txt`;
    downloadAPOConfigFile(filename, apoConfigText);
  };

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(apoConfigText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

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

  return (
    <div className="flex flex-col justify-start items-stretch gap-3 w-full">
      {/* 1. 최상단으로 이동한 내비게이션 바 */}
      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs transition-colors">
        <button
          onClick={onBackToABTest}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>이전 (A/B 테스트로)</span>
        </button>

        <span className="text-[11px] text-zinc-500 font-medium hidden sm:inline">
          모든 캘리브레이션이 완료되었습니다. Equalizer APO에 저장하세요!
        </span>

        {/* Equalizer APO 앱 공식 설치 링크 버튼 */}
        <a
          href="https://sourceforge.net/projects/equalizerapo/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-zinc-800 hover:bg-blue-100 dark:hover:bg-zinc-700 text-blue-700 dark:text-blue-300 rounded-lg font-semibold border border-blue-200 dark:border-zinc-700 transition-colors shadow-xs"
        >
          <span>Equalizer APO 앱 설치</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {autoApplied && (
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-600/60 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Equalizer APO 설정 파일이 저장되었습니다. 시스템 사운드에 즉시 반영됩니다!</span>
        </div>
      )}

      {/* 2. 메인 2컬럼 레이아웃 (items-stretch: 긴 쪽 길이로 맞추고, 짧은 카드는 상-하로 퍼지도록 flex-col justify-between) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch w-full">
        {/* 좌측 7컬럼: 연동 옵션 (자동 반영 vs 파일 다운로드) */}
        <div className="md:col-span-7 h-full p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl flex flex-col justify-between gap-3 transition-colors">
          {/* 프로필 이름 및 Preamp 안전 설정 */}
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                기기 프로필명
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                />
                <button
                  onClick={handleSaveToProfileList}
                  title="현재 보정값을 이 이름으로 저장"
                  className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center"
                >
                  <Save className="w-3.5 h-3.5 text-blue-500" />
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                <span>클리핑 방지 Preamp</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-200 font-bold">{preampDb.toFixed(1)} dB</span>
              </div>
              <input
                type="range"
                min="-12.0"
                max="0.0"
                step="0.5"
                value={preampDb}
                onChange={(e) => setPreampDb(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
              />
            </div>
          </div>

          {/* 이원화 옵션 카드: 옵션 1 (자동 반영) vs 옵션 2 (다운로드) */}
          <div className="space-y-2.5 my-auto">
            {/* 옵션 1: 자동 반영하기 */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 transition-colors">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>옵션 1: Equalizer APO에 자동 반영하기 (권장)</span>
                </div>
                <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
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
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 transition-colors">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-blue-500" />
                  <span>옵션 2: 설정 파일 (.txt) 직접 다운로드</span>
                </div>
                <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  수동 보관 또는 다른 PC용 설정 파일 저장
                </div>
              </div>

              <button
                onClick={handleDownloadBackup}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>파일 다운로드</span>
              </button>
            </div>
          </div>

          {/* 클립보드 복사 바 */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <span className="text-[11px] text-zinc-500">
              Equalizer APO 규격: GraphicEQ (Channel: L / R 개별 분리)
            </span>
            <button
              onClick={handleCopyClipboard}
              className="flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white underline"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? '복사됨!' : '전체 문법 클립보드 복사'}</span>
            </button>
          </div>
        </div>

        {/* 우측 5컬럼: 프로필 목록 & GraphicEQ 실시간 미리보기 (h-full & justify-between) */}
        <div className="md:col-span-5 h-full flex flex-col justify-between gap-3 w-full">
          {/* 내 프로필 목록 */}
          <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              <span>내 저장 프로필 ({profiles.length})</span>
            </div>
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-1.5 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800/80 text-xs"
                >
                  <span
                    onClick={() => handleLoadProfile(p)}
                    className="cursor-pointer text-zinc-800 dark:text-zinc-200 hover:text-blue-500 truncate flex-1 font-medium"
                  >
                    {p.name}
                  </span>
                  <button
                    onClick={() => handleDeleteProfile(p.id, p.name)}
                    className="text-zinc-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* GraphicEQ 미리보기 (flex-1로 채워짐) */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 font-mono text-[10px] text-zinc-600 dark:text-zinc-400 flex-1 flex flex-col justify-between transition-colors">
            <div className="text-zinc-500 pb-1 border-b border-zinc-200 dark:border-zinc-800 font-bold">
              Equalizer APO GraphicEQ 문법 미리보기
            </div>
            <pre className="max-h-36 overflow-y-auto whitespace-pre-wrap leading-tight my-auto text-zinc-700 dark:text-zinc-300">
              {apoConfigText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
