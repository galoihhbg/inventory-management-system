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
import RoleAssign from './pages/RoleManagement/RoleAssign';

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

              {/* Other lists */}
              <Route path="/partners" element={<ProtectedRoute roles={['admin','manager']}><PartnersList /></ProtectedRoute>} />
              <Route path="/bins" element={<ProtectedRoute roles={['admin','manager']}><BinsList /></ProtectedRoute>} />
              <Route path="/base-units" element={<ProtectedRoute roles={['admin','manager']}><BaseUnitsList /></ProtectedRoute>} />

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