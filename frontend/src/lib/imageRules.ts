export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_NOTE_IMAGES = 10

export function checkImage(file: File, currentCount: number): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return 'Only JPEG, PNG, GIF or WebP images'
  if (file.size > MAX_IMAGE_BYTES) return 'Images must be under 5 MB'
  if (currentCount >= MAX_NOTE_IMAGES) return 'A note can have up to 10 images'
  return null
}
