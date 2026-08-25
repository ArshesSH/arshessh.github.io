import { CONTENT_VERSION, type ContentDraft, type PortfolioContent } from './types'
import { isValidContent, validateContent } from './validation'

export const REVIEW_DRAFT_STORAGE_KEY = 'arshessh-portfolio-content-draft-v2'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseDraft(value: unknown): { content: PortfolioContent; updatedAt: string } | null {
  if (!isRecord(value) || value.version !== CONTENT_VERSION || !isRecord(value.content) || typeof value.updatedAt !== 'string' || Number.isNaN(Date.parse(value.updatedAt))) return null
  if (!isValidContent(value.content)) return null
  return { content: value.content, updatedAt: value.updatedAt }
}

export function readReviewDraft(): { content: PortfolioContent; updatedAt: string } | null {
  try {
    const raw = window.localStorage.getItem(REVIEW_DRAFT_STORAGE_KEY)
    return raw ? parseDraft(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function writeReviewDraft(content: PortfolioContent, updatedAt = new Date().toISOString()): boolean {
  try {
    const draft: ContentDraft = { version: CONTENT_VERSION, updatedAt, content }
    window.localStorage.setItem(REVIEW_DRAFT_STORAGE_KEY, JSON.stringify(draft))
    return true
  } catch {
    return false
  }
}

export function clearReviewDraft(): boolean {
  try {
    window.localStorage.removeItem(REVIEW_DRAFT_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

export function parseContentImport(value: unknown): { content: PortfolioContent; updatedAt?: string } | null {
  if (isRecord(value) && value.version === CONTENT_VERSION && 'content' in value) {
    const parsed = parseDraft(value)
    return parsed ? parsed : null
  }
  return isValidContent(value) ? { content: value } : null
}

export function explainContentImport(value: unknown): string[] {
  if (isRecord(value) && value.version === CONTENT_VERSION && 'content' in value) return validateContent(value.content).errors
  return validateContent(value).errors
}
