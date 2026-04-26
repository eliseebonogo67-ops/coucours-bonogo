// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V4 FINAL
// PARTIE 1/4 : FIREBASE + SPLASH + CONNEXION + RESET MDP
// ============================================

// === FIREBASE ===
var firebaseConfig = {
    apiKey: "AIzaSyDQWFqTKRmEZtuBhRHWMDrGtwboOwLleI4",
    databaseURL: "https://quiz-pro-max-default-rtdb.firebaseio.com"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.database();

// === SPLASH SCREEN 2.5s ===
window.addEventListener('load', function() {
    setTimeout(function() {
        var splash = document.getElementById('splash');
        if (splash) {
            splash.classList.add('hide');
            setTimeout(function() {
                splash.remove();
            }, 500);
        }
    }, 2500);
});

// === ELEMENTS ===
var pageAccueil = document.getElementById('page-accueil');
var pageMenu = document.getElementById('page-menu');
var pageAdminLogin = document.getElementById('page-admin-login');
var pageExam = document.getElementById('page-exam');
var pageAdmin = document.getElementById('page-admin');

var formConnexion = document.getElementById('formConnexion');
var formInscription = document.getElementById('formInscription');
var formReset = document.getElementById('formReset');
var btnShowInscription = document.getElementById('btnShowInscription');
var btnShowConnexion = document.getElementById('btnShowConnexion');
var btnShowReset = document.getElementById('btnShowReset');
var btnRetourConnexion = document.getElementById('btnRetourConnexion');

var nom = document.getElementById('nom');
var prenom = document.getElementById('prenom');
var email = document.getElementById('email');
var emailInscription = document.getElementById('emailInscription');
var emailReset = document.getElementById('emailReset');
var nouveauMdp = document.getElementById('nouveauMdp');
var mdp = document.getElementById('mdp');
var mdpInscription = document.getElementById('mdpInscription');
var btnLogin = document.getElementById('btnLogin');
var btnInscription = document.getElementById('btnInscription');
var btnReset = document.getElementById('btnReset');
var btnAdmin = document.getElementById('btnAdmin');
var erreur = document.getElementById('erreur');
var erreurInscription = document.getElementById('erreurInscription');
var erreurReset = document.getElementById('erreurReset');
var onlineCount = document.getElementById('onlineCount');

var nomMenu = document.getElementById('nomMenu');
var niv = document.getElementById('niv');
var xp = document.getElementById('xp');
var streak = document.getElementById('streak');
var btnExam = document.getElementById('btnExam');
var btnBadges = document.getElementById('btnBadges');
var btnClassement = document.getElementById('btnClassement');
var btnLogout = document.getElementById('btnLogout');

var adminPass = document.getElementById('adminPass');
var btnLoginAdmin = document.getElementById('btnLoginAdmin');
var btnRetour = document.getElementById('btnRetour');
var erreurAdmin = document.getElementById('erreurAdmin');

var nomConcours = document.getElementById('nomConcours');
var heureConcours = document.getElementById('heureConcours');
var timer = document.getElementById('timer');
var enLigne = document.getElementById('enLigne');
var restant = document.getElementById('restant');
var questions = document.getElementById('questions');
var btnNonRep = document.getElementById('btnNonRep');
var btnFinir = document.getElementById('btnFinir');

var salleAttente = document.getElementById('salle-attente');
var heureDebutAffich = document.getElementById('heureDebutAffich');
var timerDebut = document.getElementById('timerDebut');
var onlineAttente = document.getElementById('onlineAttente');

var attente = document.getElementById('attente');
var timerAttente = document.getElementById('timerAttente');
var resultat = document.getElementById('resultat');
var score = document.getElementById('score');
var xpGagne = document.getElementById('xpGagne');
var bonnes = document.getElementById('bonnes');
var partielles = document.getElementById('partielles');
var fausses = document.getElementById('fausses');
var btnCorrection = document.getElementById('btnCorrection');
var btnVoirClass = document.getElementById('btnVoirClass');
var btnRetourMenu = document.getElementById('btnRetourMenu');
var correction = document.getElementById('correction');

var status = document.getElementById('status');
var statCandidats = document.getElementById('statCandidats');
var statConcours = document.getElementById('statConcours');
var statMoy = document.getElementById('statMoy');
var statOnline = document.getElementById('statOnline');
var typeConcours = document.getElementById('typeConcours');
var hDebut = document.getElementById('hDebut');
var hFin = document.getElementById('hFin');
var btnSaveConfig = document.getElementById('btnSaveConfig');
var listeQuestions = document.getElementById('listeQuestions');
var btnAjouterQ = document.getElementById('btnAjouterQ');
var btnSaveSujet = document.getElementById('btnSaveSujet');
var listeCandidats = document.getElementById('listeCandidats');
var top10 = document.getElementById('top10');
var btnLogoutAdmin = document.getElementById('btnLogoutAdmin');

var collerJSON = document.getElementById('collerJSON');
var btnCharger50 = document.getElementById('btnCharger50');
var btnEnvoyer50 = document.getElementById('btnEnvoyer50');

var modal = document.getElementById('modal');
var modalTitre = document.getElementById('modalTitre');
var modalTexte = document.getElementById('modalTexte');
var btnAnnuler = document.getElementById('btnAnnuler');
var btnConfirmer = document.getElementById('btnConfirmer');
var toasts = document.getElementById('toasts');

// === VARIABLES ===
var user = null;
var userDisplay = '';
var questionsData = [];
var reponsesUser = {};
var finTimestamp = 0;
var timerInt = null;
var presenceRef = null;
var audioCtx = null;
var sujetActuel = [];
var alertesTimer = {30: false, 20: false, 10: false, 5: false};

// === UTILS ===
function showPage(p) {
    [pageAccueil, pageMenu, pageAdminLogin, pageExam, pageAdmin].forEach(el => {
        el.style.display = 'none';
    });
    p.style.display = 'block';
}

function toast(msg, type) {
    var t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.textContent = msg;
    toasts.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function son(type) {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var o = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.frequency.value = type === 'click' ? 800 : type === 'success' ? 1200 : 300;
        g.gain.value = 0.1;
        o.start();
        o.stop(audioCtx.currentTime + 0.1);
    } catch(e) {}
}

function hash(str) {
    return btoa(str);
}

function niveau(xp) {
    return Math.floor(xp / 100) + 1;
}

function calcXp(score, total) {
    return Math.floor((score / total) * 50);
}

function cleanEmail(e) {
    return e.toLowerCase().replace(/\./g, '_dot_').replace(/@/g, '_at_');
}

// === TOGGLE FORM ===
btnShowInscription.onclick = function() {
    son('click');
    formConnexion.style.display = 'none';
    formInscription.style.display = 'block';
    formReset.style.display = 'none';
    erreur.textContent = '';
};

btnShowConnexion.onclick = function() {
    son('click');
    formInscription.style.display = 'none';
    formConnexion.style.display = 'block';
    formReset.style.display = 'none';
    erreurInscription.textContent = '';
};

btnShowReset.onclick = function() {
    son('click');
    formConnexion.style.display = 'none';
    formInscription.style.display = 'none';
    formReset.style.display = 'block';
    erreur.textContent = '';
};

btnRetourConnexion.onclick = function() {
    son('click');
    formReset.style.display = 'none';
    formConnexion.style.display = 'block';
    erreurReset.textContent = '';
};

// === INSCRIPTION ===
btnInscription.onclick = async function() {
    son('click');
    var n = nom.value.trim();
    var p = prenom.value.trim();
    var e = emailInscription.value.trim().toLowerCase();
    var m = mdpInscription.value.trim();
    
    if (n.length < 2 || p.length < 2) {
        erreurInscription.textContent = 'Nom et Prénom 2 car mini';
        son('error');
        return;
    }
    if (!e.includes('@') || !e.includes('.')) {
        erreurInscription.textContent = 'Gmail invalide';
        son('error');
        return;
    }
    if (m.length < 4) {
        erreurInscription.textContent = 'MDP 4 car mini';
        son('error');
        return;
    }
    
    erreurInscription.textContent = 'Création...';
    var userKey = cleanEmail(e);
    var snap = await db.ref('users/' + userKey).once('value');
    
    if (snap.exists()) {
        erreurInscription.textContent = 'Ce Gmail a déjà un compte';
        son('error');
        return;
    }
    
    await db.ref('users/' + userKey).set({
        nom: n,
        prenom: p,
        email: e,
        mdp: hash(m),
        xp: 0,
        niveau: 1,
        streak: 0,
        dernierJour: Date.now(),
        badges: {},
        concoursFaits: 0,
        moyenne: 0
    });
    
    erreurInscription.textContent = '';
    toast('Compte créé! Connecte-toi', 'success');
    son('success');
    nom.value = '';
    prenom.value = '';
    emailInscription.value = '';
    mdpInscription.value = '';
    formInscription.style.display = 'none';
    formConnexion.style.display = 'block';
};

// === RESET MOT DE PASSE ===
btnReset.onclick = async function() {
    son('click');
    var e = emailReset.value.trim().toLowerCase();
    var m = nouveauMdp.value.trim();
    
    if (!e.includes('@') || !e.includes('.')) {
        erreurReset.textContent = 'Gmail invalide';
        son('error');
        return;
    }
    if (m.length < 4) {
        erreurReset.textContent = 'Nouveau MDP 4 car mini';
        son('error');
        return;
    }
    
    erreurReset.textContent = 'Vérification...';
    var userKey = cleanEmail(e);
    var snap = await db.ref('users/' + userKey).once('value');
    
    if (!snap.exists()) {
        erreurReset.textContent = 'Ce Gmail n\'existe pas';
        son('error');
        return;
    }
    
    await db.ref('users/' + userKey).update({
        mdp: hash(m)
    });
    
    erreurReset.textContent = '';
    toast('✅ Mot de passe changé! Connecte-toi', 'success');
    son('success');
    emailReset.value = '';
    nouveauMdp.value = '';
    formReset.style.display = 'none';
    formConnexion.style.display = 'block';
};

// === CONNEXION GMAIL ===
btnLogin.onclick = async function() {
    son('click');
    var e = email.value.trim().toLowerCase();
    var m = mdp.value.trim();
    
    if (!e.includes('@') || m.length < 4) {
        erreur.textContent = 'Gmail valide + MDP 4 car mini';
        son('error');
        return;
    }
    
    erreur.textContent = 'Connexion...';
    var userKey = cleanEmail(e);
    var snap = await db.ref('users/' + userKey).once('value');
    
    if (!snap.exists() || snap.val().mdp !== hash(m)) {
        erreur.textContent = 'Gmail ou MDP incorrect';
        son('error');
        return;
    }
    
    var d = snap.val();
    var now = Date.now();
    var dernier = new Date(d.dernierJour).setHours(0,0,0,0);
    var auj = new Date(now).setHours(0,0,0,0);
    var diff = (auj - dernier) / 86400000;
    if (diff === 1) {
        d.streak++;
    } else if (diff > 1) {
        d.streak = 1;
    }
    await db.ref('users/' + userKey).update({
        dernierJour: now,
        streak: d.streak
    });
    
    user = userKey;
    userDisplay = d.prenom + ' ' + d.nom;
    chargerMenu(d);
    erreur.textContent = '';
    son('success');
    startPresence();
};

function chargerMenu(d) {
    nomMenu.textContent = 'Salut ' + userDisplay + '!';
    niv.textContent = d.niveau;
    xp.textContent = d.xp;
    streak.textContent = d.streak;
    showPage(pageMenu);
}

// === DECONNEXION ===
btnLogout.onclick = function() {
    son('click');
    if (presenceRef) presenceRef.remove();
    if (timerInt) clearInterval(timerInt);
    user = null;
    userDisplay = '';
    email.value = '';
    mdp.value = '';
    showPage(pageAccueil);
};

// === PRESENCE ===
function startPresence() {
    if (presenceRef) presenceRef.remove();
    presenceRef = db.ref('online/' + user);
    presenceRef.set(true);
    presenceRef.onDisconnect().remove();
    db.ref('online').on('value', snap => {
        var count = snap.numChildren();
        enLigne.textContent = '🟢 ' + count;
        onlineCount.textContent = count;
        if (statOnline) statOnline.textContent = count;
        if (onlineAttente) onlineAttente.textContent = count;
    });
}

// === ADMIN LOGIN ===
btnAdmin.onclick = function() {
    son('click');
    showPage(pageAdminLogin);
};

btnRetour.onclick = function() {
    son('click');
    showPage(pageAccueil);
};

btnLoginAdmin.onclick = function() {
    son('click');
    if (adminPass.value === 'admin2025') {
        showPage(pageAdmin);
        loadAdmin();
        erreurAdmin.textContent = '';
        adminPass.value = '';
    } else {
        erreurAdmin.textContent = 'MDP incorrect';
        son('error');
    }
};

btnLogoutAdmin.onclick = function() {
    son('click');
    showPage(pageAccueil);
};

// === FIN PARTIE 1/4 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V4 FINAL
// PARTIE 2/4 : ADMIN PANEL + CONFIG + QUESTIONS
// ============================================

// === ADMIN PANEL ===
async function loadAdmin() {
    status.textContent = '🟢 Connecté Firebase';

    // Stats temps réel
    db.ref('users').on('value', snap => {
        statCandidats.textContent = snap.numChildren();
    });

    db.ref('resultats').on('value', snap => {
        statConcours.textContent = snap.numChildren();
        var total = 0, count = 0;
        snap.forEach(child => {
            total += child.val().score;
            count++;
        });
        statMoy.textContent = count > 0? (total / count).toFixed(1) : 0;
    });

    // Charger config
    db.ref('configConcours').on('value', snap => {
        var cfg = snap.val();
        if (cfg) {
            typeConcours.value = cfg.type || 'Concours Blanc Bonogo';
            hDebut.value = cfg.heureDebut || '08:00';
            hFin.value = cfg.heureFin || '09:30';
        }
    });

    // Charger sujet
    db.ref('sujetActuel').on('value', snap => {
        sujetActuel = snap.val() || [];
        afficherQuestionsAdmin();
    });

    // Liste candidats
    db.ref('users').on('value', snap => {
        var html = '';
        snap.forEach(child => {
            var u = child.val();
            var date = new Date(u.dernierJour).toLocaleDateString('fr-FR');
            var nomComplet = u.prenom + ' ' + u.nom;
            html += `<div class="eleve-item">
                <strong>${nomComplet}</strong><br>
                ${u.email}<br>
                Niveau ${u.niveau} · ${u.xp} XP · Moy: ${u.moyenne}/50<br>
                🔥 ${u.streak}j · ${u.concoursFaits} concours · Vu: ${date}
            </div>`;
        });
        listeCandidats.innerHTML = html || '<p style="text-align:center;color:var(--muted)">Aucun candidat</p>';
    });

    // Top 10
    db.ref('resultats').orderByChild('score').limitToLast(10).on('value', snap => {
        var results = [];
        snap.forEach(child => results.push(child.val()));
        results.reverse();
        var html = results.map((r, i) => {
            var med = i === 0? '🥇' : i === 1? '🥈' : i === 2? '🥉' : (i + 1);
            return `
                <div class="classement-item">
                    <span class="rang">${med}</span>
                    <span class="nom">${r.prenom} ${r.nom}</span>
                    <span class="score">${r.score}/50</span>
                </div>
            `;
        }).join('');
        top10.innerHTML = html || '<p style="text-align:center;color:var(--muted)">Aucun résultat</p>';
    });
}

// === SAUVER CONFIG ===
btnSaveConfig.onclick = async function() {
    son('click');
    var type = typeConcours.value;
    var debut = hDebut.value;
    var fin = hFin.value;

    if (!debut ||!fin) {
        toast('Remplis les heures', 'error');
        return;
    }

    var today = new Date();
    var dParts = debut.split(':');
    var fParts = fin.split(':');
    var dDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(dParts[0]), parseInt(dParts[1]));
    var fDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(fParts[0]), parseInt(fParts[1]));

    if (fDate <= dDate) {
        toast('Heure fin après début', 'error');
        return;
    }

    await db.ref('configConcours').set({
        type: type,
        heureDebut: debut,
        heureFin: fin,
        debutTimestamp: dDate.getTime(),
        finTimestamp: fDate.getTime()
    });

    toast('Config sauvegardée!', 'success');
};

