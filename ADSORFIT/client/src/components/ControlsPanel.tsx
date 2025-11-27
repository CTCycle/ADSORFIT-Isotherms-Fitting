import React from 'react';
import { NumberInput, Checkbox, FileUpload } from './UIComponents';

interface ControlsPanelProps {
    maxIterations: number;
    onMaxIterationsChange: (value: number) => void;
    saveBest: boolean;
    onSaveBestChange: (value: boolean) => void;
    datasetStats: string;
    fittingStatus: string;
    onDatasetUpload: (file: File) => void;
    onStartFitting: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
    maxIterations,
    onMaxIterationsChange,
    saveBest,
    onSaveBestChange,
    datasetStats,
    fittingStatus,
    onDatasetUpload,
    onStartFitting,
}) => {
    return (
        <div className="card" style={{ flex: 1, minWidth: '320px' }}>
            <div className="flex flex-col gap-4 w-full">
                <NumberInput
                    label="Max iterations"
                    value={maxIterations}
                    onChange={onMaxIterationsChange}
                    min={1}
                    max={1000000}
                    step={1}
                    precision={0}
                />

                <Checkbox label="Save best fitting data" checked={saveBest} onChange={onSaveBestChange} />

                <div>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>Dataset statistics</h4>
                    <div className="status-area" dangerouslySetInnerHTML={{ __html: formatMarkdown(datasetStats) }} />
                </div>

                <div>
                    <label>Fitting status</label>
                    <textarea
                        value={fittingStatus}
                        readOnly
                        style={{ minHeight: '260px' }}
                        placeholder="Fitting status will appear here..."
                    />
                </div>

                <FileUpload label="Load dataset" accept=".csv,.xls,.xlsx" onUpload={onDatasetUpload} />

                <button className="primary" onClick={onStartFitting}>
                    Start fitting
                </button>
            </div>
        </div>
    );
};

// Simple markdown-to-HTML formatter
function formatMarkdown(text: string): string {
    let html = text;

    // Headers
    html = html.replace(/^#### (.+)$/gm, '<h4 style="font-weight: 600; margin-bottom: 0.5rem;">$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3 style="font-weight: 600; margin-bottom: 0.5rem;">$1</h3>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Lists
    html = html.replace(/^- (.+)$/gm, '<div style="margin-left: 1rem;">• $1</div>');

    // Line breaks
    html = html.replace(/\n/g, '<br/>');

    return html;
}
