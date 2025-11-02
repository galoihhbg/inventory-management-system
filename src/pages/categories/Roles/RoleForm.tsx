import React, { useEffect } from 'react';
import { Card, Form, Input, Button, notification, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityCRUD, useEntityById } from '../../../api/hooks';

export default function RoleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { create, update } = useEntityCRUD('/roles');

  // Fetch role data when editing
  const { data: roleData, isLoading: roleLoading, error: roleError } = useEntityById<any>('/roles', id);

  // Show error when fetching role data
  useEffect(() => {
    if (roleError) {
      notification.error({ message: 'Could not fetch role', description: roleError.message });
    }
  }, [roleError]);

  // Fill form when role data is loaded
  useEffect(() => {
    if (roleData) {
      const role = roleData.data || roleData;
      form.setFieldsValue({ roleName: role.role_name || role.name });
    }
  }, [roleData, form]);

  const onFinish = async (values: any) => {
    try {
      if (id) {
        await update.mutateAsync({ id, payload: values });
        notification.success({ message: 'Role updated' });
      } else {
        await create.mutateAsync(values);
        notification.success({ message: 'Role created' });
      }
      navigate('/roles');
    } catch (err: any) {
      notification.error({ message: 'Save failed', description: err?.response?.data?.message || err.message });
    }
  };

  // Show loading when fetching role data
  if (id && roleLoading) {
    return (
      <Card title="Edit Role">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card title={id ? 'Edit Role' : 'New Role'}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ roleName: '' }}>
        <Form.Item name="roleName" label="Role Name" rules={[{ required: true, message: 'Role name required' }]}>
          <Input />
        </Form.Item>

        <Form.Item>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/roles')}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}