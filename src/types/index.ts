// Core entity types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  roles?: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  address?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bin {
  id: number;
  locationCode: string;
  warehouseId: number;
  warehouse?: Warehouse;
  description?: string;
  isReceivingBin: boolean;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BaseUnit {
  id: number;
  name: string;
  code: string;
  description?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: number;
  code: string;
  name: string;
  description?: string;
  baseUnitId: number;
  baseUnit?: BaseUnit;
  unitPrice?: number;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Partner {
  id: number;
  code: string;
  name: string;
  type: 'supplier' | 'customer' | 'both';
  email?: string;
  phone?: string;
  address?: string;
  status?: string
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  partnerId: number;
  partner?: Partner;
  purchaseOrderStatus: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';
  status?: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: number;
  purchaseOrderId: number;
  itemId: number;
  item?: Item;
  quantityOrdered: number;
  unitPrice: number;
  totalPrice: number;
  quantityReceived?: number;
  binId?: number;
  bin?: Bin;
  currentStock?: number;                    // Current quantity in specific bin (real-time for draft, snapshot for confirmed)
  warehouseStock?: number;                  // Total warehouse stock (real-time for draft, snapshot for confirmed)
  stockAtConfirmation?: number;             // Stock in bin at time of confirmation (only for confirmed POs)
  warehouseStockAtConfirmation?: number;    // Warehouse stock at time of confirmation (only for confirmed POs)
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStock {
  id: number;
  itemId: number;
  item?: Item;
  warehouseId: number;
  warehouse?: Warehouse;
  binId?: number;
  bin?: Bin;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastUpdated: string;
}

// API Response types
export interface ListResponse<T> {
  data: T[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    nextCursor?: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Form types
export interface BinFormData {
  locationCode: string;
  warehouseId: number;
  description?: string;
  isReceivingBin: boolean;
}

export interface WarehouseFormData {
  code: string;
  name: string;
  address?: string;
  status: string;
}

export interface ItemFormData {
  code: string;
  name: string;
  description?: string;
  baseUnitId: number;
  unitPrice?: number;
  status: string;
}

export interface PartnerFormData {
  code: string;
  name: string;
  type: 'supplier' | 'customer' | 'both';
  email?: string;
  phone?: string;
  address?: string;
  status: string;
}

export interface UserFormData {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  status: string;
  roleIds?: number[];
}

export interface RoleFormData {
  name: string;
  description?: string;
  permissionIds?: number[];
}

export interface BaseUnitFormData {
  name: string;
  symbol: string;
  description?: string;
}

export interface PurchaseOrderFormData {
  orderNumber: string;
  partnerId: number;
  status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate?: string;
  notes?: string;
  items: PurchaseOrderItemFormData[];
}

export interface PurchaseOrderItemFormData {
  itemId: number;
  quantityOrdered: number;
  unitPrice: number;
  binId: number;               // Now required since each item has its own bin
  currentStock?: number;       // Stock info for display
  warehouseStock?: number;     // Warehouse stock info
}

// Filter types
export interface BaseFilter {
  page?: number;
  limit?: number;
  order?: string;
  cursor?: string;
  search?: string;
  from?: string;
  to?: string;
  status?: string;
}

export interface UserFilter extends BaseFilter {
  status?: string;
  roleId?: number;
}

export interface WarehouseFilter extends BaseFilter {
  status?: string;
}

export interface ItemFilter extends BaseFilter {
  status?: string;
  baseUnitId?: number;
}

export interface PartnerFilter extends BaseFilter {
  type?: 'supplier' | 'customer' | 'both';
  status?: string;
}

export interface RoleFilter extends BaseFilter {
  status?: string;
}

export interface BinFilter extends BaseFilter {
  warehouseId?: number;
  status?: string;
}

export interface BaseUnitFilter extends BaseFilter {
  status?: string;
}

export interface PurchaseOrderFilter extends BaseFilter {
  purchaseOrderStatus?: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';
  partnerId?: number;
}

export interface InventoryStockFilter extends BaseFilter {
  warehouseId?: number;
  itemId?: number;
  binId?: number;
  hasStock?: boolean;
}

// Table column props
export interface TableColumn<T = unknown> {
  title: string;
  dataIndex?: keyof T | string;
  key: string;
  width?: number | string;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  sorter?: boolean;
  filters?: { text: string; value: string | number | boolean }[];
  onFilter?: (value: unknown, record: T) => boolean;
}

// Component props
export interface GenericListProps<T = unknown> {
  endpoint: string;
  title: string;
  columns: TableColumn<T>[];
  createPath?: string;
  editPath?: (id: number | string) => string;
  showRefresh?: boolean;
}

export interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

// Auth types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: Role[];
  permissions: Permission[];
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginFormData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (resource: string, action: string) => boolean;
}

// Display settings types
export interface DisplaySettings {
  theme: 'light' | 'dark';
  compactMode: boolean;
  showSidebar: boolean;
  language: string;
}

// Role assignment types
export interface UserRoleAssignment {
  userId: number;
  roleIds: number[];
}