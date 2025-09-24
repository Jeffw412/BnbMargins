"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from '@/contexts/auth-context'
import { db } from '@/lib/supabase'
import { Database, LogOut, User } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export function UserProfile() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const { data, error } = await db.profiles.get(user.id)
        if (error) {
          setError(error.message)
        } else {
          setProfile(data)
        }
      } catch (err) {
        setError('Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <Database className="h-4 w-4" />
            <span className="text-sm">Database Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>User Profile</span>
        </CardTitle>
        <CardDescription>
          Connected to Supabase database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Name:</span>
            <span className="text-sm">{profile?.full_name || 'Not set'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Email:</span>
            <span className="text-sm">{profile?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">User ID:</span>
            <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
              {profile?.id.slice(0, 8)}...
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant="default" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              Connected
            </Badge>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserProfile
