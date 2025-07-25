export function withSortedKeys<T extends Record<string, any>>(obj: T): T {
  const result = {} as T;
  const sortedKeys = Object.keys(obj).sort();

  for (const key of sortedKeys) {
    const value = obj[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key as keyof T] = withSortedKeys(value);
    } else {
      result[key as keyof T] = value;
    }
  }

  return result;
}
