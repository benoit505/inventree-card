import { Middleware } from 'redux';
import { RootState } from '../store';
/**
 * Middleware to bridge Redux with existing InvenTree services
 *
 * This middleware allows us to:
 * 1. Gradually migrate from service-based logic to Redux actions/thunks
 * 2. Keep existing services functional during the transition
 * 3. Dispatch Redux actions based on service events (if needed later)
 */
declare const serviceBridgeMiddleware: Middleware<{}, RootState>;
export default serviceBridgeMiddleware;
