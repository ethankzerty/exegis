
/* =========================================
   EXEGIS — HOMEPAGE AND CATEGORY PAGES
   ========================================= */

(() => {

    // =====================================
    // 1. SECTION NAMES AND DESCRIPTIONS
    // =====================================

    const sections = {

        archives: [
            "All publications",
            "Every published piece, newest first."
        ],

        articles: [
            "Articles",
            "Essays, narratives and long-form writing."
        ],

        analysis: [
            "Analysis",
            "Research, observations and considered arguments."
        ],

        opinion: [
            "Opinion",
            "Personal perspectives and reflections."
        ],

        videos: [
            "Videos",
            "Films, moving images and video essays."
        ],

        art: [
            "Art",
            "Images, experiments and visual work."
        ],

        "to-read": [
            "Gift of the day",
            "Books, links, discoveries and things worth sharing."
        ]

    };


    // =====================================
    // 2. MATCH PAGE SECTIONS TO CONTENT TYPES
    // =====================================

    const types = {
        articles: "article",
        analysis: "analysis",
        opinion: "opinion",
        videos: "video",
        art: "art",
        "to-read": "to-read"
    };


    // =====================================
    // 3. IDENTIFY THE CURRENT SECTION
    // =====================================

    const params = new URLSearchParams(
        window.location.search
    );

    const requested = params.get("section") || "archives";

    const current = Object.prototype.hasOwnProperty.call(
        sections,
        requested
    ) ? requested : "archives";

    const onSection = window.location.pathname.endsWith(
        "section.html"
    );


    // =====================================
    // 4. LOAD PUBLISHED ENTRIES
    // =====================================

    const all = (
        Array.isArray(window.ARCHIVE_ENTRIES)
            ? window.ARCHIVE_ENTRIES
            : []
    )
        .filter(entry => entry && !entry.draft)
        .sort((a, b) =>
            String(b.date || "").localeCompare(
                String(a.date || "")
            )
        );


    // =====================================
    // 5. HTML AND DATE FORMATTING
    // =====================================

    const esc = value =>
        String(value ?? "").replace(
            /[&<>"']/g,
            character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[character]
        );

    const dateText = date => {

        const d = new Date(
            String(date) + "T12:00:00"
        );

        if (Number.isNaN(d.valueOf())) {
            return String(date ?? "");
        }

        return d.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });

    };


    // =====================================
    // 6. PUBLICATION LABELS
    // =====================================

    const label = entry => {

        if (entry.type === "to-read") {
            return "Gift of the day";
        }

        if (entry.type === "article") {
            return "Article";
        }

        if (entry.type === "video") {
            return "Video";
        }

        return String(entry.type || "");

    };


    // =====================================
    // 7. PUBLICATION LINKS
    // =====================================

    const href = entry =>
        "post.html?slug=" +
        encodeURIComponent(entry.slug);


    // =====================================
    // 8. ARTICLE IMAGES OR PLACEHOLDERS
    // =====================================

    const art = entry => {

        if (entry.image) {

            return `
                <img
                    src="${esc(entry.image)}"
                    alt="${esc(entry.imageAlt || entry.title)}"
                    loading="lazy"
                >
            `;

        }

        return `
            <div class="story-placeholder placeholder-${esc(entry.type)}">

                <span>
                    ${esc(label(entry))}
                </span>

                <b>
                    ${esc(String(entry.title || "?").slice(0, 1))}
                </b>

            </div>
        `;

    };


    // =====================================
    // 9. SMALL PUBLICATION VIGNETTES
    // =====================================

    const card = entry => `
        <article class="story-card">

            <a class="story-art" href="${href(entry)}">
                ${art(entry)}
            </a>

            <div class="story-meta">

                <span>
                    ${esc(label(entry))}
                </span>

                <time datetime="${esc(entry.date)}">
                    ${esc(dateText(entry.date))}
                </time>

            </div>

            <h3>
                <a href="${href(entry)}">
                    ${esc(entry.title)}
                </a>
            </h3>

            <p>
                ${esc(entry.summary)}
            </p>

            <a class="read-link" href="${href(entry)}">
                Read the piece →
            </a>

        </article>
    `;


    // =====================================
    // 10. CATEGORY PAGE
    // =====================================

    if (onSection) {

        const [heading, description] = sections[current];

        document.title = `${heading} — EXEGIS`;

        document.getElementById("section-title")
            ?.replaceChildren(
                document.createTextNode(heading)
            );

        document.getElementById("section-crumb")
            ?.replaceChildren(
                document.createTextNode(heading.toUpperCase())
            );

        document.getElementById("section-description")
            ?.replaceChildren(
                document.createTextNode(description)
            );

    }


    // =====================================
    // 11. HOMEPAGE: MOST RECENTLY
    // =====================================

    else {

        const lead = all[0];

        const leadTarget = document.getElementById(
            "lead-story"
        );

        if (leadTarget) {

            leadTarget.innerHTML = lead ? `

                <article class="lead-story">

                    <a class="lead-art" href="${href(lead)}">
                        ${art(lead)}
                    </a>

                    <div class="story-meta">

                        <span>
                            Ethan Janodahe
                        </span>

                        <time datetime="${esc(lead.date)}">
                            ${esc(dateText(lead.date))}
                        </time>

                    </div>

                    <h1>
                        <a href="${href(lead)}">
                            ${esc(lead.title)}
                        </a>
                    </h1>

                    <p>
                        ${esc(lead.summary)}
                    </p>

                    <a class="read-link" href="${href(lead)}">
                        Continue reading →
                    </a>

                </article>

            ` : `
                <p class="empty">
                    Your first publication will appear here.
                </p>
            `;

        }

    }


    // =====================================
    // 12. SELECT PUBLICATIONS TO DISPLAY
    // =====================================

    const visible = onSection

        ? (
            types[current]
                ? all.filter(
                    entry => entry.type === types[current]
                )
                : all
        )

        : all.slice(1, 7);


    // =====================================
    // 13. DISPLAY PUBLICATION GRID
    // =====================================

    const target = document.getElementById(
        "entries"
    );

    if (target) {
        target.innerHTML = visible.map(card).join("");
    }


    // =====================================
    // 14. PUBLICATION COUNT
    // =====================================

    const count = document.getElementById(
        "visible-count"
    );

    if (count) {

        count.textContent = String(
            onSection ? visible.length : all.length
        ).padStart(2, "0");

    }


    // =====================================
    // 15. EMPTY SECTION MESSAGE
    // =====================================

    const empty = document.getElementById(
        "empty"
    );

    if (empty) {
        empty.hidden = visible.length > 0;
    }

})();
