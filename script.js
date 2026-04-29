// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V6 FINAL
// PARTIE 1/9 : FIREBASE + VARIABLES + UTILS + SONS
// ============================================

// === FIREBASE ===
var firebaseConfig = {
    apiKey: "AIzaSyDQWFqTKRmEZtuBhRHWMDrGtwboOwLleI4",
    databaseURL: "https://quiz-pro-max-default-rtdb.firebaseio.com"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.database();

// === SPLASH ===
window.addEventListener('load', function() {
    setTimeout(function() {
        var splash = document.getElementById('splash');
        if (splash) {
            splash.classList.add('hide');
            setTimeout(function() { splash.remove(); }, 500);
        }
    }, 2500);
});

// === ELEMENTS DOM ===
var pageAccueil    = document.getElementById('page-accueil');
var pageMenu       = document.getElementById('page-menu');
var pageAdminLogin = document.getElementById('page-admin-login');
var pageExam       = document.getElementById('page-exam');
var pageAdmin      = document.getElementById('page-admin');

var formConnexion    = document.getElementById('formConnexion');
var formInscription  = document.getElementById('formInscription');
var formReset        = document.getElementById('formReset');
var btnShowInscription = document.getElementById('btnShowInscription');
var btnShowConnexion   = document.getElementById('btnShowConnexion');
var btnShowReset       = document.getElementById('btnShowReset');
var btnRetourConnexion = document.getElementById('btnRetourConnexion');

var nom              = document.getElementById('nom');
var prenom           = document.getElementById('prenom');
var email            = document.getElementById('email');
var emailInscription = document.getElementById('emailInscription');
var emailReset       = document.getElementById('emailReset');
var nouveauMdp       = document.getElementById('nouveauMdp');
var mdp              = document.getElementById('mdp');
var mdpInscription   = document.getElementById('mdpInscription');
var btnLogin         = document.getElementById('btnLogin');
var btnInscription   = document.getElementById('btnInscription');
var btnReset         = document.getElementById('btnReset');
var btnAdmin         = document.getElementById('btnAdmin');
var erreur           = document.getElementById('erreur');
var erreurInscription= document.getElementById('erreurInscription');
var erreurReset      = document.getElementById('erreurReset');
var onlineCount      = document.getElementById('onlineCount');

var nomMenu      = document.getElementById('nomMenu');
var niv          = document.getElementById('niv');
var xp           = document.getElementById('xp');
var streak       = document.getElementById('streak');
var btnExam      = document.getElementById('btnExam');
var btnBadges    = document.getElementById('btnBadges');
var btnClassement= document.getElementById('btnClassement');
var btnLogout    = document.getElementById('btnLogout');

var adminPass     = document.getElementById('adminPass');
var btnLoginAdmin = document.getElementById('btnLoginAdmin');
var btnRetour     = document.getElementById('btnRetour');
var erreurAdmin   = document.getElementById('erreurAdmin');

var nomConcours   = document.getElementById('nomConcours');
var heureConcours = document.getElementById('heureConcours');
var timer         = document.getElementById('timer');
var enLigne       = document.getElementById('enLigne');
var restant       = document.getElementById('restant');
var questions     = document.getElementById('questions');
var btnNonRep     = document.getElementById('btnNonRep');
var btnFinir      = document.getElementById('btnFinir');

var salleAttente     = document.getElementById('salle-attente');
var heureDebutAffich = document.getElementById('heureDebutAffich');
var timerDebut       = document.getElementById('timerDebut');
var onlineAttente    = document.getElementById('onlineAttente');

var attente      = document.getElementById('attente');
var timerAttente = document.getElementById('timerAttente');
var resultat     = document.getElementById('resultat');
var score        = document.getElementById('score');
var xpGagne      = document.getElementById('xpGagne');
var bonnes       = document.getElementById('bonnes');
var partielles   = document.getElementById('partielles');
var fausses      = document.getElementById('fausses');
var btnCorrection= document.getElementById('btnCorrection');
var btnVoirClass = document.getElementById('btnVoirClass');
var btnRetourMenu= document.getElementById('btnRetourMenu');
var correction   = document.getElementById('correction');

var status        = document.getElementById('status');
var statCandidats = document.getElementById('statCandidats');
var statConcours  = document.getElementById('statConcours');
var statMoy       = document.getElementById('statMoy');
var statOnline    = document.getElementById('statOnline');
var typeConcours  = document.getElementById('typeConcours');
var hDebut        = document.getElementById('hDebut');
var hFin          = document.getElementById('hFin');
var btnSaveConfig = document.getElementById('btnSaveConfig');
var listeQuestions= document.getElementById('listeQuestions');
var btnAjouterQ   = document.getElementById('btnAjouterQ');
var btnSaveSujet  = document.getElementById('btnSaveSujet');
var listeCandidats= document.getElementById('listeCandidats');
var top10         = document.getElementById('top10');
var btnLogoutAdmin= document.getElementById('btnLogoutAdmin');
var collerJSON    = document.getElementById('collerJSON');
var btnCharger50  = document.getElementById('btnCharger50');
var btnEnvoyer50  = document.getElementById('btnEnvoyer50');

var modal        = document.getElementById('modal');
var modalTitre   = document.getElementById('modalTitre');
var modalTexte   = document.getElementById('modalTexte');
var btnAnnuler   = document.getElementById('btnAnnuler');
var btnConfirmer = document.getElementById('btnConfirmer');
var toasts       = document.getElementById('toasts');

// === VARIABLES GLOBALES ===
var user             = null;
var userDisplay      = '';
var userData         = {};
var questionsData    = [];
var reponsesUser     = {};
var finTimestamp     = 0;
var timerInt         = null;
var presenceRef      = null;
var audioCtx         = null;
var sujetActuel      = [];
var alertesTimer     = {30:false, 20:false, 10:false, 5:false};
var copieSubmise     = false;
var reponsesFinales  = {};
var configActuelle   = null;

// === VARIABLES SORTIE ===
var nbSorties        = 0;
var MAX_SORTIES      = 4;
var sortieTimeout    = null;
var derniereFocus    = Date.now();
var devourBloque     = false;
var enExamen         = false;

// === AUDIO CONTEXT ===
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// === SONS AVANCÉS ===
function son(type) {
    try {
        initAudio();
        var o = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);

        switch(type) {
            case 'click':
                o.frequency.value = 800;
                g.gain.value = 0.08;
                o.start();
                o.stop(audioCtx.currentTime + 0.08);
                break;
            case 'success':
                // Son de victoire montant
                o.frequency.setValueAtTime(400, audioCtx.currentTime);
                o.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.15);
                o.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.3);
                g.gain.value = 0.15;
                o.start();
                o.stop(audioCtx.currentTime + 0.4);
                break;
            case 'error':
                o.frequency.value = 200;
                g.gain.value = 0.15;
                o.start();
                o.stop(audioCtx.currentTime + 0.3);
                break;
            case 'tick':
                o.frequency.value = 600;
                g.gain.value = 0.05;
                o.start();
                o.stop(audioCtx.currentTime + 0.05);
                break;
            case 'alerte':
                // Bip bip bip
                for(var i = 0; i < 3; i++) {
                    var o2 = audioCtx.createOscillator();
                    var g2 = audioCtx.createGain();
                    o2.connect(g2);
                    g2.connect(audioCtx.destination);
                    o2.frequency.value = 1000;
                    g2.gain.value = 0.2;
                    o2.start(audioCtx.currentTime + i * 0.2);
                    o2.stop(audioCtx.currentTime + i * 0.2 + 0.1);
                }
                return;
            case 'sortie':
                // Son d'alarme
                o.frequency.setValueAtTime(500, audioCtx.currentTime);
                o.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 0.5);
                g.gain.value = 0.2;
                o.start();
                o.stop(audioCtx.currentTime + 0.5);
                break;
            case 'niveau':
                // Fanfare niveau
                var notes = [523, 659, 784, 1047];
                notes.forEach(function(freq, i) {
                    var oN = audioCtx.createOscillator();
                    var gN = audioCtx.createGain();
                    oN.connect(gN);
                    gN.connect(audioCtx.destination);
                    oN.frequency.value = freq;
                    gN.gain.value = 0.15;
                    oN.start(audioCtx.currentTime + i * 0.12);
                    oN.stop(audioCtx.currentTime + i * 0.12 + 0.1);
                });
                return;
            case 'top1':
                // Fanfare champion
                var notes1 = [523, 784, 1047, 1319, 1047, 1319];
                notes1.forEach(function(freq, i) {
                    var oT = audioCtx.createOscillator();
                    var gT = audioCtx.createGain();
                    oT.connect(gT);
                    gT.connect(audioCtx.destination);
                    oT.frequency.value = freq;
                    gT.gain.value = 0.15;
                    oT.start(audioCtx.currentTime + i * 0.15);
                    oT.stop(audioCtx.currentTime + i * 0.15 + 0.12);
                });
                return;
            case 'countdown':
                // Tic tic urgent
                o.frequency.value = 1200;
                g.gain.value = 0.2;
                o.start();
                o.stop(audioCtx.currentTime + 0.05);
                break;
            default:
                o.frequency.value = 500;
                g.gain.value = 0.08;
                o.start();
                o.stop(audioCtx.currentTime + 0.1);
        }
    } catch(e) {}
}

// === UTILS ===
function showPage(p) {
    [pageAccueil, pageMenu, pageAdminLogin, pageExam, pageAdmin]
        .forEach(el => el.style.display = 'none');
    p.style.display = 'block';
}

function toast(msg, type) {
    var t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.textContent = msg;
    toasts.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

function hash(str)      { return btoa(str); }
function niveau(xpVal)  { return Math.floor(xpVal / 100) + 1; }
function calcXp(sc,tot) { return Math.floor((sc / tot) * 50); }
function cleanEmail(e)  { return e.toLowerCase().replace(/\./g,'_dot_').replace(/@/g,'_at_'); }

function formatDate(ts) {
    var d = new Date(ts);
    return d.toLocaleDateString('fr-FR', {day:'2-digit', month:'short', year:'numeric'})
         + ' ' + d.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
}

function afficherBadgeAnimation(emoji, nom) {
    var div = document.createElement('div');
    div.style.cssText = `
        position:fixed; top:50%; left:50%;
        transform:translate(-50%,-50%) scale(0);
        background:linear-gradient(135deg,var(--yellow),var(--orange));
        color:var(--bg); padding:25px 35px;
        border-radius:20px; z-index:3000;
        text-align:center; font-weight:900;
        font-size:18px; transition:transform 0.4s ease;
        box-shadow:0 10px 40px rgba(250,204,21,0.6);
    `;
    div.innerHTML = `<div style="font-size:50px">${emoji}</div><div>Badge obtenu!</div><div style="font-size:14px">${nom}</div>`;
    document.body.appendChild(div);
    setTimeout(() => div.style.transform = 'translate(-50%,-50%) scale(1)', 50);
    son('niveau');
    setTimeout(() => {
        div.style.transform = 'translate(-50%,-50%) scale(0)';
        setTimeout(() => div.remove(), 400);
    }, 2500);
}

// === FIN PARTIE 1/9 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V6 FINAL
// PARTIE 2/9 : CONNEXION + INSCRIPTION + RESET MDP
// ============================================

// === TOGGLE FORMS ===
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
        son('error'); return;
    }
    if (!e.includes('@') || !e.includes('.')) {
        erreurInscription.textContent = 'Gmail invalide';
        son('error'); return;
    }
    if (m.length < 4) {
        erreurInscription.textContent = 'MDP 4 car mini';
        son('error'); return;
    }

    erreurInscription.textContent = 'Création...';
    var userKey = cleanEmail(e);
    var snap = await db.ref('users/' + userKey).once('value');

    if (snap.exists()) {
        erreurInscription.textContent = 'Ce Gmail a déjà un compte';
        son('error'); return;
    }

    await db.ref('users/' + userKey).set({
        nom: n, prenom: p, email: e, mdp: hash(m),
        xp: 0, niveau: 1, streak: 0,
        dernierJour: Date.now(),
        badges: {}, concoursFaits: 0, moyenne: 0,
        historique: [], dateInscription: Date.now(),
        top10All: false
    });

    erreurInscription.textContent = '';
    toast('✅ Compte créé! Connecte-toi', 'success');
    son('success');
    nom.value=''; prenom.value='';
    emailInscription.value=''; mdpInscription.value='';
    formInscription.style.display = 'none';
    formConnexion.style.display = 'block';
};

