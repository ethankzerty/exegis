
/* =========================================
   EXEGIS — ACCOUNT AUTHENTICATION
   ========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    // =====================================
    // 1. CONNECT TO SUPABASE
    // =====================================

    const message = document.getElementById(
        "auth-message"
    );

    function showMessage(text, isError = false) {

        if (!message) return;

        message.textContent = text;

        message.classList.toggle(
            "error",
            isError
        );
    }


    if (
        !window.supabase ||
        typeof SUPABASE_URL === "undefined" ||
        typeof SUPABASE_PUBLISHABLE_KEY === "undefined" ||
        SUPABASE_PUBLISHABLE_KEY.includes("PASTE_")
    ) {

        showMessage(
            "Supabase configuration is missing.",
            true
        );

        return;
    }


    const client = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                detectSessionInUrl: true,
                persistSession: true,
                autoRefreshToken: true
            }
        }
    );


    // =====================================
    // 2. REGISTRATION
    // =====================================

    const registerForm = document.getElementById(
        "register-form"
    );

    registerForm?.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const button = registerForm.querySelector(
                'button[type="submit"]'
            );

            const displayName = document
                .getElementById("display-name")
                .value
                .trim();

            const email = document
                .getElementById("email")
                .value
                .trim();

            const password = document
                .getElementById("password")
                .value;

            if (
                displayName.length < 2 ||
                displayName.length > 60
            ) {

                showMessage(
                    "Your display name must contain 2–60 characters.",
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

            button.disabled = true;

            showMessage("Creating your account...");

            try {

                const redirectURL = new URL(
                    "login.html",
                    window.location.href
                ).href;

                const { error } = await client.auth.signUp({

                    email: email,

                    password: password,

                    options: {

                        emailRedirectTo: redirectURL,

                        data: {
                            display_name: displayName
                        }

                    }

                });

                if (error) throw error;

                registerForm.reset();

                showMessage(
                    "Registration submitted. Check your email " +
                    "for a confirmation link. If an account " +
                    "already exists, use the sign-in page."
                );

            }

            catch (error) {

                showMessage(
                    error.message ||
                    "Registration failed.",
                    true
                );

            }

            finally {
                button.disabled = false;
            }

        }
    );


    // =====================================
    // 3. LOGIN
    // =====================================

    const loginForm = document.getElementById(
        "login-form"
    );

    const accountPanel = document.getElementById(
        "account-panel"
    );

    const accountName = document.getElementById(
        "account-name"
    );


    async function updateAccountView() {

        if (!loginForm) return;

        const { data, error } =
            await client.auth.getUser();

        const user = error ? null : data.user;

        const confirmed = Boolean(
            user && user.email_confirmed_at
        );

        if (confirmed) {

            loginForm.hidden = true;

            accountPanel.hidden = false;

            const { data: profile } = await client
                .from("profiles")
                .select("display_name")
                .eq("id", user.id)
                .single();

            accountName.textContent =
                profile?.display_name ||
                user.user_metadata?.display_name ||
                "EXEGIS member";

        } else {

            loginForm.hidden = false;

            accountPanel.hidden = true;

        }
    }


    loginForm?.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const button = loginForm.querySelector(
                'button[type="submit"]'
            );

            const email = document
                .getElementById("email")
                .value
                .trim();

            const password = document
                .getElementById("password")
                .value;

            button.disabled = true;

            showMessage("Signing in...");

            try {

                const { error } =
                    await client.auth.signInWithPassword({
                        email,
                        password
                    });

                if (error) throw error;

                await updateAccountView();

                showMessage(
                    "You are now signed in."
                );

            }

            catch (error) {

                showMessage(
                    error.message ||
                    "Unable to sign in.",
                    true
                );

            }

            finally {
                button.disabled = false;
            }

        }
    );


    // =====================================
    // 4. LOGOUT
    // =====================================

    const logoutButton = document.getElementById(
        "logout-button"
    );

    logoutButton?.addEventListener(
        "click",
        async () => {

            const { error } =
                await client.auth.signOut();

            if (error) {

                showMessage(error.message, true);
                return;

            }

            await updateAccountView();

            showMessage("You have signed out.");

        }
    );


    // =====================================
    // 5. RESTORE EXISTING SESSION
    // =====================================

    if (loginForm) {

        try {
            await updateAccountView();
        }

        catch (error) {
            showMessage(
                "Unable to restore your session.",
                true
            );
        }

    }

});
