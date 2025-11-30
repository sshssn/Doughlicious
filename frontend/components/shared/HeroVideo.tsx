"use client"

export function HeroVideo() {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
      style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      onError={(e) => {
        console.error('Video failed to load:', e)
        const target = e.target as HTMLVideoElement
        if (target) {
          console.error('Video error details:', target.error)
        }
      }}
      onLoadStart={() => {
        console.log('Video loading started')
      }}
      onCanPlay={() => {
        console.log('Video can play')
      }}
      onLoadedData={() => {
        console.log('Video data loaded')
      }}
    >
      <source src="/hero-dough.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )
}

