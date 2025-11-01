import React from 'react';
import { Button, Table, Space, Input, Select, Tag } from 'antd';
import { PlusOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useFilteredList } from '../../api/hooks';
import { PurchaseOrderFilter } from '../../types';
import Pagination from '../../components/Pagination';

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

  const { 
    data, 
    isLoading, 
    isFetching,
    filters, 
    setFilter, 
    pagination,
    refetch 
  } = useFilteredList<any, PurchaseOrderFilter>({
    endpoint: '/purchase-orders',
    initialFilters: { limit: 20, page: 1 }
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

  const handlePaginationChange = (page: number, pageSize: number) => {
    setFilter('page', page);
    setFilter('limit', pageSize);
  };

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
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => refetch()}
            loading={isFetching}
            title="Refresh"
          >
            Refresh
          </Button>
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
        pagination={false}
      />
      
      {pagination && (
        <div className="mt-4">
          <Pagination
            current={pagination.page || filters.page || 1}
            pageSize={pagination.limit || filters.limit || 20}
            total={pagination.total || 0}
            onChange={handlePaginationChange}
          />
        </div>
      )}
    </div>
  );
}
