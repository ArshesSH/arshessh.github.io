import type { PortfolioContent } from './types'

export interface ContentSaveResult {
  savedAt: string
}

async function getErrorMessage(response: Response) {
  const body = (await response.text()).trim()
  return body ? body.slice(0, 300) : `HTTP ${response.status}`
}

export async function saveContent(content: PortfolioContent): Promise<ContentSaveResult> {
  let response: Response
  try {
    response = await fetch('/__content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    })
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : '개발 서버에 연결할 수 없습니다.')
  }

  if (!response.ok) throw new Error(await getErrorMessage(response))

  try {
    const result: unknown = await response.json()
    if (typeof result === 'object' && result !== null && 'savedAt' in result && typeof result.savedAt === 'string') return { savedAt: result.savedAt }
  } catch {
    // The write succeeded even when the optional response timestamp is unavailable.
  }
  return { savedAt: new Date().toISOString() }
}
