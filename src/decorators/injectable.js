/**
 * Decorator function for marking a class as injectable with a specific interface ID.
 *
 * @param id The interface ID to associate with the injectable class.
 * @param dependencies
 * @returns A class decorator function that logs 'hola' when the class is decorated.
 */
export function Injectable(id, dependencies) {
    return function (constructor, { kind }) {
        if (kind === "class") {
            injectableDecoratorMetadata.set(constructor, { id, dependencies: dependencies ?? [] });
            return constructor;
        }
        throw new Error("Injectable decorator can only be applied to classes");
    };
}
