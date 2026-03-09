document.addEventListener('DOMContentLoaded', () => {
    // Curtain Animation Logic
    const curtain = document.getElementById('curtain');
    if (curtain) {
        setTimeout(() => {
            curtain.classList.add('open');
            // Remove the curtain from DOM completely after the transition completes
            setTimeout(() => {
                curtain.remove();
            }, 1300); // Slightly longer than CSS transition time
        }, 600); // Initial delay before opening
    }

    // UI Elements
    const loginBox = document.getElementById('login-box');
    const registerBox = document.getElementById('register-box');
    const toRegisterBtn = document.getElementById('to-register');
    const toLoginBtn = document.getElementById('to-login');

    // Forms & Inputs
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    // Toggle between forms
    toRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginBox.classList.remove('active');
        registerBox.classList.add('active');
        // Clear errors and inputs
        loginError.innerText = '';
        loginForm.reset();
    });

    toLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerBox.classList.remove('active');
        loginBox.classList.add('active');
        // Clear errors and inputs
        registerError.innerText = '';
        registerForm.reset();
    });

    // Helper to send requests
    async function sendAuthRequest(url, data, errorElement, successCallback) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Success
                errorElement.style.color = '#10b981'; // Green color for success
                errorElement.innerText = result.message;
                setTimeout(successCallback, 1500);
            } else {
                // Error from server
                errorElement.style.color = '#ef4444'; // Red color
                errorElement.innerText = result.message || 'An error occurred. Please try again.';
            }
        } catch (error) {
            // Network or parsing error
            console.error('Auth Error:', error);
            errorElement.style.color = '#ef4444';
            errorElement.innerText = 'Network error. Please make sure the server is running.';
        }
    }

    // Handle Login Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        loginError.innerText = 'Logging in...';
        loginError.style.color = '#94a3b8'; // greyish indicating loading

        sendAuthRequest('/login', { email, password }, loginError, () => {
            // Success action: Redirect to home dashboard
            window.location.href = '/home';
        });
    });

    // Handle Register Submit
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        registerError.innerText = 'Creating account...';
        registerError.style.color = '#94a3b8'; // greyish indicating loading

        sendAuthRequest('/register', { email, password }, registerError, () => {
            // On successful registration, switch to login view
            toLoginBtn.click();
            loginError.style.color = '#10b981';
            loginError.innerText = 'Registration successful! Please log in.';
        });
    });
});
