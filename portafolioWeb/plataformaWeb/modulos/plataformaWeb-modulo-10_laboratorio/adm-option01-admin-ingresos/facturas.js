const facturaForm = document.getElementById('facturaForm');
const facturasTableBody = document.getElementById('facturasTableBody');
const overlay = document.getElementById('overlay');
let facturasData = [];

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getMonth(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { month: 'long' });
}

function getYear(dateString) {
    const date = new Date(dateString);
    return date.getFullYear();
}

function renderTable(data) {
    facturasTableBody.innerHTML = '';
    data.forEach((factura, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(factura.fechaIngreso)}</td>
            <td>${factura.factura}</td>
            <td>${formatDate(factura.fechaFactura)}</td>
            <td>${factura.montoFactura.toFixed(2)}</td>
            <td>${factura.oc}</td>
            <td>${formatDate(factura.fechaOc)}</td>
            <td>${factura.proveedor}</td>
            <td>${factura.acta}</td>
            <td>${formatDate(factura.fechaSalida)}</td>
            <td>${factura.salida}</td>
            <td>${getMonth(factura.fechaIngreso)}</td>
            <td>${getYear(factura.fechaIngreso)}</td>
            <td>${getMonth(factura.fechaSalida)}</td>
            <td>${getYear(factura.fechaSalida)}</td>
            <td>
                <button class="action-btn edit" onclick="editRow(${index})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" onclick="deleteRow(${index})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        facturasTableBody.appendChild(row);
    });
}

facturaForm.addEventListener('submit', (e) => {
    e.preventDefault();

    overlay.classList.remove('hidden');

    const facturaData = {
        fechaIngreso: document.getElementById('fechaIngreso').value,
        factura: document.getElementById('factura').value,
        fechaFactura: document.getElementById('fechaFactura').value,
        montoFactura: parseFloat(document.getElementById('montoFactura').value),
        oc: document.getElementById('oc').value,
        fechaOc: document.getElementById('fechaOc').value,
        proveedor: document.getElementById('proveedor').value,
        acta: document.getElementById('acta').value,
        fechaSalida: document.getElementById('fechaSalida').value,
        salida: document.getElementById('salida').value
    };

    try {
        if (facturaForm.dataset.editIndex) {
            // Editar fila existente
            const index = parseInt(facturaForm.dataset.editIndex);
            facturasData[index] = facturaData;
            delete facturaForm.dataset.editIndex;
            document.querySelector('.btn-submit').textContent = 'Agregar';
            document.getElementById('successText').textContent = `Factura ${facturaData.factura} actualizada con éxito`;
        } else {
            // Agregar nueva fila
            facturasData.push(facturaData);
            document.getElementById('successText').textContent = `Factura ${facturaData.factura} agregada con éxito`;
        }

        renderTable(facturasData);
        facturaForm.reset();
        showMessage('success');
    } catch (error) {
        console.error("Error al procesar:", error);
        document.getElementById('errorText').textContent = "Error al procesar la factura";
        showMessage('error');
    } finally {
        overlay.classList.add('hidden');
    }
});

function editRow(index) {
    const factura = facturasData[index];
    document.getElementById('fechaIngreso').value = factura.fechaIngreso;
    document.getElementById('factura').value = factura.factura;
    document.getElementById('fechaFactura').value = factura.fechaFactura;
    document.getElementById('montoFactura').value = factura.montoFactura;
    document.getElementById('oc').value = factura.oc;
    document.getElementById('fechaOc').value = factura.fechaOc;
    document.getElementById('proveedor').value = factura.proveedor;
    document.getElementById('acta').value = factura.acta;
    document.getElementById('fechaSalida').value = factura.fechaSalida;
    document.getElementById('salida').value = factura.salida;

    facturaForm.dataset.editIndex = index;
    document.querySelector('.btn-submit').textContent = 'Actualizar';
}

function deleteRow(index) {
    overlay.classList.remove('hidden');
    try {
        const factura = facturasData[index];
        facturasData.splice(index, 1);
        renderTable(facturasData);
        document.getElementById('successText').textContent = `Factura ${factura.factura} eliminada con éxito`;
        showMessage('success');
    } catch (error) {
        console.error("Error al eliminar:", error);
        document.getElementById('errorText').textContent = "Error al eliminar la factura";
        showMessage('error');
    } finally {
        overlay.classList.add('hidden');
    }
}

function showMessage(type) {
    const message = document.getElementById(`message${type.charAt(0).toUpperCase() + type.slice(1)}`);
    message.classList.remove('hidden');
    setTimeout(() => message.classList.add('hidden'), 3000);
}

document.getElementById('closeMessageSuccess').addEventListener('click', () => {
    document.getElementById('messageSuccess').classList.add('hidden');
});

document.getElementById('closeMessageError').addEventListener('click', () => {
    document.getElementById('messageError').classList.add('hidden');
});

// Resizer para columnas
document.querySelectorAll('.resizer').forEach(resizer => {
    resizer.addEventListener('mousedown', (e) => {
        const th = resizer.parentElement;
        const startX = e.pageX;
        const startWidth = th.offsetWidth;

        function onMouseMove(e) {
            const newWidth = startWidth + (e.pageX - startX);
            th.style.width = `${newWidth}px`;
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
});