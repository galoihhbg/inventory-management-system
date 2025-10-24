```markdown
Đọc nhanh (Tiếng Việt):

- Thiết kế giao diện: Top bar (thanh công cụ) ở trên cùng, Sidebar bên trái, content chính ở giữa (grid/ bảng dữ liệu).
- Đã triển khai:
  - Màn hình đăng nhập (Login)
  - Dashboard (hiển thị card tóm tắt)
  - Danh mục Warehouses: List (grid), Create/Edit form, Delete (với Popconfirm)
  - Create/Edit forms: Users, Roles, Items
  - Role management UI (gán role cho user)
  - Display Settings (lưu localStorage) cho phép bật/tắt menu theo role
- Kỹ thuật:
  - useQuery và useMutation (React Query) dùng cho caching và thao tác dữ liệu.
  - Axios wrapper có interceptor để gắn Authorization header tự động.
  - Tailwind để tạo khoảng cách / layout, Ant Design cho components chuyên nghiệp.
- Mở rộng:
  - Các danh mục khác (Partners, Bins, Base Units, Purchase Orders) có thể được sao chép theo pattern `pages/categories/*`.
  - Endpoints dùng như trong file Postman (ví dụ: /warehouses, /users/login ...). Kiểm tra schema trả về backend để điều chỉnh mapping `res.data.data` hoặc `res.data`.
- Bảo mật:
  - Hiện lưu token vào localStorage cho demo. Để production cần refresh token, HttpOnly cookie, và route bảo vệ theo role.
```