(() => {
  const key = "dela.tasks.v1";
  const categories = { work: "Работа", personal: "Личное", study: "Учёба", home: "Дом" };
  const examples = [
    { id: "sample-5", title: "Собрать референсы для проекта", category: "work", done: false },
    { id: "sample-4", title: "Записаться на тренировку", category: "personal", done: false },
    { id: "sample-3", title: "Прочитать главу книги", category: "study", done: false },
    { id: "sample-2", title: "Купить продукты на неделю", category: "home", done: true },
    { id: "sample-1", title: "Разобрать входящие письма", category: "work", done: true }
  ];
  const $ = (selector) => document.querySelector(selector);
  const list = $("#task-list");
  const titleInput = $("#task-title");
  const categorySelect = $("#category");
  const sortSelect = $("#sort");
  const filters = document.querySelectorAll("[data-filter]");
  const collator = new Intl.Collator("ru", { numeric: true });
  let filter = "all";
  let storageAvailable = true;
  let tasks = examples;

  function readTasks() {
    const raw = localStorage.getItem(key);
    if (raw === null) return examples;
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved)) throw new Error("Некорректный список");
    return saved.filter(task => task && typeof task.id === "string"
      && typeof task.title === "string" && typeof task.done === "boolean");
  }

  try {
    tasks = readTasks();
    if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify(tasks));
  } catch {
    storageAvailable = false;
  }

  function changeTasks(update) {
    function commit() {
      if (storageAvailable) {
        try {
          tasks = readTasks();
        } catch {
          storageAvailable = false;
        }
      }
      tasks = update(tasks);
      try {
        localStorage.setItem(key, JSON.stringify(tasks));
        storageAvailable = true;
      } catch {
        storageAvailable = false;
      }
      render();
    }
    // Serialize edits made by several open tabs on the same origin.
    if (navigator.locks) return navigator.locks.request(key, commit);
    commit();
    return Promise.resolve();
  }

  function announce(message) {
    $("#announcement").textContent = message;
  }

  function createRow(task) {
    const row = $("#task-row").content.firstElementChild.cloneNode(true);
    row.dataset.id = task.id;
    row.classList.toggle("done", task.done);
    row.querySelector(".task-name").textContent = task.title;
    row.querySelector("input").checked = task.done;
    row.querySelector("button").setAttribute("aria-label", "Удалить задачу «" + task.title + "»");
    const badge = row.querySelector(".tag");
    if (Object.hasOwn(categories, task.category)) {
      badge.classList.add(task.category);
      badge.textContent = categories[task.category];
    } else {
      badge.remove();
    }
    return row;
  }

  function render() {
    const done = tasks.filter(task => task.done).length;
    const counts = { all: tasks.length, active: tasks.length - done, done };
    const percent = tasks.length ? Math.round(done * 100 / tasks.length) : 0;
    $("#progress-caption").textContent = "Выполнено " + done + " из " + tasks.length;
    $("#percentage").textContent = percent + "%";
    $("#progress").value = percent;
    for (const button of filters) {
      button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
      button.querySelector("span").textContent = counts[button.dataset.filter];
    }

    const visible = tasks.filter(task => filter === "all" || task.done === (filter === "done"));
    if (sortSelect.value === "oldest") visible.reverse();
    if (sortSelect.value === "alpha") visible.sort((a, b) => collator.compare(a.title, b.title));

    const focused = document.activeElement;
    const focusedRow = focused?.closest(".task");
    const position = focusedRow ? Array.from(list.children).indexOf(focusedRow) : -1;
    list.replaceChildren(...visible.map(createRow));
    if (position >= 0) {
      const row = Array.from(list.children).find(item => item.dataset.id === focusedRow.dataset.id)
        ?? list.children[Math.min(position, list.children.length - 1)];
      const nextControl = row?.querySelector(focused.matches("input") ? "input" : "button") ?? titleInput;
      nextControl.focus({ preventScroll: true });
    }
    $("#empty-state").hidden = visible.length > 0;
    $("#empty-state").textContent = {
      all: "Здесь появятся ваши задачи. Добавьте первую выше.",
      active: "Активных задач пока нет.",
      done: "Здесь появятся выполненные задачи."
    }[filter];
    $("#storage-status").textContent = storageAvailable
      ? "Сохранено на этом устройстве"
      : "Сохранение недоступно. Задачи останутся здесь до закрытия или обновления страницы.";
  }

  $("#add-task").addEventListener("submit", async event => {
    event.preventDefault();
    const title = titleInput.value.trim();
    if (!title) {
      titleInput.setCustomValidity("Введите название задачи.");
      titleInput.reportValidity();
      return;
    }
    const id = crypto.randomUUID?.() ?? (Date.now() + "-" + Math.random().toString(36).slice(2));
    const task = { id, title, category: categorySelect.value, done: false };
    if (filter === "done") filter = "active";
    titleInput.value = "";
    categorySelect.value = "";
    $("#category-text").textContent = "Метка";
    titleInput.focus();
    await changeTasks(items => [task, ...items]);
    announce("Добавлена задача «" + title + "».");
  });
  titleInput.addEventListener("input", () => titleInput.setCustomValidity(""));
  categorySelect.addEventListener("change", () => {
    $("#category-text").textContent = categories[categorySelect.value] || "Метка";
  });
  sortSelect.addEventListener("change", () => {
    $("#sort-text").textContent = sortSelect.selectedOptions[0].textContent;
    render();
  });
  for (const button of filters) {
    button.addEventListener("click", () => {
      filter = button.dataset.filter;
      render();
    });
  }
  list.addEventListener("change", async event => {
    const control = event.target;
    if (!control.matches("input[type=checkbox]")) return;
    const id = control.closest("li").dataset.id;
    const checked = control.checked;
    await changeTasks(items => items.map(task => task.id === id ? { ...task, done: checked } : task));
    announce(checked ? "Задача выполнена." : "Задача снова активна.");
  });
  list.addEventListener("click", async event => {
    const button = event.target.closest(".delete-button");
    if (!button) return;
    const id = button.closest("li").dataset.id;
    await changeTasks(items => items.filter(task => task.id !== id));
    announce("Задача удалена.");
  });
  window.addEventListener("storage", event => {
    if (event.key !== key && event.key !== null) return;
    try {
      tasks = readTasks();
      storageAvailable = true;
    } catch {
      storageAvailable = false;
    }
    render();
  });

  function updateDate() {
    const date = new Date();
    const formatted = new Intl.DateTimeFormat("ru", {
      weekday: "long", day: "numeric", month: "long"
    }).format(date);
    $("#today span").textContent = formatted[0].toLocaleUpperCase("ru") + formatted.slice(1);
    $("#today").dateTime = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")].join("-");
  }
  updateDate();
  document.addEventListener("visibilitychange", () => { if (!document.hidden) updateDate(); });
  render();
})();
