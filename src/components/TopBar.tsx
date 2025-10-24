import React from 'react';
import { Typography, Button, Space, Avatar, Dropdown, MenuProps } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

export default function TopBar() {
  const { user, logout } = useAuth();
  const username = user?.username || 'Guest';

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      label: <span>Profile</span>,
      icon: <UserOutlined />
    },
    {
      key: 'logout',
      label: <span>Logout</span>,
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
          Inventory Management System
        </Title>
      </div>
      <Space>
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