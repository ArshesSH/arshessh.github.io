import { useId, type CSSProperties, type ReactNode } from 'react'
import { EditableText } from './content/editor'
import type { ClassDiagramClass, ClassDiagramRelation, ClassDiagramSpec, DiagramSpec, SwimlaneDiagramSpec, TreeNode } from './content/diagram-types'

export type { ClassDiagramClass, ClassDiagramRelation, ClassDiagramSpec, DiagramSpec, SwimlaneDiagramSpec, TreeNode } from './content/diagram-types'

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
          <li className={message.from === 2 ? 'to-both' : message.from === 0 ? 'to-right' : 'to-left'} style={{ gridRow: index + 1 }} key={index}>
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

interface DiagramBox {
  x: number
  y: number
  width: number
  height: number
}

const CLASS_NODE_WIDTH = 220
const CLASS_COLUMN_GAP = 76
const CLASS_ROW_GAP = 76
const CLASS_MARGIN_X = 56
const CLASS_MARGIN_Y = 34

function estimatedLineCount(value: string, charactersPerLine: number) {
  return value.split(/\r?\n/).reduce((total, line) => total + Math.max(1, Math.ceil(Array.from(line).length / charactersPerLine)), 0)
}

function getClassNodeHeight(classItem: ClassDiagramClass) {
  const attributes = classItem.attributes?.reduce((total, item) => total + estimatedLineCount(item, 28), 0) ?? 0
  const methods = classItem.methods?.reduce((total, item) => total + estimatedLineCount(item, 28), 0) ?? 0
  const sections = (classItem.attributes?.length ? 1 : 0) + (classItem.methods?.length ? 1 : 0)
  return 58 + attributes * 21 + methods * 21 + sections * 31
}

interface ClassDiagramLayout {
  width: number
  height: number
  nodes: Map<string, DiagramBox>
}

function getClassDiagramLayout(spec: ClassDiagramSpec): ClassDiagramLayout {
  const columns = spec.classes.length <= 3 ? spec.classes.length : Math.min(3, Math.ceil(Math.sqrt(spec.classes.length)))
  const rowHeights: number[] = []
  spec.classes.forEach((classItem, index) => {
    const row = Math.floor(index / columns)
    rowHeights[row] = Math.max(rowHeights[row] ?? 0, getClassNodeHeight(classItem))
  })

  const nodes = new Map<string, DiagramBox>()
  let y = CLASS_MARGIN_Y
  spec.classes.forEach((classItem, index) => {
    const row = Math.floor(index / columns)
    const column = index % columns
    const x = CLASS_MARGIN_X + column * (CLASS_NODE_WIDTH + CLASS_COLUMN_GAP)
    nodes.set(classItem.id, { x, y, width: CLASS_NODE_WIDTH, height: getClassNodeHeight(classItem) })
    if (column === columns - 1 || index === spec.classes.length - 1) y += (rowHeights[row] ?? 0) + CLASS_ROW_GAP
  })

  return {
    width: CLASS_MARGIN_X * 2 + columns * CLASS_NODE_WIDTH + Math.max(columns - 1, 0) * CLASS_COLUMN_GAP,
    height: Math.max(y - CLASS_ROW_GAP + CLASS_MARGIN_Y, CLASS_MARGIN_Y * 2 + 100),
    nodes,
  }
}

function toPercent(value: number, total: number) {
  return `${(value / total) * 100}%`
}

function boxStyle(box: DiagramBox, width: number, height: number): CSSProperties {
  return {
    left: toPercent(box.x, width),
    top: toPercent(box.y, height),
    width: toPercent(box.width, width),
    height: toPercent(box.height, height),
  }
}

