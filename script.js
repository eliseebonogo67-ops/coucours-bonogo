// ============================================
// CONCOURS BLANC BONOGO - SCRIPT ORIGINAL
// PARTIE 1/10 : FIREBASE + VARIABLES + UTILS + AUDIO + SPLASH
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
            setTimeout(function() {
                if (splash.parentNode) splash.parentNode.removeChild(splash);
            }, 500);
        }
        var saved = localStorage.getItem('bb_user');
        if (saved) autoLogin(saved);
    }, 2500);
});

// === RÉFÉRENCES DOM — PAGES ===
var pageAccueil    = document.getElementById('page-accueil');
var pageMenu       = document.getElementById('page-menu');
var pageAdminLogin = document.getElementById('page-admin-login');
var pageExam       = document.getElementById('page-exam');
var pageAdmin      = document.getElementById('page-admin');
var pageHistorique = document.getElementById('page-historique');
var pageStats      = document.getElementById('page-stats');

// === RÉFÉRENCES DOM — AUTH ===
var formConnexion      = document.getElementById('formConnexion');
var formInscription    = document.getElementById('formInscription');
var formReset          = document.getElementById('formReset');
var btnShowInscription = document.getElementById('btnShowInscription');
var btnShowConnexion   = document.getElementById('btnShowConnexion');
var btnShowReset       = document.getElementById('btnShowReset');
var btnRetourConnexion = document.getElementById('btnRetourConnexion');
var nomInput           = document.getElementById('nom');
var prenomInput        = document.getElementById('prenom');
var emailInput         = document.getElementById('email');
var emailInscription   = document.getElementById('emailInscription');
var emailReset         = document.getElementById('emailReset');
var nouveauMdp         = document.getElementById('nouveauMdp');
var mdpInput           = document.getElementById('mdp');
var mdpInscription     = document.getElementById('mdpInscription');
var btnLogin           = document.getElementById('btnLogin');
var btnInscription     = document.getElementById('btnInscription');
var btnReset           = document.getElementById('btnReset');
var btnAdmin           = document.getElementById('btnAdmin');
var erreurEl           = document.getElementById('erreur');
var erreurInscription  = document.getElementById('erreurInscription');
var erreurReset        = document.getElementById('erreurReset');
var onlineCount        = document.getElementById('onlineCount');

// === RÉFÉRENCES DOM — MENU ===
var nomMenuEl       = document.getElementById('nomMenu');
var avatarMenuEl    = document.getElementById('avatarMenu');
var nivEl           = document.getElementById('niv');
var xpEl            = document.getElementById('xp');
var streakEl        = document.getElementById('streak');
var btnExam         = document.getElementById('btnExam');
var btnBadges       = document.getElementById('btnBadges');
var btnClassement   = document.getElementById('btnClassement');
var btnHistorique   = document.getElementById('btnHistorique');
var btnStats        = document.getElementById('btnStats');
var btnLogout       = document.getElementById('btnLogout');
var onlineCountMenu = document.getElementById('onlineCountMenu');

// === RÉFÉRENCES DOM — HISTORIQUE / STATS ===
var btnRetourMenuHist  = document.getElementById('btnRetourMenuHist');
var btnRetourMenuStats = document.getElementById('btnRetourMenuStats');

// === RÉFÉRENCES DOM — ADMIN LOGIN ===
var adminPassEl   = document.getElementById('adminPass');
var btnLoginAdmin = document.getElementById('btnLoginAdmin');
var btnRetour     = document.getElementById('btnRetour');
var erreurAdmin   = document.getElementById('erreurAdmin');

// === RÉFÉRENCES DOM — EXAMEN ===
var nomConcoursEl    = document.getElementById('nomConcours');
var heureConcoursEl  = document.getElementById('heureConcours');
var timerEl          = document.getElementById('timer');
var enLigneEl        = document.getElementById('enLigne');
var restantEl        = document.getElementById('restant');
var questionsEl      = document.getElementById('questions');
var btnNonRep        = document.getElementById('btnNonRep');
var btnFinir         = document.getElementById('btnFinir');
var salleAttenteEl   = document.getElementById('salle-attente');
var heureDebutAffich = document.getElementById('heureDebutAffich');
var timerDebutEl     = document.getElementById('timerDebut');
var onlineAttenteEl  = document.getElementById('onlineAttente');
var attenteEl        = document.getElementById('attente');
var timerAttenteEl   = document.getElementById('timerAttente');
var resultatEl       = document.getElementById('resultat');
var scoreEl          = document.getElementById('score');
var xpGagneEl        = document.getElementById('xpGagne');
var bonnesEl         = document.getElementById('bonnes');
var partiellesEl     = document.getElementById('partielles');
var faussesEl        = document.getElementById('fausses');
var monRangResEl     = document.getElementById('monRangRes');
var mentionResultatEl= document.getElementById('mentionResultat');
var sortiesInfoEl    = document.getElementById('sortiesInfo');
var btnCorrection    = document.getElementById('btnCorrection');
var btnVoirClass     = document.getElementById('btnVoirClass');
var btnRetourMenu    = document.getElementById('btnRetourMenu');
var correctionEl     = document.getElementById('correction');

// === RÉFÉRENCES DOM — ADMIN ===
var statusEl           = document.getElementById('status');
var statCandidatsEl    = document.getElementById('statCandidats');
var statConcoursEl     = document.getElementById('statConcours');
var statMoyEl          = document.getElementById('statMoy');
var statOnlineEl       = document.getElementById('statOnline');
var typeConcoursEl     = document.getElementById('typeConcours');
var hDebutEl           = document.getElementById('hDebut');
var hFinEl             = document.getElementById('hFin');
var btnSaveConfig      = document.getElementById('btnSaveConfig');
var listeQuestionsEl   = document.getElementById('listeQuestions');
var btnAjouterQ        = document.getElementById('btnAjouterQ');
var btnSaveSujet       = document.getElementById('btnSaveSujet');
var listeCandidatsEl   = document.getElementById('listeCandidats');
var top10El            = document.getElementById('top10');
var top10PermanentEl   = document.getElementById('top10Permanent');
var btnLogoutAdmin     = document.getElementById('btnLogoutAdmin');
var btnNouveauConcours = document.getElementById('btnNouveauConcours');
var btnResetTop10      = document.getElementById('btnResetTop10');
var collerJSONEl       = document.getElementById('collerJSON');
var btnCharger50       = document.getElementById('btnCharger50');
var btnEnvoyer50       = document.getElementById('btnEnvoyer50');

// === RÉFÉRENCES DOM — MODAL ===
var modalEl      = document.getElementById('modal');
var modalTitreEl = document.getElementById('modalTitre');
var modalTexteEl = document.getElementById('modalTexte');
var btnAnnuler   = document.getElementById('btnAnnuler');
var btnConfirmer = document.getElementById('btnConfirmer');
var toastsEl     = document.getElementById('toasts');

// === VARIABLES GLOBALES ===
var user            = null;
var userDisplay     = '';
var userData        = {};
var questionsData   = [];
var reponsesUser    = {};
var finTimestamp    = 0;
var timerInt        = null;
var presenceRef     = null;
var audioCtx        = null;
var sujetActuel     = [];
var alertesTimer    = { 30: false, 20: false, 10: false, 5: false };
var copieSubmise    = false;
var reponsesFinales = {};
var configActuelle  = null;

// Anti-triche
var nbSorties     = 0;
var MAX_SORTIES   = 4;
var sortieTimeout = null;
var derniereFocus = Date.now();
var devourBloque  = false;
var enExamen      = false;

// === LISTE BADGES ===
var BADGES_LIST = [
    { id: 'premier',   emoji: '🎯', nom: 'Premier Concours',  desc: 'Passe ton 1er concours' },
    { id: 'streak7',   emoji: '🔥', nom: 'Série 7 jours',     desc: 'Connecte-toi 7 jours d\'affilée' },
    { id: 'niveau10',  emoji: '⭐', nom: 'Niveau 10',          desc: 'Atteins le niveau 10' },
    { id: 'perfect',   emoji: '💯', nom: 'Sans Faute',         desc: 'Obtiens 50/50' },
    { id: 'rapide',    emoji: '⚡', nom: 'Éclair',             desc: 'Finis 1h avant la fin' },
    { id: 'assidu',    emoji: '📅', nom: 'Assidu',             desc: 'Passe 5 concours' },
    { id: 'elite',     emoji: '👑', nom: 'Élite',              desc: 'Moyenne supérieure à 40/50' },
    { id: 'resistant', emoji: '🛡️', nom: 'Résistant',         desc: 'Aucune sortie détectée' },
    { id: 'top3',      emoji: '🏅', nom: 'Top 3',             desc: 'Termine dans le top 3' },
    { id: 'top10all',  emoji: '🌟', nom: 'Légende Top 10',    desc: 'Entre au Hall of Fame permanent' }
];

// === AUDIO ===
function initAudio() {
    if (!audioCtx) {
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch(e) { audioCtx = null; }
    }
}

function son(type) {
    try {
        initAudio();
        if (!audioCtx) return;
        var o = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        switch(type) {
            case 'click':
                o.frequency.value = 800; g.gain.value = 0.06;
                o.start(); o.stop(audioCtx.currentTime + 0.07); break;
            case 'success':
                o.frequency.setValueAtTime(400, audioCtx.currentTime);
                o.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.3);
                g.gain.value = 0.12;
                o.start(); o.stop(audioCtx.currentTime + 0.4); break;
            case 'error':
                o.frequency.value = 220; g.gain.value = 0.15;
                o.start(); o.stop(audioCtx.currentTime + 0.3); break;
            case 'alerte':
                [0, 0.22, 0.44].forEach(function(t) {
                    var o2 = audioCtx.createOscillator();
                    var g2 = audioCtx.createGain();
                    o2.connect(g2); g2.connect(audioCtx.destination);
                    o2.frequency.value = 1000; g2.gain.value = 0.18;
                    o2.start(audioCtx.currentTime + t);
                    o2.stop(audioCtx.currentTime + t + 0.1);
                }); return;
            case 'sortie':
                o.frequency.setValueAtTime(500, audioCtx.currentTime);
                o.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 0.5);
                g.gain.value = 0.2;
                o.start(); o.stop(audioCtx.currentTime + 0.5); break;
            case 'niveau':
                [523, 659, 784, 1047].forEach(function(f, i) {
                    var on = audioCtx.createOscillator();
                    var gn = audioCtx.createGain();
                    on.connect(gn); gn.connect(audioCtx.destination);
                    on.frequency.value = f; gn.gain.value = 0.12;
                    on.start(audioCtx.currentTime + i * 0.12);
                    on.stop(audioCtx.currentTime + i * 0.12 + 0.1);
                }); return;
            case 'top1':
                [523, 784, 1047, 1319, 1047, 1319].forEach(function(f, i) {
                    var ot = audioCtx.createOscillator();
                    var gt = audioCtx.createGain();
                    ot.connect(gt); gt.connect(audioCtx.destination);
                    ot.frequency.value = f; gt.gain.value = 0.14;
                    ot.start(audioCtx.currentTime + i * 0.14);
                    ot.stop(audioCtx.currentTime + i * 0.14 + 0.12);
                }); return;
            case 'countdown':
                o.frequency.value = 1200; g.gain.value = 0.18;
                o.start(); o.stop(audioCtx.currentTime + 0.05); break;
            default:
                o.frequency.value = 500; g.gain.value = 0.06;
                o.start(); o.stop(audioCtx.currentTime + 0.1);
        }
    } catch(e) {}
}

// === UTILITAIRES ===
function showPage(p) {
    [pageAccueil, pageMenu, pageAdminLogin, pageExam,
     pageAdmin, pageHistorique, pageStats].forEach(function(el) {
        if (el) el.style.display = 'none';
    });
    if (p) p.style.display = 'block';
    window.scrollTo(0, 0);
}

function toast(msg, type) {
    var t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.textContent = msg;
    if (toastsEl) toastsEl.appendChild(t);
    setTimeout(function() {
        if (t.parentNode) t.parentNode.removeChild(t);
    }, 4000);
}

function hash(str) {
    try { return btoa(unescape(encodeURIComponent(str))); }
    catch(e) { return btoa(str); }
}

function niveau(xpVal)   { return Math.floor(xpVal / 100) + 1; }
function calcXp(sc, tot) { return Math.floor((sc / (tot || 50)) * 50); }

function cleanEmail(e) {
    return e.toLowerCase()
        .replace(/\./g, '_dot_')
        .replace(/@/g, '_at_')
        .replace(/[^a-z0-9_]/g, '');
}

function formatDate(ts) {
    var d = new Date(ts);
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric'
    }) + ' ' + d.toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit'
    });
}

function initiales(p, n) {
    return ((p || '?')[0] + (n || '?')[0]).toUpperCase();
}

function getPct(sc, tot) {
    return (!tot || isNaN(sc)) ? 0 : Math.round((sc / tot) * 100);
}

function pad(n) { return n < 10 ? '0' + n : '' + n; }

function getMention(score) {
    if (score >= 45) return '🏆 Excellent !';
    if (score >= 40) return '🌟 Très bien !';
    if (score >= 35) return '👍 Bien !';
    if (score >= 25) return '📚 Passable';
    if (score >= 15) return '💪 Continue tes efforts !';
    return '📖 Révise davantage !';
}

function getMentionClass(score) {
    if (score >= 40) return 'histo-excellent';
    if (score >= 25) return 'histo-bien';
    if (score >= 15) return 'histo-passable';
    return 'histo-faible';
}

function getMentionTagClass(score) {
    if (score >= 40) return 'm-excellent';
    if (score >= 25) return 'm-bien';
    if (score >= 15) return 'm-passable';
    return 'm-faible';
}

function afficherBadgeAnimation(emoji, nom) {
    var div = document.createElement('div');
    div.className = 'badge-popup';
    div.innerHTML = '<div style="font-size:50px;margin-bottom:12px">' + emoji + '</div>'
        + '<div style="font-size:16px;margin-bottom:6px">Badge obtenu !</div>'
        + '<div style="font-size:13px;opacity:0.85">' + nom + '</div>';
    document.body.appendChild(div);
    son('niveau');
    setTimeout(function() { div.classList.add('show'); }, 30);
    setTimeout(function() {
        div.classList.remove('show');
        setTimeout(function() {
            if (div.parentNode) div.parentNode.removeChild(div);
        }, 420);
    }, 2800);
}

