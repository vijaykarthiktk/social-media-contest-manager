const admin = require('firebase-admin');

let firebaseApp;

const initializeFirebase = () => {
    try {
        // Initialize Firebase Admin SDK
        if (!admin.apps.length) {
            // Option 1: Using service account key file (recommended for development)
            // Uncomment if you have a service account key file
            /*
            const serviceAccount = require('../../firebase-credentials.json');
            firebaseApp = admin.initializeApp({
              credential: admin.credential.cert(serviceAccount),
              databaseURL: process.env.FIREBASE_DATABASE_URL
            });
            */

            // Option 2: Using environment variables (recommended for production)
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
                databaseURL: process.env.FIREBASE_DATABASE_URL
            });

            console.log('✅ Firebase initialized successfully');
        }
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error.message);
        console.log('⚠️  Firebase features will be disabled. App will run with MongoDB only.');
    }
};

const getFirebaseDB = () => {
    if (!firebaseApp) {
        throw new Error('Firebase not initialized');
    }
    return admin.database();
};

const getFirestore = () => {
    if (!firebaseApp) {
        throw new Error('Firebase not initialized');
    }
    return admin.firestore();
};

module.exports = {
    initializeFirebase,
    getFirebaseDB,
    getFirestore,
    admin
};
