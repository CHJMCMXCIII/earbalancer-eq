// ISO 226:2003 Equal Loudness Contour (등청감 곡선) 데이터 및 보간 유틸리티

export interface FrequencyBand {
  id: number;
  freq: number;
  label: string;
  is10Band?: boolean; // 10단계 모드 포함 여부
  is31Band?: boolean; // 31단계 표준 밴드 여부
  isoCompDb: number; // 60 Phon 기준 1kHz 대비 사람 청각 보정 dB 오프셋 (체감 음량 동일화)
  description: string; // 알기 쉬운 음역대 설명 (UX 용어)
  q?: number; // 대역폭 필터 Q값 (31밴드: 4.31, 61밴드: 8.65)
}

// 31밴드 표준 주파수 (1/3 옥타브, Q=4.31)
export const FREQUENCY_BANDS: FrequencyBand[] = [
  { id: 0, freq: 20, label: "20 Hz", is10Band: false, is31Band: true, isoCompDb: 35.0, description: "극저음 (몸으로 느끼는 진동)", q: 4.31 },
  { id: 1, freq: 25, label: "25 Hz", is10Band: false, is31Band: true, isoCompDb: 30.0, description: "극저음 (서브우퍼 묵직함)", q: 4.31 },
  { id: 2, freq: 31.5, label: "31.5 Hz", is10Band: true, is31Band: true, isoCompDb: 25.0, description: "최저음 (웅장한 베이스 울림)", q: 4.31 },
  { id: 3, freq: 40, label: "40 Hz", is10Band: false, is31Band: true, isoCompDb: 21.0, description: "초저음 (킥드럼의 가장 낮은 바닥)", q: 4.31 },
  { id: 4, freq: 50, label: "50 Hz", is10Band: false, is31Band: true, isoCompDb: 17.5, description: "초저음 (베이스 기타의 깊은 울림)", q: 4.31 },
  { id: 5, freq: 63, label: "63 Hz", is10Band: true, is31Band: true, isoCompDb: 14.5, description: "저음 (단단한 타격감의 시작)", q: 4.31 },
  { id: 6, freq: 80, label: "80 Hz", is10Band: false, is31Band: true, isoCompDb: 11.5, description: "저음 (가슴을 울리는 비트)", q: 4.31 },
  { id: 7, freq: 100, label: "100 Hz", is10Band: false, is31Band: true, isoCompDb: 9.0, description: "저음 (드럼 킥의 묵직한 중심)", q: 4.31 },
  { id: 8, freq: 125, label: "125 Hz", is10Band: true, is31Band: true, isoCompDb: 7.0, description: "중저음 (베이스 음정의 뚜렷함)", q: 4.31 },
  { id: 9, freq: 160, label: "160 Hz", is10Band: false, is31Band: true, isoCompDb: 5.0, description: "중저음 (따뜻한 남성 보컬 저역)", q: 4.31 },
  { id: 10, freq: 200, label: "200 Hz", is10Band: false, is31Band: true, isoCompDb: 3.5, description: "중저음 (소리의 두께감과 풍성함)", q: 4.31 },
  { id: 11, freq: 250, label: "250 Hz", is10Band: true, is31Band: true, isoCompDb: 2.2, description: "중저음 (먹먹함과 선명함의 경계)", q: 4.31 },
  { id: 12, freq: 315, label: "315 Hz", is10Band: false, is31Band: true, isoCompDb: 1.2, description: "중음 (피아노와 보컬의 기음)", q: 4.31 },
  { id: 13, freq: 400, label: "400 Hz", is10Band: false, is31Band: true, isoCompDb: 0.5, description: "중음 (자연스러운 목소리 톤)", q: 4.31 },
  { id: 14, freq: 500, label: "500 Hz", is10Band: true, is31Band: true, isoCompDb: 0.0, description: "중음 (라디오/보컬의 핵심 중심)", q: 4.31 },
  { id: 15, freq: 630, label: "630 Hz", is10Band: false, is31Band: true, isoCompDb: -0.2, description: "중음 (말소리의 선명한 전달력)", q: 4.31 },
  { id: 16, freq: 800, label: "800 Hz", is10Band: false, is31Band: true, isoCompDb: -0.3, description: "중음 (악기들의 존재감)", q: 4.31 },
  { id: 17, freq: 1000, label: "1 kHz", is10Band: true, is31Band: true, isoCompDb: 0.0, description: "기준음 (인간의 청각 표준 기준점)", q: 4.31 },
  { id: 18, freq: 1250, label: "1.25 kHz", is10Band: false, is31Band: true, isoCompDb: -0.8, description: "중고음 (가수의 발음 전달력)", q: 4.31 },
  { id: 19, freq: 1600, label: "1.6 kHz", is10Band: false, is31Band: true, isoCompDb: -1.5, description: "중고음 (또렷한 가사 전달)", q: 4.31 },
  { id: 20, freq: 2000, label: "2 kHz", is10Band: true, is31Band: true, isoCompDb: -2.3, description: "중고음 (가장 귀가 예민하게 듣는 소리)", q: 4.31 },
  { id: 21, freq: 2500, label: "2.5 kHz", is10Band: false, is31Band: true, isoCompDb: -3.2, description: "중고음 (선명도와 귀의 피로도 영향)", q: 4.31 },
  { id: 22, freq: 3150, label: "3.15 kHz", is10Band: false, is31Band: true, isoCompDb: -3.8, description: "고음 (인간의 귀가 가장 민감한 정점)", q: 4.31 },
  { id: 23, freq: 4000, label: "4 kHz", is10Band: true, is31Band: true, isoCompDb: -3.2, description: "고음 (금속성 어택감과 존재감)", q: 4.31 },
  { id: 24, freq: 5000, label: "5 kHz", is10Band: false, is31Band: true, isoCompDb: -2.0, description: "고음 (기타 피크 소리, 보컬의 숨결)", q: 4.31 },
  { id: 25, freq: 6300, label: "6.3 kHz", is10Band: false, is31Band: true, isoCompDb: -2.8, description: "초고음 (치찰음: 시옷/치읓 발음)", q: 4.31 },
  { id: 26, freq: 8000, label: "8 kHz", is10Band: true, is31Band: true, isoCompDb: -3.5, description: "초고음 (심벌즈의 찰랑거림, 외이도 감도 감쇄)", q: 4.31 },
  { id: 27, freq: 10000, label: "10 kHz", is10Band: false, is31Band: true, isoCompDb: -1.5, description: "초고음 (투명한 공간감과 공기감)", q: 4.31 },
  { id: 28, freq: 12500, label: "12.5 kHz", is10Band: false, is31Band: true, isoCompDb: 0.0, description: "초고음 (반짝이는 디테일)", q: 4.31 },
  { id: 29, freq: 16000, label: "16 kHz", is10Band: true, is31Band: true, isoCompDb: 4.0, description: "극고음 (귀 끝에서 흩어지는 공기 소리)", q: 4.31 },
  { id: 30, freq: 20000, label: "20 kHz", is10Band: false, is31Band: true, isoCompDb: 9.0, description: "극고음 (가청 주파수의 한계 영역)", q: 4.31 },
];