// ============================================
// FIN PARTIE 1/10
// ============================================// ============================================
// CONCOURS BLANC BONOGO - SCRIPT ORIGINAL
// PARTIE 2/10 : CONNEXION + INSCRIPTION + RESET + AUTO-LOGIN
// ============================================

// === NAVIGATION FORMULAIRES ===
if (btnShowInscription) btnShowInscription.onclick = function() {
    son('click');
    formConnexion.style.display   = 'none';
    formInscription.style.display = 'block';
    formReset.style.display       = 'none';
};

if (btnShowConnexion) btnShowConnexion.onclick = function() {
    son('click');
    formInscription.style.display = 'none';
    formConnexion.style.display   = 'block';
    formReset.style.display       = 'none';
};

if (btnShowReset) btnShowReset.onclick = function() {
    son('click');
    formConnexion.style.display   = 'none';
    formReset.style.display       = 'block';
    formInscription.style.display = 'none';
};

if (btnRetourConnexion) btnRetourConnexion.onclick = function() {
    son('click');
    formReset.style.display     = 'none';
    formConnexion.style.display = 'block';
};

// === INSCRIPTION ===
if (btnInscription) btnInscription.onclick = async function() {
    son('click');
    var n = nomInput.value.trim();
    var p = prenomInput.value.trim();
    var e = emailInscription.value.trim().toLowerCase();
    var m = mdpInscription.value.trim();

    if (n.length < 2 || p.length < 2) {
        erreurInscription.textContent = '⚠️ Nom et Prénom requis (2 car. min)';
        son('error'); return;
    }
    if (!e.includes('@') || !e.includes('.')) {
        erreurInscription.textContent = '⚠️ Gmail invalide';
        son('error'); return;
    }
    if (m.length < 4) {
        erreurInscription.textContent = '⚠️ Mot de passe 4 caractères minimum';
        son('error'); return;
    }

    erreurInscription.textContent = '⏳ Création du compte...';
    var userKey = cleanEmail(e);
    var snap = await db.ref('users/' + userKey).once('value');

    if (snap.exists()) {
        erreurInscription.textContent = '⚠️ Ce Gmail a déjà un compte';
        son('error'); return;
    }

    await db.ref('users/' + userKey).set({
        nom: n, prenom: p, email: e,
        mdp: hash(m),
        xp: 0, niveau: 1, streak: 0,
        dernierJour: Date.now(),
        badges: {},
        concoursFaits: 0,
        totalScore: 0,
        moyenne: 0,
        historique: [],
        dateInscription: Date.now(),
        top10All: false
    });

    erreurInscription.textContent = '';
    toast('✅ Compte créé ! Connecte-toi maintenant', 'success');
    son('success');
    nomInput.value = ''; prenomInput.value = '';
    emailInscription.value = ''; mdpInscription.value = '';
    formInscription.style.display = 'none';
    formConnexion.style.display   = 'block';
};

// === RESET MOT DE PASSE ===
if (btnReset) btnReset.onclick = async function() {
    son('click');
    var e = emailReset.value.trim().toLowerCase();
    var m = nouveauMdp.value.trim();

    if (!e.includes('@') || !e.includes('.')) {
        erreurReset.textContent = '⚠️ Gmail invalide';
        son('error'); return;
    }
    if (m.length < 4) {
        erreurReset.textContent = '⚠️ Mot de passe 4 caractères minimum';
        son('error'); return;
    }

    erreurReset.textContent = '⏳ Vérification...';
    var userKey = cleanEmail(e);
    var snap = await db.ref('users/' + userKey).once('value');

    if (!snap.exists()) {
        erreurReset.textContent = "⚠️ Ce Gmail n'existe pas";
        son('error'); return;
    }

    await db.ref('users/' + userKey).update({ mdp: hash(m) });
    erreurReset.textContent = '';
    toast('✅ Mot de passe changé ! Connecte-toi', 'success');
    son('success');
    emailReset.value = ''; nouveauMdp.value = '';
    formReset.style.display     = 'none';
    formConnexion.style.display = 'block';
};

// === CONNEXION ===
if (btnLogin) btnLogin.onclick = async function() {
    son('click');
    var e = emailInput.value.trim().toLowerCase();
    var m = mdpInput.value.trim();

    if (!e.includes('@') || m.length < 4) {
        erreurEl.textContent = '⚠️ Gmail valide + mot de passe requis';
        son('error'); return;
    }

    erreurEl.textContent = '⏳ Connexion...';
    var userKey = cleanEmail(e);
    var snap = await db.ref('users/' + userKey).once('value');

    if (!snap.exists() || snap.val().mdp !== hash(m)) {
        erreurEl.textContent = '⚠️ Gmail ou mot de passe incorrect';
        son('error'); return;
    }

    var d   = snap.val();
    var now = Date.now();
    var dernier = new Date(d.dernierJour || now).setHours(0,0,0,0);
    var auj     = new Date(now).setHours(0,0,0,0);
    var diff    = (auj - dernier) / 86400000;
    if (diff === 1)   d.streak = (d.streak || 0) + 1;
    else if (diff > 1) d.streak = 1;

    await db.ref('users/' + userKey).update({
        dernierJour: now,
        streak: d.streak
    });

    user        = userKey;
    userDisplay = (d.prenom || '') + ' ' + (d.nom || '');
    userData    = d;
    erreurEl.textContent = '';
    son('success');
    localStorage.setItem('bb_user', user);
    startPresence();
    chargerMenu(d);
};

// === AUTO LOGIN ===
async function autoLogin(savedKey) {
    try {
        var snap = await db.ref('users/' + savedKey).once('value');
        if (!snap.exists()) { localStorage.removeItem('bb_user'); return; }
        var d       = snap.val();
        user        = savedKey;
        userDisplay = (d.prenom || '') + ' ' + (d.nom || '');
        userData    = d;
        startPresence();
        chargerMenu(d);
    } catch(e) {
        localStorage.removeItem('bb_user');
    }
}

// === ENTER SUR INPUTS ===
document.addEventListener('DOMContentLoaded', function() {
    if (mdpInput) {
        mdpInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && btnLogin) btnLogin.click();
        });
    }
    if (adminPassEl) {
        adminPassEl.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && btnLoginAdmin) btnLoginAdmin.click();
        });
    }
    if (formInscription) formInscription.style.display = 'none';
    if (formReset)       formReset.style.display       = 'none';
    if (formConnexion)   formConnexion.style.display   = 'block';
});

// ============================================
// FIN PARTIE 2/10
// ============================================// ============================================
// CONCOURS BLANC BONOGO - SCRIPT ORIGINAL
// PARTIE 3/10 : PRÉSENCE + MENU + DÉCONNEXION + HISTORIQUE + STATS
// ============================================

// === PRÉSENCE EN LIGNE ===
function startPresence() {
    if (presenceRef) presenceRef.remove();
    presenceRef = db.ref('online/' + user);
    presenceRef.set({
        nom: userDisplay,
        ts: firebase.database.ServerValue.TIMESTAMP
    });
    presenceRef.onDisconnect().remove();
}

// Écouter candidats en ligne
db.ref('online').on('value', function(snap) {
    var count = snap.numChildren();
    if (onlineCount)     onlineCount.textContent     = count;
    if (onlineCountMenu) onlineCountMenu.textContent = count;
    if (statOnlineEl)    statOnlineEl.textContent    = count;
    if (enLigneEl)       enLigneEl.textContent       = '🟢 ' + count;
    if (onlineAttenteEl) onlineAttenteEl.textContent = count;
});

// === CHARGER MENU ===
function chargerMenu(d) {
    var p = d.prenom || '';
    var n = d.nom    || '';
    if (nomMenuEl)    nomMenuEl.textContent    = 'Bonjour, ' + p + ' ' + n + ' !';
    if (avatarMenuEl) avatarMenuEl.textContent = initiales(p, n);
    if (nivEl)        nivEl.textContent        = d.niveau || 1;
    if (xpEl)         xpEl.textContent         = d.xp || 0;
    if (streakEl)     streakEl.textContent     = (d.streak || 0) + 'j';
    showPage(pageMenu);
}

// === DÉCONNEXION ===
if (btnLogout) btnLogout.onclick = function() {
    son('click');
    modalTitreEl.textContent = 'Déconnexion';
    modalTexteEl.innerHTML   = '<p>Tu veux vraiment te déconnecter ?</p>';
    modalEl.style.display    = 'flex';

    btnConfirmer.onclick = function() {
        modalEl.style.display = 'none';
        if (presenceRef) presenceRef.remove();
        localStorage.removeItem('bb_user');
        user = null; userData = {};
        if (emailInput) emailInput.value = '';
        if (mdpInput)   mdpInput.value   = '';
        showPage(pageAccueil);
        toast('Déconnecté', 'success');
    };
    btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
};

// === NAVIGATION HISTORIQUE ===
if (btnHistorique) btnHistorique.onclick = function() {
    son('click');
    afficherHistorique();
    showPage(pageHistorique);
};

if (btnRetourMenuHist) btnRetourMenuHist.onclick = function() {
    son('click'); showPage(pageMenu);
};

// === AFFICHER HISTORIQUE ===
async function afficherHistorique() {
    var box = document.getElementById('contenuHistorique');
    if (!box) return;
    box.innerHTML = '<div class="loading-box"><div class="loader"></div><p>Chargement...</p></div>';

    var snap  = await db.ref('users/' + user).once('value');
    var d     = snap.val() || {};
    var histo = d.historique || [];
    if (!Array.isArray(histo)) histo = Object.values(histo);

    if (histo.length === 0) {
        box.innerHTML = '<div style="text-align:center;padding:60px 20px;">'
            + '<div style="font-size:50px;margin-bottom:15px">📋</div>'
            + '<p style="font-size:16px;font-weight:700;color:var(--text)">Aucun concours passé</p>'
            + '<p style="font-size:13px;margin-top:8px;color:var(--muted)">Lance ton premier concours !</p>'
            + '</div>';
        return;
    }

    histo = histo.slice().reverse();

    var html = '<div class="histo-resume">' + histo.length + ' concours passé(s)</div>';

    histo.forEach(function(h, i) {
        // Correction bug undefined
        var scoreVal = (typeof h.score  === 'number') ? h.score  : 0;
        var totalVal = (typeof h.total  === 'number' && h.total > 0) ? h.total : 50;
        var bonnesV  = (typeof h.bonnes === 'number') ? h.bonnes : scoreVal;
        var partV    = (typeof h.partielles === 'number') ? h.partielles : 0;
        var faussesV = (typeof h.fausses === 'number') ? h.fausses : (totalVal - bonnesV - partV);
        var xpV      = (typeof h.xp === 'number') ? h.xp : 0;
        var sortiesV = (typeof h.sorties === 'number') ? h.sorties : 0;
        var typeV    = h.type || h.typeConcours || 'Concours Blanc Bonogo';
        var dateV    = h.date || (h.timestamp ? formatDate(h.timestamp) : 'Date inconnue');
        var pct      = getPct(scoreVal, totalVal);
        var mentCls  = getMentionClass(scoreVal);
        var tagCls   = getMentionTagClass(scoreVal);
        var mention  = getMention(scoreVal);

        html += '<div class="histo-card ' + mentCls + '" style="animation-delay:' + (i * 0.04) + 's">'
            + '<div class="histo-top">'
            +   '<div>'
            +     '<div class="histo-type-label">' + typeV + '</div>'
            +     '<div class="histo-date-label">'  + dateV + '</div>'
            +   '</div>'
            +   '<div class="histo-score-big">'
            +     '<span class="score-num">' + scoreVal + '/' + totalVal + '</span>'
            +     '<span class="score-pct">' + pct + '%</span>'
            +   '</div>'
            + '</div>'
            + '<div class="histo-details-row">'
            +   '<span class="histo-badge b-bon">✅ '  + bonnesV  + '</span>'
            +   '<span class="histo-badge b-part">⚠️ ' + partV    + '</span>'
            +   '<span class="histo-badge b-faux">❌ '  + faussesV + '</span>'
            +   '<span class="histo-badge b-xp">💰 +'  + xpV      + ' XP</span>'
            +   (sortiesV > 0 ? '<span class="histo-badge b-sortie">⚠️ ' + sortiesV + ' sortie(s)</span>' : '')
            + '</div>'
            + '<span class="mention-tag ' + tagCls + '">' + mention + '</span>'
            + '</div>';
    });

    box.innerHTML = html;
}

// === NAVIGATION STATS ===
if (btnStats) btnStats.onclick = function() {
    son('click');
    afficherStats();
    showPage(pageStats);
};

if (btnRetourMenuStats) btnRetourMenuStats.onclick = function() {
    son('click'); showPage(pageMenu);
};

// === AFFICHER STATS ===
async function afficherStats() {
    var box = document.getElementById('contenuStats');
    if (!box) return;
    box.innerHTML = '<div class="loading-box"><div class="loader"></div><p>Chargement...</p></div>';

    var snap  = await db.ref('users/' + user).once('value');
    var d     = snap.val() || {};
    var histo = d.historique || [];
    if (!Array.isArray(histo)) histo = Object.values(histo);

    var totalConcours = histo.length;
    var totalScore    = 0;
    var meilleur      = 0;
    var pire          = 50;

    histo.forEach(function(h) {
        var s   = (typeof h.score === 'number') ? h.score : 0;
        var tot = (typeof h.total === 'number' && h.total > 0) ? h.total : 50;
        totalScore += s;
        if (s > meilleur) meilleur = s;
        if (s < pire)     pire     = s;
    });

    var moyenne      = totalConcours > 0 ? (totalScore / totalConcours).toFixed(1) : 0;
    var moyPct       = getPct(parseFloat(moyenne), 50);
    var badgeCount   = Object.keys(d.badges || {}).length;
    var xpTotal      = d.xp     || 0;
    var niveauVal    = d.niveau || 1;
    var xpDansNiveau = xpTotal % 100;
    var streakVal    = d.streak || 0;
    var pfMoy        = moyPct >= 70 ? '' : moyPct >= 40 ? 'pf-yellow' : 'pf-red';

    var html = '<div class="stats-grid-2">'
        + statCard('🎯', totalConcours,    'Concours passés')
        + statCard('⭐', niveauVal,        'Niveau actuel')
        + statCard('💰', xpTotal,          'XP total')
        + statCard('🏆', badgeCount,       'Badges obtenus')
        + statCard('📈', meilleur + '/50', 'Meilleur score')
        + statCard('📉', totalConcours > 0 ? pire + '/50' : '--', 'Plus bas score')
        + '</div>'
        + progressBar('Niveau ' + niveauVal + ' — XP', xpDansNiveau + '/100 XP', xpDansNiveau, '')
        + progressBar('Moyenne générale', moyenne + '/50 (' + moyPct + '%)', moyPct, pfMoy)
        + '<div class="progress-wrap" style="text-align:center">'
        +   '<div class="progress-title" style="margin-bottom:10px">🔥 Série actuelle</div>'
        +   '<div style="font-size:44px;font-weight:900;color:var(--orange)">'
        +     streakVal + '<span style="font-size:16px"> jours</span>'
        +   '</div>'
        + '</div>';

    box.innerHTML = html;
}

