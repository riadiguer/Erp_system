import { DemandRequest, DemandLine, Priority, DemandStatus } from "./types"

const KEY = "erp.purchasing.demands.v1"

function readAll(): DemandRequest[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(KEY) || "[]") } catch { return [] }
}
function writeAll(items: DemandRequest[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function listDemands(): DemandRequest[] {
  return readAll().sort((a,b)=> (b.createdAt.localeCompare(a.createdAt)))
}

function pad(n:number, size=4) { return String(n).padStart(size,"0") }
function year() { return new Date().getFullYear() }
export function nextDemandNumber(): string {
  const items = readAll()
  const y = year()
  const sameYear = items.filter(d => d.number.startsWith(`DA-${y}-`))
  const n = sameYear.length + 1
  return `DA-${y}-${pad(n)}`
}

export function createDemand(payload: Omit<DemandRequest,"id"|"number"|"status"|"createdAt"|"updatedAt">): DemandRequest {
  const now = new Date().toISOString()
  const item: DemandRequest = {
    ...payload,
    id: crypto.randomUUID(),
    number: nextDemandNumber(),
    status: "Brouillon",
    createdAt: now,
    updatedAt: now
  }
  const all = readAll()
  all.push(item); writeAll(all)
  return item
}

export function updateDemand(id: string, patch: Partial<DemandRequest>): DemandRequest | null {
  const all = readAll()
  const idx = all.findIndex(d => d.id === id)
  if (idx === -1) return null
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() }
  writeAll(all)
  return all[idx]
}

export function deleteDemand(id: string) {
  writeAll(readAll().filter(d => d.id !== id))
}

export function getDemand(id: string) {
  return readAll().find(d => d.id === id) || null
}

export function submitDemand(id: string)  { return updateDemand(id, { status: "Soumise" }) }
export function approveDemand(id: string) { return updateDemand(id, { status: "Approuvée" }) }
export function rejectDemand(id: string)  { return updateDemand(id, { status: "Rejetée" }) }
export function cancelDemand(id: string)  { return updateDemand(id, { status: "Annulée" }) }
