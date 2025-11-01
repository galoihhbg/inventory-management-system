import React from 'react';
import { Card, Button, Space, Typography, Divider, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../i18n/useI18n';

const { Title, Paragraph, Text } = Typography;

export default function I18nDemo() {
  const { t } = useTranslation();
  const { getCurrentLanguage, isVietnamese, isEnglish } = useI18n();

  const demoTexts = [
    { key: 'common.create', category: 'Common' },
    { key: 'common.edit', category: 'Common' },
    { key: 'common.delete', category: 'Common' },
    { key: 'auth.login', category: 'Auth' },
    { key: 'auth.logout', category: 'Auth' },
    { key: 'navigation.dashboard', category: 'Navigation' },
    { key: 'navigation.warehouses', category: 'Navigation' },
    { key: 'navigation.bins', category: 'Navigation' },
    { key: 'bins.newBin', category: 'Bins' },
    { key: 'bins.area', category: 'Bins' },
    { key: 'bins.row', category: 'Bins' },
    { key: 'bins.floor', category: 'Bins' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>
          🌍 Internationalization Demo
        </Title>
        
        <Paragraph>
          Current Language: <Text code>{getCurrentLanguage()}</Text>
          {isVietnamese() && <Text type="success"> (Tiếng Việt)</Text>}
          {isEnglish() && <Text type="success"> (English)</Text>}
        </Paragraph>

        <Space>
          <LanguageSwitcher />
          <Text type="secondary">← Try switching languages!</Text>
        </Space>

        <Divider />

        <Title level={3}>{t('common.language')} Test</Title>
        
        <Row gutter={[16, 16]}>
          {demoTexts.map((item) => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.key}>
              <Card size="small" title={item.category}>
                <Text strong>{item.key}</Text>
                <br />
                <Text style={{ color: '#1890ff' }}>{t(item.key)}</Text>
              </Card>
            </Col>
          ))}
        </Row>

        <Divider />

        <Title level={4}>Interactive Example</Title>
        <Space direction="vertical">
          <Button type="primary">{t('common.create')}</Button>
          <Button>{t('common.edit')}</Button>
          <Button danger>{t('common.delete')}</Button>
        </Space>
      </Card>
    </div>
  );
}