import asyncio
import json
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.titles import clean_title, generate_title, needs_title, TitleJobs


class TitleTests(unittest.IsolatedAsyncioTestCase):
    def test_title_formatting_and_length(self):
        self.assertEqual(clean_title('Title: "**Debugging Python imports**"'), "Debugging Python imports")
        self.assertEqual(clean_title("  Neural\nnetwork learning. "), "Neural network learning")
        self.assertLessEqual(len(clean_title("長" * 100)), 60)
        self.assertEqual(clean_title("A " * 40), "A " * 29 + "A")

    async def test_context_is_bounded_and_excludes_attachment_content(self):
        model = SimpleNamespace(generate_content_async=AsyncMock(return_value=SimpleNamespace(text="Quarterly revenue analysis")))
        title = await generate_title(model, "u" * 3000, "a" * 3000,
            [SimpleNamespace(type="file", filename="report.pdf", content="private full document")])
        self.assertEqual(title, "Quarterly revenue analysis")
        data = json.loads(model.generate_content_async.call_args.args[0])
        self.assertEqual(len(data["user"]), 2000)
        self.assertEqual(len(data["assistant"]), 2000)
        self.assertEqual(data["attachments"], [{"type": "file", "filename": "report.pdf"}])

    async def test_empty_or_placeholder_output_is_rejected(self):
        for text in ["", "  ", "New Chat", "Untitled"]:
            model = SimpleNamespace(generate_content_async=AsyncMock(return_value=SimpleNamespace(text=text)))
            self.assertEqual(await generate_title(model, "Hi", "Hello", []), "")

    async def test_generation_has_a_timeout(self):
        model = SimpleNamespace(generate_content_async=AsyncMock(side_effect=TimeoutError))
        with self.assertRaises(TimeoutError):
            await generate_title(model, "Hi", "Hello", [])
        async def timeout(awaitable, timeout):
            self.assertEqual(timeout, 8)
            awaitable.close()
            raise TimeoutError
        with patch("app.titles.asyncio.wait_for", side_effect=timeout):
            with self.assertRaises(TimeoutError):
                await generate_title(model, "Hi", "Hello", [])

    async def test_cancellation_propagates(self):
        model = SimpleNamespace(generate_content_async=AsyncMock(side_effect=asyncio.CancelledError))
        with self.assertRaises(asyncio.CancelledError):
            await generate_title(model, "Hi", "Hello", [])

    def test_existing_untitled_conversations_are_eligible(self):
        for title in ["New Chat", "new chat", " New chat ", "", "Untitled"]:
            self.assertTrue(needs_title(SimpleNamespace(title=title, title_is_custom=False)))
            self.assertFalse(needs_title(SimpleNamespace(title=title, title_is_custom=True)))
        self.assertFalse(needs_title(SimpleNamespace(title="Python imports", title_is_custom=False)))

    async def test_backup_recovers_provider_error_or_empty_output(self):
        for response in [TimeoutError(), SimpleNamespace(text=""), SimpleNamespace(text="New Chat")]:
            model = SimpleNamespace(generate_content_async=AsyncMock(
                side_effect=response if isinstance(response, Exception) else None,
                return_value=response))
            fallback = AsyncMock(return_value="Python import debugging")
            self.assertEqual(await generate_title(model, "Import error", "Check paths", [], fallback),
                             "Python import debugging")
            fallback.assert_awaited_once()

    async def test_success_does_not_call_backup(self):
        model = SimpleNamespace(generate_content_async=AsyncMock(return_value=SimpleNamespace(text="Python imports")))
        fallback = AsyncMock()
        self.assertEqual(await generate_title(model, "Import error", "Check paths", [], fallback), "Python imports")
        fallback.assert_not_awaited()

    async def test_disconnect_preserves_deduplicated_title_job(self):
        jobs = TitleJobs()
        release = asyncio.Event()
        completed = []
        async def generate():
            await release.wait()
            completed.append("saved")
            return "Recovered title"
        job = jobs.start(("owner", "chat"), generate)
        self.assertIs(jobs.start(("owner", "chat"), generate), job)
        async def notification():
            return await asyncio.shield(job)
        waiter = asyncio.create_task(notification())
        await asyncio.sleep(0)
        waiter.cancel()
        with self.assertRaises(asyncio.CancelledError):
            await waiter
        self.assertFalse(job.cancelled())
        release.set()
        self.assertEqual(await job, "Recovered title")
        self.assertEqual(completed, ["saved"])
        self.assertEqual(jobs.tasks, {})

    async def test_finished_job_can_retry_and_shutdown_cancels_pending_jobs(self):
        jobs = TitleJobs()
        first = jobs.start("chat", AsyncMock(return_value=None))
        await first
        second = jobs.start("chat", AsyncMock(return_value="Recovered title"))
        self.assertIsNot(first, second)
        self.assertEqual(await second, "Recovered title")
        pending = jobs.start("other", lambda: asyncio.Event().wait())
        await jobs.close()
        self.assertTrue(pending.cancelled())


if __name__ == "__main__":
    unittest.main()
