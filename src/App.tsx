const projects = [
  {
    number: '01',
    type: 'XR · PERFORMANCE',
    title: 'HoloLens 2 기반\n산업용 XR 클라이언트',
    summary:
      '복잡한 3D 모델을 현장에서 안정적으로 다루기 위해 기존 구조를 재설계하고, 로딩 병목을 개선했습니다.',
    outcome: 'Unity Job System을 적용해 모델 처리 파이프라인 개선',
    stack: ['Unity', 'C#', 'HoloLens 2', 'MRTK'],
  },
  {
    number: '02',
    type: 'EMBEDDED · RELIABILITY',
    title: '항공기 HUMS\n데이터 처리 시스템',
    summary:
      '2만 줄 이상의 단일 파일 시스템을 객체지향 구조와 멀티스레드 파이프라인으로 처음부터 재설계했습니다.',
    outcome: '데이터 유실 자동 감지·재요청 구현, 전 장비 수락시험 통과',
    stack: ['C++', 'Linux', 'UDP', 'Multithreading'],
  },
  {
    number: '03',
    type: 'GAME · TOOLS',
    title: 'AAA 신작 프로젝트\n게임 UI 개발',
    summary:
      '자체 엔진의 처리 흐름을 분석해 캐릭터 전환 퀵슬롯과 월드맵 오브젝트 밀도 시각화 기능을 구현했습니다.',
    outcome: '디버깅 효율을 높이는 월드맵 시각화 도구 제공',
    stack: ['C++', 'Custom Engine', 'UI', 'Data Visualization'],
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
            <span className="status-dot" /> SEOUL · AVAILABLE FOR NEW CHALLENGES
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
