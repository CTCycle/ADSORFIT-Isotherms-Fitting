// Model parameter defaults - matches Python backend constants

export const MODEL_PARAMETER_DEFAULTS: Record<string, Record<string, [number, number]>> = {
    "Langmuir": {
        "qm": [0.0001, 10.0],
        "b": [0.0001, 1.0],
    },
    "Freundlich": {
        "Kf": [0.0001, 10.0],
        "n": [0.1, 10.0],
    },
    "Sips": {
        "qm": [0.0001, 10.0],
        "b": [0.0001, 1.0],
        "n": [0.1, 10.0],
    },
};

const apiBaseEnv = (import.meta.env.VITE_API_BASE_URL || "").trim();
export const API_BASE_URL = (apiBaseEnv || "/api").replace(/\/+$/, "");
