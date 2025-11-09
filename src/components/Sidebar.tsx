import React, { useMemo, useCallback, useState, useEffect } from "react";
import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_PERMISSIONS, DISPLAY_CONFIG_KEY } from "../config/permissions";
import { menuItems, AppMenuItem } from "../config/menuConfig";

const findMenuItemByKey = (
  items: AppMenuItem[],
  key: string
): AppMenuItem | null => {
  for (const item of items) {
    if (item.key === key) return item;
    if (item.children) {
      const found = findMenuItemByKey(item.children, key);
      if (found) return found;
    }
  }
  return null;
};

const findMenuItemByPath = (
  items: AppMenuItem[],
  path: string,
  parentKey: string | null = null
): { item: AppMenuItem | null; parentKey: string | null } => {
  let bestMatch: { item: AppMenuItem | null; parentKey: string | null } = {
    item: null,
    parentKey: null,
  };

  for (const item of items) {
    if (item.path === path) {
      return { item, parentKey };
    }

    if (item.children) {
      const found = findMenuItemByPath(item.children, path, item.key);
      if (found.item) {
        return found;
      }
    }
    if (item.path && path.startsWith(item.path) && item.path !== "/") {
      if (!bestMatch.item || item.path.length > bestMatch.item.path!.length) {
        bestMatch = { item, parentKey };
      }
    }
  }
  return bestMatch;
};

function loadDisplayConfig(): Record<string, string[]> | null {
  try {
    const raw = localStorage.getItem(DISPLAY_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole } = useAuth();
  const { t } = useTranslation();

  const displayConfig = useMemo(() => {
    const custom = loadDisplayConfig();
    return custom || DEFAULT_PERMISSIONS;
  }, []);

  const buildAndFilterMenuItems = useCallback(
    (items: AppMenuItem[]): any[] => {
      return items.reduce((acc, item) => {
        if (item.children) {
          const processedChildren = buildAndFilterMenuItems(item.children);
          if (processedChildren.length > 0) {
            acc.push({
              key: item.key,
              icon: item.icon,
              label: t(item.labelKey),
              children: processedChildren,
            });
          }
        } else if (item.path) {
          const allowedRoles =
            displayConfig[item.key] ?? DEFAULT_PERMISSIONS[item.key] ?? [];

          if (hasRole(allowedRoles)) {
            acc.push({
              key: item.key,
              icon: item.icon,
              label: t(item.labelKey),
            });
          }
        }
        return acc;
      }, [] as any[]);
    },
    [t, hasRole, displayConfig]
  );

  const menuItemsForRender = useMemo(
    () => buildAndFilterMenuItems(menuItems),
    [buildAndFilterMenuItems]
  );

  const handleMenuClick = useCallback(
    ({ key }: { key: string }) => {
      const menuItem = findMenuItemByKey(menuItems, key);
      if (menuItem && menuItem.path) {
        navigate(menuItem.path);
      }
    },
    [navigate]
  );

  const { selectedKey, openKey } = useMemo(() => {
    const { item, parentKey } = findMenuItemByPath(
      menuItems,
      location.pathname
    );
    return {
      selectedKey: item ? item.key : null,
      openKey: parentKey,
    };
  }, [location.pathname]);

  const [currentOpenKeys, setCurrentOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    if (openKey && !currentOpenKeys.includes(openKey)) {
      setCurrentOpenKeys((prevKeys) => [...prevKeys, openKey]);
    }
  }, [openKey]);

  const handleOpenChange = (keys: string[]) => {
    setCurrentOpenKeys(keys);
  };

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
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={selectedKey ? [selectedKey] : []}
        openKeys={currentOpenKeys}
        onOpenChange={handleOpenChange}
        items={menuItemsForRender}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </div>
  );
}
