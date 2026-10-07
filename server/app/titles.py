"""Bounded, independently testable conversation title generation."""
import asyncio
import json
import re


def clean_title(text):
    title = " ".join(text.strip().split())
    title = re.sub(r"^title\s*:\s*", "", title, flags=re.I)
    title = title.strip(" \"'`*#“”‘’")
    if len(title) > 60:
        title = title[:60].rsplit(" ", 1)[0] if " " in title[:60] else title[:60]
    return title.rstrip(" .!?:;…")


async def generate_title(model, message, result, attachments):
    response = await asyncio.wait_for(model.generate_content_async(
        json.dumps({"user": message[:2000], "assistant": result[:2000],
                    "attachments": [{"type": a.type, "filename": a.filename}
                                    for a in attachments]}, ensure_ascii=False),
        generation_config={"temperature": 0.2, "max_output_tokens": 80}), timeout=8)
    title = clean_title(response.text)
    if title.casefold() in {"new chat", "untitled", "title"}:
        return ""
    return title
