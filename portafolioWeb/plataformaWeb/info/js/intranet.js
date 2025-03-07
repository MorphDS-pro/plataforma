// Obtener elementos del DOM
const openModal = document.getElementById('openModal');
const closeModal = document.getElementById('closeModal');
const modal = document.getElementById('modal');
const goToWebClinico = document.getElementById('goToWebClinico');

// Función para mostrar el modal
const showModal = () => {
    modal.style.display = 'flex'; // Mostrar el modal
    document.body.style.overflow = 'hidden'; // Deshabilitar el scroll
};

// Función para cerrar el modal
const hideModal = () => {
    modal.style.display = 'none'; // Ocultar el modal
    document.body.style.overflow = 'auto'; // Habilitar el scroll
};

// Mostrar el modal al hacer clic en el botón
openModal.addEventListener('click', showModal);

// Cerrar el modal al hacer clic en el botón de cerrar
closeModal.addEventListener('click', hideModal);

// Cerrar el modal al hacer clic fuera del contenido del modal
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        hideModal();
    }
});

// Cerrar el modal con la tecla Escape
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'flex') {
        hideModal();
    }
});

// Redirigir a index.html al hacer clic en el botón "Ingresar"
goToWebClinico.addEventListener('click', () => {
    window.location.href = '../index.html';
});