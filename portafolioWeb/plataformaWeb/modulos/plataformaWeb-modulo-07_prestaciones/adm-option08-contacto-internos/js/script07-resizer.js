document.addEventListener('DOMContentLoaded', function () {
    const resizers = document.querySelectorAll('.resizer');
    let isResizing = false;
    let lastX;

    resizers.forEach(resizer => {
        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            lastX = e.clientX;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', () => {
                isResizing = false;
                document.removeEventListener('mousemove', handleMouseMove);
            });
        });
    });

    function handleMouseMove(e) {
        if (!isResizing) return;
        const dx = e.clientX - lastX;
        const th = e.target.closest('th');
        const newWidth = th.offsetWidth + dx;
        th.style.width = `${newWidth}px`;
        lastX = e.clientX;
    }
});