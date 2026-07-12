// ============================================
// CONCOURS BLANC BONOGO — SCRIPT COMPLET
// PARTIE 1/24 — FIREBASE + VARIABLES
// CORRIGÉ : chaque appareil se connecte
// automatiquement en anonyme à Firebase Auth,
// nécessaire pour que les nouvelles règles de
// sécurité par élève fonctionnent.
// ============================================

var firebaseConfig = {
    apiKey: "AIzaSyDQWFqTKRmEZtuBhRHWMDrGtwboOwLleI4",
    databaseURL:
        "https://quiz-pro-max-default-rtdb"
        + ".firebaseio.com"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.database();

// === CONNEXION ANONYME AUTOMATIQUE (NOUVEAU) ===
var _anonAuthPromise = null;
function assurerAuthAnonyme() {
    if (_anonAuthPromise) return _anonAuthPromise;
    _anonAuthPromise = new Promise(function(resolve) {
        var dejaResolu = false;
        firebase.auth().onAuthStateChanged(function(u) {
            if (u && !dejaResolu) { dejaResolu = true; resolve(u.uid); }
        });
        firebase.auth().signInAnonymously().catch(function(e) {
            console.log('Auth anonyme erreur:', e);
            if (!dejaResolu) { dejaResolu = true; resolve(null); }
        });
    });
    return _anonAuthPromise;
}
// Démarre la connexion dès le chargement du script
assurerAuthAnonyme();

var pageAccueil      = null;
var pageMenu         = null;
var pageAdminLogin   = null;
var pageExam         = null;
var pageAdmin        = null;
var pageHistorique   = null;
var pageStats        = null;
var pageEntrainement = null;
var pageQuizEntr     = null;
var pageResultatEntr = null;

function initDOM() {
    pageAccueil      = document.getElementById('page-accueil');
    pageMenu         = document.getElementById('page-menu');
    pageAdminLogin   = document.getElementById('page-admin-login');
    pageExam         = document.getElementById('page-exam');
    pageAdmin        = document.getElementById('page-admin');
    pageHistorique   = document.getElementById('page-historique');
    pageStats        = document.getElementById('page-stats');
    pageEntrainement = document.getElementById('page-entrainement');
    pageQuizEntr     = document.getElementById('page-quiz-entr');
    pageResultatEntr = document.getElementById('page-resultat-entr');
}

document.addEventListener('DOMContentLoaded', function() {
    initDOM();
});

window.addEventListener('load', function() {
    initDOM();
    var splash = document.getElementById('splash');

    function afficherPageAccueil() {
        initDOM();
        var toutesPages = [
            'page-accueil','page-menu','page-admin-login','page-exam',
            'page-admin','page-historique','page-stats','page-entrainement',
            'page-quiz-entr','page-resultat-entr'
        ];
        toutesPages.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        var acc = document.getElementById('page-accueil');
        if (acc) { acc.style.display = 'block'; pageAccueil = acc; }
        var fConn  = document.getElementById('formConnexion');
        var fInsc  = document.getElementById('formInscription');
        var fReset = document.getElementById('formReset');
        if (fConn)  fConn.style.display  = 'block';
        if (fInsc)  fInsc.style.display  = 'none';
        if (fReset) fReset.style.display = 'none';
        window.scrollTo(0, 0);
    }

    setTimeout(function() {
        if (splash) {
            splash.classList.add('hide');
            setTimeout(function() {
                if (splash && splash.parentNode)
                    splash.parentNode.removeChild(splash);
            }, 500);
        }
        var saved = localStorage.getItem('bb_user');
        if (saved) {
            afficherPageAccueil();
            setTimeout(function() { autoLogin(saved); }, 100);
        } else {
            afficherPageAccueil();
        }
    }, 2000);
});

var user        = null;
var userDisplay = '';
var userData    = {};

var questionsData   = [];
var reponsesUser    = {};
var reponsesFinales = {};
var finTimestamp    = 0;
var timerInt        = null;
var configActuelle  = null;
var salleActive     = '';

var nbSorties       = 0;
var MAX_SORTIES     = 4;
var sortieTimeout   = null;
var derniereFocus   = Date.now();
var enExamen        = false;
var DELAI_SORTIE_MS = 30000;

var _salleAntiTriche   = '';
var _resultNodeGlobal  = '';
var _sessionNodeGlobal = '';

var alertesTimer = { 30:false, 20:false, 10:false, 5:false };
var copieSubmise = false;
var presenceRef = null;
var audioCtx = null;
var jsonCumuleBepc = '';
var jsonCumuleBAC  = '';
var sujetBepc = [];
var sujetBAC  = [];
var countdownVraiConcours = null;
var timeoutNotif5min  = null;
var timeoutNotifDebut = null;
var timeoutNotif30min = null;
var swRegistration    = null;
var matiereActuelle   = '';
var questionsEntr     = [];
var indexQuestionEntr = 0;
var scoreEntr         = 0;
var statsEntrainement = {};
var sujetsEntrAdmin   = {};
var ongletActif       = 'bepc';
var QUESTIONS_PAR_ROUND = 6;

window._roundActuel     = 0;
window._debutRound      = 0;
window._finRound        = 0;
window._nbRoundsTotal   = 1;
window._matCourante     = null;
window._versionCourante = 0;
window._scoreRound      = 0;

function calculerPoidsReponses(question) {
    var bonnesIdx = [];
    if (!question || !question.reponses) return bonnesIdx;
    question.reponses.forEach(function(r, ri) {
        if (r && r.correct === true) bonnesIdx.push(ri);
    });
    var nb = bonnesIdx.length;
    if (nb === 0) return [];
    if (nb === 1) return [{idx:bonnesIdx[0], poids:1}];
    if (nb === 2) return bonnesIdx.map(function(ri) { return {idx:ri, poids:0.5}; });
    if (nb === 3) return bonnesIdx.map(function(ri, i) {
        return { idx: ri, poids: i === 0 ? 0.5 : 0.25 };
    });
    return bonnesIdx.map(function(ri) { return {idx:ri, poids:0.25}; });
}

var BADGES_LIST = [
    { id:'premier',   emoji:'🎯', nom:'Premier Concours', desc:'Passe ton 1er concours' },
    { id:'streak7',   emoji:'🔥', nom:'Série 7 jours',     desc:"Connecte-toi 7 jours d'affilée"},
    { id:'niveau10',  emoji:'⭐', nom:'Niveau 10',          desc:'Atteins le niveau 10' },
    { id:'perfect',   emoji:'💯', nom:'Sans Faute',         desc:'Obtiens 50/50' },
    { id:'rapide',    emoji:'⚡', nom:'Éclair',             desc:'Finis 1h avant la fin' },
    { id:'assidu',    emoji:'📅', nom:'Assidu',             desc:'Passe 5 concours' },
    { id:'elite',     emoji:'👑', nom:'Élite',              desc:'Moyenne supérieure à 40/50' },
    { id:'resistant', emoji:'🛡️', nom:'Résistant',          desc:'Aucune sortie détectée' },
    { id:'top3',      emoji:'🏅', nom:'Top 3',              desc:'Termine dans le top 3' },
    { id:'top10all',  emoji:'🌟', nom:'Légende Top 10',     desc:'Entre au Hall of Fame' }
];

var DATES_CONCOURS = [
    {nom:'ENSOA',   date:'2025-07-15', emoji:'🎖️'},
    {nom:'IDS',     date:'2025-08-10', emoji:'🏥'},
    {nom:'ENAM',    date:'2025-09-05', emoji:'⚖️'},
    {nom:'ENAREF',  date:'2025-10-20', emoji:'💼'},
    {nom:'DOUANES', date:'2025-11-15', emoji:'🛃'},
    {nom:'POLICE',  date:'2025-12-01', emoji:'👮'}
];

var MATIERES_ENTR = {
    bepc: [
        {id:'bepc_maths',    label:'Mathématiques',   emoji:'📐', css:'mat-maths'},
        {id:'bepc_francais', label:'Français',        emoji:'✍️', css:'mat-francais'},
        {id:'bepc_histgeo',  label:'Histoire-Géo',    emoji:'📜', css:'mat-histoire'},
        {id:'bepc_svt',      label:'SVT',             emoji:'🌿', css:'mat-svt'},
        {id:'bepc_pc',       label:'Physique-Chimie', emoji:'⚡', css:'mat-pc'},
        {id:'bepc_cg',       label:'Culture Générale',emoji:'🌐', css:'mat-cg'},
        {id:'bepc_actu',     label:'Actualités',      emoji:'📰', css:'mat-actu'},
        {id:'bepc_info',     label:'Schycotech',      emoji:'💻', css:'mat-info'}
    ],
    bac: [
        {id:'bac_maths',    label:'Mathématiques',    emoji:'📐', css:'mat-maths'},
        {id:'bac_francais', label:'Français',         emoji:'✍️', css:'mat-francais'},
        {id:'bac_histoire', label:'Histoire',         emoji:'📜', css:'mat-histoire'},
        {id:'bac_geo',      label:'Géographie',       emoji:'🌍', css:'mat-geo'},
        {id:'bac_svt',      label:'SVT',              emoji:'🌿', css:'mat-svt'},
        {id:'bac_pc',       label:'Physique-Chimie',  emoji:'⚡', css:'mat-pc'},
        {id:'bac_cg',       label:'Culture Générale', emoji:'🌐', css:'mat-cg'},
        {id:'bac_info',     label:'Schycotech',       emoji:'💻', css:'mat-info'},
        {id:'bac_philo',    label:'Philosophie',      emoji:'💭', css:'mat-philo'},
        {id:'bac_actu',     label:'Actualités',       emoji:'📰', css:'mat-actu'}
    ]
};
// ============================================
// FIN PARTIE 1/24 ✅ (CORRIGÉE — auth anonyme)
// ============================================// ============================================
// PARTIE 2/24 — RÉFÉRENCES DOM
// ============================================

// === ACCUEIL ===
var emailInput        = document.getElementById('email');
var mdpInput          = document.getElementById('mdp');
var erreurEl          = document.getElementById('erreur');
var btnLogin          = document.getElementById('btnLogin');
var formConnexion     = document.getElementById('formConnexion');
var formInscription   = document.getElementById('formInscription');
var formReset         = document.getElementById('formReset');
var nomInput          = document.getElementById('nom');
var prenomInput       = document.getElementById('prenom');
var emailInscription  = document.getElementById('emailInscription');
var mdpInscription    = document.getElementById('mdpInscription');
var erreurInscription = document.getElementById('erreurInscription');
var btnInscription    = document.getElementById('btnInscription');
var btnShowInscription= document.getElementById('btnShowInscription');
var btnShowConnexion  = document.getElementById('btnShowConnexion');
var btnShowReset      = document.getElementById('btnShowReset');
var emailReset        = document.getElementById('emailReset');
var nouveauMdp        = document.getElementById('nouveauMdp');
var erreurReset       = document.getElementById('erreurReset');
var btnReset          = document.getElementById('btnReset');
var btnRetourConnexion= document.getElementById('btnRetourConnexion');
var btnAdmin          = document.getElementById('btnAdmin');

// === MENU ===
var nomMenu           = document.getElementById('nomMenu');
var avatarMenu        = document.getElementById('avatarMenu');
var nivEl             = document.getElementById('niv');
var xpEl              = document.getElementById('xp');
var streakEl          = document.getElementById('streak');
var btnExam           = document.getElementById('btnExam');
var btnEntrainement   = document.getElementById('btnEntrainement');
var btnHistorique     = document.getElementById('btnHistorique');
var btnClassement     = document.getElementById('btnClassement');
var btnStats          = document.getElementById('btnStats');
var btnBadges         = document.getElementById('btnBadges');
var btnPartagerApp    = document.getElementById('btnPartagerApp');
var btnLogout         = document.getElementById('btnLogout');
var onlineCountMenu   = document.getElementById('onlineCountMenu');
var compteRebours     = document.getElementById('compteRebours');
var btnNotifMenu      = document.getElementById('btnNotifMenu');

// === ADMIN LOGIN ===
var adminPassEl       = document.getElementById('adminPass');
var erreurAdmin       = document.getElementById('erreurAdmin');
var btnLoginAdmin     = document.getElementById('btnLoginAdmin');
var btnRetour         = document.getElementById('btnRetour');

// === EXAMEN ===
var salleAttenteBepcEl= document.getElementById('salle-attente-bepc');
var salleAttenteBacEl = document.getElementById('salle-attente-bac');
var nomConcoursEl     = document.getElementById('nomConcours');
var heureConcoursEl   = document.getElementById('heureConcours');
var timerEl           = document.getElementById('timer');
var enLigneEl         = document.getElementById('enLigne');
var restantEl         = document.getElementById('restant');
var questionsEl       = document.getElementById('questions');
var btnNonRep         = document.getElementById('btnNonRep');
var btnFinir          = document.getElementById('btnFinir');
var attenteEl         = document.getElementById('attente');
var resultatEl        = document.getElementById('resultat');
var scoreEl           = document.getElementById('score');
var xpGagneEl         = document.getElementById('xpGagne');
var bonnesEl          = document.getElementById('bonnes');
var partiellesEl      = document.getElementById('partielles');
var faussesEl         = document.getElementById('fausses');
var mentionResultatEl = document.getElementById('mentionResultat');
var sortiesInfoEl     = document.getElementById('sortiesInfo');
var monRangResEl      = document.getElementById('monRangRes');
var btnCorrection     = document.getElementById('btnCorrection');
var correctionEl      = document.getElementById('correction');
var btnVoirClass      = document.getElementById('btnVoirClass');
var btnRetourMenu     = document.getElementById('btnRetourMenu');

// === ADMIN ===
var statusEl              = document.getElementById('status');
var statCandidatsEl       = document.getElementById('statCandidats');
var statConcoursEl        = document.getElementById('statConcours');
var statMoyEl             = document.getElementById('statMoy');
var statOnlineEl          = document.getElementById('statOnline');
var hDebutBepcEl          = document.getElementById('hDebutBepc');
var hFinBepcEl            = document.getElementById('hFinBepc');
var typeConcoursBepcEl    = document.getElementById('typeConcoursBepc');
var hDebutBAC_El          = document.getElementById('hDebutBAC');
var hFinBAC_El            = document.getElementById('hFinBAC');
var typeConcoursBAC_El    = document.getElementById('typeConcoursBAC');
var btnSaveConfigBepcEl   = document.getElementById('btnSaveConfigBepc');
var btnSaveConfigBAC_El   = document.getElementById('btnSaveConfigBAC');
var collerJSONBepcEl      = document.getElementById('collerJSONBepc');
var collerJSONBAC_El      = document.getElementById('collerJSONBAC');
var btnCharger50BepcEl    = document.getElementById('btnCharger50Bepc');
var btnCharger50BAC_El    = document.getElementById('btnCharger50BAC');
var btnEnvoyer50BepcEl    = document.getElementById('btnEnvoyer50Bepc');
var btnEnvoyer50BAC_El    = document.getElementById('btnEnvoyer50BAC');
var listeQuestionsBepcEl  = document.getElementById('listeQuestionsBepc');
var listeQuestionsBAC_El  = document.getElementById('listeQuestionsBAC');
var listeCandidatsEl      = document.getElementById('listeCandidats');
var btnActiverTousEl      = document.getElementById('btnActiverTous');
var btnNouveauConcoursEl  = document.getElementById('btnNouveauConcours');
var btnLogoutAdminEl      = document.getElementById('btnLogoutAdmin');
var btnAjouterQBepcEl     = document.getElementById('btnAjouterQBepc');
var btnAjouterQBAC_El     = document.getElementById('btnAjouterQBAC');
var btnSaveSujetBepcEl    = document.getElementById('btnSaveSujetBepc');
var btnSaveSujetBAC_El    = document.getElementById('btnSaveSujetBAC');
var btnAjouterPartieBepcEl= document.getElementById('btnAjouterPartieBepc');
var btnAjouterPartieBAC_El= document.getElementById('btnAjouterPartieBAC');
var btnViderZoneBepcEl    = document.getElementById('btnViderZoneBepc');
var btnViderZoneBAC_El    = document.getElementById('btnViderZoneBAC');

// === QUOTA (NOUVEAU — steppers + jauges) ===
var btnMoinsBepcEl    = document.getElementById('btnMoinsBepc');
var btnPlusBepcEl     = document.getElementById('btnPlusBepc');
var btnMoinsBAC_El    = document.getElementById('btnMoinsBAC');
var btnPlusBAC_El     = document.getElementById('btnPlusBAC');
var jaugeBepcEl       = document.getElementById('jaugeBepc');
var jaugeBAC_El       = document.getElementById('jaugeBAC');
var badgeRestantBepcEl= document.getElementById('badgeRestantBepc');
var badgeRestantBAC_El= document.getElementById('badgeRestantBAC');

// === MODAL ===
var modalEl       = document.getElementById('modal');
var modalTitreEl  = document.getElementById('modalTitre');
var modalTexteEl  = document.getElementById('modalTexte');
var btnConfirmer  = document.getElementById('btnConfirmer');
var btnAnnuler    = document.getElementById('btnAnnuler');
var modalChoixSalle = document.getElementById('modal-choix-salle');
var btnChoixBepc  = document.getElementById('btnChoixBepc');
var btnChoixBAC   = document.getElementById('btnChoixBAC');
var btnAnnulerChoixSalle = document.getElementById('btnAnnulerChoixSalle');

// === ENTRAÎNEMENT ===
var entrProgressGlobal = document.getElementById('entrProgressGlobal');
var entrScoreGlobal    = document.getElementById('entrScoreGlobal');
var grilleBepcEl       = document.getElementById('grilleBepc');
var grilleBacEl        = document.getElementById('grilleBac');
var btnRetourMenuEntr  = document.getElementById('btnRetourMenuEntr');
var btnRetourSalleAttenteBepc = document.getElementById('btnRetourSalleAttenteBepc');
var btnRetourSalleAttenteBac  = document.getElementById('btnRetourSalleAttenteBac');
var btnRetourSalleRetard      = document.getElementById('btnRetourSalleRetard');

// ============================================
// FIN PARTIE 2/24 ✅
// ============================================// ============================================
// PARTIE 3/24 — AUDIO + UTILITAIRES
// ============================================

function son(type) {
    try {
        if (!audioCtx)
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        if (type === 'click') {
            osc.frequency.value = 800; gain.gain.value = 0.1;
            osc.start(); osc.stop(audioCtx.currentTime + 0.05);
        } else if (type === 'success') {
            osc.frequency.value = 600; gain.gain.value = 0.15;
            osc.start(); osc.stop(audioCtx.currentTime + 0.2);
        } else if (type === 'error') {
            osc.frequency.value = 200; gain.gain.value = 0.2;
            osc.start(); osc.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'alerte') {
            osc.frequency.value = 440; gain.gain.value = 0.3;
            osc.start(); osc.stop(audioCtx.currentTime + 0.5);
        }
    } catch(e) {}
}

function showPage(page) {
    var toutesPages = [
        pageAccueil, pageMenu, pageAdminLogin, pageExam,
        pageAdmin, pageHistorique, pageStats, pageEntrainement,
        pageQuizEntr, pageResultatEntr
    ];
    toutesPages.forEach(function(p) { if (p) p.style.display = 'none'; });
    if (page) { page.style.display = 'block'; window.scrollTo(0, 0); }
}

function toast(msg, type) {
    var toastsEl = document.getElementById('toasts');
    if (!toastsEl) return;
    var t = document.createElement('div');
    t.className = 'toast toast-' + (type||'info');
    t.textContent = msg;
    toastsEl.appendChild(t);
    setTimeout(function() { t.classList.add('show'); }, 10);
    setTimeout(function() {
        t.classList.remove('show');
        setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
    }, 3000);
}

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function cleanEmail(email) { return email.replace(/[.#$\[\]]/g, '_'); }

function hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i);
        h |= 0;
    }
    return 'h' + Math.abs(h).toString(36);
}

function formatDate(ts) {
    if (!ts) return '--';
    var d = new Date(ts);
    return pad(d.getDate()) + '/' + pad(d.getMonth()+1) + '/' + d.getFullYear()
        + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function getPct(score, total) { return Math.round((score/total)*100); }

function getMention(score) {
    if (score >= 45) return '🏆 Excellent';
    if (score >= 40) return '⭐ Très Bien';
    if (score >= 35) return '✅ Bien';
    if (score >= 25) return '📘 Assez Bien';
    if (score >= 15) return '⚠️ Passable';
    return '❌ Insuffisant';
}

function getMentionTagClass(score) {
    if (score >= 40) return 'm-excellent';
    if (score >= 30) return 'm-bien';
    if (score >= 15) return 'm-passable';
    return 'm-faible';
}

function calcXp(score, total) {
    var pct = getPct(score, total);
    if (pct >= 90) return 100;
    if (pct >= 75) return 75;
    if (pct >= 60) return 50;
    if (pct >= 40) return 30;
    return 10;
}

function getTitreRang(xp) {
    if (xp >= 2000) return {titre:'Légende', emoji:'🌟', couleur:'#f59e0b'};
    if (xp >= 1000) return {titre:'Maître',  emoji:'👑', couleur:'#8b5cf6'};
    if (xp >= 500)  return {titre:'Expert',  emoji:'🔥', couleur:'#ef4444'};
    if (xp >= 200)  return {titre:'Confirmé',emoji:'⭐', couleur:'#3b82f6'};
    if (xp >= 50)   return {titre:'Apprenti',emoji:'📘', couleur:'#22c55e'};
    return {titre:'Recrue', emoji:'🎯', couleur:'#94a3b8'};
}

function convertirMath(texte) {
    if (!texte) return '';
    return texte
        .replace(/\^(\d+)/g, '<sup>$1</sup>')
        .replace(/_(\d+)/g, '<sub>$1</sub>')
        .replace(/√/g, '√').replace(/×/g, '×').replace(/÷/g, '÷')
        .replace(/≤/g, '≤').replace(/≥/g, '≥').replace(/≠/g, '≠').replace(/π/g, 'π');
}

// === ÉCHAPPEMENT HTML (sécurité affichage admin) ===
function escHTML(str) {
    if (str === undefined || str === null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// === RETOUR ANDROID ===
document.addEventListener('backbutton', function(e) {
    e.preventDefault();
    if (pageExam && pageExam.style.display !== 'none') {
        if (enExamen) return;
    }
    if (pageMenu && pageMenu.style.display !== 'none') return;
    showPage(pageMenu);
}, false);

// ============================================
// FIN PARTIE 3/24 ✅
// ============================================// ============================================
// PARTIE 4/24 — AUTH + CONNEXION RAPIDE
// CORRIGÉ : chaque compte se lie désormais à
// l'identité Firebase anonyme de l'appareil qui
// l'a créé ou premièrement connecté (firebaseUid).
// ============================================

if (btnShowInscription) {
    btnShowInscription.onclick = function() {
        son('click');
        if (formConnexion) formConnexion.style.display = 'none';
        if (formInscription) formInscription.style.display = 'block';
        if (formReset) formReset.style.display = 'none';
    };
}
if (btnShowConnexion) {
    btnShowConnexion.onclick = function() {
        son('click');
        if (formInscription) formInscription.style.display = 'none';
        if (formConnexion) formConnexion.style.display = 'block';
        if (formReset) formReset.style.display = 'none';
    };
}
if (btnShowReset) {
    btnShowReset.onclick = function() {
        son('click');
        if (formConnexion) formConnexion.style.display = 'none';
        if (formReset) formReset.style.display = 'block';
        if (formInscription) formInscription.style.display = 'none';
    };
}
if (btnRetourConnexion) {
    btnRetourConnexion.onclick = function() {
        son('click');
        if (formReset) formReset.style.display = 'none';
        if (formConnexion) formConnexion.style.display = 'block';
    };
}

if (btnInscription) {
    btnInscription.onclick = async function() {
        son('click');
        var n = nomInput ? nomInput.value.trim() : '';
        var p = prenomInput ? prenomInput.value.trim() : '';
        var e = emailInscription ? emailInscription.value.trim().toLowerCase() : '';
        var m = mdpInscription ? mdpInscription.value.trim() : '';
        if (n.length < 2 || p.length < 2) {
            if (erreurInscription) erreurInscription.textContent = '⚠️ Nom et Prénom requis';
            son('error'); return;
        }
        if (!e.includes('@') || !e.includes('.')) {
            if (erreurInscription) erreurInscription.textContent = '⚠️ Gmail invalide';
            son('error'); return;
        }
        if (m.length < 4) {
            if (erreurInscription) erreurInscription.textContent = '⚠️ Mot de passe 4 min';
            son('error'); return;
        }
        if (erreurInscription) erreurInscription.textContent = '⏳ Création...';
        var userKey = cleanEmail(e);
        try {
            var monUid = await assurerAuthAnonyme();
            var snap = await db.ref('users/' + userKey).once('value');
            if (snap.exists()) {
                if (erreurInscription) erreurInscription.textContent = '⚠️ Gmail déjà utilisé';
                son('error'); return;
            }
            await db.ref('users/' + userKey).set({
                nom: n, prenom: p, email: e, mdp: hash(m),
                xp: 0, niveau: 1, streak: 0, dernierJour: Date.now(),
                badges: {}, concoursFaits: 0, totalScore: 0, moyenne: 0,
                historique: [], accesPaye: false,
                dateInscription: Date.now(), top10All: false,
                firebaseUid: monUid
            });
            if (erreurInscription) erreurInscription.textContent = '';
            toast('✅ Compte créé !', 'success');
            son('success');
            if (nomInput) nomInput.value = '';
            if (prenomInput) prenomInput.value = '';
            if (emailInscription) emailInscription.value = '';
            if (mdpInscription) mdpInscription.value = '';
            if (formInscription) formInscription.style.display = 'none';
            if (formConnexion) formConnexion.style.display = 'block';
        } catch(err) {
            if (erreurInscription) erreurInscription.textContent = '⚠️ Erreur réseau.';
            son('error');
        }
    };
}

if (btnReset) {
    btnReset.onclick = async function() {
        son('click');
        var e = emailReset ? emailReset.value.trim().toLowerCase() : '';
        var m = nouveauMdp ? nouveauMdp.value.trim() : '';
        if (!e.includes('@') || !e.includes('.')) {
            if (erreurReset) erreurReset.textContent = '⚠️ Gmail invalide';
            son('error'); return;
        }
        if (m.length < 4) {
            if (erreurReset) erreurReset.textContent = '⚠️ Mot de passe 4 min';
            son('error'); return;
        }
        if (erreurReset) erreurReset.textContent = '⏳ Vérification...';
        try {
            await assurerAuthAnonyme();
            var userKey = cleanEmail(e);
            var snap = await db.ref('users/' + userKey).once('value');
            if (!snap.exists()) {
                if (erreurReset) erreurReset.textContent = "⚠️ Gmail introuvable";
                son('error'); return;
            }
            await db.ref('users/' + userKey).update({mdp: hash(m)});
            var savedData = localStorage.getItem('bb_userData');
            if (savedData) {
                try {
                    var parsed = JSON.parse(savedData);
                    if (parsed.email === e) {
                        parsed.mdp = hash(m);
                        localStorage.setItem('bb_userData', JSON.stringify(parsed));
                    }
                } catch(ex) {}
            }
            if (erreurReset) erreurReset.textContent = '';
            toast('✅ Mot de passe changé !', 'success');
            son('success');
            if (emailReset) emailReset.value = '';
            if (nouveauMdp) nouveauMdp.value = '';
            if (formReset) formReset.style.display = 'none';
            if (formConnexion) formConnexion.style.display = 'block';
        } catch(err) {
            if (erreurReset) erreurReset.textContent =
                '⚠️ Erreur réseau ou appareil non reconnu pour ce compte. Contacte l\'admin si besoin.';
            son('error');
        }
    };
}

if (btnLogin) {
    btnLogin.onclick = async function() {
        son('click');
        var e = emailInput ? emailInput.value.trim().toLowerCase() : '';
        var m = mdpInput ? mdpInput.value.trim() : '';
        if (!e.includes('@') || m.length < 4) {
            if (erreurEl) erreurEl.textContent = '⚠️ Gmail + mot de passe';
            son('error'); return;
        }
        if (erreurEl) erreurEl.textContent = '⏳ Connexion...';
        var userKey = cleanEmail(e);
        var donneesLocales = null;
        try {
            var localRaw = localStorage.getItem('bb_userData');
            if (localRaw) {
                var localParsed = JSON.parse(localRaw);
                if (localParsed && localParsed.email === e && localParsed.mdp === hash(m)) {
                    donneesLocales = localParsed;
                }
            }
        } catch(ex) { donneesLocales = null; }
        if (donneesLocales) {
            if (erreurEl) erreurEl.textContent = '';
            son('success');
            user = userKey;
            userDisplay = (donneesLocales.prenom || '') + ' ' + (donneesLocales.nom || '');
            userData = donneesLocales;
            localStorage.setItem('bb_user', user);
            chargerMenu(donneesLocales);
            setTimeout(function() { synchroniserDepuisFirebase(userKey, m); }, 500);
            return;
        }
        if (erreurEl) erreurEl.textContent = '⏳ Première connexion...';
        try {
            await assurerAuthAnonyme();
            var snap = await db.ref('users/' + userKey).once('value');
            if (!snap.exists() || snap.val().mdp !== hash(m)) {
                if (erreurEl) erreurEl.textContent = '⚠️ Gmail ou mdp incorrect';
                son('error'); return;
            }
            var d = snap.val();
            var now = Date.now();
            var dernier = new Date(d.dernierJour || now).setHours(0,0,0,0);
            var auj = new Date(now).setHours(0,0,0,0);
            var diff = (auj - dernier) / 86400000;
            if (diff === 1) d.streak = (d.streak||0) + 1;
            else if (diff > 1) d.streak = 1;

            // CORRIGÉ : réclame l'appareil si aucun n'est encore lié
            var monUid = await assurerAuthAnonyme();
            var updatePayload = { dernierJour: now, streak: d.streak };
            if (!d.firebaseUid) updatePayload.firebaseUid = monUid;
            try {
                await db.ref('users/' + userKey).update(updatePayload);
            } catch(errMaj) {
                // Si l'appareil ne correspond pas au firebaseUid enregistré,
                // la mise à jour est refusée par les règles de sécurité —
                // la connexion continue quand même en lecture.
                if (erreurEl) erreurEl.textContent =
                    'ℹ️ Cet appareil n\'est pas reconnu pour ce compte. Contacte l\'admin pour le débloquer.';
            }

            user        = userKey;
            userDisplay = (d.prenom||'') + ' ' + (d.nom||'');
            userData    = d;
            try {
                localStorage.setItem('bb_userData', JSON.stringify(d));
                localStorage.setItem('bb_user', user);
            } catch(ex) {}
            if (erreurEl && erreurEl.textContent.indexOf('⚠️') !== 0 && erreurEl.textContent.indexOf('ℹ️') !== 0)
                erreurEl.textContent = '';
            son('success');
            chargerMenu(d);
            setTimeout(function() {
                startPresence();
                demanderPermissionNotif();
                verifierEtatAuDemarrage();
                surveillerDebutConcours();
            }, 300);
        } catch(e2) {
            if (erreurEl) erreurEl.textContent = '⚠️ Pas de connexion.';
            son('error');
        }
    };
}

async function synchroniserDepuisFirebase(userKey, mdp) {
    try {
        await assurerAuthAnonyme();
        var snap = await db.ref('users/' + userKey).once('value');
        if (!snap.exists()) return;
        var d = snap.val();
        var now = Date.now();
        var dernier = new Date(d.dernierJour || now).setHours(0,0,0,0);
        var auj = new Date(now).setHours(0,0,0,0);
        var diff = (auj-dernier)/86400000;
        if (diff === 1) d.streak = (d.streak||0) + 1;
        else if (diff > 1) d.streak = 1;
        try { await db.ref('users/' + userKey).update({ dernierJour: now, streak: d.streak }); } catch(ex) {}
        userData = d;
        try { localStorage.setItem('bb_userData', JSON.stringify(d)); } catch(ex) {}
        if (nivEl) nivEl.textContent = d.niveau || 1;
        if (xpEl) xpEl.textContent = d.xp || 0;
        if (streakEl) streakEl.textContent = d.streak||0;
        var rangInfo = getTitreRang(d.xp || 0);
        var titreEl = document.getElementById('titreMenuRang');
        if (titreEl) {
            titreEl.textContent = rangInfo.emoji + ' ' + rangInfo.titre;
            titreEl.style.color = rangInfo.couleur;
        }
        startPresence();
        demanderPermissionNotif();
        verifierEtatAuDemarrage();
        surveillerDebutConcours();
    } catch(e) { startPresence(); }
}

async function autoLogin(savedKey) {
    try {
        var localRaw = localStorage.getItem('bb_userData');
        if (localRaw) {
            var localData = JSON.parse(localRaw);
            if (localData && cleanEmail(localData.email || '') === savedKey) {
                user = savedKey;
                userDisplay = (localData.prenom || '') + ' ' + (localData.nom || '');
                userData = localData;
                chargerMenu(localData);
                setTimeout(function() { synchroniserAutoLogin(savedKey); }, 500);
                return;
            }
        }
    } catch(ex) {}
    try {
        await assurerAuthAnonyme();
        var snap = await db.ref('users/' + savedKey).once('value');
        if (!snap.exists()) {
            localStorage.removeItem('bb_user');
            localStorage.removeItem('bb_userData');
            showPage(pageAccueil);
            return;
        }
        var d = snap.val();
        user = savedKey;
        userDisplay = (d.prenom||'') + ' '+(d.nom||'');
        userData = d;
        try { localStorage.setItem('bb_userData', JSON.stringify(d)); } catch(ex) {}
        chargerMenu(d);
        setTimeout(function() {
            startPresence();
            demanderPermissionNotif();
            verifierEtatAuDemarrage();
            surveillerDebutConcours();
        }, 300);
    } catch(e) {
        localStorage.removeItem('bb_user');
        localStorage.removeItem('bb_userData');
        showPage(pageAccueil);
    }
}

async function synchroniserAutoLogin(savedKey) {
    try {
        await assurerAuthAnonyme();
        var snap = await db.ref('users/' + savedKey).once('value');
        if (!snap.exists()) {
            localStorage.removeItem('bb_user');
            localStorage.removeItem('bb_userData');
            toast('Session expirée','error');
            setTimeout(function() { showPage(pageAccueil); }, 2000);
            return;
        }
        var d = snap.val();
        userData = d;
        try { localStorage.setItem('bb_userData', JSON.stringify(d)); } catch(ex) {}
        if (nivEl) nivEl.textContent = d.niveau || 1;
        if (xpEl) xpEl.textContent = d.xp || 0;
        if (streakEl) streakEl.textContent = d.streak||0;
        var rangInfo = getTitreRang(d.xp||0);
        var titreEl = document.getElementById('titreMenuRang');
        if (titreEl) {
            titreEl.textContent = rangInfo.emoji + ' ' + rangInfo.titre;
            titreEl.style.color = rangInfo.couleur;
        }
        startPresence();
        demanderPermissionNotif();
        verifierEtatAuDemarrage();
        surveillerDebutConcours();
    } catch(e) { startPresence(); }
}

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
    if (formReset) formReset.style.display = 'none';
    if (formConnexion) formConnexion.style.display = 'block';
});

if (btnAdmin) {
    btnAdmin.onclick = function() { son('click'); showPage(pageAdminLogin); };
}
if (btnRetour) {
    btnRetour.onclick = function() { son('click'); showPage(pageAccueil); };
}

// ============================================
// FIN PARTIE 4/24 ✅ (CORRIGÉE — liaison appareil)
// ============================================// ============================================
// PARTIE 5/24 — PRÉSENCE + MENU + COUNTDOWN
// CORRIGÉ : ajout du badge "PRÉVU" / "EN COURS"
// pour chaque salle, comme dans l'ancienne version
// ============================================

function startPresence() {
    if (!user) return;
    try {
        presenceRef = db.ref('presence/' + user);
        presenceRef.set({ online: true, timestamp: Date.now(), prenom: userData.prenom || '' });
        presenceRef.onDisconnect().remove();
        db.ref('presence').on('value', function(snap) {
            var count = snap.numChildren();
            if (onlineCountMenu) onlineCountMenu.textContent = count;
            var enLEl = document.getElementById('enLigne');
            if (enLEl) enLEl.textContent = '🟢 ' + count;
            if (statOnlineEl) statOnlineEl.textContent = count;
        });
    } catch(e) {}
}

function chargerMenu(d) {
    showPage(pageMenu);
    var prenom = d.prenom || '';
    var nom    = d.nom    || '';
    userDisplay = prenom + ' ' + nom;
    if (nomMenu) nomMenu.textContent = userDisplay;
    if (avatarMenu) avatarMenu.textContent = (prenom[0]||'') + (nom[0]||'');
    if (nivEl) nivEl.textContent = d.niveau || 1;
    if (xpEl) xpEl.textContent = d.xp || 0;
    if (streakEl) streakEl.textContent = d.streak || 0;
    var rangInfo = getTitreRang(d.xp || 0);
    var titreEl = document.getElementById('titreMenuRang');
    if (titreEl) {
        titreEl.textContent = rangInfo.emoji + ' ' + rangInfo.titre;
        titreEl.style.color = rangInfo.couleur;
    }
    afficherCompteRebours();
    afficherEtatSalles();
}

function afficherCompteRebours() {
    if (!compteRebours) return;
    var now = Date.now();
    var prochain = null, nomProchain = '', emojiProchain = '';
    DATES_CONCOURS.forEach(function(c) {
        var ts = new Date(c.date + 'T08:00:00').getTime();
        if (ts > now) {
            if (!prochain || ts < prochain) {
                prochain = ts; nomProchain = c.nom; emojiProchain = c.emoji;
            }
        }
    });
    if (!prochain) { compteRebours.innerHTML = ''; return; }
    function update() {
        var reste = prochain - Date.now();
        if (reste <= 0) { compteRebours.innerHTML = ''; return; }
        var j  = Math.floor(reste / 86400000);
        var h  = Math.floor((reste%86400000) / 3600000);
        var mn = Math.floor((reste%3600000) / 60000);
        var s  = Math.floor((reste%60000) / 1000);
        compteRebours.innerHTML =
            '<div class="compte-rebours">'
            + '<div class="cr-label">' + emojiProchain + ' Concours ' + nomProchain + '</div>'
            + '<div class="cr-timer">' + pad(j) + 'j ' + pad(h) + 'h ' + pad(mn) + 'mn ' + pad(s) + 's</div></div>';
    }
    update();
    if (countdownVraiConcours) clearInterval(countdownVraiConcours);
    countdownVraiConcours = setInterval(update, 1000);
}

// === NOUVEAU : badge PRÉVU / EN COURS pour chaque salle ===
function afficherEtatSalles() {
    if (!compteRebours) return;
    var zone = document.getElementById('etatSallesZone');
    if (!zone) {
        zone = document.createElement('div');
        zone.id = 'etatSallesZone';
        zone.style.marginBottom = '10px';
        compteRebours.parentNode.insertBefore(zone, compteRebours);
    }
    Promise.all([
        db.ref('configBepc').once('value'),
        db.ref('configBAC').once('value')
    ]).then(function(results) {
        var cfgBepc = results[0].val();
        var cfgBAC  = results[1].val();
        var now = Date.now();
        function pill(cfg, label, emoji) {
            if (!cfg || !cfg.debutTimestamp || !cfg.finTimestamp) return '';
            var couleur, texte;
            if (now < cfg.debutTimestamp) { couleur = '#3b82f6'; texte = '🟡 PRÉVU'; }
            else if (now >= cfg.debutTimestamp && now <= cfg.finTimestamp) { couleur = '#22c55e'; texte = '🟢 EN COURS'; }
            else { couleur = '#94a3b8'; texte = '⚪ TERMINÉ'; }
            return '<div style="display:flex;align-items:center;justify-content:space-between;'
                + 'background:white;border:1.5px solid var(--border);border-radius:14px;'
                + 'padding:10px 14px;margin-bottom:8px;">'
                + '<span style="font-size:13px;font-weight:700;">' + emoji + ' ' + label + '</span>'
                + '<span style="font-size:11px;font-weight:800;color:' + couleur + ';">' + texte + '</span></div>';
        }
        zone.innerHTML = pill(cfgBepc, 'Salle BEPC', '📘') + pill(cfgBAC, 'Salle BAC/Concours', '📗');
    }).catch(function() {});
}

if (btnEntrainement) {
    btnEntrainement.onclick = function() { son('click'); afficherPageEntrainement(); };
}
if (btnHistorique) {
    btnHistorique.onclick = function() { son('click'); showPage(pageHistorique); afficherHistorique(); };
}
if (btnClassement) {
    btnClassement.onclick = function() { son('click'); afficherClassement(); };
}
if (btnStats) {
    btnStats.onclick = function() { son('click'); showPage(pageStats); afficherStats(); };
}
if (btnBadges) {
    btnBadges.onclick = function() { son('click'); afficherBadges(); };
}
if (btnPartagerApp) {
    btnPartagerApp.onclick = function() { son('click'); partagerApp(); };
}
if (btnLogout) {
    btnLogout.onclick = function() {
        son('click');
        modalTitreEl.textContent = 'Déconnexion';
        modalTexteEl.textContent = 'Tu veux te déconnecter ?';
        modalEl.style.display = 'flex';
        btnConfirmer.onclick = function() {
            modalEl.style.display = 'none';
            if (presenceRef) presenceRef.remove();
            localStorage.removeItem('bb_user');
            localStorage.removeItem('bb_userData');
            user = null; userData = {};
            showPage(pageAccueil);
        };
        btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
    };
}

var btnRetourMenuHist = document.getElementById('btnRetourMenuHist');
if (btnRetourMenuHist) {
    btnRetourMenuHist.onclick = function() { son('click'); chargerMenu(userData); };
}
var btnRetourMenuStats = document.getElementById('btnRetourMenuStats');
if (btnRetourMenuStats) {
    btnRetourMenuStats.onclick = function() { son('click'); chargerMenu(userData); };
}

function verifierEtatAuDemarrage() {
    if (!user || !configActuelle) return;
}

function surveillerDebutConcours() {
    if (!user) return;
    db.ref('configBepc').on('value', function(snap) {
        var cfg = snap.val();
        if (!cfg) return;
        var now = Date.now();
        if (cfg.debutTimestamp && now < cfg.debutTimestamp) {
            var tAvant = cfg.debutTimestamp - now;
            if (tAvant < 5 * 60 * 1000) {
                if (timeoutNotif5min) return;
                timeoutNotif5min = setTimeout(function() {
                    toast('⏰ Concours BEPC dans 5 min !', 'warning');
                }, Math.max(0, tAvant - 5*60*1000));
            }
        }
    });
}

// ============================================
// FIN PARTIE 5/24 ✅ (CORRIGÉE)
// ============================================// ============================================
// PARTIE 6/24 — HISTORIQUE + STATS + COURBE SVG
// CORRIGÉ : page Stats reconstruite avec tous
// les indicateurs d'origine — carte de rang,
// niveau/XP, moyenne concours, taux entraînement,
// meilleur/plus bas score, courbe, série actuelle.
// ============================================

async function afficherHistorique() {
    var el = document.getElementById('contenuHistorique');
    if (!el) return;
    el.innerHTML = '<div class="loading-box"><div class="loader"></div><p>Chargement...</p></div>';
    try {
        var snap = await db.ref('users/' + user).once('value');
        var d = snap.val() || {};
        var histo = d.historique || [];
        if (!Array.isArray(histo)) histo = [];
        var vus = {};
        var histoUnique = [];
        histo.forEach(function(h) {
            if (!h) return;
            var cle = (h.timestamp||0) + '_' + (h.salle||'') + '_' + (h.score||0);
            if (!vus[cle]) { vus[cle] = true; histoUnique.push(h); }
        });
        histoUnique.sort(function(a, b) { return (b.timestamp||0) - (a.timestamp||0); });
        if (histoUnique.length === 0) {
            el.innerHTML =
                '<div style="text-align:center;padding:40px 20px;">'
                + '<div style="font-size:48px;margin-bottom:12px;">📋</div>'
                + '<p style="color:var(--muted);font-weight:700;">Aucun concours passé</p></div>';
            return;
        }
        var html = '';
        histoUnique.forEach(function(h) {
            var sc  = Math.min(h.score||0, 50);
            var men = getMention(sc);
            var cls = getMentionTagClass(sc);
            html +=
                '<div class="histo-item">'
                + '<div class="histo-header">'
                + '<span class="histo-salle">' + (h.salle === 'BEPC' ? '📘' : '📗') + ' '
                + escHTML(h.type || h.salle||'Concours') + '</span>'
                + '<span class="mention-tag ' + cls + '">' + men + '</span></div>'
                + '<div class="histo-score">' + sc + '/50</div>'
                + '<div class="histo-details">'
                + '✅ ' + (h.bonnes||0) + ' · ⚠️ ' + (h.partielles||0)
                + ' · ❌ ' + (h.fausses||0) + ' · ⚡ +' + (h.xp||0) + ' XP</div>'
                + '<div class="histo-date">' + formatDate(h.timestamp) + '</div></div>';
        });
        el.innerHTML = html;
    } catch(e) {
        el.innerHTML = '<p style="color:var(--red);padding:20px;">Erreur chargement</p>';
    }
}

// === CALCUL DU TAUX D'ENTRAÎNEMENT GLOBAL (bonnes/total) ===
function calculerTauxEntrainement(statsEntr) {
    var totalPts = 0, totalMax = 0;
    Object.keys(statsEntr || {}).forEach(function(matId) {
        var scores = statsEntr[matId].roundsScores || {};
        Object.keys(scores).forEach(function(k) {
            totalPts += scores[k];
            totalMax += QUESTIONS_PAR_ROUND;
        });
    });
    return { pts: totalPts, max: totalMax, pct: totalMax > 0 ? Math.round((totalPts/totalMax)*100) : 0 };
}

async function afficherStats() {
    var el = document.getElementById('contenuStats');
    if (!el) return;
    el.innerHTML = '<div class="loading-box"><div class="loader"></div><p>Chargement...</p></div>';
    try {
        var snap = await db.ref('users/' + user).once('value');
        var d = snap.val() || {};
        var histo = d.historique || [];
        if (!Array.isArray(histo)) histo = [];
        var vus = {};
        var histoUnique = [];
        histo.forEach(function(h) {
            if (!h) return;
            var cle = (h.timestamp||0)+'_'+(h.salle||'')+'_'+(h.score||0);
            if (!vus[cle]) { vus[cle] = true; histoUnique.push(h); }
        });

        var nb    = histoUnique.length;
        var total = histoUnique.reduce(function(s, h) { return s + Math.min(h.score||0, 50); }, 0);
        var moy   = nb > 0 ? (total/nb) : 0;
        var moyPct = Math.round((moy/50)*100);
        var best  = nb > 0 ? Math.max.apply(null, histoUnique.map(function(h) { return Math.min(h.score||0, 50); })) : 0;
        var pire  = nb > 0 ? Math.min.apply(null, histoUnique.map(function(h) { return Math.min(h.score||0, 50); })) : 0;

        var xp = d.xp || 0;
        var niveau = d.niveau || 1;
        var xpDansNiveau = xp - (niveau - 1) * 100;
        var xpPct = Math.max(0, Math.min(100, xpDansNiveau));

        var rangInfo = getTitreRang(xp);
        var nbEtoiles = xp >= 2000 ? 3 : xp >= 500 ? 2 : xp >= 50 ? 1 : 0;
        var etoiles = '⭐'.repeat(Math.max(1, nbEtoiles)) || '⭐';

        var badgesObtenus = Object.keys(d.badges || {}).filter(function(k) { return d.badges[k]; }).length;
        var taux = calculerTauxEntrainement(d.statsEntr);
        var couleurMoy = moyPct >= 60 ? '' : moyPct >= 35 ? 'pf-orange' : 'pf-red';
        var couleurTaux = taux.pct >= 60 ? '' : taux.pct >= 35 ? 'pf-orange' : 'pf-yellow';

        var svgHtml = '';
        if (histoUnique.length >= 2) {
            var tries = histoUnique.slice().sort(function(a,b) {
                return (a.timestamp||0)-(b.timestamp||0);
            }).slice(-10);
            var scores = tries.map(function(h) { return Math.min(h.score||0, 50); });
            var W=300, H=120, pL=30, pR=20, pT=20, pB=30;
            var gW = W-pL-pR, gH = H-pT-pB, n = scores.length;
            var pts = scores.map(function(s, i) {
                return { x: n > 1 ? pL+(i/(n-1))*gW : pL+gW/2, y: pT+gH-(s/50)*gH, s: s };
            });
            var poly = pts.map(function(p) { return p.x+','+p.y; }).join(' ');
            var diff = scores[scores.length-1]-scores[0];
            var tendance =
                diff>0 ? '<div style="color:var(--primary);font-size:12px;font-weight:700;margin-top:8px;text-align:center;">📈 +'+diff+' pts</div>'
                : diff<0 ? '<div style="color:var(--orange);font-size:12px;font-weight:700;margin-top:8px;text-align:center;">📉 '+diff+' pts</div>'
                : '<div style="color:var(--muted);font-size:12px;font-weight:700;margin-top:8px;text-align:center;">➡️ Score stable</div>';
            svgHtml =
                '<div style="background:white;border-radius:16px;padding:16px;margin-bottom:14px;'
                + 'box-shadow:0 2px 10px rgba(0,0,0,0.06);">'
                + '<div style="font-weight:800;font-size:13px;margin-bottom:12px;">📈 Évolution de tes scores</div>'
                + '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H
                + '" style="width:100%;max-width:100%;overflow:visible;">'
                + '<polyline points="' + poly + '" fill="none" stroke="#1a6b3c" stroke-width="2.5" '
                + 'stroke-linecap="round" stroke-linejoin="round"/>'
                + pts.map(function(p,i) {
                    var c=p.s>=40?'#22c55e':p.s>=25?'#3b82f6':p.s>=15?'#f97316':'#ef4444';
                    var last=i===pts.length-1;
                    return '<circle cx="'+p.x+'" cy="'+p.y+'" r="'+(last?6:4)+'" fill="'+c+'" stroke="white" stroke-width="2"/>'
                        +'<text x="'+p.x+'" y="'+(p.y-10)+'" text-anchor="middle" font-size="'+(last?11:9)+'" fill="'+c
                        +'" font-weight="'+(last?900:700)+'">'+p.s+'</text>';
                }).join('')
                + '</svg>' + tendance + '</div>';
        }

        el.innerHTML =
            '<div class="stats-rang-card">'
            + '<div class="stats-rang-stars">' + etoiles + '</div>'
            + '<div class="stats-rang-nom">' + rangInfo.emoji + ' ' + rangInfo.titre + '</div>'
            + '<div class="stats-rang-xp">' + xp + ' XP au total</div></div>'

            + '<div class="stats-grid-2">'
            + '<div class="stat-card"><span class="stat-card-emoji">🎯</span><span class="stat-card-val">' + nb + '</span><span class="stat-card-label">Concours passés</span></div>'
            + '<div class="stat-card"><span class="stat-card-emoji">⭐</span><span class="stat-card-val">' + niveau + '</span><span class="stat-card-label">Niveau actuel</span></div>'
            + '<div class="stat-card"><span class="stat-card-emoji">💰</span><span class="stat-card-val">' + xp + '</span><span class="stat-card-label">XP total</span></div>'
            + '<div class="stat-card"><span class="stat-card-emoji">🏆</span><span class="stat-card-val">' + badgesObtenus + '</span><span class="stat-card-label">Badges obtenus</span></div>'
            + '<div class="stat-card"><span class="stat-card-emoji">📈</span><span class="stat-card-val">' + best + '/50</span><span class="stat-card-label">Meilleur score</span></div>'
            + '<div class="stat-card"><span class="stat-card-emoji">📉</span><span class="stat-card-val">' + pire + '/50</span><span class="stat-card-label">Plus bas score</span></div>'
            + '</div>'

            + '<div class="progress-wrap"><div class="progress-header">'
            + '<span class="progress-title">Niveau ' + niveau + ' — XP</span>'
            + '<span class="progress-val">' + xpDansNiveau + '/100 XP</span></div>'
            + '<div class="progress-track"><div class="progress-fill" style="width:' + xpPct + '%;"></div></div></div>'

            + '<div class="progress-wrap"><div class="progress-header">'
            + '<span class="progress-title">Moyenne concours</span>'
            + '<span class="progress-val">' + moy.toFixed(1) + '/50 (' + moyPct + '%)</span></div>'
            + '<div class="progress-track"><div class="progress-fill ' + couleurMoy + '" style="width:' + moyPct + '%;"></div></div></div>'

            + '<div class="progress-wrap"><div class="progress-header">'
            + '<span class="progress-title">🎯 Taux entraînement</span>'
            + '<span class="progress-val">' + taux.pts + '/' + taux.max + ' (' + taux.pct + '%)</span></div>'
            + '<div class="progress-track"><div class="progress-fill ' + couleurTaux + '" style="width:' + taux.pct + '%;"></div></div></div>'

            + svgHtml

            + '<div class="stats-serie-card">'
            + '<div class="stats-serie-titre">🔥 Série actuelle</div>'
            + '<div class="stats-serie-val">' + (d.streak||0) + '</div>'
            + '<div class="stats-serie-label">jours</div></div>';
    } catch(e) {
        el.innerHTML = '<p style="color:var(--red);padding:20px;">Erreur chargement</p>';
    }
}

// ============================================
// FIN PARTIE 6/24 ✅ (CORRIGÉE — stats enrichies)
// ============================================// ============================================
// PARTIE 7/24 — BADGES + CLASSEMENT + TOP10
// CORRIGÉ : badges recentrés/stylés, classement
// réorganisé en onglets (Direct / BEPC / BAC / Hall)
// ============================================

async function verifierBadges(score, sorties) {
    if (!user || !userData) return;
    var badges = userData.badges || {};
    var newBadges = [];
    if (!badges.premier && (userData.concoursFaits||0) >= 1) { badges.premier = true; newBadges.push('premier'); }
    if (!badges.assidu && (userData.concoursFaits||0) >= 5) { badges.assidu = true; newBadges.push('assidu'); }
    if (!badges.perfect && score >= 50) { badges.perfect = true; newBadges.push('perfect'); }
    if (!badges.resistant && sorties === 0) { badges.resistant = true; newBadges.push('resistant'); }
    if (!badges.niveau10 && (userData.niveau||0) >= 10) { badges.niveau10 = true; newBadges.push('niveau10'); }
    if (!badges.elite && (userData.moyenne||0) >= 40) { badges.elite = true; newBadges.push('elite'); }
    if (!badges.streak7 && (userData.streak||0) >= 7) { badges.streak7 = true; newBadges.push('streak7'); }
    if (newBadges.length > 0) {
        await db.ref('users/' + user).update({badges: badges});
        userData.badges = badges;
        newBadges.forEach(function(id) {
            var b = BADGES_LIST.find(function(x) { return x.id === id; });
            if (b) toast('🏆 Badge : ' + b.nom, 'success');
        });
    }
}

async function verifierTop10(score, prenom, nom) {
    if (!user) return;
    try {
        var snap = await db.ref('top10All').once('value');
        var top = snap.val() || {};
        var entries = Object.entries(top).map(function(kv) { return {key:kv[0], val:kv[1]}; });
        entries.sort(function(a,b) { return b.val.score - a.val.score; });
        var monEntry = { prenom: prenom, nom: nom, score: score, ts: Date.now() };
        var dejaPresent = entries.findIndex(function(e) { return e.key === user; });
        if (dejaPresent !== -1) {
            if (score > entries[dejaPresent].val.score) {
                await db.ref('top10All/' + user).set(monEntry);
            }
        } else if (entries.length < 10) {
            await db.ref('top10All/' + user).set(monEntry);
        } else {
            var dernier = entries[entries.length - 1];
            if (score > dernier.val.score) {
                await db.ref('top10All/' + dernier.key).remove();
                await db.ref('top10All/' + user).set(monEntry);
                toast('🌟 Tu entres dans le Hall of Fame !', 'success');
            }
        }
    } catch(e) {}
}

// === BADGES — VERSION STYLÉE ===
function afficherBadges() {
    var badges = userData.badges || {};
    modalTitreEl.textContent = '🏆 Mes Badges';
    modalTexteEl.innerHTML = '';
    var grid = document.createElement('div');
    grid.className = 'badges-grid-modal';
    BADGES_LIST.forEach(function(b) {
        var obtained = !!badges[b.id];
        var card = document.createElement('div');
        card.className = 'badge-card-modal' + (obtained ? ' obtenu' : '');
        card.innerHTML =
            '<div class="bc-emoji">' + b.emoji + '</div>'
            + '<div class="bc-nom">' + b.nom + '</div>'
            + '<div class="bc-desc">' + b.desc + '</div>'
            + (obtained ? '<span class="bc-ok">✅ Obtenu</span>' : '');
        grid.appendChild(card);
    });
    modalTexteEl.appendChild(grid);
    modalEl.style.display    = 'flex';
    btnConfirmer.style.display = 'none';
    btnAnnuler.textContent   = 'Fermer';
    btnAnnuler.onclick = function() {
        modalEl.style.display      = 'none';
        btnConfirmer.style.display = '';
        btnAnnuler.textContent     = 'Annuler';
    };
}

// === CLASSEMENT — VERSION EN ONGLETS (chaque top a sa page) ===
async function afficherClassement() {
    modalTitreEl.textContent = '🏆 Classement';
    modalTexteEl.innerHTML   = '<div class="loading-box"><div class="loader"></div><p>Chargement...</p></div>';
    modalEl.style.display      = 'flex';
    btnConfirmer.style.display = 'none';
    btnAnnuler.textContent     = 'Fermer';
    btnAnnuler.onclick = function() {
        modalEl.style.display      = 'none';
        btnConfirmer.style.display = '';
        btnAnnuler.textContent     = 'Annuler';
    };
    try {
        var results = await Promise.all([
            db.ref('resultatsBepc').once('value'),
            db.ref('resultatsBAC').once('value'),
            db.ref('top10All').once('value')
        ]);

        var all = [], arrBepc = [], arrBac = [], arrHall = [];
        results[0].forEach(function(c) {
            var v = c.val();
            if (v && v.prenom) {
                var o = Object.assign({key:c.key}, v, {score: Math.min(v.score||0,50), salle:'BEPC'});
                all.push(o); arrBepc.push(o);
            }
        });
        results[1].forEach(function(c) {
            var v = c.val();
            if (v && v.prenom) {
                var o = Object.assign({key:c.key}, v, {score: Math.min(v.score||0,50), salle:'BAC'});
                all.push(o); arrBac.push(o);
            }
        });
        results[2].forEach(function(c) {
            var v = c.val();
            if (v) arrHall.push(Object.assign({key:c.key}, v, {score: Math.min(v.score||0,50)}));
        });
        all.sort(function(a,b) { return b.score-a.score; });
        arrBepc.sort(function(a,b) { return b.score-a.score; });
        arrBac.sort(function(a,b) { return b.score-a.score; });
        arrHall.sort(function(a,b) { return b.score-a.score; });

        var onglets = [
            { id:'direct', label:'🔴 Direct',        data: all,     limit:20 },
            { id:'bepc',   label:'📘 BEPC',          data: arrBepc, limit:10 },
            { id:'bac',    label:'📗 BAC',           data: arrBac,  limit:10 },
            { id:'hall',   label:'🌟 Hall of Fame',  data: arrHall, limit:10 }
        ];

        modalTexteEl.innerHTML = '';
        var tabsWrap = document.createElement('div');
        tabsWrap.className = 'classement-tabs';
        var contentWrap = document.createElement('div');
        contentWrap.style.maxHeight = '50vh';
        contentWrap.style.overflowY = 'auto';

        function ligneEl(r, i, medFallback) {
            var med = i===0 ? '🥇' : i===1 ? '🥈' : i===2 ? '🥉' : (medFallback || '#'+(i+1));
            var row = document.createElement('div');
            row.className = 'classement-row' + (r.key === user ? ' me' : '');
            row.innerHTML =
                '<span class="classement-rank">' + med + '</span>'
                + '<div class="classement-info"><div class="classement-nom">' + escHTML(r.prenom||'') + ' ' + escHTML(r.nom||'') + '</div>'
                + (r.salle ? '<div class="classement-salle">' + (r.salle==='BEPC'?'📘':'📗') + ' ' + r.salle + '</div>' : '')
                + '</div><span class="classement-score">' + r.score + '/50</span>';
            return row;
        }

        function rendreOnglet(idx) {
            Array.prototype.forEach.call(tabsWrap.querySelectorAll('.classement-tab'), function(t, ti) {
                t.classList.toggle('active', ti === idx);
            });
            contentWrap.innerHTML = '';
            var o = onglets[idx];
            if (o.data.length === 0) {
                var p = document.createElement('p');
                p.style.cssText = 'text-align:center;color:var(--muted);font-size:13px;padding:20px 0;';
                p.textContent = 'Aucun résultat pour le moment';
                contentWrap.appendChild(p);
                return;
            }
            o.data.slice(0, o.limit).forEach(function(r, i) {
                contentWrap.appendChild(ligneEl(r, i, o.id === 'hall' ? '🌟' : null));
            });
        }

        onglets.forEach(function(o, idx) {
            var tab = document.createElement('button');
            tab.className = 'classement-tab' + (idx === 0 ? ' active' : '');
            tab.textContent = o.label;
            tab.onclick = function() { son('click'); rendreOnglet(idx); };
            tabsWrap.appendChild(tab);
        });

        modalTexteEl.appendChild(tabsWrap);
        modalTexteEl.appendChild(contentWrap);
        rendreOnglet(0);
    } catch(e) {
        modalTexteEl.innerHTML = '<p style="text-align:center;color:var(--red);">Erreur chargement</p>';
    }
}

function demarrerClassementLive() {}

// Top 10 côté ADMIN (panneau Stats) — inchangé
function demarrerTop10Live() {
    var el10B    = document.getElementById('top10Bepc');
    var el10BAC  = document.getElementById('top10BAC');
    var el10P    = document.getElementById('top10Permanent');
    db.ref('resultatsBepc').on('value', function(snap) {
        if (!el10B) return;
        var arr = [];
        snap.forEach(function(child) { var v = child.val(); if (v && v.prenom) arr.push(v); });
        arr.sort(function(a,b) { return b.score - a.score; });
        el10B.innerHTML = arr.slice(0,10).map(function(r,i) {
            return '<div style="display:flex;justify-content:space-between;padding:8px 0;'
                + 'border-bottom:1px solid var(--border);"><span>'
                + (i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)) + ' ' + escHTML(r.prenom) + ' ' + escHTML(r.nom)
                + '</span><span style="font-weight:900;color:var(--primary);">'
                + Math.min(r.score||0,50) + '/50</span></div>';
        }).join('') || 'Aucun résultat';
    });
    db.ref('resultatsBAC').on('value', function(snap) {
        if (!el10BAC) return;
        var arr = [];
        snap.forEach(function(child) { var v = child.val(); if (v && v.prenom) arr.push(v); });
        arr.sort(function(a,b) { return b.score - a.score; });
        el10BAC.innerHTML = arr.slice(0,10).map(function(r,i) {
            return '<div style="display:flex;justify-content:space-between;padding:8px 0;'
                + 'border-bottom:1px solid var(--border);"><span>'
                + (i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)) + ' ' + escHTML(r.prenom) + ' ' + escHTML(r.nom)
                + '</span><span style="font-weight:900;color:var(--primary);">'
                + Math.min(r.score||0,50) + '/50</span></div>';
        }).join('') || 'Aucun résultat';
    });
    db.ref('top10All').on('value', function(snap) {
        if (!el10P) return;
        var arr = [];
        snap.forEach(function(child) { var v = child.val(); if (v) arr.push(v); });
        arr.sort(function(a,b) { return b.score - a.score; });
        el10P.innerHTML = arr.slice(0,10).map(function(r,i) {
            return '<div style="display:flex;justify-content:space-between;padding:8px 0;'
                + 'border-bottom:1px solid var(--border);"><span>'
                + (i===0?'🥇':i===1?'🥈':i===2?'🥉':'🌟') + ' ' + escHTML(r.prenom||'') + ' ' + escHTML(r.nom||'')
                + '</span><span style="font-weight:900;color:var(--orange);">'
                + Math.min(r.score||0,50) + '/50</span></div>';
        }).join('') || 'Aucun résultat';
    });
}

