import React from 'react';
import GenericList from './GenericListFactory';

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Code', dataIndex: 'code', key: 'code' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Base Unit', dataIndex: 'baseUnitName', key: 'baseUnitName' }
];

export default function ItemsList() {
  return <GenericList endpoint="/items" title="Items" columns={columns} createPath="/items/new" editPath={(id) => `/items/${id}/edit`} />;
}