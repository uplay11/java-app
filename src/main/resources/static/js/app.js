document.addEventListener('DOMContentLoaded', () => {
    // Celebrate button
    document.getElementById('celebrate-btn').addEventListener('click', () => {
        window.launchConfetti(180);
    });

    // Fire a little confetti on load too
    setTimeout(() => window.launchConfetti(80), 400);

    // Countdown to midnight
    const countdownEl = document.getElementById('countdown');
    function updateCountdown() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const diff = midnight - now;

        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        countdownEl.textContent =
            String(h).padStart(2, '0') + ':' +
            String(m).padStart(2, '0') + ':' +
            String(s).padStart(2, '0');
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Guestbook
    const wishList = document.getElementById('wish-list');
    const wishForm = document.getElementById('wish-form');

    function renderWish(wish) {
        const li = document.createElement('li');
        const name = wish.name || 'Anonymous';
        li.innerHTML = `<strong>${escapeHtml(name)}:</strong> ${escapeHtml(wish.message)}`;
        wishList.appendChild(li);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function loadWishes() {
        fetch('/api/wishes')
            .then(res => res.json())
            .then(wishes => {
                wishList.innerHTML = '';
                wishes.forEach(renderWish);
            })
            .catch(() => {
                wishList.innerHTML = '<li>Could not load wishes right now.</li>';
            });
    }

    wishForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('wish-name').value;
        const message = document.getElementById('wish-message').value;
        if (!message.trim()) return;

        fetch('/api/wishes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, message })
        })
            .then(res => {
                if (!res.ok) throw new Error('Request failed');
                return res.json();
            })
            .then(() => {
                document.getElementById('wish-message').value = '';
                loadWishes();
                window.launchConfetti(60);
            })
            .catch(() => alert('Could not send your wish. Please try again.'));
    });

    loadWishes();
});
