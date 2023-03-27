// This codes are from ts-essentials:

// https://github.com/ts-essentials/ts-essentials/blob/master/lib/pick-keys-by-value.ts
type PickKeysByValue<Type, Value> = { [Key in keyof Type]: Type[Key] extends Value ? Key : never }[keyof Type];

// https://github.com/ts-essentials/ts-essentials/blob/master/lib/pick-properties/index.ts
export type PickProperties<Type, Value> = Pick<Type, PickKeysByValue<Type, Value>>;
