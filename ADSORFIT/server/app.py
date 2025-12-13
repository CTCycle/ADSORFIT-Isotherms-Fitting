from __future__ import annotations

from fastapi import FastAPI
from fastapi.responses import RedirectResponse

from ADSORFIT.server.utils.constants import DOCS_ENDPOINT, ROOT_ENDPOINT
from ADSORFIT.server.utils.variables import env_variables
from ADSORFIT.server.utils.configurations import server_settings
from ADSORFIT.server.routes.datasets import router as dataset_router
from ADSORFIT.server.routes.fitting import router as fit_router
from ADSORFIT.server.routes.browser import router as browser_router


###############################################################################
app = FastAPI(
    title=server_settings.fastapi.title,
    version=server_settings.fastapi.version,
    description=server_settings.fastapi.description,
)

app.include_router(dataset_router)
app.include_router(fit_router)
app.include_router(browser_router)

# -------------------------------------------------------------------------
@app.get(ROOT_ENDPOINT)
def redirect_to_docs() -> RedirectResponse:
    return RedirectResponse(url=DOCS_ENDPOINT)
