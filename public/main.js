// إعداد الاتصال
const socket = io('ws://localhost:3000', {
    transports: ['websocket']
});

// المتغيرات العامة
let currentChatUser = null;
const messages = new Map(); // تخزين الرسائل لكل مستخدم

// العناصر
const usersList = document.getElementById('usersList');
const welcomeScreen = document.getElementById('welcomeScreen');
const chatScreen = document.getElementById('chatScreen');
const currentChatUserName = document.querySelector('#currentChatUser span');
const messagesContainer = document.getElementById('messagesContainer');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const searchInput = document.getElementById('searchUsers');

// قوالب
const userTemplate = document.getElementById('userTemplate');
const messageTemplate = document.getElementById('messageTemplate');

// الاتصال بالسيرفر
socket.on('connect', () => {
    console.log('Connected to server');
    showSuccessMessage('تم الاتصال بنجاح');
    socket.emit('users'); // طلب قائمة المستخدمين
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    showErrorMessage('انقطع الاتصال');
});

// استقبال قائمة المستخدمين
socket.on('users', (data) => {
    updateUsersList(data.users);
});

// استقبال الرسائل
socket.on('msg', (data) => {
    if (data.from && data.text) {
        addMessage(data.from, data.text, false);
        
        // إذا لم تكن المحادثة مفتوحة مع هذا المستخدم
        if (currentChatUser !== data.from) {
            showNotification(data.from, data.text);
        }
    }
});

// إشعارات نجاح/فشل إرسال الرسالة
socket.on('sent', (data) => {
    console.log('Message sent successfully', data);
});

socket.on('error', (error) => {
    showErrorMessage(error.message);
});

// تحديث قائمة المستخدمين
function updateUsersList(users) {
    usersList.innerHTML = '';
    users.forEach(userId => {
        if (userId !== socket.id) { // لا نعرض المستخدم الحالي
            const userElement = createUserElement(userId);
            usersList.appendChild(userElement);
        }
    });
}

// إنشاء عنصر مستخدم
function createUserElement(userId) {
    const userElement = userTemplate.content.cloneNode(true);
    const userItem = userElement.querySelector('.user-item');
    const userName = userElement.querySelector('.user-name');

    userItem.dataset.userId = userId;
    userName.textContent = `مستخدم ${userId.slice(0, 6)}`;

    userItem.addEventListener('click', () => selectUser(userId));

    return userElement;
}

// اختيار مستخدم للدردشة
function selectUser(userId) {
    currentChatUser = userId;
    currentChatUserName.textContent = `مستخدم ${userId.slice(0, 6)}`;
    
    // تحديث واجهة المستخدم
    welcomeScreen.classList.add('d-none');
    chatScreen.classList.remove('d-none');
    
    // عرض الرسائل السابقة
    displayMessages(userId);
    
    // تحديث حالة المستخدم النشط
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.userId === userId) {
            item.classList.add('active');
        }
    });
}

// إضافة رسالة
function addMessage(userId, text, isSent = true) {
    // تخزين الرسالة
    if (!messages.has(userId)) {
        messages.set(userId, []);
    }
    messages.get(userId).push({
        text,
        time: new Date(),
        isSent
    });

    // إذا كانت المحادثة مفتوحة مع هذا المستخدم
    if (currentChatUser === userId) {
        displayMessages(userId);
    }
}

// عرض الرسائل
function displayMessages(userId) {
    messagesContainer.innerHTML = '';
    const userMessages = messages.get(userId) || [];

    userMessages.forEach(msg => {
        const messageElement = messageTemplate.content.cloneNode(true);
        const messageDiv = messageElement.querySelector('.message');
        const content = messageElement.querySelector('.message-content');
        const time = messageElement.querySelector('.message-time');

        messageDiv.classList.add(msg.isSent ? 'sent' : 'received');
        content.textContent = msg.text;
        time.textContent = formatTime(msg.time);

        messagesContainer.appendChild(messageElement);
    });

    // تمرير إلى آخر رسالة
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// إرسال رسالة
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    
    if (text && currentChatUser) {
        socket.emit('msg', {
            to: currentChatUser,
            text: text
        });
        
        addMessage(currentChatUser, text, true);
        messageInput.value = '';
    }
});

// البحث عن المستخدمين
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('.user-item').forEach(item => {
        const userName = item.querySelector('.user-name').textContent.toLowerCase();
        item.style.display = userName.includes(searchTerm) ? '' : 'none';
    });
});

// الوظائف المساعدة
function formatTime(date) {
    return new Date(date).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    messagesContainer.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    messagesContainer.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

function showNotification(userId, text) {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('رسالة جديدة', {
                    body: `${text}\nمن: مستخدم ${userId.slice(0, 6)}`,
                    icon: '/icon.png'
                });
            }
        });
    }
}
