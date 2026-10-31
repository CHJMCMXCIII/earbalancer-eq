// 캘리브레이션 전역 상태 및 LocalStorage 연동 관리

import { FREQUENCY_BANDS, TEN_BAND_INDICES, interpolate10to31Bands } from '../data/iso226';

export interface BandState {
  leftDb: number;
  rightDb: number;
  phaseInvert: boolean;
}

export interface Profile {
  id: string;
  name: string;
  mode: '10-band' | '31-band';
  updatedAt: string;
  calibrations: BandState[];
}

const STORAGE_KEY_PROFILES = 'earbalancer_profiles_v1';
const STORAGE_KEY_CURRENT = 'earbalancer_current_state_v1';

export function getDefaultBands(): BandState[] {
  return FREQUENCY_BANDS.map(() => ({
    leftDb: 0,
    rightDb: 0,
    phaseInvert: false,
  }));
}

export function loadSavedProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load profiles:', e);
  }

  // 기본 기본 프로필
  return [
    {
      id: 'default-headphones',
      name: '내 헤드폰 (기본)',
      mode: '10-band',
      updatedAt: new Date().toISOString(),
      calibrations: getDefaultBands(),
    },
    {
      id: 'default-earphones',
      name: '내 이어폰 (기본)',
      mode: '10-band',
      updatedAt: new Date().toISOString(),
      calibrations: getDefaultBands(),
    },
  ];
}

export function saveProfilesToStorage(profiles: Profile[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save profiles:', e);
  }
}
