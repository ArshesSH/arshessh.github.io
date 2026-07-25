import { useEffect, useState } from 'react'

type Project = {
  slug: string
  group: 'company' | 'personal'
  number: string
  category: string
  period: string
  title: string
  shortTitle: string
  summary: string
  impact: string
  role: string
  team: string
  stack: string[]
  context: string
  challenge: string
  approach: string[]
  results: string[]
  links?: { label: string; href: string }[]
  youtube?: string
  images?: { src: string; alt: string }[]
}

const projects: Project[] = [
  {
    slug: 'vr-taekwondo',
    group: 'company',
    number: '01',
    category: 'VR · FULL BODY TRACKING',
    period: '2026.05.14 — 2026.07.16',
    title: 'VR 태권도 대회용 프로그램',
    shortTitle: 'VR 태권도 대전',
    summary: 'Unreal Engine 5.6에서 PICO SDK 관절 데이터를 활용해 1:1 VR 대전, 관전 PC, 전투 상태를 연결한 대회용 프로그램.',
    impact: '24개 관절 Transform · 30Hz 공유',
    role: 'VR Client Developer',
    team: '2-PERSON TEAM · PC 관전/리슨 서버',
    stack: ['Unreal Engine 5.6', 'C++', 'PICO SDK', 'GAS', 'Control Rig', 'UMG'],
    context: 'PICO 4 Ultra 2대와 PC 1대를 연결해 두 명의 플레이어가 VR로 대전하고, PC에서 경기를 관전하는 대회용 프로그램을 개발했습니다. 2026년 7월 16일까지 개발하고 대회 전 전달·검수를 진행했지만, 7월 19일 대회에서는 실제 운영에 사용되지 않았습니다.',
    challenge: 'PICO SDK에서 수집한 24개 관절 Transform을 네트워크로 공유하면서 전투 상태와 원격 캐릭터의 움직임을 함께 유지해야 했습니다. 현장에서는 카메라 이동, IK 역관절, 발차기 판정 범위, 최초 설치 시 네트워크 연결 등 운영 이슈도 확인했습니다.',
    approach: [
      'PICO SDK 관절 데이터를 Control Rig의 FK/IK 구조에 적용하고 사용자 키 입력 기반 신체 크기 보정을 구현했습니다.',
      '24개 관절 Transform을 30Hz로 공유하고 원격 클라이언트에 스냅샷 보간을 적용했으며, UDP Broadcast 기반 LAN 서버 검색과 자동 연결을 구성했습니다.',
      'GAS와 GameplayTag로 충돌 부위·속도 기반 데미지와 전투 상태를 처리하고, 절차적 피격 애니메이션·대전 HUD·최종 통합·패키징을 담당했습니다.',
    ],
    results: ['PICO 2대와 관전 PC를 연결한 전체 경기 흐름을 현장에서 장애 없이 테스트', '대회 전 프로그램 전달과 담당자 검수 진행; 실제 대회 운영 성과로는 표현하지 않음', '네트워크 상태가 좋지 않을 때의 움직임 끊김과 현장 운영 이슈를 확인해 피드백으로 정리'],
  },
  {
    slug: 'ar-underground-pipeline',
    group: 'company',
    number: '02',
    category: 'ANDROID AR · PERFORMANCE',
    period: '2025.11 — 2026.03',
    title: '현장용 AR 지하 배관 증강 클라이언트',
    shortTitle: 'AR 지하 배관',
    summary: '실제 지하 배관의 위경도·고도 데이터를 AR 공간에 배치하고, Sentis Depth estimation과 커스텀 셰이더로 지하 배관을 가리는 Android 클라이언트.',
    impact: 'Depth estimation 1 FPS → 30 FPS · PoC 완료',
    role: 'Client Developer',
    team: 'OASIS STUDIO · PM · 모델러 · GIS · CLIENT',
    stack: ['Unity', 'C#', 'AR Foundation', 'ARCore', 'Sentis', 'AssetBundle'],
    context: '굴착 전에 실제 지하 배관의 위치와 깊이를 현장에서 확인할 수 있도록 위경도·고도 및 GIS 데이터를 사용자 최초 GPS 기준 Unity 월드 좌표에 배치하는 Android AR 클라이언트를 개발했습니다.',
    challenge: '전체 GIS 데이터를 한 번에 로드하기 어려웠고, AR Foundation 기본 Occlusion만으로는 지하·지상 오브젝트를 자연스럽게 구분하기 어려웠습니다. Galaxy Tab S7에서는 Sentis Depth estimation 처리 속도도 약 1 FPS에 머물렀습니다.',
    approach: [
      'CSV 기반 배관 데이터를 읽어 100m 청크 prefab을 생성하는 Unity 에디터 스크립트와 AssetBundle 런타임 로딩을 구현했습니다.',
      'Sentis Depth estimation으로 Depth texture를 생성하고 셰이더에서 깊이를 비교해 지하·지상 오브젝트를 구분하는 Occlusion을 구현했습니다.',
      '입력 해상도 축소, 추론 주기 조절, 이전·현재 Depth texture 보간, 거리 기반 디더링 셰이더를 적용했습니다.',
    ],
    results: ['Galaxy Tab S7에서 Depth estimation 처리 흐름을 약 1 FPS에서 30 FPS 수준으로 개선', '주변 100m 청크만 로드하는 구조와 커스텀 Occlusion 구현', '현장 검증을 포함한 PoC 완료 및 본사업 체결 진행'],
  },
  {
    slug: 'traffic-integrated-control',
    group: 'company',
    number: '03',
    category: 'DIGITAL TWIN · CLIENT',
    period: '2024.04 — 2025.05 · 커밋 기준',
    title: 'TOPES 통합 교통 관제 시스템',
    shortTitle: 'TOPES 교통 관제',
    summary: '스마트교차로 편집부터 VDS 차량 시각화·교통 분석까지 연결한 Windows 디지털 트윈 클라이언트.',
    impact: 'GIS·VDS 데이터와 2D/3D 관제 연동',
    role: 'Client Developer · Smart Intersection Owner',
    team: 'STANS · 3-PERSON TEAM',
    stack: ['Unity 2022.3', 'C#', 'TypeScript', 'SvelteKit', 'Tauri', 'Babylon.js', 'OpenLayers'],
    context: '외부에서 개발된 Unity 교통 관제 프로젝트를 인수한 뒤, 기획 문서를 바탕으로 스마트교차로 기능을 처음부터 설계하고 단독 구현했습니다. 이후 SvelteKit·Tauri·Babylon.js 기반 클라이언트로 전환하면서 3D 교통 객체, 교통 분석, 차량 재생과 시뮬레이션 연동을 담당했습니다.',
    challenge: '지도 픽셀·GIS·CCTV·Unity/Babylon.js 좌표를 하나의 교차로 모델로 연결하고, VDS 검지가 끊긴 차량도 차선 흐름에 맞게 계속 표현해야 했습니다.',
    approach: [
      '교차로 영역·도로·차선·CCTV·신호등 배치와 저장을 지원하는 Unity 스마트교차로 편집 시스템을 기획 문서 기반으로 단독 구현했습니다.',
      'GIS 좌표와 Unity 좌표를 변환하고 VDS 패킷을 차량 표시·이동에 연결했으며, 검지 손실 차량은 작성된 차선 추적 경로를 따라 이동하도록 구성했습니다.',
      'SvelteKit·Babylon.js 전환 이후 2D 편집, 3D 차량·신호등, 교통 분석, 차량 재생, 시뮬레이션 요청·결과 처리를 담당했습니다.',
    ],
    results: ['기획 문서에서 출발해 스마트교차로 생성·편집·저장 흐름을 단독 구현', 'VDS 차량 데이터를 지도·3D 관제 화면에 표시하고 검지 손실 차량의 차선 추적 구현', '클라이언트 기술 전환 이후 교통 분석·차량 재생·시뮬레이션 연동 기능 구현'],
    images: [
      { src: '/portfolio-media/image1.png', alt: 'TOPES 통합 교통 관제 시스템 지도 화면' },
      { src: '/portfolio-media/image2.png', alt: 'TOPES 통합 교통 관제 시스템 스마트교차로 3D 씬 화면' },
    ],
  },
  {
    slug: 'ar-fire-training',
    group: 'company',
    number: '04',
    category: 'MOBILE AR · SIMULATION',
    period: '2024.10 — 2024.12',
    title: '표준작전절차 기반 AR 화재진압 훈련',
    shortTitle: 'AR 화재진압 훈련',
    summary: '데이터 테이블 기반 시나리오와 FSM 진행 로직으로 소방호스 조작·퀴즈·성공/실패 분기를 제공하는 Unreal Engine 5 Android AR 훈련 앱.',
    impact: 'DataTable·FSM 시나리오 · Galaxy Tab S8 검증',
    role: 'Android Client Developer',
    team: 'STANS · 3 DEV + PM + 3D ARTIST',
    stack: ['Unreal Engine 5', 'C++', 'Android', 'AR', 'FSM', 'DataTable'],
    context: '소방청 화재 진압 교육을 모바일 AR에서 제공하기 위한 Android 클라이언트를 Unreal Engine 5와 C++로 개발했습니다. 데이터 테이블에 정의된 훈련 단계와 퀴즈를 런타임 시나리오로 연결했습니다.',
    challenge: '훈련 절차에 맞춰 애니메이션·이벤트·퀴즈 선택지를 순서대로 진행하고, 소방호스 조작과 교육 자료를 모바일 UI에서 제공해야 했습니다. Android Vulkan 환경에서 Niagara 이펙트가 정상 재생되지 않는 문제도 발생했습니다.',
    approach: ['DataTable을 읽어 런타임에 시나리오 액터를 생성하고 FSM 기반 진행 흐름을 구현했습니다.', '곡선형 충돌체를 발사해 일정 시간 화재 대상과 충돌하면 불이 꺼지는 상호작용을 개발했습니다.', 'C++와 Widget Blueprint로 설정·시나리오·퀴즈·성공/실패 UI와 이미지 기반 PDF 뷰어를 제작하고, 문제가 된 Niagara 이펙트는 대체 이펙트로 교체했습니다.'],
    results: ['Galaxy Tab S8 실기기에서 구동 확인 및 프로젝트 납품 완료', '데이터 기반 시나리오와 성공/실패 분기 구조 구현', 'Vulkan 이펙트 문제를 대체 이펙트 적용으로 대응'],
    images: [
      { src: '/portfolio-media/image3.png', alt: 'AR 화재진압 훈련 시뮬레이터 화면' },
      { src: '/portfolio-media/image4.png', alt: 'AR 화재진압 훈련의 화재 상호작용 화면' },
    ],
  },
  {
    slug: 'awas-xr',
    group: 'company',
    number: '05',
    category: 'HOLOLENS 2 · MR TRAINING',
    period: '2023.12 — 2024.05',
    title: 'AWAS-XR 공정 교육 시나리오 제작 프로그램',
    shortTitle: 'AWAS-XR',
    summary: 'HoloLens 2에서 MR 공정 교육 콘텐츠를 제작하고 실행하는 Unity 기반 클라이언트.',
    impact: 'UGUI 전환 · Grab · Job System 로딩 개선',
    role: 'HoloLens 2 Client Developer',
    team: 'STANS · CLIENT DEVELOPMENT',
    stack: ['Unity', 'C#', 'HoloLens 2', 'UGUI', 'Job System', 'Shader'],
    context: 'HoloLens 2에서 MR 공정 교육 시나리오를 제작하고 실행하는 Unity 클라이언트를 개발했습니다. UI, 가상 물체 조작, 대형 모델 로딩과 디바이스용 셰이더를 담당했습니다.',
    challenge: 'HoloLens 2의 입력·시야·성능 제약 안에서 UI와 3D 상호작용을 안정적으로 제공하고, 대형 모델을 로딩하는 흐름을 개선해야 했습니다.',
    approach: [
      'Color Picker와 User Menu를 제작하고 프로젝트 전체 UI를 Physics-based 방식에서 UGUI로 전환했습니다.',
      '가상공간 물체를 잡고 조작하는 Grab 시스템과 HoloLens 2용 Outline Shader를 구현했습니다.',
      'Unity Job System을 적용해 모델 로딩 병목을 개선했습니다.',
    ],
    results: ['프로젝트 전체 UI를 UGUI로 전환하고 MR 교육 콘텐츠 조작 흐름 구현', 'Grab 시스템·Outline Shader·Job System 기반 모델 로딩 개선 적용'],
    images: [{ src: '/portfolio-media/image5.png', alt: 'AWAS-XR HoloLens 2 공정 교육 화면' }],
  },
  {
    slug: 'land400-hums',
    group: 'company',
    number: '06',
    category: 'EMBEDDED · RELIABILITY',
    period: '2023.06 — 2023.12',
    title: 'LAND400 Phase3 AS9 & AS10 HUMS',
    shortTitle: 'LAND400 HUMS',
    summary: 'Health and Usage Monitoring System의 Linux SBC 소프트웨어를 재설계하고 데이터 처리·UDP 패킷 복구 구조를 구현한 임베디드 프로젝트.',
    impact: '20ms 데이터 처리 · 수락시험 통과',
    role: 'HUMS SBC Software Engineer',
    team: 'DANAM SYSTEMS · EMBEDDED DEVELOPMENT',
    stack: ['C', 'Linux', 'SBC', 'Message Queue', 'UDP', 'Helix QAC', 'SureSoft Cover'],
    context: 'LAND400 상태감시시스템의 HUMS SBC 소프트웨어를 C와 Linux 환경에서 설계·구현했습니다. 기존 1만 줄 이상 단일 파일 중심 코드를 수신·정제·저장 파이프라인으로 재구성했습니다.',
    challenge: '납품 일정과 20ms 간격 데이터 처리 요구를 만족하면서, 기존 구조의 유지보수 문제와 UDP 통신 중 패킷 누락을 함께 해결해야 했습니다.',
    approach: [
      '데이터 수신·정제·저장 기능을 독립 프로세스로 분리하고 Message Queue로 연결했습니다.',
      '타임스탬프 또는 패킷 번호를 기준으로 UDP 누락을 감지하고 데이터 수집 장치에 재요청하는 구조를 구현했습니다.',
      'Helix QAC와 SureSoft Cover를 활용한 정적·동적 검사 및 수락시험에 대응했습니다.',
    ],
    results: ['1만 줄 이상 단일 파일 중심 코드를 멀티프로세스·Message Queue 구조로 재구성', '20ms 간격 데이터 처리 기반과 UDP 패킷 누락 감지·재요청 구조 구현', '정적·동적 검사와 전 장비 수락시험 통과 및 납품 일정 준수 지원'],
  },
  {
    slug: 'pearl-abyss-red-desert',
    group: 'company',
    number: '07',
    category: 'GAME · UI/UX',
    period: '2023.03 — 2023.05',
    title: '붉은사막',
    shortTitle: '붉은사막 UI',
    summary: '펄어비스 블랙스페이스 엔진에서 HTML/CSS와 C++ 컨트롤러를 활용해 PC 게임 UI와 디버깅 도구를 개발한 프로젝트.',
    impact: '원형 퀵슬롯 · 월드맵 디버깅 UI',
    role: 'UI Developer · Intern',
    team: 'PEARL ABYSS · NEW PROJECT',
    stack: ['C++', 'HTML', 'CSS', '블랙스페이스 엔진'],
    context: '펄어비스 블랙스페이스 엔진 기반 PC 게임 붉은사막에서 UI 개발 인턴으로 참여했습니다. 자체 엔진의 UI 구조를 파악하고 HTML/CSS와 C++ 컨트롤러를 연결해 키보드·마우스 기반 기능을 구현했습니다.',
    challenge: '짧은 인턴 기간 안에 자체 엔진의 UI 처리 흐름을 이해하면서, 플레이어용 UI와 콘텐츠 제작자를 위한 디버깅 UI를 기존 엔진 구조에 맞춰 구현해야 했습니다.',
    approach: [
      'HTML/CSS로 원형 퀵슬롯 UI를 구성하고 C++ 컨트롤러로 키보드·마우스 입력과 캐릭터·장비 변경을 연결했습니다.',
      '전체 월드맵의 오브젝트를 핀으로 표시해 지역별 분포와 밀집 상태를 확인하는 디버깅 UI를 구현했습니다.',
      '기존 자체 엔진의 처리 흐름을 파악한 뒤 개발 PD의 피드백을 반영해 기능을 정리했습니다.',
    ],
    results: ['키보드·마우스로 조작하는 원형 퀵슬롯과 캐릭터·장비 변경 처리 구현', '월드맵 오브젝트 밀집 상태를 확인하는 디버깅 UI 구현', '개발 PD로부터 디버깅에 도움이 되었다는 피드백 수령'],
    images: [
      { src: '/portfolio-media/image6.png', alt: '붉은사막 퀵슬롯 UI 화면' },
      { src: '/portfolio-media/image7.png', alt: '붉은사막 적 체력 UI 화면' },
    ],
  },
  {
    slug: 'project-lup',
    group: 'personal',
    number: '08',
    category: 'UNITY · AI · SOLO PROJECT',
    period: '2023.01 — 2023.02',
    title: 'Project LUP',
    shortTitle: 'PROJECT LUP',
    summary: 'Behavior Tree 기반 자동 전투 AI와 동적 스킬·타겟 결정을 구현한 1인 방치형 RPG 프로젝트.',
    impact: '전투 AI · BT Debugger · Shader UI',
    role: 'Solo Developer',
    team: '1-PERSON PROJECT',
    stack: ['Unity', 'C#', 'Behavior Tree', 'Shader', 'UGUI'],
    context: '자동 전투를 중심으로 캐릭터가 전투 상황에 따라 스킬과 타겟을 선택하는 Unity 기반 방치형 RPG를 전체 개발했습니다.',
    challenge: '스킬 범위와 회복 필요성 등 다양한 조건에 따라 행동을 선택하면서도, MonoBehaviour가 아닌 Behavior Tree 노드의 상태를 런타임에 확인할 수 있어야 했습니다.',
    approach: [
      'OnStart·OnUpdate·OnStop 흐름을 가진 Behavior Tree 노드 구조와 UGUI 기반 Behavior Tree Debugger를 구현했습니다.',
      'SkillSlot·SkillSet·SkillActionNode를 조합해 전투 상황에 따라 스킬과 공격·회복 타겟을 동적으로 결정하도록 구성했습니다.',
      '캐릭터 수에 따른 UGUI Draw Call 증가를 줄이는 방향으로 Shader 기반 Health Bar와 전투 카메라 추적·흔들림을 구현했습니다.',
    ],
    results: ['전투 상황에 따른 자동 스킬·타겟 결정 흐름 구현', 'UGUI 기반 디버거로 Behavior Tree 노드 반환 상태 추적 가능', 'Shader Health Bar와 전투 카메라 시스템으로 전투 가독성과 연출 구성'],
    youtube: 'https://youtu.be/9gVlJFajaxc',
    images: [
      { src: '/portfolio-media/image8.jpeg', alt: 'Project LUP 전투 대기 화면' },
      { src: '/portfolio-media/image23.png', alt: 'Project LUP 전투 중 스킬 연출 화면' },
    ],
  },
  {
    slug: 'deus-ex-machina',
    group: 'personal',
    number: '09',
    category: 'UNITY · MULTIPLAYER · PVP',
    period: '2022.09 — 2022.12',
    title: 'Deus Ex Machina',
    shortTitle: 'DEUS EX MACHINA',
    summary: '기획자 5명과 협업해 제작한 1:4 비대칭 PVP 팀 프로젝트로, 계정·네트워크·상호작용 시스템을 담당했습니다.',
    impact: '계정·네트워크 · Interaction · Casting',
    role: 'Client Programmer',
    team: '8-PERSON TEAM · 3 PROGRAMMERS / 5 DESIGNERS',
    stack: ['Unity', 'C#', 'Photon', 'Google Apps Script', 'Google Sheets'],
    context: '퇴마사와 악령이 들린 인형 진영이 서로 다른 목표를 수행하는 5인 멀티플레이 게임을 프로그래머 3명과 기획자 5명으로 제작했습니다.',
    challenge: 'DBMS를 사용할 수 없는 환경에서 계정·접속 로그를 관리하고, Photon 플레이어 데이터와 반복 가능한 상호작용·캐스팅 구조를 공유해야 했습니다.',
    approach: [
      'Google Sheets와 Apps Script를 이용해 계정 데이터와 접속 로그를 관리하고 JSON 기반 통신 흐름을 구성했습니다.',
      'Photon API 데이터 공유 과정을 Facade 형태의 DataManager로 래핑해 플레이어 데이터 수정·공유 흐름을 정리했습니다.',
      'IInteractable 기반 상호작용 탐색·UI 표시와 Cast·CastFuncSet 조합의 Builder 패턴 캐스팅 시스템을 구현했습니다.',
    ],
    results: ['DBMS 없이 Google Sheets·Apps Script 기반 계정·로그 관리 흐름 구현', 'Photon 플레이어 데이터 공유와 상호작용·캐스팅 공통 시스템 구현', '기획 문서를 요구사항과 프로토타입으로 검증하며 3명의 프로그래머·5명의 기획자와 협업'],
    youtube: 'https://youtu.be/p3pPeP9O2TY',
    images: [
      { src: '/portfolio-media/image28.png', alt: 'Deus Ex Machina 인게임 장면' },
      { src: '/portfolio-media/image34.png', alt: 'Deus Ex Machina 상호작용 장면' },
      { src: '/portfolio-media/image38.png', alt: 'Deus Ex Machina 전투 장면' },
    ],
  },
  {
    slug: 'rockman-x5-remake',
    group: 'personal',
    number: '10',
    category: 'C++ · WINDOWS API · 2D GAME',
    period: '2022.08 — 2022.09',
    title: 'Rockman X5 모작',
    shortTitle: 'ROCKMAN X5',
    summary: 'Windows API로 2D 횡스크롤 게임 프레임워크와 스프라이트 에디터를 제작한 1인 프로젝트.',
    impact: '게임 프레임워크·SAT 충돌·스프라이트 편집',
    role: 'Solo Developer',
    team: '1-PERSON PROJECT',
    stack: ['C++', 'Windows API', 'GDI+', 'FSM', 'SAT'],
    context: '록맨 X5 오프닝 스테이지를 목표로 Windows API 기반 2D 게임과 제작 도구를 직접 구현했습니다.',
    challenge: '게임 루프, 렌더링, 충돌, 캐릭터 상태, 애니메이션 편집을 외부 게임 엔진 없이 하나의 구조로 연결해야 했습니다.',
    approach: [
      'Game·Scene·Camera·Actor·Behavior 등으로 구성된 자체 게임 프레임워크를 설계했습니다.',
      'SAT로 AABB·OBB 충돌을 처리하고 FSM으로 플레이어와 적 AI 상태를 관리했습니다.',
      '스프라이트 범위·Pivot·애니메이션 프레임을 편집하고 저장하는 에디터를 제작했습니다.',
    ],
    results: ['Windows API 기반 횡스크롤 게임 플레이와 적 AI 구현', '스프라이트 애니메이션 제작·디버깅 도구 구현'],
    youtube: 'https://youtu.be/Izxj7TzOfHA',
    images: [
      { src: '/portfolio-media/image41.jpeg', alt: 'Rockman X5 모작 인게임 전투 화면' },
      { src: '/portfolio-media/image48.png', alt: 'Rockman X5 모작 인게임 장면' },
    ],
  },
  {
    slug: 'deadlock-c-tank-game',
    group: 'personal',
    number: '11',
    category: 'C · CONSOLE · 2D GAME',
    period: '2022.05.06 — 2022.05.17',
    title: 'Deadlock',
    shortTitle: 'DEADLOCK',
    summary: '그래픽 라이브러리 없이 BMP 이미지를 콘솔 픽셀로 출력한 C언어 2D 턴제 탱크 슈팅 게임.',
    impact: 'BMP → 콘솔 픽셀 렌더러',
    role: 'Solo Developer',
    team: '1-PERSON PROJECT',
    stack: ['C', 'Windows Console', 'BMP', 'PutPixel/DrawSprite', 'Turn-based AI'],
    context: '웜즈와 포트리스에서 영감을 받아 콘솔 창에서 플레이하는 2D 탱크 슈팅 게임을 제작했습니다.',
    challenge: 'C언어와 콘솔 환경만으로 BMP 파일을 읽고 이미지 기반 게임 화면을 구성해야 했으며, 출력 픽셀 간격에 따라 렌더링 속도도 달라졌습니다.',
    approach: [
      'BMP 파일을 읽어 Surface로 변환하고 콘솔 문자 하나를 픽셀처럼 사용하는 PutPixel·DrawSprite 출력 흐름을 구현했습니다.',
      '탱크 이동, 포탄의 포물선 발사, 탱크별 데미지와 3스테이지 진행을 구성했습니다.',
      '플레이어 턴과 AI 턴을 분리하고 난이도에 따라 AI 명중률을 보정했습니다.',
    ],
    results: ['그래픽 라이브러리 없이 콘솔 기반 BMP 렌더링 구현', '난이도·탱크 선택·턴 진행·3스테이지 승패 흐름 구현'],
    youtube: 'https://youtu.be/ym8-lvTHfhM',
    images: [
      { src: '/portfolio-media/image51.png', alt: 'Deadlock 게임 시작 화면' },
      { src: '/portfolio-media/image54.png', alt: 'Deadlock 게임 승리 화면' },
    ],
  },
  {
    slug: 'vr-flight',
    group: 'personal',
    number: '12',
    category: 'VR · FLIGHT SIMULATION',
    period: '2020.12 — 2021.06',
    title: 'VR Flight Simulation',
    shortTitle: 'VR FLIGHT',
    summary: 'F-16 조종석에서 계기비행과 착륙을 수행하는 Unreal Engine 4 기반 PC VR 항공기 시뮬레이터.',
    impact: '비행 시스템 · 항공전자 UI · VR 조작',
    role: 'Team Lead · Developer',
    team: '4-PERSON TEAM',
    stack: ['Unreal Engine 4', 'C++', 'Blueprint', 'Blender', 'VR'],
    context: '한서대학교 4인 졸업 프로젝트에서 팀장과 개발자를 맡아 F-16 조종석의 비행 시스템, 항공전자 장비, VR 상호작용을 구현했습니다.',
    challenge: '짧은 기간 안에 간이 항공역학 계산, 비행 상태와 계기 UI의 연동, VR 조종석 상호작용과 항공기 모델·애니메이션을 함께 완성해야 했습니다.',
    approach: ['Blueprint 중심으로 비행 시스템과 조종사·항공기 시점 카메라를 구현하고 기능 우선순위를 관리했습니다.', 'HUD, Air Speed Indicator, Altimeter, Attitude Director 등 주요 항공전자 계기와 로직을 개발했습니다.', '핸드 트래킹 기반 조종석 상호작용과 항공기 모델·애니메이션을 제작하고 Jira·Confluence로 일정과 문서를 관리했습니다.'],
    results: ['비행 상태와 연동되는 F-16 조종석 계기 및 간이 비행 시스템 구현', 'VR 핸드 트래킹으로 항공전자 장비를 조작하는 PC VR 시뮬레이터 완성'],
    youtube: 'https://youtu.be/R9U9pKLASw0?t=942',
    links: [{ label: 'GitHub Repository', href: 'https://github.com/ArshesSH/VRFlight' }],
    images: [
      { src: '/portfolio-media/image58.png', alt: 'VRFlight 시연 장면' },
      { src: '/portfolio-media/image62.png', alt: 'VRFlight 조종석 인게임 화면' },
    ],
  },
  {
    slug: 'fixed-wing-flight-controller',
    group: 'personal',
    number: '13',
    category: 'EMBEDDED · FLIGHT CONTROL',
    period: '2020.09 — 2020.12',
    title: 'Sky Stability',
    shortTitle: 'Sky Stability',
    summary: 'Arduino와 C 기반 PID 제어로 고정익 무인항공기의 수평 자세를 제어한 4인 캡스톤 프로젝트.',
    impact: 'PID 기반 고정익 자세 제어',
    role: 'Team Lead · Software Developer',
    team: '4-PERSON TEAM',
    stack: ['Arduino', 'C', 'C++', 'PID Control'],
    context: '한서대학교 4인 캡스톤 프로젝트에서 팀장과 소프트웨어 개발을 맡아 고정익 무인항공기의 데이터 전달 과정과 수평 자세 제어 시스템을 개발했습니다.',
    challenge: '무인항공기 데이터 전달 과정과 자세 제어 알고리즘을 이해하고, 센서 입력과 모터 출력을 연결하는 제어 루프를 팀 단위로 완성해야 했습니다.',
    approach: ['자세 센서 데이터를 읽어 기체의 현재 상태를 계산했습니다.', '목표 수평 자세와의 오차를 PID 제어 입력으로 사용하고 모터 출력에 반영했습니다.', '필요한 제어 원리를 학습해 팀원과 공유하며 프로젝트 진행을 관리했습니다.'],
    results: ['Arduino 기반 센서 입력·PID 계산·모터 출력 제어 루프 구현', '고정익 무인항공기 수평 자세 제어 프로젝트 완료'],
    links: [{ label: 'GitHub Repository', href: 'https://github.com/ArshesSH/Fixed-wing_FlightController' }],
    images: [{ src: '/portfolio-media/image63.png', alt: 'Sky Stability 무인항공기 시연 화면' }],
  },
]