// ============================================
// FIN PARTIE 7/24 ✅ (CORRIGÉE)
// ============================================// ============================================
// PARTIE 8/24 — ADMIN LOGIN + CONFIG + CHARGEMENT ADMIN
// FINALISÉ : connexion Firebase Auth réelle avec
// le compte admin eliseebonogo67@gmail.com
// ============================================

var tentativesAdmin   = 0;
var derniereTentAdmin = 0;
var MAX_TENT_ADM      = 3;
var BLOCAGE_ADM_MS    = 10 * 60 * 1000;

var ADMIN_EMAIL_FIREBASE = "eliseebonogo67@gmail.com";
var ADMIN_MDP_FIREBASE   = "Bonogo2026Admin";

function verifierMdpAdmin(mdpSaisi) {
    var encoded = btoa(btoa(mdpSaisi + '_bonogo_admin_salt'));
    var attendu = btoa(btoa('2305' + '_bonogo_admin_salt'));
    return encoded === attendu;
}

if (btnLoginAdmin) {
    btnLoginAdmin.onclick = async function() {
        son('click');
        var now = Date.now();
        if (tentativesAdmin >= MAX_TENT_ADM) {
            var tempsR = BLOCAGE_ADM_MS - (now - derniereTentAdmin);
            if (tempsR > 0) {
                if (erreurAdmin) erreurAdmin.textContent = 'Trop de tentatives. ' + Math.ceil(tempsR/60000) + ' min.';
                son('error'); return;
            } else { tentativesAdmin = 0; }
        }
        var mdpSaisi = adminPassEl ? adminPassEl.value.trim() : '';
        if (!mdpSaisi) {
            if (erreurAdmin) erreurAdmin.textContent = 'Entre le mot de passe';
            son('error'); return;
        }
        if (verifierMdpAdmin(mdpSaisi)) {
            // Connexion Firebase Auth réelle avec le compte admin dédié
            // (le mot de passe app "2305" reste ce que TU tapes à l'écran ;
            // en interne, on se connecte avec le mot de passe Firebase réel)
            try {
                await firebase.auth().signInWithEmailAndPassword(ADMIN_EMAIL_FIREBASE, ADMIN_MDP_FIREBASE);
            } catch (errAuth) {
                if (erreurAdmin) erreurAdmin.textContent =
                    'Erreur de connexion sécurisée. Vérifie ta connexion internet et réessaie.';
                son('error');
                return;
            }
            tentativesAdmin = 0;
            if (erreurAdmin) erreurAdmin.textContent = '';
            if (adminPassEl) adminPassEl.value = '';
            toast('Accès admin accordé', 'success');
            son('success');
            showPage(pageAdmin);
            chargerAdmin();
        } else {
            tentativesAdmin++;
            derniereTentAdmin = now;
            var rest = MAX_TENT_ADM - tentativesAdmin;
            if (erreurAdmin) erreurAdmin.textContent = rest > 0
                ? 'Mot de passe incorrect. ' + rest + ' essai(s).'
                : 'Accès bloqué 10 minutes.';
            son('error');
        }
    };
}

