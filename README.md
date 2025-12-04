# ADSORFIT: Automated Adsorption Model Fitting

## 1. Project Overview
ADSORFIT accelerates adsorption-model research by combining automated curve fitting, visual analytics, and experiment management in a single workflow. The system consists of a FastAPI backend for data processing and model fitting, and a modern React + TypeScript frontend for interactive visualization and control. The fitting engine minimizes the least-squares distance between measured uptake profiles and the predictions of classical adsorption models, enabling quick comparison of hypotheses, sensitivity studies, and archiving of the best-performing solutions for future review.

## 2. Installation

### 2.1 Windows (One-Click Setup - No Prerequisites Required)
Windows users can enjoy a **completely portable, zero-dependency installation**. Simply launch `ADSORFIT/start_on_windows.bat` and the script will automatically:

1. Download and install **portable Python 3.12** locally (no global installation)
2. Install **uv** (fast Python package manager) locally
3. Download and install **portable Node.js v22** locally (no global installation)
4. Install all Python and Node.js dependencies
5. Build the React frontend
6. Launch both backend and frontend servers
7. Open your browser to the application interface

**First Run**: The initial setup takes 2-5 minutes (depending on internet speed) as it downloads Python, Node.js, and all dependencies. The portable installations are stored in `ADSORFIT/setup/` and reused for future launches.

**Subsequent Runs**: After the first setup, launching takes only a few seconds as all dependencies are already in place.

> **Note**: The portable Python and Node.js installations are contained within the project folder, avoiding any system-wide changes. You can move the entire project folder to another location, and it will continue to work.

### 2.2 macOS / Linux (Manual Setup)
For macOS and Linux users, you'll need to manually install prerequisites before running the application.

**Prerequisites:**
- **Python 3.12**
- **Node.js 18+** and npm
- A recent version of `pip`
- Recommended: a virtual environment manager such as `venv`, Conda, or Hatch

**Setup Steps:**
1. Create and activate a Python 3.12 environment.
2. Install backend dependencies from the repository root with `pip install -e . --use-pep517` (or `uv pip install -e .` if you prefer `uv`).
3. (Optional) Install test/tooling extras with `pip install -e .[dev]`.
4. Navigate to `ADSORFIT/client` and run `npm install` to install frontend dependencies.

## 3. How to use

### 3.1 Windows
Simply run `ADSORFIT/start_on_windows.bat` to launch both the FastAPI backend and the React frontend in a single step. The script handles everything automatically:

- First run: Downloads Python, Node.js, and installs dependencies (2-5 minutes)
- Subsequent runs: Launches immediately using cached installations (few seconds)

The browser will automatically open to the application interface at `http://127.0.0.1:7861`.

### 3.2 macOS / Linux
Activate your virtual environment, then start the backend and frontend separately:

```bash
# Terminal 1: Start backend
uvicorn ADSORFIT.server.app:app --host 0.0.0.0 --port 8000

# Terminal 2: Start frontend (Vite)
cd ADSORFIT/client
npm run dev -- --host 127.0.0.1 --port 7861
```

The interactive UI will be available at `http://127.0.0.1:7861` (proxied to the FastAPI backend at `http://127.0.0.1:8000`), and the API documentation can be viewed at `http://localhost:8000/docs`.

### 3.3 Using the Application

Upload CSV or Excel adsorption datasets, inspect automatic profiling statistics, tune model bounds and iteration limits, and follow solver progress in real time. Model cards include enable toggles to restrict the run to relevant isotherms; at least one model must remain active before fitting can begin.

## 4. Setup and Maintenance
Execute `ADSORFIT/setup_and_maintenance.bat` to open the maintenance console. Available actions include:

- **Update project** – pull the latest revision from GitHub using the bundled Git client.
- **Remove logs** – clear accumulated log files stored in `ADSORFIT/resources/logs`

## 5. Resources
The `resources` directory aggregates inputs, outputs, and utilities used during fitting runs:

- **database:** Centralized SQLite storage for uploaded experiments and fitting results. Import CSV or Excel files that follow the template columns (experiment label, temperature in Kelvin, pressure in Pascal, and uptake in mol/g). A sample adsorption dataset is available at `ADSORFIT/resources/templates/adsorption_data.csv`, and external tools such as DB Browser for SQLite can be used for inspection.
- **logs:** Rolling backend and interface logs, useful for diagnosing solver behavior or API requests. The launcher offers a maintenance shortcut for clearing these files.
- **templates:** Assets such as the dataset template and environment variable scaffold referenced throughout this README.

## 6. Configuration
Each adsorption model can be configured in the **Model Configuration** area by adjusting parameter bounds, iteration ceilings, and persistence preferences. Bounds are validated to remain positive before fitting begins to avoid infeasible solver states.

Runtime options (host, port, reload mode, and API endpoint) are defined through environment variables. The backend reads `ADSORFIT/setup/settings/.env` (start from `ADSORFIT/resources/templates/.env`), while the React frontend reads `ADSORFIT/client/.env` for the `VITE_` build-time variables.

| Variable              | Description                                              |
|-----------------------|----------------------------------------------------------|
| FASTAPI_HOST          | Host address for the FastAPI server (`ADSORFIT/setup/settings/.env`, default 127.0.0.1) |
| FASTAPI_PORT          | Port to run the FastAPI server (`ADSORFIT/setup/settings/.env`, default 8000) |
| RELOAD                | Enable auto-reload for development (`ADSORFIT/setup/settings/.env`, true/false) |
| VITE_API_BASE_URL     | Base URL used by the React frontend (`ADSORFIT/client/.env`, default `/api` for the Vite proxy) |

## 7. License
This project is licensed under the terms of the MIT license. See the LICENSE file for details.



