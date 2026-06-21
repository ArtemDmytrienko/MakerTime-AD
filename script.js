const palette = ['#ffeb99', '#b3e5fc', '#b9f6ca', '#ff8a9a'];
let notes = JSON.parse(localStorage.getItem('myNotes')) || [];
let trash = JSON.parse(localStorage.getItem('myTrash')) || [];
let currentEditingId = null;

function saveToLocalStorage() {
    localStorage.setItem('myNotes', JSON.stringify(notes));
    localStorage.setItem('myTrash', JSON.stringify(trash));
}

$('#logout-btn').on('click', function() {
    // Відображаємо вікно підтвердження
    const isConfirmed = confirm("Ви впевнені, що хочете вийти з акаунту?");
    
    // Якщо користувач натиснув "ОК" (true)
    if (isConfirmed) {
        // Видаляємо поточного користувача
        localStorage.removeItem('currentUser');
        
        // Перенаправляємо на сторінку входу
        window.location.href = '/Login/login.html';
    }
    // Якщо користувач натиснув "Скасувати", нічого не робимо
});

function render() {
    const $grid = $('#notes-grid');
    const $trashGrid = $('#trash-grid');
    $grid.empty();
    $trashGrid.empty();

    // Рендер Нотаток
    notes.forEach(note => {
        const $card = $('<div>', { class: 'note-card' }).css('background-color', note.color);

        // Додаємо позначку часу, якщо нагадування встановлено
        let reminderHtml = '';
        if (note.reminderTime) {
            const dateStr = new Date(note.reminderTime).toLocaleString('uk-UA', { 
                day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' 
            });
            const iconColor = note.isSent ? 'text-success' : 'text-primary'; // Зелений, якщо відправлено
            reminderHtml = `
                <div class="mt-auto pt-2" style="font-size: 0.85rem; color: #555;">
                    <span class="material-icons-round align-middle ${iconColor}" style="font-size: 1rem;">schedule</span> 
                    ${dateStr} ${note.isSent ? '(Відправлено)' : ''}
                </div>`;
        }
        
        $card.append(`<h5>${note.title || 'Без назви'}</h5><p class="note_content_card">${note.content}</p>`);
        
        const $footer = $('<div class="note-footer"></div>');
        const $editBtn = $('<button class="note-btn"><span class="material-icons-round">edit</span></button>')
            .on('click', () => openEditModal(note.id));
        const $delBtn = $('<button class="note-btn delete"><span class="material-icons-round">delete</span></button>')
            .on('click', () => moveToTrash(note.id));
        
        $footer.append($editBtn, $delBtn);
        $card.append($footer);
        $grid.append($card);
    });

    // Рендер Кошика
    trash.forEach(note => {
        const $card = $('<div>', { class: 'note-card' }).css('background-color', note.color);
        $card.append(`<h5>${note.title}</h5><p>${note.content}</p>`);
        
        const $footer = $('<div class="note-footer"></div>');
        const $restoreBtn = $('<button class="note-btn"><span class="material-icons-round">restore_from_trash</span></button>')
            .on('click', () => restoreNote(note.id));
        
        $footer.append($restoreBtn);
        $card.append($footer);
        $trashGrid.append($card);
    });
}

function openEditModal(id) {
    currentEditingId = id;
    const note = notes.find(n => n.id === id);
    $('#modal-title-input').val(note.title);
    $('#modal-textarea-input').val(note.content);

    // Заповнюємо поле часу, якщо воно вже було встановлено
    if (note.reminderTime) {
      // Конвертуємо мілісекунди у формат, який розуміє <input type="datetime-local">
      const tzOffset = (new Date()).getTimezoneOffset() * 60000;
      const localISOTime = (new Date(note.reminderTime - tzOffset)).toISOString().slice(0, 16);
      $('#modal-reminder-input').val(localISOTime);
      } else {
          $('#modal-reminder-input').val('');
      }

    const myModal = new bootstrap.Modal(document.getElementById('editModal'));
    myModal.show();
}

function moveToTrash(id) {
    const index = notes.findIndex(n => n.id === id);
    if (index > -1) {
        trash.push(notes.splice(index, 1)[0]);
        saveToLocalStorage();
        render();
    }
}

function restoreNote(id) {
    const index = trash.findIndex(n => n.id === id);
    if (index > -1) {
        notes.push(trash.splice(index, 1)[0]);
        saveToLocalStorage();
        render();
    }
}

$(document).ready(function() {
    render();

    // Перемикання теми
    $('#theme-toggle').on('click', function() {
        const $html = $('html');
        const isDark = $html.attr('data-bs-theme') === 'dark';
        
        $html.attr('data-bs-theme', isDark ? 'light' : 'dark');
        $(this).toggleClass('is-dark', !isDark);
    });

    // Перемикання вкладок
    $('#tab-notes').on('click', function() {
        $('#notes-grid').removeClass('d-none');
        $('#trash-grid').addClass('d-none');
        $('#empty-trash-btn').addClass('d-none');
        $('#tab-notes').addClass('active');
        $('#tab-trash').removeClass('active');
    });

    $('#tab-trash').on('click', function() {
        $('#notes-grid').addClass('d-none');
        $('#trash-grid').removeClass('d-none');
        $('#empty-trash-btn').removeClass('d-none');
        $('#tab-notes').removeClass('active');
        $('#tab-trash').addClass('active');
    });

    $('#empty-trash-btn').on('click', function() {
        if(confirm("Очистити кошик назавжди?")) {
            trash = [];
            saveToLocalStorage();
            render();
        }
    });

    // Додавання нотатки з кольором по черзі
    $('#add-btn').on('click', function() {
        const colorIndex = notes.length % palette.length;
        const newNote = { 
            id: Date.now(), 
            title: 'Нова нотатка', 
            content: '', 
            color: palette[colorIndex],
            reminderTime: null, // Поле для часу за замовчуванням порожнє
            isSent: false
        };
        notes.push(newNote);
        saveToLocalStorage();
        render();
    });

    // Збереження з модального вікна
    $('#save-modal-btn').on('click', function() {
        const note = notes.find(n => n.id === currentEditingId);
        if (note) {
            note.title = $('#modal-title-input').val();
            note.content = $('#modal-textarea-input').val();

            // Зберігаємо час
            const reminderVal = $('#modal-reminder-input').val();
            if (reminderVal) {
                const newTime = new Date(reminderVal).getTime();
                // Якщо час змінили, скидаємо статус відправки, щоб лист пішов знову
                if (note.reminderTime !== newTime) {
                    note.isSent = false;
                }
                note.reminderTime = newTime;
            } else {
                note.reminderTime = null;
            }

            saveToLocalStorage();
            render();
            const modalEl = document.getElementById('editModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
        }
    });
});

// Запускаємо перевірку кожні 60 секунд (60000 мілісекунд)
setInterval(function() {
    const now = Date.now();
    let requiresRender = false;
    
    notes.forEach(note => {
        if (note.reminderTime && now >= note.reminderTime && !note.isSent) {
            
            emailjs.send("service_3gtcerf", "template_2rh3zin", {
                name : "Artem",
                time : new Date().toLocaleString('uk-UA'), // Передаємо красивий час замість мілісекунд
                email: "admitrienko34@gmail.com", 
                title: note.title,
                message: note.content
            }).then(function(response) {
                console.log("Лист успішно відправлено!", response.status, response.text);
                note.isSent = true; 
                saveToLocalStorage();
                render(); // Оновлюємо інтерфейс, щоб показати статус (Відправлено)
            }, function(error) {
                console.error("Помилка відправки листа:", error);
            });
            
        }
    });
}, 10000);