async function chargerAdmin() {
    if (statusEl) {
        statusEl.textContent = '🟢 Connecté';
        statusEl.style.background = 'rgba(34,197,94,0.2)';
        statusEl.style.color = 'var(--green)';
    }
    try {
        var results = await Promise.all([
            db.ref('users').once('value'),
            db.ref('resultatsBepc').once('value'),
            db.ref('resultatsBAC').once('value'),
            db.ref('configBepc').once('value'),
            db.ref('configBAC').once('value'),
            db.ref('configQuota').once('value')
        ]);
        var users   = results[0].val() || {};
        var resBepc = results[1].val() || {};
        var resBAC  = results[2].val() || {};
        var cfgBepc = results[3].val() || {};
        var cfgBAC  = results[4].val() || {};
        var quota   = results[5].val() || {};

        if (statCandidatsEl) statCandidatsEl.textContent = Object.keys(users).length;
        var totalRes = Object.keys(resBepc).length + Object.keys(resBAC).length;
        if (statConcoursEl) statConcoursEl.textContent = totalRes;
        var scoresAll = [];
        Object.values(resBepc).concat(Object.values(resBAC)).forEach(function(r) {
            if (r && r.score !== undefined) scoresAll.push(Math.min(r.score||0, 50));
        });
        var moy = scoresAll.length > 0
            ? (scoresAll.reduce(function(a,b){return a+b;},0) / scoresAll.length).toFixed(1) : 0;
        if (statMoyEl) statMoyEl.textContent = moy+'/50';

        var maxBepc = quota.maxBepc || 200;
        var maxBAC  = quota.maxBAC  || 200;
        if (document.getElementById('inputMaxBepc')) document.getElementById('inputMaxBepc').value = maxBepc;
        if (document.getElementById('inputMaxBAC'))  document.getElementById('inputMaxBAC').value  = maxBAC;
        if (document.getElementById('maxSalleBepc')) document.getElementById('maxSalleBepc').textContent = maxBepc;
        if (document.getElementById('maxSalleBAC'))  document.getElementById('maxSalleBAC').textContent  = maxBAC;
        if (document.getElementById('placesRestantesBepc')) document.getElementById('placesRestantesBepc').textContent = maxBepc;
        if (document.getElementById('placesRestantesBAC'))  document.getElementById('placesRestantesBAC').textContent  = maxBAC;

        if (cfgBepc.heureDebut && hDebutBepcEl) hDebutBepcEl.value = cfgBepc.heureDebut;
        if (cfgBepc.heureFin && hFinBepcEl) hFinBepcEl.value = cfgBepc.heureFin;
        if (cfgBepc.type && typeConcoursBepcEl) typeConcoursBepcEl.value = cfgBepc.type;
        if (cfgBAC.heureDebut && hDebutBAC_El) hDebutBAC_El.value = cfgBAC.heureDebut;
        if (cfgBAC.heureFin && hFinBAC_El) hFinBAC_El.value = cfgBAC.heureFin;
        if (cfgBAC.type && typeConcoursBAC_El) typeConcoursBAC_El.value = cfgBAC.type;

        var sbSnap = await db.ref('sujetBepc').once('value');
        if (sbSnap.exists()) {
            sujetBepc = sbSnap.val() || [];
            if (sujetBepc.length > 0) afficherQuestionsAdmin('bepc');
        }
        var sbBAC = await db.ref('sujetBAC').once('value');
        if (sbBAC.exists()) {
            sujetBAC = sbBAC.val() || [];
            if (sujetBAC.length > 0) afficherQuestionsAdmin('bac');
        }

        demarrerClassementLive();
        demarrerTop10Live();
        chargerListeCandidats();
        demarrerSuiviSalles();

    } catch(e) {
        toast('Erreur chargement admin', 'error');
    }
}

if (btnLogoutAdminEl) {
    btnLogoutAdminEl.onclick = function() {
        son('click');
        try { firebase.auth().signOut(); } catch(e) {}
        showPage(pageMenu);
    };
}

if (btnMoinsBepcEl) {
    btnMoinsBepcEl.onclick = function() {
        son('click');
        var inp = document.getElementById('inputMaxBepc');
        if (inp) inp.value = Math.max(10, (parseInt(inp.value)||200) - 10);
    };
}
if (btnPlusBepcEl) {
    btnPlusBepcEl.onclick = function() {
        son('click');
        var inp = document.getElementById('inputMaxBepc');
        if (inp) inp.value = Math.min(2000, (parseInt(inp.value)||200) + 10);
    };
}
if (btnMoinsBAC_El) {
    btnMoinsBAC_El.onclick = function() {
        son('click');
        var inp = document.getElementById('inputMaxBAC');
        if (inp) inp.value = Math.max(10, (parseInt(inp.value)||200) - 10);
    };
}
if (btnPlusBAC_El) {
    btnPlusBAC_El.onclick = function() {
        son('click');
        var inp = document.getElementById('inputMaxBAC');
        if (inp) inp.value = Math.min(2000, (parseInt(inp.value)||200) + 10);
    };
}

