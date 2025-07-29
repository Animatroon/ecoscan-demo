// AI-сканер для реального анализа изображений отходов
class AIScanner {
    constructor() {
        this.model = null;
        this.isModelLoaded = false;
        this.wasteMapping = this.initWasteMapping();
        this.loadingIndicator = null;
        this.init();
    }

    async init() {
        this.showLoadingIndicator('Загрузка AI модели...');
        await this.loadModel();
    }

    async loadModel() {
        try {
            console.log('🧠 Загрузка AI модели MobileNet...');
            this.model = await mobilenet.load();
            this.isModelLoaded = true;
            console.log('✅ AI модель загружена успешно!');
            
            this.hideLoadingIndicator();
            this.updateScanButton();
            
            if (window.ecoScanApp) {
                window.ecoScanApp.showNotification('🤖 AI сканер готов к работе!', 'success');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки модели:', error);
            this.hideLoadingIndicator();
            this.fallbackToMockData();
        }
    }

    showLoadingIndicator(message) {
        if (this.loadingIndicator) return;
        
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.className = 'ai-loading-indicator';
        this.loadingIndicator.innerHTML = `
            <div class="loading-content">
                <div class="ai-brain-icon">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="loading-text">${message}</div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>
        `;
        document.body.appendChild(this.loadingIndicator);
    }

    hideLoadingIndicator() {
        if (this.loadingIndicator) {
            this.loadingIndicator.remove();
            this.loadingIndicator = null;
        }
    }

    updateScanButton() {
        const scanButton = document.querySelector('.capture-btn');
        if (scanButton && this.isModelLoaded) {
            const originalHTML = scanButton.innerHTML;
            scanButton.innerHTML = '<i class="fas fa-brain"></i> AI Сканирование';
            scanButton.classList.add('ai-enabled');
        }
    }

    initWasteMapping() {
        return {
            // ПЛАСТИКОВЫЕ БУТЫЛКИ - специфичные ключевые слова
            'water bottle': 'plastic_bottle',
            'plastic bottle': 'plastic_bottle',
            'beverage bottle': 'plastic_bottle',
            'soda bottle': 'plastic_bottle',
            'cola bottle': 'plastic_bottle',
            'juice bottle': 'plastic_bottle',
            'milk bottle': 'plastic_bottle',
            'drink bottle': 'plastic_bottle',
            'detergent bottle': 'plastic_bottle',
            'shampoo bottle': 'plastic_bottle',
            'lotion bottle': 'plastic_bottle',
            'sports bottle': 'plastic_bottle',
            'squeeze bottle': 'plastic_bottle',
            'spray bottle': 'plastic_bottle',
            
            // СТЕКЛЯННЫЕ ИЗДЕЛИЯ - четко отделяем
            'glass bottle': 'glass_bottle',
            'wine bottle': 'glass_bottle',
            'beer bottle': 'glass_bottle',
            'liquor bottle': 'glass_bottle',
            'vodka bottle': 'glass_bottle',
            'whiskey bottle': 'glass_bottle',
            'perfume bottle': 'glass_bottle',
            'medicine bottle': 'glass_bottle',
            'glass jar': 'glass_bottle',
            'jar': 'glass_bottle',
            'mason jar': 'glass_bottle',
            'pickle jar': 'glass_bottle',
            'jam jar': 'glass_bottle',
            
            // МЕТАЛЛИЧЕСКИЕ БАНКИ - четкие определения
            'aluminum can': 'metal_can',
            'soda can': 'metal_can',
            'beer can': 'metal_can',
            'beverage can': 'metal_can',
            'food can': 'metal_can',
            'soup can': 'metal_can',
            'tomato can': 'metal_can',
            'tuna can': 'metal_can',
            'cat food can': 'metal_can',
            'dog food can': 'metal_can',
            'spray can': 'metal_can',
            'aerosol can': 'metal_can',
            
            // БУМАЖНЫЕ ИЗДЕЛИЯ
            'paper': 'paper',
            'newspaper': 'paper',
            'magazine': 'paper',
            'book': 'paper',
            'notebook': 'paper',
            'cardboard': 'paper',
            'cardboard box': 'paper',
            'pizza box': 'paper',
            'cereal box': 'paper',
            'tissue': 'paper',
            'napkin': 'paper',
            'toilet paper': 'paper',
            'paper towel': 'paper',
            'envelope': 'paper',
            'letter': 'paper',
            'document': 'paper',
            'receipt': 'paper',
            
            // ЭЛЕКТРОНИКА
            'cell phone': 'electronics',
            'smartphone': 'electronics',
            'mobile phone': 'electronics',
            'cellular telephone': 'electronics',
            'laptop': 'electronics',
            'computer': 'electronics',
            'tablet': 'electronics',
            'monitor': 'electronics',
            'keyboard': 'electronics',
            'mouse': 'electronics',
            'camera': 'electronics',
            'headphones': 'electronics',
            'earphones': 'electronics',
            'television': 'electronics',
            'tv': 'electronics',
            'radio': 'electronics',
            'calculator': 'electronics',
            'game console': 'electronics',
            'remote control': 'electronics',
            
            // БАТАРЕЙКИ
            'battery': 'battery',
            'batteries': 'battery',
            'power bank': 'battery',
            'rechargeable battery': 'battery',
            'lithium battery': 'battery',
            'alkaline battery': 'battery',
            
            // ОРГАНИЧЕСКИЕ ОТХОДЫ
            'apple': 'organic_waste',
            'banana': 'organic_waste',
            'orange': 'organic_waste',
            'fruit': 'organic_waste',
            'vegetable': 'organic_waste',
            'food': 'organic_waste',
            'bread': 'organic_waste',
            'egg': 'organic_waste',
            'eggshell': 'organic_waste',
            'coffee grounds': 'organic_waste',
            'tea bag': 'organic_waste',
            'pizza': 'organic_waste',
            'sandwich': 'organic_waste',
            'salad': 'organic_waste',
            'peel': 'organic_waste',
            'banana peel': 'organic_waste',
            'orange peel': 'organic_waste',
            'potato peel': 'organic_waste',
            'carrot': 'organic_waste',
            'tomato': 'organic_waste',
            'onion': 'organic_waste',
            'lettuce': 'organic_waste',
            'cabbage': 'organic_waste'
        };
    }

    async analyzeImage(imageElement) {
        if (!this.isModelLoaded) {
            console.log('⚠️ Модель еще не загружена, используем демо-режим');
            return this.fallbackAnalysis();
        }

        try {
            console.log('🔍 Анализ изображения с помощью AI...');
            
            // Подготавливаем изображение для анализа
            const processedImage = this.preprocessImage(imageElement);
            
            // Получаем предсказания от модели
            const predictions = await this.model.classify(processedImage);
            console.log('🤖 AI предсказания:', predictions);

            // Анализируем результаты
            const wasteAnalysis = this.analyzeWastePredictions(predictions);
            
            return {
                success: wasteAnalysis.success,
                wasteType: wasteAnalysis.wasteType,
                confidence: wasteAnalysis.confidence,
                predictions: predictions.slice(0, 5),
                analysis: wasteAnalysis.analysis,
                isAI: true,
                message: wasteAnalysis.message
            };
            
        } catch (error) {
            console.error('❌ Ошибка AI анализа:', error);
            return this.fallbackAnalysis();
        }
    }

    preprocessImage(imageElement) {
        // Создаем canvas для предобработки изображения
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Устанавливаем размеры для оптимального анализа
        const targetSize = 224; // MobileNet принимает 224x224
        canvas.width = targetSize;
        canvas.height = targetSize;
        
        // Рисуем и масштабируем изображение
        ctx.drawImage(imageElement, 0, 0, targetSize, targetSize);
        
        return canvas;
    }

    analyzeWastePredictions(predictions) {
        const wasteResults = [];
        let bestMatch = null;
        let maxConfidence = 0;

        // Сначала анalizируем каждое предсказание
        for (const prediction of predictions) {
            const className = prediction.className.toLowerCase();
            const probability = prediction.probability;
            
            console.log(`🔍 Анализируем: "${className}" с вероятностью ${(probability * 100).toFixed(1)}%`);
            
            // Ищем прямые совпадения
            if (this.wasteMapping[className]) {
                const wasteType = this.wasteMapping[className];
                wasteResults.push({
                    wasteType,
                    confidence: probability,
                    match: 'direct',
                    originalClass: prediction.className
                });
                
                if (probability > maxConfidence) {
                    maxConfidence = probability;
                    bestMatch = { wasteType, confidence: probability, originalClass: prediction.className };
                }
                console.log(`✅ Прямое совпадение: ${className} -> ${wasteType}`);
            } else {
                // Ищем частичные совпадения с улучшенной логикой
                const partialMatch = this.findBestPartialMatch(className, probability);
                if (partialMatch) {
                    wasteResults.push(partialMatch);
                    if (partialMatch.confidence > maxConfidence) {
                        maxConfidence = partialMatch.confidence;
                        bestMatch = partialMatch;
                    }
                    console.log(`🔄 Частичное совпадение: ${className} -> ${partialMatch.wasteType}`);
                }
            }
        }

        // Дополнительная логика для улучшения точности
        if (bestMatch) {
            bestMatch = this.refineWasteClassification(bestMatch, predictions);
        }

        // Если найдены совпадения с хорошей уверенностью
        if (bestMatch && maxConfidence > 0.15) {
            console.log(`🎯 Финальный результат: ${bestMatch.wasteType} с уверенностью ${(maxConfidence * 100).toFixed(1)}%`);
            return {
                success: true,
                wasteType: bestMatch.wasteType,
                confidence: maxConfidence,
                analysis: wasteResults,
                message: `Обнаружен тип отходов: ${this.getWasteTypeName(bestMatch.wasteType)}`
            };
        }

        // Если объект не является мусором
        if (predictions.length > 0 && this.isNonWasteObject(predictions[0].className)) {
            return {
                success: false,
                wasteType: null,
                confidence: predictions[0].probability,
                analysis: [],
                message: `Обнаружен объект "${predictions[0].className}", но это не мусор. Попробуйте сфотографировать отходы для переработки.`
            };
        }

        // Если ничего подходящего не найдено
        console.log(`❌ Не удалось определить тип отходов из предсказаний:`, predictions.map(p => p.className));
        return {
            success: false,
            wasteType: null,
            confidence: predictions[0]?.probability || 0,
            analysis: wasteResults,
            message: 'Не удалось определить тип отходов. Попробуйте сфотографировать объект ближе или при лучшем освещении.'
        };
    }

    findBestPartialMatch(className, probability) {
        let bestMatch = null;
        let bestScore = 0;

        // Проверяем каждый ключ в маппинге
        for (const [key, wasteType] of Object.entries(this.wasteMapping)) {
            let score = 0;
            
            // Прямое вхождение
            if (className.includes(key) || key.includes(className)) {
                score = 0.8;
            }
            
            // Проверяем ключевые слова для более точного определения
            if (this.checkKeywordMatch(className, key, wasteType)) {
                score = Math.max(score, 0.9);
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = {
                    wasteType,
                    confidence: probability * score,
                    match: 'partial',
                    originalClass: className
                };
            }
        }

        return bestScore > 0.3 ? bestMatch : null;
    }

    checkKeywordMatch(className, mappingKey, wasteType) {
        // Специальные правила для более точного определения
        
        // Пластиковые бутылки
        if (wasteType === 'plastic_bottle') {
            return className.includes('bottle') && 
                   (className.includes('plastic') || 
                    className.includes('water') || 
                    className.includes('soda') || 
                    className.includes('juice') ||
                    className.includes('drink'));
        }
        
        // Стеклянные бутылки
        if (wasteType === 'glass_bottle') {
            return className.includes('bottle') && 
                   (className.includes('glass') || 
                    className.includes('wine') || 
                    className.includes('beer') || 
                    className.includes('vodka')) ||
                   className.includes('jar');
        }
        
        // Металлические банки
        if (wasteType === 'metal_can') {
            return className.includes('can') && 
                   (className.includes('aluminum') || 
                    className.includes('metal') || 
                    className.includes('soda') || 
                    className.includes('beer') ||
                    className.includes('food'));
        }
        
        return false;
    }

    refineWasteClassification(match, allPredictions) {
        // Дополнительная проверка для уточнения классификации
        const className = match.originalClass.toLowerCase();
        
        // Если видим "bottle", проверяем контекст
        if (className.includes('bottle')) {
            // Ищем указания на материал в других предсказаниях
            for (const pred of allPredictions) {
                const predClass = pred.className.toLowerCase();
                if (predClass.includes('glass') || predClass.includes('wine') || predClass.includes('beer')) {
                    if (match.wasteType === 'plastic_bottle') {
                        console.log(`🔄 Переклассификация: ${className} -> glass_bottle (найдено: ${predClass})`);
                        return {
                            ...match,
                            wasteType: 'glass_bottle',
                            originalClass: pred.className
                        };
                    }
                }
                if (predClass.includes('plastic') || predClass.includes('water') || predClass.includes('soda')) {
                    if (match.wasteType === 'glass_bottle') {
                        console.log(`🔄 Переклассификация: ${className} -> plastic_bottle (найдено: ${predClass})`);
                        return {
                            ...match,
                            wasteType: 'plastic_bottle',
                            originalClass: pred.className
                        };
                    }
                }
            }
        }

        return match;
    }

    // Продолжение analyzeWastePredictions после вспомогательных функций
    // Остальная часть логики будет здесь...
            return {
                success: true,
                wasteType: bestMatch.wasteType,
                confidence: maxConfidence,
                analysis: wasteResults,
                message: `Обнаружен тип отходов: ${this.getWasteTypeName(bestMatch.wasteType)}`
            };
        }

