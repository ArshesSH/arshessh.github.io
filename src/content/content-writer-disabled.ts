import type { PortfolioContent } from './types'

export interface ContentSaveResult {
  savedAt: string
}

export async function saveContent(_content: PortfolioContent): Promise<ContentSaveResult> {
  throw new Error('콘텐츠 저장은 개발 서버에서만 사용할 수 있습니다.')
}
