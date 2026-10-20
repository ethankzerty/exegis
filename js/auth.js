
/* ============================================================
   EXEGIS — AUTHENTICATION
   Supabase Authentication + Manual Membership Approval

   Handles:
   1. Registration
   2. Email verification
   3. Manual membership approval
   4. Login
   5. Account display
   6. Logout
   ============================================================ */

(async function () {
    "use strict";

    /* ========================================================
       1. SUPABASE CONNECTION
       ======================================================== */

    const messageElement =
        document.getElementById("auth-message");

    function showMessage(message, isError = false) {
        if (!messageElement) return;

        messageElement.textContent = message;
        messageElement.style.color =
            isError ? "#a33b32" : "#285d49";
    }

    function setVisible(element, visible) {
        if (!element) return;
        element.hidden = !visible;
        element.style.display = visible ? "" : "none";
    }

    function setButtonLoading(form, loading) {
        const button = form?.querySelector(
            'button[type="submit"]'
        );

        if (button) {
            button.disabled = loading;
        }
    }

    // These constants come from the existing
    // js/supabase-config.js file.

    const url =
        typeof SUPABASE_URL !== "undefined"
            ? SUPABASE_URL
            : window.SUPABASE_URL;

    const key =
        typeof SUPABASE_PUBLISHABLE_KEY !== "undefined"
            ? SUPABASE_PUBLISHABLE_KEY
            : window.SUPABASE_PUBLISHABLE_KEY;

    if (!window.supabase || !url || !key) {
        console.error(
            "EXEGIS: Supabase configuration is missing."
        );

        showMessage(
            "The membership service is temporarily unavailable. " +
            "Please try again later.",
            true
        );

        return;
    }

    const client = window.supabase.createClient(
        url,
        key,
        {
            auth: {
                detectSessionInUrl: true,
                persistSession: true,
                autoRefreshToken: true
            }
        }
    );

    /* ========================================================
       2. MEMBERSHIP STATUS
       ======================================================== */

    async function getMembershipStatus(user) {

        if (!user) {
            return {
                approved: false,
                verified: false,
                displayName: ""
            };
        }

        const verified = Boolean(
            user.email_confirmed_at
        );

        const { data: profile, error } = await client
            .from("profiles")
            .select("display_name, approved")
            .eq("id", user.id)
            .single();

        if (error) {
            console.error(
                "EXEGIS: Could not read membership profile.",
                error
            );

            throw new Error(
                "Unable to verify your membership status."
            );
        }

        return {
            approved: profile.approved === true,
            verified,
            displayName: profile.display_name || "Member"
        };
    }

    /* ========================================================
       3. REGISTRATION
       ======================================================== */

    const registerForm =
        document.getElementById("register-form");

    registerForm?.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const firstName = document
                .getElementById("first-name")
                .value.trim();

            const lastName = document
                .getElementById("last-name")
                .value.trim();

            const displayName = document
                .getElementById("display-name")
                .value.trim();

            const email = document
                .getElementById("email")
                .value.trim();

            const password = document
                .getElementById("password")
                .value;

            if (
                !firstName ||
                !lastName ||
                displayName.length < 2 ||
                displayName.length > 60
            ) {
                showMessage(
                    "Please complete your name and choose " +
                    "a display name between 2 and 60 characters.",
                    true
                );
                return;
            }

            if (password.length < 8) {
                showMessage(
                    "Your password must contain at least 8 characters.",
                    true
                );
                return;
            }

            setButtonLoading(registerForm, true);

            showMessage(
                "Submitting your membership request..."
            );

            try {

                const redirectURL = new URL(
                    "login.html",
                    window.location.href
                ).href;

                const { data, error } =
                    await client.auth.signUp({
                        email,
                        password,
                        options: {
                            emailRedirectTo: redirectURL,
                            data: {
                                first_name: firstName,
                                last_name: lastName,
                                display_name: displayName
                            }
                        }
                    });

                if (error) {
                    throw error;
                }

                // New applicants must not remain
                // authenticated after registration.

                if (data.session) {

                    const { error: signOutError } =
                        await client.auth.signOut();

                    if (signOutError) {
                        throw signOutError;
                    }
                }

                registerForm.reset();

                showMessage(
                    "Your membership request has been submitted. " +
                    "All applications are reviewed individually. " +
                    "If you receive an email verification message, " +
                    "please follow its instructions."
                );

            } catch (error) {

                console.error(
                    "EXEGIS registration error:",
                    error
                );

                showMessage(
                    error.message ||
                    "Registration failed. Please try again.",
                    true
                );

            } finally {

                setButtonLoading(registerForm, false);

            }
        }
    );

    /* ========================================================
       4. LOGIN
       ======================================================== */

    const loginForm =
        document.getElementById("login-form");

    loginForm?.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const emailInput = document.getElementById(
                "email"
            );

            const passwordInput = document.getElementById(
                "password"
            );

            const email = emailInput?.value.trim();
            const password = passwordInput?.value;

            if (!email || !password) {
                showMessage(
                    "Please enter your email and password.",
                    true
                );
                return;
            }

            setButtonLoading(loginForm, true);

            showMessage("Signing in...");

            try {

                const { data, error } =
                    await client.auth.signInWithPassword({
                        email,
                        password
                    });

                if (error) {
                    throw error;
                }

                const user = data.user;

                const status =
                    await getMembershipStatus(user);

                if (!status.verified) {

                    await client.auth.signOut();

                    showMessage(
                        "Please verify your email address " +
                        "before signing in.",
                        true
                    );

                    return;
                }

                if (!status.approved) {

                    await client.auth.signOut();

                    showMessage(
                        "Your membership request is still " +
                        "awaiting approval. Please wait for " +
                        "your welcome message from EXEGIS.",
                        true
                    );

                    return;
                }

                showMessage("Welcome back.");

                await updateAccountView();

            } catch (error) {

                console.error(
                    "EXEGIS login error:",
                    error
                );

                showMessage(
                    error.message ||
                    "Unable to sign in. Please try again.",
                    true
                );

            } finally {

                setButtonLoading(loginForm, false);

            }
        }
    );

    /* ========================================================
       5. ACCOUNT DISPLAY
       ======================================================== */

    async function updateAccountView() {

        const loginPanel =
            document.getElementById("login-panel");

        const accountPanel =
            document.getElementById("account-panel");

        const accountName =
            document.getElementById("account-name") ||
            document.getElementById("account-display-name");

        const accountEmail =
            document.getElementById("account-email");

        // Only run account-panel logic when
        // those elements exist on the page.

        if (!loginPanel && !accountPanel) {
            return;
        }

        const { data, error } =
            await client.auth.getUser();

        if (error || !data.user) {

            setVisible(loginPanel, true);
            setVisible(accountPanel, false);

            return;
        }

        const user = data.user;

        try {

            const status =
                await getMembershipStatus(user);

            if (
                !status.verified ||
                !status.approved
            ) {

                setVisible(loginPanel, true);
                setVisible(accountPanel, false);

                return;
            }

            if (accountName) {
                accountName.textContent =
                    status.displayName;
            }

            if (accountEmail) {
                accountEmail.textContent = user.email;
            }

            setVisible(loginPanel, false);
            setVisible(accountPanel, true);

        } catch (error) {

            console.error(
                "EXEGIS account display error:",
                error
            );

            setVisible(loginPanel, true);
            setVisible(accountPanel, false);

        }
    }

    /* ========================================================
       6. LOGOUT
       ======================================================== */

    const logoutButton =
        document.getElementById("logout-button") ||
        document.getElementById("logout-btn");

    logoutButton?.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            const { error } =
                await client.auth.signOut();

            if (error) {
                showMessage(
                    "Unable to sign out. Please try again.",
                    true
                );
                return;
            }

            window.location.href = "login.html";

        }
    );

    /* ========================================================
       7. INITIAL ACCOUNT CHECK
       ======================================================== */

    if (
        document.getElementById("account-panel") ||
        document.getElementById("login-panel")
    ) {
        await updateAccountView();
    }

})();
