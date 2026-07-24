const projects = [
  {
    number: '01',
    type: 'DIGITAL TWIN · CLIENT',
    meta: '2024.12 — 2025.04 · Windows Client Developer',
    title: 'TOPES 교통 통합\n관제 시스템',
    summary:
      'CCTV 관제와 스마트교차로, AI 교통분석을 하나의 데스크톱 경험으로 연결했습니다. 2D 편집 결과를 3D 가상 공간에 연동하고 실시간 차량·신호 데이터를 시각화했습니다.',
    outcome: '영상 좌표의 3D 공간 변환, 교통 시뮬레이션과 지도 기반 경로·클러스터링 구현',
    stack: ['TypeScript', 'Svelte', 'Tauri', 'Babylon.js', 'OpenLayers'],
  },
  {
    number: '02',
    type: 'MOBILE AR · SIMULATION',
    meta: '2024.10 — 2024.12 · Android Client Developer',
    title: '표준작전절차 기반\nAR 화재진압 훈련',
    summary:
      '실제 화재 대응 절차를 모바일 AR에서 반복 훈련할 수 있도록 Unreal Engine 5 기반 교육 시나리오와 클라이언트 기능을 구현했습니다.',
    outcome: 'FSM 시나리오 액터, 소방호스 상호작용, 퀴즈·PDF 뷰어를 포함한 훈련 UI 제작',
    stack: ['Unreal Engine 5', 'C++', 'Android', 'AR', 'FSM'],
  },
  {
    number: '03',
    type: 'EMBEDDED · RELIABILITY',
    meta: '2023.06 — 2023.12 · SBC Software Engineer',
    title: 'LAND400 HUMS\n상태감시 시스템',
    summary:
      '기존 단일 파일 중심의 SBC 소프트웨어를 재설계하고 데이터 수집·정제·저장을 분리한 처리 파이프라인으로 구현했습니다.',
    outcome: 'UDP 패킷 검사·복구 시스템 구현 및 정적·동적 소프트웨어 검사 통과',
    stack: ['C', 'Linux', 'UDP', 'Multithreading', 'Embedded'],
  },
  {
    number: '04',
    type: 'MIXED REALITY · PERFORMANCE',
    meta: '2023.12 — 2024.05 · HoloLens 2 Client Developer',
    title: 'AWAS-XR\n공정 교육 저작도구',
    summary:
      'HoloLens 2에서 공정 교육 시나리오를 제작하고 실행하는 MR 클라이언트를 개발하며 UI와 3D 상호작용 구조를 개선했습니다.',
    outcome: 'Unity Job System 기반 모델 로딩 개선, Grab 시스템과 HoloLens용 Outline Shader 구현',
    stack: ['Unity', 'C#', 'HoloLens 2', 'Job System', 'Shader'],
  },
  {
    number: '05',
    type: 'GAME · TOOLS',
    meta: '2023.03 — 2023.05 · Gameplay UI Intern',
    title: '펄어비스 신작\n게임플레이 UI',
    summary:
      '자체 엔진의 UI 처리 흐름을 파악해 캐릭터·장비 전환용 원형 퀵슬롯을 구현하고 기존 게임플레이 UI를 개선했습니다.',
    outcome: '적 체력, 인벤토리, 탑승물 UI 개선과 개발 지원용 월드맵 시각화 기능 구현',
    stack: ['C++', 'HTML', 'CSS', 'Custom Engine', 'Game UI'],
  },
]

const experience = [
  {
    period: '2023.12 — 2025.04',
    company: 'STANS',
    role: '주임 연구원',
    description:
      'HoloLens 2 MR, 디지털 트윈, 웹 3D 및 Unreal Engine 기반 모바일 AR 클라이언트 개발',
  },
  {
    period: '2023.06 — 2023.12',
    company: 'DANAM Systems',
    role: 'SW 연구원',
    description:
      '항공기 상태 및 사용 모니터링 시스템(HUMS)의 데이터 수집·정제·저장 소프트웨어 개발',
  },
  {
    period: '2023.03 — 2023.05',
    company: 'Pearl Abyss',
    role: '게임 개발 인턴',
    description:
      '자체 엔진 기반 AAA 신작 프로젝트의 인게임 UI 및 개발 지원 시각화 도구 구현',
  },
]

const skills = [
  ['REAL-TIME 3D', 'Unreal Engine · Unity · Babylon.js'],
  ['PROGRAMMING', 'C++ · C# · C · TypeScript'],
  ['SPECIALTY', 'XR · Digital Twin · Game UI · Embedded Linux'],
  ['WORKFLOW', 'Git · Perforce · Jira · Confluence'],
]

const publicBuilds = [
  {
    year: '2025',
    title: 'CursorChanger',
    description:
      '실행 중인 프로세스와 활성 창에 따라 Windows 시스템 커서를 자동 전환하는 데스크톱 유틸리티입니다.',
    stack: 'C++ · DirectX 12 · Dear ImGui',
    href: 'https://github.com/ArshesSH/CursorChanger',
  },
  {
    year: '2021',
    title: 'VRFlight',
    description:
      'F-16 조종석의 주요 계기와 인터랙션을 구현한 Unreal Engine 기반 VR 비행 시뮬레이터입니다.',
    stack: 'Unreal Engine 4 · C++ · Blueprint',
    href: 'https://github.com/ArshesSH/VRFlight',
  },
  {
    year: '2022',
    title: 'Fixed-wing Flight Controller',
    description:
      'Arduino Uno 환경에서 고정익 항공기의 수평 자세를 제어하도록 설계한 임베디드 시스템입니다.',
    stack: 'Arduino · C · C++',
    href: 'https://github.com/ArshesSH/Fixed-wing_FlightController',
  },
]

