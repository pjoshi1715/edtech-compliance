import { useState, useEffect } from 'react'
import type { Answer, AssessmentResult } from '@/types'
import { questions } from '@/data/questions'
import { Questionnaire } from '@/components/Questionnaire'
import { ComplianceIndicator } from '@/components/ComplianceIndicator'
import { Results } from '@/components/Results'
import { ComplianceChart } from '@/components/ComplianceChart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  detectTriggeredRegulations,
  generateRecommendations,
  getComplianceSummary,
} from '@/utils/complianceEngine'
import { Shield, FileText, TrendingUp, CheckCircle } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type AssessmentState = 'welcome' | 'assessment' | 'results'

export function AssessmentTool() {
  const [state, setState] = useState<AssessmentState>('welcome')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [triggeredRegulations, setTriggeredRegulations] = useState<string[]>([])
  const [result, setResult] = useState<AssessmentResult | null>(null)

  // Update triggered regulations in real-time as answers change
  useEffect(() => {
    if (answers.length > 0) {
      const triggered = detectTriggeredRegulations(answers)
      setTriggeredRegulations(triggered)
    }
  }, [answers])

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId)
      if (existing) {
        return prev.map((a) => (a.questionId === questionId ? { questionId, value } : a))
      }
      return [...prev, { questionId, value }]
    })
  }

  const handleComplete = () => {
    const triggered = detectTriggeredRegulations(answers)
    const recommendations = generateRecommendations(triggered, answers)

    const assessmentResult: AssessmentResult = {
      answers,
      triggeredRegulations: triggered,
      recommendations,
      completedAt: new Date(),
    }

    setResult(assessmentResult)
    setState('results')
  }

  const handleStartOver = () => {
    setAnswers([])
    setTriggeredRegulations([])
    setResult(null)
    setState('welcome')
  }

  const handleExportPDF = async () => {
    const element = document.getElementById('compliance-report')
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 10

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save('edtech-compliance-roadmap.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  if (state === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Shield className="h-16 w-16 text-primary" />
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EdTech Compliance Assessment Tool
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Navigate the complex regulatory landscape with confidence. Get a personalized compliance roadmap for your educational technology company.
              </p>
              <Button size="lg" onClick={() => setState('assessment')} className="text-lg px-8 py-6">
                Start Assessment
              </Button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <FileText className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Interactive Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Answer 15 strategic questions about your business model, data practices, and markets
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Real-Time Detection</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    See which regulations apply as you answer, with visual indicators for each requirement
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CheckCircle className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Actionable Roadmap</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get prioritized recommendations with specific action items and implementation timelines
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Regulations Covered */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Regulations Covered</CardTitle>
                <CardDescription>
                  This assessment analyzes compliance requirements for:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Federal Regulations</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• FERPA - Student Education Records</li>
                      <li>• COPPA - Children's Online Privacy</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">State Regulations</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• SOPIPA - California Student Privacy</li>
                      <li>• NY Education Law 2-d</li>
                      <li>• CCPA/CPRA - California Consumer Privacy</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">International</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• GDPR - EU Data Protection</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <p className="text-center text-sm text-muted-foreground mt-8">
              This tool provides general guidance only and does not constitute legal advice.
              Consult with qualified legal counsel for compliance matters specific to your organization.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'assessment') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">EdTech Compliance Assessment</h1>
            <p className="text-muted-foreground">
              Answer the questions below to identify applicable regulations
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Questionnaire
                questions={questions}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                onComplete={handleComplete}
              />
            </div>
            <div className="lg:col-span-1">
              <ComplianceIndicator triggeredRegulations={triggeredRegulations} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'results' && result) {
    const summary = getComplianceSummary(result.triggeredRegulations)

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <ComplianceChart
              critical={summary.critical}
              high={summary.high}
              medium={summary.medium}
            />
          </div>
          <Results
            triggeredRegulations={result.triggeredRegulations}
            recommendations={result.recommendations}
            onExportPDF={handleExportPDF}
            onStartOver={handleStartOver}
          />
        </div>
      </div>
    )
  }

  return null
}
