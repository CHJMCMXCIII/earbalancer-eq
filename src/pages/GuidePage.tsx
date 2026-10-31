import React from 'react';
import {
  Headphones,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Volume2,
  HelpCircle,
  Activity,
  Layers,
  ArrowLeftRight,
} from 'lucide-react';

interface GuidePageProps {
  onStartCalibration: () => void;
}

export const GuidePage: React.FC<GuidePageProps> = ({ onStartCalibration }) => {
  return (
    <div className="flex flex-col justify-start items-stretch gap-4 w-full">
      {/* 1. 상단 히어로 배너 */}
      <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-xl transition-colors flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span>양쪽 귀의 숨겨진 청력 불균형을 찾아 바로잡는 솔루션</span>
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            EarBalancer EQ 사용자 안내 및 시작 가이드
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
            사람마다 지문이 다르듯, <strong>양쪽 귀의 주파수별 청각 감도 역시 서로 다릅니다.</strong> 전문 용어를 몰라도 일상적인 그림 가이드를 따라 소리의 중심을 완벽한 정중앙으로 맞출 수 있습니다.
          </p>
        </div>

        <button
          onClick={onStartCalibration}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 transition-all hover:scale-102 cursor-pointer"
        >
          <span>소리 맞춤 시작하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. 단계별 사용법 4단계 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Step 1 */}
        <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            청음 환경 준비
          </h3>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
            조용한 실내에서 평소 사용하는 헤드폰이나 이어폰을 착용하고, 마스터 볼륨을 편안한 수준으로 설정합니다.
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            좌/우 0.1dB 정밀 맞춤
          </h3>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
            각 음높이별 소리를 듣고, 소리가 내 머리 <strong>정중앙 한가운데</strong>에서 똑바로 울리도록 좌/우 슬라이더를 맞춥니다.
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            무중단 실시간 전/후 비교
          </h3>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
            음악이 재생되는 도중 Option A(보정 전)와 Option B(내 귀 맞춤)를 끊김 없이 전환하며 사운드 균형을 비교합니다.
          </p>
        </div>

        {/* Step 4 */}
        <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
            4
          </div>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Equalizer APO 적용
          </h3>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
            클릭 한 번으로 Equalizer APO <code>config.txt</code>에 자동 반영하거나 파일을 내려받아 윈도우 전체 사운드에 적용합니다.
          </p>
        </div>
      </div>

      {/* 3. 헷갈리기 쉬운 핵심 기능 알기 쉬운 설명 3종 */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3 transition-colors">
        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-500" />
          <span>핵심 보조 기능 알아보기</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 위상 반전 설명 */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5 transition-colors">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
              <Activity className="w-3.5 h-3.5" />
              <span>위상(Phase) 180° 반전이란?</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              소리가 머리 한가운데 모이지 않고 <strong>머리 바깥으로 흩어지거나 귓속이 텅 빈 것처럼 먹먹할 때</strong> 켜보세요. 음파를 180도 뒤집어 분산된 소리를 정중앙으로 모아주는 기능입니다.
            </p>
          </div>

          {/* 좌우 채널 반전 설명 */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5 transition-colors">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>좌우 채널 반전(Swap)이란?</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              헤드폰을 거꾸로 꼈거나 좌우 귀의 밸런스 차이를 반대로 테스트해보고 싶을 때, <strong>클릭 한 번으로 현재 대역의 좌측과 우측 보정 수치를 서로 맞바꿉니다.</strong>
            </p>
          </div>

          {/* ISO 226 자동 연동 설명 */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5 transition-colors">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <Layers className="w-3.5 h-3.5" />
              <span>ISO 226 표준 청각 보정이란?</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              인간의 귀는 저음(31Hz)과 초고음(16kHz)을 중음보다 훨씬 작게 듣습니다. <strong>어떤 주파수를 틀어도 동일한 체감 크기로 안전하게 들리도록</strong> 시스템이 최적 게인을 자동 적용합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 4. 청각 안전 및 주의사항 (Safety Notice) */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-xs transition-colors">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-900 dark:text-amber-200">
            청각 보호 및 주의사항
          </div>
          <ul className="text-[11px] text-amber-800 dark:text-amber-300 list-disc list-inside space-y-0.5 leading-relaxed">
            <li>과도하게 높은 볼륨으로 장시간 순음(Sine wave) 테스트를 지속하지 마세요. 귀에 피로감이 들면 10분간 휴식을 취하세요.</li>
            <li>앱 내부에는 급작스러운 음량 피크로 인한 청력 손상을 방지하는 <strong>소프트 리미터(Compressor)</strong>가 상시 작동합니다.</li>
            <li>만약 중이염, 이관 이상, 돌발성 난청 등 급성 청각 질환이 의심되는 경우, 프로그램 보정에 의존하기 전 이비인후과 전문의의 진단을 우선 받으세요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
