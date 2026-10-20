
/* =========================================
   APORIA — SHARED WEBSITE FUNCTIONALITY
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

    const pageNames = {
        "index.html": "home",
        "": "home",
        "about.html": "about",
        "discussions.html": "discussions",
        "register.html": "register",
        "login.html": "login",
        "password.html": "login"
    };

    const currentPage = filename === "section.html"
        ? section
        : (pageNames[filename] || "");


    // =====================================
    // 2. SHARED NAVIGATION MENU
    // =====================================

    // Public navigation only.
    // Administrator links are added after verification.

    const sharedMenu = `
        <div class="menu-panel-heading">
            EXPLORE APORIA
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
    // 3. INSTALL SHARED NAVIGATION
    // =====================================

    document.querySelectorAll(
        ".journal-menu-panel"
    ).forEach(menuPanel => {

        menuPanel.innerHTML = sharedMenu;

    });


    // =====================================
    // 4. HIGHLIGHT CURRENT PAGE
    // =====================================

    document.querySelectorAll(
        ".journal-menu-panel [data-nav]"
    ).forEach(link => {

        if (link.dataset.nav === currentPage) {

            link.classList.add("selected");

            link.setAttribute(
                "aria-current",
                "page"
            );

        }

    });


    // =====================================
    // 5. MENU INTERACTIONS
    // =====================================

    document.querySelectorAll(
        ".journal-main-menu"
    ).forEach(menu => {

        document.addEventListener("click", event => {

            if (!menu.contains(event.target)) {
                menu.open = false;
            }

        });

        document.addEventListener("keydown", event => {

            if (event.key === "Escape") {
                menu.open = false;
            }

        });

    });


    // =====================================
    // 6. MOVE MENU TO TOP-LEFT CORNER
    // =====================================

    const utility = document.querySelector(".utility");

    const menuDetails = document.querySelector(
        ".journal-main-menu"
    );

    const oldMenuBar = document.querySelector(
        ".journal-menu-bar"
    );

    if (utility && menuDetails && oldMenuBar) {

        const rhetoricLabel = utility.querySelector("span");

        if (rhetoricLabel) {
            rhetoricLabel.replaceWith(menuDetails);
        } else {
            utility.prepend(menuDetails);
        }

        oldMenuBar.remove();

    }


    // =====================================
    // 7. AUTOMATIC COPYRIGHT YEAR
    // =====================================

    document.querySelectorAll(
        "[data-year]"
    ).forEach(element => {

        element.textContent =
            new Date().getFullYear();

    });


    // =====================================
    // 8. SHARED FOOTER CONTACT EMAIL
    // =====================================

    // Replace any remaining legacy footer tagline.
    // Existing footer layout and styling remain intact.

    document.querySelectorAll("footer").forEach(footer => {

        footer.querySelectorAll(
            "p, span, div"
        ).forEach(element => {

            if (
                element.children.length === 0 &&
                element.textContent
                    .toLowerCase()
                    .includes("a personal journal of ideas")
            ) {

                const link = document.createElement("a");

                link.href =
                    "mailto:contact@aporia-journal.com";

                link.textContent =
                    "contact@aporia-journal.com";

                element.replaceChildren(link);

            }

        });

        // Update existing EXEGIS contact addresses
        // if present in the footer.

        footer.querySelectorAll("a[href^='mailto:']")
            .forEach(link => {

                if (
                    link.getAttribute("href")
                        .toLowerCase()
                        .includes("contact@exegis-journal.com")
                ) {

                    link.href =
                        "mailto:contact@aporia-journal.com";

                    link.textContent =
                        "contact@aporia-journal.com";

                }

            });

    });


    // =====================================
    // 9. ADMINISTRATOR CONTROLS
    // =====================================

    // Administrator controls do not exist in the
    // initial public menu.
    //
    // They are added only after Supabase confirms
    // administrator privileges.

    async function installAdminControls() {

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

            const {
                data: userData,
                error: userError
            } = await client.auth.getUser();

            if (userError || !userData?.user) {
                return;
            }

            // Existing Supabase function name:
            // DO NOT rename until the backend is updated.

            const {
                data: isAdmin,
                error: roleError
            } = await client.rpc("is_exegis_admin");

            if (roleError || isAdmin !== true) {
                return;
            }


            // =====================================
            // ADMINISTRATION LINK IN MENU
            // =====================================

            document.querySelectorAll(
                ".journal-menu-panel"
            ).forEach(panel => {

                if (panel.querySelector("[data-admin-link]")) {
                    return;
                }

                const divider =
                    document.createElement("div");

                divider.className =
                    "menu-panel-divider";

                const adminLink =
                    document.createElement("a");

                adminLink.href = "admin/";

                adminLink.dataset.adminLink = "true";

                adminLink.textContent =
                    "Administration →";

                panel.append(divider, adminLink);

            });


            // =====================================
            // PUBLISHING SHORTCUT ON CATEGORY PAGES
            // =====================================

            if (filename === "section.html") {

                const hero = document.querySelector(
                    ".section-hero"
                );

                if (
                    hero &&
                    !hero.querySelector("[data-admin-publish]")
                ) {

                    const button =
                        document.createElement("a");

                    button.dataset.adminPublish = "true";

                    button.className =
                        "admin-publish-shortcut";

                    button.textContent =
                        "+ New publication →";

                    const category = {

                        articles: "article",
                        analysis: "analysis",
                        opinion: "opinion",
                        videos: "video",
                        art: "art",
                        "to-read": "to-read"

                    }[section];

                    const url = new URL(
                        "admin/",
                        window.location.origin + "/"
                    );

                    if (category) {
                        url.searchParams.set(
                            "type",
                            category
                        );
                    }

                    button.href =
                        url.pathname + url.search;

                    button.style.cssText = `
                        display: inline-block;
                        margin-top: 16px;
                        padding: 10px 17px;
                        border: 1px solid currentColor;
                        text-decoration: none;
                        font-size: 12px;
                        letter-spacing: .02em;
                    `;

                    hero.appendChild(button);

                }

            }

        } catch (error) {

            console.warn(
                "APORIA administrator menu unavailable:",
                error
            );

        }

    }

    void installAdminControls();

});