// === RESET MDP ===
btnReset.onclick = async function() {
    son('click');
    var e = emailReset.value.trim().toLowerCase();
    var m = nouveauMdp.value.trim();

    if (!e.includes('@') || !e.includes('.')) {
        erreurReset.textContent = 'Gmail invalide';
        son('error'); return;
    }
    if (m.length < 4) {
        erreurReset.textContent = 'Nouveau MDP 4 car mini';
        son('error'); return;
    }

    erreurReset.textContent = 'Vérification...';
    var userKey = cleanEmail(e);
    var snap = await db.ref('users/' + userKey).once('value');

    if (!snap.exists()) {
        erreurReset.textContent = "Ce Gmail n'existe pas";
        son('error'); return;
    }

    await db.ref('users/' + userKey).update({ mdp: hash(m) });
    erreurReset.textContent = '';
    toast('✅ Mot de passe changé! Connecte-toi', 'success');
    son('success');
    emailReset.value=''; nouveauMdp.value='';
    formReset.style.display = 'none';
    formConnexion.style.display = 'block';
};

// === CONNEXION ===
btnLogin.onclick = async function() {
    son('click');
    var e = email.value.trim().toLowerCase();
    var m = mdp.value.trim();

    if (!e.includes('@') || m.length < 4) {
        erreur.textContent = 'Gmail valide + MDP 4 car mini';
        son('error'); return;
    }

    erreur.textContent = 'Connexion...';
    var userKey = cleanEmail(e);
    var snap = await db.ref('users/' + userKey).once('value');

    if (!snap.exists() || snap.val().mdp !== hash(m)) {
        erreur.textContent = 'Gmail ou MDP incorrect';
        son('error'); return;
    }

    var d = snap.val();
    var now = Date.now();
    var dernier = new Date(d.dernierJour).setHours(0,0,0,0);
    var auj = new Date(now).setHours(0,0,0,0);
    var diff = (auj - dernier) / 86400000;
    if (diff === 1) d.streak++;
    else if (diff > 1) d.streak = 1;

    await db.ref('users/' + userKey).update({
        dernierJour: now,
        streak: d.streak
    });

    user = userKey;
    userDisplay = d.prenom + ' ' + d.nom;
    userData = d;
    erreur.textContent = '';
    son('success');
    startPresence();
    chargerMenu(d);
};

// === CHARGER MENU ===
function chargerMenu(d) {
    nomMenu.textContent = 'Salut ' + userDisplay + ' !';
    niv.textContent    = d.niveau || 1;
    xp.textContent     = d.xp || 0;
    streak.textContent = d.streak || 0;
    showPage(pageMenu);
    // Vérifier si concours en cours pour cet utilisateur
    verifierConcoursenCours();
}

// === VÉRIFIER CONCOURS EN COURS ===
async function verifierConcoursenCours() {
    var configSnap = await db.ref('configConcours').once('value');
    var config = configSnap.val();
    if (!config) return;

    var now = Date.now();

    // Vérifier si le concours est actif
    if (now < config.debutTimestamp || now > config.finTimestamp) return;

    // Vérifier si le joueur a une session en cours
    var sessionSnap = await db.ref('sessions/' + user).once('value');
    var session = sessionSnap.val();

    if (session && session.concoursId === config.debutTimestamp && !session.soumis) {
        // Concours en cours non soumis - proposer de reprendre
        toast('⚠️ Tu as un concours en cours! Clique sur Commencer pour reprendre.', 'warning');
        son('alerte');
    }
}

// === DÉCONNEXION ===
btnLogout.onclick = function() {
    son('click');
    if (presenceRef) presenceRef.remove();
    if (timerInt) clearInterval(timerInt);
    stopperDetectionSortie();
    user = null; userDisplay = ''; userData = {};
    copieSubmise = false; reponsesFinales = {};
    enExamen = false; nbSorties = 0; devourBloque = false;
    email.value=''; mdp.value='';
    showPage(pageAccueil);
};

// === PRÉSENCE ===
function startPresence() {
    if (presenceRef) presenceRef.remove();
    presenceRef = db.ref('online/' + user);
    presenceRef.set({ name: userDisplay, ts: Date.now() });
    presenceRef.onDisconnect().remove();
    db.ref('online').on('value', snap => {
        var count = snap.numChildren();
        if (enLigne)       enLigne.textContent       = '🟢 ' + count;
        if (onlineCount)   onlineCount.textContent   = count;
        if (statOnline)    statOnline.textContent    = count;
        if (onlineAttente) onlineAttente.textContent = count;
    });
}

// === FIN PARTIE 2/9 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V6 FINAL
// PARTIE 3/9 : ADMIN LOGIN + MENU + NAVIGATION
// ============================================

// === ADMIN LOGIN ===
btnAdmin.onclick = function() { son('click'); showPage(pageAdminLogin); };
btnRetour.onclick = function() { son('click'); showPage(pageAccueil); };

btnLoginAdmin.onclick = function() {
    son('click');
    if (adminPass.value === 'admin5531') {
        showPage(pageAdmin);
        loadAdmin();
        erreurAdmin.textContent = '';
        adminPass.value = '';
        son('success');
    } else {
        erreurAdmin.textContent = 'MDP incorrect';
        son('error');
    }
};

btnLogoutAdmin.onclick = function() {
    son('click');
    showPage(pageAccueil);
};

// === BOUTONS MENU ===
btnBadges.onclick = function() {
    son('click');
    afficherBadges();
};

btnClassement.onclick = function() {
    son('click');
    afficherClassementMenu();
};

var btnHistorique = document.getElementById('btnHistorique');
var btnMesStats = document.getElementById('btnMesStats');

if (btnHistorique) {
    btnHistorique.onclick = function() {
        son('click');
        afficherHistorique();
    };
}

if (btnMesStats) {
    btnMesStats.onclick = function() {
        son('click');
        afficherStats();
    };
}

// === CRÉER OVERLAY ===
function creerOverlay(titre, contenuId) {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:999;overflow-y:auto;padding:15px;padding-bottom:80px';
    overlay.innerHTML = '<div style="max-width:600px;margin:0 auto">'
        + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid var(--border);position:sticky;top:0;background:var(--bg);z-index:10;padding-top:10px">'
        + '<button onclick="son(\'click\');this.parentElement.parentElement.parentElement.remove()" style="background:var(--border);color:var(--text);padding:10px 18px;border-radius:10px;font-size:16px;font-weight:700;min-height:auto;width:auto;margin:0">← Retour</button>'
        + '<h2 style="margin:0;font-size:20px">' + titre + '</h2>'
        + '</div>'
        + '<div id="' + contenuId + '">'
        + '<div style="text-align:center;padding:30px"><div class="loader"></div><p style="color:var(--muted);margin-top:10px">Chargement...</p></div>'
        + '</div></div>';
    document.body.appendChild(overlay);
    return overlay;
}

// === BADGES ===
async function afficherBadges() {
    var overlay = creerOverlay('Mes Badges', 'contenuBadges');
    var snap = await db.ref('users/' + user + '/badges').once('value');
    var badges = snap.val() || {};

    var badgeList = [
        { key:'premier',   emoji:'🎯', nom:'Premier Concours',  desc:'Terminer son 1er concours' },
        { key:'streak7',   emoji:'🔥', nom:'Serie 7 jours',     desc:'7 jours consecutifs connecte' },
        { key:'niveau10',  emoji:'⭐', nom:'Niveau 10',          desc:'Atteindre le niveau 10' },
        { key:'perfect',   emoji:'💯', nom:'Sans Faute',         desc:'Obtenir 50/50' },
        { key:'rapide',    emoji:'⚡', nom:'Eclair',             desc:'Finir avec +1h restante' },
        { key:'assidu',    emoji:'📅', nom:'Assidu',             desc:'5 concours ou plus passes' },
        { key:'top3',      emoji:'🏅', nom:'Top 3',              desc:'Etre dans le top 3 du concours' },
        { key:'elite',     emoji:'👑', nom:'Elite',              desc:'Moyenne superieure a 40/50' },
        { key:'resistant', emoji:'🛡️', nom:'Resistant',          desc:'Finir sans sortir de l\'examen' },
        { key:'top10all',  emoji:'🌟', nom:'Legende Top 10',     desc:'Etre dans le Top 10 permanent' }
    ];

    var nbObtenu = badgeList.filter(function(b) { return badges[b.key]; }).length;
    var box = overlay.querySelector('#contenuBadges');
    var pct = Math.round((nbObtenu / badgeList.length) * 100);

    var html = '<div class="card center" style="margin-bottom:15px">'
        + '<div style="font-size:50px;margin-bottom:10px">🎖️</div>'
        + '<div style="font-size:32px;font-weight:900;color:var(--yellow)">' + nbObtenu + '<span style="font-size:18px;color:var(--muted)">/' + badgeList.length + '</span></div>'
        + '<div style="color:var(--muted);font-size:14px;margin-top:5px">badges obtenus</div>'
        + '<div style="background:var(--border);border-radius:10px;height:8px;margin:12px 0 4px;overflow:hidden">'
        + '<div style="height:100%;background:linear-gradient(90deg,var(--yellow),var(--orange));border-radius:10px;width:' + pct + '%"></div>'
        + '</div>'
        + '<div style="font-size:12px;color:var(--muted)">' + pct + '% complete</div>'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">';

    badgeList.forEach(function(b) {
        var has = badges[b.key];
        html += '<div style="background:var(--card);border:2px solid ' + (has ? 'var(--yellow)' : 'var(--border)') + ';border-radius:14px;padding:15px;text-align:center">'
            + '<div style="font-size:36px;margin-bottom:8px">' + b.emoji + '</div>'
            + '<div style="font-size:13px;font-weight:700;margin-bottom:4px">' + b.nom + '</div>'
            + '<div style="font-size:11px;color:var(--muted);margin-bottom:8px">' + b.desc + '</div>'
            + '<span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;background:' + (has ? 'rgba(250,204,21,0.2)' : 'rgba(148,163,184,0.1)') + ';color:' + (has ? 'var(--yellow)' : 'var(--muted)') + '">' + (has ? 'Obtenu' : 'Verrouille') + '</span>'
            + '</div>';
    });

    html += '</div>';
    box.innerHTML = html;
}

