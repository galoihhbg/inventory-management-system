# Status Filter and Restore Functionality - Implementation Summary

## Overview
This document describes the implementation of status filtering and restore functionality for all entity list pages in the Inventory Management System frontend.

## Features Implemented

### 1. Status Filtering
- **Active/Inactive Tabs**: All list pages now have tabs to switch between active (status="1") and inactive (status="0") records
- **Default Behavior**: By default, only active records are shown (status="1")
- **Consistent UI**: Uses Ant Design Tabs component for a clean, consistent interface

### 2. Restore Functionality
- **Restore Button**: Inactive items show a "Restore" button instead of Edit/Delete actions
- **API Integration**: Calls `PATCH /{endpoint}/{id}/restore` to restore deleted items
- **Success Feedback**: Shows success/error notifications in both English and Vietnamese
- **Auto Refresh**: List automatically refreshes after successful restore

### 3. Modified Components

#### Core Components
- **GenericListFactory.tsx**: Enhanced with tabs, status filtering, and restore functionality
  - Added `useState` for active tab tracking
  - Added `handleTabChange` to switch between active/inactive
  - Added `handleRestore` for restore operations
  - Modified initial filters to default to `status: '1'`
  - Conditional rendering of Create button (only on Active tab)
  - Conditional rendering of actions (Edit/Delete on Active, Restore on Inactive)

#### API Layer
- **hooks.ts**: Added `restore` mutation to `useEntityCRUD`
  - Uses PATCH method to `/{endpoint}/{id}/restore`
  - Invalidates query cache after successful restore

#### Type Definitions
- **types/index.ts**: 
  - Added `status?: string` to `BaseFilter`
  - Added `RoleFilter`, `BinFilter`, and `BaseUnitFilter` interfaces
  - Added `status?: string` field to `Role`, `Bin`, and `BaseUnit` interfaces

#### Entity List Pages Updated
1. **WarehousesList.tsx** - Already had status column, now has tabs
2. **ItemsList.tsx** - Already had status column, now has tabs
3. **PartnersList.tsx** - Already had status column, now has tabs
4. **UsersList.tsx** - Already had status column, now has tabs
5. **RolesList.tsx** - Refactored to use GenericList, added status column and tabs
6. **BaseUnitsList.tsx** - Added status column and tabs
7. **BinsList.tsx** - Added status column and tabs

### 4. Internationalization
Added translations in both English and Vietnamese:

**English (en.json)**:
- `common.restore`: "Restore"
- `api.restoreSuccess`: "Restored successfully"
- `api.restoreFailed`: "Restore failed"

**Vietnamese (vi.json)**:
- `common.restore`: "Khôi phục"
- `api.restoreSuccess`: "Khôi phục thành công"
- `api.restoreFailed`: "Khôi phục thất bại"

## Technical Details

### Status Filter Implementation
```typescript
// Default filter includes status="1" (active)
const { data, filters, setFilters } = useFilteredList<T>({
  endpoint,
  initialFilters: { limit: 20, page: 1, status: '1' }
});

// Tab change handler
const handleTabChange = (key: string) => {
  setActiveTab(key as 'active' | 'inactive');
  setFilters({ 
    page: 1, 
    status: key === 'active' ? '1' : '0' 
  });
};
```

### Restore API Call
```typescript
const restore = useMutation<ApiResponse<T>, ApiError, string | number>({
  mutationFn: async (id: string | number) => {
    const res = await client.patch(`${endpoint}/${id}/restore`);
    return res.data;
  },
  onSuccess: () => qc.invalidateQueries({ queryKey: [endpoint] })
});
```

### Conditional Actions Rendering
```typescript
{activeTab === 'active' ? (
  <>
    <Button icon={<EditOutlined />} onClick={...} />
    <Popconfirm>
      <Button danger icon={<DeleteOutlined />} />
    </Popconfirm>
  </>
) : (
  <Button 
    type="primary" 
    icon={<UndoOutlined />} 
    onClick={() => handleRestore(record.id)}
  >
    {t('common.restore')}
  </Button>
)}
```

## API Endpoints Used

All entity endpoints now support:
- `GET /{endpoint}?status=1` - List active records
- `GET /{endpoint}?status=0` - List inactive records
- `PATCH /{endpoint}/{id}/restore` - Restore a deleted record

Affected endpoints:
- `/warehouses`
- `/items`
- `/partners`
- `/users`
- `/roles`
- `/base-units`
- `/bins`

## User Experience

### Active Tab
- Shows all active records (status="1")
- Edit and Delete buttons available
- Create button visible
- Search and refresh functionality

### Inactive Tab
- Shows all inactive/deleted records (status="0")
- Only Restore button available per record
- Create button hidden
- Search and refresh functionality

## Backward Compatibility
- All existing functionality preserved
- Default behavior shows active records (same as before)
- No breaking changes to existing code
- Graceful fallback for missing translations

## Testing Checklist
- [x] TypeScript compilation passes
- [x] Build succeeds without errors
- [x] All entity list pages updated
- [x] Translations added for both languages
- [ ] Manual testing with backend API (requires backend setup)
- [ ] Verify restore functionality with real data
- [ ] Test tab switching behavior
- [ ] Verify pagination works on both tabs

## Future Enhancements
1. Add confirmation dialog before restore
2. Add bulk restore functionality
3. Add filter for showing both active and inactive together
4. Add visual indicators for recently restored items
5. Add restore history/audit log

## Notes
- The implementation assumes the backend API supports the status filter parameter and restore endpoint as specified in the requirements
- All list pages now consistently show status information
- The restore functionality requires admin permissions (to be enforced by backend)
