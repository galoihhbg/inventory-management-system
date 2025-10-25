import React from 'react';
import { Row, Col, Card, Statistic, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';

export default function Dashboard() {
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
      <h2 className="mb-6">Dashboard</h2>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic title="Warehouses" value={warehousesCount || 0} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Items" value={itemsCount || 0} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Health" value={health?.status || 'unknown'} />
            </Card>
          </Col>
        </Row>

        <Card>
          <h3>Quick actions</h3>
          <p>Create, edit, and manage your inventory using the left navigation. The center grid in each category shows the data and supports inline interactions.</p>
        </Card>
      </Space>
    </div>
  );
}