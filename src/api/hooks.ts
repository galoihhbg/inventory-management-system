import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from './client';

type ListResponse<T> = {
  data: T[];
  meta?: any;
};

export function useEntityList<T = any>(endpoint: string, params?: Record<string, any>) {
  return useQuery<ListResponse<T>>(
    [endpoint, params],
    async () => {
      const res = await client.get(endpoint, { params });
      return res.data;
    },
    {
      keepPreviousData: true
    }
  );
}

export function useEntityCRUD(endpoint: string) {
  const qc = useQueryClient();

  const create = useMutation(
    async (payload: any) => {
      const res = await client.post(endpoint, payload);
      return res.data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries([endpoint]);
      }
    }
  );

  const update = useMutation(
    async ({ id, payload }: { id: string | number; payload: any }) => {
      const res = await client.put(`${endpoint}/${id}`, payload);
      return res.data;
    },
    {
      onSuccess: () => qc.invalidateQueries([endpoint])
    }
  );

  const remove = useMutation(
    async (id: string | number) => {
      const res = await client.delete(`${endpoint}/${id}`);
      return res.data;
    },
    {
      onSuccess: () => qc.invalidateQueries([endpoint])
    }
  );

  const getOne = async (id: string | number) => {
    const res = await client.get(`${endpoint}/${id}`);
    return res.data;
  };

  return { create, update, remove, getOne };
}