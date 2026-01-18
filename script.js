// A. Mathematische Funktion zum Verschlüsseln (Hash erstellen)
async function hashPassword(string) {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// B. Die Login-Prüfung
async function checkPassword() {
    const inputField = document.getElementById('password-input');
    const input = inputField.value;
    
    // Erstellt den Fingerabdruck deiner Eingabe
    const hash = await hashPassword(input);

    // Der Fingerabdruck von "Bananenkuchen"
    const korrektesHash = "5cf0d09593c3ca6e5499859bf65191fef6694421f19ae0b8310a6549d00ec381";

    if (hash === korrektesHash) {
        document.getElementById('wiki-content').style.display = "block";
        document.getElementById('login-screen').style.display = "none";
        sessionStorage.setItem('loggedIn', 'true');
    } else {
        alert("Falsches Passwort!");
    }
}

function logout() {
    // Entfernt den "Eingeloggt"-Status aus dem Browser-Speicher
    sessionStorage.removeItem('loggedIn');
    // Lädt die Seite neu -> Login-Screen erscheint sofort wieder
    location.reload();
}

// C. Automatischer Check beim Laden & Sidebar-Logik
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Prüfen, ob man in dieser Sitzung schon eingeloggt war
    if (sessionStorage.getItem('loggedIn') === 'true') {
        const content = document.getElementById('wiki-content');
        const login = document.getElementById('login-screen');
        if (content && login) {
            content.style.display = "block";
            login.style.display = "none";
        }
    }

    // 2. Enter-Taste im Login-Feld aktivieren
    const passwordInput = document.getElementById('password-input');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkPassword();
        });
    }

    // 3. Deine Sidebar-Logik
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






