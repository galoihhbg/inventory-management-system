import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  return (
    <Result
      status="403"
      title="403"
      subTitle={t('auth.unauthorized')}
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          {t('common.back')}
        </Button>
      }
    />
  );
}