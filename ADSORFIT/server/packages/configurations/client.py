from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from AEGIS.src.packages.types import coerce_bool

from ADSORFIT.server.packages.configurations.base import (     
    ensure_mapping,
    load_configuration_data,
)
from ADSORFIT.server.packages.constants import CLIENT_CONFIGURATION_FILE
from ADSORFIT.server.packages.types import coerce_float, coerce_int, coerce_str


# [CLIENT SETTINGS]
###############################################################################
@dataclass(frozen=True)
class UIRuntimeSettings:
    host: str
    port: int
    title: str
    show_welcome_message: bool
    reconnect_timeout: int
    http_timeout: float
    api_base_url: str

# -----------------------------------------------------------------------------
@dataclass(frozen=True)
class ClientSettings:
    ui: UIRuntimeSettings    


# [BUILDER FUNCTIONS]
###############################################################################
def build_ui_settings(payload: dict[str, Any] | Any) -> UIRuntimeSettings:
    return UIRuntimeSettings(
        host=coerce_str(payload.get("host"), "0.0.0.0"),
        port=coerce_int(payload.get("port"), 7861, minimum=1, maximum=65535),
        title=coerce_str(payload.get("title"), "ADSORFIT Model Fitting"),
        show_welcome_message=coerce_bool(payload.get("show_welcome_message"), False),
        reconnect_timeout=coerce_int(payload.get("reconnect_timeout"), 180, minimum=1),
        http_timeout=coerce_float(payload.get("http_timeout"), 120.0, minimum=1.0),
        api_base_url=coerce_str(payload.get("api_base_url"), "http://127.0.0.1:8000")
    )

# -----------------------------------------------------------------------------
def build_client_settings(payload: dict[str, Any] | Any) -> ClientSettings:
    ui_payload = ensure_mapping(payload.get("ui")) 

    return ClientSettings(ui=build_ui_settings(ui_payload))


# [CLIENT CONFIGURATION LOADER]
###############################################################################
def get_client_settings(config_path: str | None = None) -> ClientSettings:
    path = config_path or CLIENT_CONFIGURATION_FILE    
    payload = load_configuration_data(path)   

    return build_client_settings(payload)


client_settings = get_client_settings()
