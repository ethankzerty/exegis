
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

    else if (filename === "discussions.html") {
        currentPage = "discussions";
    }

    else if (filename === "register.html") {
        currentPage = "register";
    }

    else if (filename === "login.html") {
        currentPage = "login";
    }

    else if (filename === "password.html") {
        currentPage = "login";
    }


    // =====================================
    // 2. SHARED NAVIGATION MENU
    // =====================================

    const sharedMenu = `
        <div class="menu-panel-heading">
            EXPLORE EXEGIS
        </div>

        <a href="index.html" data-nav="home">
            Front page
        </a>

        <a href="section.html?section=articles"
           data-nav="articles">
            Articles
        </a>

        <a href="section.html?section=analysis"
           data-nav="analysis">
            Analysis
        </a>

        <a href="section.html?section=opinion"
           data-nav="opinion">
            Opinion
        </a>

        <a href="section.html?section=videos"
           data-nav="videos">
            Videos
        </a>

        <a href="section.html?section=art"
           data-nav="art">
            Art
        </a>

        <a href="section.html?section=to-read"
           data-nav="to-read">
            Gift of the day
        </a>

        <div class="menu-panel-divider"></div>

        <a href="discussions.html"
           data-nav="discussions">
            Discussions
        </a>

        <div class="menu-panel-divider"></div>

        <a href="section.html?section=archives"
           data-nav="archives">
            All publications
        </a>

        <a href="about.html" data-nav="about">
            About
        </a>

        <div class="menu-panel-divider"></div>

        <div class="menu-panel-heading">
            MEMBERS
        </div>

        <a href="register.html"
           data-nav="register">
            Create an account
        </a>

        <a href="login.html"
           data-nav="login">
            Sign in
        </a>
    `;


    // =====================================
    // 3. INSTALL MENU ON EVERY PAGE
    // =====================================

    document.querySelectorAll(
        ".journal-menu-panel"
    ).forEach((menuPanel) => {

        menuPanel.innerHTML = sharedMenu;

    });


    // =====================================
    // 4. HIGHLIGHT CURRENT PAGE
    // =====================================

    document.querySelectorAll(
        ".journal-menu-panel [data-nav]"
    ).forEach((link) => {

        if (link.dataset.nav === currentPage) {

            link.classList.add("selected");

            link.setAttribute(
                "aria-current",
                "page"
            );

        }

    });


    // =====================================
    // 5. CLOSE MENU WHEN CLICKING OUTSIDE
    // =====================================

    document.querySelectorAll(
        ".journal-main-menu"
    ).forEach((menu) => {

        document.addEventListener(
            "click",
            (event) => {

                if (!menu.contains(event.target)) {
                    menu.open = false;
                }

            }
        );

        document.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Escape") {
                    menu.open = false;
                }

            }
        );

    });


    // =====================================
    // 6. AUTOMATIC COPYRIGHT YEAR
    // =====================================

    document.querySelectorAll(
        "[data-year]"
    ).forEach((element) => {

        element.textContent =
            new Date().getFullYear();

    });

});
