import React, { useMemo, useState } from 'react';
import { Button, Table, Space, Popconfirm, notification, Input } from 'antd';
import { useEntityList, useEntityCRUD } from '../../api/hooks';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../../types';

export default function UsersList() {
  const [q, setQ] = useState('');
  const { data, isLoading, refetch } = useEntityList<User>('/users', { limit: 50 });
  const { remove } = useEntityCRUD('/users');
  const navigate = useNavigate();

  const handleDelete = async (id: number) => {
    try {
      await remove.mutateAsync(id);
      notification.success({ message: 'Deleted' });
    } catch (err: any) {
      notification.error({ message: 'Delete failed', description: err?.response?.data?.message || err.message });
    }
  };

  const handleRefresh = () => {
    refetch();
    notification.success({ message: 'Data refreshed' });
  };

  const dataSource = useMemo(() => {
    const rows = data?.data || [];
    if (!q.trim()) return rows;
    return rows.filter((r) => (r.username + r.email).toLowerCase().includes(q.toLowerCase()));
  }, [data, q]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Roles', key: 'roles', dataIndex: ['role', 'role_name'] },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => navigate(`/users/${record.id}/edit`)} />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3>Users</h3>
        <Space>
          <Input.Search placeholder="Search" onSearch={(v) => setQ(v)} style={{ width: 240 }} />
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Refresh
          </Button>
          <Link to="/users/new">
            <Button type="primary" icon={<PlusOutlined />}>
              New User
            </Button>
          </Link>
        </Space>
      </div>

      <Table rowKey="id" loading={isLoading} dataSource={dataSource} columns={columns} pagination={{ pageSize: 10 }} />
    </div>
  );
}