class EcoScanApp {
    constructor() {
        this.currentScreen = 'scan-screen';
        this.userPoints = parseInt(localStorage.getItem('ecoPoints') || '0');
        this.userStats = JSON.parse(localStorage.getItem('userStats') || '{"scans": 0, "level": 1}');
        this.isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.currentWasteType = null;
        this.wasteDatabase = this.initWasteDatabase();
        this.init();
    }

    initWasteDatabase() {
        return {
            'glass_bottle': {
                name: 'Стеклянная бутылка',
                category: 'Стекло',
                recyclable: true,
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
                history: {
                    content: `<p>Стекло было впервые изобретено около 3500 лет назад в Месопотамии. Стеклянные бутылки начали массово производиться в 1700-х годах с развитием промышленных технологий.</p>
                             <p>Первые автоматические машины для производства бутылок появились в 1903 году, что революционизировало упаковочную индустрию. До этого каждая бутылка изготавливалась вручную мастерами-стеклодувами.</p>
                             <p>В СССР стеклянные бутылки широко использовались для молока, газированных напитков и пива. Система возврата бутылок была неотъемлемой частью торговли.</p>`
                },
                usage: {
                    content: `<p>Стеклянные бутылки используются для хранения различных жидкостей: вина, пива, соков, масел, лекарств и косметических средств.</p>
                             <p><strong>Преимущества стекла:</strong></p>
                             <ul>
                                <li>Химически инертно - не влияет на вкус продукта</li>
                                <li>Не пропускает воздух и влагу</li>
                                <li>Полностью прозрачно</li>
                                <li>Подлежит многократному использованию</li>
                                <li>Легко моется и стерилизуется</li>
                             </ul>
                             <p>В быту стеклянные бутылки можно использовать повторно для хранения домашних заготовок, как вазы для цветов или декоративные элементы интерьера.</p>`
                },
                recycling: {
                    content: `<p>Стекло - один из самых экологичных материалов для переработки. Оно может перерабатываться бесконечное количество раз без потери качества.</p>
                             <p><strong>Процесс переработки:</strong></p>
                             <ol>
                                <li>Сортировка по цветам (прозрачное, зеленое, коричневое)</li>
                                <li>Очистка от этикеток и загрязнений</li>
                                <li>Дробление на мелкие фрагменты (стеклобой)</li>
                                <li>Плавление при температуре 1500°C</li>
                                <li>Формование новых изделий</li>
                             </ol>`,
                    steps: [
                        { icon: 'fas fa-sort', title: 'Сортировка', description: 'Разделение по цветам' },
                        { icon: 'fas fa-broom', title: 'Очистка', description: 'Удаление этикеток' },
                        { icon: 'fas fa-hammer', title: 'Дробление', description: 'Получение стеклобоя' },
                        { icon: 'fas fa-fire', title: 'Плавление', description: 'Нагрев до 1500°C' },
                        { icon: 'fas fa-wine-bottle', title: 'Формование', description: 'Создание новых изделий' }
                    ]
                },
                impact: {
                    content: `<p>Стекло оказывает относительно низкое воздействие на окружающую среду благодаря возможности полной переработки.</p>
                             <p><strong>Экологические преимущества:</strong></p>
                             <ul>
                                <li>На 20% меньше загрязнения воздуха при переработке по сравнению с производством нового стекла</li>
                                <li>На 50% меньше потребления воды</li>
                                <li>Снижение выбросов CO₂ на 15-20%</li>
                                <li>Экономия природных ресурсов (песок, сода, известняк)</li>
                             </ul>
                             <p><strong>Негативное воздействие при неправильной утилизации:</strong></p>
                             <ul>
                                <li>Не разлагается в природе</li>
                                <li>Может причинить вред животным</li>
                                <li>Занимает место на свалках</li>
                             </ul>`,
                    decompositionTime: 'Не разлагается',
                    co2Production: '0.8 кг CO₂/кг',
                    waterUsage: '1.5 л/кг'
                },
                facts: [
                    { icon: 'fas fa-infinity', text: 'Стекло можно перерабатывать бесконечное количество раз без потери качества' },
                    { icon: 'fas fa-clock', text: 'Переработка 1 тонны стекла экономит 1.2 тонны сырья' },
                    { icon: 'fas fa-leaf', text: 'Использование 10% стеклобоя снижает энергозатраты на 2-3%' },
                    { icon: 'fas fa-globe', text: 'В мире ежегодно производится более 20 миллионов тонн стекла' }
                ],
                infographic: [
                    { icon: 'fas fa-recycle', value: '100%', label: 'Подлежит переработке' },
                    { icon: 'fas fa-fire', value: '1500°C', label: 'Температура плавления' },
                    { icon: 'fas fa-calendar', value: '∞', label: 'Время разложения' }
                ]
            },
            'plastic_bottle': {
                name: 'Пластиковая бутылка',
                category: 'Пластик (ПЭТ)',
                recyclable: true,
                image: 'https://images.unsplash.com/photo-1572776685600-aca8c3456337?w=500&h=300&fit=crop',
                history: {
                    content: `<p>Первая пластиковая бутылка была создана в 1947 году, но массовое производство началось в 1960-х годах. ПЭТ (полиэтилентерефталат) был изобретен в 1941 году британскими химиками.</p>
                             <p>В 1970-х годах пластиковые бутылки начали вытеснять стеклянные благодаря легкости, прочности и дешевизне производства.</p>
                             <p>Сегодня ПЭТ-бутылки являются самой распространенной упаковкой для напитков в мире.</p>`
                },
                usage: {
                    content: `<p>Пластиковые бутылки широко используются для упаковки воды, газированных напитков, соков, молочных продуктов и бытовой химии.</p>
                             <p><strong>Преимущества пластика:</strong></p>
                             <ul>
                                <li>Легкий вес - в 10 раз легче стекла</li>
                                <li>Не бьется при падении</li>
                                <li>Дешевое производство</li>
                                <li>Прозрачность и возможность окрашивания</li>
                                <li>Удобство транспортировки</li>
                             </ul>
                             <p>В быту можно использовать для хранения непищевых жидкостей, как кашпо для растений или контейнеры для хранения.</p>`
                },
                recycling: {
                    content: `<p>ПЭТ-бутылки хорошо поддаются переработке, но процесс более сложен, чем у стекла. Качество пластика снижается при каждой переработке.</p>
                             <p><strong>Процесс переработки:</strong></p>
                             <ol>
                                <li>Сбор и сортировка по типам пластика</li>
                                <li>Удаление этикеток и крышек</li>
                                <li>Измельчение в хлопья</li>
                                <li>Промывка и очистка</li>
                                <li>Переплавка в гранулы</li>
                                <li>Производство новых изделий</li>
                             </ol>`,
                    steps: [
                        { icon: 'fas fa-sort', title: 'Сортировка', description: 'По типам пластика' },
                        { icon: 'fas fa-tags', title: 'Очистка', description: 'Удаление этикеток' },
                        { icon: 'fas fa-cut', title: 'Измельчение', description: 'Получение хлопьев' },
                        { icon: 'fas fa-tint', title: 'Промывка', description: 'Очистка от загрязнений' },
                        { icon: 'fas fa-fire', title: 'Переплавка', description: 'Получение гранул' },
                        { icon: 'fas fa-cube', title: 'Производство', description: 'Новые изделия' }
                    ]
                },
                impact: {
                    content: `<p>Пластиковые бутылки оказывают значительное воздействие на окружающую среду, особенно при неправильной утилизации.</p>
                             <p><strong>Негативное воздействие:</strong></p>
                             <ul>
                                <li>Длительное время разложения - до 450 лет</li>
                                <li>Загрязнение океанов микропластиком</li>
                                <li>Выделение токсинов при сжигании</li>
                                <li>Потребление нефти для производства</li>
                             </ul>
                             <p><strong>При правильной переработке:</strong></p>
                             <ul>
                                <li>Экономия до 60% энергии</li>
                                <li>Снижение выбросов CO₂ на 70%</li>
                                <li>Уменьшение количества отходов</li>
                             </ul>`,
                    decompositionTime: '450 лет',
                    co2Production: '2.3 кг CO₂/кг',
                    waterUsage: '3.4 л/кг'
                },
                facts: [
                    { icon: 'fas fa-water', text: 'Для производства 1 пластиковой бутылки нужно в 3 раза больше воды, чем она может вместить' },
                    { icon: 'fas fa-globe', text: 'Ежеминутно в мире покупается 1 миллион пластиковых бутылок' },
                    { icon: 'fas fa-fish', text: 'В океанах плавает более 5 триллионов частиц пластика' },
                    { icon: 'fas fa-recycle', text: 'Из 5 переработанных ПЭТ-бутылок можно сделать 1 футболку' }
                ],
                infographic: [
                    { icon: 'fas fa-clock', value: '450', label: 'Лет до разложения' },
                    { icon: 'fas fa-oil-can', value: '1.5 л', label: 'Нефти на производство' },
                    { icon: 'fas fa-shopping-cart', value: '1 млн', label: 'Покупается каждую минуту' }
                ]
            },
            'paper': {
                name: 'Бумага',
                category: 'Целлюлоза',
                recyclable: true,
                image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&h=300&fit=crop',
                history: {
                    content: `<p>Бумага была изобретена в Китае около 105 года н.э. Цай Лунем. В Европу технология производства бумаги пришла через арабов в 12 веке.</p>
                             <p>Массовое производство бумаги началось в 19 веке с изобретением бумагоделательных машин. Это революционизировало печатное дело и образование.</p>
                             <p>Сегодня ежегодно в мире производится более 400 миллионов тонн бумаги и картона.</p>`
                },
                usage: {
                    content: `<p>Бумага используется для печати, письма, упаковки, гигиенических целей и множества других применений.</p>
                             <p><strong>Основные виды бумаги:</strong></p>
                             <ul>
                                <li>Офисная бумага для печати и письма</li>
                                <li>Газетная бумага</li>
                                <li>Картон и упаковочные материалы</li>
                                <li>Туалетная бумага и салфетки</li>
                                <li>Художественная бумага</li>
                             </ul>
                             <p>В быту использованную бумагу можно применять для упаковки, розжига камина или компостирования.</p>`
                },
                recycling: {
                    content: `<p>Бумага - один из наиболее успешно перерабатываемых материалов. Она может перерабатываться до 7 раз.</p>
                             <p><strong>Процесс переработки:</strong></p>
                             <ol>
                                <li>Сортировка по типам и качеству</li>
                                <li>Удаление скрепок, скоб и пластика</li>
                                <li>Замачивание и превращение в пульпу</li>
                                <li>Очистка от краски и примесей</li>
                                <li>Отбеливание (при необходимости)</li>
                                <li>Формирование новых листов</li>
                             </ol>`,
                    steps: [
                        { icon: 'fas fa-sort', title: 'Сортировка', description: 'По типам бумаги' },
                        { icon: 'fas fa-broom', title: 'Очистка', description: 'Удаление металла' },
                        { icon: 'fas fa-tint', title: 'Замачивание', description: 'Превращение в пульпу' },
                        { icon: 'fas fa-filter', title: 'Очистка', description: 'Удаление краски' },
                        { icon: 'fas fa-magic', title: 'Отбеливание', description: 'При необходимости' },
                        { icon: 'fas fa-file', title: 'Формирование', description: 'Новые листы' }
                    ]
                },
                impact: {
                    content: `<p>Производство бумаги оказывает значительное воздействие на окружающую среду, но переработка существенно снижает вред.</p>
                             <p><strong>Экологические проблемы:</strong></p>
                             <ul>
                                <li>Вырубка лесов для получения целлюлозы</li>
                                <li>Высокое потребление воды в производстве</li>
                                <li>Загрязнение водоемов при отбеливании</li>
                                <li>Выбросы парниковых газов</li>
                             </ul>
                             <p><strong>Польза переработки:</strong></p>
                             <ul>
                                <li>Экономия лесных ресурсов</li>
                                <li>Снижение потребления воды на 60%</li>
                                <li>Уменьшение энергозатрат на 40%</li>
                                <li>Сокращение объема свалок</li>
                             </ul>`,
                    decompositionTime: '2-6 недель',
                    co2Production: '1.5 кг CO₂/кг',
                    waterUsage: '10-50 л/кг'
                },
                facts: [
                    { icon: 'fas fa-tree', text: '1 тонна переработанной бумаги спасает 17 деревьев' },
                    { icon: 'fas fa-recycle', text: 'Бумагу можно перерабатывать до 7 раз подряд' },
                    { icon: 'fas fa-water', text: 'На производство 1 листа бумаги тратится 10 литров воды' },
                    { icon: 'fas fa-globe', text: '36% всего мусора составляют бумажные отходы' }
                ],
                infographic: [
                    { icon: 'fas fa-recycle', value: '7', label: 'Раз можно переработать' },
                    { icon: 'fas fa-tree', value: '17', label: 'Деревьев спасает 1 тонна' },
                    { icon: 'fas fa-calendar', value: '2-6', label: 'Недель до разложения' }
                ]
            },
            'metal_can': {
                name: 'Металлическая банка',
                category: 'Металл (Алюминий/Сталь)',
                recyclable: true,
                image: 'https://images.unsplash.com/photo-1610736957444-c7a5d8e7c5a2?w=500&h=300&fit=crop',
                history: {
                    content: `<p>Первые металлические консервные банки появились в начале 19 века. Алюминиевые банки для напитков были изобретены в 1958 году.</p>
                             <p>Революция произошла в 1963 году с изобретением банки с отрывным язычком, что сделало их невероятно популярными.</p>
                             <p>Сегодня алюминиевая банка - самая перерабатываемая упаковка в мире.</p>`
                },
                usage: {
                    content: `<p>Металлические банки используются для консервирования пищи, упаковки напитков и хранения различных продуктов.</p>
                             <p><strong>Виды металлических банок:</strong></p>
                             <ul>
                                <li>Алюминиевые банки для напитков</li>
                                <li>Жестяные банки для консервов</li>
                                <li>Стальные банки для красок и химии</li>
                                <li>Банки из нержавеющей стали</li>
                             </ul>
                             <p>В быту банки можно использовать как горшки для растений, органайзеры или декоративные элементы.</p>`
                },
                recycling: {
                    content: `<p>Металл - идеальный материал для переработки. Алюминий можно перерабатывать бесконечно без потери качества.</p>
                             <p><strong>Процесс переработки:</strong></p>
                             <ol>
                                <li>Сбор и сортировка по типам металла</li>
                                <li>Очистка от этикеток и остатков</li>
                                <li>Измельчение и прессование</li>
                                <li>Плавление в печах при высокой температуре</li>
                                <li>Очистка и рафинирование</li>
                                <li>Изготовление новых изделий</li>
                             </ol>`,
                    steps: [
                        { icon: 'fas fa-sort', title: 'Сортировка', description: 'По типам металла' },
                        { icon: 'fas fa-broom', title: 'Очистка', description: 'От этикеток' },
                        { icon: 'fas fa-compress', title: 'Прессование', description: 'Компактизация' },
                        { icon: 'fas fa-fire', title: 'Плавление', description: 'В печах' },
                        { icon: 'fas fa-filter', title: 'Очистка', description: 'Рафинирование' },
                        { icon: 'fas fa-cog', title: 'Производство', description: 'Новые изделия' }
                    ]
                },
                impact: {
                    content: `<p>Переработка металла приносит огромную экологическую пользу и экономию ресурсов.</p>
                             <p><strong>Преимущества переработки:</strong></p>
                             <ul>
                                <li>Экономия 95% энергии по сравнению с производством из руды</li>
                                <li>Сокращение выбросов парниковых газов</li>
                                <li>Сохранение природных ресурсов</li>
                                <li>Уменьшение загрязнения воды и воздуха</li>
                             </ul>
                             <p><strong>Экономическая выгода:</strong></p>
                             <ul>
                                <li>Алюминиевая банка окупается за 60 дней</li>
                                <li>Создание рабочих мест в отрасли переработки</li>
                                <li>Снижение затрат на добычу руды</li>
                             </ul>`,
                    decompositionTime: '50-200 лет',
                    co2Production: '0.5 кг CO₂/кг',
                    waterUsage: '1.5 л/кг'
                },
                facts: [
                    { icon: 'fas fa-bolt', text: 'Переработка алюминия экономит 95% энергии по сравнению с производством из руды' },
                    { icon: 'fas fa-infinity', text: 'Алюминий можно перерабатывать бесконечное количество раз' },
                    { icon: 'fas fa-clock', text: 'Алюминиевая банка может быть переработана и снова на полке за 60 дней' },
                    { icon: 'fas fa-dollar-sign', text: 'Алюминиевые банки - самый ценный материал в мусорном баке' }
                ],
                infographic: [
                    { icon: 'fas fa-recycle', value: '∞', label: 'Раз можно переработать' },
                    { icon: 'fas fa-bolt', value: '95%', label: 'Экономия энергии' },
                    { icon: 'fas fa-calendar', value: '60', label: 'Дней до новой банки' }
                ]
            },
            'battery': {
                name: 'Батарейка',
                category: 'Токсичные отходы',
                recyclable: true,
                image: 'https://images.unsplash.com/photo-1609592806529-95b9ac5ee1b4?w=500&h=300&fit=crop',
                history: {
                    content: `<p>Первая батарейка была изобретена в 1800 году Алессандро Вольта. Сухие батарейки появились в 1886 году.</p>
                             <p>Литиевые батарейки были разработаны в 1970-х годах, а современные литий-ионные аккумуляторы - в 1990-х.</p>
                             <p>Сегодня батарейки являются неотъемлемой частью современной жизни, питая миллиарды устройств.</p>`
                },
                usage: {
                    content: `<p>Батарейки используются в огромном количестве устройств - от пультов до электромобилей.</p>
                             <p><strong>Типы батареек:</strong></p>
                             <ul>
                                <li>Щелочные (AA, AAA, C, D, 9V)</li>
                                <li>Литиевые (CR2032, CR123A)</li>
                                <li>Аккумуляторы (Li-ion, NiMH)</li>
                                <li>Специальные (часовые, слуховые аппараты)</li>
                             </ul>
                             <p><strong>ВАЖНО:</strong> Никогда не разбирайте батарейки и не подвергайте их нагреву или механическому воздействию!</p>`
                },
                recycling: {
                    content: `<p>Батарейки содержат токсичные вещества и требуют специальной утилизации. Их нельзя выбрасывать в обычный мусор!</p>
                             <p><strong>Процесс переработки:</strong></p>
                             <ol>
                                <li>Сбор в специальные контейнеры</li>
                                <li>Сортировка по типам и химическому составу</li>
                                <li>Разборка в защищенных условиях</li>
                                <li>Извлечение ценных металлов</li>
                                <li>Нейтрализация токсичных веществ</li>
                                <li>Переработка металлов во вторичное сырье</li>
                             </ol>`,
                    steps: [
                        { icon: 'fas fa-hand-paper', title: 'Сбор', description: 'В спец. контейнеры' },
                        { icon: 'fas fa-sort', title: 'Сортировка', description: 'По типам' },
                        { icon: 'fas fa-tools', title: 'Разборка', description: 'В защищенных условиях' },
                        { icon: 'fas fa-gem', title: 'Извлечение', description: 'Ценных металлов' },
                        { icon: 'fas fa-shield-alt', title: 'Нейтрализация', description: 'Токсинов' },
                        { icon: 'fas fa-recycle', title: 'Переработка', description: 'Во вторсырье' }
                    ]
                },
                impact: {
                    content: `<p>Батарейки содержат тяжелые металлы и токсичные вещества, которые крайне опасны для окружающей среды.</p>
                             <p><strong>Опасные вещества:</strong></p>
                             <ul>
                                <li>Ртуть - поражает нервную систему</li>
                                <li>Свинец - накапливается в организме</li>
                                <li>Кадмий - канцерогенное вещество</li>
                                <li>Литий - взрывоопасен при неправильной утилизации</li>
                             </ul>
                             <p><strong>Последствия неправильной утилизации:</strong></p>
                             <ul>
                                <li>Загрязнение почвы на десятки лет</li>
                                <li>Отравление грунтовых вод</li>
                                <li>Вред для растений и животных</li>
                                <li>Опасность для здоровья человека</li>
                             </ul>`,
                    decompositionTime: '100-1000 лет',
                    co2Production: '1.2 кг CO₂/кг',
                    waterUsage: '50 л/кг'
                },
                facts: [
                    { icon: 'fas fa-exclamation-triangle', text: 'Одна батарейка загрязняет 400 литров воды или 20 м² почвы' },
                    { icon: 'fas fa-globe-americas', text: 'В мире ежегодно продается более 15 миллиардов батареек' },
                    { icon: 'fas fa-recycle', text: 'До 80% материалов батарейки можно переработать' },
                    { icon: 'fas fa-skull-crossbones', text: 'Батарейки содержат до 12 различных токсичных веществ' }
                ],
                infographic: [
                    { icon: 'fas fa-tint', value: '400 л', label: 'Воды загрязняет' },
                    { icon: 'fas fa-clock', value: '1000', label: 'Лет разложения' },
                    { icon: 'fas fa-recycle', value: '80%', label: 'Можно переработать' }
                ]
            },
            'electronics': {
                name: 'Электроника',
                category: 'Электронные отходы',
                recyclable: true,
                image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=500&h=300&fit=crop',
                history: {
                    content: `<p>Электронные устройства стали массовыми с 1970-х годов. Персональные компьютеры, мобильные телефоны и другая электроника революционизировали нашу жизнь.</p>
                             <p>Проблема электронных отходов (e-waste) стала критической в 2000-х годах из-за быстрого обновления технологий.</p>
                             <p>Сегодня электроника - один из самых быстрорастущих типов отходов в мире.</p>`
                },
                usage: {
                    content: `<p>Электронные устройства присутствуют во всех сферах нашей жизни.</p>
                             <p><strong>Основные категории:</strong></p>
                             <ul>
                                <li>Компьютеры и ноутбуки</li>
                                <li>Смартфоны и планшеты</li>
                                <li>Бытовая техника</li>
                                <li>Телевизоры и аудиоаппаратура</li>
                                <li>Игровые консоли</li>
                             </ul>
                             <p>Перед утилизацией обязательно удалите все личные данные и извлеките батареи!</p>`
                },
                recycling: {
                    content: `<p>Электроника содержит как ценные материалы (золото, серебро, медь), так и токсичные вещества.</p>
                             <p><strong>Процесс переработки:</strong></p>
                             <ol>
                                <li>Сбор и первичная сортировка</li>
                                <li>Удаление батарей и опасных компонентов</li>
                                <li>Разборка на компоненты</li>
                                <li>Измельчение и сепарация материалов</li>
                                <li>Извлечение драгоценных металлов</li>
                                <li>Переработка пластика и металлов</li>
                             </ol>`,
                    steps: [
                        { icon: 'fas fa-hand-holding', title: 'Сбор', description: 'И сортировка' },
                        { icon: 'fas fa-battery-empty', title: 'Извлечение', description: 'Батарей' },
                        { icon: 'fas fa-screwdriver', title: 'Разборка', description: 'На компоненты' },
                        { icon: 'fas fa-hammer', title: 'Измельчение', description: 'И сепарация' },
                        { icon: 'fas fa-coins', title: 'Извлечение', description: 'Драгметаллов' },
                        { icon: 'fas fa-industry', title: 'Переработка', description: 'Материалов' }
                    ]
                },
                impact: {
                    content: `<p>Электронные отходы - один из самых проблематичных типов мусора из-за токсичных веществ и быстрого роста объемов.</p>
                             <p><strong>Токсичные вещества:</strong></p>
                             <ul>
                                <li>Свинец в пайке и экранах</li>
                                <li>Ртуть в лампах подсветки</li>
                                <li>Кадмий в аккумуляторах</li>
                                <li>Хром в металлических частях</li>
                             </ul>
                             <p><strong>Ценные материалы:</strong></p>
                             <ul>
                                <li>Золото в процессорах и разъемах</li>
                                <li>Серебро в контактах</li>
                                <li>Медь в проводах</li>
                                <li>Редкоземельные элементы</li>
                             </ul>`,
                    decompositionTime: '50-1000 лет',
                    co2Production: '300 кг CO₂/кг',
                    waterUsage: '1500 л/кг'
                },
                facts: [
                    { icon: 'fas fa-mobile-alt', text: 'В одном смартфоне содержится более 30 различных элементов периодической таблицы' },
                    { icon: 'fas fa-coins', text: '1 тонна электроники содержит больше золота, чем 17 тонн золотой руды' },
                    { icon: 'fas fa-chart-line', text: 'Электронные отходы растут в 3 раза быстрее обычного мусора' },
                    { icon: 'fas fa-globe', text: 'Ежегодно в мире образуется 50 млн тонн электронных отходов' }
                ],
                infographic: [
                    { icon: 'fas fa-coins', value: '30+', label: 'Элементов в смартфоне' },
                    { icon: 'fas fa-weight', value: '50 млн', label: 'Тонн e-waste в год' },
                    { icon: 'fas fa-clock', value: '1000', label: 'Лет разложения' }
                ]
            },
            'organic_waste': {
                name: 'Органические отходы',
                category: 'Биоразлагаемые отходы',
                recyclable: true,
                image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&h=300&fit=crop',
                history: {
                    content: `<p>Компостирование органических отходов практикуется человечеством тысячи лет. Древние цивилизации знали о пользе перегноя для почвы.</p>
                             <p>Современные методы компостирования и биогазовые установки развились в 20 веке как ответ на проблему утилизации органического мусора.</p>
                             <p>Сегодня переработка органики - ключевой элемент экономики замкнутого цикла.</p>`
                },
                usage: {
                    content: `<p>Органические отходы составляют 30-50% всего домашнего мусора.</p>
                             <p><strong>Виды органических отходов:</strong></p>
                             <ul>
                                <li>Остатки фруктов и овощей</li>
                                <li>Кофейная гуща и чайная заварка</li>
                                <li>Яичная скорлупа</li>
                                <li>Опавшие листья и трава</li>
                                <li>Бумага и картон (частично)</li>
                             </ul>
                             <p><strong>НЕ компостируйте:</strong> мясо, рыбу, молочные продукты, жиры - они привлекают вредителей и плохо разлагаются.</p>`
                },
                recycling: {
                    content: `<p>Органические отходы можно переработать в ценное удобрение - компост, или использовать для производства биогаза.</p>
                             <p><strong>Компостирование:</strong></p>
                             <ol>
                                <li>Сбор подходящих органических отходов</li>
                                <li>Смешивание "зеленых" и "коричневых" компонентов</li>
                                <li>Обеспечение доступа воздуха</li>
                                <li>Поддержание влажности</li>
                                <li>Периодическое перемешивание</li>
                                <li>Получение готового компоста через 3-12 месяцев</li>
                             </ol>`,
                    steps: [
                        { icon: 'fas fa-seedling', title: 'Сбор', description: 'Органических отходов' },
                        { icon: 'fas fa-layer-group', title: 'Смешивание', description: 'Зеленое + коричневое' },
                        { icon: 'fas fa-wind', title: 'Аэрация', description: 'Доступ воздуха' },
                        { icon: 'fas fa-tint', title: 'Увлажнение', description: 'Поддержание влаги' },
                        { icon: 'fas fa-sync', title: 'Перемешивание', description: 'Периодическое' },
                        { icon: 'fas fa-leaf', title: 'Компост', description: 'Готовое удобрение' }
                    ]
                },
                impact: {
                    content: `<p>Правильная утилизация органических отходов приносит огромную пользу окружающей среде.</p>
                             <p><strong>Польза компостирования:</strong></p>
                             <ul>
                                <li>Сокращение объема мусора на свалках</li>
                                <li>Уменьшение выбросов метана</li>
                                <li>Производство натурального удобрения</li>
                                <li>Улучшение структуры почвы</li>
                                <li>Экономия на удобрениях</li>
                             </ul>
                             <p><strong>Проблемы неправильной утилизации:</strong></p>
                             <ul>
                                <li>Выделение метана на свалках</li>
                                <li>Привлечение вредителей</li>
                                <li>Загрязнение грунтовых вод</li>
                                <li>Неприятные запахи</li>
                             </ul>`,
                    decompositionTime: '2-8 недель',
                    co2Production: '0.1 кг CO₂/кг',
                    waterUsage: '0.5 л/кг'
                },
                facts: [
                    { icon: 'fas fa-chart-pie', text: 'Органика составляет 30-50% всех домашних отходов' },
                    { icon: 'fas fa-fire', text: 'Гниющая органика на свалках производит метан - газ в 25 раз вреднее CO₂' },
                    { icon: 'fas fa-seedling', text: 'Компост улучшает урожайность на 20-40%' },
                    { icon: 'fas fa-clock', text: 'Домашний компост готов через 3-6 месяцев' }
                ],
                infographic: [
                    { icon: 'fas fa-percentage', value: '40%', label: 'Домашнего мусора' },
                    { icon: 'fas fa-calendar', value: '3-6', label: 'Месяцев до компоста' },
                    { icon: 'fas fa-arrow-up', value: '30%', label: 'Прирост урожая' }
                ]
            }
        };
    }

