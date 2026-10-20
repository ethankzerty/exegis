
/* =========================================
   APORIA — ADMINISTRATOR EMAIL MIGRATION
   Temporary feature
   ========================================= */

document.addEventListener("exegis-admin-ready", () => {

    // Prevent duplicate controls.
    if (document.getElementById("email-change-panel")) {
        return;
    }

    const client = window.EXEGIS_ADMIN_CLIENT;

    if (!client) return;

    // Create the account settings panel.

    const panel = document.createElement("section");

    panel.id = "email-change-panel";
    panel.className = "editor-panel";

    panel.style.cssText = `
        margin: 30px 0;
        max-width: 650px;
    `;

    panel.innerHTML = `
        <div class="kicker">
            APORIA / ACCOUNT SETTINGS
        </div>

        <h2 class="panel-title" style="margin-top:12px;">
            Change administrator email
        </h2>

        <p class="field-note">
            Update your existing administrator account
            to the new APORIA email address.
        </p>

        <form id="email-change-form"
              style="margin-top:25px;">

            <div class="field">
                <label for="new-admin-email">
                    New email address
                </label>

                <input
                    id="new-admin-email"
                    type="email"
                    value="editorial-access@aporia-journal.com"
                    readonly
                >
            </div>

            <button
                id="email-change-button"
                type="submit"
                class="action primary"
            >
                Request email change
            </button>
        </form>

        <p id="email-change-status"
           role="status"
           aria-live="polite"
           style="margin-top:18px;">
        </p>
    `;

    const intro = document.getElementById("editor-intro");

    if (intro) {
        intro.insertAdjacentElement("afterend", panel);
    } else {
        document.querySelector(".editor-shell")?.appendChild(panel);
    }

    const form = panel.querySelector("#email-change-form");
    const button = panel.querySelector("#email-change-button");
    const status = panel.querySelector("#email-change-status");

    form.addEventListener("submit", async event => {

        event.preventDefault();

        button.disabled = true;
        status.textContent = "Requesting email change...";

        try {

            // Verify the administrator session.

            const { data: userData, error: userError } =
                await client.auth.getUser();

            if (userError || !userData.user) {
                throw new Error("Please sign in again.");
            }

            const { data: authorized, error: adminError } =
                await client.rpc("is_exegis_admin");

            if (adminError || authorized !== true) {
                throw new Error("Administrator access required.");
            }

            // Change the email on the existing user.
            // This does NOT create a new Supabase user.

            const { error } = await client.auth.updateUser(
                {
                    email: "editorial-access@aporia-journal.com"
                },
                {
                    emailRedirectTo:
                        "https://aporia-journal.com/admin/"
                }
            );

            if (error) throw error;

            status.textContent =
                "Email change requested. Check your mailbox " +
                "for Supabase confirmation emails. " +
                "You may need to confirm both addresses.";

        } catch (error) {

            status.textContent =
                error.message || "Unable to change email.";

        } finally {

            button.disabled = false;

        }
    });
});
