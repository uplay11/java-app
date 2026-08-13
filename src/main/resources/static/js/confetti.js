(function () {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let running = false;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const colors = ['#ff5c8a', '#ffd166', '#06d6a0', '#4cc9f0', '#c81e5a'];

    function spawn(count) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: -20 - Math.random() * canvas.height * 0.3,
                size: 6 + Math.random() * 6,
                speedY: 2 + Math.random() * 3,
                speedX: (Math.random() - 0.5) * 2,
                rotation: Math.random() * 360,
                spin: (Math.random() - 0.5) * 10,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }

    function step() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.spin;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            ctx.restore();
        });
        particles = particles.filter(p => p.y < canvas.height + 30);

        if (particles.length > 0) {
            requestAnimationFrame(step);
        } else {
            running = false;
        }
    }

    window.launchConfetti = function (count = 150) {
        spawn(count);
        if (!running) {
            running = true;
            requestAnimationFrame(step);
        }
    };
})();
