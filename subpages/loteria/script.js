let imagesData = [];

/**
 * TEST DE INTEGRIDAD: detecta cuál imagen está dañada
 */
async function testImageIntegrity(base64, index, fileName) {
    return new Promise(resolve => {
        const img = new Image();
        img.src = base64;
        img.crossOrigin = "anonymous";

        img.onload = function () {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                ctx.getImageData(0, 0, 1, 1);
                console.log(`✓ Imagen #${index + 1} válida: ${fileName}`);
                resolve({ ok: true, fileName });
            } catch (err) {
                console.error(`✗ ERROR AL RENDERIZAR - Imagen #${index + 1}: ${fileName}`, err);
                resolve({ ok: false, index, fileName, error: err.message });
            }
        };

        img.onerror = function () {
            console.error(`✗ ERROR AL CARGAR - Imagen #${index + 1}: ${fileName}`);
            resolve({ ok: false, index, fileName, error: "No se pudo cargar la imagen" });
        };
    });
}

/**
 * Convierte todo a JPG seguro (html2canvas-friendly)
 */
function convertToJPG(base64) {
    return new Promise(resolve => {
        const img = new Image();
        img.src = base64;
        img.crossOrigin = "anonymous";

        img.onload = function () {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext("2d");
                // Fondo blanco para imágenes con transparencia
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                const cleaned = canvas.toDataURL("image/jpeg", 0.92);
                resolve(cleaned);
            } catch (err) {
                console.error("Error cargando imagen para convertir:", err);
                resolve(null);
            }
        };

        img.onerror = function () {
            console.error("Error cargando imagen para convertir.");
            resolve(null);
        };
    });
}

/**
 * Manejo de carga de imágenes
 */
document.getElementById("filesInput").addEventListener("change", async function () {
    const files = Array.from(this.files);
    const thumbs = document.getElementById("thumbs");
    thumbs.innerHTML = "";
    imagesData = [];

    if (files.length !== 20) {
        const status = document.getElementById("cardsStatus");
        status.textContent = `⚠ Debes seleccionar exactamente 20 imágenes. (Seleccionaste ${files.length})`;
        status.className = "error";
        return;
    }

    const status = document.getElementById("cardsStatus");
    status.textContent = "Cargando y validando imágenes...";
    status.className = "info";

    let validCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name;

        const reader = new FileReader();
        reader.onload = async function (e) {
            const cleaned = await convertToJPG(e.target.result);
            if (!cleaned) {
                errorCount++;
                updateStatus(validCount, errorCount);
                return;
            }

            const integrity = await testImageIntegrity(cleaned, i, fileName);

            imagesData[i] = { 
                src: cleaned, 
                title: "", 
                fileName: fileName,
                isValid: integrity.ok
            };

            const div = document.createElement("div");
            div.className = "thumb-item" + (integrity.ok ? "" : " error");

            const img = document.createElement("img");
            img.src = cleaned;

            const fileNameDiv = document.createElement("div");
            fileNameDiv.className = "image-name";
            fileNameDiv.textContent = fileName;

            const input = document.createElement("input");
            input.placeholder = "Título " + (i + 1);
            input.addEventListener("input", function () {
                imagesData[i].title = this.value;
            });

            div.appendChild(img);
            div.appendChild(fileNameDiv);
            div.appendChild(input);
            thumbs.appendChild(div);

            if (integrity.ok) {
                validCount++;
            } else {
                errorCount++;
            }

            updateStatus(validCount, errorCount);
        };

        reader.readAsDataURL(file);
    }
});

function updateStatus(validCount, errorCount) {
    const status = document.getElementById("cardsStatus");
    if (validCount + errorCount === 20) {
        if (errorCount === 0) {
            status.textContent = `✓ Las 20 imágenes están cargadas y válidas`;
            status.className = "success";
        } else {
            status.textContent = `✓ Imágenes: ${validCount} válidas, ${errorCount} con error. Las imágenes con error se marcarán en rojo.`;
            status.className = "error";
        }
    }
}

/**
 * Mezclador (Fisher-Yates)
 */
function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

/**
 * Generador de PDF - CORREGIDO
 */
