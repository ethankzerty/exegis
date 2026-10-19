/* =========================================
   EXEGIS — ADMINISTRATOR AUTHENTICATION
   ========================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const editor = document.querySelector(".editor-layout");
    const intro = document.querySelector(".editor-intro");
    const shell = document.querySelector(".editor-shell");
    const logout = document.getElementById("admin-logout");

    // Keep the editor out of view until authorization succeeds.
    document.body.classList.remove("admin-authorized");
    if (editor) editor.hidden = true;
    if (intro) intro.hidden = true;
    if (logout) logout.hidden = true;

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
        <h1 style="font-family:Georgia,serif;font-size:36px;font-weight:normal;">
            Administrator access
        </h1>
        <p style="color:#77736c">Sign in to manage EXEGIS publications.</p>
        <form id="admin-login-form">
            <div class="field">
                <label for="admin-email">Email address</label>
                <input id="admin-email" type="email" autocomplete="username" required>
            </div>
            <div class="field">
                <label for="admin-password">Password</label>
                <input id="admin-password" type="password" autocomplete="current-password" required>
            </div>
            <button type="submit" class="action primary">Sign in</button>
        </form>
        <p id="admin-status" role="status" aria-live="polite"></p>
    `;

    if (!shell) return;
    shell.appendChild(login);

    const status = login.querySelector("#admin-status");
    const form = login.querySelector("#admin-login-form");

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

        if (userError || !userData?.user) return false;

        const { data, error } = await client.rpc("is_exegis_admin");

        if (error) {
            console.error("Administrator verification failed:", error.message);
            return false;
        }

        return data === true;
    }

    async function updateView() {
        const authorized = await checkAdmin();

        // BOTH the CSS class and the [hidden] attributes must agree.
        // Otherwise the editor can remain invisible after a valid login.
        document.body.classList.toggle("admin-authorized", authorized);
        if (intro) intro.hidden = !authorized;
        if (editor) editor.hidden = !authorized;
        login.hidden = authorized;
        if (logout) logout.hidden = !authorized;

        return authorized;
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        const email = login.querySelector("#admin-email").value.trim();
        const password = login.querySelector("#admin-password").value;

        button.disabled = true;
        showStatus("Signing in...");

        try {
            const { error } = await client.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;

            const authorized = await updateView();
            if (!authorized) {
                await client.auth.signOut();
                await updateView();
                showStatus("This account does not have administrator access.");
                return;
            }

            form.reset();
            showStatus("");
        } catch (error) {
            showStatus(error.message || "Unable to sign in.");
        } finally {
            button.disabled = false;
        }
    });

    if (logout) {
        logout.addEventListener("click", async () => {
            const { error } = await client.auth.signOut();
            if (error) {
                alert("Could not sign out. Please try again.");
                return;
            }
            await updateView();
            showStatus("You have signed out.");
        });
    }

    // Restore the session if this administrator is already signed in.
    await updateView();
});