// === CHARGER 50 QUESTIONS D'UN COUP ===
btnCharger50.onclick = function() {
    son('click');
    try {
        var questions = JSON.parse(collerJSON.value);
        if (!Array.isArray(questions)) {
            toast('Format invalide : il faut un tableau JSON', 'error');
            return;
        }
        if (questions.length!== 50) {
            toast(`Il faut exactement 50 questions. Tu as ${questions.length}`, 'warning');
            return;
        }

        sujetActuel = questions;
        afficherQuestionsAdmin();
        collerJSON.value = '';
        btnEnvoyer50.style.display = 'block';
        toast('✅ 50 questions chargées. Vérifie puis BALANCE', 'success');
    } catch(e) {
        toast('Erreur JSON : ' + e.message, 'error');
    }
};

btnEnvoyer50.onclick = async function() {
    son('click');
    if (!confirm('Envoyer les 50 questions aux élèves maintenant?')) return;

    await db.ref('sujetActuel').set(sujetActuel);
    btnEnvoyer50.style.display = 'none';
    toast('✅ 50 QUESTIONS ENVOYÉES AUX ÉLÈVES!', 'success');
};

// === GESTION QUESTIONS ADMIN ===
function afficherQuestionsAdmin() {
    listeQuestions.innerHTML = '';
    sujetActuel.forEach((q, idx) => {
        var div = document.createElement('div');
        div.className = 'question-edit';
        div.innerHTML = `
            <strong>Question ${idx + 1}</strong>
            <textarea placeholder="Énoncé de la question" data-idx="${idx}">${q.texte || ''}</textarea>
            <div class="reponse-edit">
                <input type="checkbox" ${q.reponses[0]?.correct? 'checked' : ''} data-q="${idx}" data-r="0">
                <input type="text" placeholder="Réponse A" value="${q.reponses[0]?.texte || ''}" data-q="${idx}" data-r="0">
            </div>
            <div class="reponse-edit">
                <input type="checkbox" ${q.reponses[1]?.correct? 'checked' : ''} data-q="${idx}" data-r="1">
                <input type="text" placeholder="Réponse B" value="${q.reponses[1]?.texte || ''}" data-q="${idx}" data-r="1">
            </div>
            <div class="reponse-edit">
                <input type="checkbox" ${q.reponses[2]?.correct? 'checked' : ''} data-q="${idx}" data-r="2">
                <input type="text" placeholder="Réponse C" value="${q.reponses[2]?.texte || ''}" data-q="${idx}" data-r="2">
            </div>
            <div class="reponse-edit">
                <input type="checkbox" ${q.reponses[3]?.correct? 'checked' : ''} data-q="${idx}" data-r="3">
                <input type="text" placeholder="Réponse D" value="${q.reponses[3]?.texte || ''}" data-q="${idx}" data-r="3">
            </div>
            <button class="btn-del" onclick="supprimerQuestion(${idx})">🗑️ Supprimer</button>
        `;
        listeQuestions.appendChild(div);
    });

    // Listeners
    document.querySelectorAll('.question-edit textarea').forEach(ta => {
        ta.oninput = function() {
            var idx = parseInt(this.dataset.idx);
            if (!sujetActuel[idx]) sujetActuel[idx] = { texte: '', reponses: [{},{},{},{}] };
            sujetActuel[idx].texte = this.value;
        };
    });

    document.querySelectorAll('.reponse-edit input[type="text"]').forEach(inp => {
        inp.oninput = function() {
            var q = parseInt(this.dataset.q);
            var r = parseInt(this.dataset.r);
            if (!sujetActuel[q]) sujetActuel[q] = { texte: '', reponses: [{},{},{},{}] };
            if (!sujetActuel[q].reponses[r]) sujetActuel[q].reponses[r] = {};
            sujetActuel[q].reponses[r].texte = this.value;
        };
    });

    document.querySelectorAll('.reponse-edit input[type="checkbox"]').forEach(cb => {
        cb.onchange = function() {
            var q = parseInt(this.dataset.q);
            var r = parseInt(this.dataset.r);
            if (!sujetActuel[q]) sujetActuel[q] = { texte: '', reponses: [{},{},{},{}] };
            if (!sujetActuel[q].reponses[r]) sujetActuel[q].reponses[r] = {};
            sujetActuel[q].reponses[r].correct = this.checked;
        };
    });
}