function getRectCenter(box: DiagramBox) {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

function getRectEdgePoint(box: DiagramBox, target: { x: number; y: number }) {
  const center = getRectCenter(box)
  const dx = target.x - center.x
  const dy = target.y - center.y
  if (dx === 0 && dy === 0) return center
  const scale = 1 / Math.max(Math.abs(dx) / (box.width / 2), Math.abs(dy) / (box.height / 2))
  return { x: center.x + dx * scale, y: center.y + dy * scale }
}

interface ClassRelationVisual {
  d: string
  labelAnchorX: number
  labelAnchorY: number
  labelX: number
  labelY: number
}

interface ClassLabelRect {
  x: number
  y: number
  width: number
  height: number
}

function estimateClassLabelRect(label: string, center: { x: number; y: number }, layout: ClassDiagramLayout): ClassLabelRect {
  const estimatedWidth = Array.from(label).reduce((total, character) => {
    if (character === ' ') return total + 4
    return total + ((character.codePointAt(0) ?? 0) > 0x3000 ? 9 : 7)
  }, 16)
  const width = Math.min(layout.width * .24, Math.max(44, estimatedWidth))
  const lines = Math.max(1, Math.ceil(estimatedWidth / width))
  const height = 22 + (lines - 1) * 14
  return { x: center.x - width / 2, y: center.y - height / 2, width, height }
}

function inflateClassRect(rect: ClassLabelRect, amount: number): ClassLabelRect {
  return { x: rect.x - amount, y: rect.y - amount, width: rect.width + amount * 2, height: rect.height + amount * 2 }
}

function classRectsOverlap(first: ClassLabelRect, second: ClassLabelRect) {
  return first.x < second.x + second.width && first.x + first.width > second.x
    && first.y < second.y + second.height && first.y + first.height > second.y
}

function classRectIntersectionArea(first: ClassLabelRect, second: ClassLabelRect) {
  const width = Math.max(0, Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x))
  const height = Math.max(0, Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y))
  return width * height
}

function isClassLabelPlacementAvailable(rect: ClassLabelRect, layout: ClassDiagramLayout, occupiedLabels: ClassLabelRect[]) {
  const canvasPadding = 8
  if (rect.x < canvasPadding || rect.y < canvasPadding || rect.x + rect.width > layout.width - canvasPadding || rect.y + rect.height > layout.height - canvasPadding) return false
  return [...layout.nodes.values()].every((node) => !classRectsOverlap(inflateClassRect(node, 12), rect))
    && occupiedLabels.every((occupiedLabel) => !classRectsOverlap(inflateClassRect(occupiedLabel, 6), rect))
}

function getClassLabelPosition(label: string | undefined, base: { x: number; y: number }, layout: ClassDiagramLayout, occupiedLabels: ClassLabelRect[]) {
  if (!label) return base

  const distances = [24, 48, 80, 116, 160, 208]
  const candidates = [base]

  distances.forEach((distance) => {
    candidates.push({ x: base.x + distance, y: base.y }, { x: base.x - distance, y: base.y }, { x: base.x, y: base.y + distance }, { x: base.x, y: base.y - distance })
    ;[.25, .5, 1].forEach((ratio) => {
      const offset = distance * ratio
      candidates.push(
        { x: base.x + distance, y: base.y + offset },
        { x: base.x + distance, y: base.y - offset },
        { x: base.x - distance, y: base.y + offset },
        { x: base.x - distance, y: base.y - offset },
        { x: base.x + offset, y: base.y + distance },
        { x: base.x + offset, y: base.y - distance },
        { x: base.x - offset, y: base.y + distance },
        { x: base.x - offset, y: base.y - distance },
      )
    })
  })

  const candidateRects = candidates.map((candidate) => ({ candidate, rect: estimateClassLabelRect(label, candidate, layout) }))
  const placement = candidateRects.find(({ rect }) => isClassLabelPlacementAvailable(rect, layout, occupiedLabels))
  if (placement) return placement.candidate

  const fallback = candidateRects
    .filter(({ rect }) => rect.x >= 8 && rect.y >= 8 && rect.x + rect.width <= layout.width - 8 && rect.y + rect.height <= layout.height - 8)
    .map(({ candidate, rect }) => {
      const nodeOverlap = [...layout.nodes.values()].reduce((total, node) => total + classRectIntersectionArea(inflateClassRect(node, 12), rect), 0)
      const labelOverlap = occupiedLabels.reduce((total, occupiedLabel) => total + classRectIntersectionArea(inflateClassRect(occupiedLabel, 6), rect), 0)
      return { candidate, score: nodeOverlap * 10 + labelOverlap }
    })
    .sort((first, second) => first.score - second.score)[0]
  return fallback?.candidate ?? base
}

