import { sampleAlbums } from '../data/demoContent.js'

const STORAGE_KEY = 'snapflip_albums'

export function getAlbums() {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleAlbums))
    return sampleAlbums
  }

  try {
    return JSON.parse(stored)
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleAlbums))
    return sampleAlbums
  }
}

export function saveAlbum(album) {
  const albums = getAlbums()
  const nextAlbums = [album, ...albums.filter((item) => item.slug !== album.slug)]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAlbums))
  return nextAlbums
}

export function deleteAlbum(slug) {
  const nextAlbums = getAlbums().filter((album) => album.slug !== slug)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAlbums))
  return nextAlbums
}

export function findAlbum(slug) {
  return getAlbums().find((album) => album.slug === slug)
}

export function makeSlug(title) {
  const cleanTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `${cleanTitle || 'album'}-${Math.random().toString(36).slice(2, 6)}`
}

export function publicAlbumUrl(slug) {
  return `${window.location.origin}/view/${slug}`
}
