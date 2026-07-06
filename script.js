// ============================================
// ДАННЫЕ ПРИЛОЖЕНИЯ
// ============================================

let currentUser = null;
let currentChat = null;
let users = [];
let chats = [];
let messages = {};

// Инициализация данных
function initializeData() {
    // Загруженные пользователи
    users = [
        { id: 1, username: 'alex_dev', fullName: 'Александр Петров', avatar: 'А', bio: 'Разработчик', online: true },
        { id: 2, username: 'maria_designer', fullName: 'Мария Сидорова', avatar: 'М', bio: 'Дизайнер', online: true },
        { id: 3, username: 'ivan_manager', fullName: 'Иван Иванов', avatar: 'И', bio: 'Менеджер проекта', online: false },
        { id: 4, username: 'elena_pm', fullName: 'Елена Смирнова', avatar: 'Е', bio: 'PM', online: true },
        { id: 5, username: 'dmitry_qa', fullName: 'Дмитрий Волков', avatar: 'Д', bio: 'QA Engineer', online: false },
    ];

    // Инициализация пустого объекта сообщений
    messages = {};
    users.forEach(user => {
        messages[user.id] = [];
    });

    // Добавляем примеры сообщений
    messages[1] = [
        { id: 1, senderId: 1, text: 'Привет! Как дела?', timestamp: new Date(Date.now() - 3600000) },
        { id: 2, senderId: 'me', text: 'Привет! Хорошо, спасибо', timestamp: new Date(Date.now() - 3500000) },
        { id: 3, senderId: 1, text: 'Готов ли макет для проекта?', timestamp: new Date(Date.now() - 1800000) },
        { id: 4, senderId: 'me', text: 'Да, выложу на облако сегодня', timestamp: new Date(Date.now() - 1700000) },
    ];

    messages[2] = [
        { id: 1, senderId: 2, text: 'Отправила свежие дизайны', timestamp: new Date(Date.now() - 7200000) },
        { id: 2, senderId: 'me', text: 'Спасибо! Посмотрю вечером', timestamp: new Date(Date.now() - 7100000) },
    ];

    messages[3] = [
        { id: 1, senderId: 3, text: 'Срок сдачи передвинут на неделю', timestamp: new Date(Date.now() - 86400000) },
    ];
}

// ============================================
// ЛОКАЛЬНОЕ ХРАНИЛИЩЕ
// ============================================

function saveToLocalStorage() {
    const userData = {
        username: currentUser.username,
        fullName: currentUser.fullName,
        email: currentUser.email,
        bio: currentUser.bio || '',
        avatar: currentUser.avatar
    };
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('messages', JSON.stringify(messages));
}

function loadFromLocalStorage() {
    const savedUser = localStorage.getItem('user');
    const savedMessages = localStorage.getItem('messages');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    
    if (savedMessages) {
        messages = JSON.parse(savedMessages);
        // Преобразуем строки в Date объекты
        Object.keys(messages).forEach(key => {
            messages[key].forEach(msg => {
                msg.timestamp = new Date(msg.timestamp);
            });
        });
    }
}

// ============================================
// СОБЫТИЯ АВТОРИЗАЦИИ
// ============================================

document.getElementById('loginTab').addEventListener('click', () => {
    switchAuthTab('login');
});

document.getElementById('registerTab').addEventListener('click', () => {
    switchAuthTab('register');
});

function switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}Form`).classList.add('active');
    
    // Очищаем ошибки
    document.getElementById('loginError').textContent = '';
    document.getElementById('registerError').textContent = '';
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    // Проверяем есть ли такой пользователь в localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.username === username && password === 'password') {
            currentUser = user;
            loadFromLocalStorage();
            showMessengerScreen();
            document.getElementById('loginForm').reset();
            return;
        }
    }
    
    // Для демонстрации - создаём пользователя с любыми данными
    currentUser = {
        username: username,
        fullName: username,
        email: username + '@messenger.com',
        avatar: username.charAt(0).toUpperCase(),
        bio: 'Новый пользователь'
    };
    
    loadFromLocalStorage();
    showMessengerScreen();
    document.getElementById('loginForm').reset();
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const fullName = document.getElementById('registerFullName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (password !== confirmPassword) {
        document.getElementById('registerError').textContent = 'Пароли не совпадают';
        return;
    }
    
    currentUser = {
        username: username,
        fullName: fullName,
        email: email,
        avatar: fullName.charAt(0).toUpperCase(),
        bio: ''
    };
    
    saveToLocalStorage();
    showMessengerScreen();
    document.getElementById('registerForm').reset();
});

// ============================================
// ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ
// ============================================

function showMessengerScreen() {
    document.getElementById('authScreen').classList.remove('active');
    document.getElementById('messengerScreen').classList.add('active');
    
    initializeData();
    renderChats();
    updateUserInfo();
    loadSettings();
}

function showAuthScreen() {
    document.getElementById('messengerScreen').classList.remove('active');
    document.getElementById('authScreen').classList.add('active');
    currentUser = null;
    currentChat = null;
}

// ============================================
// ИНТЕРФЕЙС МЕССЕНДЖЕРА
// ============================================

function updateUserInfo() {
    if (currentUser) {
        document.getElementById('userNameHeader').textContent = currentUser.fullName;
        const avatar = document.getElementById('userAvatarHeader');
        avatar.textContent = currentUser.avatar;
        avatar.style.background = `linear-gradient(135deg, ${getGradientColor(currentUser.username)})`;
    }
}

function getGradientColor(username) {
    const colors = [
        '#667eea, #764ba2',
        '#f093fb, #f5576c',
        '#4facfe, #00f2fe',
        '#43e97b, #38f9d7',
        '#fa709a, #fee140',
        '#30cfd0, #330867',
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
}

function renderChats() {
    const chatsList = document.getElementById('chatsList');
    chatsList.innerHTML = '';
    
    users.forEach(user => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        if (currentChat && currentChat.id === user.id) {
            chatItem.classList.add('active');
        }
        
        const lastMessage = messages[user.id] && messages[user.id].length > 0 
            ? messages[user.id][messages[user.id].length - 1] 
            : null;
        
        const lastTime = lastMessage 
            ? formatTime(lastMessage.timestamp)
            : '';
        
        const preview = lastMessage 
            ? (lastMessage.senderId === 'me' ? 'Вы: ' : '') + lastMessage.text.substring(0, 30)
            : 'Нет сообщений';
        
        chatItem.innerHTML = `
            <div class="chat-avatar" style="background: linear-gradient(135deg, ${getGradientColor(user.username)})">${user.avatar}</div>
            <div class="chat-info">
                <div class="chat-header-text">
                    <span class="chat-name">${user.fullName}</span>
                    <span class="chat-time">${lastTime}</span>
                </div>
                <p class="chat-preview">${preview}</p>
            </div>
        `;
        
        chatItem.addEventListener('click', () => selectChat(user));
        chatsList.appendChild(chatItem);
    });
}

function selectChat(user) {
    currentChat = user;
    renderChats();
    renderChatHeader();
    renderMessages();
    
    // Прокручиваем вниз к последнему сообщению
    setTimeout(() => {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

function renderChatHeader() {
    if (!currentChat) return;
    
    document.getElementById('selectedChatName').textContent = currentChat.fullName;
    document.getElementById('selectedChatStatus').textContent = currentChat.online ? 'Онлайн' : 'Последний раз недавно';
    
    const avatar = document.getElementById('selectedChatAvatar');
    avatar.textContent = currentChat.avatar;
    avatar.style.background = `linear-gradient(135deg, ${getGradientColor(currentChat.username)})`;
}

function renderMessages() {
    if (!currentChat) return;
    
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = '';
    
    const chatMessages = messages[currentChat.id] || [];
    
    chatMessages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.senderId === 'me' ? 'user' : 'other'}`;
        
        const time = formatTime(msg.timestamp);
        
        messageDiv.innerHTML = `
            <span class="message-time">${time}</span>
            <div class="message-content">${escapeHtml(msg.text)}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
    });
}

function formatTime(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const now = new Date();
    const diff = now - date;
    
    // Менее часа
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return minutes === 0 ? 'Только что' : `${minutes}м`;
    }
    
    // Менее суток
    if (diff < 86400000) {
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Более суток
    return date.toLocaleDateString('ru-RU');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// ОТПРАВКА СООБЩЕНИЙ
// ============================================

document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('messageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function sendMessage() {
    if (!currentChat) {
        alert('Выберите чат для отправки сообщения');
        return;
    }
    
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const message = {
        id: Date.now(),
        senderId: 'me',
        text: text,
        timestamp: new Date()
    };
    
    if (!messages[currentChat.id]) {
        messages[currentChat.id] = [];
    }
    
    messages[currentChat.id].push(message);
    input.value = '';
    input.style.height = 'auto';
    
    renderMessages();
    renderChats();
    saveToLocalStorage();
    
    // Имитация ответа
    setTimeout(() => {
        const response = {
            id: Date.now(),
            senderId: currentChat.id,
            text: getRandomResponse(),
            timestamp: new Date()
        };
        
        messages[currentChat.id].push(response);
        renderMessages();
        renderChats();
        saveToLocalStorage();
    }, 1000);
}

function getRandomResponse() {
    const responses = [
        'Понял! 👍',
        'Согласен',
        'Спасибо за сообщение',
        'Ок, буду работать над этим',
        'Звучит отлично!',
        'Давай обсудим',
        'Когда ты свободен?',
        'Отправлю тебе файлы',
        'Нужна помощь?',
        'Всё готово',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// ============================================
// АВТОИЗМЕНЕНИЕ ВЫСОТЫ INPUT
// ============================================

const messageInput = document.getElementById('messageInput');
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// ============================================
// ПОИСК ЧАТОВ
// ============================================

document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        const name = item.querySelector('.chat-name').textContent.toLowerCase();
        item.style.display = name.includes(searchTerm) ? 'flex' : 'none';
    });
});

// ============================================
// НОВЫЙ ЧАТ
// ============================================

document.getElementById('newChatBtn').addEventListener('click', () => {
    document.getElementById('newChatModal').classList.add('active');
    renderUsersList();
});

document.getElementById('closeNewChatBtn').addEventListener('click', () => {
    document.getElementById('newChatModal').classList.remove('active');
});

function renderUsersList() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div class="user-avatar" style="background: linear-gradient(135deg, ${getGradientColor(user.username)})">${user.avatar}</div>
            <div>
                <div class="user-name">${user.fullName}</div>
                <div style="font-size: 12px; color: var(--text-secondary);">@${user.username}</div>
            </div>
        `;
        
        userItem.addEventListener('click', () => {
            selectChat(user);
            document.getElementById('newChatModal').classList.remove('active');
        });
        
        usersList.appendChild(userItem);
    });
}

