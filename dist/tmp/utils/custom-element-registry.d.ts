/**
 * Safely register a custom element, preventing multiple registrations of the same constructor
 * @param tagName The tag name to register
 * @param constructor The element constructor
 * @param options Registration options
 * @returns true if registration was successful, false if already registered or failed
 */
export declare function safelyRegisterElement(tagName: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions): boolean;
/**
 * Check if a tag name is already registered
 * @param tagName The tag name to check
 * @returns true if registered, false otherwise
 */
export declare function isElementRegistered(tagName: string): boolean;
/**
 * Check if a constructor is already used for registration
 * @param constructor The constructor to check
 * @returns true if the constructor has been used, false otherwise
 */
export declare function isConstructorRegistered(constructor: CustomElementConstructor): boolean;
/**
 * Get the constructor for a custom element
 * @param tagName The tag name to get
 * @returns The constructor or undefined if not registered
 */
export declare function getElementConstructor(tagName: string): CustomElementConstructor | undefined;
