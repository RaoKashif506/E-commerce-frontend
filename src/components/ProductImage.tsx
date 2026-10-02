import { useState } from 'react'

export function ProductImage({
  src,
  alt,
  loading = 'lazy',
}: {
  src: string
  alt: string
  loading?: 'lazy' | 'eager'
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) return <span className="photo-fallback" role="img" aria-label={alt || undefined} />

  return <img src={src} alt={alt} loading={loading} onError={() => setFailed(true)} />
}
