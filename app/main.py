import os
from contextlib import asynccontextmanager
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession

from . import crud, schemas
from .database import Base, engine, get_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/")
async def root():
    return FileResponse(os.path.join("app", "static", "index.html"))


@app.get(
    "/recipes", response_model=List[schemas.RecipeListOut], summary="Список рецептов"
)
async def read_recipes():
    return await crud.get_recipes(Depends(get_db))


@app.get(
    "/recipes/{recipe_id}",
    response_model=schemas.RecipeDetailOut,
    summary="Детальная информация о рецепте",
)
async def read_recipe(recipe_id: int):
    db: AsyncSession = Depends(get_db)
    recipe = await crud.get_recipe(db, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Рецепт не найден")
    return await crud.increment_views(db, recipe)


@app.post(
    "/recipes",
    response_model=schemas.RecipeDetailOut,
    status_code=201,
    summary="Создать рецепт",
)
async def create_recipe(recipe: schemas.RecipeCreate):
    return await crud.create_recipe(Depends(get_db), recipe)
