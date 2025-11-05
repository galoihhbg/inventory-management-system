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

type CheckDetailItem = {
  key: string;
  itemId: number;
  itemName?: string;
  binId: number;
  binCode?: string;
  actualQuantity: number;
};

export default function InventoryCheckForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [details, setDetails] = useState<CheckDetailItem[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [selectedBinId, setSelectedBinId] = useState<number | undefined>(undefined);
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>(undefined);
  const [actualQuantity, setActualQuantity] = useState<number>(0);
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);

  const { data: warehousesData, isLoading: warehousesLoading } = useEntityList<any>('/warehouses', { limit: 200 });
  const availableWarehouses = useMemo(() => warehousesData?.data || [], [warehousesData]);

  const { data: usersData, isLoading: usersLoading } = useEntityList<any>('/users', { limit: 200 });
  const availableUsers = useMemo(() => usersData?.data || [], [usersData]);

  const { data: itemsData, isLoading: itemsLoading } = useEntityList<any>('/items', { limit: 200 });
  const availableItems = useMemo(() => itemsData?.data || [], [itemsData]);

  const { data: binsData, isLoading: binsLoading } = useEntityList<any>('/bins', { 
    limit: 200,
    warehouseId: selectedWarehouseId
  });
  const availableBins = useMemo(() => {
    if (!selectedWarehouseId) return [];
    return binsData?.data?.filter((bin: any) => bin.warehouseId === selectedWarehouseId) || [];
  }, [binsData, selectedWarehouseId]);

  // Populate form when editing
  useEffect(() => {
    if (isEditMode) {
      fetchCheck();
    }
  }, [id, isEditMode]);

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
        checkerId: check.checkerId,
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

  const handleAddDetail = () => {
    if (!selectedItemId || !selectedBinId || actualQuantity < 0) {
      notification.warning({ message: t('inventoryChecks.enterActualQuantity') });
      return;
    }

    const item = availableItems.find((i: any) => i.id === selectedItemId);
    const bin = availableBins.find((b: any) => b.id === selectedBinId);

    const newDetail: CheckDetailItem = {
      key: `detail-${Date.now()}`,
      itemId: selectedItemId,
      itemName: item?.name,
      binId: selectedBinId,
      binCode: bin?.code || bin?.locationCode,
      actualQuantity
    };

    setDetails([...details, newDetail]);
    
    // Reset inputs
    setSelectedItemId(undefined);
    setSelectedBinId(undefined);
    setActualQuantity(0);
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
      checkerId: values.checkerId,
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
              onChange={(value) => setSelectedWarehouseId(value)}
            >
              {availableWarehouses.map((wh: any) => (
                <Option key={wh.id} value={wh.id}>
                  {wh.code} - {wh.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            name="checkerId" 
            label={t('inventoryChecks.checker')}
            rules={[{ required: true, message: t('validation.required', { field: 'Checker' }) }]}
          >
            <Select 
              placeholder={t('inventoryChecks.checker')}
              loading={usersLoading}
            >
              {availableUsers.map((user: any) => (
                <Option key={user.id} value={user.id}>
                  {user.email} - {user.firstName} {user.lastName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label={t('common.description')}>
            <TextArea rows={3} />
          </Form.Item>

          <div style={{ marginTop: 24, marginBottom: 16 }}>
            <h3>{t('inventoryChecks.checkDetails')}</h3>
          </div>

          <Card style={{ marginBottom: 16, background: '#f5f5f5' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                placeholder={t('inventoryChecks.selectItem')}
                style={{ width: '100%' }}
                value={selectedItemId}
                onChange={setSelectedItemId}
                loading={itemsLoading}
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

              <Select
                placeholder={t('inventoryChecks.selectBin')}
                style={{ width: '100%' }}
                value={selectedBinId}
                onChange={setSelectedBinId}
                loading={binsLoading}
                disabled={!selectedWarehouseId}
              >
                {availableBins.map((bin: any) => (
                  <Option key={bin.id} value={bin.id}>
                    {bin.code || bin.locationCode}
                  </Option>
                ))}
              </Select>

              <InputNumber
                placeholder={t('inventoryChecks.actualQuantity')}
                style={{ width: '100%' }}
                value={actualQuantity}
                onChange={(val) => setActualQuantity(val || 0)}
                min={0}
              />

              <Button 
                type="dashed" 
                icon={<PlusOutlined />} 
                onClick={handleAddDetail}
                block
              >
                {t('inventoryChecks.addDetail')}
              </Button>
            </Space>
          </Card>

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
