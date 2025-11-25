const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const chatContainer = document.getElementById("chat-container");
const messagesWrapper = chatContainer.querySelector('.messages-wrapper');
const newChatBtn = document.getElementById("new-chat-btn");
const toggleSidebarBtn = document.getElementById("toggle-sidebar");
const sidebar = document.getElementById("sidebar");
const chatHistory = document.getElementById("chat-history");
const currentChatTitle = document.getElementById("current-chat-title");


let chats = JSON.parse(localStorage.getItem('chats')) || [];
let currentChatId = null;


marked.setOptions({
    breaks: true,
    gfm: true
});

loadChatHistory();

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", function(e) {
    if (e.key === "Enter") sendMessage();
});

newChatBtn.addEventListener("click", createNewChat);
toggleSidebarBtn.addEventListener("click", toggleSidebar);

function toggleSidebar() {
    sidebar.classList.toggle('hidden');
}

function createNewChat() {
    currentChatId = null;
    messagesWrapper.innerHTML = '';
    currentChatTitle.textContent = 'New Chat';
    updateChatHistoryUI();
}

function loadChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    currentChatId = chatId;
    messagesWrapper.innerHTML = '';
    currentChatTitle.textContent = chat.title;

    chat.messages.forEach(msg => {
        addMessage(msg.role, msg.content, false, false);
    });

    updateChatHistoryUI();
}

function saveCurrentChat(userMessage, aiMessage) {
    if (!currentChatId) {

        currentChatId = Date.now().toString();
        const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
        
        chats.unshift({
            id: currentChatId,
            title: title,
            timestamp: new Date().toISOString(),
            messages: []
        });
        
        currentChatTitle.textContent = title;
    }

    const chat = chats.find(c => c.id === currentChatId);
    if (chat) {
        chat.messages.push(
            { role: 'user', content: userMessage },
            { role: 'ai', content: aiMessage }
        );
        chat.timestamp = new Date().toISOString();
    }

    if (chats.length > 20) {
        chats = chats.slice(0, 20);
    }

    localStorage.setItem('chats', JSON.stringify(chats));
    loadChatHistory();
}

function loadChatHistory() {
    chatHistory.innerHTML = '';
    
    chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-history-item';
        if (chat.id === currentChatId) {
            chatItem.classList.add('active');
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'chat-content';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'chat-title';
        titleDiv.textContent = chat.title;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'chat-time';
        timeDiv.textContent = getRelativeTime(chat.timestamp);

        contentDiv.appendChild(titleDiv);
        contentDiv.appendChild(timeDiv);


        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'chat-actions';

        const renameBtn = document.createElement('button');
        renameBtn.className = 'chat-action-btn';
        renameBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
        `;
        renameBtn.title = 'Rename chat';
        renameBtn.onclick = (e) => {
            e.stopPropagation();
            renameChat(chat.id, titleDiv);
        };

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'chat-action-btn';
        deleteBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
        `;
        deleteBtn.title = 'Delete chat';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteChat(chat.id);
        };

        actionsDiv.appendChild(renameBtn);
        actionsDiv.appendChild(deleteBtn);

        chatItem.appendChild(contentDiv);
        chatItem.appendChild(actionsDiv);

        chatItem.addEventListener('click', () => loadChat(chat.id));

        chatHistory.appendChild(chatItem);
    });
}

function renameChat(chatId, titleElement) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    const currentTitle = chat.title;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'chat-rename-input';
    input.value = currentTitle;

    titleElement.textContent = '';
    titleElement.appendChild(input);
    input.focus();
    input.select();

    const finishRename = () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== currentTitle) {
            chat.title = newTitle;
            localStorage.setItem('chats', JSON.stringify(chats));
            if (chat.id === currentChatId) {
                currentChatTitle.textContent = newTitle;
            }
        }
        loadChatHistory();
    };

    input.addEventListener('blur', finishRename);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            finishRename();
        } else if (e.key === 'Escape') {
            loadChatHistory();
        }
    });
}

function deleteChat(chatId) {
    if (!confirm('Are you sure you want to delete this chat?')) {
        return;
    }

    chats = chats.filter(c => c.id !== chatId);
    localStorage.setItem('chats', JSON.stringify(chats));

    if (chatId === currentChatId) {
        createNewChat();
    }

    loadChatHistory();
}

function updateChatHistoryUI() {
    const items = chatHistory.querySelectorAll('.chat-history-item');
    items.forEach(item => {
        item.classList.remove('active');
    });

    if (currentChatId) {
        const chatIndex = chats.findIndex(c => c.id === currentChatId);
        if (chatIndex !== -1 && items[chatIndex]) {
            items[chatIndex].classList.add('active');
        }
    }
}

function getRelativeTime(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
}

async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;
    input.value = "";

    addMessage("user", message, false, true);

    const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
    });

    const reader = response.body.getReader();
    let botText = "";
    addMessage("ai", botText, true, true);
    const botElem = messagesWrapper.querySelector(".message.ai:last-child .text");

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        botText += chunk;
        botElem.innerHTML = marked.parse(botText);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    saveCurrentChat(message, botText);
}

function addMessage(role, text, streaming=false, shouldSave=false) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", role);

    if (role === "user") {
        const bubbleDiv = document.createElement("div");
        bubbleDiv.classList.add("text");
        bubbleDiv.textContent = text;
        msgDiv.appendChild(bubbleDiv);
    } else {
        const avatarDiv = document.createElement("div");
        avatarDiv.classList.add("avatar");
        avatarDiv.textContent = "G";
        
        const bubbleDiv = document.createElement("div");
        bubbleDiv.classList.add("text");
        
        if (streaming) {
            bubbleDiv.textContent = text;
        } else {
            bubbleDiv.innerHTML = marked.parse(text);
        }
        
        msgDiv.appendChild(avatarDiv);
        msgDiv.appendChild(bubbleDiv);
    }

    messagesWrapper.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}