// === HISTORIQUE ===
async function afficherHistorique() {
    var overlay = creerOverlay('Mon Historique', 'contenuHistorique');
    var snap = await db.ref('users/' + user + '/historique').once('value');
    var histo = snap.val() || [];
    if (!Array.isArray(histo)) histo = Object.values(histo);
    histo.sort(function(a, b) { return b.timestamp - a.timestamp; });

    var box = overlay.querySelector('#contenuHistorique');

    if (histo.length === 0) {
        box.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted)">'
            + '<div style="font-size:60px;margin-bottom:15px">📋</div>'
            + '<div style="font-size:16px;font-weight:700">Aucun concours passe</div>'
            + '<div style="font-size:14px;margin-top:8px">Lance ton premier concours !</div>'
            + '</div>';
        return;
    }

    var scores = histo.map(function(h) { return parseFloat(h.score) || 0; });
    var moy = (scores.reduce(function(a, b) { return a + b; }, 0) / scores.length).toFixed(1);
    var best = Math.max.apply(null, scores);

    var html = '<div class="card" style="margin-bottom:15px">'
        + '<div style="display:flex;justify-content:space-around;text-align:center">'
        + '<div><div style="font-size:28px;font-weight:900;color:var(--yellow)">' + histo.length + '</div><div style="font-size:12px;color:var(--muted)">Concours</div></div>'
        + '<div><div style="font-size:28px;font-weight:900;color:var(--green)">' + moy + '/50</div><div style="font-size:12px;color:var(--muted)">Moyenne</div></div>'
        + '<div><div style="font-size:28px;font-weight:900;color:var(--blue)">' + best + '/50</div><div style="font-size:12px;color:var(--muted)">Meilleur</div></div>'
        + '</div></div>';

    histo.forEach(function(h) {
        var note = parseFloat(h.score);
        var pct = Math.round((note / 50) * 100);
        var color = pct >= 70 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)';
        var emoji = pct >= 70 ? '🟢' : pct >= 50 ? '🟡' : '🔴';
        var sorties = h.sorties || 0;
        html += '<div style="background:var(--card);border:2px solid var(--border);border-left:4px solid ' + color + ';border-radius:14px;padding:15px;margin-bottom:10px">'
            + '<div style="display:flex;justify-content:space-between;align-items:flex-start">'
            + '<div style="flex:1">'
            + '<div style="font-size:12px;color:var(--muted);font-weight:600">' + formatDate(h.timestamp) + '</div>'
            + '<div style="font-size:15px;font-weight:700;margin:4px 0">' + (h.type || 'Concours Blanc Bonogo') + '</div>'
            + '<div style="font-size:13px;color:var(--muted)">' + emoji + ' ' + (h.bonnes || 0) + ' bonnes · ' + (h.partielles || 0) + ' partielles · ' + (h.fausses || 0) + ' fausses</div>'
            + (sorties > 0 ? '<div style="font-size:12px;color:var(--orange);margin-top:4px">⚠️ ' + sorties + ' sortie(s)' + (h.bloque ? ' - Bloque' : '') + '</div>' : '')
            + '<div style="font-size:12px;color:var(--purple);font-weight:700;margin-top:4px">+' + (h.xp || 0) + ' XP</div>'
            + '</div>'
            + '<div style="text-align:right;margin-left:10px">'
            + '<div style="font-size:28px;font-weight:900;color:' + color + '">' + note + '/50</div>'
            + '<div style="font-size:13px;color:var(--muted);font-weight:700">' + pct + '%</div>'
            + '</div></div></div>';
    });

    box.innerHTML = html;
}

// === STATS ===
async function afficherStats() {
    var overlay = creerOverlay('Mes Statistiques', 'contenuStats');
    var snap = await db.ref('users/' + user).once('value');
    var d = snap.val() || {};
    var histo = d.historique || [];
    if (!Array.isArray(histo)) histo = Object.values(histo);

    var total = histo.length;
    var scores = histo.map(function(h) { return parseFloat(h.score) || 0; });
    var moy = total > 0 ? (scores.reduce(function(a,b){return a+b;},0)/total).toFixed(1) : 0;
    var best = total > 0 ? Math.max.apply(null, scores) : 0;
    var worst = total > 0 ? Math.min.apply(null, scores) : 0;
    var reussis = scores.filter(function(s){return s>=25;}).length;
    var taux = total > 0 ? Math.round((reussis/total)*100) : 0;
    var xpActuel = d.xp || 0;
    var xpCourant = xpActuel % 100;
    var pctNiv = Math.min(100, xpCourant);
    var niveauActuel = d.niveau || 1;
    var totalSorties = histo.reduce(function(a,h){return a+(h.sorties||0);},0);

    var box = overlay.querySelector('#contenuStats');

    var html = '<div class="card">'
        + '<h2 style="margin-bottom:15px">Niveau et XP</h2>'
        + '<div style="text-align:center;margin-bottom:15px"><span style="font-size:48px;font-weight:900;color:var(--yellow)">Niv.' + niveauActuel + '</span></div>'
        + '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);font-weight:600"><span>' + xpCourant + '/100 XP</span><span>Niv.' + (niveauActuel+1) + '</span></div>'
        + '<div style="background:var(--border);border-radius:10px;height:14px;margin:8px 0;overflow:hidden">'
        + '<div style="height:100%;background:linear-gradient(90deg,var(--yellow),var(--orange));border-radius:10px;width:' + pctNiv + '%"></div>'
        + '</div>'
        + '<div style="text-align:center;font-size:13px;color:var(--muted)">Total: ' + xpActuel + ' XP</div>'
        + '</div>'
        + '<div class="card">'
        + '<h2 style="margin-bottom:15px">Performances</h2>'
        + '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">';

    var stats = [
        ['🏆', total, 'Concours passes'],
        ['📊', moy + '/50', 'Score moyen'],
        ['🌟', best + '/50', 'Meilleur score'],
        ['📉', worst + '/50', 'Score le plus bas'],
        ['✅', taux + '%', 'Taux de reussite'],
        ['🔥', (d.streak||0) + 'j', 'Jours consecutifs'],
        ['⚠️', totalSorties, 'Sorties detectees'],
        ['💰', xpActuel + ' XP', 'XP total']
    ];

    stats.forEach(function(s) {
        html += '<div style="background:var(--bg);border:2px solid var(--border);border-radius:14px;padding:15px;text-align:center">'
            + '<div style="font-size:22px;margin-bottom:4px">' + s[0] + '</div>'
            + '<div style="font-size:22px;font-weight:900;color:var(--yellow);margin-bottom:4px">' + s[1] + '</div>'
            + '<div style="font-size:11px;color:var(--muted);font-weight:600">' + s[2] + '</div>'
            + '</div>';
    });

    html += '</div></div>';
    box.innerHTML = html;
}

// === CLASSEMENT MENU ===
async function afficherClassementMenu() {
    var overlay = creerOverlay('Classement', 'contenuClassement');
    var box = overlay.querySelector('#contenuClassement');

    box.innerHTML = '<div style="display:flex;gap:8px;margin-bottom:15px">'
        + '<button id="tabConcours" onclick="switchTabClass(\'concours\')" style="flex:1;padding:12px;border-radius:10px;background:var(--yellow);color:var(--bg);border:2px solid var(--yellow);font-size:13px;font-weight:700;min-height:auto;margin:0">Ce Concours</button>'
        + '<button id="tabTop10" onclick="switchTabClass(\'top10\')" style="flex:1;padding:12px;border-radius:10px;background:var(--bg);color:var(--muted);border:2px solid var(--border);font-size:13px;font-weight:700;min-height:auto;margin:0">Top 10 Permanent</button>'
        + '</div>'
        + '<div id="classConcours"></div>'
        + '<div id="classTop10" style="display:none"></div>';

    chargerClassConcours();
    chargerClassTop10();
}

window.switchTabClass = function(tab) {
    son('click');
    var tabC = document.getElementById('tabConcours');
    var tabT = document.getElementById('tabTop10');
    var divC = document.getElementById('classConcours');
    var divT = document.getElementById('classTop10');
    if (!tabC || !tabT) return;

    if (tab === 'concours') {
        tabC.style.background='var(--yellow)'; tabC.style.color='var(--bg)'; tabC.style.borderColor='var(--yellow)';
        tabT.style.background='var(--bg)'; tabT.style.color='var(--muted)'; tabT.style.borderColor='var(--border)';
        divC.style.display='block'; divT.style.display='none';
    } else {
        tabT.style.background='var(--yellow)'; tabT.style.color='var(--bg)'; tabT.style.borderColor='var(--yellow)';
        tabC.style.background='var(--bg)'; tabC.style.color='var(--muted)'; tabC.style.borderColor='var(--border)';
        divT.style.display='block'; divC.style.display='none';
    }
};

async function chargerClassConcours() {
    var snap = await db.ref('resultats').orderByChild('score').limitToLast(50).once('value');
    var results = [];
    snap.forEach(function(child) { results.push(Object.assign({key:child.key}, child.val())); });
    results.sort(function(a,b) { return b.score-a.score || a.timestamp-b.timestamp; });

    var snapAll = await db.ref('users').once('value');
    var total = snapAll.numChildren();
    var monIdx = results.findIndex(function(r) { return r.key===user; });
    var divC = document.getElementById('classConcours');
    if (!divC) return;

    var html = '';
    if (monIdx >= 0) {
        html += '<div style="background:linear-gradient(135deg,rgba(250,204,21,.15),rgba(249,115,22,.1));border:2px solid var(--yellow);border-radius:14px;padding:15px;margin-bottom:15px;text-align:center">'
            + '<div style="font-size:13px;color:var(--muted);margin-bottom:5px">Ma position</div>'
            + '<div style="font-size:40px;font-weight:900;color:var(--yellow)">#' + (monIdx+1) + '</div>'
            + '<div style="font-size:13px;color:var(--muted)">sur ' + total + ' candidats · ' + results[monIdx].score + '/50 pts</div>'
            + '</div>';
    }

    if (results.length === 0) {
        divC.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted)"><div style="font-size:50px">🏆</div><p>Aucun resultat</p></div>';
        return;
    }

    results.forEach(function(r, i) { html += ligneClassement(r, i); });
    divC.innerHTML = html;
    setTimeout(function() {
        divC.querySelectorAll('.cl-item').forEach(function(el) {
            el.style.opacity='1'; el.style.transform='translateX(0)';
        });
    }, 100);
}

async function chargerClassTop10() {
    var snap = await db.ref('top10Permanent').orderByChild('score').limitToLast(10).once('value');
    var results = [];
    snap.forEach(function(child) { results.push(Object.assign({key:child.key}, child.val())); });
    results.sort(function(a,b) { return b.score-a.score; });

    var divT = document.getElementById('classTop10');
    if (!divT) return;

    if (results.length === 0) {
        divT.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted)"><div style="font-size:50px">🌟</div><p>Top 10 vide pour le moment</p></div>';
        return;
    }

    var html = '<div class="card" style="margin-bottom:15px;text-align:center"><div style="font-size:13px;color:var(--muted)">Hall of Fame - Meilleurs scores historiques</div></div>';
    results.forEach(function(r, i) { html += ligneClassement(r, i, true); });
    divT.innerHTML = html;
    setTimeout(function() {
        divT.querySelectorAll('.cl-item').forEach(function(el) {
            el.style.opacity='1'; el.style.transform='translateX(0)';
        });
    }, 100);
}

