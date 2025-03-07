import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import { getFirestore, collection, onSnapshot, getDocs, addDoc, deleteDoc, doc, serverTimestamp, getDoc, query, where, updateDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

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
const itemsPerPage = 100;
let totalPages = 1;
let codigosData = [];
let nombreCompleto = "";
let currentTab = 'codigos';

const tableBody = document.getElementById('table-body');
const pendientesTableBody = document.getElementById('pendientesTableBody');
const overlayLoading = document.getElementById('overlayLoading');
const spinnerLoading = document.getElementById('spinnerLoading');
const loadingTextLoading = document.getElementById('loadingTextLoading');
const pageNumber = document.getElementById('pageNumber');
const btnPrevious = document.getElementById('btnPrevious');
const btnNext = document.getElementById('btnNext');
const formRegisterContainer = document.getElementById('formRegisterContainer');
const inputReference = document.getElementById('registerReference');
const inputDetails = document.getElementById('registerDetails');
const inputPriceNet = document.getElementById('registerPriceNet');
const inputCode = document.getElementById('registerCode');
const selectCompany = document.getElementById('registerCompany');
const descriptionSpan = document.getElementById('registerDescription');
const priceSpan = document.getElementById('registerPrice');
const selectClassification = document.getElementById('registerClassification');
const statusActive = document.getElementById('registerStatusActive');
const statusInactive = document.getElementById('registerStatusInactive');
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
const overlayImport = document.getElementById('overlayImport');
const spinnerImport = document.getElementById('spinnerImport');
const loadingTextImport = document.getElementById('loadingTextImport');
const messageSuccess = document.getElementById('messageSuccess');
const successText = document.getElementById('successText');
const messageError = document.getElementById('messageError');
const errorText = document.getElementById('errorText');
const messageWarning = document.getElementById('messageWarning');
const warningText = document.getElementById('warningText');
const registerUsuario = document.getElementById('registerUsuario');
const tabCodigos = document.getElementById('tabCodigos');
const tabPendientes = document.getElementById('tabPendientes');
const codigosTable = document.getElementById('codigosTable');
const pendientesTable = document.getElementById('pendientesTable');
const btnClearFilters = document.getElementById('btnClearFilters');
const editModalOverlay = document.getElementById('editModalOverlay');
const editModal = document.getElementById('editModal');
const closeEditModal = document.getElementById('closeEditModal');
const editModalTitle = document.getElementById('editModalTitle');
const editModalCodeValue = document.getElementById('editModalCodeValue');
const editModalDescriptionValue = document.getElementById('editModalDescriptionValue');
const editModalProviderName = document.getElementById('editModalProviderName');
const editModalCodeInput = document.getElementById('editModalCodeInput');
const editModalPriceInput = document.getElementById('editModalPriceInput');
const editStatusActive = document.getElementById('editStatusActive');
const editStatusInactive = document.getElementById('editStatusInactive');
const saveChangesButton = document.getElementById('saveChangesButton');

function formatPrice(price) {
    const numericValue = price.toString().replace(/\D/g, '');
    return numericValue ? Number(numericValue).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '';
}

function showSpinner(type) {
    const spinnerMap = {
        'loading': [overlayLoading, spinnerLoading, loadingTextLoading],
        'register': [overlayRegister, spinnerRegister, loadingTextRegister],
        'delete': [overlayDelete, spinnerDelete, loadingTextDelete],
        'import': [overlayImport, spinnerImport, loadingTextImport]
    };
    spinnerMap[type].forEach(el => el.classList.remove('hidden'));
}

function hideSpinner(type) {
    const spinnerMap = {
        'loading': [overlayLoading, spinnerLoading, loadingTextLoading],
        'register': [overlayRegister, spinnerRegister, loadingTextRegister],
        'delete': [overlayDelete, spinnerDelete, loadingTextDelete],
        'import': [overlayImport, spinnerImport, loadingTextImport]
    };
    spinnerMap[type].forEach(el => el.classList.add('hidden'));
}

function showMessage(element, textElement, message) {
    textElement.textContent = message;
    element.classList.remove('hidden');
    setTimeout(() => element.classList.add('hidden'), 3000);
}

async function loadCompaniesIntoSelect() {
    try {
        const querySnapshot = await getDocs(collection(dbData, 'companies'));
        selectCompany.innerHTML = '<option value="">Selecciona una empresa</option>';
        const empresas = [];
        querySnapshot.forEach((doc) => {
            const empresaData = doc.data();
            empresas.push({ id: doc.id, nombre: empresaData.empresa || '' });
        });
        empresas.sort((a, b) => a.nombre.localeCompare(b.nombre));
        empresas.forEach((empresa) => {
            const option = document.createElement('option');
            option.value = empresa.id;
            option.textContent = empresa.nombre; // Corrección: "nomebre" a "nombre"
            selectCompany.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar empresas:', error);
        showMessage(messageError, errorText, "Error al cargar empresas: " + error.message);
    }
}

function addRowToTable(acciones, id, referencia, detalles, precioNeto, codigo, proveedor, descripcion, precio, clasificacion, estado, fechaCreacion, registradoPor, docId, tbody) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', docId);
    row.innerHTML = `
        <td>
            <i class="fas fa-trash-alt delete-icon" data-id="${docId}" style="color: #ff0000;"></i>
            <i class="fas fa-edit edit-icon" data-id="${docId}" style="margin-left: 10px; color: #007bff;"></i>
        </td>
        <td>${id || ''}</td>
        <td>${referencia || ''}</td>
        <td>${detalles || ''}</td>
        <td>${precioNeto || ''}</td>
        <td>${codigo || ''}</td>
        <td>${proveedor || ''}</td>
        <td>${descripcion || ''}</td>
        <td>${precio || ''}</td>
        <td>${clasificacion || ''}</td>
        <td>${estado || ''}</td>
        <td>${fechaCreacion || ''}</td>
        <td>${registradoPor || ''}</td>
    `;
    tbody.appendChild(row);

    const deleteIcon = row.querySelector('.delete-icon');
    const editIcon = row.querySelector('.edit-icon');
    if (deleteIcon) {
        deleteIcon.addEventListener('click', () => showDeleteConfirmation(docId, row));
    }
    if (editIcon) {
        editIcon.addEventListener('click', () => showEditModal(docId));
    }
}

async function getNextId() {
    const snapshot = await getDocs(collection(dbData, 'codigos'));
    const baseId = 250000; 
    const currentCount = snapshot.size; 
    const newId = baseId + currentCount;
    return String(newId); 
}

async function checkForDuplicate(referencia, codigo, excludeDocId = null) {
    const q = query(collection(dbData, 'codigos'), where('referencia', '==', referencia), where('codigo', '==', codigo));
    const querySnapshot = await getDocs(q);
    if (excludeDocId) {
        return querySnapshot.docs.some(doc => doc.id !== excludeDocId);
    }
    return !querySnapshot.empty;
}

function loadCodigosRealTime(filters = {}) {
    showSpinner('loading');
    onSnapshot(collection(dbData, 'codigos'), async (snapshot) => {
        codigosData = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            codigosData.push({ docId: doc.id, ...data });
        });

        codigosData.sort((a, b) => a.id - b.id);

        let filteredData = codigosData;
        if (Object.keys(filters).length > 0) {
            filteredData = codigosData.filter(codigo => {
                return (
                    (!filters[0] || (codigo.acciones || '').toLowerCase().includes(filters[0].toLowerCase())) &&
                    (!filters[1] || (codigo.id || '').toString().toLowerCase().includes(filters[1].toLowerCase())) &&
                    (!filters[2] || (codigo.referencia || '').toLowerCase().includes(filters[2].toLowerCase())) &&
                    (!filters[3] || (codigo.detalles || '').toLowerCase().includes(filters[3].toLowerCase())) &&
                    (!filters[4] || (codigo.precioNeto || '').toLowerCase().includes(filters[4].toLowerCase())) &&
                    (!filters[5] || (codigo.codigo || '').toLowerCase().includes(filters[5].toLowerCase())) &&
                    (!filters[6] || (codigo.proveedor || '').toLowerCase().includes(filters[6].toLowerCase())) &&
                    (!filters[7] || (codigo.descripcion || '').toLowerCase().includes(filters[7].toLowerCase())) &&
                    (!filters[8] || (codigo.precio || '').toLowerCase().includes(filters[8].toLowerCase())) &&
                    (!filters[9] || (codigo.clasificacion || '').toLowerCase().includes(filters[9].toLowerCase())) &&
                    (!filters[10] || (codigo.estado || '').toLowerCase().includes(filters[10].toLowerCase())) &&
                    (!filters[11] || (codigo.fechaCreacion || '').toLowerCase().includes(filters[11].toLowerCase())) &&
                    (!filters[12] || (codigo.registradoPor || '').toLowerCase().includes(filters[12].toLowerCase()))
                );
            });
        }

        const codigosTabData = filteredData;
        const pendientesTabData = filteredData.filter(c => 
            !c.codigo || c.codigo.trim() === '' || c.codigo === '0' || c.codigo.toLowerCase() === 'sin código'
        );

        totalPages = Math.ceil((currentTab === 'codigos' ? codigosTabData : pendientesTabData).length / itemsPerPage);
        pageNumber.textContent = `Página ${currentPage} de ${totalPages}`;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const pageData = (currentTab === 'codigos' ? codigosTabData : pendientesTabData).slice(startIndex, startIndex + itemsPerPage);

        tableBody.innerHTML = '';
        pendientesTableBody.innerHTML = '';
        pageData.forEach(codigo => {
            addRowToTable(
                codigo.acciones, codigo.id, codigo.referencia, codigo.detalles, codigo.precioNeto, 
                codigo.codigo, codigo.proveedor, codigo.descripcion, codigo.precio, codigo.clasificacion, 
                codigo.estado, codigo.fechaCreacion, codigo.registradoPor, codigo.docId, 
                currentTab === 'codigos' ? tableBody : pendientesTableBody
            );
        });

        hideSpinner('loading');
    }, (error) => {
        hideSpinner('loading');
        showMessage(messageError, errorText, "Error al cargar datos: " + error.message);
    });
}

