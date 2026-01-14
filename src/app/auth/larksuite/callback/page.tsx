'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { AUTH_QUERY_KEY } from '@/lib/api/auth/auth.hooks'
import { getMe, logout } from '@/lib/api/auth/auth'
import { ONBOARDING_QUERY_KEYS } from '@/lib/api/onboarding/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Clock, AlertCircle, LogOut, XCircle, RefreshCw, Mail } from 'lucide-react'

function LarkSuiteCallbackContent() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'verification-pending' | 'account-rejected'>('loading')
    const [message, setMessage] = useState('')
    const [rejectionReason, setRejectionReason] = useState<string | null>(null)
    const [verificationDialogOpen, setVerificationDialogOpen] = useState(false)
    const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const searchParams = useSearchParams()
    const queryClient = useQueryClient()

    // Handle logout for verification pending or rejected users
    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            // Clear React Query cache first
            queryClient.clear()
            // Call logout API to clear backend session
            await logout()
            // Clear auth cache cookie by calling logout endpoint
            await fetch('/api/auth/logout', { method: 'POST' })
            // Small delay to ensure everything is cleared
            setTimeout(() => {
                window.location.href = '/login'
            }, 100)
        } catch (error) {
            console.error('Logout failed:', error)
            // Even if logout fails, clear frontend and redirect
            queryClient.clear()
            setTimeout(() => {
                window.location.href = '/login'
            }, 100)
        }
    }

    // Handle refresh status for rejected users
    // This will attempt login again via Lark OAuth
    // The backend should automatically refresh the account status back to "pending" 
    // if Lark credentials are authenticated successfully
    const handleRefreshStatus = async () => {
        try {
            setIsRefreshing(true)
            // Clear React Query cache to force fresh data
            queryClient.clear()
            // Redirect to Lark OAuth to attempt login again
            // Backend will authenticate Lark credentials and automatically reset status to "pending"
            // if authentication succeeds
            window.location.href = '/api/auth/lark/redirect'
        } catch (error) {
            console.error('Refresh status failed:', error)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        const run = async () => {
            try {
                const error = searchParams.get('error')
                const errorMessage = searchParams.get('message')
                const success = searchParams.get('success')

                // Handle account verification pending status
                if (error === 'ACCOUNT_VERIFICATION_PENDING') {
                    setStatus('verification-pending')
                    setVerificationDialogOpen(true)
                    // Decode the message if present, otherwise use default
                    const decodedMessage = errorMessage 
                        ? decodeURIComponent(errorMessage.replace(/\+/g, ' '))
                        : 'Your account is currently under verification by an administrator.'
                    setMessage(decodedMessage)
                    return
                }

                // Handle account rejected status
                // Note: If a rejected user attempts login again via Lark and credentials are valid,
                // the backend should automatically refresh status back to "pending" and proceed with normal login
                // This error only appears if the login attempt fails or credentials are invalid
                if (error === 'ACCOUNT_REJECTED') {
                    setStatus('account-rejected')
                    setRejectionDialogOpen(true)
                    // Decode the message if present, otherwise use default
                    const decodedMessage = errorMessage 
                        ? decodeURIComponent(errorMessage.replace(/\+/g, ' '))
                        : 'Your account access has been rejected.'
                    setMessage(decodedMessage)
                    
                    // Check if rejection reason is in URL parameters (backend might pass it)
                    const reasonParam = searchParams.get('rejectionReason') || searchParams.get('reason')
                    if (reasonParam) {
                        setRejectionReason(decodeURIComponent(reasonParam.replace(/\+/g, ' ')))
                    } else {
                        // Try to get rejection reason from backend if available
                        // The backend might include it in the response or we can fetch it
                        try {
                            const user = await getMe()
                            if (user && (user as any).rejectionReason) {
                                setRejectionReason((user as any).rejectionReason)
                            }
                        } catch (e) {
                            // If we can't get the reason, that's okay - we'll show the generic message
                            console.log('Could not fetch rejection reason:', e)
                        }
                    }
                    return
                }

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

                // Set the user data
                queryClient.setQueryData(AUTH_QUERY_KEY, user)
                
                // Invalidate onboarding queries to ensure Super Admins see any new pending requests
                // This is especially important when a rejected user logs in again and status is refreshed to "pending"
                queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEYS.LIST })
                
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
        <>
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

                        {status === 'verification-pending' && (
                            <>
                                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Account Verification</h2>
                                <p className="text-gray-600 mt-2">Please check the dialog for more information.</p>
                            </>
                        )}

                        {status === 'account-rejected' && (
                            <>
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Account Access Denied</h2>
                                <p className="text-gray-600 mt-2">Please check the dialog for more information.</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Verification Pending Dialog */}
            <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-500/20 dark:bg-amber-500/10 rounded-lg text-amber-500">
                                <Clock size={24} />
                            </div>
                            <DialogTitle className="text-lg font-bold text-foreground">
                                Account Verification Pending
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-sm text-muted-foreground pt-2">
                            {message || 'Your account is currently under verification by an administrator.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                        What happens next?
                                    </p>
                                    <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                                        <li>Your account is being reviewed by an administrator</li>
                                        <li>You will be notified once verification is complete</li>
                                        <li>This process typically takes 1-2 business days</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                <strong className="text-gray-900 dark:text-gray-100">Need assistance?</strong> Please contact your system administrator for more information about your account status.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full sm:w-auto"
                        >
                            {isLoggingOut ? (
                                <>
                                    <LogOut className="w-4 h-4 mr-2 animate-spin" />
                                    Logging out...
                                </>
                            ) : (
                                <>
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={() => {
                                setVerificationDialogOpen(false)
                                window.location.href = '/login'
                            }}
                            className="w-full sm:w-auto"
                            variant="secondary"
                        >
                            Return to Login
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Account Rejected Dialog */}
            <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
                <DialogContent className="max-w-md border-0 bg-transparent p-0 shadow-none">
                    <Card className="w-full">
                        <CardHeader className="text-center pb-4 pt-6">
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                                <XCircle className="h-8 w-8 text-destructive" />
                            </div>
                            <CardTitle className="text-2xl">Access Rejected</CardTitle>
                            <CardDescription>
                                {message || 'Your request to access RenoXpert has been reviewed and denied'}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Rejection Reason */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Reason provided by administrator:
                                </p>
                                <div className="p-4 rounded-lg bg-muted border">
                                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                        {rejectionReason || 'No specific reason provided.'}
                                    </p>
                                </div>
                            </div>

                            {/* Guidance */}
                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                <div className="flex gap-3">
                                    <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Need help?</p>
                                        <p className="text-sm text-muted-foreground">
                                            Please contact your administrator for assistance or to request a new review.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="outline"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut || isRefreshing}
                                    className="w-full"
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <LogOut className="w-4 h-4 mr-2 animate-spin" />
                                            Logging out...
                                        </>
                                    ) : (
                                        <>
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Return to Login
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={handleRefreshStatus}
                                    disabled={isLoggingOut || isRefreshing}
                                    className="w-full"
                                    variant="default"
                                >
                                    {isRefreshing ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Authenticating...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Request Again
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </DialogContent>
            </Dialog>
        </>
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


