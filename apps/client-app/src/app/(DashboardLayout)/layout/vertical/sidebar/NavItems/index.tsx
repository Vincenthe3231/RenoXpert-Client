"use client";
import React from "react";
import { ChildItem } from "../Sidebaritems";
import { Sidebar, SidebarItem } from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from 'react-i18next';

interface NavItemsProps {
  item: ChildItem;
}
const NavItems: React.FC<NavItemsProps> = ({ item }) => {
  const pathname = usePathname();
  const { t } = useTranslation();
  return (
    <>
      <SidebarItem
        href={item.url}
        as={Link}
        className={`${item.disabled?"opacity-50 cursor-default hover:bg-transparent hover:text-link":item.url == pathname
          ? `${item.icon ? '!text-white' : '!text-primary' } bg-primary mb-0.5 hover:bg-primary hover:text-white`
          : "text-link bg-transparent hover:bg-lightprimary dark:hover:bg-lightprimary group/link "
          }  `}
      >
        <span className="flex gap-3.5 align-center items-center truncate">
          {item.icon ? (
            <Icon icon={item.icon} className={`${item.color} my-0.5`} height={21} />
          ) : (
            <span
              className={`${item.url == pathname
                ? "rounded-full mx-1 group-hover/link:bg-primary !bg-transparent border border-primary size-2"
                : "size-2 !bg-transparent border  border-dark dark:border-darklink rounded-full mx-1 group-hover/link:!border-primary"
                } `}
            ></span>
          )}
          <div className="max-w-36 overflow-hidden hide-menu flex-1 !leading-normal">{t(`${item.name}`)}
          {item.subtitle?<p className="text-xs mt-1" >{t(`${item.subtitle}`)}</p>:null}
          </div>
          {item.badge?item.badgeType==="filled"?<span className="w-6 h-6 rounded-full bg-primary font-semibold text-white text-xs flex items-center justify-center sidebar-badge" >9</span>:<span className="px-2 py-1 border-primary border rounded-full  bg-transparent text-primary font-semibold text-xs sidebar-badge" >Outline</span>:null}
        </span>
      </SidebarItem>
    </>
  );
};

export default NavItems;