async function showEditModal(docId) {
    const codigoDoc = await getDoc(doc(dbData, 'codigos', docId));
    if (!codigoDoc.exists()) {
        showMessage(messageError, errorText, "El código no existe.");
        return;
    }

    const data = codigoDoc.data();

    editModalTitle.textContent = `Editar Código (ID: ${data.id})`;
    editModalCodeValue.textContent = data.codigo || 'Sin código';
    editModalDescriptionValue.textContent = data.descripcion || 'Sin descripción';
    editModalProviderName.textContent = data.proveedor || 'Proveedor desconocido';

    editModalCodeInput.value = data.codigo || '';
    editModalPriceInput.value = data.precioNeto ? data.precioNeto.replace(/\./g, '') : ''; 
    if (data.estado === 'activo') {
        editStatusActive.checked = true;
    } else {
        editStatusInactive.checked = true;
    }

    editModalOverlay.style.display = 'block';
    editModal.style.display = 'block';

    closeEditModal.onclick = () => {
        editModalOverlay.style.display = 'none';
        editModal.style.display = 'none';
    };

    saveChangesButton.onclick = async () => {
        const newCode = editModalCodeInput.value.trim();
        const newPrice = formatPrice(editModalPriceInput.value.trim());
        const newStatus = editStatusActive.checked ? 'activo' : 'inactivo';

        if (newCode !== '' && newCode !== '0' && (newCode !== data.codigo || data.referencia !== inputReference.value)) {
            const isDuplicate = await checkForDuplicate(data.referencia, newCode, docId);
            if (isDuplicate) {
                showMessage(messageError, errorText, `Ya existe un registro con la referencia "${data.referencia}" y código "${newCode}".`);
                return;
            }
        }

        try {
            const docRef = doc(dbData, 'codigos', docId);
            await updateDoc(docRef, {
                codigo: newCode,
                precioNeto: newPrice || data.precioNeto,
                precio: newPrice || data.precio,
                estado: newStatus,
                timestamp: serverTimestamp()
            });
            editModalOverlay.style.display = 'none';
            editModal.style.display = 'none';
            showMessage(messageSuccess, successText, "Código actualizado con éxito.");
        } catch (error) {
            showMessage(messageError, errorText, "Error al actualizar: " + error.message);
        }
    };
}

