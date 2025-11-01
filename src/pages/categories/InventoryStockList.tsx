import React from 'react';
import { Table, Input, Select, Button } from 'antd';
import { useFilteredList } from '../../api/hooks';
import { useNavigate } from 'react-router-dom';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { BaseFilter } from '../../types';
import Pagination from '../../components/Pagination';

type InventoryStockItem = {
  itemId: number;
  itemCode: string;
  itemName: string;
  totalQuantity: number;
  totalBins: number;
  averageUnitPrice: number;
  totalValue: number;
  bins: {
    binId: number;
    binLocationCode: string;
    quantity: number;
  }[];
};

interface InventoryStockFilter extends BaseFilter {
  warehouseId?: number;
}

export default function InventoryStockList() {
  const navigate = useNavigate();
  
  // Fetch warehouses for the filter dropdown
  const { data: warehousesData } = useFilteredList<any>({
    endpoint: '/warehouses',
    initialFilters: { limit: 100 }
  });

  // Fetch inventory stock data
  const { 
    data, 
    isLoading, 
    isFetching,
    filters, 
    setFilter, 
    pagination,
    refetch 
  } = useFilteredList<InventoryStockItem, InventoryStockFilter>({
    endpoint: '/inventory-stock/items/aggregation',
    initialFilters: { limit: 20, page: 1 }
  });

  const columns = [
    { title: 'Item ID', dataIndex: 'itemId', key: 'itemId', width: 100 },
    { title: 'Item Code', dataIndex: 'itemCode', key: 'itemCode', width: 150 },
    { title: 'Item Name', dataIndex: 'itemName', key: 'itemName' },
    { 
      title: 'Total Quantity', 
      dataIndex: 'totalQuantity', 
      key: 'totalQuantity', 
      width: 120,
      align: 'right' as const
    },
    { 
      title: 'Total Bins', 
      dataIndex: 'totalBins', 
      key: 'totalBins', 
      width: 100,
      align: 'right' as const
    },
    { 
      title: 'Avg Unit Price', 
      dataIndex: 'averageUnitPrice', 
      key: 'averageUnitPrice', 
      width: 130,
      align: 'right' as const,
      render: (value: number) => `$${value?.toFixed(2) || '0.00'}`
    },
    { 
      title: 'Total Value', 
      dataIndex: 'totalValue', 
      key: 'totalValue', 
      width: 130,
      align: 'right' as const,
      render: (value: number) => `$${value?.toLocaleString() || '0'}`
    }
  ];

  const handleRowClick = (record: InventoryStockItem) => {
    // Navigate to filter page with the itemId pre-filled
    navigate(`/inventory-stock/filter?itemId=${record.itemId}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3>Inventory Stock - Aggregated View</h3>
        <div className="flex gap-2">
          <Select
            placeholder="Select Warehouse"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => setFilter('warehouseId', value)}
            value={filters.warehouseId}
            options={[
              { label: 'All Warehouses', value: undefined },
              ...(warehousesData || []).map((wh: any) => ({
                label: wh.name,
                value: wh.id
              }))
            ]}
          />
          <Input.Search
            placeholder="Search by code or name"
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
          <Button 
            type="primary" 
            icon={<FilterOutlined />}
            onClick={() => navigate('/inventory-stock/filter')}
          >
            Detailed View
          </Button>
        </div>
      </div>

      <Table
        rowKey="itemId"
        loading={isLoading}
        dataSource={data}
        columns={columns}
        pagination={false}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' }
        })}
      />
      
      {pagination && (
        <div className="mt-4">
          <Pagination
            current={pagination.page || filters.page || 1}
            pageSize={pagination.limit || filters.limit || 20}
            total={pagination.total || 0}
            onChange={(page: number, pageSize: number) => {
              setFilter('page', page);
              setFilter('limit', pageSize);
            }}
          />
        </div>
      )}
    </div>
  );
}
