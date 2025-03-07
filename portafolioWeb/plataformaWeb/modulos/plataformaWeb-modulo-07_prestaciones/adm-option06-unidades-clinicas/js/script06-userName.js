import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyCAQefjRO9ixEnnlyIohqnOI4MVzC38lc8",
    authDomain: "administrador-638bc.firebaseapp.com",
    projectId: "administrador-638bc",
    storageBucket: "administrador-638bc.firebasestorage.app",
    messagingSenderId: "31705925031",
    appId: "1:31705925031:web:0f3c1158f7a7ff91fde282",
    measurementId: "G-EJFSB52GBN"
};

const app2 = initializeApp(firebaseConfig, 'proyecto2');

const db2 = getFirestore(app2);

const userId = sessionStorage.getItem('userId');

if (userId) {
    async function obtenerNombreCompleto() {
        try {
            const userRef = doc(db2, 'usuarios', userId);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const nombreCompleto = docSnap.data().nombreCompleto;

                document.getElementById('registerUsuario').textContent = nombreCompleto;
                document.getElementById('importUsuario').textContent = nombreCompleto;
            } else {
                alert("Usuario no encontrado.");
                window.location.href = '../../Components/404ErrorPage.html';
            }
        } catch (error) {
            console.error("Error al obtener el nombre completo:", error);
            window.location.href = '../../Components/404ErrorPage.html';
        }
    }

    obtenerNombreCompleto();
} else {
    window.location.href = '../../Components/404ErrorPage.html';
}