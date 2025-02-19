# TYPETYPE

This project is a React application built with Vite, Tailwind CSS, and Firebase Firestore. It is a system about typing test.

## Getting Started

### Prerequisites
Before cloning the project, ensure you have the following installed:

- Git (https://git-scm.com/): Download and install Git
- Node.js (https://nodejs.org/) & npm (https://www.npmjs.com/): Download and install Node.js (includes npm)
- Visual Studio Code (VS Code) (https://code.visualstudio.com/download): Download and install VS Code

### Installation

**Clone the repository:**
1.	Open VS Code.
2.	Open the Terminal in VS Code (Ctrl + ~ or View > Terminal).
3.	Navigate to the folder where you want to clone the project like <b>cd Desktop/ReactJS</b> :
```bash
cd your/file/path
```
4. Clone the repository using Git:
```bash
git clone https://github.com/Pan630/typetype.git
```
5. Navigate into the project folder:
```bash
cd repository-name
```

**Installing Dependencies**
After cloning the project, install the required dependencies:
```bash
npm install
```

## Firebase Setup

### Create a Firebase Project

1.  Go to the [Firebase console](https://console.firebase.google.com/).
2.  Click "Add project" and follow the instructions to create a new project.
3.  Once the project is created, click on the "Web" icon (</>) to add a web app to your Firebase project.
4.  Follow the instructions to register your app and get your Firebase configuration.  You'll get a configuration object that looks something like this:

    ```javascript
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    ```

5.  Replace the placeholder values in `firebaseConfig` with your actual Firebase configuration. Typically, this is done in a file like `firebase.js` in firebase folder.

### Firestore Restore Instructions

1.  Set up your Firebase project:
    *   Go to Firebase Project Setting > Service accounts; create a service account and download the service account key JSON file (`serviceAccountKey.json`).

2. Place the `serviceAccountKey.json` file:
*   Copy the `serviceAccountKey.json` file that you downloaded from the Firebase console into firestore directory which the same directory as the `firestore_restore.js` script.

3.  Obtain the backup data:

    *   Download the `firestore_data.json` backup file from Google Drive(https://drive.google.com/file/d/1_AUgm79TxTELl9YRQL3EFea7zldaYWu8/view?usp=sharing).

4.  Run the restore script:

    *   Navigate to the project directory in your terminal.
    *   Run: 
    ```bash
    node firestore_restore.js
    ```

5.  If want to export data from Firestore:

    *   Navigate to the project directory in your terminal.
    *   Run: 
    ```bash
    node exportFirestore.js
    ```

## Running the Project
To start the development server, run:
```bash
npm run dev
```