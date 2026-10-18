
/* =========================================
   EXEGIS — INDIVIDUAL PUBLICATIONS
   ========================================= */

// 1. IDENTIFY THE SELECTED PUBLICATION

const params = new URLSearchParams(
    window.location.search
);

const slug = params.get("slug");


// 2. FIND THE PUBLICATION

const entries = Array.isArray(window.ARCHIVE_ENTRIES)
    ? window.ARCHIVE_ENTRIES
    : [];

const entry = entries.find(
    item =>
        item.slug === slug &&
        !item.draft
);


// 3. FIND THE ARTICLE CONTAINER

const target = document.getElementById("post");


// 4. ESCAPE TEXT FOR HTML

const escapeHTML = value =>
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


// 5. ARTICLE NOT FOUND

if (target && !entry) {

    target.innerHTML = `
        <h1>Publication not found.</h1>

        <p>
            This publication does not exist
            or is not currently available.
        </p>

        <a href="index.html">
            Return to the front page →
        </a>
    `;

}


// 6. DISPLAY PUBLICATION

else if (target && entry) {

    document.title = entry.title + " — EXEGIS";


    // ARTICLE IMAGE

    const image = entry.image ? `

        <img
            class="post-image"
            src="${escapeHTML(entry.image)}"
            alt="${escapeHTML(entry.imageAlt || entry.title)}"
        >

    ` : "";


    // ARTICLE VIDEO

    let video = "";

    if (entry.videoUrl) {

        try {

            const url = new URL(entry.videoUrl);

            let videoID = "";

            if (
                url.hostname === "youtu.be" ||
                url.hostname === "www.youtu.be"
            ) {
                videoID = url.pathname.slice(1);
            }

            if (
                [
                    "youtube.com",
                    "www.youtube.com",
                    "m.youtube.com"
                ].includes(url.hostname)
            ) {
                videoID = url.searchParams.get("v") || "";
            }

            if (/^[\w-]{11}$/.test(videoID)) {

                video = `

                    <div class="video-wrap">

                        <iframe
                            src="https://www.youtube-nocookie.com/embed/${videoID}"
                            loading="lazy"
                            allowfullscreen
                            title="${escapeHTML(entry.title)}"
                        ></iframe>

                    </div>

                `;

            }

        } catch (error) {
            console.warn("Invalid video URL.");
        }

    }


    // PUBLICATION CONTENT

    target.innerHTML = `

        <p class="post-meta">
            ${escapeHTML(entry.type)}
            ·
            ${escapeHTML(entry.date)}
        </p>

        <h1>
            ${escapeHTML(entry.title)}
        </h1>

        <p class="post-lead">
            ${escapeHTML(entry.summary)}
        </p>

        ${image}

        ${video}

        <div class="post-body">
            ${entry.body || ""}
        </div>

    `;

}
