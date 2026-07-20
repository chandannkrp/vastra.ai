"""Exercise the real HTTP flow against a running server: login, multipart upload,
poll pipeline progress, fetch a generated image. Makes one real pipeline run."""

import io
import time

import httpx
from PIL import Image as PILImage

BASE = "http://localhost:8000"


def png(color) -> bytes:
    out = io.BytesIO()
    PILImage.new("RGB", (400, 400), color).save(out, format="PNG")
    return out.getvalue()


def main() -> None:
    c = httpx.Client(base_url=BASE, timeout=30)
    tok = c.post("/api/auth/login", json={"email": "pipeline@test.com", "password": "password123"}).json()["access_token"]
    h = {"Authorization": f"Bearer {tok}"}

    # multipart create
    files = [("images", ("raw.png", png((140, 40, 60)), "image/png"))]
    data = {
        "title": "Ruby cotton (API test)",
        "fabric_type": "cotton",
        "color": "ruby red",
        "customization": '{"image_shots":["flatlay"],"tone":"minimal","audience":"boutiques","length":"short"}',
    }
    r = c.post("/api/submissions", headers=h, files=files, data=data)
    print("create:", r.status_code)
    sid = r.json()["id"]

    # poll
    for _ in range(60):
        d = c.get(f"/api/submissions/{sid}", headers=h).json()
        p = d["progress"]
        print(f"  stage={str(p['current']):<12} percent={p['percent']}")
        if p["done"] or p["failed"]:
            break
        time.sleep(3)

    d = c.get(f"/api/submissions/{sid}", headers=h).json()
    print("final status:", d["submission"]["status"], "| listing title:", (d["listing"] or {}).get("title"))
    gen = [i for i in d["images"] if i["kind"] == "enhanced"]
    if gen:
        img = c.get(BASE + gen[0]["url"])
        print("image fetch:", img.status_code, img.headers.get("content-type"), len(img.content), "bytes")
    print("API FLOW OK" if (d["progress"]["done"] and gen) else "API FLOW INCOMPLETE")


if __name__ == "__main__":
    main()
