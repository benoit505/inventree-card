import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { LogEntry, LogLevel } from '../../types';

export interface LogQueryArgs {
  category?: string;
  level?: LogLevel;
  functionName?: string;
  maxEntries?: number;
}

export const loggingApi = createApi({
  reducerPath: 'loggingApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['LogEntry'],
  endpoints: (builder) => ({
    /**
     * Query for log entries. This is the main method for components to get logs.
     * The cache is managed by RTK Query.
     */
    getLogs: builder.query<LogEntry[], LogQueryArgs>({
      // The query function here is a placeholder. We will be updating the cache manually.
      queryFn: (args) => {
        // We'll select from the cache, but for now, just return an empty array.
        // The real power comes from the manual cache updates in `addLogEntry`.
        return { data: [] };
      },
      providesTags: (result) => 
        result 
          ? [...result.map(({ id }) => ({ type: 'LogEntry' as const, id })), { type: 'LogEntry', id: 'LIST' }]
          : [{ type: 'LogEntry', id: 'LIST' }],
    }),

    /**
     * Adds a new log entry. This is a mutation that doesn't hit a server.
     * It works by manually updating the cache of the `getLogs` query.
     */
    addLogEntry: builder.mutation<null, Omit<LogEntry, 'id' | 'timestamp'>>({
      queryFn: () => {
        // No-op. We're not making a real request.
        return { data: null };
      },
      onQueryStarted: async (newLogEntry, { dispatch, queryFulfilled }) => {
        const logWithId: LogEntry = {
          ...newLogEntry,
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
        };

        // Manually update the 'getLogs' cache for any subscribed components
        dispatch(
          loggingApi.util.updateQueryData('getLogs', {}, (draft) => {
            draft.push(logWithId);
            // Optional: Enforce a max number of entries to prevent memory leaks
            const maxEntries = 1000; // This could be configurable
            if (draft.length > maxEntries) {
              draft.splice(0, draft.length - maxEntries);
            }
          })
        );
      },
    }),

    /**
     * Clears all log entries from the cache.
     */
    clearLogs: builder.mutation<null, void>({
      queryFn: () => ({ data: null }),
      onQueryStarted: async (_, { dispatch }) => {
        dispatch(
          loggingApi.util.updateQueryData('getLogs', {}, (draft) => {
            return [];
          })
        );
      },
    }),
  }),
});

export const { useGetLogsQuery, useAddLogEntryMutation, useClearLogsMutation } = loggingApi; 