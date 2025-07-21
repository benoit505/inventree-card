import { InventreeCardConfig, InventreeItem, ThumbnailMode } from "../types";

// Static class for thumbnail utility functions
export class Thumbnail {
    // Get the path for a part's thumbnail based on configuration
    public static getThumbnailPath(item: InventreeItem, config: InventreeCardConfig): string {

        const thumbnails = config.thumbnails || {};
        const mode: ThumbnailMode = thumbnails.mode ?? 'api';
        const customPath: string = thumbnails.custom_path ?? '/local/inventree_thumbs/';

        if (item.thumbnail) {
            switch (mode) {
                case 'api':
                    // Use the thumbnail provided by the API
                    return item.thumbnail;
                case 'local_substitutions':
                    // Try to substitute the API thumbnail with a local version
                    // Extract filename from the API path
                    const filename = item.thumbnail.split('/').pop();
                    if (filename) {
                        return `${customPath}${filename}`;
                    }
                    return item.thumbnail; // Fallback to API thumbnail
                case 'local_only':
                    // Use local thumbnails only, based on part name or IPN
                    const partIdentifier = item.IPN || item.name;
                    return `${customPath}${partIdentifier}.png`; // Assuming PNG format
            }
        }
        return ''; // No thumbnail available
    }
}