function supprimerQuestion(idx) {
    son('click');
    if (confirm('Supprimer cette question?')) {
        sujetActuel.splice(idx, 1);
        afficherQuestionsAdmin();
    }
}

btnAjouterQ.onclick = function() {
    son('click');
    if (sujetActuel.length >= 50) {
        toast('Maximum 50 questions', 'warning');
        return;
    }
    sujetActuel.push({
        texte: '',
        reponses: [
            { texte: '', correct: false },
            { texte: '', correct: false },
            { texte: '', correct: false },
            { texte: '', correct: false }
        ]
    });
    afficherQuestionsAdmin();
};

btnSaveSujet.onclick = async function() {
    son('click');
    var valide = true;
    sujetActuel.forEach((q, i) => {
        if (!q.texte || q.reponses.filter(r => r.texte).length < 2) valide = false;
        if (!q.reponses.some(r => r.correct)) valide = false;
    });

    if (!valide) {
        toast('Chaque question doit avoir un énoncé, 2+ réponses et 1+ correcte', 'error');
        return;
    }

    await db.ref('sujetActuel').set(sujetActuel);
    toast('Sujet sauvegardé! 50 questions prêtes', 'success');
};

// === FIN PARTIE 2/4 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V4 FINAL
// PARTIE 3/4 : LANCER CONCOURS + SALLE ATTENTE + TIMER + QUESTIONS
// ============================================