btnSave.addEventListener('click', async (e) => {
    e.preventDefault();

    const referencia = inputReference.value.trim();
    const detalles = inputDetails.value.trim();
    const precioNeto = formatPrice(inputPriceNet.value.trim());
    const codigo = inputCode.value.trim();
    const empresaId = selectCompany.value;
    const descripcion = descriptionSpan.textContent;
    const precio = priceSpan.textContent;
    const clasificacion = selectClassification.value;
    const estado = statusActive.checked ? 'activo' : 'inactivo';
    const registradoPor = nombreCompleto || "Usuario Desconocido";
    const fechaCreacion = new Date().toLocaleDateString('es-CL');

    if (!referencia || !detalles || !precioNeto || !empresaId || !clasificacion) {
        showMessage(messageError, errorText, "Por favor, complete todos los campos requeridos.");
        return;
    }

    if (codigo !== '' && codigo !== '0') {
        const isDuplicate = await checkForDuplicate(referencia, codigo);
        if (isDuplicate) {
            showMessage(messageError, errorText, `Ya existe un registro con la referencia "${referencia}" y código "${codigo}".`);
            return;
        }
    }

    try {
        showSpinner('register');
        const id = await getNextId();
        const empresaDoc = await getDoc(doc(dbData, 'companies', empresaId));
        const proveedor = empresaDoc.exists() ? empresaDoc.data().empresa : 'Proveedor Desconocido';
        await addDoc(collection(dbData, 'codigos'), {
            id, referencia, detalles, precioNeto, codigo, proveedor, descripcion, precio, clasificacion, estado, registradoPor, fechaCreacion,
            timestamp: serverTimestamp()
        });
        hideSpinner('register');
        showMessage(messageSuccess, successText, `Código registrado con éxito.`);
        formRegisterContainer.reset();
        descriptionSpan.textContent = '';
        priceSpan.textContent = '';
    } catch (error) {
        hideSpinner('register');
        showMessage(messageError, errorText, "Error al registrar: " + error.message);
    }
});

