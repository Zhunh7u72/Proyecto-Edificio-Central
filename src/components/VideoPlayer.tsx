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

function getFacebookEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('facebook.com') || parsed.hostname.includes('fb.watch')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`
    }
  } catch {}
  return null
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
    const fbEmbed = getFacebookEmbedUrl(videoUrl)
    if (fbEmbed) {
      return (
        <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={fbEmbed}
            title={title || 'Video de Facebook'}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          />
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
