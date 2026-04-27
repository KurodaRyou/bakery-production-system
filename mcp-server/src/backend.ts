import { z } from 'zod';

const API_BASE = process.env.BAKERY_API_URL || 'http://backend:8080';
const API_TOKEN = process.env.BAKERY_API_TOKEN;

if (!API_TOKEN) {
    console.error('BAKERY_API_TOKEN environment variable is required');
    process.exit(1);
}

// New error response format from backend
interface BackendError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}

interface BackendSuccess<T> {
    success: true;
    data: T;
}

type BackendResponse<T> = BackendSuccess<T> | BackendError;

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}${path}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_TOKEN}`,
            ...options?.headers,
        },
    });

    const data: BackendResponse<unknown> = await response.json().catch(() => ({ success: false, error: { code: 'PARSE_ERROR', message: 'Failed to parse response' } }));

    // Handle new error format: { success: false, error: { code, message } }
    if (!response.ok || data.success === false) {
        if (data.success === false && data.error) {
            throw new Error(`API Error [${data.error.code}]: ${data.error.message}`);
        }
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
    }

    return (data as BackendSuccess<T>).data;
}

// Tool input schemas
export const GetRecordsInput = z.object({
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
});

export const GetRecipeDetailInput = z.object({
    id: z.number(),
});

export const CreateRecordInput = z.object({
    batch_number: z.string(),
    dough_name: z.string(),
    dry_temp: z.number().optional(),
    room_temp: z.number().optional(),
    water_temp: z.number().optional(),
    flour_amount: z.number(),
    water_amount: z.number(),
    output_temp: z.number(),
    machine: z.string(),
    confirm: z.literal(true).optional(),
});

export const UpdateRecordInput = z.object({
    batch_number: z.string(),
    dough_name: z.string().optional(),
    dry_temp: z.number().optional(),
    room_temp: z.number().optional(),
    water_temp: z.number().optional(),
    flour_amount: z.number().optional(),
    water_amount: z.number().optional(),
    output_temp: z.number().optional(),
    machine: z.string().optional(),
    confirm: z.literal(true).optional(),
});

// API functions
export async function getRecords(input: z.infer<typeof GetRecordsInput>) {
    return apiRequest(`/api/records?limit=${input.limit}&offset=${input.offset}`);
}

export async function getRecipeDetail(id: number) {
    return apiRequest(`/api/recipes/${id}`);
}

export async function getMaterials() {
    return apiRequest('/api/materials');
}

export async function getPreparations() {
    return apiRequest('/api/preparations');
}

export async function getRecipes(type?: string) {
    const query = type ? `?type=${type}` : '';
    return apiRequest(`/api/recipes${query}`);
}

export async function createRecord(data: z.infer<typeof CreateRecordInput>) {
    const { confirm: _confirm, ...recordData } = data;
    return apiRequest('/api/records', {
        method: 'POST',
        body: JSON.stringify(recordData),
    });
}

export async function updateRecord(batchNumber: string, data: z.infer<typeof UpdateRecordInput>) {
    const { confirm: _confirm, ...updateData } = data;
    return apiRequest(`/api/records/${batchNumber}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
    });
}
