// Модуль системы лояльности и геймификации
class AchievementManager {
    constructor() {
        this.achievements = this.initAchievements();
        this.rewards = this.initRewards();
        this.userAchievements = JSON.parse(localStorage.getItem('userAchievements') || '[]');
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        // Обработчики событий для наград
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('claim-reward')) {
                const rewardId = e.target.dataset.rewardId;
                this.claimReward(rewardId);
            }
        });
    }

    updateDisplay() {
        this.displayAchievements();
        this.displayRewards();
    }

    displayAchievements() {
        const container = document.getElementById('achievements-grid');
        if (!container) return;

        container.innerHTML = this.achievements.map(achievement => {
            const isUnlocked = this.isAchievementUnlocked(achievement.id);
            const progress = this.getAchievementProgress(achievement.id);
            
            return `
                <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">
                        <i class="fas ${achievement.icon}" style="color: ${isUnlocked ? achievement.color : '#ccc'}"></i>
                    </div>
                    <h4>${achievement.name}</h4>
                    <p class="achievement-description">${achievement.description}</p>
                    <div class="achievement-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">${progress}%</span>
                    </div>
                    <div class="achievement-reward">
                        <i class="fas fa-star"></i>
                        <span>+${achievement.points} очков</span>
                    </div>
                    ${isUnlocked ? '<div class="achievement-badge">✓</div>' : ''}
                </div>
            `;
        }).join('');
    }

    displayRewards() {
        const container = document.getElementById('rewards-list');
        if (!container) return;

        const availableRewards = this.rewards.filter(reward => 
            this.canClaimReward(reward)
        );

        if (availableRewards.length === 0) {
            container.innerHTML = `
                <div class="no-rewards">
                    <i class="fas fa-gift"></i>
                    <p>Пока нет доступных наград</p>
                    <p>Продолжайте сканировать отходы, чтобы заработать больше очков!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = availableRewards.map(reward => `
            <div class="reward-card">
                <div class="reward-icon">
                    <i class="fas ${reward.icon}"></i>
                </div>
                <div class="reward-info">
                    <h4>${reward.name}</h4>
                    <p>${reward.description}</p>
                    <div class="reward-partner">
                        <span class="partner-logo">${reward.partner}</span>
                    </div>
                </div>
                <div class="reward-cost">
                    <span class="cost-amount">${reward.cost}</span>
                    <i class="fas fa-star"></i>
                </div>
                <button class="btn btn-primary claim-reward" data-reward-id="${reward.id}">
                    Получить
                </button>
            </div>
        `).join('');
    }

    isAchievementUnlocked(achievementId) {
        return this.userAchievements.includes(achievementId);
    }

    getAchievementProgress(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement) return 0;

        const userStats = window.ecoScanApp ? window.ecoScanApp.userStats : { scans: 0 };
        const userPoints = window.ecoScanApp ? window.ecoScanApp.userPoints : 0;

        switch (achievement.type) {
            case 'scans':
                return Math.min(100, (userStats.scans / achievement.target) * 100);
            case 'points':
                return Math.min(100, (userPoints / achievement.target) * 100);
            case 'streak':
                const streak = this.getCurrentStreak();
                return Math.min(100, (streak / achievement.target) * 100);
            case 'level':
                return Math.min(100, (userStats.level / achievement.target) * 100);
            default:
                return 0;
        }
    }

    checkAchievements() {
        const newAchievements = [];

        this.achievements.forEach(achievement => {
            if (!this.isAchievementUnlocked(achievement.id)) {
                const progress = this.getAchievementProgress(achievement.id);
                if (progress >= 100) {
                    this.unlockAchievement(achievement.id);
                    newAchievements.push(achievement);
                }
            }
        });

        if (newAchievements.length > 0) {
            this.showAchievementNotification(newAchievements);
            this.updateDisplay();
        }
    }

    unlockAchievement(achievementId) {
        if (!this.userAchievements.includes(achievementId)) {
            this.userAchievements.push(achievementId);
            localStorage.setItem('userAchievements', JSON.stringify(this.userAchievements));

            const achievement = this.achievements.find(a => a.id === achievementId);
            if (achievement && window.ecoScanApp) {
                window.ecoScanApp.addPoints(achievement.points, `достижение "${achievement.name}"`);
            }
        }
    }

    showAchievementNotification(achievements) {
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                this.createAchievementModal(achievement);
            }, index * 1000);
        });
    }

    createAchievementModal(achievement) {
        const modal = document.createElement('div');
        modal.className = 'achievement-modal';
        modal.innerHTML = `
            <div class="achievement-modal-content">
                <div class="achievement-celebration">
                    <div class="celebration-icon">
                        <i class="fas ${achievement.icon}" style="color: ${achievement.color}"></i>
                    </div>
                    <h2>Поздравляем!</h2>
                    <h3>${achievement.name}</h3>
                    <p>${achievement.description}</p>
                    <div class="points-earned">
                        <i class="fas fa-star"></i>
                        <span>+${achievement.points} очков</span>
                    </div>
                    <button class="btn btn-primary close-achievement">Отлично!</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Анимация появления
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Обработчик закрытия
        const closeBtn = modal.querySelector('.close-achievement');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        });

        // Автозакрытие через 5 секунд
        setTimeout(() => {
            if (modal.parentNode) {
                closeBtn.click();
            }
        }, 5000);
    }

    canClaimReward(reward) {
        const userPoints = window.ecoScanApp ? window.ecoScanApp.userPoints : 0;
        return userPoints >= reward.cost;
    }

    claimReward(rewardId) {
        const reward = this.rewards.find(r => r.id === rewardId);
        if (!reward) return;

        if (!this.canClaimReward(reward)) {
            if (window.ecoScanApp) {
                window.ecoScanApp.showNotification('Недостаточно очков для получения награды', 'warning');
            }
            return;
        }

        // Списать очки
        if (window.ecoScanApp) {
            window.ecoScanApp.userPoints -= reward.cost;
            localStorage.setItem('ecoPoints', window.ecoScanApp.userPoints.toString());
            window.ecoScanApp.updateUserInterface();
        }

        // Показать код скидки или подтверждение
        this.showRewardCode(reward);

        // Обновить отображение наград
        this.displayRewards();
    }

    showRewardCode(reward) {
        const modal = document.createElement('div');
        modal.className = 'reward-modal';
        modal.innerHTML = `
            <div class="reward-modal-content">
                <div class="reward-success">
                    <i class="fas fa-check-circle"></i>
                    <h2>Награда получена!</h2>
                    <h3>${reward.name}</h3>
                    <div class="promo-code">
                        <label>Промокод:</label>
                        <div class="code-container">
                            <span class="code">${this.generatePromoCode()}</span>
                            <button class="copy-code" onclick="navigator.clipboard.writeText(this.previousElementSibling.textContent)">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    <p class="reward-instructions">${reward.instructions}</p>
                    <div class="partner-info">
                        <strong>Партнер:</strong> ${reward.partner}
                    </div>
                    <button class="btn btn-primary close-reward">Закрыть</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Анимация появления
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Обработчик закрытия
        const closeBtn = modal.querySelector('.close-reward');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        });

        // Уведомление о копировании
        const copyBtn = modal.querySelector('.copy-code');
        copyBtn.addEventListener('click', () => {
            if (window.ecoScanApp) {
                window.ecoScanApp.showNotification('Промокод скопирован!', 'success');
            }
        });
    }

    generatePromoCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'ECO';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    getCurrentStreak() {
        // Получить текущую серию дней подряд сканирований
        const lastScanDate = localStorage.getItem('lastScanDate');
        const today = new Date().toDateString();
        
        if (!lastScanDate || lastScanDate !== today) {
            return parseInt(localStorage.getItem('currentStreak') || '0');
        }
        
        return parseInt(localStorage.getItem('currentStreak') || '0') + 1;
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastScanDate = localStorage.getItem('lastScanDate');
        
        if (lastScanDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastScanDate === yesterday.toDateString()) {
                // Продолжить серию
                const currentStreak = parseInt(localStorage.getItem('currentStreak') || '0') + 1;
                localStorage.setItem('currentStreak', currentStreak.toString());
            } else {
                // Начать новую серию
                localStorage.setItem('currentStreak', '1');
            }
            
            localStorage.setItem('lastScanDate', today);
        }
    }

    initAchievements() {
        return [
            {
                id: 'first_scan',
                name: 'Первый шаг',
                description: 'Выполните первое сканирование',
                icon: 'fa-camera',
                color: '#4CAF50',
                type: 'scans',
                target: 1,
                points: 50
            },
            {
                id: 'scan_10',
                name: 'Начинающий эколог',
                description: 'Просканируйте 10 объектов',
                icon: 'fa-seedling',
                color: '#8BC34A',
                type: 'scans',
                target: 10,
                points: 100
            },
            {
                id: 'scan_50',
                name: 'Эко-энтузиаст',
                description: 'Просканируйте 50 объектов',
                icon: 'fa-leaf',
                color: '#689F38',
                type: 'scans',
                target: 50,
                points: 250
            },
            {
                id: 'scan_100',
                name: 'Мастер переработки',
                description: 'Просканируйте 100 объектов',
                icon: 'fa-recycle',
                color: '#558B2F',
                type: 'scans',
                target: 100,
                points: 500
            },
            {
                id: 'points_500',
                name: 'Коллекционер очков',
                description: 'Накопите 500 очков',
                icon: 'fa-coins',
                color: '#FFB300',
                type: 'points',
                target: 500,
                points: 100
            },
            {
                id: 'points_1000',
                name: 'Эко-миллионер',
                description: 'Накопите 1000 очков',
                icon: 'fa-gem',
                color: '#FF8F00',
                type: 'points',
                target: 1000,
                points: 200
            },
            {
                id: 'streak_7',
                name: 'Неделя активности',
                description: 'Сканируйте 7 дней подряд',
                icon: 'fa-calendar-check',
                color: '#E91E63',
                type: 'streak',
                target: 7,
                points: 300
            },
            {
                id: 'level_5',
                name: 'Опытный эколог',
                description: 'Достигните 5 уровня',
                icon: 'fa-award',
                color: '#9C27B0',
                type: 'level',
                target: 5,
                points: 400
            },
            {
                id: 'level_10',
                name: 'Эко-мастер',
                description: 'Достигните 10 уровня',
                icon: 'fa-crown',
                color: '#673AB7',
                type: 'level',
                target: 10,
                points: 800
            }
        ];
    }

    initRewards() {
        return [
            {
                id: 'coffee_discount',
                name: 'Скидка 10% на кофе',
                description: 'Скидка в кофейнях-партнерах',
                icon: 'fa-coffee',
                partner: 'Coffee House',
                cost: 100,
                instructions: 'Покажите промокод кассиру для получения скидки'
            },
            {
                id: 'eco_bag',
                name: 'Эко-сумка',
                description: 'Многоразовая сумка из переработанных материалов',
                icon: 'fa-shopping-bag',
                partner: 'EcoStore',
                cost: 200,
                instructions: 'Используйте промокод при оформлении заказа на сайте'
            },
            {
                id: 'plant_seeds',
                name: 'Семена растений',
                description: 'Набор семян для домашнего сада',
                icon: 'fa-seedling',
                partner: 'GreenGarden',
                cost: 150,
                instructions: 'Обменяйте промокод в любом магазине сети'
            },
            {
                id: 'book_discount',
                name: 'Скидка 15% на книги',
                description: 'Скидка на книги об экологии',
                icon: 'fa-book',
                partner: 'BookWorld',
                cost: 120,
                instructions: 'Введите промокод в поле "Скидка" при оформлении заказа'
            },
            {
                id: 'bike_rental',
                name: '2 часа проката велосипеда',
                description: 'Бесплатный прокат в системе городских велосипедов',
                icon: 'fa-bicycle',
                partner: 'CityBike',
                cost: 300,
                instructions: 'Активируйте промокод в мобильном приложении'
            },
            {
                id: 'gym_trial',
                name: 'Пробная тренировка',
                description: 'Бесплатное посещение фитнес-клуба',
                icon: 'fa-dumbbell',
                partner: 'EcoFit',
                cost: 180,
                instructions: 'Запишитесь на тренировку и покажите промокод администратору'
            },
            {
                id: 'restaurant_discount',
                name: 'Скидка 20% в ресторане',
                description: 'Скидка на органическую еду',
                icon: 'fa-utensils',
                partner: 'GreenFood',
                cost: 400,
                instructions: 'Покажите промокод официанту при заказе'
            },
            {
                id: 'movie_ticket',
                name: 'Билет в кино',
                description: 'Бесплатный билет на эко-документальный фильм',
                icon: 'fa-film',
                partner: 'CinemaWorld',
                cost: 250,
                instructions: 'Обменяйте промокод в кассе кинотеатра'
            }
        ];
    }
}

// Добавить стили для достижений и наград
const achievementStyles = document.createElement('style');
achievementStyles.textContent = `
    .achievement-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    
    .achievement-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    }
    
    .achievement-card.locked {
        opacity: 0.6;
        filter: grayscale(50%);
    }
    
    .achievement-icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
    }
    
    .achievement-card h4 {
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }
    
    .achievement-description {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin-bottom: 1rem;
    }
    
    .achievement-progress {
        margin-bottom: 1rem;
    }
    
    .progress-bar {
        width: 100%;
        height: 8px;
        background: var(--border-color);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }
    
    .progress-fill {
        height: 100%;
        background: var(--primary-color);
        transition: width 0.3s ease;
    }
    
    .progress-text {
        font-size: 0.8rem;
        color: var(--text-secondary);
        font-weight: bold;
    }
    
    .achievement-reward {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: var(--primary-color);
        font-weight: bold;
    }
    
    .achievement-badge {
        position: absolute;
        top: 1rem;
        right: 1rem;
        width: 24px;
        height: 24px;
        background: var(--success-color);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    .reward-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
    }
    
    .reward-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }
    
    .reward-icon {
        width: 60px;
        height: 60px;
        background: var(--primary-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        flex-shrink: 0;
    }
    
    .reward-info {
        flex: 1;
    }
    
    .reward-info h4 {
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }
    
    .reward-info p {
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
    }
    
    .reward-partner {
        font-size: 0.8rem;
        color: var(--primary-color);
        font-weight: bold;
    }
    
    .partner-logo {
        background: var(--accent-color);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
    }
    
    .reward-cost {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: bold;
        color: var(--primary-color);
        margin-right: 1rem;
    }
    
    .cost-amount {
        font-size: 1.2rem;
    }
    
    .no-rewards {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--text-secondary);
    }
    
    .no-rewards i {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    
    .achievement-modal, .reward-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 1rem;
    }
    
    .achievement-modal.show, .reward-modal.show {
        opacity: 1;
    }
    
    .achievement-modal-content, .reward-modal-content {
        background: white;
        border-radius: 16px;
        padding: 2rem;
        text-align: center;
        max-width: 400px;
        width: 100%;
        transform: scale(0.8);
        transition: transform 0.3s ease;
    }
    
    .achievement-modal.show .achievement-modal-content,
    .reward-modal.show .reward-modal-content {
        transform: scale(1);
    }
    
    .celebration-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        animation: celebration 0.6s ease;
    }
    
    @keyframes celebration {
        0% { transform: scale(0) rotate(0deg); }
        50% { transform: scale(1.2) rotate(180deg); }
        100% { transform: scale(1) rotate(360deg); }
    }
    
    .achievement-celebration h2 {
        color: var(--success-color);
        margin-bottom: 0.5rem;
    }
    
    .achievement-celebration h3 {
        color: var(--primary-color);
        margin-bottom: 1rem;
    }
    
    .points-earned {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background: var(--accent-color);
        color: white;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        font-size: 1.2rem;
        font-weight: bold;
    }
    
    .reward-success i {
        font-size: 3rem;
        color: var(--success-color);
        margin-bottom: 1rem;
    }
    
    .promo-code {
        margin: 1.5rem 0;
    }
    
    .promo-code label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
        color: var(--text-primary);
    }
    
    .code-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--background-color);
        padding: 1rem;
        border-radius: 8px;
        border: 2px dashed var(--primary-color);
    }
    
    .code {
        flex: 1;
        font-family: 'Courier New', monospace;
        font-size: 1.2rem;
        font-weight: bold;
        color: var(--primary-color);
        letter-spacing: 2px;
    }
    
    .copy-code {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.5rem;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.3s ease;
    }
    
    .copy-code:hover {
        background: var(--secondary-color);
    }
    
    .reward-instructions {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin: 1rem 0;
        line-height: 1.6;
    }
    
    .partner-info {
        background: var(--background-color);
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
        .reward-card {
            flex-direction: column;
            text-align: center;
        }
        
        .reward-cost {
            margin-right: 0;
            margin-bottom: 1rem;
        }
    }
`;
document.head.appendChild(achievementStyles);

// Экспорт класса
window.AchievementManager = AchievementManager;