// 61밴드 ISO 266 1/6 옥타브 표준 주파수 (Q=8.65)
// 짝수 인덱스(0, 2, 4, ... 60)는 31밴드 표준과 100% 일치하며, 홀수 인덱스는 1/6 옥타브 중간 주파수 대역입니다.
export const FREQUENCY_BANDS_61: FrequencyBand[] = [
  { id: 0, freq: 20, label: "20 Hz", is31Band: true, isoCompDb: 35.0, description: "극저음 (몸으로 느끼는 진동)", q: 8.65 },
  { id: 1, freq: 22.4, label: "22.4 Hz", is31Band: false, isoCompDb: 32.5, description: "극저음 (서브 베이스의 최하단)", q: 8.65 },
  { id: 2, freq: 25, label: "25 Hz", is31Band: true, isoCompDb: 30.0, description: "극저음 (서브우퍼 묵직함)", q: 8.65 },
  { id: 3, freq: 28, label: "28 Hz", is31Band: false, isoCompDb: 27.5, description: "최저음 (웅장한 베이스 기저대역)", q: 8.65 },
  { id: 4, freq: 31.5, label: "31.5 Hz", is31Band: true, isoCompDb: 25.0, description: "최저음 (웅장한 베이스 울림)", q: 8.65 },
  { id: 5, freq: 35.5, label: "35.5 Hz", is31Band: false, isoCompDb: 23.0, description: "초저음 (파이프오르간·초저역 베이스)", q: 8.65 },
  { id: 6, freq: 40, label: "40 Hz", is31Band: true, isoCompDb: 21.0, description: "초저음 (킥드럼의 가장 낮은 바닥)", q: 8.65 },
  { id: 7, freq: 45, label: "45 Hz", is31Band: false, isoCompDb: 19.2, description: "초저음 (EDM·힙합 묵직한 서브 펀치)", q: 8.65 },
  { id: 8, freq: 50, label: "50 Hz", is31Band: true, isoCompDb: 17.5, description: "초저음 (베이스 기타의 깊은 울림)", q: 8.65 },
  { id: 9, freq: 56, label: "56 Hz", is31Band: false, isoCompDb: 16.0, description: "저음 (단단한 저음의 바닥)", q: 8.65 },
  { id: 10, freq: 63, label: "63 Hz", is31Band: true, isoCompDb: 14.5, description: "저음 (단단한 타격감의 시작)", q: 8.65 },
  { id: 11, freq: 71, label: "71 Hz", is31Band: false, isoCompDb: 13.0, description: "저음 (베이스 리듬의 단단함)", q: 8.65 },
  { id: 12, freq: 80, label: "80 Hz", is31Band: true, isoCompDb: 11.5, description: "저음 (가슴을 울리는 비트)", q: 8.65 },
  { id: 13, freq: 90, label: "90 Hz", is31Band: false, isoCompDb: 10.2, description: "저음 (킥드럼의 어택감과 두께)", q: 8.65 },
  { id: 14, freq: 100, label: "100 Hz", is31Band: true, isoCompDb: 9.0, description: "저음 (드럼 킥의 묵직한 중심)", q: 8.65 },
  { id: 15, freq: 112, label: "112 Hz", is31Band: false, isoCompDb: 8.0, description: "중저음 (베이스 기타의 명확성)", q: 8.65 },
  { id: 16, freq: 125, label: "125 Hz", is31Band: true, isoCompDb: 7.0, description: "중저음 (베이스 음정의 뚜렷함)", q: 8.65 },
  { id: 17, freq: 140, label: "140 Hz", is31Band: false, isoCompDb: 6.0, description: "중저음 (풍성한 저역 바디감)", q: 8.65 },
  { id: 18, freq: 160, label: "160 Hz", is31Band: true, isoCompDb: 5.0, description: "중저음 (따뜻한 남성 보컬 저역)", q: 8.65 },
  { id: 19, freq: 180, label: "180 Hz", is31Band: false, isoCompDb: 4.2, description: "중저음 (악기 소리의 따스함)", q: 8.65 },
  { id: 20, freq: 200, label: "200 Hz", is31Band: true, isoCompDb: 3.5, description: "중저음 (소리의 두께감과 풍성함)", q: 8.65 },
  { id: 21, freq: 224, label: "224 Hz", is31Band: false, isoCompDb: 2.8, description: "중저음 (보컬의 자연스러운 질감)", q: 8.65 },
  { id: 22, freq: 250, label: "250 Hz", is31Band: true, isoCompDb: 2.2, description: "중저음 (먹먹함과 선명함의 경계)", q: 8.65 },
  { id: 23, freq: 280, label: "280 Hz", is31Band: false, isoCompDb: 1.7, description: "중음 (탁함 없는 맑은 전달력)", q: 8.65 },
  { id: 24, freq: 315, label: "315 Hz", is31Band: true, isoCompDb: 1.2, description: "중음 (피아노와 보컬의 기음)", q: 8.65 },
  { id: 25, freq: 355, label: "355 Hz", is31Band: false, isoCompDb: 0.8, description: "중음 (어쿠스틱 악기의 몸체 울림)", q: 8.65 },
  { id: 26, freq: 400, label: "400 Hz", is31Band: true, isoCompDb: 0.5, description: "중음 (자연스러운 목소리 톤)", q: 8.65 },
  { id: 27, freq: 450, label: "450 Hz", is31Band: false, isoCompDb: 0.2, description: "중음 (보컬 음색의 균형감)", q: 8.65 },
  { id: 28, freq: 500, label: "500 Hz", is31Band: true, isoCompDb: 0.0, description: "중음 (라디오/보컬의 핵심 중심)", q: 8.65 },
  { id: 29, freq: 560, label: "560 Hz", is31Band: false, isoCompDb: -0.1, description: "중음 (목소리의 밀도와 명료함)", q: 8.65 },
  { id: 30, freq: 630, label: "630 Hz", is31Band: true, isoCompDb: -0.2, description: "중음 (말소리의 선명한 전달력)", q: 8.65 },
  { id: 31, freq: 710, label: "710 Hz", is31Band: false, isoCompDb: -0.25, description: "중음 (악기 배음의 선명함)", q: 8.65 },
  { id: 32, freq: 800, label: "800 Hz", is31Band: true, isoCompDb: -0.3, description: "중음 (악기들의 존재감)", q: 8.65 },
  { id: 33, freq: 900, label: "900 Hz", is31Band: false, isoCompDb: -0.15, description: "중음 (보컬의 직진성과 중심감)", q: 8.65 },
  { id: 34, freq: 1000, label: "1 kHz", is31Band: true, isoCompDb: 0.0, description: "기준음 (인간의 청각 표준 기준점)", q: 8.65 },
  { id: 35, freq: 1120, label: "1.12 kHz", is31Band: false, isoCompDb: -0.4, description: "중고음 (명료한 발음과 자음)", q: 8.65 },
  { id: 36, freq: 1250, label: "1.25 kHz", is31Band: true, isoCompDb: -0.8, description: "중고음 (가수의 발음 전달력)", q: 8.65 },
  { id: 37, freq: 1400, label: "1.4 kHz", is31Band: false, isoCompDb: -1.1, description: "중고음 (현악기 배음과 선명도)", q: 8.65 },
  { id: 38, freq: 1600, label: "1.6 kHz", is31Band: true, isoCompDb: -1.5, description: "중고음 (또렷한 가사 전달)", q: 8.65 },
  { id: 39, freq: 1800, label: "1.8 kHz", is31Band: false, isoCompDb: -1.9, description: "중고음 (보컬의 전진감)", q: 8.65 },
  { id: 40, freq: 2000, label: "2 kHz", is31Band: true, isoCompDb: -2.3, description: "중고음 (가장 귀가 예민하게 듣는 소리)", q: 8.65 },
  { id: 41, freq: 2240, label: "2.24 kHz", is31Band: false, isoCompDb: -2.7, description: "중고음 (귀의 예민도 피크 영역)", q: 8.65 },
  { id: 42, freq: 2500, label: "2.5 kHz", is31Band: true, isoCompDb: -3.2, description: "중고음 (선명도와 귀의 피로도 영향)", q: 8.65 },
  { id: 43, freq: 2800, label: "2.8 kHz", is31Band: false, isoCompDb: -3.5, description: "고음 (이도 공명 최고 민감 영역)", q: 8.65 },
  { id: 44, freq: 3150, label: "3.15 kHz", is31Band: true, isoCompDb: -3.8, description: "고음 (인간의 귀가 가장 민감한 정점)", q: 8.65 },
  { id: 45, freq: 3550, label: "3.55 kHz", is31Band: false, isoCompDb: -3.5, description: "고음 (스네어 어택감과 예리함)", q: 8.65 },
  { id: 46, freq: 4000, label: "4 kHz", is31Band: true, isoCompDb: -3.2, description: "고음 (금속성 어택감과 존재감)", q: 8.65 },
  { id: 47, freq: 4500, label: "4.5 kHz", is31Band: false, isoCompDb: -2.6, description: "고음 (선명한 기타 하모닉스)", q: 8.65 },
  { id: 48, freq: 5000, label: "5 kHz", is31Band: true, isoCompDb: -2.0, description: "고음 (기타 피크 소리, 보컬의 숨결)", q: 8.65 },
  { id: 49, freq: 5600, label: "5.6 kHz", is31Band: false, isoCompDb: -2.4, description: "초고음 (치찰음의 시작 영역)", q: 8.65 },
  { id: 50, freq: 6300, label: "6.3 kHz", is31Band: true, isoCompDb: -2.8, description: "초고음 (치찰음: 시옷/치읓 발음)", q: 8.65 },
  { id: 51, freq: 7100, label: "7.1 kHz", is31Band: false, isoCompDb: -3.1, description: "초고음 (심벌즈의 날카로움 경계)", q: 8.65 },
  { id: 52, freq: 8000, label: "8 kHz", is31Band: true, isoCompDb: -3.5, description: "초고음 (심벌즈의 찰랑거림, 외이도 감도 감쇄)", q: 8.65 },
  { id: 53, freq: 9000, label: "9 kHz", is31Band: false, isoCompDb: -2.5, description: "초고음 (맑은 개방감)", q: 8.65 },
  { id: 54, freq: 10000, label: "10 kHz", is31Band: true, isoCompDb: -1.5, description: "초고음 (투명한 공간감과 공기감)", q: 8.65 },
  { id: 55, freq: 11200, label: "11.2 kHz", is31Band: false, isoCompDb: -0.7, description: "초고음 (무대감과 에어리함)", q: 8.65 },
  { id: 56, freq: 12500, label: "12.5 kHz", is31Band: true, isoCompDb: 0.0, description: "초고음 (반짝이는 디테일)", q: 8.65 },
  { id: 57, freq: 14000, label: "14 kHz", is31Band: false, isoCompDb: 2.0, description: "극고음 (초고역 섬세한 잔향)", q: 8.65 },
  { id: 58, freq: 16000, label: "16 kHz", is31Band: true, isoCompDb: 4.0, description: "극고음 (귀 끝에서 흩어지는 공기 소리)", q: 8.65 },
  { id: 59, freq: 18000, label: "18 kHz", is31Band: false, isoCompDb: 6.5, description: "극고음 (가청 한계 직전의 초고역 공기감)", q: 8.65 },
  { id: 60, freq: 20000, label: "20 kHz", is31Band: true, isoCompDb: 9.0, description: "극고음 (가청 주파수의 한계 영역)", q: 8.65 },
];