function Arrow() {
  return <span aria-hidden="true">↗</span>
}

function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        본문으로 건너뛰기
      </a>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="홈으로">
          SH<span>.</span>
        </a>
        <nav aria-label="주요 메뉴">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#about">About</a>
          <a href="#lab">Lab</a>
        </nav>
        <a className="header-contact" href="mailto:cendrillio@naver.com">
          Contact <Arrow />
        </a>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-grid" aria-hidden="true" />
          <p className="eyebrow">
            <span className="status-dot" /> SEOUL · REAL-TIME 3D · INTERACTIVE
            SYSTEMS
          </p>
          <h1>
            REAL-TIME
            <br />
            <span>3D ENGINEER</span>
          </h1>
          <div className="hero-bottom">
            <p className="hero-intro">
              게임부터 XR, 디지털 트윈까지.
              <br />
              현실의 복잡한 문제를 <strong>인터랙티브 시스템</strong>으로
              해결합니다.
            </p>
            <div className="hero-meta">
              <span>김새현 / KIM SAEHYEON</span>
              <span>PORTFOLIO 2026</span>
            </div>
          </div>
          <a className="scroll-cue" href="#work" aria-label="대표 프로젝트 보기">
            SCROLL TO EXPLORE <span>↓</span>
          </a>
        </section>

        <section className="work section" id="work">
          <div className="section-heading">
            <p className="section-index">01 / SELECTED WORK</p>
            <h2>
              복잡한 문제를
              <br />
              작동하는 경험으로.
            </h2>
            <p>
              서로 다른 산업과 실행 환경에서 구조를 파악하고,
              <br />
              병목을 찾아 끝까지 작동하는 결과를 만들었습니다.
            </p>
          </div>

          <div className="project-list">
            {projects.map((project) => (
              <article className="project-card" key={project.number}>
                <div className="project-number">{project.number}</div>
                <div className="project-content">
                  <p className="project-type">{project.type}</p>
                  <p className="project-meta">{project.meta}</p>
                  <h3>
                    {project.title.split('\n').map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </h3>
                  <p className="project-summary">{project.summary}</p>
                  <p className="project-outcome">
                    <span>IMPACT</span>
                    {project.outcome}
                  </p>
                  <ul className="tag-list" aria-label="사용 기술">
                    {project.stack.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="project-mark" aria-hidden="true">
                  {project.number}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="experience section" id="experience">
          <div className="section-heading compact">
            <p className="section-index">02 / EXPERIENCE</p>
            <h2>경험의 폭이 곧 문제 해결의 깊이입니다.</h2>
          </div>
          <div className="timeline">
            {experience.map((item) => (
              <article className="timeline-item" key={item.company}>
                <p className="timeline-period">{item.period}</p>
                <div>
                  <h3>{item.company}</h3>
                  <p className="timeline-role">{item.role}</p>
                </div>
                <p className="timeline-description">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about section" id="about">
          <div className="section-heading">
            <p className="section-index">03 / ABOUT & CAPABILITIES</p>
            <h2>
              엔진보다 중요한 건
              <br />
              문제를 보는 방식.
            </h2>
          </div>
          <div className="about-grid">
            <div className="about-copy">
              <p>
                저는 새로운 기술을 적용하는 것보다, 시스템이 왜 느리고 불안정한지
                먼저 파악합니다. 낯선 엔진과 도메인에서도 데이터의 흐름과 책임
                경계를 찾아 유지보수 가능한 구조로 바꾸는 일을 좋아합니다.
              </p>
              <p>
                게임, 방산, XR, 디지털 트윈에서 쌓은 경험을 연결해 현실과 가상
                세계가 자연스럽게 상호작용하는 제품을 만듭니다.
              </p>
              <a
                className="text-link"
                href="https://github.com/ArshesSH"
                target="_blank"
                rel="noreferrer"
              >
                GitHub에서 코드 보기 <Arrow />
              </a>
            </div>
            <dl className="skill-list">
              {skills.map(([name, detail]) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="lab section" id="lab">
          <div className="section-heading compact">
            <p className="section-index">04 / PUBLIC BUILDS</p>
            <div>
              <h2>직접 만들고, 공개하고, 개선합니다.</h2>
              <p className="lab-intro">
                실무 밖에서도 필요한 도구와 인터랙티브 시스템을 끝까지 구현하며
                배운 것을 코드로 남깁니다.
              </p>
            </div>
          </div>
          <div className="lab-grid">
            {publicBuilds.map((project) => (
              <a
                className="lab-card"
                href={project.href}
                target="_blank"
                rel="noreferrer"
                key={project.title}
                aria-label={`${project.title} GitHub 저장소 열기`}
              >
                <div className="lab-card-top">
                  <span>{project.year}</span>
                  <Arrow />
                </div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <span className="lab-stack">{project.stack}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="contact">
          <p className="section-index">05 / LET&apos;S BUILD SOMETHING</p>
          <h2>
            좋은 문제를
            <br />
            함께 풀어봅시다.
          </h2>
          <a href="mailto:cendrillio@naver.com">
            cendrillio@naver.com <Arrow />
          </a>
        </section>
      </main>

      <footer>
        <p>© 2026 KIM SAEHYEON</p>
        <p>REAL-TIME 3D ENGINEER · SEOUL</p>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </>
  )
}

export default App
