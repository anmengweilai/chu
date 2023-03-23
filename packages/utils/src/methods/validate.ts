import type Joi from '../../compiled/@hapi/joi';
import type { Schema } from '../../compiled/@hapi/joi';
import joi from '../../compiled/@hapi/joi';
import { exit } from './exit';
import { isLocalDev } from './isLocalDev';

export const createSchema = (fn: (joi: Joi.Root) => Schema) => {
  let schema = fn(joi);
  if (typeof schema === 'object' && typeof schema.validate !== 'function') {
    schema = joi.object(schema);
  }
  return schema;
};

export const validate = (obj: BufferSource, schema: Schema, cb: Function) => {
  const { error } = schema.validate(obj);
  if (error) {
    cb(error.details[0].message);

    if (isLocalDev()) {
      throw error;
    } else {
      exit(1);
    }
  }
};

export const validateSync = (obj: BufferSource, schema: Schema) => {
  const { error } = schema.validate(obj);
  if (error) {
    throw error;
  }
};
