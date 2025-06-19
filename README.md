projectsx/
├── .idea/                  # WebStorm configuration 
├── node_modules/           # Node.js зависимости
├── sessions/               # хранилище сессий
├── src/                    
│   ├── config/             # файлы конфигурации бд сессии паспорт
│   ├── db/                 #бд
│   │   ├── models/         # модели бд
│   ├               
│   ├── middleware/         # Middleware функции
│   ├── routes/             # API routes
│   └── views/              # Static views or templates
├── .env                    # Environment variables
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Docker build instructions
├── index.js                # Entry point of the application
├── nginx.conf              # Nginx configuration




Документация по API (Swagger)
URL: http://localhost:8000/api-docs (при работе с Docker Compose и Nginx).
Локальная разработка: http://localhost:3000/api-docs 
Документация включает в себя конечные точки для:
Создания задачи 
Обновления статуса задачи 
Удаление задачи 
Создания Проекта
Удаление проекта назначение на проект участников
Регистрация 
авторизация
выход



Было реализовано middleware для проверки ролей и проверки авторизации


