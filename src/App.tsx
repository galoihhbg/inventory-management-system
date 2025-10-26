import React from 'react';
import { Layout } from 'antd';
import { Routes, Route, Navigate } from 'react-router-dom';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import WarehousesList from './pages/categories/WarehousesList';
import WarehouseForm from './pages/categories/WarehouseForm';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';
import DisplaySettings from './pages/Settings/DisplaySettings';
import UsersList from './pages/categories/UsersList';
import RolesList from './pages/categories/RolesList';
import ItemsList from './pages/categories/ItemsList';
import PartnersList from './pages/categories/PartnersList';
import BinsList from './pages/categories/BinsList';
import BaseUnitsList from './pages/categories/BaseUnitsList';

// New forms & role management
import UserForm from './pages/categories/UserForm';
import RoleForm from './pages/categories/RoleForm';
import ItemForm from './pages/categories/ItemForm';
import PartnerForm from './pages/categories/PartnerForm';
import BinForm from './pages/categories/BinForm';
import BaseUnitForm from './pages/categories/BaseUnitForm';
import RoleAssign from './pages/RoleManagement/RoleAssign';

// Purchase Orders
import PurchaseOrdersList from './pages/categories/PurchaseOrdersList';
import PurchaseOrderForm from './pages/categories/PurchaseOrderForm';
import PurchaseOrderDetail from './pages/categories/PurchaseOrderDetail';

// Inventory Stock
import InventoryStockList from './pages/categories/InventoryStockList';
import InventoryStockFilterList from './pages/categories/InventoryStockFilterList';

const { Header, Sider, Content } = Layout;

function App() {
  return (
    <AuthProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ padding: 0 }}>
          <TopBar />
        </Header>
        <Layout>
          <Sider width={240} breakpoint="lg" collapsedWidth="0" style={{ background: '#fff' }}>
            <Sidebar />
          </Sider>
          <Content style={{ margin: '24px', background: '#fff', padding: 24, borderRadius: 8 }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={['admin', 'manager', 'user']}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Warehouses */}
              <Route path="/warehouses" element={<ProtectedRoute roles={['admin', 'manager']}><WarehousesList /></ProtectedRoute>} />
              <Route path="/warehouses/new" element={<ProtectedRoute roles={['admin', 'manager']}><WarehouseForm /></ProtectedRoute>} />
              <Route path="/warehouses/:id/edit" element={<ProtectedRoute roles={['admin', 'manager']}><WarehouseForm /></ProtectedRoute>} />

              {/* Users */}
              <Route path="/users" element={<ProtectedRoute roles="admin"><UsersList /></ProtectedRoute>} />
              <Route path="/users/new" element={<ProtectedRoute roles="admin"><UserForm /></ProtectedRoute>} />
              <Route path="/users/:id/edit" element={<ProtectedRoute roles="admin"><UserForm /></ProtectedRoute>} />

              {/* Roles */}
              <Route path="/roles" element={<ProtectedRoute roles="admin"><RolesList /></ProtectedRoute>} />
              <Route path="/roles/new" element={<ProtectedRoute roles="admin"><RoleForm /></ProtectedRoute>} />
              <Route path="/roles/:id/edit" element={<ProtectedRoute roles="admin"><RoleForm /></ProtectedRoute>} />

              {/* Items */}
              <Route path="/items" element={<ProtectedRoute roles={['admin','manager']}><ItemsList /></ProtectedRoute>} />
              <Route path="/items/new" element={<ProtectedRoute roles={['admin','manager']}><ItemForm /></ProtectedRoute>} />
              <Route path="/items/:id/edit" element={<ProtectedRoute roles={['admin','manager']}><ItemForm /></ProtectedRoute>} />

              {/* Partners */}
              <Route path="/partners" element={<ProtectedRoute roles={['admin','manager']}><PartnersList /></ProtectedRoute>} />
              <Route path="/partners/new" element={<ProtectedRoute roles={['admin','manager']}><PartnerForm /></ProtectedRoute>} />
              <Route path="/partners/:id/edit" element={<ProtectedRoute roles={['admin','manager']}><PartnerForm /></ProtectedRoute>} />

              {/* Bins */}
              <Route path="/bins" element={<ProtectedRoute roles={['admin','manager']}><BinsList /></ProtectedRoute>} />
              <Route path="/bins/new" element={<ProtectedRoute roles={['admin','manager']}><BinForm /></ProtectedRoute>} />
              <Route path="/bins/:id/edit" element={<ProtectedRoute roles={['admin','manager']}><BinForm /></ProtectedRoute>} />

              {/* Base Units */}
              <Route path="/base-units" element={<ProtectedRoute roles={['admin','manager']}><BaseUnitsList /></ProtectedRoute>} />
              <Route path="/base-units/new" element={<ProtectedRoute roles={['admin','manager']}><BaseUnitForm /></ProtectedRoute>} />
              <Route path="/base-units/:id/edit" element={<ProtectedRoute roles={['admin','manager']}><BaseUnitForm /></ProtectedRoute>} />

              {/* Purchase Orders */}
              <Route path="/purchase-orders" element={<ProtectedRoute roles={['admin','manager']}><PurchaseOrdersList /></ProtectedRoute>} />
              <Route path="/purchase-orders/new" element={<ProtectedRoute roles={['admin','manager']}><PurchaseOrderForm /></ProtectedRoute>} />
              <Route path="/purchase-orders/:id" element={<ProtectedRoute roles={['admin','manager']}><PurchaseOrderDetail /></ProtectedRoute>} />

              {/* Inventory Stock */}
              <Route path="/inventory-stock" element={<ProtectedRoute roles={['admin','manager','user']}><InventoryStockList /></ProtectedRoute>} />
              <Route path="/inventory-stock/filter" element={<ProtectedRoute roles={['admin','manager','user']}><InventoryStockFilterList /></ProtectedRoute>} />

              {/* Settings */}
              <Route path="/settings/display" element={<ProtectedRoute roles="admin"><DisplaySettings /></ProtectedRoute>} />

              {/* Role management */}
              <Route path="/settings/roles" element={<ProtectedRoute roles="admin"><RoleAssign /></ProtectedRoute>} />

              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<div>Not Found</div>} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </AuthProvider>
  );
}

export default App;