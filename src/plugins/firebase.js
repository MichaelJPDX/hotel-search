import firebase from 'firebase/app'

import 'firebase/firestore'

if (!firebase.apps.length) {
    const config = {
        apiKey: "AIzaSyCEoCwXPb9RNS2OnFQ6NUnrjQwKwCok8M4",
        authDomain: "hotels-8fb5d.firebaseapp.com",
        databaseURL: "https://hotels-8fb5d.firebaseio.com",
        projectId: "hotels-8fb5d",
        storageBucket: "hotels-8fb5d.appspot.com",
        messagingSenderId: "156881667073",
        appId: "1:156881667073:web:fdebaf247bffadb5"
    }
    firebase.initializeApp(config)
    // firebase.firestore().settings({timestampsInSnapshots: true})
}

const fireDb = firebase.firestore()

export {fireDb}