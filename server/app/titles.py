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


async def generate_title(model, message, result, attachments, fallback=None):
    prompt = json.dumps({"user": message[:2000], "assistant": result[:2000],
                         "attachments": [{"type": a.type, "filename": a.filename}
                                         for a in attachments]}, ensure_ascii=False)
    try:
        response = await asyncio.wait_for(model.generate_content_async(
            prompt, generation_config={"temperature": 0.2, "max_output_tokens": 256}), timeout=8)
        title = clean_title(response.text)
        if title and not is_placeholder_title(title):
            return title
    except Exception:
        if fallback is None:
            raise
    if fallback is not None:
        title = clean_title(await asyncio.wait_for(fallback(prompt), timeout=8))
        if title and not is_placeholder_title(title):
            return title
    return ""


def is_placeholder_title(title):
    return (title or "").strip().casefold() in {"", "new chat", "untitled", "title"}


def needs_title(session):
    return not session.title_is_custom and is_placeholder_title(session.title)


class TitleJobs:
    """Keep one bounded job per conversation, independently of its websocket."""
    def __init__(self):
        self.tasks = {}

    def start(self, key, factory):
        task = self.tasks.get(key)
        if task is None or task.done():
            task = asyncio.create_task(factory())
            self.tasks[key] = task
            def finished(done):
                if self.tasks.get(key) is done:
                    self.tasks.pop(key, None)
            task.add_done_callback(finished)
        return task

    async def close(self):
        tasks = list(self.tasks.values())
        for task in tasks:
            task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)
