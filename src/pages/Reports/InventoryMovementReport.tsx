import React from 'react';
import { Table, DatePicker, Button, Space, Card, Select, Input } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { useFilteredList } from '../../api/hooks';
import { ReportFilter, InventoryMovementReportItem, Warehouse, Item } from '../../types';
import Pagination from '../../components/Pagination';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function InventoryMovementReport() {
  const { t } = useTranslation();

  // Fetch warehouses for filter
  const { data: warehouses } = useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const res = await client.get('/warehouses');
      return res.data?.data || res.data || [];
    }
  });

  // Fetch items for filter
  const { data: items } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await client.get('/items');
      return res.data?.data || res.data || [];
    }
  });

  const { 
    data, 
    isLoading, 
    isFetching,
    filters, 
    setFilter, 
    pagination,
    refetch 
  } = useFilteredList<InventoryMovementReportItem, ReportFilter>({
    endpoint: '/reports/inventory-movement',
    initialFilters: { limit: 20, page: 1 }
  });

  const columns = [
    {
      title: t('reports.itemCode'),
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 120,
      fixed: 'left' as const
    },
    {
      title: t('reports.itemName'),
      dataIndex: 'itemName',
      key: 'itemName',
      width: 200,
      fixed: 'left' as const
    },
    {
      title: t('reports.warehouseCode'),
      dataIndex: 'warehouseCode',
      key: 'warehouseCode',
      width: 120
    },
    {
      title: t('reports.openingQuantity'),
      dataIndex: 'openingQuantity',
      key: 'openingQuantity',
      width: 120,
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 0
    },
    {
      title: t('reports.openingValue'),
      dataIndex: 'openingValue',
      key: 'openingValue',
      width: 150,
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 0
    },
    {
      title: t('reports.inboundQuantity'),
      dataIndex: 'inboundQuantity',
      key: 'inboundQuantity',
      width: 120,
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 0
    },
    {
      title: t('reports.inboundValue'),
      dataIndex: 'inboundValue',
      key: 'inboundValue',
      width: 150,
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 0
    },
    {
      title: t('reports.outboundQuantity'),
      dataIndex: 'outboundQuantity',
      key: 'outboundQuantity',
      width: 120,
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 0
    },
    {
      title: t('reports.outboundValue'),
      dataIndex: 'outboundValue',
      key: 'outboundValue',
      width: 150,
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 0
    },
    {
      title: t('reports.stockQuantity'),
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 120,
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 0
    },
    {
      title: t('reports.stockValue'),
      dataIndex: 'stockValue',
      key: 'stockValue',
      width: 150,
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 0
    }
  ];

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilter('fromDate', dates[0].format('YYYY-MM-DD'));
      setFilter('toDate', dates[1].format('YYYY-MM-DD'));
    } else {
      setFilter('fromDate', undefined);
      setFilter('toDate', undefined);
    }
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setFilter('page', page);
    setFilter('limit', pageSize);
  };

  return (
    <div>
      <Card 
        title={t('reports.inventoryMovementReport')}
        style={{ marginBottom: 16 }}
      >
        <Space wrap>
          <RangePicker 
            placeholder={[t('reports.fromDate'), t('reports.toDate')]}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
          />
          <Select
            placeholder={t('reports.selectWarehouse')}
            style={{ width: 200 }}
            allowClear
            showSearch
            optionFilterProp="children"
            onChange={(value) => setFilter('warehouseId', value)}
            value={filters.warehouseId}
          >
            {warehouses?.map((wh) => (
              <Option key={wh.id} value={wh.id}>
                {wh.code} - {wh.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder={t('reports.selectItem')}
            style={{ width: 200 }}
            allowClear
            showSearch
            optionFilterProp="children"
            onChange={(value) => setFilter('itemId', value)}
            value={filters.itemId}
          >
            {items?.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.code} - {item.name}
              </Option>
            ))}
          </Select>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => refetch()}
            loading={isFetching}
          >
            {t('common.refresh')}
          </Button>
          <Button 
            type="primary"
            icon={<DownloadOutlined />}
            disabled={!data || data.length === 0}
          >
            {t('reports.export')}
          </Button>
        </Space>
      </Card>

      <Table 
        rowKey={(record, index) => `${record.itemCode}-${record.warehouseCode}-${index}`}
        loading={isLoading} 
        dataSource={data} 
        columns={columns} 
        pagination={false}
        scroll={{ x: 1800 }}
      />
      
      {pagination && (
        <div className="mt-4">
          <Pagination
            current={pagination.page || filters.page || 1}
            pageSize={pagination.limit || filters.limit || 20}
            total={pagination.total || 0}
            onChange={handlePaginationChange}
          />
        </div>
      )}
    </div>
  );
}
