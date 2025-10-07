"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  Brain, 
  Workflow, 
  Zap, 
  Shield, 
  Layers, 
  BarChart3,
  Database,
  Cloud,
  Lock
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Intelligence",
    description: "Leverage cutting-edge AI models for intelligent automation and decision-making",
    color: "from-purple-500 to-pink-500",
    bgGlow: "bg-purple-500/20",
  },
  {
    icon: Workflow,
    title: "Visual Flow Builder",
    description: "Intuitive drag-and-drop interface to design complex workflows without coding",
    color: "from-blue-500 to-cyan-500",
    bgGlow: "bg-blue-500/20",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Execute workflows in milliseconds with real-time monitoring and instant feedback",
    color: "from-yellow-500 to-orange-500",
    bgGlow: "bg-yellow-500/20",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption, SOC 2 compliance, and comprehensive audit trails",
    color: "from-green-500 to-emerald-500",
    bgGlow: "bg-green-500/20",
  },
  {
    icon: Layers,
    title: "500+ Integrations",
    description: "Connect with your favorite tools and services through our extensive marketplace",
    color: "from-indigo-500 to-purple-500",
    bgGlow: "bg-indigo-500/20",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Deep insights with customizable dashboards, reports, and performance metrics",
    color: "from-red-500 to-pink-500",
    bgGlow: "bg-red-500/20",
  },
]

const pricingPlans = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "Perfect for individuals and small teams",
    features: [
      "Up to 100 workflow runs/month",
      "5 active workflows",
      "Basic integrations",
      "Community support",
      "7-day execution history",
    ],
    cta: "Start Free",
    popular: false,
    icon: Database,
  },
  {
    name: "Professional",
    price: "$49",
    period: "/month",
    description: "For growing teams and businesses",
    features: [
      "Unlimited workflow runs",
      "Unlimited workflows",
      "All integrations",
      "Priority support",
      "90-day execution history",
      "Advanced AI models",
      "Team collaboration",
    ],
    cta: "Start Trial",
    popular: true,
    icon: Cloud,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: [
      "Everything in Professional",
      "Dedicated infrastructure",
      "SLA guarantee",
      "Custom integrations",
      "Unlimited history",
      "Advanced security",
      "24/7 phone support",
    ],
    cta: "Contact Sales",
    popular: false,
    icon: Lock,
  },
]

export function FeaturesCardSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-purple-500/10 text-purple-600 border-purple-500/20">
            Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Succeed</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Powerful features designed to help you build, deploy, and scale your workflows effortlessly
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden border-slate-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl h-full group">
                  <CardContent className="p-6">
                    <div className={`absolute top-0 right-0 w-32 h-32 ${feature.bgGlow} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} w-fit mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Pricing Section (Cart Alternative) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-500/20">
            Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Perfect Plan</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={plan.popular ? "md:-mt-4" : ""}
              >
                <Card className={`relative overflow-hidden h-full ${
                  plan.popular 
                    ? "border-purple-500 border-2 shadow-2xl shadow-purple-500/20" 
                    : "border-slate-200"
                }`}>
                  {plan.popular && (
                    <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold text-center py-2">
                      Most Popular
                    </div>
                  )}
                  <CardContent className={`p-8 ${plan.popular ? "pt-14" : ""}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${
                        plan.popular ? "bg-purple-500/10" : "bg-slate-100"
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          plan.popular ? "text-purple-600" : "text-slate-600"
                        }`} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                    </div>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                      <span className="text-slate-600">{plan.period}</span>
                    </div>
                    <p className="text-slate-600 mb-6">{plan.description}</p>
                    <button className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50"
                        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                    }`}>
                      {plan.cta}
                    </button>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-slate-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
