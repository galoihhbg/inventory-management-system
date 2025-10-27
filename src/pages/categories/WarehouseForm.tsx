import React, { useEffect } from 'react';
import { Card, Form, Input, Button, notification } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityCRUD } from '../../api/hooks';

export default function WarehouseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { create, update, getOne } = useEntityCRUD('/warehouses');

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await getOne.mutateAsync(id);
          const d = res.data || res;
          form.setFieldsValue(d);
        } catch (err: any) {
          notification.error({ message: 'Could not fetch', description: err?.message });
        }
      })();
    }
  }, [id]);

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
    <Card title={id ? 'Edit Warehouse' : 'New Warehouse'}>
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