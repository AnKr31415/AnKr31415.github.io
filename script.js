function checkPassword() {
    const input = document.getElementById('password-input').value;
    
    // "Bananenkuchen" verschlüsselt als Base64 ist: QmFuYW5lbmt1Y2hlbg==
    if (btoa(input) === "QmFuYW5lbmt1Y2hlbg==") { 
        document.getElementById('wiki-content').style.display = "block";
        document.getElementById('login-screen').style.display = "none";
        sessionStorage.setItem('loggedIn', 'true');
    } else {
        alert("Falsches Passwort!");
    }
}

// Prüft beim Laden der Seite (auch bei Unterseiten), ob man schon eingeloggt ist
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('loggedIn') === 'true') {
        const wikiContent = document.getElementById('wiki-content');
        const loginScreen = document.getElementById('login-screen');
        
        if (wikiContent && loginScreen) {
            wikiContent.style.display = "block";
            loginScreen.style.display = "none";
        }
    }

    // Deine bestehende Sidebar-Logik
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('mySidebar');
    const mainContent = document.getElementById('mainContent');

    if (toggleBtn && sidebar && mainContent) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            mainContent.classList.toggle('full-width');
        });
    }
});
