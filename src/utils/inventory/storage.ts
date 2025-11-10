import type { DataInventory } from '@/types'

const STORAGE_KEY_PREFIX = 'edtech_compliance_inventory_'
const INVENTORIES_LIST_KEY = 'edtech_compliance_inventories_list'
const CURRENT_INVENTORY_KEY = 'edtech_compliance_current_inventory_id'

/**
 * Save a data inventory to localStorage
 */
export function saveInventory(inventory: DataInventory): void {
  try {
    // Update the inventory's updatedAt timestamp
    inventory.updatedAt = new Date()
    inventory.version = (inventory.version || 0) + 1

    // Save the inventory
    const key = STORAGE_KEY_PREFIX + inventory.id
    localStorage.setItem(key, JSON.stringify(inventory))

    // Update the list of inventory IDs
    const inventoryList = getInventoryList()
    if (!inventoryList.includes(inventory.id)) {
      inventoryList.push(inventory.id)
      localStorage.setItem(INVENTORIES_LIST_KEY, JSON.stringify(inventoryList))
    }

    // Set as current inventory
    localStorage.setItem(CURRENT_INVENTORY_KEY, inventory.id)
  } catch (error) {
    console.error('Failed to save inventory to localStorage:', error)
    throw new Error('Failed to save inventory. Storage may be full.')
  }
}

/**
 * Load a data inventory from localStorage by ID
 */
export function loadInventory(id: string): DataInventory | null {
  try {
    const key = STORAGE_KEY_PREFIX + id
    const data = localStorage.getItem(key)
    if (!data) return null

    const inventory = JSON.parse(data) as DataInventory

    // Convert date strings back to Date objects
    inventory.createdAt = new Date(inventory.createdAt)
    inventory.updatedAt = new Date(inventory.updatedAt)
    inventory.dataElements = inventory.dataElements.map((element) => ({
      ...element,
      createdAt: new Date(element.createdAt),
      updatedAt: new Date(element.updatedAt),
    }))

    return inventory
  } catch (error) {
    console.error('Failed to load inventory from localStorage:', error)
    return null
  }
}

/**
 * Get the list of all inventory IDs
 */
export function getInventoryList(): string[] {
  try {
    const data = localStorage.getItem(INVENTORIES_LIST_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to get inventory list:', error)
    return []
  }
}

/**
 * Get all saved inventories (basic info only for listing)
 */
export function getAllInventories(): Array<{
  id: string
  name: string
  updatedAt: Date
  elementCount: number
}> {
  const inventoryList = getInventoryList()
  return inventoryList
    .map((id) => {
      const inventory = loadInventory(id)
      if (!inventory) return null
      return {
        id: inventory.id,
        name: inventory.name,
        updatedAt: inventory.updatedAt,
        elementCount: inventory.dataElements.length,
      }
    })
    .filter((inv): inv is NonNullable<typeof inv> => inv !== null)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}

/**
 * Delete an inventory from localStorage
 */
export function deleteInventory(id: string): void {
  try {
    const key = STORAGE_KEY_PREFIX + id
    localStorage.removeItem(key)

    // Update the list
    const inventoryList = getInventoryList()
    const updatedList = inventoryList.filter((invId) => invId !== id)
    localStorage.setItem(INVENTORIES_LIST_KEY, JSON.stringify(updatedList))

    // Clear current if it was the deleted one
    const currentId = getCurrentInventoryId()
    if (currentId === id) {
      localStorage.removeItem(CURRENT_INVENTORY_KEY)
    }
  } catch (error) {
    console.error('Failed to delete inventory:', error)
    throw new Error('Failed to delete inventory')
  }
}

/**
 * Get the ID of the current (most recently used) inventory
 */
export function getCurrentInventoryId(): string | null {
  return localStorage.getItem(CURRENT_INVENTORY_KEY)
}

/**
 * Set the current inventory ID
 */
export function setCurrentInventoryId(id: string): void {
  localStorage.setItem(CURRENT_INVENTORY_KEY, id)
}

/**
 * Clear all inventories from localStorage
 */
export function clearAllInventories(): void {
  const inventoryList = getInventoryList()
  inventoryList.forEach((id) => {
    const key = STORAGE_KEY_PREFIX + id
    localStorage.removeItem(key)
  })
  localStorage.removeItem(INVENTORIES_LIST_KEY)
  localStorage.removeItem(CURRENT_INVENTORY_KEY)
}

/**
 * Duplicate an existing inventory with a new name
 */
export function duplicateInventory(id: string, newName: string): DataInventory | null {
  const original = loadInventory(id)
  if (!original) return null

  const duplicate: DataInventory = {
    ...original,
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: newName,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    dataElements: original.dataElements.map((element) => ({
      ...element,
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  }

  saveInventory(duplicate)
  return duplicate
}
