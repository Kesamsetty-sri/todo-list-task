const signInForm = document.getElementById('sign-in-form');
const signUpForm = document.getElementById('sign-up-form');
const toggleButton = document.getElementById('toggle-button');
const toggleText = document.getElementById('toggle-text');
const formTitle = document.getElementById('form-title');

toggleButton.addEventListener('click', () => {
    if (signInForm.classList.contains('active')) {
        // Switch to sign up
        signInForm.classList.remove('active');
        signUpForm.classList.add('active');
        formTitle.textContent = 'Sign Up';
        toggleText.textContent = 'Already have an account?';
        toggleButton.textContent = 'Sign In';
    } else {
        // Switch to sign in
        signUpForm.classList.remove('active');
        signInForm.classList.add('active');
        formTitle.textContent = 'Sign In';
        toggleText.textContent = "Don't have an account?";
        toggleButton.textContent = 'Sign Up';
    }
});

// Simple client-side user authentication using localStorage
const USERS_KEY = 'users';

function getUsers() {
    const usersJSON = localStorage.getItem(USERS_KEY);
    return usersJSON ? JSON.parse(usersJSON) : [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (!username || !email || !password || !confirmPassword) {
        alert('Please fill in all fields.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    let users = getUsers();
    // Allow duplicate usernames but prevent duplicate emails
    if (users.find(u => u.email === email)) {
        alert('Email already registered.');
        return;
    }

    users.push({ username, email, password });
    saveUsers(users);
    alert('Sign Up successful! You can now sign in.');
    // Switch to sign-in form
    signUpForm.reset();
    signUpForm.classList.remove('active');
    signInForm.classList.add('active');
    formTitle.textContent = 'Sign In';
    toggleText.textContent = "Don't have an account?";
    toggleButton.textContent = 'Sign Up';
});

signInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameOrEmail = document.getElementById('signin-username').value.trim();
    const password = document.getElementById('signin-password').value;

    if (!usernameOrEmail || !password) {
        alert('Please fill in all fields.');
        return;
    }

    let users = getUsers();
    const user = users.find(u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password);

    if (user) {
        alert('Sign In successful! Welcome, ' + user.username + '.');
        localStorage.setItem('loggedInUser', user.username);
        window.location.href = 'index.html';
    } else {
        alert('Invalid username/email or password.');
    }
});
