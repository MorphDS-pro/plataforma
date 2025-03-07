import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Configuración de Firebase para cargar listas (medicos, previsiones, providers)
const firebaseConfigLists = {
  apiKey: "AIzaSyDfz0_7v43TmV0rlFM9UhnVVHLFGtRWhGw",
  authDomain: "prestaciones-57dcd.firebaseapp.com",
  projectId: "prestaciones-57dcd",
  storageBucket: "prestaciones-57dcd.firebasestorage.app",
  messagingSenderId: "409471759723",
  appId: "1:409471759723:web:faa6812772f44baa3ec82e",
  measurementId: "G-0CZ9BMJWMV"
};

// Configuración de Firebase para guardar pacientes
const firebaseConfigPatients = {
  apiKey: "AIzaSyAREVJYLuZXqKAEzroVMtqEHvj1l2vE_lQ",
  authDomain: "implantes-d2fbd.firebaseapp.com",
  projectId: "implantes-d2fbd",
  storageBucket: "implantes-d2fbd.firebasestorage.app",
  messagingSenderId: "1063212294537",
  appId: "1:1063212294537:web:9e0cc7290109da704f4158",
  measurementId: "G-3XGJW3EHLQ"
};

// Inicializar Firebase
const appLists = initializeApp(firebaseConfigLists, "listsApp");
const dbLists = getFirestore(appLists);
const appPatients = initializeApp(firebaseConfigPatients, "patientsApp");
const dbPatients = getFirestore(appPatients);

// Referencias a los elementos del formulario y tabla
const registerInsurance = document.getElementById("registerInsurance");
const insuranceOptions = document.getElementById("insuranceOptions");
const registerDoctor = document.getElementById("registerDoctor");
const doctorOptions = document.getElementById("doctorOptions");
const registerProvider = document.getElementById("registerProvider");
const providerOptions = document.getElementById("providerOptions");
const registerForm = document.getElementById("formRegisterContainer");
const tableBody = document.getElementById("table-body");

// Referencias al modal de edición
const editModalOverlay = document.getElementById("editModalOverlay");
const editModal = document.getElementById("editModal");
const closeEditModal = document.getElementById("closeEditModal");
const saveChangesButton = document.getElementById("saveChangesButton");
const editModalEntryDate = document.getElementById("editModalEntryDate");
const editModalInsurance = document.getElementById("editModalInsurance");
const editModalInsuranceOptions = document.getElementById("editModalInsuranceOptions");
const editModalAdmission = document.getElementById("editModalAdmission");
const editModalPatient = document.getElementById("editModalPatient");
const editModalDoctor = document.getElementById("editModalDoctor");
const editModalDoctorOptions = document.getElementById("editModalDoctorOptions");
const editModalSurgeryDate = document.getElementById("editModalSurgeryDate");
const editModalProvider = document.getElementById("editModalProvider");
const editModalProviderOptions = document.getElementById("editModalProviderOptions");
const editModalStatus = document.getElementById("editModalStatus");
const editModalChargeDate = document.getElementById("editModalChargeDate");
const editModalReport = document.getElementById("editModalReport");
const editModalTotalQuote = document.getElementById("editModalTotalQuote");
const editModalTotalPending = document.getElementById("editModalTotalPending");

// Referencias a los elementos de paginación
const btnPrevious = document.getElementById("btnPrevious");
const btnNext = document.getElementById("btnNext");
const pageNumber = document.getElementById("pageNumber");

// Nuevas referencias a los selectores de mes y año
const monthSelector = document.getElementById("monthSelector");
const yearSelector = document.getElementById("yearSelector");

// Variables de paginación
let currentPage = 1;
const recordsPerPage = 100;

// Variables para el filtro de mes y año
let selectedMonth = new Date().getMonth(); // Mes actual (0 = enero, 11 = diciembre)
let selectedYear = new Date().getFullYear(); // Año actual

// Listas globales
let previsionesList = [];
let medicosList = [];
let companiesList = [];
let patientsList = [];
let filteredPatientsList = [];

