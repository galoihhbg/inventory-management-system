import React from 'react';
import { Button, Table, Space, Input, Select, Tag } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useFilteredList, BaseFilter } from '../../api/hooks';

const { Option } = Select;

interface PurchaseOrderFilter extends BaseFilter {
  status?: string;
}

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
    dataIndex: 'purchaseOrderStatus',
    key: 'status',
    render: (status: string) => {
      const color = status === 'confirmed' ? 'green' : 'orange';
      return <Tag color={color}>{status?.toUpperCase()}</Tag>;
    }
  },
  { 
    title: 'Order Date', 
    dataIndex: 'createdAt', 
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
  const navigate = useNavigate();

  const { data, isLoading, filters, setFilter } = useFilteredList<any, PurchaseOrderFilter>({
    endpoint: '/purchase-orders',
    initialFilters: { limit: 50 }
  });

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
            onChange={(v) => setFilter('status', v)}
            value={filters.status}
          >
            <Option value="draft">Draft</Option>
            <Option value="confirmed">Confirmed</Option>
          </Select>
          <Input.Search 
            placeholder="Search" 
            onSearch={(v) => setFilter('search', v)} 
            onChange={(e) => !e.target.value && setFilter('search', '')}
            allowClear
            style={{ width: 240 }} 
          />
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
        dataSource={data} 
        columns={cols} 
        pagination={{ pageSize: 10 }} 
      />
    </div>
  );
}
