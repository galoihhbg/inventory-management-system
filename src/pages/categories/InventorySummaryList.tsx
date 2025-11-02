import React, { useState } from 'react';
import { Table, Input, Button, Space, Modal, Descriptions, notification } from 'antd';
import { EyeOutlined, SyncOutlined, ReloadOutlined } from '@ant-design/icons';
import { useFilteredList } from '../../api/hooks';
import { BaseFilter } from '../../types';
import client from '../../api/client';
import Pagination from '../../components/Pagination';

type InventorySummaryItem = {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  currentStock: number;
  pendingIn: number;
  pendingOut: number;
  totalStock: number;
};

export default function InventorySummaryList() {
  const [selectedRecord, setSelectedRecord] = useState<InventorySummaryItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Fetch inventory summary data with pagination
  const { 
    data, 
    isLoading, 
    isFetching,
    filters, 
    setFilter, 
    pagination, 
    refetch 
  } = useFilteredList<InventorySummaryItem>({
      endpoint: '/inventory-summary',
      initialFilters: { limit: 20, page: 1 }
    });

  // Sync inventory summary
  const handleSync = async () => {
    try {
      await client.post('/inventory-summary/sync');
      notification.success({ message: 'Inventory summary synced successfully' });
      refetch();
    } catch (err: any) {
      notification.error({
        message: 'Sync failed',
        description: err?.response?.data?.message || err.message
      });
    }
  };

  // View detail for a specific item
  const handleViewDetail = async (record: InventorySummaryItem) => {
    try {
      const res = await client.get(`/inventory-summary/item/${record.itemId}`);
      const detailData = res.data?.data || res.data;
      setSelectedRecord({
        ...record,
        ...detailData
      });
      setDetailModalVisible(true);
    } catch (err: any) {
      notification.error({
        message: 'Failed to fetch item detail',
        description: err?.response?.data?.message || err.message
      });
    }
  };

  const columns = [
    {
      title: 'Item ID',
      dataIndex: 'itemId',
      key: 'itemId',
      width: 100
    },
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 150
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName'
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouseCode',
      key: 'warehouseCode'
    },
    {
      title: 'Current Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 120,
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 0
    },
    {
      title: 'Pending In',
      dataIndex: 'pendingIn',
      key: 'pendingIn',
      width: 120,
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 0
    },
    {
      title: 'Pending Out',
      dataIndex: 'pendingOut',
      key: 'pendingOut',
      width: 120,
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 0
    },
    {
      title: 'Total Stock',
      dataIndex: 'totalStock',
      key: 'totalStock',
      width: 120,
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 0
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: InventorySummaryItem) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Detail
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3>Inventory Summary</h3>
        <Space>
          <Input.Search
            placeholder="Search by item code or name"
            onSearch={(v) => setFilter('search', v)}
            onChange={(e) => !e.target.value && setFilter('search', '')}
            allowClear
            style={{ width: 300 }}
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
            icon={<SyncOutlined />}
            onClick={handleSync}
          >
            Sync Summary
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data}
        columns={columns}
        pagination={false}
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

      {/* Detail Modal */}
      <Modal
        title="Inventory Summary Detail"
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
            <Descriptions.Item label="Summary ID">{selectedRecord.id}</Descriptions.Item>
            <Descriptions.Item label="Item ID">{selectedRecord.itemId}</Descriptions.Item>
            <Descriptions.Item label="Item Code">{selectedRecord.itemCode}</Descriptions.Item>
            <Descriptions.Item label="Item Name">{selectedRecord.itemName}</Descriptions.Item>
            <Descriptions.Item label="Current Stock" span={2}>
              <span className="text-green-600 font-semibold">
                {selectedRecord.currentStock?.toLocaleString() || 0}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Pending In">
              <span className="text-blue-600">
                {selectedRecord.pendingIn?.toLocaleString() || 0}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Pending Out">
              <span className="text-orange-600">
                {selectedRecord.pendingOut?.toLocaleString() || 0}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Total Stock" span={2}>
              <span className="text-lg font-bold">
                {selectedRecord.totalStock?.toLocaleString() || 0}
              </span>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}