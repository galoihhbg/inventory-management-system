# Filter Hook Usage Guide

This guide explains how to use the `useFilteredList` hook for backend-based filtering in list components.

## Overview

The `useFilteredList` hook provides a standardized way to handle filtering, pagination, and data fetching for list endpoints. It automatically sends filter parameters to the backend API instead of filtering data on the frontend.

## Basic Usage

```typescript
import { useFilteredList } from '../../api/hooks';

function MyList() {
  const { data, isLoading, filters, setFilter } = useFilteredList({
    endpoint: '/my-endpoint',
    initialFilters: { limit: 50 }
  });

  return (
    <div>
      <Input.Search 
        placeholder="Search" 
        onSearch={(v) => setFilter('search', v)} 
        onChange={(e) => !e.target.value && setFilter('search', '')}
        allowClear
      />
      <Table 
        loading={isLoading} 
        dataSource={data} 
        columns={columns} 
      />
    </div>
  );
}
```

## Standard Filter Parameters

The hook supports these standard filter parameters (matching the backend Filter struct):

- `page` (number): Page number for pagination
- `limit` (number): Number of items per page
- `order` (string): Sort order
- `cursor` (string): Cursor for cursor-based pagination
- `search` (string): Search query
- `from` (string): Start date (ISO format)
- `to` (string): End date (ISO format)

## Custom Filter Parameters

You can add custom filters specific to your endpoint by extending the `BaseFilter` interface:

```typescript
import { useFilteredList, BaseFilter } from '../../api/hooks';

// Define custom filter interface
interface PurchaseOrderFilter extends BaseFilter {
  status?: string;
  partnerId?: number;
}

function PurchaseOrdersList() {
  const { data, isLoading, filters, setFilter } = useFilteredList<MyDataType, PurchaseOrderFilter>({
    endpoint: '/purchase-orders',
    initialFilters: { limit: 50, status: 'draft' }
  });

  return (
    <div>
      <Select 
        placeholder="Filter by status" 
        onChange={(v) => setFilter('status', v)}
        value={filters.status}
      >
        <Option value="draft">Draft</Option>
        <Option value="confirmed">Confirmed</Option>
      </Select>
      
      <Input.Search 
        placeholder="Search" 
        onSearch={(v) => setFilter('search', v)} 
        onChange={(e) => !e.target.value && setFilter('search', '')}
        allowClear
      />
      
      <Table loading={isLoading} dataSource={data} columns={columns} />
    </div>
  );
}
```

## URL Synchronization

Enable URL synchronization to maintain filter state in the browser URL:

```typescript
const { data, filters, setFilter } = useFilteredList({
  endpoint: '/inventory-stock/filter',
  initialFilters: { limit: 10 },
  syncWithUrl: true  // Enable URL sync
});
```

This allows users to:
- Share filtered views via URL
- Use browser back/forward buttons
- Refresh the page without losing filter state

## API Reference

### Hook Parameters

```typescript
interface UseFilteredListOptions<TFilter extends BaseFilter> {
  endpoint: string;           // API endpoint to fetch data from
  initialFilters?: Partial<TFilter>;  // Initial filter values
  syncWithUrl?: boolean;      // Sync filters with URL query params (default: false)
  defaultLimit?: number;      // Default limit value (default: 50)
}
```

### Return Values

```typescript
{
  // Data
  data: T[];                  // Array of fetched items
  meta: any;                  // Metadata from API response
  pagination: {               // Pagination info from API
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    nextCursor?: string;
  };
  
  // State
  isLoading: boolean;         // Loading state
  isFetching: boolean;        // Fetching state (includes background refetch)
  error: Error | null;        // Error object if request failed
  
  // Filter Management
  filters: TFilter;           // Current filter values
  setFilter: (key, value) => void;  // Set a single filter
  setFilters: (filters) => void;    // Set multiple filters at once
  resetFilters: () => void;         // Reset to initial filters
  
  // Pagination Helpers
  goToPage: (page: number) => void;     // Go to specific page
  goToNextPage: () => void;             // Go to next page
  goToPreviousPage: () => void;         // Go to previous page
  setNextCursor: (cursor: string) => void;  // Set cursor for cursor-based pagination
  
  // Refetch
  refetch: () => void;        // Manually refetch data
}
```

## Examples

### Example 1: Simple List with Search

```typescript
function WarehousesList() {
  const { data, isLoading, setFilter } = useFilteredList({
    endpoint: '/warehouses',
    initialFilters: { limit: 20 }
  });

  return (
    <div>
      <Input.Search 
        placeholder="Search warehouses" 
        onSearch={(v) => setFilter('search', v)} 
        onChange={(e) => !e.target.value && setFilter('search', '')}
        allowClear
      />
      <Table loading={isLoading} dataSource={data} columns={columns} />
    </div>
  );
}
```

