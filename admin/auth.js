
/* =========================================
   EXEGIS — ADMINISTRATOR AUTHENTICATION
   ========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const editor = document.querySelector(".editor-layout");
    const intro = document.querySelector(".editor-intro");

    // Protect the editor immediately.
    if (editor) editor.hidden = true;
    if (intro) intro.hidden = true;

    const login = document.createElement("section");
    login.id = "admin-login";

    login.style.cssText = `
        max-width: 430px;
        margin: 75px auto;
        padding: 34px;
        background: white;
        border: 1px solid #dcd9d2;
    `;

    login.innerHTML = `
        <div class="kicker">EXEGIS / ADMINISTRATION</div>

        <h1 style="
            font-family: Georgia, serif;
            font-size: 36px;
            font-weight: normal;
        ">
            Administrator access
        </h1>

        <p style="color:#77736c">
            Sign in to manage EXEGIS publications.
        </p>

        <form id="admin-login-form">
            <div class="field">
                <label for="admin-email">Email address</label>
                <input
                    id="admin-email"
                    type="email"
                    autocomplete="username"
                    required
                >
            </div>

            <div class="field">
                <label for="admin-password">Password</label>
                <input
                    id="admin-password"
                    type="password"
                    autocomplete="current-password"
                    required
                >
            </div>

            <button type="submit" class="action primary">
                Sign in
            </button>
        </form>

        <p id="admin-status" role="status"></p>
    `;

    const shell = document.querySelector(".editor-shell");

    if (shell) {
        shell.appendChild(login);
    }

    // Ensure the initial interface remains hidden
    // until authentication has been checked.
    if (editor) editor.hidden = true;

    const status = login.querySelector("#admin-status");

    function showStatus(text) {
        status.textContent = text;
    }

    if (
        !window.supabase ||
        typeof SUPABASE_URL === "undefined" ||
        typeof SUPABASE_PUBLISHABLE_KEY === "undefined"
    ) {
        showStatus("Unable to connect to authentication.");
        return;
    }

    const client = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: false
            }
        }
    );

    async function checkAdmin() {

        const { data: userData, error: userError } =
            await client.auth.getUser();

        if (userError || !userData.user) {
            return false;
        }

        const { data, error } = await client.rpc(
            "is_exegis_admin"
        );

        if (error) {
            console.error(
                "Administrator verification failed:",
                error.message
            );
            return false;
        }

        return data === true;
    }

    async function updateView() {

        const authorized = await checkAdmin();

        if (authorized) {
            login.hidden = true;
            if (intro) intro.hidden = false;
            if (editor) editor.hidden = false;
        } else {
            login.hidden = false;
            if (intro) intro.hidden = true;
            if (editor) editor.hidden = true;
        }

        return authorized;
    }

    const form = login.querySelector(
        "#admin-login-form"
    );

    form.addEventListener("submit", async event => {

        event.preventDefault();

        const button = form.querySelector(
            'button[type="submit"]'
        );

        const email =
            login.querySelector("#admin-email").value.trim();

        const password =
            login.querySelector("#admin-password").value;

        button.disabled = true;
        showStatus("Signing in...");

        try {

            const { error } =
                await client.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) throw error;

            const authorized = await updateView();

            if (!authorized) {
                await client.auth.signOut();
                showStatus(
                    "This account does not have administrator access."
                );
                return;
            }

            form.reset();

        } catch (error) {

            showStatus(
                error.message || "Unable to sign in."
            );

        } finally {

            button.disabled = false;

        }
    });

    // Restore an administrator session
    // if the browser is already signed in.

    await updateView();

});
