import admin from "firebase-admin";
import fs from "fs";
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' }; // Same as in the backup script

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function restoreFirestore(backupFilePath) {
    try {
        const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));

        for (const collectionName in backupData) {
            const collectionData = backupData[collectionName];

            for (const doc of collectionData) {
                const docId = doc.id; // Use the ID from the backup
                delete doc.id; // Remove the ID from the data itself, as it's used in set()

                try {
                    await db.collection(collectionName).doc(docId).set(doc); // Set the document
                    console.log(`Restored document ${docId} in collection ${collectionName}`);
                } catch (docError) {
                    console.error(`Error restoring document ${docId} in ${collectionName}:`, docError);
                }
            }
            console.log(`Collection ${collectionName} restored.`);
        }

        console.log("Firestore restore complete!");
    } catch (error) {
        console.error("Firestore restore failed:", error);
    }
}

const backupFile = process.env.BACKUP_FILE || "firestore_data.json";
restoreFirestore(backupFile);