// === LANCER CONCOURS AVEC SALLE D'ATTENTE ===
btnExam.onclick = async function() {
    son('click');
    var configSnap = await db.ref('configConcours').once('value');
    var config = configSnap.val();

    if (!config) {
        toast('Aucun concours configuré', 'error');
        return;
    }

    var now = Date.now();

    // Vérifier si déjà fait
    var resSnap = await db.ref('resultats/' + user).once('value');
    if (resSnap.exists() && resSnap.val().timestamp >= config.debutTimestamp) {
        toast('Tu as déjà fait ce concours', 'warning');
        return;
    }

    var sujetSnap = await db.ref('sujetActuel').once('value');
    if (!sujetSnap.exists() || sujetSnap.val().length === 0) {
        toast('Aucun sujet disponible', 'error');
        return;
    }

    questionsData = sujetSnap.val();
    finTimestamp = config.finTimestamp;
    nomConcours.textContent = '📝 ' + config.type;
    heureConcours.textContent = 'Fin: ' + config.heureFin;

    // SI CONCOURS PAS ENCORE COMMENCÉ = SALLE D'ATTENTE
    if (now < config.debutTimestamp) {
        showPage(pageExam);
        salleAttente.style.display = 'block';
        questions.style.display = 'none';
        document.querySelector('.footer').style.display = 'none';
        heureDebutAffich.textContent = config.heureDebut;

        // Compte à rebours avant début
        var attenteInt = setInterval(function() {
            var reste = config.debutTimestamp - Date.now();
            if (reste <= 0) {
                clearInterval(attenteInt);
                salleAttente.style.display = 'none';
                questions.style.display = 'block';
                document.querySelector('.footer').style.display = 'flex';
                afficherQuestionsConcours();
                demarrerTimer();
                toast('🚀 Le concours commence!', 'success');
                return;
            }
            var h = Math.floor(reste / 3600000);
            var m = Math.floor((reste % 3600000) / 60000);
            var s = Math.floor((reste % 60000) / 1000);
            timerDebut.textContent =
                (h < 10? '0' : '') + h + ':' +
                (m < 10? '0' : '') + m + ':' +
                (s < 10? '0' : '') + s;
        }, 1000);

        return;
    }

    // SI CONCOURS DÉJÀ FINI
    if (now > config.finTimestamp) {
        toast('Le concours est terminé', 'error');
        return;
    }

    // SINON LANCER DIRECT
    salleAttente.style.display = 'none';
    questions.style.display = 'block';
    document.querySelector('.footer').style.display = 'flex';
    afficherQuestionsConcours();
    showPage(pageExam);
    demarrerTimer();
};

