import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useInventory } from '@/contexts/InventoryContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Plus, Trash2, Save } from 'lucide-react'
import type {
  DataCategory,
  DataSource,
  CollectionPurpose,
  StorageLocation,
  YesNoUnknown,
  BackupStrategy,
  AccessRole,
  AccessControlMethod,
  RetentionPeriod,
  DeletionPolicy,
  UserDeletionRights,
  ProcessingAgreementType,
  ThirdPartyRecipient,
} from '@/types'
import {
  DATA_CATEGORY_LABELS,
  DATA_SOURCE_LABELS,
  COLLECTION_PURPOSE_LABELS,
  STORAGE_LOCATION_LABELS,
  YES_NO_UNKNOWN_LABELS,
  BACKUP_STRATEGY_LABELS,
  ACCESS_ROLE_LABELS,
  ACCESS_CONTROL_METHOD_LABELS,
  RETENTION_PERIOD_LABELS,
  DELETION_POLICY_LABELS,
  USER_DELETION_RIGHTS_LABELS,
  PROCESSING_AGREEMENT_TYPE_LABELS,
} from '@/data/inventory/constants'
import { getRiskBadgeVariant, getRiskLabel } from '@/utils/inventory/riskScoring'
import { calculateRiskScore } from '@/utils/inventory/riskScoring'
import { generateId } from '@/utils/inventory/helpers'

type FormStep = 'basic' | 'storage' | 'access' | 'lifecycle' | 'sharing'

interface FormData {
  name: string
  category: DataCategory
  source: DataSource
  purposes: CollectionPurpose[]
  storageLocation: StorageLocation
  encryptionAtRest: YesNoUnknown
  encryptionInTransit: YesNoUnknown
  backupStrategy: BackupStrategy
  accessRoles: AccessRole[]
  accessControlMethod: AccessControlMethod
  loggingEnabled: YesNoUnknown
  mfaRequired: YesNoUnknown
  retentionPeriod: RetentionPeriod
  customRetentionPeriod?: string
  deletionPolicy: DeletionPolicy
  userDeletionRights: UserDeletionRights
  archivalProcess?: string
  sharedWithThirdParties: boolean
  thirdPartyRecipients: ThirdPartyRecipient[]
  notes?: string
}

