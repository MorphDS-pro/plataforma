import { db } from './script01-firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const btnDownload = document.getElementById('btnDownload');

btnDownload.addEventListener('click', async () => {
    const internosRef = collection(db, "contacts");
    
    try {
        const snapshot = await getDocs(internosRef);
        const internosData = [];

        snapshot.forEach(doc => {
            const interno = doc.data();
            internosData.push({
                'ID': interno.id,
                'Nombre': interno.nombre,
                'Representante': interno.representante,
                'Correo': interno.correo,
                'Celular': interno.celular,
                'Anexo': interno.anexo,
                'Cargo': interno.cargo,
                'Observación': interno.observacion,
                'Fecha de Creación': interno.fechaCreacion,
                'Usuario Registrado': interno.registradoPor
            });
        });

        internosData.sort((a, b) => a.ID - b.ID);

        const ws = XLSX.utils.json_to_sheet(internosData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "contacts");

        XLSX.writeFile(wb, "bs_contactos_externos.xlsx");
        
    } catch (error) {
        console.error("Error al descargar los datos: ", error);
        alert("Ocurrió un error al generar el archivo Excel.");
    }
});