document.getElementById('newChatSearch').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    document.querySelectorAll('#usersList .user-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
});

// ============================================
// МОДАЛЬНОЕ ОКНО НАСТРОЕК
// ============================================

document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.add('active');
});

document.getElementById('closeSettingsBtn').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.remove('active');
});

// Переключение вкладок в настройках
document.querySelectorAll('.settings-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
    });
});

// ============================================
// ПРОФИЛЬ И НАСТРОЙКИ
// ============================================

function loadSettings() {
    if (!currentUser) return;
    
    // Профиль
    document.getElementById('settingsUsername').value = currentUser.username;
    document.getElementById('settingsFullName').value = currentUser.fullName;
    document.getElementById('settingsEmail').value = currentUser.email;
    document.getElementById('settingsBio').value = currentUser.bio || '';
    
    const profileAvatar = document.getElementById('profileAvatar');
    profileAvatar.textContent = currentUser.avatar;
    profileAvatar.style.background = `linear-gradient(135deg, ${getGradientColor(currentUser.username)})`;
    
    // Приватность
    const onlineStatus = localStorage.getItem('onlineStatus');
    document.getElementById('onlineStatus').checked = onlineStatus !== 'false';
    
    const lastSeen = localStorage.getItem('lastSeen');
    document.getElementById('lastSeen').checked = lastSeen !== 'false';
    
    const readReceipts = localStorage.getItem('readReceipts');
    document.getElementById('readReceipts').checked = readReceipts !== 'false';
    
    // Уведомления
    const soundNotif = localStorage.getItem('soundNotif');
    document.getElementById('soundNotif').checked = soundNotif !== 'false';
    
    const desktopNotif = localStorage.getItem('desktopNotif');
    document.getElementById('desktopNotif').checked = desktopNotif !== 'false';
    
    // Внешний вид
    const darkMode = localStorage.getItem('darkMode') === 'true';
    document.getElementById('darkMode').checked = darkMode;
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
    
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    document.getElementById('fontSize').value = fontSize;
    document.body.classList.remove('font-small', 'font-large');
    if (fontSize !== 'medium') {
        document.body.classList.add(`font-${fontSize}`);
    }
}

