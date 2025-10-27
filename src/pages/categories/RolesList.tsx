import React from 'react';
import { Button, Table, Space, Popconfirm, notification, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useFilteredList, useEntityCRUD } from '../../api/hooks';

export default function RolesList() {
  const { data, isLoading, setFilter } = useFilteredList<any>({
    endpoint: '/roles',
    initialFilters: { limit: 50 }
  });
  const { remove } = useEntityCRUD('/roles');
  const navigate = useNavigate();

  const handleDelete = async (id: number) => {
    try {
      await remove.mutateAsync(id);
      notification.success({ message: 'Deleted' });
    } catch (err: any) {
      notification.error({ message: 'Delete failed', description: err?.response?.data?.message || err.message });
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Role Name', dataIndex: 'role_name', key: 'roleName' },
    { title: 'Actions', key: 'actions', render: (_: any, record: any) => (
      <Space>
        <Button icon={<EditOutlined />} onClick={() => navigate(`/roles/${record.id}/edit`)} />
        <Popconfirm title="Delete?" onConfirm={() => handleDelete(record.id)}>
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ) }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3>Roles</h3>
        <Space>
          <Input.Search 
            placeholder="Search" 
            onSearch={(v) => setFilter('search', v)} 
            onChange={(e) => !e.target.value && setFilter('search', '')}
            allowClear
            style={{ width: 240 }} 
          />
          <Link to="/roles/new">
            <Button type="primary" icon={<PlusOutlined />}>
              New Role
            </Button>
          </Link>
        </Space>
      </div>

      <Table rowKey="id" loading={isLoading} dataSource={data} columns={columns} pagination={{ pageSize: 10 }} />
    </div>
  );
}