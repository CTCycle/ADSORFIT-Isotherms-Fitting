import { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ConfigPage } from './components/ConfigPage';
import { ModelsPage } from './components/ModelsPage';
import { MetricsPage } from './components/MetricsPage';
import { MODEL_PARAMETER_DEFAULTS } from './constants';
import { loadDataset, startFitting } from './services';
import type { DatasetPayload, ModelParameters, ModelConfiguration } from './types';
import './index.css';

interface ModelState {
    enabled: boolean;
    parameters: ModelParameters;
}

type PageType = 'config' | 'models' | 'metrics';

function App() {
    const [currentPage, setCurrentPage] = useState<PageType>('config');
    const [maxIterations, setMaxIterations] = useState(10000);
    const [saveBest, setSaveBest] = useState(false);
    const [optimizationMethod, setOptimizationMethod] = useState('LSS');
    const [datasetStats, setDatasetStats] = useState('No dataset loaded.');
    const [fittingStatus, setFittingStatus] = useState('');
    const [dataset, setDataset] = useState<DatasetPayload | null>(null);
    const [datasetName, setDatasetName] = useState<string | null>(null);
    const [datasetSamples, setDatasetSamples] = useState(0);
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

        if (result.dataset) {
            setDatasetName(file.name);
            const recordCount = Array.isArray(result.dataset.records) ? result.dataset.records.length : 0;
            setDatasetSamples(recordCount);
        } else {
            setDatasetName(null);
            setDatasetSamples(0);
        }

        setDatasetStats(result.message);
    }, []);

    const handleResetFittingStatus = useCallback(() => {
        setFittingStatus('');
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
            optimization_method: optimizationMethod,
            parameter_bounds: parameterBounds,
            dataset,
        };

        const result = await startFitting(payload);
        setFittingStatus(result.message);
    }, [dataset, modelStates, maxIterations, optimizationMethod, saveBest]);

    const methodLabels: Record<string, string> = {
        LSS: 'Least Squares',
        BFGS: 'BFGS',
        'L-BFGS-B': 'L-BFGS-B',
        'Nelder-Mead': 'Nelder-Mead',
        Powell: 'Powell',
    };

    const optimizationLabel = methodLabels[optimizationMethod] || optimizationMethod;
    const datasetLabel = datasetName || 'none';

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-content">
                    <h1>ADSORFIT Model Fitting</h1>
                    <div className="header-meta">
                        <span className="meta-chip">Dataset: {datasetLabel}</span>
                        <span className="meta-separator">|</span>
                        <span className="meta-chip">Method: {optimizationLabel}</span>
                    </div>
                </div>
            </header>

            <div className="app-layout">
                <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

                <main className="app-main">
                    {currentPage === 'config' && (
                        <ConfigPage
                            maxIterations={maxIterations}
                            onMaxIterationsChange={setMaxIterations}
                            saveBest={saveBest}
                            onSaveBestChange={setSaveBest}
                            optimizationMethod={optimizationMethod}
                            onOptimizationMethodChange={setOptimizationMethod}
                            datasetStats={datasetStats}
                            fittingStatus={fittingStatus}
                            datasetName={datasetName}
                            datasetSamples={datasetSamples}
                            optimizationLabel={optimizationLabel}
                            onDatasetUpload={handleDatasetUpload}
                            onStartFitting={handleStartFitting}
                            onResetFittingStatus={handleResetFittingStatus}
                        />
                    )}

                    {currentPage === 'models' && (
                        <ModelsPage
                            modelDefaults={MODEL_PARAMETER_DEFAULTS}
                            onParametersChange={handleParametersChange}
                            onToggle={handleModelToggle}
                        />
                    )}

                    {currentPage === 'metrics' && <MetricsPage />}
                </main>
            </div>
        </div>
    );
}

export default App;
