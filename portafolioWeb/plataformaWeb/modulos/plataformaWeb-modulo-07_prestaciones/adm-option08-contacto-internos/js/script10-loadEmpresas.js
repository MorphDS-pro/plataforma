import { db } from './script01-firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const registerCompany = document.getElementById('registerCompany');

async function loadEmpresas() {
  try {
    const querySnapshot = await getDocs(collection(db, 'unidades'));
    registerCompany.innerHTML = '<option value="">Selecciona una unidad</option>';
    if (querySnapshot.empty) {
      return;
    }
    const unidades = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      unidades.push({
        id: doc.id,
        nombre: data.nombre || ''
      });
    });
    unidades.sort((a, b) => {
      const nombreA = a.nombre || '';
      const nombreB = b.nombre || '';
      return nombreA.localeCompare(nombreB);
    });
    unidades.forEach((unidad) => {
      const option = document.createElement('option');
      option.value = unidad.id;
      option.textContent = unidad.nombre;
      registerCompany.appendChild(option);
    });
  } catch (error) {
    console.error('Error al obtener las unidades:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadEmpresas);
