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
    heading: "Home",
    children: [
      {
        name: "Modern",
        icon: "solar:widget-2-linear",
        id: uniqueId(),
        url: "/",
      },
      {
        name: "Front Pages",
        id: uniqueId(),
        icon: "solar:document-linear",
        children: [
          {
            id: uniqueId(),
            name: "Homepage",
            url: "/frontend-pages/homepage",
          },
          {
            id: uniqueId(),
            name: "About Us",
            url: "/frontend-pages/about",
          },
          {
            id: uniqueId(),
            name: "Blog",
            url: "/frontend-pages/blog/post",
          },
          {
            id: uniqueId(),
            name: "Blog Details",
            url: "frontend-pages/blog/detail/as-yen-tumbles-gadget-loving-japan-goes-for-secondhand-iphones-",
          },
          {
            id: uniqueId(),
            name: "Portfolio",
            url: "/frontend-pages/portfolio",
          },
          {
            id: uniqueId(),
            name: "Pricing",
            url: "/frontend-pages/pricing",
          },
          {
            id: uniqueId(),
            name: "Contact Us",
            url: "/frontend-pages/contact",
          },
        ],
      },
    ],
  },
  {
    heading: "Apps",
    children: [
      {
        id: uniqueId(),
        name: "Integrations",
        icon: "solar:home-add-linear",
        url: "/theme-pages/inetegration",
        badge: true,
        badgeType: 'filled',
        badgeContent: 'New',
      },
      {
        id: uniqueId(),
        name: "Users",
        icon: "solar:user-linear",
        url: "/theme-pages/inetegration",
      },
    ],
  },
];

export default SidebarContent;