function ligneClassement(r, i, isTop10) {
    var isMe = r.key===user || r.pseudo===user;
    var med = i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1);
    var pct = Math.round((r.score/50)*100);
    var nomAffiche = (r.prenom && r.nom) ? r.prenom+' '+r.nom : (r.pseudo || 'Candidat');
    var dateAffiche = (isTop10 && r.date) ? ' · '+r.date : '';
    return '<div class="cl-item" style="display:flex;align-items:center;background:'
        + (isMe?'linear-gradient(135deg,rgba(250,204,21,.15),rgba(249,115,22,.1))':'var(--card)')
        + ';padding:14px 15px;border-radius:12px;margin-bottom:8px;border:2px solid '
        + (isMe?'var(--yellow)':'var(--border)')
        + ';opacity:0;transform:translateX(-20px);transition:all 0.3s ease ' + (i*0.05) + 's">'
        + '<span style="font-size:22px;font-weight:900;color:var(--yellow);min-width:45px;text-align:center">' + med + '</span>'
        + '<div style="flex:1;margin:0 10px">'
        + '<div style="font-size:15px;font-weight:700">' + nomAffiche + (isMe?' <span style="color:var(--yellow);font-size:11px">Moi</span>':'') + '</div>'
        + '<div style="font-size:11px;color:var(--muted);margin-top:2px">' + pct + '% · ' + (r.bonnes||0) + ' bonnes ' + (r.partielles||0) + ' partielles ' + (r.fausses||0) + ' fausses' + dateAffiche + '</div>'
        + '</div>'
        + '<div style="text-align:right">'
        + '<div style="font-size:20px;font-weight:900;color:' + (isMe?'var(--yellow)':'var(--green)') + '">' + r.score + '/50</div>'
        + '</div></div>';
}

// === FIN PARTIE 3/9 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V6 FINAL
// PARTIE 4/9 : ADMIN PANEL + CONFIG + QUESTIONS
// ============================================

// === ADMIN PANEL ===
async function loadAdmin() {
    status.textContent = 'Connecte Firebase';

    db.ref('users').on('value', function(snap) {
        statCandidats.textContent = snap.numChildren();
    });

    db.ref('resultats').on('value', function(snap) {
        statConcours.textContent = snap.numChildren();
        var total = 0, count = 0;
        snap.forEach(function(child) {
            total += parseFloat(child.val().score || 0);
            count++;
        });
        statMoy.textContent = count > 0 ? (total/count).toFixed(1) : 0;
    });

    db.ref('configConcours').on('value', function(snap) {
        var cfg = snap.val();
        if (cfg) {
            typeConcours.value = cfg.type || 'Concours Blanc Bonogo';
            hDebut.value = cfg.heureDebut || '08:00';
            hFin.value   = cfg.heureFin   || '09:30';
        }
    });

    db.ref('sujetActuel').on('value', function(snap) {
        sujetActuel = snap.val() || [];
        afficherQuestionsAdmin();
    });

    db.ref('users').on('value', function(snap) {
        var html = '';
        snap.forEach(function(child) {
            var u = child.val();
            var date = new Date(u.dernierJour).toLocaleDateString('fr-FR');
            html += '<div class="eleve-item">'
                + '<strong>' + u.prenom + ' ' + u.nom + '</strong><br>'
                + u.email + '<br>'
                + 'Niveau ' + u.niveau + ' · ' + u.xp + ' XP · Moy: ' + u.moyenne + '/50<br>'
                + u.streak + 'j · ' + u.concoursFaits + ' concours · Vu: ' + date
                + '</div>';
        });
        listeCandidats.innerHTML = html || '<p style="text-align:center;color:var(--muted)">Aucun candidat</p>';
    });

    // Top 10 admin
    db.ref('resultats').orderByChild('score').limitToLast(10).on('value', function(snap) {
        var results = [];
        snap.forEach(function(child) { results.push(child.val()); });
        results.sort(function(a,b) { return b.score - a.score; });
        top10.innerHTML = results.map(function(r, i) {
            var med = i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1);
            var nom = (r.prenom && r.nom) ? r.prenom+' '+r.nom : (r.pseudo||'Candidat');
            return '<div class="classement-item">'
                + '<span class="rang">' + med + '</span>'
                + '<span class="nom">' + nom + '</span>'
                + '<span class="score">' + r.score + '/50</span>'
                + '</div>';
        }).join('') || '<p style="text-align:center;color:var(--muted)">Aucun resultat</p>';
    });

    // Top 10 permanent
    db.ref('top10Permanent').orderByChild('score').limitToLast(10).on('value', function(snap) {
        var results = [];
        snap.forEach(function(child) { results.push(child.val()); });
        results.sort(function(a,b) { return b.score - a.score; });
        var top10PermanentEl = document.getElementById('top10Permanent');
        if (!top10PermanentEl) return;
        top10PermanentEl.innerHTML = results.map(function(r, i) {
            var med = i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1);
            var nom = (r.prenom && r.nom) ? r.prenom+' '+r.nom : (r.pseudo||'Candidat');
            return '<div class="classement-item">'
                + '<span class="rang">' + med + '</span>'
                + '<span class="nom">' + nom + ' <small style="color:var(--muted)">' + (r.date||'') + '</small></span>'
                + '<span class="score">' + r.score + '/50</span>'
                + '</div>';
        }).join('') || '<p style="text-align:center;color:var(--muted)">Aucune entree</p>';
    });
}

// === SAUVER CONFIG ===
btnSaveConfig.onclick = async function() {
    son('click');
    var type = typeConcours.value;
    var debut = hDebut.value;
    var fin = hFin.value;
    if (!debut || !fin) { toast('Remplis les heures', 'error'); return; }

    var today = new Date();
    var dP = debut.split(':');
    var fP = fin.split(':');
    var dDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), +dP[0], +dP[1]);
    var fDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), +fP[0], +fP[1]);
    if (fDate <= dDate) { toast('Heure fin apres debut', 'error'); return; }

    await db.ref('configConcours').set({
        type: type,
        heureDebut: debut,
        heureFin: fin,
        debutTimestamp: dDate.getTime(),
        finTimestamp: fDate.getTime()
    });
    toast('Config sauvegardee!', 'success');
    son('success');
};

// === IMPORT 50 QUESTIONS MULTI-FORMAT ===
btnCharger50.onclick = function() {
    son('click');
    try {
        var qs = JSON.parse(collerJSON.value);
        if (!Array.isArray(qs)) {
            toast('Format invalide : tableau JSON requis', 'error');
            return;
        }
        if (qs.length !== 50) {
            toast('Il faut exactement 50 questions. Tu as ' + qs.length, 'warning');
            return;
        }

        sujetActuel = qs.map(function(q) {
            // Format 1 : deja bon {texte, reponses:[]}
            if (q.texte && q.reponses && Array.isArray(q.reponses)) {
                return q;
            }
            // Format 2 : {question, options:[], reponse}
            if (q.question && q.options && q.reponse) {
                return {
                    texte: q.question,
                    reponses: q.options.map(function(opt) {
                        return { texte: opt, correct: opt === q.reponse };
                    })
                };
            }
            // Format 3 : {text, choices:[], answer}
            if (q.text && q.choices && q.answer) {
                return {
                    texte: q.text,
                    reponses: q.choices.map(function(opt) {
                        return { texte: opt, correct: opt === q.answer };
                    })
                };
            }
            // Format 4 : {enonce, propositions:[], bonne_reponse}
            if (q.enonce && q.propositions && q.bonne_reponse) {
                return {
                    texte: q.enonce,
                    reponses: q.propositions.map(function(opt) {
                        return { texte: opt, correct: opt === q.bonne_reponse };
                    })
                };
            }
            return q;
        });

        afficherQuestionsAdmin();
        collerJSON.value = '';
        btnEnvoyer50.style.display = 'block';
        toast('50 questions chargees et converties!', 'success');
        son('success');

    } catch(e) {
        toast('Erreur JSON : ' + e.message, 'error');
        son('error');
    }
};

btnEnvoyer50.onclick = async function() {
    son('click');
    if (!confirm('Envoyer les 50 questions aux eleves maintenant?')) return;
    await db.ref('sujetActuel').set(sujetActuel);
    btnEnvoyer50.style.display = 'none';
    toast('50 QUESTIONS ENVOYEES AUX ELEVES!', 'success');
    son('success');
};

