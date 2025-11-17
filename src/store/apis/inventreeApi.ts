import { createApi } from '@reduxjs/toolkit/query/react';
import { inventreeBaseQuery } from './inventreeBaseQuery';
import { InventreeItem, ParameterDetail, StockItem } from '../../types';
import { addApiPart, setPartParameters } from '../slices/partsSlice';

export const inventreeApi = createApi({
  reducerPath: 'inventreeApi',
  baseQuery: inventreeBaseQuery(),
  tagTypes: ['Part', 'PartParameter', 'StockItem', 'SearchResult', 'Category', 'Location', 'PartParameters'],
  endpoints: (builder) => ({
    getPart: builder.query<InventreeItem, { pk: number, cardInstanceId: string }>({
      query: ({ pk }) => `part/${pk}/`,
      async onCacheEntryAdded(
        arg,
        { dispatch, cacheDataLoaded }
      ) {
        const { data } = await cacheDataLoaded;
        dispatch(
          addApiPart({ part: data, cardInstanceId: arg.cardInstanceId })
        );
      },
      providesTags: (result, error, { pk }) => [{ type: 'Part', id: pk }],
    }),
    getPartParameters: builder.query<ParameterDetail[], { partId: number, cardInstanceId: string, template_detail?: boolean }>({
      query: ({ partId, template_detail }) => ({
        url: `part/parameter/`,
        params: { part: partId, template_detail: template_detail },
      }),
      async onCacheEntryAdded(
        arg,
        { dispatch, cacheDataLoaded }
      ) {
        const { data } = await cacheDataLoaded;
        dispatch(
          setPartParameters({
            partId: arg.partId,
            parameters: data,
            cardInstanceId: arg.cardInstanceId,
          })
        );
      },
      providesTags: (result, error, { partId }) => [{ type: 'PartParameters', id: partId }],
    }),
    updatePartParameter: builder.mutation<ParameterDetail, { partId: number; parameterId: number; data: any }>({
      query: ({ parameterId, data }) => ({
        url: `part/parameter/${parameterId}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { partId, parameterId }) => [
        { type: 'PartParameters', id: partId },
        { type: 'PartParameter', id: parameterId },
      ],
    }),
    getStockItems: builder.query<StockItem[], { partId: number }>({
      query: ({ partId }) => `stock/?part=${partId}`,
      providesTags: (result, error, { partId }) => [
        { type: 'StockItem', id: `LIST-${partId}` },
        ...(result?.map(item => ({ type: 'StockItem' as const, id: item.pk })) || []),
      ],
    }),
    addStockItem: builder.mutation<StockItem, { partId: number; quantity: number; locationId?: number; notes?: string }>({
      query: ({ partId, quantity, locationId, notes }) => ({
        url: `stock/`,
        method: 'POST',
        body: { part: partId, quantity, location: locationId, notes, status: 10 },
      }),
      invalidatesTags: (result, error, { partId }) => [
        { type: 'StockItem', id: `LIST-${partId}` },
        { type: 'Part', id: partId },
      ],
    }),
    removeStockItems: builder.mutation<any, { items: Array<{ pk: number; quantity: number }> }>({
      query: ({ items }) => ({
        url: `stock/remove/`,
        method: 'POST',
        body: { items },
      }),
      invalidatesTags: (result, error, { items }) => [
        ...items.map(item => ({ type: 'StockItem' as const, id: item.pk })),
      ],
    }),
    searchParts: builder.query<Array<{ pk: number; name: string; thumbnail?: string }>, { searchText: string }>({
      query: ({ searchText }) => `part/?search=${searchText}`,
      transformResponse: (response: InventreeItem[]) => {
        return response.map(part => ({
          pk: part.pk,
          name: part.name,
          thumbnail: part.thumbnail || undefined,
        }));
      },
      providesTags: (result) =>
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
  useRemoveStockItemsMutation,
  useSearchPartsQuery,
  useLazySearchPartsQuery,
} = inventreeApi;