import type {
  ProductType,
  AgeGroup,
  GeographicMarket,
  DataCategory,
  DataSource,
  CollectionPurpose,
  StorageLocation,
  BackupStrategy,
  AccessRole,
  AccessControlMethod,
  RetentionPeriod,
  DeletionPolicy,
  UserDeletionRights,
  ProcessingAgreementType,
  YesNoUnknown,
} from '@/types'

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  lms: 'Learning Management System (LMS)',
  tutoring: 'Tutoring Platform',
  assessment: 'Assessment Tool',
  sis: 'Student Information System',
  content_library: 'Content Library',
  communication: 'Communication Platform',
  other: 'Other',
}

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  early_childhood: 'Early Childhood (0-4)',
  k5: 'K-5 (ages 5-10)',
  '6-8': 'Middle School (ages 11-13)',
  '9-12': 'High School (ages 14-18)',
  higher_ed: 'Higher Education (18+)',
  adult: 'Adult Learners',
  mixed: 'Mixed Age Groups',
}

export const GEOGRAPHIC_MARKET_LABELS: Record<GeographicMarket, string> = {
  us_only: 'US Only',
  california: 'California',
  new_york: 'New York',
  eu: 'European Union',
  international: 'International',
  other: 'Other',
}

export const DATA_CATEGORY_LABELS: Record<DataCategory, string> = {
  pii: 'Personally Identifiable Information (PII)',
  educational_records: 'Educational Records',
  behavioral_data: 'Behavioral Data',
  health_information: 'Health Information',
  biometric_data: 'Biometric Data',
  financial_data: 'Financial Data',
  location_data: 'Location Data',
  usage_analytics: 'Usage Analytics',
  content_files: 'Content/Files',
  other: 'Other',
}

export const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  user_input: 'User Input',
  system_generated: 'System Generated',
  third_party_import: 'Third-party Import',
  inferred_derived: 'Inferred/Derived',
}

export const COLLECTION_PURPOSE_LABELS: Record<CollectionPurpose, string> = {
  authentication: 'Authentication',
  communication: 'Communication',
  grading: 'Grading',
  analytics: 'Analytics',
  personalization: 'Personalization',
  marketing: 'Marketing',
  legal_requirement: 'Legal Requirement',
  product_functionality: 'Product Functionality',
  other: 'Other',
}

export const STORAGE_LOCATION_LABELS: Record<StorageLocation, string> = {
  own_servers: 'Your Own Servers',
  aws: 'Amazon Web Services (AWS)',
  google_cloud: 'Google Cloud Platform',
  azure: 'Microsoft Azure',
  other_cloud: 'Other Cloud Provider',
  third_party_saas: 'Third-party SaaS',
  multiple: 'Multiple Locations',
}

export const YES_NO_UNKNOWN_LABELS: Record<YesNoUnknown, string> = {
  yes: 'Yes',
  no: 'No',
  unknown: "Don't Know",
}

export const BACKUP_STRATEGY_LABELS: Record<BackupStrategy, string> = {
  automated: 'Regular Automated Backups',
  manual: 'Manual Backups',
  none: 'No Backups',
  unknown: "Don't Know",
}

export const ACCESS_ROLE_LABELS: Record<AccessRole, string> = {
  admins: 'Admins',
  teachers: 'Teachers',
  students: 'Students',
  parents: 'Parents',
  support_team: 'Support Team',
  analytics_team: 'Analytics Team',
  marketing_team: 'Marketing Team',
  product_team: 'Product Team',
  external_vendors: 'External Vendors',
  other: 'Other',
}

export const ACCESS_CONTROL_METHOD_LABELS: Record<AccessControlMethod, string> = {
  rbac: 'Role-based Access Control (RBAC)',
  user_based: 'User-based Permissions',
  attribute_based: 'Attribute-based Access Control',
  no_formal: 'No Formal Controls',
  unknown: "Don't Know",
}

export const RETENTION_PERIOD_LABELS: Record<RetentionPeriod, string> = {
  account_lifetime: 'Account Lifetime',
  '1_year': '1 Year',
  '3_years': '3 Years',
  '5_years': '5 Years',
  '7_years': '7 Years',
  until_deleted: 'Until Deleted by User',
  indefinitely: 'Indefinitely',
  custom: 'Custom (specify below)',
}

export const DELETION_POLICY_LABELS: Record<DeletionPolicy, string> = {
  automated_purge: 'Automated Purge',
  manual_deletion: 'Manual Deletion',
  soft_delete: 'Soft Delete (marked as deleted)',
  hard_delete: 'Hard Delete (permanent)',
  no_policy: 'No Deletion Policy',
  unknown: "Don't Know",
}

export const USER_DELETION_RIGHTS_LABELS: Record<UserDeletionRights, string> = {
  can_delete: 'Users Can Delete',
  must_request: 'Users Must Request Deletion',
  cannot_delete: 'Users Cannot Delete',
  unknown: "Don't Know",
}

export const PROCESSING_AGREEMENT_TYPE_LABELS: Record<ProcessingAgreementType, string> = {
  dpa: 'Yes - Data Processing Agreement (DPA)',
  baa: 'Yes - Business Associate Agreement (BAA)',
  other: 'Yes - Other Agreement',
  none: 'No Agreement',
  unknown: "Don't Know",
}