        // Если объект не является мусором
        if (predictions.length > 0 && this.isNonWasteObject(predictions[0].className)) {
            return {
                success: false,
                wasteType: null,
                confidence: predictions[0].probability,
                analysis: [],
                message: `Обнаружен объект "${predictions[0].className}", но это не мусор. Попробуйте сфотографировать отходы для переработки.`
            };
        }

        // Если ничего подходящего не найдено
        return {
            success: false,
            wasteType: null,
            confidence: predictions[0]?.probability || 0,
            analysis: wasteResults,
            message: 'Не удалось определить тип отходов. Попробуйте сфотографировать объект ближе или при лучшем освещении.'
        };
    }

    getWasteTypeName(wasteType) {
        const names = {
            'plastic_bottle': 'Пластиковая бутылка',
            'glass_bottle': 'Стеклянная бутылка',
            'paper': 'Бумага',
            'metal_can': 'Металлическая банка',
            'battery': 'Батарейка',
            'electronics': 'Электроника',
            'organic_waste': 'Органические отходы'
        };
        return names[wasteType] || wasteType;
    }

    isNonWasteObject(className) {
        const nonWasteObjects = [
            'person', 'car', 'dog', 'cat', 'tree', 'house', 'building', 
            'sky', 'cloud', 'grass', 'flower', 'chair', 'table', 'sofa',
            'bed', 'door', 'window', 'wall', 'ceiling', 'floor'
        ];
        
        return nonWasteObjects.some(obj => 
            className.toLowerCase().includes(obj)
        );
    }

    fallbackAnalysis() {
        // Демо-режим с случайными данными
        const wasteTypes = ['glass_bottle', 'plastic_bottle', 'paper', 'metal_can', 'battery', 'electronics', 'organic_waste'];
        const randomType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
        
        return {
            success: true,
            wasteType: randomType,
            confidence: Math.random() * 0.4 + 0.6, // 60-100%
            predictions: [],
            analysis: [],
            message: 'Демо-режим: AI модель недоступна, используются тестовые данные',
            isAI: false
        };
    }

    fallbackToMockData() {
        console.log('⚠️ Переключение на демо-режим');
        this.isModelLoaded = false;
        
        const scanButton = document.querySelector('.capture-btn');
        if (scanButton) {
            scanButton.innerHTML = '<i class="fas fa-camera"></i> Демо-сканирование';
            scanButton.classList.remove('ai-enabled');
            scanButton.classList.add('demo-mode');
        }
        
        if (window.ecoScanApp) {
            window.ecoScanApp.showNotification('⚠️ AI недоступен, работаем в демо-режиме', 'warning');
        }
    }

    // Метод для анализа с камеры
    async analyzeFromCamera() {
        const video = document.getElementById('camera-preview');
        if (!video) {
            return this.fallbackAnalysis();
        }

        // Создаем canvas для захвата кадра
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Рисуем текущий кадр
        ctx.drawImage(video, 0, 0);
        
        // Создаем изображение для анализа
        return new Promise((resolve) => {
            canvas.toBlob(async (blob) => {
                const img = new Image();
                img.onload = async () => {
                    const result = await this.analyzeImage(img);
                    resolve(result);
                };
                img.src = URL.createObjectURL(blob);
            });
        });
    }

    // Метод для анализа загруженного файла
    async analyzeFromFile(file) {
        return new Promise((resolve) => {
            const img = new Image();
            const reader = new FileReader();
            
            reader.onload = (e) => {
                img.onload = async () => {
                    const result = await this.analyzeImage(img);
                    resolve(result);
                };
                img.src = e.target.result;
            };
            
            reader.readAsDataURL(file);
        });
    }

    getModelStatus() {
        return {
            isLoaded: this.isModelLoaded,
            modelType: this.isModelLoaded ? 'MobileNet v2 (TensorFlow.js)' : 'Демо-режим',
            supportedTypes: Object.keys(this.wasteMapping).length + ' типов объектов'
        };
    }
}

