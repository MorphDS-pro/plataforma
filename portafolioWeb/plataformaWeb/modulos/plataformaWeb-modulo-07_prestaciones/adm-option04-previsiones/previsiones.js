import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import { getFirestore, collection, onSnapshot, getDocs, addDoc, deleteDoc, doc, serverTimestamp, getDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const firebaseConfigAuth = {
    apiKey: "AIzaSyDsSD0EcY_QKPcqycpiynXg--mO9VMvRDs",
    authDomain: "usuarios-d4364.firebaseapp.com",
    projectId: "usuarios-d4364",
    storageBucket: "usuarios-d4364.firebasestorage.app",
    messagingSenderId: "1050588492432",
    appId: "1:1050588492432:web:5803cad6718dfa36a09e15",
    measurementId: "G-SZD8728PHP"
};

const firebaseConfigData = {
    apiKey: "AIzaSyDfz0_7v43TmV0rlFM9UhnVVHLFGtRWhGw",
    authDomain: "prestaciones-57dcd.firebaseapp.com",
    projectId: "prestaciones-57dcd",
    storageBucket: "prestaciones-57dcd.firebasestorage.app",
    messagingSenderId: "409471759723",
    appId: "1:409471759723:web:faa6812772f44baa3ec82e",
    measurementId: "G-0CZ9BMJWMV"
};

const appAuth = initializeApp(firebaseConfigAuth, "authApp");
const appData = initializeApp(firebaseConfigData, "dataApp");

const dbAuth = getFirestore(appAuth);
const dbData = getFirestore(appData);

let currentPage = 1;
const itemsPerPage = 20;
let totalPages = 1;
let previsionesData = [];
let nombreCompleto = "";

const tableBody = document.getElementById('table-body');
const overlayLoading = document.getElementById('overlayLoading');
const spinnerLoading = document.getElementById('spinnerLoading');
const loadingTextLoading = document.getElementById('loadingTextLoading');
const pageNumber = document.getElementById('pageNumber');
const btnPrevious = document.getElementById('btnPrevious');
const btnNext = document.getElementById('btnNext');
const formRegisterContainer = document.getElementById('formRegisterContainer');
const inputPrevision = document.getElementById('registerPrevision');
const btnSave = document.getElementById('btnSave');
const btnReset = document.getElementById('btnReset');
const overlayRegister = document.getElementById('overlayRegister');
const spinnerRegister = document.getElementById('spinnerRegister');
const loadingTextRegister = document.getElementById('loadingTextRegister');
const confirmationDeleteContainerNew = document.getElementById('confirmationDeleteContainerNew');
const btnConfirmDeleteNew = document.getElementById('btnConfirmDeleteNew');
const btnCancelDeleteNew = document.getElementById('btnCancelDeleteNew');
const overlayDelete = document.getElementById('overlayDelete');
const spinnerDelete = document.getElementById('spinnerDelete');
const loadingTextDelete = document.getElementById('loadingTextDelete');
const btnDownload = document.getElementById('btnDownload');
const messageSuccess = document.getElementById('messageSuccess');
const successText = document.getElementById('successText');
const messageError = document.getElementById('messageError');
const errorText = document.getElementById('errorText');
const messageWarning = document.getElementById('messageWarning');
const warningText = document.getElementById('warningText');
const registerUsuario = document.getElementById('registerUsuario');

function showSpinner(type) {
    const spinnerMap = {
        'loading': [overlayLoading, spinnerLoading, loadingTextLoading],
        'register': [overlayRegister, spinnerRegister, loadingTextRegister],
        'delete': [overlayDelete, spinnerDelete, loadingTextDelete]
    };
    spinnerMap[type].forEach(el => el.classList.remove('hidden'));
}

function hideSpinner(type) {
    const spinnerMap = {
        'loading': [overlayLoading, spinnerLoading, loadingTextLoading],
        'register': [overlayRegister, spinnerRegister, loadingTextRegister],
        'delete': [overlayDelete, spinnerDelete, loadingTextDelete]
    };
    spinnerMap[type].forEach(el => el.classList.add('hidden'));
}

function showMessage(element, textElement, message) {
    textElement.textContent = message;
    element.classList.remove('hidden');
    setTimeout(() => element.classList.add('hidden'), 3000);
}

function addRowToTable(acciones, id, prevision, fechaCreacion, registradoPor, docId) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', docId);
    row.innerHTML = `
        <td><i class="fas fa-trash-alt delete-icon" data-id="${docId}"></i></td>
        <td>${id || ''}</td>
        <td>${prevision || 'Sin Nombre'}</td>
        <td>${fechaCreacion || ''}</td>
        <td>${registradoPor || ''}</td>
    `;
    tableBody.appendChild(row);

    const deleteIcon = row.querySelector('.delete-icon');
    if (deleteIcon) {
        deleteIcon.addEventListener('click', () => showDeleteConfirmation(docId, row));
    }
}

async function getNextId() {
    const snapshot = await getDocs(collection(dbData, 'previsiones'));
    return String(snapshot.size + 1).padStart(3, '0');
}

