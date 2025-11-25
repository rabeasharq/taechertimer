// تهيئة شاشة الإعدادات
function initSettingsScreen() {
    const days = [
        {id: 'saturday', name: 'السبت'},
        {id: 'sunday', name: 'الأحد'},
        {id: 'monday', name: 'الاثنين'},
        {id: 'tuesday', name: 'الثلاثاء'},
        {id: 'wednesday', name: 'الأربعاء'},
        {id: 'thursday', name: 'الخميس'}
    ];

    const scheduleContainer = document.getElementById('weeklyScheduleSetup');
    scheduleContainer.innerHTML = '';

    days.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day-schedule';
        
        const dayTitle = document.createElement('div');
        dayTitle.className = 'day-title';
        dayTitle.textContent = day.name;
        dayDiv.appendChild(dayTitle);

        // الحصص من 0 إلى 8 (9 فترات تشمل الطابور والاستراحة)
        for (let i = 0; i < 9; i++) {
            // طابور صباحي (الفترة 0)
            if (i === 0) {
                const assemblyDiv = document.createElement('div');
                assemblyDiv.className = 'morning-assembly';
                assemblyDiv.textContent = 'طابور صباحي (07:30 - 08:00)';
                dayDiv.appendChild(assemblyDiv);
                continue;
            }
            
            // استراحة (الفترة 4)
            if (i === 4) {
                const breakDiv = document.createElement('div');
                breakDiv.className = 'break-time';
                breakDiv.textContent = 'استراحة (10:00 - 10:30)';
                dayDiv.appendChild(breakDiv);
                continue;
            }

            const classSlot = document.createElement('div');
            classSlot.className = 'class-slot';
            
            const classTime = document.createElement('div');
            classTime.className = 'class-time';
            
            // تحديد اسم الحصة حسب الفهرس
            let periodName = '';
            let timeRange = '';
            
            if (i === 1) {
                periodName = 'الحصة الأولى';
                timeRange = '08:00 - 08:40';
            } else if (i === 2) {
                periodName = 'الحصة الثانية';
                timeRange = '08:40 - 09:20';
            } else if (i === 3) {
                periodName = 'الحصة الثالثة';
                timeRange = '09:20 - 10:00';
            } else if (i === 5) {
                periodName = 'الحصة الرابعة';
                timeRange = '10:30 - 11:10';
            } else if (i === 6) {
                periodName = 'الحصة الخامسة';
                timeRange = '11:10 - 11:50';
            } else if (i === 7) {
                periodName = 'الحصة السادسة';
                timeRange = '11:50 - 12:30';
            } else if (i === 8) {
                periodName = 'الحصة السابعة';
                timeRange = '12:30 - 13:00';
            }
            
            classTime.textContent = `${periodName} (${timeRange})`;
            classSlot.appendChild(classTime);
            
            const classDetails = document.createElement('div');
            classDetails.className = 'class-details';
            
            const classSelect = document.createElement('select');
            classSelect.id = `${day.id}_class_${i}`;
            
            // خيارات الصفوف
            const classes = ['', 'الصف الثامن', 'الصف التاسع', 'الصف العاشر', 'الصف الحادي عشر', 'صف آخر'];
            classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls;
                option.textContent = cls || '(حصة فارغة)';
                classSelect.appendChild(option);
            });
            
            // تعيين القيمة الحالية إن وجدت
            if (appData.schedule[day.id] && appData.schedule[day.id][i] && 
                appData.schedule[day.id][i].class !== undefined) {
                classSelect.value = appData.schedule[day.id][i].class || '';
            }
            
            const roomInput = document.createElement('input');
            roomInput.type = 'text';
            roomInput.placeholder = 'رقم الفصل';
            roomInput.id = `${day.id}_room_${i}`;
            
            if (appData.schedule[day.id] && appData.schedule[day.id][i] && 
                appData.schedule[day.id][i].room !== undefined) {
                roomInput.value = appData.schedule[day.id][i].room || '';
            }
            
            classDetails.appendChild(classSelect);
            classDetails.appendChild(roomInput);
            classSlot.appendChild(classDetails);
            
            dayDiv.appendChild(classSlot);
        }
        
        scheduleContainer.appendChild(dayDiv);
    });

    // حفظ الإعدادات
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
}

// حفظ الإعدادات
function saveSettings() {
    appData.teacher = document.getElementById('teacherName').value;
    appData.school = document.getElementById('schoolName').value;
    appData.subject = document.getElementById('subjectName').value;
    appData.weeklyQuota = parseInt(document.getElementById('weeklyQuota').value);
    
    const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
    
    days.forEach(day => {
        for (let i = 0; i < 9; i++) {
            if (i === 0 || i === 4) continue; // تخطي الطابور والاستراحة
            
            const classSelect = document.getElementById(`${day}_class_${i}`);
            const roomInput = document.getElementById(`${day}_room_${i}`);
            
            if (classSelect && roomInput) {
                if (!appData.schedule[day]) appData.schedule[day] = [];
                
                if (classSelect.value) {
                    appData.schedule[day][i] = {
                        class: classSelect.value,
                        room: roomInput.value
                    };
                } else {
                    appData.schedule[day][i] = {class: "", room: ""};
                }
            }
        }
    });
    
    saveData();
    updateTeacherInfo();
    renderScheduleTable();
    updateStats();
    showNotification('تم حفظ الإعدادات والجدول بنجاح');
}

// عرض الجدول الأسبوعي
function renderScheduleTable() {
    const tableBody = document.getElementById('scheduleTableBody');
    tableBody.innerHTML = '';
    
    const days = [
        {id: 'saturday', name: 'السبت'},
        {id: 'sunday', name: 'الأحد'},
        {id: 'monday', name: 'الاثنين'},
        {id: 'tuesday', name: 'الثلاثاء'},
        {id: 'wednesday', name: 'الأربعاء'},
        {id: 'thursday', name: 'الخميس'}
    ];
    
    days.forEach(day => {
        const row = document.createElement('tr');
        
        const dayCell = document.createElement('td');
        dayCell.textContent = day.name;
        row.appendChild(dayCell);
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('td');
            
            if (i === 0) {
                cell.className = 'morning-assembly';
                cell.textContent = 'طابور';
            } else if (i === 4) {
                cell.className = 'break-time';
                cell.textContent = 'استراحة';
            } else {
                const classInfo = appData.schedule[day.id] ? appData.schedule[day.id][i] : null;
                
                if (classInfo && classInfo.class) {
                    cell.textContent = `${classInfo.class}\n(${classInfo.room})`;
                } else {
                    cell.className = 'empty-slot';
                    cell.textContent = 'فارغة';
                }
            }
            
            row.appendChild(cell);
        }
        
        tableBody.appendChild(row);
    });
}

// تحديث الإحصائيات
function updateStats() {
    let totalClasses = 0;
    const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
    
    days.forEach(day => {
        if (appData.schedule[day]) {
            for (let i = 0; i < 9; i++) {
                if (i !== 0 && i !== 4 && appData.schedule[day][i] && appData.schedule[day][i].class) {
                    totalClasses++;
                }
            }
        }
    });
    
    document.getElementById('totalClasses').textContent = totalClasses;
    document.getElementById('completedClasses').textContent = appData.completedClasses;
    document.getElementById('remainingClasses').textContent = totalClasses - appData.completedClasses;
    document.getElementById('weeklyQuota').value = totalClasses;
    appData.weeklyQuota = totalClasses;
}
