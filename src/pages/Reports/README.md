# Report Screens Implementation

This directory contains all report screens for the Inventory Management System.

## Reports Overview

### 1. Document Reports (Bảng kê chứng từ)

#### Purchase Order Report (Báo cáo phiếu nhập)
- **Component**: `PurchaseOrderReport.tsx`
- **Route**: `/reports/purchase-orders`
- **API Endpoint**: `GET /reports/purchase-orders`
- **Query Parameters**:
  - `fromDate` (optional): Start date in YYYY-MM-DD format
  - `toDate` (optional): End date in YYYY-MM-DD format
  - `page` (optional): Page number for pagination
  - `limit` (optional): Items per page
- **Response Format**:
```json
{
  "data": [
    {
      "documentDate": "2024-01-15",
      "documentNumber": "PO-001",
      "partnerCode": "SUP-001",
      "partnerName": "Supplier Name",
      "employeeName": "John Doe",
      "quantity": 100,
      "totalAmount": 5000000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### Sales Order Report (Báo cáo phiếu xuất)
- **Component**: `SalesOrderReport.tsx`
- **Route**: `/reports/sales-orders`
- **API Endpoint**: `GET /reports/sales-orders`
- **Query Parameters**: Same as Purchase Order Report
- **Response Format**: Same structure as Purchase Order Report

### 2. Inventory Movement Reports (Tổng hợp nhập xuất tồn)

#### Inventory Movement Report (Báo cáo tổng hợp nhập xuất tồn)
- **Component**: `InventoryMovementReport.tsx`
- **Route**: `/reports/inventory-movement`
- **API Endpoint**: `GET /reports/inventory-movement`
- **Query Parameters**:
  - `fromDate` (optional): Start date
  - `toDate` (optional): End date
  - `warehouseId` (optional): Filter by warehouse ID
  - `itemId` (optional): Filter by item ID
  - `page`, `limit`: Pagination
- **Response Format**:
```json
{
  "data": [
    {
      "itemCode": "ITEM-001",
      "itemName": "Product Name",
      "warehouseCode": "WH-001",
      "openingQuantity": 100,
      "openingValue": 1000000,
      "inboundQuantity": 50,
      "inboundValue": 500000,
      "outboundQuantity": 30,
      "outboundValue": 300000,
      "stockQuantity": 120,
      "stockValue": 1200000
    }
  ],
  "pagination": { ... }
}
```

#### Inventory by Location Report (Báo cáo tồn vật tư theo vị trí)
- **Component**: `InventoryByLocationReport.tsx`
- **Route**: `/reports/inventory-by-location`
- **API Endpoint**: `GET /reports/inventory-by-location`
- **Query Parameters**:
  - `fromDate`, `toDate`: Date range
  - `warehouseId`, `itemId`, `binId`: Filters
  - `page`, `limit`: Pagination
- **Response Format**: Similar to Inventory Movement Report but includes `locationCode` field

#### Item Detail Report (Sổ chi tiết vật tư)
- **Component**: `ItemDetailReport.tsx`
- **Route**: `/reports/item-detail`
- **API Endpoint**: `GET /reports/item-detail`
- **Query Parameters**:
  - `fromDate`, `toDate`: Date range
  - `warehouseId`, `itemId`: Filters
  - `page`, `limit`: Pagination
- **Response Format**:
```json
{
  "data": [
    {
      "documentDate": "2024-01-15",
      "documentNumber": "PO-001",
      "description": "Purchase order receipt",
      "itemCode": "ITEM-001",
      "itemName": "Product Name",
      "costPrice": 10000,
      "inboundQuantity": 50,
      "inboundValue": 500000,
      "outboundQuantity": 0,
      "outboundValue": 0
    }
  ],
  "pagination": { ... }
}
```

### 3. Inventory Check Report (Báo cáo kiểm kê)

#### Inventory Check Discrepancy Report (Báo cáo chênh lệch kiểm kê)
- **Component**: `InventoryCheckDiscrepancyReport.tsx`
- **Route**: `/reports/inventory-check-discrepancy`
- **API Endpoint**: `GET /reports/inventory-check-discrepancy`
- **Query Parameters**:
  - `fromDate`, `toDate`: Date range
  - `page`, `limit`: Pagination
- **Response Format**:
```json
{
  "data": [
    {
      "itemCode": "ITEM-001",
      "itemName": "Product Name",
      "warehouseCode": "WH-001",
      "locationCode": "A-01-01",
      "actualQuantity": 95,
      "discrepancy": -5
    }
  ],
  "pagination": { ... }
}
```

## Features

- **Date Range Filtering**: All reports support date range filtering using Ant Design DatePicker
- **Advanced Filters**: Warehouse, Item, and Location filters with searchable dropdowns
- **Pagination**: All reports support pagination with configurable page size
- **Export**: UI buttons prepared for Excel export (backend integration required)
- **Internationalization**: Full support for Vietnamese and English languages
- **Responsive Design**: Tables scroll horizontally on smaller screens
- **Loading States**: Shows loading indicators during data fetching
- **Error Handling**: Uses the standard error handling pattern

## Backend Integration Notes

### Required API Endpoints
All backend endpoints should follow this pattern:
- Accept query parameters: `fromDate`, `toDate`, `warehouseId`, `itemId`, `binId`, `page`, `limit`
- Return data in the format: `{ data: [], pagination: { page, limit, total, totalPages } }`
- Support proper filtering and pagination
- Handle date formats: Accept `YYYY-MM-DD` format

### Export Functionality
The export buttons are UI-ready but need backend implementation:
- Consider endpoint: `GET /reports/{report-type}/export?fromDate=...&toDate=...`
- Should return Excel file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
- Include the same filters as the main report

## Permissions
All reports are accessible to users with roles: `admin`, `manager`, `user`

## Navigation
Reports are organized in a submenu under "Reports" (Báo Cáo) in the main sidebar navigation.
