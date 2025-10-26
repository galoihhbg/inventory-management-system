import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import client from './client';
import { ListResponse } from '../types';

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

export function useEntityDetail<T = any>(endpoint: string, id: string | number | undefined, enabled: boolean = true) {
  return useQuery<T>({
    queryKey: [endpoint, id],
    queryFn: async () => {
      const res = await client.get(`${endpoint}/${id}`);
      return res.data?.data || res.data;
    },
    enabled: enabled && !!id
  });
}

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

  return { create, update, remove };
}