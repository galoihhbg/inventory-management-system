import React, { useState, useMemo, useEffect } from 'react';
import { Card, Form, Button, notification, Select, InputNumber, Table, Space, Input, DatePicker } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEntityList } from '../../../api/hooks';
import client from '../../../api/client';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

type BinStockItem = {
  binId: number;
  binCode: string;
  currentStock: number;
  actualQuantity: number;
};

type CheckDetailItem = {
  key: string;
  itemId: number;
  itemName?: string;
  binId: number;
  binCode?: string;
  currentStock?: number;
  actualQuantity: number;
};

export default function InventoryCheckForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [details, setDetails] = useState<CheckDetailItem[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>(undefined);
  const [binStocks, setBinStocks] = useState<BinStockItem[]>([]);
  const [loadingBinStocks, setLoadingBinStocks] = useState(false);
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);

  const { data: warehousesData, isLoading: warehousesLoading } = useEntityList<any>('/warehouses', { limit: 200 });
  const availableWarehouses = useMemo(() => warehousesData?.data || [], [warehousesData]);

  const { data: itemsData, isLoading: itemsLoading } = useEntityList<any>('/items', { limit: 200 });
  const availableItems = useMemo(() => itemsData?.data || [], [itemsData]);

  // Populate form when editing
  useEffect(() => {
    if (isEditMode) {
      fetchCheck();
    }
  }, [id, isEditMode]);

  // Fetch bin stocks when item and warehouse are selected
  useEffect(() => {
    if (selectedItemId && selectedWarehouseId) {
      fetchBinStocks();
    } else {
      setBinStocks([]);
    }
  }, [selectedItemId, selectedWarehouseId]);

  const fetchBinStocks = async () => {
    if (!selectedItemId || !selectedWarehouseId) return;

    try {
      setLoadingBinStocks(true);
      // Fetch inventory stock for the selected item in the selected warehouse
      const response = await client.get(`/inventory-stock/filter?itemId=${selectedItemId}&warehouseId=${selectedWarehouseId}`);
      const stockData = response.data?.data || response.data || [];
      
      // Map to bin stock items
      const bins: BinStockItem[] = stockData.map((stock: any) => ({
        binId: stock.binId,
        binCode: stock.bin?.code || stock.bin?.locationCode || `Bin ${stock.binId}`,
        currentStock: stock.quantity || 0,
        actualQuantity: 0 // Default actual quantity
      }));

      setBinStocks(bins);
    } catch (err: any) {
      notification.error({
        message: t('api.fetchFailed'),
        description: err?.response?.data?.error || err.message
      });
      setBinStocks([]);
    } finally {
      setLoadingBinStocks(false);
    }
  };

  const fetchCheck = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/inventory-checks/${id}`);
      const check = response.data?.inventoryCheck || response.data;
      
      // Check if can edit
      if (check.checkStatus !== 'draft') {
        notification.error({ message: t('inventoryChecks.cannotEditCompleted') });
        navigate('/inventory-checks');
        return;
      }

      form.setFieldsValue({
        dateRange: check.fromDate && check.toDate ? [dayjs(check.fromDate), dayjs(check.toDate)] : undefined,
        warehouseId: check.warehouseId,
        description: check.description
      });

      setSelectedWarehouseId(check.warehouseId);

      // Populate details
      if (check.details && check.details.length > 0) {
        const formattedDetails: CheckDetailItem[] = check.details.map((detail: any, idx: number) => ({
          key: `detail-${idx}`,
          itemId: detail.itemId,
          itemName: detail.item?.name,
          binId: detail.binId,
          binCode: detail.bin?.code || detail.bin?.locationCode,
          currentStock: detail.bookQuantity || 0,
          actualQuantity: detail.actualQuantity
        }));
        setDetails(formattedDetails);
      }
    } catch (err: any) {
      notification.error({ 
        message: t('api.fetchFailed'),
        description: err?.response?.data?.error || err.message 
      });
      navigate('/inventory-checks');
    } finally {
      setLoading(false);
    }
  };

  const handleBinActualQuantityChange = (binId: number, value: number) => {
    setBinStocks(binStocks.map(bin => 
      bin.binId === binId ? { ...bin, actualQuantity: value } : bin
    ));
  };

  const handleAddItemToBatch = () => {
    if (!selectedItemId || !selectedWarehouseId) {
      notification.warning({ message: t('inventoryChecks.selectItem') });
      return;
    }

    if (binStocks.length === 0) {
      notification.warning({ message: 'No bins found with stock for this item in the selected warehouse' });
      return;
    }

    const item = availableItems.find((i: any) => i.id === selectedItemId);
    
    // Add all bins with their actual quantities to details
    const newDetails = binStocks.map((binStock) => ({
      key: `detail-${selectedItemId}-${binStock.binId}-${Date.now()}`,
      itemId: selectedItemId!,
      itemName: item?.name,
      binId: binStock.binId,
      binCode: binStock.binCode,
      currentStock: binStock.currentStock,
      actualQuantity: binStock.actualQuantity
    }));

    setDetails([...details, ...newDetails]);
    
    // Reset
    setSelectedItemId(undefined);
    setBinStocks([]);
  };

  const handleRemoveDetail = (key: string) => {
    setDetails(details.filter(d => d.key !== key));
  };

  const handleSubmit = async (values: any) => {
    if (details.length === 0) {
      notification.error({ message: t('inventoryChecks.addDetail') });
      return;
    }

    const [fromDate, toDate] = values.dateRange || [];
    
    const payload = {
      fromDate: fromDate ? fromDate.toISOString() : undefined,
      toDate: toDate ? toDate.toISOString() : undefined,
      warehouseId: values.warehouseId,
      description: values.description,
      details: details.map(d => ({
        itemId: d.itemId,
        binId: d.binId,
        actualQuantity: d.actualQuantity
      }))
    };

    try {
      if (isEditMode) {
        await client.put(`/inventory-checks/${id}`, payload);
        notification.success({ message: t('inventoryChecks.checkUpdated') });
      } else {
        await client.post('/inventory-checks', payload);
        notification.success({ message: t('inventoryChecks.checkCreated') });
      }
      navigate('/inventory-checks');
    } catch (err: any) {
      notification.error({ 
        message: isEditMode ? t('api.updateFailed') : t('api.createFailed'),
        description: err.response?.data?.error || err.message 
      });
    }
  };

  const detailColumns = [
    {
      title: t('inventoryChecks.item'),
      dataIndex: 'itemName',
      key: 'itemName'
    },
    {
      title: t('inventoryChecks.bin'),
      dataIndex: 'binCode',
      key: 'binCode'
    },
    {
      title: t('inventoryChecks.bookQuantity'),
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (value: number | undefined) => value !== undefined ? value : '-'
    },
    {
      title: t('inventoryChecks.actualQuantity'),
      dataIndex: 'actualQuantity',
      key: 'actualQuantity'
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: unknown, record: CheckDetailItem) => (
        <Button 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveDetail(record.key)}
        />
      )
    }
  ];

  const binStockColumns = [
    {
      title: t('inventoryChecks.bin'),
      dataIndex: 'binCode',
      key: 'binCode'
    },
    {
      title: t('inventoryChecks.bookQuantity'),
      dataIndex: 'currentStock',
      key: 'currentStock'
    },
    {
      title: t('inventoryChecks.actualQuantity'),
      key: 'actualQuantity',
      render: (_: unknown, record: BinStockItem) => (
        <InputNumber
          min={0}
          value={record.actualQuantity}
          onChange={(value) => handleBinActualQuantityChange(record.binId, value || 0)}
          style={{ width: '100%' }}
        />
      )
    }
  ];

  if (isEditMode && loading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div>
      <h2>{isEditMode ? t('inventoryChecks.editCheck') : t('inventoryChecks.newCheck')}</h2>
      
      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            name="dateRange" 
            label={`${t('inventoryChecks.fromDate')} - ${t('inventoryChecks.toDate')}`}
            rules={[{ required: true, message: t('validation.required', { field: 'Date Range' }) }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item 
            name="warehouseId" 
            label={t('inventoryChecks.warehouse')}
            rules={[{ required: true, message: t('validation.required', { field: 'Warehouse' }) }]}
          >
            <Select 
              placeholder={t('inventoryChecks.warehouse')}
              loading={warehousesLoading}
              onChange={(value) => {
                setSelectedWarehouseId(value);
                setSelectedItemId(undefined);
                setBinStocks([]);
              }}
            >
              {availableWarehouses.map((wh: any) => (
                <Option key={wh.id} value={wh.id}>
                  {wh.code} - {wh.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label={t('common.description')}>
            <TextArea rows={3} />
          </Form.Item>

          <div style={{ marginTop: 24, marginBottom: 16 }}>
            <h3>{t('inventoryChecks.addDetail')}</h3>
          </div>

          <Card style={{ marginBottom: 16, background: '#f5f5f5' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                placeholder={t('inventoryChecks.selectItem')}
                style={{ width: '100%' }}
                value={selectedItemId}
                onChange={setSelectedItemId}
                loading={itemsLoading}
                disabled={!selectedWarehouseId}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {availableItems.map((item: any) => (
                  <Option key={item.id} value={item.id}>
                    {item.code} - {item.name}
                  </Option>
                ))}
              </Select>

              {binStocks.length > 0 && (
                <>
                  <div style={{ marginTop: 16 }}>
                    <strong>{t('inventoryChecks.binsWithStock')}</strong>
                  </div>
                  <Table
                    columns={binStockColumns}
                    dataSource={binStocks}
                    pagination={false}
                    rowKey="binId"
                    loading={loadingBinStocks}
                    size="small"
                  />
                  <Button 
                    type="primary"
                    icon={<PlusOutlined />} 
                    onClick={handleAddItemToBatch}
                    block
                  >
                    {t('inventoryChecks.addItemToBatch')}
                  </Button>
                </>
              )}

              {selectedItemId && selectedWarehouseId && binStocks.length === 0 && !loadingBinStocks && (
                <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
                  {t('inventoryChecks.noBinsWithStock')}
                </div>
              )}
            </Space>
          </Card>

          <div style={{ marginTop: 24, marginBottom: 16 }}>
            <h3>{t('inventoryChecks.checkDetails')}</h3>
          </div>

          <Table
            columns={detailColumns}
            dataSource={details}
            pagination={false}
            rowKey="key"
          />

          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <Button type="primary" htmlType="submit">
              {t('common.save')}
            </Button>
            <Button onClick={() => navigate('/inventory-checks')}>
              {t('common.cancel')}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
