export interface Question {
  id: string
  question: string
  description?: string
  type: 'single-choice' | 'multiple-choice'
  options: QuestionOption[]
  category: 'business' | 'data' | 'users' | 'geography'
}

export interface QuestionOption {
  value: string
  label: string
  description?: string
  triggers?: string[] // regulation IDs that this option triggers
}

export interface Answer {
  questionId: string
  value: string | string[]
}

export interface Regulation {
  id: string
  name: string
  shortName: string
  description: string
  scope: string
  applicability: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  color: string
  keyRequirements: string[]
  learnMoreUrl?: string
}

export interface ComplianceRecommendation {
  regulationId: string
  title: string
  description: string
  priority: 'immediate' | 'short-term' | 'medium-term' | 'long-term'
  effort: 'low' | 'medium' | 'high'
  actions: string[]
}

export interface AssessmentResult {
  answers: Answer[]
  triggeredRegulations: string[]
  recommendations: ComplianceRecommendation[]
  completedAt: Date
}

// Data Inventory Types

export type ProductType =
  | 'lms'
  | 'tutoring'
  | 'assessment'
  | 'sis'
  | 'content_library'
  | 'communication'
  | 'other'

export type AgeGroup =
  | 'early_childhood'
  | 'k5'
  | '6-8'
  | '9-12'
  | 'higher_ed'
  | 'adult'
  | 'mixed'

export type GeographicMarket =
  | 'us_only'
  | 'california'
  | 'new_york'
  | 'eu'
  | 'international'
  | 'other'

export type DataCategory =
  | 'pii'
  | 'educational_records'
  | 'behavioral_data'
  | 'health_information'
  | 'biometric_data'
  | 'financial_data'
  | 'location_data'
  | 'usage_analytics'
  | 'content_files'
  | 'other'

export type DataSource =
  | 'user_input'
  | 'system_generated'
  | 'third_party_import'
  | 'inferred_derived'

export type CollectionPurpose =
  | 'authentication'
  | 'communication'
  | 'grading'
  | 'analytics'
  | 'personalization'
  | 'marketing'
  | 'legal_requirement'
  | 'product_functionality'
  | 'other'

export type StorageLocation =
  | 'own_servers'
  | 'aws'
  | 'google_cloud'
  | 'azure'
  | 'other_cloud'
  | 'third_party_saas'
  | 'multiple'

export type YesNoUnknown = 'yes' | 'no' | 'unknown'

export type BackupStrategy =
  | 'automated'
  | 'manual'
  | 'none'
  | 'unknown'

export type AccessRole =
  | 'admins'
  | 'teachers'
  | 'students'
  | 'parents'
  | 'support_team'
  | 'analytics_team'
  | 'marketing_team'
  | 'product_team'
  | 'external_vendors'
  | 'other'

export type AccessControlMethod =
  | 'rbac'
  | 'user_based'
  | 'attribute_based'
  | 'no_formal'
  | 'unknown'

export type RetentionPeriod =
  | 'account_lifetime'
  | '1_year'
  | '3_years'
  | '5_years'
  | '7_years'
  | 'until_deleted'
  | 'indefinitely'
  | 'custom'

export type DeletionPolicy =
  | 'automated_purge'
  | 'manual_deletion'
  | 'soft_delete'
  | 'hard_delete'
  | 'no_policy'
  | 'unknown'

export type UserDeletionRights =
  | 'can_delete'
  | 'must_request'
  | 'cannot_delete'
  | 'unknown'

export type ProcessingAgreementType =
  | 'dpa'
  | 'baa'
  | 'other'
  | 'none'
  | 'unknown'

export type RiskLevel = 'high' | 'medium' | 'low'

export interface ThirdPartyRecipient {
  id: string
  name: string
  purpose: string
  agreementType: ProcessingAgreementType
  dataResidencyRequirements: YesNoUnknown
}

export interface DataElement {
  id: string
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
  riskLevel: RiskLevel
  riskScore: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface InventorySetup {
  productType: ProductType
  ageGroups: AgeGroup[]
  geographicMarkets: GeographicMarket[]
  companyName?: string
}

export interface DataInventory {
  id: string
  name: string
  setup: InventorySetup
  dataElements: DataElement[]
  createdAt: Date
  updatedAt: Date
  version: number
}

export interface ComplianceGap {
  id: string
  severity: 'critical' | 'important' | 'recommendation'
  title: string
  description: string
  whyItMatters: string
  recommendedAction: string
  affectedElements: string[] // data element IDs
  priority: number
}

export interface InventoryStatistics {
  totalElements: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  thirdPartyVendorCount: number
  criticalGapsCount: number
}