// === AFFICHER LES 50 QUESTIONS D'UN COUP ===
function afficherQuestionsConcours() {
    questions.innerHTML = '';
    reponsesUser = {};
    alertesTimer = {30: false, 20: false, 10: false, 5: false};

    questionsData.forEach((q, idx) => {
        var div = document.createElement('div');
        div.className = 'question-block';
        div.innerHTML = `
            <div class="question-numero">Question ${idx + 1}/${questionsData.length}</div>
            <div class="question-texte">${q.texte}</div>
            <div class="reponses-liste">
                ${q.reponses.map((r, ridx) => r.texte? `
                    <label>
                        <input type="checkbox" data-q="${idx}" data-r="${ridx}">
                        <span>${r.texte}</span>
                    </label>
                ` : '').join('')}
            </div>
        `;
        questions.appendChild(div);
    });

    document.querySelectorAll('.reponses-liste input').forEach(cb => {
        cb.onchange = function() {
            son('click');
            var q = parseInt(this.dataset.q);
            var r = parseInt(this.dataset.r);
            if (!reponsesUser[q]) reponsesUser[q] = [];
            if (this.checked) {
                if (!reponsesUser[q].includes(r)) reponsesUser[q].push(r);
            } else {
                reponsesUser[q] = reponsesUser[q].filter(x => x!== r);
            }
            var count = Object.keys(reponsesUser).filter(k => reponsesUser[k].length > 0).length;
            restant.textContent = count + '/' + questionsData.length;
        };
    });
}

