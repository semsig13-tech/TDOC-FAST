function markFigureTables() {
  document.querySelectorAll<HTMLTableElement>(".table-container table").forEach((table) => {
    const hasImage = table.querySelector("img") !== null;
    const hasCaption = table.textContent?.includes("Рис.") ?? false;

    if (hasImage && hasCaption) {
      table.classList.add("no-border");
    } else {
      table.classList.remove("no-border");
    }
  });
}

// Запуск при первой загрузке
document.addEventListener("DOMContentLoaded", markFigureTables);

// Повторный запуск при навигации внутри SPA (Quartz использует собственный роутер)
document.addEventListener("nav", markFigureTables);
