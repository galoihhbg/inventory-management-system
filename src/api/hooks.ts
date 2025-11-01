import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import client from './client';
import { ListResponse, ApiResponse, ApiError } from '../types';

export function useEntityList<T>(endpoint: string, params?: Record<string, unknown>) {
  return useQuery<ListResponse<T>, ApiError>({
    queryKey: [endpoint, params],
    queryFn: async () => {
      const res = await client.get(endpoint, { params });
      return res.data;
    },
    placeholderData: keepPreviousData
  });
}

// Export the new filtered list hook
export { useFilteredList } from './useFilteredList';

export function useEntityCRUD<T = unknown, TCreate = Partial<T>, TUpdate = Partial<T>>(endpoint: string) {
  const qc = useQueryClient();

  const create = useMutation<ApiResponse<T>, ApiError, TCreate>({
    mutationFn: async (payload: TCreate) => {
      const res = await client.post(endpoint, payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [endpoint] });
    }
  });

  const update = useMutation<ApiResponse<T>, ApiError, { id: string | number; payload: TUpdate }>({
    mutationFn: async ({ id, payload }: { id: string | number; payload: TUpdate }) => {
      const res = await client.put(`${endpoint}/${id}`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [endpoint] })
  });

  const remove = useMutation<ApiResponse<void>, ApiError, string | number>({
    mutationFn: async (id: string | number) => {
      const res = await client.delete(`${endpoint}/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [endpoint] })
  });

  const getOne = useMutation<ApiResponse<T>, ApiError, string | number>({
    mutationFn: async (id: string | number) => {
      const res = await client.get(`${endpoint}/${id}`);
      return res.data;
    }
  });

  return { create, update, remove, getOne };
}