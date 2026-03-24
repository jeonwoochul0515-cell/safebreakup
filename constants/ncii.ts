// 디지털 성범죄(NCII) 대응 모듈 상수
// 검토: 김창희 변호사 (법률사무소 청송)

export const EMERGENCY_STEPS = [
  {
    step: 1,
    title: '침착하게 대응하기',
    icon: 'hand-left',
    color: '#6B8CC7',
    doList: [
      '깊게 숨을 쉬고 침착함을 유지하세요',
      '신뢰할 수 있는 사람에게 알리세요',
      '이 가이드를 따라 단계별로 진행하세요',
    ],
    dontList: [
      '가해자에게 직접 연락하지 마세요',
      '가해자의 요구에 응하지 마세요',
      '콘텐츠를 직접 삭제하려 하지 마세요 (증거 보전 필요)',
    ],
  },
  {
    step: 2,
    title: '증거 보전하기',
    icon: 'camera',
    color: '#D4A373',
    doList: [
      '유포된 콘텐츠의 URL을 저장하세요',
      '스크린샷을 촬영하세요 (날짜/시간 포함)',
      '가해자와의 대화 내용을 캡처하세요',
      '게시된 플랫폼, 계정 정보를 기록하세요',
    ],
    dontList: [
      '원본 콘텐츠를 삭제하지 마세요 (증거)',
      '스크린샷을 편집하지 마세요',
    ],
  },
  {
    step: 3,
    title: '삭제 요청하기',
    icon: 'trash',
    color: '#E07A5F',
    doList: [
      '각 플랫폼의 신고 기능을 이용하세요',
      'D4U 센터(02-735-8994)에 삭제 지원을 요청하세요',
      'StopNCII.org에서 해시를 생성하세요',
      '구글 검색결과 삭제도 별도 요청하세요',
    ],
    dontList: [
      '하나의 플랫폼만 신고하고 끝내지 마세요',
    ],
  },
  {
    step: 4,
    title: '법적 대응하기',
    icon: 'scale',
    color: '#7A9E7E',
    doList: [
      '경찰에 신고하세요 (112)',
      '성폭력처벌법 위반으로 고소장을 작성하세요',
      '변호사 상담을 받으세요',
      '피해자 국선변호사 선임을 요청하세요',
    ],
    dontList: [
      '시간이 지나면 괜찮아질 거라고 생각하지 마세요',
    ],
  },
];

export const PLATFORM_TAKEDOWN_INFO = [
  {
    platform: '구글 (검색결과)',
    icon: 'logo-google',
    color: '#4285F4',
    reportUrl: 'https://support.google.com/websearch/answer/6302812',
    process: '구글 검색결과에서 비동의 친밀 이미지 삭제를 요청할 수 있습니다.',
    estimatedTime: '1~7일',
    requiredInfo: ['콘텐츠 URL', '본인 확인 정보', '피해 설명'],
  },
  {
    platform: '메타 (인스타/페이스북)',
    icon: 'logo-facebook',
    color: '#1877F2',
    reportUrl: 'https://www.facebook.com/help/contact/567360146613371',
    process: '메타의 친밀 이미지 신고 전용 양식을 통해 삭제를 요청합니다.',
    estimatedTime: '24~48시간',
    requiredInfo: ['콘텐츠 URL', '게시물/계정 정보', '피해 설명'],
  },
  {
    platform: '트위터/X',
    icon: 'logo-twitter',
    color: '#1DA1F2',
    reportUrl: 'https://help.twitter.com/forms/private_information',
    process: '비동의 친밀 이미지 전용 신고 양식을 통해 삭제를 요청합니다.',
    estimatedTime: '24~72시간',
    requiredInfo: ['트윗 URL', '계정 정보', '피해 설명'],
  },
  {
    platform: '틱톡',
    icon: 'musical-notes',
    color: '#000000',
    reportUrl: 'https://www.tiktok.com/legal/report/privacy',
    process: '앱 내 신고 기능 또는 웹 양식을 통해 삭제를 요청합니다.',
    estimatedTime: '24~48시간',
    requiredInfo: ['영상 URL', '계정 정보', '피해 설명'],
  },
  {
    platform: '텔레그램',
    icon: 'paper-plane',
    color: '#0088CC',
    reportUrl: 'https://telegram.org/faq#q-how-do-i-report-illegal-content',
    process: 'abuse@telegram.org로 영문 이메일을 보내 삭제를 요청합니다. D4U센터를 통하면 더 효과적입니다.',
    estimatedTime: '3~14일 (느림)',
    requiredInfo: ['채널/그룹 링크', '메시지 링크', '피해 설명(영문)'],
  },
  {
    platform: '네이버',
    icon: 'reader',
    color: '#03C75A',
    reportUrl: 'https://help.naver.com/service/30016/contents/18663',
    process: '네이버 권리침해 신고센터를 통해 삭제를 요청합니다.',
    estimatedTime: '1~7일',
    requiredInfo: ['콘텐츠 URL', '신분증 사본', '피해 설명'],
  },
  {
    platform: '카카오',
    icon: 'chatbubble-ellipses',
    color: '#FEE500',
    reportUrl: 'https://cs.kakao.com/helps?service=160',
    process: '카카오 고객센터를 통해 불법 콘텐츠 삭제를 요청합니다.',
    estimatedTime: '1~5일',
    requiredInfo: ['콘텐츠 URL/채팅방 정보', '피해 설명'],
  },
  {
    platform: '포르노 사이트',
    icon: 'ban',
    color: '#C4634B',
    reportUrl: '',
    process: 'D4U센터(02-735-8994)를 통해 삭제를 요청하세요. 직접 접근하지 마세요.',
    estimatedTime: '1~4주 (D4U 통해)',
    requiredInfo: ['URL (D4U에 전달)', '피해 설명'],
  },
];

