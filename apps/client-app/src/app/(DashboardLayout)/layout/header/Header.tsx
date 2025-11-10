"use client";
import "flowbite";
import React, { useState, useEffect, useContext } from "react";
import { DrawerItems, Navbar, NavbarCollapse } from "flowbite-react";
import { Icon } from "@iconify/react";
import Messages from "./Messages";
import Profile from "./Profile";
import { CustomizerContext } from "@/app/context/CustomizerContext";

import FullLogo from "../shared/logo/FullLogo";
import MobileHeaderItems from "./MobileHeaderItems";
import { Drawer } from "flowbite-react";
import MobileSidebar from "../sidebar/MobileSidebar";

interface HeaderPropsType {
  layoutType: string;
}

const Header = ({ layoutType }: HeaderPropsType) => {
  const [isSticky, setIsSticky] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const { setIsCollapse, isCollapse, isLayout, setActiveMode, activeMode } = useContext(CustomizerContext);

  const [mobileMenu, setMobileMenu] = useState("");

  const handleMobileMenu = () => {
    if (mobileMenu === "active") {
      setMobileMenu("");
    } else {
      setMobileMenu("active");
    }
  };

  const toggleMode = () => {
    setActiveMode((prevMode: string) => (prevMode === "light" ? "dark" : "light"));
  };

  // mobile-sidebar
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  return (
    <>
      <header
        className={`sticky top-0 z-[2] ${isSticky
          ? "bg-white dark:bg-dark shadow-md fixed w-full"
          : "bg-transparent"
          }`}
      >
        <Navbar
          fluid
          className={`rounded-none bg-transparent dark:bg-transparent py-4 sm:px-6 ${layoutType == "horizontal" ? "container mx-auto" : ""
            }  ${isLayout == "full" ? "!max-w-full" : ""}`}
        >
          {/* Mobile Toggle Icon */}
          <span
            onClick={() => setIsOpen(true)}
            className="px-[15px] hover:text-primary dark:hover:text-primary text-link dark:text-darklink relative after:absolute after:w-10 after:h-10 after:rounded-full hover:after:bg-lightprimary  after:bg-transparent rounded-full xl:hidden flex justify-center items-center cursor-pointer"
          >
            <Icon icon="tabler:menu-2" height={20} />
          </span>
          {/* Toggle Icon   */}
          <NavbarCollapse className="xl:!block !hidden">
            <div className="flex gap-0 items-center relative">
              {layoutType == "horizontal" ? (
                <div className="me-3">
                  <FullLogo />
                </div>
              ) : null}
              {/* Toggle Menu    */}
              {layoutType != "horizontal" ? (
                <span
                  onClick={() => {
                    if (isCollapse === "full-sidebar") {
                      setIsCollapse("mini-sidebar");
                    } else {
                      setIsCollapse("full-sidebar");
                    }
                  }}
                  className="px-[15px] relative after:absolute after:w-10 after:h-10 after:rounded-full hover:after:bg-lightprimary  after:bg-transparent text-link hover:text-primary dark:text-darklink dark:hover:text-primary rounded-full justify-center items-center cursor-pointer xl:flex hidden"
                >
                  <Icon icon="tabler:menu-2" height={20} />
                </span>
              ) : null}
            </div>
          </NavbarCollapse>

          {/* mobile-logo */}
          <div className="block xl:hidden">
            <FullLogo />
          </div>

          <NavbarCollapse className="xl:!block !hidden md:!hidden">
            <div className="flex gap-0 items-center">
              {/* Theme Toggle */}
              {isMounted && activeMode === "light" ? (
                <div
                  className=" hover:text-primary px-15 group  dark:hover:text-primary focus:ring-0 rounded-full flex justify-center items-center cursor-pointer text-link dark:text-darklink relative"

                  onClick={toggleMode}
                >
                  <span className="flex items-center justify-center relative after:absolute after:w-10 after:h-10 after:rounded-full after:-top-1/2   group-hover:after:bg-lightprimary">
                    <Icon
                      icon="tabler:moon"
                      width="20"
                    // className="text-link group-hover:text-primary"
                    />
                  </span>
                </div>
              ) : isMounted && activeMode === "dark" ? (
                // Dark Mode Button
                <div
                  className=" hover:text-primary px-15   dark:hover:text-primary focus:ring-0 rounded-full flex justify-center items-center cursor-pointer text-link dark:text-darklink group relative"

                  onClick={toggleMode}
                >
                  <span className="flex items-center justify-center relative after:absolute after:w-10 after:h-10 after:rounded-full after:-top-1/2   group-hover:after:bg-lightprimary">

                    <Icon
                      icon="solar:sun-bold-duotone"
                      width="20"
                      className="group-hover:text-primary"
                    />
                  </span>
                </div>
              ) : (
                // Fallback during hydration - show light mode icon
                <div
                  className=" hover:text-primary px-15 group  dark:hover:text-primary focus:ring-0 rounded-full flex justify-center items-center cursor-pointer text-link dark:text-darklink relative"

                  onClick={toggleMode}
                >
                  <span className="flex items-center justify-center relative after:absolute after:w-10 after:h-10 after:rounded-full after:-top-1/2   group-hover:after:bg-lightprimary">
                    <Icon
                      icon="tabler:moon"
                      width="20"
                    // className="text-link group-hover:text-primary"
                    />
                  </span>
                </div>
              )}
              {/* Language Dropdown*/}
              {/* <Language /> */}

              {/* Messages Dropdown */}
              <Messages />

              {/* Profile Dropdown */}
              <Profile />
            </div>
          </NavbarCollapse>
          {/* Mobile Toggle Icon */}
          <span
            className="h-10 w-10 flex xl:hidden hover:text-primary hover:bg-lightprimary rounded-full justify-center items-center cursor-pointer"
            onClick={handleMobileMenu}
          >
            <Icon icon="tabler:dots" height={21} />
          </span>
        </Navbar>
        <div
          className={`w-full  xl:hidden block mobile-header-menu ${mobileMenu}`}
        >
          <MobileHeaderItems />
        </div>
      </header>

      {/* Mobile Sidebar */}
      <Drawer open={isOpen} onClose={handleClose} className="w-64">
        <DrawerItems>
          <MobileSidebar />
        </DrawerItems>
      </Drawer>
    </>
  );
};

export default Header;