document.getElementById('saveProfileBtn').addEventListener('click', () => {
    if (!currentUser) return;
    
    currentUser.fullName = document.getElementById('settingsFullName').value;
    currentUser.email = document.getElementById('settingsEmail').value;
    currentUser.bio = document.getElementById('settingsBio').value;
    
    saveToLocalStorage();
    updateUserInfo();
    renderChats();
    renderChatHeader();
    
    alert('Профиль обновлен!');
});

document.getElementById('onlineStatus').addEventListener('change', (e) => {
    localStorage.setItem('onlineStatus', e.target.checked);
});

document.getElementById('lastSeen').addEventListener('change', (e) => {
    localStorage.setItem('lastSeen', e.target.checked);
});

document.getElementById('readReceipts').addEventListener('change', (e) => {
    localStorage.setItem('readReceipts', e.target.checked);
});

document.getElementById('soundNotif').addEventListener('change', (e) => {
    localStorage.setItem('soundNotif', e.target.checked);
});

document.getElementById('desktopNotif').addEventListener('change', (e) => {
    localStorage.setItem('desktopNotif', e.target.checked);
});

document.getElementById('darkMode').addEventListener('change', (e) => {
    if (e.target.checked) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', e.target.checked);
});

document.getElementById('fontSize').addEventListener('change', (e) => {
    const size = e.target.value;
    document.body.classList.remove('font-small', 'font-large');
    if (size !== 'medium') {
        document.body.classList.add(`font-${size}`);
    }
    localStorage.setItem('fontSize', size);
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.clear();
        document.getElementById('settingsModal').classList.remove('active');
        showAuthScreen();
    }
});

document.getElementById('changeAvatarBtn').addEventListener('click', () => {
    const newInitial = prompt('Введите новый аватар (один символ):');
    if (newInitial && newInitial.length === 1) {
        currentUser.avatar = newInitial.toUpperCase();
        saveToLocalStorage();
        loadSettings();
        updateUserInfo();
        renderChats();
    }
});

// ============================================
// КНОПКИ ДЕЙСТВИЙ В ЧАТЕ
// ============================================

document.getElementById('callBtn').addEventListener('click', () => {
    if (currentChat) {
        alert(`📞 Голосовой звонок с ${currentChat.fullName}\n(В этой демо версии функция недоступна)`);
    }
});

document.getElementById('videoBtn').addEventListener('click', () => {
    if (currentChat) {
        alert(`📹 Видеозвонок с ${currentChat.fullName}\n(В этой демо версии функция недоступна)`);
    }
});

document.getElementById('infoBtn').addEventListener('click', () => {
    if (currentChat) {
        alert(`ℹ️ Информация о ${currentChat.fullName}\n\nПолное имя: ${currentChat.fullName}\nЮзернейм: @${currentChat.username}\n\nО себе: ${currentChat.bio}\n\nСтатус: ${currentChat.online ? 'Онлайн' : 'Оффлайн'}`);
    }
});

document.getElementById('attachBtn').addEventListener('click', () => {
    alert('📎 Прикрепление файлов\n(В этой демо версии функция недоступна)');
});

document.getElementById('emojiBtn').addEventListener('click', () => {
    const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🚀', '💯', '✨'];
    const selected = prompt(`Выберите эмодзи:\n${emojis.join(' ')}\n\nВведите эмодзи:`);
    if (selected) {
        const input = document.getElementById('messageInput');
        input.value += selected;
        input.focus();
    }
});

// ============================================
// ЗАКРЫТИЕ МОДАЛЕЙ
// ============================================

window.addEventListener('click', (e) => {
    const settingsModal = document.getElementById('settingsModal');
    const newChatModal = document.getElementById('newChatModal');
    
    if (e.target === settingsModal) {
        settingsModal.classList.remove('active');
    }
    
    if (e.target === newChatModal) {
        newChatModal.classList.remove('active');
    }
});

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

window.addEventListener('load', () => {
    loadFromLocalStorage();
    
    if (currentUser) {
        showMessengerScreen();
    } else {
        initializeData();
    }
});