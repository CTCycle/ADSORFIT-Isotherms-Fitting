from __future__ import annotations

import json
import os
import time

from ADSORFIT.server.utils.database.initializer import initialize_database
from ADSORFIT.server.utils.logger import logger


# -----------------------------------------------------------------------------
def load_database_config() -> dict[str, object]:
    settings_path = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "..",
            "..",
            "setup",
            "settings",
            "server_configurations.json",
        )
    )
    try:
        with open(settings_path, "r", encoding="utf-8") as file:
            data = json.load(file)
    except (OSError, json.JSONDecodeError) as exc:
        logger.warning("Unable to read database configuration: %s", exc)
        return {}
    database_config = data.get("database", {})
    return database_config if isinstance(database_config, dict) else {}


###############################################################################
if __name__ == "__main__":
    start = time.perf_counter()
    logger.info("Starting database initialization")
    logger.info("Current database configuration: %s", json.dumps(load_database_config()))
    initialize_database()
    elapsed = time.perf_counter() - start
    logger.info("Database initialization completed in %.2f seconds", elapsed)
