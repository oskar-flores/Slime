export type InterfaceId<T> = string & { __id__: T };
/**
 * This type takes a generic parameter T, which is an array of InterfaceIds.
 * It iterates over all indices of the array, attempting to infer the inner type U for each.
 * If the inference fails for any index, it results in the 'never' type, effectively filtering out that case.
 */

export type InterfaceOfIds<Type extends InterfaceId<unknown>[]> = {
  [Index in keyof Type]: Type[Index] extends InterfaceId<infer U> ? U : never;
};
export const id = <T>(id: string): InterfaceId<T> => id as InterfaceId<T>;