function statCard(emoji, val, label) {
    return '<div class="stat-card">'
        + '<span class="stat-card-emoji">' + emoji + '</span>'
        + '<span class="stat-card-val">'   + val   + '</span>'
        + '<span class="stat-card-label">' + label + '</span>'
        + '</div>';
}

function progressBar(title, valTxt, pct, pfClass) {
    return '<div class="progress-wrap">'
        + '<div class="progress-header">'
        +   '<span class="progress-title">' + title  + '</span>'
        +   '<span class="progress-val">'   + valTxt + '</span>'
        + '</div>'
        + '<div class="progress-track">'
        +   '<div class="progress-fill ' + pfClass + '" style="width:' + pct + '%"></div>'
        + '</div>'
        + '</div>';
}

// ============================================
// FIN PARTIE 3/10
// ============================================// ============================================
// CONCOURS BLANC BONOGO - SCRIPT ORIGINAL
// PARTIE 4/10 : BADGES + CLASSEMENT + ADMIN LOGIN
// ============================================

// === MES BADGES ===
if (btnBadges) btnBadges.onclick = function() {
    son('click');
    var badges = userData.badges || {};
    modalTitreEl.textContent = '🏆 Mes Badges';

    var html = '<div class="badges-grid">';
    BADGES_LIST.forEach(function(b) {
        var obtenu = !!badges[b.id];
        html += '<div class="badge-card ' + (obtenu ? 'obtenu' : '') + '">'
            + '<span class="badge-card-emoji">' + b.emoji + '</span>'
            + '<div class="badge-card-nom">'    + b.nom   + '</div>'
            + '<div class="badge-card-desc">'   + b.desc  + '</div>'
            + (obtenu ? '<span class="badge-card-ok">✅ Obtenu</span>' : '')
            + '</div>';
    });
    html += '</div>';

    modalTexteEl.innerHTML     = html;
    modalEl.style.display      = 'flex';
    btnConfirmer.style.display = 'none';
    btnAnnuler.textContent     = 'Fermer';
    btnAnnuler.onclick = function() {
        modalEl.style.display      = 'none';
        btnConfirmer.style.display = '';
        btnAnnuler.textContent     = 'Annuler';
    };
};

// === CLASSEMENT ===
if (btnClassement) btnClassement.onclick = function() {
    son('click');
    afficherClassementModal();
};

async function afficherClassementModal() {
    modalTitreEl.textContent   = '📊 Classement Live';
    modalTexteEl.innerHTML     = '<div class="loading-box"><div class="loader"></div></div>';
    modalEl.style.display      = 'flex';
    btnConfirmer.style.display = 'none';
    btnAnnuler.textContent     = 'Fermer';
    btnAnnuler.onclick = function() {
        modalEl.style.display      = 'none';
        btnConfirmer.style.display = '';
        btnAnnuler.textContent     = 'Annuler';
    };

    var snap    = await db.ref('resultats').orderByChild('score').limitToLast(50).once('value');
    var results = [];
    snap.forEach(function(child) {
        results.push(Object.assign({ key: child.key }, child.val()));
    });
    results.sort(function(a, b) { return b.score - a.score || a.timestamp - b.timestamp; });

    var monIdx = results.findIndex(function(r) { return r.key === user; });
    var html   = '';

    if (monIdx >= 0) {
        html += '<div style="background:rgba(250,204,21,0.08);border:2px solid rgba(250,204,21,0.3);'
            + 'border-radius:16px;padding:18px;margin-bottom:18px;text-align:center">'
            + '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;'
            + 'letter-spacing:0.8px;margin-bottom:8px">Ma position</div>'
            + '<div style="font-size:48px;font-weight:900;color:var(--yellow);line-height:1;margin-bottom:6px">'
            + '#' + (monIdx + 1) + '</div>'
            + '<div style="font-size:13px;color:var(--muted)">'
            + (results[monIdx].score || 0) + '/50 pts</div>'
            + '</div>';
    }

    html += '<div style="max-height:350px;overflow-y:auto;">';
    results.slice(0, 25).forEach(function(r, i) {
        html += ligneClassement(r, i, false);
    });
    html += '</div>';

    modalTexteEl.innerHTML = html;
}

// === LIGNE CLASSEMENT ===
function ligneClassement(r, i, isTop10) {
    var med        = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i + 1);
    var p          = r.prenom || '';
    var n          = r.nom    || '';
    var nomAffiche = (p || n) ? (p + ' ' + n).trim() : (r.pseudo || 'Candidat');
    var isMe       = r.key === user;
    var sc         = (typeof r.score === 'number') ? r.score : 0;

    return '<div class="classement-item' + (isMe ? ' is-me' : '') + '" '
        + 'style="' + (isMe ? 'border-color:var(--yellow);background:rgba(250,204,21,0.07)' : '') + '">'
        + '<span class="rang">' + med + '</span>'
        + '<div style="flex:1;min-width:0">'
        +   '<div class="cl-nom">' + nomAffiche + (isMe ? ' 👈' : '') + '</div>'
        +   '<div class="cl-meta">'
        +     (r.sorties > 0 ? '⚠️ ' + r.sorties + ' sortie(s) ' : '')
        +     (r.bloque ? '🚫 Bloqué ' : '')
        +     (isTop10 && r.date ? '📅 ' + r.date : '')
        +   '</div>'
        + '</div>'
        + '<span class="cl-score" style="' + (isMe ? 'color:var(--yellow)' : '') + '">'
        + sc + '/50</span>'
        + '</div>';
}

// === ADMIN LOGIN ===
if (btnAdmin) btnAdmin.onclick = function() {
    son('click'); showPage(pageAdminLogin);
};

if (btnRetour) btnRetour.onclick = function() {
    son('click'); showPage(pageAccueil);
};

if (btnLoginAdmin) btnLoginAdmin.onclick = async function() {
    son('click');
    if (adminPassEl.value === '2305') {
        erreurAdmin.textContent = '';
        toast('✅ Accès admin accordé', 'success');
        son('success');
        showPage(pageAdmin);
        chargerAdmin();
    } else {
        erreurAdmin.textContent = '⚠️ Mot de passe incorrect';
        son('error');
    }
};

// === CHARGER ADMIN ===
async function chargerAdmin() {
    if (statusEl) {
        statusEl.textContent = '🟢 Connecté';
        statusEl.style.background = 'rgba(34,197,94,0.2)';
        statusEl.style.color = 'var(--green)';
    }

    var usersSnap  = await db.ref('users').once('value');
    var resSnap    = await db.ref('resultats').once('value');
    var configSnap = await db.ref('configConcours').once('value');

    var users   = usersSnap.val()  || {};
    var results = resSnap.val()    || {};
    var config  = configSnap.val() || {};

    if (statCandidatsEl) statCandidatsEl.textContent = Object.keys(users).length;
    if (statConcoursEl)  statConcoursEl.textContent  = Object.keys(results).length;

    var scores = Object.values(results).map(function(r) { return r.score || 0; });
    var moy = scores.length > 0
        ? (scores.reduce(function(a, b) { return a + b; }, 0) / scores.length).toFixed(1)
        : 0;
    if (statMoyEl) statMoyEl.textContent = moy + '/50';

    if (config.heureDebut && hDebutEl) hDebutEl.value = config.heureDebut;
    if (config.heureFin   && hFinEl)   hFinEl.value   = config.heureFin;
    if (config.type && typeConcoursEl) typeConcoursEl.value = config.type;

    demarrerClassementLive();
    demarrerTop10Live();
}

// ============================================
// FIN PARTIE 4/10
// ============================================// ============================================
// CONCOURS BLANC BONOGO - SCRIPT ORIGINAL
// PARTIE 5/10 : ADMIN CONFIG + QUESTIONS + SUJET
// ============================================

// === SAUVEGARDER CONFIG ===
if (btnSaveConfig) btnSaveConfig.onclick = async function() {
    son('click');
    var now   = new Date();
    var today = now.toISOString().split('T')[0];
    var debut = new Date(today + 'T' + hDebutEl.value + ':00').getTime();
    var fin   = new Date(today + 'T' + hFinEl.value   + ':00').getTime();

    if (fin <= debut) {
        toast('⚠️ Heure fin doit être après heure début', 'error'); return;
    }

    await db.ref('configConcours').set({
        type:           typeConcoursEl.value,
        heureDebut:     hDebutEl.value,
        heureFin:       hFinEl.value,
        debutTimestamp: debut,
        finTimestamp:   fin,
        dateCreation:   Date.now()
    });

    toast('✅ Config sauvegardée !', 'success');
    son('success');
};

// === CHARGER 50 QUESTIONS JSON ===
if (btnCharger50) btnCharger50.onclick = function() {
    son('click');
    var json = collerJSONEl.value.trim();
    if (!json) { toast('⚠️ Colle d\'abord les questions !', 'error'); return; }

    try {
        var data = JSON.parse(json);
        if (!Array.isArray(data) || data.length !== 50) {
            toast('⚠️ Il faut exactement 50 questions', 'error'); return;
        }

        sujetActuel = data.map(function(q) {
            var reps;
            if (q.reponses && Array.isArray(q.reponses)) {
                reps = q.reponses.map(function(r, ri) {
                    if (typeof r === 'string') {
                        return { texte: r, correct: q.correct === ri || q.correct === 'ABCD'[ri] };
                    }
                    return { texte: r.texte || r.text || '', correct: !!r.correct };
                });
            } else {
                reps = ['A','B','C','D'].map(function(l, ri) {
                    return {
                        texte:   q[l] || '',
                        correct: q.correct === l || q.correct === ri || q.reponse === l
                    };
                });
            }
            while (reps.length < 4) reps.push({ texte: '', correct: false });
            return {
                texte:       q.texte || q.question || q.enonce || '',
                reponses:    reps.slice(0, 4),
                explication: q.explication || q.explanation || ''
            };
        });

        afficherQuestionsAdmin();
        collerJSONEl.value = '';
        if (btnEnvoyer50) btnEnvoyer50.style.display = 'block';
        toast('✅ 50 questions chargées !', 'success');
        son('success');
    } catch(e) {
        toast('❌ Erreur JSON : ' + e.message, 'error');
        son('error');
    }
};

// Envoyer aux candidats
if (btnEnvoyer50) btnEnvoyer50.onclick = function() {
    son('click');
    modalTitreEl.textContent = 'Envoyer les questions';
    modalTexteEl.innerHTML   = '<p>Envoyer les 50 questions aux candidats maintenant ?</p>';
    modalEl.style.display    = 'flex';
    btnConfirmer.onclick = async function() {
        modalEl.style.display = 'none';
        await db.ref('sujetActuel').set(sujetActuel);
        if (btnEnvoyer50) btnEnvoyer50.style.display = 'none';
        toast('🚀 50 questions envoyées !', 'success');
        son('success');
    };
    btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
};

// === AFFICHER QUESTIONS ADMIN ===
function afficherQuestionsAdmin() {
    if (!listeQuestionsEl) return;
    listeQuestionsEl.innerHTML = '';

    sujetActuel.forEach(function(q, idx) {
        var div = document.createElement('div');
        div.className = 'question-edit';

        var html = '<div style="font-size:12px;font-weight:800;color:var(--blue);'
            + 'text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">'
            + 'Question ' + (idx + 1) + ' / 50</div>'
            + '<textarea placeholder="Énoncé de la question" data-idx="' + idx + '">'
            + (q.texte || '') + '</textarea>'
            + '<input type="text" placeholder="💡 Explication (facultatif)" '
            + 'data-expl="' + idx + '" value="' + (q.explication || '') + '" '
            + 'style="padding:10px 14px;margin:6px 0;">';

        for (var ri = 0; ri < 4; ri++) {
            var rep = (q.reponses && q.reponses[ri]) ? q.reponses[ri] : {};
            html += '<div class="reponse-edit">'
                + '<input type="checkbox" '
                + (rep.correct ? 'checked' : '')
                + ' data-q="' + idx + '" data-r="' + ri + '" title="Bonne réponse">'
                + '<input type="text" placeholder="Réponse ' + 'ABCD'[ri]
                + '" value="' + (rep.texte || '') + '" data-q="' + idx + '" data-r="' + ri + '">'
                + '</div>';
        }

        html += '<button class="btn-del" onclick="supprimerQuestion(' + idx + ')">🗑️ Supprimer</button>';
        div.innerHTML = html;
        listeQuestionsEl.appendChild(div);
    });

    // Listeners textarea
    listeQuestionsEl.querySelectorAll('textarea').forEach(function(ta) {
        ta.oninput = function() {
            var i = parseInt(this.dataset.idx);
            if (sujetActuel[i]) sujetActuel[i].texte = this.value;
        };
    });

    // Listeners explication
    listeQuestionsEl.querySelectorAll('input[data-expl]').forEach(function(inp) {
        inp.oninput = function() {
            var i = parseInt(this.dataset.expl);
            if (sujetActuel[i]) sujetActuel[i].explication = this.value;
        };
    });

    // Listeners texte réponse
    listeQuestionsEl.querySelectorAll('.reponse-edit input[type="text"]').forEach(function(inp) {
        inp.oninput = function() {
            var q = parseInt(this.dataset.q);
            var r = parseInt(this.dataset.r);
            if (!sujetActuel[q].reponses[r]) sujetActuel[q].reponses[r] = {};
            sujetActuel[q].reponses[r].texte = this.value;
        };
    });

    // Listeners checkbox
    listeQuestionsEl.querySelectorAll('.reponse-edit input[type="checkbox"]').forEach(function(cb) {
        cb.onchange = function() {
            var q = parseInt(this.dataset.q);
            var r = parseInt(this.dataset.r);
            if (!sujetActuel[q].reponses[r]) sujetActuel[q].reponses[r] = {};
            sujetActuel[q].reponses[r].correct = this.checked;
        };
    });
}

