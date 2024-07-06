// Declare the global module
declare global {
    interface InjectableContext {
        id: string,
        dependencies: string[]
    }

    const injectableDecoratorMetadata = new WeakMap<object, InjectableContext>();
}

// Export an empty object to make this a module
export {};