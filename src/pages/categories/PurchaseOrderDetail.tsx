import React, { useEffect, useState, useMemo } from 'react';
import { Card, Button, notification, Descriptions, Table, Space, Tag, Modal, Form, Select, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import client from '../../api/client';
import { useEntityList } from '../../api/hooks';
import { PurchaseOrder, Bin } from '../../types';

const { Option } = Select;

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmForm] = Form.useForm();

  const { data: binsData, isLoading: binsLoading } = useEntityList<Bin>('/bins', { limit: 200 });
  const bins = useMemo(() => binsData?.data || [], [binsData]);

  useEffect(() => {
    fetchPurchaseOrder();
  }, [id]);

  const fetchPurchaseOrder = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await client.get(`/purchase-orders/${id}`);
      const data = response.data?.purchaseOrder || response.data;
      setPurchaseOrder(data);
      return true;
    } catch (err: any) {
      notification.error({ 
        message: 'Failed to fetch purchase order', 
        description: err?.response?.data?.message || err.message 
      });
      navigate('/purchase-orders');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    const success = await fetchPurchaseOrder();
    if (success) {
      notification.success({ message: 'Data refreshed' });
    }
  };

  const handleConfirm = async (values: any) => {
    try {
      await client.post(`/purchase-orders/${id}/confirm`, {
        binId: values.binId
      });
      notification.success({ message: 'Purchase order confirmed successfully' });
      setConfirmModalVisible(false);
      fetchPurchaseOrder();
    } catch (err: any) {
      notification.error({ 
        message: 'Failed to confirm purchase order', 
        description: err?.response?.data?.message || err.message 
      });
    }
  };

  const itemColumns = [
    {
      title: 'Item Code',
      key: 'itemCode',
      render: (_: any, record: any) => record.item?.code || '-'
    },
    {
      title: 'Item Name',
      key: 'itemName',
      render: (_: any, record: any) => record.item?.name || '-'
    },
    {
      title: 'Quantity Ordered',
      dataIndex: 'quantityOrdered',
      key: 'quantityOrdered'
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price: number) => `$${price.toFixed(2)}`
    },
    {
      title: 'Total',
      key: 'total',
      render: (_: any, record: any) => `$${(record.quantityOrdered * record.unitPrice).toFixed(2)}`
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!purchaseOrder) {
    return <div>Purchase order not found</div>;
  }

  const totalAmount = (purchaseOrder.items || []).reduce(
    (sum: number, item: any) => sum + (item.quantityOrdered * item.unitPrice),
    0
  );

  return (
    <div>
      <Space className="mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/purchase-orders')}>
          Back
        </Button>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
          Refresh
        </Button>
        {purchaseOrder.purchaseOrderStatus === 'draft' && (
          <Button 
            type="primary" 
            icon={<CheckCircleOutlined />}
            onClick={() => setConfirmModalVisible(true)}
          >
            Confirm Order
          </Button>
        )}
      </Space>

      <Card title={`Purchase Order: ${purchaseOrder.code}`} className="mb-4">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID">{purchaseOrder.id}</Descriptions.Item>
          <Descriptions.Item label="Code">{purchaseOrder.code}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={purchaseOrder.purchaseOrderStatus === 'confirmed' ? 'green' : 'orange'}>
              {purchaseOrder.purchaseOrderStatus?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Order Date">
            {purchaseOrder.createdAt ? new Date(purchaseOrder.createdAt).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Confirmed At">
            {purchaseOrder.confirmedAt ? new Date(purchaseOrder.confirmedAt).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Creator">
            {purchaseOrder.creator ? 
              `${purchaseOrder.creator.username} (${purchaseOrder.creator.email})` : 
              '-'
            }
          </Descriptions.Item>
          <Descriptions.Item label="Partner" span={2}>
            {purchaseOrder.partner ? 
              `${purchaseOrder.partner.code} - ${purchaseOrder.partner.name}` : 
              '-'
            }
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Order Items">
        <Table
          dataSource={purchaseOrder.items || []}
          columns={itemColumns}
          rowKey="id"
          pagination={false}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4}>
                <strong>Total Amount</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <strong>${totalAmount.toFixed(2)}</strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>

      <Modal
        title="Confirm Purchase Order"
        open={confirmModalVisible}
        onCancel={() => setConfirmModalVisible(false)}
        footer={null}
      >
        <Form form={confirmForm} layout="vertical" onFinish={handleConfirm}>
          <p className="mb-4">
            Confirming this purchase order will update its status and create inventory stock records 
            for all items in the selected bin location.
          </p>
          
          <Form.Item
            name="binId"
            label="Select Bin Location"
            rules={[{ required: true, message: 'Please select a bin location' }]}
          >
            <Select 
              placeholder="Select bin location" 
              loading={binsLoading}
              showSearch
              filterOption={(input, option: any) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {bins.map((b) => (
                <Option key={b.id} value={b.id}>
                  {b.locationCode} - {b.warehouse?.name || `Warehouse ${b.warehouseId}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setConfirmModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Confirm
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
