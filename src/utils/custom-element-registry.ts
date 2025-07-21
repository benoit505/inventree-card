import { ConditionalLoggerEngine } from '../core/logging/ConditionalLoggerEngine';

// Track constructors that have been used for registration
const registeredConstructors = new WeakSet<CustomElementConstructor>();
const logger = ConditionalLoggerEngine.getInstance().getLogger('CustomElements');
ConditionalLoggerEngine.getInstance().registerCategory('CustomElements', { enabled: false, level: 'info' });

/**
 * Safely register a custom element, preventing multiple registrations of the same constructor
 * @param tagName The tag name to register
 * @param constructor The element constructor
 * @param options Registration options
 * @returns true if registration was successful, false if already registered or failed
 */
export function safelyRegisterElement(
  tagName: string, 
  constructor: CustomElementConstructor, 
  options?: ElementDefinitionOptions
): boolean {
  
  try {
    // Check if the constructor has already been used for registration
    if (registeredConstructors.has(constructor)) {
      logger.info('safelyRegisterElement', `Constructor for ${tagName} already used for registration, skipping`, {
        category: 'initialization',
        subsystem: 'components'
      });
      return false;
    }
    
    // Check if the tag is already defined
    if (customElements.get(tagName)) {
      logger.info('safelyRegisterElement', `Element ${tagName} already registered, skipping`, {
        category: 'initialization',
        subsystem: 'components'
      });
      return false;
    }
    
    // Register the element
    customElements.define(tagName, constructor, options);
    
    // Track this constructor as used
    registeredConstructors.add(constructor);
    
    logger.info('safelyRegisterElement', `Successfully registered ${tagName}`, {
      category: 'initialization',
      subsystem: 'components'
    });
    return true;
  } catch (error) {
    logger.error('safelyRegisterElement', `Error registering ${tagName}`, error as Error, {
      category: 'initialization',
      subsystem: 'components'
    });
    return false;
  }
}

/**
 * Check if a tag name is already registered
 * @param tagName The tag name to check
 * @returns true if registered, false otherwise
 */
export function isElementRegistered(tagName: string): boolean {
  return !!customElements.get(tagName);
}

/**
 * Check if a constructor is already used for registration
 * @param constructor The constructor to check
 * @returns true if the constructor has been used, false otherwise
 */
export function isConstructorRegistered(constructor: CustomElementConstructor): boolean {
  return registeredConstructors.has(constructor);
}

/**
 * Get the constructor for a custom element
 * @param tagName The tag name to get
 * @returns The constructor or undefined if not registered
 */
export function getElementConstructor(tagName: string): CustomElementConstructor | undefined {
  return customElements.get(tagName);
} 