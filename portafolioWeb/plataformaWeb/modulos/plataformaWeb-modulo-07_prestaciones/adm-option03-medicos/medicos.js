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
let medicosData = [];
let nombreCompleto = "";

const tableBody = document.getElementById('table-body');
const overlayLoading = document.getElementById('overlayLoading');
const spinnerLoading = document.getElementById('spinnerLoading');
const loadingTextLoading = document.getElementById('loadingTextLoading');
const pageNumber = document.getElementById('pageNumber');
const btnPrevious = document.getElementById('btnPrevious');
const btnNext = document.getElementById('btnNext');
const formRegisterContainer = document.getElementById('formRegisterContainer');
const inputMedico = document.getElementById('registerMedico');
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
const btnImport = document.getElementById('btnImport');
const fileInput = document.getElementById('fileInput');
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

function addRowToTable(acciones, id, medico, fechaCreacion, registradoPor, docId) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', docId);
    row.innerHTML = `
        <td><i class="fas fa-trash-alt delete-icon" data-id="${docId}"></i></td>
        <td>${id || ''}</td>
        <td>${medico || 'Sin Nombre'}</td>
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
    const snapshot = await getDocs(collection(dbData, 'medicos'));
    return String(snapshot.size + 1).padStart(3, '0');
}

function loadMedicosRealTime(filters = {}) {
    showSpinner('loading');
    onSnapshot(collection(dbData, 'medicos'), (snapshot) => {
        medicosData = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            medicosData.push({ docId: doc.id, ...data });
        });

        medicosData.sort((a, b) => a.id - b.id);

        let filteredData = medicosData;
        if (Object.keys(filters).length > 0) {
            filteredData = medicosData.filter(medico => {
                return (
                    (!filters[0] || (medico.acciones || '').toLowerCase().includes(filters[0].toLowerCase())) &&
                    (!filters[1] || (medico.id || '').toString().toLowerCase().includes(filters[1].toLowerCase())) &&
                    (!filters[2] || (medico.medico || '').toLowerCase().includes(filters[2].toLowerCase())) &&
                    (!filters[3] || (medico.fechaCreacion || '').toLowerCase().includes(filters[3].toLowerCase())) &&
                    (!filters[4] || (medico.registradoPor || '').toLowerCase().includes(filters[4].toLowerCase()))
                );
            });
        }

        totalPages = Math.ceil(filteredData.length / itemsPerPage);
        pageNumber.textContent = `Página ${currentPage} de ${totalPages}`;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const pageMedicos = filteredData.slice(startIndex, startIndex + itemsPerPage);

        tableBody.innerHTML = '';
        pageMedicos.forEach(medico => {
            addRowToTable(medico.acciones, medico.id, medico.medico, medico.fechaCreacion, medico.registradoPor, medico.docId);
        });

        hideSpinner('loading');
    }, (error) => {
        hideSpinner('loading');
        showMessage(messageError, errorText, "Error al cargar datos: " + error.message);
    });
}

btnSave.addEventListener('click', async (e) => {
    e.preventDefault();

    const medico = inputMedico.value.trim();
    const registradoPor = nombreCompleto || "Usuario Desconocido";
    const fechaCreacion = new Date().toLocaleDateString('es-CL');

    if (!medico) {
        showMessage(messageError, errorText, "Por favor, complete el campo de médico.");
        return;
    }

    try {
        showSpinner('register');
        const id = await getNextId();
        await addDoc(collection(dbData, 'medicos'), {
            id,
            medico,
            registradoPor,
            fechaCreacion,
            timestamp: serverTimestamp()
        });
        hideSpinner('register');
        showMessage(messageSuccess, successText, `Médico ${medico} registrado con éxito.`);
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
    btnConfirmDeleteNew.onclick = () => deleteMedico(docId, row);
    btnCancelDeleteNew.onclick = () => confirmationDeleteContainerNew.classList.add('hidden');
}

async function deleteMedico(docId, row) {
    try {
        confirmationDeleteContainerNew.classList.add('hidden');
        showSpinner('delete');
        const docRef = doc(dbData, 'medicos', docId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error(`El documento con ID ${docId} no existe en Firestore`);
        }
        await deleteDoc(docRef);
        row.remove();
        hideSpinner('delete');
        showMessage(messageSuccess, successText, "Médico eliminado con éxito.");
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
    loadMedicosRealTime(filters);
};

btnDownload.addEventListener('click', async () => {
    try {
        const snapshot = await getDocs(collection(dbData, 'medicos'));
        const data = [];
        snapshot.forEach(doc => {
            const medico = doc.data();
            data.push({
                ID: medico.id,
                Médico: medico.medico,
                "Fecha de Creación": medico.fechaCreacion,
                "Registrado Por": medico.registradoPor
            });
        });
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Médicos");
        XLSX.writeFile(wb, "medicos.xlsx");
    } catch (error) {
        showMessage(messageError, errorText, "Error al descargar: " + error.message);
    }
});

// Nueva funcionalidad: Importar Excel
btnImport.addEventListener('click', () => {
    fileInput.click(); // Activa el input oculto al hacer clic en el botón
});

fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    showSpinner('register'); // Usamos el spinner de registro para la importación

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Procesar los datos del Excel
            const registradoPor = nombreCompleto || "Usuario Desconocido";
            const fechaCreacion = new Date().toLocaleDateString('es-CL');

            for (const row of jsonData) {
                const medico = row["Médicos"] || row["medicos"] || row["Médico"] || row["medico"];
                if (medico) {
                    const id = await getNextId();
                    await addDoc(collection(dbData, 'medicos'), {
                        id,
                        medico: medico.trim(),
                        registradoPor,
                        fechaCreacion,
                        timestamp: serverTimestamp()
                    });
                }
            }

            hideSpinner('register');
            showMessage(messageSuccess, successText, `Médicos importados con éxito desde ${file.name}.`);
            fileInput.value = ''; // Limpiar el input después de importar
        };
        reader.readAsArrayBuffer(file);
    } catch (error) {
        hideSpinner('register');
        showMessage(messageError, errorText, `Error al importar el archivo: ${error.message}`);
        fileInput.value = '';
    }
});

btnPrevious.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadMedicosRealTime();
    }
});

btnNext.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadMedicosRealTime();
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

    loadMedicosRealTime();
});

document.getElementById('btnClearFilters').addEventListener('click', () => {
    document.querySelectorAll('.filter-input').forEach(input => input.value = '');
    currentPage = 1;
    loadMedicosRealTime();
});