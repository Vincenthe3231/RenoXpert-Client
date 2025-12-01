"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthService } from "../../../../lib/auth/login.auth";
import { StaffSchema, Staff } from "../../../../lib/schemas";
import { keysToCamel } from "@/lib/transform";

function LarkSuiteCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const success = searchParams.get('success');
        const token = searchParams.get('token');
        const user = searchParams.get('user');
        const error = searchParams.get('error');

        console.log(user);
        

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (success === 'true' && token && user) {
          // Parse and validate user data using staff schema
          const parsedUser = JSON.parse(user);
          const camelCaseUser = keysToCamel<Staff>(parsedUser);
          const userData = StaffSchema.parse(camelCaseUser);

          // Store the token and user data
          AuthService.setToken(token);
          AuthService.setUser(userData);

          setStatus('success');
          setMessage('Login successful! Redirecting...');

          // Redirect to dashboard
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          throw new Error('Invalid callback parameters');
        }

      } catch (error) {
        console.error('LarkSuite OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900">Processing LarkSuite Login...</h2>
              <p className="text-gray-600 mt-2">Please wait while we complete your authentication.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Login Successful!</h2>
              <p className="text-gray-600 mt-2">Redirecting to dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Authentication Failed</h2>
              <p className="text-gray-600 mt-2">{message}</p>
              <button
                onClick={() => window.location.href = '/login'}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LarkSuiteCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
            <p className="text-gray-600 mt-2">Please wait while we process your request.</p>
          </div>
        </div>
      </div>
    }>
      <LarkSuiteCallbackContent />
    </Suspense>
  );
}

