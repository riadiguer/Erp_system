export type Priority = 'Basse' | 'Moyenne' | 'Haute'
export type DemandStatus = 'Brouillon' | 'Soumise' | 'Approuvée' | 'Rejetée' | 'Convertie' | 'Annulée'

export interface Material {
  id: string
  name: string
  uom: string
  defaultSupplier?: string
  lastPrice?: number
}

export interface DemandLine {
  id: string
  materialId: string
  materialName: string
  uom: string
  quantity: number
  suggestedSupplier?: string
  estimatedPrice?: number
  neededDate?: string
}

export interface DemandRequest {
  id: string               // UUID interne
  number: string           // ex: "DA-2025-0001"
  date: string             // ISO yyyy-mm-dd (aujourd’hui)
  site: string
  requesterId: string
  requesterName: string
  priority: Priority
  category: string
  neededDate?: string
  comment?: string
  status: DemandStatus
  lines: DemandLine[]
  attachments?: { name: string; url?: string }[]
  createdAt: string
  updatedAt: string
}
