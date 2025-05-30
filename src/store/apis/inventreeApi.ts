import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { AxiosRequestConfig, AxiosError } from 'axios'; // Import Axios types
import { RootState } from '../../store/index'; // Corrected path for RootState
import { InventreeItem, ParameterDetail, StockItem } from '../../types'; // Corrected relative path
import { inventreeApiService } from '../../services/inventree-api-service';
import { Logger } from '../../utils/logger'; // Corrected path for Logger

export interface AxiosBaseQueryArgs { // Added export
  serviceMethod: keyof Omit<typeof inventreeApiService, 'axiosInstance' | 'lastApiCallTimestamp' | 'lastApiFailureTimestamp' | 'request'>; // Exclude non-method properties
  methodArgs: any[];
}

const axiosBaseQuery = ((): BaseQueryFn<
  AxiosBaseQueryArgs,
  unknown,
  { status?: number | 'CUSTOM_ERROR'; data?: any; message?: string } // Refined Error Type
 > => async ({ serviceMethod, methodArgs }) => {
  try {
    const serviceFn = inventreeApiService[serviceMethod] as (...args: any[]) => Promise<any>;
    if (typeof serviceFn !== 'function') {
      return {
        error: {
          status: 'CUSTOM_ERROR',
          data: `Service method '${String(serviceMethod)}' does not exist on inventreeApiService`,
        },
      };
    }
    const result = await serviceFn.apply(inventreeApiService, methodArgs);
    return { data: result };
  } catch (axiosError) {
    const err = axiosError as AxiosError;
    return {
      error: {
        status: err.response?.status,
        data: err.response?.data || err.message,
        message: err.message
      },
    };
  }
});

export const inventreeApi = createApi({
  reducerPath: 'inventreeApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Part', 'PartParameter', 'StockItem', 'SearchResult', 'Category', 'Location'],
  endpoints: (builder) => ({
    getPart: builder.query<InventreeItem, number>({
      query: (partId) => ({
        serviceMethod: 'getPart',
        methodArgs: [partId],
      }),
      providesTags: (result, error, partId) => [{ type: 'Part', id: partId }],
    }),
    getPartParameters: builder.query<ParameterDetail[], number>({
      query: (partId) => ({
        serviceMethod: 'getPartParameters',
        methodArgs: [partId],
      }),
      providesTags: (result, error, partId) => [{ type: 'PartParameter', id: `LIST-${partId}` }],
    }),
    updatePartParameter: builder.mutation<ParameterDetail, { partId: number; parameterPk: number; value: string }>({
      query: ({ parameterPk, value }) => ({
        serviceMethod: 'updatePartParameter',
        methodArgs: [parameterPk, value],
      }),
      invalidatesTags: (result, error, { partId, parameterPk }) => [
        { type: 'PartParameter', id: `LIST-${partId}` },
        { type: 'PartParameter', id: parameterPk },
        { type: 'Part', id: partId },
      ],
    }),
    getStockItems: builder.query<StockItem[], { partId: number }>({
      query: ({ partId }) => ({
        serviceMethod: 'getStockItemsForPart',
        methodArgs: [partId],
      }),
      providesTags: (result, error, { partId }) => [
        { type: 'StockItem', id: `LIST-${partId}` },
        ...(result?.map(item => ({ type: 'StockItem' as const, id: item.pk })) || []),
      ],
    }),
    addStockItem: builder.mutation<StockItem, { partId: number; quantity: number; locationId?: number; notes?: string }>({
        query: ({ partId, quantity, locationId, notes }) => ({
            serviceMethod: 'addStockItem',
            methodArgs: [partId, quantity, locationId, notes],
        }),
        invalidatesTags: (result, error, { partId }) => [
            { type: 'StockItem', id: `LIST-${partId}` },
            { type: 'Part', id: partId },
        ],
    }),
    searchParts: builder.query<Array<{ pk: number; name: string; thumbnail?: string }>, string>({
      query: (searchText) => ({
        serviceMethod: 'getParts',
        methodArgs: [{ search: searchText }],
      }),
      transformResponse: (response: InventreeItem[]) => {
        return response.map(part => ({
          pk: part.pk,
          name: part.name,
          thumbnail: part.thumbnail || undefined,
        }));
      },
      providesTags: (result, error, searchText) => 
        result 
          ? [
              ...result.map(({ pk }) => ({ type: 'SearchResult' as const, id: pk })),
              { type: 'SearchResult', id: 'LIST' },
            ]
          : [{ type: 'SearchResult', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPartQuery,
  useGetPartParametersQuery,
  useUpdatePartParameterMutation,
  useGetStockItemsQuery,
  useAddStockItemMutation,
  useSearchPartsQuery,
  useLazySearchPartsQuery,
} = inventreeApi; 