// === AFFICHER QUESTIONS ADMIN ===
function afficherQuestionsAdmin() {
    listeQuestions.innerHTML = '';
    sujetActuel.forEach(function(q, idx) {
        var div = document.createElement('div');
        div.className = 'question-edit';
        var html = '<strong>Question ' + (idx+1) + '</strong>'
            + '<textarea placeholder="Enonce" data-idx="' + idx + '">' + (q.texte||'') + '</textarea>';
        for (var ri = 0; ri < 4; ri++) {
            var rep = q.reponses && q.reponses[ri] ? q.reponses[ri] : {};
            html += '<div class="reponse-edit">'
                + '<input type="checkbox" ' + (rep.correct ? 'checked' : '') + ' data-q="' + idx + '" data-r="' + ri + '">'
                + '<input type="text" placeholder="Reponse ' + 'ABCD'[ri] + '" value="' + (rep.texte||'') + '" data-q="' + idx + '" data-r="' + ri + '">'
                + '</div>';
        }
        html += '<button class="btn-del" onclick="supprimerQuestion(' + idx + ')">Supprimer</button>';
        div.innerHTML = html;
        listeQuestions.appendChild(div);
    });

    document.querySelectorAll('.question-edit textarea').forEach(function(ta) {
        ta.oninput = function() {
            var i = parseInt(this.dataset.idx);
            if (!sujetActuel[i]) sujetActuel[i] = { texte:'', reponses:[{},{},{},{}] };
            sujetActuel[i].texte = this.value;
        };
    });

    document.querySelectorAll('.reponse-edit input[type="text"]').forEach(function(inp) {
        inp.oninput = function() {
            var q = parseInt(this.dataset.q);
            var r = parseInt(this.dataset.r);
            if (!sujetActuel[q]) sujetActuel[q] = { texte:'', reponses:[{},{},{},{}] };
            if (!sujetActuel[q].reponses[r]) sujetActuel[q].reponses[r] = {};
            sujetActuel[q].reponses[r].texte = this.value;
        };
    });

    document.querySelectorAll('.reponse-edit input[type="checkbox"]').forEach(function(cb) {
        cb.onchange = function() {
            var q = parseInt(this.dataset.q);
            var r = parseInt(this.dataset.r);
            if (!sujetActuel[q]) sujetActuel[q] = { texte:'', reponses:[{},{},{},{}] };
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
    if (sujetActuel.length >= 50) { toast('Maximum 50 questions', 'warning'); return; }
    sujetActuel.push({
        texte: '',
        reponses: [
            {texte:'',correct:false},
            {texte:'',correct:false},
            {texte:'',correct:false},
            {texte:'',correct:false}
        ]
    });
    afficherQuestionsAdmin();
};

btnSaveSujet.onclick = async function() {
    son('click');
    var invalide = sujetActuel.some(function(q) {
        return !q.texte
            || q.reponses.filter(function(r){return r.texte;}).length < 2
            || !q.reponses.some(function(r){return r.correct;});
    });
    if (invalide) {
        toast('Chaque question: enonce + 2 reponses + 1 correcte minimum', 'error');
        return;
    }
    await db.ref('sujetActuel').set(sujetActuel);
    toast('Sujet sauvegarde!', 'success');
    son('success');
};

// === NOUVEAU CONCOURS ADMIN ===
var btnNouveauConcours = document.getElementById('btnNouveauConcours');
if (btnNouveauConcours) {
    btnNouveauConcours.onclick = function() {
        son('click');
        modalTitre.textContent = 'Nouveau Concours';
        modalTexte.textContent = 'Cela va supprimer TOUS les resultats du classement actuel.\nLes eleves pourront repasser le nouveau concours.\nLe Top 10 permanent sera conserve.\n\nContinuer?';
        modal.style.display = 'flex';

        btnConfirmer.onclick = async function() {
            modal.style.display = 'none';
            await db.ref('resultats').remove();
            await db.ref('sessions').remove();
            toast('Resultats reinitialises! Nouveau concours pret.', 'success');
            son('success');
        };
        btnAnnuler.onclick = function() {
            modal.style.display = 'none';
        };
    };
}

// === FIN PARTIE 4/9 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V6 FINAL
// PARTIE 5/9 : LANCER CONCOURS + SALLE ATTENTE
//              + TIMER + DETECTION SORTIE
// ============================================

// === DETECTION SORTIE (40 secondes) ===
function demarrerDetectionSortie() {
    enExamen = true;
    derniereFocus = Date.now();

    document.addEventListener('visibilitychange', gererVisibilite);
    window.addEventListener('blur', gererBlur);
    window.addEventListener('focus', gererFocus);
}

function stopperDetectionSortie() {
    enExamen = false;
    if (sortieTimeout) { clearTimeout(sortieTimeout); sortieTimeout = null; }
    document.removeEventListener('visibilitychange', gererVisibilite);
    window.removeEventListener('blur', gererBlur);
    window.removeEventListener('focus', gererFocus);
}

function gererVisibilite() {
    if (!enExamen || copieSubmise || devourBloque) return;
    if (document.hidden) {
        gererSortie();
    } else {
        gererRetour();
    }
}

function gererBlur() {
    if (!enExamen || copieSubmise || devourBloque) return;
    gererSortie();
}

function gererFocus() {
    if (!enExamen || copieSubmise || devourBloque) return;
    gererRetour();
}

function gererSortie() {
    if (sortieTimeout) return;
    derniereFocus = Date.now();
    sortieTimeout = setTimeout(function() {
        if (!enExamen || copieSubmise) return;
        nbSorties++;
        son('sortie');

        var restantes = MAX_SORTIES - nbSorties;

        if (nbSorties >= MAX_SORTIES) {
            // Bloquer le devoir
            devourBloque = true;
            stopperDetectionSortie();
            toast('🚫 Devoir bloque! Trop de sorties. Score calcule automatiquement.', 'error');
            son('error');

            // Afficher alerte bloquage
            afficherAlerteBloquage();

            // Soumettre automatiquement après 3 secondes
            setTimeout(function() {
                soumettreEtAttendre(true);
            }, 3000);
        } else {
            toast('⚠️ Sortie detectee! ' + restantes + ' sortie(s) restante(s) avant blocage.', 'warning');
            son('alerte');

            // Sauvegarder nb sorties dans Firebase
            db.ref('sessions/' + user).update({ nbSorties: nbSorties });
        }
    }, 40000); // 40 secondes
}

function gererRetour() {
    if (sortieTimeout) {
        var tempsAbsent = Date.now() - derniereFocus;
        clearTimeout(sortieTimeout);
        sortieTimeout = null;

        if (tempsAbsent > 5000 && tempsAbsent < 40000) {
            // Retour avant 40s - avertissement leger
            toast('👁️ Tu es de retour. Reste concentre!', 'warning');
            son('tick');
        }
    }
}

function afficherAlerteBloquage() {
    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;inset:0;background:rgba(239,68,68,0.95);z-index:5000;display:flex;align-items:center;justify-content:center;padding:20px';
    div.innerHTML = '<div style="background:var(--card);border-radius:20px;padding:30px;max-width:400px;width:100%;text-align:center">'
        + '<div style="font-size:60px;margin-bottom:15px">🚫</div>'
        + '<h2 style="color:var(--red);margin-bottom:15px">Devoir Bloque!</h2>'
        + '<p style="color:var(--muted);margin-bottom:20px">Tu as quitte l\'examen trop de fois.<br>Ton score sera calcule sur ce que tu as fait.</p>'
        + '<div style="font-size:32px;font-weight:900;color:var(--yellow);margin-bottom:20px">'
        + nbSorties + ' sorties detectees'
        + '</div>'
        + '<p style="color:var(--muted);font-size:14px">Soumission automatique dans 3 secondes...</p>'
        + '</div>';
    document.body.appendChild(div);
    setTimeout(function() { div.remove(); }, 3500);
}

// === LANCER CONCOURS ===
btnExam.onclick = async function() {
    son('click');
    initAudio();

    var configSnap = await db.ref('configConcours').once('value');
    var config = configSnap.val();
    if (!config) { toast('Aucun concours configure', 'error'); return; }

    configActuelle = config;
    var now = Date.now();

    // Vérifier session en cours (reprise)
    var sessionSnap = await db.ref('sessions/' + user).once('value');
    var session = sessionSnap.val();

    // Verifier si deja soumis pour CE concours
    var resSnap = await db.ref('resultats/' + user).once('value');
    if (resSnap.exists() && resSnap.val().timestamp >= config.debutTimestamp) {
        var r = resSnap.val();
        questionsData = (await db.ref('sujetActuel').once('value')).val() || [];
        finTimestamp = config.finTimestamp;
        nomConcours.textContent = config.type;
        heureConcours.textContent = 'Fin: ' + config.heureFin;
        showPage(pageExam);
        salleAttente.style.display = 'none';
        questions.style.display = 'none';
        document.querySelector('.footer').style.display = 'none';

        if (now < config.finTimestamp) {
            attente.style.display = 'block';
            resultat.style.display = 'none';
            demarrerTimerAttente(config.finTimestamp);
            attendreFin(config.finTimestamp, r);
        } else {
            attente.style.display = 'none';
            afficherResultatFinal(r);
        }
        return;
    }

    var sujetSnap = await db.ref('sujetActuel').once('value');
    if (!sujetSnap.exists() || !sujetSnap.val() || sujetSnap.val().length === 0) {
        toast('Aucun sujet disponible', 'error'); return;
    }

    questionsData = sujetSnap.val();
    finTimestamp  = config.finTimestamp;
    nomConcours.textContent   = config.type;
    heureConcours.textContent = 'Fin: ' + config.heureFin;
    copieSubmise  = false;
    devourBloque  = false;

    // Reprise de session ?
    if (session && session.concoursId === config.debutTimestamp && !session.soumis) {
        nbSorties = session.nbSorties || 0;
        // Restaurer reponses
        if (session.reponses) {
            reponsesUser = session.reponses;
        } else {
            reponsesUser = {};
        }

        if (now >= config.debutTimestamp && now <= config.finTimestamp) {
            // Afficher message reprise
            toast('↩️ Reprise de ton examen. ' + nbSorties + ' sortie(s) enregistree(s).', 'warning');
            son('alerte');
            salleAttente.style.display = 'none';
            questions.style.display = 'block';
            document.querySelector('.footer').style.display = 'flex';
            afficherQuestionsConcours(true); // true = restaurer reponses
            showPage(pageExam);
            demarrerTimer();
            demarrerDetectionSortie();
            return;
        }
    } else {
        nbSorties = 0;
        reponsesUser = {};
        reponsesFinales = {};
    }

    // Salle d'attente
    if (now < config.debutTimestamp) {
        showPage(pageExam);
        salleAttente.style.display = 'block';
        questions.style.display = 'none';
        document.querySelector('.footer').style.display = 'none';
        heureDebutAffich.textContent = config.heureDebut;

        // Créer session
        await db.ref('sessions/' + user).set({
            concoursId: config.debutTimestamp,
            nbSorties: 0,
            soumis: false,
            reponses: {}
        });

        var attenteInt = setInterval(function() {
            var reste = config.debutTimestamp - Date.now();
            if (reste <= 0) {
                clearInterval(attenteInt);
                salleAttente.style.display = 'none';
                questions.style.display = 'block';
                document.querySelector('.footer').style.display = 'flex';
                afficherQuestionsConcours(false);
                demarrerTimer();
                demarrerDetectionSortie();
                toast('Le concours commence!', 'success');
                son('success');
                return;
            }
            var h = Math.floor(reste / 3600000);
            var m = Math.floor((reste % 3600000) / 60000);
            var s = Math.floor((reste % 60000) / 1000);
            timerDebut.textContent =
                (h<10?'0':'') + h + ':' +
                (m<10?'0':'') + m + ':' +
                (s<10?'0':'') + s;
        }, 1000);
        return;
    }

    // Concours termine
    if (now > config.finTimestamp) {
        toast('Le concours est termine', 'error'); return;
    }

    // Creer session
    await db.ref('sessions/' + user).set({
        concoursId: config.debutTimestamp,
        nbSorties: 0,
        soumis: false,
        reponses: {}
    });

    // Lancer direct
    salleAttente.style.display = 'none';
    questions.style.display = 'block';
    document.querySelector('.footer').style.display = 'flex';
    afficherQuestionsConcours(false);
    showPage(pageExam);
    demarrerTimer();
    demarrerDetectionSortie();
};

// === AFFICHER QUESTIONS ===
function afficherQuestionsConcours(restaurer) {
    questions.innerHTML = '';
    alertesTimer = {30:false, 20:false, 10:false, 5:false};
    if (!restaurer) {
        reponsesUser = {};
    }

    questionsData.forEach(function(q, idx) {
        var div = document.createElement('div');
        div.className = 'question-block';
        var reponsesHtml = '';
        q.reponses.forEach(function(r, ridx) {
            if (!r.texte) return;
            var checked = reponsesUser[idx] && reponsesUser[idx].includes(ridx) ? 'checked' : '';
            reponsesHtml += '<label>'
                + '<input type="checkbox" data-q="' + idx + '" data-r="' + ridx + '" ' + checked + '>'
                + '<span>' + r.texte + '</span>'
                + '</label>';
        });

        div.innerHTML = '<div class="question-numero">Question ' + (idx+1) + '/' + questionsData.length + '</div>'
            + '<div class="question-texte">' + q.texte + '</div>'
            + '<div class="reponses-liste">' + reponsesHtml + '</div>';
        questions.appendChild(div);
    });

    // Mettre à jour compteur
    var count = Object.keys(reponsesUser).filter(function(k) {
        return reponsesUser[k] && reponsesUser[k].length > 0;
    }).length;
    restant.textContent = count + '/' + questionsData.length;

    document.querySelectorAll('.reponses-liste input').forEach(function(cb) {
        cb.onchange = function() {
            son('tick');
            var q = parseInt(this.dataset.q);
            var r = parseInt(this.dataset.r);
            if (!reponsesUser[q]) reponsesUser[q] = [];
            if (this.checked) {
                if (!reponsesUser[q].includes(r)) reponsesUser[q].push(r);
            } else {
                reponsesUser[q] = reponsesUser[q].filter(function(x) { return x !== r; });
            }
            var count = Object.keys(reponsesUser).filter(function(k) {
                return reponsesUser[k] && reponsesUser[k].length > 0;
            }).length;
            restant.textContent = count + '/' + questionsData.length;

            // Sauvegarder reponses en temps reel
            db.ref('sessions/' + user + '/reponses').set(reponsesUser);

            // Animer le bloc
            var block = document.getElementById('qblock-' + q);
            if (block) block.style.borderColor = 'var(--blue)';
        };
    });
}

// === TIMER PRINCIPAL ===
function demarrerTimer() {
    if (timerInt) clearInterval(timerInt);
    alertesTimer = {30:false, 20:false, 10:false, 5:false};
    timer.classList.remove('warning');

    function maj() {
        var now = Date.now();
        var reste = finTimestamp - now;

        if (reste <= 0) {
            clearInterval(timerInt);
            timer.textContent = '00:00';
            if (!copieSubmise) {
                toast('Temps ecoule! Copie envoyee automatiquement.', 'warning');
                son('alerte');
                soumettreEtAttendre(false);
            }
            return;
        }

        var min = Math.floor(reste / 60000);
        var sec = Math.floor((reste % 60000) / 1000);
        timer.textContent = min + ':' + (sec < 10 ? '0' : '') + sec;

        // Alertes
        if (min===30 && sec===0 && !alertesTimer[30]) {
            alertesTimer[30]=true;
            toast('30 minutes restantes', 'warning');
            son('alerte');
        }
        if (min===20 && sec===0 && !alertesTimer[20]) {
            alertesTimer[20]=true;
            toast('20 minutes restantes', 'warning');
            son('alerte');
        }
        if (min===10 && sec===0 && !alertesTimer[10]) {
            alertesTimer[10]=true;
            toast('10 minutes restantes!', 'error');
            son('error');
            timer.classList.add('warning');
        }
        if (min===5 && sec===0 && !alertesTimer[5]) {
            alertesTimer[5]=true;
            toast('5 minutes restantes!', 'error');
            son('error');
        }
        if (reste <= 10000 && reste > 0) {
            son('countdown');
        }
        if (min < 5) timer.classList.add('warning');
    }

    maj();
    timerInt = setInterval(maj, 1000);
}

// === TIMER ATTENTE ===
function demarrerTimerAttente(finTs) {
    var intv = setInterval(function() {
        var reste = finTs - Date.now();
        if (reste <= 0) {
            clearInterval(intv);
            if (timerAttente) timerAttente.textContent = '00:00';
            return;
        }
        var min = Math.floor(reste / 60000);
        var sec = Math.floor((reste % 60000) / 1000);
        if (timerAttente) timerAttente.textContent = min + ':' + (sec<10?'0':'') + sec;
    }, 1000);
}

// === ATTENDRE FIN ===
function attendreFin(finTs, resultatData) {
    var reste = finTs - Date.now();
    if (reste <= 0) {
        afficherResultatFinal(resultatData);
        return;
    }
    setTimeout(function() {
        attente.style.display = 'none';
        afficherResultatFinal(resultatData);
        toast('Heure terminee! Voici ton resultat!', 'success');
        son('success');
    }, reste);
}

// === BOUTON NON REPONDU ===
btnNonRep.onclick = function() {
    son('click');
    var nonRep = [];
    for (var i = 0; i < questionsData.length; i++) {
        if (!reponsesUser[i] || reponsesUser[i].length === 0) nonRep.push(i+1);
    }
    if (nonRep.length === 0) {
        toast('Toutes les questions sont repondues!', 'success');
        son('success');
    } else {
        toast('Non repondues: ' + nonRep.join(', '), 'warning');
        var first = document.querySelectorAll('.question-block')[nonRep[0]-1];
        if (first) first.scrollIntoView({behavior:'smooth', block:'center'});
    }
};

// === TERMINER MANUELLEMENT ===
btnFinir.onclick = function() {
    son('click');
    var count = Object.keys(reponsesUser).filter(function(k) {
        return reponsesUser[k] && reponsesUser[k].length > 0;
    }).length;
    var msg = 'Tu as repondu a ' + count + '/' + questionsData.length + ' questions.';
    msg += count < questionsData.length
        ? '\n\nVeux-tu vraiment terminer?'
        : '\n\nConfirmer l\'envoi?';
    msg += '\n\nLa correction sera visible a la fin de l\'heure seulement.';

    modalTitre.textContent = 'Terminer le concours';
    modalTexte.textContent = msg;
    modal.style.display = 'flex';

    btnConfirmer.onclick = function() {
        modal.style.display = 'none';
        soumettreEtAttendre(false);
    };
    btnAnnuler.onclick = function() {
        modal.style.display = 'none';
    };
};

// === FIN PARTIE 5/9 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V6 FINAL
// PARTIE 6/9 : SOUMETTRE + CORRIGER + BADGES + HISTORIQUE
// ============================================

// === SOUMETTRE ET ATTENDRE ===
async function soumettreEtAttendre(estBloque) {
    if (copieSubmise) return;
    copieSubmise = true;

    if (timerInt) clearInterval(timerInt);
    stopperDetectionSortie();

    reponsesFinales = JSON.parse(JSON.stringify(reponsesUser));

    var scoreTotal=0, bonnesRep=0, partiellesRep=0, faussesRep=0;

    questionsData.forEach(function(q, idx) {
        var repUser    = reponsesFinales[idx] || [];
        var repCorrect = [];
        q.reponses.forEach(function(r, ri) {
            if (r.correct) repCorrect.push(ri);
        });

        if (repUser.length === 0) {
            faussesRep++;
        } else {
            var nbOk  = repUser.filter(function(r) { return repCorrect.includes(r); }).length;
            var nbMau = repUser.filter(function(r) { return !repCorrect.includes(r); }).length;
            if (nbMau===0 && nbOk===repCorrect.length) {
                scoreTotal++; bonnesRep++;
            } else if (nbOk>0 && nbMau===0) {
                scoreTotal+=0.5; partiellesRep++;
            } else {
                faussesRep++;
            }
        }
    });

    var xpGagne_val = calcXp(scoreTotal, questionsData.length);

    var snapUser = await db.ref('users/' + user).once('value');
    var dataUser = snapUser.val();
    var config   = configActuelle || {};

    var newXp            = (dataUser.xp||0) + xpGagne_val;
    var newNiveau        = niveau(newXp);
    var newConcoursFaits = (dataUser.concoursFaits||0) + 1;
    var ancienneMoyenne  = parseFloat(dataUser.moyenne) || 0;
    var newMoyenne       = ((ancienneMoyenne * (dataUser.concoursFaits||0)) + scoreTotal) / newConcoursFaits;

    // === BADGES ===
    var badges = dataUser.badges || {};
    var nouveauxBadges = [];

    if (newConcoursFaits === 1 && !badges.premier) {
        badges.premier = true;
        nouveauxBadges.push({emoji:'🎯', nom:'Premier Concours'});
    }
    if ((dataUser.streak||0) >= 7 && !badges.streak7) {
        badges.streak7 = true;
        nouveauxBadges.push({emoji:'🔥', nom:'Serie 7 jours'});
    }
    if (newNiveau >= 10 && !badges.niveau10) {
        badges.niveau10 = true;
        nouveauxBadges.push({emoji:'⭐', nom:'Niveau 10'});
    }
    if (scoreTotal === questionsData.length && !badges.perfect) {
        badges.perfect = true;
        nouveauxBadges.push({emoji:'💯', nom:'Sans Faute'});
    }
    if ((finTimestamp - Date.now()) > 3600000 && !badges.rapide) {
        badges.rapide = true;
        nouveauxBadges.push({emoji:'⚡', nom:'Eclair'});
    }
    if (newConcoursFaits >= 5 && !badges.assidu) {
        badges.assidu = true;
        nouveauxBadges.push({emoji:'📅', nom:'Assidu'});
    }
    if (newMoyenne > 40 && !badges.elite) {
        badges.elite = true;
        nouveauxBadges.push({emoji:'👑', nom:'Elite'});
    }
    if (nbSorties === 0 && !estBloque && !badges.resistant) {
        badges.resistant = true;
        nouveauxBadges.push({emoji:'🛡️', nom:'Resistant'});
    }

    // === HISTORIQUE ===
    var histo = dataUser.historique || [];
    if (!Array.isArray(histo)) histo = Object.values(histo);
    histo.push({
        timestamp  : Date.now(),
        score      : scoreTotal,
        xp         : xpGagne_val,
        bonnes     : bonnesRep,
        partielles : partiellesRep,
        fausses    : faussesRep,
        type       : config.type || 'Concours Blanc Bonogo',
        sorties    : nbSorties,
        bloque     : estBloque || false
    });

    // Sauvegarder dans Firebase
    await db.ref('users/' + user).update({
        xp            : newXp,
        niveau        : newNiveau,
        concoursFaits : newConcoursFaits,
        moyenne       : parseFloat(newMoyenne.toFixed(1)),
        badges        : badges,
        historique    : histo
    });

    await db.ref('resultats/' + user).set({
        key        : user,
        pseudo     : user,
        prenom     : dataUser.prenom,
        nom        : dataUser.nom,
        score      : scoreTotal,
        xp         : xpGagne_val,
        bonnes     : bonnesRep,
        partielles : partiellesRep,
        fausses    : faussesRep,
        timestamp  : Date.now(),
        sorties    : nbSorties,
        bloque     : estBloque || false
    });

    // Marquer session comme soumise
    await db.ref('sessions/' + user).update({ soumis: true });

    // Vérifier top 3 du concours
    var snapClass = await db.ref('resultats').orderByChild('score').limitToLast(3).once('value');
    var top3keys = [];
    snapClass.forEach(function(c) { top3keys.push(c.key); });
    if (top3keys.includes(user) && !badges.top3) {
        badges.top3 = true;
        nouveauxBadges.push({emoji:'🏅', nom:'Top 3'});
    }

    // Vérifier et mettre à jour Top 10 Permanent
    await mettreAJourTop10Permanent(dataUser, scoreTotal, bonnesRep, partiellesRep, faussesRep, badges);

    // Sauvegarder badges finaux
    await db.ref('users/' + user + '/badges').set(badges);

    // Mettre à jour userData local
    userData = Object.assign({}, dataUser, {
        xp: newXp, niveau: newNiveau,
        concoursFaits: newConcoursFaits,
        moyenne: newMoyenne.toFixed(1),
        badges: badges, historique: histo
    });

    var resultatData = {
        pseudo     : user,
        prenom     : dataUser.prenom,
        nom        : dataUser.nom,
        score      : scoreTotal,
        xp         : xpGagne_val,
        bonnes     : bonnesRep,
        partielles : partiellesRep,
        fausses    : faussesRep,
        newNiveau  : newNiveau,
        oldNiveau  : dataUser.niveau || 1,
        timestamp  : Date.now()
    };

    // Afficher page attente
    questions.style.display = 'none';
    document.querySelector('.footer').style.display = 'none';
    attente.style.display  = 'block';
    resultat.style.display = 'none';

    if (estBloque) {
        toast('Devoir bloque soumis. Score: ' + scoreTotal + '/50', 'warning');
    } else {
        toast('Copie envoyee! Resultat a la fin de l\'heure.', 'success');
        son('success');
    }

    // Afficher badges obtenus avec animation
    if (nouveauxBadges.length > 0) {
        nouveauxBadges.forEach(function(b, i) {
            setTimeout(function() {
                afficherBadgeAnimation(b.emoji, b.nom);
            }, i * 3000);
        });
    }

    // Timer attente
    demarrerTimerAttente(finTimestamp);

    // Attendre fin de l'heure
    var resteAvantFin = finTimestamp - Date.now();
    if (resteAvantFin <= 0) {
        attente.style.display = 'none';
        afficherResultatFinal(resultatData);
    } else {
        setTimeout(function() {
            attente.style.display = 'none';
            afficherResultatFinal(resultatData);
            toast('L\'heure est terminee! Voici ton resultat!', 'success');
            son('success');
        }, resteAvantFin);
    }
}

// === METTRE À JOUR TOP 10 PERMANENT ===
async function mettreAJourTop10Permanent(dataUser, scoreTotal, bonnesRep, partiellesRep, faussesRep, badges) {
    var snapTop10 = await db.ref('top10Permanent').once('value');
    var top10Data = [];
    snapTop10.forEach(function(child) {
        top10Data.push(Object.assign({key: child.key}, child.val()));
    });
    top10Data.sort(function(a,b) { return b.score - a.score; });

    var dateAujourdhui = new Date().toLocaleDateString('fr-FR');
    var entree = {
        pseudo    : user,
        prenom    : dataUser.prenom,
        nom       : dataUser.nom,
        score     : scoreTotal,
        bonnes    : bonnesRep,
        partielles: partiellesRep,
        fausses   : faussesRep,
        date      : dateAujourdhui,
        timestamp : Date.now()
    };

    // Verifier si le score mérite le top 10
    var mériteTop10 = top10Data.length < 10 || scoreTotal > top10Data[top10Data.length - 1].score;

    if (mériteTop10) {
        // Supprimer ancienne entree de cet user si existe
        var ancienIdx = top10Data.findIndex(function(r) { return r.pseudo === user; });
        if (ancienIdx >= 0) {
            if (scoreTotal > top10Data[ancienIdx].score) {
                // Supprimer l'ancienne entree
                await db.ref('top10Permanent/' + top10Data[ancienIdx].key).remove();
                top10Data.splice(ancienIdx, 1);
            } else {
                return; // Ancien score meilleur, ne pas remplacer
            }
        }

        // Ajouter nouvelle entree
        await db.ref('top10Permanent').push(entree);
        top10Data.push(entree);
        top10Data.sort(function(a,b) { return b.score - a.score; });

        // Garder seulement top 10
        if (top10Data.length > 10) {
            var aSupprimer = top10Data.slice(10);
            for (var i = 0; i < aSupprimer.length; i++) {
                if (aSupprimer[i].key) {
                    await db.ref('top10Permanent/' + aSupprimer[i].key).remove();
                }
            }
        }

        // Badge top 10
        var monRangTop10 = top10Data.findIndex(function(r) { return r.pseudo === user; });
        if (monRangTop10 >= 0 && monRangTop10 < 10 && !badges.top10all) {
            badges.top10all = true;
            afficherBadgeAnimation('🌟', 'Legende Top 10');
        }
    }
}

// === FIN PARTIE 6/9 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V6 FINAL
// PARTIE 7/9 : RÉSULTAT FINAL + CORRECTION DÉTAILLÉE
// ============================================

// === AFFICHER RÉSULTAT FINAL ===
async function afficherResultatFinal(r) {
    son('success');

    // Calculer rang
    var allSnap = await db.ref('resultats').orderByChild('score').once('value');
    var allRes  = [];
    allSnap.forEach(function(c) {
        allRes.push({key: c.key, score: c.val().score});
    });
    allRes.sort(function(a,b) { return b.score - a.score; });
    var monRang = allRes.findIndex(function(x) { return x.key === user; }) + 1;

    // Son selon rang
    if (monRang === 1) {
        setTimeout(function() { son('top1'); }, 500);
    } else if (monRang <= 3) {
        setTimeout(function() { son('niveau'); }, 500);
    }

    // Afficher elements
    score.textContent      = r.score + '/50';
    xpGagne.textContent    = r.xp || 0;
    bonnes.textContent     = r.bonnes || 0;
    partielles.textContent = r.partielles || 0;
    fausses.textContent    = r.fausses || 0;

    // Rang
    var rangEl = document.getElementById('monRangRes');
    if (rangEl) {
        var rangTexte = monRang === 1 ? '🥇 1er du classement!'
            : monRang === 2 ? '🥈 2eme du classement!'
            : monRang === 3 ? '🥉 3eme du classement!'
            : '🏅 Rang #' + monRang + ' sur ' + allRes.length;
        rangEl.textContent = rangTexte;
        rangEl.style.color = monRang <= 3 ? 'var(--yellow)' : 'var(--text)';
    }

    // Mention selon score
    var pct = Math.round((r.score / 50) * 100);
    var mention = pct >= 90 ? 'Excellent!' : pct >= 70 ? 'Tres Bien!' : pct >= 50 ? 'Bien!' : pct >= 30 ? 'Passable' : 'A ameliorer';
    var mentionEl = document.getElementById('mentionResultat');
    if (mentionEl) mentionEl.textContent = mention;

    // Sorties info
    if (r.sorties > 0) {
        var sortiesEl = document.getElementById('sortiesInfo');
        if (sortiesEl) {
            sortiesEl.textContent = r.bloque
                ? '🚫 Devoir bloque (' + r.sorties + ' sorties)'
                : '⚠️ ' + r.sorties + ' sortie(s) detectee(s)';
            sortiesEl.style.display = 'block';
        }
    }

    attente.style.display  = 'none';
    resultat.style.display = 'block';

    // Notif nouveau niveau
    if (r.newNiveau && r.newNiveau > (r.oldNiveau||1)) {
        setTimeout(function() {
            toast('NIVEAU ' + r.newNiveau + ' ATTEINT!', 'success');
            son('niveau');
        }, 1500);
    }

    // Mettre a jour menu
    niv.textContent    = userData.niveau || 1;
    xp.textContent     = userData.xp || 0;
    streak.textContent = userData.streak || 0;
}

// === BOUTON CORRECTION ===
btnCorrection.onclick = function() {
    son('click');
    correction.innerHTML = '';

    var repAUtiliser = Object.keys(reponsesFinales).length > 0
        ? reponsesFinales : reponsesUser;

    questionsData.forEach(function(q, idx) {
        var repUser    = repAUtiliser[idx] || [];
        var repCorrect = [];
        q.reponses.forEach(function(r, ri) {
            if (r.correct) repCorrect.push(ri);
        });

        var nbOk  = repUser.filter(function(r) { return repCorrect.includes(r); }).length;
        var nbMau = repUser.filter(function(r) { return !repCorrect.includes(r); }).length;
        var isCorrect = repUser.length > 0 && nbMau===0 && nbOk===repCorrect.length;
        var isPartiel = nbOk > 0 && nbMau===0 && nbOk < repCorrect.length;

        var div = document.createElement('div');
        div.className = 'question-correction ' + (isCorrect?'correct':isPartiel?'partiel':'incorrect');

        var icon = isCorrect ? 'Correct' : isPartiel ? 'Partiel' : 'Incorrect';
        var pts  = isCorrect ? '1 pt' : isPartiel ? '0.5 pt' : '0 pt';

        var repUserText = repUser.length > 0
            ? repUser.map(function(r) { return q.reponses[r] ? q.reponses[r].texte : '?'; }).join(', ')
            : 'Aucune reponse';
        var repCorrectText = repCorrect.map(function(r) {
            return q.reponses[r] ? q.reponses[r].texte : '?';
        }).join(', ');

        div.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
            + '<div style="font-weight:800">Question ' + (idx+1) + ' - ' + icon + '</div>'
            + '<div style="font-size:13px;font-weight:700;color:'
            + (isCorrect?'var(--green)':isPartiel?'var(--yellow)':'var(--red)') + '">' + pts + '</div>'
            + '</div>'
            + '<div style="margin-bottom:10px;font-size:15px;line-height:1.5">' + q.texte + '</div>'
            + '<div style="background:var(--bg);padding:10px;border-radius:8px;margin-bottom:6px;font-size:13px">'
            + '<strong>Ta reponse:</strong> '
            + '<span style="color:' + (isCorrect?'var(--green)':isPartiel?'var(--yellow)':'var(--red)') + '">'
            + repUserText + '</span>'
            + '</div>'
            + '<div style="background:var(--bg);padding:10px;border-radius:8px;font-size:13px">'
            + '<strong>Bonne reponse:</strong> '
            + '<span style="color:var(--green)">' + repCorrectText + '</span>'
            + '</div>';

        correction.appendChild(div);
    });

    correction.scrollIntoView({behavior:'smooth'});
};

// === VOIR CLASSEMENT DEPUIS RÉSULTAT ===
btnVoirClass.onclick = async function() {
    son('click');
    attente.style.display  = 'none';
    resultat.style.display = 'none';
    showPage(pageMenu);
    afficherClassementMenu();
};

// === RETOUR MENU ===
btnRetourMenu.onclick = function() {
    son('click');
    attente.style.display   = 'none';
    resultat.style.display  = 'none';
    questions.style.display = 'none';
    correction.innerHTML    = '';
    document.querySelector('.footer').style.display = 'none';
    copieSubmise   = false;
    reponsesFinales = {};
    enExamen       = false;
    nbSorties      = 0;
    devourBloque   = false;
    showPage(pageMenu);

    // Rafraichir stats menu
    db.ref('users/' + user).once('value').then(function(snap) {
        var d = snap.val();
        if (d) {
            niv.textContent    = d.niveau || 1;
            xp.textContent     = d.xp || 0;
            streak.textContent = d.streak || 0;
        }
    });
};

// === FIN PARTIE 7/9 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V6 FINAL
// PARTIE 8/9 : CLASSEMENT DYNAMIQUE + TOP 10 LIVE
// ============================================

// === CLASSEMENT EN TEMPS RÉEL ===
function demarrerClassementLive() {
    db.ref('resultats').on('value', function(snap) {
        var results = [];
        snap.forEach(function(child) {
            results.push(Object.assign({key: child.key}, child.val()));
        });
        results.sort(function(a,b) { return b.score - a.score || a.timestamp - b.timestamp; });

        // Mettre à jour classement si overlay ouvert
        var divC = document.getElementById('classConcours');
        if (divC) {
            var html = '';
            var monIdx = results.findIndex(function(r) { return r.key === user; });

            if (monIdx >= 0) {
                html += '<div style="background:linear-gradient(135deg,rgba(250,204,21,.15),rgba(249,115,22,.1));border:2px solid var(--yellow);border-radius:14px;padding:15px;margin-bottom:15px;text-align:center">'
                    + '<div style="font-size:13px;color:var(--muted);margin-bottom:5px">Ma position</div>'
                    + '<div style="font-size:40px;font-weight:900;color:var(--yellow)">#' + (monIdx+1) + '</div>'
                    + '<div style="font-size:13px;color:var(--muted)">' + results[monIdx].score + '/50 pts</div>'
                    + '</div>';
            }

            results.forEach(function(r, i) { html += ligneClassement(r, i, false); });
            divC.innerHTML = html;
            setTimeout(function() {
                divC.querySelectorAll('.cl-item').forEach(function(el) {
                    el.style.opacity='1'; el.style.transform='translateX(0)';
                });
            }, 50);
        }

        // Mettre à jour top10 admin
        if (top10) {
            var top10results = results.slice(0, 10);
            top10.innerHTML = top10results.map(function(r, i) {
                var med = i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1);
                var nomAffiche = (r.prenom && r.nom) ? r.prenom+' '+r.nom : (r.pseudo||'Candidat');
                return '<div class="classement-item">'
                    + '<span class="rang">' + med + '</span>'
                    + '<span class="nom">' + nomAffiche + '</span>'
                    + '<span class="score">' + r.score + '/50</span>'
                    + '</div>';
            }).join('') || '<p style="text-align:center;color:var(--muted)">Aucun resultat</p>';
        }
    });
}

// === TOP 10 PERMANENT EN TEMPS RÉEL ===
function demarrerTop10Live() {
    db.ref('top10Permanent').on('value', function(snap) {
        var results = [];
        snap.forEach(function(child) {
            results.push(Object.assign({key: child.key}, child.val()));
        });
        results.sort(function(a,b) { return b.score - a.score; });

        var divT = document.getElementById('classTop10');
        if (!divT) return;

        if (results.length === 0) {
            divT.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted)">'
                + '<div style="font-size:50px">🌟</div>'
                + '<p>Top 10 vide pour le moment</p>'
                + '</div>';
            return;
        }

        var html = '<div class="card" style="margin-bottom:15px;text-align:center;'
            + 'background:linear-gradient(135deg,rgba(250,204,21,.1),rgba(139,92,246,.1))">'
            + '<div style="font-size:16px;font-weight:700;color:var(--yellow)">Hall of Fame</div>'
            + '<div style="font-size:13px;color:var(--muted)">Meilleurs scores de tous les concours</div>'
            + '</div>';
        results.forEach(function(r, i) { html += ligneClassement(r, i, true); });
        divT.innerHTML = html;

        setTimeout(function() {
            divT.querySelectorAll('.cl-item').forEach(function(el) {
                el.style.opacity='1'; el.style.transform='translateX(0)';
            });
        }, 50);
    });
}

// === WIDGET CLASSEMENT MINI SUR MENU ===
function afficherMiniClassement() {
    var miniEl = document.getElementById('miniClassement');
    if (!miniEl) return;

    db.ref('resultats').orderByChild('score').limitToLast(5).on('value', function(snap) {
        var results = [];
        snap.forEach(function(child) {
            results.push(Object.assign({key: child.key}, child.val()));
        });
        results.sort(function(a,b) { return b.score - a.score; });

        if (results.length === 0) {
            miniEl.innerHTML = '<p style="text-align:center;color:var(--muted);font-size:13px">Aucun resultat</p>';
            return;
        }

        var html = '<div style="font-size:13px;font-weight:700;color:var(--yellow);margin-bottom:10px">Top 5 Actuel</div>';
        results.forEach(function(r, i) {
            var isMe = r.key === user;
            var med = i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1);
            var nomAffiche = (r.prenom && r.nom) ? r.prenom+' '+r.nom : (r.pseudo||'Candidat');
            html += '<div style="display:flex;align-items:center;padding:8px;background:'
                + (isMe?'rgba(250,204,21,0.1)':'var(--bg)')
                + ';border-radius:8px;margin-bottom:6px;border:1px solid '
                + (isMe?'var(--yellow)':'var(--border)') + '">'
                + '<span style="font-size:16px;min-width:30px">' + med + '</span>'
                + '<span style="flex:1;font-size:13px;font-weight:600">' + nomAffiche + (isMe?' (Moi)':'') + '</span>'
                + '<span style="font-size:14px;font-weight:800;color:' + (isMe?'var(--yellow)':'var(--green)') + '">' + r.score + '/50</span>'
                + '</div>';
        });

        miniEl.innerHTML = html;
    });
}

