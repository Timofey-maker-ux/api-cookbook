from typing import List

from pydantic import BaseModel, ConfigDict


class IngredientBase(BaseModel):
    name: str
    amount: str


class IngredientCreate(IngredientBase):
    pass


class IngredientOut(IngredientBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class RecipeBase(BaseModel):
    name: str
    description: str
    cook_time: int


class RecipeCreate(RecipeBase):
    ingredients: List[IngredientCreate]


class RecipeListOut(BaseModel):
    id: int
    name: str
    cook_time: int
    views: int

    model_config = ConfigDict(from_attributes=True)


class RecipeDetailOut(RecipeBase):
    id: int
    views: int
    ingredients: List[IngredientOut]

    model_config = ConfigDict(from_attributes=True)
