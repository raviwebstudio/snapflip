export const demoImages = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=85',
]

export const musicTracks = [
  { id: 'none', name: 'No Music', category: 'Default', file: null },
  { id: 'romantic-piano', name: 'Romantic Piano', category: 'Romantic', file: 'romantic-piano.mp3' },
  { id: 'soft-strings', name: 'Soft Strings', category: 'Romantic', file: 'soft-strings.mp3' },
  { id: 'classical-guitar', name: 'Classical Guitar', category: 'Classical', file: 'classical-guitar.mp3' },
  { id: 'bollywood-1', name: 'Bollywood Instrumental 1', category: 'Bollywood', file: 'bollywood-1.mp3' },
  { id: 'bollywood-2', name: 'Bollywood Instrumental 2', category: 'Bollywood', file: 'bollywood-2.mp3' },
  { id: 'wedding-march', name: 'Wedding March', category: 'Classical', file: 'wedding-march.mp3' },
  { id: 'acoustic-love', name: 'Acoustic Love', category: 'Romantic', file: 'acoustic-love.mp3' },
  { id: 'cinematic', name: 'Cinematic Romance', category: 'Cinematic', file: 'cinematic.mp3' },
  { id: 'soft-flute', name: 'Soft Flute', category: 'Instrumental', file: 'soft-flute.mp3' },
]

export const sampleAlbums = [
  {
    slug: 'aarav-meera-2026',
    title: 'Aarav & Meera',
    clientName: 'Meera Sharma',
    weddingDate: '2026-02-14',
    photographerName: 'Ravi Studio',
    photos: demoImages,
    music: musicTracks[1],
    isPublished: true,
    viewCount: 128,
    createdAt: '2026-07-01T09:00:00.000Z',
  },
]
