import React from 'react';
import { Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import GenericList from '../shared/GenericListFactory';
import { Role, TableColumn } from '../../../types';

export default function RolesList() {
  const { t } = useTranslation();

  const columns: TableColumn<Role>[] = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: t('roles.roleName'), dataIndex: 'role_name', key: 'roleName' },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (value: unknown, record: Role) => (
        <Tag color={record.status === '1' ? 'green' : 'red'}>
          {record.status === '1' ? 'Active' : 'Inactive'}
        </Tag>
      )
    }
  ];

  return (
    <GenericList<Role>
      endpoint="/roles" 
      title={t('roles.title')} 
      columns={columns} 
      createPath="/roles/new" 
      editPath={(id) => `/roles/${id}/edit`} 
    />
  );
}