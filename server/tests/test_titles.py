import asyncio
import json
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.titles import clean_title, generate_title


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


if __name__ == "__main__":
    unittest.main()
