import { useEffect, useRef, useState } from 'react'
import { Diagram } from './diagrams'
import { createDefaultContent } from './content/default-content'
import { commitActiveEditable, EditorModeProvider, EditorToolbar, EditableText, useEditorMode, type EditorSaveState } from './content/editor'
import { saveContent } from './content/content-writer'
import { renderProse } from './content/prose'
import type { ContentItem, DiagramBlock, EducationItem, ExperienceItem, HeaderContent, PdfVariant, PortfolioContent, Project } from './content/types'

type ContentUpdater = (updater: (content: PortfolioContent) => PortfolioContent) => void

function Arrow() {
  return <span aria-hidden="true">↗</span>
}

function getRoute() {
  return window.location.hash.replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean)
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
    return 'https://www.youtube-nocookie.com/embed/' + videoId + '?' + params.toString()
  } catch {
    return null
  }
}

function replaceProject(updateContent: ContentUpdater, projectId: string, transform: (project: Project) => Project) {
  updateContent((content) => ({
    ...content,
    projects: content.projects.map((project) => project.id === projectId ? transform(project) : project),
  }))
}

function replaceTextItem(items: ContentItem[], id: string, text: string) {
  return items.map((item) => item.id === id ? { ...item, text } : item)
}

function formatProjectNumber(index: number) {
  return String(index + 1).padStart(2, '0')
}

const TILE_BUILD_LIMIT = 4

// builds는 중요한 순으로 정렬한다. 카드에는 앞쪽 일부만 노출하고 나머지는 생략한다.
function formatBuildLabels(builds: Project['builds']) {
  const shown = builds.slice(0, TILE_BUILD_LIMIT).map((build) => build.label).join(', ')
  return builds.length > TILE_BUILD_LIMIT ? `${shown} 외 ${builds.length - TILE_BUILD_LIMIT}개` : shown
}

function getBuildDiagrams(build: Project['builds'][number]): DiagramBlock[] {
  return [
    ...(build.diagram ? [build.diagram] : []),
    ...(build.diagrams ?? []),
  ]
}

function updateBuildDiagram(build: Project['builds'][number], diagramIndex: number, transform: (diagram: DiagramBlock) => DiagramBlock): Project['builds'][number] {
  if (build.diagram && diagramIndex === 0) return { ...build, diagram: transform(build.diagram) }
  const arrayIndex = build.diagram ? diagramIndex - 1 : diagramIndex
  return { ...build, diagrams: build.diagrams?.map((diagram, index) => index === arrayIndex ? transform(diagram) : diagram) }
}

function Header({ project, email, content, onDownload }: { project?: boolean; email: string; content: HeaderContent; onDownload: (variant: PdfVariant) => void }) {
  return (
    <header className="site-header">
      <a className="brand" href="#/" aria-label="홈으로">SH<span>.</span></a>
      <nav aria-label="주요 메뉴">
        {project ? <a href="#/projects">All projects</a> : <a href="#/projects">Projects</a>}
      </nav>
      <div className="header-actions">
        <div className="header-pdf-group" role="group" aria-label="PDF 저장">
          <button className="header-pdf" type="button" onClick={() => onDownload('summary')} title={content.summaryPdfTitle}>
            요약 PDF
          </button>
          <span aria-hidden="true">,</span>
          <button className="header-pdf" type="button" onClick={() => onDownload('projects')} title={content.projectsPdfTitle}>
            프로젝트 PDF
          </button>
          <span aria-hidden="true">,</span>
          <button className="header-pdf" type="button" onClick={() => onDownload('full')} title={content.fullPdfTitle}>
            전체 PDF <Arrow />
          </button>
        </div>
        <a className="header-contact" href={'mailto:' + email}>Contact <Arrow /></a>
      </div>
    </header>
  )
}

function ProjectGrid({ items, allProjects, updateContent }: { items: Project[]; allProjects: Project[]; updateContent: ContentUpdater }) {
  const editing = useEditorMode()
  return (
    <div className="project-grid">
      {items.map((project) => {
        const projectIndex = allProjects.findIndex((item) => item.id === project.id)
        return <a className="project-tile" href={'#/project/' + project.slug} key={project.slug} onClick={(event) => {
          if (editing && (event.target as HTMLElement).closest('[contenteditable="true"]')) event.preventDefault()
        }}>
          <div className="tile-top">
            <span>{formatProjectNumber(projectIndex)}</span>
            <EditableText as="span" value={project.category} onChange={(value) => replaceProject(updateContent, project.id, (item) => ({ ...item, category: value }))} ariaLabel="프로젝트 카테고리" />
            <Arrow />
          </div>
          <div className={'tile-visual' + (project.images?.length ? ' has-image' : '')} aria-hidden={editing ? undefined : true}>
            {project.images?.[0] && <img src={project.images[0].src} alt="" />}
            <EditableText as="span" value={project.shortTitle} onChange={(value) => replaceProject(updateContent, project.id, (item) => ({ ...item, shortTitle: value }))} ariaLabel="프로젝트 짧은 제목" />
          </div>
          <div className="tile-copy">
            <EditableText as="p" value={project.period} onChange={(value) => replaceProject(updateContent, project.id, (item) => ({ ...item, period: value }))} ariaLabel="프로젝트 기간" />
            <EditableText as="h3" value={project.title} onChange={(value) => replaceProject(updateContent, project.id, (item) => ({ ...item, title: value }))} ariaLabel="프로젝트 제목" />
            <EditableText as="span" value={project.summary} onChange={(value) => replaceProject(updateContent, project.id, (item) => ({ ...item, summary: value }))} ariaLabel="프로젝트 요약" multiline />
          </div>
          <div className="tile-impact">
            <small>BUILD</small>
            <span>{formatBuildLabels(project.builds)}</span>
          </div>
        </a>
      })}
    </div>
  )
}

