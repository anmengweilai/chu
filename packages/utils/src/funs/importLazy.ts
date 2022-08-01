import importLazyInternal from '../../compiled/import-lazy';

export function importLazy(
  moduleName: string,
  requireFn?: (id: string) => unknown,
): any {
  const importLazyLocal: (moduleName: string) => unknown = importLazyInternal(
    requireFn || require,
  );
  return importLazyLocal(moduleName);
}