if (btnSaveConfigBepcEl) {
    btnSaveConfigBepcEl.onclick = async function() {
        son('click');
        var today = new Date().toISOString().split('T')[0];
        var debut = new Date(today + 'T' + hDebutBepcEl.value + ':00').getTime();
        var fin   = new Date(today + 'T' + hFinBepcEl.value + ':00').getTime();
        if (fin <= debut) { toast('Heure fin > début','error'); return; }
        var elMaxB = document.getElementById('inputMaxBepc');
        var maxB = elMaxB ? parseInt(elMaxB.value)||200 : 200;
        var elMaxSalleB = document.getElementById('maxSalleBepc');
        if (elMaxSalleB) elMaxSalleB.textContent = maxB;
        await Promise.all([
            db.ref('configBepc').set({
                type: typeConcoursBepcEl.value, heureDebut: hDebutBepcEl.value, heureFin: hFinBepcEl.value,
                debutTimestamp: debut, finTimestamp: fin, dateCreation: Date.now()
            }),
            db.ref('configQuota').update({ maxBepc: maxB })
        ]);
        toast('✅ Config BEPC sauvegardée ! Max : ' + maxB + ' participants', 'success');
        son('success');
    };
}

if (btnSaveConfigBAC_El) {
    btnSaveConfigBAC_El.onclick = async function() {
        son('click');
        var today = new Date().toISOString().split('T')[0];
        var debut = new Date(today + 'T' + hDebutBAC_El.value + ':00').getTime();
        var fin   = new Date(today + 'T' + hFinBAC_El.value + ':00').getTime();
        if (fin <= debut) { toast('Heure fin > début','error'); return; }
        var elMaxBac = document.getElementById('inputMaxBAC');
        var maxBac = elMaxBac ? parseInt(elMaxBac.value)||200 : 200;
        var elMaxSalleBAC = document.getElementById('maxSalleBAC');
        if (elMaxSalleBAC) elMaxSalleBAC.textContent = maxBac;
        await Promise.all([
            db.ref('configBAC').set({
                type: typeConcoursBAC_El.value, heureDebut: hDebutBAC_El.value, heureFin: hFinBAC_El.value,
                debutTimestamp: debut, finTimestamp: fin, dateCreation: Date.now()
            }),
            db.ref('configQuota').update({ maxBAC: maxBac })
        ]);
        toast('✅ Config BAC sauvegardée ! Max : ' + maxBac + ' participants', 'success');
        son('success');
    };
}

// ============================================
// FIN PARTIE 8/24 ✅ (FINALISÉE — Firebase Auth admin)
// ============================================// ============================================
// PARTIE 9/24 — ADMIN IMPORT JSON
// CORRIGÉ : question, réponses et explication
// sont maintenant modifiables (textarea/input)
// AVANT d'envoyer ou de sauvegarder le sujet.
// ============================================

function chargerJSONGenerique(jsonStr, salle) {
    try {
        var data = JSON.parse(jsonStr);
        if (!Array.isArray(data) || data.length === 0) { toast('JSON invalide','error'); return false; }
        var valides = data.filter(function(q) {
            return q && q.texte && Array.isArray(q.reponses) && q.reponses.length >= 2;
        });
        if (valides.length === 0) { toast('Aucune question valide','error'); return false; }
        if (salle === 'bepc') sujetBepc = sujetBepc.concat(valides);
        else sujetBAC = sujetBAC.concat(valides);
        return valides.length;
    } catch(e) {
        toast('Erreur parsing JSON','error');
        return false;
    }
}

if (btnAjouterPartieBepcEl) {
    btnAjouterPartieBepcEl.onclick = function() {
        son('click');
        var txt = collerJSONBepcEl ? collerJSONBepcEl.value.trim() : '';
        if (!txt) { toast('Zone JSON vide','error'); return; }
        var nb = chargerJSONGenerique(txt, 'bepc');
        if (nb !== false) {
            toast('✅ ' + nb + ' questions ajoutées !', 'success');
            var nbCar = document.getElementById('nbCaracteresBepc');
            if (nbCar) nbCar.textContent = JSON.stringify(sujetBepc).length;
            if (collerJSONBepcEl) collerJSONBepcEl.value = '';
        }
    };
}

if (btnViderZoneBepcEl) {
    btnViderZoneBepcEl.onclick = function() {
        son('click');
        if (collerJSONBepcEl) collerJSONBepcEl.value = '';
        sujetBepc = [];
        var nbCar = document.getElementById('nbCaracteresBepc');
        if (nbCar) nbCar.textContent = '0';
        toast('Zone vidée','success');
    };
}

if (btnCharger50BepcEl) {
    btnCharger50BepcEl.onclick = function() {
        son('click');
        var txt = collerJSONBepcEl ? collerJSONBepcEl.value.trim() : '';
        if (txt) chargerJSONGenerique(txt, 'bepc');
        if (sujetBepc.length === 0) { toast('Aucune question','error'); return; }
        afficherQuestionsAdmin('bepc');
        if (btnEnvoyer50BepcEl) btnEnvoyer50BepcEl.style.display = 'block';
        toast('✅ ' + sujetBepc.length + ' questions chargées ! Tu peux les modifier avant envoi.', 'success');
    };
}

if (btnEnvoyer50BepcEl) {
    btnEnvoyer50BepcEl.onclick = async function() {
        son('click');
        if (sujetBepc.length === 0) { toast('Aucune question','error'); return; }
        try {
            await db.ref('sujetBepc').set(sujetBepc);
            toast('🚀 Sujet BEPC envoyé ! ' + sujetBepc.length + ' questions','success');
            son('success');
        } catch(e) { toast('Erreur envoi','error'); }
    };
}

if (btnAjouterPartieBAC_El) {
    btnAjouterPartieBAC_El.onclick = function() {
        son('click');
        var txt = collerJSONBAC_El ? collerJSONBAC_El.value.trim() : '';
        if (!txt) { toast('Zone JSON vide','error'); return; }
        var nb = chargerJSONGenerique(txt, 'bac');
        if (nb !== false) {
            toast('✅ ' + nb + ' questions ajoutées !', 'success');
            var nbCar = document.getElementById('nbCaracteresBAC');
            if (nbCar) nbCar.textContent = JSON.stringify(sujetBAC).length;
            if (collerJSONBAC_El) collerJSONBAC_El.value = '';
        }
    };
}

if (btnViderZoneBAC_El) {
    btnViderZoneBAC_El.onclick = function() {
        son('click');
        if (collerJSONBAC_El) collerJSONBAC_El.value = '';
        sujetBAC = [];
        var nbCar = document.getElementById('nbCaracteresBAC');
        if (nbCar) nbCar.textContent = '0';
        toast('Zone vidée','success');
    };
}

if (btnCharger50BAC_El) {
    btnCharger50BAC_El.onclick = function() {
        son('click');
        var txt = collerJSONBAC_El ? collerJSONBAC_El.value.trim() : '';
        if (txt) chargerJSONGenerique(txt, 'bac');
        if (sujetBAC.length === 0) { toast('Aucune question','error'); return; }
        afficherQuestionsAdmin('bac');
        if (btnEnvoyer50BAC_El) btnEnvoyer50BAC_El.style.display = 'block';
        toast('✅ ' + sujetBAC.length + ' questions chargées ! Tu peux les modifier avant envoi.', 'success');
    };
}

if (btnEnvoyer50BAC_El) {
    btnEnvoyer50BAC_El.onclick = async function() {
        son('click');
        if (sujetBAC.length === 0) { toast('Aucune question','error'); return; }
        try {
            await db.ref('sujetBAC').set(sujetBAC);
            toast('🚀 Sujet BAC envoyé ! ' + sujetBAC.length + ' questions','success');
            son('success');
        } catch(e) { toast('Erreur envoi','error'); }
    };
}

// === AFFICHER QUESTIONS ADMIN — VERSION ÉDITABLE ===
// Question, réponses et explication sont désormais des
// vrais champs modifiables. Les modifications sont
// enregistrées directement dans sujetBepc/sujetBAC en mémoire
// (donc actives avant même de cliquer "Envoyer"/"Sauvegarder").
function afficherQuestionsAdmin(salle) {
    var sujet = salle === 'bepc' ? sujetBepc : sujetBAC;
    var el = salle === 'bepc' ? listeQuestionsBepcEl : listeQuestionsBAC_El;
    if (!el) return;
    el.innerHTML = '';

    sujet.forEach(function(q, qi) {
        var div = document.createElement('div');
        div.className = 'admin-q-block';

        var header = document.createElement('div');
        header.className = 'admin-q-header';

        var numEl = document.createElement('div');
        numEl.className = 'admin-q-num';
        numEl.textContent = 'Q' + (qi+1) + '/' + sujet.length;

        var badgeEl = document.createElement('div');
        badgeEl.className = 'admin-q-badge';
        function majBadge() {
            var bonnes = (q.reponses||[]).filter(function(r) { return r && r.correct; }).length;
            badgeEl.textContent = bonnes + ' bonne(s)';
        }
        majBadge();

        var btnSupp = document.createElement('button');
        btnSupp.className = 'btn-outline btn-small';
        btnSupp.style.cssText = 'width:auto;min-height:auto;padding:6px 12px;margin:0;color:var(--red);border-color:var(--red);';
        btnSupp.textContent = 'Supprimer';
        btnSupp.onclick = function() { supprimerQ(salle, qi); };

        header.appendChild(numEl);
        header.appendChild(badgeEl);
        header.appendChild(btnSupp);
        div.appendChild(header);

        // === TEXTE QUESTION — ÉDITABLE ===
        var texteArea = document.createElement('textarea');
        texteArea.className = 'admin-q-input-texte';
        texteArea.rows = 2;
        texteArea.value = q.texte || '';
        texteArea.placeholder = 'Texte de la question';
        texteArea.oninput = function() { q.texte = texteArea.value; };
        div.appendChild(texteArea);

        // === RÉPONSES — ÉDITABLES + CHECKBOX CORRECTE ===
        var repListe = document.createElement('div');
        repListe.className = 'admin-rep-liste';

        (q.reponses||[]).forEach(function(r, ri) {
            var row = document.createElement('div');
            row.className = 'admin-rep-row' + (r && r.correct ? ' est-correcte' : '');

            var cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = !!(r && r.correct);
            cb.onchange = function() {
                if (!q.reponses[ri]) return;
                q.reponses[ri].correct = cb.checked;
                row.classList.toggle('est-correcte', cb.checked);
                majBadge();
            };

            var lettre = document.createElement('span');
            lettre.className = 'admin-rep-lettre';
            lettre.textContent = 'ABCD'[ri] || (ri+1);

            var texteInput = document.createElement('input');
            texteInput.type = 'text';
            texteInput.className = 'admin-rep-input';
            texteInput.value = r ? (r.texte || '') : '';
            texteInput.placeholder = 'Texte de la réponse ' + ('ABCD'[ri] || (ri+1));
            texteInput.oninput = function() {
                if (q.reponses[ri]) q.reponses[ri].texte = texteInput.value;
            };

            row.appendChild(cb);
            row.appendChild(lettre);
            row.appendChild(texteInput);
            repListe.appendChild(row);
        });

        div.appendChild(repListe);

        // === EXPLICATION — ÉDITABLE ===
        var expInput = document.createElement('textarea');
        expInput.className = 'admin-q-input-texte';
        expInput.rows = 2;
        expInput.placeholder = 'Explication (facultatif)';
        expInput.value = q.explication || '';
        expInput.style.marginTop = '8px';
        expInput.oninput = function() { q.explication = expInput.value; };
        div.appendChild(expInput);

        el.appendChild(div);
    });
}

window.supprimerQ = function(salle, qi) {
    son('click');
    if (salle === 'bepc') { sujetBepc.splice(qi, 1); afficherQuestionsAdmin('bepc'); }
    else { sujetBAC.splice(qi, 1); afficherQuestionsAdmin('bac'); }
    toast('Question supprimée','success');
};

if (btnAjouterQBepcEl) {
    btnAjouterQBepcEl.onclick = function() {
        son('click');
        sujetBepc.push({
            texte: '',
            reponses: [
                {texte:'', correct:true},
                {texte:'', correct:false},
                {texte:'', correct:false},
                {texte:'', correct:false}
            ],
            explication: ''
        });
        afficherQuestionsAdmin('bepc');
    };
}

if (btnAjouterQBAC_El) {
    btnAjouterQBAC_El.onclick = function() {
        son('click');
        sujetBAC.push({
            texte: '',
            reponses: [
                {texte:'', correct:true},
                {texte:'', correct:false},
                {texte:'', correct:false},
                {texte:'', correct:false}
            ],
            explication: ''
        });
        afficherQuestionsAdmin('bac');
    };
}

if (btnSaveSujetBepcEl) {
    btnSaveSujetBepcEl.onclick = async function() {
        son('click');
        if (sujetBepc.length === 0) { toast('Aucune question','error'); return; }
        try {
            await db.ref('sujetBepc').set(sujetBepc);
            toast('✅ Sujet BEPC sauvegardé !', 'success');
            son('success');
        } catch(e) { toast('Erreur sauvegarde','error'); }
    };
}

if (btnSaveSujetBAC_El) {
    btnSaveSujetBAC_El.onclick = async function() {
        son('click');
        if (sujetBAC.length === 0) { toast('Aucune question','error'); return; }
        try {
            await db.ref('sujetBAC').set(sujetBAC);
            toast('✅ Sujet BAC sauvegardé !', 'success');
            son('success');
        } catch(e) { toast('Erreur sauvegarde','error'); }
    };
}

// ============================================
// FIN PARTIE 9/24 ✅ (CORRIGÉE)
// ============================================// ============================================
// PARTIE 10/24 — ADMIN CANDIDATS + ACTIONS
// CORRIGÉ : ajout d'un bouton "Réinitialiser
// appareil" pour libérer un compte bloqué sur un
// ancien téléphone (changement d'appareil élève).
// ============================================

async function chargerListeCandidats() {
    if (!listeCandidatsEl) return;
    listeCandidatsEl.innerHTML = '<div class="loading-box"><div class="loader"></div><p>Chargement...</p></div>';
    try {
        var snap = await db.ref('users').once('value');
        var users = snap.val() || {};
        var arr = Object.entries(users).map(function(kv) { return Object.assign({key: kv[0]}, kv[1]); });
        arr.sort(function(a, b) { return (b.dateInscription||0) - (a.dateInscription||0); });
        var payes = arr.filter(function(u) { return u.accesPaye; }).length;
        var nonPaye = arr.length - payes;
        var resumeHtml =
            '<div style="display:flex;gap:8px;margin-bottom:14px;">'
            + '<div style="background:rgba(34,197,94,0.1);border:1.5px solid rgba(34,197,94,0.3);'
            + 'border-radius:10px;padding:8px 12px;font-size:13px;font-weight:700;color:var(--green);">'
            + '✅ ' + payes + ' payés</div>'
            + '<div style="background:rgba(239,68,68,0.1);border:1.5px solid rgba(239,68,68,0.3);'
            + 'border-radius:10px;padding:8px 12px;font-size:13px;font-weight:700;color:var(--red);">'
            + '❌ ' + nonPaye + ' non payés</div></div>';
        var html = resumeHtml;
        arr.forEach(function(u) {
            html +=
                '<div style="background:white;border-radius:14px;padding:14px;margin-bottom:8px;'
                + 'box-shadow:0 2px 8px rgba(0,0,0,0.05);">'
                + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">'
                + '<div style="flex:1;"><div style="font-weight:800;font-size:14px;">'
                + escHTML(u.prenom||'') + ' ' + escHTML(u.nom||'') + '</div>'
                + '<div style="font-size:12px;color:var(--muted);margin-top:2px;">' + escHTML(u.email||u.key) + '</div>'
                + '<div style="font-size:11px;color:var(--muted);margin-top:4px;">'
                + 'Niv.' + (u.niveau||1) + ' · ' + (u.xp||0) + ' XP · ' + (u.concoursFaits||0) + ' concours</div>'
                + '<div class="candidat-actions-row">'
                + '<button class="btn-suppr-candidat" onclick="demanderSuppressionCandidat(' + "'" + u.key + "'" + ',' + "'" + (u.prenom||'').replace(/'/g,"") + ' ' + (u.nom||'').replace(/'/g,"") + "'" + ')">🗑️ Supprimer</button>'
                + '<button class="btn-suppr-candidat" style="color:var(--blue);border-color:var(--blue);background:rgba(59,130,246,0.08);" '
                + 'onclick="reinitialiserAppareil(' + "'" + u.key + "'" + ')">🔓 Réinitialiser appareil</button>'
                + '</div></div>'
                + '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">'
                + '<div style="font-size:12px;font-weight:700;color:' + (u.accesPaye ? 'var(--green)' : 'var(--red)') + ';">'
                + (u.accesPaye ? '✅ Payé' : '❌ Non payé') + '</div>'
                + '<button onclick="toggleAcces(' + "'" + u.key + "'," + !u.accesPaye + ')"'
                + ' style="font-size:11px;padding:5px 10px;border:1.5px solid '
                + (u.accesPaye ? 'var(--red)' : 'var(--green)') + ';border-radius:8px;background:'
                + (u.accesPaye ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)') + ';color:'
                + (u.accesPaye ? 'var(--red)' : 'var(--green)') + ';cursor:pointer;min-height:auto;width:auto;margin:0;'
                + 'font-family:Poppins,sans-serif;">'
                + (u.accesPaye ? 'Révoquer' : 'Activer') + '</button></div></div></div>';
        });
        listeCandidatsEl.innerHTML = html;
    } catch(e) {
        listeCandidatsEl.innerHTML = '<p style="color:var(--red);padding:20px;">Erreur chargement</p>';
    }
}

window.toggleAcces = async function(userKey, activer) {
    son('click');
    try {
        await db.ref('users/' + userKey).update({accesPaye: activer});
        toast(activer ? '✅ Accès activé !' : '❌ Accès révoqué !', activer ? 'success' : 'error');
        chargerListeCandidats();
    } catch(e) { toast('Erreur','error'); }
};

// === NOUVEAU : réinitialiser l'appareil lié à un compte ===
// Permet à un élève qui a changé de téléphone de se reconnecter
// (le prochain login réclame automatiquement le nouvel appareil).
window.reinitialiserAppareil = function(userKey) {
    son('click');
    modalTitreEl.textContent = '🔓 Réinitialiser l\'appareil ?';
    modalTexteEl.innerHTML =
        '<p style="color:var(--muted);font-size:13px;">Ce compte pourra se reconnecter depuis un nouveau téléphone.</p>'
        + '<p style="color:var(--orange);font-weight:700;font-size:13px;margin-top:8px;">'
        + 'À utiliser uniquement si l\'élève a changé d\'appareil.</p>';
    modalEl.style.display = 'flex';
    btnConfirmer.style.display = 'block';
    btnConfirmer.textContent = 'Réinitialiser';
    btnConfirmer.style.background = '';
    btnConfirmer.onclick = async function() {
        modalEl.style.display = 'none';
        btnConfirmer.textContent = 'Confirmer';
        try {
            await db.ref('users/' + userKey).update({ firebaseUid: null });
            toast('✅ Appareil réinitialisé — le compte peut se reconnecter ailleurs', 'success');
        } catch(e) { toast('Erreur','error'); }
    };
    btnAnnuler.textContent = 'Annuler';
    btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
};

window.demanderSuppressionCandidat = function(userKey, nomComplet) {
    son('click');
    modalTitreEl.textContent = '🗑️ Supprimer ce candidat ?';
    modalTexteEl.innerHTML =
        '<p style="color:var(--muted);font-size:13px;">Tu es sur le point de supprimer définitivement :</p>'
        + '<p style="font-weight:800;font-size:15px;margin:8px 0;">' + escHTML(nomComplet || 'ce candidat') + '</p>'
        + '<p style="color:var(--red);font-weight:700;font-size:13px;">⚠️ Cette action est irréversible : compte, historique et résultats seront effacés.</p>';
    modalEl.style.display = 'flex';
    btnConfirmer.style.display = 'block';
    btnConfirmer.textContent = 'Supprimer définitivement';
    btnConfirmer.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
    btnConfirmer.onclick = async function() {
        modalEl.style.display = 'none';
        btnConfirmer.textContent = 'Confirmer';
        btnConfirmer.style.background = '';
        try {
            await Promise.all([
                db.ref('users/' + userKey).remove(),
                db.ref('presence/' + userKey).remove(),
                db.ref('salleBepc/' + userKey).remove(),
                db.ref('salleBAC/' + userKey).remove(),
                db.ref('sessionsBepc/' + userKey).remove(),
                db.ref('sessionsBAC/' + userKey).remove(),
                db.ref('resultatsBepc/' + userKey).remove(),
                db.ref('resultatsBAC/' + userKey).remove(),
                db.ref('top10All/' + userKey).remove()
            ]);
            toast('✅ Candidat supprimé', 'success');
            chargerListeCandidats();
        } catch(e) {
            toast('Erreur lors de la suppression', 'error');
        }
    };
    btnAnnuler.textContent = 'Annuler';
    btnAnnuler.onclick = function() {
        modalEl.style.display = 'none';
        btnConfirmer.textContent = 'Confirmer';
        btnConfirmer.style.background = '';
        btnAnnuler.textContent = 'Annuler';
    };
};

if (btnActiverTousEl) {
    btnActiverTousEl.onclick = async function() {
        son('click');
        modalTitreEl.textContent = 'Activer tous les candidats ?';
        modalTexteEl.textContent = 'Tous les candidats auront accès au concours. Confirmer ?';
        modalEl.style.display = 'flex';
        btnConfirmer.onclick = async function() {
            modalEl.style.display = 'none';
            try {
                var snap = await db.ref('users').once('value');
                var users = snap.val() || {};
                var updates = {};
                Object.keys(users).forEach(function(k) { updates[k + '/accesPaye'] = true; });
                await db.ref('users').update(updates);
                toast('✅ Tous activés !', 'success');
                chargerListeCandidats();
            } catch(e) { toast('Erreur','error'); }
        };
        btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
    };
}

if (btnNouveauConcoursEl) {
    btnNouveauConcoursEl.onclick = function() {
        son('click');
        modalTitreEl.textContent = '🔄 Nouveau Concours';
        modalTexteEl.innerHTML =
            '<p style="color:var(--muted);font-size:13px;">Cette action va effacer tous les résultats et sessions en cours.</p>'
            + '<p style="color:var(--red);font-weight:700;margin-top:8px;">⚠️ Action irréversible !</p>';
        modalEl.style.display = 'flex';
        btnConfirmer.onclick = async function() {
            modalEl.style.display = 'none';
            try {
                await Promise.all([
                    db.ref('resultatsBepc').remove(), db.ref('resultatsBAC').remove(),
                    db.ref('sessionsBepc').remove(), db.ref('sessionsBAC').remove(),
                    db.ref('salleBepc').remove(), db.ref('salleBAC').remove()
                ]);
                toast('✅ Nouveau concours prêt !', 'success');
                son('success');
            } catch(e) { toast('Erreur','error'); }
        };
        btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
    };
}

var btnResetTop10El = document.getElementById('btnResetTop10');
if (btnResetTop10El) {
    btnResetTop10El.onclick = function() {
        son('click');
        modalTitreEl.textContent = 'Reset Hall of Fame ?';
        modalTexteEl.textContent = 'Supprimer tous les records ?';
        modalEl.style.display = 'flex';
        btnConfirmer.onclick = async function() {
            modalEl.style.display = 'none';
            try {
                await db.ref('top10All').remove();
                toast('✅ Hall of Fame reset !', 'success');
            } catch(e) { toast('Erreur','error'); }
        };
        btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
    };
}

if (btnLogoutAdminEl) {
    btnLogoutAdminEl.onclick = function() {
        son('click');
        try { firebase.auth().signOut(); } catch(e) {}
        showPage(pageMenu);
    };
}

// ============================================
// FIN PARTIE 10/24 ✅ (CORRIGÉE — réinit. appareil)
// ============================================// ============================================
// PARTIE 11/24 — CHOIX SALLE + QUOTA 20 MIN
// ============================================

