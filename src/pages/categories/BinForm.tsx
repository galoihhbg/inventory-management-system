import React, { useEffect, useMemo } from 'react';
import { Card, Form, Input, Button, notification, Select, Spin, Checkbox } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityCRUD, useEntityList } from '../../api/hooks';

const { Option } = Select;

export default function BinForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { create, update, getOne } = useEntityCRUD('/bins');

  const { data: warehousesData, isLoading: warehousesLoading } = useEntityList<any>('/warehouses', { limit: 200 });
  const warehouses = useMemo(() => warehousesData?.data || [], [warehousesData]);

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await getOne.mutateAsync(id);
          const d = res.data || res;
          form.setFieldsValue({
            locationCode: d.locationCode,
            warehouseId: d.warehouseId ?? (d.warehouse ? d.warehouse.id : undefined),
            description: d.description,
            isReceivingBin: d.isReceivingBin || false
          });
        } catch (err: any) {
          notification.error({ message: 'Could not fetch bin', description: err?.message });
        }
      })();
    }
  }, [id]);

  const onFinish = async (values: any) => {
    try {
      if (id) {
        await update.mutateAsync({ id, payload: values });
        notification.success({ message: 'Updated bin' });
      } else {
        await create.mutateAsync(values);
        notification.success({ message: 'Created bin' });
      }
      navigate('/bins');
    } catch (err: any) {
      notification.error({ message: 'Save failed', description: err?.response?.data?.message || err.message });
    }
  };

  return (
    <Card title={id ? 'Edit Bin' : 'New Bin'}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ locationCode: '', warehouseId: undefined, description: '', isReceivingBin: false }}>
        <Form.Item name="locationCode" label="Location Code" rules={[{ required: true, message: 'Location code required' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="warehouseId" label="Warehouse" rules={[{ required: true, message: 'Warehouse required' }]}>
          {warehousesLoading ? (
            <Spin />
          ) : (
            <Select placeholder="Select warehouse">
              {warehouses.map((w: any) => (
                <Option key={w.id} value={w.id}>
                  {w.code ? `${w.code} - ${w.name}` : w.name || `Warehouse ${w.id}`}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item name="isReceivingBin" valuePropName="checked">
          <Checkbox>
            Mark as receiving bin (for incoming inventory)
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/bins')}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}