function Home({ content, updateContent, onDownload }: { content: PortfolioContent; updateContent: ContentUpdater; onDownload: (variant: PdfVariant) => void }) {
  return (
    <>
      <Header content={content.header} email={content.contact.email} onDownload={onDownload} />
      <main id="main">
        <section className="hero">
          <p className="eyebrow"><span className="status-dot" /><EditableText as="span" value={content.hero.eyebrow} onChange={(value) => updateContent((current) => ({ ...current, hero: { ...current.hero, eyebrow: value } }))} ariaLabel="히어로 설명" /></p>
          <div className="hero-title">
            <EditableText as="p" value={content.hero.kicker} onChange={(value) => updateContent((current) => ({ ...current, hero: { ...current.hero, kicker: value } }))} ariaLabel="히어로 키커" />
            <h1>
              <EditableText as="span" className="hero-title-lead" value={content.hero.titleLead} onChange={(value) => updateContent((current) => ({ ...current, hero: { ...current.hero, titleLead: value } }))} ariaLabel="히어로 제목 첫 줄" />
              <br />
              <EditableText as="span" className="hero-title-accent" value={content.hero.titleAccent} onChange={(value) => updateContent((current) => ({ ...current, hero: { ...current.hero, titleAccent: value } }))} ariaLabel="히어로 제목 강조 줄" />
              <br />
              <EditableText as="span" className="hero-title-tail" value={content.hero.titleTail} onChange={(value) => updateContent((current) => ({ ...current, hero: { ...current.hero, titleTail: value } }))} ariaLabel="히어로 제목 마지막 줄" />
            </h1>
          </div>
          <div className="hero-bottom">
            <p>
              <EditableText as="span" value={content.hero.descriptionLead} onChange={(value) => updateContent((current) => ({ ...current, hero: { ...current.hero, descriptionLead: value } }))} ariaLabel="히어로 소개 첫 문장" />
              <br />
              <EditableText as="strong" value={content.hero.descriptionAccent} onChange={(value) => updateContent((current) => ({ ...current, hero: { ...current.hero, descriptionAccent: value } }))} ariaLabel="히어로 소개 강조 문장" />
              <EditableText as="span" value={content.hero.descriptionTail} onChange={(value) => updateContent((current) => ({ ...current, hero: { ...current.hero, descriptionTail: value } }))} ariaLabel="히어로 소개 마지막 문장" />
            </p>
            <div className="hero-pdf-group">
              <button className="hero-pdf-button" type="button" onClick={() => onDownload('full')}>
                <span>PORTFOLIO PDF, FULL</span>
                상세 구현까지 저장 <Arrow />
              </button>
              <button className="hero-pdf-secondary" type="button" onClick={() => onDownload('summary')}>
                요약본만 저장 <Arrow />
              </button>
            </div>
          </div>
        </section>

        <ProfileSection content={content} updateContent={updateContent} />

        <section className="featured section">
          <div className="section-heading">
            <p className="section-index">02 / WORK ARCHIVE</p>
            <EditableText as="h2" value={content.archive.heading} onChange={(value) => updateContent((current) => ({ ...current, archive: { ...current.archive, heading: value } }))} ariaLabel="프로젝트 섹션 제목" />
            <div className="section-heading-side">
              <EditableText as="p" value={content.archive.description} onChange={(value) => updateContent((current) => ({ ...current, archive: { ...current.archive, description: value } }))} ariaLabel="프로젝트 섹션 설명" multiline />
              <a className="all-projects-link" href="#/projects">모든 프로젝트 보기 <span>{content.projects.length.toString().padStart(2, '0')}</span> <Arrow /></a>
            </div>
          </div>
          <ProjectGrid items={content.projects.slice(0, 4)} allProjects={content.projects} updateContent={updateContent} />
        </section>

        <Contact content={content} updateContent={updateContent} />
      </main>
    </>
  )
}

