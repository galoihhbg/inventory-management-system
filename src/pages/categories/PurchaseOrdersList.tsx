import React, { useMemo, useState } from 'react';
import { Button, Table, Space, notification, Input, Select, Tag } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useEntityList } from '../../api/hooks';

const { Option } = Select;

const columns = [
  { 
    title: 'ID', 
    dataIndex: 'id', 
    key: 'id', 
    width: 80 
  },
  { 
    title: 'Code', 
    dataIndex: 'code', 
    key: 'code' 
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      const color = status === 'confirmed' ? 'green' : 'orange';
      return <Tag color={color}>{status?.toUpperCase()}</Tag>;
    }
  },
  { 
    title: 'Order Date', 
    dataIndex: 'orderDate', 
    key: 'orderDate',
    render: (date: string) => date ? new Date(date).toLocaleString() : '-'
  },
  {
    title: 'Confirmed At',
    dataIndex: 'confirmedAt',
    key: 'confirmedAt',
    render: (date: string) => date ? new Date(date).toLocaleString() : '-'
  }
];

export default function PurchaseOrdersList() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const params = useMemo(() => {
    const p: any = { limit: 50 };
    if (statusFilter) p.status = statusFilter;
    return p;
  }, [statusFilter]);

  const { data, isLoading } = useEntityList<any>('/purchase-orders', params);

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
          <Button icon={<EyeOutlined />} onClick={() => navigate(`/purchase-orders/${record.id}`)}>
            View
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3>Purchase Orders</h3>
        <Space>
          <Select 
            placeholder="Filter by status" 
            style={{ width: 150 }} 
            allowClear 
            onChange={(v) => setStatusFilter(v)}
            value={statusFilter}
          >
            <Option value="draft">Draft</Option>
            <Option value="confirmed">Confirmed</Option>
          </Select>
          <Input.Search placeholder="Search" onSearch={(v) => setQ(v)} style={{ width: 240 }} />
          <Link to="/purchase-orders/new">
            <Button type="primary" icon={<PlusOutlined />}>
              New
            </Button>
          </Link>
        </Space>
      </div>

      <Table 
        rowKey="id" 
        loading={isLoading} 
        dataSource={dataSource} 
        columns={cols} 
        pagination={{ pageSize: 10 }} 
      />
    </div>
  );
}
