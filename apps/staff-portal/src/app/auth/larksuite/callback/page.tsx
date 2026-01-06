'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { AUTH_QUERY_KEY } from '@/lib/api/auth/auth.hooks'
import { getMe } from '@/lib/api/auth/auth'

function LarkSuiteCallbackContent() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')
    const searchParams = useSearchParams()
    const queryClient = useQueryClient()

    useEffect(() => {
        const run = async () => {
            try {
                const error = searchParams.get('error')
                const success = searchParams.get('success')

                if (error) {
                    throw new Error(error)
                }

                if (success !== 'true') {
                    throw new Error('Invalid callback parameters')
                }

                // If the OAuth callback was proxied through `/api/auth/lark/callback`,
                // the backend session cookies should now be present on this domain.
                const user = await getMe()
                if (!user) {
                    throw new Error('Login succeeded but no session was found. Please try again.')
                }

                queryClient.setQueryData(AUTH_QUERY_KEY, user)
                setStatus('success')
                setMessage('Login successful! Redirecting...')

                setTimeout(() => {
                    window.location.href = '/'
                }, 800)
            } catch (e) {
                console.error('LarkSuite OAuth callback error:', e)
                setStatus('error')
                setMessage(e instanceof Error ? e.message : 'Authentication failed')
            }
        }

        run()
    }, [searchParams, queryClient])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                    {status === 'loading' && (
                        <>
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900">
                                Processing LarkSuite Login...
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Please wait while we complete your authentication.
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Login Successful!</h2>
                            <p className="text-gray-600 mt-2">{message || 'Redirecting...'}</p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Authentication Failed</h2>
                            <p className="text-gray-600 mt-2">{message}</p>
                            <button
                                onClick={() => (window.location.href = '/login')}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Try Again
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function LarkSuiteCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
                            <p className="text-gray-600 mt-2">
                                Please wait while we process your request.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <LarkSuiteCallbackContent />
        </Suspense>
    )
}