function getClassRelationVisual(relation: ClassDiagramRelation, layout: ClassDiagramLayout, occupiedLabels: ClassLabelRect[] = []): ClassRelationVisual | null {
  const from = layout.nodes.get(relation.from)
  const to = layout.nodes.get(relation.to)
  if (!from || !to) return null

  if (relation.from === relation.to) {
    const startX = from.x + from.width
    const startY = from.y + from.height * .35
    const loopWidth = 46
    const loopHeight = Math.max(32, from.height * .2)
    const base = { x: startX + loopWidth * .62, y: startY + loopHeight / 2 }
    const labelPosition = getClassLabelPosition(relation.label, base, layout, occupiedLabels)
    return {
      d: `M ${startX} ${startY} C ${startX + loopWidth} ${startY}, ${startX + loopWidth} ${startY + loopHeight}, ${startX} ${startY + loopHeight}`,
      labelAnchorX: base.x,
      labelAnchorY: base.y,
      labelX: labelPosition.x,
      labelY: labelPosition.y,
    }
  }

  const fromCenter = getRectCenter(from)
  const toCenter = getRectCenter(to)
  const start = getRectEdgePoint(from, toCenter)
  const end = getRectEdgePoint(to, fromCenter)
  const base = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }
  const labelPosition = getClassLabelPosition(relation.label, base, layout, occupiedLabels)
  return {
    d: `M ${start.x} ${start.y} L ${end.x} ${end.y}`,
    labelAnchorX: base.x,
    labelAnchorY: base.y,
    labelX: labelPosition.x,
    labelY: labelPosition.y,
  }
}

function ClassNode({ classItem, box, width, height, spec, onChange }: { classItem: ClassDiagramClass; box: DiagramBox; width: number; height: number; spec: ClassDiagramSpec; onChange?: DiagramUpdater }) {
  const updateClass = (transform: (candidate: ClassDiagramClass) => ClassDiagramClass) => onChange?.({ ...spec, classes: spec.classes.map((candidate) => candidate.id === classItem.id ? transform(candidate) : candidate) })
  const updateAttribute = (index: number, value: string) => updateClass((candidate) => ({ ...candidate, attributes: candidate.attributes?.map((item, itemIndex) => itemIndex === index ? value : item) }))
  const updateMethod = (index: number, value: string) => updateClass((candidate) => ({ ...candidate, methods: candidate.methods?.map((item, itemIndex) => itemIndex === index ? value : item) }))

  return (
    <div className="dg-class-node" style={boxStyle(box, width, height)} aria-label={`${classItem.name} 클래스`}>
      <div className="dg-class-node-header">
        {classItem.stereotype && <EditableText as="span" className="dg-class-stereotype" value={classItem.stereotype} onChange={(value) => updateClass((candidate) => ({ ...candidate, stereotype: value }))} ariaLabel="클래스 스테레오타입" />}
        <EditableText as="strong" value={classItem.name} onChange={(value) => updateClass((candidate) => ({ ...candidate, name: value }))} ariaLabel="클래스 이름" />
      </div>
      {classItem.attributes && classItem.attributes.length > 0 && <div className="dg-class-section">
        <span className="dg-class-section-label">ATTRIBUTES</span>
        <ul>{classItem.attributes.map((attribute, index) => <EditableText as="li" key={index} value={attribute} onChange={(value) => updateAttribute(index, value)} ariaLabel="클래스 속성" multiline />)}</ul>
      </div>}
      {classItem.methods && classItem.methods.length > 0 && <div className="dg-class-section">
        <span className="dg-class-section-label">METHODS</span>
        <ul>{classItem.methods.map((method, index) => <EditableText as="li" key={index} value={method} onChange={(value) => updateMethod(index, value)} ariaLabel="클래스 메서드" multiline />)}</ul>
      </div>}
    </div>
  )
}

const relationLegend = [
  ['inheritance', 'inheritance'],
  ['composition', 'composition'],
  ['association', 'association'],
  ['dependency', 'dependency'],
] as const

