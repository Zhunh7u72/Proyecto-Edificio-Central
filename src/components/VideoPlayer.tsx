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

function getFacebookLinkUrl(url: string): string | null {
  try {
    const parsed = new URL(url)

    // Already a plugins/video.php embed URL → extract the original href
    if (
      parsed.hostname.includes('facebook.com') &&
      parsed.pathname.includes('/plugins/video.php')
    ) {
      return parsed.searchParams.get('href') || url
    }

    // Any facebook.com or fb.watch URL
    if (parsed.hostname.includes('facebook.com') || parsed.hostname.includes('fb.watch')) {
      return url
    }
  } catch {}
  return null
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

    // Facebook video → show card with link (Facebook blocks most embeds)
    const fbLink = getFacebookLinkUrl(videoUrl)
    if (fbLink) {
      return (
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '12px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎬</div>
          <p style={{ color: '#e2e8f0', marginBottom: '0.4rem', fontSize: '1.05rem', fontWeight: 600 }}>
            Video disponible en Facebook
          </p>
          <p style={{ color: '#94a3b8', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            Haz clic en el botón para ver el video completo
          </p>
          <a
            href={fbLink}
            target="_blank"
            rel="noopener noreferrer"
            style={fbLinkStyle}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Ver video en Facebook
          </a>
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
