import * as backend from '../backend.js';
import { z } from 'zod';

export async function getRecipes(type?: string) {
  return backend.getRecipes(type);
}

export async function getRecipeDetail(id: number) {
  return backend.getRecipeDetail(id);
}

export async function getRecords(input: z.infer<typeof backend.GetRecordsInput>) {
  return backend.getRecords(input);
}

export async function getMaterials() {
  return backend.getMaterials();
}

export async function getPreparations() {
  return backend.getPreparations();
}
