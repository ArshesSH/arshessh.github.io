import { createElement, Fragment, type ReactNode } from 'react'
import { renderProse } from './prose'

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
  indent?: boolean
  ariaLabel?: string
}

export function EditableText({ value, as = 'span', className, multiline, indent = false }: EditableTextProps) {
  return createElement(as, { className }, renderProse(value, multiline ?? false, indent))
}

interface EditorToolbarProps {
  saveState: unknown
  onRetry: () => void
  onExit: () => void
}

export function EditorToolbar(_props: EditorToolbarProps) {
  return null
}
