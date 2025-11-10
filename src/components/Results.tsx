import type { ComplianceRecommendation } from '@/types'
import { regulations } from '@/data/regulations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, CheckCircle2, AlertCircle, Clock, TrendingUp, ExternalLink } from 'lucide-react'

interface ResultsProps {
  triggeredRegulations: string[]
  recommendations: ComplianceRecommendation[]
  onExportPDF: () => void
  onStartOver: () => void
}

export function Results({
  triggeredRegulations,
  recommendations,
  onExportPDF,
  onStartOver,
}: ResultsProps) {

  const immediateRecs = recommendations.filter((r) => r.priority === 'immediate')
  const shortTermRecs = recommendations.filter((r) => r.priority === 'short-term')
  const mediumTermRecs = recommendations.filter((r) => r.priority === 'medium-term')
  const longTermRecs = recommendations.filter((r) => r.priority === 'long-term')

  return (
    <div className="max-w-6xl mx-auto" id="compliance-report">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3">Your Compliance Roadmap</h1>
        <p className="text-lg text-muted-foreground">
          Based on your assessment, {triggeredRegulations.length} regulation
          {triggeredRegulations.length !== 1 ? 's' : ''} may apply to your edtech business
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center mb-8">
        <Button onClick={onExportPDF} size="lg">
          <Download className="mr-2 h-5 w-5" />
          Export PDF Report
        </Button>
        <Button onClick={onStartOver} variant="outline" size="lg">
          Start New Assessment
        </Button>
      </div>

      {/* Applicable Regulations Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Applicable Regulations</CardTitle>
          <CardDescription>
            These regulations have been identified based on your responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {triggeredRegulations.map((regId) => {
              const reg = regulations[regId]
              return (
                <div
                  key={regId}
                  className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{reg.shortName}</h3>
                    <Badge
                      variant={reg.priority === 'critical' ? 'destructive' : 'default'}
                      className="ml-2"
                    >
                      {reg.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{reg.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Scope:</span>
                    <span className="font-medium">{reg.scope}</span>
                  </div>
                  {reg.learnMoreUrl && (
                    <a
                      href={reg.learnMoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                    >
                      Learn more
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Priority-Based Recommendations */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Implementation Roadmap</h2>

        {immediateRecs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h3 className="text-xl font-semibold">Immediate Action Required</h3>
              <Badge variant="destructive">{immediateRecs.length}</Badge>
            </div>
            <div className="space-y-4">
              {immediateRecs.map((rec, idx) => (
                <RecommendationCard key={idx} recommendation={rec} />
              ))}
            </div>
          </div>
        )}

        {shortTermRecs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-amber-500" />
              <h3 className="text-xl font-semibold">Short-Term (1-3 months)</h3>
              <Badge variant="warning">{shortTermRecs.length}</Badge>
            </div>
            <div className="space-y-4">
              {shortTermRecs.map((rec, idx) => (
                <RecommendationCard key={idx} recommendation={rec} />
              ))}
            </div>
          </div>
        )}

        {mediumTermRecs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h3 className="text-xl font-semibold">Medium-Term (3-6 months)</h3>
              <Badge variant="info">{mediumTermRecs.length}</Badge>
            </div>
            <div className="space-y-4">
              {mediumTermRecs.map((rec, idx) => (
                <RecommendationCard key={idx} recommendation={rec} />
              ))}
            </div>
          </div>
        )}

        {longTermRecs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h3 className="text-xl font-semibold">Long-Term (6+ months)</h3>
              <Badge variant="success">{longTermRecs.length}</Badge>
            </div>
            <div className="space-y-4">
              {longTermRecs.map((rec, idx) => (
                <RecommendationCard key={idx} recommendation={rec} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RecommendationCard({ recommendation }: { recommendation: ComplianceRecommendation }) {
  const reg = regulations[recommendation.regulationId]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge style={{ backgroundColor: reg.color }} className="text-white">
                {reg.shortName}
              </Badge>
              <Badge
                variant="outline"
                className={`${
                  recommendation.effort === 'low'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : recommendation.effort === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}
              >
                {recommendation.effort} effort
              </Badge>
            </div>
            <CardTitle className="text-lg">{recommendation.title}</CardTitle>
            <CardDescription className="mt-2">{recommendation.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h4 className="font-semibold mb-2 text-sm">Action Items:</h4>
        <ul className="space-y-2">
          {recommendation.actions.map((action, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
