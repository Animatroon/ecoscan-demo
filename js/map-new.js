// Интерактивная карта с использованием Leaflet
class InteractiveMapModule {
    constructor() {
        this.map = null;
        this.markers = [];
        this.currentFilter = 'all';
        this.userLocation = { lat: 43.6562, lng: 51.2005 }; // Координаты Актау
        this.recyclingPoints = [
            {
                id: 1,
                name: 'Экостанция "Мангышлак"',
                address: 'мкр. 1, дом 22А',
                lat: 43.6532,
                lng: 51.1694,
                types: ['plastic', 'glass', 'paper'],
                hours: '10:00-19:00 (Пн-Пт)',
                phone: '+7 (7292) 51-23-45',
                distance: '0.3 км'
            },
            {
                id: 2,
                name: 'ТОО "Актау-Экология"',
                address: 'мкр. 3, дом 45',
                lat: 43.6612,
                lng: 51.1580,
                types: ['metal', 'electronics', 'plastic'],
                hours: '09:00-18:00 (Пн-Сб)',
                phone: '+7 (7292) 43-67-89',
                distance: '0.8 км'
            },
            {
                id: 3,
                name: 'Центр переработки "Зеленый Актау"',
                address: 'мкр. 5, дом 78Б',
                lat: 43.6445,
                lng: 51.1825,
                types: ['glass', 'paper', 'organic'],
                hours: '08:00-20:00 (Ежедневно)',
                phone: '+7 (7292) 55-12-34',
                distance: '1.2 км'
            },
            {
                id: 4,
                name: 'Пункт приема "Эко-Сити"',
                address: 'мкр. 7, дом 12',
                lat: 43.6698,
                lng: 51.1456,
                types: ['plastic', 'metal', 'electronics'],
                hours: '11:00-17:00 (Пн-Пт)',
                phone: '+7 (7292) 52-34-56',
                distance: '1.5 км'
            },
            {
                id: 5,
                name: 'Переработка "Каспий-Рециклинг"',
                address: 'мкр. 9, дом 33А',
                lat: 43.6389,
                lng: 51.1902,
                types: ['glass', 'metal', 'paper'],
                hours: '09:30-18:30 (Пн-Сб)',
                phone: '+7 (7292) 61-78-90',
                distance: '2.1 км'
            },
            {
                id: 6,
                name: 'Экопункт "Зеленое Будущее"',
                address: 'мкр. 11, дом 67',
                lat: 43.6741,
                lng: 51.1723,
                types: ['electronics', 'plastic', 'organic'],
                hours: '10:00-16:00 (Вт-Сб)',
                phone: '+7 (7292) 44-89-01',
                distance: '2.8 км'
            },
            {
                id: 7,
                name: 'Центр утилизации "Чистый Мангистау"',
                address: 'Промзона, ул. Индустриальная 15',
                lat: 43.6234,
                lng: 51.2145,
                types: ['metal', 'electronics', 'glass'],
                hours: '08:00-17:00 (Пн-Пт)',
                phone: '+7 (7292) 67-23-45',
                distance: '4.5 км'
            }
        ];
        this.typeColors = {
            plastic: '#2196F3',
            glass: '#4CAF50', 
            paper: '#FF9800',
            metal: '#9C27B0',
            electronics: '#F44336',
            organic: '#8BC34A'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const wasteFilter = document.getElementById('waste-filter');
        if (wasteFilter) {
            wasteFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.filterMarkers();
                this.updateLocationsList();
            });
        }
    }

    initMap() {
        // Проверяем, доступен ли Leaflet
        if (typeof L === 'undefined') {
            console.error('Leaflet library is not loaded');
            this.showFallbackMap();
            return;
        }

        if (this.map) {
            this.map.remove();
        }

        // Создаем карту
        this.map = L.map('eco-map', {
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true,
            dragging: true,
            touchZoom: true
        }).setView([this.userLocation.lat, this.userLocation.lng], 13);

        // Добавляем слой карты OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 10
        }).addTo(this.map);

        // Добавляем маркер текущего местоположения
        const userIcon = L.divIcon({
            html: '<div class="user-location-marker"><i class="fas fa-user"></i></div>',
            className: 'custom-div-icon',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        L.marker([this.userLocation.lat, this.userLocation.lng], { icon: userIcon })
            .addTo(this.map)
            .bindPopup('<div class="popup-header">Ваше местоположение</div><div class="popup-address"><i class="fas fa-map-marker-alt"></i> Актау, Мангистауская область</div>');

        // Добавляем маркеры пунктов приема
        this.addRecyclingMarkers();
        
        // Обновляем список локаций
        this.updateLocationsList();

        // Добавляем стили для пользовательского маркера
        this.addCustomStyles();
    }

    addCustomStyles() {
        if (!document.getElementById('leaflet-custom-styles')) {
            const style = document.createElement('style');
            style.id = 'leaflet-custom-styles';
            style.textContent = `
                .user-location-marker {
                    background: #FF5722;
                    border: 3px solid white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                }
                
                .leaflet-popup-close-button {
                    color: var(--text-secondary) !important;
                }
                
                .custom-marker {
                    border: 3px solid white;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 14px;
                    box-shadow: 0 2px 15px rgba(0,0,0,0.3);
                    cursor: pointer;
                }
                
                .custom-marker.plastic { background: #2196F3; }
                .custom-marker.glass { background: #4CAF50; }
                .custom-marker.paper { background: #FF9800; }
                .custom-marker.metal { background: #9C27B0; }
                .custom-marker.electronics { background: #F44336; }
                .custom-marker.organic { background: #8BC34A; }
            `;
            document.head.appendChild(style);
        }
    }

    addRecyclingMarkers() {
        this.markers = [];
        
        this.recyclingPoints.forEach(point => {
            // Определяем иконку на основе типов мусора
            const primaryType = point.types[0];
            
            const icon = L.divIcon({
                html: `<div class="custom-marker ${primaryType}"><i class="fas fa-recycle"></i></div>`,
                className: 'custom-div-icon',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            const marker = L.marker([point.lat, point.lng], { icon })
                .addTo(this.map)
                .bindPopup(this.createPopupContent(point));

            marker.pointData = point;
            this.markers.push(marker);
        });
    }

    createPopupContent(point) {
        const typeBadges = point.types.map(type => {
            const typeNames = {
                plastic: 'Пластик',
                glass: 'Стекло', 
                paper: 'Бумага',
                metal: 'Металл',
                electronics: 'Электроника',
                organic: 'Органика'
            };
            return `<span class="type-badge ${type}">${typeNames[type]}</span>`;
        }).join('');

        return `
            <div class="popup-header">${point.name}</div>
            <div class="popup-address">
                <i class="fas fa-map-marker-alt"></i>
                ${point.address}
            </div>
            <div class="popup-types">${typeBadges}</div>
            <div class="popup-hours">
                <i class="fas fa-clock"></i>
                ${point.hours}
            </div>
            <div class="popup-actions">
                <button onclick="window.mapModule.callLocation('${point.phone}')" class="popup-btn">
                    <i class="fas fa-phone"></i> Позвонить
                </button>
            </div>
        `;
    }

    filterMarkers() {
        this.markers.forEach(marker => {
            const point = marker.pointData;
            if (this.currentFilter === 'all' || point.types.includes(this.currentFilter)) {
                marker.addTo(this.map);
            } else {
                this.map.removeLayer(marker);
            }
        });
    }

    updateLocationsList() {
        const container = document.getElementById('locations-container');
        if (!container) return;

        const filteredPoints = this.currentFilter === 'all' 
            ? this.recyclingPoints 
            : this.recyclingPoints.filter(point => point.types.includes(this.currentFilter));

        container.innerHTML = '';

        filteredPoints.forEach(point => {
            const locationCard = document.createElement('div');
            locationCard.className = 'location-card';
            
            const typeBadges = point.types.map(type => {
                const typeNames = {
                    plastic: 'Пластик',
                    glass: 'Стекло',
                    paper: 'Бумага', 
                    metal: 'Металл',
                    electronics: 'Электроника',
                    organic: 'Органика'
                };
                return `<span class="type-badge ${type}">${typeNames[type]}</span>`;
            }).join('');

            locationCard.innerHTML = `
                <div class="location-header">
                    <h4>${point.name}</h4>
                    <span class="distance">${point.distance}</span>
                </div>
                <div class="location-address">
                    <i class="fas fa-map-marker-alt"></i>
                    ${point.address}
                </div>
                <div class="location-types">${typeBadges}</div>
                <div class="location-hours">
                    <i class="fas fa-clock"></i>
                    ${point.hours}
                </div>
                <div class="location-actions">
                    <button class="location-btn" onclick="window.mapModule.showOnMap(${point.id})">
                        <i class="fas fa-eye"></i>
                        На карте
                    </button>
                    <button class="location-btn" onclick="window.mapModule.callLocation('${point.phone}')">
                        <i class="fas fa-phone"></i>
                        Позвонить
                    </button>
                </div>
            `;

            container.appendChild(locationCard);
        });
    }

    showOnMap(pointId) {
        const point = this.recyclingPoints.find(p => p.id === pointId);
        if (point && this.map) {
            this.map.setView([point.lat, point.lng], 16);
            
            // Найти соответствующий маркер и открыть его попап
            const marker = this.markers.find(m => m.pointData.id === pointId);
            if (marker) {
                marker.openPopup();
            }
        }
    }

    callLocation(phone) {
        if (phone) {
            window.open(`tel:${phone}`, '_self');
        }
    }

    showFallbackMap() {
        // Показать упрощенную карту если Leaflet недоступен
        const mapContainer = document.getElementById('eco-map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="fallback-map">
                    <div class="map-header">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Пункты приема отходов в Актау</span>
                    </div>
                    <div class="fallback-content">
                        <p>Интерактивная карта временно недоступна.</p>
                        <p>Используйте список локаций ниже.</p>
                    </div>
                </div>
            `;
        }
        this.updateLocationsList();
    }

    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.markers = [];
    }
}

// Создаем глобальный экземпляр
window.mapModule = new InteractiveMapModule();
