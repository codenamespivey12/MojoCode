import os
from supabase import create_client, Client

_client: Client | None = None


def get_supabase_client() -> Client:
    global _client
    if _client is None:
        url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
        key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        if not url or not key:
            raise ValueError("Supabase environment variables not set")
        _client = create_client(url, key)
    return _client

