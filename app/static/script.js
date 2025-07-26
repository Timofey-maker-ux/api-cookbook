const apiBase = "http://127.0.0.1:8000";

// Элементы
const recipeListDiv = document.getElementById("recipe-list");
const recipeDetailDiv = document.getElementById("recipe-detail");
const recipeCreateDiv = document.getElementById("recipe-create");
const recipesUl = document.getElementById("recipes");

const detailName = document.getElementById("detail-name");
const detailCookTime = document.getElementById("detail-cook-time");
const detailViews = document.getElementById("detail-views");
const detailDescription = document.getElementById("detail-description");
const detailIngredients = document.getElementById("detail-ingredients");

const showListBtn = document.getElementById("show-list");
const showCreateBtn = document.getElementById("show-create");
const backToListBtn = document.getElementById("back-to-list");
const backFromCreateBtn = document.getElementById("back-from-create");

const createForm = document.getElementById("create-form");
const ingredientsListDiv = document.getElementById("ingredients-list");
const addIngredientBtn = document.getElementById("add-ingredient");
const formErrorDiv = document.getElementById("form-error");

// Показать список рецептов
async function fetchRecipeList() {
  try {
    const res = await fetch(`${apiBase}/recipes`);
    if (!res.ok) throw new Error("Не удалось загрузить список рецептов");
    const data = await res.json();
    renderRecipeList(data);
    showSection("list");
  } catch (err) {
    alert(err.message);
  }
}

// Отобразить список рецептов
function renderRecipeList(recipes) {
  recipesUl.innerHTML = "";
  if (recipes.length === 0) {
    recipesUl.innerHTML = "<li>Рецепты не найдены.</li>";
    return;
  }

  recipes.forEach(r => {
    const li = document.createElement("li");
    li.textContent = `${r.name} — Время: ${r.cook_time} мин — Просмотров: ${r.views}`;
    li.classList.add("pointer");
    li.onclick = () => fetchRecipeDetail(r.id);
    recipesUl.appendChild(li);
  });
}

// Показать детальную информацию
async function fetchRecipeDetail(id) {
  try {
    const res = await fetch(`${apiBase}/recipes/${id}`);
    if (!res.ok) throw new Error("Рецепт не найден");
    const recipe = await res.json();
    renderRecipeDetail(recipe);
    showSection("detail");
  } catch (err) {
    alert(err.message);
  }
}

// Отобразить детали рецепта
function renderRecipeDetail(recipe) {
  detailName.textContent = recipe.name;
  detailCookTime.textContent = recipe.cook_time;
  detailViews.textContent = recipe.views;
  detailDescription.textContent = recipe.description;

  detailIngredients.innerHTML = "";
  if (recipe.ingredients.length === 0) {
    detailIngredients.innerHTML = "<li>Ингредиенты не указаны.</li>";
  } else {
    recipe.ingredients.forEach(ing => {
      const li = document.createElement("li");
      li.textContent = `${ing.name} — ${ing.amount}`;
      detailIngredients.appendChild(li);
    });
  }
}

// Добавить поля для нового ингредиента в форму создания
function addIngredientFields(name = "", amount = "") {
  const div = document.createElement("div");
  div.className = "ingredient";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Название ингредиента";
  nameInput.required = true;
  nameInput.value = name;

  const amountInput = document.createElement("input");
  amountInput.type = "text";
  amountInput.placeholder = "Количество";
  amountInput.required = true;
  amountInput.value = amount;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "Удалить";
  removeBtn.style.marginLeft = "10px";
  removeBtn.onclick = () => ingredientsListDiv.removeChild(div);

  div.appendChild(nameInput);
  div.appendChild(amountInput);
  div.appendChild(removeBtn);

  ingredientsListDiv.appendChild(div);
}

// Собрать данные из формы создания
function getCreateFormData() {
  const name = createForm.name.value.trim();
  const description = createForm.description.value.trim();
  const cook_time = parseInt(createForm.cook_time.value);

  const ingredientsDivs = [...ingredientsListDiv.children];
  const ingredients = [];

  for (const div of ingredientsDivs) {
    const inputs = div.querySelectorAll("input");
    const ingName = inputs[0].value.trim();
    const ingAmount = inputs[1].value.trim();
    if (!ingName || !ingAmount) {
      return null; // ошибка валидации
    }
    ingredients.push({ name: ingName, amount: ingAmount });
  }

  if (!name || !description || !cook_time || ingredients.length === 0) {
    return null;
  }

  return { name, description, cook_time, ingredients };
}

// Отправить новый рецепт на сервер
async function submitNewRecipe(e) {
  e.preventDefault();
  formErrorDiv.style.display = "none";

  const data = getCreateFormData();
  if (!data) {
    formErrorDiv.textContent = "Пожалуйста, заполните все поля и добавьте хотя бы один ингредиент.";
    formErrorDiv.style.display = "block";
    return;
  }

  try {
    const res = await fetch(`${apiBase}/recipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || "Ошибка при создании рецепта");
    }
    alert("Рецепт создан успешно!");
    createForm.reset();
    ingredientsListDiv.innerHTML = "";
    showSection("list");
    fetchRecipeList();
  } catch (err) {
    formErrorDiv.textContent = err.message;
    formErrorDiv.style.display = "block";
  }
}

// Показать нужный раздел, скрыть остальные
function showSection(section) {
  recipeListDiv.style.display = section === "list" ? "block" : "none";
  recipeDetailDiv.style.display = section === "detail" ? "block" : "none";
  recipeCreateDiv.style.display = section === "create" ? "block" : "none";
}

// Обработчики кнопок показа разных частей UI
showListBtn.onclick = () => fetchRecipeList();
showCreateBtn.onclick = () => {
  showSection("create");
  ingredientsListDiv.innerHTML = "";
  addIngredientFields();
  formErrorDiv.style.display = "none";
  createForm.reset();
};
backToListBtn.onclick = () => fetchRecipeList();
backFromCreateBtn.onclick = () => fetchRecipeList();

addIngredientBtn.onclick = () => addIngredientFields();

createForm.addEventListener("submit", submitNewRecipe);

// При загрузке страницы сразу показать список рецептов
fetchRecipeList();
