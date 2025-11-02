import React, { useState, useMemo } from 'react';
import { Card, Form, Button, notification, Select, InputNumber, Table, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEntityList } from '../../../api/hooks';
import client from '../../../api/client';

const { Option } = Select;

type OrderItem = {
  key: string;
  itemId: number;
  itemName?: string;
  binId: number;
  binCode?: string;
  quantityOrdered: number;
  unitPrice: number;
  currentStock?: number;
  warehouseStock?: number;
  newStock?: number;
};

export default function PurchaseOrderForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [selectedBinId, setSelectedBinId] = useState<number | undefined>(undefined);
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [currentItemStock, setCurrentItemStock] = useState<number>(0);
  const [warehouseStock, setWarehouseStock] = useState<number>(0);

  const { data: partnersData, isLoading: partnersLoading } = useEntityList<any>('/partners', { limit: 200 });
  const partners = useMemo(() => partnersData?.data || [], [partnersData]);

  const { data: itemsData, isLoading: itemsLoading } = useEntityList<any>('/items', { limit: 200 });
  const availableItems = useMemo(() => itemsData?.data || [], [itemsData]);

  const { data: warehousesData, isLoading: warehousesLoading } = useEntityList<any>('/warehouses', { limit: 200 });
  const availableWarehouses = useMemo(() => warehousesData?.data || [], [warehousesData]);

  const { data: binsData, isLoading: binsLoading } = useEntityList<any>('/bins', { 
    limit: 200,
    warehouseId: selectedWarehouseId
  });
  const availableBins = useMemo(() => {
    if (!selectedWarehouseId) return [];
    return binsData?.data?.filter((bin: any) => bin.warehouseId === selectedWarehouseId) || [];
  }, [binsData, selectedWarehouseId]);

  // Fetch current stock for selected item and bin
  const fetchItemBinStock = async (itemId: number, binId: number) => {
    try {
      // Get inventory stock for specific item and bin
      const res = await client.get(`/inventory-stock/filter?itemId=${itemId}&binId=${binId}`);
      const stockData = res.data?.data || res.data;
      const currentStock = stockData?.reduce((acc: number, curr: any) => acc + curr.quantity, 0) || 0;
      setCurrentItemStock(currentStock);

      // Get warehouse stock for the item
      const warehouseRes = await client.get(`/inventory-summary/item/${itemId}?warehouseId=${selectedWarehouseId}`);
      const warehouseStockData = warehouseRes.data?.data || warehouseRes.data;
      setWarehouseStock((warehouseStockData?.currentStock || 0) + (warehouseStockData?.pendingIn || 0));
    } catch (err) {
      setCurrentItemStock(0);
      setWarehouseStock(0);
    }
  };

  const handleAddItem = async () => {
    if (!selectedItemId || !selectedBinId || quantity <= 0 || unitPrice < 0) {
      notification.warning({ message: 'Please select an item, bin, quantity, and unit price' });
      return;
    }

    const item = availableItems.find((i: any) => i.id === selectedItemId);
    const bin = availableBins.find((b: any) => b.id === selectedBinId);
    
    const newItem: OrderItem = {
      key: `${selectedItemId}-${selectedBinId}-${Date.now()}`,
      itemId: selectedItemId,
      binId: selectedBinId,
      itemName: item?.name || `Item ${selectedItemId}`,
      binCode: bin?.code || bin?.locationCode || `Bin ${selectedBinId}`,
      quantityOrdered: quantity,
      unitPrice: unitPrice,
      currentStock: currentItemStock,
      warehouseStock: warehouseStock,
      newStock: currentItemStock + quantity
    };

    setItems([...items, newItem]);
    setSelectedItemId(undefined);
    setSelectedBinId(undefined);
    setQuantity(1);
    setUnitPrice(0);
    setCurrentItemStock(0);
    setWarehouseStock(0);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  const onFinish = async (values: any) => {
    if (items.length === 0) {
      notification.error({ message: 'Please add at least one item to the order' });
      return;
    }

    if (!selectedWarehouseId) {
      notification.error({ message: 'Please select a warehouse for this order' });
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
      title: 'Bin',
      dataIndex: 'binCode',
      key: 'binCode'
    },
    {
      title: 'Current Stock (Bin)',
      dataIndex: 'currentStock',
      key: 'currentStock',
      align: 'right' as const,
      render: (stock: number) => stock?.toLocaleString() || 0
    },
    {
      title: 'Warehouse Stock',
      dataIndex: 'warehouseStock',
      key: 'warehouseStock',
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
      title: 'New Stock (Bin)',
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

        {/* Warehouse Selection - First step */}
        <Card title="Delivery Information" className="mb-4">
          <Form.Item
            name="warehouseId"
            label="Warehouse"
            rules={[{ required: true, message: 'Please select warehouse' }]}
          >
            <Select
              placeholder="Select warehouse for this order"
              value={selectedWarehouseId}
              onChange={(value) => {
                setSelectedWarehouseId(value);
                setSelectedBinId(undefined); // Reset bin selection
                form.setFieldsValue({ warehouseId: value });
              }}
              style={{ width: '100%' }}
              loading={warehousesLoading}
              showSearch
              filterOption={(input, option: any) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {availableWarehouses.map((warehouse: any) => (
                <Option key={warehouse.id} value={warehouse.id}>
                  {warehouse.code || `Warehouse ${warehouse.id}`}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Card>

        <Card title="Order Items" className="mb-4">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-start">
              <div className="min-h-[80px]">
                <label className="block mb-1 text-sm">Item</label>
                <Select
                  allowClear
                  placeholder="Select item"
                  value={selectedItemId}
                  onChange={(itemId) => {
                    setSelectedItemId(itemId);
                    setCurrentItemStock(0);
                    setWarehouseStock(0);
                    if (itemId && selectedBinId) {
                      fetchItemBinStock(itemId, selectedBinId);
                    }
                  }}
                  style={{ width: '100%' }}
                  loading={itemsLoading}
                  showSearch
                  disabled={!selectedWarehouseId}
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

              <div className="min-h-[80px]">
                <label className="block mb-1 text-sm">Bin Location</label>
                <Select
                  allowClear
                  placeholder="Select bin"
                  value={selectedBinId}
                  onChange={(binId) => {
                    setSelectedBinId(binId);
                    setCurrentItemStock(0);
                    setWarehouseStock(0);
                    if (selectedItemId && binId) {
                      fetchItemBinStock(selectedItemId, binId);
                    }
                  }}
                  style={{ width: '100%' }}
                  loading={binsLoading}
                  showSearch
                  disabled={!selectedWarehouseId}
                  filterOption={(input, option: any) =>
                    option?.children?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {availableBins.map((bin: any) => (
                    <Option key={bin.id} value={bin.id}>
                      {bin.code || bin.locationCode} 
                      {bin.isReceivingBin && <span className="text-green-600 ml-1">(R)</span>}
                    </Option>
                  ))}
                </Select>
                {selectedItemId && selectedBinId && (
                  <div className="text-sm text-gray-600 mt-1">
                    Bin Stock: <span className="font-semibold">{currentItemStock.toLocaleString()}</span>
                    <br />
                    Warehouse: <span className="font-semibold">{warehouseStock.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="min-h-[80px]">
                <label className="block mb-1 text-sm">Quantity</label>
                <InputNumber
                  min={1}
                  value={quantity}
                  onChange={(val) => setQuantity(val || 1)}
                  style={{ width: '100%' }}
                />
                {selectedItemId && selectedBinId && quantity > 0 && (
                  <div className="text-sm text-green-600 mt-1">
                    New Bin Stock: <span className="font-semibold">{(currentItemStock + quantity).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="min-h-[80px]">
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

              <div className="min-h-[80px] flex items-center">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddItem}
                  style={{ width: '100%' }}
                  disabled={!selectedWarehouseId || !selectedItemId || !selectedBinId}
                >
                  Add Item
                </Button>
              </div>
            </div>

            {!selectedWarehouseId && (
              <div className="text-orange-600 text-sm">
                Please select a warehouse above before adding items
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