function Arrow() {
  return <span aria-hidden="true">↗</span>
}

function getRoute() {
  return window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
}

function getYoutubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    const isShortUrl = parsed.protocol === 'https:' && parsed.hostname === 'youtu.be'
    const isYoutubeUrl = parsed.protocol === 'https:' && ['youtube.com', 'www.youtube.com'].includes(parsed.hostname)
    if (!isShortUrl && !isYoutubeUrl) return null

    const videoId = isShortUrl ? parsed.pathname.slice(1) : parsed.searchParams.get('v')
    if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null

    const start = parsed.searchParams.get('t')?.match(/^\d+/)?.[0]
    const params = new URLSearchParams({ rel: '0', modestbranding: '1' })
    if (start) params.set('start', start)
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`
  } catch {
    return null
  }
}

function Header({ project, onDownload }: { project?: boolean; onDownload: () => void }) {
  return (
    <header className="site-header">
      <a className="brand" href="#/" aria-label="홈으로">SH<span>.</span></a>
      <nav aria-label="주요 메뉴">
        {project ? <a href="#/projects">All projects</a> : <a href="#/projects">Projects</a>}
      </nav>
      <div className="header-actions">
        <button className="header-pdf" type="button" onClick={onDownload} title="전체 프로젝트가 포함된 PDF 저장">
          PDF 저장 <Arrow />
        </button>
        <a className="header-contact" href="mailto:cendrillio@naver.com">Contact <Arrow /></a>
      </div>
    </header>
  )
}

function ProjectGrid({ items = projects, limit }: { items?: Project[]; limit?: number }) {
  const list = limit ? items.slice(0, limit) : items
  return (
    <div className="project-grid">
      {list.map((project) => (
        <a className="project-tile" href={`#/project/${project.slug}`} key={project.slug}>
          <div className="tile-top"><span>{project.number}</span><span>{project.category}</span><Arrow /></div>
          <div className={`tile-visual${project.images?.length ? ' has-image' : ''}`} aria-hidden="true">
            {project.images?.[0] && <img src={project.images[0].src} alt="" />}
            <span>{project.shortTitle}</span>
          </div>
          <div className="tile-copy">
            <p>{project.period}</p>
            <h3>{project.title}</h3>
            <span>{project.summary}</span>
          </div>
          <div className="tile-impact"><small>IMPACT</small>{project.impact}</div>
        </a>
      ))}
    </div>
  )
}