function ClassRelationLegend() {
  return <div className="dg-legend dg-class-legend" aria-label="클래스 관계 범례">{relationLegend.map(([type, label]) => <span key={type}><i className={`dg-legend-line is-${type}`} />{label}</span>)}</div>
}

function ClassDiagram({ spec, onChange }: { spec: ClassDiagramSpec; onChange?: DiagramUpdater }) {
  const layout = getClassDiagramLayout(spec)
  const markerPrefix = `dg-class-${useId().replace(/:/g, '')}`
  const occupiedLabels: ClassLabelRect[] = []
  const relationVisuals = spec.relations.map((relation) => {
    const visual = getClassRelationVisual(relation, layout, occupiedLabels)
    if (visual && relation.label) occupiedLabels.push(estimateClassLabelRect(relation.label, { x: visual.labelX, y: visual.labelY }, layout))
    return visual
  })
  return (
    <div className="dg-class-wrap" role="group" aria-label="클래스 다이어그램">
      <div className="dg-class-canvas" style={{ aspectRatio: `${layout.width} / ${layout.height}` }}>
        <svg className="dg-connector-layer" viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true" focusable="false">
          <defs>
            <marker id={`${markerPrefix}-arrow`} viewBox="0 0 12 10" refX="10" refY="5" markerWidth="12" markerHeight="10" orient="auto" markerUnits="userSpaceOnUse">
              <path className="dg-arrowhead" d="M 1 1 L 10 5 L 1 9 Z" />
            </marker>
            <marker id={`${markerPrefix}-inheritance`} viewBox="0 0 12 10" refX="10" refY="5" markerWidth="12" markerHeight="10" orient="auto" markerUnits="userSpaceOnUse">
              <path className="dg-inheritance-head" d="M 1 1 L 10 5 L 1 9 Z" />
            </marker>
            <marker id={`${markerPrefix}-composition`} viewBox="0 0 12 12" refX="2" refY="6" markerWidth="12" markerHeight="12" orient="auto" markerUnits="userSpaceOnUse">
              <path className="dg-composition-head" d="M 1 6 L 6 1 L 11 6 L 6 11 Z" />
            </marker>
          </defs>
          <g className="dg-class-relations">
            {spec.relations.map((relation, index) => {
              const visual = relationVisuals[index]
              if (!visual) return null
              return <path className={`dg-class-relation is-${relation.type}`} d={visual.d} key={`${relation.from}-${relation.to}-${relation.type}-${index}`} markerEnd={`url(#${markerPrefix}-${relation.type === 'inheritance' ? 'inheritance' : 'arrow'})`} markerStart={relation.type === 'composition' ? `url(#${markerPrefix}-composition)` : undefined} />
            })}
          </g>
          <g className="dg-class-label-leaders">
            {spec.relations.map((relation, index) => {
              const visual = relationVisuals[index]
              if (!visual || !relation.label) return null
              const distance = Math.hypot(visual.labelX - visual.labelAnchorX, visual.labelY - visual.labelAnchorY)
              if (distance < 18) return null
              return <path className="dg-class-label-leader" d={`M ${visual.labelAnchorX} ${visual.labelAnchorY} L ${visual.labelX} ${visual.labelY}`} key={`${relation.from}-${relation.to}-leader-${index}`} />
            })}
          </g>
        </svg>
        <div className="dg-class-relation-labels">
          {spec.relations.map((relation, index) => {
            if (!relation.label) return null
            const visual = relationVisuals[index]
            if (!visual) return null
            return <span className="dg-class-relation-label" style={{ left: toPercent(visual.labelX, layout.width), top: toPercent(visual.labelY, layout.height) }} key={`${relation.from}-${relation.to}-label-${index}`}>
              <EditableText as="span" value={relation.label} onChange={(value) => onChange?.({ ...spec, relations: spec.relations.map((candidate, relationIndex) => relationIndex === index ? { ...candidate, label: value } : candidate) })} ariaLabel="클래스 관계 라벨" />
            </span>
          })}
        </div>
        <div className="dg-class-nodes">
          {spec.classes.map((classItem) => {
            const box = layout.nodes.get(classItem.id)
            return box ? <ClassNode classItem={classItem} box={box} width={layout.width} height={layout.height} spec={spec} onChange={onChange} key={classItem.id} /> : null
          })}
        </div>
      </div>
      <ClassRelationLegend />
    </div>
  )
}

