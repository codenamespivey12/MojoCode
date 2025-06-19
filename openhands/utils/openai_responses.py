import httpx

from openhands.core.config.llm_config import LLMConfig


def call_openai_responses_api(
    llm_config: LLMConfig,
    prompt: str,
    instructions: str | None = None,
) -> dict:
    """Call OpenAI's Responses API.

    Args:
        llm_config: LLM configuration.
        prompt: Text prompt to send as input.
        instructions: Optional system instructions for the model.

    Returns:
        Parsed JSON response from the API.
    """
    base_url = llm_config.base_url or 'https://api.openai.com'
    url = base_url.rstrip('/') + '/v1/responses'
    headers = {
        'Authorization': f'Bearer {llm_config.api_key.get_secret_value()}'
        if llm_config.api_key
        else '',
        'Content-Type': 'application/json',
    }
    payload = {
        'model': llm_config.model,
        'input': prompt,
        'reasoning_effort': llm_config.reasoning_effort,
    }
    if instructions:
        payload['instructions'] = instructions
    resp = httpx.post(
        url, headers=headers, json=payload, timeout=llm_config.timeout or 60
    )
    resp.raise_for_status()
    return resp.json()


def parse_response_text(resp: dict) -> str:
    """Extract the assistant text from a Responses API reply."""
    # Prefer SDK convenience field if present
    if isinstance(resp.get('output_text'), str):
        return resp['output_text']
    output = resp.get('output', [])
    for item in output:
        if item.get('type') == 'message':
            for content in item.get('content', []):
                if content.get('type') == 'output_text' and isinstance(
                    content.get('text'), str
                ):
                    return content['text']
    return ''
