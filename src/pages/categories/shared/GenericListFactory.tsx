import React, { useState } from 'react';
import { Button, Table, Space, Popconfirm, notification, Input, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, UndoOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFilteredList, useEntityCRUD } from '../../../api/hooks';
import Pagination from '../../../components/Pagination';
import { GenericListProps, TableColumn, ApiError } from '../../../types';

export default function GenericList<T extends { id: number | string }>({ 
  endpoint, 
  title, 
  columns, 
  createPath, 
  editPath,
  showRefresh = true 
}: GenericListProps<T>) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  
  const { 
    data, 
    isLoading, 
    isFetching,
    pagination,
    filters,
    setFilter,
    setFilters,
    goToPage,
    refetch 
  } = useFilteredList<T>({
    endpoint,
    initialFilters: { limit: 20, page: 1, status: '1' }
  });
  
  const { remove, restore } = useEntityCRUD<T>(endpoint);
  const navigate = useNavigate();

  const handleDelete = async (id: number | string) => {
    try {
      await remove.mutateAsync(id);
      notification.success({ message: t('api.deleteSuccess') });
    } catch (err) {
      const error = err as ApiError;
      notification.error({ 
        message: t('api.deleteFailed'), 
        description: error.message 
      });
    }
  };

  const handleRestore = async (id: number | string) => {
    try {
      await restore.mutateAsync(id);
      notification.success({ message: t('api.restoreSuccess') || 'Item restored successfully' });
      refetch();
    } catch (err) {
      const error = err as ApiError;
      notification.error({ 
        message: t('api.restoreFailed') || 'Failed to restore item', 
        description: error.message 
      });
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setFilter('page', page);
    setFilter('limit', pageSize);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key as 'active' | 'inactive');
    setFilters({ 
      page: 1, 
      status: key === 'active' ? '1' : '0' 
    });
  };

  const cols: TableColumn<T>[] = [
    ...columns,
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: unknown, record: T) => (
        <Space>
          {activeTab === 'active' ? (
            <>
              {editPath && (
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => navigate(editPath(record.id))} 
                  title={t('common.edit')}
                />
              )}
              <Popconfirm 
                title={t('common.confirmDelete')} 
                onConfirm={() => handleDelete(record.id)}
                okText={t('common.yes')}
                cancelText={t('common.no')}
              >
                <Button danger icon={<DeleteOutlined />} title={t('common.delete')} />
              </Popconfirm>
            </>
          ) : (
            <Button 
              type="primary" 
              icon={<UndoOutlined />} 
              onClick={() => handleRestore(record.id)}
              title={t('common.restore') || 'Restore'}
            >
              {t('common.restore') || 'Restore'}
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3>{title}</h3>
        <Space>
          <Input.Search 
            placeholder={t('common.search')} 
            onSearch={(v) => setFilter('search', v)} 
            onChange={(e) => !e.target.value && setFilter('search', '')}
            allowClear
            style={{ width: 240 }} 
          />
          {showRefresh && (
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={isFetching}
              title={t('common.refresh')}
            >
              {t('common.refresh')}
            </Button>
          )}
          {activeTab === 'active' && createPath && (
            <Link to={createPath}>
              <Button type="primary" icon={<PlusOutlined />}>
                {t('common.create')}
              </Button>
            </Link>
          )}
        </Space>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange}
        items={[
          {
            key: 'active',
            label: t('common.active') || 'Active',
          },
          {
            key: 'inactive',
            label: t('common.inactive') || 'Inactive',
          }
        ]}
      />

      <Table<T> 
        rowKey="id" 
        loading={isLoading} 
        dataSource={data} 
        columns={cols as never} 
        pagination={false}
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