export const TEN_BAND_INDICES = FREQUENCY_BANDS
  .map((b, idx) => (b.is10Band ? idx : -1))
  .filter((idx) => idx !== -1);

export const THIRTY_ONE_BAND_INDICES_IN_61 = FREQUENCY_BANDS_61
  .map((b, idx) => (b.is31Band ? idx : -1))
  .filter((idx) => idx !== -1);

/**
 * 31밴드 설정값을 바탕으로 61밴드의 중간 홀수 대역(1/6 옥타브)을 보간하여 채우는 함수
 */
export function interpolate31to61Bands(
  calibrations: { leftDb: number; rightDb: number; phaseInvert: boolean }[]
): { leftDb: number; rightDb: number; phaseInvert: boolean }[] {
  const result: { leftDb: number; rightDb: number; phaseInvert: boolean }[] = [];

  // 61개 크기 확보
  for (let i = 0; i < 61; i++) {
    result.push({
      leftDb: calibrations[i]?.leftDb || 0,
      rightDb: calibrations[i]?.rightDb || 0,
      phaseInvert: calibrations[i]?.phaseInvert || false,
    });
  }

  // 짝수 인덱스(0, 2, 4, ... 60)를 기준 삼아 사이 홀수 인덱스(1, 3, 5, ... 59) 보간
  for (let k = 0; k < 30; k++) {
    const prevIdx = 2 * k;
    const nextIdx = 2 * (k + 1);
    const midIdx = 2 * k + 1;

    const prevL = result[prevIdx].leftDb;
    const nextL = result[nextIdx].leftDb;
    const prevR = result[prevIdx].rightDb;
    const nextR = result[nextIdx].rightDb;

    result[midIdx] = {
      leftDb: Number(((prevL + nextL) / 2).toFixed(1)),
      rightDb: Number(((prevR + nextR) / 2).toFixed(1)),
      phaseInvert: result[prevIdx].phaseInvert,
    };
  }

  return result;
}

