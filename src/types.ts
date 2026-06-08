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

export interface Template {
  name: string
  path: string
}

export const STAGING_BRANCH = "staging"
export const MAIN_BRANCH = "main"
