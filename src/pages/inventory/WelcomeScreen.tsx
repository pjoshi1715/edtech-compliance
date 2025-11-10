import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database, Shield, FileText, TrendingUp, ArrowLeft } from 'lucide-react'

export function WelcomeScreen() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back to Home */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-purple-100 rounded-full">
                <Database className="h-16 w-16 text-purple-600" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Data Inventory Template
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Build a comprehensive catalog of all personal and educational data your product
              collects, stores, and processes. Identify compliance gaps and security risks.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/inventory/setup')}
              className="text-lg px-8 py-6"
            >
              Get Started
            </Button>
          </div>

          {/* Why Data Inventory Matters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Why Data Inventory Matters</CardTitle>
              <CardDescription>
                A complete data inventory is the foundation of any privacy and security program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Required by Regulations
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    GDPR Article 30, CCPA, and other laws require organizations to maintain
                    detailed records of data processing activities.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Identify Security Risks
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Discover which data elements lack encryption, proper access controls, or
                    retention policies.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Enable Informed Decisions
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Understand your data landscape to make better decisions about privacy,
                    security, and compliance investments.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Respond to Incidents
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    In case of a data breach, know exactly what data was affected and who to
                    notify.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What You'll Build */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">What You'll Build</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-purple-100 p-2 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-purple-600" />
                  </div>
                  <div>
                    <strong className="text-sm">Complete Data Element Catalog</strong>
                    <p className="text-sm text-muted-foreground">
                      Track every piece of data you collect, from student emails to usage analytics
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-purple-100 p-2 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-purple-600" />
                  </div>
                  <div>
                    <strong className="text-sm">Automated Risk Assessment</strong>
                    <p className="text-sm text-muted-foreground">
                      Each data element gets a risk score based on sensitivity, encryption, access controls, and more
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-purple-100 p-2 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-purple-600" />
                  </div>
                  <div>
                    <strong className="text-sm">Visual Data Flow Diagram</strong>
                    <p className="text-sm text-muted-foreground">
                      See how data moves through your system from collection to deletion
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-purple-100 p-2 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-purple-600" />
                  </div>
                  <div>
                    <strong className="text-sm">Compliance Gap Analysis</strong>
                    <p className="text-sm text-muted-foreground">
                      Identify critical issues like unencrypted educational records or missing data processing agreements
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-purple-100 p-2 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-purple-600" />
                  </div>
                  <div>
                    <strong className="text-sm">Professional Exports</strong>
                    <p className="text-sm text-muted-foreground">
                      Export your inventory as PDF reports or CSV/Excel files for compliance audits
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            This tool helps you organize your data practices but does not constitute legal advice.
            Consult with qualified legal counsel for compliance matters specific to your organization.
          </p>
        </div>
      </div>
    </div>
  )
}