// Función para formatear fechas a dd-mm-yyyy
function formatDate(date) {
  if (!date) return "";
  if (typeof date === "object" && date.toDate) date = date.toDate();
  else if (typeof date === "string") date = new Date(date);
  if (!(date instanceof Date) || isNaN(date)) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Función para obtener el número de semana
function getWeekNumber(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return "";
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Función para mostrar el spinner
function showSpinner(type) {
  const overlay = document.getElementById(`overlay${type}`);
  overlay.classList.remove("hidden");
}

// Función para ocultar el spinner
function hideSpinner(type) {
  const overlay = document.getElementById(`overlay${type}`);
  overlay.classList.add("hidden");
}

// Función para mostrar mensajes
function showMessage(type, text) {
  const messageContainer = document.getElementById(`message${type.charAt(0).toUpperCase() + type.slice(1)}`);
  const textElement = document.getElementById(`${type}Text`);
  textElement.textContent = text;
  messageContainer.classList.remove("hidden");
  setTimeout(() => messageContainer.classList.add("hidden"), 5000);
}

// Función para mostrar opciones
function showOptions(input, ulElement, optionsList) {
  ulElement.innerHTML = "";
  optionsList.forEach((option) => {
    const li = document.createElement("li");
    li.textContent = option.name;
    li.dataset.id = option.id;
    li.addEventListener("click", () => {
      input.value = option.name;
      input.dataset.id = option.id;
      ulElement.style.display = "none";
    });
    ulElement.appendChild(li);
  });
  ulElement.style.display = "block";
}

// Función para filtrar opciones
function filterOptions(input, ulElement, optionsList) {
  const filter = input.value.toLowerCase();
  ulElement.innerHTML = "";
  const filteredOptions = optionsList.filter((option) => 
    option.name.toLowerCase().includes(filter)
  );
  filteredOptions.forEach((option) => {
    const li = document.createElement("li");
    li.textContent = option.name;
    li.dataset.id = option.id;
    li.addEventListener("click", () => {
      input.value = option.name;
      input.dataset.id = option.id;
      ulElement.style.display = "none";
    });
    ulElement.appendChild(li);
  });
  ulElement.style.display = filteredOptions.length > 0 ? "block" : "none";
}

// Cargar Previsiones
async function loadPrevisions() {
  try {
    showSpinner("Loading");
    const previsionesRef = collection(dbLists, "previsiones");
    const previsionesSnapshot = await getDocs(previsionesRef);
    
    previsionesList = [];
    previsionesSnapshot.forEach((doc) => {
      const data = doc.data();
      previsionesList.push({ id: doc.id, name: data.prevision || "Sin previsión" });
    });

    previsionesList.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error al cargar previsiones:", error);
    showMessage("error", "No se pudieron cargar las previsiones.");
  } finally {
    hideSpinner("Loading");
  }
}

// Cargar Médicos
async function loadDoctors() {
  try {
    showSpinner("Loading");
    const medicosRef = collection(dbLists, "medicos");
    const medicosSnapshot = await getDocs(medicosRef);
    
    medicosList = [];
    medicosSnapshot.forEach((doc) => {
      const data = doc.data();
      medicosList.push({ id: doc.id, name: data.medico || "Sin médico" });
    });

    medicosList.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error al cargar médicos:", error);
    showMessage("error", "No se pudieron cargar los médicos.");
  } finally {
    hideSpinner("Loading");
  }
}

// Cargar Proveedores
async function loadProviders() {
  try {
    showSpinner("Loading");
    const companiesRef = collection(dbLists, "companies");
    const companiesSnapshot = await getDocs(companiesRef);
    
    companiesList = [];
    companiesSnapshot.forEach((doc) => {
      const data = doc.data();
      companiesList.push({ id: doc.id, name: data.empresa || "Sin empresa" });
    });

    companiesList.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error al cargar proveedores:", error);
    showMessage("error", "No se pudieron cargar los proveedores.");
  } finally {
    hideSpinner("Loading");
  }
}

// Cargar pacientes existentes y filtrar por mes actual
async function loadPatients() {
  try {
    showSpinner("Loading");
    const patientsRef = collection(dbPatients, "pacientes");
    const patientsSnapshot = await getDocs(patientsRef);
    
    patientsList = [];
    patientsSnapshot.forEach((doc) => {
      const data = doc.data();
      patientsList.push({
        id: doc.id,
        entryDate: data.entryDate || "",
        attribute: data.attribute || "",
        insurance: data.insurance || "",
        insuranceName: data.insuranceName || "",
        admission: data.admission || "",
        patient: data.patient || "",
        doctor: data.doctor || "",
        doctorName: data.doctorName || "",
        surgeryDate: data.surgeryDate || "",
        provider: data.provider || "",
        providerName: data.providerName || "",
        status: data.status || "",
        chargeDate: data.chargeDate || "",
        report: data.report || "",
        totalQuote: data.totalQuote || "",
        totalPending: data.totalPending || "",
        creationDate: data.creationDate || "",
        user: data.user || ""
      });
    });
    filterPatientsByMonth();
  } catch (error) {
    console.error("Error al cargar pacientes:", error);
    showMessage("error", "No se pudieron cargar los pacientes.");
  } finally {
    hideSpinner("Loading");
  }
}

// Función para configurar eventos de los inputs
function setupInputEvents(input, ulElement, optionsList) {
  input.addEventListener("click", () => {
    showOptions(input, ulElement, optionsList);
  });

  input.addEventListener("input", () => {
    filterOptions(input, ulElement, optionsList);
  });

  input.addEventListener("blur", () => {
    setTimeout(() => ulElement.style.display = "none", 200);
  });
}

// Mostrar/ocultar filtro
window.toggleFilter = function(columnIndex) {
  const filterInput = document.getElementsByClassName("filter-input")[columnIndex];
  filterInput.classList.toggle("hidden");
  if (!filterInput.classList.contains("hidden")) {
    filterInput.focus();
  }
};

// Filtrar la tabla por columna
window.filterTable = function(columnIndex) {
  const filterValue = document.getElementsByClassName("filter-input")[columnIndex].value.trim().toLowerCase();
  filteredPatientsList = patientsList.filter((patient) => {
    const surgeryDate = patient.surgeryDate ? new Date(patient.surgeryDate) : null;
    const values = [
      "", // Acciones
      formatDate(patient.entryDate),
      patient.attribute || "",
      patient.insuranceName || "",
      patient.admission || "",
      patient.patient || "",
      patient.doctorName || "",
      formatDate(patient.surgeryDate),
      patient.providerName || "",
      patient.status || "",
      formatDate(patient.chargeDate),
      patient.report || "",
      patient.totalQuote || "",
      patient.totalPending || "",
      surgeryDate ? getWeekNumber(patient.surgeryDate).toString() : "",
      surgeryDate ? String(surgeryDate.getDate()).padStart(2, "0") : "",
      surgeryDate ? String(surgeryDate.getMonth() + 1).padStart(2, "0") : "",
      surgeryDate ? surgeryDate.getFullYear().toString() : "",
      (patient.admission + patient.providerName) || "",
      formatDate(patient.creationDate),
      patient.user || ""
    ];
    return values[columnIndex].toString().toLowerCase().includes(filterValue);
  });
  currentPage = 1; // Reiniciar a la primera página al filtrar
  renderTable();
};

// Función para llenar el selector de meses
function populateMonthSelector() {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  monthSelector.innerHTML = "";
  months.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = index; // Valor de 0 a 11
    option.textContent = month;
    if (index === selectedMonth) {
      option.selected = true;
    }
    monthSelector.appendChild(option);
  });
}

