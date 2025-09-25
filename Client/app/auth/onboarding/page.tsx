"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Users,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Target,
  BarChart3,
  FileText,
  Zap,
} from "lucide-react"

const ONBOARDING_STEPS = [
  { id: 1, title: "Welcome", description: "Let's get you started" },
  { id: 2, title: "Use Case", description: "What will you build?" },
  { id: 3, title: "Team Size", description: "How big is your team?" },
  { id: 4, title: "Goals", description: "What are your objectives?" },
  { id: 5, title: "Setup", description: "Configure your workspace" },
]

const USE_CASES = [
  {
    id: "lead-scoring",
    title: "Lead Scoring & Qualification",
    description: "Automatically score and qualify leads using AI",
    icon: <Target className="h-6 w-6" />,
    color: "bg-blue-500/10 text-blue-600",
    popular: true,
  },
  {
    id: "customer-support",
    title: "Customer Support Automation",
    description: "AI-powered ticket routing and response suggestions",
    icon: <Users className="h-6 w-6" />,
    color: "bg-green-500/10 text-green-600",
  },
  {
    id: "content-generation",
    title: "Content & Copy Generation",
    description: "Generate marketing copy, emails, and documentation",
    icon: <FileText className="h-6 w-6" />,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    id: "data-analysis",
    title: "Data Analysis & Insights",
    description: "Extract insights from your business data",
    icon: <BarChart3 className="h-6 w-6" />,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    id: "process-automation",
    title: "Business Process Automation",
    description: "Automate repetitive tasks and workflows",
    icon: <Zap className="h-6 w-6" />,
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    id: "compliance",
    title: "Compliance & Risk Management",
    description: "Ensure regulatory compliance with AI monitoring",
    icon: <Shield className="h-6 w-6" />,
    color: "bg-red-500/10 text-red-600",
  },
]

const TEAM_SIZES = [
  { id: "solo", title: "Just me", description: "Individual user", icon: "👤" },
  { id: "small", title: "2-10 people", description: "Small team", icon: "👥" },
  { id: "medium", title: "11-50 people", description: "Growing company", icon: "🏢" },
  { id: "large", title: "50+ people", description: "Enterprise", icon: "🏭" },
]

const GOALS = [
  { id: "efficiency", title: "Increase Efficiency", description: "Automate manual tasks" },
  { id: "revenue", title: "Drive Revenue", description: "Improve sales and conversions" },
  { id: "insights", title: "Better Insights", description: "Make data-driven decisions" },
  { id: "compliance", title: "Ensure Compliance", description: "Meet regulatory requirements" },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedUseCase, setSelectedUseCase] = useState<string>("")
  const [selectedTeamSize, setSelectedTeamSize] = useState<string>("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const progress = (currentStep / ONBOARDING_STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals((prev) => (prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]))
  }

  const handleComplete = async () => {
    setIsLoading(true)

    // Simulate setup process
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Redirect to dashboard
    router.push("/")

    setIsLoading(false)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 2:
        return selectedUseCase !== ""
      case 3:
        return selectedTeamSize !== ""
      case 4:
        return selectedGoals.length > 0
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">ChasmX</h1>
              <p className="text-sm text-muted-foreground">Setup Wizard</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {ONBOARDING_STEPS.length}
              </span>
              <Badge variant="secondary">{ONBOARDING_STEPS[currentStep - 1].title}</Badge>
            </div>
            <Progress value={progress} className="w-full max-w-md mx-auto" />
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{ONBOARDING_STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription className="text-lg">{ONBOARDING_STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Welcome to ChasmX!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We'll help you set up your workspace and create your first AI workflow. This should take about 3
                    minutes.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium">No-Code Builder</h4>
                    <p className="text-sm text-muted-foreground">Drag & drop interface</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-medium">Enterprise Ready</h4>
                    <p className="text-sm text-muted-foreground">Security & compliance</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Brain className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-medium">AI-Powered</h4>
                    <p className="text-sm text-muted-foreground">Intelligent automation</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Use Case Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">What would you like to build first?</h3>
                  <p className="text-muted-foreground">Choose your primary use case to get personalized templates</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {USE_CASES.map((useCase) => (
                    <div
                      key={useCase.id}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedUseCase === useCase.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedUseCase(useCase.id)}
                    >
                      {useCase.popular && (
                        <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground">Popular</Badge>
                      )}
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${useCase.color}`}>
                          {useCase.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{useCase.title}</h4>
                          <p className="text-sm text-muted-foreground">{useCase.description}</p>
                        </div>
                        {selectedUseCase === useCase.id && <CheckCircle className="h-5 w-5 text-primary" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Team Size */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">How big is your team?</h3>
                  <p className="text-muted-foreground">This helps us recommend the right features and pricing</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {TEAM_SIZES.map((size) => (
                    <div
                      key={size.id}
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md text-center ${
                        selectedTeamSize === size.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedTeamSize(size.id)}
                    >
                      <div className="text-3xl mb-2">{size.icon}</div>
                      <h4 className="font-medium mb-1">{size.title}</h4>
                      <p className="text-sm text-muted-foreground">{size.description}</p>
                      {selectedTeamSize === size.id && <CheckCircle className="h-5 w-5 text-primary mx-auto mt-2" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Goals */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">What are your main goals?</h3>
                  <p className="text-muted-foreground">Select all that apply - we'll customize your experience</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {GOALS.map((goal) => (
                    <div
                      key={goal.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedGoals.includes(goal.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleGoalToggle(goal.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium mb-1">{goal.title}</h4>
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        </div>
                        {selectedGoals.includes(goal.id) && <CheckCircle className="h-5 w-5 text-primary" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Setup */}
            {currentStep === 5 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  {isLoading ? (
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="h-10 w-10 text-primary" />
                  )}
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    {isLoading ? "Setting up your workspace..." : "You're all set!"}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {isLoading
                      ? "We're creating your personalized workspace with templates and examples based on your selections."
                      : "Your ChasmX is ready. Let's start building your first workflow!"}
                  </p>
                </div>

                {isLoading && (
                  <div className="space-y-3 max-w-md mx-auto">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span>Creating workspace...</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                      />
                      <span>Loading templates...</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
                      <span>Configuring AI models...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-border/50">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <div className="flex items-center gap-2">
                {ONBOARDING_STEPS.map((step) => (
                  <div
                    key={step.id}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      step.id <= currentStep ? "bg-primary" : "bg-border"
                    }`}
                  />
                ))}
              </div>

              {currentStep < ONBOARDING_STEPS.length ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? "Setting up..." : "Get Started"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