if (btnExam) {
    btnExam.onclick = function() {
        son('click');
        if (modalChoixSalle) modalChoixSalle.style.display = 'flex';
    };
}
if (btnAnnulerChoixSalle) {
    btnAnnulerChoixSalle.onclick = function() {
        son('click');
        if (modalChoixSalle) modalChoixSalle.style.display = 'none';
    };
}
if (btnChoixBepc) {
    btnChoixBepc.onclick = function() {
        son('click');
        if (modalChoixSalle) modalChoixSalle.style.display = 'none';
        salleActive = 'bepc';
        entrerDansSalle('bepc');
    };
}
if (btnChoixBAC) {
    btnChoixBAC.onclick = function() {
        son('click');
        if (modalChoixSalle) modalChoixSalle.style.display = 'none';
        salleActive = 'bac';
        entrerDansSalle('bac');
    };
}
if (btnRetourSalleAttenteBepc) {
    btnRetourSalleAttenteBepc.onclick = function() {
        son('click');
        if (salleAttenteBepcEl) salleAttenteBepcEl.style.display = 'none';
        chargerMenu(userData);
    };
}
if (btnRetourSalleAttenteBac) {
    btnRetourSalleAttenteBac.onclick = function() {
        son('click');
        if (salleAttenteBacEl) salleAttenteBacEl.style.display = 'none';
        chargerMenu(userData);
    };
}
if (btnRetourSalleRetard) {
    btnRetourSalleRetard.onclick = function() {
        son('click');
        var el = document.getElementById('salle-retard');
        if (el) el.style.display = 'none';
        chargerMenu(userData);
    };
}

function cacherToutSauf() {
    if (salleAttenteBepcEl) salleAttenteBepcEl.style.display = 'none';
    if (salleAttenteBacEl) salleAttenteBacEl.style.display = 'none';
    var srEl = document.getElementById('salle-retard');
    if (srEl) srEl.style.display = 'none';
    if (questionsEl) questionsEl.style.display  = 'none';
    if (attenteEl) attenteEl.style.display    = 'none';
    if (resultatEl) resultatEl.style.display   = 'none';
    var footer = document.querySelector('#page-exam .footer');
    var header = document.querySelector('#page-exam .header');
    var subhead = document.querySelector('#page-exam .subheader');
    if (footer)  footer.style.display  = 'none';
    if (header)  header.style.display  = 'none';
    if (subhead) subhead.style.display = 'none';
}

async function verifierQuotaSalle(salle) {
    var salleNode = salle === 'bepc' ? 'salleBepc' : 'salleBAC';
    var quotaKey  = salle === 'bepc' ? 'maxBepc' : 'maxBAC';
    var DUREE_MS  = 20 * 60 * 1000;
    var now       = Date.now();
    try {
        var results = await Promise.all([ db.ref(salleNode).once('value'), db.ref('configQuota').once('value') ]);
        var salleSnap = results[0];
        var quota = results[1].val() || {};
        var maxPlaces = quota[quotaKey] || 200;
        var updates = {}, actifs = 0, dejaPresent = false;
        salleSnap.forEach(function(child) {
            var data = child.val();
            if (!data) return;
            if (child.key === user) { dejaPresent = true; actifs++; return; }
            var age = now - (data.entreeTs||0);
            if (age > DUREE_MS) updates[child.key] = null;
            else actifs++;
        });
        if (Object.keys(updates).length > 0) {
            await db.ref(salleNode).update(updates);
            var nb = Object.keys(updates).length;
            actifs -= nb;
            if (actifs < 0) actifs = 0;
        }
        return { ok: dejaPresent || actifs < maxPlaces, actifs: actifs, max: maxPlaces, dejaPresent: dejaPresent };
    } catch(e) {
        return { ok:true, actifs:0, max:200, dejaPresent:false };
    }
}

async function enregistrerDansSalle(salle) {
    var salleNode = salle === 'bepc' ? 'salleBepc' : 'salleBAC';
    try {
        await db.ref(salleNode + '/' + user).set({
            entreeTs: Date.now(), prenom: userData.prenom || '', nom: userData.nom || ''
        });
        setTimeout(async function() {
            try { await db.ref(salleNode + '/' + user).remove(); } catch(e) {}
        }, 20 * 60 * 1000);
    } catch(e) {}
}

async function quitterSalle(salle) {
    var salleNode = salle === 'bepc' ? 'salleBepc' : 'salleBAC';
    try { await db.ref(salleNode + '/' + user).remove(); } catch(e) {}
}

function afficherSallePleine(salle, actifs, max) {
    showPage(pageMenu);
    modalTitreEl.textContent = '⏳ Salle complète';
    modalTexteEl.innerHTML =
        '<div style="text-align:center;padding:10px 0;">'
        + '<div style="font-size:56px;margin-bottom:14px;">😔</div>'
        + '<p style="font-weight:800;font-size:16px;color:var(--text);margin-bottom:10px;">'
        + 'La salle ' + salle.toUpperCase() + ' est complète</p>'
        + '<div style="background:rgba(249,115,22,0.1);border:1.5px solid rgba(249,115,22,0.3);'
        + 'border-radius:14px;padding:14px;margin-bottom:14px;">'
        + '<div style="font-size:28px;font-weight:900;color:var(--orange);">' + actifs + ' / ' + max + '</div>'
        + '<div style="font-size:12px;color:var(--muted);margin-top:4px;">participants actifs</div></div>'
        + '<p style="color:var(--muted);font-size:13px;line-height:1.8;">'
        + 'Les places se libèrent après <b>20 minutes</b>.<br>'
        + 'En attendant, entraîne-toi !<br>Sois à l\'heure pour le prochain concours 💪</p></div>';
    modalEl.style.display      = 'flex';
    btnConfirmer.style.display = 'block';
    btnConfirmer.textContent   = '🎯 S\'entraîner maintenant';
    btnConfirmer.style.background = 'linear-gradient(135deg,#1a6b3c,#22c55e)';
    btnConfirmer.onclick = function() {
        modalEl.style.display = 'none';
        btnConfirmer.textContent = 'Confirmer';
        btnConfirmer.style.background = '';
        btnAnnuler.textContent = 'Annuler';
        afficherPageEntrainement();
    };
    btnAnnuler.textContent = '← Retour';
    btnAnnuler.onclick = function() {
        modalEl.style.display = 'none';
        btnConfirmer.textContent = 'Confirmer';
        btnConfirmer.style.background = '';
        btnAnnuler.textContent = 'Annuler';
    };
}

async function verifierEtLancer(salle, resultNode, sessionNode) {
    cacherToutSauf();
    var loading = document.createElement('div');
    loading.id  = 'loadingQuota';
    loading.style.cssText = 'text-align:center;padding:60px 20px;';
    loading.innerHTML = '<div class="loader"></div><p style="color:var(--muted);margin-top:16px;font-weight:600;">Vérification de la salle...</p>';
    if (pageExam) pageExam.appendChild(loading);
    var resultat = await verifierQuotaSalle(salle);
    var ld = document.getElementById('loadingQuota');
    if (ld && ld.parentNode) ld.parentNode.removeChild(ld);
    if (!resultat.ok) { afficherSallePleine(salle, resultat.actifs, resultat.max); return; }
    await enregistrerDansSalle(salle);
    lancerExamen(salle, resultNode, sessionNode);
}

async function entrerDansSalle(salle) {
    var configNode  = salle === 'bepc' ? 'configBepc'    : 'configBAC';
    var sujetNode   = salle === 'bepc' ? 'sujetBepc'     : 'sujetBAC';
    var resultNode  = salle === 'bepc' ? 'resultatsBepc' : 'resultatsBAC';
    var sessionNode = salle === 'bepc' ? 'sessionsBepc'  : 'sessionsBAC';

    var userSnap = await db.ref('users/' + user).once('value');
    var uFresh   = userSnap.val() || {};
    if (!uFresh.accesPaye) {
        modalTitreEl.textContent = 'Accès au concours';
        modalTexteEl.innerHTML =
            '<div style="text-align:center;padding:10px 0"><div style="font-size:50px;margin-bottom:16px">💳</div>'
            + '<p style="font-weight:800;font-size:16px;margin-bottom:12px">Accès payant : 100 FCFA</p>'
            + '<p style="color:var(--muted);font-size:13px;line-height:1.7;">Orange Money au :<br><br>'
            + '<span style="font-size:22px;font-weight:900;color:var(--green)">55 24 04 31</span><br><br>'
            + 'Envoie la capture WhatsApp.</p></div>';
        modalEl.style.display = 'flex';
        btnConfirmer.style.display = 'none';
        btnAnnuler.textContent = 'Fermer';
        btnAnnuler.onclick = function() {
            modalEl.style.display = 'none';
            btnConfirmer.style.display = '';
            btnAnnuler.textContent = 'Annuler';
        };
        return;
    }

    var configSnap = await db.ref(configNode).once('value');
    configActuelle = configSnap.val();
    if (!configActuelle || !configActuelle.debutTimestamp || !configActuelle.finTimestamp) {
        modalTitreEl.textContent = 'Salle non disponible';
        modalTexteEl.innerHTML =
            '<div style="text-align:center;padding:16px 0;"><div style="font-size:48px;margin-bottom:12px;">🚫</div>'
            + '<p style="font-weight:800;font-size:15px;margin-bottom:10px;">Aucun concours configuré</p>'
            + '<p style="color:var(--muted);font-size:13px;">L\'admin n\'a pas encore programmé de concours.</p></div>';
        modalEl.style.display = 'flex';
        btnConfirmer.style.display = 'none';
        btnAnnuler.textContent = '← Retour';
        btnAnnuler.onclick = function() {
            modalEl.style.display = 'none';
            btnConfirmer.style.display = '';
            btnAnnuler.textContent = 'Annuler';
            salleActive = '';
            chargerMenu(userData);
        };
        return;
    }

    var sujetSnap = await db.ref(sujetNode).once('value');
    questionsData = sujetSnap.val() || [];
    if (questionsData.length === 0) {
        modalTitreEl.textContent = 'Salle non disponible';
        modalTexteEl.innerHTML =
            '<div style="text-align:center;padding:16px 0;"><div style="font-size:48px;margin-bottom:12px;">📭</div>'
            + '<p style="font-weight:800;font-size:15px;margin-bottom:10px;">Aucune question chargée</p>'
            + '<p style="color:var(--muted);font-size:13px;">L\'admin n\'a pas encore chargé les questions.</p></div>';
        modalEl.style.display = 'flex';
        btnConfirmer.style.display = 'none';
        btnAnnuler.textContent = '← Retour';
        btnAnnuler.onclick = function() {
            modalEl.style.display = 'none';
            btnConfirmer.style.display = '';
            btnAnnuler.textContent = 'Annuler';
            salleActive = '';
            chargerMenu(userData);
        };
        return;
    }

    var now = Date.now();
    finTimestamp = configActuelle.finTimestamp;

    var salleBadge = document.getElementById('salleBadgeResultat');
    if (salleBadge) {
        salleBadge.innerHTML =
            '<span style="display:inline-block;padding:5px 16px;border-radius:20px;font-size:13px;font-weight:800;'
            + (salle === 'bepc'
                ? 'background:rgba(59,130,246,0.1);border:1.5px solid rgba(59,130,246,0.3);color:var(--blue);">📘 BEPC'
                : 'background:rgba(26,107,60,0.1);border:1.5px solid rgba(26,107,60,0.3);color:var(--primary);">📗 BAC')
            + '</span>';
    }

    if (now < configActuelle.debutTimestamp) {
        showPage(pageExam);
        cacherToutSauf();
        var salleAtEl = salle === 'bepc' ? salleAttenteBepcEl : salleAttenteBacEl;
        var hEl = document.getElementById(salle === 'bepc' ? 'heureDebutAffichBepc' : 'heureDebutAffichBac');
        var tEl = document.getElementById(salle === 'bepc' ? 'timerDebutBepc' : 'timerDebutBac');
        if (salleAtEl) salleAtEl.style.display = 'block';
        if (hEl) hEl.textContent = new Date(configActuelle.debutTimestamp).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'});
        var intvAt = setInterval(function() {
            var reste = configActuelle.debutTimestamp - Date.now();
            if (reste <= 0) {
                clearInterval(intvAt);
                if (salleAtEl) salleAtEl.style.display = 'none';
                finTimestamp = configActuelle.finTimestamp;
                verifierEtLancer(salle, resultNode, sessionNode);
                return;
            }
            var h = Math.floor(reste/3600000);
            var m = Math.floor((reste%3600000)/60000);
            var s = Math.floor((reste%60000)/1000);
            if (tEl) tEl.textContent = pad(h)+':'+pad(m)+':'+pad(s);
        }, 1000);
        return;
    }

    if (now > configActuelle.finTimestamp) {
        await quitterSalle(salle);
        var resSnapFin = await db.ref(resultNode + '/' + user).once('value');
        if (resSnapFin.exists()) {
            var resFin = resSnapFin.val();
            if (resFin.timestamp >= configActuelle.debutTimestamp && resFin.prenom) {
                showPage(pageExam);
                cacherToutSauf();
                var hdr = document.querySelector('#page-exam .header');
                if (hdr) hdr.style.display = 'flex';
                reponsesFinales = resFin.reponses || {};
                afficherResultat(resFin.score, resFin.bonnes, resFin.partielles, resFin.fausses, resFin.xp, salle, resultNode);
            } else { toast('Concours terminé','error'); chargerMenu(userData); }
        } else { toast('Concours terminé','error'); chargerMenu(userData); }
        return;
    }

    var resSnap2 = await db.ref(resultNode + '/' + user).once('value');
    if (resSnap2.exists()) {
        var res2 = resSnap2.val();
        if (res2.timestamp >= configActuelle.debutTimestamp) {
            showPage(pageExam);
            cacherToutSauf();
            reponsesFinales = res2.reponses || {};
            if (now < finTimestamp) {
                afficherAttenteDepuisResultatExistant(res2, salle, resultNode);
            } else {
                var hdr2 = document.querySelector('#page-exam .header');
                if (hdr2) hdr2.style.display = 'flex';
                afficherResultat(res2.score, res2.bonnes, res2.partielles, res2.fausses, res2.xp, salle, resultNode);
            }
            return;
        } else {
            await db.ref(resultNode+'/'+user).remove();
            await db.ref(sessionNode+'/'+user).remove();
            toast('Nouveau concours !','success');
        }
    }

    var tempsEcoule = now - configActuelle.debutTimestamp;
    if (Math.floor(tempsEcoule/60000) > 5) {
        showPage(pageExam);
        cacherToutSauf();
        var srEl2 = document.getElementById('salle-retard');
        if (srEl2) {
            srEl2.style.display = 'block';
            var trEl = document.getElementById('timerRetard');
            var intvRet = setInterval(function() {
                var reste = finTimestamp - Date.now();
                if (reste <= 0) { clearInterval(intvRet); return; }
                var mr = Math.floor(reste/60000);
                var sr = Math.floor((reste%60000)/1000);
                if (trEl) trEl.textContent = pad(mr)+':'+pad(sr);
            }, 1000);
            var btnCR = document.getElementById('btnCommencerRetard');
            if (btnCR) {
                btnCR.onclick = async function() {
                    clearInterval(intvRet);
                    srEl2.style.display = 'none';
                    nbSorties = 0; copieSubmise = false; enExamen = false;
                    await verifierEtLancer(salle, resultNode, sessionNode);
                };
            }
        }
        return;
    }

    nbSorties = 0; copieSubmise = false; enExamen = false;
    showPage(pageExam);
    cacherToutSauf();
    await verifierEtLancer(salle, resultNode, sessionNode);
}

// ============================================
// FIN PARTIE 11/24 ✅
// ============================================// ============================================
// PARTIE 12/24 — LANCER EXAMEN + QUESTIONS
// CORRIGÉ : en cas de session bloquée (4 sorties),
// on affiche le mode lecture seule (au lieu de kick),
// pour que la copie soit notée normalement à la fin.
// ============================================

async function lancerExamen(salle, resultNode, sessionNode) {
    enExamen = true;
    _salleAntiTriche   = salle;
    _resultNodeGlobal  = resultNode;
    _sessionNodeGlobal = sessionNode;

    cacherToutSauf();
    if (questionsEl) questionsEl.style.display = 'block';
    var footer = document.querySelector('#page-exam .footer');
    var header = document.querySelector('#page-exam .header');
    var subhead = document.querySelector('#page-exam .subheader');
    if (footer)  footer.style.display  = 'flex';
    if (header)  header.style.display  = 'flex';
    if (subhead) subhead.style.display = 'flex';

    if (nomConcoursEl)
        nomConcoursEl.textContent = (salle === 'bepc' ? '📘 BEPC — ' : '📗 BAC — ') + (configActuelle.type || 'Concours Blanc Bonogo');
    var dureeMin = Math.round((configActuelle.finTimestamp - configActuelle.debutTimestamp) / 60000);
    if (heureConcoursEl) heureConcoursEl.textContent = 'Durée : ' + dureeMin + ' min';

    var sessionSnap = await db.ref(sessionNode + '/' + user).once('value');
    var session = sessionSnap.val();

    if (session && session.finTimestamp === finTimestamp && !session.termine) {
        reponsesUser = session.reponses || {};
        nbSorties    = session.nbSorties  || 0;
        var repConv  = {};
        Object.keys(reponsesUser).forEach(function(qi) {
            var val = reponsesUser[qi];
            if (val !== null && val !== undefined) {
                repConv[qi] = (typeof val === 'object' && !Array.isArray(val)) ? Object.values(val) : val;
            }
        });
        reponsesUser = repConv;

        // CORRIGÉ : si déjà bloqué, on continue en lecture seule
        // jusqu'à la fin (plus de kick, la copie sera notée)
        if (session.bloque || nbSorties >= MAX_SORTIES) {
            afficherModeBloqueLectureSeule(salle, resultNode, sessionNode);
            return;
        }
        if (nbSorties > 0) {
            modalTitreEl.textContent = 'Reprise de session';
            modalTexteEl.innerHTML =
                '<div style="text-align:center;padding:10px 0"><div style="font-size:40px;margin-bottom:12px">📋</div>'
                + '<p style="font-weight:700;margin-bottom:10px">Ton concours a été interrompu.</p>'
                + '<div style="background:rgba(239,68,68,0.1);border:1.5px solid rgba(239,68,68,0.3);'
                + 'border-radius:12px;padding:12px;"><span style="color:var(--red);font-weight:800;font-size:14px">'
                + 'Sorties : ' + nbSorties + ' / ' + MAX_SORTIES + '</span></div>'
                + '<p style="color:var(--muted);font-size:12px;margin-top:10px;">Tes réponses précédentes ont été conservées.</p></div>';
            modalEl.style.display      = 'flex';
            btnConfirmer.style.display = 'none';
            btnAnnuler.textContent = 'Reprendre le concours';
            btnAnnuler.onclick = function() {
                modalEl.style.display      = 'none';
                btnConfirmer.style.display = '';
                btnAnnuler.textContent     = 'Annuler';
                continuerExamen(salle, resultNode, sessionNode);
            };
        } else {
            continuerExamen(salle, resultNode, sessionNode);
        }
    } else {
        reponsesUser = {};
        nbSorties    = 0;
        await db.ref(sessionNode + '/' + user).set({
            debutTimestamp: Date.now(), finTimestamp: finTimestamp,
            reponses: {}, nbSorties: 0, termine: false, bloque: false
        });
        continuerExamen(salle, resultNode, sessionNode);
    }
}

function continuerExamen(salle, resultNode, sessionNode) {
    alertesTimer = { 30:false, 20:false, 10:false, 5:false };
    afficherQuestions();
    demarrerTimer();
    demarrerAntiTriche(salle, resultNode, sessionNode);
    demarrerTimerSecurite(salle, resultNode, sessionNode);
}

function afficherQuestions() {
    if (!questionsEl) return;
    questionsEl.innerHTML = '';
    questionsData.forEach(function(q, qi) {
        var block = document.createElement('div');
        block.className = 'question-block';
        block.id = 'q-' + qi;
        var texteConv = convertirMath(q.texte || '');
        var html =
            '<div class="question-numero">QUESTION ' + (qi+1) + ' / ' + questionsData.length + '</div>'
            + '<div class="question-texte">' + texteConv + '</div>'
            + '<div class="reponses-liste">';
        (q.reponses||[]).forEach(function(r, ri) {
            var repUser = reponsesUser[qi];
            var repCh   = repUser === undefined ? [] : (Array.isArray(repUser) ? repUser : [repUser]);
            var sel = repCh.indexOf(ri) !== -1;
            var repT = convertirMath(r.texte || '');
            var lettres = ['A','B','C','D'];
            html +=
                '<div class="rep-item' + (sel ? ' selected' : '') + '" data-q="' + qi + '" data-r="' + ri + '">'
                + '<span class="rep-lettre">' + lettres[ri] + '</span>'
                + '<span class="rep-texte">' + repT + '</span></div>';
        });
        html += '</div>';
        block.innerHTML = html;
        block.querySelectorAll('.rep-item').forEach(function(div) {
            div.addEventListener('click', function() {
                son('click');
                var q2 = parseInt(this.dataset.q);
                var r2 = parseInt(this.dataset.r);
                var current = [];
                if (Array.isArray(reponsesUser[q2])) current = reponsesUser[q2].slice();
                else if (reponsesUser[q2] !== undefined) current = [reponsesUser[q2]];
                var idx = current.indexOf(r2);
                if (idx === -1) current.push(r2);
                else current.splice(idx, 1);
                if (current.length > 0) reponsesUser[q2] = current;
                else delete reponsesUser[q2];
                var parentListe = this.closest('.reponses-liste');
                if (parentListe) {
                    parentListe.querySelectorAll('.rep-item').forEach(function(item, li) {
                        if (current.indexOf(li) !== -1) item.classList.add('selected');
                        else item.classList.remove('selected');
                    });
                }
                var rep = 0;
                for (var i = 0; i < questionsData.length; i++) {
                    var rv = reponsesUser[i];
                    if (rv !== undefined && !(Array.isArray(rv) && rv.length === 0)) rep++;
                }
                if (restantEl) restantEl.textContent = rep + '/' + questionsData.length;
                sauvegarderSession(_sessionNodeGlobal);
            });
        });
        questionsEl.appendChild(block);
    });
}

function demarrerTimer() {
    if (timerInt) clearInterval(timerInt);
    timerInt = setInterval(function() {
        var reste = finTimestamp - Date.now();
        if (reste <= 0) {
            clearInterval(timerInt);
            if (timerEl) timerEl.textContent = '00:00';
            return;
        }
        var min = Math.floor(reste / 60000);
        var sec = Math.floor((reste % 60000) / 1000);
        if (timerEl) timerEl.textContent = pad(min) + ':' + pad(sec);
        if (min <= 5 && timerEl) timerEl.classList.add('warning');
        [30,20,10,5].forEach(function(m) {
            if (min === m && !alertesTimer[m]) {
                alertesTimer[m] = true;
                toast('⏰ '+m+' min restantes !', 'warning');
                son('alerte');
            }
        });
    }, 1000);
}

async function sauvegarderSession(sessionNode) {
    if (!user || !sessionNode) return;
    try {
        await db.ref(sessionNode + '/' + user).update({
            reponses: reponsesUser, nbSorties: nbSorties, lastSave: Date.now()
        });
    } catch(e) {}
}

setInterval(async function() {
    if (enExamen && !copieSubmise && user && Object.keys(reponsesUser).length > 0) {
        await sauvegarderSession(_sessionNodeGlobal);
    }
}, 15000);

// ============================================
// FIN PARTIE 12/24 ✅ (CORRIGÉE)
// ============================================// ============================================
// PARTIE 13/24 — ANTI-TRICHE
// CORRIGÉ :
// - sauvegarde immédiate des réponses dès la mise
//   en arrière-plan (plus de perte au retour dans l'app)
// - 4e sortie = mode lecture seule (note comptée à la
//   fin comme tout le monde), plus d'exclusion/kick
// ============================================