interface SwimlaneMessageVisual {
  d: string
  lineY: number
  labelX: number
  labelY: number
  labelWidth: number
  self: boolean
}

interface SwimlaneLayout {
  width: number
  height: number
  laneCenters: Map<string, number>
  headerBoxes: Map<string, DiagramBox>
  messages: SwimlaneMessageVisual[]
  lifelineStartY: number
}

const SWIMLANE_WIDTH = 200
const SWIMLANE_MARGIN_X = 28
const SWIMLANE_HEADER_Y = 20
const SWIMLANE_LIFELINE_GAP = 18
const SWIMLANE_SELF_INDENT = 46

function getSwimlaneLayout(spec: SwimlaneDiagramSpec): SwimlaneLayout {
  const width = SWIMLANE_MARGIN_X * 2 + spec.lanes.length * SWIMLANE_WIDTH
  const headerWidth = SWIMLANE_WIDTH - 20
  const headerHeight = spec.lanes.reduce((tallest, lane) => Math.max(tallest, 20 + estimatedLineCount(lane.label, Math.floor(headerWidth / 9)) * 15), 44)
  const laneCenters = new Map<string, number>()
  const headerBoxes = new Map<string, DiagramBox>()
  spec.lanes.forEach((lane, index) => {
    const x = SWIMLANE_MARGIN_X + index * SWIMLANE_WIDTH
    laneCenters.set(lane.id, x + SWIMLANE_WIDTH / 2)
    headerBoxes.set(lane.id, { x: x + 10, y: SWIMLANE_HEADER_Y, width: headerWidth, height: headerHeight })
  })

  const lifelineStartY = SWIMLANE_HEADER_Y + headerHeight + SWIMLANE_LIFELINE_GAP
  const labelMetrics = spec.messages.map((message) => {
    const fromX = laneCenters.get(message.from) ?? SWIMLANE_MARGIN_X + SWIMLANE_WIDTH / 2
    const toX = laneCenters.get(message.to) ?? fromX
    const self = fromX === toX
    const labelWidth = self ? SWIMLANE_WIDTH - SWIMLANE_SELF_INDENT - 14 : Math.max(112, Math.abs(toX - fromX) - 28)
    const labelLines = estimatedLineCount(message.label, Math.max(16, Math.floor(labelWidth / 6)))
    const noteLines = message.note ? estimatedLineCount(message.note, Math.max(18, Math.floor(labelWidth / 5))) : 0
    return { self, labelWidth, labelHeight: 8 + labelLines * 16 + noteLines * 13 }
  })
  const rowHeights = labelMetrics.map((metrics) => metrics.self ? Math.max(78, metrics.labelHeight + 34) : metrics.labelHeight + 34)
  const messageStartY = lifelineStartY + 14
  const height = messageStartY + rowHeights.reduce((total, rowHeight) => total + rowHeight, 0) + 24
  let rowTop = messageStartY
  const messages = spec.messages.map((message, index) => {
    const rowHeight = rowHeights[index]
    const metrics = labelMetrics[index]
    const fromX = laneCenters.get(message.from) ?? SWIMLANE_MARGIN_X + SWIMLANE_WIDTH / 2
    const toX = laneCenters.get(message.to) ?? fromX
    const self = fromX === toX
    const lineY = self ? rowTop + 16 : rowTop + metrics.labelHeight + 12
    const d = self
      ? `M ${fromX} ${lineY} C ${fromX + 42} ${lineY}, ${fromX + 42} ${lineY + 25}, ${fromX} ${lineY + 25}`
      : `M ${fromX} ${lineY} L ${toX} ${lineY}`
    const labelX = self ? fromX + SWIMLANE_SELF_INDENT : (fromX + toX) / 2
    const labelWidth = metrics.labelWidth
    const labelY = self ? lineY + 13 : lineY - 8
    rowTop += rowHeight
    return { d, lineY, labelX, labelY, labelWidth, self }
  })

  return { width, height, laneCenters, headerBoxes, messages, lifelineStartY }
}