// === TIMER CORRIGÉ - AFFICHE LE TEMPS DIRECT ===
function demarrerTimer() {
    if (timerInt) clearInterval(timerInt);
    alertesTimer = {30: false, 20: false, 10: false, 5: false};

    // Afficher direct le temps au lancement
    var now = Date.now();
    var reste = finTimestamp - now;
    var min = Math.floor(reste / 60000);
    var sec = Math.floor((reste % 60000) / 1000);
    timer.textContent = min + ':' + (sec < 10? '0' : '') + sec;

    timerInt = setInterval(function() {
        var now = Date.now();
        var reste = finTimestamp - now;

        if (reste <= 0) {
            clearInterval(timerInt);
            timer.textContent = '00:00';
            terminerConcours();
            return;
        }

        var min = Math.floor(reste / 60000);
        var sec = Math.floor((reste % 60000) / 1000);
        timer.textContent = min + ':' + (sec < 10? '0' : '') + sec;

        // ALERTES
        if (min === 30 && sec === 0 &&!alertesTimer[30]) {
            alertesTimer[30] = true;
            toast('⚠️ Il vous reste 30 minutes', 'warning');
            son('click');
        }
        if (min === 20 && sec === 0 &&!alertesTimer[20]) {
            alertesTimer[20] = true;
            toast('⚠️ Il vous reste 20 minutes', 'warning');
            son('click');
        }
        if (min === 10 && sec === 0 &&!alertesTimer[10]) {
            alertesTimer[10] = true;
            toast('🔥 Il vous reste 10 minutes', 'error');
            son('error');
            timer.classList.add('warning');
        }

        // PIN PIN PIN aux 5 dernières secondes
        if (reste <= 5000 && reste > 0 &&!alertesTimer[5]) {
            alertesTimer[5] = true;
            son('error');
            timer.classList.add('warning');
        }

        if (min < 5) {
            timer.classList.add('warning');
        }
    }, 1000);
}

