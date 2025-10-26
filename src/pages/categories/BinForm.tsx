import React, { useEffect, useMemo } from 'react';
import { Card, Form, Input, Button, notification, Select, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityCRUD, useEntityList, useEntityDetail } from '../../api/hooks';
import { Bin, Warehouse } from '../../types';

const { Option } = Select;

export default function BinForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { create, update } = useEntityCRUD('/bins');
  const { data: bin, isLoading } = useEntityDetail<Bin>('/bins', id);

  const { data: warehousesData, isLoading: warehousesLoading } = useEntityList<Warehouse>('/warehouses', { limit: 200 });
  const warehouses = useMemo(() => warehousesData?.data || [], [warehousesData]);

  useEffect(() => {
    if (bin) {
      form.setFieldsValue({
        locationCode: bin.locationCode,
        warehouseId: bin.warehouseId ?? (bin.warehouse ? bin.warehouse.id : undefined),
        description: bin.description
      });
    }
  }, [bin, form]);

  const onFinish = async (values: any) => {
    try {
      if (id) {
        await update.mutateAsync({ id, payload: values });
        notification.success({ message: 'Updated bin' });
      } else {
        await create.mutateAsync(values);
        notification.success({ message: 'Created bin' });
      }
      navigate('/bins');
    } catch (err: any) {
      notification.error({ message: 'Save failed', description: err?.response?.data?.message || err.message });
    }
  };

  return (
    <Card title={id ? 'Edit Bin' : 'New Bin'} loading={isLoading}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ locationCode: '', warehouseId: undefined, description: '' }}>
        <Form.Item name="locationCode" label="Location Code" rules={[{ required: true, message: 'Location code required' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="warehouseId" label="Warehouse" rules={[{ required: true, message: 'Warehouse required' }]}>
          {warehousesLoading ? (
            <Spin />
          ) : (
            <Select placeholder="Select warehouse">
              {warehouses.map((w) => (
                <Option key={w.id} value={w.id}>
                  {w.code ? `${w.code} - ${w.name}` : w.name || `Warehouse ${w.id}`}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/bins')}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}
