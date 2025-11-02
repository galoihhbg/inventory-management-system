import React from 'react';
import GenericList from './GenericListFactory';
import { Partner, TableColumn } from '../../types';
import { Tag } from 'antd';

const columns: TableColumn<Partner>[] = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Code', dataIndex: 'code', key: 'code' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Address', dataIndex: 'address', key: 'address' },
  { title: 'Phone', dataIndex: 'phoneNumber', key: 'phone' },
  // { title: 'Email', dataIndex: 'email', key: 'email' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (value: unknown, record: Partner) => (
      <Tag color={record.status === '1' ? 'green' : 'red'}>
        {record.status === '1' ? 'Active' : 'Inactive'}
      </Tag>
    )
  }
];

export default function PartnersList() {
  return (
    <GenericList<Partner>
      endpoint="/partners" 
      title="Partners" 
      columns={columns} 
      createPath="/partners/new" 
      editPath={(id) => `/partners/${id}/edit`} 
    />
  );
}