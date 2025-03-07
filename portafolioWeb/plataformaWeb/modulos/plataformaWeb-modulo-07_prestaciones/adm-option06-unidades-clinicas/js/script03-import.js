import { db } from './script01-firebase.js';
import { collection, addDoc, serverTimestamp, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const btnImport = document.getElementById('btnImport');
const importContainer = document.getElementById('importContainer');
const closeImportContainer = document.getElementById('close-import-container');
const fileInput = document.getElementById('fileInput');
const btnImportar = document.getElementById('btnImportar');
const btnCancelar = document.getElementById('btnCancelar');
const importUsuarioSpan = document.getElementById('importUsuario');
const overlayImport = document.getElementById('overlayImport');
const spinnerContainerImport = document.getElementById('spinnerContainerImport');
const spinnerImport = document.getElementById('spinnerImport');
const loadingTextImport = document.getElementById('loadingTextImport');
const messagesContainer = document.getElementById('messagesContainer');
const messageSuccess = document.getElementById('messageSuccess');
const successText = document.getElementById('successText');
const messageError = document.getElementById('messageError');
const errorText = document.getElementById('errorText');
const messageWarning = document.getElementById('messageWarning');
const warningText = document.getElementById('warningText');
const currentUser = importUsuarioSpan.textContent || "Usuario Desconocido";

async function getNextId() {
    const snapshot = await getDocs(collection(db, 'unidades'));
    const count = snapshot.size + 1;
    return count.toString().padStart(3, '0');
}

function showImportSpinner() {
    overlayImport.classList.remove('hidden');
    spinnerContainerImport.classList.remove('hidden');
    spinnerImport.classList.remove('hidden');
    loadingTextImport.classList.remove('hidden');
}

function hideImportSpinner() {
    overlayImport.classList.add('hidden');
    spinnerContainerImport.classList.add('hidden');
    spinnerImport.classList.add('hidden');
    loadingTextImport.classList.add('hidden');
}

function showMessage(container, textElement, message) {
    textElement.textContent = message;
    container.classList.remove('hidden');
    setTimeout(() => container.classList.add('hidden'), 5000);
}

btnImport.addEventListener('click', () => {
    importContainer.classList.remove('hidden');
});

closeImportContainer.addEventListener('click', () => {
    importContainer.classList.add('hidden');
});
btnCancelar.addEventListener('click', () => {
    importContainer.classList.add('hidden');
});

btnImportar.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        alert("Por favor, seleccione un archivo.");
        return;
    }
    
    const currentUser = document.getElementById('importUsuario').textContent.trim() || "Usuario Desconocido";

    try {
        showImportSpinner();

        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headers = jsonData[0];

        console.log("Encabezados detectados:", headers);

        const medicoIndex = headers.findIndex(header => String(header).toLowerCase() === 'unidades');
        if (medicoIndex === -1) {
            alert("La columna 'unidades' no se encontró en el archivo.");
            hideImportSpinner();
            return;
        }
        
        let importedCount = 0;
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            const doctorName = row[medicoIndex];
            if (!doctorName) continue; 
            
            const idIncremental = await getNextId();
            
            await addDoc(collection(db, 'unidades'), {
                id: idIncremental,
                nombre: doctorName,
                registradoPor: currentUser,
                fechaCreacion: new Date().toLocaleDateString('es-CL'),
                timestamp: serverTimestamp(),
                acciones: `<i class="fas fa-trash-alt delete-icon" data-id="${idIncremental}"></i>`
            });
            importedCount++;
        }
        
        hideImportSpinner();
        showMessage(messageSuccess, successText, `Se han importado ${importedCount} filas con nuevas unidades con éxito.`);
        importContainer.classList.add('hidden');
        fileInput.value = "";
    } catch (error) {
        console.error("Error al importar archivo:", error);
        hideImportSpinner();
        showMessage(messageError, errorText, "Error al importar archivo: " + error.message);
    }
});