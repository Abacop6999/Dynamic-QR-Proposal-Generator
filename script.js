document.addEventListener('DOMContentLoaded', () => {
    // Referencias al DOM
    const creatorView = document.getElementById('creator-view');
    const receiverView = document.getElementById('receiver-view');
    const successView = document.getElementById('success-view');
    
    const creatorForm = document.getElementById('creator-form');
    const resultContainer = document.getElementById('result-container');
    const generatedLinkInput = document.getElementById('generated-link');
    const copyBtn = document.getElementById('copy-btn');
    const qrcodeContainer = document.getElementById('qrcode-container');
    
    const receiverQuestion = document.getElementById('receiver-question');
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    
    const successMessage = document.getElementById('success-message');
    const createOwnBtn = document.getElementById('create-own-btn');

    // Analizamos la URL
    const urlParams = new URLSearchParams(window.location.search);
    const p = urlParams.get('p');

    // Decisión de ruta inicial
    if (p) {
        initReceiverMode(p);
    } else {
        initCreatorMode();
    }

    // --- MODO CREADOR ---
    function initCreatorMode() {
        creatorView.classList.add('active');
        creatorView.classList.remove('hidden');
        
        creatorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const q = document.getElementById('question').value.trim();
            const s = document.getElementById('success-msg').value.trim();
            
            if (!q || !s) return;
            
            // Seguridad: Codificación UTF-8 segura para URL
            const data = { q, s };
            const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
            
            const currentUrl = window.location.href.split('?')[0].split('#')[0];
            const finalUrl = `${currentUrl}?p=${encoded}`;
            
            // Mostramos resultado
            generatedLinkInput.value = finalUrl;
            resultContainer.classList.remove('hidden');
            
            // Generación de QR (Librería CDN)
            qrcodeContainer.innerHTML = ''; // Limpiamos el anterior si existe
            new QRCode(qrcodeContainer, {
                text: finalUrl,
                width: 180,
                height: 180,
                colorDark : "#2d3436",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
        });
        
        // Botón copiar
        copyBtn.addEventListener('click', () => {
            generatedLinkInput.select();
            document.execCommand('copy');
            const originalIcon = copyBtn.innerHTML;
            // Ícono de check
            copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
            }, 2000);
        });
    }

    // --- MODO DESTINATARIO ---
    function initReceiverMode(encodedParam) {
        try {
            // Seguridad: Desencriptación
            const decodedStr = decodeURIComponent(escape(atob(encodedParam)));
            const data = JSON.parse(decodedStr);
            
            if (!data.q || !data.s) throw new Error("Datos inválidos");
            
            // Seguridad: Prevención XSS estricta (textContent en lugar de innerHTML)
            receiverQuestion.textContent = data.q;
            successMessage.textContent = data.s;
            
            // Cambiamos vista
            creatorView.classList.add('hidden');
            creatorView.classList.remove('active');
            receiverView.classList.remove('hidden');
            receiverView.classList.add('active');
            
            setupEvasiveButton();
            
            // Botón SÍ
            btnYes.addEventListener('click', () => {
                receiverView.classList.remove('active');
                setTimeout(() => {
                    receiverView.classList.add('hidden');
                    successView.classList.remove('hidden');
                    setTimeout(() => successView.classList.add('active'), 50);
                }, 400); // Transición suave
            });
            
        } catch (error) {
            console.error("Error al leer los datos de la URL:", error);
            // Si hay error (ej. modificaron el base64), regresa al home sin parámetros
            window.history.replaceState({}, document.title, window.location.pathname);
            initCreatorMode();
        }
    }
    
    // --- LÓGICA DEL BOTÓN "NO" ---
    function setupEvasiveButton() {
        const moveButton = (e) => {
            if (e) e.preventDefault(); // Bloqueamos comportamiento por defecto
            
            if (btnNo.style.position !== 'absolute') {
                btnNo.style.position = 'absolute';
            }
            
            const btnWidth = btnNo.offsetWidth || 120;
            const btnHeight = btnNo.offsetHeight || 60;
            
            // Limites del dispositivo para no generar scroll
            const maxX = window.innerWidth - btnWidth - 20;
            const maxY = window.innerHeight - btnHeight - 20;
            
            // Calculamos posición random segura
            const randomX = Math.max(10, Math.floor(Math.random() * maxX));
            const randomY = Math.max(10, Math.floor(Math.random() * maxY));
            
            btnNo.style.left = `${randomX}px`;
            btnNo.style.top = `${randomY}px`;
        };
        
        // Detecta hover en PC
        btnNo.addEventListener('mouseenter', moveButton);
        
        // Detecta toque en móviles (Mobile-First)
        btnNo.addEventListener('touchstart', moveButton, { passive: false });
        
        // Por si logran darle click de alguna forma (ej. lag)
        btnNo.addEventListener('click', (e) => {
            e.preventDefault();
            moveButton();
        });
    }
    
    // --- VISTA ÉXITO ---
    createOwnBtn.addEventListener('click', () => {
        // Redirige al inicio limpio
        window.location.href = window.location.pathname; 
    });
});
