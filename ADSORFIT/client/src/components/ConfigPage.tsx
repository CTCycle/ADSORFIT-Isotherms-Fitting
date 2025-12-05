import React from 'react';
import { NumberInput, Checkbox, FileUpload } from './UIComponents';

interface ConfigPageProps {
    maxIterations: number;
    onMaxIterationsChange: (value: number) => void;
    saveBest: boolean;
    onSaveBestChange: (value: boolean) => void;
    optimizationMethod: string;
    onOptimizationMethodChange: (value: string) => void;
    datasetStats: string;
    fittingStatus: string;
    onDatasetUpload: (file: File) => void;
    onStartFitting: () => void;
}

export const ConfigPage: React.FC<ConfigPageProps> = ({
    maxIterations,
    onMaxIterationsChange,
    saveBest,
    onSaveBestChange,
    optimizationMethod,
    onOptimizationMethodChange,
    datasetStats,
    fittingStatus,
    onDatasetUpload,
    onStartFitting,
}) => {
    return (
        <div className="config-page">
            <div className="config-grid">
                <div className="card config-section">
                    <h2 className="section-title">Optimization Settings</h2>
                    <div className="flex flex-col gap-4">
                        <NumberInput
                            label="Max iterations"
                            value={maxIterations}
                            onChange={onMaxIterationsChange}
                            min={1}
                            max={1000000}
                            step={1}
                            precision={0}
                        />

                        <div>
                            <label>Optimization Method</label>
                            <select
                                value={optimizationMethod}
                                onChange={(e) => onOptimizationMethodChange(e.target.value)}
                                className="select-input"
                            >
                                <option value="LSS">Least Squares (LSS)</option>
                                <option value="BFGS">BFGS</option>
                                <option value="L-BFGS-B">L-BFGS-B</option>
                                <option value="Nelder-Mead">Nelder-Mead</option>
                                <option value="Powell">Powell</option>
                            </select>
                        </div>

                        <Checkbox
                            label="Save best fitting data"
                            checked={saveBest}
                            onChange={onSaveBestChange}
                        />
                    </div>
                </div>

                <div className="card config-section">
                    <h2 className="section-title">Dataset</h2>
                    <div className="flex flex-col gap-4">
                        <FileUpload
                            label="Load dataset"
                            accept=".csv,.xls,.xlsx"
                            onUpload={onDatasetUpload}
                        />

                        <div>
                            <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>
                                Dataset statistics
                            </h4>
                            <div
                                className="status-area"
                                style={{ minHeight: '180px' }}
                                dangerouslySetInnerHTML={{ __html: formatMarkdown(datasetStats) }}
                            />
                        </div>
                    </div>
                </div>

                <div className="card config-section">
                    <h2 className="section-title">Fitting Status</h2>
                    <div className="flex flex-col gap-4">
                        <textarea
                            value={fittingStatus}
                            readOnly
                            style={{ minHeight: '260px' }}
                            placeholder="Fitting status will appear here..."
                        />

                        <button className="primary" onClick={onStartFitting}>
                            Start fitting
                        </button>
                    </div>
                </div>
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
