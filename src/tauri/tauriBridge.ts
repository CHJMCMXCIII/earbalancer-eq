// Equalizer APO 내보내기 및 시스템 브릿지 (Tauri 및 웹 브라우저 호환)

export interface APOExportOptions {
  profileName: string;
  bands: { freq: number; leftDb: number; rightDb: number }[];
  preampDb?: number;
}

/**
 * Equalizer APO 규격 GraphicEQ 포맷 문자열 생성
 */
export function generateAPOConfigText(options: APOExportOptions): string {
  const { profileName, bands, preampDb = -3.0 } = options;

  // 헤더 및 생성 일자
  const dateStr = new Date().toLocaleString('ko-KR');
  const lines: string[] = [
    `# ===================================================`,
    `# EarBalancer EQ 자동 생성 캘리브레이션 프로필`,
    `# 프로필명: ${profileName}`,
    `# 생성일시: ${dateStr}`,
    `# ===================================================`,
    ``,
    `# [안전 장치] 디지털 클리핑 방지를 위한 Preamp`,
    `Preamp: ${preampDb.toFixed(1)} dB`,
    ``,
    `# ---------------------------------------------------`,
    `# [왼쪽 귀 (Channel: L) 31-Band 보정]`,
    `# ---------------------------------------------------`,
    `Channel: L`,
  ];

  // Left GraphicEQ 생성
  const leftPairs = bands.map((b) => `${b.freq} ${b.leftDb.toFixed(1)}`).join('; ');
  lines.push(`GraphicEQ: ${leftPairs}`);
  lines.push(``);

  // Right GraphicEQ 생성
  lines.push(`# ---------------------------------------------------`);
  lines.push(`# [오른쪽 귀 (Channel: R) 31-Band 보정]`);
  lines.push(`# ---------------------------------------------------`);
  lines.push(`Channel: R`);
  const rightPairs = bands.map((b) => `${b.freq} ${b.rightDb.toFixed(1)}`).join('; ');
  lines.push(`GraphicEQ: ${rightPairs}`);
  lines.push(``);

  lines.push(`# EarBalancer EQ 보정 완료 - 청력 맞춤 사운드를 즐기세요!`);

  return lines.join('\n');
}

/**
 * 브라우저에서 설정 파일을 .txt로 즉시 다운로드
 */
export function downloadAPOConfigFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Tauri 환경 또는 브라우저 환경에 맞춰 파일 저장 시도
 */
export async function saveAPOConfig(
  profileName: string,
  content: string
): Promise<{ success: boolean; path: string; message: string }> {
  // Tauri IPC 감지
  const tauriWindow = (window as unknown as { __TAURI__?: { invoke: (cmd: string, args: Record<string, unknown>) => Promise<unknown> } }).__TAURI__;

  const defaultFileName = `EarBalancer_${profileName.replace(/[^\w\s가-힣-]/g, '')}.txt`;

  if (tauriWindow && typeof tauriWindow.invoke === 'function') {
    try {
      const res = await tauriWindow.invoke('save_apo_config', {
        filename: defaultFileName,
        content: content,
      }) as { success: boolean; path: string; message: string };
      return res;
    } catch (err: unknown) {
      console.warn('Tauri save failed, falling back to download:', err);
    }
  }

  // 브라우저 모드: 즉시 다운로드 제공
  downloadAPOConfigFile(defaultFileName, content);
  return {
    success: true,
    path: `다운로드 폴더 (${defaultFileName})`,
    message: '설정 파일이 다운로드되었습니다. Equalizer APO config 폴더에 복사하거나 Include 하세요.',
  };
}
