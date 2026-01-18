// Wartet, bis das Dokument geladen ist
function checkPassword() {
    const passwort = prompt("Passwort:");
    const korrektesPasswort = "Bananenkuchen"; // <-- Hier dein Passwort eintragen

    if (passwort === korrektesPasswort) {
        // Inhalt anzeigen, Login-Screen verstecken
        document.getElementById('wiki-content').style.display = "block";
        document.getElementById('login-screen').style.display = "none";
        
        // Speichert für die aktuelle Sitzung, dass man eingeloggt ist
        sessionStorage.setItem('loggedIn', 'true');
    } else {
        alert("Falsches Passwort!");
    }
}

// Prüft beim Laden, ob man in dieser Sitzung schon eingeloggt war
window.onload = function() {
    if (sessionStorage.getItem('loggedIn') === 'true') {
        document.getElementById('wiki-content').style.display = "block";
        document.getElementById('login-screen').style.display = "none";
    }
};

// ... Hier folgt dein restlicher Code für das Sidebar-Toggle ...

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('mySidebar');
    const mainContent = document.getElementById('mainContent');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            mainContent.classList.toggle('full-width');
        });
    }
});
