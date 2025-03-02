# Настройка GitHub репозитория

Для настройки автоматического деплоя через GitHub Actions вам необходимо настроить GitHub репозиторий. Ниже приведены подробные инструкции.

## 1. Создание GitHub репозитория

Если у вас еще нет GitHub репозитория для проекта:

1. Войдите в свой аккаунт GitHub: [https://github.com/login](https://github.com/login)
2. Нажмите на "+" в правом верхнем углу и выберите "New repository"
3. Введите название репозитория (например, "places-explorer")
4. Выберите тип репозитория (публичный или приватный)
5. Нажмите "Create repository"

## 2. Привязка локального репозитория к GitHub

Если ваш проект уже инициализирован как Git-репозиторий, выполните следующие команды:

```bash
# Добавьте удаленный репозиторий
git remote add origin https://github.com/yourusername/places-explorer.git

# Отправьте код в репозиторий
git push -u origin main
```

Если ваш проект еще не инициализирован как Git-репозиторий:

```bash
# Инициализируйте Git-репозиторий
git init

# Добавьте все файлы
git add .

# Создайте первый коммит
git commit -m "Initial commit"

# Добавьте удаленный репозиторий
git remote add origin https://github.com/yourusername/places-explorer.git

# Отправьте код в репозиторий
git push -u origin main
```

## 3. Настройка защиты ветки main (опционально)

Для обеспечения качества кода вы можете настроить защиту ветки `main`:

1. Перейдите в настройки репозитория на GitHub
2. Выберите "Branches" в левом меню
3. В разделе "Branch protection rules" нажмите "Add rule"
4. В поле "Branch name pattern" введите `main`
5. Настройте правила защиты:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Include administrators
6. Нажмите "Create"

## 4. Настройка GitHub Actions

GitHub Actions уже настроены в этом проекте. Файл конфигурации находится в `.github/workflows/vercel-deploy.yml`. Для активации GitHub Actions:

1. Перейдите на вкладку "Actions" в вашем GitHub репозитории
2. Нажмите "I understand my workflows, go ahead and enable them"

## 5. Добавление секретов для Vercel

Для работы GitHub Actions с Vercel вам необходимо добавить секреты в репозиторий:

1. Перейдите в настройки репозитория на GitHub
2. Выберите "Secrets and variables" -> "Actions" в левом меню
3. Нажмите "New repository secret"
4. Добавьте следующие секреты:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

Подробные инструкции по получению этих значений находятся в файле `VERCEL_SETUP.md`. 