// Supprimer question
window.supprimerQuestion = function(idx) {
    son('click');
    if (confirm('Supprimer cette question ?')) {
        sujetActuel.splice(idx, 1);
        afficherQuestionsAdmin();
    }
};

// Ajouter question
if (btnAjouterQ) btnAjouterQ.onclick = function() {
    son('click');
    if (sujetActuel.length >= 50) { toast('Maximum 50 questions', 'warning'); return; }
    sujetActuel.push({
        texte: '', explication: '',
        reponses: [
            { texte: '', correct: false }, { texte: '', correct: false },
            { texte: '', correct: false }, { texte: '', correct: false }
        ]
    });
    afficherQuestionsAdmin();
    setTimeout(function() {
        var divs = listeQuestionsEl.querySelectorAll('.question-edit');
        if (divs.length) divs[divs.length-1].scrollIntoView({ behavior: 'smooth' });
    }, 100);
};

// Sauver sujet
if (btnSaveSujet) btnSaveSujet.onclick = async function() {
    son('click');
    var invalide = sujetActuel.some(function(q) {
        return !q.texte
            || q.reponses.filter(function(r) { return r.texte; }).length < 2
            || !q.reponses.some(function(r) { return r.correct; });
    });
    if (invalide) {
        toast('⚠️ Chaque question : énoncé + 2 réponses + 1 correcte', 'error'); return;
    }
    await db.ref('sujetActuel').set(sujetActuel);
    toast('✅ Sujet sauvegardé !', 'success');
    son('success');
};

// === NOUVEAU CONCOURS ===
if (btnNouveauConcours) btnNouveauConcours.onclick = function() {
    son('click');
    modalTitreEl.textContent = '🔄 Nouveau Concours';
    modalTexteEl.innerHTML   = '<p>Cela va <b style="color:var(--red)">supprimer tous les résultats</b> '
        + 'du classement actuel.<br><br>Le Hall of Fame permanent sera conservé.<br><br>Continuer ?</p>';
    modalEl.style.display = 'flex';

    btnConfirmer.onclick = async function() {
        modalEl.style.display = 'none';
        await db.ref('resultats').remove();
        await db.ref('sessions').remove();
        toast('✅ Nouveau concours prêt !', 'success');
        son('success');
    };
    btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
};

// ============================================// ============================================
// CONCOURS BLANC BONOGO - SCRIPT ORIGINAL
// PARTIE 6/10 : TOP 10 + CANDIDATS + LOGOUT ADMIN
// ============================================

// === TOP 10 PERMANENT LIVE ===
function demarrerTop10Live() {
    db.ref('top10Permanent').on('value', function(snap) {
        var results = [];
        snap.forEach(function(child) {
            results.push(Object.assign({ key: child.key }, child.val()));
        });
        results.sort(function(a, b) { return b.score - a.score; });

        if (!top10PermanentEl) return;

        if (results.length === 0) {
            top10PermanentEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted)">'
                + '<div style="font-size:40px;margin-bottom:10px">🌟</div>'
                + '<p>Hall of Fame vide pour le moment</p>'
                + '</div>';
            return;
        }

        var html = '<div style="font-size:11px;font-weight:700;color:var(--muted);'
            + 'text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">'
            + 'Meilleurs scores de tous les concours</div>';
        results.forEach(function(r, i) { html += ligneClassement(r, i, true); });
        top10PermanentEl.innerHTML = html;
    });
}

// === RESET TOP 10 ===
if (btnResetTop10) btnResetTop10.onclick = function() {
    son('click');
    modalTitreEl.textContent = 'Reset Hall of Fame';
    modalTexteEl.innerHTML   = '<p>Supprimer tout le Hall of Fame ?<br>'
        + 'Cette action est <b style="color:var(--red)">irréversible</b>.</p>';
    modalEl.style.display = 'flex';

    btnConfirmer.onclick = async function() {
        modalEl.style.display = 'none';
        await db.ref('top10Permanent').remove();
        toast('🗑️ Hall of Fame réinitialisé', 'success');
        son('success');
    };
    btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
};

// === CLASSEMENT LIVE ADMIN ===
function demarrerClassementLive() {
    db.ref('resultats').on('value', function(snap) {
        var results = [];
        snap.forEach(function(child) {
            results.push(Object.assign({ key: child.key }, child.val()));
        });
        results.sort(function(a, b) { return b.score - a.score || a.timestamp - b.timestamp; });

        if (top10El) {
            var top = results.slice(0, 10);
            if (top.length === 0) {
                top10El.innerHTML = '<p style="text-align:center;color:var(--muted)">Aucun résultat encore</p>';
            } else {
                top10El.innerHTML = top.map(function(r, i) {
                    var p   = r.prenom || '';
                    var n   = r.nom    || '';
                    var nom = (p || n) ? (p + ' ' + n).trim() : (r.pseudo || 'Candidat');
                    var med = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i + 1);
                    return '<div class="classement-item">'
                        + '<span class="rang">' + med + '</span>'
                        + '<div style="flex:1;min-width:0">'
                        +   '<div class="cl-nom">' + nom + '</div>'
                        +   (r.sorties > 0 ? '<div class="cl-meta">⚠️ ' + r.sorties + ' sortie(s)</div>' : '')
                        + '</div>'
                        + '<span class="cl-score">' + (r.score || 0) + '/50</span>'
                        + '</div>';
                }).join('');
            }
        }

        if (statConcoursEl) statConcoursEl.textContent = results.length;
        if (statMoyEl && results.length > 0) {
            var s = results.reduce(function(a, r) { return a + (r.score || 0); }, 0);
            statMoyEl.textContent = (s / results.length).toFixed(1) + '/50';
        }
    });
}

// === LISTE CANDIDATS LIVE ===
db.ref('users').on('value', function(snap) {
    if (!listeCandidatsEl) return;
    var users = [];
    snap.forEach(function(child) {
        users.push(Object.assign({ key: child.key }, child.val()));
    });
    users.sort(function(a, b) { return (b.xp || 0) - (a.xp || 0); });

    if (users.length === 0) {
        listeCandidatsEl.innerHTML = '<p style="text-align:center;color:var(--muted)">Aucun candidat inscrit</p>';
        return;
    }

    listeCandidatsEl.innerHTML = users.map(function(u) {
        var badgesCount = Object.keys(u.badges || {}).length;
        return '<div class="eleve-item" style="display:flex;justify-content:space-between;align-items:center;gap:10px;">'
            + '<div style="flex:1;min-width:0">'
            +   '<strong>' + (u.prenom || '?') + ' ' + (u.nom || '?') + '</strong>'
            +   '<div style="font-size:11px;color:var(--muted)">' + (u.email || '?') + '</div>'
            +   '<div style="font-size:11px;color:var(--muted);margin-top:3px">'
            +     'Niv.' + (u.niveau || 1) + ' · ' + (u.xp || 0) + ' XP · ' + badgesCount + ' badge(s)'
            +   '</div>'
            + '</div>'
            + '<div style="text-align:right;flex-shrink:0">'
            +   '<div style="font-size:13px;font-weight:800;color:var(--yellow)">'
            +     (u.concoursFaits || 0) + ' concours'
            +   '</div>'
            +   '<div style="font-size:11px;color:var(--muted)">Moy: ' + (u.moyenne || 0) + '/50</div>'
            + '</div>'
            + '</div>';
    }).join('');
});

// === LOGOUT ADMIN ===
if (btnLogoutAdmin) btnLogoutAdmin.onclick = function() {
    son('click');
    showPage(pageAccueil);
    toast('Déconnecté', 'success');
};

// ============================================
// FIN PARTIE 6/10
// ============================================// ============================================
// CONCOURS BLANC BONOGO - SCRIPT ORIGINAL
// PARTIE 7/10 — SECTION A — CORRIGÉE
// ============================================

if (btnExam) btnExam.onclick = async function() {
    son('click');
    nbSorties     = 0; sortieTimeout = null;
    derniereFocus = Date.now(); devourBloque = false;
    copieSubmise  = false;     enExamen     = false;

    var configSnap = await db.ref('configConcours').once('value');
    configActuelle = configSnap.val();

    if (!configActuelle) {
        toast('Aucun concours configure', 'error'); return;
    }

    var sujetSnap = await db.ref('sujetActuel').once('value');
    questionsData = sujetSnap.val() || [];

    if (questionsData.length === 0) {
        toast('Aucune question disponible', 'error'); return;
    }

    var now = Date.now();
    if (now < configActuelle.debutTimestamp) {
        showPage(pageExam);
        if (attenteEl)  attenteEl.style.display  = 'none';
        if (resultatEl) resultatEl.style.display = 'none';
        afficherSalleAttente();
        return;
    }

    if (now > configActuelle.finTimestamp) {
        toast('Ce concours est termine', 'error');
        return;
    }

    // Vérifier si déjà soumis
    var resSnap = await db.ref('resultats/' + user).once('value');
    if (resSnap.exists()) {
        // Déjà soumis → montrer résultat directement
        var res = resSnap.val();
        showPage(pageExam);
        if (attenteEl)  attenteEl.style.display  = 'none';
        questionsEl.style.display                = 'none';
        document.querySelector('.footer').style.display    = 'none';
        document.querySelector('.header').style.display    = 'flex';
        document.querySelector('.subheader').style.display = 'none';

        // Reconstruire reponsesFinales depuis Firebase
        reponsesFinales = res.reponses || {};
        questionsData   = sujetSnap.val() || [];
        finTimestamp    = configActuelle.finTimestamp;

        if (now < finTimestamp) {
            // Temps pas encore fini → écran attente
            afficherAttenteDepuisResultatExistant(res);
        } else {
            // Temps fini → afficher résultat
            afficherResultat(
                res.score, res.bonnes,
                res.partielles, res.fausses, res.xp
            );
        }
        return;
    }

    // Pas encore soumis → lancer examen
    finTimestamp = configActuelle.finTimestamp;
    showPage(pageExam);
    if (attenteEl)  attenteEl.style.display  = 'none';
    if (resultatEl) resultatEl.style.display = 'none';
    lancerExamen();
};

// Si copie déjà envoyée mais temps pas fini
function afficherAttenteDepuisResultatExistant(res) {
    questionsEl.style.display                          = 'none';
    document.querySelector('.footer').style.display    = 'none';
    document.querySelector('.header').style.display    = 'none';
    document.querySelector('.subheader').style.display = 'none';
    if (attenteEl) attenteEl.style.display = 'block';

    var intv = setInterval(function() {
        var reste = finTimestamp - Date.now();
        if (reste <= 0) {
            clearInterval(intv);
            if (attenteEl) attenteEl.style.display = 'none';
            reponsesFinales = res.reponses || {};
            afficherResultat(
                res.score, res.bonnes,
                res.partielles, res.fausses, res.xp
            );
            return;
        }
        var min = Math.floor(reste / 60000);
        var sec = Math.floor((reste % 60000) / 1000);
        if (timerAttenteEl) timerAttenteEl.textContent = min + ':' + pad(sec);
    }, 1000);
}

function afficherSalleAttente() {
    salleAttenteEl.style.display                       = 'block';
    questionsEl.style.display                          = 'none';
    document.querySelector('.footer').style.display    = 'none';
    document.querySelector('.header').style.display    = 'none';
    document.querySelector('.subheader').style.display = 'none';

    var dateDebut = new Date(configActuelle.debutTimestamp);
    if (heureDebutAffich) {
        heureDebutAffich.textContent = dateDebut.toLocaleTimeString('fr-FR', {
            hour: '2-digit', minute: '2-digit'
        });
    }

    var intv = setInterval(function() {
        var reste = configActuelle.debutTimestamp - Date.now();
        if (reste <= 0) {
            clearInterval(intv);
            salleAttenteEl.style.display = 'none';
            finTimestamp = configActuelle.finTimestamp;
            lancerExamen();
            return;
        }
        var h = Math.floor(reste / 3600000);
        var m = Math.floor((reste % 3600000) / 60000);
        var s = Math.floor((reste % 60000) / 1000);
        if (timerDebutEl) {
            timerDebutEl.textContent = pad(h)+':'+pad(m)+':'+pad(s);
        }
    }, 1000);
}

async function lancerExamen() {
    enExamen = true;
    salleAttenteEl.style.display                       = 'none';
    questionsEl.style.display                          = 'block';
    document.querySelector('.footer').style.display    = 'flex';
    document.querySelector('.header').style.display    = 'flex';
    document.querySelector('.subheader').style.display = 'flex';
    if (attenteEl)  attenteEl.style.display  = 'none';
    if (resultatEl) resultatEl.style.display = 'none';

    if (nomConcoursEl) {
        nomConcoursEl.textContent = configActuelle.type || 'Concours Blanc Bonogo';
    }
    var dureeMs  = configActuelle.finTimestamp - configActuelle.debutTimestamp;
    var dureeMin = Math.round(dureeMs / 60000);
    if (heureConcoursEl) {
        heureConcoursEl.textContent = 'Duree : ' + dureeMin + ' min';
    }

    // Vérifier session
    var sessionSnap = await db.ref('sessions/' + user).once('value');
    var session     = sessionSnap.val();

    if (session && session.finTimestamp === finTimestamp && !session.termine) {
        reponsesUser = session.reponses || {};
        nbSorties    = session.nbSorties || 0;

        // Reconvertir tableaux Firebase
        var repConverti = {};
        Object.keys(reponsesUser).forEach(function(qi) {
            var val = reponsesUser[qi];
            if (val !== null && val !== undefined) {
                if (typeof val === 'object' && !Array.isArray(val)) {
                    repConverti[qi] = Object.values(val);
                } else {
                    repConverti[qi] = val;
                }
            }
        });
        reponsesUser = repConverti;

        if (session.bloque || nbSorties >= MAX_SORTIES) {
            afficherBlocageDevourAvecAttente();
            return;
        }

        if (nbSorties > 0) {
            modalTitreEl.textContent = 'Reprise de session';
            modalTexteEl.innerHTML = '<div style="text-align:center;padding:10px 0">'
                + '<div style="font-size:40px;margin-bottom:12px">📋</div>'
                + '<p style="font-weight:700;margin-bottom:10px">'
                + 'Ton concours a ete interrompu.</p>'
                + '<p style="color:var(--muted);font-size:13px;'
                + 'line-height:1.6;margin-bottom:14px">'
                + 'Tes reponses sont sauvegardees.<br>'
                + 'Tu reprends exactement ou tu t\'es arrete(e).</p>'
                + '<div style="background:rgba(239,68,68,0.1);'
                + 'border:1.5px solid rgba(239,68,68,0.3);'
                + 'border-radius:12px;padding:12px;">'
                + '<span style="color:var(--red);font-weight:800;font-size:14px">'
                + 'Sorties : ' + nbSorties + ' / ' + MAX_SORTIES + '</span><br>'
                + '<span style="color:var(--muted);font-size:12px">'
                + 'A la ' + MAX_SORTIES + 'eme sortie, '
                + 'ton devoir sera suspendu.</span>'
                + '</div></div>';
            modalEl.style.display      = 'flex';
            btnConfirmer.style.display = 'none';
            btnAnnuler.textContent     = 'Reprendre le concours';
            btnAnnuler.onclick = function() {
                modalEl.style.display      = 'none';
                btnConfirmer.style.display = '';
                btnAnnuler.textContent     = 'Annuler';
                continuerExamen();
            };
        } else {
            continuerExamen();
        }
    } else {
        reponsesUser = {};
        nbSorties    = 0;
        await db.ref('sessions/' + user).set({
            debutTimestamp: Date.now(),
            finTimestamp:   finTimestamp,
            reponses:       {},
            nbSorties:      0,
            termine:        false,
            bloque:         false
        });
        continuerExamen();
    }
}

