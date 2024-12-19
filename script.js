const form = document.getElementById("numberForm");
const outputDiv = document.getElementById("output");

// Fonction pour effectuer une requête GET
async function fetchWhoAmI(index) {
    try {
        const response = await fetch("https://api.prod.jcloudify.com/whoami");
        if (response.status === 403) {
            return "Forbidden";
        } else {
            return `Forbidden : ${response.status}`;
        }
    } catch (error) {
        return `Erreur réseau : ${error.message}`;
    }
}

// Fonction  pour exécuter les requêtes séquentiellement
async function executeRequests(N) {
    for (let i = 1; i <= N; i++) {
        const result = await fetchWhoAmI(i);
        const line = document.createElement("p");
        line.textContent = `${i}. ${result}`;
        outputDiv.appendChild(line);

        // Pause d'une seconde entre chaque requête
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Fonction de gestion du captcha
function handleCaptcha(callback) {
    if (typeof window.AWSWAFIntegration !== "undefined") {
        console.log("Captcha déclenché");
        window.AWSWAFIntegration.executeCaptcha(() => {
            console.log("Captcha résolu");
            callback();
        });
    } else {
        console.error("AWS WAF Captcha non détecté.");
    }
}

// Gestionnaire d'événement pour le formulaire
form.addEventListener("submit", async (event) => {
    event.preventDefault(); 

    // Récupérer la valeur entrée par l'utilisateur
    const numberInput = document.getElementById("number").value;
    const N = parseInt(numberInput, 10);

    if (isNaN(N) || N < 1 || N > 1000) {
        alert("Veuillez entrer un nombre valide entre 1 et 1000.");
        return;
    }

    // Cacher le formulaire et afficher la zone de sortie
    form.style.display = "none";
    outputDiv.innerHTML = "";

    // Commencer la séquence des requêtes
    try {
        await executeRequests(N);
    } catch (error) {
        if (error.message.includes("captcha")) {
            // Gérer le captcha et reprendre après sa résolution
            handleCaptcha(() => {
                executeRequests(N);
            });
        } else {
            console.error("Erreur inattendue :", error);
        }
    }
});
