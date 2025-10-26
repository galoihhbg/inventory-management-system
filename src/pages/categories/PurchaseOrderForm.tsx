import React, { useState, useMemo, useEffect } from 'react';
import { Card, Form, Button, notification, Select, InputNumber, Table, Space, Spin } from 'antd';
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
  binId: number;
  binLocationCode?: string;
  warehouseName?: string;
};

export default function PurchaseOrderForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>(undefined);
  const [selectedBinId, setSelectedBinId] = useState<number | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number | null>(null);
  const [loadingStock, setLoadingStock] = useState(false);

  const { data: partnersData, isLoading: partnersLoading } = useEntityList<any>('/partners', { limit: 200 });
  const partners = useMemo(() => partnersData?.data || [], [partnersData]);

  const { data: itemsData, isLoading: itemsLoading } = useEntityList<any>('/items', { limit: 200 });
  const availableItems = useMemo(() => itemsData?.data || [], [itemsData]);

  const { data: binsData, isLoading: binsLoading } = useEntityList<any>('/bins', { limit: 200 });
  const bins = useMemo(() => binsData?.data || [], [binsData]);

  // Memoize the selected bin to avoid repeated lookups
  const selectedBin = useMemo(() => {
    return bins.find((b: any) => b.id === selectedBinId);
  }, [bins, selectedBinId]);

  // Fetch current stock when item and bin are selected
  useEffect(() => {
    const fetchCurrentStock = async () => {
      if (!selectedItemId || !selectedBinId || !selectedBin) {
        setCurrentStock(null);
        return;
      }

      if (!selectedBin.warehouseId) {
        setCurrentStock(null);
        return;
      }

      setLoadingStock(true);
      try {
        const response = await client.get('/inventory-stock/items/aggregation', {
          params: {
            itemId: selectedItemId,
            warehouseId: selectedBin.warehouseId,
            limit: 1
          }
        });
        
        const stockData = response.data?.data?.[0];
        if (stockData) {
          setCurrentStock(stockData.totalQuantity || 0);
        } else {
          setCurrentStock(0);
        }
      } catch (err) {
        console.error('Failed to fetch stock:', err);
        setCurrentStock(0);
      } finally {
        setLoadingStock(false);
      }
    };

    fetchCurrentStock();
  }, [selectedItemId, selectedBinId, selectedBin]);

  const handleAddItem = () => {
    if (!selectedItemId || !selectedBinId || quantity <= 0 || unitPrice < 0) {
      notification.warning({ message: 'Please select an item, bin location, quantity, and unit price' });
      return;
    }

    const item = availableItems.find((i: any) => i.id === selectedItemId);
    
    const newItem: OrderItem = {
      key: `${selectedItemId}-${selectedBinId}-${Date.now()}`,
      itemId: selectedItemId,
      itemName: item?.name || `Item ${selectedItemId}`,
      quantityOrdered: quantity,
      unitPrice: unitPrice,
      binId: selectedBinId,
      binLocationCode: selectedBin?.locationCode || `Bin ${selectedBinId}`,
      warehouseName: selectedBin?.warehouse?.name || `Warehouse ${selectedBin?.warehouseId}`
    };

    setItems([...items, newItem]);
    setSelectedItemId(undefined);
    setSelectedBinId(undefined);
    setQuantity(1);
    setUnitPrice(0);
    setCurrentStock(null);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  const onFinish = async (values: any) => {
    if (items.length === 0) {
      notification.error({ message: 'Please add at least one item to the order' });
      return;
    }

    try {
      const payload = {
        partnerId: values.partnerId,
        items: items.map(item => ({
          itemId: item.itemId,
          quantityOrdered: item.quantityOrdered,
          unitPrice: item.unitPrice,
          binId: item.binId
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
      title: 'Bin Location',
      dataIndex: 'binLocationCode',
      key: 'binLocationCode'
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouseName',
      key: 'warehouseName'
    },
    {
      title: 'Quantity',
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

        <Card title="Order Items" className="mb-4">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="flex gap-2 items-end">
              <div style={{ flex: 1 }}>
                <label className="block mb-1 text-sm">Item</label>
                <Select
                  placeholder="Select item"
                  value={selectedItemId}
                  onChange={setSelectedItemId}
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
              </div>
              <div style={{ flex: 1 }}>
                <label className="block mb-1 text-sm">Bin Location</label>
                <Select
                  placeholder="Select bin"
                  value={selectedBinId}
                  onChange={setSelectedBinId}
                  style={{ width: '100%' }}
                  loading={binsLoading}
                  showSearch
                  filterOption={(input, option: any) =>
                    option?.children?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {bins.map((bin: any) => (
                    <Option key={bin.id} value={bin.id}>
                      {bin.locationCode} - {bin.warehouse?.name || `Warehouse ${bin.warehouseId}`}
                    </Option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block mb-1 text-sm">Quantity</label>
                <InputNumber
                  min={1}
                  value={quantity}
                  onChange={(val) => setQuantity(val || 1)}
                  style={{ width: 120 }}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Unit Price</label>
                <InputNumber
                  min={0}
                  step={0.01}
                  value={unitPrice}
                  onChange={(val) => setUnitPrice(val || 0)}
                  style={{ width: 120 }}
                  prefix="$"
                />
              </div>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddItem}
              >
                Add Item
              </Button>
            </div>

            {selectedItemId && selectedBinId && (
              <div className="p-3 bg-blue-50 rounded">
                {loadingStock ? (
                  <div className="flex items-center gap-2">
                    <Spin size="small" />
                    <span>Loading stock information...</span>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm">
                      <strong>Current Stock:</strong> {currentStock !== null ? currentStock : '-'}
                    </div>
                    <div className="text-sm mt-1">
                      <strong>Projected Stock After Confirmation:</strong> {currentStock !== null ? currentStock + quantity : '-'}
                    </div>
                  </div>
                )}
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
