import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import client from './client';

type ListResponse<T> = {
  data: T[];
  meta?: any;
};

export function useEntityList<T = any>(endpoint: string, params?: Record<string, any>) {
  return useQuery<ListResponse<T>>({
    queryKey: [endpoint, params],
    queryFn: async () => {
      const res = await client.get(endpoint, { params });
      return res.data;
    },
    placeholderData: keepPreviousData
  });
}

// Export the new filtered list hook
export { useFilteredList, type BaseFilter, type ListResponse as FilteredListResponse } from './useFilteredList';

export function useEntityCRUD(endpoint: string) {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const res = await client.post(endpoint, payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [endpoint] });
    }
  });

  const update = useMutation({
    mutationFn: async ({ id, payload }: { id: string | number; payload: any }) => {
      const res = await client.put(`${endpoint}/${id}`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [endpoint] })
  });

  const remove = useMutation({
    mutationFn: async (id: string | number) => {
      const res = await client.delete(`${endpoint}/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [endpoint] })
  });

  const getOne = useMutation({
    mutationFn: async (id: string | number) => {
      const res = await client.get(`${endpoint}/${id}`);
      return res.data;
    }
  });

  return { create, update, remove, getOne };
}