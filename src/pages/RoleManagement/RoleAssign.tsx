import React, { useMemo, useState } from 'react';
import { Card, Table, Select, Button, Space, notification } from 'antd';
import { useEntityList, useEntityCRUD } from '../../api/hooks';
import { SaveOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function RoleAssign() {
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useEntityList<any>('/users', { limit: 200 });
  const { data: rolesData, isLoading: rolesLoading } = useEntityList<any>('/roles', { limit: 200 });
  const { update } = useEntityCRUD('/users');

  const users = useMemo(() => usersData?.data || [], [usersData]);
  const roles = useMemo(() => rolesData?.data || [], [rolesData]);

  const [localRoles, setLocalRoles] = useState<Record<string, number | null>>(() => {
    const init: Record<string, number | null> = {};
    (users || []).forEach((u: any) => {
      init[u.id] = u.roleId ?? (u.role ? u.role.id : null);
    });
    return init;
  });

  React.useEffect(() => {
    const init: Record<string, number | null> = {};
    users.forEach((u: any) => {
      init[u.id] = u.roleId ?? (u.role ? u.role.id : null);
    });
    setLocalRoles(init);
  }, [usersData]);

  const handleRoleChange = (userId: number, roleId: number | null) => {
    setLocalRoles((prev) => ({ ...prev, [userId]: roleId }));
  };

  const saveRole = async (userId: number) => {
    const roleId = localRoles[userId];
    if (roleId == null) {
      notification.warning({ message: 'Select a role before saving' });
      return;
    }
    try {
      await update.mutateAsync({ id: userId, payload: { roleId } });
      notification.success({ message: 'Role assigned' });
      refetchUsers();
    } catch (err: any) {
      notification.error({ message: 'Save failed', description: err?.response?.data?.message || err.message });
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      key: 'role',
      render: (_: any, record: any) => (
        <Select
          style={{ width: 240 }}
          value={localRoles[record.id] ?? null}
          placeholder="Select role"
          onChange={(val) => handleRoleChange(record.id, val)}
          loading={rolesLoading}
          allowClear
        >
          {roles.map((r: any) => (
            <Option key={r.id} value={r.id}>
              {r.roleName || r.name || `Role ${r.id}`}
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<SaveOutlined />} type="primary" onClick={() => saveRole(record.id)}>
            Save
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card title="Role Management - Assign Role to Users">
      <Table rowKey="id" dataSource={users} columns={columns} loading={usersLoading || rolesLoading} pagination={{ pageSize: 10 }} />
      <div style={{ marginTop: 12 }}>
        <Space>
          <Button
            onClick={async () => {
              const changed = Object.entries(localRoles)
                .map(([k, v]) => ({ id: Number(k), roleId: v }))
                .filter((x) => x.roleId != null);
              try {
                await Promise.all(changed.map((c) => update.mutateAsync({ id: c.id, payload: { roleId: c.roleId } })));
                notification.success({ message: 'Roles saved' });
                refetchUsers();
              } catch (err: any) {
                notification.error({ message: 'Bulk save failed', description: err?.message });
              }
            }}
          >
            Save all
          </Button>
        </Space>
      </div>
    </Card>
  );
}