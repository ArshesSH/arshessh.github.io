import { createElement, Fragment, type ReactNode } from 'react'

export function EditorModeProvider({ children }: { enabled: boolean; children: ReactNode }) {
  return createElement(Fragment, null, children)
}

export function useEditorMode() {
  return false
}

export function commitActiveEditable() {}

type EditableTag = 'p' | 'span' | 'small' | 'strong' | 'em' | 'h1' | 'h2' | 'h3' | 'h4' | 'dd' | 'dt' | 'li' | 'code' | 'figcaption'

interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  as?: EditableTag
  className?: string
  multiline?: boolean
  ariaLabel?: string
}

function renderText(value: string, multiline: boolean): ReactNode {
  if (!multiline || !value.includes('\n')) return value
  return value.split('\n').map((line, index) => index === 0 ? line : createElement(Fragment, { key: index }, createElement('br'), line))
}

export function EditableText({ value, as = 'span', className, multiline }: EditableTextProps) {
  return createElement(as, { className }, renderText(value, multiline ?? false))
}

interface EditorToolbarProps {
  saveState: unknown
  onRetry: () => void
  onExit: () => void
}

export function EditorToolbar(_props: EditorToolbarProps) {
  return null
}
