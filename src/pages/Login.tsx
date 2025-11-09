import React from "react";
import { Form, Input, Button, notification, Typography, Divider } from "antd";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

import {
  DatabaseOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

import styled from "styled-components";
import { Card } from "antd";

export const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: #f0f2f5;
  background-image: linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
`;

export const StyledCard = styled(Card)`
  width: 400px;
  max-width: 90%;

  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  border-radius: 16px !important;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.18);

  .ant-card-body {
    padding: 28px !important;
  }
`;

export const LoginHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;

export const DemoCredentials = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #595959;

  .ant-typography-code {
    background: #f0f0f0;
    border: 1px solid #d9d9d9;
    padding: 2px 6px;
  }
`;

export default function LoginPage() {
  const [form] = Form.useForm();
  const { login } = useAuth();
  const { t } = useTranslation();

  const onFinish = async (values: any) => {
    try {
      await login(values.email, values.password);
      notification.success({ message: t("auth.loginSuccess") });
      window.location.href = "/";
    } catch (err: any) {
      notification.error({
        message: t("auth.loginFailed"),
        description: err?.response?.data?.message || err.message,
      });
    }
  };

  return (
    <LoginContainer>
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <LanguageSwitcher size="small" />
      </div>

      <StyledCard>
        <LoginHeader>
          <DatabaseOutlined style={{ fontSize: "32px", color: "#1677ff" }} />
          <Title level={2} style={{ margin: 0, marginLeft: "12px" }}>
            Inventory Manager
          </Title>
        </LoginHeader>
        <Text
          type="secondary"
          style={{
            marginBottom: "24px",
            display: "block",
            textAlign: "center",
          }}
        >
          {t("auth.signInToManage") || "Sign in to manage your inventory"}
        </Text>

        <Form
          form={form}
          name="inventory_login"
          onFinish={onFinish}
          initialValues={{
            email: "testuser@example.com",
            password: "password123",
          }}
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: `${t("auth.email")} ${t("common.required")}`,
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t("auth.email") || "Email"}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: `${t("auth.password")} ${t("common.required")}`,
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t("auth.password") || "Password"}
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              {t("auth.login")}
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: "16px 0" }} />
      </StyledCard>
    </LoginContainer>
  );
}
