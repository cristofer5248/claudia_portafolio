document.addEventListener('DOMContentLoaded', (event) => {
    const noBtn = document.getElementById('noBtn');
    const yesBtn = document.getElementById('yesBtn');
    const loveImage = document.getElementById('loveImage');
    const loveText = document.getElementById('loveText');
    const mainContainer = document.getElementById('mainContainer');

    noBtn.addEventListener('mouseover', () => {
        const offset = 20; // distance to move the button
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        let newX = Math.random() * (screenWidth - noBtn.clientWidth);
        let newY = Math.random() * (screenHeight - noBtn.clientHeight);

        noBtn.style.position = 'absolute';
        noBtn.style.left = `${newX}px`;
        noBtn.style.top = `${newY}px`;
    });

    yesBtn.addEventListener('click', () => {
        mainContainer.innerHTML = ''; // Remove all child elements
        mainContainer.appendChild(loveImage); // Add the love image
        mainContainer.appendChild(loveText); // Add the love text
        loveImage.classList.remove('hidden');
        loveText.classList.remove('hidden');
    });
});