function continuerExamen() {
    alertesTimer = { 30: false, 20: false, 10: false, 5: false };
    afficherQuestions();
    demarrerTimer();
    demarrerAntiTriche();
}

function afficherQuestions() {
    questionsEl.innerHTML = '';
    questionsData.forEach(function(q, qi) {
        var block = document.createElement('div');
        block.className = 'question-block';
        block.id = 'q-' + qi;

        var html = '<div class="question-numero">Question '
            + (qi+1) + ' / ' + questionsData.length
            + '</div>'
            + '<div class="question-texte">' + (q.texte || '') + '</div>'
            + '<div class="reponses-liste">';

        (q.reponses || []).forEach(function(r, ri) {
            var repUser = reponsesUser[qi];
            var reponsesChoisies = repUser === undefined ? []
                : (Array.isArray(repUser) ? repUser : [repUser]);
            var sel = reponsesChoisies.indexOf(ri) !== -1;

            html += '<label class="' + (sel ? 'selected' : '')
                + '" data-q="' + qi + '" data-r="' + ri + '">'
                + '<input type="checkbox" ' + (sel ? 'checked' : '') + '>'
                + '<span>' + 'ABCD'[ri] + '. ' + (r.texte || '') + '</span>'
                + '</label>';
        });

        html += '</div>';
        block.innerHTML = html;

        // Toutes les cases cochables
        block.querySelectorAll('label').forEach(function(lbl) {
            lbl.onclick = function() {
                son('click');
                var q2 = parseInt(this.dataset.q);
                var r2 = parseInt(this.dataset.r);

                var current = [];
                if (Array.isArray(reponsesUser[q2])) {
                    current = reponsesUser[q2].slice();
                } else if (reponsesUser[q2] !== undefined) {
                    current = [reponsesUser[q2]];
                }

                var idx = current.indexOf(r2);
                if (idx === -1) {
                    current.push(r2);
                } else {
                    current.splice(idx, 1);
                }

                if (current.length > 0) {
                    reponsesUser[q2] = current;
                } else {
                    delete reponsesUser[q2];
                }

                block.querySelectorAll('label').forEach(function(l, li) {
                    var checked = current.indexOf(li) !== -1;
                    l.classList.toggle('selected', checked);
                    var cb = l.querySelector('input[type="checkbox"]');
                    if (cb) cb.checked = checked;
                });

                sauvegarderSession();
                majRestant();
            };
        });

        questionsEl.appendChild(block);
    });

    majRestant();
}

function majRestant() {
    var rep = 0;
    for (var i = 0; i < questionsData.length; i++) {
        var r = reponsesUser[i];
        if (r !== undefined && !(Array.isArray(r) && r.length === 0)) {
            rep++;
        }
    }
    if (restantEl) restantEl.textContent = rep + '/' + questionsData.length;
}

async function sauvegarderSession() {
    if (!copieSubmise && user) {
        await db.ref('sessions/' + user).update({
            reponses:  reponsesUser,
            nbSorties: nbSorties
        });
    }
}

function demarrerTimer() {
    if (timerInt) clearInterval(timerInt);
    timerInt = setInterval(async function() {
        var reste = finTimestamp - Date.now();
        if (reste <= 0) {
            clearInterval(timerInt);
            if (!copieSubmise) {
                toast('Temps ecoule ! Copie envoyee automatiquement', 'warning');
                await soumettreEtAttendre();
            }
            return;
        }

        var min = Math.floor(reste / 60000);
        var sec = Math.floor((reste % 60000) / 1000);
        if (timerEl) timerEl.textContent = min + ':' + pad(sec);

        if (!alertesTimer[30] && min === 30) {
            alertesTimer[30] = true;
            toast('Il reste 30 minutes', 'warning');
            son('alerte');
        }
        if (!alertesTimer[20] && min === 20) {
            alertesTimer[20] = true;
            toast('Il reste 20 minutes', 'warning');
            son('alerte');
        }
        if (!alertesTimer[10] && min === 10) {
            alertesTimer[10] = true;
            toast('Plus que 10 minutes !', 'error');
            son('alerte');
            if (timerEl) timerEl.classList.add('warning');
        }
        if (!alertesTimer[5] && min === 5) {
            alertesTimer[5] = true;
            toast('DERNIERES 5 MINUTES !', 'error');
            son('alerte');
        }
        if (reste <= 10000) son('countdown');
    }, 1000);
}

// ============================================
// FIN PARTIE 7A
// ============================================
// ============================================
// CONCOURS BLANC BONOGO - SCRIPT ORIGINAL
// PARTIE 7/10 — SECTION B — CORRIGÉE
// ============================================

var dernierMouvement = Date.now();

document.addEventListener('touchstart', function() {
    dernierMouvement = Date.now();
}, { passive: true });

document.addEventListener('touchmove', function() {
    dernierMouvement = Date.now();
}, { passive: true });

document.addEventListener('mousemove', function() {
    dernierMouvement = Date.now();
});

document.addEventListener('keydown', function() {
    dernierMouvement = Date.now();
});

document.addEventListener('click', function() {
    dernierMouvement = Date.now();
});

function demarrerAntiTriche() {
    document.addEventListener('visibilitychange', gererSortie);
    window.addEventListener('blur',  gererSortie);
    window.addEventListener('focus', gererRetour);
}

function gererSortie() {
    if (copieSubmise || devourBloque || !enExamen) return;

    if (document.hidden) {
        if (!sortieTimeout) {
            sortieTimeout = setTimeout(async function() {
                sortieTimeout = null;
                var inactivite = Date.now() - dernierMouvement;
                if (inactivite > 60000) return;

                nbSorties++;
                son('sortie');
                await sauvegarderSession();

                if (nbSorties >= MAX_SORTIES) {
                    afficherBlocageDevourAvecAttente();
                } else {
                    afficherAvertissementSortie();
                }
            }, 5000);
        }
    }
}

function gererRetour() {
    if (sortieTimeout) {
        clearTimeout(sortieTimeout);
        sortieTimeout = null;
    }
    dernierMouvement = Date.now();
    derniereFocus    = Date.now();
}

function afficherAvertissementSortie() {
    var restantes = MAX_SORTIES - nbSorties;

    var ancien = document.getElementById('avertissement-sortie');
    if (ancien && ancien.parentNode) {
        ancien.parentNode.removeChild(ancien);
    }

    var div = document.createElement('div');
    div.id  = 'avertissement-sortie';
    div.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;'
        + 'background:rgba(0,0,0,0.92);z-index:5000;'
        + 'display:flex;align-items:center;'
        + 'justify-content:center;padding:20px;';

    div.innerHTML = '<div style="background:var(--card);'
        + 'border:2px solid var(--red);border-radius:20px;'
        + 'padding:30px 24px;max-width:400px;width:100%;'
        + 'text-align:center;'
        + 'box-shadow:0 20px 60px rgba(239,68,68,0.3);">'
        + '<div style="font-size:50px;margin-bottom:16px">⚠️</div>'
        + '<h2 style="font-size:20px;font-weight:800;'
        + 'color:var(--red);margin-bottom:12px">'
        + 'Sortie detectee</h2>'
        + '<p style="color:var(--text);font-size:14px;'
        + 'font-weight:600;margin-bottom:8px">'
        + 'Tu as quitte la page de l\'examen.</p>'
        + '<p style="color:var(--muted);font-size:13px;'
        + 'line-height:1.6;margin-bottom:20px">'
        + 'Toute sortie est enregistree et peut entrainer '
        + 'la suspension de ton devoir.</p>'
        + '<div style="background:rgba(239,68,68,0.1);'
        + 'border:1.5px solid rgba(239,68,68,0.25);'
        + 'border-radius:12px;padding:14px;margin-bottom:20px">'
        + '<div style="font-size:13px;color:var(--muted);margin-bottom:6px">'
        + 'Sorties enregistrees</div>'
        + '<div style="font-size:28px;font-weight:900;color:var(--red);">'
        + nbSorties + ' / ' + MAX_SORTIES + '</div>'
        + '<div style="font-size:12px;color:var(--muted);margin-top:4px">'
        + restantes + ' sortie(s) restante(s) avant suspension</div>'
        + '</div>'
        + '<button id="btnReprendreExamen" '
        + 'style="width:100%;padding:16px;background:var(--green);'
        + 'color:white;border:none;border-radius:12px;'
        + 'font-family:Poppins,sans-serif;font-size:15px;'
        + 'font-weight:700;cursor:pointer;">'
        + 'Reprendre le concours</button>'
        + '</div>';

    document.body.appendChild(div);
    son('error');

    document.getElementById('btnReprendreExamen').onclick = function() {
        if (div.parentNode) div.parentNode.removeChild(div);
    };
}

function afficherBlocageDevourAvecAttente() {
    devourBloque = true;
    enExamen     = false;
    clearInterval(timerInt);

    var ancien = document.getElementById('avertissement-sortie');
    if (ancien && ancien.parentNode) {
        ancien.parentNode.removeChild(ancien);
    }

    questionsEl.style.display                          = 'none';
    document.querySelector('.footer').style.display    = 'none';
    document.querySelector('.header').style.display    = 'none';
    document.querySelector('.subheader').style.display = 'none';

    db.ref('sessions/' + user).update({
        nbSorties: nbSorties,
        bloque:    true
    });

    var div = document.createElement('div');
    div.style.cssText = 'padding:40px 20px;text-align:center;margin-top:40px;';
    div.innerHTML = '<div style="font-size:60px;margin-bottom:20px">🚫</div>'
        + '<h2 style="color:var(--red);margin-bottom:14px;'
        + 'font-size:22px;font-weight:800;">Devoir suspendu</h2>'
        + '<p style="font-weight:700;margin-bottom:10px;font-size:15px;">'
        + 'Tu as atteint le nombre maximum de sorties ('
        + MAX_SORTIES + ').</p>'
        + '<p style="color:var(--muted);margin-bottom:8px;'
        + 'font-size:13px;line-height:1.6;">'
        + 'Tes reponses ont ete sauvegardees.<br>'
        + 'Ta note sera calculee a la fin du temps imparti.</p>'
        + '<div style="background:var(--card);'
        + 'border:2px solid var(--border);border-radius:16px;'
        + 'padding:16px;margin:20px auto;max-width:280px;">'
        + '<div style="font-size:12px;color:var(--muted);margin-bottom:6px;">'
        + 'Temps restant</div>'
        + '<div id="timerBlocage" class="timer-big" '
        + 'style="font-size:36px;">--:--</div>'
        + '</div>'
        + '<p style="color:var(--muted);font-size:12px;">'
        + 'Tu seras classe(e) avec tes reponses actuelles.</p>';

    pageExam.appendChild(div);
    son('error');

    var intv = setInterval(async function() {
        var reste = finTimestamp - Date.now();
        var tb = document.getElementById('timerBlocage');
        if (tb) {
            var min = Math.max(0, Math.floor(reste / 60000));
            var sec = Math.max(0, Math.floor((reste % 60000) / 1000));
            tb.textContent = pad(min) + ':' + pad(sec);
        }
        if (reste <= 0) {
            clearInterval(intv);
            await soumettreBloque();
        }
    }, 1000);
}

async function soumettreBloque() {
    if (copieSubmise) return;
    copieSubmise = true;

    var nbB = 0, nbP = 0, nbF = 0;
    var repFin = {};

    questionsData.forEach(function(q, qi) {
        var repUser = reponsesUser[qi];
        var bonnesReponses = [];
        (q.reponses || []).forEach(function(r, ri) {
            if (r.correct) bonnesReponses.push(ri);
        });

        if (repUser === undefined
            || (Array.isArray(repUser) && repUser.length === 0)) {
            nbF++;
            repFin[qi] = { user: [], bonnes: bonnesReponses, statut: 'vide' };
            return;
        }

        var reponsesChoisies = Array.isArray(repUser) ? repUser : [repUser];

        var toutessBonnes = bonnesReponses.every(function(b) {
            return reponsesChoisies.indexOf(b) !== -1;
        });
        var aucuneFausse = reponsesChoisies.every(function(r) {
            return bonnesReponses.indexOf(r) !== -1;
        });
        var auMoinsUneBonne = reponsesChoisies.some(function(r) {
            return bonnesReponses.indexOf(r) !== -1;
        });

        if (toutessBonnes && aucuneFausse) {
            nbB++;
            repFin[qi] = { user: reponsesChoisies, bonnes: bonnesReponses, statut: 'bonne' };
        } else if (auMoinsUneBonne && aucuneFausse) {
            nbP++;
            repFin[qi] = { user: reponsesChoisies, bonnes: bonnesReponses, statut: 'partielle' };
        } else {
            nbF++;
            repFin[qi] = { user: reponsesChoisies, bonnes: bonnesReponses, statut: 'fausse' };
        }
    });

    var scoreFinal = Math.round((nbB + nbP * 0.5) * 10) / 10;
    var xpGagneVal = calcXp(scoreFinal, questionsData.length);

    await db.ref('resultats/' + user).set({
        score: scoreFinal, total: questionsData.length,
        bonnes: nbB, partielles: nbP, fausses: nbF,
        xp: xpGagneVal, bloque: true, sorties: nbSorties,
        timestamp: Date.now(), pseudo: userDisplay,
        prenom: userData.prenom || '', nom: userData.nom || '',
        reponses: repFin
    });

    await db.ref('sessions/' + user).update({ termine: true });

    var histo = userData.historique || [];
    if (!Array.isArray(histo)) histo = Object.values(histo);
    histo.push({
        score: scoreFinal, total: questionsData.length,
        bonnes: nbB, partielles: nbP, fausses: nbF,
        xp: xpGagneVal, sorties: nbSorties,
        type: configActuelle.type || 'Concours Blanc Bonogo',
        timestamp: Date.now(), date: formatDate(Date.now())
    });

    await db.ref('users/' + user).update({ historique: histo });
    reponsesFinales = repFin;
    afficherResultat(scoreFinal, nbB, nbP, nbF, xpGagneVal);
}

