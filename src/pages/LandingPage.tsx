import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Database, ArrowRight, CheckCircle2 } from 'lucide-react'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-primary/10 rounded-full">
                <Shield className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EdTech Compliance Toolkit
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Professional tools to help educational technology companies navigate regulatory compliance
              and manage data responsibly. Choose the tool that fits your needs.
            </p>
          </div>

          {/* Two Main Tools */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Compliance Assessment Tool */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Compliance Assessment</CardTitle>
                    <CardDescription className="text-base">
                      Identify applicable regulations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <p className="text-muted-foreground">
                  Answer strategic questions about your edtech business to discover which regulations
                  apply and receive a personalized compliance roadmap.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">What you'll get:</h4>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>15-question assessment of your business practices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Real-time detection of applicable regulations (FERPA, COPPA, GDPR, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Prioritized action items with implementation timelines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Exportable PDF compliance roadmap</span>
                    </li>
                  </ul>
                </div>
                <Button
                  onClick={() => navigate('/assessment')}
                  className="w-full mt-4"
                  size="lg"
                >
                  Start Compliance Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>

            {/* Data Inventory Template Tool */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Database className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Data Inventory Template</CardTitle>
                    <CardDescription className="text-base">
                      Catalog your data practices
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <p className="text-muted-foreground">
                  Build a comprehensive inventory of all personal and educational data your product
                  collects, stores, and processes.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">What you'll get:</h4>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Complete data element tracking with risk scoring</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Visual data flow diagram showing collection to deletion</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Automated compliance gap analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Export to PDF, CSV, or Excel</span>
                    </li>
                  </ul>
                </div>
                <Button
                  onClick={() => navigate('/inventory')}
                  className="w-full mt-4"
                  size="lg"
                  variant="outline"
                >
                  Start Data Inventory
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Use Both Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-3">Use Both Tools for Complete Compliance</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  For the most comprehensive compliance program, use the Compliance Assessment to
                  understand which regulations apply, then use the Data Inventory Template to document
                  your data practices and identify gaps.
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      1
                    </div>
                    <span>Run Assessment</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      2
                    </div>
                    <span>Build Inventory</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      3
                    </div>
                    <span>Implement Changes</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            These tools provide general guidance only and do not constitute legal advice.
            Consult with qualified legal counsel for compliance matters specific to your organization.
          </p>
        </div>
      </div>
    </div>
  )
}
