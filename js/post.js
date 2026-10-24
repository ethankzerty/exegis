
/* =========================================
   APORIA — INDIVIDUAL PUBLICATIONS
   Published Supabase entries + original archive
   ========================================= */

(() => {
    "use strict";

    const SUPABASE_PUBLIC_URL =
        "https://zowpbaqkaagpupxawgck.supabase.co";

    const SUPABASE_PUBLIC_KEY =
        "sb_publishable_2RGh4g-OssybEHTeci7cFg_mxzs85HE";

    const slug = new URLSearchParams(
        window.location.search
    ).get("slug");

    const target = document.getElementById("post");

    if (!target) return;


    // =========================================
    // HTML ESCAPING
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


    // =========================================
    // SAFE URL HANDLING
    // =========================================

    function safeURL(value, forImage = false) {

        try {

            const url = new URL(
                value,
                window.location.href
            );

            return (
                (forImage && url.protocol === "https:") ||
                (
                    !forImage &&
                    ["https:", "http:"].includes(url.protocol)
                )
            ) ? url.href : "";

        } catch {
            return "";
        }

    }


    // =========================================
    // SANITIZE PUBLICATION CONTENT
    // =========================================

    // Supabase stores formatted HTML.
    // Only approved editorial formatting is allowed.

    function sanitizeBody(html) {

        const allowed = new Set([
            "P",
            "DIV",
            "BR",
            "H2",
            "H3",
            "STRONG",
            "B",
            "EM",
            "I",
            "BLOCKQUOTE",
            "UL",
            "OL",
            "LI",
            "A",
            "IMG"
        ]);

        const template =
            document.createElement("template");

        template.innerHTML = String(html || "");

        const result =
            document.createElement("div");


        function copyChildren(from, to) {

            for (const node of [...from.childNodes]) {

                if (node.nodeType === Node.TEXT_NODE) {

                    to.appendChild(
                        document.createTextNode(
                            node.textContent
                        )
                    );

                    continue;

                }

                if (node.nodeType !== Node.ELEMENT_NODE) {
                    continue;
                }

                if ([
                    "SCRIPT",
                    "STYLE",
                    "IFRAME",
                    "SVG",
                    "MATH",
                    "FORM",
                    "OBJECT",
                    "TEMPLATE"
                ].includes(node.tagName)) {
                    continue;
                }

                if (!allowed.has(node.tagName)) {

                    copyChildren(node, to);
                    continue;

                }

                const tag = {
                    DIV: "P",
                    B: "STRONG",
                    I: "EM"
                }[node.tagName] || node.tagName;

                const element =
                    document.createElement(
                        tag.toLowerCase()
                    );


                // HYPERLINKS

                if (tag === "A") {

                    const url = safeURL(
                        node.getAttribute("href")
                    );

                    if (!url) {

                        copyChildren(node, to);
                        continue;

                    }

                    element.href = url;
                    element.rel = "noopener noreferrer";
                    element.target = "_blank";

                }


                // IMAGES

                if (tag === "IMG") {

                    const url = safeURL(
                        node.getAttribute("src"),
                        true
                    );

                    if (!url) {
                        continue;
                    }

                    element.src = url;

                    element.alt = (
                        node.getAttribute("alt") || ""
                    ).slice(0, 250);

                    element.loading = "lazy";

                } else {

                    copyChildren(node, element);

                }

                to.appendChild(element);

            }

        }

        copyChildren(
            template.content,
            result
        );

        return result.innerHTML;

    }


    // =========================================
    // CONVERT DATABASE RECORD
    // =========================================

    function publishedEntry(row) {

        return {
            slug: row.slug,
            title: row.title,
            type: row.type,

            date:
                row.publication_date ||
                (row.published_at || "").slice(0, 10),

            summary: row.summary || "",
            body: row.body || "",
            image: row.image || "",
            imageAlt: row.image_alt || "",
            imageCaption: row.image_caption || "",
            videoUrl: row.video_url || "",
            creator: row.creator || "",
            giftKind: row.gift_kind || ""
        };

    }


    // =========================================
    // YOUTUBE VIDEO EMBEDDING
    // =========================================

    function videoEmbed(value, title) {

        if (!value) return "";

        try {

            const url = new URL(value);

            if (url.protocol !== "https:") {
                return "";
            }

            let id = "";

            if ([
                "youtu.be",
                "www.youtu.be"
            ].includes(url.hostname)) {

                id = url.pathname.slice(1);

            }

            if ([
                "youtube.com",
                "www.youtube.com",
                "m.youtube.com",
                "youtube-nocookie.com",
                "www.youtube-nocookie.com"
            ].includes(url.hostname)) {

                id =
                    url.searchParams.get("v") ||
                    (
                        url.pathname.startsWith("/embed/")
                            ? url.pathname.slice(7)
                            : ""
                    );

            }

            if (!/^[\w-]{11}$/.test(id)) {
                return "";
            }

            return `
                <div class="video-wrap">
                    <iframe
                        src="https://www.youtube-nocookie.com/embed/${id}"
                        loading="lazy"
                        allowfullscreen
                        title="${esc(title)}"
                    ></iframe>
                </div>
            `;

        } catch {
            return "";
        }

    }


    // =========================================
    // RENDER INDIVIDUAL PUBLICATION
    // =========================================

    function render(entry) {

        if (!entry) {

            target.innerHTML = `
                <h1>Publication not found.</h1>

                <p>
                    This publication does not exist or
                    is not currently available.
                </p>

                <a href="index.html">
                    Return to the front page →
                </a>
            `;

            return;

        }

        document.title =
            entry.title + " — APORIA";

        const imageURL = safeURL(
            entry.image,
            true
        );

        const image = imageURL
            ? `
                <img
                    class="post-image"
                    src="${esc(imageURL)}"
                    alt="${esc(
                        entry.imageAlt || entry.title
                    )}"
                >
            `
            : "";
              const imageCaption =
            imageURL && entry.imageCaption
                ? `
                    <p class="post-image-caption">
                        ${esc(entry.imageCaption)}
                    </p>
                `
                : "";
        const video = videoEmbed(
            entry.videoUrl,
            entry.title
        );

        target.innerHTML = `
            <p class="post-meta">
                ${esc(entry.type)} · ${esc(entry.date)}
            </p>

            <h1>${esc(entry.title)}</h1>

            <p class="post-lead">
                ${esc(entry.summary)}
            </p>

            ${image}
            ${imageCaption}

            ${video}

            <div class="post-body">
                ${sanitizeBody(entry.body)}
            </div>
        `;

    }


    // =========================================
    // LOAD PUBLISHED PUBLICATION
    // =========================================

    target.innerHTML = `
        <p class="post-meta">
            Loading publication…
        </p>
    `;


    async function load() {

        if (!slug) {
            return null;
        }

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
                "image_caption",
                "video_url",
                "creator",
                "gift_kind",
                "publication_date",
                "published_at"
            ].join(",")
        );

        endpoint.searchParams.set(
            "slug",
            "eq." + slug
        );

        endpoint.searchParams.set(
            "status",
            "eq.published"
        );

        endpoint.searchParams.set(
            "limit",
            "1"
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
                "Publication request failed: " +
                response.status
            );

        }

        const rows = await response.json();

        return (
            Array.isArray(rows) &&
            rows.length
        )
            ? publishedEntry(rows[0])
            : null;

    }


    // =========================================
    // INITIALIZE PUBLICATION
    // =========================================

    load()
        .then(render)
        .catch(error => {

            console.warn(
                "APORIA: publication unavailable.",
                error
            );

            target.innerHTML = `
                <h1>Publication unavailable</h1>

                <p>
                    We couldn't load this publication
                    right now. Please try again later.
                </p>

                <a href="section.html?section=archives">
                    Return to archives →
                </a>
            `;

        });

})();
