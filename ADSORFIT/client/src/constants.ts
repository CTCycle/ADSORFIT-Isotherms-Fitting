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
    "Toth": {
        "qm": [0.0001, 10.0],
        "b": [0.0001, 1.0],
        "t": [0.1, 10.0],
    },
    "Redlich-Peterson": {
        "A": [0.0001, 10.0],
        "B": [0.0001, 1.0],
        "g": [0.1, 1.0],
    },
    "BET": {
        "qm": [0.0001, 10.0],
        "C": [0.0001, 100.0],
    },
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
