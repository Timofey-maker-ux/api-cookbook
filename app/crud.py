from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from . import models, schemas


async def get_recipes(db: AsyncSession):
    result = await db.execute(
        select(models.Recipe)
        .options(selectinload(models.Recipe.ingredients))
        .order_by(models.Recipe.views.desc(), models.Recipe.cook_time.asc())
    )
    return result.scalars().all()


async def get_recipe(db: AsyncSession, recipe_id: int):
    result = await db.execute(
        select(models.Recipe)
        .options(selectinload(models.Recipe.ingredients))
        .where(models.Recipe.id == recipe_id)
    )
    return result.scalars().first()


async def create_recipe(
    db: AsyncSession, recipe: schemas.RecipeCreate
) -> models.Recipe:
    db_recipe = models.Recipe(
        name=recipe.name, description=recipe.description, cook_time=recipe.cook_time
    )
    db.add(db_recipe)
    await db.flush()

    for ing in recipe.ingredients:
        db_ingredient = models.Ingredient(
            name=ing.name, amount=ing.amount, recipe_id=db_recipe.id
        )
        db.add(db_ingredient)

    await db.commit()
    await db.refresh(db_recipe)

    return await get_recipe(db, int(db_recipe.id))


async def increment_views(db: AsyncSession, recipe: Any) -> models.Recipe:
    recipe.views += 1
    await db.commit()
    await db.refresh(recipe)
    return recipe
