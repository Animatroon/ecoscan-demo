// Модуль идентификации и классификации отходов
class WasteScanner {
    constructor() {
        this.camera = null;
        this.canvas = null;
        this.context = null;
        this.isScanning = false;
        this.wasteDatabase = this.initWasteDatabase();
        this.aiScanner = null; // Будет инициализирован позже
        this.init();
    }

    init() {
        this.setupCamera();
        this.setupCanvas();
        this.bindEvents();
        this.initAIScanner();
        
        // Инициализируем камеру
        this.initCamera();
    }

    async initAIScanner() {
        // Ждем, пока загрузится TensorFlow.js
        if (typeof tf !== 'undefined' && typeof mobilenet !== 'undefined') {
            this.aiScanner = new AIScanner();
        } else {
            // Ждем немного и пробуем снова
            setTimeout(() => this.initAIScanner(), 1000);
        }
    }

    setupCamera() {
        this.camera = document.getElementById('camera-preview');
        if (!this.camera) {
            console.error('Camera element not found');
            return;
        }
    }

    setupCanvas() {
        // Создать невидимый canvas для обработки изображений
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.canvas.style.display = 'none';
        document.body.appendChild(this.canvas);
    }

    bindEvents() {
        const captureBtn = document.getElementById('capture-btn');
        const scanAgainBtn = document.getElementById('scan-again-btn');

        if (captureBtn) {
            captureBtn.addEventListener('click', () => {
                this.captureAndAnalyze();
            });
        }

        if (scanAgainBtn) {
            scanAgainBtn.addEventListener('click', () => {
                this.resetScan();
            });
        }
    }