function Home({ onDownload }: { onDownload: () => void }) {
  return (
    <>
      <Header onDownload={onDownload} />
      <main id="main">
        <section className="hero">
          <p className="eyebrow"><span className="status-dot" /> SEOUL · REAL-TIME 3D · INTERACTIVE SYSTEMS</p>
          <div className="hero-title">
            <p>김세현 / KIM SAEHYEON · PORTFOLIO 2026</p>
            <h1>REAL-TIME<br /><span>3D CLIENT</span><br />ENGINEER.</h1>
          </div>
          <div className="hero-bottom">
            <p>Unity·Unreal Engine·자체 엔진으로 현장용 AR, 네트워크 VR,<br /><strong>디지털 트윈 클라이언트</strong>를 개발해왔습니다.</p>
            <button className="hero-pdf-button" type="button" onClick={onDownload}>
              <span>PORTFOLIO PDF</span>
              전체 프로젝트 저장 <Arrow />
            </button>
          </div>
        </section>

        <ProfileSection />

        <section className="featured section">
          <div className="section-heading">
            <p className="section-index">02 / WORK ARCHIVE</p>
            <h2>프로젝트 소개</h2>
            <div className="section-heading-side">
              <p>프로젝트별 담당 범위와 기술적 선택, 확인할 수 있는 결과를 정리했습니다.</p>
              <a className="all-projects-link" href="#/projects">모든 프로젝트 보기 <span>{projects.length.toString().padStart(2, '0')}</span> <Arrow /></a>
            </div>
          </div>
          <ProjectGrid limit={5} />
        </section>

        <Contact />
      </main>
    </>
  )
}