// CSS стили для AI индикатора
const aiStyles = document.createElement('style');
aiStyles.textContent = `
    .ai-loading-indicator {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    }

    .loading-content {
        background: white;
        padding: 2rem;
        border-radius: 20px;
        text-align: center;
        max-width: 300px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .ai-brain-icon {
        font-size: 3rem;
        color: var(--primary-color);
        margin-bottom: 1rem;
        animation: brainPulse 2s infinite;
    }

    @keyframes brainPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
    }

    .loading-text {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1.5rem;
    }

    .progress-bar {
        width: 100%;
        height: 6px;
        background: #f0f0f0;
        border-radius: 3px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
        animation: progressFill 3s infinite;
    }

    @keyframes progressFill {
        0% { width: 0%; }
        50% { width: 80%; }
        100% { width: 100%; }
    }

    .capture-btn.ai-enabled {
        background: linear-gradient(135deg, #4CAF50, #2E7D32);
        box-shadow: 0 4px 20px rgba(76, 175, 80, 0.4);
        position: relative;
    }

    .capture-btn.ai-enabled::after {
        content: 'AI';
        position: absolute;
        top: -8px;
        right: -8px;
        background: #FF5722;
        color: white;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 10px;
        font-weight: bold;
    }

    .capture-btn.demo-mode {
        background: linear-gradient(135deg, #FF9800, #F57C00);
        box-shadow: 0 4px 20px rgba(255, 152, 0, 0.4);
    }

    .ai-status {
        margin: 1rem 0;
        padding: 0.75rem;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .ai-indicator {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.95rem;
        font-weight: 600;
    }

    .ai-indicator.ai-active {
        color: #4CAF50;
    }

    .ai-indicator.ai-active i {
        animation: brainThink 3s infinite;
    }

    @keyframes brainThink {
        0%, 100% { color: #4CAF50; }
        50% { color: #2E7D32; }
    }

    .ai-indicator.ai-inactive {
        color: #FF9800;
    }

    .ai-predictions {
        margin-top: 1rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .ai-predictions h4 {
        margin-bottom: 0.75rem;
        color: var(--text-primary);
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .predictions-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .prediction-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        font-size: 0.85rem;
        border-left: 3px solid var(--primary-color);
    }

    .prediction-name {
        color: var(--text-primary);
        text-transform: capitalize;
        font-weight: 500;
    }

    .prediction-confidence {
        color: var(--primary-color);
        font-weight: bold;
        padding: 2px 8px;
        background: rgba(76, 175, 80, 0.2);
        border-radius: 12px;
    }

    .confidence-high {
        background: rgba(76, 175, 80, 0.2);
        color: #4CAF50;
    }

    .confidence-medium {
        background: rgba(255, 152, 0, 0.2);
        color: #FF9800;
    }

    .confidence-low {
        background: rgba(244, 67, 54, 0.2);
        color: #F44336;
    }
`;
document.head.appendChild(aiStyles);

// Экспорт класса
window.AIScanner = AIScanner;
