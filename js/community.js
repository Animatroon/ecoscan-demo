// Модуль сообщества
class CommunityManager {
    constructor() {
        this.posts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
        this.events = this.initEvents();
        this.leaderboard = this.initLeaderboard();
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFeed();
        this.initializePosts();
    }

    bindEvents() {
        const publishBtn = document.getElementById('publish-post');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => {
                this.publishPost();
            });
        }
    }

    getCurrentUser() {
        return {
            id: 'user_' + Date.now(),
            name: 'Вы',
            avatar: 'У',
            level: window.ecoScanApp ? window.ecoScanApp.userStats.level : 1,
            points: window.ecoScanApp ? window.ecoScanApp.userPoints : 0
        };
    }

    loadFeed() {
        const container = document.getElementById('posts-container');
        if (!container) return;

        if (this.posts.length === 0) {
            container.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-comments"></i>
                    <h3>Пока нет постов</h3>
                    <p>Станьте первым, кто поделится опытом экологичной жизни!</p>
                    <button class="btn btn-primary" onclick="document.getElementById('create-post-btn').click()">
                        <i class="fas fa-plus"></i>
                        Создать первый пост
                    </button>
                </div>
            `;
            return;
        }

        // Сортировать посты по дате (новые сверху)
        const sortedPosts = [...this.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        container.innerHTML = sortedPosts.map(post => this.createPostHTML(post)).join('');
        this.bindPostEvents();
    }

    createPostHTML(post) {
        const timeAgo = this.getTimeAgo(new Date(post.createdAt));
        const imageHTML = post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : '';
        
        return `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="user-avatar">${post.author.avatar}</div>
                    <div class="post-author-info">
                        <div class="author-name">${post.author.name}</div>
                        <div class="post-meta">
                            <span class="eco-level">Эко-уровень ${post.author.level}</span>
                            <span class="post-time">${timeAgo}</span>
                        </div>
                    </div>
                </div>
                <div class="post-content">
                    <p>${post.content}</p>
                    ${imageHTML}
                </div>
                <div class="post-stats">
                    <div class="stat-item">
                        <i class="fas fa-leaf"></i>
                        <span>+${post.ecoPoints} эко-очков</span>
                    </div>
                    ${post.category ? `<div class="post-category">${this.getCategoryName(post.category)}</div>` : ''}
                </div>
                <div class="post-actions">
                    <button class="post-action like-btn ${post.liked ? 'liked' : ''}" data-action="like">
                        <i class="fas fa-heart"></i>
                        <span>${post.likes || 0}</span>
                    </button>
                    <button class="post-action comment-btn" data-action="comment">
                        <i class="fas fa-comment"></i>
                        <span>${post.comments?.length || 0}</span>
                    </button>
                    <button class="post-action share-btn" data-action="share">
                        <i class="fas fa-share-alt"></i>
                        <span>Поделиться</span>
                    </button>
                </div>
                ${post.comments && post.comments.length > 0 ? this.createCommentsHTML(post.comments) : ''}
            </div>
        `;
    }

    createCommentsHTML(comments) {
        return `
            <div class="post-comments">
                ${comments.map(comment => `
                    <div class="comment">
                        <div class="comment-avatar">${comment.author.avatar}</div>
                        <div class="comment-content">
                            <div class="comment-author">${comment.author.name}</div>
                            <div class="comment-text">${comment.text}</div>
                            <div class="comment-time">${this.getTimeAgo(new Date(comment.createdAt))}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    bindPostEvents() {
        const postActions = document.querySelectorAll('.post-action');
        postActions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                const postCard = btn.closest('.post-card');
                const postId = postCard.dataset.postId;
                this.handlePostAction(action, postId, btn);
            });
        });
    }

    handlePostAction(action, postId, button) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        switch (action) {
            case 'like':
                this.toggleLike(post, button);
                break;
            case 'comment':
                this.showCommentDialog(post);
                break;
            case 'share':
                this.sharePost(post);
                break;
        }
    }

    toggleLike(post, button) {
        post.liked = !post.liked;
        post.likes = (post.likes || 0) + (post.liked ? 1 : -1);
        
        button.classList.toggle('liked', post.liked);
        button.querySelector('span').textContent = post.likes;
        
        this.savePosts();

        if (post.liked && window.ecoScanApp) {
            window.ecoScanApp.showNotification('Спасибо за поддержку сообщества!', 'success');
        }
    }

    showCommentDialog(post) {
        const comment = prompt('Оставьте комментарий:');
        if (!comment || comment.trim() === '') return;

        if (!post.comments) {
            post.comments = [];
        }

        post.comments.push({
            id: this.generateId(),
            text: comment.trim(),
            author: this.currentUser,
            createdAt: new Date().toISOString()
        });

        this.savePosts();
        this.loadFeed();

        if (window.ecoScanApp) {
            window.ecoScanApp.addPoints(5, 'комментарий в сообществе');
        }
    }

    sharePost(post) {
        if (navigator.share) {
            navigator.share({
                title: 'EcoScan - Пост от сообщества',
                text: post.content,
                url: window.location.href
            });
        } else {
            // Копировать ссылку в буфер обмена
            navigator.clipboard.writeText(window.location.href).then(() => {
                if (window.ecoScanApp) {
                    window.ecoScanApp.showNotification('Ссылка скопирована в буфер обмена', 'success');
                }
            });
        }
    }

    publishPost() {
        const contentTextarea = document.getElementById('post-content');
        const imageInput = document.getElementById('post-image');
        
        const content = contentTextarea.value.trim();
        if (!content) {
            if (window.ecoScanApp) {
                window.ecoScanApp.showNotification('Введите текст поста', 'warning');
            }
            return;
        }

        // Обработка изображения
        let imageData = null;
        if (imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imageData = e.target.result;
                this.createPost(content, imageData);
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            this.createPost(content, null);
        }
    }

    createPost(content, image) {
        const post = {
            id: this.generateId(),
            content: content,
            image: image,
            author: this.currentUser,
            createdAt: new Date().toISOString(),
            likes: 0,
            liked: false,
            comments: [],
            ecoPoints: this.calculatePostEcoPoints(content),
            category: this.detectPostCategory(content)
        };

        this.posts.unshift(post); // Добавить в начало массива
        this.savePosts();
        this.loadFeed();

        // Очистить форму
        document.getElementById('post-content').value = '';
        document.getElementById('post-image').value = '';

        // Закрыть модальное окно
        if (window.ecoScanApp) {
            window.ecoScanApp.hideModal();
            window.ecoScanApp.addPoints(post.ecoPoints, 'создание поста в сообществе');
            window.ecoScanApp.showNotification('Пост опубликован!', 'success');
        }
    }

    calculatePostEcoPoints(content) {
        let points = 10; // базовые очки за пост
        
        // Дополнительные очки за ключевые слова
        const ecoKeywords = ['переработка', 'экология', 'утилизация', 'сортировка', 'отходы', 'природа', 'мусор', 'пластик'];
        ecoKeywords.forEach(keyword => {
            if (content.toLowerCase().includes(keyword)) {
                points += 5;
            }
        });

        // Дополнительные очки за длину поста
        if (content.length > 100) points += 5;
        if (content.length > 200) points += 10;

        return Math.min(points, 50); // максимум 50 очков за пост
    }

    detectPostCategory(content) {
        const categories = {
            'переработка': 'recycling',
            'сортировка': 'sorting',
            'пластик': 'plastic',
            'стекло': 'glass',
            'бумага': 'paper',
            'металл': 'metal',
            'органика': 'organic',
            'батарейки': 'batteries',
            'электроника': 'electronics'
        };

        for (const [keyword, category] of Object.entries(categories)) {
            if (content.toLowerCase().includes(keyword)) {
                return category;
            }
        }

        return null;
    }

    getCategoryName(category) {
        const names = {
            'recycling': 'Переработка',
            'sorting': 'Сортировка',
            'plastic': 'Пластик',
            'glass': 'Стекло',
            'paper': 'Бумага',
            'metal': 'Металл',
            'organic': 'Органика',
            'batteries': 'Батарейки',
            'electronics': 'Электроника'
        };
        return names[category] || category;
    }

    loadEvents() {
        const container = document.getElementById('events-container');
        if (!container) return;

        container.innerHTML = this.events.map(event => `
            <div class="event-card">
                <div class="event-header">
                    <div class="event-date">
                        <div class="event-day">${this.formatDate(new Date(event.date), 'day')}</div>
                        <div class="event-month">${this.formatDate(new Date(event.date), 'month')}</div>
                    </div>
                    <div class="event-info">
                        <h4>${event.title}</h4>
                        <p class="event-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${event.location}
                        </p>
                        <p class="event-time">
                            <i class="fas fa-clock"></i>
                            ${event.time}
                        </p>
                    </div>
                </div>
                <div class="event-content">
                    <p>${event.description}</p>
                    <div class="event-tags">
                        ${event.tags.map(tag => `<span class="event-tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="event-stats">
                    <div class="participants">
                        <i class="fas fa-users"></i>
                        <span>${event.participants} участников</span>
                    </div>
                    <div class="event-points">
                        <i class="fas fa-star"></i>
                        <span>+${event.points} очков</span>
                    </div>
                </div>
                <div class="event-actions">
                    <button class="btn btn-primary join-event" data-event-id="${event.id}">
                        <i class="fas fa-plus"></i>
                        Участвовать
                    </button>
                    <button class="btn btn-secondary share-event" data-event-id="${event.id}">
                        <i class="fas fa-share-alt"></i>
                        Поделиться
                    </button>
                </div>
            </div>
        `).join('');

        // Привязать события
        const joinButtons = container.querySelectorAll('.join-event');
        joinButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const eventId = btn.dataset.eventId;
                this.joinEvent(eventId);
            });
        });

        const shareButtons = container.querySelectorAll('.share-event');
        shareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const eventId = btn.dataset.eventId;
                this.shareEvent(eventId);
            });
        });
    }

    joinEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        event.participants += 1;
        
        if (window.ecoScanApp) {
            window.ecoScanApp.addPoints(event.points, `участие в событии "${event.title}"`);
            window.ecoScanApp.showNotification(`Вы записались на "${event.title}"!`, 'success');
        }

        this.loadEvents();
    }

    shareEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const shareText = `Присоединяйтесь к эко-событию "${event.title}" ${this.formatDate(new Date(event.date), 'full')} в ${event.location}`;
        
        if (navigator.share) {
            navigator.share({
                title: event.title,
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                if (window.ecoScanApp) {
                    window.ecoScanApp.showNotification('Информация о событии скопирована', 'success');
                }
            });
        }
    }

    loadLeaderboard() {
        const container = document.getElementById('leaderboard-container');
        if (!container) return;

        // Добавить текущего пользователя в лидерборд
        const currentUserEntry = {
            id: this.currentUser.id,
            name: this.currentUser.name,
            points: this.currentUser.points,
            level: this.currentUser.level,
            avatar: this.currentUser.avatar,
            isCurrentUser: true
        };

        const leaderboardWithUser = [currentUserEntry, ...this.leaderboard]
            .sort((a, b) => b.points - a.points)
            .map((user, index) => ({ ...user, rank: index + 1 }));

        container.innerHTML = `
            <div class="leaderboard-header">
                <h3>Топ эко-героев</h3>
                <div class="leaderboard-filters">
                    <button class="filter-btn active" data-filter="all">Все время</button>
                    <button class="filter-btn" data-filter="month">Месяц</button>
                    <button class="filter-btn" data-filter="week">Неделя</button>
                </div>
            </div>
            <div class="leaderboard-list">
                ${leaderboardWithUser.slice(0, 20).map(user => `
                    <div class="leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}">
                        <div class="rank">
                            ${user.rank <= 3 ? this.getRankIcon(user.rank) : user.rank}
                        </div>
                        <div class="user-avatar">${user.avatar}</div>
                        <div class="user-info">
                            <div class="user-name">${user.name}</div>
                            <div class="user-level">Уровень ${user.level}</div>
                        </div>
                        <div class="user-points">
                            <i class="fas fa-star"></i>
                            <span>${user.points}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getRankIcon(rank) {
        const icons = {
            1: '<i class="fas fa-crown" style="color: #FFD700;"></i>',
            2: '<i class="fas fa-medal" style="color: #C0C0C0;"></i>',
            3: '<i class="fas fa-award" style="color: #CD7F32;"></i>'
        };
        return icons[rank] || rank;
    }

    savePosts() {
        localStorage.setItem('communityPosts', JSON.stringify(this.posts));
    }

    initializePosts() {
        // Добавить примеры постов, если локальное хранилище пустое
        if (this.posts.length === 0) {
            this.posts = [
                {
                    id: 'demo_post_1',
                    content: 'Вчера был на набережной Актау и увидел, как много пластиковых бутылок выбрасывают в море 😢 Решил организовать небольшую очистку с друзьями. Собрали 15 мешков мусора! Каспий заслуживает лучшего! �',
                    author: {
                        id: 'demo_user_1',
                        name: 'Асем Экологова',
                        avatar: 'А',
                        level: 7
                    },
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 часа назад
                    likes: 25,
                    liked: false,
                    comments: [
                        {
                            id: 'comment_1',
                            text: 'Спасибо за такую важную работу! Присоединюсь в следующий раз!',
                            author: { name: 'Данияр', avatar: 'Д' },
                            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
                        }
                    ],
                    ecoPoints: 35,
                    category: 'plastic'
                },
                {
                    id: 'demo_post_2',
                    content: 'В Актау открылся новый пункт приема батареек в мкр. 4! Наконец-то можно безопасно утилизировать старые батарейки. За месяц собрал уже целую коробку 🔋 Каждая батарейка может загрязнить 20 кв.м земли!',
                    author: {
                        id: 'demo_user_2',
                        name: 'Ербол Зеленый',
                        avatar: 'Е',
                        level: 5
                    },
                    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 часов назад
                    likes: 18,
                    liked: false,
                    comments: [],
                    ecoPoints: 30,
                    category: 'batteries'
                },
                {
                    id: 'demo_post_3',
                    content: 'Начала использовать многоразовые мешочки для покупок на рынке в Актау! Продавцы сначала удивлялись, но теперь многие покупатели последовали моему примеру 🛍️ Маленькие шаги к большим переменам!',
                    author: {
                        id: 'demo_user_3',
                        name: 'Айгуль Каспий',
                        avatar: 'А',
                        level: 9
                    },
                    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 день назад
                    likes: 42,
                    liked: true,
                    comments: [
                        {
                            id: 'comment_2',
                            text: 'Где можно купить такие мешочки в Актау?',
                            author: { name: 'Сауле', avatar: 'С' },
                            createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
                        },
                        {
                            id: 'comment_3',
                            text: 'В ЭкоЦентре "Каспий" есть хороший выбор!',
                            author: { name: 'Айгуль Каспий', avatar: 'А' },
                            createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
                        }
                    ],
                    ecoPoints: 25,
                    category: 'recycling'
                }
            ];
            this.savePosts();
        }
    }

    initEvents() {
        const now = new Date();
        return [
            {
                id: 'event_1',
                title: 'Субботник на набережной Актау',
                description: 'Приглашаем всех на генеральную уборку набережной Каспийского моря! Будем собирать мусор, сажать деревья и проводить мастер-классы по сортировке отходов.',
                date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // через 3 дня
                time: '10:00 - 15:00',
                location: 'Набережная Актау, центральная часть',
                participants: 47,
                points: 100,
                tags: ['уборка', 'море', 'волонтерство']
            },
            {
                id: 'event_2',
                title: 'Мастер-класс по переработке пластика',
                description: 'Узнайте, как правильно сортировать пластиковые отходы и что можно сделать из переработанного пластика. Будут примеры и практические задания.',
                date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // через неделю
                time: '18:00 - 20:00',
                location: 'ЭкоЦентр "Каспий", мкр. 3, дом 15',
                participants: 23,
                points: 50,
                tags: ['обучение', 'пластик', 'переработка']
            },
            {
                id: 'event_3',
                title: 'Ярмарка экологичных товаров',
                description: 'Большая ярмарка товаров из переработанных материалов, органической косметики и экологичной одежды. Скидки до 30%!',
                date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), // через 2 недели
                time: '11:00 - 19:00',  
                location: 'Парк Ак-Тау, центральная аллея',
                participants: 156,
                points: 25,
                tags: ['ярмарка', 'экотовары', 'скидки']
            },
            {
                id: 'event_4',
                title: 'Очистка берега Каспийского моря',
                description: 'Экологическая акция по очистке прибрежной зоны от пластикового мусора. Присоединяйтесь к спасению морской экосистемы!',
                date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                time: '08:00 - 12:00',
                location: 'Пляж "Каспий", мкр. 15',
                participants: 89,
                points: 120,
                tags: ['море', 'экология', 'очистка']
            }
        ];
    }

    initLeaderboard() {
        return [
            { id: 'leader_1', name: 'ЭкоМастер2024', points: 2450, level: 15, avatar: 'Э' },
            { id: 'leader_2', name: 'Зеленый Воин', points: 2180, level: 13, avatar: 'З' },
            { id: 'leader_3', name: 'Сортировщик', points: 1950, level: 12, avatar: 'С' },
            { id: 'leader_4', name: 'Переработчик', points: 1780, level: 11, avatar: 'П' },
            { id: 'leader_5', name: 'ЭкоГуру', points: 1650, level: 10, avatar: 'Г' },
            { id: 'leader_6', name: 'НатураЛав', points: 1420, level: 9, avatar: 'Н' },
            { id: 'leader_7', name: 'КлинГрин', points: 1280, level: 8, avatar: 'К' },
            { id: 'leader_8', name: 'РециклБой', points: 1150, level: 7, avatar: 'Р' },
            { id: 'leader_9', name: 'ЭкоЛеди', points: 980, level: 6, avatar: 'Л' },
            { id: 'leader_10', name: 'МусорНет', points: 850, level: 5, avatar: 'М' }
        ];
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'только что';
        if (diffMins < 60) return `${diffMins} мин. назад`;
        if (diffHours < 24) return `${diffHours} ч. назад`;
        if (diffDays < 7) return `${diffDays} дн. назад`;
        
        return date.toLocaleDateString('ru-RU');
    }

    formatDate(date, format) {
        const options = {
            day: { day: 'numeric' },
            month: { month: 'short' },
            full: { year: 'numeric', month: 'long', day: 'numeric' }
        };
        
        return new Intl.DateTimeFormat('ru-RU', options[format]).format(date);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Добавить стили для сообщества
const communityStyles = document.createElement('style');
communityStyles.textContent = `
    .no-posts {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--text-secondary);
    }
    
    .no-posts i {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    
    .post-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
    }
    
    .post-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }
    
    .post-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.1rem;
    }
    
    .post-author-info {
        flex: 1;
    }
    
    .author-name {
        font-weight: bold;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
    }
    
    .post-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.8rem;
        color: var(--text-secondary);
    }
    
    .eco-level {
        background: var(--accent-color);
        color: white;
        padding: 0.2rem 0.5rem;
        border-radius: 10px;
        font-weight: bold;
    }
    
    .post-content {
        margin-bottom: 1rem;
        line-height: 1.6;
    }
    
    .post-image {
        width: 100%;
        max-height: 300px;
        object-fit: cover;
        border-radius: 8px;
        margin-top: 1rem;
    }
    
    .post-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding: 0.75rem;
        background: var(--background-color);
        border-radius: 8px;
    }
    
    .stat-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--primary-color);
        font-weight: bold;
        font-size: 0.9rem;
    }
    
    .post-category {
        background: var(--secondary-color);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    .post-actions {
        display: flex;
        gap: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
    }
    
    .post-action {
        flex: 1;
        background: none;
        border: none;
        padding: 0.75rem;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        color: var(--text-secondary);
        transition: all 0.3s ease;
        font-size: 0.9rem;
    }
    
    .post-action:hover {
        background: var(--background-color);
        color: var(--primary-color);
    }
    
    .post-action.liked {
        color: #E91E63;
        background: rgba(233, 30, 99, 0.1);
    }
    
    .post-comments {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
    }
    
    .comment {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }
    
    .comment:last-child {
        margin-bottom: 0;
    }
    
    .comment-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--accent-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 0.9rem;
        flex-shrink: 0;
    }
    
    .comment-content {
        flex: 1;
    }
    
    .comment-author {
        font-weight: bold;
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
    }
    
    .comment-text {
        color: var(--text-primary);
        font-size: 0.9rem;
        line-height: 1.5;
        margin-bottom: 0.25rem;
    }
    
    .comment-time {
        color: var(--text-secondary);
        font-size: 0.8rem;
    }
    
    .event-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        border-left: 4px solid var(--primary-color);
    }
    
    .event-header {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        align-items: flex-start;
    }
    
    .event-date {
        background: var(--primary-color);
        color: white;
        padding: 0.75rem;
        border-radius: 8px;
        text-align: center;
        min-width: 60px;
        flex-shrink: 0;
    }
    
    .event-day {
        font-size: 1.5rem;
        font-weight: bold;
        line-height: 1;
    }
    
    .event-month {
        font-size: 0.8rem;
        text-transform: uppercase;
        margin-top: 0.25rem;
    }
    
    .event-info {
        flex: 1;
    }
    
    .event-info h4 {
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }
    
    .event-location, .event-time {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
    }
    
    .event-content {
        margin-bottom: 1rem;
    }
    
    .event-content p {
        line-height: 1.6;
        margin-bottom: 1rem;
    }
    
    .event-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .event-tag {
        background: var(--accent-color);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    .event-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding: 0.75rem;
        background: var(--background-color);
        border-radius: 8px;
    }
    
    .participants, .event-points {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--primary-color);
        font-weight: bold;
        font-size: 0.9rem;
    }
    
    .event-actions {
        display: flex;
        gap: 1rem;
    }
    
    .leaderboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding: 0 0.5rem;
    }
    
    .leaderboard-filters {
        display: flex;
        gap: 0.5rem;
    }
    
    .filter-btn {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border-color);
        background: white;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.3s ease;
    }
    
    .filter-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }
    
    .leaderboard-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        background: white;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        transition: all 0.3s ease;
    }
    
    .leaderboard-item:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    
    .leaderboard-item.current-user {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        font-weight: bold;
    }
    
    .leaderboard-item.current-user .user-level {
        color: rgba(255,255,255,0.8);
    }
    
    .rank {
        width: 40px;
        text-align: center;
        font-weight: bold;
        font-size: 1.2rem;
    }
    
    .user-info {
        flex: 1;
    }
    
    .user-name {
        font-weight: bold;
        margin-bottom: 0.25rem;
    }
    
    .user-level {
        font-size: 0.8rem;
        color: var(--text-secondary);
    }
    
    .user-points {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: bold;
        color: var(--primary-color);
    }
    
    .leaderboard-item.current-user .user-points {
        color: white;
    }
    
    @media (max-width: 768px) {
        .post-actions {
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .event-header {
            flex-direction: column;
            align-items: stretch;
        }
        
        .event-date {
            align-self: flex-start;
        }
        
        .event-actions {
            flex-direction: column;
        }
        
        .leaderboard-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
        }
    }
`;
document.head.appendChild(communityStyles);

// Экспорт класса
window.CommunityManager = CommunityManager;
