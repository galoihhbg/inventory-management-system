import React, { useState, useMemo } from 'react';
import { Card, Form, Button, notification, Select, InputNumber, Table, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEntityList } from '../../api/hooks';
import client from '../../api/client';

const { Option } = Select;

type OrderItem = {
  key: string;
  itemId: number;
  itemName?: string;
  quantityOrdered: number;
  unitPrice: number;
  currentStock?: number;
  newStock?: number;
};

export default function PurchaseOrderForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedBinId, setSelectedBinId] = useState<number | undefined>(undefined);
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [currentItemStock, setCurrentItemStock] = useState<number>(0);

  const { data: partnersData, isLoading: partnersLoading } = useEntityList<any>('/partners', { limit: 200 });
  const partners = useMemo(() => partnersData?.data || [], [partnersData]);

  const { data: itemsData, isLoading: itemsLoading } = useEntityList<any>('/items', { limit: 200 });
  const availableItems = useMemo(() => itemsData?.data || [], [itemsData]);

  const { data: binsData, isLoading: binsLoading } = useEntityList<any>('/bins', { limit: 200 });
  const availableBins = useMemo(() => binsData?.data || [], [binsData]);

  // Fetch current stock for selected item
  const fetchItemStock = async (itemId: number) => {
    try {
      const res = await client.get(`/inventory-summary/item/${itemId}`);
      const stockData = res.data?.data || res.data;
      setCurrentItemStock(stockData?.currentStock || 0);
    } catch (err) {
      setCurrentItemStock(0);
    }
  };

  const handleAddItem = async () => {
    if (!selectedItemId || quantity <= 0 || unitPrice < 0) {
      notification.warning({ message: 'Please select an item, quantity, and unit price' });
      return;
    }

    const item = availableItems.find((i: any) => i.id === selectedItemId);
    const newItem: OrderItem = {
      key: `${selectedItemId}-${Date.now()}`,
      itemId: selectedItemId,
      itemName: item?.name || `Item ${selectedItemId}`,
      quantityOrdered: quantity,
      unitPrice: unitPrice,
      currentStock: currentItemStock,
      newStock: currentItemStock + quantity
    };

    setItems([...items, newItem]);
    setSelectedItemId(undefined);
    setQuantity(1);
    setUnitPrice(0);
    setCurrentItemStock(0);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  const onFinish = async (values: any) => {
    if (items.length === 0) {
      notification.error({ message: 'Please add at least one item to the order' });
      return;
    }

    if (!selectedBinId) {
      notification.error({ message: 'Please select a bin location for this order' });
      return;
    }

    try {
      const payload = {
        partnerId: values.partnerId,
        items: items.map(item => ({
          itemId: item.itemId,
          quantityOrdered: item.quantityOrdered,
          unitPrice: item.unitPrice,
          binId: selectedBinId
        }))
      };

      const response = await client.post('/purchase-orders', payload);
      notification.success({ message: 'Purchase order created successfully' });
      navigate('/purchase-orders');
    } catch (err: any) {
      notification.error({ 
        message: 'Failed to create purchase order', 
        description: err?.response?.data?.message || err.message 
      });
    }
  };

  const itemColumns = [
    {
      title: 'Item',
      dataIndex: 'itemName',
      key: 'itemName'
    },
    {
      title: 'Current Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      align: 'right' as const,
      render: (stock: number) => stock?.toLocaleString() || 0
    },
    {
      title: 'Order Qty',
      dataIndex: 'quantityOrdered',
      key: 'quantityOrdered',
      align: 'right' as const
    },
    {
      title: 'New Stock',
      dataIndex: 'newStock',
      key: 'newStock',
      align: 'right' as const,
      render: (stock: number) => (
        <span className="text-green-600 font-semibold">
          {stock?.toLocaleString() || 0}
        </span>
      )
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
      render: (_: any, record: OrderItem) => `$${(record.quantityOrdered * record.unitPrice).toFixed(2)}`
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: OrderItem) => (
        <Button 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveItem(record.key)}
        />
      )
    }
  ];

  return (
    <Card title="New Purchase Order">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item 
          name="partnerId" 
          label="Partner" 
          rules={[{ required: true, message: 'Partner required' }]}
        >
          <Select 
            placeholder="Select partner" 
            loading={partnersLoading}
            showSearch
            filterOption={(input, option: any) =>
              option?.children?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {partners.map((p: any) => (
              <Option key={p.id} value={p.id}>
                {p.code ? `${p.code} - ${p.name}` : p.name || `Partner ${p.id}`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Bin Selection - Once for entire order */}
        <Card title="Delivery Information" className="mb-4">
          <Form.Item 
            name="binId" 
            label="Delivery Bin Location" 
            rules={[{ required: true, message: 'Please select delivery bin location' }]}
          >
            <Select
              placeholder="Select bin location for this order"
              value={selectedBinId}
              onChange={(value) => {
                setSelectedBinId(value);
                form.setFieldsValue({ binId: value });
              }}
              style={{ width: '100%' }}
              loading={binsLoading}
              showSearch
              filterOption={(input, option: any) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {availableBins.map((bin: any) => (
                <Option key={bin.id} value={bin.id}>
                  {bin.locationCode} - {bin.description || 'No description'}
                  {bin.isReceivingBin && <span className="text-green-600 ml-2">(Receiving)</span>}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Card>

        <Card title="Order Items" className="mb-4">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block mb-1 text-sm">Item</label>
                <Select
                  placeholder="Select item"
                  value={selectedItemId}
                  onChange={(itemId) => {
                    setSelectedItemId(itemId);
                    if (itemId) {
                      fetchItemStock(itemId);
                    }
                  }}
                  style={{ width: '100%' }}
                  loading={itemsLoading}
                  showSearch
                  filterOption={(input, option: any) =>
                    option?.children?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {availableItems.map((item: any) => (
                    <Option key={item.id} value={item.id}>
                      {item.code ? `${item.code} - ${item.name}` : item.name || `Item ${item.id}`}
                    </Option>
                  ))}
                </Select>
                {selectedItemId && (
                  <div className="text-sm text-gray-600 mt-1">
                    Current Stock: <span className="font-semibold">{currentItemStock.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm">Quantity</label>
                <InputNumber
                  min={1}
                  value={quantity}
                  onChange={(val) => setQuantity(val || 1)}
                  style={{ width: '100%' }}
                />
                {selectedItemId && quantity > 0 && (
                  <div className="text-sm text-green-600 mt-1">
                    New Stock: <span className="font-semibold">{(currentItemStock + quantity).toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm">Unit Price</label>
                <InputNumber
                  min={0}
                  step={0.01}
                  value={unitPrice}
                  onChange={(val) => setUnitPrice(val || 0)}
                  style={{ width: '100%' }}
                  prefix="$"
                />
              </div>
              <div>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddItem}
                  style={{ width: '100%' }}
                  disabled={!selectedBinId}
                >
                  Add Item
                </Button>
              </div>
            </div>

            {!selectedBinId && (
              <div className="text-orange-600 text-sm">
                Please select a bin location above before adding items
              </div>
            )}

            <Table
              dataSource={items}
              columns={itemColumns}
              pagination={false}
              locale={{ emptyText: 'No items added yet' }}
            />
          </Space>
        </Card>

        <Form.Item>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/purchase-orders')}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Create Draft Order
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}
