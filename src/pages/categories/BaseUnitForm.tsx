import React, { useEffect } from 'react';
import { Card, Form, Input, Button, notification } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityCRUD, useEntityDetail } from '../../api/hooks';
import { BaseUnit } from '../../types';

export default function BaseUnitForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { create, update } = useEntityCRUD('/base-units');
  const { data: baseUnit, isLoading } = useEntityDetail<BaseUnit>('/base-units', id);

  useEffect(() => {
    if (baseUnit) {
      form.setFieldsValue({
        code: baseUnit.code,
        description: baseUnit.description
      });
    }
  }, [baseUnit, form]);

  const onFinish = async (values: any) => {
    try {
      if (id) {
        await update.mutateAsync({ id, payload: values });
        notification.success({ message: 'Updated base unit' });
      } else {
        await create.mutateAsync(values);
        notification.success({ message: 'Created base unit' });
      }
      navigate('/base-units');
    } catch (err: any) {
      notification.error({ message: 'Save failed', description: err?.response?.data?.message || err.message });
    }
  };

  return (
    <Card title={id ? 'Edit Base Unit' : 'New Base Unit'} loading={isLoading}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ code: '', description: '' }}>
        <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Code required' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/base-units')}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}
