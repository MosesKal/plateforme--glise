export interface SitePage {
  id: string
  slug: string
  titleFr: string
  titleEn?: string
  contentFr: string
  contentEn?: string
  metaDescription?: string
  coverUrl?: string
  published: boolean
  createdAt: string
  updatedAt: string
}
