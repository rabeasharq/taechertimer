// إدارة PWA
class PWAHandler {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = document.getElementById('installButton');
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupNotifications();
    }

    // تسجيل Service Worker
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then((registration) => {
                        console.log('ServiceWorker registered successfully: ', registration.scope);
                    })
                    .catch((error) => {
                        console.log('ServiceWorker registration failed: ', error);
                    });
            });
        }
    }

    // إعداد موجه التثبيت
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event fired');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        this.installButton.addEventListener('click', async () => {
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                this.hideInstallButton();
                this.deferredPrompt = null;
            }
        });

        // إخفاء الزر إذا تم التثبيت مسبقاً
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallButton();
            this.deferredPrompt = null;
        });
    }

    // إعداد الإشعارات
    setupNotifications() {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                // يمكنك طلب الإذن عند الحاجة
                console.log('يمكن طلب إذن الإشعارات لاحقاً');
            }
        }
    }

    showInstallButton() {
        this.installButton.style.display = 'block';
    }

    hideInstallButton() {
        this.installButton.style.display = 'none';
    }

    // طلب إذن الإشعارات
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }

    // إرسال إشعار
    async sendNotification(title, options = {}) {
        if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
                icon: './assets/icons/icon-192x192.png',
                badge: './assets/icons/icon-72x72.png',
                ...options
            });
            return true;
        }
        return false;
    }
}

// تهيئة PWA عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.pwaHandler = new PWAHandler();
});

// وظائف مساعدة لـ PWA
const PWAUtils = {
    // التحقق مما إذا كان التطبيق مثبتاً
    isStandalone: () => window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true,

    // الحصول على حالة التثبيت
    getInstallStatus: () => {
        return {
            isStandalone: PWAUtils.isStandalone(),
            hasPrompt: !!window.pwaHandler?.deferredPrompt,
            notificationPermission: Notification.permission
        };
    },

    // تحديث التطبيق
    checkForUpdates: async () => {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            await registration.update();
            console.log('Service Worker updated');
        }
    }
};

// جعل الوظائف متاحة globally
window.PWAUtils = PWAUtils;
