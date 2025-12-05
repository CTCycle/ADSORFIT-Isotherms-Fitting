import React, { useState } from 'react';
import { Switch, NumberInput } from './UIComponents';
import type { ModelParameters } from '../types';

interface ModelGridCardProps {
    modelName: string;
    parameters: Record<string, [number, number]>;
    onParametersChange: (modelName: string, parameters: ModelParameters) => void;
    onToggle: (modelName: string, enabled: boolean) => void;
}

export const ModelGridCard: React.FC<ModelGridCardProps> = ({
    modelName,
    parameters,
    onParametersChange,
    onToggle
}) => {
    const [enabled, setEnabled] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [paramValues, setParamValues] = useState<ModelParameters>(() => {
        const initial: ModelParameters = {};
        Object.entries(parameters).forEach(([name, [min, max]]) => {
            initial[name] = { min, max };
        });
        return initial;
    });

    const handleToggle = (checked: boolean) => {
        setEnabled(checked);
        onToggle(modelName, checked);
    };

    const handleParameterChange = (paramName: string, boundType: 'min' | 'max', value: number) => {
        const updated = {
            ...paramValues,
            [paramName]: {
                ...paramValues[paramName],
                [boundType]: value,
            },
        };
        setParamValues(updated);
        onParametersChange(modelName, updated);
    };

    const handleSwitchClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className={`model-grid-card ${isExpanded ? 'expanded' : ''} ${!enabled ? 'disabled' : ''}`}>
            <div className="model-card-header" onClick={() => enabled && setIsExpanded(!isExpanded)}>
                <div className="model-card-title">
                    <strong>{modelName}</strong>
                    <div onClick={handleSwitchClick}>
                        <Switch
                            checked={enabled}
                            onChange={handleToggle}
                        />
                    </div>
                </div>
                <div className="expand-indicator">
                    {enabled && (
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    )}
                </div>
            </div>

            {isExpanded && enabled && (
                <div className="model-card-content">
                    <div className="flex flex-col gap-3 w-full">
                        {Object.entries(parameters).map(([paramName, [minDefault, maxDefault]]) => (
                            <div key={paramName} className="parameter-row">
                                <div className="parameter-label">{paramName}</div>
                                <div className="parameter-inputs">
                                    <NumberInput
                                        label="min"
                                        value={paramValues[paramName]?.min ?? minDefault}
                                        onChange={(value) => handleParameterChange(paramName, 'min', value)}
                                        min={0}
                                        step={0.0001}
                                        precision={4}
                                    />
                                    <NumberInput
                                        label="max"
                                        value={paramValues[paramName]?.max ?? maxDefault}
                                        onChange={(value) => handleParameterChange(paramName, 'max', value)}
                                        min={0}
                                        step={0.0001}
                                        precision={4}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

interface ModelsPageProps {
    modelDefaults: Record<string, Record<string, [number, number]>>;
    onParametersChange: (modelName: string, parameters: ModelParameters) => void;
    onToggle: (modelName: string, enabled: boolean) => void;
}

export const ModelsPage: React.FC<ModelsPageProps> = ({
    modelDefaults,
    onParametersChange,
    onToggle,
}) => {
    const modelNames = Object.keys(modelDefaults);

    // Create a 3x3 grid (9 cells total)
    const gridCells = Array(9).fill(null).map((_, index) => {
        const modelName = modelNames[index];
        return modelName ? (
            <ModelGridCard
                key={modelName}
                modelName={modelName}
                parameters={modelDefaults[modelName]}
                onParametersChange={onParametersChange}
                onToggle={onToggle}
            />
        ) : (
            <div key={`empty-${index}`} className="model-grid-card empty" />
        );
    });

    return (
        <div className="models-page">
            <div className="models-grid">
                {gridCells}
            </div>
        </div>
    );
};