// === STATISTIQUES LIVE MENU ===
function mettreAJourStatsMenu() {
    if (!user) return;
    db.ref('users/' + user).on('value', function(snap) {
        var d = snap.val();
        if (!d) return;
        if (niv) niv.textContent = d.niveau || 1;
        if (xp)  xp.textContent  = d.xp || 0;
        if (streak) streak.textContent = d.streak || 0;
        userData = d;
    });
}

// === FIN PARTIE 8/9 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V6 FINAL
// PARTIE 9/9 : INIT + MODAL + BONUS + FIN
// ============================================

// === MODAL GLOBAL ===
window.onclick = function(e) {
    if (e.target === modal) modal.style.display = 'none';
};

// === INITIALISATION AU CHARGEMENT ===
document.addEventListener('DOMContentLoaded', function() {

    // Bouton nouveau concours admin
    var btnNvConcours = document.getElementById('btnNouveauConcours');
    if (btnNvConcours) {
        btnNvConcours.onclick = function() {
            son('click');
            modalTitre.textContent = 'Nouveau Concours';
            modalTexte.textContent = 'Supprimer TOUS les resultats actuels?\nLe Top 10 permanent sera conserve.\n\nContinuer?';
            modal.style.display = 'flex';
            btnConfirmer.onclick = async function() {
                modal.style.display = 'none';
                await db.ref('resultats').remove();
                await db.ref('sessions').remove();
                toast('Nouveau concours pret!', 'success');
                son('success');
            };
            btnAnnuler.onclick = function() { modal.style.display = 'none'; };
        };
    }

    // Bouton reset top 10 admin
    var btnResetTop10 = document.getElementById('btnResetTop10');
    if (btnResetTop10) {
        btnResetTop10.onclick = function() {
            son('click');
            modalTitre.textContent = 'Reset Top 10 Permanent';
            modalTexte.textContent = 'Supprimer tout le Top 10 permanent?\nCette action est irreversible.\n\nContinuer?';
            modal.style.display = 'flex';
            btnConfirmer.onclick = async function() {
                modal.style.display = 'none';
                await db.ref('top10Permanent').remove();
                toast('Top 10 permanent reinitialise!', 'success');
                son('success');
            };
            btnAnnuler.onclick = function() { modal.style.display = 'none'; };
        };
    }
});

