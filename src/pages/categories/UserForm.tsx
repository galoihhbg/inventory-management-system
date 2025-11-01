import React, { useEffect, useMemo } from 'react';
import { Card, Form, Input, Button, notification, Select, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityCRUD, useEntityList } from '../../api/hooks';

const { Option } = Select;

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { create, update, getOne } = useEntityCRUD('/users');
  const { data: rolesData, isLoading: rolesLoading } = useEntityList<any>('/roles', { limit: 100 });

  const roles = useMemo(() => rolesData?.data || [], [rolesData]);

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await getOne.mutateAsync(id);
          const payload = res?.data || res;
          form.setFieldsValue({
            username: (payload as any).username,
            email: (payload as any).email,
            roleId: (payload as any).roleId ?? ((payload as any).role ? (payload as any).role.id : undefined)
          });
        } catch (err: any) {
          notification.error({ message: 'Could not fetch user', description: err?.message });
        }
      })();
    }
  }, [id]);

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