    init() {
        this.setupEventListeners();
        
        if (!this.isAuthenticated) {
            this.showAuthScreen();
        } else {
            this.showSplashScreen();
        }
        
        this.updateUserInterface();
    }

    showAuthScreen() {
        const authScreen = document.getElementById('auth-screen');
        const app = document.getElementById('app');
        
        if (authScreen && app) {
            authScreen.classList.remove('hidden');
            app.classList.add('hidden');
        }
    }

    hideAuthScreen() {
        const authScreen = document.getElementById('auth-screen');
        authScreen.classList.add('hidden');
    }

    setupAuthEvents() {
        const authTabs = document.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchAuthTab(tabName);
            });
        });

        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const demoLoginBtn = document.getElementById('demo-login-btn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.handleLogin();
            });
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                this.handleRegister();
            });
        }
        
        if (demoLoginBtn) {
            demoLoginBtn.addEventListener('click', () => {
                this.handleDemoLogin();
            });
        }

        const authInputs = document.querySelectorAll('.auth-form input');
        authInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const activeForm = document.querySelector('.auth-form.active');
                    if (activeForm && activeForm.id === 'login-form') {
                        this.handleLogin();
                    } else if (activeForm && activeForm.id === 'register-form') {
                        this.handleRegister();
                    }
                }
            });
        });
    }

    switchAuthTab(tabName) {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tabName}-form`);
        });
    }

    handleLogin() {
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        
        if (!emailInput || !passwordInput) {
            console.error('Элементы формы входа не найдены');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            this.showNotification('Пожалуйста, заполните все поля', 'warning');
            return;
        }

        this.authenticateUser({
            id: 'user_' + Date.now(),
            name: email.split('@')[0],
            email: email,
            avatar: email.charAt(0).toUpperCase(),
            level: 1,
            points: 0
        });
    }

    handleRegister() {
        const nameInput = document.getElementById('register-name');
        const emailInput = document.getElementById('register-email');
        const passwordInput = document.getElementById('register-password');
        
        if (!nameInput || !emailInput || !passwordInput) {
            console.error('Элементы формы регистрации не найдены');
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!name || !email || !password) {
            this.showNotification('Пожалуйста, заполните все поля', 'warning');
            return;
        }

        this.authenticateUser({
            id: 'user_' + Date.now(),
            name: name,
            email: email,
            avatar: name.charAt(0).toUpperCase(),
            level: 1,
            points: 0
        });
    }

    handleDemoLogin() {
        this.authenticateUser({
            id: 'demo_user',
            name: 'Демо Пользователь',
            email: 'demo@ecoscan.kz',
            avatar: 'Д',
            level: 3,
            points: 150
        });
    }

    authenticateUser(user) {
        this.isAuthenticated = true;
        this.currentUser = user;
        this.userPoints = user.points;
        this.userStats.level = user.level;

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('ecoPoints', user.points.toString());

        this.hideAuthScreen();
        this.showSplashScreen();
        
        this.showNotification(`Добро пожаловать, ${user.name}!`, 'success');
    }

    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('currentUser');
        
        window.location.reload();
    }

    showSplashScreen() {
        const splashScreen = document.getElementById('splash-screen');
        const app = document.getElementById('app');
        
        splashScreen.classList.remove('hidden');
        app.classList.add('hidden');
        
        setTimeout(() => {
            this.hideSplashScreen();
        }, 3000);
    }

    hideSplashScreen() {
        const splashScreen = document.getElementById('splash-screen');
        const app = document.getElementById('app');
        
        splashScreen.classList.add('hidden');
        app.classList.remove('hidden');
        
        this.initModules();
    }

    initModules() {
        if (window.WasteScanner) {
            this.scanner = new WasteScanner();
            window.wasteScanner = this.scanner; // Делаем доступным глобально
        }
        
        if (window.LocationMapper) {
            this.mapper = new LocationMapper();
        }
        
        // Инициализация достижений
        if (window.AchievementManager) {
            this.achievements = new AchievementManager();
        }
        
        // Инициализация сообщества
        if (window.CommunityManager) {
            this.community = new CommunityManager();
        }
    }

    setupEventListeners() {
        // События авторизации (устанавливаются всегда)
        this.setupAuthEvents();
        
        // Навигация между экранами (исключаем кнопку поддержки)
        const navButtons = document.querySelectorAll('.nav-btn:not(.donation-nav-btn)');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetScreen = btn.dataset.screen;
                this.switchScreen(targetScreen);
                this.updateNavigation(btn);
            });
        });

        // Кнопка "Найти пункт приема"
        const findLocationBtn = document.getElementById('find-location-btn');
        if (findLocationBtn) {
            findLocationBtn.addEventListener('click', () => {
                this.switchScreen('map-screen');
                this.updateNavigation(document.querySelector('[data-screen="map-screen"]'));
            });
        }

        // Кнопка "Назад к сканированию"
        const backToScanBtn = document.getElementById('back-to-scan');
        if (backToScanBtn) {
            backToScanBtn.addEventListener('click', () => {
                this.switchScreen('scan-screen');
                this.updateNavigation(document.querySelector('[data-screen="scan-screen"]'));
            });
        }

        this.setupModalEvents();
        this.setupCommunityTabs();

        const donationBtn = document.getElementById('donation-btn');
        if (donationBtn) {
            donationBtn.addEventListener('click', () => {
                this.showDonationModal();
            });
        }

        // Кнопка выхода
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Кнопка "Узнать подробнее"
        const learnMoreBtn = document.getElementById('learn-more-btn');
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => {
                this.showWasteInfoScreen();
            });
        }

        // Кнопка "Назад к результату"
        const backToResultBtn = document.getElementById('back-to-result');
        if (backToResultBtn) {
            backToResultBtn.addEventListener('click', () => {
                this.switchScreen('scan-screen');
                document.getElementById('scan-result').style.display = 'block';
            });
        }

        // Настройка вкладок информации о мусоре
        this.setupWasteInfoTabs();
    }

    setupWasteInfoTabs() {
        const wasteTabs = document.querySelectorAll('.waste-tab');
        wasteTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchWasteTab(tabName);
            });
        });
    }

    switchWasteTab(tabName) {
        // Убрать активный класс со всех вкладок
        const wasteTabs = document.querySelectorAll('.waste-tab');
        wasteTabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // Скрыть все панели
        const tabPanes = document.querySelectorAll('.waste-tab-pane');
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
        });

        // Активировать выбранную вкладку и панель
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        const activePane = document.getElementById(`${tabName}-tab`);
        
        if (activeTab && activePane) {
            activeTab.classList.add('active');
            activePane.classList.add('active');
        }
    }

    showWasteInfoScreen() {
        // Используем тип мусора из последнего сканирования
        const wasteType = this.currentWasteType || 'glass_bottle';
        
        const wasteData = this.wasteDatabase[wasteType];
        if (!wasteData) {
            console.error('Waste type not found:', wasteType);
            // Используем стеклянную бутылку по умолчанию
            const defaultData = this.wasteDatabase['glass_bottle'];
            if (defaultData) {
                this.fillWasteInfo(defaultData);
            }
            return;
        }

        this.fillWasteInfo(wasteData);
        
        // Переключаемся на экран
        this.switchScreen('waste-info-screen');
    }

    fillWasteInfo(wasteData) {
        // Заполняем основную информацию
        document.getElementById('waste-title').textContent = `Подробно: ${wasteData.name}`;
        document.getElementById('waste-name').textContent = wasteData.name;
        document.getElementById('waste-category-text').textContent = wasteData.category;
        document.getElementById('recyclable-status').textContent = wasteData.recyclable 
            ? 'Подлежит переработке' : 'Не перерабатывается';
        
        const wasteImage = document.getElementById('waste-info-image');
        wasteImage.src = wasteData.image;
        wasteImage.alt = wasteData.name;

        // Заполняем контент вкладок
        this.fillWasteTabContent(wasteData);
    }

    fillWasteTabContent(wasteData) {
        // История
        document.getElementById('history-content').innerHTML = wasteData.history.content;

        // Применение
        document.getElementById('usage-content').innerHTML = wasteData.usage.content;

        // Переработка
        document.getElementById('recycling-content').innerHTML = wasteData.recycling.content;
        
        // Шаги переработки
        const processSteps = document.getElementById('process-steps');
        processSteps.innerHTML = '';
        wasteData.recycling.steps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'process-step';
            stepDiv.innerHTML = `
                <div class="step-number">${index + 1}</div>
                <div class="step-icon">
                    <i class="${step.icon}"></i>
                </div>
                <div class="step-title">${step.title}</div>
                <div class="step-description">${step.description}</div>
            `;
            processSteps.appendChild(stepDiv);
        });

        // Воздействие на природу
        document.getElementById('impact-content').innerHTML = wasteData.impact.content;
        document.getElementById('decomposition-time').textContent = wasteData.impact.decompositionTime;
        document.getElementById('co2-production').textContent = wasteData.impact.co2Production;
        document.getElementById('water-usage').textContent = wasteData.impact.waterUsage;

        // Факты
        const factsGrid = document.getElementById('facts-grid');
        factsGrid.innerHTML = '';
        wasteData.facts.forEach(fact => {
            const factCard = document.createElement('div');
            factCard.className = 'fact-card';
            factCard.innerHTML = `
                <div class="fact-icon">
                    <i class="${fact.icon}"></i>
                </div>
                <div class="fact-text">${fact.text}</div>
            `;
            factsGrid.appendChild(factCard);
        });

        // Инфографика
        const infographicContainer = document.getElementById('infographic-container');
        infographicContainer.innerHTML = '';
        wasteData.infographic.forEach(item => {
            const infographicItem = document.createElement('div');
            infographicItem.className = 'infographic-item';
            infographicItem.innerHTML = `
                <div class="infographic-icon">
                    <i class="${item.icon}"></i>
                </div>
                <span class="infographic-value">${item.value}</span>
                <div class="infographic-label">${item.label}</div>
            `;
            infographicContainer.appendChild(infographicItem);
        });
    }

    setupModalEvents() {
        const modalOverlay = document.getElementById('modal-overlay');
        const createPostBtn = document.getElementById('create-post-btn');
        const modalClose = document.querySelector('.modal-close');
        const modalCancel = document.querySelector('.modal-cancel');

        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => {
                this.showModal('create-post-modal');
            });
        }

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.hideModal();
            });
        }

        if (modalCancel) {
            modalCancel.addEventListener('click', () => {
                this.hideModal();
            });
        }

        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.hideModal();
                }
            });
        }
    }

    setupCommunityTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
                this.updateTabNavigation(btn);
            });
        });
    }

    switchScreen(screenId) {
        // Скрыть все экраны
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });

        // Показать целевой экран
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }

        // Вызвать соответствующие методы модулей
        this.handleScreenSwitch(screenId);
    }

    handleScreenSwitch(screenId) {
        switch (screenId) {
            case 'scan-screen':
                if (this.scanner) {
                    this.scanner.initCamera();
                }
                break;
            case 'map-screen':
                if (this.mapper) {
                    this.mapper.loadMap();
                    this.mapper.findNearbyLocations();
                }
                break;
            case 'achievements-screen':
                if (this.achievements) {
                    this.achievements.updateDisplay();
                }
                break;
            case 'community-screen':
                if (this.community) {
                    this.community.loadFeed();
                }
                break;
        }
    }

    updateNavigation(activeBtn) {
        const navButtons = document.querySelectorAll('.nav-btn:not(.donation-nav-btn)');
        navButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (activeBtn && !activeBtn.classList.contains('donation-nav-btn')) {
            activeBtn.classList.add('active');
        }
    }

    switchTab(tabName) {
        // Скрыть все вкладки
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
        });

        // Показать целевую вкладку
        const targetPane = document.getElementById(`${tabName}-tab`);
        if (targetPane) {
            targetPane.classList.add('active');
        }

        // Загрузить соответствующий контент
        if (this.community) {
            switch (tabName) {
                case 'feed':
                    this.community.loadFeed();
                    break;
                case 'events':
                    this.community.loadEvents();
                    break;
                case 'leaderboard':
                    this.community.loadLeaderboard();
                    break;
            }
        }
    }

    updateTabNavigation(activeBtn) {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    showModal(modalId) {
        const modalOverlay = document.getElementById('modal-overlay');
        const modal = document.getElementById(modalId);
        
        if (modalOverlay && modal) {
            modalOverlay.classList.remove('hidden');
            modal.style.display = 'block';
        }
    }

    hideModal() {
        const modalOverlay = document.getElementById('modal-overlay');
        modalOverlay.classList.add('hidden');
    }

    updateUserInterface() {
        // Обновить отображение очков
        const pointsElement = document.getElementById('user-points');
        if (pointsElement) {
            pointsElement.textContent = this.userPoints;
        }

        // Обновить имя пользователя
        const userNameElement = document.getElementById('user-name');
        if (userNameElement && this.currentUser) {
            userNameElement.textContent = this.currentUser.name;
        }

        // Обновить статистику
        const totalScansElement = document.getElementById('total-scans');
        const totalPointsElement = document.getElementById('total-points');
        const ecoLevelElement = document.getElementById('eco-level');

        if (totalScansElement) {
            totalScansElement.textContent = this.userStats.scans;
        }
        if (totalPointsElement) {
            totalPointsElement.textContent = this.userPoints;
        }
        if (ecoLevelElement) {
            ecoLevelElement.textContent = this.userStats.level;
        }
    }

    addPoints(points, reason = '') {
        this.userPoints += points;
        localStorage.setItem('ecoPoints', this.userPoints.toString());
        this.updateUserInterface();
        
        // Показать уведомление о начислении очков
        this.showNotification(`+${points} очков за ${reason}`, 'success');
        
        // Проверить достижения
        if (this.achievements) {
            this.achievements.checkAchievements();
        }
    }

    incrementScanCount() {
        this.userStats.scans++;
        
        // Повышение уровня каждые 10 сканирований
        const newLevel = Math.floor(this.userStats.scans / 10) + 1;
        if (newLevel > this.userStats.level) {
            this.userStats.level = newLevel;
            this.showNotification(`Поздравляем! Вы достигли ${newLevel} эко-уровня!`, 'success');
            this.addPoints(newLevel * 50, 'повышение уровня');
        }
        
        localStorage.setItem('userStats', JSON.stringify(this.userStats));
        this.updateUserInterface();
    }

    showNotification(message, type = 'info') {
        // Создать элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Добавить стили
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1.2rem 1.8rem',
            borderRadius: '15px',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.95rem',
            zIndex: '9999',
            animation: 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            maxWidth: '350px',
            wordWrap: 'break-word',
            position: 'relative',
            overflow: 'hidden'
        });

        // Установить цвет в зависимости от типа
        switch (type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                break;
            case 'warning':
                notification.style.background = 'linear-gradient(135deg, #FF9800, #f57c00)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, #F44336, #d32f2f)';
                break;
            default:
                notification.style.background = 'linear-gradient(135deg, #2196F3, #1976d2)';
        }

        // Добавить на страницу
        document.body.appendChild(notification);

        // Удалить через 4 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, 4000);
    }

    // Метод для обработки результатов сканирования
    handleScanResult(wasteData) {
        // Увеличить счетчик сканирований
        this.incrementScanCount();
        
        // Начислить очки за сканирование
        this.addPoints(10, 'сканирование отхода');
        
        // Показать результат
        this.showScanResult(wasteData);
    }

    showScanResult(wasteData) {
        // Сохраняем информацию о текущем типе мусора для страницы подробностей
        if (wasteData.key) {
            this.currentWasteType = wasteData.key;
        } else {
            // Попытка определить тип по имени для обратной совместимости
            if (wasteData.name && wasteData.name.includes('Стеклянная')) {
                this.currentWasteType = 'glass_bottle';
            } else if (wasteData.name && wasteData.name.includes('Пластиковая')) {
                this.currentWasteType = 'plastic_bottle';
            } else {
                this.currentWasteType = 'glass_bottle'; // По умолчанию
            }
        }

        const scanResult = document.getElementById('scan-result');
        const scannedImage = document.getElementById('scanned-image');
        const wasteType = document.getElementById('waste-type');
        const wasteMaterial = document.getElementById('waste-material');
        const instructionsList = document.getElementById('instructions-list');

        // Заполнить данными
        if (scannedImage && wasteData.image) {
            scannedImage.src = wasteData.image;
        }
        
        if (wasteType) {
            wasteType.textContent = wasteData.name || wasteData.type || 'Неопределенный тип';
        }
        
        if (wasteMaterial) {
            wasteMaterial.textContent = wasteData.material || 'Материал не определен';
        }

        if (instructionsList && wasteData.instructions) {
            instructionsList.innerHTML = '';
            wasteData.instructions.forEach(instruction => {
                const li = document.createElement('li');
                li.textContent = instruction;
                instructionsList.appendChild(li);
            });
        }

        // Показать результат
        if (scanResult) {
            scanResult.classList.remove('hidden');
            scanResult.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Утилиты
    formatDate(date) {
        return new Intl.DateTimeFormat('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Функция пожертвований
    showDonationModal() {
        const modal = document.createElement('div');
        modal.className = 'donation-modal';
        modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Поддержать EcoScan</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="donation-info">
                            <i class="fas fa-heart donation-heart"></i>
                            <h4>Помогите сделать мир чище!</h4>
                            <p>Ваши пожертвования помогают развивать экологические проекты в Актау и улучшать систему переработки отходов.</p>
                        </div>
                        
                        <div class="donation-amounts">
                            <button class="amount-btn" data-amount="1000">1,000 ₸</button>
                            <button class="amount-btn" data-amount="2500">2,500 ₸</button>
                            <button class="amount-btn" data-amount="5000">5,000 ₸</button>
                            <button class="amount-btn" data-amount="10000">10,000 ₸</button>
                        </div>
                        
                        <div class="custom-amount">
                            <label for="custom-amount-input">Другая сумма:</label>
                            <input type="number" id="custom-amount-input" placeholder="Введите сумму в тенге" min="100">
                        </div>
                        
                        <div class="donation-methods">
                            <h5>Способы оплаты:</h5>
                            <div class="payment-methods">
                                <button class="payment-btn" data-method="kaspi">
                                    <i class="fas fa-credit-card"></i>
                                    Kaspi Pay
                                </button>
                                <button class="payment-btn" data-method="bank">
                                    <i class="fas fa-university"></i>
                                    Банковская карта
                                </button>
                                <button class="payment-btn" data-method="wallet">
                                    <i class="fas fa-wallet"></i>
                                    Электронный кошелек
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="make-donation" class="btn btn-primary">
                            <i class="fas fa-heart"></i>
                            Пожертвовать
                        </button>
                        <button class="modal-cancel btn btn-secondary">Отмена</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        let selectedAmount = 0;
        let selectedMethod = '';

        // Обработчики для выбора суммы
        const amountBtns = modal.querySelectorAll('.amount-btn');
        amountBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                amountBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedAmount = parseInt(btn.dataset.amount);
                document.getElementById('custom-amount-input').value = '';
            });
        });

        // Обработчик для кастомной суммы
        const customInput = modal.querySelector('#custom-amount-input');
        customInput.addEventListener('input', () => {
            amountBtns.forEach(b => b.classList.remove('selected'));
            selectedAmount = parseInt(customInput.value) || 0;
        });

        // Обработчики для способов оплаты
        const paymentBtns = modal.querySelectorAll('.payment-btn');
        paymentBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                paymentBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedMethod = btn.dataset.method;
            });
        });

        // Показать модальное окно
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Обработчик закрытия
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
        modal.querySelector('.modal-backdrop').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-backdrop')) {
                closeModal();
            }
        });

        // Обработчик пожертвования
        modal.querySelector('#make-donation').addEventListener('click', () => {
            if (selectedAmount < 100) {
                this.showNotification('Минимальная сумма пожертвования 100 ₸', 'warning');
                return;
            }
            
            if (!selectedMethod) {
                this.showNotification('Выберите способ оплаты', 'warning');
                return;
            }

            this.processDonation(selectedAmount, selectedMethod);
            closeModal();
        });
    }

    processDonation(amount, method) {
        // Симуляция процесса пожертвования
        this.showNotification('Обрабатываем платеж...', 'info');
        
        setTimeout(() => {
            // Симуляция успешного платежа
            const donationHistory = JSON.parse(localStorage.getItem('donationHistory') || '[]');
            const donation = {
                id: this.generateId(),
                amount: amount,
                method: method,
                date: new Date().toISOString(),
                status: 'completed'
            };
            
            donationHistory.push(donation);
            localStorage.setItem('donationHistory', JSON.stringify(donationHistory));
            
            // Начислить бонусные очки за пожертвование
            const bonusPoints = Math.floor(amount / 100); // 1 очко за каждые 100 тенге
            this.addPoints(bonusPoints, 'пожертвование на экологию');
            
            this.showNotification(`Спасибо за пожертвование ${amount.toLocaleString()} ₸! 💚`, 'success');
            
            // Показать благодарность
            this.showThankYouMessage(amount);
        }, 2000);
    }

    showThankYouMessage(amount) {
        const thankYouModal = document.createElement('div');
        thankYouModal.className = 'thank-you-modal';
        thankYouModal.innerHTML = `
            <div class="thank-you-content">
                <div class="thank-you-animation">
                    <i class="fas fa-heart"></i>
                </div>
                <h2>Благодарим вас!</h2>
                <p>Ваше пожертвование в размере <strong>${amount.toLocaleString()} ₸</strong> поможет:</p>
                <ul class="impact-list">
                    <li><i class="fas fa-recycle"></i> Установить новые контейнеры для сортировки в Актау</li>
                    <li><i class="fas fa-seedling"></i> Озеленить городские территории</li>
                    <li><i class="fas fa-graduation-cap"></i> Провести экологическое обучение в школах</li>
                </ul>
                <button class="btn btn-primary close-thank-you">Продолжить</button>
            </div>
        `;

        document.body.appendChild(thankYouModal);
        
        setTimeout(() => {
            thankYouModal.classList.add('show');
        }, 10);

        thankYouModal.querySelector('.close-thank-you').addEventListener('click', () => {
            thankYouModal.classList.remove('show');
            setTimeout(() => {
                if (thankYouModal.parentNode) {
                    thankYouModal.parentNode.removeChild(thankYouModal);
                }
            }, 300);
        });

        // Автозакрытие через 8 секунд
        setTimeout(() => {
            if (thankYouModal.parentNode) {
                thankYouModal.querySelector('.close-thank-you').click();
            }
        }, 8000);
    }
}

// Добавить CSS для анимаций уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        backdrop-filter: blur(10px) !important;
        border: 1px solid rgba(255,255,255,0.2) !important;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    }
    
    .notification::before {
        content: '';
        position: absolute;
        top: 0;
        left: -50%;
        width: 200%;
        height: 100%;
        background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
        animation: shimmer 2s infinite;
        pointer-events: none;
    }
    
    @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
`;
document.head.appendChild(notificationStyles);


document.addEventListener('DOMContentLoaded', () => {

    // localStorage.clear();
    
    console.log('DOM загружен, создаем приложение');
    window.ecoScanApp = new EcoScanApp();
});


window.EcoScanApp = EcoScanApp;
