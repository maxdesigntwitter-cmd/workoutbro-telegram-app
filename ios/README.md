# WorkoutBroClub iOS App

Комплексное iOS-приложение для отслеживания тренировок, питания и восстановления с интеграцией Apple Health.

## 🎯 Основные функции

### Тренировки
- Создание программ тренировок с упражнениями и подходами
- Таймер отдыха между подходами с уведомлениями
- Импорт тренировок из Apple Health/Apple Watch
- Отслеживание прогресса и PR (личных рекордов)

### Питание
- Учет калорий и БЖУ (белки, жиры, углеводы)
- Быстрый ввод продуктов с избранными
- Отслеживание добавок (протеин, креатин и др.)
- Дневные цели по калориям и белку

### Восстановление
- Расчет Recovery Score на основе сна, HRV и нагрузки
- Синхронизация данных из Apple Health
- Графики трендов восстановления
- Рекомендации по улучшению восстановления

### Аналитика
- Графики объема тренировок
- Тренды показателей здоровья
- История питания и восстановления
- Достижения и статистика

## 🏗️ Архитектура

### Технологический стек
- **Язык**: Swift 5.10+
- **UI**: SwiftUI
- **Хранилище**: Core Data
- **Здоровье**: HealthKit
- **Уведомления**: UserNotifications
- **Тестирование**: XCTest

### Структура проекта
```
WorkoutBroClub/
├── App/
│   └── WorkoutBroClubApp.swift
├── Features/
│   ├── Dashboard/
│   ├── Workouts/
│   ├── Nutrition/
│   ├── Recovery/
│   ├── History/
│   └── Settings/
├── Models/
│   └── WorkoutBroClub.xcdatamodeld
├── Services/
│   ├── RecoveryEngine.swift
│   ├── TimerService.swift
│   └── NotificationService.swift
├── Health/
│   ├── HealthStore.swift
│   └── HealthSyncService.swift
├── Persistence/
│   └── PersistenceController.swift
└── UIComponents/
    └── RestTimerView.swift
```

## 📱 Требования

- iOS 17.0+
- Xcode 15.0+
- Swift 5.10+

## 🚀 Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd WorkoutBroClub
```

2. Откройте проект в Xcode:
```bash
open WorkoutBroClub.xcodeproj
```

3. Выберите симулятор или устройство и нажмите Run (⌘+R)

## 🔧 Настройка

### HealthKit
Приложение требует разрешения на доступ к следующим типам данных HealthKit:
- `HKWorkoutType` - тренировки
- `HKQuantityType(.heartRate)` - пульс
- `HKQuantityType(.heartRateVariabilitySDNN)` - HRV
- `HKQuantityType(.activeEnergyBurned)` - активная энергия
- `HKQuantityType(.stepCount)` - шаги
- `HKCategoryType(.sleepAnalysis)` - сон

### Уведомления
Приложение использует локальные уведомления для:
- Таймера отдыха между подходами
- Напоминаний о питании
- Напоминаний о сне
- Уведомлений о достижениях

## 📊 Модель данных

### Основные сущности Core Data

#### Program
Программа тренировок, содержащая несколько тренировочных планов.

#### WorkoutPlan
Отдельная тренировка в рамках программы (например, "День 1: Грудь и трицепс").

#### ExerciseTemplate
Шаблон упражнения с настройками по умолчанию (отдых, целевая мышца).

#### WorkoutSession
Завершенная тренировка с метаданными (дата, длительность, калории, пульс).

#### ExerciseSet
Отдельный подход с весом, повторениями, RPE и временем отдыха.

#### FoodEntry
Запись о съеденном продукте с калориями и БЖУ.

#### SupplementEntry
Запись о принятой добавке.

#### RecoveryDaily
Ежедневные данные восстановления (сон, HRV, пульс, Recovery Score).

#### Goal
Цели пользователя (калории, белки, шаги, объем тренировок).

#### Achievement
Достижения пользователя.

## 🧮 Recovery Score

Recovery Score рассчитывается по формуле:
```
Score = 100 * (0.40 * SleepNorm + 0.35 * HRVNorm + 0.25 * (1 - LoadNorm))
```

Где:
- **SleepNorm**: Нормализация сна (0-1, где 8+ часов = 1)
- **HRVNorm**: Нормализация HRV относительно медианы за 30 дней
- **LoadNorm**: Нормализация нагрузки (обратная зависимость)

## 🧪 Тестирование

Запуск тестов:
```bash
# Все тесты
xcodebuild test -scheme WorkoutBroClub -destination 'platform=iOS Simulator,name=iPhone 15'

# Только unit тесты
xcodebuild test -scheme WorkoutBroClub -destination 'platform=iOS Simulator,name=iPhone 15' -only-testing:WorkoutBroClubTests
```

### Покрытие тестами
- RecoveryEngine: расчет Recovery Score
- Нормализация компонентов (сон, HRV, нагрузка)
- Границы значений (0-100)
- Edge cases

## 📝 Разработка

### Добавление новой функции
1. Создайте новую папку в `Features/`
2. Добавьте View, ViewModel (если нужен) и необходимые модели
3. Обновите `ContentView.swift` для навигации
4. Добавьте тесты для бизнес-логики

### Работа с Core Data
1. Изменения в модели данных делайте в `WorkoutBroClub.xcdatamodeld`
2. Используйте `PersistenceController.shared` для доступа к контексту
3. Все операции с Core Data должны быть в `do-catch` блоках

### HealthKit интеграция
1. Новые типы данных добавляйте в `HealthStore.swift`
2. Синхронизацию реализуйте в `HealthSyncService.swift`
3. Не забывайте обновлять разрешения в `Info.plist`

## 🔒 Приватность и безопасность

- Все данные хранятся локально в Core Data
- HealthKit данные синхронизируются только с разрешения пользователя
- Никакие персональные данные не передаются на внешние серверы
- Поддержка экспорта данных в CSV/JSON для резервного копирования

## 🚧 Roadmap

### MVP (Текущая версия)
- ✅ Базовая структура приложения
- ✅ Core Data модели
- ✅ HealthKit интеграция
- ✅ Recovery Score расчет
- ✅ Таймер отдыха
- ✅ Основные экраны

### Будущие версии
- [ ] Apple Watch приложение
- [ ] Облачная синхронизация
- [ ] Экспорт/импорт данных
- [ ] Внешние API продуктов
- [ ] ML рекомендации
- [ ] Социальные функции

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

Если у вас есть вопросы или проблемы:
1. Проверьте [Issues](../../issues)
2. Создайте новый Issue с подробным описанием
3. Для срочных вопросов: [email]

---

**WorkoutBroClub** - Ваш персональный тренер в кармане! 💪

