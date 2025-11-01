import React from 'react';
import { Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import GenericList from './GenericListFactory';
import { Item, TableColumn } from '../../types';

export default function ItemsList() {
  const { t } = useTranslation();

  const columns: TableColumn<Item>[] = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: t('common.code'), dataIndex: 'code', key: 'code' },
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    { 
      title: t('items.baseUnit'), 
      dataIndex: 'baseUnit', 
      key: 'baseUnitName',
      render: (value: unknown, record: Item) => record.baseUnit?.symbol || record.baseUnit?.name || '-'
    },
    {
      title: t('items.unitPrice'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (value: unknown, record: Item) => 
        record.unitPrice ? `$${record.unitPrice.toFixed(2)}` : '-'
    },
    {
      title: t('common.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (value: unknown, record: Item) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? t('common.active') : t('common.inactive')}
        </Tag>
      )
    }
  ];

  return (
    <GenericList<Item>
      endpoint="/items" 
      title={t('items.title')} 
      columns={columns} 
      createPath="/items/new" 
      editPath={(id) => `/items/${id}/edit`} 
    />
  );
}