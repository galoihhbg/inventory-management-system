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
      render: (value: unknown, record: Item) => record.baseUnit?.code || '-'
    },
    // {
    //   title: t('items.unitPrice'),
    //   dataIndex: 'unitPrice',
    //   key: 'unitPrice',
    //   render: (value: unknown, record: Item) => 
    //     record.unitPrice ? `$${record.unitPrice.toFixed(2)}` : '-'
    // },
   {
         title: t('common.status'),
         dataIndex: 'status',
         key: 'status',
         render: (value: unknown, record: Item) => (
           <Tag color={record.status === '1' ? 'green' : 'red'}>
             {record.status === '1' ? 'Active' : 'Inactive'}
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