# 🎉 Content Reactor - Финальная настройка

## ✅ Что уже готово:

1. **Приложение установлено** в `/Applications/Content Reactor.app`
2. **Ярлык на рабочем столе** - `Content Reactor.command`
3. **Универсальная версия** - `Content Reactor - Universal.command`

## 🚀 Как добавить в Dock:

### Автоматически:
```bash
./add_to_dock.sh
```

### Вручную:
1. **Откройте Applications** (Finder → Applications)
2. **Найдите "Content Reactor"**
3. **Перетащите иконку** в Dock (слева от разделителя)
4. **Готово!** Теперь можно запускать одним кликом

## 📱 Способы запуска:

### 1. Из Dock ⭐ (Рекомендуется)
- **Кликните** на иконку в Dock
- **Быстро и удобно**

### 2. Из Applications
- **Applications** → **Content Reactor**
- **Двойной клик**

### 3. Через Spotlight
- **Cmd + Space** → введите "Content Reactor"
- **Enter**

### 4. С рабочего стола
- **Двойной клик** на `Content Reactor.command`

## 🎯 Первый запуск:

1. **Кликните** на иконку в Dock или Applications
2. **macOS может спросить разрешение** - нажмите "Открыть"
3. **Приложение откроется** в браузере на `http://localhost:8501`
4. **Для остановки** закройте браузер

## 🔧 Если что-то не работает:

### "Приложение повреждено"
```bash
sudo xattr -d com.apple.quarantine "/Applications/Content Reactor.app"
```

### "Не найдена директория"
- Убедитесь, что папка `content_reactor` находится по пути:
  `/Users/imax/Local Sites/workoutbroclub/content_reactor`

### Переустановка:
```bash
./copy_to_applications.sh
```

## 🎨 Настройка Dock:

- **Изменить размер иконок**: правый клик на разделителе Dock
- **Убрать из Dock**: перетащите иконку из Dock
- **Изменить позицию**: перетащите иконку в нужное место

## 🎉 Готово!

Content Reactor теперь полностью интегрирован в macOS:
- ✅ **В Applications**
- ✅ **В Dock** (после добавления)
- ✅ **С уведомлениями**
- ✅ **С правильными иконками**

**Наслаждайтесь использованием!** 🚀








