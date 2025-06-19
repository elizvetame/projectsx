const express = require('express');
const router = express.Router();
const { Project, ProjectMember, User} = require('../config/db');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');


/**
* @swagger
* /addProjects:
*   post:
*     summary: Создание нового проекта
*     tags: [Projects]
*     security:
*       - cookieAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
    *             type: object
*             properties:
*               name:
    *                 type: string
*                 example: "Test Project"
*               description:
*                 type: string
*                 example: "Test Description"
*     responses:
*       201:
*         description: Проект успешно создан
*         content:
*           application/json:
*             schema:
    *               type: object
*               properties:
*                 message:
    *                   type: string
*                   example: "Проект создан"
*                 project:
*                   type: object
*                   properties:
*                     id:
    *                       type: integer
*                       example: 1
*                     name:
*                       type: string
*                       example: "Test Project"
*                     description:
*                       type: string
*                       example: "Test Description"
*       400:
*         description: Отсутствует название проекта
*         content:
*           application/json:
*             schema:
    *               type: object
*               properties:
*                 error:
    *                   type: string
*                   example: "Отсутствует название проекта"
*       401:
*         description: Не авторизован
*       403:
*         description: Нет прав доступа
*       500:
*         description: Ошибка сервера
*/
router.post('/addProjects', auth, checkRole('manager', 'team_lead'), async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ error: "Отсутствует название проекта" });
      return res.redirect('/');
    }
    try {
        const project = await Project.create({
            name,
            description,
            created_by: req.user.id
        });


        await ProjectMember.create({
            project_id: project.id,
            user_id: req.user.id,
        });


        res.status(201).json({ message: "Проект создан", project: { id: project.id, name: project.name, description: project.description, id_user: req.user.id} });

    } catch (error) {

        res.status(500).json({ error: "Ошибка сервера" });

    }
});

/**
 * @swagger
 * /project/{id}/addMember:
 *   post:
 *     summary: Добавление участника в проект
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               member_id:
 *                 type: integer
 *                 example: 2
 *                 description: ID пользователя для добавления
 *     responses:
 *       200:
 *         description: Участник успешно добавлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Участник успешно назначен"
 *                 project_id:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Неверный формат ID или дубликат участника
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Отсутствует ID участника или неверный формат"
 *       403:
 *         description: Нет прав доступа
 *       404:
 *         description: Проект или пользователь не найдены
 *       500:
 *         description: Ошибка сервера
 */
router.post('/project/:id/addMember', auth, checkRole('manager', 'team_lead'), async (req, res) => {
    const id = parseInt(req.params.id); // Преобразуем в число
    const { member_id } = req.body;


    if (!member_id || isNaN(member_id)) {
        return res.status(400).json({ error: "Отсутствует ID участника или неверный формат" });
    }

    if (isNaN(id)) {
        return res.status(400).json({ error: "Неверный формат ID проекта" });
    }

    try {
        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({ error: `Проект не найден: ${id}` });
        }

        const user = await User.findByPk(member_id);
        console.log('User found:', user ? user.toJSON() : null);
        if (!user) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        const isMember = await ProjectMember.findOne({ where: { project_id: id, user_id: req.user.id } });
        console.log('Is member:', isMember ? isMember.toJSON() : null);
        if (!isMember) {
            return res.status(403).json({ error: "Нет прав доступа" });
        }

        const existingMember = await ProjectMember.findOne({ where: { project_id: id, user_id: member_id } });

        if (existingMember) {
            return res.status(400).json({ error: "Участник уже назначен в проект" });
        }


        const newMember = await ProjectMember.create({
            project_id: id,
            user_id: member_id,
        });
        return res.status(200).json({ message: "Участник успешно назначен", project_id: id });
    } catch (error) {
        return res.status(500).json({ error: "Произошла внутренняя ошибка сервера" });
    }
});

/**
 * @swagger
 * /project/{id}:
 *   delete:
 *     summary: Удаление проекта
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID проекта
 *     responses:
 *       200:
 *         description: Проект успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Проект успешно удален"
 *                 project_id:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Неверный формат ID проекта
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Неверный формат ID проекта"
 *       403:
 *         description: Нет прав доступа (только создатель)
 *       404:
 *         description: Проект не найден
 *       500:
 *         description: Ошибка сервера
 */
router.delete('/project/:id', auth, async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Неверный формат ID проекта" });
    }

    try {
        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({ error: `Проект не найден: ${id}` });
        }
        if (project.created_by !== req.user.id) {
            return res.status(403).json({ error: "Только создатель проекта может его удалить" });
        }

        await ProjectMember.destroy({ where: { project_id: id } });
        await project.destroy();

        return res.status(200).json({ message: "Проект успешно удален", project_id: id });
    } catch (error) {
        return res.status(500).json({ error: "Произошла внутренняя ошибка сервера" });
    }
});

module.exports = router;