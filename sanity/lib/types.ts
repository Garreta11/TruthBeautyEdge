import type { SanityImageSource } from '@sanity/image-url'

// ─── Media items ────────────────────────────────────────────────────────────

export interface MediaImage {
  _type: 'mediaImage'
  _key: string
  image: SanityImageSource & { asset: { _ref: string } }
  alt?: string
  caption?: string
}

export interface MediaVideo {
  _type: 'mediaVideo'
  _key: string
  file?: { asset: { url: string } }
  url?: string
  caption?: string
}

export interface MediaText {
  _type: 'mediaText'
  _key: string
  body: import('@portabletext/types').PortableTextBlock[]
}

export type MediaItem = MediaImage | MediaVideo | MediaText

// ─── Project ─────────────────────────────────────────────────────────────────

export interface Project {
  _id: string
  _type: 'project'
  title: string
  slug: { current: string }
  media: MediaItem[]
}

export interface OldProject {
  _id: string
  _type: 'oldProject'
  title: string
  slug: { current: string }
  media: MediaItem[]
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export type PortableTextBlock = unknown[]

export interface SiteSettings {
  _id: string
  siteName: string
  description?: {
    desc1?: string
    desc2?: string
  }
  info?: {
    label?: string
    body?: PortableTextBlock
  }
  checkWork?: {
    sentence1?: string
    sentence2?: string
  }
  reachOut?: {
    label?: string
    cities?: { city: string; phone?: string }[]
    mail?: string
  }
  logoUrl?: string
  favicon?: SanityImageSource
  backgroundVideoUrl?: string
}