    async initCamera() {
        try {
            console.log('🎥 Инициализация камеры...');
            
            // Проверяем доступность API
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API не поддерживается в этом браузере');
            }

            // Показываем уведомление о камере
            if (window.ecoScanApp) {
                window.ecoScanApp.showNotification('📹 Запрашиваем доступ к камере...', 'info');
            }

            // Запросить доступ к камере с упрощенными настройками
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

            if (this.camera) {
                this.camera.srcObject = stream;
                
                // Ждем, пока видео загрузится
                return new Promise((resolve, reject) => {
                    this.camera.onloadedmetadata = () => {
                        this.camera.play()
                            .then(() => {
                                console.log('✅ Камера успешно инициализирована');
                                if (window.ecoScanApp) {
                                    window.ecoScanApp.showNotification('✅ Камера готова к работе!', 'success');
                                }
                                resolve();
                            })
                            .catch(reject);
                    };
                    
                    this.camera.onerror = (error) => {
                        console.error('Ошибка элемента video:', error);
                        reject(error);
                    };
                    
                    // Таймаут на случай, если видео не загрузится
                    setTimeout(() => reject(new Error('Таймаут загрузки видео')), 15000);
                });
            } else {
                throw new Error('Элемент camera-preview не найден');
            }

        } catch (error) {
            console.error('❌ Ошибка доступа к камере:', error);
            
            // Показываем уведомление об ошибке
            if (window.ecoScanApp) {
                window.ecoScanApp.showNotification('❌ Камера недоступна. Используйте демо-режим.', 'error');
            }
            
            this.showCameraError(error.message);
        }
    }

    showCameraError(errorMessage = 'Камера недоступна') {
        const cameraContainer = document.querySelector('.camera-container');
        if (cameraContainer) {
            let errorText = 'Проверьте разрешения браузера или используйте тестовый режим';
            let solutionText = '';
            
            if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
                errorText = 'Доступ к камере заблокирован';
                solutionText = '🔧 Решение: Нажмите на значок камеры в адресной строке и разрешите доступ';
            } else if (errorMessage.includes('NotFoundError')) {
                errorText = 'Камера не найдена на устройстве';
                solutionText = '🔧 Решение: Убедитесь, что камера подключена и работает';
            } else if (errorMessage.includes('NotReadableError')) {
                errorText = 'Камера занята другим приложением';
                solutionText = '🔧 Решение: Закройте другие приложения, использующие камеру';
            } else if (location.protocol === 'file:') {
                errorText = 'Для работы камеры требуется HTTP/HTTPS протокол';
                solutionText = '🔧 Решение: Запустите start-server.bat и откройте http://localhost:8000';
            }
            
            cameraContainer.innerHTML = `
                <div class="camera-error">
                    <i class="fas fa-camera-slash"></i>
                    <h3>📷 Камера недоступна</h3>
                    <p>${errorText}</p>
                    ${solutionText ? `<div class="solution-text">${solutionText}</div>` : ''}
                    <div class="error-details">
                        <small>Техническая информация: ${errorMessage}</small>
                    </div>
                    
                    <div class="camera-troubleshooting">
                        <h4>💡 Возможные решения:</h4>
                        <ul>
                            <li>🔄 Обновите страницу (F5)</li>
                            <li>🔒 Разрешите доступ к камере в браузере</li>
                            <li>🌐 Используйте HTTP сервер (start-server.bat)</li>
                            <li>📱 Попробуйте другой браузер (Chrome, Firefox)</li>
                            <li>🎯 Убедитесь, что камера не занята</li>
                        </ul>
                    </div>
                    
                    <div class="action-buttons">
                        <button id="retry-camera-btn" class="btn btn-secondary">
                            <i class="fas fa-redo"></i>
                            Попробовать снова
                        </button>
                        <button id="demo-scan-btn" class="btn btn-primary">
                            <i class="fas fa-play"></i>
                            Демо сканирование
                        </button>
                        <button id="test-camera-btn" class="btn btn-info">
                            <i class="fas fa-tools"></i>
                            Тест камеры
                        </button>
                    </div>
                </div>
            `;

            // Добавить обработчики
            const demoBtn = document.getElementById('demo-scan-btn');
            if (demoBtn) {
                demoBtn.addEventListener('click', () => {
                    this.runDemoScan();
                });
            }
            
            const retryBtn = document.getElementById('retry-camera-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    location.reload(); // Простое обновление страницы
                });
            }
            
            const testBtn = document.getElementById('test-camera-btn');
            if (testBtn) {
                testBtn.addEventListener('click', () => {
                    window.open('camera-test.html', '_blank');
                });
            }
        }
    }

    captureAndAnalyze() {
        if (this.isScanning) return;

        this.isScanning = true;
        this.showScanningState();

        // Захватить изображение с камеры
        this.captureImage()
            .then(imageData => this.analyzeWaste(imageData))
            .then(result => this.handleScanResult(result))
            .catch(error => this.handleScanError(error))
            .finally(() => {
                this.isScanning = false;
            });
    }

    captureImage() {
        return new Promise((resolve, reject) => {
            if (!this.camera || !this.canvas || !this.context) {
                reject(new Error('Camera or canvas not initialized'));
                return;
            }

            // Установить размеры canvas равными размерам видео
            this.canvas.width = this.camera.videoWidth;
            this.canvas.height = this.camera.videoHeight;

            // Нарисовать кадр из видео на canvas
            this.context.drawImage(this.camera, 0, 0);

            // Получить данные изображения
            const imageData = this.canvas.toDataURL('image/jpeg', 0.8);
            resolve(imageData);
        });
    }

    async analyzeWaste(imageData) {
        // Используем AI сканер если доступен
        if (this.aiScanner && this.aiScanner.isModelLoaded) {
            try {
                console.log('🤖 Используем AI анализ изображения...');
                const result = await this.aiScanner.analyzeFromCamera();
                
                // Получаем информацию из базы данных приложения
                const wasteInfo = result.wasteType ? window.ecoScanApp?.wasteDatabase[result.wasteType] : null;
                
                if (!result.success) {
                    return {
                        key: null,
                        name: 'Объект не определен',
                        type: 'Неизвестный тип',
                        material: 'Не определен',
                        instructions: ['Попробуйте сфотографировать объект ближе или при лучшем освещении'],
                        confidence: result.confidence,
                        image: imageData,
                        category: 'unknown',
                        recyclable: false,
                        hazardous: false,
                        isAI: result.isAI,
                        predictions: result.predictions,
                        analysis: result.analysis,
                        aiMessage: result.message,
                        success: false
                    };
                }
                
                return {
                    key: result.wasteType,
                    name: wasteInfo?.name || result.wasteType || 'Неизвестный тип',
                    type: wasteInfo?.name || result.wasteType || 'Неизвестный тип',
                    material: wasteInfo?.category || 'Неизвестный материал',
                    instructions: this.getRecyclingInstructions(result.wasteType),
                    confidence: result.confidence,
                    image: imageData,
                    category: result.wasteType || 'unknown',
                    recyclable: wasteInfo?.recyclable || false,
                    hazardous: false,
                    isAI: result.isAI,
                    predictions: result.predictions,
                    analysis: result.analysis,
                    aiMessage: result.message,
                    success: result.success
                };
            } catch (error) {
                console.error('❌ Ошибка AI анализа:', error);
                return this.fallbackAnalysis(imageData);
            }
        } else {
            console.log('⚠️ AI недоступен, используем демо-режим');
            return this.fallbackAnalysis(imageData);
        }
    }

    getRecyclingInstructions(wasteType) {
        const instructions = {
            'plastic_bottle': [
                'Снимите крышку и этикетку',
                'Ополосните бутылку водой',
                'Сожмите бутылку для экономии места',
                'Поместите в контейнер для пластика',
                'Крышку сдайте отдельно в пункт приема'
            ],
            'glass_bottle': [
                'Снимите крышку и этикетку',
                'Ополосните бутылку водой',
                'Сожмите бутылку для экономии места',
                'Поместите в контейнер для пластика',
                'Крышку сдайте отдельно в пункт приема'
            ],
            'paper': [
                'Удалите скрепки и пластиковые элементы',
                'Разорвите на мелкие части',
                'Поместите в синий контейнер для бумаги',
                'Не мочите бумагу',
                'Жирную бумагу утилизируйте отдельно'
            ],
            'metal_can': [
                'Ополосните банку от остатков',
                'Снимите этикетку если возможно',
                'Сплющите банку для экономии места',
                'Поместите в желтый контейнер для металла',
                'Алюминиевые банки особенно ценны для переработки'
            ],
            'battery': [
                'НЕ выбрасывайте в обычный мусор!',
                'Найдите специальный контейнер для батареек',
                'Сдайте в пункт приема опасных отходов',
                'Можно сдать в магазинах электроники',
                'Батарейки содержат токсичные вещества'
            ],
            'electronics': [
                'Удалите все личные данные',
                'Извлеките батареи отдельно',
                'Найдите пункт приема электроники',
                'Не разбирайте устройство самостоятельно',
                'Многие магазины принимают старую технику'
            ],
            'organic_waste': [
                'Используйте для компостирования',
                'Можно закопать в саду',
                'Добавьте в домашний компостер',
                'Не смешивайте с другими отходами',
                'Избегайте мясных и молочных остатков в компосте'
            ]
        };

        return instructions[wasteType] || ['Найдите специализированный пункт приема для этого типа отходов'];
    }

    fallbackAnalysis(imageData) {
        // Симуляция анализа изображения (демо-режим)
        const wasteTypes = Object.keys(this.wasteDatabase);
        const randomType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
        const wasteInfo = this.wasteDatabase[randomType];

        return {
            key: randomType,
            name: wasteInfo.name,
            type: wasteInfo.name,
            material: wasteInfo.material,
            instructions: wasteInfo.instructions,
            confidence: Math.random() * 0.3 + 0.7,
            image: imageData,
            category: randomType,
            recyclable: wasteInfo.recyclable,
            hazardous: wasteInfo.hazardous,
            isAI: false,
            predictions: [],
            analysis: [],
            aiMessage: 'Демо-режим: используются случайные данные',
            success: true
        };
    }

    simulateProcessing() {
        return new Promise(resolve => {
            // Имитация времени обработки ИИ
            setTimeout(resolve, 2000 + Math.random() * 3000);
        });
    }

    showScanningState() {
        const captureBtn = document.getElementById('capture-btn');
        if (captureBtn) {
            captureBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            captureBtn.disabled = true;
        }

        const scanInstruction = document.querySelector('.scan-instruction');
        if (scanInstruction) {
            scanInstruction.textContent = 'Анализируем изображение...';
        }
    }

    handleScanResult(result) {
        // Восстановить кнопку
        const captureBtn = document.getElementById('capture-btn');
        if (captureBtn) {
            captureBtn.innerHTML = '<i class="fas fa-camera"></i>';
            captureBtn.disabled = false;
        }

        const scanInstruction = document.querySelector('.scan-instruction');
        if (scanInstruction) {
            scanInstruction.textContent = 'Наведите камеру на объект для идентификации';
        }

        // Проверяем успешность AI анализа
        if (!result.success && result.isAI) {
            // Показываем сообщение об ошибке AI анализа
            if (window.ecoScanApp) {
                window.ecoScanApp.showNotification(result.aiMessage, 'warning');
            }
            return;
        }

        // Передать результат в основное приложение
        if (window.ecoScanApp) {
            window.ecoScanApp.handleScanResult(result);
        }

        console.log('Scan result:', result);
    }

    handleScanError(error) {
        console.error('Scan error:', error);
        
        // Восстановить UI
        const captureBtn = document.getElementById('capture-btn');
        if (captureBtn) {
            captureBtn.innerHTML = '<i class="fas fa-camera"></i>';
            captureBtn.disabled = false;
        }

        // Показать ошибку пользователю
        if (window.ecoScanApp) {
            window.ecoScanApp.showNotification('Ошибка при сканировании. Попробуйте еще раз.', 'error');
        }
    }

    resetScan() {
        // Скрыть результаты
        const scanResult = document.getElementById('scan-result');
        if (scanResult) {
            scanResult.classList.add('hidden');
        }

        // Сбросить состояние
        this.isScanning = false;
    }

    runDemoScan() {
        // Демонстрационное сканирование без камеры
        this.isScanning = true;
        this.showScanningState();

        // Создать демо изображение
        const demoImageData = this.createDemoImage();
        
        this.analyzeWaste(demoImageData)
            .then(result => this.handleScanResult(result))
            .catch(error => this.handleScanError(error))
            .finally(() => {
                this.isScanning = false;
            });
    }

    createDemoImage() {
        // Создать простое демо изображение
        this.canvas.width = 300;
        this.canvas.height = 300;
        
        // Нарисовать простую фигуру
        this.context.fillStyle = '#4CAF50';
        this.context.fillRect(0, 0, 300, 300);
        
        this.context.fillStyle = '#ffffff';
        this.context.font = '24px Arial';
        this.context.textAlign = 'center';
        this.context.fillText('DEMO', 150, 150);
        
        return this.canvas.toDataURL('image/jpeg', 0.8);
    }

    initWasteDatabase() {
        // База данных типов отходов и инструкций по утилизации
        return {
            plastic_bottle: {
                name: 'Пластиковая бутылка',
                material: 'ПЭТ пластик',
                recyclable: true,
                hazardous: false,
                instructions: [
                    'Снимите крышку и этикетку',
                    'Ополосните бутылку водой',
                    'Сожмите бутылку для экономии места',
                    'Поместите в контейнер для пластика',
                    'Крышку сдайте отдельно в пункт приема'
                ]
            },
            glass_bottle: {
                name: 'Стеклянная бутылка',
                material: 'Стекло',
                recyclable: true,
                hazardous: false,
                instructions: [
                    'Снимите все этикетки',
                    'Ополосните от остатков содержимого',
                    'Снимите металлические крышки',
                    'Поместите в контейнер для стекла',
                    'Будьте осторожны с острыми краями'
                ]
            },
            paper: {
                name: 'Бумага',
                material: 'Целлюлоза',
                recyclable: true,
                hazardous: false,
                instructions: [
                    'Удалите скрепки и скобы',
                    'Отделите пластиковые части',
                    'Не мочите бумагу',
                    'Поместите в контейнер для бумаги',
                    'Избегайте жирной и восковой бумаги'
                ]
            },
            metal_can: {
                name: 'Металлическая банка',
                material: 'Алюминий/Сталь',
                recyclable: true,
                hazardous: false,
                instructions: [
                    'Полностью освободите от содержимого',
                    'Ополосните водой',
                    'Снимите бумажные этикетки',
                    'Сплющите для экономии места',
                    'Поместите в контейнер для металла'
                ]
            },
            organic_waste: {
                name: 'Органические отходы',
                material: 'Биоразлагаемые материалы',
                recyclable: true,
                hazardous: false,
                instructions: [
                    'Отделите от упаковки',
                    'Измельчите крупные куски',
                    'Поместите в компостную яму или контейнер',
                    'Избегайте жирных и мясных отходов в компосте',
                    'Регулярно перемешивайте компост'
                ]
            },
            battery: {
                name: 'Батарейка',
                material: 'Токсичные металлы',
                recyclable: true,
                hazardous: true,
                instructions: [
                    'НЕ выбрасывайте в обычный мусор',
                    'Изолируйте контакты скотчем',
                    'Сдайте в специальный пункт приема батареек',
                    'Найдите ближайший магазин электроники',
                    'Батарейки содержат токсичные вещества'
                ]
            },
            electronics: {
                name: 'Электроника',
                material: 'Различные материалы',
                recyclable: true,
                hazardous: true,
                instructions: [
                    'Удалите все личные данные',
                    'Извлеките батареи отдельно',
                    'Сдайте в специализированный центр',
                    'Проверьте возможность ремонта',
                    'Не разбирайте самостоятельно'
                ]
            }
        };
    }

    // Получить информацию о типе отхода
    getWasteInfo(category) {
        return this.wasteDatabase[category] || null;
    }

    // Получить все доступные категории
    getAvailableCategories() {
        return Object.keys(this.wasteDatabase);
    }

    // Поиск по типу материала
    findByMaterial(material) {
        const results = [];
        for (const [key, value] of Object.entries(this.wasteDatabase)) {
            if (value.material.toLowerCase().includes(material.toLowerCase())) {
                results.push({ key, ...value });
            }
        }
        return results;
    }
}

