import React, { useEffect } from 'react';
import { Card, Form, Input, Button, notification, Checkbox } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityCRUD } from '../../api/hooks';
import { Warehouse, WarehouseFormData, ApiError } from '../../types';

export default function WarehouseForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<WarehouseFormData>();
  const { create, update, getOne } = useEntityCRUD<Warehouse, WarehouseFormData, WarehouseFormData>('/warehouses');

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await getOne.mutateAsync(id);
          const warehouseData = res.data || res;
          form.setFieldsValue({
            code: warehouseData.code,
            name: warehouseData.name,
            address: warehouseData.address || '',
            isActive: warehouseData.isActive
          });
        } catch (err) {
          const error = err as ApiError;
          notification.error({ 
            message: 'Could not fetch warehouse', 
            description: error.message 
          });
        }
      })();
    }
  }, [id, getOne, form]);

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
          isActive: true 
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

        <Form.Item name="isActive" valuePropName="checked">
          <Checkbox>Active</Checkbox>
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