function ProjectsPage({ content, updateContent, onDownload }: { content: PortfolioContent; updateContent: ContentUpdater; onDownload: (variant: PdfVariant) => void }) {
  const companyProjects = content.projects.filter((project) => project.group === 'company')
  const personalProjects = content.projects.filter((project) => project.group === 'personal')

  return (
    <>
      <Header project content={content.header} email={content.contact.email} onDownload={onDownload} />
      <main id="main" className="page-main">
        <section className="page-intro">
          <p className="section-index">PROJECT ARCHIVE / 2020 — 2026</p>
          <EditableText as="h1" value={content.archive.heading} onChange={(value) => updateContent((current) => ({ ...current, archive: { ...current.archive, heading: value } }))} ariaLabel="프로젝트 아카이브 제목" />
          <EditableText as="p" value={content.archive.intro} onChange={(value) => updateContent((current) => ({ ...current, archive: { ...current.archive, intro: value } }))} ariaLabel="프로젝트 아카이브 소개" multiline />
        </section>
        <section className="archive section">
          <div className="archive-group">
            <div className="archive-group-heading">
              <p className="section-index">01 / COMPANY PROJECTS</p>
              <div>
                <EditableText as="h2" value={content.archive.companyHeading} onChange={(value) => updateContent((current) => ({ ...current, archive: { ...current.archive, companyHeading: value } }))} ariaLabel="회사 프로젝트 제목" />
                <EditableText as="p" value={content.archive.companyDescription} onChange={(value) => updateContent((current) => ({ ...current, archive: { ...current.archive, companyDescription: value } }))} ariaLabel="회사 프로젝트 설명" multiline />
              </div>
              <span>{companyProjects.length.toString().padStart(2, '0')} PROJECTS</span>
            </div>
            <ProjectGrid items={companyProjects} allProjects={content.projects} updateContent={updateContent} />
          </div>
          <div className="archive-group">
            <div className="archive-group-heading">
              <p className="section-index">02 / PERSONAL & TEAM PROJECTS</p>
              <div>
                <EditableText as="h2" value={content.archive.personalHeading} onChange={(value) => updateContent((current) => ({ ...current, archive: { ...current.archive, personalHeading: value } }))} ariaLabel="개인 프로젝트 제목" />
                <EditableText as="p" value={content.archive.personalDescription} onChange={(value) => updateContent((current) => ({ ...current, archive: { ...current.archive, personalDescription: value } }))} ariaLabel="개인 프로젝트 설명" multiline />
              </div>
              <span>{personalProjects.length.toString().padStart(2, '0')} PROJECTS</span>
            </div>
            <ProjectGrid items={personalProjects} allProjects={content.projects} updateContent={updateContent} />
          </div>
        </section>
        <Contact content={content} updateContent={updateContent} />
      </main>
    </>
  )
}

