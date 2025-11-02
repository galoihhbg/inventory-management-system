import React from 'react';
import { Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import GenericList from './GenericListFactory';
import { Warehouse, TableColumn } from '../../types';

export default function WarehousesList() {
  const { t } = useTranslation();

  const columns: TableColumn<Warehouse>[] = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: t('common.code'), dataIndex: 'code', key: 'code', width: 140 },
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    // { title: t('warehouses.address'), dataIndex: 'address', key: 'address' },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (value: unknown, record: Warehouse) => (
        <Tag color={record.status === '1' ? 'green' : 'red'}>
          {record.status === '1' ? 'Active' : 'Inactive'}
        </Tag>
      )
    }
  ];

  return (
    <GenericList<Warehouse>
      endpoint="/warehouses" 
      title={t('warehouses.title')} 
      columns={columns} 
      createPath="/warehouses/new" 
      editPath={(id) => `/warehouses/${id}/edit`} 
    />
  );
}