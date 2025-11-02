import React, { useEffect, useMemo } from 'react';
import { Card, Form, Input, Button, notification, Select, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityCRUD, useEntityList, useEntityById } from '../../../api/hooks';

const { Option } = Select;

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { create, update } = useEntityCRUD('/items');

  const { data: baseUnitsData, isLoading: baseUnitsLoading } = useEntityList<any>('/base-units', { limit: 200 });
  const baseUnits = useMemo(() => baseUnitsData?.data || [], [baseUnitsData]);

  // Fetch item data when editing
  const { data: itemData, isLoading: itemLoading, error: itemError } = useEntityById<any>('/items', id);

  // Show error when fetching item data
  useEffect(() => {
    if (itemError) {
      notification.error({ message: 'Could not fetch item', description: itemError.message });
    }
  }, [itemError]);

  // Fill form when item data is loaded
  useEffect(() => {
    if (itemData) {
      const item = itemData.data || itemData;
      form.setFieldsValue({
        code: item.code,
        name: item.name,
        baseUnitId: item.baseUnitId ?? (item.baseUnit ? item.baseUnit.id : undefined),
        description: item.description
      });
    }
  }, [itemData, form]);

  const onFinish = async (values: any) => {
    try {
      if (id) {
        await update.mutateAsync({ id, payload: values });
        notification.success({ message: 'Item updated' });
      } else {
        await create.mutateAsync(values);
        notification.success({ message: 'Item created' });
      }
      navigate('/items');
    } catch (err: any) {
      notification.error({ message: 'Save failed', description: err?.response?.data?.message || err.message });
    }
  };

  // Show loading when fetching item data
  if (id && itemLoading) {
    return (
      <Card title="Edit Item">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card title={id ? 'Edit Item' : 'New Item'}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ code: '', name: '', baseUnitId: undefined, description: '' }}>
        <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Code required' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name required' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="baseUnitId" label="Base Unit" rules={[{ required: true, message: 'Base unit required' }]}>
          {baseUnitsLoading ? (
            <Spin />
          ) : (
            <Select placeholder="Select base unit">
              {baseUnits.map((b: any) => (
                <Option key={b.id} value={b.id}>
                  {b.code ? `${b.code} - ${b.description || ''}` : b.description || `Unit ${b.id}`}
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
            <Button onClick={() => navigate('/items')}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}