function gererVisibilite() {
    if (!enExamen || copieSubmise) return;
    if (document.hidden) {
        derniereFocus = Date.now();
        // Sauvegarde immédiate pour ne rien perdre si l'app est fermée
        sauvegarderSession(_sessionNodeGlobal);
        if (sortieTimeout) clearTimeout(sortieTimeout);
        sortieTimeout = setTimeout(function() {
            if (document.hidden && enExamen) {
                nbSorties++;
                sauvegarderSession(_sessionNodeGlobal);
                if (nbSorties >= MAX_SORTIES) {
                    bloquerDevour(_salleAntiTriche, _resultNodeGlobal, _sessionNodeGlobal);
                } else {
                    toast('⚠️ Sortie détectée ! ' + nbSorties + '/' + MAX_SORTIES, 'error');
                }
            }
        }, DELAI_SORTIE_MS);
    } else {
        if (sortieTimeout) { clearTimeout(sortieTimeout); sortieTimeout = null; }
    }
}

function gererBlur() {
    if (!enExamen || copieSubmise) return;
    derniereFocus = Date.now();
    sauvegarderSession(_sessionNodeGlobal);
}

function gererFocus() {
    if (!enExamen || copieSubmise) return;
    var duree = Date.now() - derniereFocus;
    if (duree > DELAI_SORTIE_MS) {
        nbSorties++;
        sauvegarderSession(_sessionNodeGlobal);
        if (nbSorties >= MAX_SORTIES) {
            bloquerDevour(_salleAntiTriche, _resultNodeGlobal, _sessionNodeGlobal);
        } else {
            toast('⚠️ Absence détectée ! ' + nbSorties + '/' + MAX_SORTIES, 'error');
        }
    }
}

function demarrerAntiTriche(salle, resultNode, sessionNode) {
    document.addEventListener('visibilitychange', gererVisibilite);
    window.addEventListener('blur', gererBlur);
    window.addEventListener('focus', gererFocus);
}

// === CORRIGÉ : mode lecture seule au lieu d'exclusion ===
async function bloquerDevour(salle, resultNode, sessionNode) {
    if (copieSubmise) return;
    document.removeEventListener('visibilitychange', gererVisibilite);
    window.removeEventListener('blur', gererBlur);
    window.removeEventListener('focus', gererFocus);
    try {
        await db.ref(sessionNode + '/' + user).update({ bloque: true, nbSorties: nbSorties });
    } catch(e) {}
    activerModeLectureSeule();
    toast('🚫 Trop de sorties (' + nbSorties + '/' + MAX_SORTIES + '). Tes réponses actuelles seront comptées normalement à la fin de l\'épreuve.', 'error');
}

function activerModeLectureSeule() {
    if (questionsEl) {
        questionsEl.querySelectorAll('.rep-item').forEach(function(el) {
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.55';
        });
    }
    if (btnFinir) btnFinir.disabled = true;
    if (btnNonRep) btnNonRep.disabled = true;
    if (!document.getElementById('bandeauBloque') && questionsEl) {
        var banniere = document.createElement('div');
        banniere.id = 'bandeauBloque';
        banniere.style.cssText =
            'position:sticky;top:0;background:linear-gradient(135deg,#ef4444,#dc2626);'
            + 'color:white;padding:12px 16px;border-radius:12px;font-size:13px;'
            + 'font-weight:700;text-align:center;margin-bottom:14px;z-index:5;';
        banniere.textContent = '🚫 Sorties dépassées — lecture seule. Ta copie sera notée normalement à la fin de l\'épreuve.';
        questionsEl.insertBefore(banniere, questionsEl.firstChild);
    }
}

// Reprise d'une session déjà bloquée (au retour dans l'app)
function afficherModeBloqueLectureSeule(salle, resultNode, sessionNode) {
    cacherToutSauf();
    if (questionsEl) questionsEl.style.display = 'block';
    var footer = document.querySelector('#page-exam .footer');
    var header = document.querySelector('#page-exam .header');
    var subhead = document.querySelector('#page-exam .subheader');
    if (footer) footer.style.display = 'flex';
    if (header) header.style.display = 'flex';
    if (subhead) subhead.style.display = 'flex';
    afficherQuestions();
    activerModeLectureSeule();
    demarrerTimer();
    demarrerTimerSecurite(salle, resultNode, sessionNode);
}

// === CORRIGÉ : ne bloque plus indéfiniment si hors-ligne ===
function demarrerTimerSecurite(salle, resultNode, sessionNode) {
    var tempsRestant = finTimestamp - Date.now();
    if (tempsRestant > 0) {
        setTimeout(function() {
            verifierFinExamen(salle, resultNode, sessionNode);
        }, tempsRestant);
    }
}

function verifierFinExamen(salle, resultNode, sessionNode) {
    if (!enExamen || copieSubmise) return;
    if (navigator.onLine === false) {
        // Hors-ligne à la fin de l'heure : on attend la reconnexion
        // sans verrouiller la saisie, comme demandé.
        toast('⏰ Temps écoulé — en attente de connexion pour valider ta copie...', 'warning');
        setTimeout(function() { verifierFinExamen(salle, resultNode, sessionNode); }, 5000);
        return;
    }
    toast('⏰ Temps écoulé ! Soumission automatique.', 'error');
    soumettreEtAttendre(salle, resultNode, sessionNode);
}

// ============================================
// FIN PARTIE 13/24 ✅ (CORRIGÉE)
// ============================================// ============================================
// PARTIE 14/24 — CALCULER SCORE MULTI-RÉPONSES
// CORRIGÉ : la soumission ne reste plus bloquée
// indéfiniment si la connexion est coupée
// (timeout de 7s -> bascule automatique en mode
// "sauvegardé localement, sera synchronisé")
// ============================================

function getBonnesIdx(q) {
    if (!q || !q.reponses) return [];
    return q.reponses.map(function(r, ri) { return r && r.correct ? ri : -1; }).filter(function(x) { return x !== -1; });
}

function avecTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise(function(_, reject) {
            setTimeout(function() { reject(new Error('timeout_reseau')); }, ms);
        })
    ]);
}

function calculerScore(reponses) {
    var bonnes = 0, partielles = 0, fausses = 0, scoreReel = 0;

    questionsData.forEach(function(q, qi) {
        var repUser = reponses[qi];
        if (repUser === undefined || repUser === null || (Array.isArray(repUser) && repUser.length === 0)) {
            fausses++;
            reponsesFinales[qi] = { statut:'vide', user:[], bonnes:getBonnesIdx(q), points:0, maxPoints:1 };
            return;
        }
        var userChoix = Array.isArray(repUser) ? repUser : [repUser];
        var bonnesIdx = getBonnesIdx(q);
        if (bonnesIdx.length === 0) {
            fausses++;
            reponsesFinales[qi] = { statut:'vide', user:userChoix, bonnes:[], points:0, maxPoints:1 };
            return;
        }
        var mauvaisesChoisies = userChoix.filter(function(r) { return bonnesIdx.indexOf(r) === -1; });
        if (mauvaisesChoisies.length > 0) {
            fausses++;
            reponsesFinales[qi] = { statut:'fausse', user:userChoix, bonnes:bonnesIdx, points:0, maxPoints:1 };
            return;
        }
        var poids = calculerPoidsReponses(q);
        var pointsGagnes = 0;
        userChoix.forEach(function(ri) {
            var p = poids.find(function(pw) { return pw.idx === ri; });
            if (p) pointsGagnes += p.poids;
        });
        pointsGagnes = Math.round(pointsGagnes * 100) / 100;
        var statut;
        var bonnesChoisies = userChoix.filter(function(r) { return bonnesIdx.indexOf(r) !== -1; });
        if (bonnesChoisies.length === bonnesIdx.length) { statut = 'bonne'; bonnes++; scoreReel += 1; }
        else if (bonnesChoisies.length > 0) { statut = 'partielle'; partielles++; scoreReel += pointsGagnes; }
        else { statut = 'fausse'; fausses++; }
        reponsesFinales[qi] = { statut: statut, user: userChoix, bonnes: bonnesIdx, points: pointsGagnes, maxPoints: 1, poids: poids };
    });
    return { score: Math.round(scoreReel), scoreReel: scoreReel, bonnes: bonnes, partielles: partielles, fausses: fausses };
}

if (btnNonRep) {
    btnNonRep.onclick = function() {
        son('click');
        var nonRep = [];
        questionsData.forEach(function(q, qi) {
            var rv = reponsesUser[qi];
            if (rv === undefined || (Array.isArray(rv) && rv.length === 0)) nonRep.push(qi + 1);
        });
        if (nonRep.length === 0) { toast('✅ Toutes répondues !', 'success'); return; }
        modalTitreEl.textContent = '📋 Questions non répondues';
        modalTexteEl.innerHTML =
            '<p style="color:var(--muted);margin-bottom:12px;font-size:13px;">' + nonRep.length + ' question(s) sans réponse :</p>'
            + '<div style="display:flex;flex-wrap:wrap;gap:8px;">'
            + nonRep.map(function(n) {
                return '<button onclick="allerQuestion(' + n + ')" style="padding:8px 14px;background:rgba(239,68,68,0.1);'
                    + 'border:1.5px solid var(--red);color:var(--red);border-radius:10px;font-weight:800;font-size:14px;'
                    + 'cursor:pointer;font-family:Poppins,sans-serif;min-height:auto;width:auto;margin:0;">Q' + n + '</button>';
            }).join('') + '</div>';
        modalEl.style.display      = 'flex';
        btnConfirmer.style.display = 'none';
        btnAnnuler.textContent     = 'Fermer';
        btnAnnuler.onclick = function() {
            modalEl.style.display      = 'none';
            btnConfirmer.style.display = '';
            btnAnnuler.textContent     = 'Annuler';
        };
    };
}

window.allerQuestion = function(num) {
    modalEl.style.display      = 'none';
    btnConfirmer.style.display = '';
    btnAnnuler.textContent     = 'Annuler';
    var el = document.getElementById('q-' + (num - 1));
    if (el) el.scrollIntoView({ behavior:'smooth', block:'center' });
};

if (btnFinir) {
    btnFinir.onclick = function() {
        son('click');
        var nonRep = [];
        questionsData.forEach(function(q, qi) {
            var rv = reponsesUser[qi];
            if (rv === undefined || (Array.isArray(rv) && rv.length === 0)) nonRep.push(qi + 1);
        });
        var msgNR = nonRep.length > 0
            ? '<div style="background:rgba(249,115,22,0.1);border:1.5px solid rgba(249,115,22,0.3);'
            + 'border-radius:12px;padding:12px;margin:12px 0;"><span style="color:var(--orange);font-weight:800;">⚠️ '
            + nonRep.length + ' question(s) sans réponse</span></div>'
            : '<div style="background:rgba(34,197,94,0.1);border:1.5px solid rgba(34,197,94,0.3);'
            + 'border-radius:12px;padding:12px;margin:12px 0;"><span style="color:var(--green);font-weight:800;">'
            + '✅ Toutes répondues</span></div>';
        modalTitreEl.textContent = 'Terminer le concours ?';
        modalTexteEl.innerHTML =
            '<p style="color:var(--muted);font-size:13px;margin-bottom:8px;">Remettre ta copie ?</p>' + msgNR
            + '<p style="color:var(--muted);font-size:12px;">Cette action est irréversible.</p>';
        modalEl.style.display = 'flex';
        btnConfirmer.onclick = async function() {
            modalEl.style.display = 'none';
            await soumettreEtAttendre(_salleAntiTriche, _resultNodeGlobal, _sessionNodeGlobal);
        };
        btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
    };
}

async function soumettreEtAttendre(salle, resultNode, sessionNode) {
    if (copieSubmise) return;
    copieSubmise = true;
    enExamen     = false;
    if (timerInt) clearInterval(timerInt);
    document.removeEventListener('visibilitychange', gererVisibilite);
    window.removeEventListener('blur', gererBlur);
    window.removeEventListener('focus', gererFocus);

    var resultat = calculerScore(reponsesUser);
    var xpG = calcXp(resultat.score, 50);

    try {
        var xpActuel  = userData.xp || 0;
        var newXp     = xpActuel + xpG;
        var newNiv    = Math.floor(newXp / 100) + 1;
        var newNbConc = (userData.concoursFaits || 0) + 1;
        var newMoy = Math.round(((userData.moyenne || 0) * (newNbConc - 1) + resultat.score) / newNbConc);

        var entreeHisto = {
            salle: salle.toUpperCase(),
            type:  configActuelle.type || ('Concours Blanc ' + salle.toUpperCase()),
            score: resultat.score, scoreReel: resultat.scoreReel,
            bonnes: resultat.bonnes, partielles: resultat.partielles, fausses: resultat.fausses,
            xp: xpG, nbSorties: nbSorties, timestamp: Date.now()
        };

        // CORRIGÉ : timeout de 7s pour ne jamais bloquer l'UI hors-ligne
        await avecTimeout(
            db.ref(resultNode + '/' + user).set(
                Object.assign({}, entreeHisto, { prenom: userData.prenom || '', nom: userData.nom || '', reponses: reponsesFinales })
            ), 7000
        );
        await avecTimeout(db.ref(sessionNode + '/' + user).update({ termine: true }), 7000);
        await quitterSalle(salle);

        var histoActuel = userData.historique || [];
        if (!Array.isArray(histoActuel)) histoActuel = [];
        var dejaPresent = histoActuel.some(function(h) {
            return h && Math.abs((h.timestamp||0) - entreeHisto.timestamp) < 5000
                && h.salle === entreeHisto.salle && h.score === entreeHisto.score;
        });
        if (!dejaPresent) {
            histoActuel.unshift(entreeHisto);
            if (histoActuel.length > 50) histoActuel = histoActuel.slice(0, 50);
        }
        await avecTimeout(db.ref('users/' + user).update({
            xp: newXp, niveau: newNiv, concoursFaits: newNbConc, moyenne: newMoy, historique: histoActuel
        }), 7000);
        userData.xp = newXp; userData.niveau = newNiv;
        userData.concoursFaits = newNbConc; userData.moyenne = newMoy; userData.historique = histoActuel;
        try { localStorage.setItem('bb_userData', JSON.stringify(userData)); } catch(ex) {}
        await verifierBadges(resultat.score, nbSorties);
        await verifierTop10(resultat.score, userData.prenom || '', userData.nom || '');
    } catch(err) {
        var pending = {
            prenom: userData.prenom || '', nom: userData.nom || '',
            score: resultat.score, scoreReel: resultat.scoreReel,
            bonnes: resultat.bonnes, partielles: resultat.partielles, fausses: resultat.fausses,
            reponses: reponsesFinales, xp: xpG, timestamp: Date.now(),
            type: (configActuelle && configActuelle.type) || ('Concours Blanc ' + salle.toUpperCase())
        };
        localStorage.setItem('bb_pending_' + salle + '_' + user, JSON.stringify(pending));
        toast('📴 Hors ligne — ta copie est sauvegardée sur ton téléphone et sera envoyée dès le retour du réseau.', 'error');
    }
    afficherAttente(resultat.score, resultat.bonnes, resultat.partielles, resultat.fausses, xpG, salle, resultNode);
}

// ============================================
// FIN PARTIE 14/24 ✅ (CORRIGÉE)
// ============================================// ============================================
// PARTIE 15/24 — RÉSULTAT + CORRECTION
// ============================================

async function afficherResultat(score, bonnes, partielles, fausses, xpG, salle, resultNode) {
    cacherToutSauf();
    if (resultatEl) resultatEl.style.display = 'block';
    var scoreSur50 = Math.min(score, 50);
    var pct        = getPct(scoreSur50, 50);
    var men        = getMention(scoreSur50);
    if (scoreEl) scoreEl.textContent = scoreSur50+'/50';
    if (xpGagneEl) xpGagneEl.textContent = '+'+(xpG||0);
    if (bonnesEl) bonnesEl.textContent = bonnes||0;
    if (partiellesEl) partiellesEl.textContent = partielles||0;
    if (faussesEl) faussesEl.textContent = fausses||0;
    if (mentionResultatEl) {
        mentionResultatEl.textContent = men;
        mentionResultatEl.className = 'mention-tag ' + getMentionTagClass(scoreSur50);
    }
    var rangInfo = getTitreRang(userData.xp || 0);
    var trEl = document.getElementById('titreRangRes');
    if (trEl) trEl.textContent = rangInfo.emoji+' '+rangInfo.titre;
    if (sortiesInfoEl) {
        if (nbSorties > 0) {
            sortiesInfoEl.style.display='block';
            sortiesInfoEl.innerHTML =
                '<div style="background:rgba(249,115,22,0.1);border:1.5px solid rgba(249,115,22,0.3);'
                + 'border-radius:12px;padding:10px;margin:8px 0;font-size:13px;color:var(--orange);">⚠️ '
                + nbSorties + ' sortie(s) détectée(s)</div>';
        } else { sortiesInfoEl.style.display='none'; }
    }
    try {
        var snapAll = await db.ref(resultNode).once('value');
        var results = [];
        snapAll.forEach(function(child) {
            var v = child.val();
            if (v && v.prenom) results.push(Object.assign({key:child.key}, v));
        });
        results.sort(function(a,b) { return b.score-a.score || (a.timestamp||0)-(b.timestamp||0); });
        var monRang = results.findIndex(function(r) { return r.key === user; }) + 1;
        if (monRangResEl) {
            var med = monRang===1 ? '🥇' : monRang===2 ? '🥈' : monRang===3 ? '🥉' : '#'+monRang;
            monRangResEl.innerHTML =
                '<div style="background:rgba(26,107,60,0.1);border:1.5px solid rgba(26,107,60,0.3);'
                + 'border-radius:16px;padding:14px;margin:12px 0;">'
                + '<div style="font-size:28px;margin-bottom:4px;">' + med + '</div>'
                + '<div style="font-weight:800;font-size:14px;">Rang ' + monRang + ' sur ' + results.length + ' candidats</div></div>';
        }
    } catch(e) {}
    afficherCourbeEvolutionResultat();
    if (btnCorrection) { btnCorrection.onclick = function() { son('click'); afficherCorrection(); }; }
    if (btnVoirClass) { btnVoirClass.onclick = function() { son('click'); afficherClassement(); }; }
    if (btnRetourMenu) { btnRetourMenu.onclick = function() { son('click'); chargerMenu(userData); }; }
    var btnWA = document.getElementById('btnPartageWA');
    if (btnWA) {
        btnWA.onclick = function() {
            son('click');
            var msg =
                '🎓 *Concours Blanc Bonogo*\n' + 'Salle : ' + (salle==='bepc' ? '📘 BEPC':'📗 BAC')
                + '\nScore : *' + scoreSur50+'/50*\n' + 'Résultat : *'+pct+'%*\n' + men+'\n\n'
                + '📲 *Télécharge l\'app :*\n' + 'https://median.co/share/qdlqmbo';
            window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
        };
    }
    son('success');
    notifResultatDisponible(scoreSur50, 50);
}

async function afficherCourbeEvolutionResultat() {
    var el = document.getElementById('courbeEvolution');
    if (!el) return;
    try {
        var snap = await db.ref('users/'+user).once('value');
        var d = snap.val() || {};
        var histo = d.historique || [];
        if (!Array.isArray(histo)) histo = [];
        var vus = {};
        var histoUnique = [];
        histo.forEach(function(h) {
            if (!h) return;
            var cle = (h.timestamp||0)+'_'+(h.salle||'')+'_'+(h.score||0);
            if (!vus[cle]) { vus[cle] = true; histoUnique.push(h); }
        });
        var tries = histoUnique.slice().sort(function(a,b) { return (a.timestamp||0)-(b.timestamp||0); }).slice(-10);
        if (tries.length < 2) { el.style.display = 'none'; return; }
        el.style.display = 'block';
        var scores = tries.map(function(r) { return Math.min(r.score||0, 50); });
        var W=300, H=120, pL=30, pR=20, pT=20, pB=30;
        var gW=W-pL-pR, gH=H-pT-pB, n=scores.length;
        var pts = scores.map(function(s,i) {
            return { x: n>1 ? pL+(i/(n-1))*gW : pL+gW/2, y: pT+gH-(s/50)*gH, s:s };
        });
        var poly = pts.map(function(p) { return p.x+','+p.y; }).join(' ');
        var diff = scores[scores.length-1]-scores[0];
        var tendance =
            diff>0 ? '<div style="color:var(--primary);font-size:12px;font-weight:700;margin-top:8px;text-align:center;">📈 +'+diff+' pts</div>'
            : diff<0 ? '<div style="color:var(--orange);font-size:12px;font-weight:700;margin-top:8px;text-align:center;">📉 '+diff+' pts</div>'
            : '<div style="color:var(--muted);font-size:12px;font-weight:700;margin-top:8px;text-align:center;">➡️ Score stable</div>';
        el.innerHTML =
            '<div style="font-weight:800;font-size:13px;margin-bottom:12px;">📈 Évolution ('+n+' derniers)</div>'
            +'<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" style="width:100%;max-width:100%;overflow:visible;">'
            +'<polyline points="'+poly+'" fill="none" stroke="#1a6b3c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
            +pts.map(function(p,i) {
                var c=p.s>=40?'#22c55e':p.s>=25?'#3b82f6':p.s>=15?'#f97316':'#ef4444';
                var last=i===pts.length-1;
                return '<circle cx="'+p.x+'" cy="'+p.y+'" r="'+(last?6:4)+'" fill="'+c+'" stroke="white" stroke-width="2"/>'
                    +'<text x="'+p.x+'" y="'+(p.y-10)+'" text-anchor="middle" font-size="'+(last?11:9)+'" fill="'+c
                    +'" font-weight="'+(last?900:700)+'">'+p.s+'</text>';
            }).join('')
            +'</svg>'+tendance;
    } catch(e) {
        var el2 = document.getElementById('courbeEvolution');
        if (el2) el2.style.display='none';
    }
}

function afficherCorrection() {
    if (!correctionEl) return;
    correctionEl.innerHTML = '';
    questionsData.forEach(function(q, qi) {
        var info   = reponsesFinales[qi] || {};
        var statut = info.statut  || 'vide';
        var uRep   = info.user    || [];
        var bRep   = info.bonnes  || [];
        var points = info.points  || 0;
        var poids  = info.poids   || [];
        if (!Array.isArray(uRep)) uRep = [uRep];
        if (!Array.isArray(bRep)) bRep = [bRep];
        var ico = statut==='bonne' ? '✅' : statut==='partielle'? '⚠️' : statut==='fausse' ? '❌' : '⬜';
        var cb = statut==='bonne' ? 'var(--green)' : statut==='partielle' ? 'var(--orange)' : statut==='fausse' ? 'var(--red)' : 'var(--border)';
        var block = document.createElement('div');
        block.className = 'correction-block';
        block.style.borderLeft = '4px solid ' + cb;
        var ptHtml =
            statut==='bonne' ? '<span style="background:rgba(26,107,60,0.1);color:var(--primary);padding:2px 8px;border-radius:10px;font-size:11px;font-weight:800;">1/1 pt</span>'
            : statut==='partielle' ? '<span style="background:rgba(249,115,22,0.1);color:var(--orange);padding:2px 8px;border-radius:10px;font-size:11px;font-weight:800;">'+points+'/1 pt</span>'
            : '<span style="background:rgba(239,68,68,0.1);color:var(--red);padding:2px 8px;border-radius:10px;font-size:11px;font-weight:800;">0/1 pt</span>';
        var html =
            '<div class="correction-header"><span class="corr-num">Q'+(qi+1)+'</span>'
            +'<span class="corr-statut">'+ico+' '+(statut==='bonne' ? 'Bonne' :statut==='partielle'?'Partielle':statut==='fausse'?'Fausse':'Non répondu')+'</span>'+ptHtml+'</div>'
            +'<div class="corr-texte">'+escHTML(q.texte||'')+'</div>'
            +'<div class="corr-reps">';
        (q.reponses||[]).forEach(function(r,ri){
            var estB = bRep.indexOf(ri) !== -1;
            var estC = uRep.indexOf(ri) !== -1;
            var pw   = poids.find(function(p) { return p.idx === ri; });
            var poidsR = pw ? pw.poids : 0;
            var cls='', pref='', plabel='';
            if (estB && estC) {
                cls = 'rep-bonne-choisie'; pref = '✅ ';
                if (poidsR > 0) plabel = '<span style="font-size:10px;color:var(--primary);font-weight:800;margin-left:4px;">+'+poidsR+' pt</span>';
            } else if (estB && !estC) {
                cls = 'rep-bonne-manquee'; pref = '✅ ';
                if (poidsR > 0) plabel = '<span style="font-size:10px;color:var(--muted);font-weight:800;margin-left:4px;">'+poidsR+' pt manqué</span>';
            } else if (!estB && estC) { cls = 'rep-mauvaise-choisie'; pref = '❌ '; }
            html += '<div class="corr-rep '+cls+'"><span class="corr-lettre">'+'ABCD'[ri]+'</span><span>'+pref+escHTML(r.texte||'')+'</span>'+plabel+'</div>';
        });
        html += '</div>';
        if (q.explication) html += '<div class="corr-explication">💡 '+escHTML(q.explication)+'</div>';
        if (bRep.length > 1) {
            html += '<div style="margin-top:8px;padding:8px 10px;background:#f0fdf4;border-radius:8px;font-size:11px;color:var(--primary);">'
                + '📊 '+ bRep.length +' bonne(s) réponse(s) — '
                + (bRep.length===2 ? '0,5 pt chacune' : bRep.length===3 ? '0,5 pt + 0,25 pt + 0,25 pt' : '0,25 pt chacune') + '</div>';
        }
        block.innerHTML = html;
        correctionEl.appendChild(block);
    });
    var btnPDF = document.createElement('button');
    btnPDF.className = 'btn-primary';
    btnPDF.style.marginTop = '16px';
    btnPDF.textContent = '📄 Télécharger correction PDF';
    btnPDF.onclick = telechargerCorrectionPDF;
    correctionEl.appendChild(btnPDF);
    correctionEl.scrollIntoView({ behavior:'smooth' });
}

