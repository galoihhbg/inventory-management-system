import React from 'react';
import { Table, DatePicker, Button, Space, Card, Tag } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { useFilteredList } from '../../api/hooks';
import { ReportFilter, InventoryCheckDiscrepancyReportItem } from '../../types';
import Pagination from '../../components/Pagination';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function InventoryCheckDiscrepancyReport() {
  const { t } = useTranslation();

  const { 
    data, 
    isLoading, 
    isFetching,
    filters, 
    setFilter, 
    pagination,
    refetch 
  } = useFilteredList<InventoryCheckDiscrepancyReportItem, ReportFilter>({
    endpoint: '/reports/inventory-check-discrepancy',
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
      title: t('reports.binCode'),
      dataIndex: 'binCode',
      key: 'binCode',
      width: 120
    },
    {
      title: t('reports.actualQuantity'),
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      width: 120,
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 0
    },
    {
      title: t('reports.discrepancy'),
      dataIndex: 'discrepancy',
      key: 'discrepancy',
      width: 120,
      align: 'right' as const,
      render: (value: number) => {
        const color = value > 0 ? 'green' : value < 0 ? 'red' : 'default';
        return <Tag color={color}>{value?.toLocaleString() || 0}</Tag>;
      }
    }
  ];

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      // Send ISO format dates to API as specified in documentation
      setFilter('fromDate', dates[0].startOf('day').toISOString());
      setFilter('toDate', dates[1].endOf('day').toISOString());
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
        title={t('reports.inventoryCheckDiscrepancyReport')}
        style={{ marginBottom: 16 }}
      >
        <Space>
          <RangePicker 
            placeholder={[t('reports.fromDate'), t('reports.toDate')]}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
          />
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
        rowKey={(record, index) => `${record.itemCode}-${record.warehouseCode}-${record.binCode}-${index}`}
        loading={isLoading} 
        dataSource={data} 
        columns={columns} 
        pagination={false}
        scroll={{ x: 'max-content' }}
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
