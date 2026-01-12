'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import { useLogin, useAuth } from '@/lib/api/auth'

const AuthLogin = () => {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const { data: user } = useAuth()
  const login = useLogin()


  /**
   * Redirect when already authenticated
   */
  useEffect(() => {
    if (user) {
      router.replace('/')
    }
  }, [user, router])

  /**
   * Handle form submit
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)

    const formData = new FormData(e.currentTarget)

    const email = String(formData.get('email') || '').trim()
    const password = String(formData.get('password') || '').trim()

    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          // Redirect after successful login
          router.replace('/dashboard')
        },
        onError: (error: any) => {
          // API returned 401
          if (error?.response?.status === 401) {
            setFormError('Email or password is incorrect')
            return
          }

          // Zod / network / unknown error
          setFormError('Unable to sign in. Please try again.')
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="mb-4">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Enter your email"
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="Enter your password"
        />
      </div>

      <div className="flex justify-between my-5">
        <div className="flex items-center gap-2">
          <Checkbox id="remember" />
          <Label htmlFor="remember">Remember this device</Label>
        </div>

        <Link
          href="/auth/auth1/forgot-password"
          className="text-primary text-sm font-medium"
        >
          Forgot Password?
        </Link>
      </div>

      {formError && (
        <div className="mb-4 text-sm font-medium text-red-600">
          {formError}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={login.isPending}
      >
        {login.isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}

export default AuthLogin
