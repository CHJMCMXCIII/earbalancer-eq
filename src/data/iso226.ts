// ISO 226:2003 Equal Loudness Contour (등청감 곡선) 데이터 및 보간 유틸리티

export interface FrequencyBand {
  id: number;
  freq: number;
  label: string;
  is10Band: boolean; // 10단계 모드 포함 여부
  isoCompDb: number; // 60 Phon 기준 1kHz 대비 사람 청각 보정 dB 오프셋 (체감 음량 동일화)
  description: string; // 알기 쉬운 음역대 설명 (UX 용어)
}

// 31밴드 표준 주파수 (1/3 옥타브) 및 10밴드 (1 옥타브) 매핑
export const FREQUENCY_BANDS: FrequencyBand[] = [
  { id: 0, freq: 20, label: "20 Hz", is10Band: false, isoCompDb: 35.0, description: "극저음 (몸으로 느끼는 진동)" },
  { id: 1, freq: 25, label: "25 Hz", is10Band: false, isoCompDb: 30.0, description: "극저음 (서브우퍼 묵직함)" },
  { id: 2, freq: 31.5, label: "31.5 Hz", is10Band: true, isoCompDb: 25.0, description: "최저음 (웅장한 베이스 울림)" },
  { id: 3, freq: 40, label: "40 Hz", is10Band: false, isoCompDb: 21.0, description: "초저음 (킥드럼의 가장 낮은 바닥)" },
  { id: 4, freq: 50, label: "50 Hz", is10Band: false, isoCompDb: 17.5, description: "초저음 (베이스 기타의 깊은 울림)" },
  { id: 5, freq: 63, label: "63 Hz", is10Band: true, isoCompDb: 14.5, description: "저음 (단단한 타격감의 시작)" },
  { id: 6, freq: 80, label: "80 Hz", is10Band: false, isoCompDb: 11.5, description: "저음 (가슴을 울리는 비트)" },
  { id: 7, freq: 100, label: "100 Hz", is10Band: false, isoCompDb: 9.0, description: "저음 (드럼 킥의 묵직한 중심)" },
  { id: 8, freq: 125, label: "125 Hz", is10Band: true, isoCompDb: 7.0, description: "중저음 (베이스 음정의 뚜렷함)" },
  { id: 9, freq: 160, label: "160 Hz", is10Band: false, isoCompDb: 5.0, description: "중저음 (따뜻한 남성 보컬 저역)" },
  { id: 10, freq: 200, label: "200 Hz", is10Band: false, isoCompDb: 3.5, description: "중저음 (소리의 두께감과 풍성함)" },
  { id: 11, freq: 250, label: "250 Hz", is10Band: true, isoCompDb: 2.2, description: "중저음 (먹먹함과 선명함의 경계)" },
  { id: 12, freq: 315, label: "315 Hz", is10Band: false, isoCompDb: 1.2, description: "중음 (피아노와 보컬의 기음)" },
  { id: 13, freq: 400, label: "400 Hz", is10Band: false, isoCompDb: 0.5, description: "중음 (자연스러운 목소리 톤)" },
  { id: 14, freq: 500, label: "500 Hz", is10Band: true, isoCompDb: 0.0, description: "중음 (라디오/보컬의 핵심 중심)" },
  { id: 15, freq: 630, label: "630 Hz", is10Band: false, isoCompDb: -0.2, description: "중음 (말소리의 선명한 전달력)" },
  { id: 16, freq: 800, label: "800 Hz", is10Band: false, isoCompDb: -0.3, description: "중음 (악기들의 존재감)" },
  { id: 17, freq: 1000, label: "1 kHz", is10Band: true, isoCompDb: 0.0, description: "기준음 (인간의 청각 표준 기준점)" },
  { id: 18, freq: 1250, label: "1.25 kHz", is10Band: false, isoCompDb: -0.8, description: "중고음 (가수의 발음 전달력)" },
  { id: 19, freq: 1600, label: "1.6 kHz", is10Band: false, isoCompDb: -1.5, description: "중고음 (또렷한 가사 전달)" },
  { id: 20, freq: 2000, label: "2 kHz", is10Band: true, isoCompDb: -2.3, description: "중고음 (가장 귀가 예민하게 듣는 소리)" },
  { id: 21, freq: 2500, label: "2.5 kHz", is10Band: false, isoCompDb: -3.2, description: "중고음 (선명도와 귀의 피로도 영향)" },
  { id: 22, freq: 3150, label: "3.15 kHz", is10Band: false, isoCompDb: -3.8, description: "고음 (인간의 귀가 가장 민감한 정점)" },
  { id: 23, freq: 4000, label: "4 kHz", is10Band: true, isoCompDb: -3.2, description: "고음 (금속성 어택감과 존재감)" },
  { id: 24, freq: 5000, label: "5 kHz", is10Band: false, isoCompDb: -2.0, description: "고음 (기타 피크 소리, 보컬의 숨결)" },
  { id: 25, freq: 6300, label: "6.3 kHz", is10Band: false, isoCompDb: -2.8, description: "초고음 (치찰음: 시옷/치읓 발음)" },
  { id: 26, freq: 8000, label: "8 kHz", is10Band: true, isoCompDb: -3.5, description: "초고음 (심벌즈의 찰랑거림, 외이도 감도 감쇄)" },
  { id: 27, freq: 10000, label: "10 kHz", is10Band: false, isoCompDb: -1.5, description: "초고음 (투명한 공간감과 공기감)" },
  { id: 28, freq: 12500, label: "12.5 kHz", is10Band: false, isoCompDb: 0.0, description: "초고음 (반짝이는 디테일)" },
  { id: 29, freq: 16000, label: "16 kHz", is10Band: true, isoCompDb: 4.0, description: "극고음 (귀 끝에서 흩어지는 공기 소리)" },
  { id: 30, freq: 20000, label: "20 kHz", is10Band: false, isoCompDb: 9.0, description: "극고음 (가청 주파수의 한계 영역)" },
];

