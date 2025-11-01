import React, { useMemo } from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined, DatabaseOutlined, AppstoreOutlined, TeamOutlined, SettingOutlined, UnlockOutlined, ShoppingCartOutlined, StockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_PERMISSIONS, DISPLAY_CONFIG_KEY } from '../config/permissions';

type MenuItem = {
  key: string;
  labelKey: string; // Key để dịch từ i18n
  path: string;
  icon?: React.ReactNode;
};

const ITEMS: MenuItem[] = [
  { key: 'dashboard', labelKey: 'navigation.dashboard', path: '/dashboard', icon: <HomeOutlined /> },
  { key: 'warehouses', labelKey: 'navigation.warehouses', path: '/warehouses', icon: <DatabaseOutlined /> },
  { key: 'items', labelKey: 'navigation.items', path: '/items', icon: <AppstoreOutlined /> },
  { key: 'inventoryStock', labelKey: 'navigation.inventory', path: '/inventory-stock', icon: <StockOutlined /> },
  { key: 'inventorySummary', labelKey: 'navigation.inventory', path: '/inventory-summary', icon: <StockOutlined /> },
  { key: 'purchaseOrders', labelKey: 'navigation.purchaseOrders', path: '/purchase-orders', icon: <ShoppingCartOutlined /> },
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
    });
  }, [displayConfig, hasRole]);

  return (
    <Menu selectedKeys={[pathname]} mode="inline" style={{ height: '100%', borderRight: 0 }}>
      {visibleItems.map((it) => (
        <Menu.Item key={it.path} icon={it.icon}>
          <Link to={it.path}>{t(it.labelKey)}</Link>
        </Menu.Item>
      ))}
    </Menu>
  );
}