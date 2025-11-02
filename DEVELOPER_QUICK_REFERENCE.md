# Quick Reference: Status Filter & Restore

## For Frontend Developers

### Using the Feature in List Pages

Most list pages automatically get this feature by using `GenericList`:

```typescript
import GenericList from '../shared/GenericListFactory';
import { YourEntity, TableColumn } from '../../../types';

const columns: TableColumn<YourEntity>[] = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  // Add status column if you want to show status in the table
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (_, record) => (
      <Tag color={record.status === '1' ? 'green' : 'red'}>
        {record.status === '1' ? 'Active' : 'Inactive'}
      </Tag>
    )
  }
];

export default function YourEntityList() {
  return (
    <GenericList<YourEntity>
      endpoint="/your-endpoint"
      title="Your Entity"
      columns={columns}
      createPath="/your-entity/new"
      editPath={(id) => `/your-entity/${id}/edit`}
    />
  );
}
```

### What You Get Automatically

✅ Active/Inactive tabs
✅ Status filtering (default: active only)
✅ Restore button on inactive items
✅ Edit/Delete buttons on active items
✅ Success/error notifications
✅ Translations (EN/VI)

### Adding to New Entities

1. Ensure your entity type has `status?: string` field
2. Create a filter type extending `BaseFilter` (status is already there)
3. Use `GenericList` component
4. Done! ✨

### Manual Implementation (if not using GenericList)

```typescript
import { useFilteredList, useEntityCRUD } from '../../../api/hooks';

// In your component
const { data, filters, setFilters } = useFilteredList<YourEntity>({
  endpoint: '/your-endpoint',
  initialFilters: { status: '1' }  // Default to active
});

const { restore } = useEntityCRUD<YourEntity>('/your-endpoint');

// Switch between active/inactive
const showInactive = () => {
  setFilters({ status: '0' });
};

const showActive = () => {
  setFilters({ status: '1' });
};

// Restore an item
const handleRestore = async (id: number) => {
  await restore.mutateAsync(id);
  notification.success({ message: 'Restored successfully' });
};
```

## For Backend Developers

### Required API Endpoints

#### 1. List with Status Filter
```
GET /your-endpoint?status=1&page=1&limit=20

Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### 2. Restore Endpoint
```
PATCH /your-endpoint/{id}/restore

Response:
{
  "success": true,
  "message": "Item restored successfully",
  "data": { ... }
}
```

### Status Field Values
- `"1"` = Active
- `"0"` = Inactive/Soft Deleted

### Filter Parameter
The `status` parameter should:
- Be optional (default to `"1"` if not provided)
- Accept `"0"` or `"1"` as string values
- Filter records by the status column

### Restore Logic
When `/restore` is called:
1. Verify item exists and status is `"0"`
2. Update status to `"1"`
3. Update `updatedAt` timestamp
4. Return updated entity

## Testing Checklist

### Manual Testing
- [ ] Navigate to list page - Active tab shows by default
- [ ] Click Inactive tab - Shows deleted items
- [ ] Click Create button on Active tab - Opens form
- [ ] Verify Create button hidden on Inactive tab
- [ ] Click Edit on active item - Opens edit form
- [ ] Click Delete on active item - Shows confirmation, then deletes
- [ ] Switch to Inactive tab - Deleted item appears
- [ ] Click Restore button - Item restored
- [ ] Verify item disappears from Inactive tab
- [ ] Switch to Active tab - Restored item appears
- [ ] Test search on both tabs
- [ ] Test pagination on both tabs

### API Testing
```bash
# List active items
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8080/warehouses?status=1"

# List inactive items
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8080/warehouses?status=0"

# Restore item
curl -X PATCH \
  -H "Authorization: Bearer TOKEN" \
  "http://localhost:8080/warehouses/3/restore"
```

## Troubleshooting

### Issue: Tabs don't appear
**Solution**: Check that GenericList is being used correctly with proper imports

### Issue: Status filter doesn't work
**Solution**: 
1. Verify backend supports `status` query parameter
2. Check browser network tab for actual API call
3. Verify initial filters include `status: '1'`

### Issue: Restore button doesn't work
**Solution**:
1. Verify backend has `/restore` endpoint
2. Check console for errors
3. Verify user has proper permissions

### Issue: Translations missing
**Solution**: 
1. Check `src/i18n/locales/en.json` and `vi.json`
2. Verify keys: `common.restore`, `api.restoreSuccess`, `api.restoreFailed`
3. Add fallback values in code if needed

## Translation Keys

Add these to your language files:

```json
{
  "common": {
    "restore": "Restore",
    "active": "Active",
    "inactive": "Inactive"
  },
  "api": {
    "restoreSuccess": "Restored successfully",
    "restoreFailed": "Restore failed"
  }
}
```

## Best Practices

1. **Always include status column** in your table for clarity
2. **Use color coding**: Green for active, Red for inactive
3. **Keep GenericList consistent** - don't override too much
4. **Test both tabs** when making changes
5. **Handle errors gracefully** - show user-friendly messages

## Files Modified

Core files you might need to reference:
- `src/pages/categories/shared/GenericListFactory.tsx` - Main implementation
- `src/api/hooks.ts` - Restore mutation
- `src/types/index.ts` - Type definitions
- `src/i18n/locales/*.json` - Translations

## Support

For issues or questions:
1. Check implementation guide: `STATUS_FILTER_RESTORE_IMPLEMENTATION.md`
2. Check UI guide: `STATUS_FILTER_UI_GUIDE.md`
3. Review example implementations in existing list pages
