import type { DiagramSpec, TreeNode } from '../diagrams'
import type { PortfolioContent } from './types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isYoutubeUrl(value: unknown): value is string {
  if (!isHttpUrl(value)) return false
  const hostname = new URL(value).hostname
  return ['youtu.be', 'youtube.com', 'www.youtube.com'].includes(hostname)
}

function isMediaPath(value: unknown): value is string {
  if (typeof value !== 'string') return false
  if (/^\/portfolio-media\/[\w./-]+$/.test(value)) return true
  return isHttpUrl(value)
}

function isEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isTreeNode(value: unknown): value is TreeNode {
  if (!isRecord(value) || !isNonEmptyString(value.label)) return false
  if (value.tag !== undefined && typeof value.tag !== 'string') return false
  if (value.children !== undefined && (!Array.isArray(value.children) || !value.children.every(isTreeNode))) return false
  return true
}

function isDiagramSpec(value: unknown): value is DiagramSpec {
  if (!isRecord(value) || typeof value.kind !== 'string') return false

  if (value.kind === 'flow' || value.kind === 'layers') {
    const items = value.kind === 'flow' ? value.steps : value.layers
    return Array.isArray(items) && items.length > 0 && items.every((item) => isRecord(item) && isNonEmptyString(item.label) && (item.sub === undefined || typeof item.sub === 'string'))
  }
  if (value.kind === 'tree') return isTreeNode(value.root)
  if (value.kind === 'sequence') {
    return Array.isArray(value.lanes) && value.lanes.length === 2 && value.lanes.every(isNonEmptyString)
      && Array.isArray(value.messages) && value.messages.length > 0
      && value.messages.every((message) => isRecord(message) && (message.from === 0 || message.from === 1) && isNonEmptyString(message.label) && (message.note === undefined || typeof message.note === 'string'))
  }
  if (value.kind === 'bars') {
    return isNonEmptyString(value.unit) && Array.isArray(value.items) && value.items.length > 0
      && value.items.every((item) => isRecord(item) && isNonEmptyString(item.label) && typeof item.value === 'number' && Number.isFinite(item.value) && item.value >= 0 && (item.note === undefined || typeof item.note === 'string'))
  }
  if (value.kind === 'split') {
    const isSide = (side: unknown) => isRecord(side) && isNonEmptyString(side.title) && Array.isArray(side.items) && side.items.length > 0 && side.items.every(isNonEmptyString)
    return isSide(value.before) && isSide(value.after)
  }
  return false
}

