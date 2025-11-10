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
