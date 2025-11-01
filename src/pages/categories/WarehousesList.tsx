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
    { title: t('warehouses.address'), dataIndex: 'address', key: 'address' },
    {
      title: t('common.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (value: unknown, record: Warehouse) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? t('common.active') : t('common.inactive')}
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