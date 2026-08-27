import { isValidContent } from './validation'
import contentJson from './content.json'
import type { PortfolioContent } from './types'

if (!isValidContent(contentJson)) throw new Error('src/content/content.json이 PortfolioContent 스키마를 만족하지 않습니다.')

export const defaultContent: PortfolioContent = contentJson
export const defaultProjects = defaultContent.projects

export function createDefaultContent(): PortfolioContent {
  return structuredClone(defaultContent)
}