// ============================================
// FIN PARTIE 7 COMPLETE ✅
// ============================================// ============================================
// CONCOURS BLANC BONOGO - SCRIPT ORIGINAL
// PARTIE 8/10 — SECTION A — FINALE
// ============================================

// === BOUTON NON RÉPONDU ===
if (btnNonRep) btnNonRep.onclick = function() {
    son('click');
    var nonRep = [];
    for (var i = 0; i < questionsData.length; i++) {
        var r = reponsesUser[i];
        if (r === undefined || (Array.isArray(r) && r.length === 0)) {
            nonRep.push(i);
        }
    }

    if (nonRep.length === 0) {
        toast('Toutes les questions sont repondues !', 'success');
        return;
    }

    // Scroll vers première non répondue
    var el = document.getElementById('q-' + nonRep[0]);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.border = '3px solid var(--yellow)';
        setTimeout(function() {
            el.style.border = '2px solid var(--border)';
        }, 2000);
    }

    modalTitreEl.textContent = 'Questions non repondues';
    var html = '<p style="margin-bottom:12px">Tu as '
        + '<b style="color:var(--yellow)">' + nonRep.length
        + '</b> question(s) sans reponse :</p>'
        + '<div style="display:flex;flex-wrap:wrap;gap:8px;'
        + 'max-height:200px;overflow-y:auto;'
        + 'background:var(--bg);padding:12px;border-radius:12px;">';

    nonRep.forEach(function(idx) {
        html += '<span onclick="scrollVersQuestion(' + idx + ')" '
            + 'style="background:var(--yellow);color:var(--bg);'
            + 'padding:6px 12px;border-radius:20px;'
            + 'font-weight:800;font-size:13px;cursor:pointer;">'
            + 'Q' + (idx + 1) + '</span>';
    });

    html += '</div>'
        + '<p style="margin-top:10px;font-size:12px;color:var(--muted);">'
        + 'Clique sur un numero pour y aller directement.</p>';

    modalTexteEl.innerHTML     = html;
    modalEl.style.display      = 'flex';
    btnConfirmer.style.display = 'none';
    btnAnnuler.textContent     = 'Fermer';
    btnAnnuler.onclick = function() {
        modalEl.style.display      = 'none';
        btnConfirmer.style.display = '';
        btnAnnuler.textContent     = 'Annuler';
    };
};

window.scrollVersQuestion = function(idx) {
    modalEl.style.display      = 'none';
    btnConfirmer.style.display = '';
    btnAnnuler.textContent     = 'Annuler';
    var el = document.getElementById('q-' + idx);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.border = '3px solid var(--yellow)';
        setTimeout(function() {
            el.style.border = '2px solid var(--border)';
        }, 2000);
    }
};

// === BOUTON TERMINER ===
if (btnFinir) btnFinir.onclick = function() {
    son('click');
    var rep = 0;
    for (var i = 0; i < questionsData.length; i++) {
        var r = reponsesUser[i];
        if (r !== undefined && !(Array.isArray(r) && r.length === 0)) rep++;
    }
    var total = questionsData.length;

    modalTitreEl.textContent = 'Terminer le concours';
    modalTexteEl.innerHTML = '<p>Tu as repondu a '
        + '<b style="color:var(--yellow)">' + rep + '/' + total
        + '</b> questions.</p>'
        + (rep < total
            ? '<p style="color:var(--orange);margin-top:8px;">'
            + 'Il reste <b>' + (total - rep)
            + '</b> question(s) sans reponse.</p>'
            : '<p style="color:var(--green);margin-top:8px;">'
            + 'Toutes les questions sont repondues !</p>')
        + '<p style="margin-top:12px;color:var(--muted);">'
        + 'Une fois soumis, tu ne pourras plus modifier tes reponses.</p>'
        + '<p style="margin-top:10px;font-weight:800">'
        + 'Confirmer la soumission ?</p>';
    modalEl.style.display = 'flex';

    btnConfirmer.onclick = async function() {
        modalEl.style.display = 'none';
        await soumettreEtAttendre();
    };
    btnAnnuler.onclick = function() {
        modalEl.style.display = 'none';
    };
};

// ============================================
// SOUMETTRE ET ATTENDRE
// Corrections :
// - Pas de double soumission même sans connexion
// - Timer local force soumission à la fin
// - Stats correctement mises à jour
// - Nouveau concours possible après
// ============================================
async function soumettreEtAttendre() {
    if (copieSubmise) return;
    copieSubmise = true;
    enExamen     = false;
    clearInterval(timerInt);

    // Arrêter anti-triche
    document.removeEventListener('visibilitychange', gererSortie);
    window.removeEventListener('blur',  gererSortie);
    window.removeEventListener('focus', gererRetour);

    // ============================================
    // CALCUL SCORE INTELLIGENT
    // 1 pt  = toutes bonnes + aucune fausse
    // 0.5pt = certaines bonnes + aucune fausse
    // 0 pt  = fausse cochée ou rien
    // ============================================
    var nbBonnes     = 0;
    var nbPartielles = 0;
    var nbFausses    = 0;
    reponsesFinales  = {};

    questionsData.forEach(function(q, qi) {
        var repUser = reponsesUser[qi];
        var bonnesReponses = [];
        (q.reponses || []).forEach(function(r, ri) {
            if (r.correct) bonnesReponses.push(ri);
        });

        if (repUser === undefined
            || (Array.isArray(repUser) && repUser.length === 0)) {
            nbFausses++;
            reponsesFinales[qi] = {
                user:   [],
                bonnes: bonnesReponses,
                statut: 'vide'
            };
            return;
        }

        var reponsesChoisies = Array.isArray(repUser) ? repUser : [repUser];

        var toutessBonnes = bonnesReponses.every(function(b) {
            return reponsesChoisies.indexOf(b) !== -1;
        });
        var aucuneFausse = reponsesChoisies.every(function(r) {
            return bonnesReponses.indexOf(r) !== -1;
        });
        var auMoinsUneBonne = reponsesChoisies.some(function(r) {
            return bonnesReponses.indexOf(r) !== -1;
        });

        if (toutessBonnes && aucuneFausse) {
            nbBonnes++;
            reponsesFinales[qi] = {
                user:   reponsesChoisies,
                bonnes: bonnesReponses,
                statut: 'bonne'
            };
        } else if (auMoinsUneBonne && aucuneFausse) {
            nbPartielles++;
            reponsesFinales[qi] = {
                user:   reponsesChoisies,
                bonnes: bonnesReponses,
                statut: 'partielle'
            };
        } else {
            nbFausses++;
            reponsesFinales[qi] = {
                user:   reponsesChoisies,
                bonnes: bonnesReponses,
                statut: 'fausse'
            };
        }
    });

    var scoreFinal = Math.round((nbBonnes + nbPartielles * 0.5) * 10) / 10;
    var xpGagneVal = calcXp(scoreFinal, questionsData.length);
    var pctVal     = getPct(scoreFinal, questionsData.length);
    var timestamp  = Date.now();

    // ============================================
    // SAUVEGARDER DANS FIREBASE
    // ============================================
    try {
        await db.ref('resultats/' + user).set({
            score:      scoreFinal,
            total:      questionsData.length,
            bonnes:     nbBonnes,
            partielles: nbPartielles,
            fausses:    nbFausses,
            xp:         xpGagneVal,
            timestamp:  timestamp,
            pseudo:     userDisplay,
            prenom:     userData.prenom || '',
            nom:        userData.nom    || '',
            sorties:    nbSorties,
            bloque:     false,
            reponses:   reponsesFinales
        });

        await db.ref('sessions/' + user).update({ termine: true });
    } catch(e) {
        // Pas de connexion → stocker localement et réessayer
        localStorage.setItem('bb_pending_result_' + user, JSON.stringify({
            score: scoreFinal, total: questionsData.length,
            bonnes: nbBonnes, partielles: nbPartielles,
            fausses: nbFausses, xp: xpGagneVal,
            timestamp: timestamp, pseudo: userDisplay,
            prenom: userData.prenom || '', nom: userData.nom || '',
            sorties: nbSorties, bloque: false,
            reponses: reponsesFinales
        }));
        toast('Connexion perdue. Resultat sauvegarde localement.', 'warning');
    }

    // ============================================
    // MISE À JOUR STATS UTILISATEUR
    // ============================================
    try {
        var newXp  = (userData.xp || 0) + xpGagneVal;
        var newNiv = niveau(newXp);
        var oldNiv = userData.niveau || 1;

        // Récupérer historique frais depuis Firebase
        var freshSnap = await db.ref('users/' + user + '/historique').once('value');
        var histo = freshSnap.val() || [];
        if (!Array.isArray(histo)) histo = Object.values(histo);

        histo.push({
            score:      scoreFinal,
            total:      questionsData.length,
            bonnes:     nbBonnes,
            partielles: nbPartielles,
            fausses:    nbFausses,
            xp:         xpGagneVal,
            sorties:    nbSorties,
            type:       configActuelle
                ? (configActuelle.type || 'Concours Blanc Bonogo')
                : 'Concours Blanc Bonogo',
            timestamp:  timestamp,
            date:       formatDate(timestamp),
            pct:        pctVal + '%'
        });

        // Recalculer moyenne sur tout l'historique
        var nbConcours    = histo.length;
        var totalScoreAll = 0;
        histo.forEach(function(h) {
            totalScoreAll += (typeof h.score === 'number') ? h.score : 0;
        });
        var newMoyenne = parseFloat((totalScoreAll / nbConcours).toFixed(1));

        var updates = {
            xp:            newXp,
            niveau:        newNiv,
            concoursFaits: nbConcours,
            totalScore:    totalScoreAll,
            moyenne:       newMoyenne,
            historique:    histo
        };

        // Vérification badges
        var badges = userData.badges || {};

        if (nbConcours === 1) {
            badges.premier = true;
            afficherBadgeAnimation('🎯', 'Premier Concours !');
            notifBadge('🎯', 'Premier Concours');
        }
        if (nbConcours >= 5 && !badges.assidu) {
            badges.assidu = true;
            afficherBadgeAnimation('📅', 'Assidu !');
            notifBadge('📅', 'Assidu - 5 concours passes');
        }
        if (scoreFinal === 50 && !badges.perfect) {
            badges.perfect = true;
            afficherBadgeAnimation('💯', 'Sans Faute !');
            notifBadge('💯', 'Sans Faute - 50/50 !');
        }
        if (newNiv >= 10 && !badges.niveau10) {
            badges.niveau10 = true;
            afficherBadgeAnimation('⭐', 'Niveau 10 !');
            notifBadge('⭐', 'Niveau 10 atteint');
        }
        if (nbSorties === 0 && !badges.resistant) {
            badges.resistant = true;
        }
        if (newMoyenne > 40 && !badges.elite) {
            badges.elite = true;
            afficherBadgeAnimation('👑', 'Elite !');
            notifBadge('👑', 'Elite - Moyenne > 40/50');
        }
        if ((userData.streak || 0) >= 7 && !badges.streak7) {
            badges.streak7 = true;
            afficherBadgeAnimation('🔥', 'Serie 7 jours !');
            notifBadge('🔥', 'Serie de 7 jours !');
        }
        if (configActuelle
            && (finTimestamp - timestamp) > 3600000
            && !badges.rapide) {
            badges.rapide = true;
            afficherBadgeAnimation('⚡', 'Eclair !');
            notifBadge('⚡', 'Termine 1h avant la fin');
        }

        updates.badges = badges;
        await db.ref('users/' + user).update(updates);
        userData = Object.assign(userData, updates);

        if (newNiv > oldNiv) {
            toast('NIVEAU ' + newNiv + ' ATTEINT !', 'success');
            son('niveau');
            notifBadge('⭐', 'Niveau ' + newNiv + ' atteint !');
        }

    } catch(e) {
        console.warn('Erreur mise a jour stats:', e);
    }

    // Top 10
    try {
        await verifierTop10(scoreFinal);
    } catch(e) {
        console.warn('Erreur top 10:', e);
    }

    // Afficher résultat ou attendre
    var now = Date.now();
    if (now < finTimestamp) {
        afficherAttente(scoreFinal, nbBonnes, nbPartielles, nbFausses, xpGagneVal);
    } else {
        afficherResultat(scoreFinal, nbBonnes, nbPartielles, nbFausses, xpGagneVal);
    }
}

// ============================================
// SOUMETTRE RÉSULTAT EN ATTENTE (hors connexion)
// Appelé automatiquement quand connexion revient
// ============================================
async function soumettreResultatEnAttente() {
    var key = 'bb_pending_result_' + user;
    var pending = localStorage.getItem(key);
    if (!pending) return;

    try {
        var res = JSON.parse(pending);
        // Vérifier si pas déjà soumis
        var snap = await db.ref('resultats/' + user).once('value');
        if (!snap.exists()) {
            await db.ref('resultats/' + user).set(res);
            await db.ref('sessions/' + user).update({ termine: true });
            toast('Resultat synchronise avec succes !', 'success');
        }
        localStorage.removeItem(key);
    } catch(e) {
        console.warn('Erreur sync resultat:', e);
    }
}

