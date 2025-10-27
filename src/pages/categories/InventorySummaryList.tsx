import React, { useState } from 'react';
import { Table, Input, Button, Space, Modal, Descriptions, notification } from 'antd';
import { EyeOutlined, SyncOutlined } from '@ant-design/icons';
import { useFilteredList, BaseFilter } from '../../api/hooks';
import client from '../../api/client';

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
  const { data, isLoading, filters, setFilter, goToPage, pagination, refetch } = 
    useFilteredList<InventorySummaryItem>({
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
        pagination={{
          current: filters.page as number || 1,
          pageSize: filters.limit as number || 20,
          total: pagination?.total || 0,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          onChange: (newPage) => goToPage(newPage)
        }}
      />

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