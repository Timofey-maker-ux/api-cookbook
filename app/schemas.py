from typing import List

from pydantic import BaseModel


class IngredientBase(BaseModel):
    name: str
    amount: str


class IngredientCreate(IngredientBase):
    pass


class IngredientOut(IngredientBase):
    id: int

    class Config:
        orm_mode = True


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

    class Config:
        orm_mode = True


class RecipeDetailOut(RecipeBase):
    id: int
    views: int
    ingredients: List[IngredientOut]

    class Config:
        orm_mode = True
