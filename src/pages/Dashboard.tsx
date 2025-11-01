import React from 'react';
import { Row, Col, Card, Statistic, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import client from '../api/client';

export default function Dashboard() {
  const { t } = useTranslation();
  
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await client.get('/health');
      return res.data;
    }
  });

  const fetchCount = async (endpoint: string) => {
    try {
      const res = await client.get(`${endpoint}?limit=1`);
      return res.data?.meta?.total || res.data?.data?.length || 0;
    } catch {
      return 0;
    }
  };

  const { data: warehousesCount } = useQuery({
    queryKey: ['count', 'warehouses'],
    queryFn: () => fetchCount('/warehouses')
  });
  
  const { data: itemsCount } = useQuery({
    queryKey: ['count', 'items'],
    queryFn: () => fetchCount('/items')
  });

  return (
    <div>
      <h2 className="mb-6">{t('navigation.dashboard')}</h2>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic title={t('navigation.warehouses')} value={warehousesCount || 0} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title={t('navigation.items')} value={itemsCount || 0} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title={t('dashboard.health')} value={health?.status || t('dashboard.unknown')} />
            </Card>
          </Col>
        </Row>

        <Card>
          <h3>{t('dashboard.quickActions')}</h3>
          <p>{t('dashboard.quickActionsDescription')}</p>
        </Card>
      </Space>
    </div>
  );
}