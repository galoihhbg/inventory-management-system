# Inventory Check Module Implementation

## Overview
This document describes the Inventory Check (Kiểm Kê) module implementation in the frontend application.

## Files Created

### Components
1. **src/pages/categories/InventoryChecks/InventoryChecksList.tsx**
   - Displays a paginated list of all inventory checks
   - Supports filtering by check status (draft/completed/processed)
   - Provides navigation to create new checks or view details

2. **src/pages/categories/InventoryChecks/InventoryCheckForm.tsx**
   - Create/edit form for inventory checks
   - Allows setting date range, warehouse, checker
   - Supports adding multiple items with bins and actual quantities
   - Edit mode restricted to draft status only

3. **src/pages/categories/InventoryChecks/InventoryCheckDetail.tsx**
   - Displays full inventory check details
   - Shows discrepancies (actual vs book quantities)
   - Provides "Complete Check" action for draft checks
   - Allows processing discrepancies with three actions:
     - Ignore: Mark as handled without further action
     - Purchase Order: For surplus items (actual > book)
     - Sales Order: For shortage items (actual < book)

### Type Definitions
Added to **src/types/index.ts**:
- `InventoryCheck` - Main entity interface
- `InventoryCheckDetail` - Detail line items interface
- `InventoryCheckFormData` - Form submission data
- `InventoryCheckDetailFormData` - Detail form data
- `ProcessDiscrepancyFormData` - Discrepancy processing data
- `InventoryCheckFilter` - List filtering parameters

### Internationalization
Added translations in:
- **src/i18n/locales/en.json** - English translations
- **src/i18n/locales/vi.json** - Vietnamese translations

### Configuration
- **src/config/permissions.ts** - Added `inventoryChecks: ['admin', 'manager']`
- **src/App.tsx** - Added routes for list, create, edit, and detail pages
- **src/components/Sidebar.tsx** - Added menu item with CheckCircleOutlined icon

## Features Implemented

### Workflow
1. **Draft**: Create inventory check with physical counts
   - Select warehouse and item
   - System automatically fetches all bins with stock for that item in the warehouse
   - User enters actual quantity for each bin
   - Checker is automatically set from authenticated user (no manual selection needed)
2. **Complete**: Calculate book quantities and discrepancies
3. **Process**: Handle each discrepancy item

### List View Features
- Pagination support
- Filter by status
- Display warehouse and checker information
- Status color coding:
  - Orange: Draft
  - Blue: Completed
  - Green: Processed

### Form Features
- Date range picker for check period
- Warehouse selection
- **Automatic checker assignment** from authenticated user (no manual selection)
- Item selection (filtered by warehouse)
- **Automatic bin listing** - displays all bins with stock for selected item in warehouse
- Shows current stock quantity for each bin from inventory_stock
- Inline actual quantity entry for each bin
- Batch add all bins for an item to check details
- Add/remove detail lines
- Form validation
- Edit restrictions for non-draft checks

### Detail View Features
- Complete check button (draft only)
- Edit button (draft only)
- Delete button (draft only)
- Discrepancy display with color coding:
  - Green: No discrepancy (0)
  - Orange: Surplus (positive)
  - Red: Shortage (negative)
- Process discrepancy modal with partner selection
- Real-time status updates

## API Integration

The module expects the following backend endpoints:
- `GET /inventory-checks` - List checks with pagination
- `POST /inventory-checks` - Create new check (checker_id from auth token)
- `GET /inventory-checks/:id` - Get check details
- `PUT /inventory-checks/:id` - Update check (draft only, checker_id from auth token)
- `DELETE /inventory-checks/:id` - Delete check (draft only)
- `POST /inventory-checks/:id/complete` - Complete check
- `POST /inventory-checks/process-discrepancy` - Process discrepancy

## Permissions

Access is restricted to users with `admin` or `manager` roles.

## Testing

The implementation has been tested with:
- TypeScript type checking (no errors)
- Build process (successful)
- All components follow existing patterns in the codebase

## Usage

1. Navigate to "Inventory Checks" from the sidebar menu
2. Click "New Inventory Check" to create a check
3. Select date range and warehouse
4. Select an item - the system will automatically list all bins with stock for that item
5. Enter actual quantities for each bin (current stock is shown for reference)
6. Click "Add Item to Batch" to add all bins for the item to the check
7. Repeat for other items as needed
8. Save the draft check
6. Open the check detail page
7. Click "Complete Check" to calculate discrepancies
8. For each discrepancy, click "Process Discrepancy" to handle it
9. Select action (Ignore, Purchase Order, or Sales Order)
10. If creating an order, select a partner

## Notes

- Only draft checks can be edited or deleted
- Discrepancies can only be processed after check is completed
- Each discrepancy can only be processed once
- The module integrates with warehouses, bins, items, inventory_stock, and partners
- **Checker is automatically determined from the authenticated user's token** (not manually selected)
- **Bins are automatically fetched from inventory_stock** based on selected item and warehouse
- Current stock quantities are displayed for reference when entering actual quantities
