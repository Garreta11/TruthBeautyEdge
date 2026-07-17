import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'
import type { ImageLoaderProps } from 'next/image'

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}

// Sanity's CDN already resizes/re-encodes images via query params on the
// asset URL itself — this loader just rewrites those params per size next/image
// asks for, instead of routing through (and re-processing in) Next's own
// image optimizer. Pass a bare `urlFor(...).url()` as `src` and let this fill
// in width/quality/format.
export function sanityImageLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src)
  url.searchParams.set('w', width.toString())
  url.searchParams.set('q', (quality ?? 75).toString())
  url.searchParams.set('auto', 'format')
  return url.toString()
}
