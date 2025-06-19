from __future__ import annotations

import json
import os
from dataclasses import asdict

from supabase import create_client, Client

from openhands.core.config.openhands_config import OpenHandsConfig
from openhands.storage.data_models.user_secrets import UserSecrets
from openhands.storage.secrets.secrets_store import SecretsStore
from openhands.utils.async_utils import call_sync_from_async


class SupabaseSecretsStore(SecretsStore):
    def __init__(self, client: Client, user_id: str):
        self.client = client
        self.user_id = user_id

    async def load(self) -> UserSecrets | None:
        resp = await call_sync_from_async(
            self.client.table("user_secrets").select("data").eq("user_id", self.user_id).single().execute
        )
        if resp.data is None:
            return None
        data = resp.data.get("data") or {}
        if isinstance(data, str):
            data = json.loads(data)
        return UserSecrets(**data)

    async def store(self, secrets: UserSecrets) -> None:
        data = asdict(secrets)
        await call_sync_from_async(
            self.client.table("user_secrets").upsert({"user_id": self.user_id, "data": data}).execute
        )

    @classmethod
    async def get_instance(cls, config: OpenHandsConfig, user_id: str | None) -> "SupabaseSecretsStore":
        url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
        key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        if not url or not key or user_id is None:
            raise ValueError("Supabase not configured")
        client = create_client(url, key)
        return cls(client, user_id)

