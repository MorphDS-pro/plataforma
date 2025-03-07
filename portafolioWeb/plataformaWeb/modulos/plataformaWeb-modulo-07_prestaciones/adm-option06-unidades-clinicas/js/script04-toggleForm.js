document.addEventListener("DOMContentLoaded", () => {
    const bttnNew = document.getElementById("bttnNew");
    const formNewContainer = document.getElementById("formNewContainer");
    const formRegisterContainer = document.getElementById("formRegisterContainer");
    const btnReset = document.getElementById("btnReset");

    bttnNew?.addEventListener("click", () => {
        formNewContainer.classList.add("hidden");
        formRegisterContainer.classList.remove("hidden");
    });

    btnReset?.addEventListener("click", () => {
        formRegisterContainer.classList.add("hidden");
        formNewContainer.classList.remove("hidden");
    });
});