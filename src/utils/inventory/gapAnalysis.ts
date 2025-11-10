import type { DataElement, ComplianceGap, AgeGroup } from '@/types'
import { generateId } from './helpers'

/**
 * Analyze data inventory and identify compliance gaps
 */
export function analyzeComplianceGaps(
  dataElements: DataElement[],
  ageGroups: AgeGroup[]
): ComplianceGap[] {
  const gaps: ComplianceGap[] = []
  let priorityCounter = 1

  // CRITICAL GAPS

  // 1. Educational records without encryption
  const unencryptedEducationalRecords = dataElements.filter(
    (el) =>
      el.category === 'educational_records' &&
      (el.encryptionAtRest === 'no' || el.encryptionInTransit === 'no')
  )
  if (unencryptedEducationalRecords.length > 0) {
    gaps.push({
      id: generateId(),
      severity: 'critical',
      title: 'Educational Records Without Encryption',
      description: `${unencryptedEducationalRecords.length} educational record(s) lack proper encryption`,
      whyItMatters:
        'FERPA and state laws require educational institutions to protect student education records with appropriate security measures. Unencrypted data is vulnerable to unauthorized access and breaches.',
      recommendedAction:
        'Implement AES-256 encryption for all educational records at rest and TLS 1.2+ for data in transit',
      affectedElements: unencryptedEducationalRecords.map((el) => el.id),
      priority: priorityCounter++,
    })
  }

  // 2. Health/biometric data without proper safeguards
  const unsafeHealthData = dataElements.filter(
    (el) =>
      (el.category === 'health_information' || el.category === 'biometric_data') &&
      (el.encryptionAtRest === 'no' ||
        el.encryptionInTransit === 'no' ||
        el.accessControlMethod === 'no_formal' ||
        el.loggingEnabled === 'no')
  )
  if (unsafeHealthData.length > 0) {
    gaps.push({
      id: generateId(),
      severity: 'critical',
      title: 'Health/Biometric Data Without Adequate Safeguards',
      description: `${unsafeHealthData.length} health or biometric data element(s) lack required security controls`,
      whyItMatters:
        'Health information and biometric data are highly sensitive and may be subject to HIPAA (if applicable), GDPR, and state privacy laws. Inadequate protection can result in significant fines and legal liability.',
      recommendedAction:
        'Implement encryption, strict access controls, audit logging, and consider obtaining Business Associate Agreements if handling protected health information',
      affectedElements: unsafeHealthData.map((el) => el.id),
      priority: priorityCounter++,
    })
  }

  // 3. Data shared with third parties without agreements
  const sharedWithoutAgreements = dataElements.filter(
    (el) =>
      el.sharedWithThirdParties &&
      el.thirdPartyRecipients.some(
        (r) => r.agreementType === 'none' || r.agreementType === 'unknown'
      )
  )
  if (sharedWithoutAgreements.length > 0) {
    gaps.push({
      id: generateId(),
      severity: 'critical',
      title: 'Third-party Data Sharing Without Agreements',
      description: `${sharedWithoutAgreements.length} data element(s) are shared with vendors without proper data processing agreements`,
      whyItMatters:
        'FERPA, GDPR, and state laws require written agreements with third-party service providers that handle student or personal data. Without these agreements, you may be liable for vendor data breaches.',
      recommendedAction:
        'Execute Data Processing Agreements (DPAs) or Business Associate Agreements (BAAs) with all third-party vendors before sharing any personal or educational data',
      affectedElements: sharedWithoutAgreements.map((el) => el.id),
      priority: priorityCounter++,
    })
  }

  // 4. No deletion policy for sensitive data
  const noDeletionPolicy = dataElements.filter(
    (el) =>
      (el.category === 'pii' ||
        el.category === 'educational_records' ||
        el.category === 'health_information' ||
        el.category === 'financial_data') &&
      (el.deletionPolicy === 'no_policy' || el.deletionPolicy === 'unknown')
  )
  if (noDeletionPolicy.length > 0) {
    gaps.push({
      id: generateId(),
      severity: 'critical',
      title: 'No Deletion Policy for Sensitive Data',
      description: `${noDeletionPolicy.length} sensitive data element(s) lack a clear deletion policy`,
      whyItMatters:
        'GDPR, CCPA, and other privacy laws grant individuals the right to deletion. Educational records also have retention requirements. Without a deletion policy, you risk non-compliance and may retain data longer than legally permitted.',
      recommendedAction:
        'Establish and document clear data deletion policies aligned with legal requirements. Implement automated deletion procedures where possible.',
      affectedElements: noDeletionPolicy.map((el) => el.id),
      priority: priorityCounter++,
    })
  }

  // 5. Marketing team accessing educational records
  const marketingAccessToEducation = dataElements.filter(
    (el) =>
      (el.category === 'educational_records' || el.category === 'pii') &&
      el.accessRoles.includes('marketing_team')
  )
  if (marketingAccessToEducation.length > 0) {
    gaps.push({
      id: generateId(),
      severity: 'critical',
      title: 'Marketing Team Access to Educational Records',
      description: `Marketing team has access to ${marketingAccessToEducation.length} educational record(s) or PII`,
      whyItMatters:
        'FERPA prohibits using educational records for marketing without explicit consent. California SOPIPA prohibits targeted advertising using K-12 student data. This access creates significant compliance risk.',
      recommendedAction:
        'Remove marketing team access to educational records and PII. Implement strict role-based access controls to ensure only authorized personnel can access student data.',
      affectedElements: marketingAccessToEducation.map((el) => el.id),
      priority: priorityCounter++,
    })
  }

  // 6. Data from children <13 without appropriate protections
  const hasYoungChildren = ageGroups.some((ag) => ag === 'early_childhood' || ag === 'k5')
  if (hasYoungChildren) {
    const childDataWithoutProtection = dataElements.filter(
      (el) =>
        el.category === 'pii' &&
        (el.encryptionAtRest !== 'yes' ||
          el.encryptionInTransit !== 'yes' ||
          el.accessControlMethod === 'no_formal')
    )
    if (childDataWithoutProtection.length > 0) {
      gaps.push({
        id: generateId(),
        severity: 'critical',
        title: 'Insufficient Protection for Children Under 13',
        description: `${childDataWithoutProtection.length} PII element(s) from children lack adequate protection`,
        whyItMatters:
          'COPPA requires operators to maintain reasonable security procedures to protect children\'s personal information. Inadequate protection can result in FTC enforcement actions and significant fines.',
        recommendedAction:
          'Implement strong encryption, strict access controls, and ensure verifiable parental consent mechanisms are in place for all data collected from children under 13.',
        affectedElements: childDataWithoutProtection.map((el) => el.id),
        priority: priorityCounter++,
      })
    }
  }

  // IMPORTANT GAPS

  // 7. Missing access controls or logging
  const missingAccessControls = dataElements.filter(
    (el) =>
      (el.category === 'pii' || el.category === 'educational_records') &&
      (el.accessControlMethod === 'no_formal' ||
        el.accessControlMethod === 'unknown' ||
        el.loggingEnabled === 'no' ||
        el.loggingEnabled === 'unknown')
  )
  if (missingAccessControls.length > 0) {
    gaps.push({
      id: generateId(),
      severity: 'important',
      title: 'Missing Access Controls or Audit Logging',
      description: `${missingAccessControls.length} sensitive data element(s) lack formal access controls or audit logging`,
      whyItMatters:
        'Audit trails are essential for detecting unauthorized access and demonstrating compliance. Many regulations require logging of access to personal and educational data.',
      recommendedAction:
        'Implement role-based access control (RBAC) and enable comprehensive audit logging for all access to sensitive data.',
      affectedElements: missingAccessControls.map((el) => el.id),
      priority: priorityCounter++,
    })
  }

  // 8. Unclear retention policies
  const unclearRetention = dataElements.filter(
    (el) =>
      (el.category === 'pii' || el.category === 'educational_records') &&
      (el.retentionPeriod === 'indefinitely' || el.retentionPeriod === 'custom') &&
      !el.customRetentionPeriod
  )
  if (unclearRetention.length > 0) {
    gaps.push({
      id: generateId(),
      severity: 'important',
      title: 'Unclear Data Retention Policies',
      description: `${unclearRetention.length} data element(s) have indefinite or unclear retention periods`,
      whyItMatters:
        'Data minimization is a key principle in GDPR, CCPA, and other privacy regulations. Retaining data longer than necessary increases risk and potential liability.',
      recommendedAction:
        'Establish clear retention schedules based on business needs and legal requirements. Document retention periods for each data type.',
      affectedElements: unclearRetention.map((el) => el.id),
      priority: priorityCounter++,
    })
  }

  // 9. No MFA for sensitive data access
  const noMFA = dataElements.filter(
    (el) =>
      (el.category === 'pii' ||
        el.category === 'educational_records' ||
        el.category === 'health_information' ||
        el.category === 'financial_data') &&
      el.mfaRequired === 'no'
  )
  if (noMFA.length > 0) {
    gaps.push({
      id: generateId(),
      severity: 'important',
      title: 'No Multi-Factor Authentication for Sensitive Data',
      description: `${noMFA.length} sensitive data element(s) can be accessed without MFA`,
      whyItMatters:
        'Multi-factor authentication significantly reduces the risk of unauthorized access. Many cybersecurity frameworks and regulations recommend or require MFA for accessing sensitive data.',
      recommendedAction:
        'Implement multi-factor authentication for all users accessing sensitive personal, educational, health, or financial data.',
      affectedElements: noMFA.map((el) => el.id),
      priority: priorityCounter++,
    })
  }

  // RECOMMENDATIONS

  // 10. Implement encryption for PII
  const unencryptedPII = dataElements.filter(
    (el) =>
      el.category === 'pii' &&
      (el.encryptionAtRest === 'no' ||
        el.encryptionAtRest === 'unknown' ||
        el.encryptionInTransit === 'no' ||
        el.encryptionInTransit === 'unknown')
  )
  if (unencryptedPII.length > 0) {
    gaps.push({
      id: generateId(),
      severity: 'recommendation',
      title: 'Encrypt All PII',
      description: `${unencryptedPII.length} PII element(s) lack full encryption`,
      whyItMatters:
        'While not always legally required for all PII, encryption is a best practice that significantly reduces risk in case of a breach.',
      recommendedAction:
        'Implement encryption at rest and in transit for all personally identifiable information as a security best practice.',
      affectedElements: unencryptedPII.map((el) => el.id),
      priority: priorityCounter++,
    })
  }

  // 11. Enable audit logging
  const noLogging = dataElements.filter(
    (el) => el.loggingEnabled === 'no' || el.loggingEnabled === 'unknown'
  )
  if (noLogging.length > 0) {
    gaps.push({
      id: generateId(),
      severity: 'recommendation',
      title: 'Enable Audit Logging',
      description: `${noLogging.length} data element(s) lack audit logging`,
      whyItMatters:
        'Audit logs help detect security incidents, support compliance investigations, and demonstrate accountability.',
      recommendedAction:
        'Enable comprehensive audit logging for all data access and modifications. Retain logs for at least 90 days.',
      affectedElements: noLogging.map((el) => el.id),
      priority: priorityCounter++,
    })
  }

  // 12. Document data deletion procedures
  const userCannotDelete = dataElements.filter(
    (el) =>
      (el.category === 'pii' || el.category === 'educational_records') &&
      el.userDeletionRights === 'cannot_delete'
  )
  if (userCannotDelete.length > 0) {
    gaps.push({
      id: generateId(),
      severity: 'recommendation',
      title: 'Review User Deletion Rights',
      description: `${userCannotDelete.length} data element(s) cannot be deleted by users`,
      whyItMatters:
        'GDPR and CCPA provide users with the right to deletion. While some educational records may be exempt, consider whether user-initiated deletion should be enabled.',
      recommendedAction:
        'Review deletion rights for each data type and enable user-initiated deletion where legally permissible.',
      affectedElements: userCannotDelete.map((el) => el.id),
      priority: priorityCounter++,
    })
  }

  return gaps
}