// === BOUTON NON REPONDU ===
btnNonRep.onclick = function() {
    son('click');
    var nonRep = [];
    for (var i = 0; i < questionsData.length; i++) {
        if (!reponsesUser[i] || reponsesUser[i].length === 0) {
            nonRep.push(i + 1);
        }
    }

    if (nonRep.length === 0) {
        toast('✅ Toutes les questions sont répondues', 'success');
    } else {
        toast(`📋 Questions non répondues: ${nonRep.join(', ')}`, 'warning');
        var firstNonRep = document.querySelectorAll('.question-block')[nonRep[0] - 1];
        if (firstNonRep) firstNonRep.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

// === TERMINER CONCOURS ===
btnFinir.onclick = function() {
    son('click');
    var count = Object.keys(reponsesUser).filter(k => reponsesUser[k].length > 0).length;
    var msg = `Tu as répondu à ${count}/${questionsData.length} questions.`;
    if (count < questionsData.length) {
        msg += '\n\nVeux-tu vraiment terminer?';
    } else {
        msg += '\n\nConfirmer l\'envoi?';
    }

    modalTitre.textContent = 'Terminer le concours';
    modalTexte.textContent = msg;
    modal.style.display = 'flex';

    btnConfirmer.onclick = function() {
        modal.style.display = 'none';
        terminerConcours();
    };

    btnAnnuler.onclick = function() {
        modal.style.display = 'none';
    };
};

function terminerConcours() {
    if (timerInt) clearInterval(timerInt);
    corriger();
}

// === FIN PARTIE 3/4 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V4 FINAL
// PARTIE 4/4 : CORRECTION + RESULTAT + BADGES + CLASSEMENT
// ============================================

// === CORRECTION AUTO ===
async function corriger() {
    son('success');
    var scoreTotal = 0;
    var bonnesRep = 0;
    var partiellesRep = 0;
    var faussesRep = 0;

    questionsData.forEach((q, idx) => {
        var repUser = reponsesUser[idx] || [];
        var repCorrect = [];
        q.reponses.forEach((r, ridx) => {
            if (r.correct) repCorrect.push(ridx);
        });

        if (repUser.length === 0) {
            faussesRep++;
        } else {
            var nbCorrect = repUser.filter(r => repCorrect.includes(r)).length;
            var nbFaux = repUser.filter(r =>!repCorrect.includes(r)).length;

            if (nbFaux === 0 && nbCorrect === repCorrect.length) {
                scoreTotal++;
                bonnesRep++;
            } else if (nbCorrect > 0 && nbFaux === 0) {
                scoreTotal += 0.5;
                partiellesRep++;
            } else {
                faussesRep++;
            }
        }
    });

    var xpGagné = calcXp(scoreTotal, questionsData.length);

    // Sauver résultat
    var snapUser = await db.ref('users/' + user).once('value');
    var dataUser = snapUser.val();

    var newXp = dataUser.xp + xpGagné;
    var newNiveau = niveau(newXp);
    var newConcoursFaits = dataUser.concoursFaits + 1;
    var newMoyenne = ((dataUser.moyenne * dataUser.concoursFaits) + scoreTotal) / newConcoursFaits;

    // Vérifier badges
    var badges = dataUser.badges || {};
    if (newConcoursFaits === 1) badges.premier = true;
    if (dataUser.streak >= 7) badges.streak7 = true;
    if (newNiveau >= 10) badges.niveau10 = true;
    if (scoreTotal === questionsData.length) badges.perfect = true;
    var tempsEcoule = finTimestamp - Date.now();
    if (tempsEcoule > 60 * 60 * 1000) badges.rapide = true;

    await db.ref('users/' + user).update({
        xp: newXp,
        niveau: newNiveau,
        concoursFaits: newConcoursFaits,
        moyenne: newMoyenne.toFixed(1),
        badges: badges
    });

    await db.ref('resultats/' + user).set({
        pseudo: user,
        prenom: dataUser.prenom,
        nom: dataUser.nom,
        score: scoreTotal,
        xp: xpGagné,
        bonnes: bonnesRep,
        partielles: partiellesRep,
        fausses: faussesRep,
        timestamp: Date.now()
    });

    // Afficher résultat
    score.textContent = scoreTotal + '/' + questionsData.length;
    xpGagne.textContent = xpGagné;
    bonnes.textContent = bonnesRep;
    partielles.textContent = partiellesRep;
    fausses.textContent = faussesRep;

    attente.style.display = 'none';
    resultat.style.display = 'block';
    questions.style.display = 'none';
    document.querySelector('.footer').style.display = 'none';
}

// === BOUTON CORRECTION ===
btnCorrection.onclick = function() {
    son('click');
    correction.innerHTML = '';

    questionsData.forEach((q, idx) => {
        var repUser = reponsesUser[idx] || [];
        var repCorrect = [];
        q.reponses.forEach((r, ridx) => {
            if (r.correct) repCorrect.push(ridx);
        });

        var nbCorrect = repUser.filter(r => repCorrect.includes(r)).length;
        var nbFaux = repUser.filter(r =>!repCorrect.includes(r)).length;
        var isCorrect = nbFaux === 0 && nbCorrect === repCorrect.length;
        var isPartiel = nbCorrect > 0 && nbFaux === 0 && nbCorrect < repCorrect.length;

        var div = document.createElement('div');
        div.className = 'question-correction ' + (isCorrect? 'correct' : isPartiel? 'partiel' : 'incorrect');

        var repUserText = repUser.map(r => q.reponses[r].texte).join(', ') || 'Aucune réponse';
        var repCorrectText = repCorrect.map(r => q.reponses[r].texte).join(', ');

        div.innerHTML = `
            <strong>Question ${idx + 1}:</strong> ${q.texte}<br>
            <strong>Ta réponse:</strong> ${repUserText}<br>
            <strong>Bonne réponse:</strong> ${repCorrectText}
        `;
        correction.appendChild(div);
    });

    correction.scrollIntoView({ behavior: 'smooth' });
};

// === VOIR CLASSEMENT ===
btnVoirClass.onclick = function() {
    son('click');
    showPage(pageMenu);
    btnClassement.click();
};

// === RETOUR MENU ===
btnRetourMenu.onclick = function() {
    son('click');
    attente.style.display = 'none';
    resultat.style.display = 'none';
    questions.style.display = 'block';
    document.querySelector('.footer').style.display = 'flex';
    showPage(pageMenu);
};

// === CLASSEMENT ===
btnClassement.onclick = async function() {
    son('click');
    showPage(pageMenu);

    var snap = await db.ref('resultats').orderByChild('score').limitToLast(50).once('value');
    var results = [];
    snap.forEach(child => results.push(child.val()));
    results.reverse();

    var html = '<div class="card"><h2>🏆 Classement Général</h2>';
    html += results.map((r, i) => {
        var med = i === 0? '🥇' : i === 1? '🥈' : i === 2? '🥉' : (i + 1);
        var isMe = r.pseudo === user? 'style="background:var(--yellow);color:var(--bg);font-weight:800;"' : '';
        return `
            <div class="classement-item" ${isMe}>
                <span class="rang">${med}</span>
                <span class="nom">${r.prenom} ${r.nom}</span>
                <span class="score">${r.score}/50</span>
            </div>
        `;
    }).join('');
    html += '<button class="btn-blue" onclick="this.parentElement.parentElement.remove()">Retour</button></div>';

    var div = document.createElement('div');
    div.innerHTML = html;
    div.style.position = 'fixed';
    div.style.top = '0';
    div.style.left = '0';
    div.style.right = '0';
    div.style.bottom = '0';
    div.style.background = 'var(--bg)';
    div.style.zIndex = '999';
    div.style.overflow = 'auto';
    div.style.padding = '15px';
    document.body.appendChild(div);
};

// === BADGES ===
btnBadges.onclick = async function() {
    son('click');
    var snap = await db.ref('users/' + user + '/badges').once('value');
    var badges = snap.val() || {};

    var html = '<div class="card"><h2>🏆 Mes Badges</h2>';
    var badgeList = {
        premier: { emoji: '🎯', nom: 'Premier Concours', desc: 'Faire ton premier concours' },
        streak7: { emoji: '🔥', nom: 'Série 7 jours', desc: 'Se connecter 7 jours d\'affilée' },
        niveau10: { emoji: '⭐', nom: 'Niveau 10', desc: 'Atteindre le niveau 10' },
        perfect: { emoji: '💯', nom: 'Sans Faute', desc: 'Obtenir 50/50' },
        rapide: { emoji: '⚡', nom: 'Éclair', desc: 'Finir avec +1h restante' }
    };

    for (var key in badgeList) {
        var b = badgeList[key];
        var hasBadge = badges[key];
        html += `
            <div class="badge-item" style="opacity:${hasBadge? 1 : 0.3};display:flex;align-items:center;gap:12px;padding:12px;margin:8px 0;background:var(--card);border-radius:12px;">
                <span class="badge-emoji" style="font-size:32px;">${b.emoji}</span>
                <div>
                    <strong>${b.nom}</strong><br>
                    <small style="color:var(--muted);">${b.desc}</small>
                </div>
            </div>
        `;
    }
    html += '<button class="btn-blue" onclick="this.parentElement.parentElement.remove()">Retour</button></div>';

    var div = document.createElement('div');
    div.innerHTML = html;
    div.style.position = 'fixed';
    div.style.top = '0';
    div.style.left = '0';
    div.style.right = '0';
    div.style.bottom = '0';
    div.style.background = 'var(--bg)';
    div.style.zIndex = '999';
    div.style.overflow = 'auto';
    div.style.padding = '15px';
    document.body.appendChild(div);
};

// === FIN PARTIE 4/4 ===
