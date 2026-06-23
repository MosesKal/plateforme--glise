"use client"

import { useI18n } from "@/components/providers/I18nProvider"
import { useBibleReading } from "@/hooks/useBibleReading"
import { READING_PLANS } from "@/constants/bible"
import { HeroSection } from "./HeroSection"
import { GuideSection } from "./GuideSection"
import { PlanSelector } from "./PlanSelector"
import { LectureduJour } from "./LectureduJour"
import { ProgressionGlobale } from "./ProgressionGlobale"
import { ColonnesProgress } from "./ColonnesProgress"
import { CalendrierLecture } from "./CalendrierLecture"
import { RattrapageSection } from "./RattrapageSection"
import { PartageWhatsApp } from "./PartageWhatsApp"
import { VersetDuJour } from "./VersetDuJour"

export function LectureBibliqueContent() {
  const { t, locale } = useI18n()
  const reading = useBibleReading()

  if (!reading.hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cecj-green border-t-transparent" />
      </div>
    )
  }

  const hasPlan = reading.state !== null

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <HeroSection hasPlan={hasPlan} />

      {/* ── Active plan header ────────────────────────────────────────────── */}
      {hasPlan && (
        <div className="sticky top-[64px] z-40 border-b border-cecj-green/10 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cecj-green/10 px-3 py-1 text-xs font-semibold text-cecj-green">
                <span className="h-1.5 w-1.5 rounded-full bg-cecj-green" />
                {READING_PLANS[reading.state!.planId][locale === "fr" ? "labelFr" : "labelEn"]}
              </span>
              <span className="text-xs text-gray-500">
                {t("lectureBibliquePage.started_on")}{" "}
                {new Date(reading.state!.startDate).toLocaleDateString(
                  locale === "fr" ? "fr-FR" : "en-US",
                  { day: "numeric", month: "long", year: "numeric" },
                )}
              </span>
            </div>
            <button
              onClick={reading.resetPlan}
              className="text-xs text-gray-400 underline-offset-2 hover:text-cecj-green hover:underline"
            >
              {t("lectureBibliquePage.reset_plan")}
            </button>
          </div>
        </div>
      )}

      {/* ── Official guide ────────────────────────────────────────────────── */}
      <GuideSection />

      {/* ── Plan selector (always visible, highlighted if no plan) ────────── */}
      <PlanSelector reading={reading} />

      {/* ── Sections visible only when a plan is active ───────────────────── */}
      {hasPlan && (
        <>
          {/* Verset du jour */}
          <section className="bg-cecj-green py-10">
            <div className="mx-auto max-w-3xl px-4 lg:px-8">
              <VersetDuJour />
            </div>
          </section>

          <LectureduJour reading={reading} />
          <ProgressionGlobale reading={reading} />
          <ColonnesProgress reading={reading} />
          <CalendrierLecture reading={reading} />
          {reading.retard && <RattrapageSection retard={reading.retard} />}
          <PartageWhatsApp reading={reading} />
        </>
      )}
    </main>
  )
}
