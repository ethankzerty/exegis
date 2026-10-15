
/* =========================================
   EXEGIS — SHARED WEBSITE FUNCTIONALITY
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // 1. IDENTIFY CURRENT PAGE
    // =====================================

    const path = window.location.pathname;
    const filename = path.split("/").pop();

    const params = new URLSearchParams(
        window.location.search
    );

    const section = params.get("section") || "archives";

    let currentPage = "";

    if (filename === "index.html" || filename === "") {
        currentPage = "home";
    }

    else if (filename === "about.html") {
        currentPage = "about";
    }

    else if (filename === "section.html") {
        currentPage = section;
    }


    // =====================================
    // 2. HIGHLIGHT ACTIVE MENU LINK
    // =====================================

    const activeLink = document.querySelector(
        `[data-nav="${currentPage}"]`
    );

    if (activeLink) {
        activeLink.classList.add("selected");
        activeLink.setAttribute("aria-current", "page");
    }


    // =====================================
    // 3. CLOSE MENU WHEN CLICKING OUTSIDE
    // =====================================

    const menu = document.querySelector(
        ".journal-main-menu"
    );

    document.addEventListener("click", (event) => {

        if (menu && !menu.contains(event.target)) {
            menu.open = false;
        }

    });


    // =====================================
    // 4. CLOSE MENU WITH ESCAPE KEY
    // =====================================

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape" && menu) {
            menu.open = false;
        }

    });


    // =====================================
    // 5. AUTOMATIC COPYRIGHT YEAR
    // =====================================

    document.querySelectorAll("[data-year]").forEach(
        (element) => {
            element.textContent = new Date().getFullYear();
        }
    );

});
