import React, { useEffect } from 'react';
import { Card, Form, Input, Button, notification, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityCRUD, useEntityById } from '../../../api/hooks';

export default function BaseUnitForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { create, update } = useEntityCRUD('/base-units');

  // Fetch base unit data when editing
  const { data: baseUnitData, isLoading: baseUnitLoading, error: baseUnitError } = useEntityById<any>('/base-units', id);

  // Show error when fetching base unit data
  useEffect(() => {
    if (baseUnitError) {
      notification.error({ message: 'Could not fetch base unit', description: baseUnitError.message });
    }
  }, [baseUnitError]);

  // Fill form when base unit data is loaded
  useEffect(() => {
    if (baseUnitData) {
      const baseUnit = baseUnitData.data || baseUnitData;
      form.setFieldsValue(baseUnit);
    }
  }, [baseUnitData, form]);

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

  // Show loading when fetching base unit data
  if (id && baseUnitLoading) {
    return (
      <Card title="Edit Base Unit">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card title={id ? 'Edit Base Unit' : 'New Base Unit'}>
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
