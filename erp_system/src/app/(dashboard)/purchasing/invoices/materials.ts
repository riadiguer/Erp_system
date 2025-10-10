import { Material } from "@/lib/purchasing/types"

export const demoMaterials: Material[] = [
  { id: "MAT-001", name: "Papier 90g", uom: "Rame", defaultSupplier: "PAPERCO", lastPrice: 1200 },
  { id: "MAT-002", name: "Encre bleue", uom: "L", defaultSupplier: "INKSA", lastPrice: 800 },
  { id: "MAT-003", name: "Carton rigide", uom: "Feuille", defaultSupplier: "CARTONPLUS", lastPrice: 1800 },
  { id: "MAT-004", name: "Adhésif double face", uom: "Rouleau", defaultSupplier: "GLUEPRO", lastPrice: 950 }
]
