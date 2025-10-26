export const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  dashboard: ['admin', 'manager', 'user'],
  warehouses: ['admin', 'manager'],
  items: ['admin', 'manager'],
  users: ['admin'],
  roles: ['admin'],
  partners: ['admin', 'manager'],
  bins: ['admin', 'manager'],
  baseUnits: ['admin', 'manager'],
  purchaseOrders: ['admin', 'manager'],
  inventoryStock: ['admin', 'manager', 'user'],
  settings: ['admin']
};

export const DISPLAY_CONFIG_KEY = 'ims_display_config_v1';