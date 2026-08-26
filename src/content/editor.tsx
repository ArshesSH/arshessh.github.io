import { createContext, createElement, Fragment, useContext, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react'
import { CONTENT_VERSION, type ContentDraft, type PortfolioContent } from './types'
import { explainContentImport, parseContentImport } from './review-storage'

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
  ariaLabel?: string
}

function renderText(value: string, multiline: boolean): ReactNode {
  if (!multiline || !value.includes('\n')) return value
  return value.split('\n').map((line, index) => index === 0 ? line : createElement(Fragment, { key: index }, createElement('br'), line))
}

export function EditableText({ value, onChange, as = 'span', className, multiline = false, ariaLabel }: EditableTextProps) {
  const enabled = useContext(EditorModeContext)
  if (!enabled) return createElement(as, { className }, renderText(value, multiline))

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
  }, renderText(value, multiline))
}

interface EditorToolbarProps {
  getLatestContent: () => PortfolioContent
  dirty: boolean
  draftExists: boolean
  savedAt: string | null
  onSave: () => boolean
  onImport: (content: PortfolioContent, updatedAt?: string) => void
  onReset: () => void
  onExit: () => void
}

type SaveState = 'not-saved' | 'needs-save' | 'saved'

const saveButtonLabels: Record<SaveState, string> = {
  'not-saved': '저장',
  'needs-save': '저장 필요',
  saved: '저장됨',
}

function getSaveState(dirty: boolean, draftExists: boolean): SaveState {
  if (dirty) return 'needs-save'
  return draftExists ? 'saved' : 'not-saved'
}

function formatSavedAt(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `마지막 저장 ${date.toLocaleString('ko-KR')}`
}

function getSaveStatus(state: SaveState, savedAt: string | null) {
  if (state === 'not-saved') return '아직 저장하지 않았습니다.'

  const lastSaved = formatSavedAt(savedAt)
  if (state === 'needs-save') {
    return lastSaved ? `저장하지 않은 변경사항이 있습니다. ${lastSaved}` : '저장하지 않은 변경사항이 있습니다.'
  }
  return lastSaved ? `저장된 초안을 사용 중입니다. ${lastSaved}` : '저장된 초안을 사용 중입니다.'
}

export function EditorToolbar({ getLatestContent, dirty, draftExists, savedAt, onSave, onImport, onReset, onExit }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const saveState = getSaveState(dirty, draftExists)
  const saveStatus = getSaveStatus(saveState, draftExists ? savedAt : null)

  const save = () => {
    commitActiveEditable()
    setMessage(onSave() ? '브라우저에 저장했습니다.' : '브라우저 저장에 실패했습니다.')
  }

  const exportJson = () => {
    commitActiveEditable()
    const draft: ContentDraft = { version: CONTENT_VERSION, updatedAt: new Date().toISOString(), content: getLatestContent() }
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kim-saehyeon-portfolio-content-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setMessage('JSON 파일을 내보냈습니다.')
  }

  const importJson = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text())
      const imported = parseContentImport(parsed)
      if (!imported) {
        const errors = explainContentImport(parsed)
        setMessage(`불러오지 못했습니다. ${errors.slice(0, 2).join(' ')}`)
        return
      }
      onImport(imported.content, imported.updatedAt)
      setMessage('JSON 콘텐츠를 불러왔습니다. 저장 버튼으로 브라우저에도 보관하세요.')
    } catch {
      setMessage('JSON 파일을 읽지 못했습니다.')
    }
  }

  return (
    <aside className="editor-toolbar" aria-label="콘텐츠 편집 도구">
      <div className="editor-toolbar-heading">
        <strong>CONTENT EDITOR</strong>
        <span>본문을 클릭해 인라인으로 편집합니다.</span>
      </div>
      <div className="editor-toolbar-actions">
        <button type="button" onMouseDown={commitActiveEditable} onClick={save}>{saveButtonLabels[saveState]}</button>
        <button type="button" onMouseDown={commitActiveEditable} onClick={exportJson}>JSON 내보내기</button>
        <button type="button" onMouseDown={commitActiveEditable} onClick={() => fileInputRef.current?.click()}>JSON 불러오기</button>
        <button type="button" onMouseDown={commitActiveEditable} onClick={() => {
          if (window.confirm('현재 편집 내용을 기본 콘텐츠로 되돌리겠습니까?')) {
            onReset()
            setMessage('')
          }
        }}>기본값 복원</button>
        <button className="editor-toolbar-exit" type="button" onMouseDown={commitActiveEditable} onClick={onExit}>편집 종료</button>
        <input ref={fileInputRef} type="file" accept="application/json,.json" hidden onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) void importJson(file)
        }} />
      </div>
      <p className="editor-toolbar-status" aria-live="polite">
        {message ? `${message} ` : ''}{saveStatus}
      </p>
    </aside>
  )
}
