import { useNavigate } from 'react-router-dom'
import { useInventory } from '@/contexts/InventoryContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, BookOpen, ExternalLink, Shield, Scale, Globe } from 'lucide-react'

interface Regulation {
  id: string
  name: string
  shortName: string
  description: string
  whyApplies: string
  keyObligations: string[]
  resources: { title: string; url: string }[]
  icon: React.ReactNode
}

export function ComplianceInsights() {
  const navigate = useNavigate()
  const { inventory } = useInventory()

  if (!inventory) return null

  const { setup, dataElements } = inventory
  const { ageGroups, geographicMarkets } = setup

  // Determine which regulations apply
  const applicableRegulations: Regulation[] = []

  // FERPA - applies if there are educational records
  const hasEducationalRecords = dataElements.some((el) => el.category === 'educational_records')
  if (hasEducationalRecords) {
    applicableRegulations.push({
      id: 'ferpa',
      name: 'Family Educational Rights and Privacy Act',
      shortName: 'FERPA',
      description:
        'Federal law protecting the privacy of student education records. Applies to all schools that receive funds under an applicable program of the U.S. Department of Education.',
      whyApplies: 'Your inventory contains educational records.',
      keyObligations: [
        'Obtain written consent before disclosing personally identifiable information from education records',
        'Provide parents/eligible students the right to inspect and review education records',
        'Maintain reasonable security measures to protect student data',
        'Execute written agreements with service providers who have access to education records',
        'Maintain records of disclosures',
        'Allow parents/students to request amendments to inaccurate records',
      ],
      resources: [
        {
          title: 'FERPA Overview (ED.gov)',
          url: 'https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html',
        },
        {
          title: 'FERPA Model Terms of Service',
          url: 'https://studentprivacy.ed.gov/resources/ferpa-model-terms-service',
        },
      ],
      icon: <Shield className="h-5 w-5 text-blue-600" />,
    })
  }

  // COPPA - applies if serving children under 13
  const servesYoungChildren = ageGroups.some((ag) => ag === 'early_childhood' || ag === 'k5')
  if (servesYoungChildren) {
    applicableRegulations.push({
      id: 'coppa',
      name: "Children's Online Privacy Protection Act",
      shortName: 'COPPA',
      description:
        'Federal law requiring verifiable parental consent before collecting personal information from children under 13.',
      whyApplies: 'You serve children under 13 years old.',
      keyObligations: [
        'Obtain verifiable parental consent before collecting personal information from children under 13',
        'Provide clear notice of data collection practices in a privacy policy',
        'Maintain reasonable security procedures to protect collected information',
        'Retain data only as long as necessary to fulfill the purpose for which it was collected',
        'Delete data at parent request',
        'Avoid conditioning participation on disclosure of more information than necessary',
      ],
      resources: [
        {
          title: 'FTC COPPA Compliance Guide',
          url: 'https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions',
        },
        {
          title: 'COPPA Safe Harbor Programs',
          url: 'https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa',
        },
      ],
      icon: <Shield className="h-5 w-5 text-purple-600" />,
    })
  }

  // SOPIPA - California K-12
  const servesCaliforniaK12 = geographicMarkets.includes('california') &&
    ageGroups.some((ag) => ag === 'k5' || ag === '6-8' || ag === '9-12')
  if (servesCaliforniaK12) {
    applicableRegulations.push({
      id: 'sopipa',
      name: 'Student Online Personal Information Protection Act',
      shortName: 'SOPIPA',
      description:
        'California law prohibiting K-12 operators from using student data for targeted advertising or creating profiles for non-educational purposes.',
      whyApplies: 'You operate in California and serve K-12 students.',
      keyObligations: [
        'Do not use student data for targeted advertising',
        'Do not create profiles of students for non-educational purposes',
        'Do not sell student information',
        'Implement and maintain reasonable security procedures',
        'Delete student data within a reasonable timeframe upon request',
        'Execute written agreements with third parties',
      ],
      resources: [
        {
          title: 'SOPIPA Full Text',
          url: 'https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=201320140SB1177',
        },
        {
          title: 'California Student Privacy Resources',
          url: 'https://studentprivacy.ed.gov/resources/california-student-privacy-resources',
        },
      ],
      icon: <Shield className="h-5 w-5 text-orange-600" />,
    })
  }

  // NY Education Law 2-d
  const servesNewYork = geographicMarkets.includes('new_york') && hasEducationalRecords
  if (servesNewYork) {
    applicableRegulations.push({
      id: 'ny-ed-law',
      name: 'New York Education Law 2-d',
      shortName: 'NY Ed Law 2-d',
      description:
        'New York law requiring contracts and data security protections for third-party contractors handling student data.',
      whyApplies: 'You operate in New York and handle student data.',
      keyObligations: [
        'Execute Parents Bill of Rights supplement with school districts',
        'Limit data collection to what is necessary for the educational purpose',
        'Implement data security and privacy plan with encryption requirements',
        'Provide detailed data breach notification procedures',
        'Prohibit use of student data for commercial purposes',
        'Delete student data when no longer needed or upon request',
      ],
      resources: [
        {
          title: 'NY State Education Department - Law 2-d',
          url: 'http://www.nysed.gov/data-privacy-security/education-law-section-2-d',
        },
        {
          title: "Parents' Bill of Rights",
          url: 'http://www.nysed.gov/data-privacy-security/parents-bill-rights',
        },
      ],
      icon: <Scale className="h-5 w-5 text-indigo-600" />,
    })
  }

  // GDPR - European Union
  const servesEU = geographicMarkets.includes('eu')
  if (servesEU) {
    applicableRegulations.push({
      id: 'gdpr',
      name: 'General Data Protection Regulation',
      shortName: 'GDPR',
      description:
        'European Union regulation governing data protection and privacy. Applies to processing of personal data of EU residents.',
      whyApplies: 'You operate in the European Union or process data of EU residents.',
      keyObligations: [
        'Obtain lawful basis for processing (consent, contract, legitimate interest, etc.)',
        'Provide transparent privacy notices at point of collection',
        'Honor data subject rights (access, rectification, erasure, portability, objection)',
        'Implement privacy by design and default',
        'Execute Data Processing Agreements with processors',
        'Conduct Data Protection Impact Assessments for high-risk processing',
        'Report data breaches within 72 hours',
        'Appoint a Data Protection Officer if required',
      ],
      resources: [
        {
          title: 'GDPR Official Text',
          url: 'https://gdpr-info.eu/',
        },
        {
          title: 'ICO GDPR Guide',
          url: 'https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/',
        },
      ],
      icon: <Globe className="h-5 w-5 text-blue-700" />,
    })
  }

  // CCPA/CPRA - California
  const servesCalifornia = geographicMarkets.includes('california')
  if (servesCalifornia) {
    applicableRegulations.push({
      id: 'ccpa',
      name: 'California Consumer Privacy Act / Privacy Rights Act',
      shortName: 'CCPA/CPRA',
      description:
        'California law granting consumers rights over their personal information, including rights to know, delete, opt-out, and correct.',
      whyApplies: 'You operate in California or process data of California residents.',
      keyObligations: [
        'Provide notice at collection of personal information',
        'Honor consumer rights (know, delete, correct, opt-out of sale/sharing)',
        'Maintain "Do Not Sell or Share My Personal Information" link',
        'Execute contracts with service providers and third parties',
        'Conduct Data Protection Assessments for certain processing activities',
        'Limit use of sensitive personal information',
        'Provide privacy policy with required disclosures',
        'Implement reasonable security measures',
      ],
      resources: [
        {
          title: 'CPPA CCPA Regulations',
          url: 'https://cppa.ca.gov/regulations/',
        },
        {
          title: 'CCPA Compliance Checklist',
          url: 'https://oag.ca.gov/privacy/ccpa',
        },
      ],
      icon: <Scale className="h-5 w-5 text-yellow-600" />,
    })
  }

  // Count affected elements by category
  const stats = {
    pii: dataElements.filter((el) => el.category === 'pii').length,
    educational: dataElements.filter((el) => el.category === 'educational_records').length,
    health: dataElements.filter((el) => el.category === 'health_information').length,
    financial: dataElements.filter((el) => el.category === 'financial_data').length,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('/inventory')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Compliance Insights</h1>
          <p className="text-muted-foreground">
            Applicable regulations based on your product type, geographic markets, and data
            inventory
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Applicable Regulations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{applicableRegulations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>PII Elements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pii}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Educational Records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.educational}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Sensitive Data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.health + stats.financial}</div>
            </CardContent>
          </Card>
        </div>

        {/* Applicable Regulations */}
        {applicableRegulations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Regulations Identified</h3>
              <p className="text-muted-foreground">
                Based on your current inventory setup, no specific regulations were automatically
                identified. Consider consulting with a legal professional to ensure comprehensive
                compliance coverage.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">Applicable Regulations</h2>
              <p className="text-muted-foreground">
                Based on your product serving{' '}
                <strong>{ageGroups.map((ag) => ag.replace(/_/g, ' ')).join(', ')}</strong> in{' '}
                <strong>{geographicMarkets.map((m) => m.replace(/_/g, ' ')).join(', ')}</strong>
              </p>
            </div>

            {applicableRegulations.map((regulation) => (
              <Card key={regulation.id}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    {regulation.icon}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{regulation.name}</CardTitle>
                        <Badge>{regulation.shortName}</Badge>
                      </div>
                      <CardDescription className="mb-3">{regulation.description}</CardDescription>
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm">
                          <strong className="text-blue-900 dark:text-blue-100">
                            Why this applies:
                          </strong>{' '}
                          <span className="text-blue-800 dark:text-blue-200">
                            {regulation.whyApplies}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Key Compliance Obligations</h4>
                    <ul className="space-y-2">
                      {regulation.keyObligations.map((obligation, idx) => (
                        <li key={idx} className="flex gap-2 text-sm">
                          <span className="text-primary font-bold">•</span>
                          <span>{obligation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Helpful Resources</h4>
                    <div className="space-y-2">
                      {regulation.resources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {resource.title}
                        </a>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Next Steps */}
        {applicableRegulations.length > 0 && (
          <Card className="mt-8 bg-muted">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                1. Review the Gap Analysis page to identify specific areas needing attention in
                your data inventory
              </p>
              <p>
                2. Ensure your privacy policy addresses all applicable regulations listed above
              </p>
              <p>
                3. Execute required legal agreements with third-party vendors and service providers
              </p>
              <p>
                4. Implement technical and organizational measures to meet security requirements
              </p>
              <p>
                5. Consider working with legal counsel to develop comprehensive compliance policies
                and procedures
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
