import time
from threading import Thread

import pytest
import uvicorn
from aiohttp import ClientSession

from app.main import app


@pytest.fixture(scope="module")
def start_server():
    config = uvicorn.Config(app, host="127.0.0.1", port=8001, log_level="critical")
    server = uvicorn.Server(config)

    thread = Thread(target=server.run)
    thread.start()
    time.sleep(1)
    yield
    server.should_exit = True
    thread.join()


@pytest.mark.asyncio
async def test_read_recipes(start_server):
    async with ClientSession() as session:
        async with session.get("http://127.0.0.1:8001/recipes") as response:
            assert response.status == 200
            json_data = await response.json()
            assert isinstance(json_data, list)


@pytest.mark.asyncio
async def test_read_recipe_not_found(start_server):
    async with ClientSession() as session:
        async with session.get("http://127.0.0.1:8001/recipes/999999") as response:
            assert response.status == 404
            json_data = await response.json()
            assert json_data["detail"] == "Рецепт не найден"


@pytest.mark.asyncio
async def test_create_recipe_invalid_data(start_server):
    async with ClientSession() as session:
        async with session.post("http://127.0.0.1:8001/recipes", json={}) as response:
            assert response.status == 422


@pytest.mark.asyncio
async def test_create_recipe_valid_data(start_server):
    valid_recipe = {"title": "Тестовый рецепт", "description": "Описание"}
    async with ClientSession() as session:
        async with session.post(
            "http://127.0.0.1:8001/recipes", json=valid_recipe
        ) as response:
            if response.status == 201:
                json_data = await response.json()
                assert json_data["title"] == valid_recipe["title"]