btnReset.addEventListener('click', () => {
    formRegisterContainer.reset();
    descriptionSpan.textContent = '';
    priceSpan.textContent = '';
});

function showDeleteConfirmation(docId, row) {
    confirmationDeleteContainerNew.classList.remove('hidden');
    btnConfirmDeleteNew.onclick = () => deleteCodigo(docId, row);
    btnCancelDeleteNew.onclick = () => confirmationDeleteContainerNew.classList.add('hidden');
}

async function deleteCodigo(docId, row) {
    try {
        confirmationDeleteContainerNew.classList.add('hidden');
        showSpinner('delete');
        const docRef = doc(dbData, 'codigos', docId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error(`El documento con ID ${docId} no existe en Firestore`);
        }
        await deleteDoc(docRef);
        row.remove();
        hideSpinner('delete');
        showMessage(messageSuccess, successText, "Código eliminado con éxito.");
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
    loadCodigosRealTime(filters);
};

btnDownload.addEventListener('click', async () => {
    try {
        const snapshot = await getDocs(collection(dbData, 'codigos'));
        const data = [];
        snapshot.forEach(doc => {
            const codigo = doc.data();
            data.push({
                ID: codigo.id,
                Referencia: codigo.referencia,
                Detalles: codigo.detalles,
                "Precio Neto": codigo.precioNeto,
                Código: codigo.codigo,
                Proveedor: codigo.proveedor,
                Descripción: codigo.descripcion,
                Precio: codigo.precio,
                Clasificación: codigo.clasificacion,
                Estado: codigo.estado,
                "Fecha de Creación": codigo.fechaCreacion,
                "Registrado Por": codigo.registradoPor
            });
        });
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Códigos");
        XLSX.writeFile(wb, "codigos.xlsx");
    } catch (error) {
        showMessage(messageError, errorText, "Error al descargar: " + error.message);
    }
});

// Nueva función para importar Excel
btnImport.addEventListener('click', () => {
    fileInput.click();
});

// Nueva función para importar Excel con conversión de fechas
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showSpinner('import');
    try {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            for (const row of jsonData) {
                const referencia = row['Referencia']?.toString().trim() || '';
                const detalles = row['Detalles']?.toString().trim() || '';
                const precioNeto = formatPrice(row['Precio Neto']?.toString() || '');
                const codigo = row['Código']?.toString().trim() || '';
                const proveedor = row['Proveedor']?.toString().trim() || '';
                const descripcion = row['Descripción']?.toString().trim() || '';
                const precio = row['Precio']?.toString().trim() || precioNeto;
                const clasificacion = row['Clasificación']?.toString().trim() || '';
                const estado = row['Estado']?.toString().trim() || 'activo';
                const registradoPor = nombreCompleto || "Usuario Desconocido";

                // Convertir la fecha de Excel (número) a formato dd/mm/yyyy
                let fechaCreacion = row['Fecha de Creación'];
                if (typeof fechaCreacion === 'number') {
                    // Excel cuenta días desde el 1 de enero de 1900 (base 0), pero hay un ajuste por un bug en Excel
                    const excelEpoch = new Date(1900, 0, 1); // 1 de enero de 1900
                    const date = new Date(excelEpoch.getTime() + (fechaCreacion - 2) * 24 * 60 * 60 * 1000); // Ajuste por bug de Excel
                    fechaCreacion = date.toLocaleDateString('es-CL');
                } else {
                    fechaCreacion = fechaCreacion || new Date().toLocaleDateString('es-CL');
                }

                if (!referencia || !detalles || !precioNeto || !clasificacion) {
                    showMessage(messageWarning, warningText, `Fila omitida: faltan datos requeridos en referencia "${referencia}"`);
                    continue;
                }

                if (codigo && codigo !== '0') {
                    const isDuplicate = await checkForDuplicate(referencia, codigo);
                    if (isDuplicate) {
                        showMessage(messageWarning, warningText, `Referencia "${referencia}" con código "${codigo}" ya existe, omitiendo fila.`);
                        continue;
                    }
                }

                const id = await getNextId();
                await addDoc(collection(dbData, 'codigos'), {
                    id, referencia, detalles, precioNeto, codigo, proveedor, descripcion, precio, clasificacion, estado, registradoPor, fechaCreacion,
                    timestamp: serverTimestamp()
                });
            }

            hideSpinner('import');
            showMessage(messageSuccess, successText, "Datos importados con éxito.");
            fileInput.value = ''; // Resetear el input
        };
        reader.readAsArrayBuffer(file);
    } catch (error) {
        hideSpinner('import');
        showMessage(messageError, errorText, "Error al importar: " + error.message);
        fileInput.value = '';
    }
});

