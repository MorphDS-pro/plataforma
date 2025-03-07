import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyDsSD0EcY_QKPcqycpiynXg--mO9VMvRDs",
    authDomain: "usuarios-d4364.firebaseapp.com",
    projectId: "usuarios-d4364",
    storageBucket: "usuarios-d4364.firebasestorage.app",
    messagingSenderId: "1050588492432",
    appId: "1:1050588492432:web:5803cad6718dfa36a09e15",
    measurementId: "G-SZD8728PHP"
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
            } else {
                console.error("Usuario no encontrado en Firestore.");
                document.getElementById('registerUsuario').textContent = "Usuario Desconocido";
            }
        } catch (error) {
            console.error("Error al obtener el nombre completo:", error);
            document.getElementById('registerUsuario').textContent = "Usuario Desconocido (Error de Permisos)";
        }
    }

    obtenerNombreCompleto();
} else {
    console.error("No hay userId en sessionStorage.");
    document.getElementById('registerUsuario').textContent = "Usuario No Autenticado";
    setTimeout(() => window.location.href = '../../login.html', 2000);
}