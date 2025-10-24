import React from 'react';
import { Card, Form, Input, Button, notification } from 'antd';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form] = Form.useForm();
  const { login } = useAuth();

  const onFinish = async (values: any) => {
    try {
      await login(values.email, values.password);
      notification.success({ message: 'Login successful' });
      window.location.href = '/';
    } catch (err: any) {
      notification.error({ message: 'Login failed', description: err?.response?.data?.message || err.message });
    }
  };

  return (
    <Card style={{ width: 420 }}>
      <h2 className="mb-4 text-center">Sign in to Inventory</h2>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ email: 'testuser@example.com', password: 'password123' }}>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Email required' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Password required' }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Log in
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}