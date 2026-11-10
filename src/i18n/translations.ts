// EarBalancer EQ - 다국어(i18n) 번역 데이터 사전 (한국어 / English)

export type Language = 'ko' | 'en';

export interface TranslationSchema {
  common: {
    appName: string;
    lightMode: string;
    darkMode: string;
    masterVolume: string;
    prev: string;
    next: string;
    cancel: string;
    confirm: string;
    copy: string;
    copied: string;
    close: string;
    windowsOnly: string;
    leftChannel: string;
    rightChannel: string;
    center: string;
    language: string;
  };
  nav: {
    guide: string;
    calibrate: string;
    abtest: string;
    export: string;
  };
  guide: {
    heroBadge: string;
    heroTitle: string;
    heroDesc: string;
    startBtn: string;
    fitWarningTitle: string;
    fitWarningDesc: string;
    fitWarningTip: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step2Tip: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    healthTitle: string;
    health1: string;
    health2: string;
    health3: string;
  };
  visualizer: {
    title: string;
    balanced: string;
    leftLouder: string;
    rightLouder: string;
    louderSuffix: string;
    soundPos: string;
    headCenter: string;
    leftEar: string;
    rightEar: string;
    centerBiasedLeft: string;
    centerBiasedRight: string;
    rotFront: string;
    rotRight: string;
    rotBack: string;
    rotLeft: string;
    rot360: string;
    currentBand: string;
    playTone: string;
    stopTone: string;
    resetPitch: string;
    titleL: string;
    titleCenter: string;
    titleR: string;
    title360: string;
  };
  calibration: {
    band31: string;
    band61: string;
    title31: string;
    title61: string;
    tipLabel: string;
    tipContent: string;
    warningLabel: string;
    warningContent: string;
    wearLabel: string;
    wearContent: string;
    leftVolLabel: string;
    rightVolLabel: string;
    isoAutoTitle: string;
    isoTooltipTitle: string;
    isoTooltipBody: string;
    isoSubtext: string;
    isoBoost: string;
    isoCut: string;
    isoRef: string;
    pinkNoiseTitle: string;
    pinkNoiseTooltipTitle: string;
    pinkNoiseTooltipBody: string;
    pinkNoiseDesc: string;
    pinkNoiseApply: string;
    pinkNoiseBypass: string;
    pinkNoisePlay: string;
    pinkNoiseStop: string;
    compareBtn: string;
  };
  abtest: {
    title: string;
    desc: string;
    existingApoBannerTitle: string;
    existingApoBannerDesc: string;
    demoTrackTitle: string;
    uploadCustom: string;
    uploadSelected: string;
    btnA: string;
    btnB: string;
    play: string;
    pause: string;
    stop: string;
    graphTitle: string;
    graphSubtitle: string;
    legendBoth: string;
    legendLeft: string;
    legendRight: string;
    backToCalibrate: string;
    goToExport: string;
  };
  export: {
    title: string;
    desc: string;
    recalibrateBtn: string;
    installBannerTitle: string;
    installBannerDesc: string;
    installGuideBtn: string;
    deviceProfileLabel: string;
    deviceProfilePlaceholder: string;
    copyNameTooltip: string;
    preampLabel: string;
    suggestedBadge: string;
    preampNotice: string;
    downloadBtn: string;
    copySyntaxBtn: string;
    saveProfileBtn: string;
    previewTitle: string;
    savedProfilesTitle: string;
    noSavedProfiles: string;
    applyProfileBtn: string;
    deleteProfileBtn: string;
    deleteConfirm: string;
    guideModalTitle: string;
    installModalTitle: string;
    installModalStep1Title: string;
    installModalStep1Desc: string;
    installModalStep2Title: string;
    installModalStep2Desc: string;
    installModalStep3Title: string;
    installModalStep3Desc: string;
    installModalStep4Title: string;
    installModalStep4Desc: string;
    guideStep1Title: string;
    guideStep1Desc: string;
    guideStep2Title: string;
    guideStep2Desc: string;
    guideStep3Title: string;
    guideStep3Desc: string;
    openSourceForge: string;
    backToAB: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  ko: {
    common: {
      appName: 'EarBalancer EQ',
      lightMode: '라이트',
      darkMode: '다크',
      masterVolume: '앱 마스터 볼륨',
      prev: '이전',
      next: '다음',
      cancel: '취소',
      confirm: '확인',
      copy: '복사',
      copied: '복사 완료!',
      close: '닫기',
      windowsOnly: 'Windows 환경에서만 사용 가능합니다 (Equalizer APO 전용)',
      leftChannel: '왼쪽 귀 (Channel: L)',
      rightChannel: '오른쪽 귀 (Channel: R)',
      center: '중앙 (Center)',
      language: '언어',
    },
    nav: {
      guide: '소개/가이드',
      calibrate: '1. 소리 맞춤',
      abtest: '2. 전/후 비교',
      export: '3. APO 저장',
    },
    guide: {
      heroBadge: '양쪽 귀가 똑같이 들리도록 중심을 맞춰드려요',
      heroTitle: 'EarBalancer EQ는 어떤 프로그램인가요?',
      heroDesc:
        '이어폰을 꼈을 때 소리가 미세하게 한쪽으로 쏠려 들린 적 있나요? 사람마다 양쪽 귀가 듣는 소리 크기가 조금씩 달라요. EarBalancer EQ는 내 머리 한가운데에서 소리가 똑바로 울리도록 좌우 균형을 맞춰주는 프로그램이에요.',
      startBtn: '소리 맞춤 시작하기',
      fitWarningTitle: '착용 방식 및 이압에 따른 결과 차이 안내',
      fitWarningDesc:
        '이어폰의 삽입 깊이, 헤드폰의 착용 각도나 밀폐도, 그리고 당시의 이압(귀 압력) 상태에 따라 좌우 감도가 달라지거나 측정 결과가 조금씩 달라질 수 있어요.',
      fitWarningTip: '평소 영상이나 음악 감상 시 어색하다면 언제든 재설정을 권장해요',
      step1Title: '이어폰 끼고 준비하기',
      step1Desc:
        '조용한 방에서 평소 쓰던 이어폰이나 헤드폰을 편하게 끼고, 볼륨을 알맞게 조절해주세요.',
      step2Title: '머리 가운데로 소리 모으기',
      step2Desc:
        '음높이별 소리를 듣고, 소리가 머리 정중앙에서 똑바로 울릴 때까지 좌우 슬라이더를 살짝 움직여보세요.',
      step2Tip:
        '💡 추천 방법: 잘 들리는 쪽을 깎기보다, 보청기처럼 덜 들리는 쪽 귀의 볼륨을 살짝 올려서(+) 맞추는 것이 소리가 훨씬 자연스러워요.',
      step3Title: '원래 소리랑 비교해보기',
      step3Desc:
        '음악을 들으면서 보정 전 소리(A)와 내 귀에 맞춘 소리(B)를 왔다 갔다 누르며 비교해보세요.',
      step4Title: '윈도우에 저장해서 쓰기',
      step4Desc:
        '마음에 들면 설정 파일을 다운받아서 Equalizer APO에 넣어주면 컴퓨터의 모든 소리에 적용돼요.',
      healthTitle: '귀 건강을 위한 안내',
      health1:
        '소리를 너무 크게 튼 채로 오래 테스트하지 마세요. 귀가 피곤하면 잠시 쉬었다가 진행해주세요.',
      health2:
        '갑자기 소리가 커져서 귀가 다치지 않도록 안전 보호 장치(소프트 리미터)가 켜져 있어요.',
      health3:
        '만약 중이염이나 귀 먹먹함 같은 증상이 있다면 프로그램으로 맞추기 전에 먼저 이비인후과 진료를 받아보시길 권장해요.',
    },
    visualizer: {
      title: '소리 위치 가이드',
      balanced: '양쪽 귀 균형 일치',
      leftLouder: '왼쪽이',
      rightLouder: '오른쪽이',
      louderSuffix: '더 큼',
      soundPos: '소리 위치:',
      headCenter: '두상 정중앙 (Center)',
      leftEar: '왼쪽 귀 (L 단독)',
      rightEar: '오른쪽 귀 (R 단독)',
      centerBiasedLeft: '중앙 좌측 편향',
      centerBiasedRight: '중앙 우측 편향',
      rotFront: '정면',
      rotRight: '우측',
      rotBack: '후면',
      rotLeft: '좌측',
      rot360: '360° 회전',
      currentBand: '현재 대역:',
      playTone: '소리 듣고 맞추기',
      stopTone: '소리 멈추기',
      resetPitch: '현재 음높이 리셋',
      titleL: '왼쪽(L) 채널만 단독 재생',
      titleCenter: '양쪽 채널 함께 재생 (기본값)',
      titleR: '오른쪽(R) 채널만 단독 재생',
      title360: '바이노럴 360° 서라운드 회전 재생',
    },
    calibration: {
      band31: '31밴드 표준 (Q=4.31)',
      band61: '61밴드 초정밀 (Q=8.65)',
      title31: '1/3 옥타브 표준 31밴드 (Q=4.31)',
      title61: '1/6 옥타브 초정밀 61밴드 (Q=8.65)',
      tipLabel: '조절 팁:',
      tipContent:
        '잘 들리는 쪽을 낮추기보다, 보청기처럼 덜 들리는 쪽 귀의 볼륨을 올려서(+) 머리 중심으로 맞추면 소리가 답답해지지 않고 시원하게 들려요.',
      warningLabel: '주의:',
      warningContent:
        '볼륨을 과도하게 키우면 이어폰·헤드폰의 드라이버가 고장나거나 청력이 손상될 수 있으니, 적정 음량에서 안전하게 조절해주세요.',
      wearLabel: '착용 방식 및 이압 안내:',
      wearContent:
        '이어폰 삽입 깊이, 헤드폰 착용 각도·밀폐도 및 당일의 귀 압력(이압)에 따라 좌우 감도가 달라질 수 있습니다. 평소 감상 시 어색함이 느껴지면 언제든 재설정하세요.',
      leftVolLabel: '왼쪽 귀 (Channel: L) 소리 크기 보정',
      rightVolLabel: '오른쪽 귀 (Channel: R) 소리 크기 보정',
      isoAutoTitle: 'ISO 226 표준 전체 음량 자동 연동 (Default)',
      isoTooltipTitle: 'ISO 226 등청감 곡선 표준이란?',
      isoTooltipBody:
        '사람 귀는 낮은 저음과 높은 고음을 상대적으로 작게 듣습니다. 어떤 음높이를 선택해도 귀에 부담 없이 편안하고 똑같은 크기로 들리도록 시스템이 자동 보정해줍니다.',
      isoSubtext: '인간 청각 특성에 맞춰 시스템이 자동 보정',
      isoBoost: '음량 보강',
      isoCut: '음량 감쇄',
      isoRef: '0.0 dB (기준음)',
      pinkNoiseTitle: '전 대역 핑크 노이즈로 중심 음상 확인',
      pinkNoiseTooltipTitle: '핑크 노이즈(Pink Noise) 중심 확인이란?',
      pinkNoiseTooltipBody:
        '전 가청 주파수가 고르게 울리는 표준 핑크 노이즈를 재생하여, 조정한 보정값이 적용되었을 때 소리가 머리 정중앙(두상 중심)에 올바르게 맺히는지 확인합니다.',
      pinkNoiseDesc:
        '좌/우 조정한 보정값이 적용된 핑크 노이즈를 재생하여, 소리가 머리 정중앙에 편안하게 맺히는지 실시간으로 확인해보세요.',
      pinkNoiseApply: '보정 적용',
      pinkNoiseBypass: '원본 (EQ 해제)',
      pinkNoisePlay: '핑크 노이즈 재생 (중심 확인)',
      pinkNoiseStop: '핑크 노이즈 정지',
      compareBtn: '비교하기',
    },
    abtest: {
      title: '2단계: 보정 전/후 소리 비교 (A/B Test)',
      desc: '내가 맞춘 보정값이 적용된 소리(B)와 원래 소리(A)를 번갈아 들어보며 중심이 잘 맞았는지 확인해보세요.',
      existingApoBannerTitle: 'Equalizer APO 기존 사용자 참고',
      existingApoBannerDesc:
        '이미 PC에서 Equalizer APO를 사용 중이시라면, 소리가 이중 보정되지 않도록 Configuration Editor에서 기존 EQ 전원(⭕)을 잠시 끄고 테스트해주세요.',
      demoTrackTitle: '샘플 오디오 (Stereo Beat & Synth)',
      uploadCustom: '내 음악 파일로 테스트 (.mp3, .wav, .flac)',
      uploadSelected: '내 음악:',
      btnA: 'A: 원본 소리 (보정 끔)',
      btnB: 'B: 내 맞춤 소리 (보정 켬)',
      play: '재생',
      pause: '일시정지',
      stop: '정지',
      graphTitle: '내 귀 맞춤 좌/우 주파수 보정 곡선',
      graphSubtitle: '조절한 좌/우 채널별 주파수 응답 곡선 (실시간 연동)',
      legendBoth: '전체 보기',
      legendLeft: '왼쪽 (L)',
      legendRight: '오른쪽 (R)',
      backToCalibrate: '이전: 소리 맞춤으로 돌아가기',
      goToExport: '다음: Equalizer APO 파일 저장하기',
    },
    export: {
      title: '3단계: Equalizer APO 설정 파일 저장',
      desc: '조정한 보정값을 다운로드하여 윈도우 전체 사운드(유튜브, 게임, 넷플릭스 등)에 영구 적용하세요.',
      recalibrateBtn: '프리셋 재생성',
      installBannerTitle: 'Equalizer APO가 처음이신가요?',
      installBannerDesc:
        '윈도우 시스템 전체 오디오에 EQ를 적용하려면 무료 오픈소스 프로그램인 Equalizer APO가 필요합니다.',
      installGuideBtn: '설치 및 셋업 가이드',
      deviceProfileLabel: '기기 프로필명 (이어폰/헤드폰 모델명)',
      deviceProfilePlaceholder: '예: Sony WH-1000XM5, Galaxy Buds 2',
      copyNameTooltip: '프로필명 클립보드 복사',
      preampLabel: '클리핑 방지 Preamp 게인',
      suggestedBadge: '권장값',
      preampNotice:
        '디지털 왜곡(클리핑)을 방지하기 위해 최대 부스트 게인보다 최소 1dB 이상 낮게 설정하는 것을 권장합니다.',
      downloadBtn: '설정 파일 다운로드 (.txt)',
      copySyntaxBtn: '전체 문법 클립보드 복사',
      saveProfileBtn: '현재 프로필 저장',
      previewTitle: 'Equalizer APO 문법 미리보기',
      savedProfilesTitle: '내 저장 프로필',
      noSavedProfiles: '저장된 프로필이 없습니다. 위에서 현재 설정을 저장해보세요.',
      applyProfileBtn: '불러오기',
      deleteProfileBtn: '삭제',
      deleteConfirm: '이 프로필을 삭제하시겠습니까?',
      guideModalTitle: 'Equalizer APO 적용 방법 안내 (3단계)',
      installModalTitle: 'Equalizer APO 설치 안내',
      installModalStep1Title: '1. Equalizer APO 다운로드',
      installModalStep1Desc: '공식 SourceForge 웹사이트에서 최신 버전 설치 파일을 다운로드합니다.',
      installModalStep2Title: '2. 설치 진행',
      installModalStep2Desc: '다운로드한 설치 파일(.exe)을 실행하여 기본 설정대로 설치를 완료합니다.',
      installModalStep3Title: '3. 사용 장치 선택 (Configurator)',
      installModalStep3Desc: '설치 중 Configurator 창이 뜨면 소리를 들을 이어폰/헤드폰 재생 장치에 체크합니다.',
      installModalStep4Title: '4. PC 재부팅 필수',
      installModalStep4Desc: 'Equalizer APO 오디오 드라이버가 윈도우에 등록되도록 반드시 PC를 다시 시작합니다.',
      guideStep1Title: '1. 파일 다운로드 또는 복사',
      guideStep1Desc: '위의 [설정 파일 다운로드] 버튼을 누르거나, [전체 문법 복사]를 클릭합니다.',
      guideStep2Title: '2. config.txt 파일에 추가',
      guideStep2Desc: 'C:\\Program Files\\EqualizerAPO\\config\\config.txt 파일 맨 아래에 붙여넣습니다.',
      guideStep3Title: '3. 끝! 즉시 적용 완료',
      guideStep3Desc: '저장하는 즉시 컴퓨터의 모든 소리에 나만의 맞춤 균형이 적용됩니다.',
      openSourceForge: '공식 다운로드 페이지 열기',
      backToAB: '이전: 전/후 비교로 돌아가기',
    },
  },
  en: {
    common: {
      appName: 'EarBalancer EQ',
      lightMode: 'Light',
      darkMode: 'Dark',
      masterVolume: 'Master Volume',
      prev: 'Previous',
      next: 'Next',
      cancel: 'Cancel',
      confirm: 'Confirm',
      copy: 'Copy',
      copied: 'Copied!',
      close: 'Close',
      windowsOnly: 'For Windows only (designed for Equalizer APO)',
      leftChannel: 'Left Ear (Ch: L)',
      rightChannel: 'Right Ear (Ch: R)',
      center: 'Center',
      language: 'Language',
    },
    nav: {
      guide: 'Intro / Guide',
      calibrate: '1. Calibrate',
      abtest: '2. A/B Test',
      export: '3. Export APO',
    },
    guide: {
      heroBadge: 'Center audio so both ears hear equally and clearly',
      heroTitle: 'What is EarBalancer EQ?',
      heroDesc:
        'Have you ever felt sound leaning slightly toward one side with earphones? Human hearing sensitivity often differs slightly between left and right ears. EarBalancer EQ calibrates left-right balance so audio centers perfectly in the middle of your head.',
      startBtn: 'Start Calibration',
      fitWarningTitle: 'Notice on Fit & Ear Pressure Differences',
      fitWarningDesc:
        'Earphone insertion depth, headphone angle, seal, and daily ear pressure can alter left-right sensitivity. If music feels uneven later on, you can recalibrate anytime.',
      fitWarningTip: 'Feel free to recalibrate whenever audio feels off during daily listening.',
      step1Title: 'Put on Headphones & Get Ready',
      step1Desc:
        'Sit comfortably in a quiet room, put on your earphones or headphones, and adjust volume to a moderate level.',
      step2Title: 'Center the Sound in Your Head',
      step2Desc:
        'Listen to the test tone at each pitch, and gently adjust the left/right sliders until the sound centers directly between your ears.',
      step2Tip:
        '💡 Pro Tip: Rather than cutting the louder ear, slightly boosting (+) the quieter ear (like a hearing aid) keeps the sound much more natural and open.',
      step3Title: 'Compare with Original Audio',
      step3Desc:
        'Play music and switch back and forth between original sound (A) and calibrated sound (B) to verify your centered soundstage.',
      step4Title: 'Save & Apply to Windows',
      step4Desc:
        'Once you are happy with the balance, download the preset file and load it into Equalizer APO to apply it to all audio on your PC.',
      healthTitle: 'Ear Health & Listening Safety Notice',
      health1:
        'Do not test at excessive volumes for prolonged periods. Please take breaks if your ears feel tired.',
      health2:
        'A software safety limiter is active at all times to prevent sudden loud volume bursts.',
      health3:
        'If you experience ear fullness, pain, or symptoms of otitis, please consult an ENT physician before calibrating.',
    },
    visualizer: {
      title: 'Sound Position Guide',
      balanced: 'Both Ears in Balance',
      leftLouder: 'Left is',
      rightLouder: 'Right is',
      louderSuffix: 'louder',
      soundPos: 'Sound Position:',
      headCenter: 'Head Center (Center)',
      leftEar: 'Left Ear (L Solo)',
      rightEar: 'Right Ear (R Solo)',
      centerBiasedLeft: 'Biased to Left',
      centerBiasedRight: 'Biased to Right',
      rotFront: 'Front',
      rotRight: 'Right',
      rotBack: 'Rear',
      rotLeft: 'Left',
      rot360: '360° Rotation',
      currentBand: 'Current Band:',
      playTone: 'Play Tone & Calibrate',
      stopTone: 'Stop Tone',
      resetPitch: 'Reset Current Band',
      titleL: 'Play left (L) channel only',
      titleCenter: 'Play both channels together (Default)',
      titleR: 'Play right (R) channel only',
      title360: 'Binaural 360° spatial rotation playback',
    },
    calibration: {
      band31: '31-Band Standard (Q=4.31)',
      band61: '61-Band Precision (Q=8.65)',
      title31: '1/3 Octave Standard 31-Band (Q=4.31)',
      title61: '1/6 Octave Precision 61-Band (Q=8.65)',
      tipLabel: 'Adjustment Tip:',
      tipContent:
        'Rather than cutting the louder ear, slightly boosting (+) the quieter ear like a hearing aid keeps the audio vibrant and crisp.',
      warningLabel: 'Caution:',
      warningContent:
        'Excessive volume can damage headphone drivers or cause hearing loss. Always calibrate at safe, comfortable listening levels.',
      wearLabel: 'Fit & Pressure Notice:',
      wearContent:
        'Earphone insertion depth, headband clamp, cushion seal, and ear pressure can alter sensitivity. Recalibrate anytime if listening feels uneven.',
      leftVolLabel: 'Left Ear (Ch: L) Volume Calibration',
      rightVolLabel: 'Right Ear (Ch: R) Volume Calibration',
      isoAutoTitle: 'ISO 226 Equal-Loudness Linked (Default)',
      isoTooltipTitle: 'What is the ISO 226 Equal-Loudness Standard?',
      isoTooltipBody:
        'Human ears naturally hear low bass and high treble at lower perceived volumes. The engine automatically compensates volume across all frequencies for comfortable, equal loudness.',
      isoSubtext: 'Automatically compensated for human hearing curve',
      isoBoost: 'Gain Boost',
      isoCut: 'Gain Cut',
      isoRef: '0.0 dB (Reference)',
      pinkNoiseTitle: 'Verify Center Imaging with Full-Band Pink Noise',
      pinkNoiseTooltipTitle: 'What is Pink Noise Center Imaging?',
      pinkNoiseTooltipBody:
        'Pink noise contains equal energy across all audio octaves. Play it to verify that your calibrated EQ creates a cohesive, centered soundstage in the middle of your head.',
      pinkNoiseDesc:
        'Play pink noise with your calibrated left/right EQ applied to verify in real time that audio centers comfortably in the middle of your head.',
      pinkNoiseApply: 'Calibrated (EQ On)',
      pinkNoiseBypass: 'Original (EQ Off)',
      pinkNoisePlay: 'Play Pink Noise (Check Center)',
      pinkNoiseStop: 'Stop Pink Noise',
      compareBtn: 'Compare',
    },
    abtest: {
      title: 'Step 2: Before & After Audio Comparison (A/B Test)',
      desc: 'Toggle between your calibrated audio (B) and original sound (A) with music to verify your centered soundstage.',
      existingApoBannerTitle: 'Note for Existing Equalizer APO Users',
      existingApoBannerDesc:
        'If Equalizer APO is already running on your PC, please temporarily turn off (⭕) your previous EQ in Configuration Editor to prevent double-filtering.',
      demoTrackTitle: 'Sample Demo Audio (Stereo Beat & Synth)',
      uploadCustom: 'Test with My Audio File (.mp3, .wav, .flac)',
      uploadSelected: 'Custom Track:',
      btnA: 'A: Original Sound (EQ Off)',
      btnB: 'B: Calibrated Sound (EQ On)',
      play: 'Play',
      pause: 'Pause',
      stop: 'Stop',
      graphTitle: 'Custom Left/Right Frequency Response Curves',
      graphSubtitle: 'Real-time calibrated frequency response curves per channel',
      legendBoth: 'Both Channels',
      legendLeft: 'Left (L)',
      legendRight: 'Right (R)',
      backToCalibrate: 'Back to Calibration',
      goToExport: 'Next: Save Equalizer APO Preset',
    },
    export: {
      title: 'Step 3: Save Equalizer APO Preset',
      desc: 'Download your calibrated preset to apply it permanently across all Windows audio (YouTube, Games, Netflix, etc.).',
      recalibrateBtn: 'Recalibrate Preset',
      installBannerTitle: 'First time using Equalizer APO?',
      installBannerDesc:
        'To apply system-wide EQ across Windows, you need the free, open-source program Equalizer APO.',
      installGuideBtn: 'Installation & Setup Guide',
      deviceProfileLabel: 'Device Profile Name (Headphones / Earphones Model)',
      deviceProfilePlaceholder: 'e.g. Sony WH-1000XM5, AirPods Pro, HD600',
      copyNameTooltip: 'Copy profile name to clipboard',
      preampLabel: 'Anti-Clipping Preamp Gain',
      suggestedBadge: 'Suggested',
      preampNotice:
        'To prevent digital clipping distortion, setting preamp at least 1 dB below your highest frequency boost is recommended.',
      downloadBtn: 'Download Config (.txt)',
      copySyntaxBtn: 'Copy Full Syntax to Clipboard',
      saveProfileBtn: 'Save Current Profile',
      previewTitle: 'Equalizer APO Syntax Preview',
      savedProfilesTitle: 'My Saved Profiles',
      noSavedProfiles: 'No saved profiles yet. Save your current calibration above.',
      applyProfileBtn: 'Load',
      deleteProfileBtn: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this profile?',
      guideModalTitle: 'How to Apply to Equalizer APO (3 Steps)',
      installModalTitle: 'Equalizer APO Installation Guide',
      installModalStep1Title: '1. Download Equalizer APO',
      installModalStep1Desc: 'Download the latest installer from the official SourceForge repository.',
      installModalStep2Title: '2. Run Installer',
      installModalStep2Desc: 'Run the downloaded installer (.exe) and follow the on-screen steps.',
      installModalStep3Title: '3. Select Playback Device (Configurator)',
      installModalStep3Desc: 'In the Configurator window, check the box next to your headphones or audio device.',
      installModalStep4Title: '4. Restart PC (Required)',
      installModalStep4Desc: 'Reboot your computer so the Equalizer APO audio driver registers with Windows.',
      guideStep1Title: '1. Download or Copy Config',
      guideStep1Desc: 'Click [Download Config (.txt)] above or click [Copy Full Syntax].',
      guideStep2Title: '2. Append to config.txt',
      guideStep2Desc: 'Paste the lines into C:\\Program Files\\EqualizerAPO\\config\\config.txt.',
      guideStep3Title: '3. Done! Instant System-wide EQ',
      guideStep3Desc: 'The moment you save, your customized left/right balance applies to all PC audio.',
      openSourceForge: 'Open Official Download Page',
      backToAB: 'Back: A/B Comparison',
    },
  },
};

// 61개 주파수 대역 영어 설명 매핑 딕셔너리
export const FREQ_DESCRIPTIONS_EN: Record<number, string> = {
  0: 'Sub-bass (vibrations felt physically)',
  1: 'Sub-bass (lowest sub-bass foundation)',
  2: 'Sub-bass (heavy subwoofer rumble)',
  3: 'Deep bass (majestic bass foundation)',
  4: 'Deep bass (deep acoustic bass resonance)',
  5: 'Sub-bass (pipe organ & deep synth bass)',
  6: 'Low bass (kick drum lowest bottom)',
  7: 'Low bass (EDM & hip-hop sub-punch)',
  8: 'Low bass (deep bass guitar tone)',
  9: 'Bass (solid punch impact)',
  10: 'Bass (punchy low-end impact)',
  11: 'Bass (warm bass fullness)',
  12: 'Bass (chest-thumping beat)',
  13: 'Bass (snare drum low body)',
  14: 'Bass (heavy kick drum core)',
  15: 'Mid-bass (warmth & acoustic richness)',
  16: 'Mid-bass (clear bass note pitch)',
  17: 'Mid-bass (rhythm section warmth)',
  18: 'Mid-bass (warm male vocal body)',
  19: 'Mid-bass (tom-tom drum fullness)',
  20: 'Mid-bass (sound warmth & fullness)',
  21: 'Mid-bass (vocal body & lower guitar)',
  22: 'Mid-bass (clarity vs muddiness threshold)',
  23: 'Midrange (male vocal chest tone)',
  24: 'Midrange (piano & vocal fundamental)',
  25: 'Midrange (acoustic guitar body)',
  26: 'Midrange (natural vocal tone)',
  27: 'Midrange (snare body resonance)',
  28: 'Midrange (vocal & radio core center)',
  29: 'Midrange (speech intelligibility)',
  30: 'Midrange (speech articulation)',
  31: 'Midrange (horn & brass resonance)',
  32: 'Midrange (instrument presence)',
  33: 'Midrange (guitar crunch & rhythm)',
  34: 'Reference tone (1 kHz human hearing baseline)',
  35: 'Upper-mid (vocal edge & projection)',
  36: 'Upper-mid (singer pronunciation diction)',
  37: 'Upper-mid (keyboard & guitar bite)',
  38: 'Upper-mid (crisp lyrical clarity)',
  39: 'Upper-mid (lead instrument cut)',
  40: 'Upper-mid (human ear high-sensitivity zone)',
  41: 'Upper-mid (sharpness & intimacy)',
  42: 'Upper-mid (bite, clarity & ear fatigue)',
  43: 'Treble (electric guitar attack)',
  44: 'Treble (peak human hearing resonance)',
  45: 'Treble (vocal air & bite)',
  46: 'Treble (metallic attack & presence)',
  47: 'Treble (percussion click & snap)',
  48: 'Treble (guitar pick attack & breath)',
  49: 'Treble (string scrape & harmonics)',
  50: 'Brilliance (sibilance: "s" and "t" sounds)',
  51: 'Brilliance (cymbal edge attack)',
  52: 'Brilliance (cymbal sizzle & ear canal cut)',
  53: 'Brilliance (delicate metallic sparkle)',
  54: 'Air (transparent soundstage & airiness)',
  55: 'Air (airy overtone resonance)',
  56: 'Air (sparkling micro-details)',
  57: 'Air (whisper & breath delicacy)',
  58: 'Top octave (subtle high-frequency air shimmer)',
  59: 'Top octave (silky ultrasonic sparkle)',
  60: 'Ultra-high (human hearing upper threshold)',
};
