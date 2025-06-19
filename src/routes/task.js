// routes/project.js (или routes/task.js)
const express = require('express');
const router = express.Router();
const { Project, ProjectMember, Task, User} = require('../config/db');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');



/**
 * @swagger
 * /project/{projectId}/createTasks:
 *   post:
 *     summary: Создание новой задачи в проекте
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID проекта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Новая задача"
 *                 description: Заголовок задачи (обязательное поле)
 *               description:
 *                 type: string
 *                 example: "Описание задачи"
 *                 description: Описание задачи (опционально)
 *               assignee_id:
 *                 type: integer
 *                 example: 2
 *                 description: ID участника для назначения (опционально)
 *     responses:
 *       201:
 *         description: Задача успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Задача создана"
 *                 task:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Новая задача"
 *                     description:
 *                       type: string
 *                       example: "Описание задачи"
 *                     status:
 *                       type: string
 *                       example: "todo"
 *       400:
 *         description: Неверные данные (нет прав или отсутствует заголовок)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Нет прав назначать задачи в этом проекте"
 *       403:
 *         description: Нет прав для создания задачи
 *       404:
 *         description: Проект не найден
 *       500:
 *         description: Ошибка сервера
 */

router.post('/project/:projectId/createTasks', auth, checkRole('manager'), async (req, res) => {
    const { projectId } = req.params;
    const { title, description, assignee_id } = req.body;


    if (!title || typeof title !== 'string' || title.trim().length < 1) {
        return res.status(403).json({ error: "Отсутствует или неверный заголовок задачи" });
    }

    try {

        const user = await ProjectMember.findOne({ where: { project_id: projectId, user_id: req.user.id } });
        if (!user) {
            return res.status(400).json({ error: "Нет прав назначать задачи в этом проекте" });
        }

        const project = await Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ error: "Проект не найден" });

        }


        if (assignee_id) {
            const member = await ProjectMember.findOne({ where: { project_id: projectId, user_id: assignee_id } });
            if (!member) {
                return res.status(400).json({ error: "Указанный участник не состоит в проекте" });
            }
            else{
                const task = await Task.create({
                    title: title.trim(),
                    description: description ? description.trim() : null,
                    project_id: projectId,
                    assignee_id: assignee_id
                });

                return res.status(201).json({ message: "Задача создана", task: {
                        id: task.id,
                        title: task.title,
                        description: task.description,
                        status: task.status
                    }});

            }
        }

    } catch (error) {
        console.error('Ошибка создания задачи:', error);
        return res.status(500).json({ error: "Ошибка сервера" });
    }
});


/**
 * @swagger
 * /projects/{projectId}/tasks/{taskId}/status:
 *   patch:
 *     summary: Обновление статуса задачи
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID проекта
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID задачи
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *                 example: "in_progress"
 *                 description: Новый статус задачи
 *     responses:
 *       200:
 *         description: Статус задачи успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Статус задачи обновлен"
 *                 task:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       example: "in_progress"
 *       400:
 *         description: Неверный статус
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Неверный статус. Допустимые значения: todo, in_progress, done"
 *       403:
 *         description: Нет прав для изменения статуса
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Только назначенный исполнитель может изменить статус"
 *       404:
 *         description: Задача не найдена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Задача не найдена"
 *       500:
 *         description: Ошибка сервера
 */
router.patch('/projects/:projectId/tasks/:taskId/status', auth, async (req, res) => {
    const { projectId, taskId } = req.params;
    const { status } = req.body;
    const validStatuses = ['todo', 'in_progress', 'done'];


    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: "Неверный статус. Допустимые значения: todo, in_progress, done" });

    }
    try {
        const task = await Task.findOne({ where: { id: taskId, project_id: projectId } });
        if (!task) {
            return res.status(404).json({ error: "Задача не найдена" });
        }

        if (task.assignee_id !== req.user.id) {
            return res.status(403).json({ error: "Только назначенный исполнитель может изменить статус" });

        }

        task.status = status;
        await task.save();

        return res.status(200).json({ message: "Статус задачи обновлен", task: { id: task.id, status: task.status } });

    } catch (error) {
        return res.status(500).json({ error: "Ошибка сервера" });
    }
});

/**
 * @swagger
 * /projects/{projectId}/tasks/{taskId}:
 *   delete:
 *     summary: Удаление задачи проекта
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID проекта
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID задачи
 *     responses:
 *       200:
 *         description: Задача успешно удалена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Задача успешно удалена"
 *                 task_id:
 *                   type: integer
 *                   example: 5
 *       400:
 *         description: Неверный формат ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Неверный формат ID проекта или задачи"
 *       403:
 *         description: Нет прав доступа (только менеджер проекта)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Только менеджер может удалять задачу"
 *       404:
 *         description: Проект или задача не найдены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Задача не найдена"
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Ошибка при удалении задачи"
 */
router.delete('/projects/:projectId/tasks/:taskId', auth, async (req, res) => {
    const { projectId, taskId } = req.params;

    if (isNaN(projectId) || isNaN(taskId)) {
        return res.status(400).json({ error: "Неверный формат ID проекта или задачи" });
    }

    try {
        // Поиск менеджера проекта
        const manager = await ProjectMember.findOne({
            where: { project_id: projectId },
            include: [{
                model: User,
                where: { role: 'manager' },
                required: true,
                attributes: ['id', 'name', 'email', 'role']
            }]
        });


        if (!manager || manager.User.id !== req.user.id) {
            return res.status(403).json({ error: "Только менеджер может удалять задачу" });
        }

        const task = await Task.findByPk(taskId);
        if (task) await task.destroy();

        return res.status(200).json({ message: "Задача успешно удалена" });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
});

module.exports = router;