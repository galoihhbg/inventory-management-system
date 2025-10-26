import React, { useEffect, useState } from 'react';
import { Card, Button, notification, Descriptions, Table, Space, Tag, Modal, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import client from '../../api/client';

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchaseOrder, setPurchaseOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchPurchaseOrder();
  }, [id]);

  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/purchase-orders/${id}`);
      const data = response.data?.purchaseOrder || response.data;
      setPurchaseOrder(data);
    } catch (err: any) {
      notification.error({ 
        message: 'Failed to fetch purchase order', 
        description: err?.response?.data?.message || err.message 
      });
      navigate('/purchase-orders');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      await client.post(`/purchase-orders/${id}/confirm`);
      notification.success({ message: 'Purchase order confirmed successfully' });
      setConfirmModalVisible(false);
      fetchPurchaseOrder();
    } catch (err: any) {
      notification.error({ 
        message: 'Failed to confirm purchase order', 
        description: err?.response?.data?.message || err.message 
      });
    } finally {
      setConfirming(false);
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
      title: 'Bin Location',
      key: 'binLocation',
      render: (_: any, record: any) => record.bin?.locationCode || '-'
    },
    {
      title: 'Warehouse',
      key: 'warehouse',
      render: (_: any, record: any) => record.bin?.warehouse?.name || '-'
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
        onOk={handleConfirm}
        confirmLoading={confirming}
        okText="Confirm"
      >
        <p>
          Are you sure you want to confirm this purchase order? This will update its status and create 
          inventory stock records for all items in their designated bin locations.
        </p>
      </Modal>
    </div>
  );
}
