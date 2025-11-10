import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useInventory } from '@/contexts/InventoryContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Home, Database, AlertTriangle, TrendingUp, FileText } from 'lucide-react'
import { getRiskBadgeVariant, getRiskLabel } from '@/utils/inventory/riskScoring'
import { PRODUCT_TEMPLATES } from '@/data/inventory/templates'
import { countUniqueVendors } from '@/utils/inventory/helpers'
import type { ProductType } from '@/types'

export function InventoryDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { inventory, addDataElement } = useInventory()

  // Load template if requested
  useEffect(() => {
    if (location.state?.loadTemplate && location.state?.productType && inventory) {
      const productType = location.state.productType as ProductType
      const template = PRODUCT_TEMPLATES[productType]
      template.elements.forEach((element: any) => {
        addDataElement(element)
      })
      // Clear the state
      window.history.replaceState({}, '')
    }
  }, [location.state, inventory, addDataElement])

  if (!inventory) return null

  const stats = {
    total: inventory.dataElements.length,
    highRisk: inventory.dataElements.filter((el) => el.riskLevel === 'high').length,
    mediumRisk: inventory.dataElements.filter((el) => el.riskLevel === 'medium').length,
    lowRisk: inventory.dataElements.filter((el) => el.riskLevel === 'low').length,
    vendors: countUniqueVendors(inventory.dataElements),
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <div className="border-l h-6" />
              <h1 className="text-xl font-semibold">{inventory.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/inventory/insights')}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Insights
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/inventory/export')}>
                <FileText className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Elements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>High Risk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.highRisk}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Medium Risk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.mediumRisk}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Low Risk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.lowRisk}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Third Parties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.vendors}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Button className="h-24" onClick={() => navigate('/inventory/add')}>
            <div className="text-center">
              <Plus className="h-6 w-6 mx-auto mb-2" />
              <div>Add Data Element</div>
            </div>
          </Button>
          <Button variant="outline" className="h-24" onClick={() => navigate('/inventory/flow')}>
            <div className="text-center">
              <Database className="h-6 w-6 mx-auto mb-2" />
              <div>Data Flow Diagram</div>
            </div>
          </Button>
          <Button variant="outline" className="h-24" onClick={() => navigate('/inventory/gaps')}>
            <div className="text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
              <div>Gap Analysis</div>
            </div>
          </Button>
          <Button variant="outline" className="h-24" onClick={() => navigate('/inventory/insights')}>
            <div className="text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
              <div>Compliance Insights</div>
            </div>
          </Button>
        </div>

        {/* Data Elements Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Data Elements</CardTitle>
                <CardDescription>
                  {stats.total} element{stats.total !== 1 ? 's' : ''} in your inventory
                </CardDescription>
              </div>
              <Button onClick={() => navigate('/inventory/add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Element
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {inventory.dataElements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No data elements yet</p>
                <p className="text-sm">Click "Add Element" to start building your inventory</p>
              </div>
            ) : (
              <div className="space-y-2">
                {inventory.dataElements.map((element) => (
                  <div
                    key={element.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => navigate(`/inventory/edit/${element.id}`)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{element.name}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {element.category.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {element.sharedWithThirdParties && (
                        <Badge variant="outline">
                          {element.thirdPartyRecipients.length} third parties
                        </Badge>
                      )}
                      <Badge variant={getRiskBadgeVariant(element.riskLevel)}>
                        {getRiskLabel(element.riskLevel)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