btnPrevious.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadCodigosRealTime();
    }
});

btnNext.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadCodigosRealTime();
    }
});

tabCodigos.addEventListener('click', () => {
    currentTab = 'codigos';
    codigosTable.style.display = 'block';
    pendientesTable.style.display = 'none';
    tabCodigos.classList.add('active');
    tabPendientes.classList.remove('active');
    currentPage = 1;
    loadCodigosRealTime();
});

tabPendientes.addEventListener('click', () => {
    currentTab = 'pendientes';
    codigosTable.style.display = 'none';
    pendientesTable.style.display = 'block';
    tabCodigos.classList.remove('active');
    tabPendientes.classList.add('active');
    currentPage = 1;
    loadCodigosRealTime();
});

btnClearFilters.addEventListener('click', () => {
    document.querySelectorAll('.filter-input').forEach(input => input.value = '');
    currentPage = 1;
    loadCodigosRealTime();
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

    function updateDescription() {
        const referencia = inputReference.value.trim();
        const detalles = inputDetails.value.trim();
        descriptionSpan.textContent = referencia && detalles ? `${referencia} ${detalles}` : (referencia || detalles || '');
    }

    function updatePrice() {
        priceSpan.textContent = formatPrice(inputPriceNet.value.trim());
    }

    inputReference.addEventListener('input', updateDescription);
    inputDetails.addEventListener('input', updateDescription);
    inputPriceNet.addEventListener('input', (e) => {
        e.target.value = formatPrice(e.target.value);
        updatePrice();
    });

    await loadCompaniesIntoSelect();
    loadCodigosRealTime();
});