import type { DeepDive, ExperienceItem, Project, PortfolioContent } from './types'

type ProjectSeed = Omit<Project, 'id' | 'approach' | 'results' | 'links' | 'images' | 'deepDive'> & {
  approach: string[]
  results: string[]
  links?: { label: string; href: string }[]
  images?: { src: string; caption: string }[]
  deepDive?: Omit<DeepDive, 'id'>[]
}

const projectSeeds: ProjectSeed[] = [
  {
    slug: 'vr-taekwondo',
    group: 'company',
    number: '01',
    category: 'VR · FULL BODY TRACKING',
    period: '2026.05.14 — 2026.07.16',
    title: 'VR 태권도 대회용 프로그램',
    shortTitle: 'VR 태권도 대전',
    summary: 'Unreal Engine 5.6과 PICO SDK를 이용해 1:1 VR 대전 프로그램을 개발했습니다. 두 명의 VR 플레이어와 관전용 PC를 연결하고 전투 상태를 처리했습니다.',
    impact: '24개 관절 Transform · 30Hz 공유',
    role: 'VR Client Developer',
    team: '2-PERSON TEAM · PC 관전/리슨 서버',
    stack: ['Unreal Engine 5.6', 'C++', 'PICO SDK', 'GAS', 'Control Rig', 'UMG'],
    context: 'PICO 4 Ultra 2대와 PC 1대를 연결해, 두 명의 플레이어가 VR로 대전하고 PC에서 경기를 관전하는 대회용 프로그램을 개발했습니다. 2026년 7월 16일까지 개발을 마치고 대회 전에 전달과 검수를 진행했습니다.',
    challenge: 'PICO SDK에서 수집한 24개 관절 Transform을 네트워크로 공유하면서 전투 상태와 원격 캐릭터의 움직임을 함께 유지해야 했습니다. 또한 관전 카메라 추적과 발차기 판정 범위처럼 현장 테스트에서만 드러나는 문제에도 대응해야 했습니다.',
    approach: [
      'PICO SDK의 관절 데이터를 Control Rig의 FK/IK 구조에 적용하고, 사용자가 입력한 키를 기준으로 신체 크기를 보정하는 기능을 구현했습니다.',
      '24개 관절 Transform을 30Hz로 공유하고 원격 클라이언트에 스냅샷 보간을 적용했습니다. 또한 UDP Broadcast를 이용한 LAN 서버 검색과 자동 연결을 구성했습니다.',
      'GAS와 GameplayTag로 충돌 부위와 속도를 기준으로 한 데미지 산출과 전투 상태를 처리했습니다. 절차적 피격 애니메이션과 대전 HUD를 구현했고, 최종 통합과 패키징을 담당했습니다.',
      '현장 테스트에서 확인된 관전 카메라 추적 문제는 카메라 방향과 추적 대상을 결정하는 로직을 정리해 해결했습니다.',
    ],
    results: ['PICO 2대와 관전 PC를 연결한 전체 경기 흐름을 현장에서 테스트했습니다.', '대회 전에 프로그램을 전달하고 담당자 검수를 완료했습니다. 다만 실제 대회 운영에는 사용되지 않았습니다.'],
    youtube: 'https://youtu.be/JvcPezQjLvo',
    images: [{ src: '/portfolio-media/vr-taekwondo-main.png', caption: '경복궁을 배경으로 한 1:1 VR 대전 화면. 관전 PC 기준 시점입니다.' }],
    deepDive: [
      {
        heading: '관절 데이터에서 캐릭터 포즈까지',
        body: 'PICO SDK에서 제공하는 24개 관절 Transform을 캐릭터에 그대로 적용하면 자세가 어긋나는 문제가 있었습니다. 착용자마다 팔과 다리 길이가 달라 같은 회전값이라도 실제 자세가 달라지기 때문입니다. 이를 위해 사용자가 입력한 키를 기준으로 본 길이를 보정한 뒤 Control Rig에 적용했습니다. 상체는 FK로 회전을 따라가게 하고, 손과 발 끝단은 IK로 목표 위치를 맞췄습니다.',
        diagram: {
          spec: {
            kind: 'layers',
            layers: [
              { label: 'PICO SDK Body Tracking', sub: '24 joints · Transform (position + rotation)' },
              { label: '신체 크기 보정', sub: '사용자 입력 키 기준 본 길이 스케일 조정' },
              { label: 'Control Rig', sub: '상체 FK 회전 적용 / 손·발 끝단 IK 타겟 해석' },
              { label: '캐릭터 스켈레톤', sub: '최종 포즈 · 절차적 피격 애니메이션과 블렌딩' },
            ],
          },
          caption: '전신 트래킹 데이터가 캐릭터 포즈로 변환되는 단계.',
        },
      },
      {
        heading: '24개 관절을 30Hz로 공유하기',
        body: '두 대의 PICO를 연결한 대전에서는 상대 캐릭터의 움직임을 바탕으로 충돌을 판정해야 했습니다. 하지만 매 프레임 24개 관절을 모두 전송하면 대역폭을 감당하기 어려웠습니다. 전송 주기를 30Hz로 고정하고, 그 사이 구간은 원격 클라이언트에서 직전 스냅샷과 최신 스냅샷을 보간해 채웠습니다. 전투 상태는 관절 데이터와 분리해 신뢰성 있게 복제했습니다. 패킷이 늦어도 상태 전이가 어긋나지 않습니다.',
        diagram: {
          spec: {
            kind: 'flow',
            steps: [
              { label: '로컬 수집', sub: '매 프레임 24 joints' },
              { label: '30Hz 샘플링', sub: '전송 주기 고정' },
              { label: '스냅샷 전송', sub: 'joints + timestamp' },
              { label: '버퍼링', sub: '원격 스냅샷 큐' },
              { label: '보간 재생', sub: '프레임 간 blend' },
            ],
          },
          caption: '관절 스냅샷 전송과 원격 보간 흐름.',
        },
        code: {
          label: '원격 캐릭터 스냅샷 보간',
          lang: 'C++',
          pseudo: true,
          source: `// 회사 프로젝트이므로 실제 구현 대신 구조만 표기합니다.

on_receive(snapshot):
    buffer.push(snapshot)                  // timestamp 순 정렬 유지
    trim_older_than(buffer, now - delay)

tick(dt):
    t = now - interpolation_delay          // 한 스냅샷 분량 뒤를 재생
    (prev, next) = buffer.find_around(t)
    if not next:
        pose = extrapolate(prev, t)        // 패킷 유실 시 짧게만 외삽
    else:
        alpha = (t - prev.time) / (next.time - prev.time)
        for i in 0..23:
            pose[i].location = lerp(prev[i].location, next[i].location, alpha)
            pose[i].rotation = slerp(prev[i].rotation, next[i].rotation, alpha)

    apply_to_control_rig(pose)              // 전투 상태는 별도 신뢰 복제 채널`,
        },
      },
      {
        heading: '대회장에서 서버 주소 없이 연결하기',
        body: '대회 현장에서 운영자가 IP를 직접 입력하지 않아도 접속할 수 있는 기능이 필요했습니다. PC 관전 클라이언트를 리슨 서버로 두고, 헤드셋이 같은 LAN에 브로드캐스트를 보내 응답한 서버에 자동으로 접속하게 했습니다. 운영자는 PC에서 프로그램을 실행하고 헤드셋을 착용하기만 하면 됩니다. 접속에 실패하면 일정 간격으로 탐색을 재시도합니다.',
        diagram: {
          spec: {
            kind: 'sequence',
            lanes: ['PICO 4 Ultra (클라이언트)', 'PC 관전 (리슨 서버)'],
            messages: [
              { from: 0, label: 'UDP Broadcast로 서버 탐색 요청', note: '동일 서브넷 전체에 주기적으로 송신' },
              { from: 1, label: '응답으로 서버 주소와 세션 정보 전달', note: '리슨 서버가 자신의 엔드포인트를 회신' },
              { from: 0, label: '세션 참가 요청', note: '수신한 주소로 즉시 접속' },
              { from: 1, label: '플레이어 슬롯 배정 · 대전 시작', note: '2인 입장 완료 시 라운드 진입' },
            ],
          },
          caption: 'UDP 브로드캐스트를 이용한 LAN 서버 검색과 자동 연결.',
        },
      },
      {
        heading: '발차기를 점수로 바꾸는 판정',
        body: '태권도 대전에서는 타격이 닿았는지보다 어느 부위에 얼마나 빠르게 닿았는지가 중요했습니다. 충돌한 부위와 그 순간의 속도를 함께 읽어 데미지를 산출했습니다. 부위와 상태, 무효 조건은 모두 GameplayTag로 표현해 조건 분기를 데이터에서 처리했습니다. 판정이 성립하면 피격 방향에 맞는 절차적 애니메이션과 HUD 반영을 함께 실행했습니다.',
        diagram: {
          spec: {
            kind: 'flow',
            steps: [
              { label: '충돌 감지', sub: '공격 부위 ↔ 피격 부위' },
              { label: '태그 검사', sub: 'GameplayTag 유효 조건' },
              { label: '속도 산출', sub: '충돌 순간 상대 속도' },
              { label: 'GAS 이펙트', sub: '데미지 · 상태 전이' },
              { label: '피드백', sub: '절차적 피격 · HUD' },
            ],
          },
          caption: '충돌 부위와 속도를 함께 사용하는 타격 판정 흐름.',
        },
        code: {
          label: '충돌 부위·속도 기반 데미지 산출',
          lang: 'C++',
          pseudo: true,
          source: `// 회사 프로젝트이므로 실제 구현 대신 구조만 표기합니다.

on_hit(attacker_part, target_part, hit_velocity):
    if not target_part.tags.has("Body.Scoring"):
        return                                  // 득점 부위가 아니면 무시
    if attacker.tags.has("State.Stunned"):
        return                                  // 상태 태그로 무효 처리

    speed = project(hit_velocity, hit_normal)
    if speed < min_speed_threshold:
        return                                  // 스치는 접촉 제외

    damage = base_damage[target_part.zone] * scale(speed)

    apply_gameplay_effect(target, DamageEffect(damage))
    target.tags.add("State.Hit." + target_part.zone)
    play_procedural_hit_reaction(target_part, hit_normal)`,
        },
      },
      {
        heading: '규칙이 바뀔 것을 전제로 만든 판정',
        body: '대회 종목과 규칙은 개발 도중에 바뀔 수 있다고 판단해, 판정 기준을 코드에 상수로 두지 않았습니다. 판정 로직은 GAS와 GameplayTag로 규칙의 형태만 기술하고, 득점 부위와 수치는 DataAsset으로 분리했습니다. 이후 복싱 종목이 필요해졌을 때는 캐릭터와 맵 에셋을 교체하고 DataAsset을 조정하는 것으로 대응할 수 있었습니다. 트래킹과 동기화, 판정 파이프라인은 수정하지 않고 그대로 재사용했습니다.',
        media: { kind: 'youtube', src: 'https://youtu.be/1I24qFLC4lo', caption: '복싱 모드 대전 영상. 파이프라인을 수정하지 않고 에셋과 판정 DataAsset만 교체해 구성했습니다.' },
      },
    ],
  },
  {
    slug: 'ar-underground-pipeline',
    group: 'company',
    number: '02',
    category: 'ANDROID AR · PERFORMANCE',
    period: '2025.11 — 2026.03',
    title: 'AR 지하 배관 클라이언트',
    shortTitle: 'AR 지하 배관',
    summary: '실제 지하 배관의 위경도와 고도 데이터를 AR 공간에 배치하는 Android 클라이언트를 개발했습니다. ARCore 환경 깊이와 Unity AI Inference Depth estimation을 이용해 지하 배관을 가리는 Occlusion을 구현했습니다.',
    impact: 'Occlusion 두 방식 구현·비교 · 현장 PoC 완료 · 본사업 진행 중',
    role: 'Client Developer',
    team: 'OASIS AIX · PM · 모델러 · GIS · CLIENT',
    stack: ['Unity', 'C#', 'AR Foundation', 'ARCore', 'Unity AI Inference', 'Addressables'],
    context: '굴착 전에 지하 배관의 위치와 깊이를 현장에서 확인할 수 있도록 Android AR 클라이언트를 개발했습니다. 위경도와 고도, GIS 데이터를 사용자의 최초 GPS 위치를 기준으로 Unity 월드 좌표에 배치했습니다.',
    challenge: '전체 GIS 데이터를 한 번에 로드하기 어려웠습니다. 또한 AR Foundation의 기본 Occlusion만으로는 지하 오브젝트와 지상 오브젝트가 자연스럽게 구분되지 않았습니다.',
    approach: [
      'CSV 배관 데이터를 읽어 100m 청크 prefab을 생성하는 Unity 에디터 스크립트를 작성하고, Addressables를 이용한 런타임 로딩을 구현했습니다.',
      'ARCore 환경 깊이를 이용한 Occlusion과 Unity AI Inference Depth estimation을 이용한 Occlusion을 각각 구현해 지하 오브젝트와 지상 오브젝트를 구분했습니다.',
      '카메라와 배관 사이의 거리에 따라 픽셀을 솎아내는 디더링 셰이더를 적용해, 배관 경계와 원거리 구간을 자연스럽게 표현했습니다.',
    ],
    results: ['주변 100m 청크만 로드하는 구조를 구현하고, ARCore 환경 깊이와 Unity AI Inference를 이용한 Occlusion을 각각 구현해 현장에서 비교했습니다. 다만 이후 요구사항이 바뀌면서 최종 제품에는 Occlusion 기능이 포함되지 않았습니다.', '현장 검증을 포함한 PoC를 완료했고, 본사업 체결 이후 개발을 진행하고 있습니다.'],
    youtube: 'https://youtu.be/k6SDq25We3E',
    images: [{ src: '/portfolio-media/ar-pipeline-overview.jpg', caption: 'AR 지하 배관 클라이언트 현장 증강 화면. 굴착 구간의 배관과 함께 심도, 재질, 관경 정보를 표시했습니다.' }],
    deepDive: [
      {
        heading: '전체 GIS 데이터를 태블릿에 올릴 수 없다면',
        body: '지하 배관 데이터는 도시 단위로 존재하지만, 현장에서는 사용자 주변 100m의 데이터만 필요했습니다. 이를 위해 CSV로 받은 위경도와 고도 데이터를 에디터 단계에서 100m 청크 prefab으로 미리 분할했습니다. 런타임에는 사용자의 최초 GPS 위치를 원점으로 삼아 주변 청크만 Addressables로 로드했습니다. 사용자가 이동해 필요한 청크가 바뀌면 새 청크를 로드하고 멀어진 청크는 해제했습니다.',
        diagram: {
          spec: {
            kind: 'flow',
            steps: [
              { label: 'GIS CSV', sub: '위경도 · 고도 · 관경' },
              { label: '에디터 스크립트', sub: '100m 단위 청크 분할' },
              { label: '청크 prefab', sub: 'Addressables 등록' },
              { label: '최초 GPS 원점', sub: '월드 좌표 기준점 확정' },
              { label: '주변 청크 로드', sub: '거리에 따라 로드하고 해제' },
            ],
          },
          caption: 'CSV 원본에서 런타임 청크 로딩까지 이어지는 데이터 파이프라인.',
        },
        code: {
          label: '거리 기반 청크 로드·해제',
          lang: 'C#',
          pseudo: true,
          source: `// 회사 프로젝트이므로 실제 구현 대신 구조만 표기합니다.

on_gps_first_fix(origin_latlon):
    world_origin = origin_latlon              // 이후 모든 좌표의 기준점

update(user_latlon):
    cell = to_chunk_index(user_latlon)        // 100m 격자 인덱스
    needed = neighbors_within(cell, radius)

    for key in needed - loaded:
        Addressables.LoadAsync(key) -> place_at(enu_offset(key, world_origin))

    for key in loaded - needed:
        Addressables.Release(key)             // 멀어진 청크는 즉시 해제`,
        },
      },
      {
        heading: '두 가지 Occlusion 방식 구현 및 비교',
        body: '지하 배관은 지면 아래에 보여야 하지만, 기본 설정만으로는 지면 위에 떠 있는 것처럼 보였습니다. ARCore 환경 깊이를 이용한 Occlusion과 Unity AI Inference Depth estimation을 이용한 Occlusion을 각각 구현해 현장에서 비교했습니다. AI 방식은 깊이 센서가 없는 기기에서도 동작한다는 장점이 있었지만, 태블릿 환경에서는 추론 비용이 컸습니다. 두 방식 모두 현장에서 동작을 확인했으나, 이후 요구사항이 바뀌면서 최종 제품에는 Occlusion 기능이 포함되지 않았습니다.',
        diagram: {
          spec: {
            kind: 'split',
            before: { title: 'Unity AI Inference Depth estimation', items: ['깊이 센서 없는 기기에서도 동작', '장면 전체에 대한 조밀한 깊이 추정', '태블릿 환경에서 추론 비용이 큼'] },
            after: { title: 'ARCore 환경 깊이', items: ['플랫폼이 제공하는 깊이를 직접 사용', '추가 추론 비용 없음', '현장 조도·표면 조건에서 더 안정적'] },
          },
          caption: '두 가지 Occlusion 구현의 비교.',
        },
        media: { kind: 'youtube', src: 'https://youtu.be/9B6yT9GSESI', caption: 'ARCore 환경 깊이 Occlusion과 Unity AI Inference Depth estimation Occlusion 비교 영상.' },
      },
      {
        heading: '거리에 따른 배관 표현 조정',
        body: '깊이 정보만 적용했을 때 배관 경계가 부자연스럽게 잘려 현장에서 위치를 확인하기 어려웠습니다. 카메라와 배관 사이의 거리에 따라 픽셀을 디더링으로 솎아내는 셰이더를 적용했습니다. 가까운 구간은 뚜렷하게 보이고 먼 구간은 점차 사라지도록 처리해, 굴착 지점 주변에 시선이 모이는 효과도 함께 얻었습니다.',
        media: { kind: 'youtube', src: 'https://youtu.be/k0-UH9v7Agw', caption: '거리 기반 디더링 셰이더를 적용한 배관 페이드 처리 영상.' },
        code: {
          label: '거리 기반 디더링 프래그먼트',
          lang: 'HLSL',
          pseudo: true,
          source: `// 회사 프로젝트이므로 실제 구현 대신 구조만 표기합니다.

fragment(input):
    dist  = distance(camera_position, input.world_position)
    alpha = 1 - saturate((dist - fade_start) / (fade_end - fade_start))

    // 4x4 Bayer 행렬로 화면 좌표마다 임계값을 다르게 준다
    threshold = bayer4x4[input.screen_position.xy % 4]
    if alpha < threshold:
        discard                               // 멀수록 더 많은 픽셀이 탈락

    return pipe_color`,
        },
      },
    ],
  },
  {
    slug: 'traffic-integrated-control',
    group: 'company',
    number: '03',
    category: 'DIGITAL TWIN · CLIENT',
    period: '2024.06 — 2025.04',
    title: 'TOPES 통합 교통 관제 시스템',
    shortTitle: 'TOPES 교통 관제',
    summary: '스마트교차로 편집부터 VDS 차량 시각화와 교통 분석까지 처리하는 Windows 디지털 트윈 클라이언트를 개발했습니다.',
    impact: 'GIS와 VDS 데이터를 2D/3D 관제 화면에 연동',
    role: 'Client Developer · Smart Intersection Owner',
    team: 'STANS · 3-PERSON TEAM',
    stack: ['Unity 2022.3', 'C#', 'TypeScript', 'SvelteKit', 'Tauri', 'Babylon.js', 'OpenLayers'],
    context: '외부에서 개발된 Unity 교통 관제 프로젝트를 인수한 뒤, 기획 문서를 바탕으로 스마트교차로 기능을 처음부터 설계하고 직접 구현했습니다. 이후 SvelteKit·Tauri·Babylon.js 기반 클라이언트로 전환하면서 3D 교통 객체, 교통 분석, 차량 재생과 시뮬레이션 연동을 담당했습니다.',
    challenge: '지도 픽셀과 GIS, CCTV, 엔진 월드 좌표를 하나의 교차로 모델로 연결해야 했습니다. 또한 VDS 검지가 끊긴 차량도 차선 흐름에 맞게 계속 표현해야 했습니다.',
    approach: [
      '기획 문서를 바탕으로 Unity 스마트교차로 편집 시스템을 처음부터 직접 구현했습니다. 교차로 영역과 도로, 차선, CCTV, 신호등을 배치하고 저장하는 기능을 담았습니다.',
      'GIS 좌표와 Unity 좌표를 변환하고 VDS 패킷을 차량 표시와 이동에 연결했습니다. 검지가 끊긴 차량은 미리 작성한 차선 추적 경로를 따라 이동하도록 구성했습니다.',
      'SvelteKit과 Babylon.js로 전환한 이후에는 2D 편집과 3D 차량 및 신호등 표시, 교통 분석, 차량 재생, 시뮬레이션 요청과 결과 처리를 담당했습니다.',
    ],
    results: ['기획 문서에서 출발해 스마트교차로의 생성과 편집, 저장 흐름을 직접 구현했습니다.', 'VDS 차량 데이터를 지도와 3D 관제 화면에 표시하고, 검지가 끊긴 차량의 차선 추적을 구현했습니다.', '클라이언트 기술 전환 이후 교통 분석과 차량 재생, 시뮬레이션 연동 기능을 구현했습니다.'],
    images: [
      { src: '/portfolio-media/image1.png', caption: 'TOPES 통합 교통 관제 시스템 지도 화면.' },
      { src: '/portfolio-media/image2.png', caption: 'TOPES 통합 교통 관제 시스템 스마트교차로 3D 씬 화면.' },
    ],
    deepDive: [
      {
        heading: '네 개의 좌표계를 하나의 교차로 모델로 연결',
        body: '이 시스템에서 하나의 교차로는 네 가지 좌표계로 동시에 존재했습니다. 편집 화면은 지도 픽셀, 실제 데이터는 위경도, 3D 관제 화면은 엔진 월드 좌표, CCTV 영상은 화면 좌표를 사용합니다. 편집자가 지도에서 찍은 차선이 3D 화면의 차량 경로와 같은 위치를 가리키려면 변환이 일관되어야 했습니다. 그래서 위경도를 단일 기준으로 삼고, 나머지 좌표계는 모두 그 위에서 변환하도록 정리했습니다.',
        diagram: {
          spec: {
            kind: 'layers',
            layers: [
              { label: '지도 픽셀 좌표', sub: '2D 편집 화면에서 사용자가 찍는 위치' },
              { label: 'GIS 위경도', sub: '모든 변환의 단일 기준 좌표계' },
              { label: '엔진 월드 좌표', sub: 'Unity / Babylon.js 3D 관제 씬' },
              { label: 'CCTV 화면 좌표', sub: '영상 위 검지 영역 매핑' },
            ],
          },
          caption: '스마트교차로 데이터가 거치는 좌표계 변환 계층.',
        },
      },
      {
        heading: '검지가 끊긴 차량의 이동 유지',
        body: 'VDS는 검지 지점을 지나는 차량만 알려주기 때문에, 지점 사이 구간에서는 차량 정보가 들어오지 않았습니다. 화면에서 차량이 사라졌다 다시 나타나면 관제 화면으로 사용하기 어렵다고 판단했습니다. 편집 단계에서 작성해 둔 차선 추적 경로를 이용해, 검지가 끊긴 차량도 마지막으로 확인된 속도로 경로를 따라 계속 이동시켰습니다. 다음 검지 시점에는 실제 데이터로 위치를 보정했습니다.',
        diagram: {
          spec: {
            kind: 'flow',
            steps: [
              { label: 'VDS 패킷 수신', sub: '검지 지점과 속도, 차종' },
              { label: '차량 인스턴스 매칭', sub: '기존 차량인지 신규 진입인지 판별' },
              { label: '차선 경로 배정', sub: '편집 단계에서 작성한 경로 사용' },
              { label: '경로 추종 이동', sub: '검지 공백 구간 보간' },
              { label: '다음 검지 보정', sub: '실제 데이터로 위치 정정' },
            ],
          },
          caption: '검지가 끊긴 구간에서도 차량 표시를 유지하는 처리 과정.',
        },
        code: {
          label: '검지 공백 구간의 차량 이동',
          lang: 'C#',
          pseudo: true,
          source: `// 회사 프로젝트이므로 실제 구현 대신 구조만 표기합니다.

on_vds_packet(packet):
    vehicle = vehicles.find_or_create(packet.id)
    vehicle.path = lane_paths[packet.lane_id]     // 편집 단계에서 작성한 경로
    vehicle.snap_to(packet.detector_position)     // 실제 검지 위치로 보정
    vehicle.speed = packet.speed
    vehicle.last_seen = now

tick(dt):
    for vehicle in vehicles:
        # 검지가 끊겨도 마지막 속도로 차선 경로를 계속 따라간다
        vehicle.distance += vehicle.speed * dt
        vehicle.position = vehicle.path.sample(vehicle.distance)

        if now - vehicle.last_seen > exit_timeout:
            vehicles.remove(vehicle)              // 구간 이탈로 간주`,
        },
      },
      {
        heading: '기술 스택 전환 과정에서의 기능 유지',
        body: '프로젝트 도중 클라이언트 기술 스택이 Unity에서 SvelteKit과 Tauri, Babylon.js로 전환되었습니다. 이미 구현해 둔 스마트교차로 편집 로직을 다시 만들지 않기 위해, 좌표 변환과 교차로 데이터 모델을 그대로 옮기고 렌더링과 UI 계층만 교체했습니다. 전환 이후에는 새 스택 위에서 3D 교통 객체와 교통 분석, 차량 재생, 시뮬레이션 연동을 담당했습니다.',
        diagram: {
          spec: {
            kind: 'split',
            before: { title: 'Unity 2022.3 클라이언트', items: ['외부에서 개발된 프로젝트를 인수', '기획 문서를 바탕으로 스마트교차로 편집을 직접 구현', 'GIS와 Unity 좌표 변환, VDS 차량 표시', 'Windows 실행 파일로 배포'] },
            after: { title: 'SvelteKit · Tauri · Babylon.js', items: ['2D 편집을 OpenLayers 지도 위에서 수행', '3D 차량과 신호등을 Babylon.js로 재구성', '교통 분석과 차량 재생 기능 추가', '시뮬레이션 요청과 결과 처리 연동'] },
          },
          caption: '기술 전환 전후의 담당 범위 변화.',
        },
      },
    ],
  },
  {
    slug: 'ar-fire-training',
    group: 'company',
    number: '04',
    category: 'MOBILE AR · SIMULATION',
    period: '2024.11 — 2025.05',
    title: '표준작전절차 기반 AR 화재진압 훈련',
    shortTitle: 'AR 화재진압 훈련',
    summary: 'Unreal Engine 5로 Android AR 화재 진압 훈련 앱을 개발했습니다. JSON 시나리오 데이터와 단계 기반 진행 로직으로 화재 진압 상호작용과 퀴즈, 성공 및 실패 분기를 구현했습니다.',
    impact: 'JSON 시나리오 구조 · Galaxy Tab S8 검증',
    role: 'Android Client Developer',
    team: 'STANS · 3 DEV + PM + 3D ARTIST',
    stack: ['Unreal Engine 5.4', 'C++', 'Android', 'AR', 'JSON'],
    context: '소방청 화재 진압 교육을 모바일 AR에서 제공하기 위한 Android 클라이언트를 Unreal Engine 5와 C++로 개발했습니다. JSON 시나리오 데이터를 읽어 런타임에 훈련 액터를 생성하고 직접 설계한 단계 기반 진행 로직으로 연결했습니다.',
    challenge: '훈련 절차에 맞춰 애니메이션과 이벤트, 퀴즈 선택지를 순서대로 진행해야 했습니다. 또한 화재 진압 상호작용과 교육 자료를 모바일 UI에서 제공해야 했습니다.',
    approach: ['scenario.json을 UObject 그래프로 변환해 런타임에 시나리오 액터를 생성했습니다. 단계 번호와 완료 상태를 관리하는 진행 흐름은 직접 설계해 구현했습니다.', '곡선형 충돌체를 발사해 일정 시간 이상 화재 대상과 접촉하면 불이 꺼지는 상호작용을 개발했습니다.', 'C++와 Widget Blueprint로 설정과 시나리오, 퀴즈, 성공 및 실패 UI를 제작하고 이미지 기반 PDF 뷰어를 구현했습니다.'],
    results: ['Galaxy Tab S8 실기기에서 구동을 확인하고 프로젝트를 납품했습니다.', 'JSON 시나리오와 단계별 진행 흐름, 성공 및 실패 분기 구조를 구현했습니다.'],
    images: [
      { src: '/portfolio-media/image3.png', caption: 'AR 화재진압 훈련 시뮬레이터 실행 화면.' },
      { src: '/portfolio-media/image4.png', caption: 'AR 화재진압 훈련 화재 상호작용 화면.' },
    ],
    deepDive: [
      {
        heading: '훈련 시나리오를 코드가 아닌 데이터로 분리',
        body: '소방 표준작전절차는 훈련 과목마다 단계와 순서가 다릅니다. 이를 코드에 직접 넣으면 과목이 추가될 때마다 클라이언트를 다시 빌드해야 합니다. 훈련 절차 전체를 scenario.json으로 기술하고, 실행 시 이 데이터를 UObject 그래프로 변환한 뒤 필요한 액터를 런타임에 생성했습니다. 새 훈련 과목은 JSON 파일을 추가하는 것으로 대응할 수 있고, 코드는 수정하지 않아도 됩니다.',
        diagram: {
          spec: {
            kind: 'flow',
            steps: [
              { label: 'scenario.json', sub: '단계와 이벤트, 퀴즈 정의' },
              { label: '파싱', sub: 'UObject 그래프로 변환' },
              { label: '액터 스폰', sub: '화재 대상과 장비 배치' },
              { label: '단계 진행', sub: '단계 번호와 완료 상태 관리' },
              { label: '성공 및 실패 분기', sub: '결과 UI 표시' },
            ],
          },
          caption: 'JSON 시나리오가 런타임 훈련 흐름으로 전개되는 과정.',
        },
        code: {
          label: '시나리오 데이터 구조',
          lang: 'JSON',
          pseudo: true,
          source: `// 회사 프로젝트이므로 실제 데이터 대신 구조만 표기합니다.
{
  "scenario_id": "fire_suppression_basic",
  "steps": [
    {
      "index": 1,
      "type": "interaction",
      "guide": "소화기를 집어 안전핀을 제거하십시오",
      "spawn": [ { "actor": "Extinguisher", "anchor": "table_01" } ],
      "complete_when": { "event": "PinRemoved" }
    },
    {
      "index": 2,
      "type": "suppression",
      "target": "Fire_Kitchen",
      "complete_when": { "event": "FireExtinguished", "hold_seconds": 3.0 },
      "fail_when":     { "event": "Timeout", "seconds": 60 }
    },
    {
      "index": 3,
      "type": "quiz",
      "question": "초기 진화에 실패했을 때 우선 조치는?",
      "choices": [ "재진입", "대피 유도 후 신고", "창문 개방" ],
      "answer": 1
    }
  ]
}`,
        },
      },
      {
        heading: '절차를 건너뛸 수 없게 만든 진행 로직',
        body: '훈련 프로그램인 만큼 절차를 건너뛸 수 없어야 했습니다. 그래서 현재 단계 번호와 완료 조건을 관리하는 진행 로직을 직접 설계했고, 각 단계는 완료 이벤트를 받기 전까지 다음 단계로 넘어가지 않게 했습니다. 제한 시간 초과나 오답처럼 실패 조건이 먼저 성립하면 즉시 실패 분기로 이동합니다. 훈련생이 어느 절차에서 어긋났는지 바로 확인할 수 있습니다.',
        diagram: {
          spec: {
            kind: 'sequence',
            lanes: ['훈련생 (AR 화면)', '진행 로직 (C++)'],
            messages: [
              { from: 1, label: '단계 시작, 안내 문구 표시와 액터 스폰', note: 'scenario.json의 해당 step 적용' },
              { from: 0, label: '상호작용 수행, 소화기 분사', note: '곡선 충돌체가 화재 대상과 접촉' },
              { from: 1, label: '완료 조건 검사, 접촉 유지 시간 누적', note: '조건을 충족하지 못하면 단계 유지' },
              { from: 1, label: '단계 완료 후 다음 단계 전개', note: '실패 조건이 성립하면 실패 분기로 이동' },
            ],
          },
          caption: '단계 기반 진행 로직의 완료·실패 판정 흐름.',
        },
      },
      {
        heading: '소화기 분사 상호작용 구현',
        body: '소화기 분사를 직선 레이캐스트로 처리하면 실제 사용 감각과 맞지 않았습니다. 중력의 영향을 받는 곡선 충돌체를 발사하고, 이 충돌체가 화재 대상과 일정 시간 이상 접촉해야 불이 꺼지도록 구현했습니다. 스치듯 조준해서는 진화되지 않으므로, 훈련생은 대상을 계속 겨누는 조작을 하게 됩니다.',
        diagram: {
          spec: {
            kind: 'flow',
            steps: [
              { label: '분사 입력', sub: '화면 터치 유지' },
              { label: '곡선 충돌체 발사', sub: '중력 반영 궤적' },
              { label: '접촉 판정', sub: '화재 대상과의 충돌' },
              { label: '누적 시간', sub: '연속 접촉 시간 가산' },
              { label: '진화 완료', sub: '임계 시간 도달' },
            ],
          },
          caption: '화재 진압 상호작용의 진화 판정 구조.',
        },
      },
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
    summary: 'HoloLens 2에서 MR 공정 교육 콘텐츠를 제작하고 실행하는 Unity 클라이언트를 개발했습니다.',
    impact: 'UGUI 전환 · Grab 시스템 · 모델 로딩 분 단위에서 초 단위로 단축',
    role: 'HoloLens 2 Client Developer',
    team: 'STANS · CLIENT DEVELOPMENT',
    stack: ['Unity', 'C#', 'HoloLens 2', 'UGUI', 'Job System', 'Shader'],
    context: 'HoloLens 2에서 MR 공정 교육 시나리오를 제작하고 실행하는 Unity 클라이언트를 개발했습니다. UI, 가상 물체 조작, 대형 모델 로딩과 디바이스용 셰이더를 담당했습니다.',
    challenge: 'HoloLens 2의 입력과 시야, 성능 제약 안에서 UI와 3D 상호작용을 안정적으로 제공해야 했습니다. 또한 대형 모델을 로딩하는 흐름도 개선해야 했습니다.',
    approach: [
      'Color Picker와 User Menu를 제작했습니다. 또한 HoloLens 2의 입력 제약 안에서 안정적으로 동작하도록 프로젝트 전체 UI를 Physics-based 방식에서 UGUI로 전환했습니다.',
      '가상공간 물체를 잡고 조작하는 Grab 시스템과 HoloLens 2용 Outline Shader를 구현했습니다.',
      'Unity Job System을 적용해 대형 모델 로딩 병목을 개선했습니다. 분 단위였던 로딩 시간이 초 단위로 줄었습니다.',
    ],
    results: ['프로젝트 전체 UI를 UGUI로 전환하고 MR 교육 콘텐츠의 조작 흐름을 구현했습니다.', 'Grab 시스템과 Outline Shader를 구현했고, Job System을 적용해 대형 모델 로딩 시간을 분 단위에서 초 단위로 줄였습니다.'],
    images: [{ src: '/portfolio-media/image5.png', caption: 'AWAS-XR HoloLens 2 공정 교육 화면.' }],
  },
  {
    slug: 'land400-hums',
    group: 'company',
    number: '06',
    category: 'EMBEDDED · RELIABILITY',
    period: '2023.06 — 2023.12',
    title: 'LAND400 Phase3 AS9 & AS10 HUMS',
    shortTitle: 'LAND400 HUMS',
    summary: 'Health and Usage Monitoring System의 Linux SBC 소프트웨어를 재설계했습니다. 데이터 처리 구조와 UDP 패킷 복구 기능을 구현했습니다.',
    impact: '20ms 간격 데이터 처리 · 수락시험 통과',
    role: 'HUMS SBC Software Engineer',
    team: 'DANAM SYSTEMS · EMBEDDED DEVELOPMENT',
    stack: ['C', 'Linux', 'SBC', 'Message Queue', 'UDP', 'Helix QAC', 'SureSoft Cover'],
    context: 'LAND400 상태감시시스템의 HUMS SBC 소프트웨어를 C와 Linux 환경에서 설계하고 구현했습니다. 1만 줄 이상의 단일 파일로 되어 있던 기존 코드를 수신과 정제, 저장 파이프라인으로 재구성했습니다.',
    challenge: '납품 일정과 20ms 간격 데이터 처리 요구를 만족해야 했습니다. 동시에 기존 구조의 유지보수 문제와 UDP 통신 중 발생하는 패킷 누락도 해결해야 했습니다.',
    approach: [
      '데이터 수신과 정제, 저장 기능을 각각 독립 프로세스로 분리하고 Message Queue로 연결했습니다.',
      '타임스탬프와 패킷 번호를 기준으로 UDP 누락을 감지하고, 데이터 수집 장치에 재요청하는 구조를 구현했습니다.',
      'Helix QAC와 SureSoft Cover를 이용한 정적 검사와 동적 검사를 수행하고 수락시험에 대응했습니다.',
    ],
    results: ['1만 줄 이상의 단일 파일 코드를 멀티프로세스와 Message Queue 구조로 재구성했습니다.', '20ms 간격 데이터 처리 기반과 UDP 패킷 누락 감지 및 재요청 구조를 구현했습니다.', '정적 검사와 동적 검사를 거쳐 전 장비 수락시험을 통과했고, 납품 일정을 지켰습니다.'],
    deepDive: [
      {
        heading: '단일 파일 구조를 세 개의 프로세스로 분리',
        body: '인수받은 HUMS 소프트웨어는 수신과 정제, 저장이 1만 줄 이상의 단일 파일 안에 함께 들어 있었습니다. 한 곳을 수정하면 다른 기능이 영향을 받아, 수락시험을 앞두고 손대기 어려운 상태였습니다. 이를 위해 세 가지 기능을 각각 독립 프로세스로 분리하고 Message Queue로만 연결해, 프로세스 사이의 접점을 메시지 형식 하나로 정리했습니다. 그 결과 저장 단계에서 지연이 발생해도 수신 프로세스는 영향을 받지 않게 되었습니다.',
        diagram: {
          spec: {
            kind: 'split',
            before: { title: '인수 시점 구조', items: ['1만 줄 이상의 단일 파일에 전 기능 집중', '수신과 정제, 저장이 전역 상태로 결합', '한 기능을 수정하면 다른 기능에 영향', '장애 지점을 격리하기 어려움'] },
            after: { title: '재설계 후 구조', items: ['수신과 정제, 저장을 독립 프로세스로 분리', 'Message Queue를 유일한 접점으로 고정', '저장 지연이 수신 주기에 영향을 주지 않음', '프로세스 단위로 검증하고 재기동 가능'] },
          },
          caption: '단일 파일 구조에서 멀티프로세스 파이프라인으로의 재설계.',
        },
      },
      {
        heading: '20ms 주기를 유지하기 위한 파이프라인 구성',
        body: '상태감시 데이터는 20ms 간격으로 들어오기 때문에, 이 주기를 놓치면 그대로 데이터 결손이 됩니다. 수신 프로세스는 데이터를 읽어 큐에 넣는 일만 하도록 최소화하고, 시간이 걸리는 정제와 디스크 저장은 뒤쪽 프로세스에서 처리하도록 했습니다. 각 단계 사이의 큐가 완충 역할을 해, 일시적인 저장 지연은 수신 주기에 영향을 주지 않습니다.',
        diagram: {
          spec: {
            kind: 'flow',
            steps: [
              { label: '수신 프로세스', sub: 'UDP 읽기만 전담, 20ms 주기' },
              { label: 'Message Queue', sub: '원시 패킷 버퍼' },
              { label: '정제 프로세스', sub: '검증과 단위 변환, 결손 표시' },
              { label: 'Message Queue', sub: '정제 데이터 버퍼' },
              { label: '저장 프로세스', sub: '파일 기록과 회전 관리' },
            ],
          },
          caption: '수신에서 저장까지 이어지는 데이터 파이프라인.',
        },
      },
      {
        heading: '누락된 패킷 감지와 재요청',
        body: 'UDP는 전달을 보장하지 않기 때문에 데이터 수집 장치가 보낸 패킷이 유실될 수 있습니다. 상태감시 기록에서 데이터 결손은 그 자체로 결함이 되므로 그대로 둘 수 없었습니다. 그래서 타임스탬프와 패킷 번호의 연속성을 검사해 빠진 구간을 찾아내고, 해당 구간만 수집 장치에 다시 요청하는 구조를 구현했습니다. 재요청으로 받은 데이터는 원래 순서에 맞춰 삽입해 기록의 시간 순서를 유지했습니다.',
        diagram: {
          spec: {
            kind: 'sequence',
            lanes: ['HUMS SBC (수신)', '데이터 수집 장치'],
            messages: [
              { from: 1, label: '패킷 #100과 #101, #103 수신', note: '#102가 전달 과정에서 유실' },
              { from: 0, label: '연속성 검사로 결손 구간 #102 검출', note: '타임스탬프와 패킷 번호를 기준으로 판별' },
              { from: 0, label: '#102 재요청', note: '누락된 구간만 선택해 요청' },
              { from: 1, label: '#102 재전송', note: '수신한 뒤 원래 순서에 삽입' },
            ],
          },
          caption: 'UDP 패킷 누락 감지와 재요청 흐름.',
        },
        code: {
          label: '누락 감지와 재요청',
          lang: 'C',
          pseudo: true,
          source: `/* 방산 프로젝트이므로 실제 구현 대신 구조만 표기합니다. */

on_packet(pkt):
    if pkt.seq == expected_seq:
        enqueue(pkt)
        expected_seq += 1
        drain_pending()                  /* 앞서 보관해 둔 후속 패킷 방출 */
    else if pkt.seq > expected_seq:
        pending[pkt.seq] = pkt           /* 순서가 앞선 패킷은 보관 */
        request_resend(expected_seq, pkt.seq - 1)
    else:
        /* 재전송분 도착, 중복이면 폐기 */
        if not already_stored(pkt.seq):
            insert_in_order(pkt)

periodic_check():
    if now - last_progress > gap_timeout:
        request_resend(expected_seq, expected_seq)   /* 응답 없으면 재시도 */`,
        },
      },
    ],
  },
  {
    slug: 'pearl-abyss-red-desert',
    group: 'company',
    number: '07',
    category: 'GAME · UI/UX',
    period: '2023.03 — 2023.05',
    title: '붉은사막',
    shortTitle: '붉은사막 UI',
    summary: '펄어비스 블랙스페이스 엔진에서 HTML/CSS와 C++ 컨트롤러를 이용해 PC 게임 UI와 디버깅 도구를 개발했습니다.',
    impact: '원형 퀵슬롯 UI · 월드맵 디버깅 UI',
    role: 'UI Developer · Intern',
    team: 'PEARL ABYSS · NEW PROJECT',
    stack: ['C++', 'HTML', 'CSS', '블랙스페이스 엔진'],
    context: '펄어비스 블랙스페이스 엔진으로 개발하는 PC 게임 붉은사막에 UI 개발 인턴으로 참여했습니다. 자체 엔진의 UI 구조를 파악한 뒤 HTML/CSS와 C++ 컨트롤러를 연결해 키보드와 마우스 기반 기능을 구현했습니다.',
    challenge: '인턴 기간 안에 자체 엔진의 UI 처리 흐름을 파악해야 했습니다. 그리고 플레이어용 UI와 콘텐츠 제작자를 위한 디버깅 UI를 기존 엔진 구조에 맞춰 구현해야 했습니다.',
    approach: [
      'HTML/CSS로 원형 퀵슬롯 UI를 구성하고, C++ 컨트롤러로 키보드와 마우스 입력을 캐릭터 및 장비 변경에 연결했습니다.',
      '전체 월드맵의 오브젝트를 핀으로 표시해 지역별 분포와 밀집 상태를 확인하는 디버깅 UI를 구현했습니다.',
      '기존 자체 엔진의 처리 흐름을 파악한 뒤 개발 PD의 피드백을 반영해 기능을 정리했습니다.',
    ],
    results: ['키보드와 마우스로 조작하는 원형 퀵슬롯을 구현하고 캐릭터 및 장비 변경 처리를 연결했습니다.', '월드맵 오브젝트의 밀집 상태를 확인할 수 있는 디버깅 UI를 구현했습니다.', '개발 PD로부터 디버깅에 도움이 되었다는 피드백을 받았습니다.'],
    images: [
      { src: '/portfolio-media/image6.png', caption: '붉은사막 퀵슬롯 UI 화면.' },
      { src: '/portfolio-media/image7.png', caption: '붉은사막 적 체력 UI 화면.' },
    ],
  },
  {
    slug: 'project-lup',
    group: 'personal',
    number: '08',
    category: 'UNITY · AI · SOLO PROJECT',
    period: '2022.12.12 — 2023.02.17',
    title: 'Project LUP',
    shortTitle: 'PROJECT LUP',
    summary: 'Behavior Tree로 자동 전투 AI를 구현하고 스킬과 타겟을 동적으로 결정하도록 만든 1인 방치형 RPG 프로젝트입니다.',
    impact: '자동 전투 AI · Behavior Tree Debugger · Shader UI',
    role: 'Solo Developer',
    team: '1-PERSON PROJECT',
    stack: ['Unity', 'C#', 'Behavior Tree', 'Shader Graph', 'IMGUI'],
    context: '자동 전투를 중심으로 캐릭터가 전투 상황에 따라 스킬과 타겟을 선택하는 Unity 기반 방치형 RPG를 기획부터 구현까지 혼자 개발했습니다.',
    challenge: '스킬 범위와 회복 필요성 같은 조건에 따라 행동을 선택해야 했습니다. 또한 MonoBehaviour가 아닌 Behavior Tree 노드의 상태를 런타임에 확인할 방법이 필요했습니다.',
    approach: [
      'OnStart와 OnUpdate, OnStop 흐름을 가진 Behavior Tree 노드 구조를 만들었습니다. 그리고 트리를 재귀 순회해 노드별 반환 상태를 화면에 출력하는 Behavior Tree Debugger를 구현했습니다.',
      'SkillSlot과 SkillSet, SkillActionNode를 조합해 전투 상황에 따라 스킬과 공격 및 회복 타겟을 동적으로 결정하도록 구성했습니다.',
      '캐릭터 수가 늘어날 때 발생하는 UGUI Draw Call 증가를 줄이기 위해 Shader로 Health Bar를 구현했고, 전투 카메라의 추적과 흔들림도 함께 제작했습니다.',
    ],
    results: ['전투 상황에 따라 스킬과 타겟을 자동으로 결정하는 흐름을 구현했습니다.', '직접 만든 디버거로 Behavior Tree 노드의 반환 상태를 실행 중에 확인할 수 있었습니다.', 'Shader Health Bar와 전투 카메라 시스템을 구현해 전투 화면의 가독성과 연출을 구성했습니다.'],
    youtube: 'https://youtu.be/9gVlJFajaxc',
    images: [
      { src: '/portfolio-media/image8.jpeg', caption: 'Project LUP 전투 대기 화면.' },
      { src: '/portfolio-media/image23.png', caption: 'Project LUP 전투 중 스킬 연출 화면.' },
    ],
    deepDive: [
      {
        heading: 'Behavior Tree 노드 구조 설계',
        body: '방치형 RPG의 자동 전투는 조건이 늘어날수록 상태 기계로 관리하기 어려워집니다. 모든 노드가 OnStart와 OnUpdate, OnStop이라는 같은 생명주기를 갖고 Running과 Success, Failure 중 하나를 반환하도록 규칙을 통일했습니다. Selector와 Sequence 같은 합성 노드는 이 규칙만 알면 어떤 자식 노드든 조합할 수 있게 만들었습니다. 그 결과 새 행동을 추가할 때는 트리 구조만 변경하면 되었습니다.',
        diagram: {
          spec: {
            kind: 'tree',
            root: {
              label: 'BattleBT',
              tag: 'Selector',
              children: [
                {
                  label: 'Sequence_DoAction',
                  tag: 'Sequence',
                  children: [
                    { label: 'Cond_CanAction / Cond_IsMyTurn', tag: 'Condition' },
                    {
                      label: 'Selector_Action',
                      tag: 'Selector',
                      children: [
                        {
                          label: 'Sequence_Skill',
                          tag: 'Sequence',
                          children: [
                            { label: 'Cond_ShouldAttack', tag: 'Condition' },
                            {
                              label: 'Selector_DetermineSkill',
                              tag: 'Selector',
                              children: [
                                { label: 'Cond_IsSkillSelected', tag: 'Condition' },
                                { label: 'Sequence_EmergencyHeal', tag: 'Sequence' },
                                { label: 'Action_FindEfficientSkill', tag: 'Action' },
                              ],
                            },
                            {
                              label: 'Selector_DoAttack',
                              tag: 'Selector',
                              children: [
                                { label: 'Cond_IsNotTargetExist', tag: 'Condition' },
                                { label: 'Sequence_StartBattle', tag: 'Sequence' },
                                { label: 'Sequence_MoveToTarget', tag: 'Sequence' },
                                { label: 'SkillSetNode', tag: 'Action' },
                              ],
                            },
                          ],
                        },
                        { label: 'Sequence_ResetPosition', tag: 'Sequence' },
                      ],
                    },
                  ],
                },
                { label: 'Action_Idle', tag: 'Action' },
              ],
            },
          },
          caption: 'BattleBT.cs의 실제 트리 구성. 자식은 스택에 쌓이므로 나중에 Push된 노드가 먼저 평가됩니다.',
        },
        code: {
          label: 'BehaviorNode.cs, 노드 생명주기',
          lang: 'C#',
          source: `public abstract class BehaviorNode : BaseBehavior
{
    public enum BehaviorResult { NotEntered, Success, Failure, Running }

    public BehaviorResult Result { get; protected set; } = BehaviorResult.NotEntered;
    public event Action OnResultChanged;          // Debugger가 구독한다

    bool isStarted;
    BehaviorResult prevResult = BehaviorResult.NotEntered;

    // 외부는 Update만 호출한다. OnStart/OnStop 시점은 이 클래스가 보장한다.
    public BehaviorResult Update()
    {
        if (Blackboard == null)
        {
            Debug.Debugger.LogError( $"Blackboard was not init in {GetType().Name}" );
            return BehaviorResult.Failure;
        }
        if (!isStarted)
        {
            OnStart();
            isStarted = true;
        }

        Result = OnUpdate();

        if (Result != BehaviorResult.Running)
        {
            OnStop();
            isStarted = false;
        }
        if (prevResult != Result)          // 상태가 바뀐 노드만 디버거에 알린다
        {
            OnResultChanged?.Invoke();
            prevResult = Result;
        }
        return Result;
    }

    protected virtual void OnStart() { }
    protected abstract BehaviorResult OnUpdate();
    protected virtual void OnStop() { }
}`,
        },
      },
      {
        heading: '스킬과 타겟을 결정하는 구조 분리',
        body: '전투 중 캐릭터는 어떤 스킬을 사용할지와 누구에게 사용할지를 함께 결정해야 했습니다. 이 두 가지를 하나의 노드에 넣지 않고, 보유 스킬을 담는 SkillSlot과 사용 조건을 판단하는 SkillSet, 실제 시전을 수행하는 SkillActionNode로 분리했습니다. 타겟 선택 규칙은 스킬 종류에 따라 다르게 적용했습니다. 회복 스킬은 아군 중 체력 비율이 가장 낮은 대상을, 공격 스킬은 사거리 안의 대상을 선택하도록 구현했습니다.',
        diagram: {
          spec: {
            kind: 'flow',
            steps: [
              { label: 'SkillSlot', sub: '보유 스킬과 쿨다운 상태' },
              { label: 'SkillSet', sub: '현재 사용 가능한 스킬 선별' },
              { label: '우선순위 결정', sub: '회복 필요 여부를 먼저 확인' },
              { label: '타겟 선택', sub: '스킬 종류별 선택 규칙' },
              { label: 'SkillActionNode', sub: '시전 후 Running 반환' },
            ],
          },
          caption: '스킬과 타겟이 런타임에 결정되는 흐름.',
        },
        code: {
          label: 'SkillActionNode.cs, 스킬 시전 노드',
          lang: 'C#',
          source: `public class SkillActionNode : ActionNode
{
    readonly ICharacterBlackboard board;
    readonly IBTContext_Target targetContext;   // 앞선 노드가 고른 타겟을 넘겨받는다
    readonly Skill skill;

    HashSet<GridVec> targetPositions;
    bool isFinishSkillAnimation;
    bool isTargetDestroyed;

    protected override void OnStart()
    {
        base.OnStart();
        if (targetContext.Target == null)       // 시전 직전에 타겟이 사라진 경우
        {
            isTargetDestroyed = true;
            return;
        }

        // 애니메이션 이벤트로 피격 타이밍을 받는다. 노드가 살아있는 동안만 구독한다.
        board.Actor.SkillAffectEvent    += OnActorSkillAffectEvent;
        board.Actor.FinishSkillAnimEvent += OnActorFinishSkillAnimEvent;
        board.Actor.SkillEffectEvent    += OnActorSkillEffectEvent;

        targetPositions = skill.GetSkillTargetPositions(
            targetContext.Target.GridPos, targetContext.Target.Factions );

        board.Actor.ChangeAnimationClipTo( UseSkillStr, skill.ActorAnimClip );
        board.Actor.PlayAttackAnimation();
    }

    protected override BehaviorResult OnUpdate()
    {
        if (isTargetDestroyed) return BehaviorResult.Failure;
        return isFinishSkillAnimation ? BehaviorResult.Success : BehaviorResult.Running;
    }

    protected override void OnStop()
    {
        isFinishSkillAnimation = false;
        board.Actor.SkillAffectEvent    -= OnActorSkillAffectEvent;
        board.Actor.FinishSkillAnimEvent -= OnActorFinishSkillAnimEvent;
        board.Actor.SkillEffectEvent    -= OnActorSkillEffectEvent;
        base.OnStop();
    }
}`,
        },
      },
      {
        heading: 'Behavior Tree 상태 확인용 디버거 제작',
        body: 'Behavior Tree 노드는 MonoBehaviour가 아니라 순수 C# 객체이기 때문에 인스펙터에 표시되지 않았습니다. 어떤 노드가 왜 실패했는지 확인할 방법이 없어 디버거를 직접 만들었습니다. 루트부터 재귀로 순회하면서 노드 깊이만큼 들여쓴 한 줄 문자열을 만들어 두고, 매 프레임 IMGUI로 그 목록을 출력했습니다. 반환 상태에 따라 성공은 파랑, 실패는 빨강, 진행 중은 노랑, 아직 진입하지 않은 노드는 회색으로 표시해 어느 가지에서 판단이 끊겼는지 화면에서 바로 확인할 수 있게 했습니다.',
        diagram: {
          spec: {
            kind: 'flow',
            steps: [
              { label: 'BehaviorNode.Result', sub: '노드별 반환값 보관' },
              { label: 'DebugTick', sub: '루트부터 재귀 순회' },
              { label: 'SortedList<uint, Information>', sub: '순회 순서와 깊이 기록' },
              { label: 'OnGUI', sub: '들여쓴 한 줄씩 색상으로 출력' },
            ],
          },
          caption: 'Behavior Tree Debugger의 노드 상태 표시 구조.',
        },
        code: {
          label: 'BehaviorTreeDebugger.cs, 트리 상태 수집',
          lang: 'C#',
          source: `// 루트부터 재귀로 내려가며 노드 이름 · 반환 상태 · 깊이를 순서대로 쌓는다.
public static uint DebugTick( BehaviorNode tree, uint count = 0, uint level = 0 )
{
    debugResults[count] = new Information( tree.GetType().Name, tree.Result, level );

    if (tree.GetStates() == null) return count;    // 리프 노드

    level++;
    foreach (BehaviorNode node in tree.GetStates())
    {
        count = DebugTick( node, count + 1, level );
    }
    return count;
}

public static void OnGUI()
{
    float y = 10;
    foreach (var trackBehavior in debugResults)
    {
        switch (trackBehavior.Value.result)
        {
            case BehaviorNode.BehaviorResult.Success:    GUI.color = Color.blue;   break;
            case BehaviorNode.BehaviorResult.Failure:    GUI.color = Color.red;    break;
            case BehaviorNode.BehaviorResult.Running:    GUI.color = Color.yellow; break;
            case BehaviorNode.BehaviorResult.NotEntered: GUI.color = Color.gray;   break;
        }
        GUI.Label( new Rect( 10, y, Screen.width, 20 ), trackBehavior.Value.printStr );
        y += 20;
    }
}`,
        },
      },
      {
        heading: '캐릭터 수 증가에 따른 Draw Call 문제 해결',
        body: '체력 바를 UGUI로 만들면 캐릭터마다 이미지가 여러 개 추가되어, 다수의 캐릭터가 등장하는 방치형 전투에서는 Draw Call이 늘어났습니다. 체력 바를 Shader Graph로 옮기고, 하나의 머티리얼이 체력 비율인 BarValue만 프로퍼티로 받아 그리도록 변경했습니다. UV의 x좌표와 BarValue를 Step으로 비교해 채운 색과 빈 색을 결정하고, 테두리는 Rectangle 노드로 만들어 합성했습니다. 또한 카메라와의 거리를 MaxFadDistance로 나눈 값을 알파에 반영해, 멀리 있는 캐릭터의 체력 바는 점차 사라집니다.',
        diagram: {
          spec: {
            kind: 'flow',
            steps: [
              { label: 'BarValue', sub: '0~1 체력 비율 프로퍼티' },
              { label: 'Step(UV.x, BarValue)', sub: '채운 구간과 빈 구간 판정' },
              { label: 'BarColor와 BackgroundColor', sub: 'BaseColor 결정' },
              { label: 'Rectangle(BoardWidth, BoardHeight)', sub: 'BoardColor 테두리 합성' },
              { label: 'Distance(Camera, Position)', sub: 'MaxFadDistance로 나눠 Alpha에 반영' },
            ],
          },
          caption: 'HealthBar.shadergraph의 노드 구성. 텍스트 소스가 아닌 그래프이므로 노드 흐름으로 옮겨 표기했습니다.',
        },
      },
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
    summary: '프로그래머 3명과 기획자 5명이 함께 만든 1:4 비대칭 PVP 게임입니다. 계정과 네트워크, 상호작용 시스템을 담당했습니다.',
    impact: '계정 및 네트워크 · Interaction · Casting',
    role: 'Client Programmer',
    team: '8-PERSON TEAM · 3 PROGRAMMERS / 5 DESIGNERS',
    stack: ['Unity', 'C#', 'Photon', 'Google Apps Script', 'Google Sheets'],
    context: '퇴마사와 악령이 들린 인형 진영이 서로 다른 목표를 수행하는 5인 멀티플레이 게임을 프로그래머 3명과 기획자 5명으로 제작했습니다.',
    challenge: 'DBMS를 사용할 수 없는 환경에서 계정과 접속 로그를 관리해야 했습니다. 또한 Photon 플레이어 데이터를 공유하고, 여러 곳에서 재사용할 수 있는 상호작용과 캐스팅 구조를 만들어야 했습니다.',
    approach: [
      'Google Sheets를 저장소로 사용하는 Apps Script 엔드포인트를 직접 작성했습니다. Unity 클라이언트에서는 UnityWebRequest로 JSON을 주고받아 계정 등록과 로그인, 로그아웃을 연동했습니다.',
      'Photon API의 데이터 공유 과정을 Facade 형태의 DataManager로 감싸, 플레이어 데이터를 수정하고 공유하는 흐름을 정리했습니다.',
      'IInteractable을 이용한 상호작용 탐색과 UI 표시를 구현했습니다. 또한 진행 속도를 담는 Cast와 시점별 동작을 담는 CastFuncSet을 조합하는 공통 캐스팅 시스템을 만들었습니다.',
    ],
    results: ['DBMS 없이 Google Sheets와 Apps Script로 계정 및 로그 관리 흐름을 엔드포인트부터 클라이언트까지 구현했습니다.', 'Photon 플레이어 데이터 공유와 상호작용, 캐스팅 공통 시스템을 구현했습니다.', '기획 문서를 요구사항과 프로토타입으로 검증하면서 프로그래머 3명, 기획자 5명과 협업했습니다.'],
    youtube: 'https://youtu.be/p3pPeP9O2TY',
    images: [
      { src: '/portfolio-media/image28.png', caption: 'Deus Ex Machina 인게임 장면.' },
      { src: '/portfolio-media/image34.png', caption: 'Deus Ex Machina 상호작용 장면.' },
      { src: '/portfolio-media/image38.png', caption: 'Deus Ex Machina 전투 장면.' },
    ],
    deepDive: [
      {
        heading: 'DBMS 없이 구현한 계정 시스템',
        body: '서버와 데이터베이스를 운영할 수 없는 환경이었지만, 멀티플레이 게임에는 계정과 접속 기록이 필요했습니다. Google Sheets를 저장소로 쓰고 Apps Script를 웹 엔드포인트로 배포해 서버 역할을 대신하게 했습니다. Unity 클라이언트는 UnityWebRequest로 JSON을 주고받으며 등록과 로그인, 로그아웃을 처리했습니다. 기획자들도 시트에서 계정과 로그를 바로 확인할 수 있어 협업에 도움이 되었습니다.',
        diagram: {
          spec: {
            kind: 'sequence',
            lanes: ['Unity 클라이언트', 'Apps Script + Google Sheets'],
            messages: [
              { from: 0, label: 'POST 요청, { action: "login", id, pw }', note: 'UnityWebRequest로 JSON 직렬화' },
              { from: 1, label: '시트 조회, 계정 행 탐색과 검증', note: 'Apps Script가 저장소 접근을 담당' },
              { from: 1, label: '응답, { ok, nickname, message }', note: '실패 사유를 코드로 구분해 회신' },
              { from: 0, label: '로그인 처리 후 Photon 룸 입장', note: '접속 로그를 시트에 별도 기록' },
            ],
          },
          caption: 'DBMS 없이 구성한 계정과 로그 처리 흐름.',
        },
        code: {
          label: 'ServerNetworkService.cs와 AccountService.cs, 계정 통신 계층',
          lang: 'C#',
          source: `// 서버(Apps Script)는 저장소 밖에 있으므로 클라이언트 쪽 계정 통신 계층입니다.
public abstract class ServerNetworkService : MonoBehaviour
{
    [Serializable]
    public class Response          // 모든 응답이 공유하는 형태
    {
        public string order;
        public string result;
        public string message;
    }

    protected const string URL = "https://script.google.com/macros/s/.../exec";

    protected virtual void DoPost( in string order, Func<WWWForm> InitForm, Action<string> HandleResponse )
    {
        WWWForm form = InitForm();
        StartCoroutine( Post( form, HandleResponse ) );
    }

    protected virtual IEnumerator Post( WWWForm form, Action<string> HandleResponse )
    {
        using (UnityWebRequest www = UnityWebRequest.Post( URL, form ))
        {
            yield return www.SendWebRequest();
            if (www.isDone) HandleResponse( www.downloadHandler.text );
            else            Debug.Log( "No response from server!" );
        }
    }
}

public class AccountService : ServerNetworkService
{
    [Serializable]
    public class AccountResponse : Response    // 계정 응답만 필드를 덧붙인다
    {
        public int index;
        public string id;
        public string nickname;
    }

    // 입력 검증 · 폼 구성 · 응답 처리를 호출부가 주입한다. 통신 계층은 order만 안다.
    public void Login( Func<bool> CheckField, Func<WWWForm> InitForm, Action<string> HandleResponse )
    {
        if (!CheckField()) return;
        DoPost( "login", InitForm, HandleResponse );
    }
}`,
        },
      },
      {
        heading: 'Photon 데이터 접근 경로 단일화',
        body: 'Photon의 커스텀 프로퍼티는 어디서든 읽고 쓸 수 있어 편리하지만, 여러 시스템이 각자 접근하면 어떤 코드가 어떤 값을 언제 바꾸는지 추적하기 어려웠습니다. 그래서 플레이어 데이터에 접근하는 경로를 DataManager 하나로 모으는 Facade를 두었습니다. 값을 바꾸는 지점과 변경 알림을 받는 지점을 분리한 결과, 진영 배정이나 상태 변경처럼 여러 시스템이 함께 참조하는 값을 다루기 쉬워졌습니다.',
        diagram: {
          spec: {
            kind: 'layers',
            layers: [
              { label: '게임 시스템', sub: '상호작용과 전투, UI, 진영 배정' },
              { label: 'DataManager (Facade)', sub: '읽기와 쓰기, 변경 이벤트 발행 창구' },
              { label: 'Photon Custom Properties', sub: '실제 네트워크 공유 저장소' },
            ],
          },
          caption: 'Photon 플레이어 데이터 접근 경로의 단일화.',
        },
      },
      {
        heading: '반복되는 상호작용의 공통화',
        body: '이 게임에는 인형 조사와 문 열기, 의식 진행처럼 형태는 다르지만 구조가 같은 상호작용이 반복해서 등장했습니다. 대상을 바라보면 안내가 표시되고, 일정 시간 키를 누르고 있으면 완료되며, 중간에 놓으면 취소되는 흐름입니다. IInteractable로 탐색과 UI 표시를 통일하고, 캐스팅은 두 개의 구조체로 나눴습니다. Cast는 게이지가 차오르는 속도와 목표치, 쿨타임만 담고, CastFuncSet은 진행 조건과 진행 중 동작, 중단 동작, 완료 동작을 선택적으로 담습니다. 그 결과 새 상호작용은 필요한 콜백만 지정해 넘기면 되었고, 인형과 퇴마사처럼 같은 오브젝트를 서로 다른 속도와 완료 동작으로 다루는 경우도 같은 시스템으로 처리할 수 있었습니다.',
        diagram: {
          spec: {
            kind: 'flow',
            steps: [
              { label: '탐색', sub: '시야 내 IInteractable 검출' },
              { label: '안내 UI', sub: '상호작용 가능 표시' },
              { label: '캐스팅 시작', sub: '키 입력 유지' },
              { label: '진행과 취소', sub: '게이지 진행과 중단 조건' },
              { label: '완료 동작', sub: 'CastFuncSet 실행' },
            ],
          },
          caption: '공통 상호작용과 캐스팅 시스템의 처리 흐름.',
        },
        code: {
          label: 'NormalAltar.cs, 공통 캐스팅 시스템 사용 예',
          lang: 'C#',
          source: `// CastingSystem이 제공하는 두 구조체
public struct Cast
{
    public static Cast CreateByRatio( float deltaRatio, float destRatio = 1.0f, float? coolTime = null );
    public static Cast CreateByTime ( float castTime,   float destRatio = 1.0f, float? coolTime = null );
}
public struct CastFuncSet
{
    public CastFuncSet( Action<float> SyncDataWith = null, Func<bool> RunningCondition = null,
        Action RunningAction = null, Action PauseAction = null, Action FinishAction = null );
}

// 사용하는 쪽은 필요한 콜백만 이름으로 지정한다.
public override bool Interact( Interactor interactor )
{
    targetController.SetInteractType( GaugedObjType.NormalAltar );
    targetController.ChangeBehaviorTo( NetworkBaseController.BehaviorType.Interact );

    if (targetController.gameObject.CompareTag( GameManager.DollTag ))
    {
        castingSystem.ForceSetRatioTo( RateOfGauge );          // 중단된 지점부터 이어서
        castingSystem.StartCasting(
            CastingSystem.Cast.CreateByRatio(
                targetController.InteractionSpeed / MaxGauge, coolTime: CoolTime ),
            new CastingSystem.CastFuncSet(
                SyncGauge, DollRunningCondition, ChangeCandleLightsToEveryone,
                DollPauseAction, DollFinishAction ) );

        photonView.RPC( "PlayDollEffects_RPC", RpcTarget.All );
        return true;
    }
    if (targetController.gameObject.CompareTag( GameManager.ExorcistTag ))
    {
        // 같은 오브젝트지만 퇴마사는 속도도 완료 동작도 다르다. 필요한 콜백은 하나뿐이다.
        castingSystem.StartCasting(
            CastingSystem.Cast.CreateByRatio(
                targetController.InteractionSpeed / exorcistInteractMaxGauge, coolTime: CoolTime ),
            new CastingSystem.CastFuncSet( FinishAction: ExorcistFinishAction ) );
        return true;
    }
    return false;
}`,
        },
      },
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
    summary: 'Windows API로 2D 횡스크롤 게임 프레임워크와 스프라이트 에디터를 제작한 1인 프로젝트입니다.',
    impact: '자체 게임 프레임워크 · AABB 충돌 · 스프라이트 편집',
    role: 'Solo Developer',
    team: '1-PERSON PROJECT',
    stack: ['C++', 'Windows API', 'GDI+', 'FSM', 'AABB'],
    context: '록맨 X5 오프닝 스테이지를 목표로 Windows API 기반 2D 게임과 제작 도구를 직접 구현했습니다.',
    challenge: '외부 게임 엔진 없이 게임 루프와 렌더링, 충돌, 캐릭터 상태, 애니메이션 편집을 하나의 구조로 연결해야 했습니다.',
    approach: [
      'Game과 Scene, Camera, Actor, Behavior로 구성된 자체 게임 프레임워크를 설계했습니다.',
      'AABB로 게임 충돌을 처리하고, 플레이어와 적 AI의 상태는 FSM으로 관리했습니다.',
      '스프라이트 범위와 Pivot, 애니메이션 프레임을 편집하고 저장하는 에디터를 제작했습니다.',
    ],
    results: ['Windows API만으로 횡스크롤 게임 플레이와 적 AI를 구현했습니다.', '스프라이트 애니메이션을 제작하고 디버깅할 수 있는 도구를 구현했습니다.'],
    youtube: 'https://youtu.be/Izxj7TzOfHA',
    images: [
      { src: '/portfolio-media/image41.jpeg', caption: 'Rockman X5 모작 인게임 전투 화면.' },
      { src: '/portfolio-media/image48.png', caption: 'Rockman X5 모작 인게임 장면.' },
    ],
  },
  {
    slug: 'deadlock-c-tank-game',
    group: 'personal',
    number: '11',
    category: 'C · CONSOLE · 2D GAME',
    period: '2022.05.08 — 2022.05.18',
    title: 'Deadlock',
    shortTitle: 'DEADLOCK',
    summary: '그래픽 라이브러리 없이 BMP 이미지를 콘솔 픽셀로 출력하는 C언어 2D 턴제 탱크 슈팅 게임을 제작했습니다.',
    impact: 'BMP 이미지를 콘솔 픽셀로 출력하는 렌더러',
    role: 'Solo Developer',
    team: '1-PERSON PROJECT',
    stack: ['C', 'Windows Console', 'BMP', 'PutPixel/DrawSprite', 'Turn-based AI'],
    context: '웜즈와 포트리스에서 영감을 받아 콘솔 창에서 플레이하는 2D 탱크 슈팅 게임을 제작했습니다.',
    challenge: 'C언어와 콘솔 환경만으로 BMP 파일을 읽어 게임 화면을 구성해야 했습니다. 또한 출력 픽셀 간격에 따라 렌더링 속도가 달라지는 문제도 함께 고려해야 했습니다.',
    approach: [
      'BMP 파일을 읽어 Surface로 변환하고, 콘솔 문자 하나를 픽셀처럼 사용하는 PutPixel과 DrawSprite 출력 흐름을 구현했습니다. 출력 픽셀 간격을 조정해 화면 해상도와 렌더링 속도의 균형을 맞췄습니다.',
      '탱크 이동과 포탄의 포물선 발사, 탱크별 데미지, 3스테이지 진행을 구현했습니다.',
      '플레이어 턴과 AI 턴을 분리하고 난이도에 따라 AI 명중률을 보정했습니다.',
    ],
    results: ['그래픽 라이브러리 없이 콘솔에서 BMP 렌더링을 구현했습니다.', '난이도와 탱크 선택, 턴 진행, 3스테이지 승패 흐름을 구현했습니다.'],
    deepDive: [
      {
        heading: '콘솔 문자를 픽셀로 사용한 렌더링',
        body: '그래픽 라이브러리 없이 이미지를 출력하려면 출력 방식을 직접 정의해야 했습니다. 이를 위해 BMP 헤더를 읽어 픽셀 배열을 Surface로 올리고, 콘솔에 전각 블록 문자를 출력하면서 ANSI 이스케이프로 문자의 색만 바꾸는 방식으로 픽셀을 표현했습니다. 전각 문자는 가로로 두 칸을 차지하기 때문에 커서를 x의 두 배 위치로 옮겨야 정사각형에 가까운 픽셀이 되었습니다. 또한 BMP는 행이 아래에서 위로 저장되고 각 행이 4바이트 경계에 맞춰 패딩됩니다. 로딩할 때 y 진행 방향을 뒤집고 패딩만큼 파일 포인터를 건너뛰게 처리했습니다.',
        diagram: {
          spec: {
            kind: 'flow',
            steps: [
              { label: 'BMP 파일', sub: '헤더 + 픽셀 배열' },
              { label: 'SurfaceLoad', sub: '상하 반전과 패딩 보정' },
              { label: 'Surface', sub: 'Color* pPixels' },
              { label: 'DrawSpriteClipChroma', sub: '화면 클리핑과 투명색 제외' },
              { label: 'PutPixel', sub: '커서를 옮겨 블록 문자 출력' },
            ],
          },
          caption: 'BMP 이미지가 콘솔 화면으로 출력되기까지의 경로.',
        },
        code: {
          label: 'Graphics.c, 콘솔 픽셀 출력',
          lang: 'C',
          source: `void PutPixel( int x, int y, Color c )
{
    MoveCursor( x * 2, y );                            /* 전각 문자는 두 칸을 차지한다 */
    SET_FG_COLOR( GetR( c ), GetG( c ), GetB( c ) );
    printf( "\u2588\u2588" );
}

void DrawSpriteClipChroma( int x, int y, Rect srcRect, const Rect clip, Surface* const s, Color chroma )
{
    /* 화면 밖으로 나간 만큼 원본 사각형을 잘라낸다 */
    if (x < clip.left)   { srcRect.left += clip.left - x; x = clip.left; }
    if (y < clip.top)    { srcRect.top  += clip.top  - y; y = clip.top;  }
    if (x + RectGetWidth( srcRect ) > clip.right)
        srcRect.right  -= x + RectGetWidth( srcRect ) - clip.right;
    if (y + RectGetHeight( srcRect ) > clip.bottom)
        srcRect.bottom -= y + RectGetHeight( srcRect ) - clip.bottom;

    for (int sy = srcRect.top; sy < srcRect.bottom; sy++)
    {
        for (int sx = srcRect.left; sx < srcRect.right; sx++)
        {
            Color curPixelColor = SurfaceGetPixel( s, sx, sy );
            if (curPixelColor.dword != chroma.dword)    /* 투명색은 건너뛴다 */
            {
                PutPixel( x + sx - srcRect.left, y + sy - srcRect.top, curPixelColor );
            }
        }
    }
    s->wasDrew = true;
}`,
        },
      },
    ],
    youtube: 'https://youtu.be/ym8-lvTHfhM',
    images: [
      { src: '/portfolio-media/image51.png', caption: 'Deadlock 게임 시작 화면.' },
      { src: '/portfolio-media/image54.png', caption: 'Deadlock 게임 승리 화면.' },
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
    summary: 'F-16 조종석에서 계기비행과 착륙을 수행하는 PC VR 항공기 시뮬레이터를 Unreal Engine 4로 제작했습니다.',
    impact: '항공전자 계기 UI · VR 조종 상호작용 · 비행 모델 연동',
    role: 'Team Lead · Developer',
    team: '4-PERSON TEAM',
    stack: ['Unreal Engine 4', 'Blueprint', 'EasyFlightModel Plugin', 'Blender', 'VR'],
    context: '한서대학교 4인 졸업 프로젝트에서 팀장과 개발자를 맡아 F-16 조종석의 항공전자 장비와 VR 상호작용을 구현하고, EasyFlightModel 비행 모델 플러그인을 Blueprint로 연동했습니다.',
    challenge: '정해진 기간 안에 비행 상태와 계기 UI를 연동해야 했습니다. 동시에 VR 조종석 상호작용과 항공기 모델 및 애니메이션, 비행 모델 플러그인 연동까지 함께 완성해야 했습니다.',
    approach: ['HUD와 Air Speed Indicator, Altimeter, Attitude Director 등 주요 항공전자 계기와 로직을 개발했습니다.', '핸드 트래킹을 이용한 조종석 상호작용과 항공기 모델 및 애니메이션을 제작했고, Jira와 Confluence로 일정과 문서를 관리했습니다.', 'EasyFlightModel 플러그인의 비행 데이터 getter와 조종 입력 setter를 Blueprint로 연동했습니다. 조종사 시점과 항공기 시점 카메라를 구현했고, 팀장으로서 기능 우선순위를 정했습니다.'],
    results: ['VR 핸드 트래킹으로 항공전자 장비를 조작하는 PC VR 시뮬레이터를 완성했습니다. 직접 조종해 계기비행부터 착륙까지 수행되는 것을 확인했습니다.', 'EasyFlightModel 플러그인의 비행 데이터를 F-16 조종석 계기와 연동해 계기비행 상태를 표시했습니다.'],
    youtube: 'https://youtu.be/R9U9pKLASw0?t=942',
    links: [{ label: 'GitHub Repository', href: 'https://github.com/ArshesSH/VRFlight' }],
    images: [
      { src: '/portfolio-media/image58.png', caption: 'VRFlight 시연 장면.' },
      { src: '/portfolio-media/image62.png', caption: 'VRFlight 조종석 인게임 화면.' },
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
    summary: 'Arduino와 C 기반 PID 제어로 RC 고정익 모형기의 자동 자세 보조 시스템을 구현한 4인 캡스톤 프로젝트입니다.',
    impact: 'PID 기반 고정익 자세 제어',
    role: 'Team Lead · Software Developer',
    team: '4-PERSON TEAM',
    stack: ['Arduino', 'C', 'C++', 'PID Control'],
    context: '한서대학교 4인 캡스톤 프로젝트에서 팀장과 소프트웨어 개발을 맡아 RC 고정익 모형기의 자세 데이터 전달 과정과 자동 자세 보조 시스템을 개발했습니다.',
    challenge: 'RC 고정익 모형기의 자세 데이터 전달 과정과 자세 제어 알고리즘을 이해해야 했습니다. 그리고 센서 입력과 서보 출력을 연결하는 제어 루프를 팀 단위로 완성해야 했습니다.',
    approach: ['자세 센서 데이터를 읽어 기체의 현재 상태를 계산했습니다.', '목표 자세와의 오차를 PID 제어 입력으로 사용하고 서보 출력에 반영했습니다.', '필요한 제어 원리를 학습해 팀원과 공유하며 프로젝트 진행을 관리했습니다.'],
    results: ['Arduino로 센서 입력과 PID 계산, 서보 출력으로 이어지는 제어 루프를 구현했습니다.', '지상 테스트를 통해 RC 고정익 모형기의 자동 자세 보조 시스템이 동작하는 것을 확인했습니다.'],
    links: [{ label: 'GitHub Repository', href: 'https://github.com/ArshesSH/Fixed-wing_FlightController' }],
    images: [{ src: '/portfolio-media/image63.png', caption: 'Sky Stability를 적용한 RC 고정익 모형기 시연 화면.' }],
  },
]

export const defaultProjects: Project[] = projectSeeds.map((project) => ({
  ...project,
  id: `project:${project.slug}`,
  approach: project.approach.map((text, index) => ({ id: `project:${project.slug}:approach:${index + 1}`, text })),
  results: project.results.map((text, index) => ({ id: `project:${project.slug}:result:${index + 1}`, text })),
  images: project.images?.map((image, index) => ({ ...image, id: `project:${project.slug}:image:${index + 1}` })),
  links: project.links?.map((link, index) => ({ ...link, id: `project:${project.slug}:link:${index + 1}` })),
  deepDive: project.deepDive?.map((block, index) => ({ ...block, id: `project:${project.slug}:deep-dive:${index + 1}` })),
}));

const experience: ExperienceItem[] = [
  { id: 'experience:oasis-aix', period: '2025.09 — PRESENT', company: 'OASIS AIX', role: 'AI Lab · 연구원', detail: 'Unity Android AR과 Unreal Engine 5 VR 클라이언트 개발' },
  { id: 'experience:stans', period: '2023.12 — 2025.04', company: 'STANS', role: '주임 연구원', detail: 'Unity XR과 디지털 트윈, Unreal Engine 5 모바일 AR, Tauri 클라이언트 개발' },
  { id: 'experience:danam-systems', period: '2023.06 — 2023.12', company: 'DANAM SYSTEMS', role: '연구원', detail: 'LAND400 Phase3 AS9 & AS10 HUMS 임베디드 소프트웨어 개발' },
  { id: 'experience:pearl-abyss', period: '2023.03 — 2023.05', company: 'PEARL ABYSS', role: 'UI 개발 인턴', detail: '블랙스페이스 엔진에서 붉은사막 UI와 디버깅 도구 구현' },
]

const education = [
  { id: 'education:hongik', period: '2024.09 — PRESENT', school: '홍익대학교 영상·커뮤니케이션대학원', detail: 'VR·AR콘텐츠 · 석사 재학' },
  { id: 'education:hanseo', period: '2016.03 — 2022.02', school: '한서대학교', detail: '항공소프트웨어공학 · 학사 · GPA 4.29 / 4.5' },
]

const profileStatements = [
  { id: 'profile:statement:1', text: 'Unity와 Unreal Engine, 자체 엔진, Babylon.js 환경에서 AR과 VR, 디지털 트윈, 게임 UI를 구현했습니다.' },
  { id: 'profile:statement:2', text: 'Unity AI Inference 추론 속도와 전신 트래킹 동기화, 위치 기반 데이터 로딩, UDP 패킷 복구 등 실제 배포 환경에서 발생한 문제를 해결했습니다.' },
  { id: 'profile:statement:3', text: '현재 홍익대학교 영상·커뮤니케이션대학원에서 VR·AR콘텐츠를 전공하며 실시간 3D 클라이언트 개발 범위를 넓히고 있습니다.' },
]

const printProfileStatements = profileStatements.map((item) => ({ ...item, id: `print:${item.id}` }))

export const defaultContent: PortfolioContent = {
  hero: {
    eyebrow: 'SEOUL · REAL-TIME 3D · INTERACTIVE SYSTEMS',
    kicker: '김세현 / KIM SAEHYEON · PORTFOLIO 2026',
    titleLead: 'REAL-TIME',
    titleAccent: '3D CLIENT',
    titleTail: 'ENGINEER.',
    descriptionLead: 'Unity와 Unreal Engine, 자체 엔진으로 AR과 네트워크 VR,',
    descriptionAccent: '디지털 트윈 클라이언트',
    descriptionTail: '를 개발해왔습니다.',
  },
  profile: {
    headingLead: '실시간 3D 클라이언트',
    headingTail: '개발자 김세현입니다.',
    description: 'Unity와 Unreal Engine, 자체 엔진, Babylon.js로 클라이언트를 개발했고 Linux와 C 기반 임베디드 소프트웨어도 개발했습니다.',
    statements: profileStatements,
    personalLabTitle: 'Local LLM & AI Agent',
    personalLabBody: 'Strix Halo 기반 로컬 LLM 환경을 운영하며 모델별 실행 설정과 개인 비서·AI 보조 개발 워크플로를 실험하고 있습니다.',
  },
  archive: {
    heading: '프로젝트 소개',
    description: '프로젝트에서 담당한 업무와 구현 과정, 확인된 결과를 정리했습니다.',
    intro: '회사 프로젝트와 개인 및 팀 프로젝트로 나누어, 각각 맡은 역할과 구현 내용을 정리했습니다.',
    companyHeading: '회사 프로젝트',
    companyDescription: '실무에서 제품과 클라이언트 개발을 담당한 프로젝트입니다.',
    personalHeading: '개인 및 팀 프로젝트',
    personalDescription: '기획부터 구현까지 직접 진행하거나, 팀으로 협업하며 기술을 확장한 프로젝트입니다.',
  },
  projects: defaultProjects,
  experience,
  education,
  capabilities: [
    { id: 'capability:engines', text: 'Unreal Engine 4/5 · Unity · Babylon.js' },
    { id: 'capability:languages', text: 'C++ · C# · C · TypeScript' },
    { id: 'capability:xr', text: 'PICO SDK · AR Foundation · Unity AI Inference · GAS' },
    { id: 'capability:web-gis', text: 'SvelteKit · Tauri · OpenLayers · GIS' },
    { id: 'capability:systems', text: 'Linux · UDP · Message Queue · Win32 API' },
    { id: 'capability:tools', text: 'Blender · Jira · Confluence · Perforce' },
  ],
  contact: {
    heading: '프로젝트나 채용 관련 문의는 이메일로 연락 부탁드립니다.',
    email: 'cendrillio@naver.com',
  },
  print: {
    coverSummaryFull: 'Unity와 Unreal Engine, 자체 엔진으로 AR과 VR, 디지털 트윈 클라이언트를 개발해온 김세현의 전체 프로젝트 포트폴리오입니다. 주요 프로젝트는 설계 도면과 핵심 코드를 포함한 상세 구현까지 함께 수록했습니다.',
    coverSummarySummary: 'Unity와 Unreal Engine, 자체 엔진으로 AR과 VR, 디지털 트윈 클라이언트를 개발해온 김세현의 전체 프로젝트 포트폴리오 요약본입니다. 상세 구현이 포함된 전체본은 웹 포트폴리오에서 받으실 수 있습니다.',
    profileHeading: '실시간 3D 클라이언트 개발자 김세현입니다.',
    profileStatements: printProfileStatements,
    projectIndexHeading: '전체 프로젝트',
    projectIndexNote: '◆ 표시가 있는 프로젝트는 설계 도면과 핵심 코드를 포함한 상세 구현을 함께 수록했습니다.',
    footer: '© 2026 김세현 / KIM SAEHYEON · REAL-TIME 3D ENGINEER · SEOUL · cendrillio@naver.com',
  },
}

export function createDefaultContent(): PortfolioContent {
  return JSON.parse(JSON.stringify(defaultContent)) as PortfolioContent
}
