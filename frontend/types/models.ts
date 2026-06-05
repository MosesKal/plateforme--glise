export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "ADMIN" | "MODERATEUR" | "MEMBRE"
  createdAt: string
}

export interface Membre {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateNaissance?: string
  status: "ACTIF" | "INACTIF"
  createdAt: string
}

export interface Evenement {
  id: string
  title: string
  description?: string
  date: string
  location?: string
  createdAt: string
}

export interface Groupe {
  id: string
  name: string
  description?: string
  responsableId?: string
  createdAt: string
}

export interface Don {
  id: string
  montant: number
  membreId?: string
  date: string
  note?: string
}
