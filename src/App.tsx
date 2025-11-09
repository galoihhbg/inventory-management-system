import React from "react";
import { Layout } from "antd";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import WarehousesList from "./pages/categories/Warehouses/WarehousesList";
import WarehouseForm from "./pages/categories/Warehouses/WarehouseForm";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import DisplaySettings from "./pages/Settings/DisplaySettings";
import UsersList from "./pages/categories/Users/UsersList";
import RolesList from "./pages/categories/Roles/RolesList";
import ItemsList from "./pages/categories/Items/ItemsList";
import PartnersList from "./pages/categories/Partners/PartnersList";
import BinsList from "./pages/categories/Bins/BinsList";
import BaseUnitsList from "./pages/categories/BaseUnits/BaseUnitsList";

import UserForm from "./pages/categories/Users/UserForm";
import RoleForm from "./pages/categories/Roles/RoleForm";
import ItemForm from "./pages/categories/Items/ItemForm";
import PartnerForm from "./pages/categories/Partners/PartnerForm";
import BinForm from "./pages/categories/Bins/BinForm";
import BaseUnitForm from "./pages/categories/BaseUnits/BaseUnitForm";
import RoleAssign from "./pages/RoleManagement/RoleAssign";
import I18nDemo from "./pages/I18nDemo";

// Purchase Orders
import PurchaseOrdersList from "./pages/categories/PurchaseOrders/PurchaseOrdersList";
import PurchaseOrderForm from "./pages/categories/PurchaseOrders/PurchaseOrderForm";
import PurchaseOrderDetail from "./pages/categories/PurchaseOrders/PurchaseOrderDetail";

// Sales Orders
import SalesOrdersList from "./pages/categories/SalesOrders/SalesOrdersList";
import SalesOrderForm from "./pages/categories/SalesOrders/SalesOrderForm";
import SalesOrderDetail from "./pages/categories/SalesOrders/SalesOrderDetail";

// Inventory Stock
import InventoryStockList from "./pages/categories/InventoryStock/InventoryStockList";
import InventoryStockFilterList from "./pages/categories/InventoryStock/InventoryStockFilterList";

// Inventory Summary
import InventorySummaryList from "./pages/categories/InventorySummary/InventorySummaryList";

// Inventory Checks
import InventoryChecksList from "./pages/categories/InventoryChecks/InventoryChecksList";
import InventoryCheckForm from "./pages/categories/InventoryChecks/InventoryCheckForm";
import InventoryCheckDetail from "./pages/categories/InventoryChecks/InventoryCheckDetail";

const { Header, Sider, Content } = Layout;

const AppLayout = () => (
  <Layout style={{ height: "100vh", overflow: "hidden" }}>
    <Header style={{ padding: 0, height: 64 }}>
      <TopBar />
    </Header>
    <Layout>
      <Sider
        width={240}
        breakpoint="lg"
        collapsedWidth="0"
        style={{ background: "#fff" }}
      >
        <Sidebar />
      </Sider>
      <Content
        style={{
          margin: "24px",
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          overflowY: "auto",
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  </Layout>
);

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/" element={<AppLayout />}>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute roles={["admin", "manager", "user"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Warehouses */}
          <Route
            path="warehouses"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <WarehousesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="warehouses/new"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <WarehouseForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="warehouses/:id/edit"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <WarehouseForm />
              </ProtectedRoute>
            }
          />

          {/* Users */}
          <Route
            path="users"
            element={
              <ProtectedRoute roles="admin">
                <UsersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/new"
            element={
              <ProtectedRoute roles="admin">
                <UserForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/:id/edit"
            element={
              <ProtectedRoute roles="admin">
                <UserForm />
              </ProtectedRoute>
            }
          />

          {/* Roles */}
          <Route
            path="roles"
            element={
              <ProtectedRoute roles="admin">
                <RolesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="roles/new"
            element={
              <ProtectedRoute roles="admin">
                <RoleForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="roles/:id/edit"
            element={
              <ProtectedRoute roles="admin">
                <RoleForm />
              </ProtectedRoute>
            }
          />

          {/* Items */}
          <Route
            path="items"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <ItemsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="items/new"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <ItemForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="items/:id/edit"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <ItemForm />
              </ProtectedRoute>
            }
          />

          {/* Partners */}
          <Route
            path="partners"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <PartnersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="partners/new"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <PartnerForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="partners/:id/edit"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <PartnerForm />
              </ProtectedRoute>
            }
          />

          {/* Bins */}
          <Route
            path="bins"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <BinsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="bins/new"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <BinForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="bins/:id/edit"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <BinForm />
              </ProtectedRoute>
            }
          />

          {/* Base Units */}
          <Route
            path="base-units"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <BaseUnitsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="base-units/new"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <BaseUnitForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="base-units/:id/edit"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <BaseUnitForm />
              </ProtectedRoute>
            }
          />

          {/* Purchase Orders */}
          <Route
            path="purchase-orders"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <PurchaseOrdersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="purchase-orders/new"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <PurchaseOrderForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="purchase-orders/:id"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <PurchaseOrderDetail />
              </ProtectedRoute>
            }
          />

          {/* Sales Orders */}
          <Route
            path="sales-orders"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <SalesOrdersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="sales-orders/new"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <SalesOrderForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="sales-orders/:id"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <SalesOrderDetail />
              </ProtectedRoute>
            }
          />

          {/* Inventory Stock */}
          <Route
            path="inventory-stock"
            element={
              <ProtectedRoute roles={["admin", "manager", "user"]}>
                <InventoryStockList />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventory-stock/filter"
            element={
              <ProtectedRoute roles={["admin", "manager", "user"]}>
                <InventoryStockFilterList />
              </ProtectedRoute>
            }
          />

          {/* Inventory Summary */}
          <Route
            path="inventory-summary"
            element={
              <ProtectedRoute roles={["admin", "manager", "user"]}>
                <InventorySummaryList />
              </ProtectedRoute>
            }
          />

          {/* Inventory Checks */}
          <Route
            path="inventory-checks"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <InventoryChecksList />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventory-checks/new"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <InventoryCheckForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventory-checks/:id"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <InventoryCheckDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventory-checks/:id/edit"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <InventoryCheckForm />
              </ProtectedRoute>
            }
          />

          {/* Settings */}
          <Route
            path="settings/display"
            element={
              <ProtectedRoute roles="admin">
                <DisplaySettings />
              </ProtectedRoute>
            }
          />

          {/* Role management */}
          <Route
            path="settings/roles"
            element={
              <ProtectedRoute roles="admin">
                <RoleAssign />
              </ProtectedRoute>
            }
          />

          {/* Demo & Test Pages */}
          <Route
            path="i18n-demo"
            element={
              <ProtectedRoute roles={["admin", "manager", "user"]}>
                <I18nDemo />
              </ProtectedRoute>
            }
          />

          {/* 6. Route index để điều hướng "/" về "/dashboard" */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
