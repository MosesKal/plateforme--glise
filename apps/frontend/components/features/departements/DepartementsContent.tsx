"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { adminDepartmentsApi, type Department } from "@/lib/api/admin/departments"
import { stagger, fadeUp, inView } from "@/lib/motion"

function DepartmentCard({ dept }: { dept: Department }) {
  return (
    <motion.div
      variants={fadeUp}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {dept.photoUrl ? (
        <div className="relative h-48 overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dept.photoUrl}
            alt={dept.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cecj-green/60 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <h3 className="font-bold text-white drop-shadow">{dept.name}</h3>
            {dept.leaderName && (
              <p className="text-sm text-white/80">{dept.leaderName}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-48 items-end bg-gradient-to-br from-cecj-green to-cecj-green/70 p-5">
          <div>
            <h3 className="font-bold text-white">{dept.name}</h3>
            {dept.leaderName && (
              <p className="text-sm text-white/80">{dept.leaderName}</p>
            )}
          </div>
        </div>
      )}

      {dept.description && (
        <div className="flex flex-1 flex-col p-5">
          <p className="text-sm leading-relaxed text-gray-500 line-clamp-3">{dept.description}</p>
        </div>
      )}
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="h-48 bg-gray-100" />
      <div className="p-5 space-y-2">
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-3/4 rounded bg-gray-100" />
      </div>
    </div>
  )
}

export function DepartementsContent() {
  const { data: departments = [], isLoading } = useQuery<Department[]>({
    queryKey: ["public", "departments"],
    queryFn: () => adminDepartmentsApi.list(true),
  })

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-cecj-green py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-16 left-0 h-80 w-80 rounded-full bg-cecj-gold/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
          <motion.div {...inView()} variants={stagger} className="space-y-5">
            <motion.span variants={fadeUp} className="inline-block rounded-full border border-cecj-gold/40 bg-cecj-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cecj-gold">
              Structure de l&apos;église
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl font-bold text-white md:text-5xl">
              Nos Départements
            </motion.h1>
            <motion.p variants={fadeUp} className="mx-auto max-w-xl text-lg text-white/70">
              Chaque département est un pilier du corps de Christ, œuvrant ensemble pour la croissance de l&apos;église.
            </motion.p>
            <motion.div variants={fadeUp} className="pt-2">
              <span className="text-3xl font-bold text-cecj-gold">{departments.length}</span>
              <span className="ml-2 text-sm font-semibold uppercase tracking-widest text-white/50">Départements actifs</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : departments.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-400">Aucun département disponible pour le moment.</p>
          </div>
        ) : (
          <motion.div {...inView()} variants={stagger} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <DepartmentCard key={dept.id} dept={dept} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