// Función para llenar el selector de años
function populateYearSelector() {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 5; // 5 años atrás
  const endYear = currentYear + 1; // 1 año adelante
  yearSelector.innerHTML = "";
  for (let year = startYear; year <= endYear; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    if (year === selectedYear) {
      option.selected = true;
    }
    yearSelector.appendChild(option);
  }
}

// Filtrar pacientes por mes y año
function filterPatientsByMonth() {
  filteredPatientsList = patientsList.filter((patient) => {
    if (!patient.surgeryDate) return false;
    const surgeryDate = new Date(patient.surgeryDate);
    return (
      surgeryDate.getMonth() === selectedMonth &&
      surgeryDate.getFullYear() === selectedYear
    );
  });
  currentPage = 1; // Reiniciar a la primera página al cambiar de mes o año
  renderTable();
}

// Renderizar la tabla con paginación
function renderTable() {
  tableBody.innerHTML = "";

  // Ordenar la lista filtrada
  filteredPatientsList.sort((a, b) => {
    const dateA = a.surgeryDate ? new Date(a.surgeryDate) : new Date(0);
    const dateB = b.surgeryDate ? new Date(b.surgeryDate) : new Date(0);
    if (dateA - dateB !== 0) return dateA - dateB;

    const patientA = a.patient || "";
    const patientB = b.patient || "";
    if (patientA !== patientB) return patientA.localeCompare(patientB);

    const providerA = a.providerName || "";
    const providerB = b.providerName || "";
    return providerA.localeCompare(providerB);
  });

  // Calcular el total de páginas
  const totalPages = Math.ceil(filteredPatientsList.length / recordsPerPage);

  // Calcular los índices de los registros a mostrar
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, filteredPatientsList.length);
  const paginatedPatients = filteredPatientsList.slice(startIndex, endIndex);

  // Renderizar filas de la página actual
  paginatedPatients.forEach((patient) => {
    const surgeryDate = patient.surgeryDate ? new Date(patient.surgeryDate) : null;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <i class="fas fa-eye" style="cursor:pointer; color:#3498db; margin-right:20px;" title="Editar" onclick="editRecord('${patient.id}')"></i>
        <i class="fas fa-trash delete-icon" style="cursor:pointer; color:#FF0000;" title="Eliminar" onclick="deleteRecord('${patient.id}')"></i>
      </td>
      <td>${formatDate(patient.entryDate)}</td>
      <td>${patient.attribute}</td>
      <td>${patient.insuranceName}</td>
      <td>${patient.admission}</td>
      <td>${patient.patient}</td>
      <td>${patient.doctorName}</td>
      <td>${formatDate(patient.surgeryDate)}</td>
      <td>${patient.providerName}</td>
      <td class="status-${patient.status.toLowerCase().replace(/ /g, "-")}">${patient.status}</td>
      <td>${formatDate(patient.chargeDate)}</td>
      <td>${patient.report}</td>
      <td>${patient.totalQuote}</td>
      <td>${patient.totalPending || ""}</td>
      <td>${surgeryDate ? getWeekNumber(patient.surgeryDate) : ""}</td>
      <td>${surgeryDate ? String(surgeryDate.getDate()).padStart(2, "0") : ""}</td>
      <td>${surgeryDate ? String(surgeryDate.getMonth() + 1).padStart(2, "0") : ""}</td>
      <td>${surgeryDate ? surgeryDate.getFullYear() : ""}</td>
      <td>${patient.admission + patient.providerName}</td>
      <td>${formatDate(patient.creationDate)}</td>
      <td>${patient.user}</td>
    `;
    tableBody.appendChild(row);
  });

  // Actualizar el texto de paginación
  pageNumber.textContent = `Página ${currentPage} de ${totalPages}`;

  // Habilitar/deshabilitar botones según la página actual
  btnPrevious.disabled = currentPage === 1;
  btnNext.disabled = currentPage === totalPages || totalPages === 0;
}

// Guardar paciente y actualizar tabla
async function savePatient(event) {
  event.preventDefault();

  const patientData = {
    entryDate: document.getElementById("registerEntryDate").value,
    attribute: document.getElementById("registerAttribute").value,
    insurance: registerInsurance.dataset.id || "",
    insuranceName: registerInsurance.value || "",
    admission: document.getElementById("registerAdmission").value,
    patient: document.getElementById("registerPatient").value,
    doctor: registerDoctor.dataset.id || "",
    doctorName: registerDoctor.value || "",
    surgeryDate: document.getElementById("registerSurgeryDate").value,
    provider: registerProvider.dataset.id || "",
    providerName: registerProvider.value || "",
    status: document.getElementById("registerStatus").value,
    chargeDate: document.getElementById("registerChargeDate").value,
    report: document.getElementById("registerReport").value,
    totalQuote: document.getElementById("registerTotalQuote").value,
    totalPending: "",
    creationDate: serverTimestamp(),
    user: document.getElementById("registerUsuario").textContent
  };

  try {
    showSpinner("Register");
    const docRef = await addDoc(collection(dbPatients, "pacientes"), patientData);
    patientData.id = docRef.id;
    patientData.creationDate = new Date();
    patientsList.push(patientData);
    filterPatientsByMonth(); // Volver a filtrar para incluir el nuevo registro si aplica
    showMessage("success", "Paciente agregado correctamente.");

    // Limpiar formulario
    registerForm.reset();
    registerInsurance.dataset.id = "";
    registerDoctor.dataset.id = "";
    registerProvider.dataset.id = "";
  } catch (error) {
    console.error("Error al guardar paciente:", error);
    showMessage("error", "No se pudo agregar el paciente.");
  } finally {
    hideSpinner("Register");
  }
}

// Evento de eliminación
window.deleteRecord = async function(id) {
  const confirmationContainer = document.getElementById("confirmationDeleteContainerNew");
  const btnConfirmDelete = document.getElementById("btnConfirmDeleteNew");
  const btnCancelDelete = document.getElementById("btnCancelDeleteNew");
  const closeConfirmation = document.getElementById("closeConfirmationDeleteNew");

  confirmationContainer.classList.remove("hidden");

  const confirmDeletion = new Promise((resolve) => {
    btnConfirmDelete.onclick = () => resolve(true);
    btnCancelDelete.onclick = () => resolve(false);
    closeConfirmation.onclick = () => resolve(false);
  });

  const confirmed = await confirmDeletion;
  confirmationContainer.classList.add("hidden");

  if (confirmed) {
    try {
      showSpinner("Delete");
      const patientRef = doc(dbPatients, "pacientes", id);
      await deleteDoc(patientRef);

      patientsList = patientsList.filter((patient) => patient.id !== id);
      filteredPatientsList = filteredPatientsList.filter((patient) => patient.id !== id);
      renderTable();

      showMessage("success", "Paciente eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar paciente:", error);
      showMessage("error", "No se pudo eliminar el paciente.");
    } finally {
      hideSpinner("Delete");
    }
  }
};

// Evento de edición
window.editRecord = function(id) {
  const patient = patientsList.find((p) => p.id === id);
  if (!patient) return;

  // Mostrar modal
  editModalOverlay.style.display = "block";
  editModal.style.display = "block";

  // Rellenar campos
  editModalEntryDate.value = patient.entryDate || "";
  editModalInsurance.value = patient.insuranceName || "";
  editModalInsurance.dataset.id = patient.insurance || "";
  editModalAdmission.value = patient.admission || "";
  editModalPatient.value = patient.patient || "";
  editModalDoctor.value = patient.doctorName || "";
  editModalDoctor.dataset.id = patient.doctor || "";
  editModalSurgeryDate.value = patient.surgeryDate || "";
  editModalProvider.value = patient.providerName || "";
  editModalProvider.dataset.id = patient.provider || "";
  editModalStatus.value = patient.status || "";
  editModalChargeDate.value = patient.chargeDate || "";
  editModalReport.value = patient.report || "";
  editModalTotalQuote.value = patient.totalQuote || "";
  editModalTotalPending.value = patient.totalPending || "";

  // Configurar eventos para los inputs personalizados
  setupInputEvents(editModalInsurance, editModalInsuranceOptions, previsionesList);
  setupInputEvents(editModalDoctor, editModalDoctorOptions, medicosList);
  setupInputEvents(editModalProvider, editModalProviderOptions, companiesList);

  // Guardar cambios
  saveChangesButton.onclick = async () => {
    const updatedData = {
      entryDate: editModalEntryDate.value,
      insurance: editModalInsurance.dataset.id || "",
      insuranceName: editModalInsurance.value || "",
      admission: editModalAdmission.value,
      patient: editModalPatient.value,
      doctor: editModalDoctor.dataset.id || "",
      doctorName: editModalDoctor.value || "",
      surgeryDate: editModalSurgeryDate.value,
      provider: editModalProvider.dataset.id || "",
      providerName: editModalProvider.value || "",
      status: editModalStatus.value,
      chargeDate: editModalChargeDate.value,
      report: editModalReport.value,
      totalQuote: editModalTotalQuote.value,
      totalPending: editModalTotalPending.value
    };

    try {
      showSpinner("Modify");
      const patientRef = doc(dbPatients, "pacientes", id);
      await updateDoc(patientRef, updatedData);

      // Actualizar listas locales
      const patientIndex = patientsList.findIndex((p) => p.id === id);
      const filteredIndex = filteredPatientsList.findIndex((p) => p.id === id);
      if (patientIndex !== -1) Object.assign(patientsList[patientIndex], updatedData);
      if (filteredIndex !== -1) Object.assign(filteredPatientsList[filteredIndex], updatedData);

      renderTable();
      showMessage("success", "Paciente actualizado correctamente.");

      editModalOverlay.style.display = "none";
      editModal.style.display = "none";
    } catch (error) {
      console.error("Error al actualizar paciente:", error);
      showMessage("error", "No se pudo actualizar el paciente.");
    } finally {
      hideSpinner("Modify");
    }
  };

  // Cerrar modal
  closeEditModal.onclick = () => {
    editModalOverlay.style.display = "none";
    editModal.style.display = "none";
  };

  editModalOverlay.onclick = (event) => {
    if (event.target === editModalOverlay) {
      editModalOverlay.style.display = "none";
      editModal.style.display = "none";
    }
  };
};

// Eventos de paginación
btnPrevious.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});

btnNext.addEventListener("click", () => {
  const totalPages = Math.ceil(filteredPatientsList.length / recordsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
  }
});

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    loadPrevisions(),
    loadDoctors(),
    loadProviders(),
    loadPatients()
  ]);

  setupInputEvents(registerInsurance, insuranceOptions, previsionesList);
  setupInputEvents(registerDoctor, doctorOptions, medicosList);
  setupInputEvents(registerProvider, providerOptions, companiesList);

  registerForm.addEventListener("submit", savePatient);

  // Llenar los selectores de mes y año y configurar eventos
  populateMonthSelector();
  populateYearSelector();

  monthSelector.addEventListener("change", (e) => {
    selectedMonth = Number(e.target.value);
    filterPatientsByMonth();
  });

  yearSelector.addEventListener("change", (e) => {
    selectedYear = Number(e.target.value);
    filterPatientsByMonth();
  });

  // Evento para importar Excel
// Evento para importar Excel
document.getElementById("importFile").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    showSpinner("Import");

    // Crear un elemento para el spinner con porcentaje
    const overlayImport = document.getElementById("overlayImport");
    const spinnerContainer = document.getElementById("spinnerContainerImport");
    const loadingTextImport = document.getElementById("loadingTextImport");
    
    // Modificar el spinner para mostrar porcentaje
    spinnerContainer.innerHTML = `
      <div class="lds-dual-ring-progress">
        <div class="progress-ring" id="progressRing"></div>
      </div>
      <div class="loading-text" id="loadingTextImportProgress">Cargando <span id="progressPercentage">0%</span></div>
    `;

    // Leer el archivo Excel usando SheetJS
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Los encabezados están en la primera fila
      const headers = jsonData[0].map(header => header ? header.toString().trim().toLowerCase() : "");
      const rows = jsonData.slice(1); // Saltar encabezados
      const totalRows = rows.length;
      let processedRows = 0;
      let successfulImports = 0;

      // Función para parsear y formatear fechas
      function parseDate(dateStr) {
        if (!dateStr) return "";

        // Intentar parsear como número (serial de Excel)
        if (!isNaN(dateStr)) {
          const excelDate = parseInt(dateStr, 10);
          const date = new Date((excelDate - 25569) * 86400 * 1000); // Convertir serial de Excel a Date
          if (!isNaN(date.getTime())) {
            return date.toISOString().split("T")[0]; // Formato YYYY-MM-DD para Firebase
          }
        }

        // Intentar parsear como texto (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
        let dateParts = null;
        if (dateStr.includes("/")) {
          dateParts = dateStr.split("/");
        } else if (dateStr.includes("-")) {
          dateParts = dateStr.split("-");
        }

        if (dateParts && dateParts.length === 3) {
          let day, month, year;
          // Suponer DD/MM/YYYY o MM/DD/YYYY (intentar ambos)
          if (dateParts[0].length <= 2 && dateParts[1].length <= 2) { // Probable DD/MM/YYYY
            day = parseInt(dateParts[0], 10);
            month = parseInt(dateParts[1], 10) - 1; // Meses en JavaScript son 0-11
            year = parseInt(dateParts[2], 10);
          } else if (dateParts[2].length === 4) { // Probable YYYY-MM-DD
            year = parseInt(dateParts[0], 10);
            month = parseInt(dateParts[1], 10) - 1;
            day = parseInt(dateParts[2], 10);
          }

          if (day && month !== undefined && year) {
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
              return date.toISOString().split("T")[0]; // Formato YYYY-MM-DD para Firebase
            }
          }
        }

        // Si no se puede parsear, loguear advertencia y devolver vacío
        console.warn("Fecha no válida:", dateStr);
        return "";
      }

      // Mapear columnas del Excel a los campos de patientData
      for (const row of rows) {
        if (!row.length) continue; // Saltar filas vacías

        const patientData = {
          entryDate: "",
          attribute: "",
          insurance: "",
          insuranceName: "",
          admission: "",
          patient: "",
          doctor: "",
          doctorName: "",
          surgeryDate: "",
          provider: "",
          providerName: "",
          status: "",
          chargeDate: "",
          report: "",
          totalQuote: "",
          totalPending: "",
          creationDate: serverTimestamp(),
          user: document.getElementById("registerUsuario").textContent || "Usuario desconocido"
        };

        // Mapear cada columna del Excel a los campos
        for (let i = 0; i < headers.length; i++) {
          if (i >= row.length) continue; // Evitar índices fuera de rango

          const value = row[i] !== undefined ? row[i].toString().trim() : "";
          switch (headers[i]) {
            case "fecha ingreso":
              patientData.entryDate = parseDate(value);
              break;
            case "atributo":
              patientData.attribute = value;
              break;
            case "prevision":
            case "previsión": // Añadir esta variante para manejar la tilde
              patientData.insuranceName = value || "Sin previsión"; // Asegurar que siempre haya un valor
              // Buscar el ID de la previsión en previsionesList (ignorar mayúsculas/minúsculas)
              const prevision = previsionesList.find(p => 
                p.name.toLowerCase() === value.toLowerCase()
              );
              patientData.insurance = prevision ? prevision.id : "";
              if (!prevision) {
                console.warn("Previsión no encontrada en la lista:", value);
              }
              break;
            case "admisión":
              patientData.admission = value;
              break;
            case "nombre paciente":
              patientData.patient = value;
              break;
            case "médico":
              patientData.doctorName = value || "Sin médico";
              const doctor = medicosList.find(d => 
                d.name.toLowerCase() === value.toLowerCase()
              );
              patientData.doctor = doctor ? doctor.id : "";
              if (!doctor) {
                console.warn("Médico no encontrado en la lista:", value);
              }
              break;
            case "fecha cirugía":
              patientData.surgeryDate = parseDate(value);
              break;
            case "proveedor":
              patientData.providerName = value || "Sin empresa";
              const provider = companiesList.find(c => 
                c.name.toLowerCase() === value.toLowerCase()
              );
              patientData.provider = provider ? provider.id : "";
              if (!provider) {
                console.warn("Proveedor no encontrado en la lista:", value);
              }
              break;
            case "estado":
              patientData.status = value;
              break;
            case "fecha cargo":
              patientData.chargeDate = parseDate(value);
              break;
            case "informe":
              patientData.report = value;
              break;
            case "total cotización":
              patientData.totalQuote = value ? parseFloat(value) || "" : "";
              break;
            case "total a actualizar pend.":
              patientData.totalPending = value ? parseFloat(value) || "" : "";
              break;
          }
        }

        // Validar que los campos obligatorios no estén vacíos
        if (!patientData.patient || !patientData.surgeryDate) {
          console.warn("Fila omitida: Nombre del paciente o Fecha de cirugía vacíos", patientData);
          processedRows++;
          updateProgress(processedRows, totalRows);
          continue;
        }

        try {
          // Guardar en Firebase
          const docRef = await addDoc(collection(dbPatients, "pacientes"), patientData);
          const patientId = docRef.id;

          // Agregar a patientsList con la fecha de creación simulada para la lista local
          const localPatientData = { ...patientData, id: patientId, creationDate: new Date() };
          patientsList.push(localPatientData);

          // Asegurarse de que se muestre en la tabla (sin filtrar inicialmente por mes/año)
          filteredPatientsList.push(localPatientData);

          successfulImports++;
          processedRows++;
          updateProgress(processedRows, totalRows);

        } catch (error) {
          console.error("Error al importar fila:", error);
          processedRows++;
          updateProgress(processedRows, totalRows);
        }
      }

      // Reaplicar el filtro por mes y año después de la importación
      filterPatientsByMonth();
      
      // Ordenar y renderizar la tabla
      filteredPatientsList.sort((a, b) => {
        const dateA = a.surgeryDate ? new Date(a.surgeryDate) : new Date(0);
        const dateB = b.surgeryDate ? new Date(b.surgeryDate) : new Date(0);
        return dateA - dateB || a.patient.localeCompare(b.patient) || a.providerName.localeCompare(b.providerName);
      });

      renderTable(); // Renderizar la tabla después de importar
      showMessage("success", `Importación completada. Se cargaron ${successfulImports} filas exitosamente de ${totalRows} filas totales.`);

    };
    reader.readAsBinaryString(file);

  } catch (error) {
    console.error("Error al importar pacientes:", error);
    showMessage("error", "No se pudieron importar los pacientes.");
  } finally {
    hideSpinner("Import");
    event.target.value = ""; // Limpiar el input para permitir nuevas cargas
  }
});

// Función para actualizar el progreso del spinner
function updateProgress(processed, total) {
  const percentage = Math.round((processed / total) * 100);
  const progressPercentage = document.getElementById("progressPercentage");
  const progressRing = document.getElementById("progressRing");

  if (progressPercentage && progressRing) {
    progressPercentage.textContent = `${percentage}%`;

    // Actualizar estilo del anillo de progreso
    progressRing.style.background = `conic-gradient(#3498db ${percentage}%, #eee ${percentage}%)`;
  }
}

// Función para actualizar el progreso del spinner
function updateProgress(processed, total) {
  const percentage = Math.round((processed / total) * 100);
  const progressPercentage = document.getElementById("progressPercentage");
  const progressRing = document.getElementById("progressRing");

  if (progressPercentage && progressRing) {
    progressPercentage.textContent = `${percentage}%`;

    // Actualizar estilo del anillo de progreso
    progressRing.style.background = `conic-gradient(#3498db ${percentage}%, #eee ${percentage}%)`;
  }
}
});

// Función para actualizar el progreso del spinner
function updateProgress(processed, total) {
  const percentage = Math.round((processed / total) * 100);
  const progressPercentage = document.getElementById("progressPercentage");
  const progressRing = document.getElementById("progressRing");

  if (progressPercentage && progressRing) {
    progressPercentage.textContent = `${percentage}%`;

    // Actualizar estilo del anillo de progreso
    progressRing.style.background = `conic-gradient(#3498db ${percentage}%, #eee ${percentage}%)`;
  }
}