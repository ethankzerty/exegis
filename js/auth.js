
    // =====================================
    // 2. MEMBERSHIP REGISTRATION
    // =====================================

    const registerForm = document.getElementById(
        "register-form"
    );
    
function showMessage(message, isError = false) {
    const messageElement = document.getElementById("auth-message");

    if (!messageElement) return;

    messageElement.textContent = message;
    messageElement.style.color = isError ? "#a33b32" : "#285d49";
}

    registerForm?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const button = registerForm.querySelector(
                'button[type="submit"]'
            );

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

            // =====================================
            // VALIDATION
            // =====================================

            if (
                !firstName ||
                !lastName ||
                displayName.length < 2 ||
                displayName.length > 60
            ) {
                showMessage(
                    "Please provide your name and a " +
                    "display name of 2–60 characters.",
                    true
                );
                return;
            }

            if (password.length < 8) {
                showMessage(
                    "Your password must contain " +
                    "at least 8 characters.",
                    true
                );
                return;
            }

            button.disabled = true;

            showMessage(
                "Submitting your membership request..."
            );

            try {

                const redirectURL = new URL(
                    "login.html",
                    window.location.href
                ).href;

                // Create the account in Supabase.
                //
                // The existing database trigger
                // creates a profile automatically.
                //
                // profiles.approved defaults to false.

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

                // If signup returned a session,
                // do not leave the applicant signed in.

                if (data.session) {
                    const { error: signOutError } =
                        await client.auth.signOut();

                    if (signOutError) {
                        throw signOutError;
                    }
                }

                registerForm.reset();

                showMessage(
                    "Your request has been received. " +
                    "Membership is subject to approval. " +
                    "If email verification is required, " +
                    "please complete it using the email sent to you."
                );

            } catch (error) {

                showMessage(
                    error.message ||
                    "We could not submit your request. " +
                    "Please try again.",
                    true
                );

            } finally {

                button.disabled = false;

            }

        }
    );
