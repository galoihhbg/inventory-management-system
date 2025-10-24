```markdown
# Inventory Management System - Frontend (Vite + React + TypeScript)

This repository is a starter frontend built from the provided Postman collection (Inventory Management System). It uses:

- Vite + React + TypeScript
- Ant Design (antd) for UI components
- TailwindCSS for utility styling and layout
- React Query (useQuery/useMutation) for data fetching & cache
- Axios as HTTP client

What is included
- Login screen (auth)
- Dashboard (overview)
- Generic category scaffold and one fully implemented example: Warehouses (List / Create / Edit / Delete)
- Create/Edit pages for Users, Roles, Items
- Role management UI to assign roles to users
- Display Settings (saved in localStorage) to configure menu visibility per role
- Re-usable hooks and generic entity table/form so you can add other categories (Users, Roles, Bins, Partners, Base Units, Items, Purchase Orders) quickly.

Note: The project uses the endpoints matching the Postman collection. Set VITE_BASE_URL in .env to point to your backend (default: http://localhost:8080).

Quick start
1. Install
   - npm install
2. Run dev
   - npm run dev
3. Build
   - npm run build
4. Type check
   - npm run type-check

Environmental variables
- .env
  - VITE_BASE_URL=http://localhost:8080

How to add another category
- Copy `src/pages/categories/Warehouses*` files and replace endpoint strings.
- Create routes entry in `src/App.tsx`.
- Use the generic `useEntityList` and `useEntityCRUD` hooks.

Notes
- The code expects backend endpoints matching the Postman collection (e.g., POST /users/login returns { token, user }).
- Display settings are stored in localStorage for demo purposes; move to backend if you want centralized persistence.
```