// Vérifier résultat en attente quand connexion revient
window.addEventListener('online', function() {
    if (user) {
        soumettreResultatEnAttente();
    }
});

// ============================================
// TOP 10 PERMANENT
// ============================================
async function verifierTop10(score) {
    var snap = await db.ref('top10Permanent').once('value');
    var top  = [];
    snap.forEach(function(child) {
        top.push(Object.assign({ key: child.key }, child.val()));
    });
    top.sort(function(a, b) { return b.score - a.score; });

    var monIdx = top.findIndex(function(r) { return r.key === user; });

    if (monIdx >= 0) {
        if (score > top[monIdx].score) {
            await db.ref('top10Permanent/' + user).update({
                score: score,
                date:  formatDate(Date.now())
            });
        }
    } else if (top.length < 10
        || score > (top[top.length - 1] || { score: 0 }).score) {

        await db.ref('top10Permanent/' + user).set({
            score:  score,
            prenom: userData.prenom || '',
            nom:    userData.nom    || '',
            pseudo: userDisplay,
            date:   formatDate(Date.now())
        });

        if (top.length >= 10) {
            await db.ref('top10Permanent/' + top[top.length - 1].key).remove();
        }

        afficherBadgeAnimation('🌟', 'Top 10 Permanent !');
        notifBadge('🌟', 'Tu entres dans le Hall of Fame !');

        await db.ref('users/' + user).update({
            top10All:          true,
            'badges/top10all': true
        });
        userData.badges          = userData.badges || {};
        userData.badges.top10all = true;
    }
}

// ============================================
// FIN PARTIE 8A COMPLETE ✅
// ============================================// ============================================
// CONCOURS BLANC BONOGO - SCRIPT ORIGINAL
// PARTIE 8/10 — SECTION B — FINALE
// ============================================

// ============================================
// TIMER LOCAL DE SÉCURITÉ
// Force la soumission même sans connexion
// ============================================
function demarrerTimerSecurite() {
    // Vérifier toutes les 10 secondes si le temps est écoulé
    var timerSecurite = setInterval(async function() {
        if (!enExamen && !copieSubmise) {
            // Pas en examen et pas soumis → vérifier si temps écoulé
            if (finTimestamp > 0 && Date.now() >= finTimestamp) {
                clearInterval(timerSecurite);
            }
            return;
        }

        if (copieSubmise) {
            clearInterval(timerSecurite);
            return;
        }

        var now = Date.now();
        if (finTimestamp > 0 && now >= finTimestamp) {
            clearInterval(timerSecurite);
            if (!copieSubmise) {
                // Forcer soumission même sans connexion
                copieSubmise = true;
                enExamen     = false;
                clearInterval(timerInt);

                // Stocker localement si pas de connexion
                var timestamp = now;
                var nbB = 0, nbP = 0, nbF = 0;
                var repFin = {};

                questionsData.forEach(function(q, qi) {
                    var repUser = reponsesUser[qi];
                    var bonnesReponses = [];
                    (q.reponses || []).forEach(function(r, ri) {
                        if (r.correct) bonnesReponses.push(ri);
                    });

                    if (repUser === undefined
                        || (Array.isArray(repUser) && repUser.length === 0)) {
                        nbF++;
                        repFin[qi] = { user: [], bonnes: bonnesReponses, statut: 'vide' };
                        return;
                    }

                    var reponsesChoisies = Array.isArray(repUser)
                        ? repUser : [repUser];

                    var toutessBonnes = bonnesReponses.every(function(b) {
                        return reponsesChoisies.indexOf(b) !== -1;
                    });
                    var aucuneFausse = reponsesChoisies.every(function(r) {
                        return bonnesReponses.indexOf(r) !== -1;
                    });
                    var auMoinsUneBonne = reponsesChoisies.some(function(r) {
                        return bonnesReponses.indexOf(r) !== -1;
                    });

                    if (toutessBonnes && aucuneFausse) {
                        nbB++;
                        repFin[qi] = { user: reponsesChoisies, bonnes: bonnesReponses, statut: 'bonne' };
                    } else if (auMoinsUneBonne && aucuneFausse) {
                        nbP++;
                        repFin[qi] = { user: reponsesChoisies, bonnes: bonnesReponses, statut: 'partielle' };
                    } else {
                        nbF++;
                        repFin[qi] = { user: reponsesChoisies, bonnes: bonnesReponses, statut: 'fausse' };
                    }
                });

                var scoreFinal = Math.round((nbB + nbP * 0.5) * 10) / 10;
                var xpGagneVal = calcXp(scoreFinal, questionsData.length || 50);

                // Stocker localement
                localStorage.setItem('bb_pending_result_' + user, JSON.stringify({
                    score: scoreFinal, total: questionsData.length,
                    bonnes: nbB, partielles: nbP, fausses: nbF,
                    xp: xpGagneVal, timestamp: timestamp,
                    pseudo: userDisplay,
                    prenom: userData.prenom || '',
                    nom:    userData.nom    || '',
                    sorties: nbSorties, bloque: false,
                    reponses: repFin
                }));

                reponsesFinales = repFin;

                // Essayer Firebase
                try {
                    await db.ref('resultats/' + user).set({
                        score: scoreFinal, total: questionsData.length,
                        bonnes: nbB, partielles: nbP, fausses: nbF,
                        xp: xpGagneVal, timestamp: timestamp,
                        pseudo: userDisplay,
                        prenom: userData.prenom || '',
                        nom:    userData.nom    || '',
                        sorties: nbSorties, bloque: false,
                        reponses: repFin
                    });
                    await db.ref('sessions/' + user).update({ termine: true });
                    localStorage.removeItem('bb_pending_result_' + user);
                } catch(e) {
                    toast('Connexion perdue. Resultat sauvegarde.', 'warning');
                }

                afficherResultat(scoreFinal, nbB, nbP, nbF, xpGagneVal);
            }
        }
    }, 10000);
}

// ============================================
// VÉRIFICATION AU DÉMARRAGE
// Si résultat en attente → synchroniser
// Si nouveau concours → ne pas bloquer
// ============================================
async function verifierEtatAuDemarrage() {
    if (!user) return;

    // Synchroniser résultat en attente
    await soumettreResultatEnAttente();

    // Vérifier si config concours a changé
    var configSnap = await db.ref('configConcours').once('value');
    var config = configSnap.val();
    if (!config) return;

    var now = Date.now();

    // Si concours terminé → nettoyer session locale
    if (now > config.finTimestamp) {
        // Vérifier si résultat existe
        var resSnap = await db.ref('resultats/' + user).once('value');
        if (!resSnap.exists()) {
            // Pas de résultat → soumettre ce qu'on a en local
            var pending = localStorage.getItem('bb_pending_result_' + user);
            if (pending) {
                try {
                    var res = JSON.parse(pending);
                    await db.ref('resultats/' + user).set(res);
                    await db.ref('sessions/' + user).update({ termine: true });
                    localStorage.removeItem('bb_pending_result_' + user);
                    toast('Resultat synchronise !', 'success');
                } catch(e) {}
            }
        }
    }
}

// Appeler au login
async function autoLogin(savedKey) {
    try {
        var snap = await db.ref('users/' + savedKey).once('value');
        if (!snap.exists()) {
            localStorage.removeItem('bb_user'); return;
        }
        var d       = snap.val();
        user        = savedKey;
        userDisplay = (d.prenom || '') + ' ' + (d.nom || '');
        userData    = d;
        startPresence();
        chargerMenu(d);

        // Vérifier état au démarrage
        setTimeout(verifierEtatAuDemarrage, 1000);
    } catch(e) {
        localStorage.removeItem('bb_user');
    }
}

// ============================================
// NOUVEAU CONCOURS — PAS DE BLOCAGE
// L'admin lance un nouveau concours →
// les anciens résultats sont effacés →
// les candidats peuvent repasser
// ============================================
db.ref('resultats/' + (user || 'none')).on('value', function(snap) {
    // Si résultat supprimé par admin (nouveau concours)
    // et que le candidat est sur la page menu → rien à faire
    // Il pourra relancer normalement
});

// Écouter suppression résultat (nouveau concours admin)
db.ref('resultats').on('child_removed', function(snap) {
    if (snap.key === user) {
        // Mon résultat a été supprimé → nouveau concours
        copieSubmise = false;
        toast('Nouveau concours disponible !', 'success');
        son('success');
    }
});

// ============================================
// FIN PARTIE 8B COMPLETE ✅
// ============================================// ============================================
// CONCOURS BLANC BONOGO - SCRIPT ORIGINAL
// PARTIE 9/10 — SECTION A
// ============================================

function afficherAttente(score, bonnes, partielles, fausses, xpG) {
    questionsEl.style.display                          = 'none';
    document.querySelector('.footer').style.display    = 'none';
    document.querySelector('.header').style.display    = 'none';
    document.querySelector('.subheader').style.display = 'none';
    if (attenteEl) attenteEl.style.display = 'block';

    var intv = setInterval(function() {
        var reste = finTimestamp - Date.now();
        if (reste <= 0) {
            clearInterval(intv);
            if (attenteEl) attenteEl.style.display = 'none';
            afficherResultat(score, bonnes, partielles, fausses, xpG);
            return;
        }
        var min = Math.floor(reste / 60000);
        var sec = Math.floor((reste % 60000) / 1000);
        if (timerAttenteEl) timerAttenteEl.textContent = min + ':' + pad(sec);
    }, 1000);
}

async function afficherResultat(score, bonnes, partiel, fausses, xpG) {
    if (attenteEl)  attenteEl.style.display  = 'none';
    questionsEl.style.display                           = 'none';
    document.querySelector('.footer').style.display     = 'none';
    document.querySelector('.header').style.display     = 'flex';
    document.querySelector('.subheader').style.display  = 'none';
    if (resultatEl) resultatEl.style.display = 'block';

    var total = questionsData.length || 50;
    var pct   = getPct(score, total);

    if (scoreEl)           scoreEl.textContent          = score + '/' + total;
    if (xpGagneEl)         xpGagneEl.textContent        = xpG;
    if (bonnesEl)          bonnesEl.textContent          = bonnes;
    if (partiellesEl)      partiellesEl.textContent      = partiel;
    if (faussesEl)         faussesEl.textContent         = fausses;
    if (mentionResultatEl) mentionResultatEl.textContent = getMention(score);

    if (sortiesInfoEl) {
        if (nbSorties > 0) {
            sortiesInfoEl.style.display = 'block';
            sortiesInfoEl.textContent   = nbSorties + ' sortie(s) detectee(s)';
        } else {
            sortiesInfoEl.style.display = 'none';
        }
    }

    if (timerEl) {
        timerEl.textContent      = pct + '%';
        timerEl.style.background = pct >= 60 ? 'var(--green)'
                                 : pct >= 40 ? 'var(--orange)' : 'var(--red)';
        timerEl.classList.remove('warning');
    }
    if (nomConcoursEl) nomConcoursEl.textContent = 'Resultats';

    // Notification résultat
    notifResultatDisponible(score, total);

    if (monRangResEl) {
        monRangResEl.textContent = '';
        try {
            var snap    = await db.ref('resultats').orderByChild('score').once('value');
            var results = [];
            snap.forEach(function(child) {
                results.push(Object.assign({ key: child.key }, child.val()));
            });
            results.sort(function(a, b) {
                return b.score - a.score || a.timestamp - b.timestamp;
            });
            var monRang = results.findIndex(function(r) { return r.key === user; });
            if (monRang >= 0) {
                monRangResEl.textContent = 'Rang : #' + (monRang+1) + ' / ' + results.length;
                if (monRang < 3) {
                    await db.ref('users/' + user + '/badges/top3').set(true);
                    userData.badges      = userData.badges || {};
                    userData.badges.top3 = true;
                }
                if (monRang === 0) son('top1');
            }
        } catch(e) {}
    }

    son('success');
}

// ============================================
// BOUTON CORRECTION + PDF
// ============================================
if (btnCorrection) btnCorrection.onclick = function() {
    son('click');

    if (correctionEl.innerHTML !== '') {
        correctionEl.innerHTML    = '';
        btnCorrection.textContent = '📖 Correction';
        return;
    }

    btnCorrection.textContent = '❌ Masquer';
    var html = '';

    questionsData.forEach(function(q, qi) {
        var info        = reponsesFinales[qi] || {};
        var statut      = info.statut || 'vide';
        var userRep     = info.user   || [];
        var bonnesRep   = info.bonnes || [];
        var explication = q.explication || '';

        if (!Array.isArray(userRep))   userRep   = [userRep];
        if (!Array.isArray(bonnesRep)) bonnesRep = [bonnesRep];

        var cls = statut === 'bonne'     ? 'correct'
                : statut === 'partielle' ? 'partiel'
                : statut === 'fausse'    ? 'incorrect' : 'vide';

        var ico = statut === 'bonne'     ? '✅'
                : statut === 'partielle' ? '⚠️'
                : statut === 'fausse'    ? '❌' : '⬜';

        var nbBonnesAttendues = bonnesRep.length;

        html += '<div class="question-correction ' + cls + '">'
            + '<div class="corr-entete">'
            + '<span class="corr-num">Q' + (qi+1) + '</span>'
            + '<span class="corr-ico">' + ico + '</span>'
            + (nbBonnesAttendues > 1
                ? '<span style="font-size:10px;background:var(--orange);'
                + 'color:white;padding:2px 8px;border-radius:10px;margin-left:8px">'
                + nbBonnesAttendues + ' rep. attendues</span>'
                : '')
            + '</div>'
            + '<div class="corr-question">' + (q.texte || '') + '</div>';

        (q.reponses || []).forEach(function(r, ri) {
            var estBonne   = bonnesRep.indexOf(ri) !== -1;
            var estChoisie = userRep.indexOf(ri)   !== -1;
            var repCls = '', prefix = '';

            if (estBonne && estChoisie)       { repCls = 'cr-user-bon';   prefix = '✅ '; }
            else if (estBonne && !estChoisie) { repCls = 'cr-bonne';      prefix = '✅ '; }
            else if (!estBonne && estChoisie) { repCls = 'cr-user-faux';  prefix = '❌ '; }

            html += '<div class="corr-rep-ligne ' + repCls + '">'
                + '<div class="corr-bulle-sm">' + 'ABCD'[ri] + '</div>'
                + '<span>' + prefix + (r.texte || '') + '</span>'
                + '</div>';
        });

        if (explication) {
            html += '<div class="corr-explication">'
                + '<span class="corr-explication-titre">💡 Explication</span>'
                + explication
                + '</div>';
        }

        html += '</div>';
    });

    correctionEl.innerHTML = html;

    // Bouton PDF
    var btnPdf = document.createElement('button');
    btnPdf.className = 'btn-green';
    btnPdf.style.cssText = 'margin:16px 0 30px;';
    btnPdf.innerHTML = '📄 Telecharger la correction en PDF';
    btnPdf.onclick = function() { telechargerCorrectionPDF(); };
    correctionEl.appendChild(btnPdf);

    correctionEl.scrollIntoView({ behavior: 'smooth' });
};

