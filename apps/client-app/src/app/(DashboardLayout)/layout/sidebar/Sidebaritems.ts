export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
  disabled?: boolean,
  subtitle?: string,
  badge?: boolean,
  badgeType?: string,
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
  disabled?: boolean,
  subtitle?: string,
  badgeType?: string,
  badge?: boolean,
}


import { uniqueId } from "lodash";

const SidebarContent: MenuItem[] = [
  {
    heading: "Home",
    children: [
      {
        name: "Dashboard",
        icon: 'tabler:aperture',
        id: uniqueId(),
        url: "/",
      },
      {
        name: "Front Pages",
        id: uniqueId(),
        icon: "tabler:app-window",
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
      // {
      //   name: "NFT",
      //   icon: 'tabler:currency-dollar',
      //   id: uniqueId(),
      //   url: "/dashboards/nft",
      // },
      // {
      //   name: "Crypto",
      //   icon: 'tabler:cpu',
      //   id: uniqueId(),
      //   url: "/dashboards/crypto",
      // },
      // {
      //   name: "General",
      //   icon: 'tabler:activity-heartbeat',
      //   id: uniqueId(),
      //   url: "/dashboards/general",
      // },
      // {
      //   name: "Music",
      //   icon: 'tabler:playlist',
      //   id: uniqueId(),
      //   url: "/dashboards/music",
      // },
    ],
  },
  {
    heading: "Apps",
    children: [
      {
        id: uniqueId(),
        name: "Kanban",
        icon: "tabler:layout-kanban",
        url: "/apps/kanban",
      },
      {
        name: "Invoice",
        id: uniqueId(),
        icon: "tabler:file-text",
        children: [
          {
            id: uniqueId(),
            name: "List",
            url: "/apps/invoice/list",
          },
          {
            id: uniqueId(),
            name: "Details",
            url: "/apps/invoice/detail/PineappleInc",
          },
          {
            id: uniqueId(),
            name: "Create",
            url: "/apps/invoice/create",
          },
          {
            id: uniqueId(),
            name: "Edit",
            url: "/apps/invoice/edit/PineappleInc",
          },
        ],
      },
    ],
  },
  {
    heading: "Settings",
    children: [
      {
        id: uniqueId(),
        name: "Users",
        icon: "tabler:user",
        url: "/users",
      }
    ]
  }
];

export default SidebarContent;
