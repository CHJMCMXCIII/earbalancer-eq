import React, { useState } from 'react';
import { generateAPOConfigText, downloadAPOConfigFile } from '../tauri/tauriBridge';
import { FREQUENCY_BANDS_61 } from '../data/iso226';
import { useLanguage } from '../i18n/LanguageContext';
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
  BookOpen,
  Info,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

interface ExportAPOPageProps {
  eqMode?: '31-band' | '61-band';
  calibrations: BandState[];
  setCalibrations: React.Dispatch<React.SetStateAction<BandState[]>>;
  onBackToABTest: () => void;
  onGoToCalibration?: () => void;
}

export const ExportAPOPage: React.FC<ExportAPOPageProps> = ({
  eqMode = '31-band',
  calibrations,
  setCalibrations,
  onBackToABTest,
  onGoToCalibration,
}) => {
  const { t, lang } = useLanguage();
  const [profileName, setProfileName] = useState<string>(() => (lang === 'ko' ? '내 헤드폰' : 'My Headphones'));

  // 소리 맞춤 단계에서 가장 크게 증가한 주파수의 gain 값 (+1 만큼 -dB 반영)
  const maxBoost = Math.max(
    0,
    ...calibrations.map((c) => Math.max(c.leftDb || 0, c.rightDb || 0))
  );
  // 권장 Preamp: 최대 부스트 + 1 dB를 감쇄하는 음수 값 (- (maxBoost + 1))
  const suggestedPreamp = -parseFloat((maxBoost + 1.0).toFixed(1));

  const [preampDb, setPreampDb] = useState<number>(() => suggestedPreamp);
  const [profiles, setProfiles] = useState<Profile[]>(() => loadSavedProfiles());
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedProfileId, setCopiedProfileId] = useState<string | null>(null);
  const [copiedInputName, setCopiedInputName] = useState<boolean>(false);
  const [autoApplied, setAutoApplied] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  // 캘리브레이션 값 변경 시 프리앰프 자동 동기화
  React.useEffect(() => {
    setPreampDb(suggestedPreamp);
  }, [suggestedPreamp]);

  const handleCopyProfileName = async (name: string, id: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedProfileId(id);
      setTimeout(() => setCopiedProfileId(null), 2000);
    } catch (e) {
      console.error('Failed to copy profile name:', e);
    }
  };

  const handleCopyInputProfileName = async () => {
    if (!profileName) return;
    try {
      await navigator.clipboard.writeText(profileName);
      setCopiedInputName(true);
      setTimeout(() => setCopiedInputName(false), 2000);
    } catch (e) {
      console.error('Failed to copy profile name:', e);
    }
  };

  const activeBands =
    eqMode === '61-band'
      ? FREQUENCY_BANDS_61
      : FREQUENCY_BANDS_61.filter((b) => b.is31Band);

  const bandExportList = activeBands.map((b) => ({
    freq: b.freq,
    leftDb: calibrations[b.id]?.leftDb || 0,
    rightDb: calibrations[b.id]?.rightDb || 0,
  }));

  const apoConfigText = generateAPOConfigText({
    profileName,
    bands: bandExportList,
    preampDb,
  });

  // [옵션 1] Equalizer APO에 설정 자동 반영하기
  const handleAutoApplyToAPO = async () => {
    if ('showSaveFilePicker' in window) {
      try {
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
      } catch (err: unknown) {
        // 사용자가 파일 선택 창에서 취소(AbortError)를 누른 경우 창을 다시 띄우지 않고 정상 종료
        if ((err as Error)?.name === 'AbortError') {
          return;
        }
        console.error('File write failed:', err);
      }
      return;
    }

    // showSaveFilePicker API를 지원하지 않는 브라우저(예: 구형 브라우저)에서만 다운로드 폴백 실행
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
      mode: eqMode,
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
    alert(lang === 'ko' ? `[${profileName}] 설정이 브라우저에 안전하게 저장되었습니다.` : `[${profileName}] profile saved to browser storage.`);
  };

  // 프리셋 재생성 (현재 프로필 자동 저장 후 소리 맞춤 페이지로 이동)
  const handleRegeneratePreset = () => {
    // 1. 현재 조정 프로필 자동 저장
    const existingIdx = profiles.findIndex((p) => p.name === profileName);
    const updatedProfiles = [...profiles];

    const currentProfileToSave: Profile = {
      id: existingIdx >= 0 ? profiles[existingIdx].id : `profile-${Date.now()}`,
      name: profileName,
      mode: eqMode,
      updatedAt: new Date().toISOString(),
      calibrations: [...calibrations],
    };

    if (existingIdx >= 0) {
      updatedProfiles[existingIdx] = currentProfileToSave;
    } else {
      updatedProfiles.unshift(currentProfileToSave);
    }

    setProfiles(updatedProfiles);
    saveProfilesToStorage(updatedProfiles);

    // 2. 소리 맞춤(캘리브레이션) 페이지로 이동
    if (onGoToCalibration) {
      onGoToCalibration();
    }
  };

  const handleLoadProfile = (p: Profile) => {
    setProfileName(p.name);
    setCalibrations([...p.calibrations]);
  };

  const handleDeleteProfile = (id: string, name: string) => {
    if (!confirm(lang === 'ko' ? `'${name}' 설정을 삭제하시겠습니까?` : `Are you sure you want to delete '${name}'?`)) return;
    const filtered = profiles.filter((p) => p.id !== id);
    setProfiles(filtered);
    saveProfilesToStorage(filtered);
  };

  return (
    <div className="flex flex-col justify-start items-stretch gap-3.5 w-full">
      {/* 1. 최상단 내비게이션 바 (IBM Carbon Card) */}
      <div className="flex items-center justify-between p-2.5 carbon-card rounded-xl shadow-xs text-xs">
        <button
          onClick={onBackToABTest}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold bg-[#e8e8e8] hover:bg-[#d0d0d0] dark:bg-[#393939] dark:hover:bg-[#525252] text-[#161616] dark:text-[#f4f4f4] transition-colors duration-150 cursor-pointer text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.export.backToAB}</span>
        </button>

        <span className="text-xs text-[#525252] dark:text-[#8d8d8d] font-medium hidden sm:inline">
          {t.export.desc}
        </span>

        <button
          onClick={handleRegeneratePreset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold bg-[#edf5ff] hover:bg-[#d0e2ff] dark:bg-[#002d9c]/40 dark:hover:bg-[#002d9c]/60 text-[#0f62fe] dark:text-[#78a9ff] border border-[#d0e2ff] dark:border-[#0043ce] transition-colors duration-150 shadow-xs cursor-pointer text-xs"
          title={lang === 'ko' ? '현재 조정된 프로필을 자동 저장하고 소리 맞춤 화면으로 이동합니다' : 'Auto-save profile and return to calibration'}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.export.recalibrateBtn}</span>
        </button>
      </div>

      {/* 2. 네비게이션 아래로 이동한 [Equalizer APO 앱 가이드 & 설치 지원 카드] */}
      <div className="p-3 carbon-card rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-[#0f62fe] flex-shrink-0" />
          <div>
            <div className="font-bold text-[#161616] dark:text-[#f4f4f4] text-xs sm:text-sm">
              {t.export.installBannerTitle}
            </div>
            <div className="text-[11px] text-[#525252] dark:text-[#c6c6c6] mt-0.5">
              {t.export.installBannerDesc}
            </div>
          </div>
        </div>

        {/* 가이드 팝업 버튼 및 설치 링크 버튼 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e8e8e8] hover:bg-[#d0d0d0] dark:bg-[#393939] dark:hover:bg-[#525252] text-[#161616] dark:text-[#f4f4f4] rounded font-semibold border border-[#e0e0e0] dark:border-[#525252] transition-colors duration-150 shadow-xs cursor-pointer text-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#0f62fe]" />
            <span>{t.export.guideModalTitle}</span>
          </button>

          <button
            onClick={() => setShowInstallModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#edf5ff] dark:bg-[#002d9c]/40 hover:bg-[#d0e2ff] dark:hover:bg-[#002d9c]/60 text-[#0f62fe] dark:text-[#78a9ff] rounded font-semibold border border-[#d0e2ff] dark:border-[#0043ce] transition-colors duration-150 shadow-xs cursor-pointer text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.export.installBannerTitle}</span>
          </button>
        </div>
      </div>

      {autoApplied && (
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-600/60 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Equalizer APO 설정 파일이 저장되었습니다. 시스템 사운드에 즉시 반영됩니다!</span>
        </div>
      )}

      {/* 3. 메인 2컬럼 레이아웃 (items-stretch: 긴 쪽 길이로 맞추고, 짧은 카드는 상-하로 퍼지도록 flex-col justify-between) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch w-full">
        {/* 좌측 7컬럼: 연동 옵션 (프로필명, Preamp, 파일 다운로드, 내 저장 프로필) */}
        <div className="md:col-span-7 h-full p-4 carbon-card rounded-xl shadow-xs flex flex-col justify-between gap-3.5">
          {/* 프로필 이름 및 Preamp 안전 설정 */}
          <div className="grid grid-cols-2 gap-3.5 pb-3 border-b border-[#e0e0e0] dark:border-[#393939]">
            <div>
              <label className="block text-[11px] font-semibold text-[#525252] dark:text-[#c6c6c6] mb-1">
                {t.export.deviceProfileLabel}
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={profileName}
                  placeholder={t.export.deviceProfilePlaceholder}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full carbon-subcard rounded px-2.5 py-1 text-xs text-[#161616] dark:text-[#f4f4f4] font-medium focus:outline-none focus:border-[#0f62fe]"
                />
                <button
                  onClick={handleCopyInputProfileName}
                  title={copiedInputName ? t.common.copied : t.export.copyNameTooltip}
                  className={`px-2 py-1 rounded text-xs font-semibold border transition-colors duration-150 flex items-center cursor-pointer shadow-xs ${
                    copiedInputName
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      : 'bg-[#e8e8e8] hover:bg-[#d0d0d0] dark:bg-[#393939] dark:hover:bg-[#525252] text-[#161616] dark:text-[#f4f4f4] border-[#e0e0e0] dark:border-[#525252]'
                  }`}
                >
                  {copiedInputName ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-[#525252] dark:text-[#c6c6c6]" />}
                </button>
                <button
                  onClick={handleSaveToProfileList}
                  title={t.export.saveProfileBtn}
                  className="px-2.5 py-1 bg-[#e8e8e8] hover:bg-[#d0d0d0] dark:bg-[#393939] dark:hover:bg-[#525252] text-[#161616] dark:text-[#f4f4f4] rounded text-xs font-semibold border border-[#e0e0e0] dark:border-[#525252] transition-colors duration-150 flex items-center cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5 text-[#0f62fe]" />
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-[11px] font-semibold text-[#525252] dark:text-[#c6c6c6] mb-1">
                <div className="flex items-center gap-1.5">
                  <span>{t.export.preampLabel}</span>
                  <button
                    onClick={() => setPreampDb(suggestedPreamp)}
                    title={`최대 증폭(+${maxBoost.toFixed(1)}dB) + 1dB 자동 계산값(${suggestedPreamp.toFixed(1)}dB)으로 재설정`}
                    className="px-1.5 py-0.2 rounded text-[10px] bg-[#edf5ff] dark:bg-[#002d9c]/40 text-[#0f62fe] dark:text-[#78a9ff] hover:underline font-semibold cursor-pointer border border-[#d0e2ff] dark:border-[#0043ce]"
                  >
                    {t.export.suggestedBadge}({suggestedPreamp.toFixed(1)}dB)
                  </button>
                </div>
                <span className="font-mono text-[#161616] dark:text-[#f4f4f4] font-bold text-xs">{preampDb.toFixed(1)} dB</span>
              </div>
              <input
                type="range"
                min="-16.0"
                max="0.0"
                step="0.1"
                value={preampDb}
                onChange={(e) => setPreampDb(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#d0d0d0] dark:bg-[#393939] rounded appearance-none cursor-pointer accent-[#0f62fe] mt-1.5"
              />
              <div className="flex justify-between text-[10px] text-[#8d8d8d] font-mono mt-0.5">
                <span>-16.0 dB</span>
                <span>{lang === 'ko' ? `최대 증폭 +${maxBoost.toFixed(1)}dB 반영` : `Max boost +${maxBoost.toFixed(1)}dB compensated`}</span>
                <span>0.0 dB</span>
              </div>
            </div>
          </div>

          {/* 설정 파일 다운로드 영역 */}
          <div className="space-y-3">
            <div className="p-3.5 carbon-subcard rounded-lg flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs sm:text-sm font-bold text-[#161616] dark:text-[#f4f4f4] flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#0f62fe]" />
                  <span>{t.export.downloadBtn}</span>
                </div>
                <div className="text-[11px] text-[#525252] dark:text-[#8d8d8d]">
                  {lang === 'ko' ? '내 귀에 맞춘 31/61밴드 캘리브레이션 값을 담은 공식 GraphicEQ 파일을 내려받습니다.' : 'Download official GraphicEQ file containing your personalized EQ calibration.'}
                </div>
              </div>

              <button
                onClick={handleDownloadBackup}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded font-bold text-xs bg-[#0f62fe] hover:bg-[#0353e9] text-white shadow-xs transition-all duration-150 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.export.downloadBtn}</span>
              </button>
            </div>
          </div>

          {/* 내 저장 프로필 (좌측 카드 다운로드 버튼 아래로 이동) */}
          <div className="pt-2.5 border-t border-[#e0e0e0] dark:border-[#393939] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#161616] dark:text-[#f4f4f4]">
              <span>{t.export.savedProfilesTitle} ({profiles.length})</span>
            </div>
            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {profiles.length === 0 ? (
                <div className="text-[11px] text-[#8d8d8d] py-1 text-center">
                  {t.export.noSavedProfiles}
                </div>
              ) : (
                profiles.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-1.5 carbon-subcard rounded text-xs gap-1.5"
                  >
                    <span
                      onClick={() => handleLoadProfile(p)}
                      title={`'${p.name}' 설정 불러오기`}
                      className="cursor-pointer text-[#161616] dark:text-[#f4f4f4] hover:text-[#0f62fe] truncate flex-1 font-medium text-xs"
                    >
                      {p.name}
                    </span>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => handleCopyProfileName(p.name, p.id)}
                        className={`p-1 rounded transition-colors duration-150 cursor-pointer ${
                          copiedProfileId === p.id
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                            : 'text-[#8d8d8d] hover:text-[#0f62fe] dark:hover:text-[#78a9ff]'
                        }`}
                        title={copiedProfileId === p.id ? t.common.copied : `'${p.name}' ${t.common.copy}`}
                      >
                        {copiedProfileId === p.id ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(p.id, p.name)}
                        className="text-[#8d8d8d] hover:text-[#da1e28] p-1 rounded transition-colors duration-150 cursor-pointer"
                        title={t.export.deleteProfileBtn}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 우측 5컬럼: GraphicEQ 실시간 미리보기 및 하단 클립보드 복사 버튼 배치 */}
        <div className="md:col-span-5 h-full p-4 carbon-card rounded-xl shadow-xs flex flex-col justify-between gap-3 w-full">
          <div className="text-[#161616] dark:text-[#f4f4f4] pb-2 border-b border-[#e0e0e0] dark:border-[#393939] font-bold text-xs flex items-center justify-between">
            <span>{t.export.previewTitle}</span>
            <span className="text-[10px] text-[#8d8d8d] font-normal">Channel: L / R</span>
          </div>

          <pre className="flex-1 min-h-[180px] max-h-[260px] overflow-y-auto whitespace-pre-wrap leading-tight p-2.5 carbon-subcard rounded-lg text-[#161616] dark:text-[#f4f4f4] font-mono text-[11px]">
            {apoConfigText}
          </pre>

          {/* 문법 미리보기 텍스트박스 하단에 배치된 전체 문법 클립보드 복사 버튼 */}
          <div className="pt-2 border-t border-[#e0e0e0] dark:border-[#393939] flex items-center justify-between text-xs">
            <span className="text-[11px] text-[#525252] dark:text-[#8d8d8d]">
              {lang === 'ko' ? '전체 텍스트 복사 후 config에 붙여넣기' : 'Copy and paste into config.txt'}
            </span>
            <button
              onClick={handleCopyClipboard}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded font-semibold text-xs bg-[#0f62fe] hover:bg-[#0353e9] text-white shadow-xs transition-all duration-150 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.common.copied : t.export.copySyntaxBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. 상세하면서도 쉬운 Equalizer APO 설정 가이드 팝업 모달 (dim 배경 클릭 시 닫기 구현) */}
      {showGuideModal && (
        <div
          onClick={() => setShowGuideModal(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs transition-opacity duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="carbon-card rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl cursor-default"
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#e0e0e0] dark:border-[#393939]">
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-[#161616] dark:text-[#f4f4f4]">
                <BookOpen className="w-4 h-4 text-[#0f62fe]" />
                <span>{t.export.guideModalTitle}</span>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-[#8d8d8d] hover:text-[#161616] dark:hover:text-[#ffffff] text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 단계별 깔끔한 가이드 (중복 제거 및 Instant mode 핵심 반영) */}
            <div className="space-y-3 text-xs text-[#525252] dark:text-[#c6c6c6] leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
              {/* 3단계 상세 순서 */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] space-y-1 shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#161616] dark:text-[#f4f4f4]">
                    <CheckCircle2 className="w-4 h-4 text-[#0f62fe]" />
                    <span>{t.export.guideStep1Title}</span>
                  </div>
                  <p className="text-[11px] text-[#525252] dark:text-[#c6c6c6]">
                    {t.export.guideStep1Desc}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 space-y-1 shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                    <span>{t.export.guideStep2Title}</span>
                  </div>
                  <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-tight">
                    {t.export.guideStep2Desc}
                  </p>
                  <p className="text-[10px] text-amber-800 dark:text-amber-300">
                    💡 {lang === 'ko' ? 'Instant mode가 켜져 있는지 확인하세요 (파일 저장 시 실시간 적용).' : 'Ensure [Instant mode] is checked in Configuration Editor for real-time changes.'}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] space-y-1 shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#161616] dark:text-[#f4f4f4]">
                    <CheckCircle2 className="w-4 h-4 text-[#0f62fe]" />
                    <span>{t.export.guideStep3Title}</span>
                  </div>
                  <p className="text-[11px] text-[#525252] dark:text-[#c6c6c6]">
                    {t.export.guideStep3Desc}
                  </p>
                </div>
              </div>

              {/* 해결 및 점검 체크리스트 (중복 제거) */}
              <div className="p-3 bg-[#f4f4f4] dark:bg-[#262626] rounded-lg border border-[#e0e0e0] dark:border-[#393939] text-xs space-y-1.5 shadow-xs">
                <div className="font-bold text-[#161616] dark:text-[#f4f4f4] flex items-center gap-1">
                  <span>💡 {lang === 'ko' ? '소리가 바뀌지 않거나 먹통일 때 점검 사항' : 'Troubleshooting Checklist'}</span>
                </div>
                <ul className="text-[11px] text-[#525252] dark:text-[#c6c6c6] list-disc list-inside space-y-1">
                  <li><strong>{lang === 'ko' ? '장치 활성화 확인:' : 'Check Playback Device:'}</strong> {lang === 'ko' ? 'Configurator 실행 ➡️ Playback devices에서 이어폰/헤드폰 장치에 체크 확인 (재부팅 필요)' : 'Open Configurator ➡️ verify your headphone playback device is checked (reboot required)'}</li>
                  <li><strong>{lang === 'ko' ? '필터 전원 확인:' : 'Check Power Icon:'}</strong> {lang === 'ko' ? '각 EQ 블록 좌측의 둥근 전원 아이콘(⭕)이 켜져 있는지 확인' : 'Verify the round power icon (⭕) on the EQ block is active'}</li>
                </ul>
              </div>
            </div>

            {/* 모달 닫기 버튼 */}
            <div className="flex justify-end pt-2 border-t border-[#e0e0e0] dark:border-[#393939]">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-[#0f62fe] hover:bg-[#0353e9] text-white rounded text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer"
              >
                {t.common.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Equalizer APO 앱 설치 및 초기 설정 가이드 팝업 모달 */}
      {showInstallModal && (
        <div
          onClick={() => setShowInstallModal(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs transition-opacity duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="carbon-card rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl cursor-default"
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#e0e0e0] dark:border-[#393939]">
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-[#161616] dark:text-[#f4f4f4]">
                <Download className="w-4 h-4 text-[#0f62fe]" />
                <span>{t.export.installModalTitle}</span>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                className="text-[#8d8d8d] hover:text-[#161616] dark:hover:text-[#ffffff] text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 설치 4단계 직관적 안내 */}
            <div className="space-y-2.5 text-xs text-[#525252] dark:text-[#c6c6c6] leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
              {/* 1단계 */}
              <div className="p-3 rounded-lg bg-white dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#161616] dark:text-[#f4f4f4] flex items-center gap-1.5 text-xs sm:text-sm">
                    <span className="w-5 h-5 rounded-full bg-[#0f62fe] text-white flex items-center justify-center text-[11px] font-bold">1</span>
                    <span>{t.export.installModalStep1Title}</span>
                  </div>
                  <a
                    href="https://sourceforge.net/projects/equalizerapo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0f62fe] hover:bg-[#0353e9] text-white rounded text-[11px] font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>SourceForge</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-[#525252] dark:text-[#c6c6c6]">
                  {t.export.installModalStep1Desc}
                </p>
              </div>

              {/* 2단계 */}
              <div className="p-3 rounded-lg bg-white dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] space-y-1 shadow-xs">
                <div className="font-bold text-[#161616] dark:text-[#f4f4f4] flex items-center gap-1.5 text-xs sm:text-sm">
                  <span className="w-5 h-5 rounded-full bg-[#0f62fe] text-white flex items-center justify-center text-[11px] font-bold">2</span>
                  <span>{t.export.installModalStep2Title}</span>
                </div>
                <p className="text-[11px] text-[#525252] dark:text-[#c6c6c6]">
                  {t.export.installModalStep2Desc}
                </p>
              </div>

              {/* 3단계 */}
              <div className="p-3 rounded-lg bg-white dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] space-y-1.5 shadow-xs">
                <div className="font-bold text-[#161616] dark:text-[#f4f4f4] flex items-center gap-1.5 text-xs sm:text-sm">
                  <span className="w-5 h-5 rounded-full bg-[#0f62fe] text-white flex items-center justify-center text-[11px] font-bold">3</span>
                  <span>{t.export.installModalStep3Title}</span>
                </div>
                <p className="text-[11px] text-[#525252] dark:text-[#c6c6c6]">
                  {t.export.installModalStep3Desc}
                </p>
              </div>

              {/* 4단계 */}
              <div className="p-3 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 space-y-1.5 shadow-xs">
                <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 text-xs sm:text-sm">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[11px] font-bold">4</span>
                  <span>{t.export.installModalStep4Title}</span>
                </div>
                <p className="text-[11px] text-amber-900 dark:text-amber-200">
                  {t.export.installModalStep4Desc}
                </p>
              </div>
            </div>

            {/* 모달 하단 버튼 영역 */}
            <div className="flex justify-between items-center pt-2 border-t border-[#e0e0e0] dark:border-[#393939]">
              <a
                href="https://sourceforge.net/projects/equalizerapo/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#0f62fe] dark:text-[#78a9ff] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{t.export.openSourceForge}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => setShowInstallModal(false)}
                className="px-4 py-2 bg-[#0f62fe] hover:bg-[#0353e9] text-white rounded text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
