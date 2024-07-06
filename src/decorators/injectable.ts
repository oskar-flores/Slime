import {type InterfaceId, type InterfaceOfIds} from "./interfaceId";

/**
 * Decorator function for marking a class as injectable with a specific interface ID.
 *
 * @param id The interface ID to associate with the injectable class.
 * @param dependencies
 * @returns A class decorator function that logs 'hola' when the class is decorated.
 */
export function Injectable<I, TDependencies extends InterfaceId<unknown>[]>(
    id: InterfaceId<I>,
    dependencies: [...TDependencies]) {
    return function <T extends {
        new(...args: InterfaceOfIds<TDependencies>): I
    }>(constructor: T, {kind}: ClassDecoratorContext) {
        if (kind === "class") {
            injectableDecoratorMetadata.set(constructor, {id, dependencies: dependencies ?? []});
            return constructor;
        }
        throw new Error("Injectable decorator can only be applied to classes");
    }
}