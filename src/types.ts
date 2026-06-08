export interface CrawlPage {
  url: string
  title: string
  headings: { level: number; text: string }[]
  paragraphs: string[]
  links: string[]
  images: string[]
}

export interface CrawlResult {
  pages: CrawlPage[]
}

export interface StructuredSection {
  type: string
  heading: string
  body: string
  image_url?: string
  items?: { title: string; description: string }[]
}

export interface StructuredData {
  business_name: string
  tagline: string
  description: string
  sections: StructuredSection[]
  contact: {
    email?: string
    phone?: string
    address?: string
  }
  color_hints: string[]
  social_links: { platform: string; url: string }[]
}

export interface BlockFieldSchema {
  type: "string" | "array"
  hint?: string
  items?: Record<string, string>
}

export interface BlockManifestEntry {
  name: string
  optional: boolean
  fields: Record<string, BlockFieldSchema>
}

export interface PageDefinition {
  route: string
  title: string
  blocks: BlockManifestEntry[]
}

export interface TemplateManifest {
  name: string
  description: string
  source: string
  types: string[]
  global?: BlockManifestEntry[]
  pages: PageDefinition[]
}

export type ContentPayload = Record<string, Record<string, unknown> | null>

export interface Template {
  name: string
  path: string
  manifest: TemplateManifest
}

export const STAGING_BRANCH = "staging"
export const MAIN_BRANCH = "main"
