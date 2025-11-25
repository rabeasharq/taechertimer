// بيانات التطبيق
let appData = {
    teacher: "أ. أحمد محمد",
    school: "مدرسة النجاح الثانوية",
    subject: "الرياضيات",
    weeklyQuota: 20,
    completedClasses: 5,
    schedule: {
        saturday: [
            {type: "assembly", class: "", room: ""},
            {class: "العاشر", room: "١٠١"},
            {class: "", room: ""},
            {class: "", room: ""},
            {type: "break"},
            {class: "التاسع", room: "٢٠٣"},
            {class: "", room: ""},
            {class: "", room: ""},
            {class: "", room: ""}
        ],
        sunday: [
            {type: "assembly", class: "", room: ""},
            {class: "", room: ""},
            {class: "الحادي عشر", room: "٣٠٥"},
            {class: "", room: ""},
            {type: "break"},
            {class: "", room: ""},
            {class: "الثامن", room: "١٠٤"},
            {class: "", room: ""},
            {class: "", room: ""}
        ],
        monday: [
            {type: "assembly", class: "", room: ""},
            {class: "التاسع", room: "٢٠١"},
            {class: "", room: ""},
            {class: "العاشر", room: "١٠٢"},
            {type: "break"},
            {class: "", room: ""},
            {class: "", room: ""},
            {class: "الحادي عشر", room: "٣٠٤"},
            {class: "", room: ""}
        ],
        tuesday: [
            {type: "assembly", class: "", room: ""},
            {class: "", room: ""},
            {class: "الثامن", room: "١٠٥"},
            {class: "", room: ""},
            {type: "break"},
            {class: "العاشر", room: "١٠٣"},
            {class: "", room: ""},
            {class: "", room: ""},
            {class: "التاسع", room: "٢٠٢"}
        ],
        wednesday: [
            {type: "assembly", class: "", room: ""},
            {class: "", room: ""},
            {class: "", room: ""},
            {class: "الثامن", room: "١٠٦"},
            {type: "break"},
            {class: "الحادي عشر", room: "٣٠٦"},
            {class: "", room: ""},
            {class: "التاسع", room: "٢٠٤"},
            {class: "", room: ""}
        ],
        thursday: [
            {type: "assembly", class: "", room: ""},
            {class: "الحادي عشر", room: "٣٠١"},
            {class: "", room: ""},
            {class: "", room: ""},
            {type: "break"},
            {class: "", room: ""},
            {class: "العاشر", room: "١٠٧"},
            {class: "الثامن", room: "١٠٨"},
            {class: "", room: ""}
        ]
    },
    classTimes: [
        "07:30 - 08:00", // طابور صباحي
        "08:00 - 08:40", // الحصة الأولى
        "08:40 - 09:20", // الحصة الثانية
        "09:20 - 10:00", // الحصة الثالثة
        "10:30 - 11:10", // الحصة الرابعة
        "11:10 - 11:50", // الحصة الخامسة
        "11:50 - 12:30", // الحصة السادسة
        "12:30 - 13:00"  // الحصة السابعة
    ],
    settings: {
        notifications: true,
        sound: true,
        vibration: true,
        theme: 'auto'
    }
};

// تهيئة التخزين
function initStorage() {
    const savedData = localStorage.getItem('teacherScheduleApp');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            appData = {...appData, ...parsedData};
            console.log('تم تحميل البيانات المحفوظة');
        } catch (error) {
            console.error('خطأ في تحميل البيانات المحفوظة:', error);
        }
    }
}

// حفظ البيانات
function saveData() {
    try {
        localStorage.setItem('teacherScheduleApp', JSON.stringify(appData));
        console.log('تم حفظ البيانات');
    } catch (error) {
        console.error('خطأ في حفظ البيانات:', error);
    }
}

// تصدير البيانات
function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `teachertimer-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// استيراد البيانات
function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            appData = {...appData, ...importedData};
            saveData();
            location.reload();
        } catch (error) {
            console.error('خطأ في استيراد البيانات:', error);
            alert('خطأ في استيراد الملف. يرجى التأكد من صحة الملف.');
        }
    };
    reader.readAsText(file);
}

// مسح جميع البيانات
function clearAllData() {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
        localStorage.removeItem('teacherScheduleApp');
        location.reload();
    }
}

// تهيئة التخزين عند التحميل
initStorage();
