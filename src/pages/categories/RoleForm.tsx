import React, { useEffect } from 'react';
import { Card, Form, Input, Button, notification } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityCRUD, useEntityDetail } from '../../api/hooks';
import { Role } from '../../types';

export default function RoleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { create, update } = useEntityCRUD('/roles');
  const { data: role, isLoading } = useEntityDetail<Role>('/roles', id);

  useEffect(() => {
    if (role) {
      form.setFieldsValue({ roleName: role.roleName || role.name });
    }
  }, [role, form]);

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

  return (
    <Card title={id ? 'Edit Role' : 'New Role'} loading={isLoading}>
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