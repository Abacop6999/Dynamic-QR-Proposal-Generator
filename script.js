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
            generatedLinkInput.value = 'Generando link corto...';
            resultContainer.classList.remove('hidden');
            qrcodeContainer.innerHTML = ''; // Limpiamos QR anterior
            
            // Función auxiliar para renderizar el QR
            const renderQR = (urlText) => {
                qrcodeContainer.innerHTML = '';
                new QRCode(qrcodeContainer, {
                    text: urlText,
                    width: 250,
                    height: 250,
                    colorDark : "#2d3436",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
            };

            // Petición a clck.ru (Acortador directo y sin publicidad intermedia)
            fetch(`https://clck.ru/--?url=${encodeURIComponent(finalUrl)}`)
                .then(res => {
                    if (!res.ok) throw new Error("Error en la respuesta de red");
                    return res.text(); // clck.ru devuelve el enlace en texto plano
                })
                .then(shorturl => {
                    if (shorturl && shorturl.startsWith("http")) {
                        generatedLinkInput.value = shorturl;
                        renderQR(shorturl);
                    } else {
                        throw new Error("Respuesta inválida al acortar");
                    }
                })
                .catch(err => {
                    console.warn("Fallo al acortar URL, usando original:", err);
                    // Fallback: si falla el acortador, mostramos el link largo original
                    generatedLinkInput.value = finalUrl;
                    renderQR(finalUrl);
                });
        });
        
        // Botón copiar
        copyBtn.addEventListener('click', () => {
            generatedLinkInput.select();
            document.execCommand('copy');
            const originalHtml = copyBtn.innerHTML;
            copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>¡Copiado!</span>';
            setTimeout(() => {
                copyBtn.innerHTML = originalHtml;
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
            
            // Pre-cargamos el audio para que esté listo al instante (Mejores prácticas)
            const successAudio = new Audio('audio/Ahora_soy_tan_feliz.mp3');
            successAudio.preload = 'auto';
            // Opcional: configurar volumen si es muy alto
            // successAudio.volume = 0.8;
            
            // Botón SÍ
            btnYes.addEventListener('click', () => {
                // Reproducimos el audio al hacer clic, capturando posibles errores 
                // del navegador (ej. políticas de autoplay bloqueado si la interacción no cuenta)
                successAudio.play().catch(err => {
                    console.warn('La reproducción de audio fue bloqueada o falló:', err);
                });
                
                receiverView.classList.remove('active');
                setTimeout(() => {
                    receiverView.classList.add('hidden');
                    successView.classList.remove('hidden');
                    setTimeout(() => {
                        successView.classList.add('active');
                        
                        // Lluvia de confeti romántico por 3 segundos
                        if (typeof confetti === 'function') {
                            var duration = 3000;
                            var end = Date.now() + duration;
                            (function frame() {
                                confetti({
                                    particleCount: 5,
                                    angle: 60,
                                    spread: 55,
                                    origin: { x: 0 },
                                    colors: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7']
                                });
                                confetti({
                                    particleCount: 5,
                                    angle: 120,
                                    spread: 55,
                                    origin: { x: 1 },
                                    colors: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7']
                                });
                                if (Date.now() < end) {
                                    requestAnimationFrame(frame);
                                }
                            }());
                        }
                    }, 50);
                }, 400); // Transición suave
            });
            
        } catch (error) {
            console.error("Error al leer los datos de la URL:", error);
            window.history.replaceState({}, document.title, window.location.pathname);
            initCreatorMode();
        }
    }
    
    // --- LÓGICA DEL BOTÓN "NO" ---
    function setupEvasiveButton() {
        const moveButton = (e) => {
            if (e) e.preventDefault(); // Bloqueamos comportamiento por defecto
            
            // Forzamos position: absolute relativo al viewport (debido a los ajustes CSS)
            btnNo.style.position = 'absolute'; 
            
            const btnWidth = btnNo.offsetWidth || 120;
            const btnHeight = btnNo.offsetHeight || 60;
            
            // Límites del dispositivo usando innerWidth e innerHeight, respetando los bordes
            const maxX = window.innerWidth - btnWidth - 20;
            const maxY = window.innerHeight - btnHeight - 20;
            
            // Calculamos posición random
            const randomX = Math.max(10, Math.floor(Math.random() * maxX));
            const randomY = Math.max(10, Math.floor(Math.random() * maxY));
            
            btnNo.style.left = `${randomX}px`;
            btnNo.style.top = `${randomY}px`;
        };
        
        // Detecta hover en PC
        btnNo.addEventListener('mouseover', moveButton);
        btnNo.addEventListener('mouseenter', moveButton);
        
        // Detecta toque en móviles (Mobile-First)
        btnNo.addEventListener('touchstart', moveButton, { passive: false });
        
        // Prevención adicional ante clicks forzados
        btnNo.addEventListener('click', (e) => {
            e.preventDefault();
            moveButton();
        });
    }
    
    // --- VISTA ÉXITO ---
    createOwnBtn.addEventListener('click', () => {
        window.location.href = window.location.pathname; 
    });
});
