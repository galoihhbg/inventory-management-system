# Hướng dẫn sử dụng chức năng đa ngôn ngữ (i18n)

## Tổng quan
Ứng dụng hiện tại đã được tích hợp chức năng đa ngôn ngữ hỗ trợ:
- 🇻🇳 **Tiếng Việt** (mặc định)
- 🇺🇸 **English**

## Cách sử dụng

### 1. Chuyển đổi ngôn ngữ
- Ở **TopBar** (thanh trên): Click vào dropdown ngôn ngữ bên cạnh avatar
- Ở **Login Page**: Click vào dropdown ngôn ngữ ở góc phải trên
- Ngôn ngữ được chọn sẽ được lưu tự động trong localStorage

### 2. Thêm text mới cần dịch

#### Bước 1: Thêm key vào file ngôn ngữ
Chỉnh sửa file `src/i18n/locales/en.json` và `src/i18n/locales/vi.json`:

```json
// en.json
{
  "module": {
    "newFeature": "New Feature",
    "buttonText": "Click Me"
  }
}

// vi.json  
{
  "module": {
    "newFeature": "Tính năng mới",
    "buttonText": "Nhấn vào đây"
  }
}
```

#### Bước 2: Sử dụng trong component
```tsx
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('module.newFeature')}</h1>
      <Button>{t('module.buttonText')}</Button>
    </div>
  );
}
```

### 3. Sử dụng hook tiện ích
```tsx
import { useI18n } from '../i18n/useI18n';

export default function MyComponent() {
  const { t, changeLanguage, isVietnamese } = useI18n();
  
  return (
    <div>
      <p>{t('common.loading')}</p>
      {isVietnamese() && <p>Hiển thị chỉ khi là tiếng Việt</p>}
      <Button onClick={() => changeLanguage('en')}>
        Switch to English
      </Button>
    </div>
  );
}
```

## Cấu trúc file

```
src/
├── i18n/
│   ├── index.ts          # Cấu hình chính i18next
│   ├── useI18n.ts        # Hook tiện ích
│   └── locales/
│       ├── en.json       # Bản dịch tiếng Anh
│       └── vi.json       # Bản dịch tiếng Việt
```

## Các module đã được dịch

### ✅ Đã hoàn thành:
- **Common**: Các text chung (Create, Edit, Cancel, etc.)
- **Auth**: Login, Logout, Username, Password
- **Navigation**: Menu sidebar
- **Bins**: Form tạo/sửa vị trí bin
- **TopBar**: Thanh điều hướng trên
- **Login Page**: Trang đăng nhập

### ⏳ Cần bổ sung:
- Warehouses form
- Items form  
- Partners form
- Users form
- Roles form
- Purchase Orders
- Inventory pages
- Settings pages
- Error messages
- Validation messages

## Ví dụ thực tế

### BinForm đã được áp dụng i18n:
```tsx
// Trước khi có i18n
<Form.Item 
  name="area" 
  label="Khu vực" 
  rules={[{ required: true, message: 'Khu vực là bắt buộc' }]}
>

// Sau khi có i18n  
<Form.Item 
  name="area" 
  label={t('bins.area')} 
  rules={[{ required: true, message: t('bins.areaRequired') }]}
>
```

## Lưu ý quan trọng

1. **Interpolation**: Sử dụng cho dynamic content
```tsx
// JSON
{
  "validation": {
    "required": "{{field}} is required"
  }
}

// Component
const message = t('validation.required', { field: 'Email' });
// Kết quả: "Email is required"
```

2. **Namespace**: Tổ chức theo module để dễ quản lý
```tsx
// Tốt ✅
t('bins.createNew')
t('users.editProfile') 

// Không tốt ❌
t('createNewBin')
t('editUserProfile')
```

3. **Fallback**: Luôn có fallback cho trường hợp thiếu key
```tsx
// i18n config có fallbackLng: 'en'
// Nếu không tìm thấy key trong 'vi', sẽ dùng 'en'
```

## Mở rộng thêm ngôn ngữ

### Thêm ngôn ngữ mới (ví dụ: Tiếng Trung)
1. Tạo file `src/i18n/locales/zh.json`
2. Thêm vào config `src/i18n/index.ts`:
```tsx
import zhTranslation from './locales/zh.json';

const resources = {
  en: { translation: enTranslation },
  vi: { translation: viTranslation },
  zh: { translation: zhTranslation },  // Thêm dòng này
};
```
3. Cập nhật LanguageSwitcher component

## Debug và troubleshooting

### Bật debug mode:
```tsx
// src/i18n/index.ts
i18n.init({
  // ...
  debug: true,  // Hiển thị log trong console
});
```

### Kiểm tra key bị thiếu:
- Mở Developer Tools > Console
- Xem warning "key 'xxx' not found"