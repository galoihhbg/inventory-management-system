# Status Filter and Restore - UI Flow

## Visual Representation

```
┌─────────────────────────────────────────────────────────────────────┐
│  Warehouses                                    [Search] [↻] [+ Create] │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────┬──────────┐                                             │
│  │ Active  │ Inactive │  ← Tabs to switch between active/inactive  │
│  └─────────┴──────────┘                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ACTIVE TAB VIEW:                                                   │
│  ┌───┬──────┬─────────┬────────┬─────────┐                        │
│  │ID │ Code │  Name   │ Status │ Actions │                        │
│  ├───┼──────┼─────────┼────────┼─────────┤                        │
│  │ 1 │ WH01 │ Main    │ ✓ Active│ ✏️ 🗑️ │  ← Edit/Delete      │
│  │ 2 │ WH02 │ Branch  │ ✓ Active│ ✏️ 🗑️ │                       │
│  └───┴──────┴─────────┴────────┴─────────┘                        │
│                                                                     │
│  [1] [2] [3]  ← Pagination                                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Warehouses                                    [Search] [↻]         │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────┬──────────┐                                             │
│  │ Active  │ Inactive │  ← Switched to Inactive tab                │
│  └─────────┴──────────┘                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  INACTIVE TAB VIEW:                                                 │
│  ┌───┬──────┬─────────┬────────┬─────────────┐                    │
│  │ID │ Code │  Name   │ Status │   Actions   │                    │
│  ├───┼──────┼─────────┼────────┼─────────────┤                    │
│  │ 3 │ WH03 │ Old WH  │✗Inactive│ [⟲ Restore] │  ← Restore button │
│  │ 5 │ WH05 │ Closed  │✗Inactive│ [⟲ Restore] │                   │
│  └───┴──────┴─────────┴────────┴─────────────┘                    │
│                                                                     │
│  [1] [2] [3]  ← Pagination                                         │
└─────────────────────────────────────────────────────────────────────┘
```

## User Workflow

### Viewing Active Items (Default)
1. User navigates to any list page (Warehouses, Items, Partners, etc.)
2. **Active** tab is selected by default
3. Only items with `status="1"` are shown
4. User can:
   - Create new items (+ Create button visible)
   - Edit existing items (✏️ button)
   - Delete items (🗑️ button)
   - Search within active items
   - Refresh the list

### Viewing Inactive/Deleted Items
1. User clicks on **Inactive** tab
2. API call: `GET /endpoint?status=0&page=1&limit=20`
3. Only items with `status="0"` are shown
4. User can:
   - View deleted items
   - Restore items (⟲ Restore button)
   - Search within inactive items
   - Refresh the list
5. **Note**: Create button is hidden on this tab

### Restoring an Item
1. User clicks **Inactive** tab
2. User finds the item to restore
3. User clicks **[⟲ Restore]** button
4. API call: `PATCH /endpoint/{id}/restore`
5. Success notification appears
6. List automatically refreshes
7. Item disappears from Inactive tab (moved to Active)

## API Communication Flow

### Listing Active Items
```
Frontend → GET /warehouses?status=1&page=1&limit=20
        ← 200 OK { data: [...], pagination: {...} }
```

### Listing Inactive Items
```
Frontend → GET /warehouses?status=0&page=1&limit=20
        ← 200 OK { data: [...], pagination: {...} }
```

### Restoring an Item
```
Frontend → PATCH /warehouses/3/restore
        ← 200 OK { success: true, message: "Warehouse restored successfully" }
```

## Status Filter Values

| Value | Meaning | Display Label |
|-------|---------|---------------|
| `"1"` | Active  | ✓ Active (Green badge) |
| `"0"` | Inactive/Deleted | ✗ Inactive (Red badge) |
| `undefined` or not provided | Defaults to `"1"` | - |

## Applied to Modules

✅ Warehouses (`/warehouses`)
✅ Items (`/items`)
✅ Partners (`/partners`)
✅ Users (`/users`)
✅ Roles (`/roles`)
✅ Base Units (`/base-units`)
✅ Bins (`/bins`)

## Key Features

### Consistent Behavior
- All entity list pages work the same way
- Same tab layout and button placement
- Uniform color coding (Green = Active, Red = Inactive)

### Smart Defaults
- Default to Active tab
- Default filter: `status="1"`
- Create button only on Active tab

### User Feedback
- Success/Error notifications
- Loading states during API calls
- Auto-refresh after restore

### Internationalization
- All labels translated in English and Vietnamese
- Graceful fallbacks if translations missing

## Example Code Usage

### In Component
```typescript
// No changes needed in most list components!
// GenericList handles everything automatically

<GenericList<Warehouse>
  endpoint="/warehouses" 
  title="Warehouses" 
  columns={columns} 
  createPath="/warehouses/new" 
  editPath={(id) => `/warehouses/${id}/edit`} 
/>
```

### Custom Status Column
```typescript
{
  title: 'Status',
  dataIndex: 'status',
  key: 'status',
  render: (value, record) => (
    <Tag color={record.status === '1' ? 'green' : 'red'}>
      {record.status === '1' ? 'Active' : 'Inactive'}
    </Tag>
  )
}
```

## Benefits

1. **User Control**: Users can now view and restore deleted items
2. **Data Recovery**: Soft-deleted items can be restored without admin intervention
3. **Audit Trail**: Deleted items remain visible for review
4. **Consistency**: Same behavior across all modules
5. **Minimal Code**: Most pages work with GenericList without changes
