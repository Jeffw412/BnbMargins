'use client'

import {
  AnalyticsMockup,
  ExpenseTrackingMockup,
  PropertyManagementMockup,
  ReportsMockup,
} from '@/components/landing/dashboard-mockups'
import { InteractiveServiceCard } from '@/components/landing/interactive-service-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calculator,
  CheckCircle,
  FileText,
  Play,
  Target,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
              BnbMargins
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden px-4 py-24">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>
        <div className="absolute top-20 left-10 h-72 w-72 animate-pulse rounded-full bg-blue-200 opacity-30 mix-blend-multiply blur-xl filter"></div>
        <div className="absolute top-40 right-10 h-72 w-72 animate-pulse rounded-full bg-indigo-200 opacity-30 mix-blend-multiply blur-xl filter delay-1000"></div>

        <div className="relative z-10 container mx-auto max-w-6xl text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            🚀 Professional Airbnb Financial Management
          </Badge>

          <h1 className="mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-6xl leading-tight font-bold text-transparent md:text-7xl">
            Turn Your Properties Into
            <br />
            <span className="relative">
              Profit Machines
              <div className="absolute right-0 -bottom-2 left-0 h-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            </span>
          </h1>

          <p className="mx-auto mb-12 max-w-3xl text-2xl leading-relaxed text-gray-600">
            The complete Airbnb profit & loss dashboard. Track every dollar, optimize every
            property, and scale your business with confidence using real-time insights and automated
            reporting.
          </p>

          {/* Capabilities Row */}
          <div className="mx-auto mb-12 grid max-w-3xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-blue-600">Unlimited</div>
              <div className="text-gray-600">Properties to Track</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-indigo-600">Real-Time</div>
              <div className="text-gray-600">Analytics & Reports</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-purple-600">Automated</div>
              <div className="text-gray-600">Expense Tracking</div>
            </div>
          </div>

          <div className="mb-8 flex flex-col justify-center gap-6 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                className="transform bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-8 text-xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl"
              >
                Start Free Trial
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 px-10 py-8 text-xl transition-all duration-300 hover:border-blue-600 hover:text-blue-600"
            >
              <Play className="mr-3 h-6 w-6" />
              Watch Demo
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            ✨ No credit card required • 14-day free trial • Cancel anytime • Setup in 5 minutes
          </p>
        </div>
      </section>

      {/* Interactive Services Section */}
      <section className="bg-white px-4 py-24">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <Badge variant="secondary" className="mb-4">
              🎯 Powerful Features
            </Badge>
            <h2 className="mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Everything You Need to Succeed
            </h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">
              Comprehensive tools designed specifically for Airbnb hosts. Click any feature below to
              see it in action with real dashboard previews and detailed explanations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <InteractiveServiceCard
              icon={Building2}
              title="Multi-Property Management"
              description="Track unlimited properties with individual performance metrics and consolidated reporting."
              gradient="bg-gradient-to-br from-blue-100 to-blue-200"
              iconColor="text-blue-600"
              badge="Most Popular"
              mockupComponent={<PropertyManagementMockup />}
              features={[
                {
                  title: 'Property Dashboard',
                  description:
                    'View all properties at a glance with key metrics and status updates',
                },
                {
                  title: 'Performance Tracking',
                  description: 'Monitor occupancy rates, revenue, and profitability per property',
                },
                {
                  title: 'Consolidated Reporting',
                  description: 'Generate combined reports across your entire portfolio',
                },
                {
                  title: 'Property Comparison',
                  description: 'Compare performance metrics to identify top performers',
                },
              ]}
            />

            <InteractiveServiceCard
              icon={TrendingUp}
              title="Real-time Analytics"
              description="Get instant insights into your revenue, expenses, and profit margins with interactive charts."
              gradient="bg-gradient-to-br from-green-100 to-green-200"
              iconColor="text-green-600"
              mockupComponent={<AnalyticsMockup />}
              features={[
                {
                  title: 'Live Dashboard',
                  description: 'Real-time updates of your key performance indicators',
                },
                {
                  title: 'Interactive Charts',
                  description: 'Drill down into your data with dynamic visualizations',
                },
                {
                  title: 'Trend Analysis',
                  description: 'Identify patterns and trends in your business performance',
                },
                {
                  title: 'Custom Metrics',
                  description: 'Track the KPIs that matter most to your business',
                },
              ]}
            />

            <InteractiveServiceCard
              icon={BarChart3}
              title="Advanced Reporting"
              description="Generate detailed reports for tax purposes, investor updates, or business planning."
              gradient="bg-gradient-to-br from-purple-100 to-purple-200"
              iconColor="text-purple-600"
              mockupComponent={<ReportsMockup />}
              features={[
                {
                  title: 'Automated Reports',
                  description: 'Schedule and generate reports automatically',
                },
                {
                  title: 'Tax-Ready Summaries',
                  description: 'Export data in formats ready for tax preparation',
                },
                {
                  title: 'Investor Reports',
                  description: 'Professional reports for stakeholders and investors',
                },
                {
                  title: 'Custom Formats',
                  description: 'Export in PDF, Excel, CSV, and other formats',
                },
              ]}
            />

            <InteractiveServiceCard
              icon={FileText}
              title="Expense Tracking"
              description="Categorize and track all your expenses with receipt uploads and automated categorization."
              gradient="bg-gradient-to-br from-orange-100 to-orange-200"
              iconColor="text-orange-600"
              mockupComponent={<ExpenseTrackingMockup />}
              features={[
                {
                  title: 'Receipt Scanning',
                  description: 'Upload and automatically categorize receipts',
                },
                {
                  title: 'Smart Categorization',
                  description: 'AI-powered expense categorization and tagging',
                },
                {
                  title: 'Expense Analytics',
                  description: 'Visualize spending patterns and identify cost savings',
                },
                {
                  title: 'Tax Deductions',
                  description: 'Track deductible expenses for tax optimization',
                },
              ]}
            />

            <InteractiveServiceCard
              icon={Target}
              title="Revenue Optimization"
              description="Maximize your earnings with data-driven pricing recommendations and market insights."
              gradient="bg-gradient-to-br from-indigo-100 to-indigo-200"
              iconColor="text-indigo-600"
              mockupComponent={<AnalyticsMockup />}
              features={[
                {
                  title: 'Pricing Recommendations',
                  description: 'AI-powered suggestions to optimize your nightly rates',
                },
                {
                  title: 'Market Analysis',
                  description: 'Compare your performance against local competitors',
                },
                {
                  title: 'Seasonal Insights',
                  description: 'Understand demand patterns and adjust pricing accordingly',
                },
                {
                  title: 'Revenue Forecasting',
                  description: 'Predict future earnings based on historical data',
                },
              ]}
            />

            <InteractiveServiceCard
              icon={Calculator}
              title="Tax Preparation"
              description="Streamline your tax filing with automated categorization and deduction tracking."
              gradient="bg-gradient-to-br from-red-100 to-red-200"
              iconColor="text-red-600"
              mockupComponent={<ReportsMockup />}
              features={[
                {
                  title: 'Deduction Tracking',
                  description: 'Automatically identify and track tax-deductible expenses',
                },
                {
                  title: 'Form Generation',
                  description: 'Generate tax forms and schedules with your data',
                },
                {
                  title: 'Audit Trail',
                  description: 'Maintain detailed records for tax compliance',
                },
                {
                  title: 'CPA Integration',
                  description: 'Export data in formats your accountant can use',
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white px-4 py-24">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <Badge variant="secondary" className="mb-4">
              📊 See It In Action
            </Badge>
            <h2 className="mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Your Dashboard Awaits
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Get a glimpse of the powerful analytics and insights that will transform how you
              manage your Airbnb business.
            </p>
          </div>

          {/* Dashboard Screenshot */}
          <div className="mx-auto max-w-6xl">
            <div className="relative rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-2xl">
              <div className="mb-4 flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                <div className="h-3 w-3 rounded-full bg-green-400"></div>
                <div className="ml-4 text-sm text-gray-500">BnbMargins Dashboard</div>
              </div>
              <div className="aspect-video rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="mb-2 text-sm text-gray-500">Total Revenue</div>
                    <div className="text-2xl font-bold text-green-600">$24,580</div>
                    <div className="text-xs text-green-600">+12% this month</div>
                  </div>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="mb-2 text-sm text-gray-500">Properties</div>
                    <div className="text-2xl font-bold text-blue-600">4 Active</div>
                    <div className="text-xs text-blue-600">85% occupancy</div>
                  </div>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="mb-2 text-sm text-gray-500">Profit Margin</div>
                    <div className="text-2xl font-bold text-purple-600">68%</div>
                    <div className="text-xs text-purple-600">Above average</div>
                  </div>
                </div>
                <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
                  <div className="mb-4 text-sm font-medium text-gray-700">Revenue Trend</div>
                  <div className="flex items-end justify-between space-x-2">
                    {[40, 65, 45, 80, 60, 95, 75].map((height, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-8 rounded-t bg-gradient-to-t from-blue-600 to-indigo-600"
                          style={{ height: `${height}px` }}
                        ></div>
                        <div className="mt-1 text-xs text-gray-500">
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][index]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Support */}
          <div className="mt-16 text-center">
            <p className="mb-8 text-gray-500">Works with all major booking platforms</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">Airbnb</div>
              <div className="text-2xl font-bold text-gray-400">VRBO</div>
              <div className="text-2xl font-bold text-gray-400">Booking.com</div>
              <div className="text-2xl font-bold text-gray-400">HomeAway</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-8 text-3xl font-bold md:text-4xl">Why Choose BnbMargins?</h2>
          <div className="grid grid-cols-1 gap-8 text-left md:grid-cols-2">
            <div className="flex items-start space-x-4">
              <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-600" />
              <div>
                <h3 className="mb-2 font-semibold">Save Time on Bookkeeping</h3>
                <p className="text-gray-600">
                  Automate your financial tracking and spend more time growing your business.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-600" />
              <div>
                <h3 className="mb-2 font-semibold">Maximize Profitability</h3>
                <p className="text-gray-600">
                  Identify your most profitable properties and optimize your pricing strategy.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-600" />
              <div>
                <h3 className="mb-2 font-semibold">Tax-Ready Reports</h3>
                <p className="text-gray-600">
                  Generate comprehensive reports that make tax season a breeze.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-600" />
              <div>
                <h3 className="mb-2 font-semibold">Scale Your Business</h3>
                <p className="text-gray-600">
                  Make data-driven decisions to expand your Airbnb portfolio confidently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-4 py-24">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 h-full w-full">
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute right-20 bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        </div>

        <div className="relative z-10 container mx-auto max-w-5xl text-center">
          <Badge variant="secondary" className="mb-6 border-white/30 bg-white/20 text-white">
            🚀 Professional Airbnb Analytics
          </Badge>

          <h2 className="mb-6 text-4xl leading-tight font-bold text-white md:text-6xl">
            Ready to Maximize Your
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Airbnb Profits?
            </span>
          </h2>

          <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-blue-100 md:text-2xl">
            Start tracking your Airbnb profits with professional-grade analytics. Get complete
            visibility into your property performance and make data-driven decisions to grow your
            business.
          </p>

          {/* Value Props */}
          <div className="mx-auto mb-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-2 text-3xl font-bold text-yellow-300">14 Days</div>
              <div className="text-white">Free Trial</div>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-2 text-3xl font-bold text-green-300">5 Minutes</div>
              <div className="text-white">Setup Time</div>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-2 text-3xl font-bold text-blue-300">24/7</div>
              <div className="text-white">Support</div>
            </div>
          </div>

          <div className="mb-8 flex flex-col justify-center gap-6 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                className="w-full border-2 border-yellow-300 bg-gradient-to-r from-yellow-400 to-orange-400 px-10 py-6 text-xl font-bold text-gray-900 shadow-xl transition-all duration-300 hover:from-yellow-300 hover:to-orange-300 hover:shadow-2xl sm:w-auto"
              >
                Start Free Trial Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full border-4 border-white bg-transparent px-10 py-6 text-xl font-bold text-white transition-all duration-300 hover:bg-white hover:text-blue-600 sm:w-auto"
            >
              <Play className="mr-3 h-6 w-6" />
              Watch Demo
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-blue-100">
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-300" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-300" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-300" />
              <span>Setup in 5 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-4 py-12 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 flex items-center space-x-2 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">BnbMargins</span>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} BnbMargins. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
