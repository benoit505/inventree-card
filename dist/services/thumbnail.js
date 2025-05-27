import { DEFAULT_CONFIG } from "../core/settings";
export class ThumbnailService {
    static getThumbnailPath(item, config) {
        const thumbnails = Object.assign(Object.assign({}, DEFAULT_CONFIG.thumbnails), (config.thumbnails || {}));
        console.warn('🖼️ Thumbnail Service:', {
            config: thumbnails,
            item_thumbnail: item.thumbnail,
            mode: thumbnails.mode,
            custom_path: thumbnails.custom_path,
            local_path: thumbnails.local_path
        });
        if (thumbnails.mode === 'auto' && item.thumbnail) {
            console.warn('🖼️ Using auto mode:', item.thumbnail);
            return item.thumbnail;
        }
        if (thumbnails.mode === 'custom' && thumbnails.custom_path) {
            const path = `${thumbnails.custom_path}/part_${item.pk}.png`;
            console.warn('🖼️ Using manual mode:', path);
            return path;
        }
        console.warn('🖼️ No valid path found!');
        return '';
    }
}
//# sourceMappingURL=thumbnail.js.map