function ProjectsPage({ onDownload }: { onDownload: () => void }) {
  const companyProjects = projects.filter((project) => project.group === 'company')
  const personalProjects = projects.filter((project) => project.group === 'personal')

  return (
    <>
      <Header onDownload={onDownload} />
      <main id="main" className="page-main">
        <section className="page-intro">
          <p className="section-index">PROJECT ARCHIVE / 2020 — 2026</p>
          <h1>프로젝트 소개</h1>
          <p>회사 프로젝트와 개인 및 팀 프로젝트에서 맡은 역할과 구현 내용을 구분해 정리했습니다.</p>
        </section>
        <section className="archive section">
          <div className="archive-group">
            <div className="archive-group-heading">
              <p className="section-index">01 / COMPANY PROJECTS</p>
              <div>
                <h2>회사 프로젝트</h2>
                <p>실무에서 제품과 클라이언트 개발을 담당한 프로젝트입니다.</p>
              </div>
              <span>{companyProjects.length.toString().padStart(2, '0')} PROJECTS</span>
            </div>
            <ProjectGrid items={companyProjects} />
          </div>
          <div className="archive-group">
            <div className="archive-group-heading">
              <p className="section-index">02 / PERSONAL & TEAM PROJECTS</p>
              <div>
                <h2>개인 및 팀 프로젝트</h2>
                <p>기획부터 구현까지 직접 진행하거나 팀으로 협업하며 기술을 확장한 프로젝트입니다.</p>
              </div>
              <span>{personalProjects.length.toString().padStart(2, '0')} PROJECTS</span>
            </div>
            <ProjectGrid items={personalProjects} />
          </div>
        </section>
        <Contact />
      </main>
    </>
  )
}

