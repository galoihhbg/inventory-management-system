import React from 'react';
import { Tag } from 'antd';
import GenericList from './GenericListFactory';

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Location Code', dataIndex: 'locationCode', key: 'locationCode' },
  { title: 'Warehouse', dataIndex: 'warehouseId', key: 'warehouseId' },
  { title: 'Description', dataIndex: 'description', key: 'description' },
  { 
    title: 'Type', 
    dataIndex: 'isReceivingBin', 
    key: 'isReceivingBin',
    render: (isReceiving: boolean) => (
      <Tag color={isReceiving ? 'green' : 'default'}>
        {isReceiving ? 'Receiving Bin' : 'Storage Bin'}
      </Tag>
    )
  }
];

export default function BinsList() {
  return <GenericList endpoint="/bins" title="Bins" columns={columns} createPath="/bins/new" editPath={(id) => `/bins/${id}/edit`} />;
}