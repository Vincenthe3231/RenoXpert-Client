"use client";
import React, { useContext } from "react";
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
