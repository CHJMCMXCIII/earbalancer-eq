import React, { useState } from 'react';
import {
  generateAPOConfigText,
  saveAPOConfig,
  downloadAPOConfigFile,
} from '../tauri/tauriBridge';
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
  FolderCheck,
  Save,
  RotateCcw,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Headphones,
  Trash2,
  Plus,
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
  const [saveStatus, setSaveStatus] = useState<{
    show: boolean;
    success: boolean;
    message: string;
    path: string;
  } | null>(null);

  // 31밴드 전체 데이터 변환
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

  // 클립보드 복사
  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(apoConfigText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // 복사 권한 오류 대체
    }
  };

  // 파일 다운로드 / 저장
  const handleSaveFile = async () => {
    const res = await saveAPOConfig(profileName, apoConfigText);
    setSaveStatus({
      show: true,
      success: res.success,
      message: res.message,
      path: res.path,
    });
  };

  // 현재 설정을 프로필 목록에 저장
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
    alert(`[${profileName}] 프로필로 내 컴퓨터에 안전하게 저장되었습니다.`);
  };

  // 저장된 프로필 불러오기
  const handleLoadProfile = (p: Profile) => {
    setProfileName(p.name);
    setCalibrations([...p.calibrations]);
    alert(`[${p.name}] 프로필 값을 불러왔습니다.`);
  };

  // 프로필 삭제
  const handleDeleteProfile = (id: string, name: string) => {
    if (!confirm(`'${name}' 프로필을 삭제하시겠습니까?`)) return;
    const filtered = profiles.filter((p) => p.id !== id);
    setProfiles(filtered);
    saveProfilesToStorage(filtered);
  };

  return (
    <div className="space-y-6">
      {/* 타이틀 및 헤더 */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
          <FolderCheck className="w-5 h-5 text-emerald-400" />
          <span>Equalizer APO 설정 파일 자동 생성 및 저장</span>
        </h2>
        <p className="text-xs text-slate-400">
          모든 캘리브레이션이 완료되었습니다! Equalizer APO에서 바로 읽을 수 있는 공식 규격 파일로 저장합니다.
        </p>
      </div>

      {/* 저장 완료 알림 팝업 */}
      {saveStatus?.show && (
        <div
          className={`p-4 rounded-xl border text-xs flex flex-col gap-1.5 shadow-xl transition-all ${
            saveStatus.success
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
              : 'bg-amber-950/80 border-amber-500/60 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{saveStatus.message}</span>
          </div>
          <div className="text-[11px] opacity-90">
            저장 위치: <code className="bg-slate-900 px-2 py-0.5 rounded font-mono text-white">{saveStatus.path}</code>
          </div>
          <p className="text-[11px] text-emerald-300 mt-1">
            Equalizer APO 폴더(C:\Program Files\EqualizerAPO\config)에 이 파일을 넣거나, Configuration Editor에서 <strong>Include</strong>하여 즉시 적용하세요!
          </p>
        </div>
      )}

      {/* 프로필 설정 및 원클릭 액션 박스 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측 2컬럼: 프로필 저장 및 파일 생성 버튼 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Headphones className="w-4 h-4 text-blue-400" />
              <span>기기별 이름 및 Preamp 안전 설정</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  프로필 이름 (헤드폰/이어폰 기기명)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="예: Sony WH-1000XM4, 에어팟 프로"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                  <button
                    onClick={handleSaveToProfileList}
                    title="현재 보정값을 이 프로필 이름으로 브라우저에 저장"
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5 text-blue-400" />
                    <span>저장</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>안전 볼륨 마이너스 게인 (Preamp)</span>
                  <span className="text-blue-400 font-mono">{preampDb.toFixed(1)} dB</span>
                </div>
                <input
                  type="range"
                  min="-12.0"
                  max="0.0"
                  step="0.5"
                  value={preampDb}
                  onChange={(e) => setPreampDb(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  * 특정 주파수를 증폭했을 때 소리가 깨지는(디지털 클리핑) 현상을 방지합니다. (-3dB 권장)
                </span>
              </div>
            </div>

            {/* 원클릭 다운로드 & 클립보드 액션 버튼 */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={handleSaveFile}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition-all hover:scale-102"
              >
                <Download className="w-4 h-4" />
                <span>Equalizer APO 설정 파일 (.txt) 저장하기</span>
              </button>

              <button
                onClick={handleCopyClipboard}
                className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '복사 완료!' : '텍스트 복사'}</span>
              </button>
            </div>
          </div>

          {/* Equalizer APO 적용 방법 3단계 친절 가이드 */}
          <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Equalizer APO에 10초 만에 적용하는 방법</span>
            </h4>

            <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                위의 <strong>[설정 파일 (.txt) 저장하기]</strong>를 눌러 파일을 다운로드합니다.
              </li>
              <li>
                다운로드된 파일을 <code className="bg-slate-950 px-1.5 py-0.5 rounded text-blue-300 font-mono">C:\Program Files\EqualizerAPO\config\</code> 폴더로 이동합니다.
              </li>
              <li>
                Equalizer APO의 <strong>Configuration Editor</strong>를 열고 <code>+</code> 버튼 ➡️ <strong>Control</strong> ➡️ <strong>Include (Include configuration file)</strong>에서 해당 파일을 선택하면 즉시 적용됩니다!
              </li>
            </ol>
          </div>
        </div>

        {/* 우측 1컬럼: 프로필 목록 및 Live Code 미리보기 */}
        <div className="space-y-6">
          {/* 저장된 프로필 목록 */}
          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>내 기기 프로필 목록 ({profiles.length})</span>
              <span className="text-[10px] text-slate-500">자동 저장됨</span>
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs hover:border-slate-700 transition-colors"
                >
                  <div
                    onClick={() => handleLoadProfile(p)}
                    className="cursor-pointer flex-1 truncate pr-2 hover:text-blue-400 transition-colors"
                  >
                    <div className="font-semibold text-slate-200 truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteProfile(p.id, p.name)}
                    className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                    title="프로필 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Equalizer APO 규격 GraphicEQ 실시간 미리보기 */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-2">
            <div className="flex items-center justify-between text-slate-500 pb-1 border-b border-slate-800">
              <span className="font-bold">APO GraphicEQ 미리보기</span>
              <span>{FREQUENCY_BANDS.length} Bands</span>
            </div>
            <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap leading-tight text-slate-400 text-[10px]">
              {apoConfigText}
            </pre>
          </div>
        </div>
      </div>

      {/* 뒤로 가기 버튼 */}
      <div className="pt-2">
        <button
          onClick={onBackToABTest}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
        >
          <span>이전 (A/B 테스트로 돌아가기)</span>
        </button>
      </div>
    </div>
  );
};
