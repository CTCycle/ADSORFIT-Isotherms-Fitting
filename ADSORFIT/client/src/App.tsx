import { useState, useCallback } from 'react';
import { ModelCard } from './components/ModelCard';
import { ControlsPanel } from './components/ControlsPanel';
import { MODEL_PARAMETER_DEFAULTS } from './constants';
import { loadDataset, startFitting } from './services';
import type { DatasetPayload, ModelParameters, ModelConfiguration } from './types';
import './index.css';

interface ModelState {
    enabled: boolean;
    parameters: ModelParameters;
}

function App() {
    const [maxIterations, setMaxIterations] = useState(10000);
    const [saveBest, setSaveBest] = useState(false);
    const [datasetStats, setDatasetStats] = useState('No dataset loaded.');
    const [fittingStatus, setFittingStatus] = useState('');
    const [dataset, setDataset] = useState<DatasetPayload | null>(null);
    const [modelStates, setModelStates] = useState<Record<string, ModelState>>(() => {
        const initial: Record<string, ModelState> = {};
        Object.entries(MODEL_PARAMETER_DEFAULTS).forEach(([modelName, params]) => {
            const parameters: ModelParameters = {};
            Object.entries(params).forEach(([paramName, [min, max]]) => {
                parameters[paramName] = { min, max };
            });
            initial[modelName] = { enabled: true, parameters };
        });
        return initial;
    });

    const handleModelToggle = useCallback((modelName: string, enabled: boolean) => {
        setModelStates((prev) => ({
            ...prev,
            [modelName]: { ...prev[modelName], enabled },
        }));
    }, []);

    const handleParametersChange = useCallback((modelName: string, parameters: ModelParameters) => {
        setModelStates((prev) => ({
            ...prev,
            [modelName]: { ...prev[modelName], parameters },
        }));
    }, []);

    const handleDatasetUpload = useCallback(async (file: File) => {
        setDatasetStats('[INFO] Uploading dataset...');
        const result = await loadDataset(file);
        setDataset(result.dataset);
        setDatasetStats(result.message);
    }, []);

    const handleStartFitting = useCallback(async () => {
        if (!dataset) {
            setFittingStatus('[ERROR] Please load a dataset before starting the fitting process.');
            return;
        }

        const selectedModels = Object.entries(modelStates)
            .filter(([_, state]) => state.enabled)
            .map(([name]) => name);

        if (selectedModels.length === 0) {
            setFittingStatus('[ERROR] Please select at least one model before starting the fitting process.');
            return;
        }

        // Build parameter bounds configuration
        const parameterBounds: Record<string, ModelConfiguration> = {};
        selectedModels.forEach((modelName) => {
            const state = modelStates[modelName];
            const config: ModelConfiguration = {
                min: {},
                max: {},
                initial: {},
            };

            Object.entries(state.parameters).forEach(([paramName, bounds]) => {
                let { min, max } = bounds;

                // Validate and swap if needed
                if (max < min) {
                    [min, max] = [max, min];
                }

                const midpoint = min + (max - min) / 2;
                config.min[paramName] = min;
                config.max[paramName] = max;
                config.initial[paramName] = midpoint;
            });

            parameterBounds[modelName] = config;
        });

        setFittingStatus('[INFO] Starting fitting process...');

        const payload = {
            max_iterations: Math.max(1, Math.round(maxIterations)),
            save_best: saveBest,
            parameter_bounds: parameterBounds,
            dataset,
        };

        const result = await startFitting(payload);
        setFittingStatus(result.message);
    }, [dataset, modelStates, maxIterations, saveBest]);

    return (
        <div style={{ width: '100%', maxWidth: '1152px', margin: '0 auto', padding: '1.5rem' }}>
            <div className="flex flex-col gap-6">
                <h1
                    style={{
                        fontSize: '1.875rem',
                        fontWeight: 600,
                        color: 'var(--slate-900)',
                        letterSpacing: '0.015em',
                    }}
                >
                    ADSORFIT Model Fitting
                </h1>

                <div className="flex flex-row gap-6 items-start flex-wrap md-flex-nowrap w-full">
                    <ControlsPanel
                        maxIterations={maxIterations}
                        onMaxIterationsChange={setMaxIterations}
                        saveBest={saveBest}
                        onSaveBestChange={setSaveBest}
                        datasetStats={datasetStats}
                        fittingStatus={fittingStatus}
                        onDatasetUpload={handleDatasetUpload}
                        onStartFitting={handleStartFitting}
                    />

                    <div className="flex flex-col gap-4" style={{ flex: 1, minWidth: '320px' }}>
                        {Object.entries(MODEL_PARAMETER_DEFAULTS).map(([modelName, parameters]) => (
                            <ModelCard
                                key={modelName}
                                modelName={modelName}
                                parameters={parameters}
                                onParametersChange={handleParametersChange}
                                onToggle={handleModelToggle}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
