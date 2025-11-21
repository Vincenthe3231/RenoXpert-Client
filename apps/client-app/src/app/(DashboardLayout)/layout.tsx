"use client";
import React, { useContext } from "react";
import { useUser } from "@/app/context/UserContext";
import { UserLoadingState } from "@/app/components/UserLoadingState";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./layout/sidebar/Sidebar";
import Header from "./layout/header/Header";
import { Customizer } from "./layout/shared/customizer/Customizer";
import { CustomizerContext } from "@/app/context/CustomizerContext";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { activeLayout, isLayout } = useContext(CustomizerContext);
  const { user, isLoading, isAuthenticated } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect based on user status
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const status = user.status;
      const isStatusPage = pathname?.startsWith('/status/');

      // If user is verifying and not on verifying page, redirect
      if (status === 'verifying' && !isStatusPage) {
        router.replace('/status/verifying');
        return;
      }

      // If user is rejected and not on rejected page, redirect
      if (status === 'rejected' && !isStatusPage) {
        router.replace('/status/rejected');
        return;
      }

      // If user is not active and not on a status page, redirect based on status
      if (status !== 'active' && !isStatusPage) {
        if (status === 'verifying') {
          router.replace('/status/verifying');
        } else if (status === 'rejected') {
          router.replace('/status/rejected');
        }
        return;
      }

      // If user is active but on status page, redirect to dashboard
      if (status === 'active' && isStatusPage) {
        router.replace('/dashboard');
        return;
      }
    }
  }, [user, isLoading, isAuthenticated, pathname, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <UserLoadingState message="Loading..." />;
  }

  // If not authenticated, let middleware handle redirect
  if (!isAuthenticated || !user) {
    return <UserLoadingState message="Redirecting to login..." />;
  }

  // If user status is verifying or rejected, show status page instead of layout
  if (user.status === 'verifying' || user.status === 'rejected') {
    return <>{children}</>;
  }

  // Only show full layout for active users
  if (user.status !== 'active') {
    return <UserLoadingState message="Checking access..." />;
  }

  return (
    <div className="flex w-full min-h-screen">
      <div className="page-wrapper flex w-full">
        {/* Header/sidebar */}
        <Sidebar />
        <div className="body-wrapper w-full bg-white dark:bg-dark">
          {/* Top Header  */}
          <Header layoutType="vertical" />

          {/* Body Content  */}
          <div
            className={` ${isLayout == "full"
              ? "w-full py-[15px] md:px-[30px] px-5"
              : "container mx-auto  py-[30px]"
              } ${activeLayout == "horizontal" ? 'xl:mt-3' : ''}
            `}
          >
            {children}
          </div>
          <Customizer />
        </div>
      </div>
    </div>
  );
}