/**
 * 31밴드 모드에서 사용자가 조절한 주요 주파수(1개 이상)를 기준으로
 * 31개 대역 전체를 로그 주파수 공간에서 부드럽게 자동 보간하여 채우는 함수
 */
export function autoFill31Bands(
  calibrations: { leftDb: number; rightDb: number; phaseInvert: boolean }[]
): { leftDb: number; rightDb: number; phaseInvert: boolean }[] {
  const result = [...calibrations];
  while (result.length < 61) {
    result.push({ leftDb: 0, rightDb: 0, phaseInvert: false });
  }

  const indices = THIRTY_ONE_BAND_INDICES_IN_61;
  const calibratedAnchors = indices.filter(
    (idx) => (result[idx]?.leftDb !== 0 || result[idx]?.rightDb !== 0)
  );

  if (calibratedAnchors.length === 0) {
    return result;
  }

  if (calibratedAnchors.length === 1) {
    const singleIdx = calibratedAnchors[0];
    const valL = result[singleIdx].leftDb;
    const valR = result[singleIdx].rightDb;
    const phase = result[singleIdx].phaseInvert;

    indices.forEach((idx) => {
      result[idx] = { leftDb: valL, rightDb: valR, phaseInvert: phase };
    });
  } else {
    indices.forEach((idx) => {
      if (calibratedAnchors.includes(idx)) return;

      const fCurr = Math.log10(FREQUENCY_BANDS_61[idx].freq);

      let prevAnchor = calibratedAnchors[0];
      let nextAnchor = calibratedAnchors[calibratedAnchors.length - 1];

      for (let k = 0; k < calibratedAnchors.length; k++) {
        if (calibratedAnchors[k] <= idx) {
          prevAnchor = calibratedAnchors[k];
        }
        if (calibratedAnchors[k] >= idx) {
          nextAnchor = calibratedAnchors[k];
          break;
        }
      }

      if (idx <= calibratedAnchors[0]) {
        result[idx] = {
          leftDb: result[calibratedAnchors[0]].leftDb,
          rightDb: result[calibratedAnchors[0]].rightDb,
          phaseInvert: result[calibratedAnchors[0]].phaseInvert,
        };
      } else if (idx >= calibratedAnchors[calibratedAnchors.length - 1]) {
        const lastIdx = calibratedAnchors[calibratedAnchors.length - 1];
        result[idx] = {
          leftDb: result[lastIdx].leftDb,
          rightDb: result[lastIdx].rightDb,
          phaseInvert: result[lastIdx].phaseInvert,
        };
      } else {
        const fMin = Math.log10(FREQUENCY_BANDS_61[prevAnchor].freq);
        const fMax = Math.log10(FREQUENCY_BANDS_61[nextAnchor].freq);
        const t = (fCurr - fMin) / (fMax - fMin);

        const gPrev = result[prevAnchor];
        const gNext = result[nextAnchor];

        result[idx] = {
          leftDb: Number((gPrev.leftDb * (1 - t) + gNext.leftDb * t).toFixed(1)),
          rightDb: Number((gPrev.rightDb * (1 - t) + gNext.rightDb * t).toFixed(1)),
          phaseInvert: gPrev.phaseInvert,
        };
      }
    });
  }

  // 31밴드가 채워졌으므로 61밴드용 중간 대역도 동기화
  return interpolate31to61Bands(result);
}

/**
 * 10밴드 캘리브레이션 결과로부터 31밴드로 선형/스플라인 보간(Interpolation)하는 함수
 */
export function interpolate10to31Bands(
  tenBandGains: { [bandId: number]: { leftDb: number; rightDb: number; phaseDeg: number } }
): { leftDb: number; rightDb: number; phaseDeg: number }[] {
  const result: { leftDb: number; rightDb: number; phaseDeg: number }[] = [];

  const sampledIndices = TEN_BAND_INDICES;

  for (let i = 0; i < FREQUENCY_BANDS.length; i++) {
    if (FREQUENCY_BANDS[i].is10Band && tenBandGains[i]) {
      result.push({ ...tenBandGains[i] });
      continue;
    }

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