function ProjectPage({ project, onDownload }: { project: Project; onDownload: () => void }) {
  const index = projects.findIndex((item) => item.slug === project.slug)
  const next = projects[(index + 1) % projects.length]
  const youtubeEmbedUrl = project.youtube ? getYoutubeEmbedUrl(project.youtube) : null
  return (
    <>
      <Header project onDownload={onDownload} />
      <main id="main" className="project-page">
        <section className="project-hero">
          <div className="project-kicker"><span>{project.number} / {projects.length.toString().padStart(2, '0')}</span><span>{project.category}</span></div>
          <h1>{project.title}</h1>
          <p className="project-lead">{project.summary}</p>
          <dl className="project-facts">
            <div><dt>PERIOD</dt><dd>{project.period}</dd></div>
            <div><dt>ROLE</dt><dd>{project.role}</dd></div>
            <div><dt>TEAM</dt><dd>{project.team}</dd></div>
          </dl>
        </section>

        <div className={`project-banner${project.images?.length ? ' has-image' : ''}`}>
          {project.images?.[0] && <img src={project.images[0].src} alt={project.images[0].alt} />}
          <div className="project-banner-overlay" />
          <span>{project.shortTitle}</span><small>{project.category}</small>
        </div>

        {youtubeEmbedUrl && <section className="project-video section">
          <div className="project-video-heading"><p className="section-index">PROJECT VIDEO</p><p>프로젝트 설명에 앞서 주요 플레이 장면을 확인할 수 있습니다. <a className="project-video-link" href={project.youtube} target="_blank" rel="noreferrer">YouTube에서 보기 <Arrow /></a></p></div>
          <div className="project-video-frame"><iframe src={youtubeEmbedUrl} title={`${project.title} YouTube 영상`} loading="lazy" allow="encrypted-media; picture-in-picture; web-share" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
        </section>}

        {project.images && <section className="project-media section">
          <div className="project-media-heading"><p className="section-index">PROJECT MEDIA</p><p>포트폴리오 문서에 포함된 주요 화면입니다.</p></div>
          <div className="project-media-grid">
            {project.images.map((image) => <figure key={image.src}><img src={image.src} alt={image.alt} /><figcaption>{image.alt}</figcaption></figure>)}
          </div>
        </section>}

        <section className="case-study section">
          <div className="case-row"><p className="section-index">01 / CONTEXT</p><div><h2>배경</h2><p>{project.context}</p></div></div>
          <div className="case-row"><p className="section-index">02 / CHALLENGE</p><div><h2>문제</h2><p>{project.challenge}</p></div></div>
          <div className="case-row"><p className="section-index">03 / APPROACH</p><div><h2>구현</h2><ol>{project.approach.map((item) => <li key={item}>{item}</li>)}</ol></div></div>
          <div className="case-row result-row"><p className="section-index">04 / OUTCOME</p><div><h2>결과</h2><ul>{project.results.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
          <div className="project-stack"><p className="section-index">TECHNOLOGY</p><ul>{project.stack.map((item) => <li key={item}>{item}</li>)}</ul></div>
          {project.links && <div className="project-links">{project.links.map((link) => <a href={link.href} target="_blank" rel="noreferrer" key={link.href}>{link.label} <Arrow /></a>)}</div>}
        </section>

        <a className="next-project" href={`#/project/${next.slug}`}>
          <span>NEXT PROJECT · {next.number}</span>
          <strong>{next.title}</strong>
          <Arrow />
        </a>
      </main>
    </>
  )
}

const experience = [
  ['2025.09 — PRESENT', 'OASIS STUDIO', 'AI Lab · 연구원', 'Unity Android AR 및 Unreal Engine 5 VR 클라이언트 개발'],
  ['2023.12 — 2025.04', 'STANS', '주임 연구원', 'Unity XR·디지털 트윈·Unreal Engine 5 모바일 AR·Tauri 클라이언트 개발'],
  ['2023.06 — 2023.12', 'DANAM SYSTEMS', '연구원', 'LAND400 Phase3 AS9 & AS10 HUMS 임베디드 소프트웨어 개발'],
  ['2023.03 — 2023.05', 'PEARL ABYSS', 'UI 개발 인턴', '블랙스페이스 엔진 기반 붉은사막 UI 및 디버깅 도구 구현'],
]

const education = [
  ['2024.09 — PRESENT', '홍익대학교 영상·커뮤니케이션대학원', 'VR·AR콘텐츠 · 석사 재학'],
  ['2016.03 — 2022.02', '한서대학교', '항공소프트웨어공학 · 학사 · GPA 4.29 / 4.5'],
]

function ProfileSection() {
  return (
    <section className="profile section">
      <div className="profile-heading">
        <p className="section-index">01 / PROFILE</p>
        <div>
          <h2>실시간 3D 클라이언트<br />개발자 김세현입니다.</h2>
          <p>Unity·Unreal Engine·자체 엔진·Babylon.js 기반 클라이언트와 Linux/C 임베디드 소프트웨어를 개발해왔습니다.</p>
        </div>
      </div>
      <div className="profile-body">
        <div className="profile-statement">
          <p>Unity·Unreal Engine·자체 엔진·Babylon.js 환경에서 AR·VR·디지털 트윈과 게임 UI를 구현했습니다.</p>
          <p>Sentis 추론 속도 개선, 전신 트래킹 동기화, 위치 기반 데이터 로딩, UDP 패킷 복구처럼 배포 환경에서 발생한 문제를 해결해왔습니다.</p>
          <p>현재 홍익대학교 영상·커뮤니케이션대학원에서 VR·AR콘텐츠를 전공하며 실시간 3D 클라이언트 개발을 확장하고 있습니다.</p>
        </div>
        <div className="experience-list">
          <p className="section-index">EXPERIENCE</p>
          {experience.map(([period, company, role, detail]) => <article key={company}><p>{period}</p><h2>{company}</h2><span>{role}</span><small>{detail}</small></article>)}
        </div>
        <div className="education-list">
          <p className="section-index">EDUCATION</p>
          {education.map(([period, school, detail]) => <article key={school}><p>{period}</p><h2>{school}</h2><span>{detail}</span></article>)}
        </div>
        <div className="capabilities">
          <p className="section-index">CAPABILITIES</p>
          {['Unreal Engine 4/5 · Unity · Babylon.js', 'C++ · C# · C · TypeScript', 'Pico SDK · AR Foundation · Sentis · GAS', 'SvelteKit · Tauri · OpenLayers · GIS', 'Linux · UDP · Message Queue · Win32 API', 'Blender · Jira · Confluence · Perforce'].map((item) => <span key={item}>{item}</span>)}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return <section className="contact"><p className="section-index">CONTACT</p><h2>프로젝트 및 채용 관련 연락은 이메일로 부탁드립니다.</h2><a href="mailto:cendrillio@naver.com">cendrillio@naver.com <Arrow /></a></section>
}

function PrintPortfolio() {
  return (
    <article className="print-document">
      <header className="print-cover">
        <p className="print-eyebrow">KIM SAEHYEON · PORTFOLIO 2026</p>
        <h1>REAL-TIME<br /><span>3D CLIENT</span><br />ENGINEER.</h1>
        <p className="print-cover-summary">Unity·Unreal Engine·자체 엔진을 중심으로 AR·VR·디지털 트윈 클라이언트를 개발해온 김세현의 전체 프로젝트 포트폴리오입니다.</p>
        <p className="print-cover-meta">SEOUL · REAL-TIME 3D · INTERACTIVE SYSTEMS<br />cendrillio@naver.com</p>
      </header>

      <section className="print-profile">
        <div className="print-section-label">01 / PROFILE</div>
        <div>
          <h2>실시간 3D 클라이언트 개발자 김세현입니다.</h2>
          <p>Unity·Unreal Engine·자체 엔진·Babylon.js 환경에서 AR·VR·디지털 트윈과 게임 UI를 구현했습니다.</p>
          <p>Sentis 추론 속도 개선, 전신 트래킹 동기화, 위치 기반 데이터 로딩, UDP 패킷 복구처럼 배포 환경에서 발생한 문제를 해결해왔습니다.</p>
          <p>현재 홍익대학교 영상·커뮤니케이션대학원에서 VR·AR콘텐츠를 전공하며 실시간 3D 클라이언트 개발을 확장하고 있습니다.</p>
        </div>
      </section>

      <section className="print-experience">
        <div className="print-section-label">EXPERIENCE</div>
        {experience.map(([period, company, role, detail]) => (
          <article key={company}><span>{period}</span><strong>{company}</strong><b>{role}</b><p>{detail}</p></article>
        ))}
      </section>

      <section className="print-project-index">
        <div className="print-section-label">02 / PROJECTS</div>
        <h2>전체 프로젝트</h2>
        <div className="print-index-grid">
          {projects.map((project) => <a href={`#project-${project.slug}`} key={project.slug}><span>{project.number}</span>{project.title}</a>)}
        </div>
      </section>

      <section className="print-projects">
        {projects.map((project) => (
          <article className="print-project" id={`project-${project.slug}`} key={project.slug}>
            <div className="print-project-header">
              <p className="print-project-kicker">PROJECT {project.number} / {projects.length.toString().padStart(2, '0')} · {project.category}</p>
              <h2>{project.title}</h2>
              <p className="print-project-summary">{project.summary}</p>
              <dl className="print-project-facts">
                <div><dt>PERIOD</dt><dd>{project.period}</dd></div>
                <div><dt>ROLE</dt><dd>{project.role}</dd></div>
                <div><dt>TEAM</dt><dd>{project.team}</dd></div>
              </dl>
            </div>

            {project.images && <div className="print-project-images">
              {project.images.map((image) => <figure key={image.src}><img src={image.src} alt={image.alt} /><figcaption>{image.alt}</figcaption></figure>)}
            </div>}

            <div className="print-case-study">
              <div><span>01 / CONTEXT</span><h3>배경</h3><p>{project.context}</p></div>
              <div><span>02 / CHALLENGE</span><h3>문제</h3><p>{project.challenge}</p></div>
              <div><span>03 / APPROACH</span><h3>구현</h3><ol>{project.approach.map((item) => <li key={item}>{item}</li>)}</ol></div>
              <div><span>04 / OUTCOME</span><h3>결과</h3><ul>{project.results.map((item) => <li key={item}>{item}</li>)}</ul></div>
            </div>

            <div className="print-project-footer">
              <div><span>TECHNOLOGY</span><p>{project.stack.join(' · ')}</p></div>
              {(project.youtube || project.links) && <div><span>LINKS</span><p>
                {project.youtube && <a href={project.youtube} target="_blank" rel="noreferrer">YouTube · {project.youtube}</a>}
                {project.youtube && project.links && ' · '}
                {project.links?.map((link, linkIndex) => <span key={link.href}>{linkIndex > 0 && ' · '}<a href={link.href} target="_blank" rel="noreferrer">{link.label} · {link.href}</a></span>)}
              </p></div>}
            </div>
          </article>
        ))}
      </section>

      <footer className="print-footer">© 2026 김세현 / KIM SAEHYEON · REAL-TIME 3D ENGINEER · SEOUL · cendrillio@naver.com</footer>
    </article>
  )
}

function App() {
  const [route, setRoute] = useState(getRoute())
  const [isPrintView, setIsPrintView] = useState(false)
  useEffect(() => {
    const update = () => { setRoute(getRoute()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  useEffect(() => {
    const finishPrint = () => {
      document.body.classList.remove('is-printing')
      setIsPrintView(false)
    }
    window.addEventListener('afterprint', finishPrint)
    return () => window.removeEventListener('afterprint', finishPrint)
  }, [])

  const downloadPdf = () => {
    document.body.classList.add('is-printing')
    setIsPrintView(true)
    window.setTimeout(async () => {
      const images = Array.from(document.querySelectorAll<HTMLImageElement>('.print-document img'))
      await Promise.all(images.map((image) => {
        if (image.complete) return Promise.resolve()
        return new Promise<void>((resolve) => {
          const finish = () => resolve()
          image.addEventListener('load', finish, { once: true })
          image.addEventListener('error', finish, { once: true })
        })
      }))
      window.print()
    }, 150)
  }

  let page
  if (route[0] === 'project' && route[1]) {
    const project = projects.find((item) => item.slug === route[1])
    page = project ? <ProjectPage project={project} onDownload={downloadPdf} /> : <ProjectsPage onDownload={downloadPdf} />
  } else if (route[0] === 'projects') page = <ProjectsPage onDownload={downloadPdf} />
  else page = <Home onDownload={downloadPdf} />

  return <>
    <div className="screen-app"><a className="skip-link" href="#main">본문으로 건너뛰기</a>{page}<footer><p>© 2026 김세현 / KIM SAEHYEON</p><p>REAL-TIME 3D ENGINEER · SEOUL</p><a href="#/">HOME ↑</a></footer></div>
    {isPrintView && <PrintPortfolio />}
  </>
}

export default App
