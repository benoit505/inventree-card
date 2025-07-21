import { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';
import React from 'react';
export declare const useAppDispatch: () => AppDispatch;
export declare const useAppSelector: TypedUseSelectorHook<RootState>;
/**
 * A dedicated hook whose only job is to subscribe to the RTK Query endpoints
 * for all parts that are referenced in a card's config. This ensures the data
 * is fetched and cached by RTK Query.
 * @param pks - An array of Part Primary Keys to prefetch.
 * @param apiInitialized - A boolean flag that acts as a "start button".
 * @returns A memoized array of React elements to be rendered.
 */
export declare const usePrefetchApiParts: (pks: number[], apiInitialized: boolean) => React.ReactElement[];
/**
 * Selector hooks for specific state slices
 */
