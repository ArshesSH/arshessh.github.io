import type { ReactNode } from 'react'
import { EditableText } from './content/editor'
import type { DiagramSpec, TreeNode } from './content/diagram-types'

export type { DiagramSpec, TreeNode } from './content/diagram-types'

type DiagramUpdater = (spec: DiagramSpec) => void

function noop() {}

function FlowDiagram({ spec, onChange }: { spec: Extract<DiagramSpec, { kind: 'flow' }>; onChange?: DiagramUpdater }) {
  return (
    <ol className="dg-flow">
      {spec.steps.map((step, index) => (
        <li key={index}>
          <EditableText as="strong" value={step.label} onChange={(value) => onChange?.({ ...spec, steps: spec.steps.map((item, itemIndex) => itemIndex === index ? { ...item, label: value } : item) })} ariaLabel="다이어그램 단계 제목" />
          {step.sub && <EditableText as="span" value={step.sub} onChange={(value) => onChange?.({ ...spec, steps: spec.steps.map((item, itemIndex) => itemIndex === index ? { ...item, sub: value } : item) })} ariaLabel="다이어그램 단계 설명" multiline />}
        </li>
      ))}
    </ol>
  )
}
function updateTreeNode(node: TreeNode, path: number[], transform: (node: TreeNode) => TreeNode): TreeNode {
  if (path.length === 0) return transform(node)
  const [index, ...rest] = path
  return { ...node, children: node.children?.map((child, childIndex) => childIndex === index ? updateTreeNode(child, rest, transform) : child) }
}

function TreeBranch({ node, path, onChange }: { node: TreeNode; path: number[]; onChange?: (path: number[], transform: (node: TreeNode) => TreeNode) => void }) {
  return (
    <li>
      <p>
        <EditableText as="strong" value={node.label} onChange={(value) => onChange?.(path, (item) => ({ ...item, label: value }))} ariaLabel="다이어그램 노드 제목" />
        {node.tag && <EditableText as="em" value={node.tag} onChange={(value) => onChange?.(path, (item) => ({ ...item, tag: value }))} ariaLabel="다이어그램 노드 태그" />}
      </p>
      {node.children && <ul>{node.children.map((child, index) => <TreeBranch node={child} path={[...path, index]} onChange={onChange} key={index} />)}</ul>}
    </li>
  )
}

function TreeDiagram({ spec, onChange }: { spec: Extract<DiagramSpec, { kind: 'tree' }>; onChange?: DiagramUpdater }) {
  const update = (path: number[], transform: (node: TreeNode) => TreeNode) => onChange?.({ ...spec, root: updateTreeNode(spec.root, path, transform) })
  return <ul className="dg-tree"><TreeBranch node={spec.root} path={[]} onChange={update} /></ul>
}

function SequenceDiagram({ spec, onChange }: { spec: Extract<DiagramSpec, { kind: 'sequence' }>; onChange?: DiagramUpdater }) {
  return (
    <div className="dg-sequence">
      <div className="dg-sequence-lanes">
        <EditableText as="span" value={spec.lanes[0]} onChange={(value) => onChange?.({ ...spec, lanes: [value, spec.lanes[1]] })} ariaLabel="다이어그램 시퀀스 왼쪽 레인" />
        <EditableText as="span" value={spec.lanes[1]} onChange={(value) => onChange?.({ ...spec, lanes: [spec.lanes[0], value] })} ariaLabel="다이어그램 시퀀스 오른쪽 레인" />
      </div>
      <ol>
        {spec.messages.map((message, index) => (
          <li className={message.from === 2 ? 'to-both' : message.from === 0 ? 'to-right' : 'to-left'} key={index}>
            <EditableText as="strong" value={message.label} onChange={(value) => onChange?.({ ...spec, messages: spec.messages.map((item, itemIndex) => itemIndex === index ? { ...item, label: value } : item) })} ariaLabel="다이어그램 메시지" />
            {message.note && <EditableText as="span" value={message.note} onChange={(value) => onChange?.({ ...spec, messages: spec.messages.map((item, itemIndex) => itemIndex === index ? { ...item, note: value } : item) })} ariaLabel="다이어그램 메시지 설명" multiline />}
          </li>
        ))}
      </ol>
    </div>
  )
}

