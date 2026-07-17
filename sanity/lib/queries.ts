import { groq } from 'next-sanity'
import { client } from './client'
import type { Project, OldProject, SiteSettings } from './types'

// Sanity's own CDN (useCdn: true) already serves near-instant, edge-cached
// reads — this just stops Next from re-hitting it on every single request.
// Content here doesn't change second-to-second, so a short revalidate window
// is enough to cut redundant fetches without staling too badly.
const REVALIDATE_SECONDS = 60

// ─── Fragments ───────────────────────────────────────────────────────────────

const mediaFragment = groq`
  media[] {
    _type,
    _key,
    _type == "mediaImage" => {
      image {
        hotspot,
        crop,
        asset-> {
          _id,
          metadata { dimensions { width, height } }
        }
      },
      alt,
      caption
    },
    _type == "mediaVideo" => {
      file { asset-> { url } },
      url,
      caption
    },
    _type == "mediaText" => {
      body
    }
  }
`

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function getAllProjects(): Promise<Project[]> {
  return client.fetch(
    groq`*[_type == "project"] | order(_createdAt desc) {
      _id,
      _type,
      title,
      slug,
      ${mediaFragment}
    }`,
    {},
    { next: { revalidate: REVALIDATE_SECONDS } }
  )
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return client.fetch(
    groq`*[_type == "project" && slug.current == $slug][0] {
      _id,
      _type,
      title,
      slug,
      ${mediaFragment}
    }`,
    { slug },
    { next: { revalidate: REVALIDATE_SECONDS } }
  )
}

// ─── Old Projects ────────────────────────────────────────────────────────────

export async function getAllOldProjects(): Promise<OldProject[]> {
  return client.fetch(
    groq`*[_type == "oldProject"] | order(_createdAt desc) {
      _id,
      _type,
      title,
      slug,
      ${mediaFragment}
    }`,
    {},
    { next: { revalidate: REVALIDATE_SECONDS } }
  )
}

export async function getOldProjectBySlug(slug: string): Promise<OldProject | null> {
  return client.fetch(
    groq`*[_type == "oldProject" && slug.current == $slug][0] {
      _id,
      _type,
      title,
      slug,
      ${mediaFragment}
    }`,
    { slug },
    { next: { revalidate: REVALIDATE_SECONDS } }
  )
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch(
    groq`*[_type == "siteSettings"][0] {
      _id,
      siteName,
      description,
      info,
      checkWork {
        label,
        createdWith,
      },
      mail {
        subject,
        body,
      },
      reachOut {
        label,
        cities[] { city, phone },
        mail,
      },
      "logoUrl": logo.asset->url,
      favicon,
      "backgroundVideoUrl": backgroundVideo.asset->url,
      "whoWeAreImageUrl": whoWeAreImage.asset->url,
    }`,
    {},
    { next: { revalidate: REVALIDATE_SECONDS } }
  )
}
