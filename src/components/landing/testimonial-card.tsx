"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from 'lucide-react'

interface TestimonialCardProps {
  name: string
  role: string
  company: string
  content: string
  rating: number
  avatar?: string
  metrics?: {
    label: string
    value: string
  }
}

export function TestimonialCard({
  name,
  role,
  company,
  content,
  rating,
  avatar,
  metrics
}: TestimonialCardProps) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        {/* Rating */}
        <div className="flex items-center space-x-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <blockquote className="text-gray-700 mb-6 leading-relaxed">
          "{content}"
        </blockquote>

        {/* Metrics */}
        {metrics && (
          <div className="mb-4">
            <Badge variant="secondary" className="text-xs">
              {metrics.label}: {metrics.value}
            </Badge>
          </div>
        )}

        {/* Author */}
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            {avatar ? (
              <img 
                src={avatar} 
                alt={name} 
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-lg">
                {name.split(' ').map(n => n[0]).join('')}
              </span>
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{name}</div>
            <div className="text-sm text-gray-600">{role}</div>
            <div className="text-sm text-gray-500">{company}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
