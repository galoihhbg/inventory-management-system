import React, { useMemo } from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined, DatabaseOutlined, AppstoreOutlined, TeamOutlined, SettingOutlined, UnlockOutlined, ShoppingCartOutlined, StockOutlined, CheckCircleOutlined, FileTextOutlined, BarChartOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_PERMISSIONS, DISPLAY_CONFIG_KEY } from '../config/permissions';

type MenuItem = {
  key: string;
  labelKey: string; // Key để dịch từ i18n
  path?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
};

const ITEMS: MenuItem[] = [
  { key: 'dashboard', labelKey: 'navigation.dashboard', path: '/dashboard', icon: <HomeOutlined /> },
  { key: 'warehouses', labelKey: 'navigation.warehouses', path: '/warehouses', icon: <DatabaseOutlined /> },
  { key: 'items', labelKey: 'navigation.items', path: '/items', icon: <AppstoreOutlined /> },
  { key: 'inventoryStock', labelKey: 'navigation.inventory', path: '/inventory-stock', icon: <StockOutlined /> },
  { key: 'inventorySummary', labelKey: 'navigation.inventory', path: '/inventory-summary', icon: <StockOutlined /> },
  { key: 'inventoryChecks', labelKey: 'navigation.inventoryChecks', path: '/inventory-checks', icon: <CheckCircleOutlined /> },
  { key: 'purchaseOrders', labelKey: 'navigation.purchaseOrders', path: '/purchase-orders', icon: <ShoppingCartOutlined /> },
  { key: 'salesOrders', labelKey: 'navigation.salesOrders', path: '/sales-orders', icon: <ShoppingCartOutlined /> },
  { 
    key: 'reports', 
    labelKey: 'navigation.reports', 
    icon: <BarChartOutlined />,
    children: [
      { key: 'purchaseOrderReport', labelKey: 'navigation.purchaseOrderReport', path: '/reports/purchase-orders', icon: <FileTextOutlined /> },
      { key: 'salesOrderReport', labelKey: 'navigation.salesOrderReport', path: '/reports/sales-orders', icon: <FileTextOutlined /> },
      { key: 'inventoryMovementReport', labelKey: 'navigation.inventoryMovementReport', path: '/reports/inventory-movement', icon: <FileTextOutlined /> },
      { key: 'inventoryByLocationReport', labelKey: 'navigation.inventoryByLocationReport', path: '/reports/inventory-by-location', icon: <FileTextOutlined /> },
      { key: 'itemDetailReport', labelKey: 'navigation.itemDetailReport', path: '/reports/item-detail', icon: <FileTextOutlined /> },
      { key: 'inventoryCheckDiscrepancyReport', labelKey: 'navigation.inventoryCheckDiscrepancyReport', path: '/reports/inventory-check-discrepancy', icon: <FileTextOutlined /> }
    ]
  },
  { key: 'users', labelKey: 'navigation.users', path: '/users', icon: <TeamOutlined /> },
  { key: 'roles', labelKey: 'navigation.roles', path: '/roles', icon: <UnlockOutlined /> },
  { key: 'partners', labelKey: 'navigation.partners', path: '/partners', icon: <DatabaseOutlined /> },
  { key: 'bins', labelKey: 'navigation.bins', path: '/bins', icon: <DatabaseOutlined /> },
  { key: 'baseUnits', labelKey: 'navigation.baseUnits', path: '/base-units', icon: <DatabaseOutlined /> },
  { key: 'settings', labelKey: 'navigation.settings', path: '/settings/display', icon: <SettingOutlined /> }
];

function loadDisplayConfig(): Record<string, string[]> | null {
  try {
    const raw = localStorage.getItem(DISPLAY_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Sidebar() {
  const { pathname } = useLocation();
  const { hasRole } = useAuth();
  const { t } = useTranslation();

  const displayConfig = useMemo(() => {
    const custom = loadDisplayConfig();
    return custom || DEFAULT_PERMISSIONS;
  }, []);

  const visibleItems = useMemo(() => {
    return ITEMS.filter((it) => {
      const allowedRoles = displayConfig[it.key] ?? DEFAULT_PERMISSIONS[it.key] ?? [];
      if (!allowedRoles || allowedRoles.length === 0) return false;
      return hasRole(allowedRoles);
    }).map((item) => {
      // If item has children, filter them too
      if (item.children) {
        const visibleChildren = item.children.filter((child) => {
          const childRoles = displayConfig[child.key] ?? DEFAULT_PERMISSIONS[child.key] ?? [];
          return childRoles.length > 0 && hasRole(childRoles);
        });
        return { ...item, children: visibleChildren };
      }
      return item;
    });
  }, [displayConfig, hasRole]);

  const renderMenuItem = (item: MenuItem) => {
    if (item.children && item.children.length > 0) {
      return (
        <Menu.SubMenu key={item.key} icon={item.icon} title={t(item.labelKey)}>
          {item.children.map((child) => (
            <Menu.Item key={child.path} icon={child.icon}>
              <Link to={child.path!}>{t(child.labelKey)}</Link>
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      );
    }
    return (
      <Menu.Item key={item.path} icon={item.icon}>
        <Link to={item.path!}>{t(item.labelKey)}</Link>
      </Menu.Item>
    );
  };

  return (
    <Menu selectedKeys={[pathname]} mode="inline" style={{ height: '100%', borderRight: 0 }}>
      {visibleItems.map((it) => renderMenuItem(it))}
    </Menu>
  );
}