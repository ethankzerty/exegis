
/* =========================================
   EXEGIS — HOMEPAGE AND CATEGORY PAGES
   ========================================= */

(() => {
    "use strict";

    // =========================================
    // SUPABASE CONFIGURATION
    // =========================================

    // Public publishable key only.
    // Never include service-role or secret keys.

    const SUPABASE_PUBLIC_URL =
        "https://zowpbaqkaagpupxawgck.supabase.co";

    const SUPABASE_PUBLIC_KEY =
        "sb_publishable_2RGh4g-OssybEHTeci7cFg_mxzs85HE";


    // =========================================
    // JOURNAL SECTIONS
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
    // CATEGORY IMAGES
    // =========================================

    // Used for both:
    // 1. Homepage category vignettes
    // 2. Large category-page banners
    //
    // Filenames must match GitHub exactly.

    const journalCategories = [
        {
            key: "articles",
            image: "images/Articles.jpg"
        },
        {
            key: "analysis",
            image: "images/Analysis_2.jpg"
        },
        {
            key: "opinion",
            image: "images/opinion.jpg"
        },
        {
            key: "videos",
            image: "images/video.png"
        },
        {
            key: "art",
            image: "images/art.jpg"
        },
        {
            key: "to-read",
            image: "images/gift of the day.png"
        }
    ];


    // =========================================
    // HOMEPAGE FEATURED CONTENT
    // =========================================

    // Most Recently only includes these types.
    // Art and Gift of the Day are excluded.

    const featuredTypes = new Set([
        "article",
        "analysis",
        "opinion",
        "video"
    ]);


    // =========================================
    // PAGE DETECTION
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
    // TEXT AND URL HELPERS
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

        const parsed = new Date(raw + "T12:00:00");

        if (Number.isNaN(parsed.valueOf())) {
            return raw;
        }

        return parsed.toLocaleDateString(
            "en-US",
            {
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );
    }

    function label(entry) {
        const labels = {
            article: "Article",
            analysis: "Analysis",
            opinion: "Opinion",
            video: "Video",
            art: "Art",
            "to-read": "Gift of the day"
        };

        return labels[entry.type] ||
            String(entry.type || "");
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

            if (url.protocol === "https:") {
                return url.href;
            }

            if (
                url.protocol === "http:" &&
                url.origin === window.location.origin
            ) {
                return url.href;
            }

            return "";

        } catch {
            return "";
        }
    }


    // =========================================
    // PUBLICATION IMAGE
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

        const type = Object.values(types).includes(
            entry.type
        )
            ? entry.type
            : "article";

        return `
            <div
                class="story-placeholder placeholder-${esc(type)}"
            >
                <span>${esc(label(entry))}</span>
                <b>${esc(
                    String(entry.title || "?").slice(0, 1)
                )}</b>
            </div>
        `;
    }


    // =========================================
    // PUBLICATION CARD
    // =========================================

    function card(entry) {
        return `
            <article class="story-card">

                <a class="story-art" href="${href(entry)}">
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
    // HOMEPAGE CATEGORY VIGNETTE
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
            <article
                class="story-card journal-category-card"
            >

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
    // CATEGORY BANNER
    // =========================================

    function renderCategoryBanner(sectionKey, heading) {
        const banner = document.getElementById(
            "category-banner"
        );

        const bannerImage = document.getElementById(
            "category-banner-image"
        );

        if (!banner || !bannerImage) {
            return;
        }

        const category = journalCategories.find(
            item => item.key === sectionKey
        );

        const imageURL = category
            ? safeImageURL(category.image)
            : "";

        // No banner for All Publications
        // or categories without an image.

        if (!imageURL) {
            banner.hidden = true;
            bannerImage.removeAttribute("src");
            bannerImage.alt = "";
            return;
        }

        bannerImage.src = imageURL;
        bannerImage.alt = `${heading} — EXEGIS`;

        banner.hidden = false;
    }


    // =========================================
    // LOCAL ARCHIVE
    // =========================================

    // Only genuine non-draft publications.
    // Supabase records take precedence.

    const originalEntries =
        Array.isArray(window.ARCHIVE_ENTRIES)
            ? window.ARCHIVE_ENTRIES.filter(
                entry => entry && !entry.draft
            )
            : [];


    // =========================================
    // SUPABASE DATA
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
            [
                "slug",
                "title",
                "type",
                "summary",
                "body",
                "image",
                "image_alt",
                "video_url",
                "creator",
                "gift_kind",
                "tags",
                "comments_enabled",
                "publication_date",
                "published_at"
            ].join(",")
        );

        endpoint.searchParams.set(
            "status",
            "eq.published"
        );

        endpoint.searchParams.set(
            "order",
            "published_at.desc"
        );

        endpoint.searchParams.set("limit", "1000");

        const response = await fetch(
            endpoint.href,
            {
                headers: {
                    apikey: SUPABASE_PUBLIC_KEY
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
    // MAIN RENDER FUNCTION
    // =========================================

    function display(dbEntries) {

        // Merge entries by unique slug.

        const merged = new Map();

        for (const entry of originalEntries) {
            if (entry.slug) {
                merged.set(entry.slug, entry);
            }
        }

        for (const entry of dbEntries) {
            if (entry.slug) {
                merged.set(entry.slug, entry);
            }
        }

        // Newest first.

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

            document.title = `${heading} — EXEGIS`;

            // Category heading

            document
                .getElementById("section-title")
                ?.replaceChildren(
                    document.createTextNode(heading)
                );

            // Breadcrumb

            document
                .getElementById("section-crumb")
                ?.replaceChildren(
                    document.createTextNode(
                        heading.toUpperCase()
                    )
                );

            // Description

            document
                .getElementById("section-description")
                ?.replaceChildren(
                    document.createTextNode(description)
                );

            // Large category image

            renderCategoryBanner(current, heading);

            // Real publications in this category

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

            // Publication count

            if (count) {
                count.textContent =
                    String(visible.length).padStart(
                        2,
                        "0"
                    );
            }

            if (empty) {
                empty.hidden = visible.length > 0;
            }

            return;
        }


        // =====================================
        // HOMEPAGE — MOST RECENTLY
        // =====================================

        // Only Articles, Analysis, Opinion, Videos.

        const lead = all.find(
            entry => featuredTypes.has(entry.type)
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
                            <span>${esc(label(lead))}</span>

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

        // Always six permanent category cards.

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
    // INITIAL RENDER AND LIVE PUBLICATIONS
    // =========================================

    display([]);

    fetchPublished()
        .then(display)
        .catch(error => {
            console.warn(
                "EXEGIS: live publications unavailable.",
                error
            );
        });

})();
