import { HomePageContent } from "@/components/features/home/HomePageContent"
import { getGalleryImages } from "@/lib/gallery"

export default function AccueilPage() {
  const galleryImages = getGalleryImages()
  return <HomePageContent galleryImages={galleryImages} />
}
