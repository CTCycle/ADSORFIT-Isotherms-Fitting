// API service for dataset and fitting endpoints

import type { DatasetPayload, DatasetResponse, FittingPayload, FittingResponse } from './types';
import { API_BASE_URL } from './constants';

const HTTP_TIMEOUT = 120000; // 120 seconds

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

function extractErrorMessage(response: Response, data: unknown): string {
    if (typeof data === 'object' && data !== null) {
        const obj = data as Record<string, unknown>;
        if (typeof obj.detail === 'string' && obj.detail) {
            return obj.detail;
        }
        if (typeof obj.message === 'string' && obj.message) {
            return obj.message;
        }
    }
    return `HTTP error ${response.status}`;
}

export async function loadDataset(file: File): Promise<{ dataset: DatasetPayload | null; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetchWithTimeout(
            `${API_BASE_URL}/datasets/load`,
            {
                method: 'POST',
                body: formData,
            },
            HTTP_TIMEOUT
        );

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const message = extractErrorMessage(response, data);
            return { dataset: null, message: `[ERROR] ${message}` };
        }

        const data = (await response.json()) as DatasetResponse;

        if (data.status !== 'success') {
            const detail = data.detail || 'Failed to load dataset.';
            return { dataset: null, message: `[ERROR] ${detail}` };
        }

        if (!data.dataset) {
            return { dataset: null, message: '[ERROR] Backend returned an invalid dataset payload.' };
        }

        const summary = data.summary || '[INFO] Dataset loaded successfully.';
        return { dataset: data.dataset, message: summary };
    } catch (error) {
        if (error instanceof Error) {
            return { dataset: null, message: `[ERROR] Failed to reach ADSORFIT backend: ${error.message}` };
        }
        return { dataset: null, message: '[ERROR] An unknown error occurred.' };
    }
}

export async function startFitting(payload: FittingPayload): Promise<{ message: string; data: FittingResponse | null }> {
    try {
        const response = await fetchWithTimeout(
            `${API_BASE_URL}/fitting/run`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            },
            HTTP_TIMEOUT
        );

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const message = extractErrorMessage(response, data);
            return { message: `[ERROR] ${message}`, data: null };
        }

        const data = (await response.json()) as FittingResponse;

        if (data.status !== 'success') {
            const detail = data.detail || data.message || 'Unknown error';
            return { message: `[ERROR] ${detail}`, data };
        }

        if (data.summary) {
            return { message: data.summary, data };
        }

        const lines: string[] = ['[INFO] Fitting completed successfully.'];
        if (typeof data.processed_rows === 'number') {
            lines.push(`Processed experiments: ${data.processed_rows}`);
        }
        if (typeof data.best_model_saved === 'boolean') {
            lines.push(`Best model saved: ${data.best_model_saved ? 'Yes' : 'No'}`);
        }
        if (Array.isArray(data.models) && data.models.length > 0) {
            lines.push('Configured models:');
            data.models.forEach((model) => lines.push(`  - ${model}`));
        }

        return { message: lines.join('\n'), data };
    } catch (error) {
        if (error instanceof Error) {
            return { message: `[ERROR] Failed to reach ADSORFIT backend: ${error.message}`, data: null };
        }
        return { message: '[ERROR] An unknown error occurred.', data: null };
    }
}
