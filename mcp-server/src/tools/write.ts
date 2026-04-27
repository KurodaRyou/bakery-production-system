import * as backend from '../backend.js';
import { z } from 'zod';

export async function createRecord(data: z.infer<typeof backend.CreateRecordInput>) {
  if (!data.confirm) {
    return {
      warning: 'This is a write operation. Please set confirm: true to proceed.',
      data: data,
    };
  }
  return backend.createRecord(data);
}

export async function updateRecord(data: z.infer<typeof backend.UpdateRecordInput>) {
  if (!data.confirm) {
    return {
      warning: 'This is a write operation. Please set confirm: true to proceed.',
      data: data,
    };
  }
  return backend.updateRecord(data.batch_number, data);
}
