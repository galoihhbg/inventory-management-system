# Reports API Integration Summary

## Overview
Updated all report components to integrate with the new Reports API documentation. The changes ensure compatibility with the specified API endpoints and data formats.

## API Changes Made

### Base URL
- **Updated**: `http://localhost:8080` (from 8081)
- **Location**: `src/api/client.ts`

### Endpoint Mappings
All report endpoints now use the `/reports/` prefix:

1. **Purchase Orders**: `GET /reports/purchase-orders`
2. **Sales Orders**: `GET /reports/sales-orders`  
3. **Inventory Movement**: `GET /reports/inventory-movement`
4. **Inventory by Location**: `GET /reports/inventory-by-location`
5. **Item Detail Ledger**: `GET /reports/item-detail`
6. **Inventory Check Discrepancy**: `GET /reports/inventory-check-discrepancy`

### Data Model Updates

#### Field Name Changes
Updated TypeScript interfaces to match API specifications:

**InventoryMovementReportItem:**
- `inboundQuantity` → `importQuantity`
- `inboundValue` → `importValue` 
- `outboundQuantity` → `exportQuantity`
- `outboundValue` → `exportValue`
- `stockQuantity` → `closingQuantity`
- `stockValue` → `closingValue`

**InventoryByLocationReportItem:**
- `locationCode` → `binCode`
- Same quantity/value field updates as above

**ItemDetailReportItem:**
- `costPrice` → `unitCost`
- Same quantity/value field updates as above

**InventoryCheckDiscrepancyReportItem:**
- `locationCode` → `binCode`

### Date Format Handling
Updated all report components to send ISO format dates:

**Before:**
```javascript
setFilter('fromDate', dates[0].format('YYYY-MM-DD'));
setFilter('toDate', dates[1].format('YYYY-MM-DD'));
```

**After:**
```javascript
setFilter('fromDate', dates[0].startOf('day').toISOString());
setFilter('toDate', dates[1].endOf('day').toISOString());
```

This ensures compatibility with the API's expected format: `2024-11-09T10:30:00Z`

## Translation Updates

### English (en.json)
Added new translation keys:
- `importQuantity`: "Import Qty"
- `importValue`: "Import Value"
- `exportQuantity`: "Export Qty" 
- `exportValue`: "Export Value"
- `closingQuantity`: "Closing Qty"
- `closingValue`: "Closing Value"
- `binCode`: "Bin Code"
- `unitCost`: "Unit Cost"

### Vietnamese (vi.json)
Added corresponding Vietnamese translations:
- `importQuantity`: "SL Nhập Kho"
- `importValue`: "GT Nhập Kho"
- `exportQuantity`: "SL Xuất Kho"
- `exportValue`: "GT Xuất Kho"
- `closingQuantity`: "SL Cuối Kỳ"
- `closingValue`: "GT Cuối Kỳ"
- `binCode`: "Mã Bin"
- `unitCost`: "Đơn Giá"

## Component Updates

### Files Modified:
1. `src/types/index.ts` - Updated all report interface types
2. `src/api/client.ts` - Changed default base URL
3. `src/i18n/locales/en.json` - Added new translations
4. `src/i18n/locales/vi.json` - Added new translations  
5. `src/pages/Reports/InventoryMovementReport.tsx` - Updated field names and date handling
6. `src/pages/Reports/InventoryByLocationReport.tsx` - Updated field names and date handling
7. `src/pages/Reports/ItemDetailReport.tsx` - Updated field names and date handling
8. `src/pages/Reports/InventoryCheckDiscrepancyReport.tsx` - Updated field names and date handling
9. `src/pages/Reports/PurchaseOrderReport.tsx` - Updated date handling
10. `src/pages/Reports/SalesOrderReport.tsx` - Updated date handling

## Key Features Preserved

### Filter Functionality
All existing filter capabilities are maintained:
- Date range filtering (now with ISO format)
- Warehouse filtering (warehouseId parameter)
- Item filtering (itemId parameter) 
- Bin/Location filtering (binId parameter)

### UI Components
- Table layouts and column configurations
- Pagination controls
- Export buttons (ready for implementation)
- Loading states and error handling
- Responsive design with horizontal scrolling

### Internationalization
- Full bi-lingual support (English/Vietnamese)
- Consistent translation keys across all reports
- Proper number formatting for financial data

## API Response Handling
All components expect the standardized API response format:

```json
{
  "success": true,
  "message": "Success message",
  "data": [...] // Actual report data
}
```

Error responses are handled through existing error management infrastructure.

## Development Notes

### Authentication
All API calls automatically include Bearer token authentication via the interceptor in `client.ts`.

### Environment Variables
Base URL can be overridden using the `VITE_BASE_URL` environment variable.

### Type Safety
All changes maintain full TypeScript type safety with updated interfaces matching the API specification.

## Testing Recommendations

1. **API Integration**: Verify all endpoints return data in the expected format
2. **Date Filtering**: Test that ISO date strings are properly sent to and processed by the API
3. **Field Mapping**: Confirm all new field names (importQuantity, exportQuantity, etc.) are correctly displayed
4. **Localization**: Test both English and Vietnamese language modes
5. **Filter Combinations**: Test various filter combinations (date + warehouse + item, etc.)
6. **Error Handling**: Test API error scenarios to ensure proper error display

## Next Steps

1. Backend API should implement the endpoints as documented
2. Consider implementing Excel export functionality for the export buttons
3. Add any additional filter options as needed (partner filtering, etc.)
4. Performance optimization for large datasets if needed