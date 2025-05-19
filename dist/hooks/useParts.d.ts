import { InventreeItem } from '../core/types';
/**
 * Custom hook to load and access parts data for an entity
 * This replaces direct calls to InventTreeState.getNewestData()
 *
 * @param component The LitElement component (this)
 * @param entityId The entity ID to fetch parts for
 * @returns Object with parts data and loading state
 */
export declare function usePartsData(component: any, entityId: string): {
    parts: InventreeItem[];
    loading: boolean;
    refetch: () => void;
};
