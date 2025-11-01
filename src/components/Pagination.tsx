import React from 'react';
import { Pagination as AntPagination, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { PaginationProps } from '../types';

const { Option } = Select;

interface CustomPaginationProps {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  pageSizeOptions?: string[];
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
  className?: string;
}

const defaultPageSizeOptions = ['10', '20', '50', '100'];

export default function Pagination({
  current,
  pageSize,
  total,
  showSizeChanger = true,
  showQuickJumper = true,
  showTotal = true,
  pageSizeOptions = defaultPageSizeOptions,
  onChange,
  onShowSizeChange,
  className = ''
}: CustomPaginationProps) {
  const { t } = useTranslation();
  
  const showTotalFunction = showTotal 
    ? (total: number, range: [number, number]) => 
        t('pagination.showingItems', { 
          start: range[0], 
          end: range[1], 
          total 
        })
    : undefined;

  const handleChange = (page: number, size?: number) => {
    onChange?.(page, size || pageSize);
  };

  const handleShowSizeChange = (current: number, size: number) => {
    onShowSizeChange?.(current, size);
    onChange?.(1, size); // Reset to first page when changing page size
  };

  if (total === 0) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-4">
        {showSizeChanger && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('pagination.show')}:</span>
            <Select
              value={pageSize.toString()}
              onChange={(value) => handleShowSizeChange(current, parseInt(value, 10))}
              style={{ width: 80 }}
            >
              {pageSizeOptions.map(option => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
            <span className="text-sm text-gray-600">{t('pagination.perPage')}</span>
          </div>
        )}
        
        {showTotal && (
          <span className="text-sm text-gray-600">
            {showTotalFunction?.(total, [
              (current - 1) * pageSize + 1,
              Math.min(current * pageSize, total)
            ])}
          </span>
        )}
      </div>

      <AntPagination
        current={current}
        pageSize={pageSize}
        total={total}
        showQuickJumper={showQuickJumper}
        showSizeChanger={false} // We handle this ourselves
        onChange={handleChange}
        showTotal={undefined} // We handle this ourselves
      />
    </div>
  );
}