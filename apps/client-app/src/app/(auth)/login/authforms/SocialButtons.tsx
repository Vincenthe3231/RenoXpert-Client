"use client";
import React, { useState } from "react";
import LarkSuite from "@/public/images/svgs/lark-icon.svg";
import Image from "next/image";
import { HRText } from "flowbite-react";

interface MyAppProps {
  title?: string;
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
      <div className="flex justify-center my-6 ">
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
      <HRText text={`${title}`} className="!border-t !border-ld !bg-transparent" />
    </>
  );
};

export default SocialButtons;
