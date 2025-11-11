import { useMemo, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInventory } from '@/contexts/InventoryContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Position,
  MarkerType,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ArrowLeft, Database, Server, Users, Trash2, Filter } from 'lucide-react'
import type { DataElement, DataCategory, RiskLevel, StorageLocation } from '@/types'
import { DATA_CATEGORY_LABELS, STORAGE_LOCATION_LABELS } from '@/data/inventory/constants'

type NodeData = {
  label: string
  description?: string
  count?: number
  risk?: RiskLevel
  category?: string
  elements?: string[]
}

type FilterOption = 'all' | 'high_risk' | 'medium_risk' | 'low_risk' | DataCategory

export function DataFlowDiagram() {
  const navigate = useNavigate()
  const { inventory } = useInventory()
  const [filter, setFilter] = useState<FilterOption>('all')

  if (!inventory) return null

  // Filter data elements based on selection
  const filteredElements = useMemo(() => {
    if (filter === 'all') return inventory.dataElements
    if (filter === 'high_risk') return inventory.dataElements.filter((el) => el.riskLevel === 'high')
    if (filter === 'medium_risk')
      return inventory.dataElements.filter((el) => el.riskLevel === 'medium')
    if (filter === 'low_risk') return inventory.dataElements.filter((el) => el.riskLevel === 'low')
    // Filter by category
    return inventory.dataElements.filter((el) => el.category === filter)
  }, [inventory.dataElements, filter])

  // Create nodes and edges for the flow diagram
  const { nodes, edges } = useMemo(() => {
    const nodes: Node<NodeData>[] = []
    const edges: Edge[] = []
    let nodeId = 0

    // Constants for layout
    const COLUMN_WIDTH = 300
    const ROW_HEIGHT = 100
    const START_X = 50
    const START_Y = 50

    // 1. Source Nodes (Column 1) - Where data comes from
    const sourceMap = new Map<string, string[]>()
    filteredElements.forEach((element) => {
      const source = element.source
      if (!sourceMap.has(source)) {
        sourceMap.set(source, [])
      }
      sourceMap.get(source)!.push(element.name)
    })

    const sourceNodeIds: string[] = []
    Array.from(sourceMap.entries()).forEach(([source, elements], idx) => {
      const id = `source-${nodeId++}`
      sourceNodeIds.push(id)
      nodes.push({
        id,
        type: 'default',
        position: { x: START_X, y: START_Y + idx * ROW_HEIGHT },
        data: {
          label: source.replace(/_/g, ' ').toUpperCase(),
          count: elements.length,
          description: `${elements.length} element${elements.length > 1 ? 's' : ''}`,
          category: 'source',
        },
        sourcePosition: Position.Right,
        style: {
          background: '#3b82f6',
          color: 'white',
          border: '2px solid #2563eb',
          borderRadius: '8px',
          padding: '10px',
          width: '180px',
        },
      })
    })

    // 2. Data Element Nodes (Column 2) - Grouped by category and risk
    const categoryGroups = new Map<DataCategory, DataElement[]>()
    filteredElements.forEach((element) => {
      if (!categoryGroups.has(element.category)) {
        categoryGroups.set(element.category, [])
      }
      categoryGroups.get(element.category)!.push(element)
    })

    const dataNodeIds = new Map<string, string>()
    let yPos = START_Y
    Array.from(categoryGroups.entries()).forEach(([category, elements]) => {
      // Group by risk within category
      const riskGroups = {
        high: elements.filter((el) => el.riskLevel === 'high'),
        medium: elements.filter((el) => el.riskLevel === 'medium'),
        low: elements.filter((el) => el.riskLevel === 'low'),
      }

      Object.entries(riskGroups).forEach(([risk, riskElements]) => {
        if (riskElements.length === 0) return

        const id = `data-${category}-${risk}`
        dataNodeIds.set(`${category}-${risk}`, id)
        nodes.push({
          id,
          type: 'default',
          position: { x: START_X + COLUMN_WIDTH, y: yPos },
          data: {
            label: DATA_CATEGORY_LABELS[category],
            count: riskElements.length,
            risk: risk as RiskLevel,
            description: `${riskElements.length} ${risk} risk`,
            elements: riskElements.map((el) => el.name),
            category: 'data',
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          style: {
            background:
              risk === 'high' ? '#fee2e2' : risk === 'medium' ? '#fef3c7' : '#dcfce7',
            color: risk === 'high' ? '#991b1b' : risk === 'medium' ? '#92400e' : '#14532d',
            border: `2px solid ${risk === 'high' ? '#dc2626' : risk === 'medium' ? '#f59e0b' : '#22c55e'}`,
            borderRadius: '8px',
            padding: '10px',
            width: '200px',
          },
        })

        // Connect sources to data elements
        riskElements.forEach((element) => {
          const sourceId = sourceNodeIds.find((sid) => {
            const sourceNode = nodes.find((n) => n.id === sid)
            return sourceNode?.data.label === element.source.replace(/_/g, ' ').toUpperCase()
          })
          if (sourceId) {
            edges.push({
              id: `${sourceId}-${id}`,
              source: sourceId,
              target: id,
              animated: risk === 'high',
              style: { stroke: risk === 'high' ? '#dc2626' : '#94a3b8' },
            })
          }
        })

        yPos += ROW_HEIGHT
      })
    })

    // 3. Storage Nodes (Column 3) - Where data is stored
    const storageMap = new Map<string, { elements: string[]; risk: RiskLevel }>()
    filteredElements.forEach((element) => {
      const storage = element.storageLocation
      if (!storageMap.has(storage)) {
        storageMap.set(storage, { elements: [], risk: 'low' })
      }
      const storageData = storageMap.get(storage)!
      storageData.elements.push(element.name)
      // Update risk to highest among elements
      if (element.riskLevel === 'high' || storageData.risk === 'high') {
        storageData.risk = 'high'
      } else if (element.riskLevel === 'medium' || storageData.risk === 'medium') {
        storageData.risk = 'medium'
      }
    })

    const storageNodeIds = new Map<string, string>()
    let storageY = START_Y
    Array.from(storageMap.entries()).forEach(([storage, data]) => {
      const id = `storage-${nodeId++}`
      storageNodeIds.set(storage, id)
      nodes.push({
        id,
        type: 'default',
        position: { x: START_X + COLUMN_WIDTH * 2, y: storageY },
        data: {
          label: STORAGE_LOCATION_LABELS[storage as StorageLocation],
          count: data.elements.length,
          risk: data.risk,
          description: `${data.elements.length} element${data.elements.length > 1 ? 's' : ''}`,
          category: 'storage',
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          background: '#f3f4f6',
          color: '#1f2937',
          border: '2px solid #9ca3af',
          borderRadius: '8px',
          padding: '10px',
          width: '200px',
        },
      })

      // Connect data elements to storage
      filteredElements
        .filter((el) => el.storageLocation === storage)
        .forEach((element) => {
          const dataNodeId = dataNodeIds.get(`${element.category}-${element.riskLevel}`)
          if (dataNodeId) {
            edges.push({
              id: `${dataNodeId}-${id}`,
              source: dataNodeId,
              target: id,
              style: { stroke: '#94a3b8' },
            })
          }
        })

      storageY += ROW_HEIGHT * 1.5
    })

    // 4. Third-Party Nodes (Column 4) - Where data is shared
    const thirdPartyMap = new Map<string, { elements: string[]; risk: RiskLevel }>()
    filteredElements
      .filter((el) => el.sharedWithThirdParties)
      .forEach((element) => {
        element.thirdPartyRecipients.forEach((recipient) => {
          if (!thirdPartyMap.has(recipient.name)) {
            thirdPartyMap.set(recipient.name, { elements: [], risk: 'low' })
          }
          const tpData = thirdPartyMap.get(recipient.name)!
          tpData.elements.push(element.name)
          if (element.riskLevel === 'high' || tpData.risk === 'high') {
            tpData.risk = 'high'
          } else if (element.riskLevel === 'medium' || tpData.risk === 'medium') {
            tpData.risk = 'medium'
          }
        })
      })

    let thirdPartyY = START_Y
    Array.from(thirdPartyMap.entries()).forEach(([name, data]) => {
      const id = `thirdparty-${nodeId++}`
      nodes.push({
        id,
        type: 'default',
        position: { x: START_X + COLUMN_WIDTH * 3, y: thirdPartyY },
        data: {
          label: name || 'Unnamed Vendor',
          count: data.elements.length,
          risk: data.risk,
          description: `Receives ${data.elements.length} element${data.elements.length > 1 ? 's' : ''}`,
          category: 'thirdparty',
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          background: '#fef3c7',
          color: '#92400e',
          border: '2px solid #f59e0b',
          borderRadius: '8px',
          padding: '10px',
          width: '200px',
        },
      })

      // Connect storage to third parties
      filteredElements
        .filter((el) => el.sharedWithThirdParties)
        .filter((el) => el.thirdPartyRecipients.some((r) => r.name === name))
        .forEach((element) => {
          const storageId = storageNodeIds.get(element.storageLocation)
          if (storageId) {
            edges.push({
              id: `${storageId}-${id}`,
              source: storageId,
              target: id,
              animated: data.risk === 'high',
              style: { stroke: data.risk === 'high' ? '#f59e0b' : '#94a3b8', strokeDasharray: '5,5' },
            })
          }
        })

      thirdPartyY += ROW_HEIGHT
    })

    // 5. Deletion Node (Column 5) - End of lifecycle
    const deletionId = `deletion-${nodeId++}`
    nodes.push({
      id: deletionId,
      type: 'default',
      position: { x: START_X + COLUMN_WIDTH * 4, y: START_Y + ROW_HEIGHT * 2 },
      data: {
        label: 'Data Deletion',
        description: 'End of lifecycle',
        category: 'deletion',
      },
      targetPosition: Position.Left,
      style: {
        background: '#ef4444',
        color: 'white',
        border: '2px solid #dc2626',
        borderRadius: '8px',
        padding: '10px',
        width: '150px',
      },
    })

    // Connect storage nodes to deletion
    storageNodeIds.forEach((storageId) => {
      edges.push({
        id: `${storageId}-${deletionId}`,
        source: storageId,
        target: deletionId,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#94a3b8', strokeDasharray: '5,5' },
      })
    })

    return { nodes, edges }
  }, [filteredElements])

  const onNodesChange = useCallback(() => {}, [])
  const onEdgesChange = useCallback(() => {}, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-[1800px]">
        <Button variant="ghost" onClick={() => navigate('/inventory')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Data Flow Diagram</h1>
          <p className="text-muted-foreground">
            Visual map showing how data flows through your system from collection to deletion
          </p>
        </div>

        {/* Filter Controls */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter View
                </CardTitle>
                <CardDescription>
                  Focus on specific data types or risk levels
                </CardDescription>
              </div>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterOption)}
                className="w-64"
              >
                <option value="all">All Data ({inventory.dataElements.length})</option>
                <option value="high_risk">
                  High Risk Only ({inventory.dataElements.filter((el) => el.riskLevel === 'high').length})
                </option>
                <option value="medium_risk">
                  Medium Risk Only ({inventory.dataElements.filter((el) => el.riskLevel === 'medium').length})
                </option>
                <option value="low_risk">
                  Low Risk Only ({inventory.dataElements.filter((el) => el.riskLevel === 'low').length})
                </option>
                <option disabled>──────────</option>
                {Array.from(
                  new Set(inventory.dataElements.map((el) => el.category))
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {DATA_CATEGORY_LABELS[cat]} (
                    {inventory.dataElements.filter((el) => el.category === cat).length})
                  </option>
                ))}
              </Select>
            </div>
          </CardHeader>
        </Card>

        {/* Legend */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span>
                  <strong>Sources</strong> - Where data originates
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <strong>Data Elements</strong>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    High Risk
                  </Badge>
                  <Badge variant="warning" className="text-xs">
                    Medium
                  </Badge>
                  <Badge variant="success" className="text-xs">
                    Low
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-gray-600" />
                <span>
                  <strong>Storage</strong> - Where data is kept
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-yellow-600" />
                <span>
                  <strong>Third Parties</strong> - External recipients
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-600" />
                <span>
                  <strong>Deletion</strong> - End of lifecycle
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flow Diagram */}
        <Card>
          <CardContent className="p-0">
            <div style={{ height: '700px', width: '100%' }}>
              {nodes.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2">No Data Elements</p>
                    <p>Add data elements to see your data flow diagram</p>
                  </div>
                </div>
              ) : (
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  fitView
                  attributionPosition="bottom-left"
                >
                  <Background />
                  <Controls />
                  <MiniMap
                    nodeColor={(node) => {
                      const category = node.data.category
                      if (category === 'source') return '#3b82f6'
                      if (category === 'storage') return '#9ca3af'
                      if (category === 'thirdparty') return '#f59e0b'
                      if (category === 'deletion') return '#ef4444'
                      // Data nodes - color by risk
                      const risk = node.data.risk
                      if (risk === 'high') return '#dc2626'
                      if (risk === 'medium') return '#f59e0b'
                      return '#22c55e'
                    }}
                  />
                </ReactFlow>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="mt-6 bg-muted">
          <CardHeader>
            <CardTitle className="text-base">How to Read This Diagram</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              <strong>Flow Direction:</strong> Data flows from left to right, showing the complete
              lifecycle from collection to deletion.
            </p>
            <p>
              <strong>Color Coding:</strong> Data elements are color-coded by risk level (red =
              high, yellow = medium, green = low).
            </p>
            <p>
              <strong>Animated Lines:</strong> Animated connections indicate high-risk data flows
              requiring extra attention.
            </p>
            <p>
              <strong>Dashed Lines:</strong> Represent data sharing with third parties or deletion
              processes.
            </p>
            <p>
              <strong>Interaction:</strong> Use zoom/pan controls to navigate. Click the minimap to
              jump to different sections.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
