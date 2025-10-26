import React, { useEffect } from 'react';
import { Card, Form, Input, Button, notification } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityCRUD, useEntityDetail } from '../../api/hooks';
import { Warehouse } from '../../types';

export default function WarehouseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { create, update } = useEntityCRUD('/warehouses');
  const { data: warehouse, isLoading } = useEntityDetail<Warehouse>('/warehouses', id);

  useEffect(() => {
    if (warehouse) {
      form.setFieldsValue({
        name: warehouse.name,
        code: warehouse.code,
        description: warehouse.description
      });
    }
  }, [warehouse, form]);

  const onFinish = async (values: any) => {
    try {
      if (id) {
        await update.mutateAsync({ id, payload: values });
        notification.success({ message: 'Updated warehouse' });
      } else {
        await create.mutateAsync(values);
        notification.success({ message: 'Created warehouse' });
      }
      navigate('/warehouses');
    } catch (err: any) {
      notification.error({ message: 'Save failed', description: err?.response?.data?.message || err.message });
    }
  };

  return (
    <Card title={id ? 'Edit Warehouse' : 'New Warehouse'} loading={isLoading}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ name: '', code: '', description: '' }}>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name required' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Code required' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/warehouses')}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}