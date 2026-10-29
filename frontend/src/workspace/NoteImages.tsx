import { memo, useRef, useState } from 'react'
import { ImageSquare, X } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { ease } from '../lib/motion'
import { notesApi } from '../notes/api'
import type { Note, NoteImage } from '../notes/types'
import { ImageLightbox } from './ImageLightbox'
import './images.css'

type Props = {
  note: Note
  onAddImages: (files: File[]) => Promise<void>
  onRemoveImage: (image: NoteImage) => Promise<void>
}

export const NoteImages = memo(function NoteImages({ note, onAddImages, onRemoveImage }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [uploadingCount, setUploadingCount] = useState(0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  async function chooseImages(files: FileList | null) {
    const selected = Array.from(files ?? [])
    if (!selected.length) return
    setUploadingCount((count) => count + selected.length)
    try {
      await onAddImages(selected)
    } finally {
      setUploadingCount((count) => Math.max(0, count - selected.length))
    }
  }

  return (
    <section className={`note-images${note.images.length ? '' : ' is-empty'}`} aria-label="Images">
      <div className="image-grid">
        <AnimatePresence initial={false} mode="popLayout">
          {note.images.map((image, index) => (
            <motion.div
              key={image.id}
              layout
              className="image-tile"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.16, ease }}
            >
              <button
                className="image-open"
                aria-label={`Open image ${index + 1} of ${note.images.length}`}
                onClick={() => setActiveIndex(index)}
              >
                <img src={notesApi.imageUrl(note.id, image.id)} alt="" />
              </button>
              <button
                className="image-remove"
                aria-label="Remove image"
                onClick={() => void onRemoveImage(image)}
              >
                <X size={13} weight="bold" />
              </button>
            </motion.div>
          ))}
          {Array.from({ length: uploadingCount }, (_, index) => (
            <motion.div
              key={`upload-${index}`}
              layout
              className="image-skeleton"
              aria-label="Uploading image"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.16, ease }}
            />
          ))}
          {note.images.length < 10 && (
            <motion.button
              layout
              key="add-image"
              className="image-add"
              onClick={() => input.current?.click()}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.16, ease }}
            >
              <ImageSquare size={20} weight="regular" />
              <span>Add image</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <input
        ref={input}
        className="image-input"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        onChange={(event) => {
          void chooseImages(event.currentTarget.files)
          event.currentTarget.value = ''
        }}
      />
      <ImageLightbox
        noteId={note.id}
        images={note.images}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
      />
    </section>
  )
})
