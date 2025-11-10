import type { Answer, ComplianceRecommendation } from '@/types'
import { regulations } from '@/data/regulations'
import { questions } from '@/data/questions'

export function detectTriggeredRegulations(answers: Answer[]): string[] {
  const triggeredSet = new Set<string>()

  answers.forEach((answer) => {
    const question = questions.find((q) => q.id === answer.questionId)
    if (!question) return

    const selectedValues = Array.isArray(answer.value) ? answer.value : [answer.value]

    selectedValues.forEach((value) => {
      const option = question.options.find((opt) => opt.value === value)
      if (option?.triggers) {
        option.triggers.forEach((regId) => triggeredSet.add(regId))
      }
    })
  })

  return Array.from(triggeredSet)
}

export function generateRecommendations(
  triggeredRegulationIds: string[],
  answers: Answer[]
): ComplianceRecommendation[] {
  const recommendations: ComplianceRecommendation[] = []

  triggeredRegulationIds.forEach((regId) => {
    const regulation = regulations[regId]
    if (!regulation) return

    // Generate regulation-specific recommendations based on answers
    const regRecommendations = getRegulationRecommendations(regId, answers)
    recommendations.push(...regRecommendations)
  })

  // Sort by priority (immediate first) and effort (low effort first within same priority)
  return recommendations.sort((a, b) => {
    const priorityOrder = { immediate: 0, 'short-term': 1, 'medium-term': 2, 'long-term': 3 }
    const effortOrder = { low: 0, medium: 1, high: 2 }

    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff

    return effortOrder[a.effort] - effortOrder[b.effort]
  })
}

