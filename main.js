// Routine Palette Logic

let routines = JSON.parse(localStorage.getItem('routines')) || [
    { id: Date.now(), name: '나의 루틴 만들기', color: '#3B82F6', history: [] }
];

let theme = localStorage.getItem('routine-theme') || 'dark';
let currentDate = new Date();
let selectedColor = '#3B82F6';
let editingRoutineId = null;

// Elements
const routineList = document.getElementById('routine-list');
const calendarDays = document.getElementById('calendar-days');
const currentMonthYear = document.getElementById('current-month-year');
const modalOverlay = document.getElementById('modal-overlay');
const routineNameInput = document.getElementById('routine-name');
const modalTitle = document.getElementById('modal-title');
const colorOpts = document.querySelectorAll('.color-opt');

function init() {
    // 만약 저장된 데이터가 예전 예시 데이터(스쿼트 등)라면 초기화해줍니다.
    if (routines.length > 0 && (routines[0].name === '스쿼트' || routines[0].name === 'Edit.')) {
        routines = [{ id: Date.now(), name: '나의 루틴 만들기', color: '#3B82F6', history: [] }];
        saveData();
    }

    setTheme(theme);
    renderRoutines();
    renderCalendar();
    renderLegend();
    setupEventListeners();
}

// Theme Management
window.setTheme = function (newTheme) {
    theme = newTheme;
    document.body.className = `theme-${newTheme}`;
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.classList.contains(newTheme));
    });
    localStorage.setItem('routine-theme', theme);
};

// Render Routines
function renderRoutines() {
    routineList.innerHTML = '';
    const todayStr = formatDate(new Date());

    routines.forEach(routine => {
        const isCompletedToday = routine.history.includes(todayStr);
        const item = document.createElement('div');
        item.className = 'routine-item';
        item.innerHTML = `
            <div class="routine-checkbox ${isCompletedToday ? 'checked' : ''}" 
                 style="color: ${routine.color}; border-color: ${routine.color}; background-color: ${isCompletedToday ? routine.color : 'transparent'}"
                 onclick="toggleRoutine(${routine.id})">
            </div>
            <div class="routine-info">
                <div class="routine-name text-truncate">${routine.name}</div>
            </div>
            <div class="routine-actions">
                <span class="routine-edit" onclick="openEditModal(${routine.id})">수정</span>
                <span class="routine-delete" onclick="deleteRoutine(${routine.id})">삭제</span>
            </div>
        `;
        routineList.appendChild(item);
    });
    saveData();
    renderLegend();
}

function renderLegend() {
    const legendContainer = document.getElementById('color-legend');
    if (!legendContainer) return;

    legendContainer.innerHTML = '';
    routines.forEach(routine => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <span class="legend-color" style="background-color: ${routine.color}"></span>
            <span class="legend-name">${routine.name}</span>
        `;
        legendContainer.appendChild(item);
    });
}

// Calendar Rendering
function renderCalendar() {
    calendarDays.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    currentMonthYear.innerText = `${year}년 ${month + 1}월`;

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const lastDatePrev = new Date(year, month, 0).getDate();

    for (let i = firstDay; i > 0; i--) createDayCell(year, month - 1, lastDatePrev - i + 1, true);
    for (let i = 1; i <= lastDate; i++) createDayCell(year, month, i, false);

    const remaining = 42 - (firstDay + lastDate);
    for (let i = 1; i <= remaining; i++) createDayCell(year, month + 1, i, true);
}

function createDayCell(year, month, day, isOtherMonth) {
    const date = new Date(year, month, day);
    const dateStr = formatDate(date);
    const cell = document.createElement('div');
    cell.className = `day-cell ${isOtherMonth ? 'other-month' : ''} ${dateStr === formatDate(new Date()) ? 'today' : ''}`;

    const completed = routines.filter(r => r.history.includes(dateStr));
    if (completed.length > 0) {
        const bg = document.createElement('div');
        bg.className = 'cell-bg';

        if (completed.length === 1) {
            bg.style.backgroundColor = completed[0].color;
        } else {
            // "피자 조각" 처럼 나누기 위해 conic-gradient 생성
            const segmentSize = 100 / completed.length;
            const gradientParts = completed.map((r, index) => {
                const start = index * segmentSize;
                const end = (index + 1) * segmentSize;
                return `${r.color} ${start}% ${end}%`;
            });
            bg.style.background = `conic-gradient(${gradientParts.join(', ')})`;
        }
        cell.appendChild(bg);
    }

    cell.innerHTML += `<span class="day-label">${day}</span>`;
    calendarDays.appendChild(cell);
}

// Routine Actions
window.toggleRoutine = function (id) {
    const todayStr = formatDate(new Date());
    const routine = routines.find(r => r.id === id);
    if (routine.history.includes(todayStr)) {
        routine.history = routine.history.filter(d => d !== todayStr);
    } else {
        routine.history.push(todayStr);
    }
    renderRoutines();
    renderCalendar();
};

window.openEditModal = function (id) {
    const routine = routines.find(r => r.id === id);
    editingRoutineId = id;
    modalTitle.innerText = '루틴 수정';
    routineNameInput.value = routine.name;
    selectedColor = routine.color;
    colorOpts.forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.color === selectedColor);
    });
    modalOverlay.classList.add('active');
};

window.deleteRoutine = function (id) {
    event.stopPropagation();
    if (confirm('이 루틴을 삭제할까요?')) {
        routines = routines.filter(r => r.id !== id);
        renderRoutines();
        renderCalendar();
    }
};

function setupEventListeners() {
    document.getElementById('prev-month').onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
    document.getElementById('next-month').onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };

    document.getElementById('add-routine-btn').onclick = () => {
        editingRoutineId = null;
        modalTitle.innerText = '새로운 루틴 추가';
        routineNameInput.value = '';
        modalOverlay.classList.add('active');
    };

    colorOpts.forEach(opt => {
        opt.onclick = () => {
            colorOpts.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedColor = opt.dataset.color;
        };
    });

    document.getElementById('save-btn').onclick = () => {
        const name = routineNameInput.value.trim();
        if (!name) return;

        if (editingRoutineId) {
            const routine = routines.find(r => r.id === editingRoutineId);
            routine.name = name;
            routine.color = selectedColor;
        } else {
            // 루틴 개수 10개로 제한
            if (routines.length >= 10) {
                alert('루틴은 최대 10개까지만 등록할 수 있습니다, 대표님!');
                return;
            }

            // 10가지 다채로운 색상 팔레트
            const colors = [
                '#3B82F6', '#FACC15', '#F97316', '#10B981', '#EC4899',
                '#8B5CF6', '#06B6D4', '#F43F5E', '#84CC16', '#A855F7'
            ];
            const randomColor = colors[routines.length % colors.length];
            routines.push({ id: Date.now(), name, color: randomColor, history: [] });
        }

        renderRoutines();
        renderCalendar();
        modalOverlay.classList.remove('active');
    };

    document.getElementById('cancel-btn').onclick = () => modalOverlay.classList.remove('active');
}

function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function saveData() { localStorage.setItem('routines', JSON.stringify(routines)); }

init();
