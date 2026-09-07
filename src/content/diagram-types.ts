export type DiagramRelationType = 'inheritance' | 'composition' | 'association' | 'dependency'

export interface ClassDiagramClass {
  id: string
  name: string
  stereotype?: string
  attributes?: string[]
  methods?: string[]
}

export interface ClassDiagramRelation {
  from: string
  to: string
  type: DiagramRelationType
  label?: string
}

export interface ClassDiagramSpec {
  kind: 'class'
  classes: ClassDiagramClass[]
  relations: ClassDiagramRelation[]
}

export type SwimlaneMessageStyle = 'solid' | 'dashed'

export interface Swimlane {
  id: string
  label: string
}

export interface SwimlaneMessage {
  from: string
  to: string
  label: string
  note?: string
  style?: SwimlaneMessageStyle
}

export interface SwimlaneDiagramSpec {
  kind: 'swimlane'
  lanes: Swimlane[]
  messages: SwimlaneMessage[]
}

export type DiagramSpec =
  | { kind: 'flow'; steps: { label: string; sub?: string }[] }
  | { kind: 'tree'; root: TreeNode }
  | { kind: 'sequence'; lanes: [string, string]; messages: { from: 0 | 1 | 2; label: string; note?: string }[] }
  | { kind: 'bars'; unit: string; items: { label: string; value: number; note?: string }[] }
  | { kind: 'split'; before: { title: string; items: string[] }; after: { title: string; items: string[] } }
  | { kind: 'layers'; layers: { label: string; sub?: string }[] }
  | ClassDiagramSpec
  | SwimlaneDiagramSpec

export type TreeNode = { label: string; tag?: string; children?: TreeNode[] }
