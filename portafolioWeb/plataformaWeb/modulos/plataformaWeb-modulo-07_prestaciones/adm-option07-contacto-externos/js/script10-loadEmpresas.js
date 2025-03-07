import { db } from './script01-firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const registerCompany = document.getElementById('registerCompany');

async function loadEmpresas() {
    try {
        const querySnapshot = await getDocs(collection(db, 'companies'));
        registerCompany.innerHTML = '<option value="">Selecciona una empresa</option>';
        if (querySnapshot.empty) {
            console.log('No se encontraron empresas en Firestore.');
            return;
        }
        const empresas = [];
        querySnapshot.forEach((doc) => {
            const empresaData = doc.data();
            empresas.push({
                id: doc.id,
                nombre: empresaData.empresa || ''
            });
        });
        empresas.sort((a, b) => {
            const nombreA = a.nombre || '';
            const nombreB = b.nombre || '';
            return nombreA.localeCompare(nombreB);
        });
        empresas.forEach((empresa) => {
            const option = document.createElement('option');
            option.value = empresa.id;
            option.textContent = empresa.nombre;
            registerCompany.appendChild(option);
        });
    } catch (error) {
        console.error('Error al obtener las empresas:', error);
    }
}

loadEmpresas();
