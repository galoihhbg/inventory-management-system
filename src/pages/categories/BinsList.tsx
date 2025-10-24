import React from 'react';
import GenericList from './GenericListFactory';

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Location Code', dataIndex: 'locationCode', key: 'locationCode' },
  { title: 'Warehouse', dataIndex: 'warehouseId', key: 'warehouseId' },
  { title: 'Description', dataIndex: 'description', key: 'description' }
];

export default function BinsList() {
  return <GenericList endpoint="/bins" title="Bins" columns={columns} createPath="/bins/new" editPath={(id) => `/bins/${id}/edit`} />;
}