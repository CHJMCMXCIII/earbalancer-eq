import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Ear,
  RotateCcw,
} from 'lucide-react';

interface GuidePageProps {
  onStartCalibration: () => void;
}

export const GuidePage: React.FC<GuidePageProps> = ({ onStartCalibration }) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col justify-start items-stretch gap-4 w-full">
      {/* 1. 상단 히어로 배너 (IBM Carbon Card) */}
      <div className="p-5 carbon-card rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#edf5ff] dark:bg-[#002d9c]/40 text-[#0f62fe] dark:text-[#78a9ff] border border-[#d0e2ff] dark:border-[#0043ce]">
            <Sparkles className="w-3.5 h-3.5 text-[#0f62fe]" />
            <span>{t.guide.heroBadge}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#161616] dark:text-[#f4f4f4]">
            {t.guide.heroTitle}
          </h2>
          <p className="text-sm text-[#525252] dark:text-[#c6c6c6] max-w-xl leading-relaxed">
            {t.guide.heroDesc}
          </p>
          <strong className="text-[#0f62fe] dark:text-[#78a9ff] font-semibold text-[10px] sm:text-[11px]">
            {t.common.windowsOnly}
          </strong>
        </div>

        <button
          onClick={onStartCalibration}
          className="flex-shrink-0 flex items-center gap-2 px-6 py-3.5 rounded font-bold text-sm bg-[#0f62fe] hover:bg-[#0353e9] text-white shadow-md transition-all duration-150 cursor-pointer"
        >
          <span>{t.guide.startBtn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. 착용 상태 및 이압 주의 안내 (핵심 안내 배너) */}
      <div className="p-4 carbon-card rounded-xl border-l-4 border-l-[#0f62fe] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <Ear className="w-5 h-5 text-[#0f62fe] flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm">
            <span className="font-bold text-[#161616] dark:text-[#f4f4f4] text-sm">
              {t.guide.fitWarningTitle}
            </span>
            <p className="text-xs sm:text-sm text-[#525252] dark:text-[#c6c6c6] leading-relaxed">
              {t.guide.fitWarningDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 px-3 py-2 carbon-subcard rounded text-xs text-[#525252] dark:text-[#c6c6c6]">
          <RotateCcw className="w-4 h-4 text-[#0f62fe] flex-shrink-0" />
          <span>{t.guide.fitWarningTip}</span>
        </div>
      </div>

      {/* 3. 단계별 4단계 순서 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Step 1 */}
        <div className="p-4 carbon-card rounded-xl shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded bg-[#edf5ff] dark:bg-[#002d9c]/50 text-[#0f62fe] dark:text-[#78a9ff] flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h3 className="text-sm font-bold text-[#161616] dark:text-[#f4f4f4]">
            {t.guide.step1Title}
          </h3>
          <p className="text-xs text-[#525252] dark:text-[#c6c6c6] leading-relaxed">
            {t.guide.step1Desc}
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-4 carbon-card rounded-xl shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="text-sm font-bold text-[#161616] dark:text-[#f4f4f4]">
            {t.guide.step2Title}
          </h3>
          <p className="text-xs text-[#525252] dark:text-[#c6c6c6] leading-relaxed">
            {t.guide.step2Desc}
          </p>
          <div className="p-2 rounded bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-[11px] text-emerald-800 dark:text-emerald-200 leading-tight">
            {t.guide.step2Tip}
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-4 carbon-card rounded-xl shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h3 className="text-sm font-bold text-[#161616] dark:text-[#f4f4f4]">
            {t.guide.step3Title}
          </h3>
          <p className="text-xs text-[#525252] dark:text-[#c6c6c6] leading-relaxed">
            {t.guide.step3Desc}
          </p>
        </div>

        {/* Step 4 */}
        <div className="p-4 carbon-card rounded-xl shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
            4
          </div>
          <h3 className="text-sm font-bold text-[#161616] dark:text-[#f4f4f4]">
            {t.guide.step4Title}
          </h3>
          <p className="text-xs text-[#525252] dark:text-[#c6c6c6] leading-relaxed">
            {t.guide.step4Desc}
          </p>
        </div>
      </div>

      {/* 4. 귀 건강 주의사항 */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-start gap-3.5 text-xs sm:text-sm transition-colors duration-150">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-900 dark:text-amber-200 text-sm">
            {t.guide.healthTitle}
          </div>
          <ul className="text-xs text-amber-800 dark:text-amber-300 list-disc list-inside space-y-0.5 leading-relaxed">
            <li>{t.guide.health1}</li>
            <li>{t.guide.health2}</li>
            <li>{t.guide.health3}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
