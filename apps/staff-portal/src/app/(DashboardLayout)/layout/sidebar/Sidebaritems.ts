export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
  disabled?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeType?: string;
  badgeContent?: string;
  requiredRole?: 'super-admin' | 'admin' | 'staff';
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
  disabled?: boolean;
  subtitle?: string;
  badgeType?: string;
  badge?: boolean;
  badgeContent?: string;
}

import { uniqueId } from "lodash";

const SidebarContent: MenuItem[] = [
  {
    heading: "Apps",
    children: [
      {
        id: uniqueId(),
        name: "Dashboard",
        icon: "solar:widget-2-linear",
        url: "/dashboard",
        // No requiredRole - everyone can see it
      },
      {
        id: uniqueId(),
        name: "Users",
        icon: "solar:user-linear",
        url: "/users",
        requiredRole: 'staff',
      },
      {
        id: uniqueId(),
        name: "Departments",
        icon: "solar:buildings-2-linear",
        url: "/departments",
        requiredRole: 'super-admin',
      },
      {
        id: uniqueId(),
        name: "Onboarding",
        icon: "solar:users-group-two-rounded-linear",
        url: "/onboarding",
        requiredRole: 'super-admin',
      },
      {
        id: uniqueId(),
        name: "Audit",
        icon: "solar:history-linear",
        url: "/audit",
        requiredRole: 'super-admin',
      },
    ],
  },
];

export default SidebarContent;
