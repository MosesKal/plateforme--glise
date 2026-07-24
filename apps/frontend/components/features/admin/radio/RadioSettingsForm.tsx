"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import type { AdminRadioStation, RadioStationInput } from "@cecj/shared"
import { Button } from "@/components/ui/Button"
import { ImageUpload } from "@/components/ui/ImageUpload"
import { Input } from "@/components/ui/Input"
import { useSaveRadio, useTestRadioStream } from "@/hooks/admin/useAdminRadio"
import {
  radioFormSchema,
  type RadioFormValues,
} from "@/lib/validations/admin/radio"
import { RadioPreview } from "./RadioPreview"

const EMPTY_VALUES: RadioFormValues = {
  nameFr: "",
  nameEn: "",
  descriptionFr: "",
  descriptionEn: "",
  streamUrl: "https://stream.zeno.fm/t2utmgpt1m6tv",
  websiteUrl: "",
  coverImage: "",
  isActive: false,
}

function defaults(station: AdminRadioStation | null): RadioFormValues {
  if (!station) return EMPTY_VALUES
  return {
    nameFr: station.nameFr,
    nameEn: station.nameEn ?? "",
    descriptionFr: station.descriptionFr ?? "",
    descriptionEn: station.descriptionEn ?? "",
    streamUrl: station.streamUrl,
    websiteUrl: station.websiteUrl ?? "",
    coverImage: station.coverImage ?? "",
    isActive: station.isActive,
  }
}

function optional(value: string): string | undefined {
  return value.trim() || undefined
}

export function RadioSettingsForm({
  station,
}: {
  station: AdminRadioStation | null
}) {
  const saveRadio = useSaveRadio()
  const testStream = useTestRadioStream()
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<RadioFormValues>({
    resolver: zodResolver(radioFormSchema),
    defaultValues: defaults(station),
  })

  const [nameFr, descriptionFr, coverImage, isActive] = useWatch({
    control,
    name: ["nameFr", "descriptionFr", "coverImage", "isActive"],
  })

  const submit = async (values: RadioFormValues) => {
    const payload: RadioStationInput = {
      nameFr: values.nameFr.trim(),
      nameEn: optional(values.nameEn),
      descriptionFr: optional(values.descriptionFr),
      descriptionEn: optional(values.descriptionEn),
      streamUrl: values.streamUrl.trim(),
      websiteUrl: optional(values.websiteUrl),
      coverImage: optional(values.coverImage),
      isActive: values.isActive,
    }
    try {
      await saveRadio.mutateAsync(payload)
    } catch {
      // Le MutationCache global affiche l’erreur et conserve le formulaire.
    }
  }

  const testCurrentStream = async () => {
    if (!(await trigger("streamUrl"))) return
    try {
      await testStream.mutateAsync(getValues("streamUrl").trim())
    } catch {
      // Le MutationCache global affiche le diagnostic du backend.
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <form
        onSubmit={handleSubmit(submit)}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <section className="space-y-4">
          <div>
            <h2 className="font-semibold text-gray-900">Informations publiques</h2>
            <p className="mt-1 text-sm text-gray-500">
              Ces informations sont visibles par tous les visiteurs.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              id="nameFr"
              label="Nom français *"
              error={errors.nameFr?.message}
              {...register("nameFr")}
            />
            <Input
              id="nameEn"
              label="Nom anglais"
              error={errors.nameEn?.message}
              {...register("nameEn")}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-gray-700">
              Description française
              <textarea
                rows={5}
                {...register("descriptionFr")}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-cecj-green focus:outline-none focus:ring-1 focus:ring-cecj-green"
              />
              {errors.descriptionFr && (
                <span className="text-xs text-red-600">{errors.descriptionFr.message}</span>
              )}
            </label>
            <label className="space-y-1 text-sm font-medium text-gray-700">
              Description anglaise
              <textarea
                rows={5}
                {...register("descriptionEn")}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-cecj-green focus:outline-none focus:ring-1 focus:ring-cecj-green"
              />
              {errors.descriptionEn && (
                <span className="text-xs text-red-600">{errors.descriptionEn.message}</span>
              )}
            </label>
          </div>
        </section>

        <section className="space-y-4 border-t border-gray-100 pt-6">
          <div>
            <h2 className="font-semibold text-gray-900">Diffusion</h2>
            <p className="mt-1 text-sm text-gray-500">
              Utilisez uniquement l’URL publique HTTPS d’écoute, jamais une clé de diffusion.
            </p>
          </div>
          <Input
            id="streamUrl"
            label="URL publique du flux *"
            placeholder="https://stream.zeno.fm/..."
            error={errors.streamUrl?.message}
            {...register("streamUrl")}
          />
          <Input
            id="websiteUrl"
            label="Site officiel de la radio"
            placeholder="https://..."
            error={errors.websiteUrl?.message}
            {...register("websiteUrl")}
          />
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">Image de couverture</p>
            <ImageUpload
              value={coverImage}
              onChange={(url) =>
                setValue("coverImage", url, { shouldDirty: true, shouldValidate: true })
              }
            />
            {errors.coverImage && (
              <p className="mt-1 text-xs text-red-600">{errors.coverImage.message}</p>
            )}
          </div>
          <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <input
              type="checkbox"
              {...register("isActive")}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-cecj-green focus:ring-cecj-green"
            />
            <span>
              <span className="block text-sm font-semibold text-gray-800">Radio active</span>
              <span className="block text-xs leading-relaxed text-gray-500">
                Affiche le CTA, la section publique et rend le flux disponible à l’écoute.
              </span>
            </span>
          </label>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            loading={testStream.isPending}
            onClick={testCurrentStream}
          >
            Tester le flux
          </Button>
          <Button
            type="submit"
            loading={saveRadio.isPending}
            className="bg-cecj-green hover:bg-cecj-green/90 focus:ring-cecj-green"
          >
            Enregistrer la configuration
          </Button>
        </div>
      </form>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <RadioPreview
          name={nameFr}
          description={descriptionFr}
          coverImage={coverImage}
          isActive={isActive}
        />
      </div>
    </div>
  )
}
