import React, { useEffect, useState } from 'react';
import { Card, Button, notification, Descriptions, Table, Space, Tag, Modal, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import client from '../../../api/client';

export default function SalesOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [salesOrder, setSalesOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchSalesOrder();
  }, [id]);

  const fetchSalesOrder = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/sales-orders/${id}`);
      const data = response.data?.salesOrder || response.data;
      setSalesOrder(data);
    } catch (err: any) {
      notification.error({ 
        message: 'Failed to fetch sales order', 
        description: err?.response?.data?.message || err.message 
      });
      navigate('/sales-orders');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      await client.post(`/sales-orders/${id}/confirm`, {});
      notification.success({ message: 'Sales order confirmed successfully' });
      setConfirmModalVisible(false);
      fetchSalesOrder();
    } catch (err: any) {
      notification.error({ 
        message: 'Failed to confirm sales order', 
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
      render: (_: any, record: any) => record.bin?.code || record.bin?.locationCode || '-'
    },
    {
      title: salesOrder?.salesOrderStatus === 'confirmed' ? 'Stock at Confirmation' : 'Current Stock',
      key: 'currentStock',
      align: 'right' as const,
      render: (_: any, record: any) => {
        const stockValue = record.currentStock;
        const isConfirmed = salesOrder?.salesOrderStatus === 'confirmed';
        
        return (
          <div>
            <span className="text-blue-600">
              {stockValue !== undefined && stockValue !== null ? stockValue.toLocaleString() : '-'}
            </span>
            {isConfirmed && (
              <div className="text-xs text-gray-500">
                (At confirmation)
              </div>
            )}
            {!isConfirmed && (
              <div className="text-xs text-green-600">
                (Real-time)
              </div>
            )}
          </div>
        );
      }
    },
    {
      title: 'Quantity Ordered',
      dataIndex: 'quantityOrdered',
      key: 'quantityOrdered',
      align: 'right' as const
    },
    {
      title: 'Remaining Stock',
      key: 'remainingQuantity',
      align: 'right' as const,
      render: (_: any, record: any) => {
        const remaining = record.remainingQuantity !== undefined ? record.remainingQuantity : 
                         (record.currentStock || 0) - (record.quantityOrdered || 0);
        
        return (
          <div>
            <span className={remaining < 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
              {remaining.toLocaleString()}
            </span>
          </div>
        );
      }
    },
    {
      title: 'Selling Price',
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      align: 'right' as const,
      render: (price: number) => `$${price.toFixed(2)}`
    },
    {
      title: 'Cost Price',
      dataIndex: 'costPrice',
      key: 'costPrice',
      align: 'right' as const,
      render: (price: number, record: any) => 
        record.autoCalculateCost ? 'Auto' : (price ? `$${price.toFixed(2)}` : '-')
    },
    {
      title: 'Total',
      key: 'total',
      align: 'right' as const,
      render: (_: any, record: any) => `$${(record.quantityOrdered * record.sellingPrice).toFixed(2)}`
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!salesOrder) {
    return <div>Sales order not found</div>;
  }

  const totalAmount = (salesOrder.items || []).reduce(
    (sum: number, item: any) => sum + (item.quantityOrdered * item.sellingPrice),
    0
  );

  return (
    <div>
      <Space className="mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/sales-orders')}>
          Back
        </Button>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchSalesOrder}
          loading={loading}
          title="Refresh"
        >
          Refresh
        </Button>
        {salesOrder.salesOrderStatus === 'draft' && (
          <Button 
            type="primary" 
            icon={<CheckCircleOutlined />}
            onClick={() => setConfirmModalVisible(true)}
          >
            Confirm Order
          </Button>
        )}
      </Space>

      <Card title={`Sales Order: ${salesOrder.code}`} className="mb-4">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID">{salesOrder.id}</Descriptions.Item>
          <Descriptions.Item label="Code">{salesOrder.code}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={salesOrder.salesOrderStatus === 'confirmed' ? 'green' : 'orange'}>
              {salesOrder.salesOrderStatus?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Order Date">
            {salesOrder.orderDate ? new Date(salesOrder.orderDate).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Confirmed At">
            {salesOrder.confirmedAt ? new Date(salesOrder.confirmedAt).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Creator">
            {salesOrder.creator ? 
              `${salesOrder.creator.firstName || ''} ${salesOrder.creator.lastName || ''} (${salesOrder.creator.email})`.trim() : 
              '-'
            }
          </Descriptions.Item>
          <Descriptions.Item label="Customer" span={2}>
            {salesOrder.partner ? 
              `${salesOrder.partner.code} - ${salesOrder.partner.name}` : 
              '-'
            }
          </Descriptions.Item>
          <Descriptions.Item label="Warehouse" span={2}>
            {salesOrder.warehouse ? 
              `${salesOrder.warehouse.code} - ${salesOrder.warehouse.name}` : 
              '-'
            }
          </Descriptions.Item>
          {salesOrder.description && (
            <Descriptions.Item label="Description" span={2}>
              {salesOrder.description}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title="Order Items">
        {/* Stock Information Notice */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-sm">
            <strong>📊 Stock Information:</strong>
            {salesOrder.salesOrderStatus === 'confirmed' ? (
              <span className="text-blue-700">
                {" "}Stock values shown are <strong>snapshots from confirmation time</strong> ({salesOrder.confirmedAt ? new Date(salesOrder.confirmedAt).toLocaleString() : 'N/A'})
              </span>
            ) : (
              <span className="text-green-700">
                {" "}Stock values shown are <strong>real-time current stock levels</strong>
              </span>
            )}
          </div>
        </div>

        <Table
          dataSource={salesOrder.items || []}
          columns={itemColumns}
          rowKey="id"
          pagination={false}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={8}>
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
        title="Confirm Sales Order"
        open={confirmModalVisible}
        onOk={handleConfirm}
        onCancel={() => setConfirmModalVisible(false)}
        confirmLoading={confirming}
        okText="Confirm Order"
        cancelText="Cancel"
      >
        <p className="mb-4">
          Confirming this sales order will:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Update the order status to "confirmed"</li>
          <li>Reduce inventory stock by the ordered quantities</li>
          <li>Process the shipment from the selected bins</li>
        </ul>
        <p className="font-semibold text-red-600">
          This action cannot be undone. Are you sure you want to proceed?
        </p>
      </Modal>
    </div>
  );
}
