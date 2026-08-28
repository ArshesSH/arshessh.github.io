import { createElement, Fragment, type ReactNode } from 'react'

/**
 * 문단 단위 본문을 렌더한다.
 * indent가 참이면 각 줄을 블록으로 감싸 문단마다 첫 줄 들여쓰기를 적용한다.
 * text-indent는 블록의 첫 줄에만 걸리므로 br로 이어진 한 블록으로는 두 번째 문단부터 들여쓰기가 붙지 않는다.
 */
export function renderProse(value: string, multiline: boolean, indent = false): ReactNode {
  if (!multiline || !value.includes('\n')) return value
  const lines = value.split('\n')
  if (!indent) return lines.map((line, index) => index === 0 ? line : createElement(Fragment, { key: index }, createElement('br'), line))
  return lines.map((line, index) => createElement('span', { key: index, className: 'prose-line' }, line))
}
