import React from 'react';
import { Card, Form, Input, Button, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function LoginPage() {
  const [form] = Form.useForm();
  const { login } = useAuth();
  const { t } = useTranslation();

  const onFinish = async (values: any) => {
    try {
      await login(values.email, values.password);
      notification.success({ message: t('auth.loginSuccess') });
      window.location.href = '/';
    } catch (err: any) {
      notification.error({ message: t('auth.loginFailed'), description: err?.response?.data?.message || err.message });
    }
  };

  return (
    <div>
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <LanguageSwitcher size="small" />
      </div>
      <Card style={{ width: 420 }}>
        <h2 className="mb-4 text-center">{t('auth.login')}</h2>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ email: 'testuser@example.com', password: 'password123' }}>
          <Form.Item name="email" label={t('auth.email')} rules={[{ required: true, message: `${t('auth.email')} ${t('common.required')}` }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label={t('auth.password')} rules={[{ required: true, message: `${t('auth.password')} ${t('common.required')}` }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {t('auth.login')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}