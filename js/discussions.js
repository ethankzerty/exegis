
/* ============================================================
   EXEGIS DISCUSSIONS
   Public reading, authenticated writing, threaded replies
   ============================================================ */

(async function () {
    "use strict";

    const $ = id => document.getElementById(id);

    const listView = $("forum-list-view");
    const threadView = $("forum-thread-view");

    if (!listView || !threadView) return;

    const supabaseURL =
        typeof SUPABASE_URL !== "undefined"
            ? SUPABASE_URL
            : window.SUPABASE_URL;

    const supabaseKey =
        typeof SUPABASE_PUBLISHABLE_KEY !== "undefined"
            ? SUPABASE_PUBLISHABLE_KEY
            : window.SUPABASE_PUBLISHABLE_KEY;

    if (!window.supabase || !supabaseURL || !supabaseKey) {
        $("forum-list-status").textContent =
            "Discussions are temporarily unavailable.";
        return;
    }

    const client = window.supabase.createClient(
        supabaseURL,
        supabaseKey,
        {
            auth: {
                detectSessionInUrl: false,
                persistSession: true,
                autoRefreshToken: true
            }
        }
    );

    let currentUser = null;
    let currentDiscussion = null;
    let currentReplies = [];

    const authorNames = new Map();

    /* ========================================================
       HELPERS
       ======================================================== */

    function element(tag, className, text) {
        const node = document.createElement(tag);

        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;

        return node;
    }

    function setStatus(id, message) {
        const node = $(id);
        if (node) node.textContent = message;
    }

    function formatDate(date) {
        if (!date) return "";

        return new Intl.DateTimeFormat("en", {
            year: "numeric",
            month: "short",
            day: "numeric"
        }).format(new Date(date));
    }

    function authorName(id) {
        return authorNames.get(id) || "EXEGIS member";
    }

    function shortText(text, limit = 250) {
        if (!text) return "";
        return text.length > limit
            ? text.slice(0, limit).trimEnd() + "…"
            : text;
    }

    function errorMessage(error) {
        console.error("EXEGIS Discussions:", error);

        if (error?.code === "42501") {
            return "You must confirm your email before posting.";
        }

        return error?.message ||
            "Something went wrong. Please try again.";
    }

    async function refreshUser() {
        const { data, error } = await client.auth.getUser();

        currentUser = error ? null : (data.user || null);

        const accountLink = $("forum-account-link");
        const registerLink = $("forum-register-link");

        if (accountLink) {
            accountLink.textContent =
                currentUser ? "Account" : "Sign in";
            accountLink.href = "login.html";
        }

        if (registerLink) {
            registerLink.hidden = Boolean(currentUser);
        }

        return currentUser;
    }

    function canWrite() {
        return Boolean(
            currentUser &&
            currentUser.email_confirmed_at
        );
    }

    function showAuthPrompt(container) {
        container.replaceChildren();

        const panel = element("div", "forum-auth-prompt");

        const title = element(
            "strong",
            "",
            "Join the conversation"
        );

        const text = element(
            "p",
            "",
            "Everyone can read EXEGIS Discussions. " +
            "To write or reply, please sign in or create an account."
        );

        const signIn = element("a", "", "Sign in");
        signIn.href = "login.html";

        const register = element(
            "a",
            "",
            "Create an account"
        );
        register.href = "register.html";

        const links = element("p");

        links.append(
            signIn,
            document.createTextNode("  ·  "),
            register
        );

        panel.append(title, text, links);
        container.append(panel);

        panel.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }

    /* ========================================================
       PUBLIC AUTHOR NAMES
       ======================================================== */

    async function loadAuthorNames(rows) {
        const ids = [
            ...new Set(
                rows.map(row => row.author_id)
                    .filter(Boolean)
            )
        ];

        const unknown = ids.filter(
            id => !authorNames.has(id)
        );

        if (!unknown.length) return;

        const { data, error } = await client
            .from("profiles")
            .select("id, display_name")
            .in("id", unknown);

        if (error) {
            console.warn(
                "Could not load author names:",
                error
            );
            return;
        }

        for (const profile of data || []) {
            authorNames.set(
                profile.id,
                profile.display_name || "EXEGIS member"
            );
        }
    }

    /* ========================================================
       DISCUSSION LIST
       ======================================================== */

    async function loadDiscussions() {
        const list = $("forum-list");
        list.replaceChildren();

        setStatus(
            "forum-list-status",
            "Loading discussions..."
        );

        const { data, error } = await client
            .from("discussions")
            .select("id, author_id, title, body, created_at")
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) {
            setStatus(
                "forum-list-status",
                errorMessage(error)
            );
            return;
        }

        const discussions = data || [];

        await loadAuthorNames(discussions);

        if (!discussions.length) {
            setStatus(
                "forum-list-status",
                "No discussions yet. Start the first conversation."
            );
            return;
        }

        setStatus("forum-list-status", "");

        for (const discussion of discussions) {
            const article = element(
                "article",
                "forum-entry"
            );

            const title = element(
                "button",
                "forum-entry-title",
                discussion.title
            );

            title.type = "button";

            title.addEventListener("click", () => {
                navigateToDiscussion(discussion.id);
            });

            const meta = element(
                "p",
                "forum-meta",
                authorName(discussion.author_id) +
                " · " + formatDate(discussion.created_at)
            );

            const excerpt = element(
                "p",
                "forum-excerpt",
                shortText(discussion.body)
            );

            article.append(title, meta, excerpt);
            list.append(article);
        }
    }

    /* ========================================================
       CREATE DISCUSSION
       ======================================================== */

    $("forum-new-button").addEventListener(
        "click",
        async () => {
            const container = $("forum-new-container");

            if (container.childElementCount) {
                container.replaceChildren();
                return;
            }

            await refreshUser();

            if (!canWrite()) {
                showAuthPrompt(container);
                return;
            }

            showDiscussionForm(container);
        }
    );

    function showDiscussionForm(container) {
        container.replaceChildren();

        const wrapper = element(
            "div",
            "forum-compose"
        );

        const heading = element(
            "h3",
            "",
            "Start a discussion"
        );

        const form = element("form", "forum-form");

        const titleLabel = element(
            "label",
            "",
            "Discussion title"
        );

        const titleInput = element("input");
        titleInput.type = "text";
        titleInput.required = true;
        titleInput.minLength = 5;
        titleInput.maxLength = 180;

        const bodyLabel = element(
            "label",
            "",
            "Your thoughts"
        );

        const bodyInput = element("textarea");
        bodyInput.required = true;
        bodyInput.minLength = 10;
        bodyInput.maxLength = 20000;

        const actions = element(
            "div",
            "forum-actions"
        );

        const submit = element(
            "button",
            "forum-button",
            "Publish discussion"
        );
        submit.type = "submit";

        const cancel = element(
            "button",
            "forum-button forum-button-secondary",
            "Cancel"
        );
        cancel.type = "button";
        cancel.addEventListener("click", () => {
            container.replaceChildren();
        });

        const status = element(
            "p",
            "forum-status"
        );
        status.setAttribute("role", "status");

        actions.append(submit, cancel);

        form.append(
            titleLabel,
            titleInput,
            bodyLabel,
            bodyInput,
            actions,
            status
        );

        wrapper.append(heading, form);
        container.append(wrapper);

        titleInput.focus();

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const title = titleInput.value.trim();
            const body = bodyInput.value.trim();

            if (title.length < 5 || body.length < 10) {
                status.textContent =
                    "Please provide a title and a meaningful message.";
                return;
            }

            submit.disabled = true;
            status.textContent = "Publishing...";

            try {
                await refreshUser();

                if (!canWrite()) {
                    showAuthPrompt(container);
                    return;
                }

                const { error } = await client
                    .from("discussions")
                    .insert({
                        author_id: currentUser.id,
                        title,
                        body
                    });

                if (error) throw error;

                container.replaceChildren();
                await loadDiscussions();

            } catch (error) {
                status.textContent = errorMessage(error);
            } finally {
                submit.disabled = false;
            }
        });
    }

    /* ========================================================
       OPEN DISCUSSION
       ======================================================== */

    function navigateToDiscussion(id) {
        const url = new URL(window.location.href);
        url.searchParams.set("id", id);

        window.history.pushState(
            { discussionId: id },
            "",
            url
        );

        openDiscussion(id);
    }

    function returnToList(pushHistory = true) {
        currentDiscussion = null;
        currentReplies = [];

        threadView.hidden = true;
        listView.hidden = false;

        $("forum-reply-container").replaceChildren();

        if (pushHistory) {
            const url = new URL(window.location.href);
            url.searchParams.delete("id");

            window.history.pushState({}, "", url);
        }

        loadDiscussions();
    }

    $("forum-back-button").addEventListener(
        "click",
        () => returnToList()
    );

    async function openDiscussion(id) {
        listView.hidden = true;
        threadView.hidden = false;

        const content = $("forum-thread-content");
        const repliesContainer = $("forum-replies");

        content.replaceChildren(
            element("p", "forum-status", "Loading...")
        );

        repliesContainer.replaceChildren();
        $("forum-reply-container").replaceChildren();

        const { data, error } = await client
            .from("discussions")
            .select("id, author_id, title, body, created_at")
            .eq("id", id)
            .maybeSingle();

        if (error || !data) {
            content.replaceChildren(
                element(
                    "p",
                    "forum-status",
                    "This discussion could not be found."
                )
            );
            return;
        }

        currentDiscussion = data;

        await loadReplies(data.id);
        await loadAuthorNames([
            data,
            ...currentReplies
        ]);

        content.replaceChildren();

        const title = element(
            "h2",
            "forum-thread-title",
            data.title
        );

        const meta = element(
            "p",
            "forum-meta",
            authorName(data.author_id) +
            " · " + formatDate(data.created_at)
        );

        const body = element(
            "div",
            "forum-thread-body",
            data.body
        );

        content.append(title, meta, body);

        renderReplies();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    /* ========================================================
       REPLIES
       ======================================================== */

    async function loadReplies(discussionId) {
        const { data, error } = await client
            .from("replies")
            .select(
                "id, discussion_id, author_id, " +
                "parent_reply_id, body, created_at"
            )
            .eq("discussion_id", discussionId)
            .order("created_at", { ascending: true })
            .limit(1000);

        if (error) {
            currentReplies = [];

            $("forum-replies").replaceChildren(
                element(
                    "p",
                    "forum-status",
                    errorMessage(error)
                )
            );

            return;
        }

        currentReplies = data || [];
    }

    function renderReplies() {
        const container = $("forum-replies");
        container.replaceChildren();

        if (!currentReplies.length) {
            container.append(
                element(
                    "p",
                    "forum-status",
                    "No replies yet. Be the first to respond."
                )
            );
            return;
        }

        const childrenByParent = new Map();
        const knownIds = new Set(
            currentReplies.map(reply => reply.id)
        );

        for (const reply of currentReplies) {
            const parentId =
                reply.parent_reply_id &&
                knownIds.has(reply.parent_reply_id) &&
                reply.parent_reply_id !== reply.id
                    ? reply.parent_reply_id
                    : null;

            if (!childrenByParent.has(parentId)) {
                childrenByParent.set(parentId, []);
            }

            childrenByParent.get(parentId).push(reply);
        }

        const rendered = new Set();

        function appendChildren(parentId, target, depth) {
            const children =
                childrenByParent.get(parentId) || [];

            for (const reply of children) {
                if (rendered.has(reply.id)) continue;
                rendered.add(reply.id);

                const node = element(
                    "div",
                    "forum-reply"
                );

                if (depth > 4) {
                    node.style.marginLeft = "0";
                }

                const meta = element(
                    "div",
                    "forum-meta",
                    authorName(reply.author_id) +
                    " · " + formatDate(reply.created_at)
                );

                const body = element(
                    "p",
                    "forum-reply-body",
                    reply.body
                );

                const action = element(
                    "button",
                    "forum-reply-action",
                    "Reply"
                );

                action.type = "button";

                action.addEventListener(
                    "click",
                    async () => {
                        await startReply(reply.id);
                    }
                );

                node.append(meta, body, action);
                target.append(node);

                appendChildren(reply.id, node, depth + 1);
            }
        }

        appendChildren(null, container, 0);

        // Display unusual/orphaned reply records safely.
        for (const reply of currentReplies) {
            if (!rendered.has(reply.id)) {
                appendChildren(
                    reply.parent_reply_id,
                    container,
                    0
                );
            }
        }
    }

    /* ========================================================
       WRITE REPLY
       ======================================================== */

    $("forum-reply-button").addEventListener(
        "click",
        () => startReply(null)
    );

    async function startReply(parentReplyId) {
        const container = $("forum-reply-container");
        container.replaceChildren();

        await refreshUser();

        if (!canWrite()) {
            showAuthPrompt(container);
            return;
        }

        const wrapper = element(
            "div",
            "forum-compose"
        );

        const heading = element(
            "h3",
            "",
            parentReplyId
                ? "Reply to this comment"
                : "Write a reply"
        );

        const form = element("form", "forum-form");

        const label = element(
            "label",
            "",
            "Your reply"
        );

        const textarea = element("textarea");
        textarea.required = true;
        textarea.maxLength = 20000;

        const actions = element(
            "div",
            "forum-actions"
        );

        const submit = element(
            "button",
            "forum-button",
            "Post reply"
        );
        submit.type = "submit";

        const cancel = element(
            "button",
            "forum-button forum-button-secondary",
            "Cancel"
        );
        cancel.type = "button";

        cancel.addEventListener("click", () => {
            container.replaceChildren();
        });

        const status = element("p", "forum-status");
        status.setAttribute("role", "status");

        actions.append(submit, cancel);

        form.append(
            label,
            textarea,
            actions,
            status
        );

        wrapper.append(heading, form);
        container.append(wrapper);

        textarea.focus();

        container.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const body = textarea.value.trim();

            if (!body) {
                status.textContent =
                    "Please write a reply.";
                return;
            }

            submit.disabled = true;
            status.textContent = "Posting reply...";

            try {
                await refreshUser();

                if (!canWrite()) {
                    showAuthPrompt(container);
                    return;
                }

                if (!currentDiscussion) {
                    throw new Error(
                        "No discussion selected."
                    );
                }

                const { error } = await client
                    .from("replies")
                    .insert({
                        discussion_id: currentDiscussion.id,
                        author_id: currentUser.id,
                        parent_reply_id: parentReplyId,
                        body
                    });

                if (error) throw error;

                container.replaceChildren();

                await loadReplies(currentDiscussion.id);
                await loadAuthorNames(currentReplies);
                renderReplies();

            } catch (error) {
                status.textContent = errorMessage(error);
            } finally {
                submit.disabled = false;
            }
        });
    }

    /* ========================================================
       INITIALIZATION AND NAVIGATION
       ======================================================== */

    await refreshUser();

    const initialId = new URLSearchParams(
        window.location.search
    ).get("id");

    if (initialId) {
        await openDiscussion(initialId);
    } else {
        await loadDiscussions();
    }

    window.addEventListener("popstate", () => {
        const id = new URLSearchParams(
            window.location.search
        ).get("id");

        if (id) {
            openDiscussion(id);
        } else {
            returnToList(false);
        }
    });

    client.auth.onAuthStateChange(() => {
        // Refresh the navigation after auth changes.
        // Defer the Supabase call outside the callback.
        setTimeout(() => refreshUser(), 0);
    });

})();