function SwimlaneLegend() {
  return <div className="dg-legend dg-swimlane-legend" aria-label="시퀀스 경로 범례"><span><i className="dg-legend-line is-solid" />solid message</span><span><i className="dg-legend-line is-dashed" />conditional path</span></div>
}

function SwimlaneDiagram({ spec, onChange }: { spec: SwimlaneDiagramSpec; onChange?: DiagramUpdater }) {
  const layout = getSwimlaneLayout(spec)
  const markerPrefix = `dg-swimlane-${useId().replace(/:/g, '')}`
  const updateLane = (laneId: string, label: string) => onChange?.({ ...spec, lanes: spec.lanes.map((lane) => lane.id === laneId ? { ...lane, label } : lane) })
  const updateMessage = (index: number, message: SwimlaneDiagramSpec['messages'][number]) => onChange?.({ ...spec, messages: spec.messages.map((candidate, messageIndex) => messageIndex === index ? message : candidate) })

  return (
    <div className="dg-swimlane-wrap" role="group" aria-label="다중 레인 시퀀스 다이어그램" style={{ ['--dg-w' as string]: layout.width, ['--dg-h' as string]: layout.height }}>
      <div className="dg-swimlane-canvas" style={{ width: layout.width, height: layout.height }}>
        <svg className="dg-connector-layer" viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true" focusable="false">
          <defs>
            <marker id={`${markerPrefix}-arrow`} viewBox="0 0 12 10" refX="10" refY="5" markerWidth="12" markerHeight="10" orient="auto" markerUnits="userSpaceOnUse">
              <path className="dg-arrowhead" d="M 1 1 L 10 5 L 1 9 Z" />
            </marker>
          </defs>
          <g className="dg-swimlane-lifelines">
            {spec.lanes.map((lane) => {
              const x = layout.laneCenters.get(lane.id)
              return x === undefined ? null : <line x1={x} x2={x} y1={layout.lifelineStartY} y2={layout.height - 20} key={lane.id} />
            })}
          </g>
          <g className="dg-swimlane-message-lines">
            {spec.messages.map((message, index) => {
              const visual = layout.messages[index]
              return <path className={`dg-swimlane-message-line is-${message.style ?? 'solid'}`} d={visual.d} markerEnd={`url(#${markerPrefix}-arrow)`} key={`${message.from}-${message.to}-${index}`} />
            })}
          </g>
        </svg>
        <div className="dg-swimlane-headers">
          {spec.lanes.map((lane) => {
            const box = layout.headerBoxes.get(lane.id)
            return box ? <div className="dg-swimlane-header" style={boxStyle(box, layout.width, layout.height)} key={lane.id}><EditableText as="span" value={lane.label} onChange={(value) => updateLane(lane.id, value)} ariaLabel="시퀀스 레인 이름" /></div> : null
          })}
        </div>
        <div className="dg-swimlane-message-labels">
          {spec.messages.map((message, index) => {
            const visual = layout.messages[index]
            return <div className={`dg-swimlane-message-label${visual.self ? ' is-self' : ''}`} style={{ left: toPercent(visual.labelX, layout.width), top: toPercent(visual.labelY, layout.height), width: toPercent(visual.labelWidth, layout.width) }} key={`${message.from}-${message.to}-label-${index}`}>
              <EditableText as="strong" value={message.label} onChange={(value) => updateMessage(index, { ...message, label: value })} ariaLabel="시퀀스 메시지" />
              {message.note && <EditableText as="span" value={message.note} onChange={(value) => updateMessage(index, { ...message, note: value })} ariaLabel="시퀀스 메시지 노트" multiline />}
            </div>
          })}
        </div>
      </div>
      <SwimlaneLegend />
    </div>
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
  else if (spec.kind === 'class') body = <ClassDiagram spec={spec} onChange={onSpecChange} />
  else if (spec.kind === 'swimlane') body = <SwimlaneDiagram spec={spec} onChange={onSpecChange} />
  return (
    <figure className="dg-figure">
      <div className="dg-body">{body}</div>
      <EditableText as="figcaption" value={caption} onChange={onCaptionChange ?? noop} ariaLabel="다이어그램 캡션" multiline />
    </figure>
  )
}
