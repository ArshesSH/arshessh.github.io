import type { ReactNode } from 'react'

export type DiagramSpec =
  | { kind: 'flow'; steps: { label: string; sub?: string }[] }
  | { kind: 'tree'; root: TreeNode }
  | { kind: 'sequence'; lanes: [string, string]; messages: { from: 0 | 1; label: string; note?: string }[] }
  | { kind: 'bars'; unit: string; items: { label: string; value: number; note?: string }[] }
  | { kind: 'split'; before: { title: string; items: string[] }; after: { title: string; items: string[] } }
  | { kind: 'layers'; layers: { label: string; sub?: string }[] }

export type TreeNode = { label: string; tag?: string; children?: TreeNode[] }

function FlowDiagram({ steps }: { steps: { label: string; sub?: string }[] }) {
  return (
    <ol className="dg-flow">
      {steps.map((step) => (
        <li key={step.label}>
          <strong>{step.label}</strong>
          {step.sub && <span>{step.sub}</span>}
        </li>
      ))}
    </ol>
  )
}

function TreeBranch({ node }: { node: TreeNode }) {
  return (
    <li>
      <p><strong>{node.label}</strong>{node.tag && <em>{node.tag}</em>}</p>
      {node.children && <ul>{node.children.map((child) => <TreeBranch node={child} key={child.label} />)}</ul>}
    </li>
  )
}

function TreeDiagram({ root }: { root: TreeNode }) {
  return <ul className="dg-tree">{<TreeBranch node={root} />}</ul>
}

function SequenceDiagram({ lanes, messages }: { lanes: [string, string]; messages: { from: 0 | 1; label: string; note?: string }[] }) {
  return (
    <div className="dg-sequence">
      <div className="dg-sequence-lanes"><span>{lanes[0]}</span><span>{lanes[1]}</span></div>
      <ol>
        {messages.map((message, i) => (
          <li className={message.from === 0 ? 'to-right' : 'to-left'} key={`${message.label}-${i}`}>
            <strong>{message.label}</strong>
            {message.note && <span>{message.note}</span>}
          </li>
        ))}
      </ol>
    </div>
  )
}

function BarsDiagram({ unit, items }: { unit: string; items: { label: string; value: number; note?: string }[] }) {
  const max = Math.max(...items.map((item) => item.value))
  return (
    <ol className="dg-bars">
      {items.map((item) => (
        <li key={item.label}>
          <p>{item.label}</p>
          <div><span style={{ width: `${Math.max((item.value / max) * 100, 2)}%` }} /><b>{item.value}{unit}</b></div>
          {item.note && <small>{item.note}</small>}
        </li>
      ))}
    </ol>
  )
}

function SplitDiagram({ before, after }: { before: { title: string; items: string[] }; after: { title: string; items: string[] } }) {
  return (
    <div className="dg-split">
      {[before, after].map((side, i) => (
        <section className={i === 0 ? 'is-before' : 'is-after'} key={side.title}>
          <h4>{side.title}</h4>
          <ul>{side.items.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      ))}
    </div>
  )
}

function LayersDiagram({ layers }: { layers: { label: string; sub?: string }[] }) {
  return (
    <ol className="dg-layers">
      {layers.map((layer) => (
        <li key={layer.label}><strong>{layer.label}</strong>{layer.sub && <span>{layer.sub}</span>}</li>
      ))}
    </ol>
  )
}

export function Diagram({ spec, caption }: { spec: DiagramSpec; caption: string }) {
  let body: ReactNode = null
  if (spec.kind === 'flow') body = <FlowDiagram steps={spec.steps} />
  else if (spec.kind === 'tree') body = <TreeDiagram root={spec.root} />
  else if (spec.kind === 'sequence') body = <SequenceDiagram lanes={spec.lanes} messages={spec.messages} />
  else if (spec.kind === 'bars') body = <BarsDiagram unit={spec.unit} items={spec.items} />
  else if (spec.kind === 'split') body = <SplitDiagram before={spec.before} after={spec.after} />
  else if (spec.kind === 'layers') body = <LayersDiagram layers={spec.layers} />
  return (
    <figure className="dg-figure">
      <div className="dg-body">{body}</div>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
