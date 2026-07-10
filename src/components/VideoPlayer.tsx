'use client'

interface VideoPlayerProps {
  videoUrl?: string | null
  videoFile?: string | null
  title?: string
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    // youtube.com/watch?v=ID
    if (parsed.hostname.includes('youtube.com') && parsed.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get('v')}`
    }
    // youtu.be/ID
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      if (id) return `https://www.youtube.com/embed/${id}`
    }
    // youtube.com/embed/ID (already embed)
    if (parsed.hostname.includes('youtube.com') && parsed.pathname.startsWith('/embed/')) {
      return url
    }
    // youtube.com/shorts/ID
    if (parsed.hostname.includes('youtube.com') && parsed.pathname.startsWith('/shorts/')) {
      const id = parsed.pathname.replace('/shorts/', '')
      if (id) return `https://www.youtube.com/embed/${id}`
    }
  } catch {}
  return null
}

function getFacebookInfo(url: string): { embedUrl: string; linkUrl: string } | null {
  try {
    const parsed = new URL(url)

    // Already a plugins/video.php embed URL → use as iframe src directly
    if (
      parsed.hostname.includes('facebook.com') &&
      parsed.pathname.includes('/plugins/video.php')
    ) {
      const originalHref = parsed.searchParams.get('href') || url
      return { embedUrl: url, linkUrl: originalHref }
    }

    // fb.watch short links
    if (parsed.hostname.includes('fb.watch')) {
      return {
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`,
        linkUrl: url,
      }
    }

    // facebook.com URLs
    if (parsed.hostname.includes('facebook.com')) {
      // Share URL (facebook.com/share/v/ID/) → can't embed, show link only
      if (parsed.pathname.startsWith('/share/v/') || parsed.pathname.startsWith('/share/r/')) {
        return { embedUrl: '', linkUrl: url }
      }

      // Standard video URLs: /{page}/videos/{id}, /watch, /reel, etc.
      return {
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`,
        linkUrl: url,
      }
    }
  } catch {}
  return null
}

function isFacebookUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname.includes('facebook.com') || parsed.hostname.includes('fb.watch')
  } catch {
    return false
  }
}

const fbLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginTop: '0.75rem',
  padding: '0.6rem 1.2rem',
  background: '#1877F2',
  color: '#fff',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  transition: 'opacity 0.2s',
}

export default function VideoPlayer({ videoUrl, videoFile, title }: VideoPlayerProps) {
  // Prioritize video file if both provided
  if (videoFile) {
    return (
      <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', background: '#000' }}>
        <video
          controls
          preload="metadata"
          style={{ width: '100%', maxHeight: '500px', display: 'block' }}
          title={title || 'Video de la actividad'}
        >
          <source src={videoFile} />
          Tu navegador no soporta la reproducción de video.
        </video>
      </div>
    )
  }

  if (videoUrl) {
    // Try YouTube embed
    const ytEmbed = getYouTubeEmbedUrl(videoUrl)
    if (ytEmbed) {
      return (
        <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={ytEmbed}
            title={title || 'Video de YouTube'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      )
    }

    // Try Facebook embed
    const fbInfo = getFacebookInfo(videoUrl)
    if (fbInfo) {
      return (
        <div style={{ marginBottom: '1.5rem' }}>
          {/* Show iframe only when we have a valid embed URL */}
          {fbInfo.embedUrl && (
            <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={fbInfo.embedUrl}
                title={title || 'Video de Facebook'}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          )}

          {/* If it's a share link (no embed), show a nice card */}
          {!fbInfo.embedUrl && (
            <div style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎬</div>
              <p style={{ color: '#cbd5e1', marginBottom: '1rem', fontSize: '0.95rem' }}>
                Este video está disponible en Facebook
              </p>
              <a
                href={fbInfo.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={fbLinkStyle}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Ver video en Facebook
              </a>
            </div>
          )}

          {/* Always show a fallback link for embeds too (they often fail) */}
          {fbInfo.embedUrl && (
            <div style={{ textAlign: 'center' }}>
              <a
                href={fbInfo.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...fbLinkStyle, background: '#334155', fontSize: '0.82rem', padding: '0.45rem 1rem' }}
              >
                ¿No se ve? Abrir en Facebook →
              </a>
            </div>
          )}
        </div>
      )
    }

    // Fallback: try as direct video URL
    return (
      <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', background: '#000' }}>
        <video
          controls
          preload="metadata"
          style={{ width: '100%', maxHeight: '500px', display: 'block' }}
          title={title || 'Video de la actividad'}
        >
          <source src={videoUrl} />
          Tu navegador no soporta la reproducción de video.
        </video>
      </div>
    )
  }

  return null
}
