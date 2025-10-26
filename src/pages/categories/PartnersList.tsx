import React from 'react';
import GenericList from './GenericListFactory';

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Code', dataIndex: 'code', key: 'code' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Phone', dataIndex: 'phoneNumber', key: 'phoneNumber' },
  { title: 'Address', dataIndex: 'address', key: 'address' }
];

export default function PartnersList() {
  return <GenericList endpoint="/partners" title="Partners" columns={columns} createPath="/partners/new" editPath={(id) => `/partners/${id}/edit`} />;
}