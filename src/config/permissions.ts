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
  salesOrders: ['admin', 'manager'],
  inventoryStock: ['admin', 'manager', 'user'],
  inventorySummary: ['admin', 'manager', 'user'],
  inventoryChecks: ['admin', 'manager'],
  settings: ['admin']
};

export const DISPLAY_CONFIG_KEY = 'ims_display_config_v1';