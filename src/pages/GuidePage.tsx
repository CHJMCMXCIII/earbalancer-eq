import React from 'react';
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
  return (
    <div className="flex flex-col justify-start items-stretch gap-4 w-full">
      {/* 1. 상단 히어로 배너 (IBM Carbon Card) */}
      <div className="p-5 carbon-card rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#edf5ff] dark:bg-[#002d9c]/40 text-[#0f62fe] dark:text-[#78a9ff] border border-[#d0e2ff] dark:border-[#0043ce]">
            <Sparkles className="w-3.5 h-3.5 text-[#0f62fe]" />
            <span>양쪽 귀가 똑같이 들리도록 중심을 맞춰드려요</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#161616] dark:text-[#f4f4f4]">
            EarBalancer EQ는 어떤 프로그램인가요?
          </h2>
          <p className="text-sm text-[#525252] dark:text-[#c6c6c6] max-w-xl leading-relaxed">
            이어폰을 꼈을 때 소리가 미세하게 한쪽으로 쏠려 들린 적 있나요? 사람마다 양쪽 귀가 듣는 소리 크기가 조금씩 달라요. EarBalancer EQ는 내 머리 한가운데에서 소리가 똑바로 울리도록 좌우 균형을 맞춰주는 프로그램이에요.
          </p>
        </div>

        <button
          onClick={onStartCalibration}
          className="flex-shrink-0 flex items-center gap-2 px-6 py-3.5 rounded font-bold text-sm bg-[#0f62fe] hover:bg-[#0353e9] text-white shadow-md transition-all duration-150 cursor-pointer"
        >
          <span>소리 맞춤 시작하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. 착용 상태 및 이압 주의 안내 (핵심 안내 배너) */}
      <div className="p-4 carbon-card rounded-xl border-l-4 border-l-[#0f62fe] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <Ear className="w-5 h-5 text-[#0f62fe] flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm">
            <span className="font-bold text-[#161616] dark:text-[#f4f4f4] text-sm">
              착용 방식 및 이압에 따른 결과 차이 안내
            </span>
            <p className="text-xs sm:text-sm text-[#525252] dark:text-[#c6c6c6] leading-relaxed">
              이어폰의 삽입 깊이, 헤드폰의 착용 각도나 밀폐도, 그리고 당시의 이압(귀 압력) 상태에 따라 좌우 감도가 달라지거나 측정 결과가 조금씩 달라질 수 있어요.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 px-3 py-2 carbon-subcard rounded text-xs text-[#525252] dark:text-[#c6c6c6]">
          <RotateCcw className="w-4 h-4 text-[#0f62fe] flex-shrink-0" />
          <span>평소 영상이나 음악 감상 시 어색하다면 언제든 재설정을 권장해요</span>
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
            이어폰 끼고 준비하기
          </h3>
          <p className="text-xs text-[#525252] dark:text-[#c6c6c6] leading-relaxed">
            조용한 방에서 평소 쓰던 이어폰이나 헤드폰을 편하게 끼고, 볼륨을 알맞게 조절해주세요.
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-4 carbon-card rounded-xl shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="text-sm font-bold text-[#161616] dark:text-[#f4f4f4]">
            머리 가운데로 소리 모으기
          </h3>
          <p className="text-xs text-[#525252] dark:text-[#c6c6c6] leading-relaxed">
            음높이별 소리를 듣고, 소리가 머리 정중앙에서 똑바로 울릴 때까지 좌우 슬라이더를 살짝 움직여보세요.
          </p>
          <div className="p-2 rounded bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-[11px] text-emerald-800 dark:text-emerald-200 leading-tight">
            💡 <strong>추천 방법:</strong> 잘 들리는 쪽을 깎기보다, 보청기처럼 <strong>덜 들리는 쪽 귀의 볼륨을 살짝 올려서(+)</strong> 맞추는 것이 소리가 훨씬 자연스러워요.
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-4 carbon-card rounded-xl shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h3 className="text-sm font-bold text-[#161616] dark:text-[#f4f4f4]">
            원래 소리랑 비교해보기
          </h3>
          <p className="text-xs text-[#525252] dark:text-[#c6c6c6] leading-relaxed">
            음악을 들으면서 보정 전 소리(A)와 내 귀에 맞춘 소리(B)를 왔다 갔다 누르며 비교해보세요.
          </p>
        </div>

        {/* Step 4 */}
        <div className="p-4 carbon-card rounded-xl shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
            4
          </div>
          <h3 className="text-sm font-bold text-[#161616] dark:text-[#f4f4f4]">
            윈도우에 저장해서 쓰기
          </h3>
          <p className="text-xs text-[#525252] dark:text-[#c6c6c6] leading-relaxed">
            마음에 들면 설정 파일을 다운받아서 Equalizer APO에 넣어주면 컴퓨터의 모든 소리에 적용돼요.
          </p>
        </div>
      </div>

      {/* 4. 귀 건강 주의사항 */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-start gap-3.5 text-xs sm:text-sm transition-colors duration-150">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-900 dark:text-amber-200 text-sm">
            귀 건강을 위한 안내
          </div>
          <ul className="text-xs text-amber-800 dark:text-amber-300 list-disc list-inside space-y-0.5 leading-relaxed">
            <li>소리를 너무 크게 튼 채로 오래 테스트하지 마세요. 귀가 피곤하면 잠시 쉬었다가 진행해주세요.</li>
            <li>갑자기 소리가 커져서 귀가 다치지 않도록 안전 보호 장치(소프트 리미터)가 켜져 있어요.</li>
            <li>만약 중이염이나 귀 먹먹함 같은 증상이 있다면 프로그램으로 맞추기 전에 먼저 이비인후과 진료를 받아보시길 권장해요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
