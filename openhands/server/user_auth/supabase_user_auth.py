from dataclasses import dataclass
from fastapi import Request
from pydantic import SecretStr

from openhands.integrations.provider import PROVIDER_TOKEN_TYPE
from openhands.server import shared
from openhands.server.settings import Settings
from openhands.server.user_auth.user_auth import UserAuth
from openhands.utils.supabase_client import get_supabase_client
from openhands.utils.async_utils import call_sync_from_async
from openhands.storage.data_models.user_secrets import UserSecrets
from openhands.storage.secrets.secrets_store import SecretsStore
from openhands.storage.settings.settings_store import SettingsStore


@dataclass
class SupabaseUserAuth(UserAuth):
    request: Request
    _user_id: str | None = None
    _email: str | None = None
    _settings: Settings | None = None
    _settings_store: SettingsStore | None = None
    _secrets_store: SecretsStore | None = None
    _user_secrets: UserSecrets | None = None

    async def _load_user(self) -> None:
        if self._user_id is not None:
            return
        token = self.request.cookies.get("sb:token") or self.request.headers.get("Authorization")
        if token and token.startswith("Bearer "):
            token = token.split(" ", 1)[1]
        if not token:
            return
        client = get_supabase_client()
        resp = await call_sync_from_async(client.auth.get_user, token)
        if resp and resp.user:
            self._user_id = resp.user.id
            self._email = resp.user.email

    async def get_user_id(self) -> str | None:
        await self._load_user()
        return self._user_id

    async def get_user_email(self) -> str | None:
        await self._load_user()
        return self._email

    async def get_access_token(self) -> SecretStr | None:
        return None

    async def get_user_settings_store(self) -> SettingsStore:
        store = self._settings_store
        if store:
            return store
        user_id = await self.get_user_id()
        store = await shared.SettingsStoreImpl.get_instance(shared.config, user_id)
        self._settings_store = store
        return store

    async def get_user_settings(self) -> Settings | None:
        settings = self._settings
        if settings:
            return settings
        store = await self.get_user_settings_store()
        settings = await store.load()
        self._settings = settings
        return settings

    async def get_secrets_store(self) -> SecretsStore:
        store = self._secrets_store
        if store:
            return store
        user_id = await self.get_user_id()
        store = await shared.SecretsStoreImpl.get_instance(shared.config, user_id)
        self._secrets_store = store
        return store

    async def get_user_secrets(self) -> UserSecrets | None:
        secrets = self._user_secrets
        if secrets:
            return secrets
        store = await self.get_secrets_store()
        secrets = await store.load()
        self._user_secrets = secrets
        return secrets

    async def get_provider_tokens(self) -> PROVIDER_TOKEN_TYPE | None:
        user_secrets = await self.get_user_secrets()
        if user_secrets is None:
            return None
        return user_secrets.provider_tokens

    @classmethod
    async def get_instance(cls, request: Request) -> UserAuth:
        return SupabaseUserAuth(request)

