import React from 'react';
import GenericList from './GenericListFactory';
import { Partner, TableColumn } from '../../types';
import { Tag } from 'antd';

const columns: TableColumn<Partner>[] = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Code', dataIndex: 'code', key: 'code' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Type', dataIndex: 'type', key: 'type' },
  { title: 'Phone', dataIndex: 'phone', key: 'phone' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  {
    title: 'Status',
    dataIndex: 'isActive',
    key: 'isActive',
    render: (value: unknown, record: Partner) => (
      <Tag color={record.isActive ? 'green' : 'red'}>
        {record.isActive ? 'Active' : 'Inactive'}
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