import admin from "firebase-admin";
import fs from "fs";
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

// Configuration (using environment variables)
const BACKUP_FILE = process.env.BACKUP_FILE || `firestore_data.json`;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function backupFirestore() {
    try {
        const collections = await db.listCollections();
        const backupData = {};
        const totalCollections = collections.length;
        let processedCollections = 0;

        for (const collection of collections) {
            try {
                let allDocs = [];
                let query = collection;

                while (true) {
                    const snapshot = await query.get();
                    if (snapshot.empty) break;

                    allDocs.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
                    query = collection.startAfter(lastDoc);
                }

                backupData[collection.id] = allDocs;
                processedCollections++;
                console.log(`Backed up ${collection.id} (${processedCollections} of ${totalCollections} collections)`);

            } catch (collectionError) {
                console.error(`Error backing up collection ${collection.id}:`, collectionError);
            }
        }

        fs.writeFileSync(BACKUP_FILE, JSON.stringify(backupData, null, 2));
        console.log(`Backup complete! File saved as ${BACKUP_FILE}`);

    } catch (error) {
        console.error("Backup failed:", error);
    }
}


backupFirestore();