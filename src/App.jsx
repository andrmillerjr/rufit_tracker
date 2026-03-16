import React, { useState } from 'react';
import { Plus, TrendingUp, LogOut, Users, BarChart3, Apple } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FitnessTracker() {
  // ========== INITIAL STATE ==========
  const [currentUser, setCurrentUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [userProfiles, setUserProfiles] = useState(() => {
    const saved = localStorage.getItem('userProfiles');
    return saved ? JSON.parse(saved) : { 1: { age: null, height: null, weight: null, waist: null } };
  });
  const [profileFormData, setProfileFormData] = useState({ age: '', height: '', weight: '', waist: '' });

  const [users] = useState([
    { id: 1, email: 'user@fittrack.ru', password: 'user123', name: 'Иван' }
  ]);
  const [userPlans, setUserPlans] = useState({
    1: {
      food: [
        { id: 1, name: 'Овсяная каша с ягодами', description: 'Овсяные хлопья с молоком, свежие ягоды (клубника, черника), мёд', day: 'День 1' },
        { id: 2, name: 'Грилированная курица', description: 'Филе куриной грудки (150г), припущенное на гриле, с овощами на пару', day: 'День 1' },
        { id: 3, name: 'Греческий йогурт с медом', description: 'Натуральный греческий йогурт (200г) без наполнителей, 1 столовая ложка мёда', day: 'День 1' }
      ],
      exercise: [
        { id: 1, name: 'Подтягивания', description: 'Хват шире плеч, полное движение от растяжения к подтягиванию. Работают мышцы спины и бицепсы', sets: '3', reps: '10', day: 'День 1' },
        { id: 2, name: 'Отжимания', description: 'На полу или на скамье, спина прямая, локти под углом 45 градусов. Работают грудные мышцы, трицепсы', sets: '3', reps: '15', day: 'День 1' },
        { id: 3, name: 'Гантели', description: 'Жим гантелей в разные направления. Работают плечи и грудь. Контролируйте движение', sets: '4', reps: '12', day: 'День 1' },
        { id: 4, name: 'Приседания', description: 'Ноги на ширине плеч, спина прямая, опускайтесь до 90 градусов. Работают ноги и ягодицы', sets: '3', reps: '15', day: 'День 1' },
        { id: 5, name: 'Скручивания', description: 'Лежа на спине, ноги согнуты. Поднимайте верхнюю часть корпуса. Работают абдоминальные мышцы', sets: '3', reps: '20', day: 'День 1' },
        { id: 6, name: 'Прогулка', description: '6000 шагов умеренным темпом. Улучшает кардиоваскулярную систему и сжигает калории', sets: '6000 шагов', day: 'День 1' }
      ]
    }
  });

  const [userTracking, setUserTracking] = useState({ 1: { food: [], exercise: [] } });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState(null);
  const [adminActiveTab, setAdminActiveTab] = useState('users');
  const [showStoplist, setShowStoplist] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState('day');
  const [selectedMealDescription, setSelectedMealDescription] = useState(null);
  const [selectedExerciseDescription, setSelectedExerciseDescription] = useState(null);
  const [newFoodPlan, setNewFoodPlan] = useState({ name: '', description: '', day: 'День 1' });
  const [newExercisePlan, setNewExercisePlan] = useState({ name: '', description: '', sets: '', reps: '', day: 'День 1' });
  const [completedItems, setCompletedItems] = useState({});
  const [activityLog, setActivityLog] = useState([]);

  // ========== HELPERS ==========
  const getUserPlans = (userId) => userPlans[userId] || { food: [], exercise: [] };

  const userPlansList = getUserPlans(currentUser?.id);
  const completedFoodItems = userPlansList.food.filter(item => completedItems[`food-${item.id}`]);
  const completedExerciseItems = userPlansList.exercise.filter(item => completedItems[`exercise-${item.id}`]);
  const totalCalories = completedFoodItems.reduce((sum, f) => sum + (f.calories || 0), 0);
  const totalProtein = completedFoodItems.reduce((sum, f) => sum + (f.protein || 0), 0);
  const burnedCalories = completedExerciseItems.reduce((sum, e) => sum + (e.calories || 0), 0);

  const chartData = [
    { day: 'Пн', calories: 1800, burned: 500 },
    { day: 'Вт', calories: 2100, burned: 600 },
    { day: 'Ср', calories: 1950, burned: 550 },
    { day: 'Чт', calories: 2000, burned: 650 },
    { day: 'Пт', calories: 1850, burned: 700 },
    { day: 'Сб', calories: 2200, burned: 400 },
    { day: 'Вс', calories: totalCalories, burned: burnedCalories }
  ];

  // ========== HANDLERS ==========
  const toggleItemCompletion = (itemId) => {
    const isNowCompleted = !completedItems[itemId];
    setCompletedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    let itemName = '';
    let icon = '';
    const foodItem = userPlansList.food.find(f => `food-${f.id}` === itemId);
    if (foodItem) { itemName = foodItem.name; icon = '🍽️'; }
    const exerciseItem = userPlansList.exercise.find(e => `exercise-${e.id}` === itemId);
    if (exerciseItem) { itemName = exerciseItem.name; icon = '💪'; }
    if (itemName) {
      setActivityLog(prev => [{ id: Date.now(), type: isNowCompleted ? 'completed' : 'uncompleted', name: itemName, icon, timestamp: now }, ...prev].slice(0, 10));
    }
  };

  const saveUserProfile = () => {
    if (!profileFormData.age || !profileFormData.height || !profileFormData.weight || !profileFormData.waist) {
      alert('Пожалуйста, заполните все поля'); return;
    }
    const updatedProfiles = { ...userProfiles, [currentUser.id]: { age: parseInt(profileFormData.age), height: parseInt(profileFormData.height), weight: parseInt(profileFormData.weight), waist: parseInt(profileFormData.waist) } };
    setUserProfiles(updatedProfiles);
    localStorage.setItem('userProfiles', JSON.stringify(updatedProfiles));
    setProfileFormData({ age: '', height: '', weight: '', waist: '' });
  };

  const handleLogin = () => {
    if (loginEmail === 'admin@fittrack.ru' && loginPassword === 'admin123') {
      setCurrentUser({ id: 'admin', email: loginEmail, role: 'admin' });
      setLoginEmail(''); setLoginPassword('');
    } else {
      const user = users.find(u => u.email === loginEmail && u.password === loginPassword);
      if (user) { setCurrentUser({ ...user, role: 'user' }); setLoginEmail(''); setLoginPassword(''); }
      else alert('Неверный email или пароль');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null); setSelectedUser(null); setLoginEmail(''); setLoginPassword('');
    setAdminActiveTab('users'); setActiveTab('dashboard');
  };

  const addFoodPlan = () => {
    if (!selectedUser || !newFoodPlan.name || !newFoodPlan.description) return;
    const up = { ...userPlans };
    if (!up[selectedUser.id]) up[selectedUser.id] = { food: [], exercise: [] };
    up[selectedUser.id].food.push({ id: Date.now(), ...newFoodPlan });
    setUserPlans(up); setNewFoodPlan({ name: '', description: '', day: 'День 1' });
  };

  const addExercisePlan = () => {
    if (!selectedUser || !newExercisePlan.name || !newExercisePlan.description || !newExercisePlan.sets || !newExercisePlan.reps) return;
    const up = { ...userPlans };
    if (!up[selectedUser.id]) up[selectedUser.id] = { food: [], exercise: [] };
    up[selectedUser.id].exercise.push({ id: Date.now(), ...newExercisePlan });
    setUserPlans(up); setNewExercisePlan({ name: '', description: '', sets: '', reps: '', day: 'День 1' });
  };

  const removeFoodPlan = (userId, planId) => {
    const up = { ...userPlans }; up[userId].food = up[userId].food.filter(p => p.id !== planId); setUserPlans(up);
  };
  const removeExercisePlan = (userId, planId) => {
    const up = { ...userPlans }; up[userId].exercise = up[userId].exercise.filter(p => p.id !== planId); setUserPlans(up);
  };

  // ==================== LOGIN SCREEN ====================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-sm w-full">
          <h1 className="m-0 mb-3 text-3xl font-bold text-center text-[#667eea]">ФитТрек</h1>
          <p className="m-0 mb-8 text-sm text-center text-gray-400">Ваш личный помощник в фитнесе</p>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Email</label>
            <input type="email" placeholder="Введите ваш email" value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-3.5 py-3 border-2 border-gray-100 rounded-xl text-sm box-border focus:outline-none focus:border-[#667eea] transition-colors" />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Пароль</label>
            <input type="password" placeholder="Введите ваш пароль" value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-3.5 py-3 border-2 border-gray-100 rounded-xl text-sm box-border focus:outline-none focus:border-[#667eea] transition-colors" />
          </div>
          <button onClick={handleLogin}
            className="w-full py-3.5 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-xl text-base font-bold cursor-pointer mb-4 shadow-[0_6px_20px_rgba(102,126,234,0.3)] hover:-translate-y-0.5 transition-transform">
            🔐 ВОЙТИ В СИСТЕМУ
          </button>
          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500">
            <p className="m-0 mb-2 font-semibold">📋 Тестовые учетные данные:</p>
            <p className="m-0 my-1">👨‍💼 Админ: <code className="bg-white px-1.5 py-0.5 rounded">admin@fittrack.ru</code> / <code className="bg-white px-1.5 py-0.5 rounded">admin123</code></p>
            <p className="m-0 my-1">👤 Пользователь: <code className="bg-white px-1.5 py-0.5 rounded">user@fittrack.ru</code> / <code className="bg-white px-1.5 py-0.5 rounded">user123</code></p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== ADMIN PANEL ====================
  if (currentUser.role === 'admin') {
    const inputCls = "w-full px-3 py-2.5 rounded-xl border-2 border-gray-100 text-sm box-border mb-2.5 focus:outline-none focus:border-[#667eea] transition-colors";
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2]">
        <div className="bg-white/10 px-5 py-5 text-white flex justify-between items-center backdrop-blur-md border-b border-white/20">
          <div>
            <h1 className="m-0 text-2xl font-bold">ФитТрек Админ</h1>
            <p className="m-0 mt-1 text-xs opacity-90">Управление пользователями и планами</p>
          </div>
          <button onClick={handleLogout}
            className="bg-white/20 text-white border border-white/30 rounded-lg px-4 py-2.5 cursor-pointer text-sm font-semibold flex items-center gap-2 hover:bg-white/30 transition-colors">
            <LogOut size={18} /> Выход
          </button>
        </div>

        <div className="bg-white/5 px-5 border-b border-white/10 flex">
          {[{ id: 'users', label: 'Пользователи' }, { id: 'plans', label: 'Планы' }].map(tab => (
            <button key={tab.id}
              onClick={() => { setAdminActiveTab(tab.id); if (tab.id === 'plans' && !selectedUser && users.length > 0) setSelectedUser(users[0]); }}
              className={`bg-transparent border-x-0 border-t-0 cursor-pointer py-4 px-5 text-sm transition-colors ${adminActiveTab === tab.id ? 'text-white font-bold border-b-[3px] border-b-white' : 'text-white/60 font-medium border-b-0 hover:text-white/80'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 pb-10">
          {adminActiveTab === 'users' && (
            <div>
              <h2 className="text-white mb-4 text-xl font-semibold">Управление пользователями</h2>
              <div className="grid gap-3">
                {users.map(user => (
                  <div key={user.id} onClick={() => { setSelectedUser(user); setAdminActiveTab('plans'); }}
                    className="bg-white rounded-xl p-4 shadow-lg cursor-pointer flex justify-between items-center hover:-translate-y-0.5 transition-transform">
                    <div>
                      <div className="text-base font-semibold">{user.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{user.email}</div>
                    </div>
                    <div className="bg-[#667eea] text-white rounded-full px-3 py-1.5 text-xs font-semibold">Управлять планом →</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {adminActiveTab === 'plans' && selectedUser && (
            <div>
              <h2 className="text-white mb-4 text-xl font-semibold">План для {selectedUser.name}</h2>

              <div className="bg-white rounded-2xl p-5 mb-5 shadow-lg">
                <h3 className="mt-0 mb-4 text-base font-semibold">Добавить план питания</h3>
                <input placeholder="Название блюда" value={newFoodPlan.name}
                  onChange={(e) => setNewFoodPlan({ ...newFoodPlan, name: e.target.value })} className={inputCls} />
                <textarea placeholder="Описание блюда" value={newFoodPlan.description}
                  onChange={(e) => setNewFoodPlan({ ...newFoodPlan, description: e.target.value })}
                  className={`${inputCls} min-h-[80px] resize-y`} />
                <select value={newFoodPlan.day} onChange={(e) => setNewFoodPlan({ ...newFoodPlan, day: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-100 text-sm mb-2.5 focus:outline-none">
                  {Array.from({ length: 7 }, (_, i) => <option key={i + 1} value={`День ${i + 1}`}>День {i + 1}</option>)}
                </select>
                <button onClick={addFoodPlan}
                  className="w-full py-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  <Plus size={18} /> Добавить план питания
                </button>
              </div>

              <div className="bg-white rounded-2xl p-5 mb-5 shadow-lg">
                <h3 className="mt-0 mb-4 text-base font-semibold">Планы питания</h3>
                <div className="flex flex-col gap-2.5">
                  {getUserPlans(selectedUser.id).food.map(plan => (
                    <div key={plan.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{plan.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{plan.description} • {plan.day}</div>
                      </div>
                      <button onClick={() => removeFoodPlan(selectedUser.id, plan.id)}
                        className="bg-red-400 text-white border-none rounded-lg px-3 py-1.5 cursor-pointer text-xs ml-2 hover:bg-red-500 transition-colors">
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 mb-5 shadow-lg">
                <h3 className="mt-0 mb-4 text-base font-semibold">Добавить план упражнений</h3>
                <input placeholder="Название упражнения" value={newExercisePlan.name}
                  onChange={(e) => setNewExercisePlan({ ...newExercisePlan, name: e.target.value })} className={inputCls} />
                <textarea placeholder="Описание упражнения" value={newExercisePlan.description}
                  onChange={(e) => setNewExercisePlan({ ...newExercisePlan, description: e.target.value })}
                  className={`${inputCls} min-h-[80px] resize-y`} />
                <div className="grid grid-cols-3 gap-2.5 mb-2.5">
                  <input placeholder="Подходы" type="number" value={newExercisePlan.sets}
                    onChange={(e) => setNewExercisePlan({ ...newExercisePlan, sets: e.target.value })}
                    className="px-3 py-2.5 rounded-xl border-2 border-gray-100 text-sm focus:outline-none focus:border-[#667eea]" />
                  <input placeholder="Повторения" type="number" value={newExercisePlan.reps}
                    onChange={(e) => setNewExercisePlan({ ...newExercisePlan, reps: e.target.value })}
                    className="px-3 py-2.5 rounded-xl border-2 border-gray-100 text-sm focus:outline-none focus:border-[#667eea]" />
                  <select value={newExercisePlan.day} onChange={(e) => setNewExercisePlan({ ...newExercisePlan, day: e.target.value })}
                    className="px-3 py-2.5 rounded-xl border-2 border-gray-100 text-sm focus:outline-none">
                    {Array.from({ length: 7 }, (_, i) => <option key={i + 1} value={`День ${i + 1}`}>День {i + 1}</option>)}
                  </select>
                </div>
                <button onClick={addExercisePlan}
                  className="w-full py-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  <Plus size={18} /> Добавить план упражнений
                </button>
              </div>

              <div className="bg-white rounded-2xl p-5 mb-5 shadow-lg">
                <h3 className="mt-0 mb-4 text-base font-semibold">Планы упражнений</h3>
                <div className="flex flex-col gap-2.5">
                  {getUserPlans(selectedUser.id).exercise.map(plan => (
                    <div key={plan.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{plan.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{plan.sets}x{plan.reps} • {plan.day}</div>
                      </div>
                      <button onClick={() => removeExercisePlan(selectedUser.id, plan.id)}
                        className="bg-red-400 text-white border-none rounded-lg px-3 py-1.5 cursor-pointer text-xs ml-2 hover:bg-red-500 transition-colors">
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== PROFILE FORM ====================
  const userProfile = userProfiles[currentUser.id];
  const profileComplete = userProfile && userProfile.age && userProfile.height && userProfile.weight && userProfile.waist;

  if (currentUser.role === 'user' && !profileComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-[450px] w-full">
          <h1 className="m-0 mb-2 text-2xl font-bold text-center text-[#667eea]">📊 Ваш профиль</h1>
          <p className="m-0 mb-8 text-sm text-center text-gray-400">Пожалуйста, заполните информацию о себе</p>
          {[
            { key: 'age', label: 'Возраст (лет)', placeholder: 'Например, 28', min: 10, max: 120 },
            { key: 'height', label: 'Рост (см)', placeholder: 'Например, 175', min: 100, max: 250 },
            { key: 'weight', label: 'Вес (кг)', placeholder: 'Например, 75', min: 30, max: 300, step: '0.1' },
            { key: 'waist', label: 'Размер талии (см)', placeholder: 'Например, 85', min: 40, max: 150 },
          ].map((field, idx) => (
            <div key={field.key} className={idx < 3 ? 'mb-4' : 'mb-6'}>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">{field.label}</label>
              <input type="number" placeholder={field.placeholder} value={profileFormData[field.key]}
                onChange={(e) => setProfileFormData({ ...profileFormData, [field.key]: e.target.value })}
                min={field.min} max={field.max} step={field.step}
                className="w-full px-3.5 py-3 border-2 border-gray-100 rounded-xl text-sm box-border focus:outline-none focus:border-[#667eea] transition-colors" />
            </div>
          ))}
          <button onClick={saveUserProfile}
            className="w-full py-3.5 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-xl text-base font-bold cursor-pointer mb-3 shadow-[0_6px_20px_rgba(102,126,234,0.3)] hover:-translate-y-0.5 transition-transform">
            ✓ Сохранить профиль
          </button>
          <button onClick={handleLogout}
            className="w-full py-3 bg-transparent text-[#667eea] border-2 border-[#667eea] rounded-xl text-sm font-semibold cursor-pointer hover:bg-indigo-50 transition-colors">
            Выход
          </button>
        </div>
      </div>
    );
  }

  // ==================== USER DASHBOARD ====================
  const Modal = ({ title, titleColor, desc, onClose }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-5">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="flex justify-between items-start mb-4">
          <h3 className={`m-0 text-lg font-bold ${titleColor}`}>{title}</h3>
          <button onClick={onClose} className="bg-transparent border-none text-2xl text-gray-300 cursor-pointer w-8 h-8 flex items-center justify-center p-0 hover:text-gray-500 transition-colors">✕</button>
        </div>
        <p className="m-0 text-sm text-gray-700 leading-relaxed">{desc}</p>
        <button onClick={onClose} className="w-full py-3 mt-4 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-xl text-sm font-bold cursor-pointer">Закрыть</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] px-5 pt-6 pb-4 text-white shadow-[0_10px_30px_rgba(102,126,234,0.3)] flex justify-between items-start">
        <div>
          <h1 className="m-0 mb-1 text-2xl font-bold">ФитТрек</h1>
          <p className="m-0 text-xs opacity-90">Добро пожаловать, {currentUser.name}!</p>
        </div>
        <button onClick={handleLogout}
          className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 cursor-pointer text-xs font-semibold flex items-center gap-1.5 hover:bg-white/30 transition-colors">
          <LogOut size={16} className="inline" /> Выход
        </button>
      </div>

      {/* Main Content */}
      <div className="p-5 pb-24">

        {/* ---- DASHBOARD TAB ---- */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="mt-0 mb-5 text-white text-xl font-semibold">📋 Ваш план на день</h2>

            {/* Meals */}
            <div className="bg-white rounded-2xl p-5 mb-5 shadow-lg">
              <h3 className="mt-0 mb-4 text-lg font-bold text-[#667eea] border-b-[3px] border-[#667eea] pb-3">🍽️ Приемы пищи</h3>
              {selectedMealDescription && <Modal title="Описание" titleColor="text-[#667eea]" desc={selectedMealDescription} onClose={() => setSelectedMealDescription(null)} />}
              {userPlansList.food.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {userPlansList.food.map(plan => {
                    const done = completedItems[`food-${plan.id}`];
                    return (
                      <div key={plan.id} onClick={() => toggleItemCompletion(`food-${plan.id}`)}
                        className={`p-4 rounded-xl border-l-[5px] flex items-center gap-3 cursor-pointer transition-all hover:translate-x-1 hover:shadow-md ${done ? 'bg-gradient-to-r from-green-50 to-emerald-50/50 border-l-green-400 opacity-80' : 'bg-gradient-to-r from-indigo-50 to-blue-50/50 border-l-[#667eea]'}`}>
                        <div className="text-3xl w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">🥗</div>
                        <div className="flex-1">
                          <div className={`text-base font-bold ${done ? 'line-through text-gray-400' : 'text-gray-900'}`}>{plan.name}</div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedMealDescription(plan.description); }}
                          className="bg-white/50 text-[#667eea] border-2 border-[#667eea] rounded-full w-7 h-7 p-0 flex items-center justify-center cursor-pointer font-bold transition-all mr-2 hover:bg-[#667eea]/20 hover:scale-110 shrink-0">!</button>
                        <div className={`text-base font-bold w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 transition-all shrink-0 shadow-sm ${done ? 'text-green-400 border-green-400' : 'text-[#667eea] border-[#667eea]'}`}>
                          {done ? '✓' : '○'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-center py-8 text-gray-400 text-sm m-0">Нет приемов пищи</p>}
            </div>

            {/* Exercises */}
            <div className="bg-white rounded-2xl p-5 mb-5 shadow-lg">
              <h3 className="mt-0 mb-4 text-lg font-bold text-red-400 border-b-[3px] border-red-400 pb-3">💪 Упражнения</h3>
              {selectedExerciseDescription && <Modal title="Описание" titleColor="text-red-400" desc={selectedExerciseDescription} onClose={() => setSelectedExerciseDescription(null)} />}
              {userPlansList.exercise.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {userPlansList.exercise.map(plan => {
                    const done = completedItems[`exercise-${plan.id}`];
                    return (
                      <div key={plan.id} onClick={() => toggleItemCompletion(`exercise-${plan.id}`)}
                        className={`p-4 rounded-xl border-l-[5px] flex items-center gap-3 cursor-pointer transition-all hover:translate-x-1 hover:shadow-md bg-gradient-to-r from-red-50 to-rose-50/50 ${done ? 'border-l-green-400 opacity-80' : 'border-l-red-400'}`}>
                        <div className="text-3xl w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">🏃</div>
                        <div className="flex-1">
                          <div className={`text-base font-bold ${done ? 'line-through text-gray-400' : 'text-gray-900'}`}>{plan.name}</div>
                          <div className="text-sm text-red-400 font-bold mt-1">{plan.sets}x{plan.reps}</div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedExerciseDescription(plan.description); }}
                          className="bg-white/50 text-red-400 border-2 border-red-400 rounded-full w-7 h-7 p-0 flex items-center justify-center cursor-pointer font-bold transition-all mr-2 hover:bg-red-400/20 hover:scale-110 shrink-0">!</button>
                        <div className={`text-base font-bold w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 transition-all shrink-0 shadow-sm ${done ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}`}>
                          {done ? '✓' : '○'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-center py-8 text-gray-400 text-sm m-0">Нет упражнений</p>}
            </div>
          </div>
        )}

        {/* ---- GROCERIES TAB ---- */}
        {activeTab === 'groceries' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="m-0 text-white text-xl font-semibold">🛒 Список покупок</h2>
              <button onClick={() => setShowStoplist(true)}
                className="w-8 h-8 rounded-full bg-white/30 text-white border-none text-lg font-bold cursor-pointer flex items-center justify-center hover:bg-white/50 hover:scale-110 transition-all mt-1">!</button>
            </div>

            {showStoplist && (
              <div className="fixed inset-0 bg-black/60 flex items-end z-[1000]">
                <div className="bg-white rounded-t-2xl p-5 w-full max-h-[80vh] overflow-y-auto animate-slide-up">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="m-0 text-xl font-bold text-red-400">⛔ СТОПИСТ</h2>
                    <button onClick={() => setShowStoplist(false)}
                      className="bg-transparent border-none text-2xl text-gray-300 cursor-pointer w-8 h-8 flex items-center justify-center p-0 hover:text-gray-500 transition-colors">✕</button>
                  </div>
                  <p className="mt-0 mb-5 text-xs text-gray-400 italic">Избегайте этих продуктов для лучших результатов</p>
                  {[
                    { title: '🍯 Скрытые сахара и соусы', color: 'text-red-400', bg: 'bg-red-50', border: 'border-l-red-400', items: ['Майонез, кетчуп, соус барбекю и т.п.', 'Пакетированные соки и газировки', 'Йогурты с наполнителями'] },
                    { title: '💧 Задержка воды (отечность)', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-l-orange-500', items: ['Соленья и маринады', 'Алкоголь', 'Копчености и колбасы'] },
                    { title: '🥖 Лишние углеводы', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-l-yellow-400', items: ['Белый хлеб и выпечка', 'Картофель', 'Фрукты и каши после 14:00'] }
                  ].map((s, i) => (
                    <div key={i} className="mb-5">
                      <h3 className={`mt-0 mb-3 text-sm font-bold ${s.color}`}>{s.title}</h3>
                      <div className="flex flex-col gap-2">
                        {s.items.map((item, j) => (
                          <div key={j} className={`p-3 ${s.bg} rounded-xl text-sm text-gray-700 border-l-4 ${s.border}`}>• {item}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setShowStoplist(false)}
                    className="w-full py-3.5 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-xl text-base font-bold cursor-pointer mt-5">
                    Понятно
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5 mb-5 shadow-lg">
              <h3 className="mt-0 mb-4 text-lg font-bold text-[#667eea] border-b-[3px] border-[#667eea] pb-3">📋 Еженедельные покупки</h3>
              <div className="flex flex-col gap-2.5">
                {[
                  { icon: '🥬', name: 'Овсяные хлопья', category: 'Зерновые' },
                  { icon: '🍗', name: 'Куриное филе', category: 'Белок' },
                  { icon: '🥛', name: 'Йогурт натуральный (без наполнителей)', category: 'Молочные' },
                  { icon: '🥚', name: 'Яйца', category: 'Белок' },
                  { icon: '🐟', name: 'Рыба (лосось, треска)', category: 'Белок' },
                  { icon: '🥕', name: 'Овощи (брокколи, морковь, огурцы)', category: 'Овощи' },
                  { icon: '🍎', name: 'Яблоки, ягоды (до 14:00)', category: 'Фрукты' },
                  { icon: '🥜', name: 'Арахисовое масло (натуральное)', category: 'Жиры' },
                  { icon: '🍚', name: 'Коричневый рис или гречка', category: 'Углеводы' },
                  { icon: '🧈', name: 'Оливковое масло', category: 'Жиры' },
                  { icon: '🧂', name: 'Специи и травы (без соли)', category: 'Приправы' },
                  { icon: '💧', name: 'Вода (минимум 2л в день)', category: 'Напитки' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-gradient-to-r from-gray-50 to-gray-50/80 rounded-xl flex items-center gap-3 border-l-4 border-l-[#667eea]">
                    <div className="text-2xl">{item.icon}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{item.category}</div>
                    </div>
                    <input type="checkbox" className="w-5 h-5 cursor-pointer accent-[#667eea]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---- STATS TAB ---- */}
        {activeTab === 'stats' && (
          <div>
            <h2 className="mt-0 mb-4 text-white text-xl font-semibold">📊 Статистика и данные</h2>

            <div className="flex gap-2.5 mb-5 justify-center flex-wrap">
              {[{ id: 'day', label: 'День' }, { id: 'week', label: 'Неделя' }, { id: 'month', label: 'Месяц' }, { id: 'alltime', label: 'Всё время' }].map(period => (
                <button key={period.id} onClick={() => setStatsPeriod(period.id)}
                  className={`py-2.5 px-4 border-none rounded-xl text-sm font-semibold cursor-pointer transition-all ${statsPeriod === period.id ? 'bg-white text-[#667eea]' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                  {period.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
                <div className="text-xs text-gray-400 mb-2 uppercase font-semibold tracking-wide">Калории потреблены</div>
                <div className="text-3xl font-bold text-[#667eea]">{totalCalories}</div>
                <div className="text-xs text-gray-300 mt-1">ккал</div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
                <div className="text-xs text-gray-400 mb-2 uppercase font-semibold tracking-wide">Потрачено</div>
                <div className="text-3xl font-bold text-red-400">{burnedCalories}</div>
                <div className="text-xs text-gray-300 mt-1">ккал</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 mb-5 shadow-lg text-center">
              <div className="text-xs text-gray-400 mb-2 uppercase font-semibold tracking-wide">Потребленный белок</div>
              <div className="text-3xl font-bold text-[#667eea]">{totalProtein}</div>
              <div className="text-xs text-gray-300 mt-1">грамм</div>
            </div>

            <div className="bg-white rounded-2xl p-4 mb-5 shadow-lg">
              <h3 className="mt-0 mb-4 text-base font-semibold">Недельный обзор</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="calories" stackId="a" fill="#667eea" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="burned" stackId="a" fill="#f87171" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-4 mb-5 shadow-lg">
              <h3 className="mt-0 mb-4 text-base font-semibold">📝 Лог активности</h3>
              {activityLog.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {activityLog.map(log => (
                    <div key={log.id}
                      className={`p-3 rounded-xl flex justify-between items-center border-l-4 ${log.type === 'completed' ? 'bg-gradient-to-r from-green-50 to-emerald-50/50 border-l-green-400' : 'bg-gradient-to-r from-red-50 to-rose-50/50 border-l-red-400'}`}>
                      <div className="flex-1 flex items-center gap-2.5">
                        <span className="text-base">{log.icon}</span>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{log.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{log.type === 'completed' ? '✓ Выполнено' : '✗ Отменено'}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-300 font-semibold">{log.timestamp}</div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-center py-5 text-gray-400 text-sm m-0">Нет активности</p>}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white flex justify-around py-3 pb-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {[
          { id: 'dashboard', label: 'План', icon: Apple },
          { id: 'groceries', label: 'Покупки', icon: BarChart3 },
          { id: 'stats', label: 'Статистика', icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`bg-transparent border-none cursor-pointer flex flex-col items-center gap-1 py-2 px-3 text-xs transition-colors flex-1 ${activeTab === tab.id ? 'text-[#667eea] font-semibold' : 'text-gray-300 font-medium'}`}>
              <Icon size={24} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
