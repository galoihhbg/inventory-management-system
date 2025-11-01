import React, { useEffect } from 'react';
import { Card, Form, Input, Button, notification } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityCRUD } from '../../api/hooks';

export default function RoleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { create, update, getOne } = useEntityCRUD('/roles');

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await getOne.mutateAsync(id);
          const payload = res?.data || res;
          form.setFieldsValue({ roleName: (payload as any).roleName || (payload as any).name });
        } catch (err: any) {
          notification.error({ message: 'Could not fetch role', description: err?.message });
        }
      })();
    }
  }, [id]);

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