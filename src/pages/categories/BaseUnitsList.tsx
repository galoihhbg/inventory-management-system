import React from 'react';
import GenericList from './GenericListFactory';

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Code', dataIndex: 'code', key: 'code' },
  { title: 'Description', dataIndex: 'description', key: 'description' }
];

export default function BaseUnitsList() {
  return <GenericList endpoint="/base-units" title="Base Units" columns={columns} createPath="/base-units/new" editPath={(id) => `/base-units/${id}/edit`} />;
}