export function AddDataElement() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { inventory, addDataElement, updateDataElement } = useInventory()

  const isEditing = !!id
  const [step, setStep] = useState<FormStep>('basic')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: 'pii',
    source: 'user_input',
    purposes: [],
    storageLocation: 'aws',
    encryptionAtRest: 'yes',
    encryptionInTransit: 'yes',
    backupStrategy: 'automated',
    accessRoles: [],
    accessControlMethod: 'rbac',
    loggingEnabled: 'yes',
    mfaRequired: 'no',
    retentionPeriod: 'account_lifetime',
    deletionPolicy: 'soft_delete',
    userDeletionRights: 'can_delete',
    sharedWithThirdParties: false,
    thirdPartyRecipients: [],
  })

  // Load existing element if editing
  useEffect(() => {
    if (isEditing && inventory && id) {
      const element = inventory.dataElements.find((el) => el.id === id)
      if (element) {
        setFormData({
          name: element.name,
          category: element.category,
          source: element.source,
          purposes: element.purposes,
          storageLocation: element.storageLocation,
          encryptionAtRest: element.encryptionAtRest,
          encryptionInTransit: element.encryptionInTransit,
          backupStrategy: element.backupStrategy,
          accessRoles: element.accessRoles,
          accessControlMethod: element.accessControlMethod,
          loggingEnabled: element.loggingEnabled,
          mfaRequired: element.mfaRequired,
          retentionPeriod: element.retentionPeriod,
          customRetentionPeriod: element.customRetentionPeriod,
          deletionPolicy: element.deletionPolicy,
          userDeletionRights: element.userDeletionRights,
          archivalProcess: element.archivalProcess,
          sharedWithThirdParties: element.sharedWithThirdParties,
          thirdPartyRecipients: element.thirdPartyRecipients,
          notes: element.notes,
        })
      }
    }
  }, [isEditing, inventory, id])

  const handlePurposeToggle = (purpose: CollectionPurpose) => {
    setFormData((prev) => ({
      ...prev,
      purposes: prev.purposes.includes(purpose)
        ? prev.purposes.filter((p) => p !== purpose)
        : [...prev.purposes, purpose],
    }))
  }

  const handleAccessRoleToggle = (role: AccessRole) => {
    setFormData((prev) => ({
      ...prev,
      accessRoles: prev.accessRoles.includes(role)
        ? prev.accessRoles.filter((r) => r !== role)
        : [...prev.accessRoles, role],
    }))
  }

  const handleAddRecipient = () => {
    setFormData((prev) => ({
      ...prev,
      thirdPartyRecipients: [
        ...prev.thirdPartyRecipients,
        {
          id: generateId(),
          name: '',
          purpose: '',
          agreementType: 'none',
          dataResidencyRequirements: 'unknown',
        },
      ],
    }))
  }

  const handleUpdateRecipient = (index: number, field: keyof ThirdPartyRecipient, value: string) => {
    setFormData((prev) => ({
      ...prev,
      thirdPartyRecipients: prev.thirdPartyRecipients.map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      ),
    }))
  }

  const handleRemoveRecipient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      thirdPartyRecipients: prev.thirdPartyRecipients.filter((_, i) => i !== index),
    }))
  }

  const handleSave = () => {
    if (isEditing && id) {
      updateDataElement(id, formData)
    } else {
      addDataElement(formData)
    }
    navigate('/inventory')
  }

  const handleSaveAndAddAnother = () => {
    addDataElement(formData)
    // Reset form
    setFormData({
      name: '',
      category: 'pii',
      source: 'user_input',
      purposes: [],
      storageLocation: 'aws',
      encryptionAtRest: 'yes',
      encryptionInTransit: 'yes',
      backupStrategy: 'automated',
      accessRoles: [],
      accessControlMethod: 'rbac',
      loggingEnabled: 'yes',
      mfaRequired: 'no',
      retentionPeriod: 'account_lifetime',
      deletionPolicy: 'soft_delete',
      userDeletionRights: 'can_delete',
      sharedWithThirdParties: false,
      thirdPartyRecipients: [],
    })
    setStep('basic')
  }

  const canProceed = () => {
    switch (step) {
      case 'basic':
        return formData.name.trim() !== '' && formData.purposes.length > 0
      case 'storage':
        return true
      case 'access':
        return formData.accessRoles.length > 0
      case 'lifecycle':
        return true
      case 'sharing':
        return true
      default:
        return false
    }
  }

  // Calculate current risk level for display
  const currentRisk = inventory ? calculateRiskScore(
    { ...formData, id: '', createdAt: new Date(), updatedAt: new Date(), riskLevel: 'low', riskScore: 0 } as any,
    inventory.setup.ageGroups
  ) : null

  const steps: FormStep[] = ['basic', 'storage', 'access', 'lifecycle', 'sharing']
  const currentStepIndex = steps.indexOf(step)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const renderStep = () => {
    switch (step) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Data Element Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Student Email, Assignment Grades"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Give this data element a clear, descriptive name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Data Category *</Label>
              <Select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as DataCategory })}
              >
                {(Object.keys(DATA_CATEGORY_LABELS) as DataCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {DATA_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Data Source</Label>
              <Select
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as DataSource })}
              >
                {(Object.keys(DATA_SOURCE_LABELS) as DataSource[]).map((src) => (
                  <option key={src} value={src}>
                    {DATA_SOURCE_LABELS[src]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Collection Purpose * (Select all that apply)</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {(Object.keys(COLLECTION_PURPOSE_LABELS) as CollectionPurpose[]).map((purpose) => (
                  <div
                    key={purpose}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      formData.purposes.includes(purpose)
                        ? 'border-primary bg-primary/5'
                        : 'border-input hover:border-primary/50'
                    }`}
                    onClick={() => handlePurposeToggle(purpose)}
                  >
                    <Checkbox
                      checked={formData.purposes.includes(purpose)}
                      onChange={() => handlePurposeToggle(purpose)}
                      label={COLLECTION_PURPOSE_LABELS[purpose]}
                    />
                  </div>
                ))}
              </div>
            </div>

            {currentRisk && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Current Risk Assessment:</span>
                  <Badge variant={getRiskBadgeVariant(currentRisk.level)}>
                    {getRiskLabel(currentRisk.level)} (Score: {currentRisk.score.toFixed(1)}/10)
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )

      case 'storage':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="storage">Storage Location</Label>
              <Select
                id="storage"
                value={formData.storageLocation}
                onChange={(e) =>
                  setFormData({ ...formData, storageLocation: e.target.value as StorageLocation })
                }
              >
                {(Object.keys(STORAGE_LOCATION_LABELS) as StorageLocation[]).map((loc) => (
                  <option key={loc} value={loc}>
                    {STORAGE_LOCATION_LABELS[loc]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="encryption-rest">Encryption at Rest</Label>
              <Select
                id="encryption-rest"
                value={formData.encryptionAtRest}
                onChange={(e) =>
                  setFormData({ ...formData, encryptionAtRest: e.target.value as YesNoUnknown })
                }
              >
                {(Object.keys(YES_NO_UNKNOWN_LABELS) as YesNoUnknown[]).map((opt) => (
                  <option key={opt} value={opt}>
                    {YES_NO_UNKNOWN_LABELS[opt]}
                  </option>
                ))}
              </Select>
              <p className="text-sm text-muted-foreground">
                Is data encrypted when stored in databases or files?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="encryption-transit">Encryption in Transit</Label>
              <Select
                id="encryption-transit"
                value={formData.encryptionInTransit}
                onChange={(e) =>
                  setFormData({ ...formData, encryptionInTransit: e.target.value as YesNoUnknown })
                }
              >
                {(Object.keys(YES_NO_UNKNOWN_LABELS) as YesNoUnknown[]).map((opt) => (
                  <option key={opt} value={opt}>
                    {YES_NO_UNKNOWN_LABELS[opt]}
                  </option>
                ))}
              </Select>
              <p className="text-sm text-muted-foreground">
                Is data encrypted when transmitted over networks (e.g., TLS/HTTPS)?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup">Backup Strategy</Label>
              <Select
                id="backup"
                value={formData.backupStrategy}
                onChange={(e) =>
                  setFormData({ ...formData, backupStrategy: e.target.value as BackupStrategy })
                }
              >
                {(Object.keys(BACKUP_STRATEGY_LABELS) as BackupStrategy[]).map((strat) => (
                  <option key={strat} value={strat}>
                    {BACKUP_STRATEGY_LABELS[strat]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )

      case 'access':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Who Has Access? * (Select all that apply)</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {(Object.keys(ACCESS_ROLE_LABELS) as AccessRole[]).map((role) => (
                  <div
                    key={role}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      formData.accessRoles.includes(role)
                        ? 'border-primary bg-primary/5'
                        : 'border-input hover:border-primary/50'
                    }`}
                    onClick={() => handleAccessRoleToggle(role)}
                  >
                    <Checkbox
                      checked={formData.accessRoles.includes(role)}
                      onChange={() => handleAccessRoleToggle(role)}
                      label={ACCESS_ROLE_LABELS[role]}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="access-control">Access Control Method</Label>
              <Select
                id="access-control"
                value={formData.accessControlMethod}
                onChange={(e) =>
                  setFormData({ ...formData, accessControlMethod: e.target.value as AccessControlMethod })
                }
              >
                {(Object.keys(ACCESS_CONTROL_METHOD_LABELS) as AccessControlMethod[]).map((method) => (
                  <option key={method} value={method}>
                    {ACCESS_CONTROL_METHOD_LABELS[method]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logging">Logging/Audit Trail Enabled</Label>
              <Select
                id="logging"
                value={formData.loggingEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, loggingEnabled: e.target.value as YesNoUnknown })
                }
              >
                {(Object.keys(YES_NO_UNKNOWN_LABELS) as YesNoUnknown[]).map((opt) => (
                  <option key={opt} value={opt}>
                    {YES_NO_UNKNOWN_LABELS[opt]}
                  </option>
                ))}
              </Select>
              <p className="text-sm text-muted-foreground">
                Do you log who accesses this data and when?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mfa">Multi-Factor Authentication Required</Label>
              <Select
                id="mfa"
                value={formData.mfaRequired}
                onChange={(e) =>
                  setFormData({ ...formData, mfaRequired: e.target.value as YesNoUnknown })
                }
              >
                {(Object.keys(YES_NO_UNKNOWN_LABELS) as YesNoUnknown[]).map((opt) => (
                  <option key={opt} value={opt}>
                    {YES_NO_UNKNOWN_LABELS[opt]}
                  </option>
                ))}
              </Select>
              <p className="text-sm text-muted-foreground">
                Must users authenticate with MFA to access this data?
              </p>
            </div>
          </div>
        )

      case 'lifecycle':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="retention">Retention Period</Label>
              <Select
                id="retention"
                value={formData.retentionPeriod}
                onChange={(e) =>
                  setFormData({ ...formData, retentionPeriod: e.target.value as RetentionPeriod })
                }
              >
                {(Object.keys(RETENTION_PERIOD_LABELS) as RetentionPeriod[]).map((period) => (
                  <option key={period} value={period}>
                    {RETENTION_PERIOD_LABELS[period]}
                  </option>
                ))}
              </Select>
            </div>

            {formData.retentionPeriod === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="custom-retention">Custom Retention Period</Label>
                <Input
                  id="custom-retention"
                  placeholder="e.g., 2 years after graduation"
                  value={formData.customRetentionPeriod || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, customRetentionPeriod: e.target.value })
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="deletion">Deletion Policy</Label>
              <Select
                id="deletion"
                value={formData.deletionPolicy}
                onChange={(e) =>
                  setFormData({ ...formData, deletionPolicy: e.target.value as DeletionPolicy })
                }
              >
                {(Object.keys(DELETION_POLICY_LABELS) as DeletionPolicy[]).map((policy) => (
                  <option key={policy} value={policy}>
                    {DELETION_POLICY_LABELS[policy]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-deletion">User Deletion Rights</Label>
              <Select
                id="user-deletion"
                value={formData.userDeletionRights}
                onChange={(e) =>
                  setFormData({ ...formData, userDeletionRights: e.target.value as UserDeletionRights })
                }
              >
                {(Object.keys(USER_DELETION_RIGHTS_LABELS) as UserDeletionRights[]).map((right) => (
                  <option key={right} value={right}>
                    {USER_DELETION_RIGHTS_LABELS[right]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="archival">Archival Process (Optional)</Label>
              <Textarea
                id="archival"
                placeholder="Describe how you archive this data..."
                value={formData.archivalProcess || ''}
                onChange={(e) => setFormData({ ...formData, archivalProcess: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        )

      case 'sharing':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Do you share this data with third parties?</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={formData.sharedWithThirdParties ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, sharedWithThirdParties: true })}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={!formData.sharedWithThirdParties ? 'default' : 'outline'}
                  onClick={() =>
                    setFormData({ ...formData, sharedWithThirdParties: false, thirdPartyRecipients: [] })
                  }
                >
                  No
                </Button>
              </div>
            </div>

            {formData.sharedWithThirdParties && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Third-Party Recipients</Label>
                  <Button type="button" size="sm" onClick={handleAddRecipient}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Recipient
                  </Button>
                </div>

                {formData.thirdPartyRecipients.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Click "Add Recipient" to add third-party vendors or service providers
                  </p>
                ) : (
                  <div className="space-y-4">
                    {formData.thirdPartyRecipients.map((recipient, index) => (
                      <Card key={recipient.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">Recipient #{index + 1}</CardTitle>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRecipient(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <Label>Recipient Name/Type</Label>
                            <Input
                              placeholder="e.g., Email Service Provider, Analytics Platform"
                              value={recipient.name}
                              onChange={(e) => handleUpdateRecipient(index, 'name', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Purpose of Sharing</Label>
                            <Input
                              placeholder="Why do you share this data?"
                              value={recipient.purpose}
                              onChange={(e) => handleUpdateRecipient(index, 'purpose', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Data Processing Agreement in Place</Label>
                            <Select
                              value={recipient.agreementType}
                              onChange={(e) =>
                                handleUpdateRecipient(index, 'agreementType', e.target.value)
                              }
                            >
                              {(Object.keys(PROCESSING_AGREEMENT_TYPE_LABELS) as ProcessingAgreementType[]).map(
                                (type) => (
                                  <option key={type} value={type}>
                                    {PROCESSING_AGREEMENT_TYPE_LABELS[type]}
                                  </option>
                                )
                              )}
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Data Residency/Location Requirements</Label>
                            <Select
                              value={recipient.dataResidencyRequirements}
                              onChange={(e) =>
                                handleUpdateRecipient(index, 'dataResidencyRequirements', e.target.value)
                              }
                            >
                              {(Object.keys(YES_NO_UNKNOWN_LABELS) as YesNoUnknown[]).map((opt) => (
                                <option key={opt} value={opt}>
                                  {YES_NO_UNKNOWN_LABELS[opt]}
                                </option>
                              ))}
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this data element..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate('/inventory')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <h1 className="text-3xl font-bold mb-2">
              {isEditing ? 'Edit Data Element' : 'Add Data Element'}
            </h1>
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

            {/* Step Labels */}
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className={step === 'basic' ? 'text-primary font-medium' : ''}>Basic Info</span>
              <span className={step === 'storage' ? 'text-primary font-medium' : ''}>Storage</span>
              <span className={step === 'access' ? 'text-primary font-medium' : ''}>Access</span>
              <span className={step === 'lifecycle' ? 'text-primary font-medium' : ''}>Lifecycle</span>
              <span className={step === 'sharing' ? 'text-primary font-medium' : ''}>Sharing</span>
            </div>
          </div>

          {/* Step Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {step === 'basic' && 'Basic Information'}
                {step === 'storage' && 'Storage & Infrastructure'}
                {step === 'access' && 'Access & Security'}
                {step === 'lifecycle' && 'Lifecycle Management'}
                {step === 'sharing' && 'Data Sharing'}
              </CardTitle>
              <CardDescription>
                {step === 'basic' && 'Provide basic details about this data element'}
                {step === 'storage' && 'How and where is this data stored?'}
                {step === 'access' && 'Who can access this data and how?'}
                {step === 'lifecycle' && 'How long do you keep this data?'}
                {step === 'sharing' && 'Do you share this data with third parties?'}
              </CardDescription>
            </CardHeader>
            <CardContent>{renderStep()}</CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(steps[currentStepIndex - 1])}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStepIndex < steps.length - 1 ? (
                <Button onClick={() => setStep(steps[currentStepIndex + 1])} disabled={!canProceed()}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  {!isEditing && (
                    <Button variant="outline" onClick={handleSaveAndAddAnother} disabled={!canProceed()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Save & Add Another
                    </Button>
                  )}
                  <Button onClick={handleSave} disabled={!canProceed()}>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Save Changes' : 'Save & Continue to Dashboard'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
