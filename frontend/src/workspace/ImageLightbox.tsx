import { useEffect, useRef } from 'react'
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react'
import { notesApi } from '../notes/api'
import type { NoteImage } from '../notes/types'
import './images.css'

type Props = {
  noteId: string
  images: NoteImage[]
  activeIndex: number | null
  onChange: (index: number | null) => void
}

export function ImageLightbox({ noteId, images, activeIndex, onChange }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const active = activeIndex === null ? null : images[activeIndex] ?? null

  useEffect(() => {
    if (active) dialog.current?.showModal()
    else if (dialog.current?.open) dialog.current.close()
  }, [active])

  function move(direction: number) {
    if (activeIndex === null || images.length < 2) return
    onChange((activeIndex + direction + images.length) % images.length)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      move(-1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      move(1)
    }
  }

  return (
    <dialog
      ref={dialog}
      className="image-lightbox"
      aria-label="Image viewer"
      onClose={() => onChange(null)}
      onKeyDown={handleKeyDown}
      onClick={(event) => {
        if (event.target === event.currentTarget) onChange(null)
      }}
    >
      {active && activeIndex !== null && (
        <div className="lightbox-content">
          <button className="lightbox-close" aria-label="Close" onClick={() => onChange(null)}>
            <X size={22} weight="bold" />
          </button>
          {images.length > 1 && (
            <button className="lightbox-nav lightbox-prev" aria-label="Previous image" onClick={() => move(-1)}>
              <CaretLeft size={24} weight="bold" />
            </button>
          )}
          <img src={notesApi.imageUrl(noteId, active.id)} alt={active.filename} className="lightbox-image" />
          {images.length > 1 && (
            <button className="lightbox-nav lightbox-next" aria-label="Next image" onClick={() => move(1)}>
              <CaretRight size={24} weight="bold" />
            </button>
          )}
          <span className="lightbox-counter">{activeIndex + 1} / {images.length}</span>
        </div>
      )}
    </dialog>
  )
}