function loadPrevisionesRealTime(filters = {}) {
    showSpinner('loading');
    onSnapshot(collection(dbData, 'previsiones'), (snapshot) => {
        previsionesData = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            previsionesData.push({ docId: doc.id, ...data });
        });

        previsionesData.sort((a, b) => a.id - b.id);

        let filteredData = previsionesData;
        if (Object.keys(filters).length > 0) {
            filteredData = previsionesData.filter(prevision => {
                return (
                    (!filters[0] || (prevision.acciones || '').toLowerCase().includes(filters[0].toLowerCase())) &&
                    (!filters[1] || (prevision.id || '').toString().toLowerCase().includes(filters[1].toLowerCase())) &&
                    (!filters[2] || (prevision.prevision || '').toLowerCase().includes(filters[2].toLowerCase())) &&
                    (!filters[3] || (prevision.fechaCreacion || '').toLowerCase().includes(filters[3].toLowerCase())) &&
                    (!filters[4] || (prevision.registradoPor || '').toLowerCase().includes(filters[4].toLowerCase()))
                );
            });
        }

        totalPages = Math.ceil(filteredData.length / itemsPerPage);
        pageNumber.textContent = `Página ${currentPage} de ${totalPages}`;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const pagePrevisiones = filteredData.slice(startIndex, startIndex + itemsPerPage);

        tableBody.innerHTML = '';
        pagePrevisiones.forEach(prevision => {
            addRowToTable(prevision.acciones, prevision.id, prevision.prevision, prevision.fechaCreacion, prevision.registradoPor, prevision.docId);
        });

        hideSpinner('loading');
    }, (error) => {
        hideSpinner('loading');
        showMessage(messageError, errorText, "Error al cargar datos: " + error.message);
    });
}

btnSave.addEventListener('click', async (e) => {
    e.preventDefault();

    const prevision = inputPrevision.value.trim();
    const registradoPor = nombreCompleto || "Usuario Desconocido";
    const fechaCreacion = new Date().toLocaleDateString('es-CL');

    if (!prevision) {
        showMessage(messageError, errorText, "Por favor, complete el campo de previsión.");
        return;
    }

    try {
        showSpinner('register');
        const id = await getNextId();
        await addDoc(collection(dbData, 'previsiones'), {
            id,
            prevision,
            registradoPor,
            fechaCreacion,
            timestamp: serverTimestamp()
        });
        hideSpinner('register');
        showMessage(messageSuccess, successText, `Previsión ${prevision} registrada con éxito.`);
        formRegisterContainer.reset();
    } catch (error) {
        hideSpinner('register');
        showMessage(messageError, errorText, "Error al registrar: " + error.message);
    }
});

btnReset.addEventListener('click', () => {
    formRegisterContainer.reset();
});

function showDeleteConfirmation(docId, row) {
    confirmationDeleteContainerNew.classList.remove('hidden');
    btnConfirmDeleteNew.onclick = () => deletePrevision(docId, row);
    btnCancelDeleteNew.onclick = () => confirmationDeleteContainerNew.classList.add('hidden');
}

async function deletePrevision(docId, row) {
    try {
        confirmationDeleteContainerNew.classList.add('hidden');
        showSpinner('delete');
        const docRef = doc(dbData, 'previsiones', docId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error(`El documento con ID ${docId} no existe en Firestore`);
        }
        await deleteDoc(docRef);
        row.remove();
        hideSpinner('delete');
        showMessage(messageSuccess, successText, "Previsión eliminada con éxito.");
    } catch (error) {
        hideSpinner('delete');
        showMessage(messageError, errorText, "Error al eliminar: " + error.message);
    }
}

window.toggleFilter = function(column) {
    const filterInput = document.querySelectorAll('.filter-input')[column];
    filterInput.classList.toggle('hidden');
    if (!filterInput.classList.contains('hidden')) filterInput.focus();
};

window.filterTable = function(column) {
    const filterInput = document.querySelectorAll('.filter-input')[column];
    const filterValue = filterInput.value;
    const filters = {};
    filters[column] = filterValue;
    document.querySelectorAll('.filter-input').forEach((input, index) => {
        if (index !== column && input.value) filters[index] = input.value;
    });
    currentPage = 1;
    loadPrevisionesRealTime(filters);
};

btnDownload.addEventListener('click', async () => {
    try {
        const snapshot = await getDocs(collection(dbData, 'previsiones'));
        const data = [];
        snapshot.forEach(doc => {
            const prevision = doc.data();
            data.push({
                ID: prevision.id,
                Previsión: prevision.prevision,
                "Fecha de Creación": prevision.fechaCreacion,
                "Registrado Por": prevision.registradoPor
            });
        });
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Previsiones");
        XLSX.writeFile(wb, "previsiones.xlsx");
    } catch (error) {
        showMessage(messageError, errorText, "Error al descargar: " + error.message);
    }
});

btnPrevious.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadPrevisionesRealTime();
    }
});

btnNext.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadPrevisionesRealTime();
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        showMessage(messageError, errorText, "No estás autenticado. Redirigiendo al login...");
        setTimeout(() => window.location.href = '../../login.html', 2000);
        return;
    }

    try {
        const userRef = doc(dbAuth, 'usuarios', userId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            nombreCompleto = docSnap.data().nombreCompleto;
            registerUsuario.textContent = nombreCompleto;
        } else {
            nombreCompleto = "Usuario Desconocido";
            registerUsuario.textContent = nombreCompleto;
        }
    } catch (error) {
        nombreCompleto = "Usuario Desconocido";
        registerUsuario.textContent = nombreCompleto;
    }

    loadPrevisionesRealTime();
});

document.getElementById('btnClearFilters').addEventListener('click', () => {
    document.querySelectorAll('.filter-input').forEach(input => input.value = '');
    currentPage = 1;
    loadPrevisionesRealTime();
});