export function validateContent(value: unknown): ValidationResult {
  const errors: string[] = []
  const ids = new Set<string>()
  const slugs = new Set<string>()

  const addId = (candidate: unknown, label: string) => {
    if (!isNonEmptyString(candidate)) {
      errors.push(`${label}에 id가 없습니다.`)
      return
    }
    if (ids.has(candidate)) errors.push(`중복 id: ${candidate}`)
    ids.add(candidate)
  }

  const checkTextItem = (valueToCheck: unknown, label: string) => {
    if (!isRecord(valueToCheck)) {
      errors.push(`${label} 항목이 올바르지 않습니다.`)
      return
    }
    addId(valueToCheck.id, label)
    if (!isNonEmptyString(valueToCheck.text)) errors.push(`${label}의 본문이 비어 있습니다.`)
  }

  const checkBuildItem = (valueToCheck: unknown, label: string) => {
    if (!isRecord(valueToCheck)) {
      errors.push(`${label} 항목이 올바르지 않습니다.`)
      return
    }
    addId(valueToCheck.id, label)
    if (!isNonEmptyString(valueToCheck.label) || !isNonEmptyString(valueToCheck.body)) errors.push(`${label}의 이름 또는 본문이 비어 있습니다.`)
    if (valueToCheck.diagram !== undefined && (!isRecord(valueToCheck.diagram) || !isDiagramSpec(valueToCheck.diagram.spec) || !isNonEmptyString(valueToCheck.diagram.caption))) errors.push(`${label}의 다이어그램이 올바르지 않습니다.`)
    if (valueToCheck.media !== undefined) {
      if (!isRecord(valueToCheck.media) || !['image', 'video', 'youtube'].includes(String(valueToCheck.media.kind)) || !isMediaPath(valueToCheck.media.src) || !isNonEmptyString(valueToCheck.media.caption)) errors.push(`${label}의 미디어가 올바르지 않습니다.`)
      if (isRecord(valueToCheck.media) && valueToCheck.media.kind === 'youtube' && !isYoutubeUrl(valueToCheck.media.src)) errors.push(`${label}의 YouTube 미디어 주소가 올바르지 않습니다.`)
    }
    if (valueToCheck.code !== undefined && (!isRecord(valueToCheck.code) || !isNonEmptyString(valueToCheck.code.label) || !isNonEmptyString(valueToCheck.code.lang) || !isNonEmptyString(valueToCheck.code.source) || (valueToCheck.code.pseudo !== undefined && typeof valueToCheck.code.pseudo !== 'boolean'))) errors.push(`${label}의 코드 블록이 올바르지 않습니다.`)
  }

  if (!isRecord(value)) return { valid: false, errors: ['콘텐츠가 객체가 아닙니다.'] }

  const header = isRecord(value.header) ? value.header : null
  if (!header) errors.push('header가 없습니다.')
  else ['summaryPdfTitle', 'fullPdfTitle'].forEach((key) => {
    if (!isNonEmptyString(header[key])) errors.push(`header.${key}가 비어 있습니다.`)
  })

  const hero = isRecord(value.hero) ? value.hero : null
  if (!hero) errors.push('hero가 없습니다.')
  else ['eyebrow', 'kicker', 'titleLead', 'titleAccent', 'titleTail', 'descriptionLead', 'descriptionAccent', 'descriptionTail'].forEach((key) => {
    if (!isNonEmptyString(hero[key])) errors.push(`hero.${key}가 비어 있습니다.`)
  })

  const profile = isRecord(value.profile) ? value.profile : null
  if (!profile) errors.push('profile이 없습니다.')
  else {
    ;['headingLead', 'headingTail', 'description', 'personalLabTitle', 'personalLabBody'].forEach((key) => {
      if (!isNonEmptyString(profile[key])) errors.push(`profile.${key}가 비어 있습니다.`)
    })
    if (!Array.isArray(profile.statements) || profile.statements.length === 0) errors.push('프로필 본문 목록이 비어 있습니다.')
    else profile.statements.forEach((item, index) => checkTextItem(item, `프로필 본문 ${index + 1}`))
  }

  const archive = isRecord(value.archive) ? value.archive : null
  if (!archive) errors.push('archive가 없습니다.')
  else ['heading', 'description', 'intro', 'companyHeading', 'companyDescription', 'personalHeading', 'personalDescription'].forEach((key) => {
    if (!isNonEmptyString(archive[key])) errors.push(`archive.${key}가 비어 있습니다.`)
  })

  if (!Array.isArray(value.projects) || value.projects.length === 0) errors.push('프로젝트 목록이 비어 있습니다.')
  else value.projects.forEach((project, index) => {
    const label = `프로젝트 ${index + 1}`
    if (!isRecord(project)) {
      errors.push(`${label}가 올바르지 않습니다.`)
      return
    }
    addId(project.id, label)
    if (!isNonEmptyString(project.slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) errors.push(`${label}의 slug가 올바르지 않습니다.`)
    else if (slugs.has(project.slug)) errors.push(`중복 slug: ${project.slug}`)
    else slugs.add(project.slug)
    if (!['company', 'personal'].includes(String(project.group))) errors.push(`${label}의 group이 올바르지 않습니다.`)
    ;['category', 'period', 'title', 'shortTitle', 'summary', 'role', 'team', 'context'].forEach((key) => {
      if (!isNonEmptyString(project[key])) errors.push(`${label}.${key}가 비어 있습니다.`)
    })
    if (!Array.isArray(project.stack) || project.stack.length === 0 || !project.stack.every(isNonEmptyString)) errors.push(`${label}의 기술 스택이 올바르지 않습니다.`)
    if (!Array.isArray(project.builds) || project.builds.length === 0) errors.push(`${label}의 만든 것 목록이 비어 있습니다.`)
    else project.builds.forEach((item, itemIndex) => checkBuildItem(item, `${label} 만든 것 ${itemIndex + 1}`))
    if (project.youtube !== undefined && project.youtube !== null && !isYoutubeUrl(project.youtube)) errors.push(`${label}의 YouTube 링크가 올바르지 않습니다.`)
    if (project.links !== undefined) {
      if (!Array.isArray(project.links)) errors.push(`${label}의 링크 목록이 올바르지 않습니다.`)
      else project.links.forEach((link, linkIndex) => {
        const linkLabel = `${label} 링크 ${linkIndex + 1}`
        if (!isRecord(link)) {
          errors.push(`${linkLabel}가 올바르지 않습니다.`)
          return
        }
        addId(link.id, linkLabel)
        if (!isNonEmptyString(link.label) || !isHttpUrl(link.href)) errors.push(`${linkLabel}의 이름 또는 주소가 올바르지 않습니다.`)
      })
    }
    if (project.images !== undefined) {
      if (!Array.isArray(project.images)) errors.push(`${label}의 이미지 목록이 올바르지 않습니다.`)
      else project.images.forEach((image, imageIndex) => {
        const imageLabel = `${label} 이미지 ${imageIndex + 1}`
        if (!isRecord(image)) {
          errors.push(`${imageLabel}가 올바르지 않습니다.`)
          return
        }
        addId(image.id, imageLabel)
        if (!isMediaPath(image.src) || !isNonEmptyString(image.caption)) errors.push(`${imageLabel}의 경로 또는 캡션이 올바르지 않습니다.`)
      })
    }
  })

  const experience = value.experience
  if (!Array.isArray(experience)) errors.push('경력 목록이 없습니다.')
  else experience.forEach((item, index) => {
    const label = `경력 ${index + 1}`
    if (!isRecord(item)) {
      errors.push(`${label}가 올바르지 않습니다.`)
      return
    }
    addId(item.id, label)
    ;['period', 'company', 'role', 'detail'].forEach((key) => { if (!isNonEmptyString(item[key])) errors.push(`${label}.${key}가 비어 있습니다.`) })
  })

  const education = value.education
  if (!Array.isArray(education)) errors.push('학력 목록이 없습니다.')
  else education.forEach((item, index) => {
    const label = `학력 ${index + 1}`
    if (!isRecord(item)) {
      errors.push(`${label}가 올바르지 않습니다.`)
      return
    }
    addId(item.id, label)
    ;['period', 'school', 'detail'].forEach((key) => { if (!isNonEmptyString(item[key])) errors.push(`${label}.${key}가 비어 있습니다.`) })
  })

  if (!Array.isArray(value.capabilities) || value.capabilities.length === 0) errors.push('기술 목록이 비어 있습니다.')
  else value.capabilities.forEach((item, index) => checkTextItem(item, `기술 ${index + 1}`))

  const contact = isRecord(value.contact) ? value.contact : null
  if (!contact) errors.push('contact가 없습니다.')
  else {
    if (!isNonEmptyString(contact.heading)) errors.push('contact.heading이 비어 있습니다.')
    if (!isEmail(contact.email)) errors.push('contact.email이 올바르지 않습니다.')
  }

  const print = isRecord(value.print) ? value.print : null
  if (!print) errors.push('print가 없습니다.')
  else {
    ;['coverSummaryFull', 'coverSummarySummary', 'profileHeading', 'projectIndexHeading', 'projectIndexNote', 'footer'].forEach((key) => { if (!isNonEmptyString(print[key])) errors.push(`print.${key}가 비어 있습니다.`) })
    if (!Array.isArray(print.profileStatements) || print.profileStatements.length === 0) errors.push('print.profileStatements가 비어 있습니다.')
    else print.profileStatements.forEach((item, index) => checkTextItem(item, `인쇄 프로필 본문 ${index + 1}`))
  }

  return { valid: errors.length === 0, errors }
}

export function isValidContent(value: unknown): value is PortfolioContent {
  return validateContent(value).valid
}
