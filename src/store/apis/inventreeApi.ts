import { createApi, fetchBaseQuery, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../store/index';
import { InventreeItem, ParameterDetail, StockItem } from '../../types';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

const logger = ConditionalLoggerEngine.getInstance().getLogger('inventreeApi');
ConditionalLoggerEngine.getInstance().registerCategory('inventreeApi', { enabled: false, level: 'info' });

// The new dynamicBaseQuery
const dynamicBaseQuery: BaseQueryFn = async (args, api, extraOptions) => {
  const { cardInstanceId, url, method, body, params } = args;
  const state = api.getState() as RootState;
  
  console.log(`%c[dynamicBaseQuery] Attempting query for instance: ${cardInstanceId}`, 'color: #D35400; font-weight: bold;', { url });

  if (!cardInstanceId) {
    const errorMsg = 'cardInstanceId was not provided in the query args';
    logger.error('dynamicBaseQuery', errorMsg, undefined, args);
    return { error: { status: 'CUSTOM_ERROR', error: errorMsg } };
  }

  const config = state.config.configsByInstance[cardInstanceId]?.config?.direct_api;

  if (!config || !config.url || !config.api_key) {
    const errorMsg = `API configuration not found for cardInstanceId: ${cardInstanceId}`;
    console.error(`%c[dynamicBaseQuery] FAILED: ${errorMsg}`, 'color: #C0392B; font-weight: bold;');
    logger.error('dynamicBaseQuery', errorMsg, undefined, { cardInstanceId });
    return { error: { status: 'CUSTOM_ERROR', error: errorMsg } };
  }

  console.log(`%c[dynamicBaseQuery] Found config for ${cardInstanceId}, proceeding with request.`, 'color: #27AE60; font-weight: bold;', { url: config.url });

  // Use fetchBaseQuery to handle the actual request
  const baseQuery = fetchBaseQuery({
    baseUrl: config.url,
    prepareHeaders: (headers) => {
      headers.set('Authorization', `Token ${config.api_key}`);
      return headers;
    },
  });

  const response = await baseQuery({ url, method, body, params }, api, extraOptions);
  
  console.log('%c[dynamicBaseQuery] Response from fetchBaseQuery:', 'color: #8E44AD; font-weight: bold;', response);

  return response;
};

export const inventreeApi = createApi({
  reducerPath: 'inventreeApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Part', 'PartParameter', 'StockItem', 'SearchResult', 'Category', 'Location'],
  endpoints: (builder) => ({
    getPart: builder.query<InventreeItem, { pk: number, cardInstanceId: string }>({
      query: ({ pk, cardInstanceId }) => ({
        url: `part/${pk}/`,
        method: 'GET',
        cardInstanceId,
      }),
      providesTags: (result, error, { pk }) => [{ type: 'Part', id: pk }],
    }),
    getPartParameters: builder.query<ParameterDetail[], { partId: number, cardInstanceId: string }>({
      query: ({ partId, cardInstanceId }) => ({
        url: `part/parameter/`,
        params: { part: partId },
        method: 'GET',
        cardInstanceId,
      }),
      providesTags: (result, error, { partId }) => [{ type: 'PartParameter', id: `LIST-${partId}` }],
    }),
    updatePartParameter: builder.mutation<ParameterDetail, { partId: number; parameterPk: number; value: any, cardInstanceId: string }>({
      query: ({ parameterPk, value, cardInstanceId }) => ({
        url: `part/parameter/${parameterPk}/`,
        method: 'PATCH',
        body: { value },
        cardInstanceId,
      }),
      invalidatesTags: (result, error, { partId, parameterPk }) => [
        { type: 'PartParameter', id: `LIST-${partId}` },
        { type: 'PartParameter', id: parameterPk.toString() },
        { type: 'Part', id: partId },
      ],
    }),
    getStockItems: builder.query<StockItem[], { partId: number, cardInstanceId: string }>({
      query: ({ partId, cardInstanceId }) => ({
        url: `stock/`,
        params: { part: partId },
        method: 'GET',
        cardInstanceId,
      }),
      providesTags: (result, error, { partId }) => [
        { type: 'StockItem', id: `LIST-${partId}` },
        ...(result?.map(item => ({ type: 'StockItem' as const, id: item.pk })) || []),
      ],
    }),
    addStockItem: builder.mutation<StockItem, { partId: number; quantity: number; locationId?: number; notes?: string, cardInstanceId: string }>({
        query: ({ partId, quantity, locationId, notes, cardInstanceId }) => ({
            url: `stock/`,
            method: 'POST',
            body: { part: partId, quantity, location: locationId, notes },
            cardInstanceId,
        }),
        invalidatesTags: (result, error, { partId }) => [
            { type: 'StockItem', id: `LIST-${partId}` },
            { type: 'Part', id: partId },
        ],
    }),
    searchParts: builder.query<Array<{ pk: number; name: string; thumbnail?: string }>, { searchText: string, cardInstanceId: string }>({
      query: ({ searchText, cardInstanceId }) => ({
        url: `part/`,
        params: { search: searchText },
        method: 'GET',
        cardInstanceId,
      }),
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
  useSearchPartsQuery,
  useLazySearchPartsQuery,
} = inventreeApi;