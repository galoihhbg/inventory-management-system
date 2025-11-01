import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Switch, Button, Space, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PERMISSIONS, DISPLAY_CONFIG_KEY } from '../../config/permissions';

const ALL_ROLES = ['admin', 'manager', 'user'];
const MENU_KEYS = Object.keys(DEFAULT_PERMISSIONS);

export default function DisplaySettings() {
  const { t } = useTranslation();
  
  const [config, setConfig] = useState<Record<string, string[]>>(() => {
    try {
      const raw = localStorage.getItem(DISPLAY_CONFIG_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_PERMISSIONS;
    } catch {
      return DEFAULT_PERMISSIONS;
    }
  });

  useEffect(() => {
    MENU_KEYS.forEach((k) => {
      if (!config[k]) config[k] = DEFAULT_PERMISSIONS[k] || [];
    });
  }, []);

  const save = () => {
    localStorage.setItem(DISPLAY_CONFIG_KEY, JSON.stringify(config));
    notification.success({ message: t('settings.savedDisplaySettings') });
    window.location.reload();
  };

  const reset = () => {
    localStorage.removeItem(DISPLAY_CONFIG_KEY);
    setConfig({ ...DEFAULT_PERMISSIONS });
    notification.success({ message: t('settings.resetToDefaults') });
    window.location.reload();
  };

  const dataSource = useMemo(
    () =>
      MENU_KEYS.map((key) => ({
        key,
        menu: key,
        roles: config[key] || []
      })),
    [config]
  );

  const toggleRole = (menuKey: string, role: string, checked: boolean) => {
    setConfig((prev) => {
      const cur = new Set(prev[menuKey] || []);
      if (checked) cur.add(role);
      else cur.delete(role);
      return { ...prev, [menuKey]: Array.from(cur) };
    });
  };

  const columns = [
    { title: t('settings.menu'), dataIndex: 'menu', key: 'menu', render: (text: string) => <b>{text}</b> },
    {
      title: t('settings.visibleToRoles'),
      key: 'roles',
      render: (_: any, record: any) => (
        <Space>
          {ALL_ROLES.map((r) => (
            <div key={r} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Switch
                checked={record.roles.includes(r)}
                onChange={(checked) => toggleRole(record.key, r, checked)}
              />
              <span style={{ textTransform: 'capitalize' }}>{r}</span>
            </div>
          ))}
        </Space>
      )
    }
  ];

  return (
    <Card title={t('settings.displaySettings')}>
      <Table dataSource={dataSource} columns={columns} pagination={false} rowKey="key" />
      <div style={{ marginTop: 16 }}>
        <Space>
          <Button type="primary" onClick={save}>
            {t('common.save')}
          </Button>
          <Button onClick={reset}>{t('settings.resetToDefaults')}</Button>
        </Space>
      </div>
    </Card>
  );
}