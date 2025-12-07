import React, { useState, useCallback, useMemo } from 'react';
import { ModelCard } from './ModelCard';
import { ADSORPTION_MODELS } from '../adsorptionModels';
import type { ModelParameters } from '../types';

interface ModelState {
    enabled: boolean;
    config: ModelParameters;
}

interface ModelsPageProps {
    onParametersChange: (modelName: string, parameters: ModelParameters) => void;
    onToggle: (modelName: string, enabled: boolean) => void;
}

/**
 * ModelsPage (ModelsPanel): Container component that manages the 9 adsorption model cards.
 * 
 * State management:
 * - expandedId: Single expanded card strategy - only one card can be expanded at a time.
 * - modelStates: Configuration and enabled state per model, persists across expand/collapse.
 * 
 * Data flow:
 * - Loads ADSORPTION_MODELS array for model metadata.
 * - Maintains configurations that survive expand/collapse events.
 * - Passes state down to ModelCard components.
 */
export const ModelsPage: React.FC<ModelsPageProps> = ({
    onParametersChange,
    onToggle,
}) => {
    // Single expanded card strategy: only one card can be expanded at a time
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Configuration state per model - persists across expand/collapse
    const [modelStates, setModelStates] = useState<Record<string, ModelState>>(() => {
        const initial: Record<string, ModelState> = {};
        ADSORPTION_MODELS.forEach((model) => {
            const config: ModelParameters = {};
            Object.entries(model.parameterDefaults).forEach(([name, [min, max]]) => {
                config[name] = { min, max };
            });
            initial[model.name] = { enabled: true, config };
        });
        return initial;
    });

    // Handle card expand/collapse toggle
    const handleCardToggle = useCallback((modelId: string) => {
        setExpandedId((prev) => (prev === modelId ? null : modelId));
    }, []);

    // Handle model enabled/disabled toggle
    const handleEnabledChange = useCallback(
        (modelName: string, enabled: boolean) => {
            setModelStates((prev) => ({
                ...prev,
                [modelName]: { ...prev[modelName], enabled },
            }));
            onToggle(modelName, enabled);
        },
        [onToggle]
    );

    // Handle configuration change
    const handleConfigChange = useCallback(
        (modelName: string, config: ModelParameters) => {
            setModelStates((prev) => ({
                ...prev,
                [modelName]: { ...prev[modelName], config },
            }));
            onParametersChange(modelName, config);
        },
        [onParametersChange]
    );

    // Create a 3x3 grid (9 cells total) using the ADSORPTION_MODELS data
    const gridCells = useMemo(() => {
        return Array(9)
            .fill(null)
            .map((_, index) => {
                const model = ADSORPTION_MODELS[index];
                if (!model) {
                    return <div key={`empty-${index}`} className="model-grid-card empty" />;
                }

                const state = modelStates[model.name] || {
                    enabled: true,
                    config: {},
                };

                return (
                    <ModelCard
                        key={model.id}
                        model={model}
                        isExpanded={expandedId === model.id}
                        isEnabled={state.enabled}
                        currentConfig={state.config}
                        onToggle={handleCardToggle}
                        onEnabledChange={handleEnabledChange}
                        onConfigChange={handleConfigChange}
                    />
                );
            });
    }, [expandedId, modelStates, handleCardToggle, handleEnabledChange, handleConfigChange]);

    return (
        <div className="models-page">
            <div className="models-grid">{gridCells}</div>
        </div>
    );
};

export default ModelsPage;
