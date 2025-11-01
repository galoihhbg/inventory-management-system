import React from 'react';
import { Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import GenericList from './GenericListFactory';
import { User, TableColumn } from '../../types';

export default function UsersList() {
  const { t } = useTranslation();

  const columns: TableColumn<User>[] = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: t('auth.username'), dataIndex: 'username', key: 'username' },
    { title: t('auth.email'), dataIndex: 'email', key: 'email' },
    {
      title: t('common.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (value: unknown, record: User) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? t('common.active') : t('common.inactive')}
        </Tag>
      )
    }
  ];

  return (
    <GenericList<User>
      endpoint="/users" 
      title={t('users.title')} 
      columns={columns} 
      createPath="/users/new" 
      editPath={(id) => `/users/${id}/edit`} 
    />
  );
}
