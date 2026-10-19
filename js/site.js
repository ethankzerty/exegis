
/* =========================================
   EXEGIS — HOMEPAGE AND CATEGORY PAGES
   Published Supabase entries + original archive
   ========================================= */

(() => {
    "use strict";

    // Publishable keys may be used in browser code.
    // Never include service-role keys or GitHub
    // publishing tokens here.

    const SUPABASE_PUBLIC_URL =
        "https://zowpbaqkaagpupxawgck.supabase.co";

    const SUPABASE_PUBLIC_KEY =
        "sb_publishable_2RGh4g-OssybEHTeci7cFg_mxzs85HE";

    // =========================================
    // SECTIONS
    // =========================================

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

    const types = {
        articles: "article",
        analysis: "analysis",
        opinion: "opinion",
        videos: "video",
        art: "art",
        "to-read": "to-read"
    };

    // =========================================
    // HOMEPAGE CATEGORY VIGNETTES
    // =========================================

    // These are permanent navigation cards.
    // They are NOT individual publications.
    //
    // Add an image path when category images
    // have been selected.

    const journalCategories = [
        { key: "articles", image: "images/Articles.jpg" },
    { key: "analysis", image: "images/Analysis.jpg" },
    { key: "opinion", image: "images/opinion.jpg" },
        { key: "videos", image: "" },
        { key: "art", image: "images/art.png" },
    { key: "to-read", image: "images/gift-of-the-day.png" }
    ];

    // Only editorial publications appear
    // in the Most Recently section.

    const featuredTypes = new Set([
        "article",
        "analysis",
        "opinion",
        "video"
    ]);

    // =========================================
    // PAGE PARAMETERS
    // =========================================

    const params = new URLSearchParams(
        window.location.search
    );

    const requested =
        params.get("section") || "archives";

    const current =
        Object.prototype.hasOwnProperty.call(
            sections,
            requested
        )
            ? requested
            : "archives";

    const onSection =
        window.location.pathname.endsWith(
            "section.html"
        );

    // =========================================
    // HELPERS
    // =========================================

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

    function dateText(date) {
        const raw = String(date || "").slice(0, 10);

        if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            return raw;
        }

        const d = new Date(raw + "T12:00:00");

        return Number.isNaN(d.valueOf())
            ? raw
            : d.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric"
            });
    }

    function label(entry) {
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
    }

    const href = entry =>
        "post.html?slug=" +
        encodeURIComponent(entry.slug);

    function safeImageURL(value) {
        if (!value) return "";

        try {
            const url = new URL(
                value,
                window.location.href
            );

            return (
                url.protocol === "https:" ||
                (
                    url.protocol === "http:" &&
                    url.origin === window.location.origin
                )
            )
                ? url.href
                : "";

        } catch {
            return "";
        }
    }

    // =========================================
    // PUBLICATION ARTWORK
    // =========================================

    function art(entry) {
        const image = safeImageURL(entry.image);

        if (image) {
            return `
                <img
                    src="${esc(image)}"
                    alt="${esc(
                        entry.imageAlt || entry.title
                    )}"
                    loading="lazy"
                >
            `;
        }

        const type =
            Object.values(types).includes(entry.type)
                ? entry.type
                : "article";

        return `
            <div class="story-placeholder placeholder-${esc(type)}">
                <span>${esc(label(entry))}</span>
                <b>${esc(
                    String(entry.title || "?").slice(0, 1)
                )}</b>
            </div>
        `;
    }

    // =========================================
    // GENUINE PUBLICATION CARD
    // =========================================

    function card(entry) {
        return `
            <article class="story-card">

                <a
                    class="story-art"
                    href="${href(entry)}"
                >
                    ${art(entry)}
                </a>

                <div class="story-meta">
                    <span>${esc(label(entry))}</span>

                    <time datetime="${esc(entry.date)}">
                        ${esc(dateText(entry.date))}
                    </time>
                </div>

                <h3>
                    <a href="${href(entry)}">
                        ${esc(entry.title)}
                    </a>
                </h3>

                <p>${esc(entry.summary)}</p>

                <a
                    class="read-link"
                    href="${href(entry)}"
                >
                    Read the piece →
                </a>

            </article>
        `;
    }

    // =========================================
    // PERMANENT JOURNAL CATEGORY CARD
    // =========================================

    function categoryCard(category) {
        const [title] = sections[category.key];

        const link =
            "section.html?section=" +
            encodeURIComponent(category.key);

        const image = safeImageURL(category.image);

        const visual = image
            ? `
                <img
                    src="${esc(image)}"
                    alt=""
                    loading="lazy"
                >
            `
            : `
                <div
                    class="story-placeholder placeholder-${esc(
                        types[category.key]
                    )}"
                    aria-hidden="true"
                ></div>
            `;

        return `
            <article class="story-card journal-category-card">

                <a
                    class="story-art"
                    href="${link}"
                    aria-label="Explore ${esc(title)}"
                >
                    ${visual}
                </a>

                <h3>
                    <a href="${link}">
                        ${esc(title)}
                    </a>
                </h3>

                <a
                    class="read-link"
                    href="${link}"
                >
                    Explore ${esc(title)} →
                </a>

            </article>
        `;
    }

    // =========================================
    // ORIGINAL MANUALLY AUTHORED PUBLICATIONS
    // =========================================

    // Only genuine, non-draft entries
    // should exist in js/content.js.

    const originalEntries =
        Array.isArray(window.ARCHIVE_ENTRIES)
            ? window.ARCHIVE_ENTRIES.filter(
                entry => entry && !entry.draft
            )
            : [];

    // =========================================
    // SUPABASE PUBLICATIONS
    // =========================================

    function fromDatabase(row) {
        return {
            slug: row.slug,
            title: row.title,
            type: row.type,
            summary: row.summary || "",
            body: row.body || "",
            image: row.image || "",
            imageAlt: row.image_alt || "",
            videoUrl: row.video_url || "",
            creator: row.creator || "",
            giftKind: row.gift_kind || "",
            tags: row.tags || [],
            commentsEnabled:
                row.comments_enabled !== false,
            date:
                row.publication_date ||
                (row.published_at || "").slice(0, 10)
        };
    }

    async function fetchPublished() {
        const endpoint = new URL(
            "/rest/v1/publications",
            SUPABASE_PUBLIC_URL
        );

        endpoint.searchParams.set(
            "select",
            "slug,title,type,summary,body,image,image_alt,video_url,creator,gift_kind,tags,comments_enabled,publication_date,published_at"
        );

        endpoint.searchParams.set(
            "status",
            "eq.published"
        );

        endpoint.searchParams.set(
            "order",
            "published_at.desc"
        );

        endpoint.searchParams.set(
            "limit",
            "1000"
        );

        const response = await fetch(
            endpoint.href,
            {
                headers: {
                    "apikey": SUPABASE_PUBLIC_KEY
                },
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                "Publications request failed: " +
                response.status
            );
        }

        const rows = await response.json();

        if (!Array.isArray(rows)) {
            throw new Error(
                "Invalid publications response"
            );
        }

        return rows
            .filter(
                row =>
                    row &&
                    typeof row.slug === "string"
            )
            .map(fromDatabase);
    }

    // =========================================
    // PAGE RENDERING
    // =========================================

    function display(dbEntries) {

        // Supabase entries take priority
        // when a slug exists in both sources.

        const merged = new Map();

        for (const entry of originalEntries) {
            if (entry.slug) {
                merged.set(entry.slug, entry);
            }
        }

        for (const entry of dbEntries) {
            merged.set(entry.slug, entry);
        }

        const all = [...merged.values()].sort(
            (a, b) =>
                String(b.date || "").localeCompare(
                    String(a.date || "")
                )
        );

        const target =
            document.getElementById("entries");

        const count =
            document.getElementById("visible-count");

        const empty =
            document.getElementById("empty");

        // =====================================
        // CATEGORY / ARCHIVE PAGE
        // =====================================

        if (onSection) {

            const [heading, description] =
                sections[current];

            document.title =
                `${heading} — EXEGIS`;

            document
                .getElementById("section-title")
                ?.replaceChildren(
                    document.createTextNode(heading)
                );

            document
                .getElementById("section-crumb")
                ?.replaceChildren(
                    document.createTextNode(
                        heading.toUpperCase()
                    )
                );

            document
                .getElementById("section-description")
                ?.replaceChildren(
                    document.createTextNode(description)
                );

            const visible = types[current]
                ? all.filter(
                    entry =>
                        entry.type === types[current]
                )
                : all;

            if (target) {
                target.innerHTML =
                    visible.map(card).join("");
            }

            if (count) {
                count.textContent =
                    String(visible.length).padStart(
                        2,
                        "0"
                    );
            }

            if (empty) {
                empty.hidden =
                    visible.length > 0;
            }

            return;
        }

        // =====================================
        // HOMEPAGE — MOST RECENTLY
        // =====================================

        // Articles, Analysis, Opinion and Video only.
        // Gift of the Day and Art are excluded.

        const lead = all.find(
            entry =>
                featuredTypes.has(entry.type)
        );

        const leadTarget =
            document.getElementById("lead-story");

        if (leadTarget) {

            leadTarget.innerHTML = lead
                ? `
                    <article class="lead-story">

                        <a
                            class="lead-art"
                            href="${href(lead)}"
                        >
                            ${art(lead)}
                        </a>

                        <div class="story-meta">

                            <span>
                                ${esc(label(lead))}
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

                        <p>${esc(lead.summary)}</p>

                        <a
                            class="read-link"
                            href="${href(lead)}"
                        >
                            Continue reading →
                        </a>

                    </article>
                `
                : "";

        }

        // =====================================
        // HOMEPAGE — FROM THE JOURNAL
        // =====================================

        // Always display the six categories.
        // Never insert fictional articles here.

        if (target) {
            target.innerHTML =
                journalCategories
                    .map(categoryCard)
                    .join("");
        }

        if (count) {
            count.textContent =
                String(all.length).padStart(2, "0");
        }

        if (empty) {
            empty.hidden = true;
        }
    }

    // =========================================
    // INITIAL RENDER + LIVE PUBLICATIONS
    // =========================================

    display([]);

    fetchPublished()
        .then(display)
        .catch(error => {
            console.warn(
                "EXEGIS: live publications could not be loaded.",
                error
            );
        });

})();
