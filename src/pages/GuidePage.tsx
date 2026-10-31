import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
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
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span>양쪽 귀가 똑같이 들리도록 중심을 맞춰드려요</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
            EarBalancer EQ는 어떤 프로그램인가요?
          </h2>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 max-w-xl leading-relaxed">
            이어폰을 꼈을 때 소리가 미세하게 한쪽으로 쏠려 들린 적 있나요? 사람마다 양쪽 귀가 듣는 소리 크기가 조금씩 달라요. EarBalancer EQ는 내 머리 한가운데에서 소리가 똑바로 울리도록 좌우 균형을 맞춰주는 프로그램이에요.
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

      {/* 2. 단계별 4단계 순서 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Step 1 */}
        <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            이어폰 끼고 준비하기
          </h3>
          <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-normal">
            조용한 방에서 평소 쓰던 이어폰이나 헤드폰을 편하게 끼고, 볼륨을 알맞게 조절해주세요.
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            머리 가운데로 소리 모으기
          </h3>
          <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-normal">
            음높이별 소리를 듣고, 소리가 머리 정중앙에서 똑바로 울릴 때까지 좌우 슬라이더를 살짝 움직여보세요.
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            원래 소리랑 비교해보기
          </h3>
          <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-normal">
            음악을 들으면서 보정 전 소리(A)와 내 귀에 맞춘 소리(B)를 왔다 갔다 누르며 비교해보세요.
          </p>
        </div>

        {/* Step 4 */}
        <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
            4
          </div>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            윈도우에 저장해서 쓰기
          </h3>
          <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-normal">
            마음에 들면 설정 파일을 다운받아서 Equalizer APO에 넣어주면 컴퓨터의 모든 소리에 적용돼요.
          </p>
        </div>
      </div>

      {/* 3. 보조 기능 안내 */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3 transition-colors">
        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-500" />
          <span>알아두면 유용한 팁</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 위상 반전 설명 */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5 transition-colors">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
              <Activity className="w-3.5 h-3.5" />
              <span>위상 반전은 언제 쓰나요?</span>
            </div>
            <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
              소리가 가운데에 안 모이고 머리 바깥으로 흩어지거나, 귀가 멍멍하게 느껴질 때 켜보세요. 소리를 정중앙으로 모아주는 기능이에요.
            </p>
          </div>

          {/* 좌우 채널 반전 설명 */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5 transition-colors">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>좌우 채널 반전은 무엇인가요?</span>
            </div>
            <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
              이어폰을 반대로 꼈거나, 양쪽 귀의 균형을 거꾸로 확인해보고 싶을 때 버튼 하나로 왼쪽과 오른쪽 수치를 바로 맞바꿔줘요.
            </p>
          </div>

          {/* ISO 226 자동 연동 설명 */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5 transition-colors">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <Layers className="w-3.5 h-3.5" />
              <span>ISO 226 자동 보정이란?</span>
            </div>
            <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
              사람 귀는 낮은 저음과 높은 고음을 작게 들어요. 어떤 음높이를 틀어도 귀에 부담 없이 편안하고 똑같은 크기로 들리도록 시스템이 자동 조절해줍니다.
            </p>
          </div>
        </div>
      </div>

      {/* 4. 주의사항 */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-xs transition-colors">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-900 dark:text-amber-200">
            귀 건강을 위한 안내
          </div>
          <ul className="text-[11px] text-amber-800 dark:text-amber-300 list-disc list-inside space-y-0.5 leading-relaxed">
            <li>소리를 너무 크게 튼 채로 오래 테스트하지 마세요. 귀가 피곤하면 잠시 쉬었다가 진행해주세요.</li>
            <li>갑자기 소리가 커져서 귀가 다치지 않도록 안전 보호 장치(소프트 리미터)가 켜져 있어요.</li>
            <li>만약 중이염이나 귀 먹먹함 같은 증상이 있다면 프로그램으로 맞추기 전에 먼저 이비인후과 진료를 받아보시길 권장해요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
