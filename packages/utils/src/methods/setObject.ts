export const setObjVal = (
  target: { [k: string]: any },
  path: string,
  value: any,
) => {
  const fields = path.split('.');
  let obj = target;
  const l = fields.length;
  for (let i = 0; i < l - 1; i++) {
    const key = fields[i];
    if (!obj[key]) {
      obj[key] = {};
    }
    obj = obj[key];
  }
  obj[fields[l - 1]] = value;
};

export const getObjVal = (target: { [k: string]: any }, path: string) => {
  const fields = path.split('.');
  let obj = target;
  const l = fields.length;
  for (let i = 0; i < l - 1; i++) {
    const key = fields[i];
    if (!obj[key]) {
      return undefined;
    }
    obj = obj[key];
  }
  return obj[fields[l - 1]];
};

export const unsetObjVal = (target: { [k: string]: any }, path: string) => {
  const fields = path.split('.');
  let obj = target;
  const l = fields.length;
  const objs = [];
  for (let i = 0; i < l - 1; i++) {
    const key = fields[i];
    if (!obj[key]) {
      return;
    }
    objs.unshift({ parent: obj, key, value: obj[key] });
    obj = obj[key];
  }
  delete obj[fields[l - 1]];
  // Clear empty objects
  for (const { parent, key, value } of objs) {
    if (!Object.keys(value).length) {
      delete parent[key];
    }
  }
};
