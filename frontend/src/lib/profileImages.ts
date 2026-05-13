export type StoredProfileImages = {
  profileImage: string | null
  coverImage: string | null
}

export const PROFILE_IMAGES_UPDATED_EVENT = 'softlearn:profile-images-updated'

export function emitStoredProfileImages(userId: number | null | undefined, images: StoredProfileImages) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(PROFILE_IMAGES_UPDATED_EVENT, { detail: { userId, images } }))
}
