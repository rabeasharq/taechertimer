// بدء العداد التنازلي
function startTimer() {
    setInterval(() => {
        updateCurrentClass();
    }, 1000);
}

// تحديث الحصة الحالية
function updateCurrentClass() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = getCurrentDay();
    
    // تحديد الحصة الحالية حسب الوقت
    let currentPeriod = getCurrentPeriod(currentHour, currentMinute);
    let nextPeriod = getNextPeriod(currentHour, currentMinute);
    
    // تحديث واجهة العداد
    updateCountdownUI(currentPeriod, nextPeriod, currentDay);
}

// تحديد الفترة الحالية
function getCurrentPeriod(hour, minute) {
    const timeInMinutes = hour * 60 + minute;
    
    // طابور صباحي (7:30 - 8:00)
    if (timeInMinutes >= 450 && timeInMinutes < 480) {
        return { type: 'assembly', index: 0, start: 450, end: 480 };
    }
    // الحصة الأولى (8:00 - 8:40)
    else if (timeInMinutes >= 480 && timeInMinutes < 520) {
        return { type: 'class', index: 1, start: 480, end: 520 };
    }
    // الحصة الثانية (8:40 - 9:20)
    else if (timeInMinutes >= 520 && timeInMinutes < 560) {
        return { type: 'class', index: 2, start: 520, end: 560 };
    }
    // الحصة الثالثة (9:20 - 10:00)
    else if (timeInMinutes >= 560 && timeInMinutes < 600) {
        return { type: 'class', index: 3, start: 560, end: 600 };
    }
    // استراحة (10:00 - 10:30)
    else if (timeInMinutes >= 600 && timeInMinutes < 630) {
        return { type: 'break', index: 4, start: 600, end: 630 };
    }
    // الحصة الرابعة (10:30 - 11:10)
    else if (timeInMinutes >= 630 && timeInMinutes < 670) {
        return { type: 'class', index: 5, start: 630, end: 670 };
    }
    // الحصة الخامسة (11:10 - 11:50)
    else if (timeInMinutes >= 670 && timeInMinutes < 710) {
        return { type: 'class', index: 6, start: 670, end: 710 };
    }
    // الحصة السادسة (11:50 - 12:30)
    else if (timeInMinutes >= 710 && timeInMinutes < 750) {
        return { type: 'class', index: 7, start: 710, end: 750 };
    }
    // الحصة السابعة (12:30 - 13:00)
    else if (timeInMinutes >= 750 && timeInMinutes < 780) {
        return { type: 'class', index: 8, start: 750, end: 780 };
    }
    
    return null;
}

// تحديد الفترة التالية
function getNextPeriod(hour, minute) {
    const timeInMinutes = hour * 60 + minute;
    
    if (timeInMinutes < 450) return { type: 'assembly', index: 0, start: 450, end: 480 };
    else if (timeInMinutes < 480) return { type: 'class', index: 1, start: 480, end: 520 };
    else if (timeInMinutes < 520) return { type: 'class', index: 2, start: 520, end: 560 };
    else if (timeInMinutes < 560) return { type: 'class', index: 3, start: 560, end: 600 };
    else if (timeInMinutes < 600) return { type: 'break', index: 4, start: 600, end: 630 };
    else if (timeInMinutes < 630) return { type: 'class', index: 5, start: 630, end: 670 };
    else if (timeInMinutes < 670) return { type: 'class', index: 6, start: 670, end: 710 };
    else if (timeInMinutes < 710) return { type: 'class', index: 7, start: 710, end: 750 };
    else if (timeInMinutes < 750) return { type: 'class', index: 8, start: 750, end: 780 };
    
    return null;
}

// الحصول على اليوم الحالي
function getCurrentDay() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'saturday'];
    const today = new Date().getDay();
    return days[today];
}

