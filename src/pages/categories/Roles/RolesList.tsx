import React from "react";
import { Button, Table, Space, Popconfirm, notification, Input } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFilteredList, useEntityCRUD } from "../../../api/hooks";

export default function RolesList() {
  const { t } = useTranslation();
  const { data, isLoading, setFilter } = useFilteredList<any>({
    endpoint: "/roles",
    initialFilters: { limit: 1, page: 2 },
  });
  const { remove } = useEntityCRUD("/roles");
  const navigate = useNavigate();

  const handleDelete = async (id: number) => {
    try {
      await remove.mutateAsync(id);
      notification.success({ message: t("common.success") });
    } catch (err: any) {
      notification.error({
        message: t("roles.deleteFailed"),
        description: err?.response?.data?.message || err.message,
      });
    }
  };

  const columns = [
    // { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: t("roles.roleName"), dataIndex: "role_name", key: "roleName" },
    {
      title: t("common.actions"),
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/roles/${record.id}/edit`)}
          />
          <Popconfirm
            title={t("roles.confirmDelete")}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3>{t("roles.title")}</h3>
        <Space>
          <Input.Search
            placeholder={t("common.search")}
            onSearch={(v) => setFilter("search", v)}
            onChange={(e) => !e.target.value && setFilter("search", "")}
            allowClear
            style={{ width: 240 }}
          />
          <Link to="/roles/new">
            <Button type="primary" icon={<PlusOutlined />}>
              {t("roles.newRole")}
            </Button>
          </Link>
        </Space>
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
