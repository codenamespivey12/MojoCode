from __future__ import annotations

import json
import os
from dataclasses import asdict

from supabase import create_client, Client

from openhands.core.config.openhands_config import OpenHandsConfig
from openhands.storage.conversation.conversation_store import ConversationStore
from openhands.storage.data_models.conversation_metadata import ConversationMetadata
from openhands.storage.data_models.conversation_metadata_result_set import ConversationMetadataResultSet
from openhands.utils.async_utils import call_sync_from_async


class SupabaseConversationStore(ConversationStore):
    def __init__(self, client: Client, user_id: str):
        self.client = client
        self.user_id = user_id

    async def save_metadata(self, metadata: ConversationMetadata) -> None:
        data = asdict(metadata)
        data["user_id"] = self.user_id
        await call_sync_from_async(
            self.client.table("conversation_metadata").upsert, data
        )

    async def get_metadata(self, conversation_id: str) -> ConversationMetadata:
        resp = await call_sync_from_async(
            self.client.table("conversation_metadata")
            .select("*")
            .eq("conversation_id", conversation_id)
            .single()
            .execute
        )
        if resp.data is None:
            raise FileNotFoundError(conversation_id)
        return ConversationMetadata(**resp.data)

    async def delete_metadata(self, conversation_id: str) -> None:
        await call_sync_from_async(
            self.client.table("conversation_metadata")
            .delete()
            .eq("conversation_id", conversation_id)
            .execute
        )

    async def exists(self, conversation_id: str) -> bool:
        resp = await call_sync_from_async(
            self.client.table("conversation_metadata")
            .select("conversation_id")
            .eq("conversation_id", conversation_id)
            .single()
            .execute
        )
        return resp.data is not None

    async def search(self, page_id: str | None = None, limit: int = 20) -> ConversationMetadataResultSet:
        query = (
            self.client.table("conversation_metadata")
            .select("*")
            .eq("user_id", self.user_id)
            .order("created_at", desc=True)
            .limit(limit)
        )
        if page_id:
            query = query.lt("created_at", page_id)
        resp = await call_sync_from_async(query.execute)
        conversations = [ConversationMetadata(**item) for item in resp.data]
        next_page_id = (
            conversations[-1].created_at.isoformat() if len(conversations) == limit else None
        )
        return ConversationMetadataResultSet(conversations, next_page_id)

    @classmethod
    async def get_instance(cls, config: OpenHandsConfig, user_id: str | None) -> "SupabaseConversationStore":
        url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
        key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        if not url or not key or user_id is None:
            raise ValueError("Supabase not configured")
        client = create_client(url, key)
        return cls(client, user_id)

