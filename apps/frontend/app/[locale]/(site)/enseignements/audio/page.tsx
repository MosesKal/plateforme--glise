import type { Metadata } from "next";
import { createPublicPageMetadata } from "@/lib/seo";
import { AudioLibraryContent } from "@/components/features/teachings/AudioLibraryContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return createPublicPageMetadata(
    (await params).locale,
    "/enseignements/audio",
  );
}

export default function EnseignementsAudioPage() {
  return <AudioLibraryContent />;
}
