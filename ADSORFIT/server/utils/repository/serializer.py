from __future__ import annotations

from typing import Any

import pandas as pd

from ADSORFIT.server.database.database import database


###############################################################################
class DataSerializer:
    experiment_table = "ADSORPTION_EXPERIMENT"
    best_fit_table = "ADSORPTION_BEST_FIT"
    experiment_columns = [
        "experiment",
        "temperature [K]",
        "pressure [Pa]",
        "uptake [mol/g]",
        "measurement_count",
        "min_pressure",
        "max_pressure",
        "min_uptake",
        "max_uptake",
    ]
    model_schemas: dict[str, dict[str, Any]] = {
        "LANGMUIR": {
            "prefix": "Langmuir",
            "table": "ADSORPTION_LANGMUIR",
            "fields": {
                "lss": "LSS",
                "k": "k",
                "k_error": "k error",
                "qsat": "qsat",
                "qsat_error": "qsat error",
            },
        },
        "SIPS": {
            "prefix": "Sips",
            "table": "ADSORPTION_SIPS",
            "fields": {
                "lss": "LSS",
                "k": "k",
                "k_error": "k error",
                "qsat": "qsat",
                "qsat_error": "qsat error",
                "exponent": "exponent",
                "exponent_error": "exponent error",
            },
        },
        "FREUNDLICH": {
            "prefix": "Freundlich",
            "table": "ADSORPTION_FREUNDLICH",
            "fields": {
                "lss": "LSS",
                "k": "k",
                "k_error": "k error",
                "exponent": "exponent",
                "exponent_error": "exponent error",
            },
        },
        "TEMKIN": {
            "prefix": "Temkin",
            "table": "ADSORPTION_TEMKIN",
            "fields": {
                "lss": "LSS",
                "k": "k",
                "k_error": "k error",
                "beta": "beta",
                "beta_error": "beta error",
            },
        },
    }
    
    # -------------------------------------------------------------------------
    def save_raw_dataset(self, dataset: pd.DataFrame) -> None:
        database.save_into_database(dataset, "ADSORPTION_DATA")

    # -------------------------------------------------------------------------
    def load_raw_dataset(self) -> pd.DataFrame:
        return database.load_from_database("ADSORPTION_DATA")

    # -------------------------------------------------------------------------
    def save_processed_dataset(self, dataset: pd.DataFrame) -> None:
        database.save_into_database(dataset, "ADSORPTION_PROCESSED_DATA")

    # -------------------------------------------------------------------------
    def load_processed_dataset(self) -> pd.DataFrame:
        encoded = database.load_from_database("ADSORPTION_PROCESSED_DATA")
        return encoded

    # -------------------------------------------------------------------------
    def save_fitting_results(self, dataset: pd.DataFrame) -> None:
        if dataset.empty:
            empty_experiments = pd.DataFrame(
                columns=["id", *self.experiment_columns]
            )
            database.save_into_database(empty_experiments, self.experiment_table)
            for schema in self.model_schemas.values():
                empty_model = pd.DataFrame(
                    columns=["id", "experiment_id", *schema["fields"].values()]
                )
                database.save_into_database(empty_model, schema["table"])
            return
        encoded = self.convert_lists_to_strings(dataset)
        experiments = self.build_experiment_frame(encoded)
        experiment_map = self.build_experiment_map(experiments)
        database.save_into_database(experiments, self.experiment_table)
        for schema in self.model_schemas.values():
            model_frame = self.build_model_frame(encoded, experiment_map, schema)
            if model_frame is None:
                continue
            database.save_into_database(model_frame, schema["table"])

    # -------------------------------------------------------------------------
    def load_fitting_results(self) -> pd.DataFrame:
        experiments = database.load_from_database(self.experiment_table)
        if experiments.empty:
            return experiments
        experiments = experiments.rename(columns={"id": "experiment_id"})
        experiments = self.convert_strings_to_lists(experiments)
        combined = experiments.copy()
        for schema in self.model_schemas.values():
            model_frame = database.load_from_database(schema["table"])
            if model_frame.empty:
                continue
            renamed = self.rename_model_columns(model_frame, schema)
            combined = combined.merge(renamed, how="left", on="experiment_id")
        return combined

    # -------------------------------------------------------------------------
    def save_best_fit(self, dataset: pd.DataFrame) -> None:
        if dataset.empty:
            empty_best = pd.DataFrame(
                columns=["id", "experiment_id", "best model", "worst model"]
            )
            database.save_into_database(empty_best, self.best_fit_table)
            return
        experiments = database.load_from_database(self.experiment_table)
        if experiments.empty:
            raise ValueError("No experiments available to link best fit results.")
        experiment_map = self.build_experiment_map(experiments)
        best = pd.DataFrame()
        best["experiment_id"] = dataset["experiment"].map(experiment_map)
        if best["experiment_id"].isnull().any():
            raise ValueError("Unmapped experiments found while saving best fit results.")
        best["best model"] = dataset.get("best model")
        best["worst model"] = dataset.get("worst model")
        best.insert(0, "id", range(1, len(best) + 1))
        database.save_into_database(best, self.best_fit_table)

    # -------------------------------------------------------------------------
    def load_best_fit(self) -> pd.DataFrame:
        best = database.load_from_database(self.best_fit_table)
        if best.empty:
            return best
        experiments = database.load_from_database(self.experiment_table)
        if experiments.empty:
            return pd.DataFrame()
        experiments = experiments.rename(columns={"id": "experiment_id"})
        experiments = self.convert_strings_to_lists(experiments)
        merged = experiments.merge(
            best.drop(columns=["id"]), how="left", on="experiment_id"
        )
        return merged

    # -------------------------------------------------------------------------
    def build_experiment_frame(self, dataset: pd.DataFrame) -> pd.DataFrame:
        missing = [column for column in self.experiment_columns if column not in dataset]
        if missing:
            raise ValueError(f"Missing experiment columns: {missing}")
        experiments = dataset.loc[:, self.experiment_columns].copy()
        experiments.insert(0, "id", range(1, len(experiments) + 1))
        return experiments

    # -------------------------------------------------------------------------
    def build_experiment_map(self, experiments: pd.DataFrame) -> dict[str, int]:
        return {
            name: int(identifier)
            for name, identifier in zip(
                experiments["experiment"], experiments["id"], strict=False
            )
        }

    # -------------------------------------------------------------------------
    def resolve_dataset_column(
        self, prefix: str, suffix: str, columns: list[str] | pd.Index
    ) -> str | None:
        target = f"{prefix} {suffix}".lower()
        for column in columns:
            if str(column).lower() == target:
                return column
        return None

    # -------------------------------------------------------------------------
    def build_model_frame(
        self,
        dataset: pd.DataFrame,
        experiment_map: dict[str, int],
        schema: dict[str, Any],
    ) -> pd.DataFrame | None:
        resolved = {
            field: self.resolve_dataset_column(schema["prefix"], suffix, dataset.columns)
            for field, suffix in schema["fields"].items()
        }
        if all(column is None for column in resolved.values()):
            return None
        model_frame = pd.DataFrame()
        model_frame["experiment_id"] = dataset["experiment"].map(experiment_map)
        if model_frame["experiment_id"].isnull().any():
            raise ValueError("Unmapped experiments found while building model results.")
        for field, column in resolved.items():
            target = schema["fields"][field]
            if column is None:
                model_frame[target] = pd.NA
            else:
                model_frame[target] = dataset[column]
        model_frame.insert(0, "id", range(1, len(model_frame) + 1))
        return model_frame

    # -------------------------------------------------------------------------
    def rename_model_columns(
        self, model_frame: pd.DataFrame, schema: dict[str, Any]
    ) -> pd.DataFrame:
        rename_map = {
            column_name: f"{schema['prefix']} {column_name}"
            for column_name in schema["fields"].values()
        }
        trimmed = model_frame.rename(columns=rename_map)
        return trimmed.drop(columns=["id"])

    # -------------------------------------------------------------------------
    def convert_list_to_string(self, value: Any) -> Any:
        if isinstance(value, (list, tuple)):
            parts: list[str] = []
            for element in value:
                if element is None:
                    continue
                text = str(element)
                if text:
                    parts.append(text)
            return ",".join(parts)
        return value

    # -------------------------------------------------------------------------
    def convert_string_to_list(self, value: Any) -> Any:
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            parts = [segment.strip() for segment in stripped.split(",")]
            converted: list[float] = []
            for part in parts:
                if not part:
                    continue
                try:
                    converted.append(float(part))
                except ValueError:
                    return value
            return converted
        return value

    # -------------------------------------------------------------------------
    def convert_lists_to_strings(self, dataset: pd.DataFrame) -> pd.DataFrame:
        converted = dataset.copy()
        for column in converted.columns:
            converted[column] = converted[column].apply(self.convert_list_to_string)
        return converted

    # -------------------------------------------------------------------------
    def convert_strings_to_lists(self, dataset: pd.DataFrame) -> pd.DataFrame:
        converted = dataset.copy()
        for column in converted.columns:
            if converted[column].dtype == object:
                converted[column] = converted[column].apply(self.convert_string_to_list)
        return converted
