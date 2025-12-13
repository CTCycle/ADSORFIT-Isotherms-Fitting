import React from 'react';
import { NumberInput, FileUpload } from './UIComponents';
import type { FittingPayload } from '../types';

type OptimizationMethod = FittingPayload['optimization_method'];

interface ConfigPageProps {
    maxIterations: number;
    onMaxIterationsChange: (value: number) => void;
    optimizationMethod: OptimizationMethod;
    onOptimizationMethodChange: (value: OptimizationMethod) => void;
    datasetStats: string;
    fittingStatus: string;
    datasetName: string | null;
    datasetSamples: number;
    optimizationLabel: string;
    onDatasetUpload: (file: File) => void;
    onStartFitting: () => void;
    onResetFittingStatus: () => void;
}

export const ConfigPage: React.FC<ConfigPageProps> = ({
    maxIterations,
    onMaxIterationsChange,
    optimizationMethod,
    onOptimizationMethodChange,
    datasetStats,
    fittingStatus,
    datasetName,
    datasetSamples,
    optimizationLabel,
    onDatasetUpload,
    onStartFitting,
    onResetFittingStatus,
}) => {
    const datasetBadge = datasetName || 'No dataset loaded';
    const sampleBadge = datasetSamples > 0 ? `${datasetSamples} samples` : '0 samples';

    return (
        <div className="config-page">
            <div className="config-grid-v2">
                <section className="controls-column">
                    <div className="form-stack">
                        <div className="section-heading">
                            <div className="section-title">Optimization settings</div>
                            <div className="section-caption">Configure the solver before running the fit.</div>
                        </div>

                        <div className="field-block">
                            <NumberInput
                                label="Max iterations"
                                value={maxIterations}
                                onChange={onMaxIterationsChange}
                                min={1}
                                max={1000000}
                                step={1}
                                precision={0}
                            />
                        </div>

                        <div className="field-block">
                            <label className="field-label">Optimization method</label>
                            <select
                                value={optimizationMethod}
                                onChange={(e) => onOptimizationMethodChange(e.target.value as OptimizationMethod)}
                                className="select-input"
                            >
                                <option value="LSS">Least Squares (LSS)</option>
                                <option value="BFGS">BFGS</option>
                                <option value="L-BFGS-B">L-BFGS-B</option>
                                <option value="Nelder-Mead">Nelder-Mead</option>
                                <option value="Powell">Powell</option>
                            </select>
                        </div>

                        <div className="divider" />

                        <div className="section-heading">
                            <div className="section-title">Dataset</div>
                            <div className="section-caption">Load input data before launching the fit.</div>
                        </div>

                        <div className="field-block">
                            <FileUpload
                                label="Load dataset"
                                accept=".csv,.xls,.xlsx"
                                onUpload={onDatasetUpload}
                            />
                        </div>

                        <div className="dataset-inline">
                            <span className="inline-pill">{datasetBadge}</span>
                            <span className="inline-separator">|</span>
                            <span className="inline-pill">{sampleBadge}</span>
                        </div>
                    </div>
                </section>

                <section className="panels-column">
                    <div className="panel dataset-panel resizable-panel">
                        <div className="panel-header">
                            <div>
                                <div className="panel-title">Dataset</div>
                                <div className="panel-subtitle">
                                    {datasetBadge} | {sampleBadge}
                                </div>
                            </div>
                            <div className="panel-meta">{optimizationLabel}</div>
                        </div>
                        <div
                            className="panel-body stats-scroll"
                            dangerouslySetInnerHTML={{ __html: formatMarkdown(datasetStats) }}
                        />
                    </div>

                    <div className="panel log-panel resizable-panel">
                        <div className="panel-header">
                            <div>
                                <div className="panel-title">Fitting status</div>
                                <div className="panel-subtitle">Run the optimizer and monitor logs.</div>
                            </div>
                            <div className="panel-actions">
                                <button className="ghost-button" onClick={onResetFittingStatus}>
                                    Reset
                                </button>
                                <button className="primary" onClick={onStartFitting}>
                                    Start fitting
                                </button>
                            </div>
                        </div>
                        <div className="panel-body log-scroll">
                            <pre className="log-text">{fittingStatus || 'Fitting status will appear here...'}</pre>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

// Simple markdown-to-HTML formatter
function formatMarkdown(text: string): string {
    let html = text;

    html = html.replace(/^#### (.+)$/gm, '<h4 style="font-weight: 600; margin-bottom: 0.5rem;">$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3 style="font-weight: 600; margin-bottom: 0.5rem;">$1</h3>');

    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    html = html.replace(/^- (.+)$/gm, '<div style="margin-left: 1rem;">• $1</div>');

    html = html.replace(/\n/g, '<br/>');

    return html;
}
