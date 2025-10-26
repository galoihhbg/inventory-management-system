import React from 'react';
import { Button, Table, Space, Popconfirm, notification, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useEntityList, useEntityCRUD } from '../../api/hooks';
import { useMemo, useState } from 'react';

type Props = {
  endpoint: string;
  title: string;
  columns: any[]; // ant table columns
  createPath?: string;
  editPath?: (id: number | string) => string;
};

export default function GenericList({ endpoint, title, columns, createPath, editPath }: Props) {
  const [q, setQ] = useState('');
  const { data, isLoading, refetch } = useEntityList<any>(endpoint, { limit: 50 });
  const { remove } = useEntityCRUD(endpoint);
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
    return rows.filter((r: any) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  }, [data, q]);

  const cols = [
    ...columns,
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {editPath && <Button icon={<EditOutlined />} onClick={() => navigate(editPath(record.id))} />}
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
        <h3>{title}</h3>
        <Space>
          <Input.Search placeholder="Search" onSearch={(v) => setQ(v)} style={{ width: 240 }} />
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Refresh
          </Button>
          {createPath && (
            <Link to={createPath}>
              <Button type="primary" icon={<PlusOutlined />}>
                New
              </Button>
            </Link>
          )}
        </Space>
      </div>

      <Table rowKey="id" loading={isLoading} dataSource={dataSource} columns={cols} pagination={{ pageSize: 10 }} />
    </div>
  );
}