function getRegulationRecommendations(
  regulationId: string,
  answers: Answer[]
): ComplianceRecommendation[] {
  const recommendations: ComplianceRecommendation[] = []

  // Helper to find answer value
  const getAnswer = (questionId: string): string | string[] | undefined => {
    return answers.find((a) => a.questionId === questionId)?.value
  }

  switch (regulationId) {
    case 'FERPA':
      recommendations.push({
        regulationId: 'FERPA',
        title: 'Review and Update FERPA Compliance Program',
        description: 'Ensure your organization has proper FERPA safeguards in place for student education records.',
        priority: 'immediate',
        effort: 'medium',
        actions: [
          'Review all contracts with educational institutions to include FERPA language',
          'Implement "school official" exception provisions in agreements',
          'Train staff on FERPA requirements and student record handling',
          'Establish procedures for obtaining consent before disclosure',
          'Create audit trail for all education record disclosures',
        ],
      })

      if (getAnswer('q7') === 'sell' || getAnswer('q7') === 'share_service') {
        recommendations.push({
          regulationId: 'FERPA',
          title: 'Audit Third-Party Data Sharing Practices',
          description: 'FERPA restricts sharing education records without consent or valid exception.',
          priority: 'immediate',
          effort: 'high',
          actions: [
            'Document all third-party service providers receiving student data',
            'Ensure all vendors sign agreements with FERPA compliance provisions',
            'Implement data processing agreements that prohibit unauthorized redisclosure',
            'Review and potentially eliminate data sharing not covered by FERPA exceptions',
          ],
        })
      }

      if (getAnswer('q11') !== 'both') {
        recommendations.push({
          regulationId: 'FERPA',
          title: 'Implement Comprehensive Data Encryption',
          description: 'Protect student education records with encryption in transit and at rest.',
          priority: 'immediate',
          effort: 'medium',
          actions: [
            'Deploy TLS 1.2+ for all data in transit',
            'Implement AES-256 encryption for data at rest',
            'Encrypt database backups and archives',
            'Document encryption standards in security policies',
          ],
        })
      }
      break

    case 'COPPA':
      recommendations.push({
        regulationId: 'COPPA',
        title: 'Implement Verifiable Parental Consent Mechanism',
        description: 'COPPA requires verifiable parental consent before collecting information from children under 13.',
        priority: 'immediate',
        effort: 'high',
        actions: [
          'Choose and implement FTC-approved parental consent method',
          'Update registration flows to verify user age',
          'Implement age-gating before collecting any personal information',
          'Provide clear notice to parents about data collection practices',
          'Create parent dashboard for managing child consent and data',
        ],
      })

      if (getAnswer('q15') !== 'yes_comprehensive') {
        recommendations.push({
          regulationId: 'COPPA',
          title: 'Create COPPA-Compliant Privacy Policy',
          description: 'Develop a clear, comprehensive privacy policy meeting COPPA disclosure requirements.',
          priority: 'immediate',
          effort: 'low',
          actions: [
            'List all types of personal information collected from children',
            'Disclose how information is used, shared, and retained',
            'Explain parental rights to access, review, and delete child data',
            'Provide contact information for privacy questions',
            'Make policy easily accessible from homepage and registration',
          ],
        })
      }

      if (getAnswer('q6') === 'yes_targeted') {
        recommendations.push({
          regulationId: 'COPPA',
          title: 'Eliminate Targeted Advertising to Children',
          description: 'COPPA restricts use of children\'s data for behavioral advertising.',
          priority: 'immediate',
          effort: 'high',
          actions: [
            'Disable all targeted advertising for users under 13',
            'Remove tracking pixels and analytics that create profiles of children',
            'If advertising is necessary, show only contextual (not behavioral) ads',
            'Ensure third-party ad networks comply with COPPA',
          ],
        })
      }
      break

    case 'SOPIPA':
      recommendations.push({
        regulationId: 'SOPIPA',
        title: 'Prohibit Prohibited Uses Under SOPIPA',
        description: 'California SOPIPA restricts how K-12 student data can be used.',
        priority: 'immediate',
        effort: 'medium',
        actions: [
          'Cease all targeted advertising based on K-12 student data',
          'Stop creating profiles for non-educational purposes',
          'Implement policies prohibiting sale of K-12 student information',
          'Limit data collection to what is necessary for K-12 school purposes',
          'Update terms of service to reflect SOPIPA compliance',
        ],
      })

      recommendations.push({
        regulationId: 'SOPIPA',
        title: 'Implement Student Data Deletion Process',
        description: 'Schools must be able to request deletion of K-12 student data.',
        priority: 'short-term',
        effort: 'medium',
        actions: [
          'Create process for schools to request student data deletion',
          'Document data retention policies aligned with educational purposes',
          'Build tools for schools to initiate bulk data deletion',
          'Ensure deletion extends to backups and archives',
          'Provide confirmation of deletion to requesting school',
        ],
      })
      break

    case 'NY_ED_LAW_2D':
      recommendations.push({
        regulationId: 'NY_ED_LAW_2D',
        title: 'Develop Data Security and Privacy Plan',
        description: 'NY Education Law 2-d requires a comprehensive written plan.',
        priority: 'immediate',
        effort: 'high',
        actions: [
          'Create detailed data security and privacy plan document',
          'Address all required elements: administrative, technical, and physical safeguards',
          'Designate Chief Privacy Officer or equivalent role',
          'Implement employee training on data security and privacy',
          'Establish incident response and breach notification procedures',
          'Share plan with NY educational agency partners',
        ],
      })

      if (getAnswer('q11') !== 'both') {
        recommendations.push({
          regulationId: 'NY_ED_LAW_2D',
          title: 'Encrypt All Student PII',
          description: 'NY law specifically requires encryption of student PII in transit and at rest.',
          priority: 'immediate',
          effort: 'medium',
          actions: [
            'Implement encryption for all student PII in transit (TLS 1.2+)',
            'Implement encryption for all student PII at rest (AES-256 or equivalent)',
            'Document encryption methods and key management procedures',
            'Regularly test and audit encryption implementation',
          ],
        })
      }

      recommendations.push({
        regulationId: 'NY_ED_LAW_2D',
        title: 'Publish Parents\' Bill of Rights',
        description: 'NY schools must provide parents with Bill of Rights for Data Privacy and Security.',
        priority: 'short-term',
        effort: 'low',
        actions: [
          'Obtain NY Parents\' Bill of Rights template from NYSED',
          'Ensure document is accessible on your website',
          'Work with school partners to ensure parents receive the Bill of Rights',
          'Update annually or when practices change',
        ],
      })
      break

    case 'GDPR':
      recommendations.push({
        regulationId: 'GDPR',
        title: 'Establish GDPR Compliance Framework',
        description: 'Implement comprehensive GDPR compliance program for EU data subjects.',
        priority: 'immediate',
        effort: 'high',
        actions: [
          'Appoint Data Protection Officer (DPO) if required',
          'Document lawful basis for all personal data processing',
          'Implement privacy by design and by default',
          'Create Records of Processing Activities (ROPA)',
          'Establish processes for data subject rights requests',
          'Ensure valid legal mechanisms for international data transfers',
        ],
      })

      if (getAnswer('q10') !== 'yes_documented') {
        recommendations.push({
          regulationId: 'GDPR',
          title: 'Implement 72-Hour Breach Notification',
          description: 'GDPR requires breach notification to supervisory authority within 72 hours.',
          priority: 'immediate',
          effort: 'medium',
          actions: [
            'Develop incident response plan with clear escalation procedures',
            'Identify EU supervisory authority for breach notifications',
            'Create breach notification templates',
            'Train team on breach detection and reporting requirements',
            'Implement monitoring to detect breaches quickly',
          ],
        })
      }

      if (getAnswer('q9') === 'clickthrough' || getAnswer('q9') === 'no_explicit') {
        recommendations.push({
          regulationId: 'GDPR',
          title: 'Implement Valid Consent Mechanisms',
          description: 'GDPR requires freely given, specific, informed, and unambiguous consent.',
          priority: 'immediate',
          effort: 'medium',
          actions: [
            'Redesign consent flows to be explicit and granular',
            'Separate consent for different processing purposes',
            'Make consent as easy to withdraw as to give',
            'Document and store proof of consent',
            'Avoid pre-ticked boxes and bundled consent',
          ],
        })
      }

      recommendations.push({
        regulationId: 'GDPR',
        title: 'Conduct Data Protection Impact Assessment (DPIA)',
        description: 'Assess high-risk processing activities under GDPR.',
        priority: 'short-term',
        effort: 'medium',
        actions: [
          'Identify processing activities that require DPIA',
          'Conduct systematic description of processing operations',
          'Assess necessity and proportionality of processing',
          'Identify and evaluate risks to data subjects',
          'Implement measures to mitigate risks',
          'Consult DPO and potentially supervisory authority',
        ],
      })
      break

    case 'CCPA':
      recommendations.push({
        regulationId: 'CCPA',
        title: 'Implement CCPA Consumer Rights Infrastructure',
        description: 'Provide California consumers with rights to access, delete, and opt-out.',
        priority: 'immediate',
        effort: 'high',
        actions: [
          'Create "Do Not Sell My Personal Information" link (if applicable)',
          'Implement consumer request submission portal',
          'Establish identity verification process for requests',
          'Build systems to respond to requests within 45 days',
          'Train customer service on handling CCPA requests',
          'Implement data portability features',
        ],
      })

      if (getAnswer('q15') !== 'yes_comprehensive') {
        recommendations.push({
          regulationId: 'CCPA',
          title: 'Update Privacy Policy for CCPA',
          description: 'CCPA requires specific disclosures in privacy policy.',
          priority: 'immediate',
          effort: 'low',
          actions: [
            'Disclose categories of personal information collected',
            'Disclose sources of personal information',
            'Disclose business purposes for collecting information',
            'Disclose categories of third parties with whom information is shared',
            'Describe consumer rights under CCPA',
            'Provide instructions for exercising CCPA rights',
          ],
        })
      }

      if (getAnswer('q7') === 'sell') {
        recommendations.push({
          regulationId: 'CCPA',
          title: 'Implement "Do Not Sell" Mechanism',
          description: 'Provide clear opt-out for sale of personal information.',
          priority: 'immediate',
          effort: 'medium',
          actions: [
            'Add "Do Not Sell My Personal Information" link to homepage',
            'Create opt-out mechanism that is easy to use',
            'Stop selling data of users who opt-out within 15 days',
            'Do not require account creation to opt-out',
            'Respect opt-out for at least 12 months before requesting opt-in',
          ],
        })
      }

      recommendations.push({
        regulationId: 'CCPA',
        title: 'Update Service Provider Agreements',
        description: 'Ensure vendor contracts meet CCPA service provider requirements.',
        priority: 'short-term',
        effort: 'medium',
        actions: [
          'Review all third-party vendor contracts',
          'Include CCPA service provider contractual requirements',
          'Prohibit vendors from selling personal information',
          'Require vendors to assist with consumer rights requests',
          'Obtain certifications of CCPA compliance from vendors',
        ],
      })
      break
  }

  return recommendations
}

export function getComplianceSummary(triggeredRegulationIds: string[]) {
  const critical = triggeredRegulationIds.filter((id) => regulations[id]?.priority === 'critical')
  const high = triggeredRegulationIds.filter((id) => regulations[id]?.priority === 'high')
  const medium = triggeredRegulationIds.filter((id) => regulations[id]?.priority === 'medium')

  return {
    total: triggeredRegulationIds.length,
    critical: critical.length,
    high: high.length,
    medium: medium.length,
  }
}