export const TEN_BAND_INDICES = FREQUENCY_BANDS
  .map((b, idx) => (b.is10Band ? idx : -1))
  .filter((idx) => idx !== -1);

/**
 * 10밴드 캘리브레이션 결과로부터 31밴드로 선형/스플라인 보간(Interpolation)하는 함수
 * "비슷한 주파수 한 번에 채우기" 기능
 */
export function interpolate10to31Bands(
  tenBandGains: { [bandId: number]: { leftDb: number; rightDb: number; phaseDeg: number } }
): { leftDb: number; rightDb: number; phaseDeg: number }[] {
  const result: { leftDb: number; rightDb: number; phaseDeg: number }[] = [];

  const sampledIndices = TEN_BAND_INDICES;

  for (let i = 0; i < FREQUENCY_BANDS.length; i++) {
    // 만약 10밴드에 속해 있다면 직접 값 매핑
    if (FREQUENCY_BANDS[i].is10Band && tenBandGains[i]) {
      result.push({ ...tenBandGains[i] });
      continue;
    }

    // 앞뒤의 가장 가까운 10밴드 탐색
    let prevIdx = sampledIndices[0];
    let nextIdx = sampledIndices[sampledIndices.length - 1];

    for (let k = 0; k < sampledIndices.length; k++) {
      if (sampledIndices[k] <= i) {
        prevIdx = sampledIndices[k];
      }
      if (sampledIndices[k] >= i) {
        nextIdx = sampledIndices[k];
        break;
      }
    }

    if (prevIdx === nextIdx) {
      const g = tenBandGains[prevIdx] || { leftDb: 0, rightDb: 0, phaseDeg: 0 };
      result.push({ ...g });
    } else {
      // 로그 주파수 공간에서의 비율(t) 계산
      const fMin = Math.log10(FREQUENCY_BANDS[prevIdx].freq);
      const fMax = Math.log10(FREQUENCY_BANDS[nextIdx].freq);
      const fCurr = Math.log10(FREQUENCY_BANDS[i].freq);
      const t = (fCurr - fMin) / (fMax - fMin);

      const gPrev = tenBandGains[prevIdx] || { leftDb: 0, rightDb: 0, phaseDeg: 0 };
      const gNext = tenBandGains[nextIdx] || { leftDb: 0, rightDb: 0, phaseDeg: 0 };

      result.push({
        leftDb: Number((gPrev.leftDb * (1 - t) + gNext.leftDb * t).toFixed(2)),
        rightDb: Number((gPrev.rightDb * (1 - t) + gNext.rightDb * t).toFixed(2)),
        phaseDeg: Math.round(gPrev.phaseDeg * (1 - t) + gNext.phaseDeg * t),
      });
    }
  }

  return result;
}