function EditableMediaSource({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  if (!useEditorMode()) return null
  return <p className="editor-media-source"><span>{label}</span><EditableText as="span" value={value} onChange={onChange} ariaLabel={label} /></p>
}

function ProjectPage({ project, content, updateContent, onDownload }: { project: Project; content: PortfolioContent; updateContent: ContentUpdater; onDownload: (variant: PdfVariant) => void }) {
  const index = content.projects.findIndex((item) => item.slug === project.slug)
  const next = content.projects[(index + 1) % content.projects.length]
  const youtubeEmbedUrl = project.youtube ? getYoutubeEmbedUrl(project.youtube) : null

  const changeProject = (transform: (item: Project) => Project) => replaceProject(updateContent, project.id, transform)
  const changeBuild = (id: string, transform: (build: Project['builds'][number]) => Project['builds'][number]) => changeProject((item) => ({ ...item, builds: item.builds.map((build) => build.id === id ? transform(build) : build) }))

  const buildContent = (build: Project['builds'][number]) => (
    <article className="build-item" key={build.id}>
      <EditableText as="h3" className="build-item-label" value={build.label} onChange={(value) => changeBuild(build.id, (item) => ({ ...item, label: value }))} ariaLabel="구현 항목 이름" />
      {getBuildDiagrams(build).map((diagram, diagramIndex) => <Diagram
        key={`${build.id}-diagram-${diagramIndex}`}
        spec={diagram.spec}
        caption={diagram.caption}
        onSpecChange={(spec) => changeBuild(build.id, (item) => updateBuildDiagram(item, diagramIndex, (candidate) => ({ ...candidate, spec })))}
        onCaptionChange={(value) => changeBuild(build.id, (item) => updateBuildDiagram(item, diagramIndex, (candidate) => ({ ...candidate, caption: value })))}
      />)}
      <EditableText as="p" value={build.body} onChange={(value) => changeBuild(build.id, (item) => ({ ...item, body: value }))} ariaLabel="구현 항목 본문" multiline indent />
      {build.media && <figure className="build-media">
        {build.media.kind === 'youtube'
          ? <div className="build-embed"><iframe src={getYoutubeEmbedUrl(build.media.src) ?? ''} title={build.media.caption} loading="lazy" allow="encrypted-media; picture-in-picture; web-share" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
          : build.media.kind === 'video'
            ? <video src={build.media.src} controls muted loop playsInline preload="metadata" />
            : <img src={build.media.src} alt="" loading="lazy" />}
        <EditableText as="figcaption" value={build.media.caption} onChange={(value) => changeBuild(build.id, (item) => item.media ? { ...item, media: { ...item.media, caption: value } } : item)} ariaLabel="구현 항목 미디어 캡션" multiline />
        <EditableMediaSource label="Build media source" value={build.media.src} onChange={(value) => changeBuild(build.id, (item) => item.media ? { ...item, media: { ...item.media, src: value } } : item)} />
      </figure>}
      {build.code && <figure className="build-code">
        <figcaption><EditableText as="span" value={build.code.label} onChange={(value) => changeBuild(build.id, (item) => item.code ? { ...item, code: { ...item.code, label: value } } : item)} ariaLabel="코드 블록 이름" />{build.code.pseudo ? <em>PSEUDOCODE</em> : <EditableText as="em" value={build.code.lang} onChange={(value) => changeBuild(build.id, (item) => item.code ? { ...item, code: { ...item.code, lang: value } } : item)} ariaLabel="코드 언어" />}</figcaption>
        <pre><EditableText as="code" value={build.code.source} onChange={(value) => changeBuild(build.id, (item) => item.code ? { ...item, code: { ...item.code, source: value } } : item)} ariaLabel="의사코드" multiline /></pre>
      </figure>}
    </article>
  )

  const caseSections = [
    {
      code: 'CONTEXT',
      title: '배경',
      content: <div className="case-prose"><EditableText as="p" value={project.context} onChange={(value) => changeProject((item) => ({ ...item, context: value }))} ariaLabel="프로젝트 배경" multiline indent /></div>,
    },
    {
      code: 'BUILD',
      title: '구현 내용',
      content: <div className="build-list">{project.builds.map(buildContent)}</div>,
    },
  ]

  return (
    <>
      <Header project content={content.header} email={content.contact.email} onDownload={onDownload} />
      <main id="main" className="project-page">
        <section className="project-hero">
          <div className="project-kicker">
            <span>{formatProjectNumber(index) + ' / ' + content.projects.length.toString().padStart(2, '0')}</span>
            <EditableText as="span" value={project.category} onChange={(value) => changeProject((item) => ({ ...item, category: value }))} ariaLabel="프로젝트 카테고리" />
          </div>
          <EditableText as="h1" value={project.title} onChange={(value) => changeProject((item) => ({ ...item, title: value }))} ariaLabel="프로젝트 제목" />
          <EditableText as="p" className="project-lead" value={project.summary} onChange={(value) => changeProject((item) => ({ ...item, summary: value }))} ariaLabel="프로젝트 요약" multiline />
          <dl className="project-facts">
            <div><dt>PERIOD</dt><EditableText as="dd" value={project.period} onChange={(value) => changeProject((item) => ({ ...item, period: value }))} ariaLabel="프로젝트 기간" /></div>
            <div><dt>ROLE</dt><EditableText as="dd" value={project.role} onChange={(value) => changeProject((item) => ({ ...item, role: value }))} ariaLabel="프로젝트 역할" /></div>
            <div><dt>TEAM</dt><EditableText as="dd" value={project.team} onChange={(value) => changeProject((item) => ({ ...item, team: value }))} ariaLabel="프로젝트 팀" /></div>
          </dl>
        </section>

        <div className="project-banner">
          <EditableText as="span" value={project.shortTitle} onChange={(value) => changeProject((item) => ({ ...item, shortTitle: value }))} ariaLabel="프로젝트 짧은 제목" />
          <EditableText as="small" value={project.category} onChange={(value) => changeProject((item) => ({ ...item, category: value }))} ariaLabel="프로젝트 카테고리" />
        </div>

        {youtubeEmbedUrl && <section className="project-video section">
          <div className="project-video-heading">
            <p className="section-index">PROJECT VIDEO</p>
            <p>프로젝트 설명에 앞서 주요 장면을 영상으로 확인하실 수 있습니다. <a className="project-video-link" href={project.youtube} target="_blank" rel="noreferrer">YouTube에서 보기 <Arrow /></a></p>
          </div>
          <EditableMediaSource label="Project YouTube URL" value={project.youtube ?? ''} onChange={(value) => changeProject((item) => ({ ...item, youtube: value.trim() || undefined }))} />
          <div className="project-video-frame"><iframe src={youtubeEmbedUrl} title={project.title + ' YouTube 영상'} loading="lazy" allow="encrypted-media; picture-in-picture; web-share" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
        </section>}

        {project.images && <section className="project-media section">
          <div className="project-media-heading"><p className="section-index">PROJECT MEDIA</p><p>포트폴리오 문서에 수록한 주요 화면입니다.</p></div>
          <div className="project-media-grid">
            {project.images.map((image, imageIndex) => <figure key={image.id}>
              <img src={image.src} alt="" />
              <EditableText as="figcaption" value={image.caption} onChange={(value) => changeProject((item) => ({ ...item, images: item.images?.map((candidate, index) => index === imageIndex ? { ...candidate, caption: value } : candidate) }))} ariaLabel="프로젝트 미디어 캡션" multiline />
              <EditableMediaSource label="Media source" value={image.src} onChange={(value) => changeProject((item) => ({ ...item, images: item.images?.map((candidate, index) => index === imageIndex ? { ...candidate, src: value } : candidate) }))} />
            </figure>)}
          </div>
        </section>}

        <section className="case-study section">
          {caseSections.map((section, sectionIndex) => <div className="case-row" key={section.code}>
            <p className="section-index">{formatProjectNumber(sectionIndex)} / {section.code}</p>
            <div><h2>{section.title}</h2>{section.content}</div>
          </div>)}
          <div className="project-stack"><p className="section-index">TECHNOLOGY</p><ul>{project.stack.map((item, index) => <EditableText as="li" key={index} value={item} onChange={(value) => changeProject((candidate) => ({ ...candidate, stack: candidate.stack.map((stackItem, stackIndex) => stackIndex === index ? value : stackItem) }))} ariaLabel="기술 스택" />)}</ul></div>
          {project.links && <div className="project-links">{project.links.map((link, index) => <span key={link.id}><a href={link.href} target="_blank" rel="noreferrer"><EditableText as="span" value={link.label} onChange={(value) => changeProject((item) => ({ ...item, links: item.links?.map((candidate, linkIndex) => linkIndex === index ? { ...candidate, label: value } : candidate) }))} ariaLabel="프로젝트 링크 이름" /> <Arrow /></a><EditableMediaSource label="Link URL" value={link.href} onChange={(value) => changeProject((item) => ({ ...item, links: item.links?.map((candidate, linkIndex) => linkIndex === index ? { ...candidate, href: value } : candidate) }))} /></span>)}</div>}
        </section>

        <a className="next-project" href={'#/project/' + next.slug}>
          <span>NEXT PROJECT, {formatProjectNumber((index + 1) % content.projects.length)}</span>
          <strong>{next.title}</strong>
          <Arrow />
        </a>
      </main>
    </>
  )
}

function ProfileSection({ content, updateContent }: { content: PortfolioContent; updateContent: ContentUpdater }) {
  const updateExperience = (id: string, field: Exclude<keyof ExperienceItem, 'id'>, value: string) => updateContent((current) => ({ ...current, experience: current.experience.map((item) => item.id === id ? { ...item, [field]: value } : item) }))
  const updateEducation = (id: string, field: Exclude<keyof EducationItem, 'id'>, value: string) => updateContent((current) => ({ ...current, education: current.education.map((item) => item.id === id ? { ...item, [field]: value } : item) }))

  return (
    <section className="profile section">
      <div className="profile-heading">
        <p className="section-index">01 / PROFILE</p>
        <div>
          <h2><EditableText as="span" value={content.profile.headingLead} onChange={(value) => updateContent((current) => ({ ...current, profile: { ...current.profile, headingLead: value } }))} ariaLabel="프로필 제목 첫 줄" /><br /><EditableText as="span" value={content.profile.headingTail} onChange={(value) => updateContent((current) => ({ ...current, profile: { ...current.profile, headingTail: value } }))} ariaLabel="프로필 제목 둘째 줄" /></h2>
          <EditableText as="p" value={content.profile.description} onChange={(value) => updateContent((current) => ({ ...current, profile: { ...current.profile, description: value } }))} ariaLabel="프로필 설명" multiline />
        </div>
      </div>
      <div className="profile-body">
        <div className="profile-statement">
          {content.profile.statements.map((statement) => <EditableText as="p" key={statement.id} value={statement.text} onChange={(value) => updateContent((current) => ({ ...current, profile: { ...current.profile, statements: replaceTextItem(current.profile.statements, statement.id, value) } }))} ariaLabel="프로필 문장" multiline />)}
        </div>
        <div className="experience-list">
          <p className="section-index">EXPERIENCE</p>
          {content.experience.map((item) => <article key={item.id}>
            <EditableText as="p" value={item.period} onChange={(value) => updateExperience(item.id, 'period', value)} ariaLabel="경력 기간" />
            <EditableText as="h2" value={item.company} onChange={(value) => updateExperience(item.id, 'company', value)} ariaLabel="회사 이름" />
            <EditableText as="span" value={item.role} onChange={(value) => updateExperience(item.id, 'role', value)} ariaLabel="직무" />
            <EditableText as="small" value={item.detail} onChange={(value) => updateExperience(item.id, 'detail', value)} ariaLabel="경력 설명" multiline />
          </article>)}
        </div>
        <div className="education-list">
          <p className="section-index">EDUCATION</p>
          {content.education.map((item) => <article key={item.id}>
            <EditableText as="p" value={item.period} onChange={(value) => updateEducation(item.id, 'period', value)} ariaLabel="학력 기간" />
            <EditableText as="h2" value={item.school} onChange={(value) => updateEducation(item.id, 'school', value)} ariaLabel="학교 이름" />
            <EditableText as="span" value={item.detail} onChange={(value) => updateEducation(item.id, 'detail', value)} ariaLabel="학력 설명" />
          </article>)}
        </div>
        <div className="capabilities">
          <p className="section-index">CAPABILITIES</p>
          {content.capabilities.map((item) => <EditableText as="span" key={item.id} value={item.text} onChange={(value) => updateContent((current) => ({ ...current, capabilities: replaceTextItem(current.capabilities, item.id, value) }))} ariaLabel="기술 역량" />)}
        </div>
        <div className="personal-lab">
          <p className="section-index">PERSONAL LAB</p>
          <p><EditableText as="strong" value={content.profile.personalLabTitle} onChange={(value) => updateContent((current) => ({ ...current, profile: { ...current.profile, personalLabTitle: value } }))} ariaLabel="개인 연구 제목" /><EditableText as="span" value={content.profile.personalLabBody} onChange={(value) => updateContent((current) => ({ ...current, profile: { ...current.profile, personalLabBody: value } }))} ariaLabel="개인 연구 설명" multiline /></p>
        </div>
      </div>
    </section>
  )
}

function Contact({ content, updateContent }: { content: PortfolioContent; updateContent: ContentUpdater }) {
  return <section className="contact"><p className="section-index">CONTACT</p><EditableText as="h2" value={content.contact.heading} onChange={(value) => updateContent((current) => ({ ...current, contact: { ...current.contact, heading: value } }))} ariaLabel="연락처 제목" multiline /><a href={'mailto:' + content.contact.email}><EditableText as="span" value={content.contact.email} onChange={(value) => updateContent((current) => ({ ...current, contact: { ...current.contact, email: value } }))} ariaLabel="이메일" /> <Arrow /></a></section>
}

function ProseParagraphs({ value }: { value: string }) {
  return <p>{renderProse(value, true, true)}</p>
}

// 요약본 표에는 프로젝트 설명의 첫 문장만 싣는다.
function firstSentence(value: string) {
  const line = value.split('\n').map((item) => item.trim()).find((item) => item.length > 0) ?? ''
  const end = line.indexOf('다. ')
  return end < 0 ? line : line.slice(0, end + 2)
}

function PrintProjectTable({ projects, heading, label }: { projects: Project[]; heading: string; label?: string }) {
  if (projects.length === 0) return null
  return <section className="print-summary-table">
    {label && <div className="print-section-label">{label}</div>}
    <h3>{heading}</h3>
    <div className="print-summary-row is-head">
      <span>PROJECT</span><span>ROLE / CONTRIBUTION</span><span>SUMMARY</span><span>STACK</span>
    </div>
    {projects.map((project) => <div className="print-summary-row" key={project.id}>
      <span><b>{project.title}</b><em>{project.period}</em></span>
      <span><b>{project.role}</b><em>{project.team}</em></span>
      <span>{firstSentence(project.summary)}</span>
      <span className="print-summary-stack">{project.stack.join(', ')}</span>
    </div>)}
  </section>
}

function PrintPortfolio({ content, variant }: { content: PortfolioContent; variant: PdfVariant }) {
  // isFull은 구현 상세(도면·코드) 수록 여부, showProfile은 표지·프로필·경력 수록 여부를 가른다.
  const isFull = variant !== 'summary'
  const showProfile = variant !== 'projects'
  const isSummary = variant === 'summary'
  const printBuild = (build: Project['builds'][number]) => <section className="print-build-item" key={build.id}>
    <h4>{build.label}</h4>
    {getBuildDiagrams(build).map((diagram, diagramIndex) => <Diagram key={`${build.id}-diagram-${diagramIndex}`} spec={diagram.spec} caption={diagram.caption} />)}
    <ProseParagraphs value={build.body} />
    {build.media?.kind === 'image' && <figure className="print-build-media"><img src={build.media.src} alt="" /><figcaption>{build.media.caption}</figcaption></figure>}
    {build.media?.kind === 'video' && <figure className="print-build-media"><video src={build.media.src} controls muted playsInline preload="metadata" /><figcaption>{build.media.caption}</figcaption></figure>}
    {build.media?.kind === 'youtube' && <p className="print-build-link">{build.media.caption} <a href={build.media.src}>{build.media.src}</a></p>}
    {build.code && <figure className="print-build-code"><figcaption><span>{build.code.label}</span><em>{build.code.pseudo ? 'PSEUDOCODE' : build.code.lang}</em></figcaption><pre><code>{build.code.source}</code></pre></figure>}
  </section>
  const printSections = (project: Project) => [
    { code: 'CONTEXT', title: '배경', content: <div className="print-prose"><ProseParagraphs value={project.context} /></div> },
    { code: 'BUILD', title: '구현 내용', content: isFull ? <div className="print-build-list">{project.builds.map(printBuild)}</div> : <div className="print-prose"><p>{project.builds.map((build) => build.label).join(', ')}</p></div> },
  ]
  return (
    <article className={'print-document' + (isFull ? ' is-full' : ' is-summary') + (showProfile ? '' : ' is-projects')}>
      {showProfile && <header className="print-cover">
        <p className="print-eyebrow">KIM SAEHYEON, PORTFOLIO 2026, {isFull ? 'FULL EDITION' : 'SUMMARY EDITION'}</p>
        <h1>{content.hero.titleLead}<br /><span>{content.hero.titleAccent}</span><br />{content.hero.titleTail}</h1>
        <p className="print-cover-summary">{isFull ? content.print.coverSummaryFull : content.print.coverSummarySummary}</p>
        <p className="print-cover-meta">{content.hero.eyebrow}<br />{content.contact.email}</p>
      </header>}

      {showProfile && <section className="print-profile">
        <div className="print-section-label">01 / PROFILE</div>
        <div>
          <h2>{content.print.profileHeading}</h2>
          {content.print.profileStatements.map((statement) => <p key={statement.id}>{statement.text}</p>)}
        </div>
      </section>}

      {showProfile && <section className="print-experience">
        <div className="print-section-label">EXPERIENCE</div>
        {content.experience.map((item) => <article key={item.id}><span>{item.period}</span><strong>{item.company}</strong><b>{item.role}</b><p>{item.detail}</p></article>)}
      </section>}

      {isSummary && <>
        <PrintProjectTable projects={content.projects.filter((project) => project.group === 'company')} heading={content.archive.companyHeading} label="02 / PROJECTS" />
        <PrintProjectTable projects={content.projects.filter((project) => project.group !== 'company')} heading={content.archive.personalHeading} />
      </>}

      {!isSummary && <><section className="print-project-index">
        <div className="print-section-label">{showProfile ? '02 / PROJECTS' : 'PROJECTS'}</div>
        <h2>{showProfile ? content.print.projectIndexHeading : content.print.projectsHeading}</h2>
        {isFull && <p className="print-index-note">{content.print.projectIndexNote}</p>}
        <div className="print-index-grid">
          {content.projects.map((project, projectIndex) => <a href={'#project-' + project.slug} key={project.id}><span>{formatProjectNumber(projectIndex)}</span>{project.title}</a>)}
        </div>
      </section>

      <section className="print-projects">
        {content.projects.map((project, projectIndex) => (
          <article className="print-project" id={'project-' + project.slug} key={project.id}>
            <div className="print-project-header">
              <p className="print-project-kicker">PROJECT {formatProjectNumber(projectIndex)} / {content.projects.length.toString().padStart(2, '0')}, {project.category}</p>
              <h2>{project.title}</h2>
              <p className="print-project-summary">{project.summary}</p>
              <dl className="print-project-facts">
                <div><dt>PERIOD</dt><dd>{project.period}</dd></div>
                <div><dt>ROLE</dt><dd>{project.role}</dd></div>
                <div><dt>TEAM</dt><dd>{project.team}</dd></div>
              </dl>
            </div>

            {project.images && <div className="print-project-images">{project.images.map((image) => <figure key={image.id}><img src={image.src} alt="" /><figcaption>{image.caption}</figcaption></figure>)}</div>}

            <div className="print-case-study">
              {printSections(project).map((section, sectionIndex) => <div key={section.code}><span>{formatProjectNumber(sectionIndex)} / {section.code}</span><h3>{section.title}</h3>{section.content}</div>)}
            </div>

            <div className="print-project-footer">
              <div><span>TECHNOLOGY</span><p>{project.stack.join(', ')}</p></div>
              {(project.youtube || project.links) && <div><span>LINKS</span><p>
                {project.youtube && <a href={project.youtube} target="_blank" rel="noreferrer">YouTube, {project.youtube}</a>}
                {project.youtube && project.links && ', '}
                {project.links?.map((link, linkIndex) => <span key={link.id}>{linkIndex > 0 && ', '}<a href={link.href} target="_blank" rel="noreferrer">{link.label}, {link.href}</a></span>)}
              </p></div>}
            </div>
          </article>
        ))}
      </section></>}

      <footer className="print-footer">{content.print.footer}</footer>
    </article>
  )
}

// 브라우저는 인쇄 저장 시 document.title을 파일명 기본값으로 쓴다.
const PRINT_TITLES: Record<PdfVariant, string> = {
  summary: '김세현_포트폴리오_요약',
  full: '김세현_포트폴리오_전체',
  projects: '김세현_포트폴리오_프로젝트',
}

const EDITOR_ENABLED = import.meta.env.DEV

if (import.meta.hot) {
  import.meta.hot.accept('./content/default-content', (updatedModule) => {
    if (updatedModule) window.dispatchEvent(new CustomEvent('content-file-updated', { detail: updatedModule.defaultContent }))
  })
}

function isEditRequested() {
  if (!EDITOR_ENABLED) return false
  if (new URLSearchParams(window.location.search).get('edit') === '1') return true
  const hashQuery = window.location.hash.indexOf('?')
  if (hashQuery === -1) return false
  return new URLSearchParams(window.location.hash.slice(hashQuery + 1)).get('edit') === '1'
}

function App() {
  const [content, setContent] = useState(createDefaultContent)
  const contentRef = useRef(content)
  const [route, setRoute] = useState(getRoute())
  const [printVariant, setPrintVariant] = useState<PdfVariant | null>(null)
  const [editMode, setEditMode] = useState(isEditRequested)
  const [saveState, setSaveState] = useState<EditorSaveState>({ status: 'saved', savedAt: null })
  const [saveRequest, setSaveRequest] = useState(0)
  const contentRevisionRef = useRef(0)
  const lastSavedRevisionRef = useRef(0)
  const saveInFlightRef = useRef(false)
  const saveTimerRef = useRef<number | null>(null)
  const documentTitleRef = useRef('')

  const updateContent: ContentUpdater = (updater) => {
    const next = updater(contentRef.current)
    contentRef.current = next
    setContent(next)
    setSaveState((current) => ({ status: 'saving', savedAt: current.savedAt }))
    contentRevisionRef.current += 1
    setSaveRequest((request) => request + 1)
  }

  useEffect(() => {
    if (!EDITOR_ENABLED) return
    const updateFromContentFile = (event: Event) => {
      const nextContent = (event as CustomEvent<PortfolioContent>).detail
      if (!nextContent || contentRevisionRef.current !== lastSavedRevisionRef.current) return
      if (JSON.stringify(nextContent) === JSON.stringify(contentRef.current)) return
      contentRef.current = nextContent
      setContent(nextContent)
      setSaveState({ status: 'saved', savedAt: null })
    }

    window.addEventListener('content-file-updated', updateFromContentFile)
    return () => window.removeEventListener('content-file-updated', updateFromContentFile)
  }, [])

  useEffect(() => {
    if (!EDITOR_ENABLED || saveRequest === 0) return
    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current)

    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null
      if (saveInFlightRef.current) return

      const revision = contentRevisionRef.current
      if (revision <= lastSavedRevisionRef.current) return
      const snapshot = contentRef.current
      saveInFlightRef.current = true
      setSaveState((current) => ({ status: 'saving', savedAt: current.savedAt }))

      void saveContent(snapshot).then((result) => {
        if (revision !== contentRevisionRef.current) return
        lastSavedRevisionRef.current = revision
        setSaveState({ status: 'saved', savedAt: result.savedAt })
      }).catch((error) => {
        if (revision !== contentRevisionRef.current) return
        setSaveState((current) => ({
          status: 'error',
          savedAt: current.savedAt,
          error: error instanceof Error ? error.message : '알 수 없는 오류',
        }))
      }).finally(() => {
        saveInFlightRef.current = false
        if (contentRevisionRef.current > revision) setSaveRequest((request) => request + 1)
      })
    }, 300)

    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }
    }
  }, [saveRequest])

  useEffect(() => {
    const update = () => { commitActiveEditable(); setRoute(getRoute()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])

  useEffect(() => {
    if (!EDITOR_ENABLED) return
    const toggleEditor = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'e') {
        event.preventDefault()
        commitActiveEditable()
        setEditMode((enabled) => !enabled)
      }
    }
    window.addEventListener('keydown', toggleEditor)
    return () => window.removeEventListener('keydown', toggleEditor)
  }, [])

  useEffect(() => {
    const finishPrint = () => {
      document.body.classList.remove('is-printing')
      if (documentTitleRef.current) {
        document.title = documentTitleRef.current
        documentTitleRef.current = ''
      }
      setPrintVariant(null)
    }
    window.addEventListener('afterprint', finishPrint)
    return () => window.removeEventListener('afterprint', finishPrint)
  }, [])

  const downloadPdf = (variant: PdfVariant) => {
    commitActiveEditable()
    document.body.classList.add('is-printing')
    documentTitleRef.current = document.title
    document.title = PRINT_TITLES[variant]
    setPrintVariant(variant)
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

  const retrySave = () => {
    commitActiveEditable()
    if (contentRevisionRef.current <= lastSavedRevisionRef.current) return
    setSaveState((current) => ({ status: 'saving', savedAt: current.savedAt }))
    setSaveRequest((request) => request + 1)
  }

  let page
  if (route[0] === 'project' && route[1]) {
    const project = content.projects.find((item) => item.slug === route[1])
    page = project
      ? <ProjectPage project={project} content={content} updateContent={updateContent} onDownload={downloadPdf} />
      : <ProjectsPage content={content} updateContent={updateContent} onDownload={downloadPdf} />
  } else if (route[0] === 'projects') {
    page = <ProjectsPage content={content} updateContent={updateContent} onDownload={downloadPdf} />
  } else {
    page = <Home content={content} updateContent={updateContent} onDownload={downloadPdf} />
  }

  return (
    <EditorModeProvider enabled={editMode}>
      {EDITOR_ENABLED && editMode && <EditorToolbar saveState={saveState} onRetry={retrySave} onExit={() => setEditMode(false)} />}
      <div className="screen-app"><a className="skip-link" href="#main">본문으로 건너뛰기</a>{page}<footer><p>© 2026 김세현 / KIM SAEHYEON</p><p>REAL-TIME 3D ENGINEER, SEOUL</p><a href="#/">HOME ↑</a></footer></div>
      {printVariant && <PrintPortfolio content={content} variant={printVariant} />}
    </EditorModeProvider>
  )
}

export default App
