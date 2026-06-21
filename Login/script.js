let isLoginMode = true;

$('#auth-toggle-mode').on('click', function(e) {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        $('#auth-title').text('Вхід у систему');
        $('#auth-submit-btn').text('Увійти');
        $('#auth-toggle-mode').text('Немає аккаунту? Зареєструватися');
        $('#confirm-password-container').addClass('d-none');
    } else {
        $('#auth-title').text('Реєстрація');
        $('#auth-submit-btn').text('Створити аккаунт');
        $('#auth-toggle-mode').text('Вже є аккаунт? Увійти');
        $('#confirm-password-container').removeClass('d-none');
    }
});

$('#auth-form').on('submit', function(e) {
    e.preventDefault();
    
    // ВАЖЛИВО: Отримуємо значення з полів
    const email = $('#auth-email').val().trim();
    const password = $('#auth-password').val();
    const confPass = $('#auth-confirm-password').val();
    
    // Отримуємо існуючих користувачів або створюємо порожній об'єкт
    let users = JSON.parse(localStorage.getItem('registeredUsers')) || {};
    
    if (!isLoginMode) {
        // --- РЕЄСТРАЦІЯ ---
        // Валідація збігу паролів
        if (password !== confPass) {
            alert("Паролі не співпадають!");
            return;
        }

        if (users[email]) {
            alert("Цей email вже зареєстрований!");
        } else {
            // Додаємо нового користувача
            users[email] = password; 
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            alert("Реєстрація успішна! Тепер увійдіть.");
            
            // Після успішної реєстрації переключаємо форму на "Вхід"
            $('#auth-toggle-mode').click(); 
        }
    } else {
        // --- ВХІД ---
        if (users[email] && users[email] === password) {
            localStorage.setItem('currentUser', email);
            window.location.href = '/index.html'; // Перехід до нотаток
        } else {
            alert("Невірний email або пароль.");
        }
    }
});