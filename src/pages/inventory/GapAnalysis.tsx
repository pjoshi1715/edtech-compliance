import { useNavigate } from 'react-router-dom'
import { useInventory } from '@/contexts/InventoryContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { analyzeComplianceGaps } from '@/utils/inventory/gapAnalysis'
import { ArrowLeft, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'
import type { ComplianceGap } from '@/types'

export function GapAnalysis() {
  const navigate = useNavigate()
  const { inventory } = useInventory()

  if (!inventory) return null

  const gaps = analyzeComplianceGaps(inventory.dataElements, inventory.setup.ageGroups)

  const criticalGaps = gaps.filter((g) => g.severity === 'critical')
  const importantGaps = gaps.filter((g) => g.severity === 'important')
  const recommendations = gaps.filter((g) => g.severity === 'recommendation')

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'important':
        return 'warning'
      case 'recommendation':
        return 'info'
      default:
        return 'default'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'important':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'recommendation':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return null
    }
  }

  const getAffectedElementNames = (elementIds: string[]) => {
    return elementIds
      .map((id) => inventory.dataElements.find((el) => el.id === id)?.name)
      .filter((name): name is string => Boolean(name))
  }

  const renderGapCard = (gap: ComplianceGap) => {
    const affectedNames = getAffectedElementNames(gap.affectedElements)

    return (
      <Card key={gap.id} className="border-l-4" style={{
        borderLeftColor: gap.severity === 'critical' ? '#dc2626' :
                         gap.severity === 'important' ? '#ca8a04' : '#2563eb'
      }}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {getSeverityIcon(gap.severity)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-lg">{gap.title}</CardTitle>
                  <Badge variant={getSeverityBadgeVariant(gap.severity)}>
                    {gap.severity.charAt(0).toUpperCase() + gap.severity.slice(1)}
                  </Badge>
                </div>
                <CardDescription>{gap.description}</CardDescription>
              </div>
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Priority {gap.priority}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Why It Matters</h4>
            <p className="text-sm text-muted-foreground">{gap.whyItMatters}</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Recommended Action</h4>
            <p className="text-sm text-muted-foreground">{gap.recommendedAction}</p>
          </div>

          {affectedNames.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">
                Affected Data Elements ({affectedNames.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {affectedNames.map((name, idx) => (
                  <Badge key={idx} variant="outline" className="font-normal">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('/inventory')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Compliance Gap Analysis</h1>
          <p className="text-muted-foreground">
            Automated analysis of your data inventory to identify potential compliance risks and
            recommended improvements
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Gaps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{gaps.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Critical</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{criticalGaps.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Important</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{importantGaps.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{recommendations.length}</div>
            </CardContent>
          </Card>
        </div>

        {gaps.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-semibold mb-2">No Gaps Detected</h3>
              <p className="text-muted-foreground">
                Great job! Your data inventory appears to have strong compliance controls in place.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Critical Gaps */}
            {criticalGaps.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <h2 className="text-2xl font-bold">Critical Gaps</h2>
                  <Badge variant="destructive">{criticalGaps.length}</Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  These issues require immediate attention to avoid significant compliance risks and
                  potential legal liability.
                </p>
                <div className="space-y-4">
                  {criticalGaps.map((gap) => renderGapCard(gap))}
                </div>
              </div>
            )}

            {/* Important Gaps */}
            {importantGaps.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                  <h2 className="text-2xl font-bold">Important Gaps</h2>
                  <Badge variant="warning">{importantGaps.length}</Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  These issues should be addressed soon to strengthen your compliance posture and
                  reduce risk.
                </p>
                <div className="space-y-4">
                  {importantGaps.map((gap) => renderGapCard(gap))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Recommendations</h2>
                  <Badge variant="info">{recommendations.length}</Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  These are best practices that will further improve your data security and
                  compliance readiness.
                </p>
                <div className="space-y-4">
                  {recommendations.map((gap) => renderGapCard(gap))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Next Steps */}
        {gaps.length > 0 && (
          <Card className="mt-8 bg-muted">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>1. Address critical gaps first - these pose the highest compliance risk</p>
              <p>
                2. Click on affected data elements to navigate to them and make necessary updates
              </p>
              <p>
                3. Document your remediation plan and track progress over time
              </p>
              <p>
                4. Re-run this analysis after making changes to verify improvements
              </p>
              <p>
                5. Consider consulting with a legal or compliance professional for complex issues
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
