import React, { useEffect } from 'react';
import { Card, Form, Input, Button, notification } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityCRUD } from '../../api/hooks';

export default function PartnerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { create, update, getOne } = useEntityCRUD('/partners');

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await getOne.mutateAsync(id);
          const d = res.data || res;
          form.setFieldsValue(d);
        } catch (err: any) {
          notification.error({ message: 'Could not fetch partner', description: err?.message });
        }
      })();
    }
  }, [id]);

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
