'use client'

import React, { useState } from 'react'
import LarkSuite from "@/public/images/svgs/lark-icon.svg";
import Image from 'next/image'

interface MyAppProps {
  title?: string
}

const SocialButtons: React.FC<MyAppProps> = ({ title }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLarkSuiteLogin = async () => {
    try {
      setIsLoading(true);

      // Redirect to Next.js route for LarkSuite OAuth
      window.location.href = '/api/auth/lark/redirect';
    } catch (error) {
      console.error('LarkSuite login error:', error);
      alert('LarkSuite login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className='flex justify-between gap-8 my-6 '>
        <button
          onClick={handleLarkSuiteLogin}
          disabled={isLoading}
          className="px-4 py-2.5 border border-ld flex gap-2 items-center w-full  rounded-md text-center justify-center text-ld text-secondary-ld hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-secondary-ld rounded-full animate-spin" />
          ) : (
            <Image src={LarkSuite} alt="larksuite" className="w-[18px] h-[18px]" />
          )}
          {isLoading ? 'Connecting...' : 'LarkSuite'}
        </button>
      </div>
      {/* Divider */}
      <div className='flex items-center justify-center gap-2'>
        <hr className='grow border-ld' />
        <p className='text-base text-ld font-medium'>{title}</p>
        <hr className='grow border-ld' />
      </div>
    </>
  )
}

export default SocialButtons
