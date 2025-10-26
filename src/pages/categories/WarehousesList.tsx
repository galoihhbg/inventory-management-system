import React, { useMemo, useState } from 'react';
import { Button, Table, Space, Popconfirm, notification, Input } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useEntityList, useEntityCRUD } from '../../api/hooks';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { Warehouse } from '../../types';

export default function WarehousesList() {
  const [query, setQuery] = useState('');
  const { data, isLoading, refetch } = useEntityList<Warehouse>('/warehouses', { limit: 20 });
  const { remove } = useEntityCRUD('/warehouses');
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
    if (query.trim()) {
      return rows.filter((r) => (r.name + r.code + (r.description || '')).toLowerCase().includes(query.toLowerCase()));
    }
    return rows;
  }, [data, query]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Code', dataIndex: 'code', key: 'code', width: 140 },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_: any, record: Warehouse) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => navigate(`/warehouses/${record.id}/edit`)} />
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
        <h3>Warehouses</h3>
        <Space>
          <Input.Search placeholder="Search" onSearch={(v) => setQuery(v)} style={{ width: 240 }} />
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Refresh
          </Button>
          <Link to="/warehouses/new">
            <Button type="primary" icon={<PlusOutlined />}>
              New Warehouse
            </Button>
          </Link>
        </Space>
      </div>

      <Table rowKey="id" loading={isLoading} dataSource={dataSource} columns={columns} pagination={{ pageSize: 10 }} />
    </div>
  );
}