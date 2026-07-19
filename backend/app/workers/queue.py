"""Thin job-queue abstraction.

MVP: runs jobs via FastAPI BackgroundTasks (single process). The `enqueue`
signature is stable so this can be swapped for arq/Redis later without
touching agent or API code.
"""

import logging
import traceback
from collections.abc import Callable

from fastapi import BackgroundTasks

logger = logging.getLogger("vastra.queue")


def _run_safely(fn: Callable, *args, **kwargs) -> None:
    try:
        fn(*args, **kwargs)
    except Exception:
        logger.error("Background job %s failed:\n%s", fn.__name__, traceback.format_exc())


def enqueue(background_tasks: BackgroundTasks, fn: Callable, *args, **kwargs) -> None:
    """Schedule `fn(*args, **kwargs)` to run after the response is sent."""
    background_tasks.add_task(_run_safely, fn, *args, **kwargs)
