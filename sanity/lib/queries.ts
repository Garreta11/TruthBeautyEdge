import { groq } from 'next-sanity'
import { client } from './client'
import type { Project, OldProject, SiteSettings } from './types'

// ─── Fragments ───────────────────────────────────────────────────────────────

const mediaFragment = groq`
  media[] {
    _type,
    _key,
    _type == "mediaImage" => {
      image { ..., asset-> },
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
    }`
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
    { slug }
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
    }`
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
    { slug }
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
      reachOut {
        label,
        cities[] { city, phone },
        mail,
      },
      "logoUrl": logo.asset->url,
      favicon,
      "backgroundVideoUrl": backgroundVideo.asset->url,
    }`
  )
}