// ============================================
// FIN PARTIE 9A
// ============================================// ============================================
// CONCOURS BLANC BONOGO - SCRIPT ORIGINAL
// PARTIE 9/10 — SECTION B
// ============================================

function telechargerCorrectionPDF() {
    son('click');

    var scoreFinal   = scoreEl ? scoreEl.textContent : '?';
    var dateAuj      = formatDate(Date.now());
    var nomCandidat  = userDisplay || 'Candidat';
    var typeConcours = configActuelle
        ? (configActuelle.type || 'Concours Blanc Bonogo')
        : 'Concours Blanc Bonogo';

    var nbB = bonnesEl     ? bonnesEl.textContent     : '0';
    var nbP = partiellesEl ? partiellesEl.textContent : '0';
    var nbF = faussesEl    ? faussesEl.textContent    : '0';

    var contenu = '<!DOCTYPE html><html lang="fr"><head>'
        + '<meta charset="UTF-8">'
        + '<title>Correction - ' + nomCandidat + '</title>'
        + '<style>'
        + 'body{font-family:Arial,sans-serif;color:#1e293b;padding:30px;font-size:13px;max-width:800px;margin:0 auto;}'
        + 'h1{color:#0a0f1e;font-size:22px;text-align:center;margin-bottom:4px;}'
        + 'h2{color:#334155;font-size:14px;text-align:center;margin-bottom:6px;font-weight:normal;}'
        + '.info{text-align:center;margin-bottom:20px;color:#64748b;font-size:12px;border-bottom:2px solid #e2e8f0;padding-bottom:14px;}'
        + '.score-box{text-align:center;background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:24px;}'
        + '.score-num{font-size:36px;font-weight:900;color:#eab308;}'
        + '.stats-row{display:flex;justify-content:center;gap:20px;margin-top:8px;font-size:13px;}'
        + '.q-block{margin-bottom:16px;border-radius:10px;padding:14px;border-left:5px solid #94a3b8;background:#f8fafc;page-break-inside:avoid;}'
        + '.q-block.correct  {border-left-color:#22c55e;background:#f0fdf4;}'
        + '.q-block.incorrect{border-left-color:#ef4444;background:#fef2f2;}'
        + '.q-block.partiel  {border-left-color:#f97316;background:#fff7ed;}'
        + '.q-block.vide     {border-left-color:#94a3b8;background:#f8fafc;}'
        + '.q-num{font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;}'
        + '.q-texte{font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;line-height:1.5;}'
        + '.rep{font-size:12px;padding:5px 8px;border-radius:6px;margin-bottom:4px;display:flex;align-items:flex-start;gap:6px;}'
        + '.rep.bon           {background:#dcfce7;color:#166534;font-weight:700;}'
        + '.rep.faux          {background:#fee2e2;color:#991b1b;font-weight:700;}'
        + '.rep.bonne-manquee {background:#dcfce7;color:#166534;}'
        + '.rep.neutre        {color:#64748b;}'
        + '.rep-bulle{width:20px;min-width:20px;height:20px;border-radius:50%;background:#e2e8f0;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;}'
        + '.explication{margin-top:10px;padding:10px 12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;font-size:12px;color:#1e40af;line-height:1.6;}'
        + '.expl-titre{font-weight:800;font-size:10px;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px;display:block;}'
        + '.footer{text-align:center;margin-top:30px;padding-top:14px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;}'
        + '@media print{body{padding:15px;}.q-block{page-break-inside:avoid;}}'
        + '</style></head><body>';

    contenu += '<h1>Concours Blanc Bonogo</h1>'
        + '<h2>' + typeConcours + '</h2>'
        + '<div class="info">Candidat : <b>' + nomCandidat + '</b>'
        + ' &nbsp;|&nbsp; Date : <b>' + dateAuj + '</b></div>';

    contenu += '<div class="score-box">'
        + '<div style="font-size:13px;color:#64748b;margin-bottom:6px">Score final</div>'
        + '<div class="score-num">' + scoreFinal + '</div>'
        + '<div class="stats-row">'
        + '<span style="color:#22c55e">✅ ' + nbB + ' bonne(s)</span>'
        + '<span style="color:#f97316">⚠️ ' + nbP + ' partielle(s)</span>'
        + '<span style="color:#ef4444">❌ ' + nbF + ' fausse(s)</span>'
        + '</div>'
        + (nbSorties > 0
            ? '<div style="color:#f97316;font-size:12px;margin-top:8px">'
            + nbSorties + ' sortie(s) detectee(s)</div>' : '')
        + '</div>';

    contenu += '<div style="font-weight:800;font-size:15px;margin-bottom:14px">'
        + 'Correction detaillee</div>';

    questionsData.forEach(function(q, qi) {
        var info        = reponsesFinales[qi] || {};
        var statut      = info.statut || 'vide';
        var userRep     = info.user   || [];
        var bonnesRep   = info.bonnes || [];
        var explication = q.explication || '';

        if (!Array.isArray(userRep))   userRep   = [userRep];
        if (!Array.isArray(bonnesRep)) bonnesRep = [bonnesRep];

        var cls = statut === 'bonne'     ? 'correct'
                : statut === 'partielle' ? 'partiel'
                : statut === 'fausse'    ? 'incorrect' : 'vide';

        var ico = statut === 'bonne'     ? '✅ Bonne reponse'
                : statut === 'partielle' ? '⚠️ Reponse partielle'
                : statut === 'fausse'    ? '❌ Mauvaise reponse'
                : '⬜ Non repondu';

        var nbBonnesAttendues = bonnesRep.length;

        contenu += '<div class="q-block ' + cls + '">'
            + '<div class="q-num">Question ' + (qi+1) + ' / ' + questionsData.length
            + ' — ' + ico
            + (nbBonnesAttendues > 1
                ? ' (' + nbBonnesAttendues + ' reponses attendues)' : '')
            + '</div>'
            + '<div class="q-texte">' + (q.texte || '') + '</div>';

        (q.reponses || []).forEach(function(r, ri) {
            var estBonne   = bonnesRep.indexOf(ri) !== -1;
            var estChoisie = userRep.indexOf(ri)   !== -1;
            var repClass = 'neutre', prefix = '';

            if (estBonne && estChoisie)       { repClass = 'bon';           prefix = '✅ '; }
            else if (estBonne && !estChoisie) { repClass = 'bonne-manquee'; prefix = '✅ '; }
            else if (!estBonne && estChoisie) { repClass = 'faux';          prefix = '❌ '; }

            contenu += '<div class="rep ' + repClass + '">'
                + '<span class="rep-bulle">' + 'ABCD'[ri] + '</span>'
                + '<span>' + prefix + (r.texte || '') + '</span>'
                + '</div>';
        });

        if (explication) {
            contenu += '<div class="explication">'
                + '<span class="expl-titre">💡 Explication</span>'
                + explication + '</div>';
        }

        contenu += '</div>';
    });

    contenu += '<div class="footer">Concours Blanc Bonogo &nbsp;|&nbsp; '
        + 'Document genere le ' + dateAuj + '<br>'
        + 'Contact : 55 24 04 31 / 69 04 19 02'
        + '</div></body></html>';

    // Téléchargement mobile via Blob
    try {
        var blob = new Blob([contenu], { type: 'text/html;charset=utf-8' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        var nom  = 'correction_'
            + nomCandidat.replace(/ /g, '_')
            + '_' + Date.now() + '.html';

        a.href           = url;
        a.download       = nom;
        a.style.display  = 'none';
        document.body.appendChild(a);
        a.click();

        setTimeout(function() {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 1000);

        toast('Fichier telecharge ! Ouvre-le puis imprime en PDF', 'success');
        son('success');

    } catch(e) {
        var fenetre = window.open('', '_blank');
        if (fenetre) {
            fenetre.document.write(contenu);
            fenetre.document.close();
            setTimeout(function() { fenetre.print(); }, 600);
            toast('Choisis Enregistrer en PDF dans l\'impression', 'success');
        } else {
            toast('Autorise les telechargements dans ton navigateur', 'error');
        }
    }
}

// ============================================
// VOIR CLASSEMENT DEPUIS RÉSULTAT
// ============================================
if (btnVoirClass) btnVoirClass.onclick = function() {
    son('click');
    afficherClassementModal();
};

// ============================================
// RETOUR MENU DEPUIS RÉSULTAT
// ============================================
if (btnRetourMenu) btnRetourMenu.onclick = function() {
    son('click');
    enExamen = false;
    if (timerInt) clearInterval(timerInt);
    document.removeEventListener('visibilitychange', gererSortie);
    window.removeEventListener('blur',  gererSortie);
    window.removeEventListener('focus', gererRetour);
    correctionEl.innerHTML    = '';
    if (btnCorrection) btnCorrection.textContent = '📖 Correction';
    chargerMenu(userData);
};

// ============================================
// FIN PARTIE 9 COMPLETE ✅
// ============================================// ============================================
// CONCOURS BLANC BONOGO - SCRIPT ORIGINAL
// PARTIE 10/10 CORRIGÉE
// ============================================

function demanderPermissionNotif() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                toast('Notifications activees !', 'success');
            }
        });
    }
}

function envoyerNotif(titre, message) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    try {
        new Notification(titre, {
            body:    message,
            icon:    'https://em-content.zobj.net/source/microsoft-teams/363/flag-burkina-faso_1f1e7-1f1eb.png',
            vibrate: [200, 100, 200],
            tag:     'bonogo-notif'
        });
    } catch(e) {}
}

function notifResultatDisponible(score, total) {
    var pct = Math.round((score / total) * 100);
    envoyerNotif(
        'Ton resultat est disponible !',
        'Tu as obtenu ' + score + '/' + total + ' (' + pct + '%)'
    );
}

function notifBadge(emoji, nomBadge) {
    envoyerNotif(
        emoji + ' Badge obtenu !',
        'Felicitations ! Tu as debloque : ' + nomBadge
    );
}

// Timeouts notifications (pour les annuler si nécessaire)
var timeoutNotif5min  = null;
var timeoutNotifDebut = null;

function surveillerDebutConcours() {
    // Annuler anciens timeouts
    if (timeoutNotif5min)  clearTimeout(timeoutNotif5min);
    if (timeoutNotifDebut) clearTimeout(timeoutNotifDebut);

    db.ref('configConcours').once('value').then(function(snap) {
        var config = snap.val();
        if (!config || !config.debutTimestamp) return;

        var now     = Date.now();
        var debut   = config.debutTimestamp;
        var resteMs = debut - now;

        if (resteMs <= 0) return; // Concours déjà commencé

        // Notif 5 minutes avant
        var resteAvant5min = resteMs - 300000;
        if (resteAvant5min > 0) {
            timeoutNotif5min = setTimeout(function() {
                envoyerNotif(
                    'Concours dans 5 minutes !',
                    'Prepare-toi. Le concours Bonogo commence bientot.'
                );
                toast('Concours dans 5 minutes !', 'warning');
                son('alerte');
            }, resteAvant5min);
        } else if (resteMs > 0) {
            // Moins de 5 min restantes → notif immédiate
            envoyerNotif(
                'Concours bientot !',
                'Le concours commence dans moins de 5 minutes !'
            );
        }

        // Notif au démarrage exact
        timeoutNotifDebut = setTimeout(function() {
            envoyerNotif(
                'Le concours commence !',
                'Ouvre l\'application maintenant pour commencer.'
            );
            toast('Le concours a commence !', 'success');
            son('alerte');
        }, resteMs);
    });
}

function chargerMenu(d) {
    var p = d.prenom || '';
    var n = d.nom    || '';
    if (nomMenuEl)    nomMenuEl.textContent    = 'Bonjour, ' + p + ' ' + n + ' !';
    if (avatarMenuEl) avatarMenuEl.textContent = initiales(p, n);
    if (nivEl)        nivEl.textContent        = d.niveau || 1;
    if (xpEl)         xpEl.textContent         = d.xp || 0;
    if (streakEl)     streakEl.textContent     = (d.streak || 0) + 'j';
    showPage(pageMenu);
    demanderPermissionNotif();
    surveillerDebutConcours();
}

function startPresence() {
    if (presenceRef) presenceRef.remove();
    presenceRef = db.ref('online/' + user);
    presenceRef.set({
        nom: userDisplay,
        ts:  firebase.database.ServerValue.TIMESTAMP
    });
    presenceRef.onDisconnect().remove();
    demanderPermissionNotif();
}

// Auto-save
setInterval(async function() {
    if (enExamen && !copieSubmise && user
        && Object.keys(reponsesUser).length > 0) {
        await sauvegarderSession();
    }
}, 30000);

db.ref('configConcours').on('value', function(snap) {
    var config = snap.val();
    if (!config) return;
    if (nomConcoursEl && enExamen) {
        nomConcoursEl.textContent = config.type || 'Concours Blanc Bonogo';
    }
});

db.ref('sujetActuel').on('value', function(snap) {
    var data = snap.val();
    if (data && Array.isArray(data) && !enExamen) {
        questionsData = data;
    }
});

window.addEventListener('beforeunload', function(e) {
    if (enExamen && !copieSubmise) {
        e.preventDefault();
        e.returnValue = 'Tu es en plein concours !';
        return e.returnValue;
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape'
        && modalEl
        && modalEl.style.display !== 'none') {
        modalEl.style.display      = 'none';
        btnConfirmer.style.display = '';
        btnAnnuler.textContent     = 'Annuler';
    }
});

async function rafraichirUser() {
    if (!user) return;
    var snap = await db.ref('users/' + user).once('value');
    if (snap.exists()) {
        userData = snap.val();
        chargerMenu(userData);
    }
}

console.log('Concours Blanc Bonogo — Script charge');

// ============================================
// FIN PARTIE 10 COMPLETE ✅
// ============================================
