// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api',
    ENDPOINTS: {
        AUTH: {
            REGISTER: '/auth/register',
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            ME: '/auth/me',
            UPDATE_PASSWORD: '/auth/updatepassword',
            CREATE_ADMIN: '/auth/create-admin'
        },
        CONTESTS: '/contests',
        PARTICIPANTS: '/participants',
        ANALYTICS: '/analytics'
    }
};

// Firebase Configuration (Optional - Configure if using Firebase)
const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase (if configured)
let firebaseInitialized = false;
try {
    if (typeof firebase !== 'undefined' && FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(FIREBASE_CONFIG);
        firebaseInitialized = true;
        console.log('Firebase initialized');
    }
} catch (error) {
    console.log('Firebase not initialized:', error.message);
}
