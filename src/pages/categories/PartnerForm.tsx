import React, { useEffect } from 'react';
import { Card, Form, Input, Button, notification } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityCRUD, useEntityDetail } from '../../api/hooks';
import { Partner } from '../../types';

export default function PartnerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { create, update } = useEntityCRUD('/partners');
  const { data: partner, isLoading } = useEntityDetail<Partner>('/partners', id);

  useEffect(() => {
    if (partner) {
      form.setFieldsValue({
        code: partner.code,
        name: partner.name,
        phoneNumber: partner.phoneNumber,
        address: partner.address,
        email: partner.email
      });
    }
  }, [partner, form]);

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

  return (
    <Card title={id ? 'Edit Partner' : 'New Partner'} loading={isLoading}>
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