### Example 2: Multiple Custom Filters

```typescript
interface InventoryFilter extends BaseFilter {
  itemId?: number;
  binId?: number;
  warehouseId?: number;
  status?: string;
}

function InventoryFilterList() {
  const { data, isLoading, filters, setFilter, resetFilters } = 
    useFilteredList<InventoryItem, InventoryFilter>({
      endpoint: '/inventory-stock/filter',
      initialFilters: { limit: 10 },
      syncWithUrl: true
    });

  return (
    <div>
      <Select 
        value={filters.warehouseId}
        onChange={(v) => setFilter('warehouseId', v)}
        allowClear
      >
        {warehouses.map(wh => (
          <Option key={wh.id} value={wh.id}>{wh.name}</Option>
        ))}
      </Select>
      
      <Select 
        value={filters.itemId}
        onChange={(v) => setFilter('itemId', v)}
        allowClear
      >
        {items.map(item => (
          <Option key={item.id} value={item.id}>{item.name}</Option>
        ))}
      </Select>
      
      <Button onClick={resetFilters}>Reset Filters</Button>
      
      <Table loading={isLoading} dataSource={data} columns={columns} />
    </div>
  );
}
```

### Example 3: Page-Based Pagination

```typescript
function InventorySummaryList() {
  const { data, isLoading, filters, setFilter, goToPage, pagination } = 
    useFilteredList({
      endpoint: '/inventory-summary',
      initialFilters: { limit: 20, page: 1 }
    });

  return (
    <div>
      <Input.Search 
        placeholder="Search" 
        onSearch={(v) => setFilter('search', v)}
        allowClear
      />
      
      <Table
        loading={isLoading}
        dataSource={data}
        columns={columns}
        pagination={{
          current: filters.page as number || 1,
          pageSize: filters.limit as number || 20,
          total: pagination?.total || 0,
          onChange: (page) => goToPage(page)
        }}
      />
    </div>
  );
}
```

### Example 4: Cursor-Based Pagination

```typescript
function CursorPaginatedList() {
  const { data, isLoading, filters, setFilter, pagination } = 
    useFilteredList({
      endpoint: '/my-cursor-endpoint',
      initialFilters: { limit: 10 }
    });

  return (
    <div>
      <Table loading={isLoading} dataSource={data} columns={columns} />
      
      <Space>
        <Button 
          onClick={() => setFilter('cursor', '')} 
          disabled={!filters.cursor}
        >
          First Page
        </Button>
        <Button 
          onClick={() => setFilter('cursor', pagination?.nextCursor || '')} 
          disabled={!pagination?.nextCursor}
        >
          Next Page
        </Button>
      </Space>
    </div>
  );
}
```

## Migration from Frontend Filtering

If you have an existing component using frontend filtering, here's how to migrate:

### Before (Frontend Filtering)
```typescript
function MyList() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useEntityList('/my-endpoint', { limit: 50 });

  const dataSource = useMemo(() => {
    const rows = data?.data || [];
    if (query.trim()) {
      return rows.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));
    }
    return rows;
  }, [data, query]);

  return (
    <div>
      <Input.Search onSearch={setQuery} />
      <Table dataSource={dataSource} loading={isLoading} />
    </div>
  );
}
```

### After (Backend Filtering)
```typescript
function MyList() {
  const { data, isLoading, setFilter } = useFilteredList({
    endpoint: '/my-endpoint',
    initialFilters: { limit: 50 }
  });

  return (
    <div>
      <Input.Search 
        onSearch={(v) => setFilter('search', v)}
        onChange={(e) => !e.target.value && setFilter('search', '')}
        allowClear
      />
      <Table dataSource={data} loading={isLoading} />
    </div>
  );
}
```

## Benefits

1. **Performance**: Backend handles filtering, reducing client-side processing
2. **Consistency**: All list components use the same filtering pattern
3. **Scalability**: Can handle large datasets without performance issues
4. **Features**: Built-in pagination, URL sync, and filter management
5. **Type Safety**: Full TypeScript support with custom filter types
6. **Maintainability**: Centralized logic in one reusable hook

## Best Practices

1. **Always clear search on empty input**:
   ```typescript
   onChange={(e) => !e.target.value && setFilter('search', '')}
   ```

2. **Use `allowClear` on search inputs** for better UX:
   ```typescript
   <Input.Search allowClear ... />
   ```

3. **Define custom filter interfaces** for type safety:
   ```typescript
   interface MyFilter extends BaseFilter {
     customField?: string;
   }
   ```

4. **Enable URL sync for shareable filters**:
   ```typescript
   syncWithUrl: true
   ```

5. **Provide reasonable default limits**:
   ```typescript
   initialFilters: { limit: 50 }
   ```