// === BONUS : COMPTE A REBOURS GLOBAL SUR MENU ===
function demarrerCompteReboursMenu() {
    var timerMenuEl = document.getElementById('timerMenu');
    if (!timerMenuEl) return;

    var intv = setInterval(async function() {
        var configSnap = await db.ref('configConcours').once('value');
        var config = configSnap.val();
        if (!config) {
            timerMenuEl.style.display = 'none';
            return;
        }

        var now = Date.now();

        if (now < config.debutTimestamp) {
            // Avant le concours
            var reste = config.debutTimestamp - now;
            var h = Math.floor(reste / 3600000);
            var m = Math.floor((reste % 3600000) / 60000);
            var s = Math.floor((reste % 60000) / 1000);
            timerMenuEl.style.display = 'block';
            timerMenuEl.style.color = 'var(--yellow)';
            timerMenuEl.textContent = 'Debut dans: '
                + (h<10?'0':'') + h + ':'
                + (m<10?'0':'') + m + ':'
                + (s<10?'0':'') + s;
        } else if (now >= config.debutTimestamp && now <= config.finTimestamp) {
            // Pendant le concours
            var reste2 = config.finTimestamp - now;
            var m2 = Math.floor(reste2 / 60000);
            var s2 = Math.floor((reste2 % 60000) / 1000);
            timerMenuEl.style.display = 'block';
            timerMenuEl.style.color = m2 < 10 ? 'var(--red)' : 'var(--green)';
            timerMenuEl.textContent = 'Concours en cours: ' + m2 + ':' + (s2<10?'0':'') + s2;
        } else {
            // Apres le concours
            timerMenuEl.style.display = 'block';
            timerMenuEl.style.color = 'var(--muted)';
            timerMenuEl.textContent = 'Concours termine';
            clearInterval(intv);
        }
    }, 1000);
}

