import React, { useEffect } from 'react';
import { Card, Form, Input, Button, notification, Checkbox, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityCRUD, useEntityById } from '../../../api/hooks';
import { Warehouse, WarehouseFormData, ApiError } from '../../../types';

export default function WarehouseForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<WarehouseFormData>();
  const { create, update } = useEntityCRUD<Warehouse, WarehouseFormData, WarehouseFormData>('/warehouses');

  // Fetch warehouse data when editing
  const { data: warehouseData, isLoading: warehouseLoading, error: warehouseError } = useEntityById<Warehouse>('/warehouses', id);

  // Show error when fetching warehouse data
  useEffect(() => {
    if (warehouseError) {
      notification.error({ 
        message: 'Could not fetch warehouse', 
        description: warehouseError.message 
      });
    }
  }, [warehouseError]);

  // Fill form when warehouse data is loaded
  useEffect(() => {
    if (warehouseData) {
      const warehouse = warehouseData.data || warehouseData;
      form.setFieldsValue({
        code: warehouse.code,
        name: warehouse.name,
        address: warehouse.address || '',
        status: warehouse.status || 'active'
      });
    }
  }, [warehouseData, form]);

  const onFinish = async (values: WarehouseFormData) => {
    try {
      if (id) {
        await update.mutateAsync({ id, payload: values });
        notification.success({ message: 'Warehouse updated successfully' });
      } else {
        await create.mutateAsync(values);
        notification.success({ message: 'Warehouse created successfully' });
      }
      navigate('/warehouses');
    } catch (err) {
      const error = err as ApiError;
      notification.error({ 
        message: 'Save failed', 
        description: error.message 
      });
    }
  };

  // Show loading when fetching warehouse data
  if (id && warehouseLoading) {
    return (
      <Card title="Edit Warehouse">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card title={id ? 'Edit Warehouse' : 'New Warehouse'}>
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish} 
        initialValues={{ 
          code: '', 
          name: '', 
          address: '', 
          status: 'active' 
        }}
      >
        <Form.Item 
          name="code" 
          label="Code" 
          rules={[{ required: true, message: 'Code is required' }]}
        >
          <Input placeholder="Enter warehouse code" />
        </Form.Item>
        
        <Form.Item 
          name="name" 
          label="Name" 
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input placeholder="Enter warehouse name" />
        </Form.Item>
        
        <Form.Item name="address" label="Address">
          <Input.TextArea rows={4} placeholder="Enter warehouse address (optional)" />
        </Form.Item>

        <Form.Item name="status" label="Status">
          <Input placeholder="Enter status (e.g., active, inactive)" />
        </Form.Item>

        <Form.Item>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/warehouses')}>Cancel</Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={create.isPending || update.isPending}
            >
              {id ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}