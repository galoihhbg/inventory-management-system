import React, { useMemo, useState } from 'react';
import { Table, Input, Select, Button } from 'antd';
import { useEntityList } from '../../api/hooks';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FilterOutlined } from '@ant-design/icons';
import client from '../../api/client';

type InventoryStockItem = {
  itemId: number;
  itemCode: string;
  itemName: string;
  totalQuantity: number;
  totalValue: number;
};

type InventoryStockResponse = {
  data: InventoryStockItem[];
  pagination: {
    limit: number;
    nextCursor: string;
    page: number;
    total: number;
  };
};

export default function InventoryStockList() {
  const navigate = useNavigate();
  const [warehouseId, setWarehouseId] = useState<number | undefined>(undefined);
  const [searchText, setSearchText] = useState('');

  // Fetch warehouses for the filter dropdown
  const { data: warehousesData } = useEntityList<any>('/warehouses', { limit: 100 });

  // Fetch inventory stock data
  const { data, isLoading } = useQuery<InventoryStockResponse>({
    queryKey: ['/inventory-stock/items/aggregation', warehouseId],
    queryFn: async () => {
      const params: any = { limit: 50 };
      if (warehouseId !== undefined) {
        params.warehouseId = warehouseId;
      }
      const res = await client.get('/inventory-stock/items/aggregation', { params });
      return res.data;
    }
  });

  const dataSource = useMemo(() => {
    const rows = data?.data || [];
    if (searchText.trim()) {
      return rows.filter((r: InventoryStockItem) =>
        (r.itemCode + r.itemName).toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return rows;
  }, [data, searchText]);

  const columns = [
    { title: 'Item ID', dataIndex: 'itemId', key: 'itemId', width: 100 },
    { title: 'Item Code', dataIndex: 'itemCode', key: 'itemCode', width: 150 },
    { title: 'Item Name', dataIndex: 'itemName', key: 'itemName' },
    { 
      title: 'Total Quantity', 
      dataIndex: 'totalQuantity', 
      key: 'totalQuantity', 
      width: 150,
      align: 'right' as const
    },
    { 
      title: 'Total Value', 
      dataIndex: 'totalValue', 
      key: 'totalValue', 
      width: 150,
      align: 'right' as const,
      render: (value: number) => value.toLocaleString()
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
            onChange={(value) => setWarehouseId(value)}
            options={[
              { label: 'All Warehouses', value: undefined },
              ...(warehousesData?.data || []).map((wh: any) => ({
                label: wh.name,
                value: wh.id
              }))
            ]}
          />
          <Input.Search
            placeholder="Search by code or name"
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 240 }}
          />
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
        dataSource={dataSource}
        columns={columns}
        pagination={{ pageSize: 10, total: data?.pagination?.total }}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' }
        })}
      />
    </div>
  );
}