// تحديث واجهة العداد
function updateCountdownUI(currentPeriod, nextPeriod, currentDay) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    if (currentPeriod) {
        const timeInMinutes = currentHour * 60 + currentMinute;
        const remainingSeconds = (currentPeriod.end - timeInMinutes) * 60 - currentSecond;
        
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // تحديث شريط التقدم
        const totalDuration = currentPeriod.end - currentPeriod.start;
        const elapsed = timeInMinutes - currentPeriod.start;
        const progress = (elapsed / totalDuration) * 100;
        document.getElementById('classProgress').style.width = `${progress}%`;
        
        if (currentPeriod.type === 'assembly') {
            document.getElementById('currentClassTitle').textContent = 'طابور صباحي';
            document.getElementById('countdownLabel').textContent = 'متبقي للطابور';
            document.getElementById('classTimeRange').textContent = '07:30 - 08:00';
        } else if (currentPeriod.type === 'break') {
            document.getElementById('currentClassTitle').textContent = 'استراحة';
            document.getElementById('countdownLabel').textContent = 'متبقي للاستراحة';
            document.getElementById('classTimeRange').textContent = '10:00 - 10:30';
        } else {
            const classInfo = appData.schedule[currentDay] ? appData.schedule[currentDay][currentPeriod.index] : null;
            if (classInfo && classInfo.class) {
                document.getElementById('currentClassTitle').textContent = 
                    `${appData.subject} - ${classInfo.class} (${classInfo.room})`;
            } else {
                document.getElementById('currentClassTitle').textContent = 'لا توجد حصة حالية';
            }
            document.getElementById('countdownLabel').textContent = 'متبقي للحصة';
            document.getElementById('classTimeRange').textContent = appData.classTimes[currentPeriod.index];
        }
    } else {
        document.getElementById('currentClassTitle').textContent = 'لا توجد حصة حالية';
        document.getElementById('timer').textContent = '--:--';
        document.getElementById('classTimeRange').textContent = '--:-- - --:--';
        document.getElementById('classProgress').style.width = '0%';
    }
    
    if (nextPeriod) {
        if (nextPeriod.type === 'assembly') {
            document.getElementById('nextClassDetails').textContent = 'طابور صباحي';
            document.getElementById('nextClassTime').textContent = '07:30 - 08:00';
        } else if (nextPeriod.type === 'break') {
            document.getElementById('nextClassDetails').textContent = 'استراحة';
            document.getElementById('nextClassTime').textContent = '10:00 - 10:30';
        } else {
            const nextClassInfo = appData.schedule[currentDay] ? appData.schedule[currentDay][nextPeriod.index] : null;
            if (nextClassInfo && nextClassInfo.class) {
                document.getElementById('nextClassDetails').textContent = 
                    `${appData.subject} - ${nextClassInfo.class} (${nextClassInfo.room})`;
            } else {
                document.getElementById('nextClassDetails').textContent = 'حصة فارغة';
            }
            document.getElementById('nextClassTime').textContent = appData.classTimes[nextPeriod.index];
        }
    } else {
        document.getElementById('nextClassDetails').textContent = 'لا توجد حصة تالية';
        document.getElementById('nextClassTime').textContent = '--:-- - --:--';
    }
    
    // التحقق من التنبيهات
    checkAlarms(currentPeriod, nextPeriod, currentDay);
}

// التحقق من التنبيهات
function checkAlarms(currentPeriod, nextPeriod, currentDay) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const timeInMinutes = currentHour * 60 + currentMinute;
    
    // تنبيه قبل 5 دقائق من بداية الحصة التالية
    if (nextPeriod && (nextPeriod.start - timeInMinutes) === 5) {
        if (nextPeriod.type === 'class') {
            const nextClassInfo = appData.schedule[currentDay] ? appData.schedule[currentDay][nextPeriod.index] : null;
            if (nextClassInfo && nextClassInfo.class) {
                showNotification(`الحصة التالية: ${appData.subject} - ${nextClassInfo.class} ستبدأ خلال 5 دقائق`);
                
                // إرسال إشعار PWA
                if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
                    navigator.serviceWorker.ready.then(function(registration) {
                        registration.showNotification('تطبيق توقيت المعلم', {
                            body: `الحصة التالية: ${appData.subject} - ${nextClassInfo.class} ستبدأ خلال 5 دقائق`,
                            icon: './assets/icons/icon-192x192.png',
                            badge: './assets/icons/icon-72x72.png',
                            vibrate: [200, 100, 200]
                        });
                    });
                }
            }
        } else if (nextPeriod.type === 'assembly') {
            showNotification('طابور الصباح سيبدأ خلال 5 دقائق');
        }
    }
    
    // تنبيه بنهاية الحصة الحالية
    if (currentPeriod && (currentPeriod.end - timeInMinutes) === 1) {
        if (currentPeriod.type === 'class') {
            showNotification('الحصة على وشك الانتهاء');
        }
    }
}
