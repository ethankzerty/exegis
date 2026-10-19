
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
        <a href="admin/"
   id="admin-menu-link"
   hidden>
    Administration →
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
    // MOVE MENU TO TOP-LEFT OF HEADER
    // =====================================

    const utility = document.querySelector(".utility");
    const menuDetails = document.querySelector(
        ".journal-main-menu"
    );
    const oldMenuBar = document.querySelector(
        ".journal-menu-bar"
    );

    if (utility && menuDetails && oldMenuBar) {

        const rhetoricLabel =
            utility.querySelector("span");

        // Put the existing menu where RHETORIC was
        if (rhetoricLabel) {
            rhetoricLabel.replaceWith(menuDetails);
        } else {
            utility.prepend(menuDetails);
        }

        // Remove the now-empty navigation bar
        oldMenuBar.remove();
    }

    // =====================================
    // 6. AUTOMATIC COPYRIGHT YEAR
    // =====================================

    document.querySelectorAll(
        "[data-year]"
    ).forEach((element) => {

        element.textContent =
            new Date().getFullYear();

    });

    // =====================================
    // 7. SHARED FOOTER CONTACT EMAIL
    // =====================================

    document.querySelectorAll("footer").forEach((footer) => {

        const elements = footer.querySelectorAll(
            "p, span, div"
        );

        elements.forEach((element) => {

            // Locate the existing footer tagline.
            if (
                element.children.length === 0 &&
                element.textContent
                    .toLowerCase()
                    .includes("a personal journal of ideas")
            ) {
                const link = document.createElement("a");

                link.href = "mailto:contact@exegis-journal.com";
                link.textContent = "contact@exegis-journal.com";

                // Preserve the existing footer element and its styling.
                element.replaceChildren(link);
            }

        });

    });

    // =====================================
    // 8. ADMINISTRATION MENU LINK
    // =====================================

    async function showAdminLink() {

        const link = document.getElementById("admin-menu-link");
        if (!link) return;

        link.hidden = true;

        if (
            !window.supabase ||
            typeof SUPABASE_URL === "undefined" ||
            typeof SUPABASE_PUBLISHABLE_KEY === "undefined"
        ) {
            return;
        }

        try {
            const client = window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );

            const { data: { user } } =
                await client.auth.getUser();

            if (!user) return;

            const { data, error } =
                await client.rpc("is_exegis_admin");

            if (!error && data === true) {
                link.hidden = false;
            }

        } catch (error) {
            console.warn("Admin navigation check failed.");
        }
    }

    showAdminLink();

});
