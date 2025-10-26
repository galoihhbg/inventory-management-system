import React, { useMemo } from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined, DatabaseOutlined, AppstoreOutlined, TeamOutlined, SettingOutlined, UnlockOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_PERMISSIONS, DISPLAY_CONFIG_KEY } from '../config/permissions';

type MenuItem = {
  key: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
};

const ITEMS: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <HomeOutlined /> },
  { key: 'warehouses', label: 'Warehouses', path: '/warehouses', icon: <DatabaseOutlined /> },
  { key: 'items', label: 'Items', path: '/items', icon: <AppstoreOutlined /> },
  { key: 'purchaseOrders', label: 'Purchase Orders', path: '/purchase-orders', icon: <ShoppingCartOutlined /> },
  { key: 'users', label: 'Users', path: '/users', icon: <TeamOutlined /> },
  { key: 'roles', label: 'Roles', path: '/roles', icon: <UnlockOutlined /> },
  { key: 'partners', label: 'Partners', path: '/partners', icon: <DatabaseOutlined /> },
  { key: 'bins', label: 'Bins', path: '/bins', icon: <DatabaseOutlined /> },
  { key: 'baseUnits', label: 'Base Units', path: '/base-units', icon: <DatabaseOutlined /> },
  { key: 'settings', label: 'Settings', path: '/settings/display', icon: <SettingOutlined /> }
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
          <Link to={it.path}>{it.label}</Link>
        </Menu.Item>
      ))}
    </Menu>
  );
}