import React, { useEffect, useMemo } from 'react';
import { Card, Form, Input, Button, notification, Select, Spin, Checkbox } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEntityCRUD, useEntityList } from '../../../api/hooks';
import { Bin, Warehouse, BinFormData, ApiError } from '../../../types';

// Type cho form với các trường mới
interface BinInputFormData {
  area: string;
  row: string;
  floor: string;
  warehouseId: number;
  description?: string;
  isReceivingBin: boolean;
}

const { Option } = Select;

export default function BinForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form] = Form.useForm<BinInputFormData>();
  const { create, update, getOne } = useEntityCRUD<Bin, BinFormData, BinFormData>('/bins');
  
  // State để theo dõi giá trị form và hiển thị preview
  const [previewLocation, setPreviewLocation] = React.useState<string>('');
  const updateTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const { 
    data: warehousesData, 
    isLoading: warehousesLoading,
    refetch: refetchWarehouses 
  } = useEntityList<Warehouse>('/warehouses', { limit: 200 });
  
  const warehouses = useMemo(() => warehousesData?.data || [], [warehousesData]);

  // Hàm để cập nhật preview location với debounce
  const updatePreview = () => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      const values = form.getFieldsValue();
      const { area, row, floor } = values;
      
      if (area && row && floor) {
        const preview = `${area.toUpperCase()}-${row.padStart(2, '0')}-${floor.padStart(2, '0')}`;
        setPreviewLocation(preview);
      } else {
        setPreviewLocation('');
      }
    }, 300);
  };

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await getOne.mutateAsync(id);
          const binData = res.data || res;
          
          // Parse locationCode để tách thành area và floor
          // Format: A-01-01 -> area: A, row: 01, floor: 01
          const locationParts = binData.locationCode.split('-');
          const area = locationParts[0] || '';
          const row = locationParts[1] || '';
          const floor = locationParts[2] || '';
          
          form.setFieldsValue({
            area: area,
            row: row,
            floor: floor,
            warehouseId: binData.warehouseId ?? (binData.warehouse ? binData.warehouse.id : undefined),
            description: binData.description || '',
            isReceivingBin: binData.isReceivingBin || false
          });
          
          // Cập nhật preview sau khi load dữ liệu
          if (area && row && floor) {
            setPreviewLocation(`${area}-${row.padStart(2, '0')}-${floor.padStart(2, '0')}`);
          }
        } catch (err) {
          const error = err as ApiError;
          notification.error({ 
            message: t('bins.couldNotFetchBin'), 
            description: error.message 
          });
        }
      })();
    }
  }, [id, getOne, form]);

  const onFinish = async (values: BinInputFormData) => {
    try {
      // Tạo locationCode từ area, row, floor
      // Format: A-01-01
      const { area, row, floor, ...otherValues } = values;
      const locationCode = `${area.toUpperCase()}-${row.padStart(2, '0')}-${floor.padStart(2, '0')}`;
      
      const binData: BinFormData = {
        ...otherValues,
        locationCode
      };

      if (id) {
        await update.mutateAsync({ id, payload: binData });
        notification.success({ message: t('bins.binUpdatedSuccess') });
      } else {
        await create.mutateAsync(binData);
        notification.success({ message: t('bins.binCreatedSuccess') });
      }
      navigate('/bins');
    } catch (err) {
      const error = err as ApiError;
      notification.error({ 
        message: t('bins.saveFailed'), 
        description: error.message
      });
    }
  };

  return (
    <Card 
      title={id ? t('bins.editBin') : t('bins.newBin')}
      extra={
        <Button 
          icon={<ReloadOutlined />}
          onClick={() => refetchWarehouses()}
          loading={warehousesLoading}
          title={t('bins.refreshWarehouses')}
        >
          {t('common.refresh')}
        </Button>
      }
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish} 
        initialValues={{ 
          area: '', 
          row: '',
          floor: '',
          warehouseId: undefined, 
          description: '', 
          isReceivingBin: false 
        }}
      >
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <Form.Item 
            name="area" 
            label={t('bins.area')} 
            rules={[{ required: true, message: t('bins.areaRequired') }]}
            style={{ flex: 1 }}
          >
            <Input 
              placeholder={t('bins.areaPlaceholder')} 
              maxLength={3} 
              onChange={updatePreview}
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>
          
          <Form.Item 
            name="row" 
            label={t('bins.row')} 
            rules={[
              { required: true, message: t('bins.rowRequired') },
              { pattern: /^\d+$/, message: t('bins.rowMustBeNumber') }
            ]}
            style={{ flex: 1 }}
          >
            <Input 
              placeholder={t('bins.rowPlaceholder')} 
              maxLength={2} 
              onChange={updatePreview}
            />
          </Form.Item>
          
          <Form.Item 
            name="floor" 
            label={t('bins.floor')} 
            rules={[
              { required: true, message: t('bins.floorRequired') },
              { pattern: /^\d+$/, message: t('bins.floorMustBeNumber') }
            ]}
            style={{ flex: 1 }}
          >
            <Input 
              placeholder={t('bins.floorPlaceholder')} 
              maxLength={2} 
              onChange={updatePreview}
            />
          </Form.Item>
        </div>
        
        <Form.Item>
          <div style={{ padding: '12px', backgroundColor: '#f0f2f5', borderRadius: '4px', fontSize: '13px' }}>
            <div><strong>{t('bins.binNameWillBeGenerated')}</strong> {'{Khu vực}-{Dãy}-{Tầng}'}</div>
            <div style={{ marginTop: '4px' }}>
              <em>{t('bins.example')}</em>
            </div>
            {previewLocation && (
              <div style={{ marginTop: '8px', color: '#1890ff', fontWeight: 'bold' }}>
                {t('bins.preview')} {previewLocation}
              </div>
            )}
          </div>
        </Form.Item>

        <Form.Item 
          name="warehouseId" 
          label={t('bins.warehouse')} 
          rules={[{ required: true, message: t('bins.warehouseRequired') }]}
        >
          {warehousesLoading ? (
            <Spin />
          ) : (
            <Select placeholder={t('bins.selectWarehouse')}>
              {warehouses.map((warehouse: Warehouse) => (
                <Option key={warehouse.id} value={warehouse.id}>
                  {warehouse.code ? `${warehouse.code} - ${warehouse.name}` : warehouse.name}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item name="description" label={t('common.description')}>
          <Input.TextArea rows={4} placeholder={`${t('common.description')} (${t('common.optional')})`} />
        </Form.Item>

        <Form.Item name="isReceivingBin" valuePropName="checked">
          <Checkbox>
            {t('bins.isReceivingBin')}
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/bins')}>{t('common.cancel')}</Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={create.isPending || update.isPending}
            >
              {id ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}