async function renderGridToPDF(grid, cardNumber) {
    // Esperar a que todas las imágenes estén cargadas
    await Promise.all(Array.from(grid.querySelectorAll("img")).map(img => {
        return new Promise(resolve => {
            if (img.complete && img.naturalWidth > 0) {
                resolve();
            } else {
                img.onload = resolve;
                img.onerror = resolve;
            }
        });
    }));

    // Asegurar que el grid está visible en el DOM
    const pdfArea = document.getElementById("pdfCanvas");
    pdfArea.style.display = "block";
    
    // Esperar un poco más para que el navegador renderice
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        // Capturar con html2canvas
        const canvas = await html2canvas(grid, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            scale: 2,
            logging: false,
            windowWidth: 600,
            windowHeight: 600
        });

        const { jsPDF } = window.jspdf;
        
        // Validar dimensiones del canvas
        if (!canvas || canvas.width <= 0 || canvas.height <= 0) {
            console.error("Canvas dimensions:", canvas.width, "x", canvas.height);
            throw new Error("Canvas inválido: dimensiones no válidas");
        }

        // Crear PDF
        const pdf = new jsPDF("p", "mm", "letter");
        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        
        // Calcular dimensiones manteniendo proporción
        const maxWidth = 190;  // mm (dejando márgenes)
        const ratio = canvas.height / canvas.width;
        const pdfWidth = maxWidth;
        const pdfHeight = maxWidth * ratio;
        
        // Posicionar centrado
        const xPos = (210 - pdfWidth) / 2;
        const yPos = 10;
        
        // Asegurar que pdfHeight no sea negativo o NaN
        if (pdfHeight > 0 && pdfWidth > 0 && isFinite(pdfHeight)) {
            pdf.addImage(imgData, "JPEG", xPos, yPos, pdfWidth, pdfHeight);
        } else {
            throw new Error("Dimensiones calculadas inválidas: ancho=" + pdfWidth + ", alto=" + pdfHeight);
        }
        
        pdf.save("loteria_" + cardNumber + ".pdf");
        console.log(`✓ PDF generado: loteria_${cardNumber}.pdf`);

    } catch (err) {
        console.error("Error generando PDF:", err);
        alert("Error al generar PDF " + cardNumber + ":\n\n" + err.message);
    } finally {
        // Ocultar el grid después
        const pdfArea = document.getElementById("pdfCanvas");
        pdfArea.style.display = "none";
    }
}

/**
 * Botón para generar cartones PDF
 */
