import { db } from './script01-firebase.js'; 
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const btnDownload = document.getElementById('btnDownload');

btnDownload.addEventListener('click', async () => {
    const doctorsRef = collection(db, "unidades");
    
    try {
        const snapshot = await getDocs(doctorsRef);
        const doctorsData = [];

        snapshot.forEach(doc => {
            const doctor = doc.data();
            doctorsData.push({
                'ID': doctor.id,
                'Nombre': doctor.nombre,
                'Fecha de Creación': doctor.fechaCreacion,
                'Usuario Digitado': doctor.usuarioDigitado
            });
        });

        doctorsData.sort((a, b) => a.ID - b.ID);

        const ws = XLSX.utils.json_to_sheet(doctorsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Unidades");

        XLSX.writeFile(wb, "bs_unidades.xlsx");
        
    } catch (error) {
        console.error("Error al descargar el archivo: ", error);
        alert("Ocurrió un error al generar el archivo Excel.");
    }
});