import type { DiagramSpec } from './diagram-types'

export type ProjectGroup = 'company' | 'personal'
export type PdfVariant = 'summary' | 'full'

export interface ContentItem {
  id: string
  text: string
}

export interface ProjectImage {
  id: string
  src: string
  caption: string
}

export interface ProjectLink {
  id: string
  label: string
  href: string
}

export interface BuildMedia {
  kind: 'image' | 'video' | 'youtube'
  src: string
  caption: string
}

export interface BuildCode {
  label: string
  lang: string
  pseudo?: boolean
  source: string
}

export interface BuildItem {
  id: string
  label: string
  body: string
  diagram?: { spec: DiagramSpec; caption: string }
  media?: BuildMedia
  code?: BuildCode
}

export interface Project {
  id: string
  slug: string
  group: ProjectGroup
  category: string
  period: string
  title: string
  shortTitle: string
  summary: string
  role: string
  team: string
  stack: string[]
  context: string
  builds: BuildItem[]
  links?: ProjectLink[]
  youtube?: string
  images?: ProjectImage[]
}

export interface HeroContent {
  eyebrow: string
  kicker: string
  titleLead: string
  titleAccent: string
  titleTail: string
  descriptionLead: string
  descriptionAccent: string
  descriptionTail: string
}

export interface HeaderContent {
  summaryPdfTitle: string
  fullPdfTitle: string
}

export interface ProfileContent {
  headingLead: string
  headingTail: string
  description: string
  statements: ContentItem[]
  personalLabTitle: string
  personalLabBody: string
}

export interface ExperienceItem {
  id: string
  period: string
  company: string
  role: string
  detail: string
}

export interface EducationItem {
  id: string
  period: string
  school: string
  detail: string
}

export interface ArchiveContent {
  heading: string
  description: string
  intro: string
  companyHeading: string
  companyDescription: string
  personalHeading: string
  personalDescription: string
}

export interface ContactContent {
  heading: string
  email: string
}

export interface PrintContent {
  coverSummaryFull: string
  coverSummarySummary: string
  profileHeading: string
  profileStatements: ContentItem[]
  projectIndexHeading: string
  projectIndexNote: string
  footer: string
}

export interface PortfolioContent {
  header: HeaderContent
  hero: HeroContent
  profile: ProfileContent
  archive: ArchiveContent
  projects: Project[]
  experience: ExperienceItem[]
  education: EducationItem[]
  capabilities: ContentItem[]
  contact: ContactContent
  print: PrintContent
}