// ============================================
// FIN PARTIE 15/24 ✅
// ============================================// ============================================
// PARTIE 16/24 — ATTENTE + PDF CORRECTION
// CORRIGÉ : plus de bouton pour voir le résultat
// en avance. Le résultat s'affiche automatiquement
// et uniquement à l'heure exacte de fin du concours.
// ============================================

function afficherAttente(score, bonnes, partielles, fausses, xpG, salle, resultNode) {
    cacherToutSauf();
    if (attenteEl) attenteEl.style.display = 'block';
    var now   = Date.now();
    var finTs = configActuelle ? configActuelle.finTimestamp : now;
    var encore = finTs > now;

    if (!attenteEl) return;

    if (!encore) {
        // Le concours est déjà terminé : résultat visible immédiatement
        afficherResultat(score, bonnes, partielles, fausses, xpG, salle, resultNode);
        return;
    }

    attenteEl.innerHTML =
        '<div style="text-align:center;padding:40px 20px;">'
        + '<div style="font-size:64px;margin-bottom:16px;">⏳</div>'
        + '<h2 style="font-size:20px;font-weight:900;margin-bottom:8px;">Copie remise !</h2>'
        + '<p style="color:var(--muted);font-size:14px;margin-bottom:16px;">'
        + 'Ton résultat sera dévoilé automatiquement à la fin du concours, en même temps que tous les candidats.</p>'
        + '<div style="background:rgba(26,107,60,0.08);border:1.5px solid rgba(26,107,60,0.25);'
        + 'border-radius:16px;padding:18px;margin:16px 0;">'
        + '<div style="font-size:12px;color:var(--muted);font-weight:700;margin-bottom:6px;">TEMPS RESTANT</div>'
        + '<div style="font-size:32px;font-weight:900;color:var(--primary);" id="timerAttente">--:--</div></div>'
        + '<button class="btn-outline" onclick="chargerMenu(userData)">← Retour au menu</button></div>';

    var intvAt = setInterval(function() {
        var reste = finTs - Date.now();
        var tEl2 = document.getElementById('timerAttente');
        if (reste <= 0) {
            clearInterval(intvAt);
            if (tEl2) tEl2.textContent = '00:00';
            // Révélation automatique — exactement à l'heure de fin
            afficherResultat(score, bonnes, partielles, fausses, xpG, salle, resultNode);
            return;
        }
        var m = Math.floor(reste/60000);
        var s = Math.floor((reste%60000)/1000);
        if (tEl2) tEl2.textContent = pad(m)+':'+pad(s);
    }, 1000);
}

function afficherAttenteDepuisResultatExistant(res, salle, resultNode) {
    afficherAttente(res.score, res.bonnes, res.partielles, res.fausses, res.xp, salle, resultNode);
}

function telechargerCorrectionPDF() {
    son('click');
    var contenu = '=== CORRECTION CONCOURS BLANC BONOGO ===\n\n';
    questionsData.forEach(function(q, qi) {
        var info   = reponsesFinales[qi] || {};
        var statut = info.statut || 'vide';
        var points = info.points || 0;
        contenu += 'Q' + (qi+1) + '. ' + (q.texte||'') + '\n';
        contenu += 'Statut : ' + (statut==='bonne'?'✅ BONNE'
            :statut==='partielle'?'⚠️ PARTIELLE ('+points+' pt)'
            :statut==='fausse'?'❌ FAUSSE':'⬜ NON RÉPONDU') + '\n';
        (q.reponses||[]).forEach(function(r, ri) {
            var estB = (info.bonnes||[]).indexOf(ri) !== -1;
            var estC = (info.user||[]).indexOf(ri) !== -1;
            contenu += 'ABCD'[ri] + '. ' + (r.texte||'') + (estB?' ✅':'') + (estC&&!estB?' ❌':'') + '\n';
        });
        if (q.explication) contenu += '💡 ' + q.explication + '\n';
        contenu += '\n';
    });
    var blob = new Blob([contenu], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'correction_bonogo.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast('📄 Correction téléchargée !', 'success');
}

function notifResultatDisponible(score, total) {
    if (!swRegistration) return;
    try {
        swRegistration.showNotification('Résultat disponible !', {
            body: 'Score : ' + score + '/' + total + ' — ' + getMention(score),
            icon: './icon-192.png', badge: './icon-192.png'
        });
    } catch(e) {}
}

// ============================================
// FIN PARTIE 16/24 ✅ (CORRIGÉE)
// ============================================// ============================================
// PARTIE 17/24 — NOTIFICATIONS + OFFLINE
// ============================================

async function demanderPermissionNotif() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') return;
    if (Notification.permission !== 'denied') {
        try { await Notification.requestPermission(); } catch(e) {}
    }
}

function envoyerNotifLocale(titre, corps) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    try {
        new Notification(titre, { body: corps, icon: './icon-192.png', badge: './icon-192.png' });
    } catch(e) {}
}

async function syncDonneesPendantes() {
    if (!user) return;
    try {
        var keys = Object.keys(localStorage).filter(function(k) { return k.startsWith('bb_pending_'); });
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            var parts = k.split('_');
            var salle = parts[2] || 'bepc';
            var rn = salle === 'bepc' ? 'resultatsBepc' : 'resultatsBAC';
            try {
                var pending = JSON.parse(localStorage.getItem(k));
                if (pending) {
                    await db.ref(rn + '/' + user).set(pending);
                    localStorage.removeItem(k);
                    toast('✅ Résultat synchronisé !', 'success');
                }
            } catch(e2) {}
        }
    } catch(e) {}
}

window.addEventListener('online', function() {
    toast('🟢 Connexion rétablie !','success');
    syncDonneesPendantes();
});

window.addEventListener('offline', function() {
    toast('🔴 Hors connexion','error');
});

// ============================================
// FIN PARTIE 17/24 ✅
// ============================================// ============================================
// PARTIE 18/24 — ADMIN ENTRAÎNEMENT
// CORRIGÉ : remise des boutons "➕ Ajouter
// question" et "👁️ Aperçu / Modifier" à côté
// de "Charger", "Vider" et "Envoyer".
// ============================================

async function genererQuestionsIA(matId, matLabel, taId) {
    son('click');
    var ta = document.getElementById(taId);
    if (ta) ta.style.display = 'block';
    var btnCharger = document.getElementById('btnChargerColle_' + matId);
    if (btnCharger) btnCharger.style.display = 'inline-block';
    toast('📝 Colle le JSON dans la zone', 'success');
}

// Injecte compteur + Vider + Aperçu + Ajouter question, une seule fois par matière
function assurerControlesCumulEntr(matId, taId, infoId) {
    var ta = document.getElementById(taId);
    if (!ta) return;
    var wrapId = 'cumulWrap_' + matId;
    if (document.getElementById(wrapId)) return;

    var wrap = document.createElement('div');
    wrap.id = wrapId;
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin:6px 0;';

    var ligne1 = document.createElement('div');
    ligne1.style.cssText = 'display:flex;gap:8px;align-items:center;';

    var compteur = document.createElement('div');
    compteur.id = 'compteurCumul_' + matId;
    compteur.style.cssText = 'font-size:11px;font-weight:700;color:var(--primary);'
        + 'background:rgba(26,107,60,0.08);border-radius:8px;padding:4px 10px;flex:1;';
    compteur.textContent = '📦 0 question(s) en attente';

    var btnVider = document.createElement('button');
    btnVider.className = 'btn-outline btn-small';
    btnVider.style.cssText = 'width:auto;min-height:auto;padding:6px 12px;margin:0;color:var(--red);border-color:var(--red);';
    btnVider.textContent = '🗑️ Vider';
    btnVider.onclick = function() { viderSujetEntr(matId, infoId); };

    ligne1.appendChild(compteur);
    ligne1.appendChild(btnVider);

    var ligne2 = document.createElement('div');
    ligne2.style.cssText = 'display:flex;gap:8px;';

    var btnAjouter = document.createElement('button');
    btnAjouter.className = 'btn-outline btn-small';
    btnAjouter.style.cssText = 'flex:1;min-height:auto;padding:8px;margin:0;';
    btnAjouter.textContent = '➕ Ajouter question';
    btnAjouter.onclick = function() { ajouterQuestionManuelle(matId, infoId); };

    var btnApercu = document.createElement('button');
    btnApercu.className = 'btn-outline btn-small';
    btnApercu.style.cssText = 'flex:1;min-height:auto;padding:8px;margin:0;color:var(--blue);border-color:var(--blue);';
    btnApercu.textContent = '👁️ Aperçu / Modifier';
    btnApercu.onclick = function() { afficherApercuEntrModal(matId, infoId); };

    ligne2.appendChild(btnAjouter);
    ligne2.appendChild(btnApercu);

    wrap.appendChild(ligne1);
    wrap.appendChild(ligne2);
    ta.parentNode.insertBefore(wrap, ta.nextSibling);
}

function majCompteurCumul(matId) {
    var el = document.getElementById('compteurCumul_' + matId);
    var nb = (sujetsEntrAdmin[matId] || []).length;
    if (el) el.textContent = '📦 ' + nb + ' question(s) en attente';
}

// === NOUVEAU : ajouter une question vide manuellement ===
function ajouterQuestionManuelle(matId, infoId) {
    son('click');
    if (!sujetsEntrAdmin[matId]) sujetsEntrAdmin[matId] = [];
    sujetsEntrAdmin[matId].push({
        texte: '',
        reponses: [
            {texte:'', correct:true},
            {texte:'', correct:false},
            {texte:'', correct:false},
            {texte:'', correct:false}
        ],
        explication: ''
    });
    majCompteurCumul(matId);
    afficherApercuEntrModal(matId, infoId);
}

function chargerDepuisColle(matId, taId, infoId) {
    son('click');
    assurerControlesCumulEntr(matId, taId, infoId);
    var ta = document.getElementById(taId);
    if (!ta || !ta.value.trim()) { toast('Zone JSON vide','error'); return; }
    try {
        var data = JSON.parse(ta.value.trim());
        if (!Array.isArray(data) || data.length === 0) { toast('JSON invalide','error'); return; }
        var valides = data.filter(function(q) {
            return q && q.texte && Array.isArray(q.reponses) && q.reponses.length >= 2;
        });
        if (valides.length === 0) { toast('Aucune question valide','error'); return; }

        if (!sujetsEntrAdmin[matId]) sujetsEntrAdmin[matId] = [];
        sujetsEntrAdmin[matId] = sujetsEntrAdmin[matId].concat(valides);

        ta.value = '';
        majCompteurCumul(matId);

        var totalActuel = sujetsEntrAdmin[matId].length;
        var rounds = Math.floor(totalActuel / QUESTIONS_PAR_ROUND);
        var infoEl = document.getElementById(infoId);
        if (infoEl) infoEl.textContent = '✅ ' + totalActuel + ' questions cumulées (' + rounds + ' round(s) complets) — colle la suite ou clique Aperçu';
        toast('✅ ' + valides.length + ' questions ajoutées ! Total : ' + totalActuel, 'success');
    } catch(e) { toast('Erreur JSON — vérifie la syntaxe','error'); }
}

function viderSujetEntr(matId, infoId) {
    son('click');
    sujetsEntrAdmin[matId] = [];
    majCompteurCumul(matId);
    var infoEl = document.getElementById(infoId);
    if (infoEl) infoEl.textContent = '';
    toast('Zone vidée pour cette matière', 'success');
}

function afficherApercuEntrModal(matId, infoId) {
    assurerControlesCumulEntr(matId, 'ta_' + matId, infoId);
    var sujet = sujetsEntrAdmin[matId];
    if (!sujet || sujet.length === 0) { toast('Charge d\'abord au moins une partie JSON ou ajoute une question','error'); return; }

    modalTitreEl.textContent = '👁️ Aperçu — modifiable avant envoi (' + sujet.length + ' questions)';
    modalTexteEl.innerHTML = '';
    var container = document.createElement('div');
    container.style.maxHeight = '55vh';
    container.style.overflowY = 'auto';

    function rendre() {
        container.innerHTML = '';
        sujet.forEach(function(q, qi) {
            var div = document.createElement('div');
            div.className = 'admin-q-block';

            var header = document.createElement('div');
            header.className = 'admin-q-header';
            var numEl = document.createElement('div');
            numEl.className = 'admin-q-num';
            numEl.textContent = 'Q' + (qi+1) + '/' + sujet.length;
            var badgeEl = document.createElement('div');
            badgeEl.className = 'admin-q-badge';
            function majBadge() {
                var bonnes = (q.reponses||[]).filter(function(r){return r && r.correct;}).length;
                badgeEl.textContent = bonnes + ' bonne(s)';
            }
            majBadge();
            var btnSupp = document.createElement('button');
            btnSupp.className = 'btn-outline btn-small';
            btnSupp.style.cssText = 'width:auto;min-height:auto;padding:6px 12px;margin:0;color:var(--red);border-color:var(--red);';
            btnSupp.textContent = 'Supprimer';
            btnSupp.onclick = function() {
                sujet.splice(qi,1);
                majCompteurCumul(matId);
                rendre();
            };
            header.appendChild(numEl); header.appendChild(badgeEl); header.appendChild(btnSupp);
            div.appendChild(header);

            var texteArea = document.createElement('textarea');
            texteArea.className = 'admin-q-input-texte';
            texteArea.rows = 2;
            texteArea.value = q.texte || '';
            texteArea.placeholder = 'Texte de la question';
            texteArea.oninput = function() { q.texte = texteArea.value; };
            div.appendChild(texteArea);

            var repListe = document.createElement('div');
            repListe.className = 'admin-rep-liste';
            (q.reponses||[]).forEach(function(r, ri) {
                var row = document.createElement('div');
                row.className = 'admin-rep-row' + (r && r.correct ? ' est-correcte' : '');
                var cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.checked = !!(r && r.correct);
                cb.onchange = function() {
                    if (!q.reponses[ri]) return;
                    q.reponses[ri].correct = cb.checked;
                    row.classList.toggle('est-correcte', cb.checked);
                    majBadge();
                };
                var lettre = document.createElement('span');
                lettre.className = 'admin-rep-lettre';
                lettre.textContent = 'ABCD'[ri] || (ri+1);
                var texteInput = document.createElement('input');
                texteInput.type = 'text';
                texteInput.className = 'admin-rep-input';
                texteInput.value = r ? (r.texte||'') : '';
                texteInput.placeholder = 'Réponse ' + ('ABCD'[ri] || (ri+1));
                texteInput.oninput = function() { if (q.reponses[ri]) q.reponses[ri].texte = texteInput.value; };
                row.appendChild(cb); row.appendChild(lettre); row.appendChild(texteInput);
                repListe.appendChild(row);
            });
            div.appendChild(repListe);

            var expInput = document.createElement('textarea');
            expInput.className = 'admin-q-input-texte';
            expInput.rows = 2;
            expInput.style.marginTop = '8px';
            expInput.placeholder = 'Explication (facultatif)';
            expInput.value = q.explication || '';
            expInput.oninput = function() { q.explication = expInput.value; };
            div.appendChild(expInput);

            container.appendChild(div);
        });
    }
    rendre();
    modalTexteEl.appendChild(container);

    var btnAjouterModal = document.createElement('button');
    btnAjouterModal.className = 'btn-outline';
    btnAjouterModal.style.marginTop = '10px';
    btnAjouterModal.textContent = '➕ Ajouter une autre question';
    btnAjouterModal.onclick = function() {
        son('click');
        sujet.push({
            texte: '',
            reponses: [
                {texte:'', correct:true},
                {texte:'', correct:false},
                {texte:'', correct:false},
                {texte:'', correct:false}
            ],
            explication: ''
        });
        majCompteurCumul(matId);
        rendre();
    };
    modalTexteEl.appendChild(btnAjouterModal);

    modalEl.style.display = 'flex';
    btnConfirmer.style.display = 'block';
    btnConfirmer.textContent = '✅ Valider les modifications';
    btnConfirmer.onclick = function() {
        modalEl.style.display = 'none';
        btnConfirmer.textContent = 'Confirmer';
        var totalActuel = sujet.length;
        var rounds = Math.floor(totalActuel / QUESTIONS_PAR_ROUND);
        var infoEl = document.getElementById(infoId);
        if (infoEl) infoEl.textContent = '✅ ' + totalActuel + ' questions (' + rounds + ' round(s)) — modifiées, prêtes à envoyer';
        toast('Modifications enregistrées','success');
    };
    btnAnnuler.textContent = 'Fermer';
    btnAnnuler.onclick = function() {
        modalEl.style.display = 'none';
        btnAnnuler.textContent = 'Annuler';
    };
}

async function envoyerSujetEntr(matId, infoId) {
    son('click');
    var sujet = sujetsEntrAdmin[matId];
    if (!sujet || sujet.length === 0) { toast('Charger d\'abord au moins une partie JSON','error'); return; }
    var rounds = Math.floor(sujet.length / QUESTIONS_PAR_ROUND);
    if (rounds === 0) {
        toast('Il faut au moins ' + QUESTIONS_PAR_ROUND + ' questions pour former un round','error');
        return;
    }
    try {
        await db.ref('sujetsEntr/' + matId).set(sujet);
        var infoEl = document.getElementById(infoId);
        if (infoEl) infoEl.textContent = '🚀 Envoyé ! ' + sujet.length + ' questions (' + rounds + ' round(s))';
        toast('🚀 Sujet ' + matId + ' envoyé ! ' + rounds + ' round(s) disponibles','success');
        son('success');
    } catch(e) { toast('Erreur envoi','error'); }
}

// ============================================
// FIN PARTIE 18/24 ✅ (CORRIGÉE — Ajouter + Aperçu remis)
// ============================================// ============================================
// PARTIE 19/24 — PAGE ENTRAÎNEMENT
// CORRIGÉ : 6 questions par round (au lieu de 5)
// et suppression de la limite de 40 rounds —
// le nombre de rounds dépend uniquement du
// nombre de questions chargées par l'admin.
// ============================================

var QUESTIONS_PAR_ROUND = 6;

var CACHE_ENTR_PREFIX = 'bb_cache_entr_';

function sauvegarderCacheMatiere(matId, questions) {
    try {
        localStorage.setItem(CACHE_ENTR_PREFIX + matId, JSON.stringify({
            questions: questions, ts: Date.now()
        }));
    } catch(e) {}
}

function lireCacheMatiere(matId) {
    try {
        var raw = localStorage.getItem(CACHE_ENTR_PREFIX + matId);
        if (!raw) return null;
        var parsed = JSON.parse(raw);
        return (parsed && Array.isArray(parsed.questions)) ? parsed.questions : null;
    } catch(e) { return null; }
}

function aUnCacheMatiere(matId) {
    return lireCacheMatiere(matId) !== null;
}

async function recupererQuestionsMatiere(matId) {
    if (navigator.onLine === false) {
        var cache = lireCacheMatiere(matId);
        if (cache) return { questions: cache, source: 'cache' };
        return { questions: [], source: 'aucune' };
    }
    try {
        var snap = await avecTimeout(db.ref('sujetsEntr/' + matId).once('value'), 6000);
        var questions = snap.val() || [];
        if (questions.length > 0) {
            sauvegarderCacheMatiere(matId, questions);
            return { questions: questions, source: 'reseau' };
        }
        var cacheVide = lireCacheMatiere(matId);
        return { questions: cacheVide || [], source: cacheVide ? 'cache' : 'aucune' };
    } catch(e) {
        var cacheErr = lireCacheMatiere(matId);
        if (cacheErr) return { questions: cacheErr, source: 'cache' };
        return { questions: [], source: 'erreur' };
    }
}

function calculerPctMatiere(statMat) {
    var scores = (statMat && statMat.roundsScores) || {};
    var cles = Object.keys(scores);
    if (cles.length === 0) return null;
    var total = 0, max = 0;
    cles.forEach(function(k) { total += scores[k]; max += QUESTIONS_PAR_ROUND; });
    return max > 0 ? Math.round((total / max) * 100) : null;
}

function niveauCouleur(pct) {
    if (pct >= 60) return 'niv-bon';
    if (pct >= 35) return 'niv-moyen';
    return 'niv-faible';
}

function majScoreGlobalEntr() {
    var stats = (userData && userData.statsEntr) || {};
    var totalPts = 0, totalMax = 0;
    Object.keys(stats).forEach(function(matId) {
        var scores = stats[matId].roundsScores || {};
        Object.keys(scores).forEach(function(k) {
            totalPts += scores[k];
            totalMax += QUESTIONS_PAR_ROUND;
        });
    });
    var pct = totalMax > 0 ? Math.round((totalPts / totalMax) * 100) : 0;
    if (entrScoreGlobal) entrScoreGlobal.textContent = pct + '%';
    if (entrProgressGlobal) entrProgressGlobal.style.width = pct + '%';
}

function afficherPageEntrainement() {
    var toutesPages = [
        'page-accueil','page-menu','page-admin-login','page-exam',
        'page-admin','page-historique','page-stats','page-entrainement',
        'page-quiz-entr','page-resultat-entr'
    ];
    toutesPages.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    var pe = document.getElementById('page-entrainement');
    if (pe) { pe.style.display = 'block'; pageEntrainement = pe; }
    window.scrollTo(0, 0);
    chargerGrilleNiveau('bepc');
    chargerGrilleNiveau('bac');
    majScoreGlobalEntr();
}

function switchOngletEntr(niv) {
    var ob  = document.getElementById('ongletBepc');
    var ob2 = document.getElementById('ongletBac');
    var sb  = document.getElementById('sectBepc');
    var sb2 = document.getElementById('sectBac');
    if (niv === 'bepc') {
        if (ob)  ob.classList.add('active');
        if (ob2) ob2.classList.remove('active');
        if (sb)  sb.style.display  = 'block';
        if (sb2) sb2.style.display = 'none';
    } else {
        if (ob2) ob2.classList.add('active');
        if (ob)  ob.classList.remove('active');
        if (sb2) sb2.style.display = 'block';
        if (sb)  sb.style.display  = 'none';
    }
}