// Добавить стили для ошибки камеры
const cameraStyles = document.createElement('style');
cameraStyles.textContent = `
    .camera-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: white;
        text-align: center;
        padding: 2rem;
    }
    
    .camera-error i {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.7;
    }
    
    .camera-error h3 {
        margin-bottom: 1rem;
        font-size: 1.5rem;
    }
    
    .camera-error p {
        margin-bottom: 2rem;
        opacity: 0.8;
        line-height: 1.6;
    }
    
    .error-details {
        margin: 1rem 0;
        padding: 0.5rem;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 6px;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.7);
    }
    
    .solution-text {
        background: rgba(76, 175, 80, 0.2);
        color: #81C784;
        padding: 0.75rem;
        border-radius: 8px;
        margin: 1rem 0;
        font-weight: 600;
    }
    
    .camera-troubleshooting {
        text-align: left;
        margin: 1.5rem 0;
        padding: 1rem;
        background: rgba(33, 150, 243, 0.1);
        border-radius: 8px;
        border-left: 4px solid #2196F3;
    }
    
    .camera-troubleshooting h4 {
        margin: 0 0 0.5rem 0;
        color: #2196F3;
        font-size: 1rem;
    }
    
    .camera-troubleshooting ul {
        margin: 0;
        padding-left: 1.5rem;
    }
    
    .camera-troubleshooting li {
        margin: 0.5rem 0;
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.9rem;
    }
    
    .action-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: center;
        margin-top: 1.5rem;
    }
    
    .action-buttons .btn {
        flex: 1;
        min-width: 120px;
        max-width: 200px;
    }
    
    .btn-info {
        background: #2196F3;
        color: white;
    }
    
    .btn-info:hover {
        background: #1976D2;
    }
`;
document.head.appendChild(cameraStyles);

// Экспорт класса
window.WasteScanner = WasteScanner;

// Создаем глобальный экземпляр для использования
window.wasteScanner = null;
