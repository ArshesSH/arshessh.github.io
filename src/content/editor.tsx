import { createContext, createElement, useContext, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react'
import { renderProse } from './prose'
import './editor.css'

const EditorModeContext = createContext(false)

export function EditorModeProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  return <EditorModeContext.Provider value={enabled}>{children}</EditorModeContext.Provider>
}

export function useEditorMode() {
  return useContext(EditorModeContext)
}

export function commitActiveEditable() {
  const active = document.activeElement
  if (active instanceof HTMLElement && active.isContentEditable) active.blur()
}

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

export function EditableText({ value, onChange, as = 'span', className, multiline = false, indent = false, ariaLabel }: EditableTextProps) {
  const enabled = useContext(EditorModeContext)
  if (!enabled) return createElement(as, { className }, renderProse(value, multiline, indent))

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    const nextValue = multiline ? event.currentTarget.innerText : event.currentTarget.textContent
    if (nextValue !== null && nextValue !== value) onChange(nextValue)
  }

  return createElement(as, {
    key: multiline ? value : undefined,
    className: className ? `${className} editable-inline` : 'editable-inline',
    contentEditable: true,
    suppressContentEditableWarning: true,
    role: 'textbox',
    'aria-label': ariaLabel,
    spellCheck: true,
    onBlur: handleBlur,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (!multiline && event.key === 'Enter') {
        event.preventDefault()
        event.currentTarget.blur()
      }
    },
  }, renderProse(value, multiline, indent))
}

export interface EditorSaveState {
  status: 'saving' | 'saved' | 'error'
  savedAt: string | null
  error?: string
}

interface EditorToolbarProps {
  saveState: EditorSaveState
  onRetry: () => void
  onExit: () => void
}

function formatSavedAt(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('ko-KR')
}

function getSaveStatus(saveState: EditorSaveState) {
  if (saveState.status === 'saving') return '저장 중'
  if (saveState.status === 'error') return `저장 실패${saveState.error ? `: ${saveState.error}` : ''}`
  const savedAt = formatSavedAt(saveState.savedAt)
  return savedAt ? `저장됨 · ${savedAt}` : '저장됨'
}

export function EditorToolbar({ saveState, onRetry, onExit }: EditorToolbarProps) {
  return (
    <aside className="editor-toolbar" aria-label="콘텐츠 편집 도구">
      <div className="editor-toolbar-heading">
        <strong>CONTENT EDITOR</strong>
        <span>본문을 클릭해 인라인으로 편집합니다.</span>
      </div>
      <div className="editor-toolbar-actions">
        <button className="editor-toolbar-exit" type="button" onMouseDown={commitActiveEditable} onClick={onExit}>편집 종료</button>
      </div>
      <p className="editor-toolbar-status" aria-live="polite">
        <span>{getSaveStatus(saveState)}</span>
        {saveState.status === 'error' && <><span> </span><button type="button" onMouseDown={commitActiveEditable} onClick={onRetry}>다시 시도</button></>}
      </p>
    </aside>
  )
}
