from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app


def run(c: TestClient) -> None:
    assert c.get("/health").json()["status"] == "ok"

    r = c.post(
        "/api/auth/register",
        json={"email": "seller@test.com", "name": "Test Seller", "password": "password123"},
    )
    print("register:", r.status_code, r.json()["role"])
    assert r.status_code == 201 and r.json()["role"] == "seller"
    seller_token = r.json()["access_token"]

    assert (
        c.post(
            "/api/auth/register",
            json={"email": "seller@test.com", "name": "Dup", "password": "password123"},
        ).status_code
        == 409
    )

    me = c.get("/api/auth/me", headers={"Authorization": f"Bearer {seller_token}"})
    print("me:", me.status_code, me.json()["email"], "is_admin=", me.json()["is_admin"])
    assert me.status_code == 200 and me.json()["is_admin"] is False

    assert c.get("/api/auth/me").status_code == 401
    assert (
        c.post("/api/auth/login", json={"email": "seller@test.com", "password": "wrong"}).status_code
        == 401
    )

    s = get_settings()
    al = c.post("/api/auth/login", json={"email": s.admin_email, "password": s.admin_password})
    print("admin login:", al.status_code, al.json()["role"])
    assert al.status_code == 200 and al.json()["role"] == "admin"

    print("\nALL AUTH CHECKS PASSED")


if __name__ == "__main__":
    # `with` triggers the lifespan: init_db() creates tables, ensure_admin() seeds.
    with TestClient(app) as client:
        run(client)
