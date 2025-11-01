import React from 'react';
import { Typography, Button, Space, Avatar, Dropdown, MenuProps } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

const { Title } = Typography;

export default function TopBar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const username = user?.username || 'Guest';

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      label: <span>{t('common.profile')}</span>,
      icon: <UserOutlined />
    },
    {
      key: 'logout',
      label: <span>{t('auth.logout')}</span>,
      icon: <LogoutOutlined />
    }
  ];

  const onMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Title level={4} style={{ margin: 0, color: '#fff' }}>
          {t('common.systemTitle')}
        </Title>
      </div>
      <Space>
        <LanguageSwitcher size="small" />
        <Dropdown menu={{ items, onClick: onMenuClick }} placement="bottomRight">
          <div className="flex items-center gap-3 cursor-pointer text-white">
            <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
            <span>{username}</span>
          </div>
        </Dropdown>
      </Space>
    </div>
  );
}