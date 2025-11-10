import type { DataElement, RiskLevel, AgeGroup } from '@/types'

export interface RiskScoreFactors {
  categoryRisk: number
  encryptionRisk: number
  accessRisk: number
  sharingRisk: number
  retentionRisk: number
  securityControlsRisk: number
}

/**
 * Calculate risk score for a data element based on multiple factors
 * Returns a score from 0-10 and the overall risk level
 */
export function calculateRiskScore(
  element: DataElement,
  ageGroups?: AgeGroup[]
): { score: number; level: RiskLevel; factors: RiskScoreFactors } {
  let score = 0
  const factors: RiskScoreFactors = {
    categoryRisk: 0,
    encryptionRisk: 0,
    accessRisk: 0,
    sharingRisk: 0,
    retentionRisk: 0,
    securityControlsRisk: 0,
  }

  // 1. Data Category Risk (0-3 points)
  const categoryRiskMap = {
    health_information: 3,
    biometric_data: 3,
    financial_data: 3,
    educational_records: 2.5,
    pii: 2,
    location_data: 1.5,
    behavioral_data: 1.5,
    content_files: 1,
    usage_analytics: 0.5,
    other: 1,
  }
  factors.categoryRisk = categoryRiskMap[element.category] || 1

  // Special case: Educational records + children under 13
  if (
    element.category === 'educational_records' &&
    ageGroups?.some((ag) => ag === 'early_childhood' || ag === 'k5' || ag === '6-8')
  ) {
    factors.categoryRisk = 3
  }

  score += factors.categoryRisk

  // 2. Encryption Risk (0-2 points)
  if (element.encryptionAtRest === 'no' || element.encryptionInTransit === 'no') {
    factors.encryptionRisk = 2
  } else if (element.encryptionAtRest === 'unknown' || element.encryptionInTransit === 'unknown') {
    factors.encryptionRisk = 1
  }
  score += factors.encryptionRisk

  // 3. Access Control Risk (0-2 points)
  // Many roles = higher risk
  if (element.accessRoles.length >= 7) {
    factors.accessRisk = 2
  } else if (element.accessRoles.length >= 4) {
    factors.accessRisk = 1
  }

  // Marketing team accessing educational records or PII = high risk
  if (
    element.accessRoles.includes('marketing_team') &&
    (element.category === 'educational_records' || element.category === 'pii')
  ) {
    factors.accessRisk = Math.max(factors.accessRisk, 2)
  }

  // No formal access controls = risk
  if (element.accessControlMethod === 'no_formal') {
    factors.accessRisk = Math.max(factors.accessRisk, 1.5)
  }
  score += factors.accessRisk

  // 4. Third-party Sharing Risk (0-2 points)
  if (element.sharedWithThirdParties) {
    if (element.thirdPartyRecipients.length === 0) {
      // Shared but no recipients listed
      factors.sharingRisk = 1
    } else {
      const hasNoAgreements = element.thirdPartyRecipients.some(
        (r) => r.agreementType === 'none' || r.agreementType === 'unknown'
      )
      if (hasNoAgreements) {
        factors.sharingRisk = 2
      } else {
        factors.sharingRisk = 0.5
      }
    }
  }
  score += factors.sharingRisk

  // 5. Retention & Deletion Policy Risk (0-1 points)
  if (
    element.deletionPolicy === 'no_policy' ||
    element.deletionPolicy === 'unknown'
  ) {
    factors.retentionRisk = 1
  } else if (
    element.retentionPeriod === 'indefinitely' &&
    (element.category === 'pii' || element.category === 'educational_records')
  ) {
    factors.retentionRisk = 0.5
  }
  score += factors.retentionRisk

  // 6. Security Controls Risk (0-1 points)
  if (element.loggingEnabled === 'no' || element.loggingEnabled === 'unknown') {
    factors.securityControlsRisk += 0.5
  }
  if (
    element.mfaRequired === 'no' &&
    (element.category === 'pii' ||
      element.category === 'educational_records' ||
      element.category === 'health_information' ||
      element.category === 'financial_data')
  ) {
    factors.securityControlsRisk += 0.5
  }
  score += factors.securityControlsRisk

  // Determine risk level based on score
  let level: RiskLevel
  if (score >= 7) {
    level = 'high'
  } else if (score >= 4) {
    level = 'medium'
  } else {
    level = 'low'
  }

  return {
    score: Math.min(score, 10), // Cap at 10
    level,
    factors,
  }
}

/**
 * Get risk level color for UI display
 */
export function getRiskColor(level: RiskLevel): string {
  const colors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
  }
  return colors[level]
}

/**
 * Get risk level badge variant
 */
export function getRiskBadgeVariant(level: RiskLevel): 'destructive' | 'warning' | 'success' {
  const variants = {
    high: 'destructive' as const,
    medium: 'warning' as const,
    low: 'success' as const,
  }
  return variants[level]
}

/**
 * Get risk level display label
 */
export function getRiskLabel(level: RiskLevel): string {
  const labels = {
    high: 'High Risk',
    medium: 'Medium Risk',
    low: 'Low Risk',
  }
  return labels[level]
}
