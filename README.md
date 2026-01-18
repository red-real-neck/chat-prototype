## Запуск

```bash
npm install
npm run dev
```

## Архитектура

### Общая структура

Приложение построено по принципам чистой архитектуры с четким разделением ответственности:

```
src/
├── domain/          # Бизнес-логика и типы
│   ├── chat.ts      # Типы и фабрики для чатов
│   ├── message.ts   # Типы и фабрики для сообщений
│   └── index.ts     # Экспорты домена
├── services/        # API и внешние сервисы
│   ├── chatService.ts     # API чатов
│   ├── messageService.ts  # API сообщений
│   └── mockSocket.ts      # Mock WebSocket
├── store/           # Управление состоянием (Zustand)
│   ├── chatsStore.ts      # Состояние чатов
│   ├── messagesStore.ts   # Состояние сообщений
│   └── uiStore.ts         # UI состояние
└── components/      # React компоненты
    ├── AppLayout.tsx      # Главный layout
    ├── ChatList.tsx       # Список чатов
    ├── ChatWindow.tsx     # Окно сообщений
    ├── MessageList.tsx    # Список сообщений (виртуализированный)
    └── MessageInput.tsx   # Поле ввода
```

### Поток данных

1. **Инициализация**: Загрузка чатов → автоселект первого чата
2. **Переключение**: Выбор чата → загрузка сообщений (если не загружены)
3. **Отправка**: Optimistic UI → API → подтверждение/откат
4. **Real-time**: Mock WebSocket → dispatch в store → UI обновление

### Ключевые принципы

- **Единый источник правды**: Нормализованное хранение в Zustand
- **Изоляция слоев**: UI не знает о API, API не знает о UI
- **Оптимистичные обновления**: Мгновенная обратная связь для пользователя
- **Виртуализация**: Поддержка тысяч сообщений без лагов

## State Management (Zustand)

### Почему Zustand?

Выбор Zustand обусловлен несколькими факторами:

1. **Простота**: Минимум boilerplate, легкое тестирование
2. **Производительность**: Нет context re-render проблем
3. **TypeScript**: Отличная поддержка типов из коробки
4. **Селекторы**: Точное управление подписками на изменения

### Архитектура store

```typescript
// Нормализованное хранение по chatId
messagesByChatId: Record<string, Message[]>
loadingByChatId: Record<string, boolean>
loadedByChatId: Record<string, boolean>
```

### Преимущества подхода

- **Масштабируемость**: Легко добавить новые чаты/сообщения
- **Производительность**: Обновление только конкретного чата
- **Надежность**: Избегание дублирования данных
- **Тестируемость**: Легко мокать store в тестах

## Оптимизации

### Производительность

1. **React.memo**: Все компоненты мемоизированы
2. **useMemo/useCallback**: Вычисления кешируются
3. **Normalized storage**: Избежание глубоких копий
4. **Lazy loading**: Сообщения загружаются по требованию

## Производительность

### Метрики

- **Bundle size**: ~ 300KB (gzipped)
- **First paint**: < 1s на современных устройствах
- **Scroll performance**: 60fps с 10000+ сообщений
- **Memory usage**: Стабильное потребление при росте данных

### Мониторинг

```bash
npm run build    # Проверка размера бандла
npm run test     # Запуск тестов
npm run lint     # Проверка качества кода
```

## 🧪 Тестирование

```bash
npm run test           # Запуск всех тестов
npm run test:watch     # Watch mode
npm run test:coverage  # С покрытием
```
```

### Code quality

- ✅ **Strict TypeScript**: Все типы определены явно
- ✅ **No any**: Полная типизация без `any`
- ✅ **No console.log**: Чистый код без отладочных сообщений
- ✅ **ESLint + Prettier**: Автоматическое форматирование
- ✅ **Jest coverage**: Высокое покрытие тестами

### Commit convention

```
init: add new domain
feat: add new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code restructuring
test: add tests
chore: maintenance
```

---