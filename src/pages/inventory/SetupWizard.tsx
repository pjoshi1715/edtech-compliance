import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInventory } from '@/contexts/InventoryContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProductType, AgeGroup, GeographicMarket, InventorySetup } from '@/types'
import {
  PRODUCT_TYPE_LABELS,
  AGE_GROUP_LABELS,
  GEOGRAPHIC_MARKET_LABELS,
} from '@/data/inventory/constants'
import { PRODUCT_TEMPLATES } from '@/data/inventory/templates'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'

type WizardStep = 'product' | 'demographics' | 'geography' | 'template' | 'name'

export function SetupWizard() {
  const navigate = useNavigate()
  const { createNewInventory } = useInventory()

  const [step, setStep] = useState<WizardStep>('product')
  const [productType, setProductType] = useState<ProductType>('lms')
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([])
  const [geographicMarkets, setGeographicMarkets] = useState<GeographicMarket[]>([])
  const [useTemplate, setUseTemplate] = useState<boolean>(true)
  const [inventoryName, setInventoryName] = useState('')

  const handleAgeGroupToggle = (ag: AgeGroup) => {
    setAgeGroups((prev) =>
      prev.includes(ag) ? prev.filter((g) => g !== ag) : [...prev, ag]
    )
  }

  const handleMarketToggle = (market: GeographicMarket) => {
    setGeographicMarkets((prev) =>
      prev.includes(market) ? prev.filter((m) => m !== market) : [...prev, market]
    )
  }

  const handleComplete = () => {
    const setup: InventorySetup = {
      productType,
      ageGroups,
      geographicMarkets,
    }

    const name = inventoryName.trim() || `${PRODUCT_TYPE_LABELS[productType]} Inventory`

    // Create inventory
    createNewInventory(name, setup)

    // If using template, we'll need to add the template elements
    // This will be done in the dashboard after navigation
    if (useTemplate) {
      navigate('/inventory', { state: { loadTemplate: true, productType } })
    } else {
      navigate('/inventory')
    }
  }

  const canProceed = () => {
    switch (step) {
      case 'product':
        return true
      case 'demographics':
        return ageGroups.length > 0
      case 'geography':
        return geographicMarkets.length > 0
      case 'template':
        return true
      case 'name':
        return true
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'product':
        return (
          <Card>
            <CardHeader>
              <CardTitle>What type of product do you offer?</CardTitle>
              <CardDescription>
                This helps us provide relevant templates and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(Object.keys(PRODUCT_TYPE_LABELS) as ProductType[]).map((type) => (
                <div
                  key={type}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    productType === type
                      ? 'border-primary bg-primary/5'
                      : 'border-input hover:border-primary/50'
                  }`}
                  onClick={() => setProductType(type)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{PRODUCT_TYPE_LABELS[type]}</span>
                    {productType === type && <Badge>Selected</Badge>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )

      case 'demographics':
        return (
          <Card>
            <CardHeader>
              <CardTitle>What age groups do you serve?</CardTitle>
              <CardDescription>Select all that apply</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(Object.keys(AGE_GROUP_LABELS) as AgeGroup[]).map((ag) => (
                <div
                  key={ag}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    ageGroups.includes(ag)
                      ? 'border-primary bg-primary/5'
                      : 'border-input hover:border-primary/50'
                  }`}
                  onClick={() => handleAgeGroupToggle(ag)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{AGE_GROUP_LABELS[ag]}</span>
                    {ageGroups.includes(ag) && <Badge>Selected</Badge>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )

      case 'geography':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Where are your users located?</CardTitle>
              <CardDescription>
                Select all geographic markets you serve. This affects which regulations may apply.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(Object.keys(GEOGRAPHIC_MARKET_LABELS) as GeographicMarket[]).map((market) => (
                <div
                  key={market}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    geographicMarkets.includes(market)
                      ? 'border-primary bg-primary/5'
                      : 'border-input hover:border-primary/50'
                  }`}
                  onClick={() => handleMarketToggle(market)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{GEOGRAPHIC_MARKET_LABELS[market]}</span>
                    {geographicMarkets.includes(market) && <Badge>Selected</Badge>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )

      case 'template':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Start with a template?</CardTitle>
              <CardDescription>
                We can pre-populate your inventory with common data elements for{' '}
                {PRODUCT_TYPE_LABELS[productType].toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                  useTemplate
                    ? 'border-primary bg-primary/5'
                    : 'border-input hover:border-primary/50'
                }`}
                onClick={() => setUseTemplate(true)}
              >
                <div className="flex items-start gap-4">
                  <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">Use Template (Recommended)</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Start with {PRODUCT_TEMPLATES[productType].elements.length} pre-configured
                      data elements. You can edit, add, or remove them later.
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <strong>Includes:</strong> {PRODUCT_TEMPLATES[productType].description}
                    </div>
                  </div>
                  {useTemplate && <Badge>Selected</Badge>}
                </div>
              </div>

              <div
                className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                  !useTemplate
                    ? 'border-primary bg-primary/5'
                    : 'border-input hover:border-primary/50'
                }`}
                onClick={() => setUseTemplate(false)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">Start from Scratch</h4>
                    <p className="text-sm text-muted-foreground">
                      Begin with a blank inventory and add each data element manually.
                    </p>
                  </div>
                  {!useTemplate && <Badge>Selected</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'name':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Name your inventory</CardTitle>
              <CardDescription>
                Give your data inventory a descriptive name (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inventory-name">Inventory Name</Label>
                <Input
                  id="inventory-name"
                  placeholder={`${PRODUCT_TYPE_LABELS[productType]} Inventory`}
                  value={inventoryName}
                  onChange={(e) => setInventoryName(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  If left blank, we'll use "{PRODUCT_TYPE_LABELS[productType]} Inventory"
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">Summary</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">Product:</span>{' '}
                    {PRODUCT_TYPE_LABELS[productType]}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Age Groups:</span>{' '}
                    {ageGroups.map((ag) => AGE_GROUP_LABELS[ag]).join(', ')}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Markets:</span>{' '}
                    {geographicMarkets.map((m) => GEOGRAPHIC_MARKET_LABELS[m]).join(', ')}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Template:</span>{' '}
                    {useTemplate ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  const steps: WizardStep[] = ['product', 'demographics', 'geography', 'template', 'name']
  const currentStepIndex = steps.indexOf(step)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => (currentStepIndex === 0 ? navigate('/inventory') : setStep(steps[currentStepIndex - 1]))}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <h1 className="text-3xl font-bold mb-2">Setup Your Data Inventory</h1>
            <p className="text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </p>

            {/* Progress Bar */}
            <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">{renderStep()}</div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(steps[currentStepIndex - 1])}
              disabled={currentStepIndex === 0}
            >
              Previous
            </Button>

            {currentStepIndex < steps.length - 1 ? (
              <Button onClick={() => setStep(steps[currentStepIndex + 1])} disabled={!canProceed()}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={!canProceed()}>
                Create Inventory
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
