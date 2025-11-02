import React from 'react';
import { Tag } from 'antd';
import GenericList from '../shared/GenericListFactory';
import { BaseUnit, TableColumn } from '../../../types';

const columns: TableColumn<BaseUnit>[] = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Code', dataIndex: 'code', key: 'code' },
  { title: 'Description', dataIndex: 'description', key: 'description' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (value: unknown, record: BaseUnit) => (
      <Tag color={record.status === '1' ? 'green' : 'red'}>
        {record.status === '1' ? 'Active' : 'Inactive'}
      </Tag>
    )
  }
];

export default function BaseUnitsList() {
  return <GenericList<BaseUnit> endpoint="/base-units" title="Base Units" columns={columns} createPath="/base-units/new" editPath={(id) => `/base-units/${id}/edit`} />;
}