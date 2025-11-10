import React from 'react';
import { Table, DatePicker, Button, Space, Card } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { useFilteredList } from '../../api/hooks';
import { ReportFilter, SalesOrderReportItem } from '../../types';
import Pagination from '../../components/Pagination';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function SalesOrderReport() {
  const { t } = useTranslation();

  const { 
    data, 
    isLoading, 
    isFetching,
    filters, 
    setFilter, 
    pagination,
    refetch 
  } = useFilteredList<SalesOrderReportItem, ReportFilter>({
    endpoint: '/reports/sales-orders',
    initialFilters: { limit: 20, page: 1 }
  });

  const columns = [
    {
      title: t('reports.documentDate'),
      dataIndex: 'documentDate',
      key: 'documentDate',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
    },
    {
      title: t('reports.documentNumber'),
      dataIndex: 'documentNumber',
      key: 'documentNumber',
      width: 150
    },
    {
      title: t('reports.partnerCode'),
      dataIndex: 'partnerCode',
      key: 'partnerCode',
      width: 120
    },
    {
      title: t('reports.partnerName'),
      dataIndex: 'partnerName',
      key: 'partnerName'
    },
    {
      title: t('reports.employeeName'),
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 150
    },
    {
      title: t('reports.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 0
    },
    {
      title: t('reports.totalAmount'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString() || 0
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
        title={t('reports.salesOrderReport')}
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
        rowKey={(record, index) => `${record.documentNumber}-${index}`}
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
