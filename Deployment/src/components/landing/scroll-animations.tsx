"use client"

import { useEffect, useRef, useState } from 'react'

interface ScrollAnimationProps {
  children: React.ReactNode
  className?: string
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale' | 'none'
  delay?: number
  threshold?: number
}

export function ScrollAnimation({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  threshold = 0.1
}: ScrollAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [delay, threshold])

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0'
    
    switch (animation) {
      case 'fade-up':
        return 'animate-slide-in-up opacity-100'
      case 'fade-left':
        return 'animate-slide-in-left opacity-100'
      case 'fade-right':
        return 'animate-slide-in-right opacity-100'
      case 'scale':
        return 'animate-scale-in opacity-100'
      default:
        return 'opacity-100'
    }
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${getAnimationClass()} ${className}`}
    >
      {children}
    </div>
  )
}

// Hook for scroll-triggered animations
export function useScrollAnimation(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold])

  return { ref, isVisible }
}

// Parallax effect component
interface ParallaxProps {
  children: React.ReactNode
  speed?: number
  className?: string
}

export function Parallax({ children, speed = 0.5, className = '' }: ParallaxProps) {
  const [offset, setOffset] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const scrolled = window.pageYOffset
        const rate = scrolled * -speed
        setOffset(rate)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
      }}
    >
      {children}
    </div>
  )
}

// Staggered animation container
interface StaggeredAnimationProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}

export function StaggeredAnimation({
  children,
  staggerDelay = 100,
  className = ''
}: StaggeredAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          className={`transition-all duration-700 ${
            isVisible 
              ? 'animate-slide-in-up opacity-100' 
              : 'opacity-0 translate-y-8'
          }`}
          style={{
            animationDelay: isVisible ? `${index * staggerDelay}ms` : '0ms'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
