// تهيئة التطبيق الرئيسية
document.addEventListener('DOMContentLoaded', function() {
    console.log('تطبيق توقيت المعلم: جاري التهيئة...');
    
    loadData();
    initTabs();
    initSettingsScreen();
    renderScheduleTable();
    updateStats();
    startTimer();
    setupEventListeners();
    
    console.log('تطبيق توقيت المعلم: تم التهيئة بنجاح');
});

// تحميل البيانات المحفوظة
function loadData() {
    // البيانات تُحمّل تلقائياً من storage.js
    document.getElementById('teacherName').value = appData.teacher;
    document.getElementById('schoolName').value = appData.school;
    document.getElementById('subjectName').value = appData.subject;
    document.getElementById('weeklyQuota').value = appData.weeklyQuota;
    updateTeacherInfo();
}

// تحديث معلومات المعلم في الهيدر
function updateTeacherInfo() {
    document.getElementById('teacherInfo').textContent = 
        `${appData.teacher} - ${appData.subject} - ${appData.school}`;
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    document.getElementById('btnMarkCompleted').addEventListener('click', markClassCompleted);
    document.getElementById('btnEditSchedule').addEventListener('click', function() {
        document.querySelector('.tab[data-tab="settings"]').click();
    });
    
    // إضافة أزرار إضافية للإدارة
    addManagementButtons();
}

// تبديل بين الشاشات
function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // إزالة النشاط من جميع الألسنة
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            // إضافة النشاط للسان المحدد
            tab.classList.add('active');
            
            // إخفاء جميع الشاشات
            document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
            // إظهار الشاشة المحددة
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });
}

// تعليم الحصة كمكتملة
function markClassCompleted() {
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod(new Date().getHours(), new Date().getMinutes());
    
    if (currentPeriod && currentPeriod.type === 'class') {
        appData.completedClasses++;
        saveData();
        updateStats();
        showNotification('تم تعليم الحصة كمكتملة');
        
        // تحديث localStorage
        saveData();
    } else {
        showNotification('لا توجد حصة نشطة حالياً');
    }
}

// إظهار الإشعارات
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    notification.style.display = 'block';
    
    // إضافة تأثير صوتي إذا كان مفعلاً
    if (appData.settings.sound) {
        playNotificationSound();
    }
    
    // إضافة تأثير اهتزاز إذا كان مفعلاً
    if (appData.settings.vibration && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
    }
    
    // إخفاء الإشعار بعد 5 ثواني
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// تشغيل صوت التنبيه
function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('لا يمكن تشغيل الصوت:', error);
    }
}

// إضافة أزرار الإدارة
function addManagementButtons() {
    const settingsScreen = document.getElementById('settings');
    
    const managementSection = document.createElement('div');
    managementSection.style.marginTop = '30px';
    managementSection.style.paddingTop = '20px';
    managementSection.style.borderTop = '2px solid #eee';
    
    managementSection.innerHTML = `
        <h3 style="margin-bottom: 15px;">إدارة البيانات</h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button type="button" id="exportData" class="secondary-btn" style="flex: 1; min-width: 120px;">تصدير البيانات</button>
            <button type="button" id="importData" class="secondary-btn" style="flex: 1; min-width: 120px;">استيراد البيانات</button>
            <button type="button" id="clearData" class="secondary-btn" style="flex: 1; min-width: 120px; background: #e74c3c;">مسح الكل</button>
        </div>
        <input type="file" id="importFile" accept=".json" style="display: none;">
    `;
    
    settingsScreen.appendChild(managementSection);
    
    // إضافة مستمعي الأحداث للأزرار الجديدة
    document.getElementById('exportData').addEventListener('click', exportData);
    document.getElementById('importData').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('clearData').addEventListener('click', clearAllData);
    
    document.getElementById('importFile').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            importData(e.target.files[0]);
        }
    });
}

// التحقق من دعم المتصفح
function checkBrowserSupport() {
    const supports = {
        serviceWorker: 'serviceWorker' in navigator,
        localStorage: 'localStorage' in window,
        notifications: 'Notification' in window,
        vibration: 'vibrate' in navigator
    };
    
    console.log('دعم المتصفح:', supports);
    
    if (!supports.serviceWorker) {
        console.warn('Service Worker غير مدعوم في هذا المتصفح');
    }
    
    if (!supports.localStorage) {
        alert('التطبيق يحتاج إلى دعم localStorage للعمل بشكل صحيح');
    }
    
    return supports;
}

// التحقق من الدعم عند التحميل
checkBrowserSupport();
