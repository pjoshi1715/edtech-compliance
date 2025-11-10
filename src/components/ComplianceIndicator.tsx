import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { regulations } from '@/data/regulations'
import { Shield, AlertTriangle } from 'lucide-react'

interface ComplianceIndicatorProps {
  triggeredRegulations: string[]
}

export function ComplianceIndicator({ triggeredRegulations }: ComplianceIndicatorProps) {
  if (triggeredRegulations.length === 0) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Compliance Detection</CardTitle>
          </div>
          <CardDescription>
            Answer questions to see which regulations apply to your edtech company
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const criticalRegs = triggeredRegulations.filter(
    (id) => regulations[id]?.priority === 'critical'
  )
  const highRegs = triggeredRegulations.filter(
    (id) => regulations[id]?.priority === 'high'
  )

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg">Detected Regulations</CardTitle>
        </div>
        <CardDescription>
          {triggeredRegulations.length} regulation{triggeredRegulations.length !== 1 ? 's' : ''} may apply to your business
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {criticalRegs.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                Critical Priority
              </h4>
              <div className="flex flex-wrap gap-2">
                {criticalRegs.map((regId) => {
                  const reg = regulations[regId]
                  return (
                    <Badge
                      key={regId}
                      variant="destructive"
                      className="text-xs"
                    >
                      {reg.shortName}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}

          {highRegs.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-amber-600 mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                High Priority
              </h4>
              <div className="flex flex-wrap gap-2">
                {highRegs.map((regId) => {
                  const reg = regulations[regId]
                  return (
                    <Badge
                      key={regId}
                      variant="warning"
                      className="text-xs"
                      style={{ backgroundColor: reg.color }}
                    >
                      {reg.shortName}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Complete the assessment to get your personalized compliance roadmap
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