export const LEGAL_REFERENCES = {
  illegalFilming: {
    law: '성폭력범죄의 처벌 등에 관한 특례법 제14조',
    title: '카메라 등을 이용한 촬영',
    penalty: '7년 이하의 징역 또는 5천만원 이하의 벌금',
    description: '카메라나 그 밖에 이와 유사한 기능을 갖춘 기계장치를 이용하여 성적 욕망 또는 수치심을 유발할 수 있는 사람의 신체를 촬영대상자의 의사에 반하여 촬영한 자',
  },
  distribution: {
    law: '성폭력범죄의 처벌 등에 관한 특례법 제14조의2',
    title: '허위영상물 등의 반포 등',
    penalty: '5년 이하의 징역 또는 5천만원 이하의 벌금',
    description: '반포, 판매, 임대, 제공, 공공연하게 전시·상영하거나 정보통신망을 이용하여 유포한 자',
  },
  threat: {
    law: '성폭력범죄의 처벌 등에 관한 특례법 제14조의3',
    title: '촬영물 등을 이용한 협박·강요',
    penalty: '1년 이상의 유기징역 (협박) / 3년 이상의 유기징역 (강요)',
    description: '성적 촬영물 또는 허위영상물을 이용하여 사람을 협박한 자 / 이를 이용하여 사람의 권리행사를 방해하거나 의무 없는 일을 하게 한 자',
  },
};

export const D4U_CENTER = {
  name: '중앙디지털성범죄피해자지원센터 (D4U)',
  phone: '02-735-8994',
  hours: '24시간 상담 가능',
  services: [
    '피해 상담 및 심리 지원',
    '불법 촬영물/유포물 삭제 지원',
    '유포 현황 모니터링',
    '수사·법률·의료 기관 연계',
    '딥페이크 피해 전문 대응',
  ],
  website: 'https://d4u.stop.or.kr',
};

export const STOPNCII_STEPS = [
  { step: 1, title: 'StopNCII.org 접속', description: '웹브라우저에서 stopncii.org에 접속합니다.' },
  { step: 2, title: '이미지 선택', description: '유포될 우려가 있는 이미지를 기기에서 선택합니다. 이미지는 기기 밖으로 전송되지 않습니다.' },
  { step: 3, title: '해시 생성', description: '기기에서 이미지의 디지털 지문(해시)이 생성됩니다. 원본 이미지가 아닌 해시만 공유됩니다.' },
  { step: 4, title: '파트너 플랫폼 탐지', description: 'Meta, TikTok, Reddit 등 참여 플랫폼에서 해당 해시와 일치하는 콘텐츠를 자동 탐지합니다.' },
  { step: 5, title: '자동 삭제', description: '일치하는 콘텐츠가 발견되면 자동으로 삭제되고, 재업로드도 차단됩니다.' },
];

export const DEEPFAKE_TIPS = [
  { id: 1, title: '얼굴 경계 확인', description: '얼굴과 몸의 경계선이 부자연스러운지 확인하세요.', icon: 'scan' },
  { id: 2, title: '눈 깜빡임', description: '딥페이크 영상은 눈 깜빡임이 부자연스러운 경우가 많습니다.', icon: 'eye' },
  { id: 3, title: '피부 질감', description: '피부 질감이 주변과 다르거나 너무 매끄러운지 확인하세요.', icon: 'finger-print' },
  { id: 4, title: '배경 일관성', description: '배경이 왜곡되거나 프레임마다 달라지는지 확인하세요.', icon: 'image' },
  { id: 5, title: '음성 불일치', description: '입술 움직임과 음성이 정확히 일치하지 않을 수 있습니다.', icon: 'mic' },
];

export const SEXTORTION_PROTOCOL = [
  { step: 1, title: '요구에 응하지 않기', description: '돈이나 추가 이미지를 보내면 요구가 멈추지 않고 더 심해집니다. 절대 응하지 마세요.', icon: 'close-circle', color: '#C4634B' },
  { step: 2, title: '대화 중단 (차단은 보류)', description: '즉시 차단하면 증거가 사라질 수 있습니다. 대화를 중단하되, 모든 내용을 캡처한 후 차단하세요.', icon: 'pause-circle', color: '#E07A5F' },
  { step: 3, title: '모든 대화 캡처', description: '위협 메시지, 요구 내용, 프로필 정보 등 모든 것을 스크린샷으로 저장하세요.', icon: 'camera', color: '#D4A373' },
  { step: 4, title: '경찰 즉시 신고', description: '112에 전화하거나 가까운 경찰서를 방문하세요. 성폭력처벌법 제14조의3 위반(1년 이상 징역)입니다.', icon: 'shield', color: '#6B8CC7' },
  { step: 5, title: 'D4U센터 연락', description: '02-735-8994로 전화하여 유포 모니터링 및 삭제 지원을 요청하세요.', icon: 'call', color: '#7A9E7E' },
  { step: 6, title: '변호사 상담', description: '고소장 작성 및 법적 대응을 위해 변호사 상담을 받으세요.', icon: 'person', color: '#C4956A' },
];
