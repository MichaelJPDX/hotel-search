import firebase from 'firebase/app'

import 'firebase/firestore'

if (!firebase.apps.length) {
    const config = {
        apiKey: process.env.VUE_APP_FB_API,
        authDomain: process.env.VUE_APP_DOMAIN,
        databaseURL: process.env.VUE_APP_DB,
        projectId: process.env.VUE_APP_PROJECT,
        storageBucket: process.env.VUE_APP_BUCKET,
        messagingSenderId: process.env.VUE_APP_MSGID,
        appId: process.env.VUE_APP_APP_ID
    }
    firebase.initializeApp(config)
    // firebase.firestore().settings({timestampsInSnapshots: true})
}

const fireDb = firebase.firestore()

export {fireDb}