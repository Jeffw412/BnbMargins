'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ArrowRight, LucideIcon } from 'lucide-react'
import { useState } from 'react'

interface Feature {
  title: string
  description: string
}

interface InteractiveServiceCardProps {
  icon: LucideIcon
  title: string
  description: string
  features: Feature[]
  mockupComponent: React.ReactNode
  gradient: string
  iconColor: string
  badge?: string
}

export function InteractiveServiceCard({
  icon: Icon,
  title,
  description,
  features,
  mockupComponent,
  gradient,
  iconColor,
  badge,
}: InteractiveServiceCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="group transform cursor-pointer border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
          <CardHeader className="relative overflow-hidden">
            {badge && (
              <Badge variant="secondary" className="absolute top-4 right-4 text-xs">
                {badge}
              </Badge>
            )}
            <div
              className={`h-16 w-16 ${gradient} mb-6 flex items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110`}
            >
              <Icon className={`h-8 w-8 ${iconColor}`} />
            </div>
            <CardTitle className="mb-3 text-xl transition-colors group-hover:text-blue-600">
              {title}
            </CardTitle>
            <CardDescription className="leading-relaxed text-gray-600">
              {description}
            </CardDescription>
            <div className="mt-4 flex items-center font-medium text-blue-600 transition-transform duration-300 group-hover:translate-x-2">
              <span className="text-sm">See it in action</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </CardHeader>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-h-[98vh] max-w-[95vw] overflow-y-auto">
        <DialogHeader>
          <div className="mb-8 flex items-center space-x-6">
            <div className={`h-20 w-20 ${gradient} flex items-center justify-center rounded-xl`}>
              <Icon className={`h-10 w-10 ${iconColor}`} />
            </div>
            <div>
              <DialogTitle className="text-4xl font-bold">{title}</DialogTitle>
              <DialogDescription className="mt-3 text-2xl text-gray-600">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-10 grid grid-cols-1 gap-12 xl:grid-cols-4">
          {/* Mockup Section - Takes up 3/4 of the space */}
          <div className="space-y-8 xl:col-span-3">
            <h3 className="text-3xl font-semibold text-gray-900">Live Preview</h3>
            <div className="min-h-[800px] rounded-3xl border-2 border-gray-200 bg-white p-8 shadow-xl">
              <div className="origin-top-left scale-125 transform">{mockupComponent}</div>
            </div>
          </div>

          {/* Features Section - Takes up 1/4 of the space */}
          <div className="space-y-10">
            <h3 className="text-3xl font-semibold text-gray-900">Key Features</h3>
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="mt-3 h-4 w-4 flex-shrink-0 rounded-full bg-blue-600"></div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{feature.title}</h4>
                    <p className="mt-3 text-lg leading-relaxed text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-10">
              <Button size="lg" className="w-full py-8 text-xl font-bold">
                Start Free Trial
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              <p className="mt-4 text-center text-lg text-gray-500">
                No credit card required • 14-day free trial
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
