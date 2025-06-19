from __future__ import annotations

import json
import os
from dataclasses import asdict

from supabase import create_client, Client

from openhands.core.config.openhands_config import OpenHandsConfig
from openhands.storage.data_models.settings import Settings
from openhands.storage.settings.settings_store import SettingsStore
from openhands.utils.async_utils import call_sync_from_async


class SupabaseSettingsStore(SettingsStore):
    def __init__(self, client: Client, user_id: str):
        self.client = client
        self.user_id = user_id

    async def load(self) -> Settings | None:
        resp = await call_sync_from_async(
            self.client.table("settings").select("data").eq("user_id", self.user_id).single().execute
        )
        if resp.data is None:
            return None
        data = resp.data.get("data") or {}
        if isinstance(data, str):
            data = json.loads(data)
        return Settings(**data)

    async def store(self, settings: Settings) -> None:
        data = asdict(settings)
        await call_sync_from_async(
            self.client.table("settings").upsert({"user_id": self.user_id, "data": data}).execute
        )

    @classmethod
    async def get_instance(cls, config: OpenHandsConfig, user_id: str | None) -> "SupabaseSettingsStore":
        url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
        key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        if not url or not key or user_id is None:
            raise ValueError("Supabase not configured")
        client = create_client(url, key)
        return cls(client, user_id)

