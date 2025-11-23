from __future__ import annotations

from fastapi import FastAPI
from fastapi.responses import RedirectResponse

from ADSORFIT.src.packages.variables import env_variables
from ADSORFIT.src.packages.configurations import server_settings
from ADSORFIT.src.server.endpoints.datasets import router as dataset_router
from ADSORFIT.src.server.endpoints.fitting import router as fit_router


###############################################################################
app = FastAPI(
    title=server_settings.fastapi.title,
    version=server_settings.fastapi.version,
    description=server_settings.fastapi.description,
)

app.include_router(dataset_router)
app.include_router(fit_router)

@app.get("/")
def redirect_to_docs() -> RedirectResponse:
    return RedirectResponse(url="/docs")
