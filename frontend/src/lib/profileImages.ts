export type StoredProfileImages = {
  profileImage: string | null
  coverImage: string | null
}

export const PROFILE_IMAGES_UPDATED_EVENT = 'softlearn:profile-images-updated'

export function getProfileImagesStorageKey(userId: number | null | undefined) {
  return `student-profile-images:${userId ?? 'anonymous'}`
}

export function getStoredProfileImages(userId: number | null | undefined): StoredProfileImages {
  if (typeof window === 'undefined') {
    return { profileImage: null, coverImage: null }
  }

  const storedValue = window.localStorage.getItem(getProfileImagesStorageKey(userId))
  if (!storedValue) {
    return { profileImage: null, coverImage: null }
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<StoredProfileImages>
    return {
      profileImage: parsed.profileImage ?? null,
      coverImage: parsed.coverImage ?? null,
    }
  } catch {
    return { profileImage: null, coverImage: null }
  }
}

export function saveStoredProfileImages(userId: number | null | undefined, images: StoredProfileImages) {
  if (typeof window === 'undefined') {
    return
  }

  const storageKey = getProfileImagesStorageKey(userId)
  window.localStorage.setItem(storageKey, JSON.stringify(images))
  window.dispatchEvent(new CustomEvent(PROFILE_IMAGES_UPDATED_EVENT, { detail: { userId, images } }))
}
