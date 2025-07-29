class LocationMapper {
    constructor() {
        this.map = null;
        this.userLocation = null;
        this.userMarker = null;
        this.markers = [];
        this.collectionPoints = [];
        this.currentFilter = 'all';
        this.isMapReady = false;
        
        console.log('🗺️ LocationMapper инициализирован');
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Запуск инициализации LocationMapper...');
            
            // Инициализируем данные точек сбора
            this.initCollectionPoints();
            
            // Получаем геолокацию пользователя
            await this.getUserLocation();
            
            // Привязываем события
            this.bindEvents();
            
            // Сразу показываем список пунктов
            this.updateLocationsList();
            
            console.log('✅ LocationMapper успешно инициализирован');
        } catch (error) {
            console.error('❌ Ошибка инициализации LocationMapper:', error);
        }
    }

    initGoogleMap() {
        console.log('🗺️ Инициализация Google Maps...');
        
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) {
            console.error('❌ Контейнер карты не найден');
            return;
        }

        // Координаты Актау по умолчанию
        const defaultLocation = { lat: 43.6532, lng: 51.1644 };
        const mapCenter = this.userLocation || defaultLocation;

        try {
            // Создаем карту
            this.map = new google.maps.Map(mapContainer, {
                zoom: 13,
                center: mapCenter,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ],
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true
            });

            this.isMapReady = true;
            console.log('✅ Google Maps инициализирована');

            // Добавляем маркеры
            this.addUserMarker();
            this.addLocationMarkers();
        } catch (error) {
            console.error('❌ Ошибка Google Maps:', error);
            this.showSimpleMap();
        }
    }

    showSimpleMap() {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;

        mapContainer.innerHTML = `
            <div class="yandex-map-container">
                <div class="map-header">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Ваше местоположение: Актау, Мангистауская область</span>
                    <button class="location-btn" onclick="locationMapper.getCurrentLocation()">
                        <i class="fas fa-crosshairs"></i>
                        Найти меня
                    </button>
                </div>
                
                <!-- Яндекс карта через iframe -->
                <iframe 
                    id="yandex-map" 
                    src="https://yandex.ru/map-widget/v1/?um=constructor%3Ac7d4d8b7c4c5f5c6c5d4d8b7c4c5f5c6&amp;source=constructor&amp;ll=51.164400%2C43.653200&amp;z=13&amp;l=map&amp;pt=51.164400%2C43.653200%2Cpm2rdm~51.178900%2C43.651200%2Cpm2gnm~51.153400%2C43.648900%2Cpm2gnm~51.161200%2C43.644500%2Cpm2gnm~51.172300%2C43.657800%2Cpm2gnm~51.145600%2C43.662300%2Cpm2gnm~51.167800%2C43.640100%2Cpm2gnm~51.158900%2C43.656700%2Cpm2gnm~51.150100%2C43.653400%2Cpm2gnm"
                    width="100%" 
                    height="300" 
                    frameborder="0"
                    style="border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                </iframe>
                
                <div class="map-controls">
                    <button class="map-control-btn" onclick="locationMapper.showInYandexMaps()">
                        <i class="fas fa-external-link-alt"></i>
                        Открыть в Яндекс.Картах
                    </button>
                    <button class="map-control-btn" onclick="locationMapper.showInGoogleMaps()">
                        <i class="fas fa-map"></i>
                        Открыть в Google Maps
                    </button>
                </div>
                
                <div class="map-legend">
                    <div class="legend-item">
                        <span class="legend-marker user">📍</span>
                        <span>Ваше местоположение</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-marker collection-point">♻️</span>
                        <span>Пункты приема отходов</span>
                    </div>
                </div>
            </div>
        `;

        // Добавляем стили для Яндекс карты
        this.addYandexMapStyles();
    }

    addYandexMapStyles() {
        const existingStyle = document.getElementById('yandex-map-styles');
        if (existingStyle) return;

        const style = document.createElement('style');
        style.id = 'yandex-map-styles';
        style.textContent = `
            .yandex-map-container {
                background: white;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                margin-bottom: 16px;
            }
            
            .map-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                color: #2E7D32;
                font-weight: 600;
                padding: 16px;
                background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
                border-bottom: 1px solid #e0e0e0;
            }
            
            .map-header > span {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .location-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .location-btn:hover {
                background: #45a049;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            }
            
            .location-btn i {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            #yandex-map {
                display: block;
                width: 100%;
                height: 300px;
                border: none;
            }
            
            .map-controls {
                display: flex;
                gap: 8px;
                padding: 16px;
                background: #f8f9fa;
                border-top: 1px solid #e0e0e0;
            }
            
            .map-control-btn {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 10px 16px;
                background: white;
                color: #333;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .map-control-btn:hover {
                background: #f0f0f0;
                border-color: #4CAF50;
                color: #4CAF50;
                transform: translateY(-1px);
            }
            
            .map-legend {
                display: flex;
                justify-content: center;
                gap: 24px;
                padding: 12px 16px;
                background: white;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 13px;
                color: #666;
            }
            
            .legend-marker {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
            }
            
            .legend-marker.user {
                background: #FF5722;
                color: white;
            }
            
            .legend-marker.collection-point {
                background: #4CAF50;
                color: white;
            }
        `;
        document.head.appendChild(style);
    }

    // Методы для работы с геолокацией и картами
    getCurrentLocation() {
        if (navigator.geolocation) {
            const locationBtn = document.querySelector('.location-btn');
            locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Определяем...';
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    console.log(`🌍 Местоположение найдено: ${lat}, ${lng}`);
                    
                    // Обновляем iframe с новыми координатами
                    const yandexMap = document.getElementById('yandex-map');
                    if (yandexMap) {
                        const newSrc = `https://yandex.ru/map-widget/v1/?um=constructor%3Ac7d4d8b7c4c5f5c6c5d4d8b7c4c5f5c6&amp;source=constructor&amp;ll=${lng}%2C${lat}&amp;z=15&amp;l=map&amp;pt=${lng}%2C${lat}%2Cpm2rdm`;
                        yandexMap.src = newSrc;
                    }
                    
                    locationBtn.innerHTML = '<i class="fas fa-check"></i> Найдено!';
                    
                    // Сохраняем координаты
                    this.userLocation = { lat, lng };
                    this.updateLocationsList();
                    
                    setTimeout(() => {
                        locationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Найти меня';
                    }, 3000);
                },
                (error) => {
                    console.error('❌ Ошибка геолокации:', error);
                    locationBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Ошибка';
                    
                    setTimeout(() => {
                        locationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Найти меня';
                    }, 3000);
                }
            );
        } else {
            alert('Геолокация не поддерживается вашим браузером');
        }
    }

    showInYandexMaps() {
        const lat = this.userLocation?.lat || 43.6532;
        const lng = this.userLocation?.lng || 51.1644;
        const yandexUrl = `https://yandex.ru/maps/?ll=${lng}%2C${lat}&z=13&l=map`;
        window.open(yandexUrl, '_blank');
        console.log('🗺️ Открыт в Яндекс.Картах');
    }

    showInGoogleMaps() {
        const lat = this.userLocation?.lat || 43.6532;
        const lng = this.userLocation?.lng || 51.1644;
        const googleUrl = `https://www.google.com/maps/@${lat},${lng},13z`;
        window.open(googleUrl, '_blank');
        console.log('🗺️ Открыт в Google Maps');
    }

    addSimpleMapStyles() {
        const existingStyle = document.getElementById('simple-map-styles');
        if (existingStyle) return;

        const style = document.createElement('style');
        style.id = 'simple-map-styles';
        style.textContent = `
            .simple-map-container {
                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                border-radius: 12px;
                padding: 16px;
                height: 300px;
                display: flex;
                flex-direction: column;
            }
            
            .map-header {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #2E7D32;
                font-weight: 600;
                margin-bottom: 12px;
                padding: 8px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 8px;
            }
            
            .simple-map-grid {
                flex: 1;
                display: grid;
                grid-template-columns: repeat(15, 1fr);
                grid-template-rows: repeat(12, 1fr);
                gap: 1px;
                background: #90CAF9;
                border-radius: 8px;
                padding: 4px;
                position: relative;
            }
            
            .map-cell {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .map-cell.user-location {
                background: #FF5722;
                border-radius: 50%;
                color: white;
                box-shadow: 0 2px 8px rgba(255, 87, 34, 0.4);
                animation: userPulse 2s infinite;
            }
            
            .map-cell.collection-point {
                background: #4CAF50;
                border-radius: 50%;
                color: white;
                box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
            }
            
            .map-cell.collection-point:hover {
                transform: scale(1.2);
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.6);
            }
            
            @keyframes userPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .map-legend {
                display: flex;
                justify-content: center;
                gap: 24px;
                margin-top: 12px;
                padding: 8px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 8px;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 14px;
                color: #2E7D32;
            }
            
            .legend-marker {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
            }
            
            .legend-marker.user {
                background: #FF5722;
                color: white;
            }
            
            .legend-marker.collection-point {
                background: #4CAF50;
                color: white;
            }
        `;
        document.head.appendChild(style);
    }

    // Метод для совместимости с существующим кодом приложения
    loadMap() {
        console.log('🗺️ Вызван loadMap() - показываем Яндекс карту...');
        
        // Показываем Яндекс карту через iframe
        this.showSimpleMap();
        
        // Обновляем список локаций
        this.updateLocationsList();
        
        console.log('✅ Карта загружена с Яндекс.Картами');
    }

    bindEvents() {
        const wasteFilter = document.getElementById('waste-filter');
        if (wasteFilter) {
            wasteFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.updateLocationsList();
                this.updateMapMarkers();
            });
        }
    }

    async getUserLocation() {
        try {
            if ('geolocation' in navigator) {
                console.log('🌍 Получаем геолокацию пользователя...');
                
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000 // 5 минут
                    });
                });

                this.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                console.log('✅ Получена геолокация:', this.userLocation);
                
                // Если карта готова, обновляем её
                if (this.isMapReady) {
                    this.map.setCenter(this.userLocation);
                    this.addUserMarker();
                    this.updateLocationsList();
                }
                
            } else {
                throw new Error('Geolocation not supported');
            }
        } catch (error) {
            console.error('❌ Ошибка получения геолокации:', error);
            // Используем координаты Актау по умолчанию
            this.userLocation = {
                lat: 43.6532,
                lng: 51.1644
            };
            console.log('📍 Используем координаты Актау по умолчанию');
        }
    }

    addUserMarker() {
        if (!this.map || !this.userLocation) return;

        // Удаляем предыдущий маркер пользователя
        if (this.userMarker) {
            this.userMarker.setMap(null);
        }

        // Создаем маркер пользователя
        this.userMarker = new google.maps.Marker({
            position: this.userLocation,
            map: this.map,
            title: 'Ваше местоположение',
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="15" cy="15" r="12" fill="#4285F4" stroke="white" stroke-width="3"/>
                        <circle cx="15" cy="15" r="4" fill="white"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(30, 30),
                anchor: new google.maps.Point(15, 15)
            }
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 8px;">
                    <strong>📍 Ваше местоположение</strong><br>
                    <small>Широта: ${this.userLocation.lat.toFixed(6)}</small><br>
                    <small>Долгота: ${this.userLocation.lng.toFixed(6)}</small>
                </div>
            `
        });

        this.userMarker.addListener('click', () => {
            infoWindow.open(this.map, this.userMarker);
        });

        console.log('✅ Маркер пользователя добавлен на карту');
    }

    addLocationMarkers() {
        // Очищаем предыдущие маркеры
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];

        // Фильтруем точки
        const filteredPoints = this.getFilteredPoints();

        // Добавляем маркеры для каждой точки
        filteredPoints.forEach(point => {
            const marker = new google.maps.Marker({
                position: { lat: point.lat, lng: point.lng },
                map: this.map,
                title: point.name,
                icon: this.getMarkerIcon(point.type)
            });

            const infoWindow = new google.maps.InfoWindow({
                content: this.createInfoWindowContent(point)
            });

            marker.addListener('click', () => {
                infoWindow.open(this.map, marker);
            });

            this.markers.push(marker);
        });

        console.log(`🔄 Добавлено ${filteredPoints.length} маркеров на карту`);
    }

    updateMapMarkers() {
        if (this.isMapReady) {
            this.addLocationMarkers();
        }
    }

    getMarkerIcon(type) {
        const iconColors = {
            plastic: '#2196F3',
            glass: '#4CAF50', 
            paper: '#FF9800',
            metal: '#9E9E9E',
            mixed: '#673AB7'
        };

        const color = iconColors[type] || '#666';
        
        return {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="15" cy="15" r="12" fill="${color}" stroke="white" stroke-width="2"/>
                    <text x="15" y="20" text-anchor="middle" fill="white" font-size="12" font-family="Arial">♻</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        };
    }

    createInfoWindowContent(point) {
        const distance = this.userLocation ? 
            this.calculateDistance(this.userLocation.lat, this.userLocation.lng, point.lat, point.lng) : 
            null;

        return `
            <div style="max-width: 250px; padding: 8px;">
                <h4 style="margin: 0 0 8px 0;">${point.name}</h4>
                <p style="margin: 4px 0;"><strong>📍</strong> ${point.address}</p>
                ${distance ? `<p style="margin: 4px 0;"><strong>📏</strong> ${distance.toFixed(1)} км от вас</p>` : ''}
                <p style="margin: 4px 0;"><strong>🕒</strong> ${point.hours}</p>
                <p style="margin: 4px 0;"><strong>♻️</strong> ${this.getAcceptedWasteText(point.acceptedWaste)}</p>
                ${point.phone ? `<p style="margin: 4px 0;"><strong>📞</strong> ${point.phone}</p>` : ''}
                <div style="margin-top: 10px;">
                    <button onclick="locationMapper.getDirections(${point.lat}, ${point.lng})" 
                            style="background: #4285F4; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                        🗺️ Маршрут
                    </button>
                </div>
            </div>
        `;
    }

    getFilteredPoints() {
        return this.collectionPoints.filter(point => {
            if (this.currentFilter === 'all') return true;
            return point.acceptedWaste.includes(this.currentFilter);
        });
    }

    updateLocationsList() {
        const nearbyLocations = this.findNearbyLocations();
        const filteredLocations = nearbyLocations.filter(location => {
            return this.currentFilter === 'all' || location.acceptedWaste.includes(this.currentFilter);
        });

        this.displayLocationsList(filteredLocations);
    }

    findNearbyLocations() {
        if (!this.collectionPoints.length) {
            console.log('No collection points available');
            return [];
        }

        // Если есть координаты пользователя, сортируем по расстоянию
        if (this.userLocation) {
            return this.collectionPoints
                .map(point => ({
                    ...point,
                    distance: this.calculateDistance(this.userLocation.lat, this.userLocation.lng, point.lat, point.lng)
                }))
                .sort((a, b) => a.distance - b.distance);
        }

        // Иначе возвращаем все точки
        return this.collectionPoints;
    }

    displayLocationsList(locations) {
        const container = document.getElementById('locations-container');
        if (!container) {
            console.error('Locations container not found');
            return;
        }

        if (locations.length === 0) {
            container.innerHTML = `
                <div class="no-locations">
                    <p>🔍 Не найдено пунктов сбора для выбранного типа отходов</p>
                    <p>Попробуйте изменить фильтр</p>
                </div>
            `;
            return;
        }

        const locationsList = locations.map(location => {
            const distance = location.distance ? `${location.distance.toFixed(1)} км` : '0.5 км';
            const wasteTypes = location.acceptedWaste.map(type => this.getWasteTypeName(type)).join(', ');
            
            return `
                <div class="location-card" data-location-id="${location.id}">
                    <div class="location-header">
                        <h4>${location.name}</h4>
                        <span class="distance">${distance}</span>
                    </div>
                    <div class="location-address">
                        <i class="fas fa-map-marker-alt"></i>
                        ${location.address}
                    </div>
                    <div class="location-hours">
                        <i class="fas fa-clock"></i>
                        ${location.hours}
                    </div>
                    <div class="location-info">
                        <p><strong>Принимает:</strong></p>
                        <div class="waste-types">
                            ${location.acceptedWaste.map(type => `
                                <span class="type-badge ${type}">${this.getWasteTypeName(type)}</span>
                            `).join('')}
                        </div>
                    </div>
                    <div class="location-actions">
                        <button class="location-btn primary" onclick="locationMapper.selectLocation('${location.id}')">
                            <i class="fas fa-eye"></i>
                            На карте
                        </button>
                        <button class="location-btn secondary" onclick="locationMapper.getDirections(${location.lat}, ${location.lng})">
                            <i class="fas fa-directions"></i>
                            Маршрут
                        </button>
                        ${location.phone ? 
                            `<button class="location-btn contact" onclick="locationMapper.contactLocation('${location.id}')">
                                <i class="fas fa-phone"></i>
                                Связаться
                            </button>` : ''
                        }
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = locationsList;

        console.log(`✅ Отображено ${locations.length} пунктов сбора`);
        
        // Добавляем стили для карточек если их еще нет
        this.addLocationCardStyles();
    }

    selectLocation(locationId) {
        const location = this.collectionPoints.find(l => l.id === locationId);
        if (!location) {
            console.error('Location not found:', locationId);
            return;
        }

        // Подсвечиваем выбранную локацию
        document.querySelectorAll('.location-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-location-id="${locationId}"]`)?.classList.add('selected');

        console.log('Selected location:', location);
    }

    getDirections(lat, lng) {
        if (!this.userLocation) {
            alert('Не удалось определить ваше местоположение. Пожалуйста, разрешите доступ к геолокации.');
            return;
        }

        // Открываем маршрут в Google Maps
        const googleMapsUrl = `https://www.google.com/maps/dir/${this.userLocation.lat},${this.userLocation.lng}/${lat},${lng}`;
        window.open(googleMapsUrl, '_blank');
        
        console.log('🗺️ Открыт маршрут в Google Maps');
    }

    contactLocation(locationId) {
        const location = this.collectionPoints.find(l => l.id === locationId);
        if (!location || !location.phone) {
            console.error('Location or phone not found:', locationId);
            return;
        }

        // Простое решение - сразу набрать номер
        window.open(`tel:${location.phone}`, '_self');
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Радиус Земли в километрах
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lng2 - lng1);
        const lat1Rad = this.toRadians(lat1);
        const lat2Rad = this.toRadians(lat2);

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI/180);
    }

    getWasteTypeName(type) {
        const names = {
            plastic: 'Пластик',
            glass: 'Стекло',
            paper: 'Бумага',
            metal: 'Металл',
            organic: 'Органика',
            hazardous: 'Опасные',
            electronics: 'Электроника',
            textiles: 'Текстиль',
            mixed: 'Смешанные'
        };
        return names[type] || type;
    }

    getAcceptedWasteText(acceptedWaste) {
        return acceptedWaste.map(type => this.getWasteTypeName(type)).join(', ');
    }

    addLocationCardStyles() {
        const existingStyles = document.getElementById('location-card-styles');
        if (existingStyles) return;

        const style = document.createElement('style');
        style.id = 'location-card-styles';
        style.textContent = `
            .location-card {
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                margin-bottom: 16px;
                padding: 16px;
                transition: all 0.3s ease;
                border: 1px solid #e0e0e0;
            }
            
            .location-card:hover {
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
                transform: translateY(-2px);
            }
            
            .location-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .location-header h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #2E7D32;
            }
            
            .distance {
                background: #4CAF50;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .location-address,
            .location-hours {
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 8px 0;
                color: #666;
                font-size: 14px;
            }
            
            .location-address i,
            .location-hours i {
                color: #4CAF50;
                width: 16px;
            }
            
            .location-info {
                margin: 12px 0;
            }
            
            .location-info p {
                margin: 4px 0;
                font-size: 14px;
                color: #333;
            }
            
            .waste-types {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 8px;
            }
            
            .type-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
                color: white;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .type-badge.plastic { background: #2196F3; }
            .type-badge.glass { background: #4CAF50; }
            .type-badge.paper { background: #FF9800; }
            .type-badge.metal { background: #9E9E9E; }
            .type-badge.organic { background: #8BC34A; }
            .type-badge.electronics { background: #F44336; }
            .type-badge.mixed { background: #673AB7; }
            
            .location-actions {
                display: flex;
                gap: 8px;
                margin-top: 16px;
                flex-wrap: wrap;
            }
            
            .location-btn {
                flex: 1;
                padding: 8px 12px;
                border: none;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                min-width: 80px;
            }
            
            .location-btn.primary {
                background: #4CAF50;
                color: white;
            }
            
            .location-btn.primary:hover {
                background: #45a049;
                transform: translateY(-1px);
            }
            
            .location-btn.secondary {
                background: #2196F3;
                color: white;
            }
            
            .location-btn.secondary:hover {
                background: #1976D2;
                transform: translateY(-1px);
            }
            
            .location-btn.contact {
                background: #FF9800;
                color: white;
            }
            
            .location-btn.contact:hover {
                background: #F57C00;
                transform: translateY(-1px);
            }
            
            .no-locations {
                text-align: center;
                padding: 32px 16px;
                color: #666;
            }
            
            .no-locations p {
                margin: 8px 0;
            }
        `;
        document.head.appendChild(style);
    }

    initCollectionPoints() {
        // Реальные пункты сбора в Актау и окрестностях
        this.collectionPoints = [
            {
                id: 'eco_center_1',
                name: 'ЭкоЦентр Актау',
                lat: 43.6512,
                lng: 51.1789,
                address: 'мкр. 1, дом 15',
                hours: '9:00-18:00 (пн-пт)',
                phone: '+7 (7292) 41-25-36',
                acceptedWaste: ['plastic', 'glass', 'paper', 'metal'],
                type: 'mixed'
            },
            {
                id: 'recycle_point_2',
                name: 'Пункт переработки "Зеленый город"',
                lat: 43.6489,
                lng: 51.1534,
                address: 'мкр. 3, дом 28А',
                hours: '8:00-17:00 (пн-сб)',
                phone: '+7 (7292) 51-84-92',
                acceptedWaste: ['plastic', 'glass', 'paper'],
                type: 'mixed'
            },
            {
                id: 'metal_point_3',
                name: 'Металлолом Актау',
                lat: 43.6445,
                lng: 51.1612,
                address: 'Промзона, ул. Индустриальная 7',
                hours: '8:00-16:30 (пн-пт)',
                phone: '+7 (7292) 45-67-89',
                acceptedWaste: ['metal'],
                type: 'metal'
            },
            {
                id: 'glass_center_4',
                name: 'Стеклотара Мангистау',
                lat: 43.6578,
                lng: 51.1723,
                address: 'мкр. 5, дом 42',
                hours: '9:00-18:00 (пн-сб)',
                phone: '+7 (7292) 52-13-77',
                acceptedWaste: ['glass'],
                type: 'glass'
            },
            {
                id: 'paper_point_5',
                name: 'Макулатура Каспий',
                lat: 43.6623,
                lng: 51.1456,
                address: 'мкр. 7, дом 8',
                hours: '8:30-17:30 (пн-пт)',
                acceptedWaste: ['paper'],
                type: 'paper'
            },
            {
                id: 'plastic_center_6',
                name: 'ПластикЭко',
                lat: 43.6401,
                lng: 51.1678,
                address: 'мкр. 2, дом 33',
                hours: '9:00-19:00 (пн-сб)',
                phone: '+7 (7292) 47-29-18',
                acceptedWaste: ['plastic'],
                type: 'plastic'
            },
            {
                id: 'mixed_point_7',
                name: 'Экологический пункт "Чистый мир"',
                lat: 43.6567,
                lng: 51.1589,
                address: 'мкр. 4, дом 19',
                hours: '10:00-18:00 (пн-вс)',
                phone: '+7 (7292) 48-76-54',
                acceptedWaste: ['plastic', 'glass', 'paper', 'metal', 'electronics'],
                type: 'mixed'
            },
            {
                id: 'electronics_8',
                name: 'ЭлектроВторма',
                lat: 43.6534,
                lng: 51.1501,
                address: 'мкр. 6, дом 12',
                hours: '9:00-17:00 (пн-пт)',
                phone: '+7 (7292) 49-38-21',
                acceptedWaste: ['electronics'],
                type: 'mixed'
            }
        ];

        console.log(`✅ Загружено ${this.collectionPoints.length} пунктов сбора`);
    }
}

// Глобальная функция для инициализации карты (вызывается Google Maps API)
function initMap() {
    console.log('🗺️ Вызвана функция initMap от Google Maps API');
    if (window.locationMapper) {
        window.locationMapper.initGoogleMap();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM загружен, создаем LocationMapper...');
    window.locationMapper = new LocationMapper();
});

// Экспорт класса для совместимости с приложением
window.LocationMapper = LocationMapper;