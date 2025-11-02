import React, { useEffect, useMemo } from 'react';
import { Card, Form, Input, Button, notification, Select, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityCRUD, useEntityList, useEntityById } from '../../../api/hooks';

const { Option } = Select;

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { create, update } = useEntityCRUD('/users');
  const { data: rolesData, isLoading: rolesLoading } = useEntityList<any>('/roles', { limit: 100 });

  const roles = useMemo(() => rolesData?.data || [], [rolesData]);

  // Fetch user data when editing
  const { data: userData, isLoading: userLoading, error: userError } = useEntityById<any>('/users', id);

  // Show error when fetching user data
  useEffect(() => {
    if (userError) {
      notification.error({ message: 'Could not fetch user', description: userError.message });
    }
  }, [userError]);

  // Fill form when user data is loaded
  useEffect(() => {
    if (userData) {
      const user = userData.data || userData;
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        roleId: user.roleId ?? (user.role ? user.role.id : undefined)
      });
    }
  }, [userData, form]);

  const onFinish = async (values: any) => {
    try {
      if (id) {
        await update.mutateAsync({ id, payload: values });
        notification.success({ message: 'User updated' });
      } else {
        await create.mutateAsync(values);
        notification.success({ message: 'User created' });
      }
      navigate('/users');
    } catch (err: any) {
      notification.error({ message: 'Save failed', description: err?.response?.data?.message || err.message });
    }
  };

  // Show loading when fetching user data
  if (id && userLoading) {
    return (
      <Card title="Edit User">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card title={id ? 'Edit User' : 'New User'}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ username: '', email: '', password: '', roleId: undefined }}
      >
        <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Username required' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Email required' }, { type: 'email', message: 'Invalid email' }]}>
          <Input />
        </Form.Item>

        {!id && (
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Password required' }]}>
            <Input.Password />
          </Form.Item>
        )}

        {id && (
          <Form.Item name="password" label="Password (leave blank to keep current)">
            <Input.Password />
          </Form.Item>
        )}

        <Form.Item name="roleId" label="Role" rules={[{ required: true, message: 'Role required' }]}>
          {rolesLoading ? (
            <Spin />
          ) : (
            <Select placeholder="Select a role" allowClear>
              {roles.map((r: any) => (
                <Option key={r.id} value={r.id}>
                  {r.roleName || r.name || `Role ${r.id}`}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/users')}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}