import React from 'react';
import { Tag } from 'antd';
import GenericList from '../shared/GenericListFactory';
import { Bin, TableColumn } from '../../../types';

const columns: TableColumn<Bin>[] = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Location Code', dataIndex: 'locationCode', key: 'locationCode' },
  { 
    title: 'Warehouse', 
    dataIndex: 'warehouseId', 
    key: 'warehouseId',
    render: (_, record) => record.warehouse?.name || `Warehouse ${record.warehouseId}`
  },
  { title: 'Description', dataIndex: 'description', key: 'description' },
  { 
    title: 'Type', 
    dataIndex: 'isReceivingBin', 
    key: 'isReceivingBin',
    render: (value: unknown, record: Bin) => (
      <Tag color={record.isReceivingBin ? 'green' : 'default'}>
        {record.isReceivingBin ? 'Receiving Bin' : 'Storage Bin'}
      </Tag>
    )
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (value: unknown, record: Bin) => (
      <Tag color={record.status === '1' ? 'green' : 'red'}>
        {record.status === '1' ? 'Active' : 'Inactive'}
      </Tag>
    )
  }
];

export default function BinsList() {
  return (
    <GenericList<Bin>
      endpoint="/bins" 
      title="Bins" 
      columns={columns} 
      createPath="/bins/new" 
      editPath={(id) => `/bins/${id}/edit`} 
    />
  );
}