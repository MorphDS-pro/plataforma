import { db } from './script01-firebase.js';
import { collection, addDoc, serverTimestamp, getDocs, onSnapshot, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const formRegister = document.getElementById('formRegisterContainer');
const registerCompany = document.getElementById('registerCompany');
const registerRepresentante = document.getElementById('registerRepresentante');
const registerCorreo = document.getElementById('registerCorreo');
const registerCelular = document.getElementById('registerCelular');
const registerAnexo = document.getElementById('registerAnexo');
const registerCargo = document.getElementById('registerCargo');
const registerObservacion = document.getElementById('registerObservacion');
const btnSave = document.getElementById('btnSave');
const tableBody = document.getElementById('table-body');
const overlayRegister = document.getElementById('overlayRegister');
const spinnerRegister = document.getElementById('spinnerRegister');
const loadingTextRegister = document.getElementById('loadingTextRegister');
const messageSuccess = document.getElementById('messageSuccess');
const successText = document.getElementById('successText');
const messageError = document.getElementById('messageError');
const errorText = document.getElementById('errorText');
const messageWarning = document.getElementById('messageWarning');
const warningText = document.getElementById('warningText');
const closeSuccess = document.getElementById('closeMessageSuccess');
const closeError = document.getElementById('closeMessageError');
const closeWarning = document.getElementById('closeMessageWarning');
const confirmationDeleteContainerNew = document.getElementById('confirmationDeleteContainerNew');
const btnConfirmDeleteNew = document.getElementById('btnConfirmDeleteNew');
const btnCancelDeleteNew = document.getElementById('btnCancelDeleteNew');
const overlayDelete = document.getElementById('overlayDelete');
const spinnerContainerDelete = document.getElementById('spinnerContainerDelete');
const spinnerDelete = document.getElementById('spinnerDelete');
const loadingTextDelete = document.getElementById('loadingTextDelete');
const formNewContainer = document.getElementById('formNewContainer');
const overlayLoading = document.getElementById('overlayLoading');
const spinnerLoading = document.getElementById('spinnerLoading');
const loadingTextLoading = document.getElementById('loadingTextLoading');

let currentPage = 1;
const itemsPerPage = 20;
let totalPages = 1;

async function getNextId() {
    const snapshot = await getDocs(collection(db, 'internos'));
    const count = snapshot.size + 1;
    return count.toString().padStart(3, '0');
}

function loadContactRealTime() {
    showLoadingSpinner();
    onSnapshot(collection(db, 'internos'), (snapshot) => {
        let docs = [];
        snapshot.forEach(doc => {
            docs.push({ id: doc.id, data: doc.data() });
        });

        docs.sort((a, b) => {
            return parseInt(a.data.id) - parseInt(b.data.id);
        });

        totalPages = Math.ceil(docs.length / itemsPerPage);

        document.getElementById('pageNumber').textContent = `Página ${currentPage} de ${totalPages}`;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const pageDocs = docs.slice(startIndex, startIndex + itemsPerPage);

        tableBody.innerHTML = '';
        pageDocs.forEach(docObj => {
            const contacts = docObj.data;
            addRowToTable(contacts.acciones, contacts.id, contacts.nombre, contacts.representante, contacts.correo, contacts.celular, contacts.anexo, contacts.cargo, contacts.observacion, contacts.registradoPor, contacts.fechaCreacion, docObj.id);
        });

        hideLoadingSpinner();
    });
}

function showLoadingSpinner() {
    overlayLoading.classList.remove('hidden');
    spinnerLoading.classList.remove('hidden');
    loadingTextLoading.classList.remove('hidden');
}

function hideLoadingSpinner() {
    overlayLoading.classList.add('hidden');
    spinnerLoading.classList.add('hidden');
    loadingTextLoading.classList.add('hidden');
}

function addRowToTable(acciones, id, nombre, representante, correo, celular, anexo, cargo, observacion, registradoPor, fechaCreacion, docId) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${acciones}</td>
        <td>${id}</td>
        <td>${nombre}</td>
        <td>${representante}</td>
        <td>${correo}</td>
        <td>${celular}</td>
        <td>${anexo}</td>
        <td>${cargo}</td>
        <td>${observacion}</td>
        <td>${fechaCreacion}</td>
        <td>${registradoPor}</td>
    `;
    tableBody.appendChild(row);

    const deleteIcon = row.querySelector('.delete-icon');
    deleteIcon.addEventListener('click', () => showDeleteConfirmation(docId, nombre, row));
}

btnSave.addEventListener('click', async (e) => {
    e.preventDefault();

    const companyName = registerCompany.options[registerCompany.selectedIndex].text.trim();

    const namerepresentante = registerRepresentante.value.trim();
    const namecorreo = registerCorreo.value.trim();
    const namecelular = registerCelular.value.trim();
    const nameanexo = registerAnexo.value.trim();
    const namecargo = registerCargo.value.trim();
    const nameobservacion = registerObservacion.value.trim();
    const usuario = document.getElementById('registerUsuario').textContent;
    const fecha = new Date();
    const fechaCreacion = fecha.toLocaleDateString('es-CL');

    try {
        showSpinner();

        const idIncremental = await getNextId();

        const dataToSend = {
            id: idIncremental,
            nombre: companyName,
            representante: namerepresentante,
            correo: namecorreo,
            celular: namecelular,
            anexo: nameanexo,
            cargo: namecargo,
            observacion: nameobservacion,
            registradoPor: usuario,
            fechaCreacion: fechaCreacion,
            timestamp: serverTimestamp(),
            acciones: `<i class="fas fa-trash-alt delete-icon" data-id="${idIncremental}"></i>`
        };

        console.log(dataToSend);

        await addDoc(collection(db, 'internos'), dataToSend);

        hideSpinner();
        showMessage(messageSuccess, successText, `El contacto ${namerepresentante} se ha registrado con éxito`);
        formRegister.reset();

        formRegister.classList.add('hidden');
        formNewContainer.classList.remove('hidden');
    } catch (error) {
        hideSpinner();
        showMessage(messageError, errorText, `Error: ${error.message}`);
    }
});


function showSpinner() {
    overlayRegister.classList.remove('hidden');
    spinnerRegister.classList.remove('hidden');
    loadingTextRegister.classList.remove('hidden');
}

function hideSpinner() {
    overlayRegister.classList.add('hidden');
    spinnerRegister.classList.add('hidden');
    loadingTextRegister.classList.add('hidden');
}

function showMessage(element, textElement, message) {
    textElement.textContent = message;
    element.classList.remove('hidden');
    setTimeout(() => element.classList.add('hidden'), 5000);
}

closeSuccess.addEventListener('click', () => messageSuccess.classList.add('hidden'));
closeError.addEventListener('click', () => messageError.classList.add('hidden'));
closeWarning.addEventListener('click', () => messageWarning.classList.add('hidden'));

function showDeleteConfirmation(docId, nombre, row) {
    confirmationDeleteContainerNew.classList.remove('hidden');
    btnConfirmDeleteNew.onclick = () => deleteContacts(docId, nombre, row);
    btnCancelDeleteNew.onclick = () => confirmationDeleteContainerNew.classList.add('hidden');
}

async function deleteContacts(docId, nombre, row) {
    try {
        confirmationDeleteContainerNew.classList.add('hidden');
        showDeleteSpinner();

        const docRef = doc(db, 'internos', docId);
        await deleteDoc(docRef);

        hideDeleteSpinner();
        showMessage(messageSuccess, successText, `El contacto ${nombre} se ha eliminado con éxito`);

        row.remove();
    } catch (error) {
        hideDeleteSpinner();
        showMessage(messageError, errorText, `Error: ${error.message}`);
    }
}


function showDeleteSpinner() {
    overlayDelete.classList.remove('hidden');
    spinnerContainerDelete.classList.remove('hidden');
    spinnerDelete.classList.remove('hidden');
    loadingTextDelete.classList.remove('hidden');
}

function hideDeleteSpinner() {
    overlayDelete.classList.add('hidden');
    spinnerContainerDelete.classList.add('hidden');
    spinnerDelete.classList.add('hidden');
    loadingTextDelete.classList.add('hidden');
}

loadContactRealTime();