document.getElementById("generateBtn").addEventListener("click", async function () {
    const numCards = parseInt(document.getElementById("numCards").value, 10);
    const status = document.getElementById("cardsStatus");

    if (imagesData.length !== 20) {
        status.textContent = "Debes subir primero las 20 imágenes.";
        status.className = "error";
        return;
    }

    // Verificar que todas sean válidas
    const invalidImages = imagesData.filter(img => !img.isValid);
    if (invalidImages.length > 0) {
        status.textContent = `Hay ${invalidImages.length} imagen(es) con error. No se pueden generar PDFs.`;
        status.className = "error";
        alert("Las siguientes imágenes tienen problemas:\n" + 
              invalidImages.map((img, i) => `• ${img.fileName}`).join("\n"));
        return;
    }

    this.disabled = true;
    status.textContent = "Generando PDFs...";
    status.className = "info";

    let generatedCount = 0;

    for (let c = 1; c <= numCards; c++) {
        try {
            let indices = shuffle([...Array(20).keys()]);
            let selected = indices.slice(0, 9).map(i => imagesData[i]);

            selected = shuffle(selected);

            const pdfArea = document.getElementById("pdfCanvas");
            pdfArea.innerHTML = "";
            pdfArea.style.display = "block";
            pdfArea.style.position = "fixed";
            pdfArea.style.left = "-9999px";
            pdfArea.style.top = "-9999px";

            const grid = document.createElement("div");
            grid.style.width = "600px";
            grid.style.display = "grid";
            grid.style.gridTemplateColumns = "repeat(3, 1fr)";
            grid.style.gridGap = "10px";
            grid.style.padding = "20px";
            grid.style.background = "white";
            grid.style.boxSizing = "border-box";

            selected.forEach(item => {
                const cell = document.createElement("div");
                cell.style.border = "2px solid #333";
                cell.style.padding = "8px";
                cell.style.textAlign = "center";
                cell.style.display = "flex";
                cell.style.flexDirection = "column";
                cell.style.justifyContent = "center";
                cell.style.minHeight = "150px";

                const img = document.createElement("img");
                img.src = item.src;
                img.style.width = "100%";
                img.style.height = "140px";
                img.style.objectFit = "contain";

                const caption = document.createElement("div");
                caption.textContent = item.title || item.fileName;
                caption.style.marginTop = "6px";
                caption.style.fontSize = "12px";
                caption.style.fontWeight = "bold";

                cell.appendChild(img);
                cell.appendChild(caption);
                grid.appendChild(cell);
            });

            pdfArea.appendChild(grid);

            await renderGridToPDF(grid, c);
            generatedCount++;

            // Mostrar progreso
            status.textContent = `Generando PDFs... ${generatedCount}/${numCards}`;
            
        } catch (err) {
            console.error(`Error en cartón ${c}:`, err);
        }

        // Pequeña pausa para no saturar el navegador
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    status.textContent = `✓ Se generaron ${generatedCount} de ${numCards} PDFs correctamente.`;
    status.className = "success";
    this.disabled = false;
});

/**
 * JUEGO INTERACTIVO - Ver Cartas una a una
 */

let gameState = {
    allImages: [],
    currentIndex: 0,
    isPlaying: false
};

document.getElementById("playGameBtn").addEventListener("click", function () {
    // Validar que existan 20 imágenes
    const validImages = imagesData.filter(img => img && img.isValid);
    
    if (validImages.length !== 20) {
        alert("Debes cargar las 20 imágenes antes de jugar.");
        return;
    }

    // Mezclar las imágenes
    gameState.allImages = shuffle(validImages);
    gameState.currentIndex = 0;
    gameState.isPlaying = true;

    // Mostrar modal
    const modal = document.getElementById("gameModal");
    modal.classList.remove("hidden");

    // Actualizar contador total
    document.getElementById("gameTotalCards").textContent = "20";

    // Mostrar primera imagen
    showGameCard();
});

function showGameCard() {
    if (gameState.currentIndex >= gameState.allImages.length) {
        // Juego terminado
        finishGame();
        return;
    }

    const card = gameState.allImages[gameState.currentIndex];
    const imgElement = document.getElementById("gameImage");
    const nameElement = document.getElementById("gameImageName");
    const counterElement = document.getElementById("gameCardNumber");
    const nextBtn = document.getElementById("gameNextBtn");
    const finishMessage = document.getElementById("gameFinishMessage");

    // Ocultar mensaje de finalización
    finishMessage.classList.add("hidden");

    // Actualizar imagen y nombre
    imgElement.src = card.src;
    nameElement.textContent = card.title || card.fileName;
    counterElement.textContent = gameState.currentIndex + 1;

    // Re-trigger animación fade
    imgElement.style.animation = "none";
    setTimeout(() => {
        imgElement.style.animation = "fadeIn 0.8s ease-in-out";
    }, 10);

    nextBtn.disabled = false;
}

function finishGame() {
    const modal = document.getElementById("gameModal");
    const finishMessage = document.getElementById("gameFinishMessage");
    const imageWrapper = document.querySelector(".game-image-wrapper");
    const buttons = document.querySelector(".game-buttons");

    // Ocultar elementos de juego
    imageWrapper.style.display = "none";
    buttons.style.display = "none";

    // Mostrar mensaje de finalización
    finishMessage.classList.remove("hidden");

    // Reproducir sonido de victoria (opcional, en consola)
    console.log("🎉 ¡JUEGO COMPLETADO!");

    gameState.isPlaying = false;
}

document.getElementById("gameNextBtn").addEventListener("click", function () {
    if (!gameState.isPlaying) return;

    // Descartar imagen actual y pasar a la siguiente
    gameState.currentIndex++;
    showGameCard();
});

document.getElementById("gameCloseBtn").addEventListener("click", function () {
    const modal = document.getElementById("gameModal");
    modal.classList.add("hidden");

    // Restaurar vista del juego si se abre de nuevo
    document.querySelector(".game-image-wrapper").style.display = "flex";
    document.querySelector(".game-buttons").style.display = "flex";
    document.getElementById("gameFinishMessage").classList.add("hidden");

    gameState.isPlaying = false;
});