function BarsDiagram({ spec, onChange }: { spec: Extract<DiagramSpec, { kind: 'bars' }>; onChange?: DiagramUpdater }) {
  const max = Math.max(...spec.items.map((item) => item.value))
  return (
    <ol className="dg-bars">
      {spec.items.map((item, index) => (
        <li key={index}>
          <EditableText as="p" value={item.label} onChange={(value) => onChange?.({ ...spec, items: spec.items.map((candidate, itemIndex) => itemIndex === index ? { ...candidate, label: value } : candidate) })} ariaLabel="다이어그램 막대 항목" />
          <div><span style={{ width: Math.max((item.value / max) * 100, 2) + '%' }} /><b>{item.value}{spec.unit}</b></div>
          {item.note && <EditableText as="small" value={item.note} onChange={(value) => onChange?.({ ...spec, items: spec.items.map((candidate, itemIndex) => itemIndex === index ? { ...candidate, note: value } : candidate) })} ariaLabel="다이어그램 막대 설명" multiline />}
        </li>
      ))}
    </ol>
  )
}

function SplitDiagram({ spec, onChange }: { spec: Extract<DiagramSpec, { kind: 'split' }>; onChange?: DiagramUpdater }) {
  return (
    <div className="dg-split">
      {[spec.before, spec.after].map((side, sideIndex) => (
        <section className={sideIndex === 0 ? 'is-before' : 'is-after'} key={sideIndex}>
          <EditableText as="h4" value={side.title} onChange={(value) => onChange?.({ ...spec, [sideIndex === 0 ? 'before' : 'after']: { ...side, title: value } })} ariaLabel="다이어그램 비교 제목" />
          <ul>{side.items.map((item, itemIndex) => <li key={itemIndex}><EditableText as="span" value={item} onChange={(value) => onChange?.({ ...spec, [sideIndex === 0 ? 'before' : 'after']: { ...side, items: side.items.map((candidate, index) => index === itemIndex ? value : candidate) } })} ariaLabel="다이어그램 비교 항목" multiline /></li>)}</ul>
        </section>
      ))}
    </div>
  )
}

function LayersDiagram({ spec, onChange }: { spec: Extract<DiagramSpec, { kind: 'layers' }>; onChange?: DiagramUpdater }) {
  return (
    <ol className="dg-layers">
      {spec.layers.map((layer, index) => (
        <li key={index}>
          <EditableText as="strong" value={layer.label} onChange={(value) => onChange?.({ ...spec, layers: spec.layers.map((item, itemIndex) => itemIndex === index ? { ...item, label: value } : item) })} ariaLabel="다이어그램 레이어 제목" />
          {layer.sub && <EditableText as="span" value={layer.sub} onChange={(value) => onChange?.({ ...spec, layers: spec.layers.map((item, itemIndex) => itemIndex === index ? { ...item, sub: value } : item) })} ariaLabel="다이어그램 레이어 설명" multiline />}
        </li>
      ))}
    </ol>
  )
}

export function Diagram({ spec, caption, onCaptionChange, onSpecChange }: { spec: DiagramSpec; caption: string; onCaptionChange?: (value: string) => void; onSpecChange?: DiagramUpdater }) {
  let body: ReactNode = null
  if (spec.kind === 'flow') body = <FlowDiagram spec={spec} onChange={onSpecChange} />
  else if (spec.kind === 'tree') body = <TreeDiagram spec={spec} onChange={onSpecChange} />
  else if (spec.kind === 'sequence') body = <SequenceDiagram spec={spec} onChange={onSpecChange} />
  else if (spec.kind === 'bars') body = <BarsDiagram spec={spec} onChange={onSpecChange} />
  else if (spec.kind === 'split') body = <SplitDiagram spec={spec} onChange={onSpecChange} />
  else if (spec.kind === 'layers') body = <LayersDiagram spec={spec} onChange={onSpecChange} />
  return (
    <figure className="dg-figure">
      <div className="dg-body">{body}</div>
      <EditableText as="figcaption" value={caption} onChange={onCaptionChange ?? noop} ariaLabel="다이어그램 캡션" multiline />
    </figure>
  )
}
