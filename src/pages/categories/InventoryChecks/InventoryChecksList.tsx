import React from 'react';
import { Button, Table, Space, Input, Select, Tag } from 'antd';
import { PlusOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFilteredList } from '../../../api/hooks';
import { InventoryCheck, InventoryCheckFilter } from '../../../types';
import Pagination from '../../../components/Pagination';

const { Option } = Select;

export default function InventoryChecksList() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { 
    data, 
    isLoading, 
    isFetching,
    filters, 
    setFilter, 
    pagination,
    refetch 
  } = useFilteredList<InventoryCheck, InventoryCheckFilter>({
    endpoint: '/inventory-checks',
    initialFilters: { limit: 20, page: 1 }
  });

  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id', 
      width: 80 
    },
    { 
      title: t('common.code'), 
      dataIndex: 'code', 
      key: 'code',
      width: 150
    },
    {
      title: t('inventoryChecks.fromDate'),
      dataIndex: 'fromDate',
      key: 'fromDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: t('inventoryChecks.toDate'),
      dataIndex: 'toDate',
      key: 'toDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: t('inventoryChecks.warehouse'),
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
      render: (_: unknown, record: InventoryCheck) => record.warehouse?.name || '-'
    },
    {
      title: t('inventoryChecks.checker'),
      dataIndex: ['checker', 'email'],
      key: 'checker',
      render: (_: unknown, record: InventoryCheck) => record.checker?.email || '-'
    },
    {
      title: t('inventoryChecks.checkStatus'),
      dataIndex: 'checkStatus',
      key: 'checkStatus',
      render: (status: string) => {
        let color = 'default';
        if (status === 'completed') color = 'blue';
        else if (status === 'processed') color = 'green';
        else if (status === 'draft') color = 'orange';
        return <Tag color={color}>{t(`inventoryChecks.${status}`)}</Tag>;
      }
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_: unknown, record: InventoryCheck) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/inventory-checks/${record.id}`)}
            title={t('common.view')}
          />
        </Space>
      )
    }
  ];

  const handleRefresh = () => {
    refetch();
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setFilter('page', page);
    setFilter('limit', pageSize);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>{t('inventoryChecks.title')}</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={isFetching}>
            {t('common.refresh')}
          </Button>
          <Link to="/inventory-checks/new">
            <Button type="primary" icon={<PlusOutlined />}>
              {t('inventoryChecks.newCheck')}
            </Button>
          </Link>
        </Space>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Select
            placeholder={t('inventoryChecks.checkStatus')}
            style={{ width: 200 }}
            allowClear
            value={filters.checkStatus}
            onChange={(value) => setFilter('checkStatus', value)}
          >
            <Option value="draft">{t('inventoryChecks.draft')}</Option>
            <Option value="completed">{t('inventoryChecks.completed')}</Option>
            <Option value="processed">{t('inventoryChecks.processed')}</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={isLoading}
        pagination={false}
      />

      {pagination && (
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination
            current={pagination.page || 1}
            pageSize={pagination.limit || 20}
            total={pagination.total || 0}
            onChange={handlePaginationChange}
            showSizeChanger
            showQuickJumper
          />
        </div>
      )}
    </div>
  );
}
