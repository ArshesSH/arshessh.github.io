export type DiagramSpec =
  | { kind: 'flow'; steps: { label: string; sub?: string }[] }
  | { kind: 'tree'; root: TreeNode }
  | { kind: 'sequence'; lanes: [string, string]; messages: { from: 0 | 1; label: string; note?: string }[] }
  | { kind: 'bars'; unit: string; items: { label: string; value: number; note?: string }[] }
  | { kind: 'split'; before: { title: string; items: string[] }; after: { title: string; items: string[] } }
  | { kind: 'layers'; layers: { label: string; sub?: string }[] }

export type TreeNode = { label: string; tag?: string; children?: TreeNode[] }
