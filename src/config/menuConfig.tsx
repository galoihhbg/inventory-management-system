import React from "react";
import {
  HomeOutlined,
  DatabaseOutlined,
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  StockOutlined,
  UnlockOutlined,
  SettingOutlined,
} from "@ant-design/icons";

export interface AppMenuItem {
  key: string;
  labelKey: string;
  path?: string;
  icon?: React.ReactNode;
  children?: AppMenuItem[];
}

export const menuItems: AppMenuItem[] = [
  {
    key: "dashboard",
    labelKey: "navigation.dashboard",
    path: "/dashboard",
    icon: <HomeOutlined />,
  },

  {
    key: "categories",
    labelKey: "navigation.categories",
    icon: <DatabaseOutlined />,
    children: [
      {
        key: "items",
        labelKey: "navigation.items", // 1. Vật tư hàng hoá
        path: "/items",
      },
      {
        key: "warehouses",
        labelKey: "navigation.warehouses", // 2. Kho hàng
        path: "/warehouses",
      },
      {
        key: "bins",
        labelKey: "navigation.bins", // 3. Vị trí
        path: "/bins",
      },
      {
        key: "partners",
        labelKey: "navigation.partners", // 4. Đối tượng
        path: "/partners",
      },
      {
        key: "users",
        labelKey: "navigation.users", // 5. Nhân viên
        path: "/users",
      },
    ],
  },

  // CHỨNG TỪ
  {
    key: "documents",
    labelKey: "navigation.documents", // Key dịch mới
    icon: <AppstoreOutlined />,
    children: [
      {
        key: "inbound",
        labelKey: "navigation.inbound", // Key dịch mới (NHẬP)
        icon: <ArrowDownOutlined />,
        children: [
          {
            key: "purchaseOrders",
            labelKey: "navigation.purchaseOrders", // 1. Phiếu nhập mua
            path: "/purchase-orders",
          },
          // 2. Phiếu nhập kho (chưa có trong ITEMS)
          // 3. Trả lại nhà cung cấp (chưa có trong ITEMS)
        ],
      },
      {
        key: "outbound",
        labelKey: "navigation.outbound", // Key dịch mới (XUẤT)
        icon: <ArrowUpOutlined />,
        children: [
          {
            key: "salesOrders",
            labelKey: "navigation.salesOrders", // 1. Hoá đơn bán hàng
            path: "/sales-orders",
          },
          // 2. Phiếu xuất kho (chưa có trong ITEMS)
          // 3. Hàng bán bị trả lại (chưa có trong ITEMS)
        ],
      },
      {
        key: "inventoryOps",
        labelKey: "navigation.inventoryOps", // Key dịch mới (KIỂM KÊ)
        icon: <CheckCircleOutlined />,
        children: [
          {
            key: "inventoryChecks",
            labelKey: "navigation.inventoryChecks", // 1. Kiểm kê hàng tồn kho
            path: "/inventory-checks",
          },
          // 2. Xử lý chênh lệch (chưa có trong ITEMS)
        ],
      },
    ],
  },

  {
    key: "inventoryStock",
    labelKey: "navigation.inventory",
    path: "/inventory-stock",
    icon: <StockOutlined />,
  },
  {
    key: "inventorySummary",
    labelKey: "navigation.inventorySummary",
    path: "/inventory-summary",
    icon: <StockOutlined />,
  },
  {
    key: "roles",
    labelKey: "navigation.roles",
    path: "/roles",
    icon: <UnlockOutlined />,
  },
  {
    key: "baseUnits",
    labelKey: "navigation.baseUnits",
    path: "/base-units",
    icon: <DatabaseOutlined />,
  },
  {
    key: "settings",
    labelKey: "navigation.settings",
    path: "/settings/display",
    icon: <SettingOutlined />,
  },
];
