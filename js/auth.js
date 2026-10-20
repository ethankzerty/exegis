
/* ============================================================
   EXEGIS — AUTHENTICATION
   Automatic Supabase registration and email confirmation
   ============================================================ */

(async function () {
    "use strict";

    // SUPABASE CONNECTION

    const url =
        typeof SUPABASE_URL !== "undefined"
            ? SUPABASE_URL
            : window.SUPABASE_URL;

    const key =
        typeof SUPABASE_PUBLISHABLE_KEY !== "undefined"
            ? SUPABASE_PUBLISHABLE_KEY
            : window.SUPABASE_PUBLISHABLE_KEY;

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

    function setLoading(form, loading) {
        const button = form?.querySelector(
            'button[type="submit"]'
        );

        if (button) button.disabled = loading;
    }

    if (!window.supabase || !url || !key) {
        console.error("Supabase configuration missing");

        showMessage(
            "Authentication is temporarily unavailable.",
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

    // REGISTRATION

    const registerForm =
        document.getElementById("register-form");

    registerForm?.addEventListener(
        "submit",
        async event => {
            event.preventDefault();

            const firstName = document
                .getElementById("first-name").value.trim();

            const lastName = document
                .getElementById("last-name").value.trim();

            const displayName = document
                .getElementById("display-name").value.trim();

            const email = document
                .getElementById("email").value.trim();

            const password = document
                .getElementById("password").value;

            if (!firstName || !lastName ||
                displayName.length < 2 ||
                displayName.length > 60 ||
                password.length < 8) {

                showMessage(
                    "Please complete all fields correctly.",
                    true
                );
                return;
            }

            setLoading(registerForm, true);
            showMessage("Creating your account...");

            try {
                const { data, error } =
                    await client.auth.signUp({
                        email,
                        password,
                        options: {
                            emailRedirectTo: new URL(
                                "login.html",
                                location.href
                            ).href,
                            data: {
                                first_name: firstName,
                                last_name: lastName,
                                display_name: displayName
                            }
                        }
                    });

                if (error) throw error;

                if (data.session) {
                    const { error: signOutError } =
                        await client.auth.signOut();

                    if (signOutError) throw signOutError;
                }

                registerForm.reset();

                showMessage(
                    "Your account request has been submitted. " +
                    "Check your inbox for a confirmation email " +
                    "from Supabase. Once confirmed, you can sign in."
                );

            } catch (error) {
                console.error(error);
                showMessage(
                    error.message || "Registration failed.",
                    true
                );
            } finally {
                setLoading(registerForm, false);
            }
        }
    );

    // LOGIN

    const loginForm =
        document.getElementById("login-form");

    loginForm?.addEventListener(
        "submit",
        async event => {
            event.preventDefault();

            const email = document
                .getElementById("email").value.trim();

            const password = document
                .getElementById("password").value;

            setLoading(loginForm, true);
            showMessage("Signing in...");

            try {
                const { data, error } =
                    await client.auth.signInWithPassword({
                        email,
                        password
                    });

                if (error) throw error;

                if (!data.user?.email_confirmed_at) {
                    await client.auth.signOut();

                    showMessage(
                        "Please confirm your email address first.",
                        true
                    );
                    return;
                }

                showMessage("Welcome back!");
                await updateAccountView();

            } catch (error) {
                showMessage(
                    error.message || "Unable to sign in.",
                    true
                );
            } finally {
                setLoading(loginForm, false);
            }
        }
    );

    // ACCOUNT VIEW

    async function updateAccountView() {
        const loginPanel =
            document.getElementById("login-panel");

        const accountPanel =
            document.getElementById("account-panel");

        if (!loginPanel && !accountPanel) return;

        const { data: { user } } =
            await client.auth.getUser();

        if (!user || !user.email_confirmed_at) {
            setVisible(loginPanel, true);
            setVisible(accountPanel, false);
            return;
        }

        const { data: profile } = await client
            .from("profiles")
            .select("display_name")
            .eq("id", user.id)
            .maybeSingle();

        const accountName =
            document.getElementById("account-name") ||
            document.getElementById("account-display-name");

        const accountEmail =
            document.getElementById("account-email");

        if (accountName) {
            accountName.textContent =
                profile?.display_name || "Member";
        }

        if (accountEmail) {
            accountEmail.textContent = user.email || "";
        }

        setVisible(loginPanel, false);
        setVisible(accountPanel, true);
    }

    // LOGOUT

    const logoutButton =
        document.getElementById("logout-button") ||
        document.getElementById("logout-btn");

    logoutButton?.addEventListener(
        "click",
        async event => {
            event.preventDefault();

            const { error } = await client.auth.signOut();

            if (error) {
                showMessage("Unable to sign out.", true);
                return;
            }

            location.href = "login.html";
        }
    );

    // INITIALIZE

    await updateAccountView();

})();
