const bcrypt = require('bcrypt');
const db = require('./db');

async function seed() {
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@fittrack.ru');
  if (!existingAdmin) {
    const adminHash = await bcrypt.hash('admin123', 10);
    db.prepare('INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)').run(
      'admin@fittrack.ru', 'Админ', adminHash, 'admin'
    );
    console.log('Seeded admin user');
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('user@fittrack.ru');
  if (!existingUser) {
    const userHash = await bcrypt.hash('user123', 10);
    const result = db.prepare('INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)').run(
      'user@fittrack.ru', 'Иван', userHash, 'user'
    );
    const userId = result.lastInsertRowid;

    const insertFood = db.prepare('INSERT INTO food_plans (user_id, name, description, day) VALUES (?, ?, ?, ?)');
    insertFood.run(userId, 'Овсяная каша с ягодами', 'Овсяные хлопья с молоком, свежие ягоды (клубника, черника), мёд', 'День 1');
    insertFood.run(userId, 'Грилированная курица', 'Филе куриной грудки (150г), припущенное на гриле, с овощами на пару', 'День 1');
    insertFood.run(userId, 'Греческий йогурт с медом', 'Натуральный греческий йогурт (200г) без наполнителей, 1 столовая ложка мёда', 'День 1');

    const insertExercise = db.prepare('INSERT INTO exercise_plans (user_id, name, description, sets, reps, day) VALUES (?, ?, ?, ?, ?, ?)');
    insertExercise.run(userId, 'Подтягивания', 'Хват шире плеч, полное движение от растяжения к подтягиванию. Работают мышцы спины и бицепсы', '3', '10', 'День 1');
    insertExercise.run(userId, 'Отжимания', 'На полу или на скамье, спина прямая, локти под углом 45 градусов. Работают грудные мышцы, трицепсы', '3', '15', 'День 1');
    insertExercise.run(userId, 'Гантели', 'Жим гантелей в разные направления. Работают плечи и грудь. Контролируйте движение', '4', '12', 'День 1');
    insertExercise.run(userId, 'Приседания', 'Ноги на ширине плеч, спина прямая, опускайтесь до 90 градусов. Работают ноги и ягодицы', '3', '15', 'День 1');
    insertExercise.run(userId, 'Скручивания', 'Лежа на спине, ноги согнуты. Поднимайте верхнюю часть корпуса. Работают абдоминальные мышцы', '3', '20', 'День 1');
    insertExercise.run(userId, 'Прогулка', '6000 шагов умеренным темпом. Улучшает кардиоваскулярную систему и сжигает калории', '6000 шагов', '', 'День 1');

    console.log('Seeded user Иван with default plans');
  }
}

module.exports = seed;
