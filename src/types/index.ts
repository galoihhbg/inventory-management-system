// Entity type definitions for the Inventory Management System

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: number;
  roleName?: string;
  name?: string;
  role_name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  roleId?: number;
  role?: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface BaseUnit {
  id: number;
  code: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Item {
  id: number;
  code: string;
  name: string;
  baseUnitId?: number;
  baseUnit?: BaseUnit;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Partner {
  id: number;
  code: string;
  name: string;
  phoneNumber?: string;
  address?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Bin {
  id: number;
  locationCode: string;
  warehouseId?: number;
  warehouse?: Warehouse;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderItem {
  id?: number;
  itemId: number;
  item?: Item;
  itemName?: string;
  quantityOrdered: number;
  unitPrice: number;
  purchaseOrderId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrder {
  id: number;
  code?: string;
  partnerId: number;
  partner?: Partner;
  purchaseOrderStatus: 'draft' | 'confirmed';
  items?: PurchaseOrderItem[];
  confirmedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListResponse<T> {
  data: T[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