// === BONUS : NOTIFICATION CLASSEMENT ===
async function verifierChangementRang() {
    if (!user) return;
    var snap = await db.ref('resultats').orderByChild('score').once('value');
    var results = [];
    snap.forEach(function(c) {
        results.push({key: c.key, score: c.val().score});
    });
    results.sort(function(a,b) { return b.score - a.score; });
    var monRang = results.findIndex(function(r) { return r.key === user; }) + 1;

    if (monRang > 0 && monRang <= 3) {
        var msg = monRang===1 ? 'Tu es 1er du classement!' : 'Tu es dans le Top 3!';
        toast(msg, 'success');
    }
}

// === DÉMARRER TOUS LES LISTENERS ===
function demarrerTousListeners() {
    demarrerClassementLive();
    demarrerTop10Live();
    afficherMiniClassement();
    mettreAJourStatsMenu();
    demarrerCompteReboursMenu();
}

// Appeler chargerMenu pour démarrer les listeners
var _chargerMenuOriginal = chargerMenu;
chargerMenu = function(d) {
    _chargerMenuOriginal(d);
    demarrerTousListeners();
};

// === BONUS : ANIMATION CONFETTI VICTOIRE ===
function lancerConfetti() {
    var colors = ['#facc15', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6'];
    for (var i = 0; i < 80; i++) {
        var confetti = document.createElement('div');
        confetti.style.cssText = 'position:fixed;width:8px;height:8px;border-radius:2px;z-index:9999;pointer-events:none;'
            + 'left:' + Math.random()*100 + '%;'
            + 'top:-10px;'
            + 'background:' + colors[Math.floor(Math.random()*colors.length)] + ';'
            + 'animation:confettiFall ' + (1.5+Math.random()*2) + 's ease-in ' + Math.random()*0.5 + 's forwards';
        document.body.appendChild(confetti);
        setTimeout(function(el) { el.remove(); }, 4000, confetti);
    }
}

// Style confetti
var styleConfetti = document.createElement('style');
styleConfetti.textContent = '@keyframes confettiFall {'
    + 'to { top: 110%; transform: rotate(' + (Math.random()*720-360) + 'deg) translateX(' + (Math.random()*200-100) + 'px); opacity:0; }'
    + '}';
document.head.appendChild(styleConfetti);

// Lancer confetti sur top 3
var _afficherResultatFinalOriginal = afficherResultatFinal;
afficherResultatFinal = async function(r) {
    await _afficherResultatFinalOriginal(r);
    // Verifier rang pour confetti
    var snap = await db.ref('resultats').orderByChild('score').once('value');
    var all = [];
    snap.forEach(function(c) { all.push({key:c.key, score:c.val().score}); });
    all.sort(function(a,b){ return b.score-a.score; });
    var rang = all.findIndex(function(x){ return x.key===user; })+1;
    if (rang <= 3) {
        lancerConfetti();
        setTimeout(function(){ lancerConfetti(); }, 1000);
    }
};

// === FIN SCRIPT V6 COMPLET ===
// Concours Blanc Bonogo - Toutes fonctionnalites:
// Firebase quiz-pro-max
// Connexion / Inscription / Reset MDP
// Detection sortie 40s avec blocage apres 4 sorties
// Reprise de session
// Timer avec sons
// Correction a la fin de l'heure seulement
// Classement dynamique temps reel
// Top 10 permanent avec Hall of Fame
// Historique complet par candidat
// Statistiques avec graphe
// 10 Badges avec animation
// Sons avances (tick, alerte, victoire, fanfare)
// Confetti pour top 3
// Compte a rebours sur menu
// Mini classement sur menu
// Admin: nouveau concours, reset top 10
// Multi-format JSON
// === FIN PARTIE 9/9 ===
