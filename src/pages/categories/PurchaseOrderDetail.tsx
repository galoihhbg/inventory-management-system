import React, { useEffect, useState, useMemo } from 'react';
import { Card, Button, notification, Descriptions, Table, Space, Tag, Modal, Form, Select, Spin, InputNumber } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import client from '../../api/client';
import { useEntityList } from '../../api/hooks';
import { PurchaseOrder, Bin, ApiError } from '../../types';

const { Option } = Select;

export default function PurchaseOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [purchaseOrder, setPurchaseOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmForm] = Form.useForm();
  const [confirmItems, setConfirmItems] = useState<Record<string, unknown>[]>([]);

  const { 
    data: binsData, 
    isLoading: binsLoading,
    refetch: refetchBins 
  } = useEntityList<Bin>('/bins', { limit: 200 });
  
  const bins = useMemo(() => binsData?.data || [], [binsData]);

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

  const handleConfirm = async (values: any) => {
    try {
      // Validate that all items have actual quantities and bins set
      const itemsToConfirm = confirmItems.map(item => ({
        purchaseOrderItemId: item.id,
        actualQuantity: item.actualQuantity || item.quantityOrdered,
        binId: item.binId || item.originalBinId
      }));

      if (itemsToConfirm.some((item: any) => !item.binId || (item.actualQuantity as number) <= 0)) {
        notification.error({ message: 'Please set bin location and actual quantity for all items' });
        return;
      }

      await client.post(`/purchase-orders/${id}/confirm`, {
        items: itemsToConfirm
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
      key: 'quantityOrdered',
      align: 'right' as const
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right' as const,
      render: (price: number) => `$${price.toFixed(2)}`
    },
    {
      title: 'Total',
      key: 'total',
      align: 'right' as const,
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
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchPurchaseOrder}
          loading={loading}
          title="Refresh"
        >
          Refresh
        </Button>
        {purchaseOrder.purchaseOrderStatus === 'draft' && (
          <Button 
            type="primary" 
            icon={<CheckCircleOutlined />}
            onClick={() => {
              // Initialize confirm items with original data
              const items = (purchaseOrder.items || []).map((item: any) => ({
                ...item,
                actualQuantity: item.quantityOrdered,
                originalBinId: item.binId
              }));
              setConfirmItems(items);
              setConfirmModalVisible(true);
            }}
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
          
          {/* Delivery Information */}
          {purchaseOrder.items && purchaseOrder.items.length > 0 && purchaseOrder.items[0].bin && (
            <>
              <Descriptions.Item label="Delivery Warehouse">
                {purchaseOrder.items[0].bin.warehouse?.name || 
                 `Warehouse ${purchaseOrder.items[0].bin.warehouseId}`}
              </Descriptions.Item>
              <Descriptions.Item label="Delivery Bin">
                {purchaseOrder.items[0].bin.locationCode}
                {purchaseOrder.items[0].bin.isReceivingBin && 
                  <Tag color="green" className="ml-2">Receiving Bin</Tag>
                }
              </Descriptions.Item>
              <Descriptions.Item label="Bin Description" span={2}>
                {purchaseOrder.items[0].bin.description || '-'}
              </Descriptions.Item>
            </>
          )}
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
        width={800}
      >
        <Form form={confirmForm} layout="vertical" onFinish={handleConfirm}>
          <p className="mb-4">
            Confirming this purchase order will update its status and create inventory stock records. 
            You can adjust the actual quantity received and bin location for each item below.
          </p>
          
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Items to Confirm</h4>
            <Table
              dataSource={confirmItems}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Item',
                  key: 'item',
                  render: (_: any, record: any) => (
                    <div>
                      <div className="font-medium">{record.item?.name || 'Unknown Item'}</div>
                      <div className="text-xs text-gray-500">{record.item?.code}</div>
                    </div>
                  )
                },
                {
                  title: 'Ordered Qty',
                  dataIndex: 'quantityOrdered',
                  key: 'quantityOrdered',
                  width: 100
                },
                {
                  title: 'Actual Qty',
                  key: 'actualQuantity',
                  width: 120,
                  render: (_: any, record: any, index: number) => (
                    <InputNumber
                      min={0}
                      value={record.actualQuantity}
                      onChange={(value) => {
                        const newItems = [...confirmItems];
                        newItems[index].actualQuantity = value || 0;
                        setConfirmItems(newItems);
                      }}
                      style={{ width: '100%' }}
                    />
                  )
                },
                {
                  title: 'Bin Location',
                  key: 'binId',
                  width: 200,
                  render: (_: any, record: any, index: number) => (
                    <Select
                      value={record.binId || record.originalBinId}
                      onChange={(value) => {
                        const newItems = [...confirmItems];
                        newItems[index].binId = value;
                        setConfirmItems(newItems);
                      }}
                      placeholder="Select bin"
                      loading={binsLoading}
                      showSearch
                      style={{ width: '100%' }}
                      filterOption={(input, option: any) =>
                        option?.children?.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {bins.map((b: any) => (
                        <Option key={b.id} value={b.id}>
                          {b.locationCode}
                        </Option>
                      ))}
                    </Select>
                  )
                }
              ]}
            />
          </div>

          <Form.Item>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setConfirmModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Confirm Purchase Order
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