function chargerGrilleNiveau(niv) {
    var grille = niv === 'bepc' ? grilleBepcEl : grilleBacEl;
    if (!grille) return;
    var matieres = MATIERES_ENTR[niv] || [];
    var stats = (userData && userData.statsEntr) || {};
    grille.innerHTML = '';
    matieres.forEach(function(mat) {
        var s = stats[mat.id] || {};
        var roundsFaits = s.roundsFaits || [];
        var maxRoundsConnu = s.maxRoundsConnu || 0;
        var dispoOffline = aUnCacheMatiere(mat.id);
        var pct = calculerPctMatiere(s);

        var card = document.createElement('div');
        card.className = 'mat-card ' + mat.css;

        var pillHtml = '';
        if (maxRoundsConnu > 0) {
            if (roundsFaits.length >= maxRoundsConnu) {
                pillHtml = '<div class="mat-pill termine">✅ Terminé</div>';
            } else {
                var prochain = roundsFaits.length + 1;
                pillHtml = '<div class="mat-pill">▶ Round ' + prochain + '/' + maxRoundsConnu + '</div>';
            }
        }

        var sousLabel = maxRoundsConnu > 0
            ? (roundsFaits.length === 0
                ? (maxRoundsConnu * QUESTIONS_PAR_ROUND) + ' questions · ' + maxRoundsConnu + ' round' + (maxRoundsConnu > 1 ? 's' : '')
                : 'Round ' + Math.min(roundsFaits.length + 1, maxRoundsConnu) + '/' + maxRoundsConnu)
            : 'Pas encore chargé';

        var barreHtml = '';
        if (pct !== null) {
            var niv2 = niveauCouleur(pct);
            barreHtml =
                '<div class="mat-progress-track"><div class="mat-progress-fill ' + niv2 + '" style="width:' + pct + '%;"></div></div>'
                + '<span class="mat-pct-label ' + niv2 + '">' + pct + '%</span>';
        }

        card.innerHTML =
            pillHtml
            + '<div class="mat-emoji">' + mat.emoji + '</div>'
            + '<div class="mat-label">' + mat.label + '</div>'
            + '<div class="mat-sub-label">' + sousLabel + '</div>'
            + barreHtml
            + (dispoOffline ? '<div class="mat-offline-badge">📴 Disponible hors-ligne</div>' : '');

        card.onclick = function() { son('click'); ouvrirSelectionRound(mat, niv); };
        grille.appendChild(card);
    });
}

// === SÉLECTEUR DE ROUND — CORRIGÉ : plus de limite (Math.min(40,...) supprimé) ===
function ouvrirSelectionRound(mat, niv) {
    modalTitreEl.textContent = mat.emoji + ' ' + mat.label;
    modalTexteEl.innerHTML = '<div class="loading-box"><div class="loader"></div><p>Chargement...</p></div>';
    modalEl.style.display = 'flex';
    btnConfirmer.style.display = 'none';
    btnAnnuler.textContent = 'Fermer';
    btnAnnuler.onclick = function() { modalEl.style.display = 'none'; btnAnnuler.textContent = 'Annuler'; };

    recupererQuestionsMatiere(mat.id).then(function(res) {
        var questions = res.questions;
        // CORRIGÉ : aucune limite — dépend uniquement de ce qui est chargé
        var maxRounds = Math.floor(questions.length / QUESTIONS_PAR_ROUND);
        modalTexteEl.innerHTML = '';

        if (res.source === 'aucune' || res.source === 'erreur' || maxRounds === 0) {
            var p = document.createElement('p');
            p.style.cssText = 'text-align:center;color:var(--muted);padding:20px 0;';
            p.textContent = navigator.onLine === false
                ? '📴 Hors-ligne et aucune question sauvegardée pour cette matière. Connecte-toi une fois pour pouvoir t\'entraîner hors-ligne ensuite.'
                : (questions.length > 0 && questions.length < QUESTIONS_PAR_ROUND
                    ? 'Pas assez de questions pour former un round complet (' + QUESTIONS_PAR_ROUND + ' minimum).'
                    : 'Pas encore de questions pour cette matière.');
            modalTexteEl.appendChild(p);
            return;
        }

        if (!userData.statsEntr) userData.statsEntr = {};
        if (!userData.statsEntr[mat.id]) userData.statsEntr[mat.id] = {};
        userData.statsEntr[mat.id].maxRoundsConnu = maxRounds;

        var estPaye = !!userData.accesPaye;
        var stats = userData.statsEntr[mat.id] || {};
        var roundsFaits = stats.roundsFaits || [];

        if (res.source === 'cache') {
            var badgeOff = document.createElement('div');
            badgeOff.style.cssText = 'text-align:center;font-size:11px;font-weight:800;color:var(--blue);'
                + 'background:rgba(59,130,246,0.08);border-radius:10px;padding:6px;margin-bottom:10px;';
            badgeOff.textContent = '📴 Mode hors-ligne — questions sauvegardées localement';
            modalTexteEl.appendChild(badgeOff);
        }

        var info = document.createElement('p');
        info.style.cssText = 'font-size:12px;color:var(--muted);text-align:center;margin-bottom:14px;';
        info.textContent = estPaye
            ? maxRounds + ' round(s) disponible(s) — accès complet'
            : maxRounds + ' round(s) disponible(s) — rounds 1 et 2 gratuits, les suivants nécessitent le paiement';
        modalTexteEl.appendChild(info);

        var grid = document.createElement('div');
        grid.className = 'round-grid';
        for (var i = 1; i <= maxRounds; i++) {
            (function(roundNum) {
                var locked = !estPaye && roundNum > 2;
                var done = roundsFaits.indexOf(roundNum) !== -1;
                var btn = document.createElement('button');
                btn.className = 'round-btn' + (locked ? ' locked' : '') + (done ? ' done' : '');
                btn.innerHTML = (locked ? '🔒' : done ? '✅' : '▶️') + '<br>' + roundNum;
                btn.onclick = function() {
                    son('click');
                    if (locked) {
                        if (navigator.onLine === false) {
                            toast('📴 Connecte-toi pour débloquer le paiement', 'error');
                            return;
                        }
                        afficherPaiementEntr();
                        return;
                    }
                    modalEl.style.display = 'none';
                    btnAnnuler.textContent = 'Annuler';
                    lancerQuizMatiere(mat, niv, roundNum, questions);
                };
                grid.appendChild(btn);
            })(i);
        }
        modalTexteEl.appendChild(grid);
    });
}

function afficherPaiementEntr() {
    modalTitreEl.textContent = 'Accès entraînement complet';
    modalTexteEl.innerHTML =
        '<div style="text-align:center;padding:10px 0"><div style="font-size:50px;margin-bottom:16px">💳</div>'
        + '<p style="font-weight:800;font-size:16px;margin-bottom:12px">Accès payant : 100 FCFA</p>'
        + '<p style="color:var(--muted);font-size:13px;line-height:1.7;">Orange Money au :<br><br>'
        + '<span style="font-size:22px;font-weight:900;color:var(--green)">55 24 04 31</span><br><br>'
        + 'Envoie la capture WhatsApp pour débloquer tous les rounds.</p></div>';
    modalEl.style.display = 'flex';
    btnConfirmer.style.display = 'none';
    btnAnnuler.textContent = 'Fermer';
    btnAnnuler.onclick = function() { modalEl.style.display = 'none'; btnAnnuler.textContent = 'Annuler'; };
}

// === LANCER UN ROUND — CORRIGÉ : tranches de 6 questions ===
async function lancerQuizMatiere(mat, niv, roundNum, questionsAll) {
    matiereActuelle = mat.id;
    var questions = questionsAll;
    if (!questions) {
        var res = await recupererQuestionsMatiere(mat.id);
        questions = res.questions;
    }
    if (!questions || questions.length < QUESTIONS_PAR_ROUND) {
        toast('Pas assez de questions pour ' + mat.label, 'error');
        return;
    }
    roundNum = roundNum || 1;
    var debut = (roundNum - 1) * QUESTIONS_PAR_ROUND;
    questionsEntr = questions.slice(debut, debut + QUESTIONS_PAR_ROUND);
    if (questionsEntr.length < QUESTIONS_PAR_ROUND) {
        toast('Round incomplet, réessaie plus tard', 'error');
        return;
    }
    indexQuestionEntr = 0;
    scoreEntr = 0;
    window._roundActuel     = roundNum;
    window._nbRoundsTotal   = Math.floor(questions.length / QUESTIONS_PAR_ROUND);
    window._debutRound      = 0;
    window._finRound        = questionsEntr.length - 1;
    window._matCourante     = mat;
    window._versionCourante = Date.now();
    var toutesPages = [
        'page-accueil','page-menu','page-admin-login','page-exam',
        'page-admin','page-historique','page-stats','page-entrainement',
        'page-quiz-entr','page-resultat-entr'
    ];
    toutesPages.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    var pq = document.getElementById('page-quiz-entr');
    if (pq) { pq.style.display = 'block'; pageQuizEntr = pq; }
    var mnEl = document.getElementById('quizMatiereNom');
    if (mnEl) mnEl.textContent = mat.emoji + ' ' + mat.label;
    afficherQuestionEntr();
}

// ============================================
// FIN PARTIE 19/24 ✅ (CORRIGÉE — 6 Q/round, illimité)
// ============================================// ============================================
// PARTIE 20/24 — QUIZ ENTRAÎNEMENT
// CORRIGÉ : scroll automatique vers le feedback
// et le bouton "Question suivante" pour qu'il
// ne reste plus caché en bas de l'écran.
// ============================================

function afficherQuestionEntr() {
    if (indexQuestionEntr >= questionsEntr.length) { terminerQuizEntr(); return; }
    var q = questionsEntr[indexQuestionEntr];
    var tot = questionsEntr.length;
    var idx = indexQuestionEntr;
    var pct = Math.round((idx / tot) * 100);

    var qNumEl = document.getElementById('quizQNum');
    var qTxtEl = document.getElementById('quizQTexte');
    var pfEl   = document.getElementById('quizProgressFill');
    var ptEl   = document.getElementById('quizProgressTxt');
    var sbEl   = document.getElementById('quizScoreBadge');
    var rlEl   = document.getElementById('quizRoundLabel');
    var repEl  = document.getElementById('quizReponses');
    var fbEl   = document.getElementById('quizFeedback');

    if (qNumEl) qNumEl.textContent = 'Question ' + (idx+1);
    if (qTxtEl) qTxtEl.innerHTML = convertirMath(q.texte || '');
    if (pfEl) pfEl.style.width = pct + '%';
    if (ptEl) ptEl.textContent = 'Q' + (idx+1) + '/' + tot;
    if (sbEl) sbEl.textContent = scoreEntr + ' ✅';
    if (rlEl) rlEl.textContent = 'Round ' + window._roundActuel + '/' + window._nbRoundsTotal + ' · Q' + (idx+1) + '/' + tot;
    if (fbEl) fbEl.style.display = 'none';

    var qCard = document.getElementById('quizQuestionCard');
    if (qCard) qCard.scrollIntoView({ behavior:'smooth', block:'start' });

    var lettres = ['A','B','C','D'];
    if (repEl) {
        repEl.innerHTML = '';
        (q.reponses||[]).forEach(function(r, ri) {
            var div = document.createElement('div');
            div.className = 'rep-item';
            div.innerHTML =
                '<span class="rep-lettre">' + lettres[ri] + '</span>'
                + '<span class="rep-texte">' + convertirMath(r.texte||'') + '</span>';
            div.onclick = function() {
                if (fbEl && fbEl.style.display !== 'none') return;
                son('click');
                validerReponseEntr(ri, q);
            };
            repEl.appendChild(div);
        });
    }
}

function validerReponseEntr(ri, q) {
    var correct = q.reponses[ri] && q.reponses[ri].correct;
    if (correct) { scoreEntr++; son('success'); } else { son('error'); }

    var repEl = document.getElementById('quizReponses');
    var fbEl  = document.getElementById('quizFeedback');
    var fiEl  = document.getElementById('quizFeedbackIco');
    var ftEl  = document.getElementById('quizFeedbackTxt');
    var expEl = document.getElementById('quizExplication');
    var sbEl  = document.getElementById('quizScoreBadge');

    if (repEl) {
        repEl.querySelectorAll('.rep-item').forEach(function(div, i) {
            var r = q.reponses[i];
            if (r && r.correct) { div.classList.add('bonne'); }
            else if (i === ri && !correct) { div.classList.add('fausse'); }
        });
    }

    if (fiEl) fiEl.textContent = correct ? '✅' : '❌';
    if (ftEl) ftEl.textContent = correct ? 'Bonne réponse ! +1 pt' : 'Mauvaise réponse';
    if (expEl) expEl.textContent = q.explication || '';
    if (fbEl) fbEl.style.display = 'block';
    if (sbEl) sbEl.textContent = scoreEntr + ' ✅';

    var btnSuiv = document.getElementById('btnQuizSuivant');
    if (btnSuiv) {
        btnSuiv.onclick = function() { son('click'); indexQuestionEntr++; afficherQuestionEntr(); };
    }

    // CORRIGÉ : on force le scroll jusqu'au feedback + bouton "suivant"
    // pour qu'ils ne restent plus invisibles en bas de l'écran.
    setTimeout(function() {
        if (fbEl) fbEl.scrollIntoView({ behavior:'smooth', block:'end' });
    }, 100);
}

// ============================================
// FIN PARTIE 20/24 ✅ (CORRIGÉE — scroll auto)
// ============================================// ============================================
// PARTIE 21/24 — RÉSULTAT ENTRAÎNEMENT
// CORRIGÉ : enregistre le score de CHAQUE round
// (roundsScores) pour recalculer le % de
// performance affiché sur les cartes matières.
// ============================================

async function afficherResultatRound() {
    var tot  = questionsEntr.length;
    var pct  = tot > 0 ? Math.round((scoreEntr/tot)*100) : 0;
    var men  = scoreEntr >= tot*0.8 ? '🏆 Excellent !' : scoreEntr >= tot*0.6 ? '✅ Bien !' : scoreEntr >= tot*0.4 ? '📘 Passable' : '❌ À revoir';
    var xpG  = scoreEntr >= tot*0.8 ? 30 : scoreEntr >= tot*0.6 ? 20 : scoreEntr >= tot*0.4 ? 10 : 5;
    var mat  = window._matCourante || {};

    var toutesPages = [
        'page-accueil','page-menu','page-admin-login','page-exam',
        'page-admin','page-historique','page-stats','page-entrainement',
        'page-quiz-entr','page-resultat-entr'
    ];
    toutesPages.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    var pr = document.getElementById('page-resultat-entr');
    if (pr) { pr.style.display = 'block'; pageResultatEntr = pr; }

    var eEl = document.getElementById('entrResultatEmoji');
    var tEl = document.getElementById('entrResultatTitre');
    var sEl = document.getElementById('entrResultatSub');
    var sfEl= document.getElementById('entrScoreFinal');
    var pfEl= document.getElementById('entrPctFinal');
    var mEl = document.getElementById('entrMention');
    var bEl = document.getElementById('entrNbBon');
    var fEl = document.getElementById('entrNbFaux');
    var xEl = document.getElementById('entrXpGagne');
    var cEl = document.getElementById('entrConseil');

    if (eEl) eEl.textContent = scoreEntr >= tot*0.8 ? '🏆' : scoreEntr >= tot*0.6 ? '😊' : scoreEntr >= tot*0.4 ? '😐' : '😢';
    if (tEl) tEl.textContent = mat.label || 'Entraînement';
    if (sEl) sEl.textContent = 'Round ' + window._roundActuel + '/' + window._nbRoundsTotal + ' · ' + tot + ' questions';
    if (sfEl) sfEl.textContent = scoreEntr + '/' + tot;
    if (pfEl) pfEl.textContent = pct + '%';
    if (mEl) { mEl.textContent = men; mEl.className = 'mention-tag ' + getMentionTagClass(Math.round(pct/2)); }
    if (bEl) bEl.textContent = scoreEntr;
    if (fEl) fEl.textContent = tot - scoreEntr;
    if (xEl) xEl.textContent = xpG;
    if (cEl) {
        var conseil =
            pct >= 80 ? '🌟 Excellent travail ! Continue sur cette lancée !'
            : pct >= 60 ? '✅ Bon résultat ! Revois les questions manquées.'
            : pct >= 40 ? '📘 Passable. Entraîne-toi encore !'
            : '💪 Ne te décourage pas ! Revois le cours et réessaie.';
        cEl.textContent = conseil;
    }

    try {
        var newXp = (userData.xp || 0) + xpG;
        var newNiv = Math.floor(newXp/100) + 1;
        var oldStats = (userData.statsEntr||{})[matiereActuelle] || {};
        var newBest = Math.max(oldStats.best || 0, scoreEntr);
        var roundsFaits = oldStats.roundsFaits || [];
        if (roundsFaits.indexOf(window._roundActuel) === -1) roundsFaits.push(window._roundActuel);

        var roundsScores = oldStats.roundsScores || {};
        roundsScores[window._roundActuel] = scoreEntr;

        var updates = { xp: newXp, niveau: newNiv };
        updates['statsEntr/' + matiereActuelle + '/best'] = newBest;
        updates['statsEntr/' + matiereActuelle + '/total'] = tot;
        updates['statsEntr/' + matiereActuelle + '/roundsFaits'] = roundsFaits;
        updates['statsEntr/' + matiereActuelle + '/roundsScores'] = roundsScores;
        updates['statsEntr/' + matiereActuelle + '/maxRoundsConnu'] = window._nbRoundsTotal;

        try {
            await avecTimeout(db.ref('users/' + user).update(updates), 6000);
        } catch(errReseau) {
            toast('📴 Progression sauvegardée localement, sera synchronisée au retour du réseau', 'warning');
        }

        userData.xp = newXp; userData.niveau = newNiv;
        if (!userData.statsEntr) userData.statsEntr = {};
        userData.statsEntr[matiereActuelle] = {
            best: newBest, total: tot, roundsFaits: roundsFaits,
            roundsScores: roundsScores, maxRoundsConnu: window._nbRoundsTotal
        };
        try { localStorage.setItem('bb_userData', JSON.stringify(userData)); } catch(ex) {}
        majScoreGlobalEntr();
    } catch(e) {}
}

// ============================================
// FIN PARTIE 21/24 ✅ (CORRIGÉE — scores par round)
// ============================================// ============================================
// PARTIE 22/24 — NAVIGATION ENTRAÎNEMENT
// CORRIGÉ : le bouton "Round suivant" vérifie
// désormais le statut payé/non-payé avant de
// lancer le round — il n'était plus possible de
// contourner le paiement en enchaînant les rounds.
// ============================================

async function terminerQuizEntr() {
    await afficherResultatRound();

    var btnRec = document.getElementById('btnRecommencer');
    var btnAut = document.getElementById('btnAutreMatiere');
    var btnRet = document.getElementById('btnRetourMenuEntrRes');

    var btnSuivWrapId = 'btnRoundSuivantWrap';
    var ancienWrap = document.getElementById(btnSuivWrapId);
    if (ancienWrap && ancienWrap.parentNode) ancienWrap.parentNode.removeChild(ancienWrap);

    var prochainRound = window._roundActuel + 1;
    var aUnRoundSuivant = prochainRound <= window._nbRoundsTotal;
    if (aUnRoundSuivant && btnRec && btnRec.parentNode) {
        var estPaye = !!userData.accesPaye;
        var estVerrouille = !estPaye && prochainRound > 2;

        var btnSuiv = document.createElement('button');
        btnSuiv.id = btnSuivWrapId;
        btnSuiv.className = estVerrouille ? 'btn-outline' : 'btn-primary';
        btnSuiv.textContent = estVerrouille
            ? '🔒 Round suivant (' + prochainRound + '/' + window._nbRoundsTotal + ') — accès payant'
            : '▶️ Round suivant (' + prochainRound + '/' + window._nbRoundsTotal + ')';
        btnSuiv.style.marginBottom = '0';
        btnSuiv.onclick = function() {
            son('click');
            // CORRIGÉ : vérification du verrou avant de lancer le round
            if (estVerrouille) {
                if (navigator.onLine === false) {
                    toast('📴 Connecte-toi pour débloquer le paiement', 'error');
                    return;
                }
                afficherPaiementEntr();
                return;
            }
            var mat = window._matCourante;
            if (mat) {
                var niv = mat.id.indexOf('bac') === 0 ? 'bac' : 'bepc';
                lancerQuizMatiere(mat, niv, prochainRound);
            }
        };
        btnRec.parentNode.insertBefore(btnSuiv, btnRec);
    }

    if (btnRec) {
        btnRec.onclick = function() {
            son('click');
            var mat = window._matCourante;
            if (mat) {
                var niv = mat.id.indexOf('bac') === 0 ? 'bac' : 'bepc';
                lancerQuizMatiere(mat, niv, window._roundActuel);
            }
        };
    }
    if (btnAut) {
        btnAut.onclick = function() { son('click'); afficherPageEntrainement(); };
    }
    if (btnRet) {
        btnRet.onclick = function() { son('click'); chargerMenu(userData); };
    }
}

var btnQuitterQuiz = document.getElementById('btnQuitterQuiz');
if (btnQuitterQuiz) {
    btnQuitterQuiz.onclick = function() {
        son('click');
        modalTitreEl.textContent = 'Quitter l\'entraînement ?';
        modalTexteEl.textContent = 'Tes progrès pour ce round seront perdus.';
        modalEl.style.display = 'flex';
        btnConfirmer.style.display = 'block';
        btnConfirmer.style.background = '';
        btnConfirmer.textContent = 'Quitter';
        btnConfirmer.onclick = function() {
            modalEl.style.display = 'none';
            btnConfirmer.textContent = 'Confirmer';
            afficherPageEntrainement();
        };
        btnAnnuler.textContent = 'Annuler';
        btnAnnuler.onclick = function() {
            modalEl.style.display = 'none';
            btnConfirmer.textContent = 'Confirmer';
        };
    };
}

if (btnRetourMenuEntr) {
    btnRetourMenuEntr.onclick = function() { son('click'); chargerMenu(userData); };
}

// ============================================
// FIN PARTIE 22/24 ✅ (CORRIGÉE — verrou respecté)
// ============================================// ============================================
// PARTIE 23/24 — ONGLETS ADMIN (GLOBAUX)
// ============================================

function switchTab(tabId) {
    document.querySelectorAll('.admin-section').forEach(function(s) { s.classList.remove('active'); });
    document.querySelectorAll('.admin-tab').forEach(function(t) { t.classList.remove('active'); });
    var tab = document.getElementById(tabId);
    if (tab) tab.classList.add('active');
    if (event && event.target) event.target.classList.add('active');
}

function switchOngletAdmin(niv) {
    var ob  = document.getElementById('ongletBepcAdmin');
    var ob2 = document.getElementById('ongletBacAdmin');
    var sb  = document.getElementById('sectBepcAdmin');
    var sb2 = document.getElementById('sectBacAdmin');
    if (niv === 'bepc') {
        if (ob)  ob.classList.add('active');
        if (ob2) ob2.classList.remove('active');
        if (sb)  sb.style.display  = 'block';
        if (sb2) sb2.style.display = 'none';
    } else {
        if (ob2) ob2.classList.add('active');
        if (ob)  ob.classList.remove('active');
        if (sb2) sb2.style.display = 'block';
        if (sb)  sb.style.display  = 'none';
    }
}

// ============================================
// FIN PARTIE 23/24 ✅
// ============================================// ============================================
// PARTIE 24/24 — PARTAGER APP + SERVICE WORKER + FINAL
// ============================================

function partagerApp() {
    if (typeof son === 'function') son('click');
    var msg =
        '🇧🇫 *Concours Blanc Bonogo*\n'
        + 'Prépare tes concours BEPC, BAC, ENSOA, IDS, ENAM, ENAREF !\n\n'
        + '📲 Télécharge l\'app :\n'
        + 'https://median.co/share/qdlqmbo\n\n'
        + '✅ Sujets type concours\n'
        + '✅ Entraînement par matière\n'
        + '✅ Classement en temps réel\n'
        + '✅ Corrections détaillées';
    if (navigator.share) {
        navigator.share({ title: 'Concours Blanc Bonogo', text: msg, url: 'https://median.co/share/qdlqmbo' })
        .catch(function() { window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank'); });
    } else {
        window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./service-worker.js')
        .then(function(reg) { swRegistration = reg; console.log('SW OK:', reg.scope); })
        .catch(function(e) { console.log('SW erreur:', e); });
    });
}

console.log('🇧🇫 Concours Blanc Bonogo — Prêt ! ✅');

// ============================================
// FIN SCRIPT.JS COMPLET — 24/24 ✅
// ============================================
