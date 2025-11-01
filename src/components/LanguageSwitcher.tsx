import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

interface LanguageSwitcherProps {
  size?: 'small' | 'middle' | 'large';
  showIcon?: boolean;
}

export default function LanguageSwitcher({ 
  size = 'middle', 
  showIcon = true 
}: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <Select
      value={i18n.language}
      onChange={handleLanguageChange}
      size={size}
      style={{ minWidth: 120 }}
      suffixIcon={showIcon ? <GlobalOutlined /> : undefined}
    >
      <Option value="vi">
        🇻🇳 Tiếng Việt
      </Option>
      <Option value="en">
        🇺🇸 English
      </Option>
    </Select>
  );
}