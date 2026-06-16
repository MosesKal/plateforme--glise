"use client"

import Lightbox from "yet-another-react-lightbox"
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"
import "yet-another-react-lightbox/plugins/thumbnails.css"

interface GalleryLightboxProps {
  images: string[]
  open: boolean
  index: number
  onClose: () => void
}

export function GalleryLightbox({ images, open, index, onClose }: GalleryLightboxProps) {
  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={images.map((src) => ({ src }))}
      plugins={[Thumbnails, Zoom]}
      styles={{ container: { backgroundColor: "rgba(2, 67, 57, 0.96)" } }}
    />
  )
}
