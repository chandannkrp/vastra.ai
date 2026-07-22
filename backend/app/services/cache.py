"""Tiny cache-aside helper backed by an in-process TTL dict. Best-effort — a
cache miss never breaks the request, it just falls through to the source."""

import json
import time

_mem: dict[str, tuple[str, float]] = {}


def get_json(key: str):
    hit = _mem.get(key)
    if hit and hit[1] > time.time():
        return json.loads(hit[0])
    if hit:
        _mem.pop(key, None)
    return None


def set_json(key: str, value, ttl: int = 30) -> None:
    data = json.dumps(value, default=str)
    _mem[key] = (data, time.time() + ttl)


def cached(key: str, ttl: int, producer):
    """Return cached value for `key`, else compute via `producer()` and store it."""
    hit = get_json(key)
    if hit is not None:
        return hit
    value = producer()
    set_json(key, value, ttl)
    return value
