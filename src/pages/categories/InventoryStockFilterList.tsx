import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Space, Card, Descriptions, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { useFilteredList, BaseFilter } from '../../api/hooks';

type InventoryStockFilterItem = {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  binId: number;
  binLocationCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchaseOrderItemId?: number;
  receivedAt?: string;
  warehouseId?: number;
  warehouseName?: string;
  status?: string;
};

interface InventoryStockCustomFilter extends BaseFilter {
  itemId?: number;
  binId?: number;
  warehouseId?: number;
  status?: string;
}

export default function InventoryStockFilterList() {
  const [searchParams] = useSearchParams();
  const [selectedRecord, setSelectedRecord] = useState<InventoryStockFilterItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Fetch dropdown options
  const { data: itemsData } = useFilteredList<any>({
    endpoint: '/items',
    initialFilters: { limit: 200 }
  });
  const { data: binsData } = useFilteredList<any>({
    endpoint: '/bins',
    initialFilters: { limit: 200 }
  });
  const { data: warehousesData } = useFilteredList<any>({
    endpoint: '/warehouses',
    initialFilters: { limit: 100 }
  });

  // Initialize filter values from URL
  const getInitialFilters = (): InventoryStockCustomFilter => {
    const itemIdParam = searchParams.get('itemId');
    const binIdParam = searchParams.get('binId');
    const warehouseIdParam = searchParams.get('warehouseId');
    const statusParam = searchParams.get('status');
    
    return {
      limit: 10,
      ...(itemIdParam && { itemId: parseInt(itemIdParam) }),
      ...(binIdParam && { binId: parseInt(binIdParam) }),
      ...(warehouseIdParam && { warehouseId: parseInt(warehouseIdParam) }),
      ...(statusParam && { status: statusParam })
    };
  };

  // Fetch inventory stock data with filters
  const { data, isLoading, filters, setFilter, setFilters, resetFilters, pagination } = 
    useFilteredList<InventoryStockFilterItem, InventoryStockCustomFilter>({
      endpoint: '/inventory-stock/filter',
      initialFilters: getInitialFilters(),
      syncWithUrl: true
    });

  const handleViewDetail = (record: InventoryStockFilterItem) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id', 
      width: 80 
    },
    { 
      title: 'Item Code', 
      dataIndex: 'itemCode', 
      key: 'itemCode', 
      width: 120 
    },
    { 
      title: 'Item Name', 
      dataIndex: 'itemName', 
      key: 'itemName' 
    },
    { 
      title: 'Bin Location', 
      dataIndex: 'binLocationCode', 
      key: 'binLocationCode', 
      width: 120 
    },
    { 
      title: 'Quantity', 
      dataIndex: 'quantity', 
      key: 'quantity', 
      width: 100,
      align: 'right' as const
    },
    { 
      title: 'Unit Price', 
      dataIndex: 'unitPrice', 
      key: 'unitPrice', 
      width: 120,
      align: 'right' as const,
      render: (value: number) => `$${value?.toFixed(2) || '0.00'}`
    },
    { 
      title: 'Total Price', 
      dataIndex: 'totalPrice', 
      key: 'totalPrice', 
      width: 120,
      align: 'right' as const,
      render: (value: number) => `$${value?.toFixed(2) || '0.00'}`
    },
    { 
      title: 'Received At', 
      dataIndex: 'receivedAt', 
      key: 'receivedAt', 
      width: 130,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: InventoryStockFilterItem) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            View
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="mb-4">
        <h3>Inventory Stock - Detailed View</h3>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <p className="text-sm text-gray-600 mb-4">Filters are applied automatically as you change them.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Item</label>
            <Select
              placeholder="Select Item"
              style={{ width: '100%' }}
              allowClear
              showSearch
              value={filters.itemId}
              onChange={(value) => setFilter('itemId', value)}
              filterOption={(input, option: any) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {(itemsData || []).map((item: any) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.code} - {item.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Bin</label>
            <Select
              placeholder="Select Bin"
              style={{ width: '100%' }}
              allowClear
              showSearch
              value={filters.binId}
              onChange={(value) => setFilter('binId', value)}
              filterOption={(input, option: any) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {(binsData || []).map((bin: any) => (
                <Select.Option key={bin.id} value={bin.id}>
                  {bin.locationCode}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Warehouse</label>
            <Select
              placeholder="Select Warehouse"
              style={{ width: '100%' }}
              allowClear
              value={filters.warehouseId}
              onChange={(value) => setFilter('warehouseId', value)}
            >
              {(warehousesData || []).map((wh: any) => (
                <Select.Option key={wh.id} value={wh.id}>
                  {wh.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Status</label>
            <Input
              placeholder="Status"
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value)}
              allowClear
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={resetFilters}>Reset Filters</Button>
        </div>
      </Card>

      {/* Results Table */}
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data}
        columns={columns}
        pagination={false}
      />

      {/* Pagination Info and Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-600">
            Page {pagination?.page || 1} | Total: {pagination?.total || 0} records
          </span>
        </div>
        <Space>
          <Button 
            onClick={() => setFilter('cursor', '')} 
            disabled={!filters.cursor}
          >
            First Page
          </Button>
          <Button 
            type="primary"
            onClick={() => pagination?.nextCursor && setFilter('cursor', pagination.nextCursor)} 
            disabled={!pagination?.nextCursor}
          >
            Next
          </Button>
        </Space>
      </div>

      {/* Detail Modal */}
      <Modal
        title="Inventory Stock Detail"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedRecord && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Stock ID">{selectedRecord.id}</Descriptions.Item>
            <Descriptions.Item label="Item ID">{selectedRecord.itemId}</Descriptions.Item>
            <Descriptions.Item label="Item Code">{selectedRecord.itemCode}</Descriptions.Item>
            <Descriptions.Item label="Item Name">{selectedRecord.itemName}</Descriptions.Item>
            <Descriptions.Item label="Bin ID">{selectedRecord.binId}</Descriptions.Item>
            <Descriptions.Item label="Bin Location">{selectedRecord.binLocationCode}</Descriptions.Item>
            <Descriptions.Item label="Quantity">{selectedRecord.quantity}</Descriptions.Item>
            <Descriptions.Item label="Unit Price">${selectedRecord.unitPrice?.toFixed(2) || '0.00'}</Descriptions.Item>
            <Descriptions.Item label="Total Price">${selectedRecord.totalPrice?.toFixed(2) || '0.00'}</Descriptions.Item>
            {selectedRecord.receivedAt && (
              <Descriptions.Item label="Received At" span={2}>
                {new Date(selectedRecord.receivedAt).toLocaleString()}
              </Descriptions.Item>
            )}
            {selectedRecord.purchaseOrderItemId && (
              <Descriptions.Item label="Purchase Order Item ID" span={2}>
                {selectedRecord.purchaseOrderItemId}
              </Descriptions.Item>
            )}
            {selectedRecord.warehouseId && (
              <Descriptions.Item label="Warehouse ID">{selectedRecord.warehouseId}</Descriptions.Item>
            )}
            {selectedRecord.warehouseName && (
              <Descriptions.Item label="Warehouse Name">{selectedRecord.warehouseName}</Descriptions.Item>
            )}
            {selectedRecord.status && (
              <Descriptions.Item label="Status" span={2}>{selectedRecord.status}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
