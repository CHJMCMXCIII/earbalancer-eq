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
  BookOpen,
  Info,
  CheckCircle2,
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
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

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
      {/* 1. 최상단 내비게이션 바 (IBM Carbon Card) */}
      <div className="flex items-center justify-between p-2.5 carbon-card rounded-xl shadow-xs text-xs">
        <button
          onClick={onBackToABTest}
          className="flex items-center gap-1 px-3 py-1.5 rounded font-semibold bg-[#e8e8e8] hover:bg-[#d0d0d0] dark:bg-[#393939] dark:hover:bg-[#525252] text-[#161616] dark:text-[#f4f4f4] transition-colors duration-150 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>이전 (A/B 테스트로)</span>
        </button>

        <span className="text-[11px] text-[#525252] dark:text-[#8d8d8d] font-medium hidden sm:inline">
          모든 캘리브레이션이 완료되었습니다. Equalizer APO에 저장하세요!
        </span>

        <span className="text-[#8d8d8d] text-xs">Equalizer APO 규격</span>
      </div>

      {/* 2. 네비게이션 아래로 이동한 [Equalizer APO 앱 가이드 & 설치 지원 카드] */}
      <div className="p-3 carbon-card rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-[#0f62fe] flex-shrink-0" />
          <div>
            <div className="font-bold text-[#161616] dark:text-[#f4f4f4] text-xs">
              Equalizer APO 연동 및 설치 지원
            </div>
            <div className="text-[11px] text-[#525252] dark:text-[#c6c6c6]">
              설정 파일을 윈도우에 적용하는 방법을 확인하거나, 아직 프로그램이 없다면 무료로 내려받으세요.
            </div>
          </div>
        </div>

        {/* 가이드 팝업 버튼 및 설치 링크 버튼 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e8e8e8] hover:bg-[#d0d0d0] dark:bg-[#393939] dark:hover:bg-[#525252] text-[#161616] dark:text-[#f4f4f4] rounded font-semibold border border-[#e0e0e0] dark:border-[#525252] transition-colors duration-150 shadow-xs cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#0f62fe]" />
            <span>설정 가이드 보기</span>
          </button>

          <a
            href="https://sourceforge.net/projects/equalizerapo/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#edf5ff] dark:bg-[#002d9c]/40 hover:bg-[#d0e2ff] dark:hover:bg-[#002d9c]/60 text-[#0f62fe] dark:text-[#78a9ff] rounded font-semibold border border-[#d0e2ff] dark:border-[#0043ce] transition-colors duration-150 shadow-xs"
          >
            <span>Equalizer APO 앱 설치</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {autoApplied && (
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-600/60 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Equalizer APO 설정 파일이 저장되었습니다. 시스템 사운드에 즉시 반영됩니다!</span>
        </div>
      )}

      {/* 3. 메인 2컬럼 레이아웃 (items-stretch: 긴 쪽 길이로 맞추고, 짧은 카드는 상-하로 퍼지도록 flex-col justify-between) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch w-full">
        {/* 좌측 7컬럼: 연동 옵션 (자동 반영 vs 파일 다운로드) */}
        <div className="md:col-span-7 h-full p-4 carbon-card rounded-xl shadow-xs flex flex-col justify-between gap-3">
          {/* 프로필 이름 및 Preamp 안전 설정 */}
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#e0e0e0] dark:border-[#393939]">
            <div>
              <label className="block text-[11px] font-semibold text-[#525252] dark:text-[#c6c6c6] mb-1">
                기기 프로필명
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full carbon-subcard rounded px-2.5 py-1.5 text-xs text-[#161616] dark:text-[#f4f4f4] font-medium focus:outline-none focus:border-[#0f62fe]"
                />
                <button
                  onClick={handleSaveToProfileList}
                  title="현재 보정값을 이 이름으로 저장"
                  className="px-2.5 py-1.5 bg-[#e8e8e8] hover:bg-[#d0d0d0] dark:bg-[#393939] dark:hover:bg-[#525252] text-[#161616] dark:text-[#f4f4f4] rounded text-xs font-semibold border border-[#e0e0e0] dark:border-[#525252] transition-colors duration-150 flex items-center cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5 text-[#0f62fe]" />
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-[#525252] dark:text-[#c6c6c6] mb-1">
                <span>클리핑 방지 Preamp</span>
                <span className="font-mono text-[#161616] dark:text-[#f4f4f4] font-bold">{preampDb.toFixed(1)} dB</span>
              </div>
              <input
                type="range"
                min="-12.0"
                max="0.0"
                step="0.5"
                value={preampDb}
                onChange={(e) => setPreampDb(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#d0d0d0] dark:bg-[#393939] rounded appearance-none cursor-pointer accent-[#0f62fe] mt-2"
              />
            </div>
          </div>

          {/* 이원화 옵션 카드: 옵션 1 (자동 반영) vs 옵션 2 (다운로드) */}
          <div className="space-y-2.5 my-auto">
            {/* 옵션 1: 자동 반영하기 */}
            <div className="p-3 carbon-subcard rounded-lg flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#161616] dark:text-[#f4f4f4] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>옵션 1: Equalizer APO에 자동 반영하기 (권장)</span>
                </div>
                <div className="text-[11px] text-[#525252] dark:text-[#8d8d8d]">
                  APO config.txt로 바로 저장하여 재부팅 없이 실시간 적용
                </div>
              </div>

              <button
                onClick={handleAutoApplyToAPO}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded font-bold text-xs bg-[#198038] hover:bg-[#0e6027] text-white shadow-xs transition-all duration-150 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>자동 반영 적용</span>
              </button>
            </div>

            {/* 옵션 2: 파일 다운로드하기 */}
            <div className="p-3 carbon-subcard rounded-lg flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#161616] dark:text-[#f4f4f4] flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#0f62fe]" />
                  <span>옵션 2: 설정 파일 (.txt) 직접 다운로드</span>
                </div>
                <div className="text-[11px] text-[#525252] dark:text-[#8d8d8d]">
                  수동 보관 또는 다른 PC용 설정 파일 저장
                </div>
              </div>

              <button
                onClick={handleDownloadBackup}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded font-semibold text-xs bg-[#e8e8e8] hover:bg-[#d0d0d0] dark:bg-[#393939] dark:hover:bg-[#525252] text-[#161616] dark:text-[#f4f4f4] border border-[#e0e0e0] dark:border-[#525252] transition-colors duration-150 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>파일 다운로드</span>
              </button>
            </div>
          </div>

          {/* 클립보드 복사 바 */}
          <div className="flex items-center justify-between pt-2 border-t border-[#e0e0e0] dark:border-[#393939] text-xs">
            <span className="text-[11px] text-[#525252] dark:text-[#8d8d8d]">
              Equalizer APO 규격: GraphicEQ (Channel: L / R 개별 분리)
            </span>
            <button
              onClick={handleCopyClipboard}
              className="flex items-center gap-1 text-[11px] text-[#0f62fe] dark:text-[#78a9ff] hover:underline cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? '복사됨!' : '전체 문법 클립보드 복사'}</span>
            </button>
          </div>
        </div>

        {/* 우측 5컬럼: 프로필 목록 & GraphicEQ 실시간 미리보기 (h-full & justify-between) */}
        <div className="md:col-span-5 h-full flex flex-col justify-between gap-3 w-full">
          {/* 내 프로필 목록 */}
          <div className="p-3 carbon-card rounded-xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#161616] dark:text-[#f4f4f4]">
              <span>내 저장 프로필 ({profiles.length})</span>
            </div>
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-1.5 carbon-subcard rounded text-xs"
                >
                  <span
                    onClick={() => handleLoadProfile(p)}
                    className="cursor-pointer text-[#161616] dark:text-[#f4f4f4] hover:text-[#0f62fe] truncate flex-1 font-medium"
                  >
                    {p.name}
                  </span>
                  <button
                    onClick={() => handleDeleteProfile(p.id, p.name)}
                    className="text-[#8d8d8d] hover:text-[#da1e28] p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* GraphicEQ 미리보기 (flex-1로 채워짐) */}
          <div className="p-3 carbon-subcard rounded-xl font-mono text-[10px] text-[#525252] dark:text-[#c6c6c6] flex-1 flex flex-col justify-between shadow-xs">
            <div className="text-[#161616] dark:text-[#f4f4f4] pb-1 border-b border-[#e0e0e0] dark:border-[#393939] font-bold">
              Equalizer APO GraphicEQ 문법 미리보기
            </div>
            <pre className="max-h-36 overflow-y-auto whitespace-pre-wrap leading-tight my-auto text-[#161616] dark:text-[#f4f4f4]">
              {apoConfigText}
            </pre>
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
            <div className="flex items-center justify-between pb-2 border-b border-[#e0e0e0] dark:border-[#393939]">
              <div className="flex items-center gap-2 font-bold text-sm text-[#161616] dark:text-[#f4f4f4]">
                <BookOpen className="w-4 h-4 text-[#0f62fe]" />
                <span>Equalizer APO 설정 파일 반영 가이드</span>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-[#8d8d8d] hover:text-[#161616] dark:hover:text-[#ffffff] text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 단계별 쉬운 가이드 */}
            <div className="space-y-3 text-xs text-[#525252] dark:text-[#c6c6c6] leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-2.5 bg-[#edf5ff] dark:bg-[#002d9c]/30 rounded-lg border border-[#d0e2ff] dark:border-[#0043ce] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#0f62fe] flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-[#002d9c] dark:text-[#78a9ff]">
                  Equalizer APO는 윈도우의 사운드를 주파수별로 실시간 보정해주는 무료 프로그램입니다. 아래 방법 중 편한 것을 선택하세요!
                </span>
              </div>

              {/* 방법 1: 가장 추천하는 자동 반영 */}
              <div className="p-3 carbon-subcard rounded-lg space-y-1">
                <div className="font-bold text-[#161616] dark:text-[#f4f4f4] flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>방법 1: [자동 반영 적용] 버튼 사용 (가장 쉬움)</span>
                </div>
                <ol className="text-[11px] text-[#525252] dark:text-[#c6c6c6] list-decimal list-inside space-y-1 pl-1">
                  <li>화면의 초록색 <strong>[자동 반영 적용]</strong> 버튼을 누릅니다.</li>
                  <li>파일 저장 창이 열리면 <code className="bg-[#e0e0e0] dark:bg-[#393939] px-1 py-0.5 rounded text-[#0f62fe] dark:text-[#78a9ff] font-mono">C:\Program Files\EqualizerAPO\config\</code> 폴더로 이동하여 <strong>config.txt</strong>로 저장합니다.</li>
                  <li>저장하는 순간 윈도우 사운드에 즉시 실시간 적용됩니다!</li>
                </ol>
              </div>

              {/* 방법 2: 수동 파일 다운로드 및 Include */}
              <div className="p-3 carbon-subcard rounded-lg space-y-1">
                <div className="font-bold text-[#161616] dark:text-[#f4f4f4] flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0f62fe]" />
                  <span>방법 2: 파일 다운로드 후 직접 추가하기</span>
                </div>
                <ol className="text-[11px] text-[#525252] dark:text-[#c6c6c6] list-decimal list-inside space-y-1 pl-1">
                  <li><strong>[파일 다운로드]</strong> 버튼을 눌러 설정 텍스트 파일을 내려받습니다.</li>
                  <li>다운로드한 파일을 <code className="bg-[#e0e0e0] dark:bg-[#393939] px-1 py-0.5 rounded font-mono text-[#0f62fe] dark:text-[#78a9ff]">C:\Program Files\EqualizerAPO\config\</code> 안에 넣습니다.</li>
                  <li>시작 메뉴에서 <strong>Configuration Editor</strong>를 실행합니다.</li>
                  <li>초록색 <strong>+</strong> 버튼 ➡️ <strong>Control</strong> ➡️ <strong>Include (Include configuration file)</strong>을 선택한 후 방금 넣은 파일을 지정하면 끝납니다.</li>
                </ol>
              </div>

              {/* 해결 팁 */}
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200">
                💡 <strong>소리가 바뀌지 않나요?</strong><br />
                시작 메뉴에서 <strong>Configurator</strong>를 검색하여 실행한 뒤, 현재 사용 중인 헤드폰/스피커 장치에 체크 표시(V)가 되어 있는지 확인해주세요.
              </div>
            </div>

            {/* 모달 닫기 버튼 */}
            <div className="flex justify-end pt-2 border-t border-[#e0e0e0] dark:border-[#393939]">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-1.5 bg-[#0f62fe] hover:bg-[#0353e9] text-white rounded text-xs font-semibold transition-colors duration-150 cursor-pointer"
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
