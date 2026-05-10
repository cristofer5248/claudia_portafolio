// Emojis de animales para las cartas
const animalEmojis = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵',
    '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤',
    '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄'
];

class MemoryGame {
    constructor() {
        this.gridSize = 0;
        this.cards = [];
        this.flipped = [];
        this.matched = [];
        this.moves = 0;
        this.time = 0;
        this.gameStarted = false;
        this.gamePaused = false;
        this.timerInterval = null;
        this.totalPairs = 0;

        this.mode = 'emoji';
        this.uploadedFiles = [];
        this.processedCardFaces = [];
        this.backgroundImage = null;

        this.initEventListeners();
    }

    initEventListeners() {
        document.querySelectorAll('.mode-buttons .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setMode(e.target.dataset.mode);
            });
        });

        document.querySelectorAll('.difficulty-buttons .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.gridSize = parseInt(e.target.dataset.level);
                this.startGame();
            });
        });

        document.getElementById('cardsUpload').addEventListener('change', (e) => this.handleCardFiles(e.target.files));
        document.getElementById('backgroundUpload').addEventListener('change', (e) => this.handleBackgroundFile(e.target.files[0]));

        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.goToMenu());
        document.getElementById('menuBtn2').addEventListener('click', () => this.goToMenu());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.goToMenu());
    }

    setMode(mode) {
        this.mode = mode;
        document.getElementById('photoUploadPanel').classList.toggle('hidden', mode !== 'photo');
        document.querySelectorAll('.mode-buttons .btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
    }

    canStartPhotoGame() {
        return this.backgroundImage && this.processedCardFaces.length >= 1;
    }

    handleCardFiles(files) {
        this.uploadedFiles = Array.from(files);
        this.processedCardFaces = [];
        if (this.backgroundImage) {
            this.processAllUploadedFiles();
        } else {
            this.updateUploadInfo();
        }
    }

    handleBackgroundFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                this.backgroundImage = img;
                if (this.uploadedFiles.length > 0) {
                    this.processAllUploadedFiles();
                } else {
                    this.updateUploadInfo();
                }
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    }

    processAllUploadedFiles() {
        Promise.all(this.uploadedFiles.map(file => this.processImageFile(file)))
            .then(results => {
                this.processedCardFaces = results.filter(Boolean);
                this.updateUploadInfo();
            });
    }

    processImageFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const targetWidth = 360;
                    const targetHeight = 480;

                    const canvas = document.createElement('canvas');
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });

                    const imgRatio = img.width / img.height;
                    const targetRatio = targetWidth / targetHeight;
                    let drawW = targetWidth;
                    let drawH = targetHeight;
                    let drawX = 0;
                    let drawY = 0;

                    if (imgRatio > targetRatio) {
                        drawW = targetHeight * imgRatio;
                        drawX = (targetWidth - drawW) / 2;
                    } else {
                        drawH = targetWidth / imgRatio;
                        drawY = (targetHeight - drawH) / 2;
                    }

                    ctx.drawImage(img, drawX, drawY, drawW, drawH);
                    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const isGreen = g > 90 && g > r * 1.3 && g > b * 1.3;
                        if (isGreen) {
                            data[i + 3] = 0;
                        }
                    }

                    ctx.putImageData(imageData, 0, 0);

                    const finalCanvas = document.createElement('canvas');
                    finalCanvas.width = targetWidth;
                    finalCanvas.height = targetHeight;
                    const finalCtx = finalCanvas.getContext('2d');

                    if (this.backgroundImage) {
                        const bgRatio = this.backgroundImage.width / this.backgroundImage.height;
                        let bgW = targetWidth;
                        let bgH = targetHeight;
                        let bgX = 0;
                        let bgY = 0;

                        if (bgRatio > targetRatio) {
                            bgW = targetHeight * bgRatio;
                            bgX = (targetWidth - bgW) / 2;
                        } else {
                            bgH = targetWidth / bgRatio;
                            bgY = (targetHeight - bgH) / 2;
                        }
                        finalCtx.drawImage(this.backgroundImage, bgX, bgY, bgW, bgH);
                    } else {
                        finalCtx.fillStyle = '#ffffff';
                        finalCtx.fillRect(0, 0, targetWidth, targetHeight);
                    }

                    finalCtx.drawImage(canvas, 0, 0);
                    resolve(finalCanvas.toDataURL('image/jpeg', 0.9));
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
    }

    updateUploadInfo() {
        const info = document.getElementById('uploadedInfo');
        const count = this.processedCardFaces.length || this.uploadedFiles.length;
        const bgText = this.backgroundImage ? 'Fondo listo' : 'Sin fondo';
        info.textContent = `${count} imagen(es) seleccionadas · ${bgText}`;
    }

    startGame() {
        this.cards = [];
        this.flipped = [];
        this.matched = [];
        this.moves = 0;
        this.time = 0;
        this.gameStarted = false;
        this.gamePaused = true;
        this.totalPairs = Math.floor((this.gridSize * this.gridSize) / 2);

        if (this.mode === 'photo' && !this.canStartPhotoGame()) {
            alert('Sube al menos 1 foto y un fondo antes de comenzar.');
            return;
        }

        this.switchScreen('gameScreen');
        this.generateCards();
        this.renderBoard();
        this.showAllCards();
    }

    generateCards() {
        const totalCards = this.gridSize * this.gridSize;
        const pairsNeeded = Math.floor(totalCards / 2);
        const selected = [];

        if (this.mode === 'photo') {
            for (let i = 0; i < pairsNeeded; i++) {
                const face = this.processedCardFaces[i % this.processedCardFaces.length];
                selected.push(face, face);
            }
        } else {
            for (let i = 0; i < pairsNeeded; i++) {
                const randomEmoji = animalEmojis[Math.floor(Math.random() * animalEmojis.length)];
                selected.push(randomEmoji, randomEmoji);
            }
        }

        if (totalCards % 2 !== 0) {
            selected.push(null);
        }

        this.cards = selected.sort(() => Math.random() - 0.5);
    }

    renderBoard() {
        const board = document.getElementById('gameBoard');
        board.innerHTML = '';
        board.className = `game-board size-${this.gridSize}`;

        this.cards.forEach((face, index) => {
            const card = document.createElement('button');
            card.className = 'card';
            card.dataset.index = index;
            card.dataset.faceType = (face && face.startsWith('data:image')) ? 'photo' : 'emoji';
            card.textContent = '';

            card.addEventListener('click', () => this.flipCard(index));
            board.appendChild(card);
        });

        this.updateStats();
    }

    showFace(card, index) {
        const face = this.cards[index];
        card.innerHTML = '';
        card.classList.add('flipped');

        if (face === null) {
            card.textContent = '❓';
            return;
        }

        if (face.startsWith('data:image')) {
            const img = document.createElement('img');
            img.className = 'card-image';
            img.src = face;
            card.appendChild(img);
        } else {
            card.textContent = face;
        }
    }

    hideFace(card) {
        card.classList.remove('flipped');
        card.innerHTML = '';
    }

    showAllCards() {
        const cardElements = document.querySelectorAll('.card');
        cardElements.forEach(card => {
            const index = parseInt(card.dataset.index, 10);
            this.showFace(card, index);
        });

        setTimeout(() => {
            cardElements.forEach(card => this.hideFace(card));
            this.gamePaused = false;
            this.startTimer();
        }, 2000);
    }

    flipCard(index) {
        if (this.gamePaused) return;
        if (this.flipped.length >= 2) return;
        if (this.flipped.includes(index)) return;
        if (this.matched.includes(index)) return;

        const card = document.querySelector(`[data-index="${index}"]`);
        this.showFace(card, index);
        this.flipped.push(index);

        if (this.flipped.length === 2) {
            this.moves++;
            this.updateStats();
            this.checkMatch();
        }
    }

    checkMatch() {
        const [first, second] = this.flipped;
        const firstFace = this.cards[first];
        const secondFace = this.cards[second];

        const isMatch = firstFace === secondFace;

        if (isMatch) {
            setTimeout(() => {
                document.querySelector(`[data-index="${first}"]`).classList.add('matched');
                document.querySelector(`[data-index="${second}"]`).classList.add('matched');
                this.matched.push(first, second);
                this.flipped = [];
                this.updateStats();
                if (this.matched.length === this.cards.length) {
                    this.endGame();
                }
            }, 500);
        } else {
            this.gamePaused = true;
            setTimeout(() => {
                this.hideFace(document.querySelector(`[data-index="${first}"]`));
                this.hideFace(document.querySelector(`[data-index="${second}"]`));
                this.flipped = [];
                this.gamePaused = false;
            }, 1000);
        }
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.time++;
            document.getElementById('timer').textContent = this.time + 's';
        }, 1000);
    }

    updateStats() {
        const matchedPairs = this.matched.length / 2;
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('pairs').textContent = `${matchedPairs}/${this.totalPairs}`;
    }

    endGame() {
        clearInterval(this.timerInterval);
        this.gameStarted = false;
        document.getElementById('finalTime').textContent = this.time + 's';
        document.getElementById('finalMoves').textContent = this.moves;
        document.getElementById('finalLevel').textContent = `${this.gridSize}x${this.gridSize}`;
        setTimeout(() => {
            this.switchScreen('winScreen');
        }, 500);
    }

    resetGame() {
        clearInterval(this.timerInterval);
        this.startGame();
    }

    goToMenu() {
        clearInterval(this.timerInterval);
        this.switchScreen('difficultyScreen');
    }

    switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
