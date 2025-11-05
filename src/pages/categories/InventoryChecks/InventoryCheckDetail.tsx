import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Space, Tag, notification, Popconfirm, Modal, Form, Select, InputNumber } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, ToolOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEntityList } from '../../../api/hooks';
import client from '../../../api/client';

const { Option } = Select;

export default function InventoryCheckDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [processingDetailId, setProcessingDetailId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [check, setCheck] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { data: partnersData } = useEntityList<any>('/partners', { limit: 200 });
  const partners = partnersData?.data || [];

  useEffect(() => {
    fetchCheck();
  }, [id]);

  const fetchCheck = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/inventory-checks/${id}`);
      const data = response.data?.inventoryCheck || response.data;
      setCheck(data);
    } catch (err: any) {
      notification.error({ 
        message: t('api.fetchFailed'),
        description: err?.response?.data?.error || err.message 
      });
      navigate('/inventory-checks');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCheck = async () => {
    try {
      await client.post(`/inventory-checks/${id}/complete`, {});
      notification.success({ message: t('inventoryChecks.checkCompleted') });
      fetchCheck();
    } catch (err: any) {
      notification.error({ 
        message: t('api.updateFailed'),
        description: err.response?.data?.error || err.message 
      });
    }
  };

  const handleDelete = async () => {
    try {
      await client.delete(`/inventory-checks/${id}`);
      notification.success({ message: t('inventoryChecks.checkDeleted') });
      navigate('/inventory-checks');
    } catch (err: any) {
      notification.error({ 
        message: t('api.deleteFailed'),
        description: err.response?.data?.error || err.message 
      });
    }
  };

  const handleProcessDiscrepancy = (detailId: number) => {
    setProcessingDetailId(detailId);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const payload: any = {
        detailId: processingDetailId,
        action: values.action
      };

      if (values.action !== 'ignore' && values.partnerId) {
        payload.createOrderRequest = {
          partnerId: values.partnerId
        };
      }

      await client.post('/inventory-checks/process-discrepancy', payload);
      notification.success({ message: t('inventoryChecks.discrepancyProcessed') });
      setIsModalVisible(false);
      fetchCheck();
    } catch (err: any) {
      notification.error({ 
        message: t('api.updateFailed'),
        description: err.response?.data?.error || err.message 
      });
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setProcessingDetailId(null);
  };

  const detailColumns = [
    {
      title: t('inventoryChecks.item'),
      key: 'item',
      render: (_: unknown, record: any) => (
        <div>
          <div><strong>{record.item?.code}</strong></div>
          <div>{record.item?.name}</div>
        </div>
      )
    },
    {
      title: t('inventoryChecks.bin'),
      key: 'bin',
      render: (_: unknown, record: any) => record.bin?.code || record.bin?.locationCode || '-'
    },
    {
      title: t('inventoryChecks.actualQuantity'),
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      align: 'right' as const
    },
    {
      title: t('inventoryChecks.bookQuantity'),
      dataIndex: 'bookQuantity',
      key: 'bookQuantity',
      align: 'right' as const,
      render: (value: number | null) => value !== null ? value : '-'
    },
    {
      title: t('inventoryChecks.discrepancy'),
      dataIndex: 'discrepancy',
      key: 'discrepancy',
      align: 'right' as const,
      render: (value: number | null) => {
        if (value === null) return '-';
        if (value === 0) {
          return <Tag color="green">{t('inventoryChecks.noDiscrepancy')} (0)</Tag>;
        } else if (value > 0) {
          return <Tag color="orange">{t('inventoryChecks.surplus')} (+{value})</Tag>;
        } else {
          return <Tag color="red">{t('inventoryChecks.shortage')} ({value})</Tag>;
        }
      }
    },
    {
      title: t('inventoryChecks.discrepancyHandled'),
      dataIndex: 'discrepancyHandled',
      key: 'discrepancyHandled',
      render: (handled: boolean) => (
        <Tag color={handled ? 'green' : 'default'}>
          {handled ? t('common.yes') : t('common.no')}
        </Tag>
      )
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: unknown, record: any) => {
        if (check?.checkStatus !== 'completed') return null;
        if (record.discrepancyHandled) return null;
        if (record.discrepancy === 0) return null;

        return (
          <Button 
            size="small"
            icon={<ToolOutlined />}
            onClick={() => handleProcessDiscrepancy(record.id)}
          >
            {t('inventoryChecks.processDiscrepancy')}
          </Button>
        );
      }
    }
  ];

  if (loading || !check) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/inventory-checks')}>
          {t('common.back')}
        </Button>
      </div>

      <Card title={t('inventoryChecks.checkDetails')} style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <strong>{t('common.code')}:</strong> {check.code}
          </div>
          <div>
            <strong>{t('inventoryChecks.checkStatus')}:</strong>{' '}
            <Tag color={check.checkStatus === 'completed' ? 'blue' : check.checkStatus === 'processed' ? 'green' : 'orange'}>
              {t(`inventoryChecks.${check.checkStatus}`)}
            </Tag>
          </div>
          <div>
            <strong>{t('inventoryChecks.fromDate')}:</strong> {new Date(check.fromDate).toLocaleString()}
          </div>
          <div>
            <strong>{t('inventoryChecks.toDate')}:</strong> {new Date(check.toDate).toLocaleString()}
          </div>
          <div>
            <strong>{t('inventoryChecks.warehouse')}:</strong> {check.warehouse?.name || '-'}
          </div>
          <div>
            <strong>{t('inventoryChecks.checker')}:</strong> {check.checker?.email || '-'}
          </div>
          {check.description && (
            <div style={{ gridColumn: '1 / -1' }}>
              <strong>{t('common.description')}:</strong> {check.description}
            </div>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <Space>
            {check.checkStatus === 'draft' && (
              <>
                <Popconfirm
                  title={t('inventoryChecks.confirmComplete')}
                  onConfirm={handleCompleteCheck}
                  okText={t('common.yes')}
                  cancelText={t('common.no')}
                >
                  <Button type="primary" icon={<CheckOutlined />}>
                    {t('inventoryChecks.completeCheck')}
                  </Button>
                </Popconfirm>
                <Button 
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/inventory-checks/${id}/edit`)}
                >
                  {t('common.edit')}
                </Button>
                <Popconfirm
                  title={t('common.confirmDelete')}
                  onConfirm={handleDelete}
                  okText={t('common.yes')}
                  cancelText={t('common.no')}
                >
                  <Button danger icon={<DeleteOutlined />}>
                    {t('common.delete')}
                  </Button>
                </Popconfirm>
              </>
            )}
          </Space>
        </div>
      </Card>

      <Card title={t('inventoryChecks.checkDetails')}>
        <Table
          columns={detailColumns}
          dataSource={check.details || []}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title={t('inventoryChecks.processDiscrepancy')}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="action"
            label={t('inventoryChecks.action')}
            rules={[{ required: true, message: t('validation.required', { field: 'Action' }) }]}
          >
            <Select placeholder={t('inventoryChecks.action')}>
              <Option value="ignore">{t('inventoryChecks.ignore')}</Option>
              <Option value="purchase_order">{t('inventoryChecks.purchaseOrder')}</Option>
              <Option value="sales_order">{t('inventoryChecks.salesOrder')}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.action !== currentValues.action}
          >
            {({ getFieldValue }) => {
              const action = getFieldValue('action');
              if (action === 'ignore') return null;

              return (
                <Form.Item
                  name="partnerId"
                  label={t('partners.title')}
                  rules={[{ required: true, message: t('validation.required', { field: 'Partner' }) }]}
                >
                  <Select placeholder={t('partners.selectPartner')}>
                    {partners.map((partner: any) => (
                      <Option key={partner.id} value={partner.id}>
                        {partner.code} - {partner.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              );
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
