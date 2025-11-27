import React, { useState } from 'react';
import { Expansion, Switch, NumberInput } from './UIComponents';
import type { ModelParameters } from '../types';

interface ModelCardProps {
    modelName: string;
    parameters: Record<string, [number, number]>;
    onParametersChange: (modelName: string, parameters: ModelParameters) => void;
    onToggle: (modelName: string, enabled: boolean) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({ modelName, parameters, onParametersChange, onToggle }) => {
    const [enabled, setEnabled] = useState(true);
    const [expansionDisabled, setExpansionDisabled] = useState(false);
    const [paramValues, setParamValues] = useState<ModelParameters>(() => {
        const initial: ModelParameters = {};
        Object.entries(parameters).forEach(([name, [min, max]]) => {
            initial[name] = { min, max };
        });
        return initial;
    });

    const handleToggle = (checked: boolean) => {
        setEnabled(checked);
        setExpansionDisabled(!checked);
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

    return (
        <div className="card" style={{ flex: 1, minWidth: '320px' }}>
            <div className="flex flex-col gap-3">
                <div className="flex flex-row items-center justify-between gap-3 w-full">
                    <div className="flex flex-row items-center gap-2">
                        <strong>{modelName}</strong>
                        <Switch checked={enabled} onChange={handleToggle} />
                    </div>
                </div>

                <Expansion title="Configure parameters" disabled={expansionDisabled}>
                    <div className="flex flex-col gap-3 w-full">
                        {Object.entries(parameters).map(([paramName, [minDefault, maxDefault]]) => (
                            <div key={paramName} className="flex flex-row gap-3 flex-wrap w-full">
                                <NumberInput
                                    label={`${paramName} min`}
                                    value={paramValues[paramName]?.min ?? minDefault}
                                    onChange={(value) => handleParameterChange(paramName, 'min', value)}
                                    min={0}
                                    step={0.0001}
                                    precision={4}
                                />
                                <NumberInput
                                    label={`${paramName} max`}
                                    value={paramValues[paramName]?.max ?? maxDefault}
                                    onChange={(value) => handleParameterChange(paramName, 'max', value)}
                                    min={0}
                                    step={0.0001}
                                    precision={4}
                                />
                            </div>
                        ))}
                    </div>
                </Expansion>
            </div>
        </div>
    );
};
