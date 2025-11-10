import { useState } from 'react'
import type { Question, Answer } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface QuestionnaireProps {
  questions: Question[]
  answers: Answer[]
  onAnswerChange: (questionId: string, value: string | string[]) => void
  onComplete: () => void
}

export function Questionnaire({ questions, answers, onAnswerChange, onComplete }: QuestionnaireProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const currentQuestion = questions[currentQuestionIndex]

  const getCurrentAnswer = (questionId: string): string | string[] | undefined => {
    return answers.find((a) => a.questionId === questionId)?.value
  }

  const currentAnswer = getCurrentAnswer(currentQuestion.id)
  const isAnswered = currentAnswer !== undefined && (
    Array.isArray(currentAnswer) ? currentAnswer.length > 0 : currentAnswer !== ''
  )

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleMultipleChoice = (value: string) => {
    const current = getCurrentAnswer(currentQuestion.id) as string[] || []
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    onAnswerChange(currentQuestion.id, newValue)
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-primary">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{currentQuestion.question}</CardTitle>
              {currentQuestion.description && (
                <CardDescription className="text-base">
                  {currentQuestion.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentQuestion.type === 'single-choice' ? (
            <RadioGroup
              value={currentAnswer as string}
              onValueChange={(value) => onAnswerChange(currentQuestion.id, value)}
            >
              {currentQuestion.options.map((option) => (
                <RadioGroupItem
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  description={option.description}
                />
              ))}
            </RadioGroup>
          ) : (
            <div className="grid gap-2">
              {currentQuestion.options.map((option) => {
                const isSelected = (currentAnswer as string[] || []).includes(option.value)
                return (
                  <div
                    key={option.value}
                    className={`flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-input hover:border-primary/50'
                    }`}
                    onClick={() => handleMultipleChoice(option.value)}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      checked={isSelected}
                      onChange={() => handleMultipleChoice(option.value)}
                    />
                    <div className="flex-1">
                      <label className="text-sm font-medium leading-none cursor-pointer">
                        {option.label}
                      </label>
                      {option.description && (
                        <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isAnswered}
        >
          {currentQuestionIndex === questions.length - 1 ? 'View Results' : 'Next'}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
