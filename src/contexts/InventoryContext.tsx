import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { DataInventory, DataElement, InventorySetup } from '@/types'
import {
  saveInventory,
  loadInventory,
  getCurrentInventoryId,
  setCurrentInventoryId,
} from '@/utils/inventory/storage'
import { calculateRiskScore } from '@/utils/inventory/riskScoring'
import { generateId } from '@/utils/inventory/helpers'

interface InventoryContextType {
  inventory: DataInventory | null
  setInventory: (inventory: DataInventory) => void
  addDataElement: (element: Omit<DataElement, 'id' | 'createdAt' | 'updatedAt' | 'riskLevel' | 'riskScore'>) => void
  updateDataElement: (id: string, updates: Partial<DataElement>) => void
  deleteDataElement: (id: string) => void
  deleteMultipleElements: (ids: string[]) => void
  duplicateDataElement: (id: string) => void
  save: () => void
  createNewInventory: (name: string, setup: InventorySetup) => void
  loadExistingInventory: (id: string) => void
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventoryState] = useState<DataInventory | null>(null)

  // Load current inventory on mount
  useEffect(() => {
    const currentId = getCurrentInventoryId()
    if (currentId) {
      const loaded = loadInventory(currentId)
      if (loaded) {
        setInventoryState(loaded)
      }
    }
  }, [])

  const setInventory = (inv: DataInventory) => {
    setInventoryState(inv)
  }

  const save = () => {
    if (inventory) {
      saveInventory(inventory)
    }
  }

  // Auto-save when inventory changes
  useEffect(() => {
    if (inventory) {
      const timeoutId = setTimeout(() => {
        saveInventory(inventory)
      }, 1000) // Debounce saves by 1 second

      return () => clearTimeout(timeoutId)
    }
  }, [inventory])

  const addDataElement = (
    element: Omit<DataElement, 'id' | 'createdAt' | 'updatedAt' | 'riskLevel' | 'riskScore'>
  ) => {
    if (!inventory) return

    const { score, level } = calculateRiskScore(
      element as DataElement,
      inventory.setup.ageGroups
    )

    const newElement: DataElement = {
      ...element,
      id: generateId(),
      riskScore: score,
      riskLevel: level,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setInventoryState({
      ...inventory,
      dataElements: [...inventory.dataElements, newElement],
      updatedAt: new Date(),
    })
  }

  const updateDataElement = (id: string, updates: Partial<DataElement>) => {
    if (!inventory) return

    setInventoryState({
      ...inventory,
      dataElements: inventory.dataElements.map((el) => {
        if (el.id === id) {
          const updated = { ...el, ...updates, updatedAt: new Date() }
          // Recalculate risk score
          const { score, level } = calculateRiskScore(updated, inventory.setup.ageGroups)
          return {
            ...updated,
            riskScore: score,
            riskLevel: level,
          }
        }
        return el
      }),
      updatedAt: new Date(),
    })
  }

  const deleteDataElement = (id: string) => {
    if (!inventory) return

    setInventoryState({
      ...inventory,
      dataElements: inventory.dataElements.filter((el) => el.id !== id),
      updatedAt: new Date(),
    })
  }

  const deleteMultipleElements = (ids: string[]) => {
    if (!inventory) return

    setInventoryState({
      ...inventory,
      dataElements: inventory.dataElements.filter((el) => !ids.includes(el.id)),
      updatedAt: new Date(),
    })
  }

  const duplicateDataElement = (id: string) => {
    if (!inventory) return

    const original = inventory.dataElements.find((el) => el.id === id)
    if (!original) return

    const { score, level } = calculateRiskScore(original, inventory.setup.ageGroups)

    const duplicate: DataElement = {
      ...original,
      id: generateId(),
      name: `${original.name} (Copy)`,
      riskScore: score,
      riskLevel: level,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setInventoryState({
      ...inventory,
      dataElements: [...inventory.dataElements, duplicate],
      updatedAt: new Date(),
    })
  }

  const createNewInventory = (name: string, setup: InventorySetup) => {
    const newInventory: DataInventory = {
      id: generateId(),
      name,
      setup,
      dataElements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    }

    setInventoryState(newInventory)
    saveInventory(newInventory)
    setCurrentInventoryId(newInventory.id)
  }

  const loadExistingInventory = (id: string) => {
    const loaded = loadInventory(id)
    if (loaded) {
      setInventoryState(loaded)
      setCurrentInventoryId(id)
    }
  }

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        setInventory,
        addDataElement,
        updateDataElement,
        deleteDataElement,
        deleteMultipleElements,
        duplicateDataElement,
        save,
        createNewInventory,
        loadExistingInventory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider')
  }
  return context
}
