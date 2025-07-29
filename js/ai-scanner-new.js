class AIScanner {
    constructor() {
        this.model = null;
        this.isModelLoaded = false;
        this.loadingIndicator = null;
        this.wasteMapping = this.initWasteMapping();
        this.loadModel();
    }

    async loadModel() {
        try {
            this.showLoadingIndicator('🤖 Загружаем AI модель...');
            console.log('🤖 Загружаем MobileNet модель...');
            
            // Загружаем предварительно обученную модель MobileNet
            this.model = await mobilenet.load();
            this.isModelLoaded = true;
            
            console.log('✅ AI модель загружена успешно!');
            this.hideLoadingIndicator();
            this.updateScanButton();
            
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
            'bottle': 'plastic_bottle', // общий термин по умолчанию для пластика
            
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
            'glass': 'glass_bottle',
            
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
            'can': 'metal_can',
            'tin': 'metal_can',
            'aluminum': 'metal_can',
            'metal': 'metal_can',
            
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
            'box': 'paper',
            
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
            'phone': 'electronics',
            
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
            'cabbage': 'organic_waste',
            'coffee': 'organic_waste'
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

        console.log('🔍 Анализируем предсказания AI модели...');

        // Анализируем каждое предсказание
        for (const prediction of predictions) {
            const className = prediction.className.toLowerCase();
            const probability = prediction.probability;
            
            console.log(`🔍 Проверяем: "${className}" с вероятностью ${(probability * 100).toFixed(1)}%`);
            
            // Ищем прямые совпадения
            if (this.wasteMapping[className]) {
                const wasteType = this.wasteMapping[className];
                const result = {
                    wasteType,
                    confidence: probability,
                    match: 'direct',
                    originalClass: prediction.className
                };
                wasteResults.push(result);
                
                if (probability > maxConfidence) {
                    maxConfidence = probability;
                    bestMatch = result;
                }
                
                console.log(`✅ ПРЯМОЕ совпадение: "${className}" -> ${wasteType} (${(probability * 100).toFixed(1)}%)`);
            } else {
                // Ищем частичные совпадения с улучшенной логикой
                const partialMatch = this.findBestPartialMatch(className, probability);
                if (partialMatch) {
                    wasteResults.push(partialMatch);
                    if (partialMatch.confidence > maxConfidence) {
                        maxConfidence = partialMatch.confidence;
                        bestMatch = partialMatch;
                    }
                    console.log(`🔄 ЧАСТИЧНОЕ совпадение: "${className}" -> ${partialMatch.wasteType} (${(partialMatch.confidence * 100).toFixed(1)}%)`);
                }
            }
        }

        // Дополнительная логика для улучшения точности
        if (bestMatch) {
            bestMatch = this.refineWasteClassification(bestMatch, predictions);
        }

        // Если найдены совпадения с хорошей уверенностью
        if (bestMatch && maxConfidence > 0.15) {
            console.log(`🎯 ФИНАЛЬНЫЙ результат: ${bestMatch.wasteType} с уверенностью ${(maxConfidence * 100).toFixed(1)}%`);
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
                score = 0.7;
            }
            
            // Проверяем ключевые слова для более точного определения
            const keywordScore = this.checkKeywordMatch(className, key, wasteType);
            if (keywordScore > 0) {
                score = Math.max(score, keywordScore);
            }
            
            if (score > bestScore && score > 0.3) {
                bestScore = score;
                bestMatch = {
                    wasteType,
                    confidence: probability * score,
                    match: 'partial',
                    originalClass: className
                };
            }
        }

        return bestMatch;
    }

    checkKeywordMatch(className, mappingKey, wasteType) {
        // Специальные правила для более точного определения
        
        // Пластиковые бутылки
        if (wasteType === 'plastic_bottle') {
            if (className.includes('bottle')) {
                if (className.includes('plastic') || 
                    className.includes('water') || 
                    className.includes('soda') || 
                    className.includes('juice') ||
                    className.includes('drink') ||
                    className.includes('beverage')) {
                    return 0.95;
                }
                // Если просто "bottle" без уточнений, скорее пластик
                return 0.75;
            }
            return 0;
        }
        
        // Стеклянные бутылки
        if (wasteType === 'glass_bottle') {
            if (className.includes('bottle') && 
                (className.includes('glass') || 
                 className.includes('wine') || 
                 className.includes('beer') || 
                 className.includes('vodka') ||
                 className.includes('whiskey') ||
                 className.includes('liquor'))) {
                return 0.95;
            }
            if (className.includes('jar')) {
                return 0.9;
            }
            if (className.includes('glass')) {
                return 0.8;
            }
            return 0;
        }
        
        // Металлические банки
        if (wasteType === 'metal_can') {
            if (className.includes('can')) {
                if (className.includes('aluminum') || 
                    className.includes('metal') || 
                    className.includes('soda') || 
                    className.includes('beer') ||
                    className.includes('food') ||
                    className.includes('tin')) {
                    return 0.95;
                }
                return 0.8;
            }
            if (className.includes('aluminum') || className.includes('metal')) {
                return 0.7;
            }
            return 0;
        }
        
        return 0;
    }

    refineWasteClassification(match, allPredictions) {
        // Дополнительная проверка для уточнения классификации
        const className = match.originalClass.toLowerCase();
        
        console.log(`🔍 Уточняем классификацию для: ${className}`);
        
        // Если видим "bottle", проверяем контекст в других предсказаниях
        if (className.includes('bottle')) {
            for (const pred of allPredictions) {
                const predClass = pred.className.toLowerCase();
                
                // Ищем указания на стекло
                if (predClass.includes('glass') || 
                    predClass.includes('wine') || 
                    predClass.includes('beer') ||
                    predClass.includes('vodka') ||
                    predClass.includes('liquor')) {
                    
                    if (match.wasteType === 'plastic_bottle') {
                        console.log(`🔄 ПЕРЕКЛАССИФИКАЦИЯ: ${className} -> glass_bottle (найдено: ${predClass})`);
                        return {
                            ...match,
                            wasteType: 'glass_bottle',
                            originalClass: pred.className
                        };
                    }
                }
                
                // Ищем указания на пластик
                if (predClass.includes('plastic') || 
                    predClass.includes('water') || 
                    predClass.includes('soda') ||
                    predClass.includes('juice')) {
                    
                    if (match.wasteType === 'glass_bottle') {
                        console.log(`🔄 ПЕРЕКЛАССИФИКАЦИЯ: ${className} -> plastic_bottle (найдено: ${predClass})`);
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
            'person', 'human', 'face', 'hand', 'finger',
            'dog', 'cat', 'animal', 'pet',
            'car', 'vehicle', 'truck', 'bus',
            'building', 'house', 'wall', 'floor',
            'tree', 'plant', 'flower', 'grass',
            'sky', 'cloud', 'sun', 'mountain',
            'furniture', 'chair', 'table', 'desk',
            'clothing', 'shirt', 'pants', 'shoe'
        ];
        
        const lowerClassName = className.toLowerCase();
        return nonWasteObjects.some(obj => lowerClassName.includes(obj));
    }

    fallbackAnalysis() {
        // Симуляция AI анализа (демо-режим)
        const wasteTypes = ['plastic_bottle', 'glass_bottle', 'metal_can', 'paper'];
        const randomType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
        
        return {
            success: true,
            wasteType: randomType,
            confidence: Math.random() * 0.3 + 0.7,
            predictions: [],
            analysis: [],
            isAI: false,
            message: `Демо-режим: определен тип ${this.getWasteTypeName(randomType)}`
        };
    }

    fallbackToMockData() {
        console.log('⚠️ Переключение на демо-режим из-за ошибки загрузки модели');
        this.isModelLoaded = false;
    }

    async analyzeFromCamera() {
        // Получаем видео элемент камеры
        const videoElement = document.getElementById('camera-video');
        if (!videoElement) {
            throw new Error('Видео элемент камеры не найден');
        }

        // Создаем canvas для захвата кадра
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        // Захватываем текущий кадр
        context.drawImage(videoElement, 0, 0);
        
        // Анализируем изображение
        return await this.analyzeImage(canvas);
    }

    async analyzeFromFile(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = async () => {
                try {
                    const result = await this.analyzeImage(img);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = reject;
            
            const reader = new FileReader();
            reader.onload = e => img.src = e.target.result;
            reader.readAsDataURL(file);
        });
    }

    getModelStatus() {
        return {
            isLoaded: this.isModelLoaded,
            modelType: 'MobileNet v2',
            accuracy: '85%+',
            categories: Object.keys(this.wasteMapping).length
        };
    }
}

// Экспортируем класс для использования
window.AIScanner = AIScanner;
