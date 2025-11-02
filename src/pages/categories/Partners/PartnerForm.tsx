import React, { useEffect } from 'react';
import { Card, Form, Input, Button, notification, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityCRUD, useEntityById } from '../../../api/hooks';

export default function PartnerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { create, update } = useEntityCRUD('/partners');

  // Fetch partner data when editing
  const { data: partnerData, isLoading: partnerLoading, error: partnerError } = useEntityById<any>('/partners', id);

  // Show error when fetching partner data
  useEffect(() => {
    if (partnerError) {
      notification.error({ message: 'Could not fetch partner', description: partnerError.message });
    }
  }, [partnerError]);

  // Fill form when partner data is loaded
  useEffect(() => {
    if (partnerData) {
      const partner = partnerData.data || partnerData;
      form.setFieldsValue(partner);
    }
  }, [partnerData, form]);

  const onFinish = async (values: any) => {
    try {
      if (id) {
        await update.mutateAsync({ id, payload: values });
        notification.success({ message: 'Updated partner' });
      } else {
        await create.mutateAsync(values);
        notification.success({ message: 'Created partner' });
      }
      navigate('/partners');
    } catch (err: any) {
      notification.error({ message: 'Save failed', description: err?.response?.data?.message || err.message });
    }
  };

  // Show loading when fetching partner data
  if (id && partnerLoading) {
    return (
      <Card title="Edit Partner">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card title={id ? 'Edit Partner' : 'New Partner'}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ code: '', name: '', phoneNumber: '', address: '', email: '' }}>
        <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Code required' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name required' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phoneNumber" label="Phone Number">
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Invalid email' }]}>
          <Input />
        </Form.Item>

        <Form.Item>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/partners')}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}
