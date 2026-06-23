// ============================================
// CONCOURS BLANC BONOGO — SCRIPT COMPLET
// VERSION CORRIGÉE — 24 PARTIES
// PARTIE 1/24 — FIREBASE + VARIABLES
// ============================================

// === FIREBASE INIT ===
var firebaseConfig = {
    apiKey: "AIzaSyDQWFqTKRmEZtuBhRHWMDrGtwboOwLleI4",
    databaseURL: "https://quiz-pro-max-default-rtdb.firebaseio.com"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.database();

// === VARIABLES PAGES (déclarées ici pour être globales) ===
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

// === INITIALISER LES RÉFÉRENCES DOM ===
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

// === SPLASH + DÉMARRAGE ===
// CORRECTION : page blanche au 2ème lancement
// On re-initialise le DOM à chaque fois
// et on force l'affichage de pageAccueil

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le DOM dès que possible
    initDOM();
});

window.addEventListener('load', function() {
    // Réinitialiser le DOM au chargement complet
    initDOM();

    var splash = document.getElementById('splash');

    // CORRECTION BUG PAGE BLANCHE :
    // Cacher toutes les pages d'abord
    // puis afficher uniquement pageAccueil
    function afficherPageAccueil() {
        initDOM(); // re-récupérer au cas où

        // Cacher toutes les pages
        var toutesPages = [
            'page-accueil', 'page-menu',
            'page-admin-login', 'page-exam',
            'page-admin', 'page-historique',
            'page-stats', 'page-entrainement',
            'page-quiz-entr', 'page-resultat-entr'
        ];
        toutesPages.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        // Afficher page accueil
        var acc = document.getElementById('page-accueil');
        if (acc) {
            acc.style.display = 'block';
            // Mettre à jour la référence globale
            pageAccueil = acc;
        }

        // S'assurer que les formulaires
        // sont dans le bon état
        var fConn = document.getElementById('formConnexion');
        var fInsc = document.getElementById('formInscription');
        var fReset = document.getElementById('formReset');
        if (fConn)  fConn.style.display  = 'block';
        if (fInsc)  fInsc.style.display  = 'none';
        if (fReset) fReset.style.display = 'none';

        window.scrollTo(0, 0);
    }

    // Masquer le splash après 2 secondes
    setTimeout(function() {
        // Cacher le splash
        if (splash) {
            splash.classList.add('hide');
            setTimeout(function() {
                if (splash && splash.parentNode)
                    splash.parentNode.removeChild(splash);
            }, 500);
        }

        // Vérifier auto-login
        var saved = localStorage.getItem('bb_user');
        if (saved) {
            // Même avec auto-login, on affiche
            // d'abord l'accueil pendant le chargement
            afficherPageAccueil();
            // Puis auto-login en arrière-plan
            setTimeout(function() {
                autoLogin(saved);
            }, 100);
        } else {
            afficherPageAccueil();
        }

    }, 2000);
});

// === VARIABLES UTILISATEUR ===
var user        = null;
var userDisplay = '';
var userData    = {};

// === VARIABLES EXAMEN ===
var questionsData   = [];
var reponsesUser    = {};
var reponsesFinales = {};
var finTimestamp    = 0;
var timerInt        = null;
var configActuelle  = null;
var salleActive     = '';

// === ANTI-TRICHE ===
var nbSorties       = 0;
var MAX_SORTIES     = 4;
var sortieTimeout   = null;
var derniereFocus   = Date.now();
var devourBloque    = false;
var enExamen        = false;
var DELAI_SORTIE_MS = 40000;

// === VARIABLES GLOBALES ANTI-TRICHE ===
var _salleAntiTriche   = '';
var _resultNodeGlobal  = '';
var _sessionNodeGlobal = '';

// === ALERTES TIMER ===
var alertesTimer = {
    30: false, 20: false, 10: false, 5: false
};

// === SOUMISSION ===
var copieSubmise = false;

// === PRÉSENCE ===
var presenceRef = null;

// === AUDIO ===
var audioCtx = null;

// === JSON CUMULÉ ===
var jsonCumuleBepc = '';
var jsonCumuleBAC  = '';

// === SUJETS ADMIN ===
var sujetBepc = [];
var sujetBAC  = [];

// === COUNTDOWN ===
var countdownVraiConcours = null;

// === NOTIFICATIONS ===
var timeoutNotif5min  = null;
var timeoutNotifDebut = null;
var timeoutNotif30min = null;
var swRegistration    = null;

// === ENTRAÎNEMENT ===
var matiereActuelle   = '';
var questionsEntr     = [];
var indexQuestionEntr = 0;
var scoreEntr         = 0;
var statsEntrainement = {};
var sujetsEntrAdmin   = {};
var ongletActif       = 'bepc';

// === ROUNDS ===
window._roundActuel     = 0;
window._debutRound      = 0;
window._finRound        = 0;
window._nbRoundsTotal   = 1;
window._matCourante     = null;
window._versionCourante = 0;
window._scoreRound      = 0;

// === BADGES ===
var BADGES_LIST = [
    { id:'premier',   emoji:'🎯',
        nom:'Premier Concours',
        desc:'Passe ton 1er concours' },
    { id:'streak7',   emoji:'🔥',
        nom:'Série 7 jours',
        desc:'Connecte-toi 7 jours d\'affilée' },
    { id:'niveau10',  emoji:'⭐',
        nom:'Niveau 10',
        desc:'Atteins le niveau 10' },
    { id:'perfect',   emoji:'💯',
        nom:'Sans Faute',
        desc:'Obtiens 50/50' },
    { id:'rapide',    emoji:'⚡',
        nom:'Éclair',
        desc:'Finis 1h avant la fin' },
    { id:'assidu',    emoji:'📅',
        nom:'Assidu',
        desc:'Passe 5 concours' },
    { id:'elite',     emoji:'👑',
        nom:'Élite',
        desc:'Moyenne supérieure à 40/50' },
    { id:'resistant', emoji:'🛡️',
        nom:'Résistant',
        desc:'Aucune sortie détectée' },
    { id:'top3',      emoji:'🏅',
        nom:'Top 3',
        desc:'Termine dans le top 3' },
    { id:'top10all',  emoji:'🌟',
        nom:'Légende Top 10',
        desc:'Entre au Hall of Fame' }
];

// === DATES CONCOURS OFFICIELS ===
var DATES_CONCOURS = [
    { nom:'ENSOA',   date:'2025-07-15', emoji:'🎖️' },
    { nom:'IDS',     date:'2025-08-10', emoji:'🏥' },
    { nom:'ENAM',    date:'2025-09-05', emoji:'⚖️' },
    { nom:'ENAREF',  date:'2025-10-20', emoji:'💼' },
    { nom:'DOUANES', date:'2025-11-15', emoji:'🛃' },
    { nom:'POLICE',  date:'2025-12-01', emoji:'👮' }
];

// === CONFIG MATIÈRES ENTRAÎNEMENT ===
var MATIERES_ENTR = {
    bepc: [
        { id:'bepc_maths',
            label:'Mathématiques',
            emoji:'📐', css:'mat-maths' },
        { id:'bepc_francais',
            label:'Français',
            emoji:'✍️', css:'mat-francais' },
        { id:'bepc_histgeo',
            label:'Histoire-Géo',
            emoji:'📜', css:'mat-histoire' },
        { id:'bepc_svt',
            label:'SVT',
            emoji:'🌿', css:'mat-svt' },
        { id:'bepc_pc',
            label:'Physique-Chimie',
            emoji:'⚡', css:'mat-pc' },
        { id:'bepc_cg',
            label:'Culture Générale',
            emoji:'🌐', css:'mat-cg' },
        { id:'bepc_actu',
            label:'Actualités',
            emoji:'📰', css:'mat-actu' },
        { id:'bepc_info',
            label:'Schycotech',
            emoji:'💻', css:'mat-info' }
    ],
    bac: [
        { id:'bac_maths',
            label:'Mathématiques',
            emoji:'📐', css:'mat-maths' },
        { id:'bac_francais',
            label:'Français',
            emoji:'✍️', css:'mat-francais' },
        { id:'bac_histoire',
            label:'Histoire',
            emoji:'📜', css:'mat-histoire' },
        { id:'bac_geo',
            label:'Géographie',
            emoji:'🌍', css:'mat-geo' },
        { id:'bac_svt',
            label:'SVT',
            emoji:'🌿', css:'mat-svt' },
        { id:'bac_pc',
            label:'Physique-Chimie',
            emoji:'⚡', css:'mat-pc' },
        { id:'bac_cg',
            label:'Culture Générale',
            emoji:'🌐', css:'mat-cg' },
        { id:'bac_info',
            label:'Schycotech',
            emoji:'💻', css:'mat-info' },
        { id:'bac_philo',
            label:'Philosophie',
            emoji:'💭', css:'mat-philo' },
        { id:'bac_actu',
            label:'Actualités',
            emoji:'📰', css:'mat-actu' }
    ]
};

// ============================================
// FIN PARTIE 1/24 ✅
// ============================================// ============================================
// PARTIE 2/24 — RÉFÉRENCES DOM
// ============================================

// === PAGES ===
var pageAccueil      = document.getElementById('page-accueil');
var pageMenu         = document.getElementById('page-menu');
var pageAdminLogin   = document.getElementById('page-admin-login');
var pageExam         = document.getElementById('page-exam');
var pageAdmin        = document.getElementById('page-admin');
var pageHistorique   = document.getElementById('page-historique');
var pageStats        = document.getElementById('page-stats');
var pageEntrainement = document.getElementById('page-entrainement');
var pageQuizEntr     = document.getElementById('page-quiz-entr');
var pageResultatEntr = document.getElementById('page-resultat-entr');

// === AUTH ===
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

// === MENU ===
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
var btnEntrainement = document.getElementById('btnEntrainement');
var btnLogout       = document.getElementById('btnLogout');
var onlineCountMenu = document.getElementById('onlineCountMenu');

// === HISTORIQUE / STATS ===
var btnRetourMenuHist  = document.getElementById('btnRetourMenuHist');
var btnRetourMenuStats = document.getElementById('btnRetourMenuStats');

// === ADMIN LOGIN ===
var adminPassEl   = document.getElementById('adminPass');
var btnLoginAdmin = document.getElementById('btnLoginAdmin');
var btnRetour     = document.getElementById('btnRetour');
var erreurAdmin   = document.getElementById('erreurAdmin');

// === EXAMEN ===
var nomConcoursEl      = document.getElementById('nomConcours');
var heureConcoursEl    = document.getElementById('heureConcours');
var timerEl            = document.getElementById('timer');
var enLigneEl          = document.getElementById('enLigne');
var restantEl          = document.getElementById('restant');
var questionsEl        = document.getElementById('questions');
var btnNonRep          = document.getElementById('btnNonRep');
var btnFinir           = document.getElementById('btnFinir');
var salleAttenteBepcEl = document.getElementById('salle-attente-bepc');
var salleAttenteBacEl  = document.getElementById('salle-attente-bac');
var attenteEl          = document.getElementById('attente');
var resultatEl         = document.getElementById('resultat');
var scoreEl            = document.getElementById('score');
var xpGagneEl          = document.getElementById('xpGagne');
var bonnesEl           = document.getElementById('bonnes');
var partiellesEl       = document.getElementById('partielles');
var faussesEl          = document.getElementById('fausses');
var monRangResEl       = document.getElementById('monRangRes');
var mentionResultatEl  = document.getElementById('mentionResultat');
var sortiesInfoEl      = document.getElementById('sortiesInfo');
var btnCorrection      = document.getElementById('btnCorrection');
var btnVoirClass       = document.getElementById('btnVoirClass');
var btnRetourMenu      = document.getElementById('btnRetourMenu');
var correctionEl       = document.getElementById('correction');

// === ADMIN BEPC ===
var statusEl             = document.getElementById('status');
var statCandidatsEl      = document.getElementById('statCandidats');
var statConcoursEl       = document.getElementById('statConcours');
var statMoyEl            = document.getElementById('statMoy');
var statOnlineEl         = document.getElementById('statOnline');
var typeConcoursBepcEl   = document.getElementById('typeConcoursBepc');
var hDebutBepcEl         = document.getElementById('hDebutBepc');
var hFinBepcEl           = document.getElementById('hFinBepc');
var btnSaveConfigBepcEl  = document.getElementById('btnSaveConfigBepc');
var listeQuestionsBepcEl = document.getElementById('listeQuestionsBepc');
var btnAjouterQBepcEl    = document.getElementById('btnAjouterQBepc');
var btnSaveSujetBepcEl   = document.getElementById('btnSaveSujetBepc');
var collerJSONBepcEl     = document.getElementById('collerJSONBepc');
var btnCharger50BepcEl   = document.getElementById('btnCharger50Bepc');
var btnEnvoyer50BepcEl   = document.getElementById('btnEnvoyer50Bepc');

// === ADMIN BAC ===
var typeConcoursBAC_El   = document.getElementById('typeConcoursBAC');
var hDebutBAC_El         = document.getElementById('hDebutBAC');
var hFinBAC_El           = document.getElementById('hFinBAC');
var btnSaveConfigBAC_El  = document.getElementById('btnSaveConfigBAC');
var listeQuestionsBAC_El = document.getElementById('listeQuestionsBAC');
var btnAjouterQBAC_El    = document.getElementById('btnAjouterQBAC');
var btnSaveSujetBAC_El   = document.getElementById('btnSaveSujetBAC');
var collerJSONBAC_El     = document.getElementById('collerJSONBAC');
var btnCharger50BAC_El   = document.getElementById('btnCharger50BAC');
var btnEnvoyer50BAC_El   = document.getElementById('btnEnvoyer50BAC');

// === ADMIN GÉNÉRAL ===
var top10BepcEl        = document.getElementById('top10Bepc');
var top10BAC_El        = document.getElementById('top10BAC');
var top10PermanentEl   = document.getElementById('top10Permanent');
var btnLogoutAdmin     = document.getElementById('btnLogoutAdmin');
var btnNouveauConcours = document.getElementById('btnNouveauConcours');
var btnResetTop10      = document.getElementById('btnResetTop10');
var listeCandidatsEl   = document.getElementById('listeCandidats');
var btnActiverTous     = document.getElementById('btnActiverTous');

// === MODAL ===
var modalEl      = document.getElementById('modal');
var modalTitreEl = document.getElementById('modalTitre');
var modalTexteEl = document.getElementById('modalTexte');
var btnAnnuler   = document.getElementById('btnAnnuler');
var btnConfirmer = document.getElementById('btnConfirmer');
var toastsEl     = document.getElementById('toasts');

// === MODAL CHOIX SALLE ===
var modalChoixSalle      = document.getElementById('modal-choix-salle');
var btnChoixBepc         = document.getElementById('btnChoixBepc');
var btnChoixBAC          = document.getElementById('btnChoixBAC');
var btnAnnulerChoixSalle = document.getElementById('btnAnnulerChoixSalle');

// === RETOUR SALLES ===
var btnRetourSalleAttenteBepc = document.getElementById('btnRetourSalleAttenteBepc');
var btnRetourSalleAttenteBac  = document.getElementById('btnRetourSalleAttenteBac');
var btnRetourSalleRetard      = document.getElementById('btnRetourSalleRetard');

// ============================================
// FIN PARTIE 2/24 ✅
// ============================================// ============================================
// PARTIE 3/24 — AUDIO + UTILITAIRES
// ============================================

function initAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) { audioCtx = null; }
    }
}

function son(type) {
    try {
        initAudio();
        if (!audioCtx) return;
        var o = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        switch(type) {
            case 'click':
                o.frequency.value = 800;
                g.gain.value = 0.06;
                o.start();
                o.stop(audioCtx.currentTime + 0.07);
                break;
            case 'success':
                o.frequency.setValueAtTime(400, audioCtx.currentTime);
                o.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.3);
                g.gain.value = 0.12;
                o.start();
                o.stop(audioCtx.currentTime + 0.4);
                break;
            case 'error':
                o.frequency.value = 220;
                g.gain.value = 0.15;
                o.start();
                o.stop(audioCtx.currentTime + 0.3);
                break;
            case 'alerte':
                [0, 0.22, 0.44].forEach(function(t) {
                    var o2 = audioCtx.createOscillator();
                    var g2 = audioCtx.createGain();
                    o2.connect(g2);
                    g2.connect(audioCtx.destination);
                    o2.frequency.value = 1000;
                    g2.gain.value = 0.18;
                    o2.start(audioCtx.currentTime + t);
                    o2.stop(audioCtx.currentTime + t + 0.1);
                });
                return;
            case 'sortie':
                o.frequency.setValueAtTime(500, audioCtx.currentTime);
                o.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 0.5);
                g.gain.value = 0.2;
                o.start();
                o.stop(audioCtx.currentTime + 0.5);
                break;
            case 'niveau':
                [523, 659, 784, 1047].forEach(function(f, i) {
                    var on = audioCtx.createOscillator();
                    var gn = audioCtx.createGain();
                    on.connect(gn);
                    gn.connect(audioCtx.destination);
                    on.frequency.value = f;
                    gn.gain.value = 0.12;
                    on.start(audioCtx.currentTime + i * 0.12);
                    on.stop(audioCtx.currentTime + i * 0.12 + 0.1);
                });
                return;
            case 'entr_success':
                [523, 659, 784].forEach(function(f, i) {
                    var oe = audioCtx.createOscillator();
                    var ge = audioCtx.createGain();
                    oe.connect(ge);
                    ge.connect(audioCtx.destination);
                    oe.type = 'sine';
                    oe.frequency.value = f;
                    ge.gain.value = 0.07;
                    oe.start(audioCtx.currentTime + i * 0.12);
                    oe.stop(audioCtx.currentTime + i * 0.12 + 0.15);
                });
                return;
            case 'entr_error':
                o.type = 'sine';
                o.frequency.setValueAtTime(380, audioCtx.currentTime);
                o.frequency.linearRampToValueAtTime(220, audioCtx.currentTime + 0.18);
                g.gain.value = 0.07;
                o.start();
                o.stop(audioCtx.currentTime + 0.18);
                break;
            case 'entr_fin':
                [523, 659, 784, 1047].forEach(function(f, i) {
                    var of2 = audioCtx.createOscillator();
                    var gf2 = audioCtx.createGain();
                    of2.connect(gf2);
                    gf2.connect(audioCtx.destination);
                    of2.type = 'sine';
                    of2.frequency.value = f;
                    gf2.gain.value = 0.09;
                    of2.start(audioCtx.currentTime + i * 0.1);
                    of2.stop(audioCtx.currentTime + i * 0.1 + 0.12);
                });
                return;
            default:
                o.frequency.value = 500;
                g.gain.value = 0.06;
                o.start();
                o.stop(audioCtx.currentTime + 0.1);
        }
    } catch(e) {}
}

// === SHOW PAGE — CORRIGÉ ===
function showPage(p) {
    var toutesLesPages = [
        pageAccueil, pageMenu, pageAdminLogin,
        pageExam, pageAdmin, pageHistorique,
        pageStats, pageEntrainement,
        pageQuizEntr, pageResultatEntr
    ];
    toutesLesPages.forEach(function(el) {
        if (el) el.style.display = 'none';
    });
    if (p) {
        p.style.display = 'block';
        window.scrollTo(0, 0);
    }
}

// === TOAST ===
function toast(msg, type) {
    var t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.textContent = msg;
    if (toastsEl) toastsEl.appendChild(t);
    setTimeout(function() {
        if (t.parentNode) t.parentNode.removeChild(t);
    }, 4000);
}

// === UTILITAIRES ===
function hash(str) {
    try {
        return btoa(unescape(encodeURIComponent(str)));
    } catch(e) { return btoa(str); }
}

function calcXp(score, total) {
    return Math.floor((score / (total || 50)) * 50);
}

function cleanEmail(e) {
    return e.toLowerCase()
        .replace(/\./g, '_dot_')
        .replace(/@/g, '_at_')
        .replace(/[^a-z0-9_]/g, '');
}

function formatDate(ts) {
    var d = new Date(parseInt(ts));
    if (!d || isNaN(d.getTime())) return '—';
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

function pad(n) {
    return n < 10 ? '0' + n : '' + n;
}

function getMention(score) {
    if (score >= 45) return '🏆 Excellent !';
    if (score >= 40) return '🌟 Très bien !';
    if (score >= 35) return '👍 Bien !';
    if (score >= 25) return '📚 Passable';
    if (score >= 15) return '💪 Continue tes efforts !';
    return '📖 Révise davantage !';
}

function getMentionTagClass(score) {
    if (score >= 40) return 'm-excellent';
    if (score >= 25) return 'm-bien';
    if (score >= 15) return 'm-passable';
    return 'm-faible';
}

function getTitreRang(xp) {
    if (xp >= 2000) return { titre:'Général',    emoji:'⭐⭐⭐', couleur:'#facc15' };
    if (xp >= 1500) return { titre:'Colonel',    emoji:'⭐⭐',   couleur:'#f97316' };
    if (xp >= 1000) return { titre:'Capitaine',  emoji:'🎖️',   couleur:'#8b5cf6' };
    if (xp >= 600)  return { titre:'Lieutenant', emoji:'🏅',    couleur:'#3b82f6' };
    if (xp >= 300)  return { titre:'Sergent',    emoji:'💪',    couleur:'#22c55e' };
    if (xp >= 100)  return { titre:'Caporal',    emoji:'🎯',    couleur:'#94a3b8' };
    return { titre:'Recrue', emoji:'🪖', couleur:'#64748b' };
}

function afficherBadgeAnimation(emoji, nom) {
    var div = document.createElement('div');
    div.className = 'badge-popup';
    div.innerHTML =
        '<div style="font-size:50px;margin-bottom:12px">' + emoji + '</div>'
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

function convertirMath(texte) {
    if (!texte) return '';
    var exposants = {
        '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵',
        '6':'⁶','7':'⁷','8':'⁸','9':'⁹','+':'⁺','-':'⁻',
        'a':'ᵃ','b':'ᵇ','c':'ᶜ','n':'ⁿ','x':'ˣ','y':'ʸ','z':'ᶻ'
    };
    var indices = {
        '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅',
        '6':'₆','7':'₇','8':'₈','9':'₉','n':'ₙ','x':'ₓ','a':'ₐ','e':'ₑ','i':'ᵢ'
    };
    var r = texte;
    r = r.replace(/\b1\/2\b/g,'½').replace(/\b1\/4\b/g,'¼')
         .replace(/\b3\/4\b/g,'¾').replace(/\b1\/3\b/g,'⅓').replace(/\b2\/3\b/g,'⅔');
    r = r.replace(/\^\(([^)]+)\)/g, function(m, inner) {
        return inner.split('').map(function(c) { return exposants[c] || c; }).join('');
    });
    r = r.replace(/\^(-?[a-zA-Z0-9]+)/g, function(m, exp) {
        return exp.split('').map(function(c) { return exposants[c] || c; }).join('');
    });
    r = r.replace(/_([a-zA-Z0-9]+)/g, function(m, idx) {
        return idx.split('').map(function(c) { return indices[c] || c; }).join('');
    });
    r = r.replace(/sqrt\(([^)]+)\)/g,'√($1)').replace(/\bpi\b/gi,'π')
         .replace(/\binfini\b/gi,'∞').replace(/\+-/g,'±').replace(/\bdelta\b/gi,'Δ')
         .replace(/\balpha\b/gi,'α').replace(/\bbeta\b/gi,'β')
         .replace(/->/g,'→').replace(/!=/g,'≠');
    return r;
}

function chargerJSONGenerique(texte) {
    function normaliserQuestion(q, i) {
        var reps;
        if (q.reponses && Array.isArray(q.reponses)) {
            reps = q.reponses.map(function(r, ri) {
                if (typeof r === 'string') {
                    return { texte: r, correct: q.correct === ri || q.correct === 'ABCD'[ri] };
                }
                return { texte: r.texte || r.reponse || r.text || '', correct: r.correct || r.bonne || false };
            });
        } else {
            reps = ['A','B','C','D'].map(function(l, ri) {
                return { texte: q[l] || '', correct: q.correct === l || q.correct === ri };
            });
        }
        while (reps.length < 4) reps.push({ texte:'', correct:false });
        return {
            texte: q.texte || q.question || ('Question ' + (i+1)),
            reponses: reps.slice(0, 4),
            explication: q.explication || q.correction || ''
        };
    }
    try {
        var tp = texte
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ')
            .replace(/,\s*\]/g, ']').replace(/,\s*\}/g, '}').trim();
        if (!tp.startsWith('[')) tp = '[' + tp;
        if (!tp.endsWith(']')) {
            var last = tp.lastIndexOf('}');
            if (last !== -1) tp = tp.substring(0, last+1) + ']';
            else { toast('JSON invalide', 'error'); return []; }
        }
        var data = JSON.parse(tp);
        if (!Array.isArray(data) || data.length === 0) {
            toast('Format JSON invalide', 'error'); return [];
        }
        return data.map(normaliserQuestion);
    } catch(e) {
        toast('Erreur JSON : ' + e.message, 'error');
        son('error');
        return [];
    }
}

// ============================================
// FIN PARTIE 3/24 ✅
// ============================================// ============================================
// PARTIE 4/24 — AUTH + CONNEXION RAPIDE
// CORRECTION : connexion instantanée
// pour téléphones faibles
// ============================================

if (btnShowInscription) {
    btnShowInscription.onclick = function() {
        son('click');
        if (formConnexion)
            formConnexion.style.display = 'none';
        if (formInscription)
            formInscription.style.display = 'block';
        if (formReset)
            formReset.style.display = 'none';
    };
}
if (btnShowConnexion) {
    btnShowConnexion.onclick = function() {
        son('click');
        if (formInscription)
            formInscription.style.display = 'none';
        if (formConnexion)
            formConnexion.style.display = 'block';
        if (formReset)
            formReset.style.display = 'none';
    };
}
if (btnShowReset) {
    btnShowReset.onclick = function() {
        son('click');
        if (formConnexion)
            formConnexion.style.display = 'none';
        if (formReset)
            formReset.style.display = 'block';
        if (formInscription)
            formInscription.style.display = 'none';
    };
}
if (btnRetourConnexion) {
    btnRetourConnexion.onclick = function() {
        son('click');
        if (formReset)
            formReset.style.display = 'none';
        if (formConnexion)
            formConnexion.style.display = 'block';
    };
}

// === INSCRIPTION ===
if (btnInscription) {
    btnInscription.onclick = async function() {
        son('click');
        var n = nomInput
            ? nomInput.value.trim() : '';
        var p = prenomInput
            ? prenomInput.value.trim() : '';
        var e = emailInscription
            ? emailInscription.value
                .trim().toLowerCase() : '';
        var m = mdpInscription
            ? mdpInscription.value.trim() : '';

        if (n.length < 2 || p.length < 2) {
            if (erreurInscription)
                erreurInscription.textContent =
                    '⚠️ Nom et Prénom requis';
            son('error'); return;
        }
        if (!e.includes('@')
            || !e.includes('.')) {
            if (erreurInscription)
                erreurInscription.textContent =
                    '⚠️ Gmail invalide';
            son('error'); return;
        }
        if (m.length < 4) {
            if (erreurInscription)
                erreurInscription.textContent =
                    '⚠️ Mot de passe 4 min';
            son('error'); return;
        }

        if (erreurInscription)
            erreurInscription.textContent =
                '⏳ Création...';

        var userKey = cleanEmail(e);

        try {
            var snap = await db.ref(
                'users/' + userKey)
                .once('value');

            if (snap.exists()) {
                if (erreurInscription)
                    erreurInscription.textContent =
                        '⚠️ Gmail déjà utilisé';
                son('error'); return;
            }

            await db.ref('users/' + userKey)
                .set({
                nom:             n,
                prenom:          p,
                email:           e,
                mdp:             hash(m),
                xp:              0,
                niveau:          1,
                streak:          0,
                dernierJour:     Date.now(),
                badges:          {},
                concoursFaits:   0,
                totalScore:      0,
                moyenne:         0,
                historique:      [],
                accesPaye:       false,
                dateInscription: Date.now(),
                top10All:        false
            });

            if (erreurInscription)
                erreurInscription.textContent = '';
            toast('✅ Compte créé ! Connecte-toi',
                'success');
            son('success');
            if (nomInput)    nomInput.value    = '';
            if (prenomInput) prenomInput.value = '';
            if (emailInscription)
                emailInscription.value = '';
            if (mdpInscription)
                mdpInscription.value   = '';
            if (formInscription)
                formInscription.style.display
                    = 'none';
            if (formConnexion)
                formConnexion.style.display
                    = 'block';
        } catch(err) {
            if (erreurInscription)
                erreurInscription.textContent =
                    '⚠️ Erreur réseau. Réessaie.';
            son('error');
        }
    };
}

// === RESET MOT DE PASSE ===
if (btnReset) {
    btnReset.onclick = async function() {
        son('click');
        var e = emailReset
            ? emailReset.value
                .trim().toLowerCase() : '';
        var m = nouveauMdp
            ? nouveauMdp.value.trim() : '';

        if (!e.includes('@')
            || !e.includes('.')) {
            if (erreurReset)
                erreurReset.textContent =
                    '⚠️ Gmail invalide';
            son('error'); return;
        }
        if (m.length < 4) {
            if (erreurReset)
                erreurReset.textContent =
                    '⚠️ Mot de passe 4 min';
            son('error'); return;
        }

        if (erreurReset)
            erreurReset.textContent =
                '⏳ Vérification...';

        try {
            var userKey = cleanEmail(e);
            var snap = await db.ref(
                'users/' + userKey)
                .once('value');

            if (!snap.exists()) {
                if (erreurReset)
                    erreurReset.textContent =
                        "⚠️ Ce Gmail n'existe pas";
                son('error'); return;
            }

            await db.ref('users/' + userKey)
                .update({ mdp: hash(m) });

            // Mettre à jour aussi en local
            var savedData = localStorage
                .getItem('bb_userData');
            if (savedData) {
                try {
                    var parsed =
                        JSON.parse(savedData);
                    if (parsed.email === e) {
                        parsed.mdp = hash(m);
                        localStorage.setItem(
                            'bb_userData',
                            JSON.stringify(parsed));
                    }
                } catch(ex) {}
            }

            if (erreurReset)
                erreurReset.textContent = '';
            toast('✅ Mot de passe changé !',
                'success');
            son('success');
            if (emailReset)
                emailReset.value = '';
            if (nouveauMdp)
                nouveauMdp.value = '';
            if (formReset)
                formReset.style.display = 'none';
            if (formConnexion)
                formConnexion.style.display
                    = 'block';
        } catch(err) {
            if (erreurReset)
                erreurReset.textContent =
                    '⚠️ Erreur réseau. Réessaie.';
            son('error');
        }
    };
}

// ============================================
// CONNEXION ULTRA RAPIDE
// Stratégie :
// 1. Vérifier d'abord en LOCAL (cache)
//    → Si trouvé et mdp correct
//    → Afficher menu IMMÉDIATEMENT
//    → Synchroniser Firebase en arrière-plan
// 2. Si pas en cache → aller sur Firebase
// ============================================
if (btnLogin) {
    btnLogin.onclick = async function() {
        son('click');
        var e = emailInput
            ? emailInput.value
                .trim().toLowerCase() : '';
        var m = mdpInput
            ? mdpInput.value.trim() : '';

        if (!e.includes('@') || m.length < 4) {
            if (erreurEl)
                erreurEl.textContent =
                    '⚠️ Gmail + mot de passe requis';
            son('error'); return;
        }

        if (erreurEl)
            erreurEl.textContent =
                '⏳ Connexion...';

        var userKey = cleanEmail(e);

        // === ÉTAPE 1 : VÉRIFIER EN LOCAL ===
        // Si l'utilisateur s'est déjà connecté
        // ses données sont sauvegardées
        // localement → connexion instantanée
        var donneesLocales = null;
        try {
            var localRaw = localStorage
                .getItem('bb_userData');
            if (localRaw) {
                var localParsed =
                    JSON.parse(localRaw);
                // Vérifier que c'est le même
                // utilisateur et même mdp
                if (localParsed
                    && localParsed.email === e
                    && localParsed.mdp
                    === hash(m)) {
                    donneesLocales = localParsed;
                }
            }
        } catch(ex) {
            donneesLocales = null;
        }

        // === CONNEXION DEPUIS LE CACHE ===
        // Instantané même sans internet
        if (donneesLocales) {
            if (erreurEl)
                erreurEl.textContent = '';
            son('success');

            user        = userKey;
            userDisplay =
                (donneesLocales.prenom || '')
                + ' '
                + (donneesLocales.nom   || '');
            userData    = donneesLocales;

            localStorage.setItem(
                'bb_user', user);

            // Afficher menu IMMÉDIATEMENT
            chargerMenu(donneesLocales);

            // Mettre à jour depuis Firebase
            // en arrière-plan silencieusement
            setTimeout(function() {
                synchroniserDepuisFirebase(
                    userKey, m);
            }, 500);

            return;
        }

        // === ÉTAPE 2 : FIREBASE ===
        // Première connexion ou cache vide
        // On doit aller sur Firebase
        if (erreurEl)
            erreurEl.textContent =
                '⏳ Première connexion...';

        try {
            var snap = await db.ref(
                'users/' + userKey)
                .once('value');

            if (!snap.exists()
                || snap.val().mdp !== hash(m)) {
                if (erreurEl)
                    erreurEl.textContent =
                        '⚠️ Gmail ou mot de '
                        + 'passe incorrect';
                son('error'); return;
            }

            var d   = snap.val();
            var now = Date.now();

            // Calculer streak
            var dernier = new Date(
                d.dernierJour || now)
                .setHours(0,0,0,0);
            var auj = new Date(now)
                .setHours(0,0,0,0);
            var diff =
                (auj - dernier) / 86400000;
            if (diff === 1)
                d.streak = (d.streak || 0) + 1;
            else if (diff > 1)
                d.streak = 1;

            // Mettre à jour streak
            // en arrière-plan
            db.ref('users/' + userKey)
                .update({
                dernierJour: now,
                streak:      d.streak
            });

            user        = userKey;
            userDisplay =
                (d.prenom || '')
                + ' ' + (d.nom || '');
            userData    = d;

            // === SAUVEGARDER EN LOCAL ===
            // Pour les prochaines connexions
            // instantanées
            try {
                localStorage.setItem(
                    'bb_userData',
                    JSON.stringify(d));
                localStorage.setItem(
                    'bb_user', user);
            } catch(ex) {}

            if (erreurEl)
                erreurEl.textContent = '';
            son('success');

            // Afficher menu
            chargerMenu(d);

            // Lancer le reste en arrière-plan
            setTimeout(function() {
                startPresence();
                demanderPermissionNotif();
                verifierEtatAuDemarrage();
                surveillerDebutConcours();
            }, 300);

        } catch(e2) {
            // Erreur réseau pendant
            // première connexion
            if (erreurEl)
                erreurEl.textContent =
                    '⚠️ Pas de connexion. '
                    + 'Vérifie internet.';
            son('error');
        }
    };
}

// === SYNCHRONISER DEPUIS FIREBASE ===
// En arrière-plan après connexion locale
async function synchroniserDepuisFirebase(
    userKey, mdp) {
    try {
        var snap = await db.ref(
            'users/' + userKey)
            .once('value');

        if (!snap.exists()) return;

        var d   = snap.val();
        var now = Date.now();

        // Calculer streak
        var dernier = new Date(
            d.dernierJour || now)
            .setHours(0,0,0,0);
        var auj = new Date(now)
            .setHours(0,0,0,0);
        var diff = (auj - dernier) / 86400000;
        if (diff === 1)
            d.streak = (d.streak || 0) + 1;
        else if (diff > 1)
            d.streak = 1;

        // Mettre à jour streak Firebase
        db.ref('users/' + userKey).update({
            dernierJour: now,
            streak:      d.streak
        });

        // Mettre à jour les données locales
        // avec les données fraîches Firebase
        userData = d;
        try {
            localStorage.setItem(
                'bb_userData',
                JSON.stringify(d));
        } catch(ex) {}

        // Mettre à jour l'affichage
        // du menu silencieusement
        if (nivEl)
            nivEl.textContent = d.niveau || 1;
        if (xpEl)
            xpEl.textContent  = d.xp     || 0;
        if (streakEl)
            streakEl.textContent =
                d.streak || 0;

        var rangInfo = getTitreRang(d.xp || 0);
        var titreEl  = document.getElementById(
            'titreMenuRang');
        if (titreEl) {
            titreEl.textContent =
                rangInfo.emoji
                + ' ' + rangInfo.titre;
            titreEl.style.color =
                rangInfo.couleur;
        }

        // Lancer présence et notifications
        startPresence();
        demanderPermissionNotif();
        verifierEtatAuDemarrage();
        surveillerDebutConcours();

    } catch(e) {
        // Pas de connexion → pas grave
        // l'utilisateur est déjà dans le menu
        startPresence();
    }
}

// === AUTO LOGIN ULTRA RAPIDE ===
async function autoLogin(savedKey) {
    // Essayer d'abord depuis le cache local
    try {
        var localRaw = localStorage
            .getItem('bb_userData');
        if (localRaw) {
            var localData = JSON.parse(localRaw);
            // Vérifier que c'est le bon user
            if (localData
                && cleanEmail(
                    localData.email || '')
                === savedKey) {

                // Afficher menu IMMÉDIATEMENT
                user        = savedKey;
                userDisplay =
                    (localData.prenom || '')
                    + ' '
                    + (localData.nom   || '');
                userData    = localData;

                chargerMenu(localData);

                // Synchroniser en arrière-plan
                setTimeout(function() {
                    synchroniserAutoLogin(
                        savedKey);
                }, 500);
                return;
            }
        }
    } catch(ex) {}

    // Pas de cache → Firebase obligatoire
    try {
        var snap = await db.ref(
            'users/' + savedKey)
            .once('value');

        if (!snap.exists()) {
            localStorage.removeItem('bb_user');
            localStorage.removeItem('bb_userData');
            showPage(pageAccueil);
            return;
        }

        var d       = snap.val();
        user        = savedKey;
        userDisplay =
            (d.prenom || '')
            + ' ' + (d.nom || '');
        userData    = d;

        // Sauvegarder en local
        try {
            localStorage.setItem(
                'bb_userData',
                JSON.stringify(d));
        } catch(ex) {}

        chargerMenu(d);

        setTimeout(function() {
            startPresence();
            demanderPermissionNotif();
            verifierEtatAuDemarrage();
            surveillerDebutConcours();
        }, 300);

    } catch(e) {
        // Erreur réseau → afficher accueil
        localStorage.removeItem('bb_user');
        localStorage.removeItem('bb_userData');
        showPage(pageAccueil);
    }
}

// === SYNCHRONISER AUTO LOGIN ===
async function synchroniserAutoLogin(savedKey) {
    try {
        var snap = await db.ref(
            'users/' + savedKey)
            .once('value');

        if (!snap.exists()) {
            // Compte supprimé
            localStorage.removeItem('bb_user');
            localStorage.removeItem('bb_userData');
            toast('Session expirée','error');
            setTimeout(function() {
                showPage(pageAccueil);
            }, 2000);
            return;
        }

        var d = snap.val();
        userData = d;

        // Mettre à jour le cache
        try {
            localStorage.setItem(
                'bb_userData',
                JSON.stringify(d));
        } catch(ex) {}

        // Mettre à jour l'affichage
        if (nivEl)
            nivEl.textContent = d.niveau || 1;
        if (xpEl)
            xpEl.textContent  = d.xp     || 0;
        if (streakEl)
            streakEl.textContent =
                d.streak || 0;

        var rangInfo = getTitreRang(d.xp || 0);
        var titreEl  = document.getElementById(
            'titreMenuRang');
        if (titreEl) {
            titreEl.textContent =
                rangInfo.emoji
                + ' ' + rangInfo.titre;
            titreEl.style.color =
                rangInfo.couleur;
        }

        startPresence();
        demanderPermissionNotif();
        verifierEtatAuDemarrage();
        surveillerDebutConcours();

    } catch(e) {
        // Pas de connexion → menu déjà affiché
        // depuis le cache, pas grave
        startPresence();
    }
}

// === ENTER SUR INPUTS ===
document.addEventListener(
    'DOMContentLoaded', function() {
    if (mdpInput) {
        mdpInput.addEventListener(
            'keypress', function(e) {
            if (e.key === 'Enter' && btnLogin)
                btnLogin.click();
        });
    }
    if (adminPassEl) {
        adminPassEl.addEventListener(
            'keypress', function(e) {
            if (e.key === 'Enter'
                && btnLoginAdmin)
                btnLoginAdmin.click();
        });
    }
    if (formInscription)
        formInscription.style.display = 'none';
    if (formReset)
        formReset.style.display       = 'none';
    if (formConnexion)
        formConnexion.style.display   = 'block';
});

if (btnAdmin) {
    btnAdmin.onclick = function() {
        son('click');
        showPage(pageAdminLogin);
    };
}
if (btnRetour) {
    btnRetour.onclick = function() {
        son('click');
        showPage(pageAccueil);
    };
}

// ============================================
// FIN PARTIE 4/24 ✅
// ============================================// ============================================
// PARTIE 5/24 — PRÉSENCE + MENU
// ============================================

// === PRÉSENCE ===
function startPresence() {
    if (presenceRef) presenceRef.remove();
    presenceRef = db.ref('online/' + user);
    presenceRef.set({ nom: userDisplay, ts: firebase.database.ServerValue.TIMESTAMP });
    presenceRef.onDisconnect().remove();
}

db.ref('online').on('value', function(snap) {
    var count = snap.numChildren();
    if (onlineCount)     onlineCount.textContent     = count;
    if (onlineCountMenu) onlineCountMenu.textContent = count;
    if (statOnlineEl)    statOnlineEl.textContent    = count;
    if (enLigneEl)       enLigneEl.textContent       = '🟢 ' + count;
});

// === RETOUR ANDROID ===
history.pushState({ page:'app' }, '', window.location.href);

document.addEventListener('backbutton', function(e) {
    e.preventDefault();
    gererRetourAndroid();
}, false);

window.addEventListener('popstate', function() {
    gererRetourAndroid();
});

function gererRetourAndroid() {
    if (modalEl && modalEl.style.display !== 'none') {
        modalEl.style.display = 'none';
        if (btnConfirmer) btnConfirmer.style.display = '';
        if (btnAnnuler)   btnAnnuler.textContent     = 'Annuler';
        history.pushState({ page:'app' }, '', window.location.href);
        return;
    }

    if (enExamen && !copieSubmise) {
        modalTitreEl.textContent = '⚠️ Quitter le concours ?';
        modalTexteEl.innerHTML =
            '<div style="text-align:center;padding:10px 0;">'
            + '<div style="font-size:40px;margin-bottom:12px;">⚠️</div>'
            + '<p style="font-weight:700;font-size:14px;margin-bottom:10px;">Tu es en plein concours !</p>'
            + '<p style="color:var(--muted);font-size:13px;">Une sortie sera comptée si tu quittes.</p></div>';
        modalEl.style.display = 'flex';
        btnConfirmer.textContent = 'Quitter temporairement';
        btnConfirmer.onclick = function() {
            modalEl.style.display    = 'none';
            btnConfirmer.textContent = 'Confirmer';
            btnAnnuler.textContent   = 'Annuler';
            compterSortie();
            enExamen = false;
            chargerMenu(userData);
        };
        btnAnnuler.textContent = 'Continuer le concours';
        btnAnnuler.onclick = function() {
            modalEl.style.display    = 'none';
            btnConfirmer.textContent = 'Confirmer';
            btnAnnuler.textContent   = 'Annuler';
        };
        history.pushState({ page:'app' }, '', window.location.href);
        return;
    }

    var pageActive = null;
    [pageAccueil, pageMenu, pageAdminLogin, pageExam, pageAdmin,
     pageHistorique, pageStats, pageEntrainement, pageQuizEntr, pageResultatEntr]
    .forEach(function(p) {
        if (p && p.style.display !== 'none') pageActive = p;
    });

    if (pageActive === pageMenu) {
        modalTitreEl.textContent = 'Quitter l\'application ?';
        modalTexteEl.innerHTML =
            '<div style="text-align:center;padding:10px 0;">'
            + '<div style="font-size:40px;margin-bottom:12px;">👋</div>'
            + '<p style="color:var(--muted);font-size:14px;">Fermer Concours Blanc Bonogo ?</p></div>';
        modalEl.style.display = 'flex';
        btnConfirmer.textContent = 'Quitter l\'app';
        btnConfirmer.onclick = function() {
            modalEl.style.display    = 'none';
            btnConfirmer.textContent = 'Confirmer';
            btnAnnuler.textContent   = 'Annuler';
            if (navigator.app) navigator.app.exitApp();
            else window.close();
        };
        btnAnnuler.textContent = 'Rester';
        btnAnnuler.onclick = function() {
            modalEl.style.display    = 'none';
            btnConfirmer.textContent = 'Confirmer';
            btnAnnuler.textContent   = 'Annuler';
        };
    } else if (pageActive === pageHistorique || pageActive === pageStats) {
        son('click'); showPage(pageMenu);
    } else if (pageActive === pageEntrainement) {
        son('click'); chargerMenu(userData);
    } else if (pageActive === pageQuizEntr) {
        modalTitreEl.textContent = 'Quitter le quiz ?';
        modalTexteEl.innerHTML = '<p style="color:var(--muted);text-align:center;">Ta progression est sauvegardée.</p>';
        modalEl.style.display = 'flex';
        btnConfirmer.textContent = 'Quitter';
        btnConfirmer.onclick = function() {
            modalEl.style.display    = 'none';
            btnConfirmer.textContent = 'Confirmer';
            btnAnnuler.textContent   = 'Annuler';
            var zR = document.getElementById('quizRoundResult');
            if (zR) zR.style.display = 'none';
            afficherPageEntrainement();
        };
        btnAnnuler.textContent = 'Continuer';
        btnAnnuler.onclick = function() {
            modalEl.style.display    = 'none';
            btnConfirmer.textContent = 'Confirmer';
            btnAnnuler.textContent   = 'Annuler';
        };
    } else if (pageActive === pageResultatEntr) {
        son('click'); afficherPageEntrainement();
    } else if (pageActive === pageAdmin || pageActive === pageAdminLogin) {
        son('click'); showPage(pageAccueil);
    } else if (pageActive === pageExam) {
        if (!enExamen) { son('click'); chargerMenu(userData); }
    } else if (pageActive === pageAccueil) {
        if (navigator.app) navigator.app.exitApp();
        else window.close();
    } else {
        if (user) chargerMenu(userData);
        else showPage(pageAccueil);
    }

    history.pushState({ page:'app' }, '', window.location.href);
}

// === CONCOURS PRÉVU ===
async function afficherConcoursPrévu() {
    var conteneur = document.getElementById('compteRebours');
    if (!conteneur) return;
    try {
        var results = await Promise.all([
            db.ref('configBepc').once('value'),
            db.ref('configBAC').once('value')
        ]);
        var cfgBepc = results[0].val();
        var cfgBAC  = results[1].val();
        var now     = Date.now();
        var bepcActif = cfgBepc && cfgBepc.debutTimestamp && cfgBepc.finTimestamp && now < cfgBepc.finTimestamp;
        var bacActif  = cfgBAC  && cfgBAC.debutTimestamp  && cfgBAC.finTimestamp  && now < cfgBAC.finTimestamp;

        if (!bepcActif && !bacActif) {
            var prochains = getProchainsVraisConcours();
            conteneur.innerHTML = prochains
                || '<div style="text-align:center;color:var(--muted);font-size:13px;padding:8px 0;">📅 Aucun concours prévu</div>';
            return;
        }

        var html = '';
        if (bepcActif) {
            var enCours = now >= cfgBepc.debutTimestamp && now < cfgBepc.finTimestamp;
            html += '<div style="background:' + (enCours
                ? 'linear-gradient(135deg,#1a6b3c,#22c55e)'
                : 'linear-gradient(135deg,#1d4ed8,#3b82f6)')
                + ';border-radius:14px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px;">'
                + '<div style="font-size:22px;">📘</div>'
                + '<div style="flex:1;">'
                + '<div style="font-size:11px;color:rgba(255,255,255,0.8);font-weight:600;">' + (enCours ? '🔴 EN COURS' : '🟡 PRÉVU') + '</div>'
                + '<div style="font-size:14px;font-weight:800;color:white;">' + (cfgBepc.type || 'Concours BEPC') + '</div>'
                + '</div>'
                + '<div id="timerBepcMenu" style="font-size:16px;font-weight:900;color:white;min-width:60px;text-align:right;"></div>'
                + '</div>';
        }
        if (bacActif) {
            var enCoursB = now >= cfgBAC.debutTimestamp && now < cfgBAC.finTimestamp;
            html += '<div style="background:' + (enCoursB
                ? 'linear-gradient(135deg,#1a6b3c,#22c55e)'
                : 'linear-gradient(135deg,#7c3aed,#8b5cf6)')
                + ';border-radius:14px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px;">'
                + '<div style="font-size:22px;">📗</div>'
                + '<div style="flex:1;">'
                + '<div style="font-size:11px;color:rgba(255,255,255,0.8);font-weight:600;">' + (enCoursB ? '🔴 EN COURS' : '🟡 PRÉVU') + '</div>'
                + '<div style="font-size:14px;font-weight:800;color:white;">' + (cfgBAC.type || 'Concours BAC') + '</div>'
                + '</div>'
                + '<div id="timerBacMenu" style="font-size:16px;font-weight:900;color:white;min-width:60px;text-align:right;"></div>'
                + '</div>';
        }

        conteneur.innerHTML = html;
        if (bepcActif) demarrerTimerMenu('timerBepcMenu', cfgBepc.debutTimestamp, cfgBepc.finTimestamp);
        if (bacActif)  demarrerTimerMenu('timerBacMenu',  cfgBAC.debutTimestamp,  cfgBAC.finTimestamp);
    } catch(e) {
        if (conteneur) conteneur.innerHTML = '<div style="text-align:center;color:var(--muted);font-size:13px;padding:8px 0;">📅 Aucun concours prévu</div>';
    }
}

function demarrerTimerMenu(elId, debut, fin) {
    var intv = setInterval(function() {
        var el = document.getElementById(elId);
        if (!el) { clearInterval(intv); return; }
        var now   = Date.now();
        if (now >= fin) { clearInterval(intv); el.textContent = 'Terminé'; return; }
        var cible = now < debut ? debut : fin;
        var reste = cible - now;
        var h = Math.floor(reste / 3600000);
        var m = Math.floor((reste % 3600000) / 60000);
        var s = Math.floor((reste % 60000) / 1000);
        el.textContent = h > 0 ? pad(h)+':'+pad(m)+':'+pad(s) : pad(m)+':'+pad(s);
    }, 1000);
}

function getProchainsVraisConcours() {
    var maintenant = Date.now();
    var prochains  = [];
    DATES_CONCOURS.forEach(function(c) {
        var dateTs = new Date(c.date + 'T00:00:00').getTime();
        if (dateTs > maintenant) {
            prochains.push(Object.assign({}, c, { jours: Math.floor((dateTs - maintenant) / 86400000) }));
        }
    });
    if (prochains.length === 0) return null;
    prochains.sort(function(a,b) { return a.jours - b.jours; });
    return '<div style="font-size:12px;color:var(--muted);padding:6px 0;">'
        + prochains.slice(0,2).map(function(c) {
            return c.emoji + ' <b>' + c.nom + '</b> dans ' + c.jours + ' j';
        }).join(' · ') + '</div>';
}

function demarrerComptesARebours() {
    afficherConcoursPrévu();
    if (countdownVraiConcours) clearInterval(countdownVraiConcours);
    countdownVraiConcours = setInterval(afficherConcoursPrévu, 30000);
}

// === CHARGER MENU ===
function chargerMenu(d) {
    userData = d;
    var p = d.prenom || '';
    var n = d.nom    || '';

    if (nomMenuEl)    nomMenuEl.textContent    = p + ' ' + n;
    if (avatarMenuEl) avatarMenuEl.textContent = initiales(p, n);
    if (nivEl)        nivEl.textContent        = d.niveau || 1;
    if (xpEl)         xpEl.textContent         = d.xp     || 0;
    if (streakEl)     streakEl.textContent     = d.streak  || 0;

    var rangInfo = getTitreRang(d.xp || 0);
    var titreEl  = document.getElementById('titreMenuRang');
    if (titreEl) {
        titreEl.textContent = rangInfo.emoji + ' ' + rangInfo.titre;
        titreEl.style.color = rangInfo.couleur;
    }

    // Rebrancher tous les boutons
    if (btnExam) {
        btnExam.onclick = function() {
            son('click');
            if (modalChoixSalle) modalChoixSalle.style.display = 'flex';
        };
    }
    if (btnEntrainement) {
        btnEntrainement.onclick = function() {
            son('click');
            afficherPageEntrainement();
        };
    }
    if (btnHistorique) {
        btnHistorique.onclick = function() {
            son('click');
            afficherHistorique();
            showPage(pageHistorique);
        };
    }
    if (btnStats) {
        btnStats.onclick = function() { son('click'); afficherStats(); };
    }
    if (btnBadges) {
        btnBadges.onclick = function() { son('click'); afficherBadgesPage(); };
    }
    if (btnClassement) {
        btnClassement.onclick = function() { son('click'); afficherClassement(); };
    }

    var btnPartager = document.getElementById('btnPartagerApp');
    if (btnPartager) {
        btnPartager.onclick = function() { son('click'); partagerApp(); };
    }

    if (btnLogout) {
        btnLogout.onclick = function() {
            son('click');
            modalTitreEl.textContent = 'Déconnexion';
            modalTexteEl.innerHTML   = '<p>Tu veux vraiment te déconnecter ?</p>';
            modalEl.style.display    = 'flex';
            btnConfirmer.onclick = function() {
                modalEl.style.display = 'none';
                if (presenceRef) presenceRef.remove();
                if (countdownVraiConcours) clearInterval(countdownVraiConcours);
                localStorage.removeItem('bb_user');
                user = null; userData = {};
                if (emailInput) emailInput.value = '';
                if (mdpInput)   mdpInput.value   = '';
                showPage(pageAccueil);
                toast('Déconnecté', 'success');
            };
            btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
        };
    }

    if (btnRetourMenuHist) {
        btnRetourMenuHist.onclick = function() { son('click'); showPage(pageMenu); };
    }
    if (btnRetourMenuStats) {
        btnRetourMenuStats.onclick = function() { son('click'); showPage(pageMenu); };
    }

    showPage(pageMenu);
    demarrerComptesARebours();
    history.pushState({ page:'menu' }, '', window.location.href);
}

// ============================================
// FIN PARTIE 5/24 ✅
// ============================================// ============================================
// PARTIE 6/24 — HISTORIQUE
// ============================================

async function afficherHistorique() {
    showPage(pageHistorique);
    var contenu = document.getElementById('contenuHistorique');
    if (!contenu) return;
    contenu.innerHTML = '<div class="loading-box"><div class="loader"></div><p>Chargement...</p></div>';

    try {
        var snapUser = await db.ref('users/' + user).once('value');
        var uData    = snapUser.val() || {};
        var histo    = uData.historique || [];
        if (!Array.isArray(histo)) histo = [];

        // Dédoublonner
        var vus = {};
        var histoUnique = [];
        histo.forEach(function(h) {
            if (!h) return;
            var cle = (h.timestamp||0) + '_' + (h.salle||'') + '_' + (h.score||0);
            if (!vus[cle]) { vus[cle] = true; histoUnique.push(h); }
        });

        histoUnique.sort(function(a,b) {
            return (b.timestamp||b.date||0) - (a.timestamp||a.date||0);
        });

        if (histoUnique.length === 0) {
            contenu.innerHTML =
                '<div style="text-align:center;padding:40px 20px;">'
                + '<div style="font-size:48px;margin-bottom:16px;">📋</div>'
                + '<p style="font-weight:700;color:var(--text);">Aucun historique</p>'
                + '<p style="color:var(--muted);font-size:13px;">Passe ton premier concours !</p>'
                + '<button class="btn-outline btn-small" style="margin-top:16px;" onclick="chargerMenu(userData)">← Retour au menu</button>'
                + '</div>';
            return;
        }

        var html = '<p style="color:var(--muted);font-size:13px;font-weight:600;padding:4px 0 12px 0;">'
            + histoUnique.length + ' concours passé(s)</p>';

        histoUnique.forEach(function(h) {
            var sc50       = Math.min(h.score || 0, 50);
            var pct        = getPct(sc50, 50);
            var ts         = h.timestamp || h.date || 0;
            var dateStr    = formatDate(ts);
            var sal        = h.salle || 'Concours';
            var men        = getMention(sc50);
            var mcls       = getMentionTagClass(sc50);
            var salleEmoji = (sal==='BEPC'||sal==='bepc') ? '📘' : '📗';
            var salleLabel = salleEmoji + ' ' + sal;
            var borderColor = pct>=80?'#22c55e':pct>=60?'#3b82f6':pct>=40?'#f97316':'#ef4444';

            var sortieHtml = h.nbSorties && h.nbSorties > 0
                ? '<span style="color:var(--orange);font-size:12px;font-weight:700;">⚠️ ' + h.nbSorties + ' sortie(s)</span>' : '';
            var xpHtml = h.xp && h.xp > 0
                ? '<span style="color:#8b5cf6;font-size:12px;font-weight:700;">💰 +' + h.xp + ' XP</span>' : '';

            html += '<div style="background:white;border-radius:18px;padding:16px 18px;margin-bottom:12px;border-left:5px solid '
                + borderColor + ';box-shadow:0 2px 12px rgba(0,0,0,0.07);">'
                + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">'
                + '<div><div style="font-weight:800;font-size:15px;color:var(--text);">' + salleLabel + '</div>'
                + '<div style="color:var(--muted);font-size:12px;margin-top:2px;">' + dateStr + '</div></div>'
                + '<div style="text-align:right;"><div style="font-size:26px;font-weight:900;color:' + borderColor + ';line-height:1;">' + sc50 + '/50</div>'
                + '<div style="font-size:12px;color:var(--muted);font-weight:600;">' + pct + '%</div></div></div>'
                + '<div style="background:#f1f5f9;border-radius:99px;height:6px;margin:10px 0;">'
                + '<div style="background:' + borderColor + ';border-radius:99px;height:6px;width:' + pct + '%;"></div></div>'
                + '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;">'
                + '<span class="mention-tag ' + mcls + '">' + men + '</span>'
                + '<span style="color:var(--green);font-size:12px;font-weight:700;">✅ ' + (h.bonnes||sc50) + '</span>'
                + '<span style="color:var(--orange);font-size:12px;font-weight:700;">⚠️ ' + (h.partielles||0) + '</span>'
                + '<span style="color:var(--red);font-size:12px;font-weight:700;">❌ ' + (h.fausses||0) + '</span>'
                + xpHtml + sortieHtml + '</div></div>';
        });

        contenu.innerHTML = html;
    } catch(e) {
        contenu.innerHTML = '<div style="text-align:center;padding:30px;color:var(--red);">⚠️ Erreur chargement historique</div>';
    }
}

// ============================================
// FIN PARTIE 6/24 ✅
// ============================================// ============================================
// PARTIE 7/24 — STATS + COURBE
// ============================================

function carteStatHTML(emoji, valeur, label) {
    return '<div style="background:white;border-radius:16px;padding:18px;text-align:center;box-shadow:0 2px 10px rgba(0,0,0,0.06);">'
        + '<div style="font-size:28px;margin-bottom:8px;">' + emoji + '</div>'
        + '<div style="font-size:24px;font-weight:900;color:var(--primary);">' + valeur + '</div>'
        + '<div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;">' + label + '</div></div>';
}

async function afficherStats() {
    showPage(pageStats);
    var contenu = document.getElementById('contenuStats');
    if (!contenu) return;
    contenu.innerHTML = '<div class="loading-box"><div class="loader"></div><p>Chargement...</p></div>';

    try {
        var snap = await db.ref('users/' + user).once('value');
        var d    = snap.val() || {};

        var xpTotal   = d.xp    || 0;
        var nivActuel = d.niveau || 1;
        var streakJ   = d.streak || 0;
        var nbrConc   = d.concoursFaits || 0;
        var rangInfo  = getTitreRang(xpTotal);
        var xpProchain = nivActuel * 100;
        var xpDansNiv  = xpTotal - (nivActuel - 1) * 100;
        var pctNiv     = Math.min(100, Math.round((xpDansNiv / xpProchain) * 100));

        var histo = d.historique || [];
        if (!Array.isArray(histo)) histo = [];

        var vus = {};
        var histoUnique = [];
        histo.forEach(function(h) {
            if (!h) return;
            var cle = (h.timestamp||0) + '_' + (h.salle||'') + '_' + (h.score||0);
            if (!vus[cle]) { vus[cle] = true; histoUnique.push(h); }
        });

        var tousScores = histoUnique.map(function(h) { return Math.min(h.score||0, 50); });
        var meilleur   = tousScores.length > 0 ? Math.max.apply(null, tousScores) : 0;
        var plusBas    = tousScores.length > 0 ? Math.min.apply(null, tousScores) : 0;
        var moyReelle  = tousScores.length > 0 ? tousScores.reduce(function(a,b){return a+b;},0) / tousScores.length : 0;
        var moyPct     = getPct(Math.round(moyReelle), 50);

        var totalEntrBon = 0, totalEntrAll = 0;
        try {
            var snapEntr = await db.ref('entrainement/' + user).once('value');
            var entr     = snapEntr.val() || {};
            Object.keys(entr).forEach(function(k) {
                var s = entr[k];
                if (s && s.total > 0) { totalEntrBon += s.bon||0; totalEntrAll += s.total; }
            });
        } catch(e) {}

        var pctEntr  = totalEntrAll > 0 ? Math.round((totalEntrBon / totalEntrAll) * 100) : 0;
        var badges   = d.badges || {};
        var nbBadges = Object.values(badges).filter(function(v){ return v===true; }).length;

        var html =
            '<div style="background:linear-gradient(135deg,#1a6b3c,#22c55e);border-radius:20px;padding:24px;text-align:center;margin-bottom:16px;">'
            + '<div style="font-size:36px;margin-bottom:6px;">' + rangInfo.emoji + '</div>'
            + '<div style="font-size:22px;font-weight:900;color:white;">' + rangInfo.titre + '</div>'
            + '<div style="font-size:13px;color:rgba(255,255,255,0.8);margin-top:4px;">' + xpTotal + ' XP au total</div>'
            + '</div>'
            + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">'
            + carteStatHTML('🎯', nbrConc,           'CONCOURS PASSÉS')
            + carteStatHTML('⭐', nivActuel,          'NIVEAU ACTUEL')
            + carteStatHTML('💰', xpTotal,            'XP TOTAL')
            + carteStatHTML('🏆', nbBadges,           'BADGES OBTENUS')
            + carteStatHTML('📈', meilleur + '/50',   'MEILLEUR SCORE')
            + carteStatHTML('📉', plusBas  + '/50',   'PLUS BAS SCORE')
            + '</div>'
            + '<div style="background:white;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 2px 10px rgba(0,0,0,0.06);">'
            + '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">'
            + '<span style="font-weight:700;font-size:14px;">Niveau ' + nivActuel + ' — XP</span>'
            + '<span style="color:var(--primary);font-weight:700;font-size:14px;">' + xpDansNiv + '/' + xpProchain + ' XP</span></div>'
            + '<div style="background:#f1f5f9;border-radius:99px;height:10px;">'
            + '<div style="background:var(--primary);border-radius:99px;height:10px;width:' + pctNiv + '%;"></div></div></div>'
            + '<div style="background:white;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 2px 10px rgba(0,0,0,0.06);">'
            + '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">'
            + '<span style="font-weight:700;font-size:14px;">Moyenne concours</span>'
            + '<span style="color:' + (moyPct>=60?'var(--primary)':moyPct>=40?'var(--orange)':'var(--red)') + ';font-weight:700;font-size:14px;">'
            + Math.round(moyReelle) + '/50 (' + moyPct + '%)</span></div>'
            + '<div style="background:#f1f5f9;border-radius:99px;height:10px;">'
            + '<div style="background:' + (moyPct>=60?'var(--primary)':moyPct>=40?'var(--orange)':'var(--red)') + ';border-radius:99px;height:10px;width:' + moyPct + '%;"></div></div></div>';

        if (totalEntrAll > 0) {
            html += '<div style="background:white;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 2px 10px rgba(0,0,0,0.06);">'
                + '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">'
                + '<span style="font-weight:700;font-size:14px;">🎯 Taux entraînement</span>'
                + '<span style="color:' + (pctEntr>=70?'var(--primary)':pctEntr>=40?'var(--orange)':'var(--red)') + ';font-weight:700;font-size:14px;">'
                + totalEntrBon + '/' + totalEntrAll + ' (' + pctEntr + '%)</span></div>'
                + '<div style="background:#f1f5f9;border-radius:99px;height:10px;">'
                + '<div style="background:' + (pctEntr>=70?'var(--primary)':pctEntr>=40?'#eab308':'var(--red)') + ';border-radius:99px;height:10px;width:' + pctEntr + '%;"></div></div></div>';
        }

        html += '<div id="courbeStats" style="background:white;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 2px 10px rgba(0,0,0,0.06);">'
            + '<div style="font-weight:800;font-size:13px;margin-bottom:12px;">📈 Évolution de tes scores</div>'
            + '<div id="courbeStatsContent"><p style="color:var(--muted);font-size:13px;text-align:center;">Chargement courbe...</p></div></div>'
            + '<div style="background:white;border-radius:16px;padding:20px;text-align:center;box-shadow:0 2px 10px rgba(0,0,0,0.06);">'
            + '<div style="font-size:18px;font-weight:700;color:var(--orange);margin-bottom:6px;">🔥 Série actuelle</div>'
            + '<div style="font-size:42px;font-weight:900;color:var(--orange);">' + streakJ + '</div>'
            + '<div style="font-size:14px;color:var(--orange);font-weight:700;">jours</div></div>'
            + '<div style="margin-top:14px;">'
            + '<button class="btn-outline" onclick="showPage(pageMenu)">← Retour au menu</button></div>';

        contenu.innerHTML = html;
        genererCourbeStats(histoUnique);

    } catch(e) {
        contenu.innerHTML = '<div style="text-align:center;padding:30px;color:var(--red);">⚠️ Erreur stats</div>';
    }
}

function genererCourbeStats(histoUnique) {
    var el = document.getElementById('courbeStatsContent');
    if (!el) return;

    var tries = histoUnique.slice().sort(function(a,b) {
        return (a.timestamp||0) - (b.timestamp||0);
    }).slice(-10);

    if (tries.length < 2) {
        el.innerHTML = '<p style="color:var(--muted);font-size:13px;text-align:center;">Passe au moins 2 concours pour voir ta courbe.</p>';
        return;
    }

    var scores = tries.map(function(r) { return Math.min(r.score||0, 50); });
    var W=300, H=120, pL=30, pR=20, pT=20, pB=30;
    var gW = W-pL-pR, gH = H-pT-pB, n = scores.length;

    var pts = scores.map(function(s,i) {
        return { x: n>1 ? pL+(i/(n-1))*gW : pL+gW/2, y: pT+gH-(s/50)*gH, s: s };
    });

    var poly = pts.map(function(p){ return p.x+','+p.y; }).join(' ');
    var area = pL+','+(pT+gH)+' '+poly+' '+pts[pts.length-1].x+','+(pT+gH);

    var refs = '';
    [0,25,50].forEach(function(v) {
        var yR = pT+gH-(v/50)*gH;
        refs += '<line x1="'+pL+'" y1="'+yR+'" x2="'+(W-pR)+'" y2="'+yR+'" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4"/>'
              + '<text x="'+(pL-4)+'" y="'+(yR+4)+'" text-anchor="end" font-size="9" fill="#94a3b8">'+v+'</text>';
    });

    var diff = scores[scores.length-1] - scores[0];
    var tendance = diff>0
        ? '<div style="color:var(--primary);font-size:12px;font-weight:700;margin-top:8px;text-align:center;">📈 +'+diff+' pts de progression</div>'
        : diff<0
        ? '<div style="color:var(--orange);font-size:12px;font-weight:700;margin-top:8px;text-align:center;">📉 '+diff+' pts</div>'
        : '<div style="color:var(--muted);font-size:12px;font-weight:700;margin-top:8px;text-align:center;">➡️ Score stable</div>';

    el.innerHTML = '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" style="width:100%;max-width:100%;overflow:visible;">'
        + refs
        + '<polygon points="'+area+'" fill="rgba(26,107,60,0.08)"/>'
        + '<polyline points="'+poly+'" fill="none" stroke="#1a6b3c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
        + pts.map(function(p,i) {
            var c = p.s>=40?'#22c55e':p.s>=25?'#3b82f6':p.s>=15?'#f97316':'#ef4444';
            var last = i===pts.length-1;
            return '<circle cx="'+p.x+'" cy="'+p.y+'" r="'+(last?6:4)+'" fill="'+c+'" stroke="white" stroke-width="2"/>'
                 + '<text x="'+p.x+'" y="'+(p.y-10)+'" text-anchor="middle" font-size="'+(last?11:9)+'" fill="'+c+'" font-weight="'+(last?900:700)+'">'+p.s+'</text>';
        }).join('')
        + '</svg>' + tendance;
}

// ============================================
// FIN PARTIE 7/24 ✅
// ============================================// ============================================
// PARTIE 8/24 — BADGES + CLASSEMENT + TOP10
// ============================================

async function afficherBadgesPage() {
    showPage(pageStats);
    var contenu = document.getElementById('contenuStats');
    if (!contenu) return;
    contenu.innerHTML = '<div class="loading-box"><div class="loader"></div><p>Chargement badges...</p></div>';

    try {
        var snap   = await db.ref('users/' + user).once('value');
        var d      = snap.val() || {};
        var badges = d.badges  || {};
        var nbObtenu = Object.values(badges).filter(function(v){ return v===true; }).length;

        var html =
            '<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">'
            + '<button class="btn-back" onclick="showPage(pageMenu)">←</button>'
            + '<h2 style="margin:0;">🏆 Mes Badges</h2></div>'
            + '<div style="background:linear-gradient(135deg,#1a6b3c,#22c55e);border-radius:16px;padding:18px;text-align:center;margin-bottom:20px;">'
            + '<div style="font-size:36px;margin-bottom:6px;">🏆</div>'
            + '<div style="font-size:28px;font-weight:900;color:white;">' + nbObtenu + '/' + BADGES_LIST.length + '</div>'
            + '<div style="font-size:13px;color:rgba(255,255,255,0.8);">badges débloqués</div></div>'
            + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:14px;">';

        BADGES_LIST.forEach(function(b) {
            var obtenu = badges[b.id] === true;
            html += '<div style="text-align:center;padding:16px 10px;border-radius:16px;background:'
                + (obtenu ? 'rgba(26,107,60,0.08)' : '#f8fafc')
                + ';border:2px solid ' + (obtenu ? 'rgba(26,107,60,0.3)' : '#e2e8f0')
                + ';opacity:' + (obtenu ? '1' : '0.45') + ';position:relative;">'
                + (obtenu ? '<div style="position:absolute;top:6px;right:6px;font-size:10px;">✅</div>' : '')
                + '<div style="font-size:36px;margin-bottom:8px;">' + b.emoji + '</div>'
                + '<div style="font-size:11px;font-weight:800;color:var(--text);line-height:1.3;margin-bottom:4px;">' + b.nom + '</div>'
                + '<div style="font-size:10px;color:var(--muted);line-height:1.4;">' + b.desc + '</div></div>';
        });

        html += '</div><div style="margin-top:14px;"><button class="btn-outline" onclick="showPage(pageMenu)">← Retour au menu</button></div>';
        contenu.innerHTML = html;

    } catch(e) {
        contenu.innerHTML = '<div style="text-align:center;padding:30px;color:var(--red);">⚠️ Erreur badges</div>';
    }
}

async function afficherClassement() {
    showPage(pageStats);
    var contenu = document.getElementById('contenuStats');
    if (!contenu) return;
    contenu.innerHTML = '<div class="loading-box"><div class="loader"></div><p>Chargement...</p></div>';

    try {
        var snapBepc = await db.ref('resultatsBepc').once('value');
        var snapBAC  = await db.ref('resultatsBAC').once('value');

        var rBepc = [];
        snapBepc.forEach(function(c) { rBepc.push(Object.assign({key:c.key}, c.val())); });
        var rBAC = [];
        snapBAC.forEach(function(c)  { rBAC.push(Object.assign({key:c.key}, c.val())); });

        rBepc = rBepc.filter(function(r){ return r.score!==undefined && r.prenom; });
        rBAC  = rBAC.filter(function(r) { return r.score!==undefined && r.prenom; });

        rBepc.sort(function(a,b){ return b.score-a.score || (a.timestamp||0)-(b.timestamp||0); });
        rBAC.sort(function(a,b) { return b.score-a.score || (a.timestamp||0)-(b.timestamp||0); });

        var html =
            '<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">'
            + '<button class="btn-back" onclick="showPage(pageMenu)">←</button>'
            + '<h2 style="margin:0;">📊 Classement</h2></div>'
            + '<div style="background:white;border-radius:16px;padding:16px;margin-bottom:14px;box-shadow:0 2px 10px rgba(0,0,0,0.06);">'
            + '<h3 style="margin:0 0 14px 0;font-size:15px;color:var(--blue);">📘 Classement BEPC</h3>';

        if (rBepc.length === 0) {
            html += '<p style="color:var(--muted);text-align:center;">Aucun résultat</p>';
        } else {
            rBepc.forEach(function(r,i){ html += ligneClassement(r,i); });
        }

        html += '</div><div style="background:white;border-radius:16px;padding:16px;margin-bottom:14px;box-shadow:0 2px 10px rgba(0,0,0,0.06);">'
            + '<h3 style="margin:0 0 14px 0;font-size:15px;color:var(--primary);">📗 Classement BAC</h3>';

        if (rBAC.length === 0) {
            html += '<p style="color:var(--muted);text-align:center;">Aucun résultat</p>';
        } else {
            rBAC.forEach(function(r,i){ html += ligneClassement(r,i); });
        }

        html += '</div><button class="btn-outline" onclick="showPage(pageMenu)">← Retour au menu</button>';
        contenu.innerHTML = html;

    } catch(e) {
        contenu.innerHTML = '<div style="text-align:center;padding:30px;color:var(--red);">⚠️ Erreur classement</div>';
    }
}

function ligneClassement(r, i) {
    var nom    = ((r.prenom||'') + ' ' + (r.nom||'')).trim() || 'Candidat';
    var med    = i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1);
    var estMoi = r.key === user;
    return '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f1f5f9;'
        + (estMoi ? 'background:rgba(26,107,60,0.05);border-radius:10px;padding:10px;' : '') + '">'
        + '<span style="font-size:20px;min-width:32px;text-align:center;">' + med + '</span>'
        + '<div style="flex:1;min-width:0;"><div style="font-weight:700;font-size:14px;color:var(--text);">' + nom
        + (estMoi ? ' <span style="font-size:10px;color:var(--primary);font-weight:800;background:rgba(26,107,60,0.1);padding:2px 6px;border-radius:20px;">Moi</span>' : '')
        + '</div></div>'
        + '<span style="font-size:16px;font-weight:900;color:var(--primary);">' + Math.min(r.score||0,50) + '/50</span></div>';
}

async function verifierBadges(score, nbSortiesFinales) {
    if (!user || !userData) return;
    var badges = userData.badges || {};
    var nouv   = [];
    var xpT    = userData.xp || 0;
    var nbrC   = (userData.concoursFaits || 0) + 1;

    if (!badges.premier)                            { badges.premier   = true; nouv.push('premier');   }
    if (score >= 50 && !badges.perfect)             { badges.perfect   = true; nouv.push('perfect');   }
    if (nbSortiesFinales === 0 && !badges.resistant){ badges.resistant = true; nouv.push('resistant'); }
    if (nbrC >= 5 && !badges.assidu)                { badges.assidu    = true; nouv.push('assidu');    }
    if (xpT >= 1000 && !badges.elite)               { badges.elite     = true; nouv.push('elite');     }
    if ((userData.niveau||1) >= 10 && !badges.niveau10){ badges.niveau10 = true; nouv.push('niveau10'); }

    if (nouv.length > 0) {
        await db.ref('users/' + user).update({ badges: badges });
        userData.badges = badges;
        nouv.forEach(function(id) {
            var b = BADGES_LIST.find(function(x){ return x.id===id; });
            if (b) setTimeout(function() {
                afficherBadgeAnimation(b.emoji, b.nom);
                notifBadge(b.emoji, b.nom);
            }, 1500);
        });
    }
}

async function verifierTop10(score, prenom, nom) {
    try {
        var snap    = await db.ref('top10Permanent').once('value');
        var entries = [];
        snap.forEach(function(child) { entries.push(Object.assign({key:child.key}, child.val())); });
        entries.sort(function(a,b){ return b.score - a.score; });
        var monEntry  = entries.find(function(e){ return e.key === user; });
        var dansTop10 = entries.length < 10 || score > (entries[9] ? entries[9].score : 0);
        var amelio    = monEntry && score > monEntry.score;
        if (dansTop10 || amelio) {
            await db.ref('top10Permanent/' + user).set({ prenom:prenom||'', nom:nom||'', score:score, date:Date.now() });
            if (!userData.badges || !userData.badges.top10all) {
                var b2 = userData.badges || {};
                b2.top10all = true;
                await db.ref('users/' + user).update({ badges: b2 });
                userData.badges = b2;
                afficherBadgeAnimation('🌟', 'Légende Top 10');
            }
        }
    } catch(e) {}
}

if (btnBadges)     { btnBadges.onclick     = function(){ son('click'); afficherBadgesPage(); }; }
if (btnClassement) { btnClassement.onclick = function(){ son('click'); afficherClassement(); }; }

// ============================================
// FIN PARTIE 8/24 ✅
// ============================================// ============================================
// PARTIE 9/24 — ADMIN LOGIN + CONFIG + QUOTA
// ============================================

var tentativesAdmin   = 0;
var derniereTentAdmin = 0;
var MAX_TENT_ADM      = 3;
var BLOCAGE_ADM_MS    = 10 * 60 * 1000;

function verifierMdpAdmin(mdpSaisi) {
    var encoded = btoa(btoa(
        mdpSaisi + '_bonogo_admin_salt'));
    var attendu = btoa(btoa(
        '2305' + '_bonogo_admin_salt'));
    return encoded === attendu;
}

if (btnLoginAdmin) {
    btnLoginAdmin.onclick = async function() {
        son('click');
        var now = Date.now();
        if (tentativesAdmin >= MAX_TENT_ADM) {
            var tempsR = BLOCAGE_ADM_MS
                - (now - derniereTentAdmin);
            if (tempsR > 0) {
                if (erreurAdmin)
                    erreurAdmin.textContent =
                        'Trop de tentatives. Attends '
                        + Math.ceil(tempsR/60000)
                        + ' min.';
                son('error'); return;
            } else { tentativesAdmin = 0; }
        }
        var mdpSaisi = adminPassEl
            ? adminPassEl.value.trim() : '';
        if (!mdpSaisi) {
            if (erreurAdmin)
                erreurAdmin.textContent =
                    'Entre le mot de passe';
            son('error'); return;
        }
        if (verifierMdpAdmin(mdpSaisi)) {
            tentativesAdmin = 0;
            if (erreurAdmin)
                erreurAdmin.textContent = '';
            if (adminPassEl)
                adminPassEl.value = '';
            toast('Accès admin accordé','success');
            son('success');
            showPage(pageAdmin);
            chargerAdmin();
        } else {
            tentativesAdmin++;
            derniereTentAdmin = now;
            var rest = MAX_TENT_ADM
                - tentativesAdmin;
            if (erreurAdmin)
                erreurAdmin.textContent =
                    rest > 0
                    ? 'Mot de passe incorrect. '
                    + rest + ' essai(s).'
                    : 'Accès bloqué 10 minutes.';
            son('error');
        }
    };
}

async function chargerAdmin() {
    if (statusEl) {
        statusEl.textContent      = '🟢 Connecté';
        statusEl.style.background =
            'rgba(34,197,94,0.2)';
        statusEl.style.color      = 'var(--green)';
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

        if (statCandidatsEl)
            statCandidatsEl.textContent =
                Object.keys(users).length;

        var totalRes =
            Object.keys(resBepc).length
            + Object.keys(resBAC).length;
        if (statConcoursEl)
            statConcoursEl.textContent = totalRes;

        var scoresAll = [];
        Object.values(resBepc)
            .concat(Object.values(resBAC))
            .forEach(function(r) {
            if (r && r.score !== undefined)
                scoresAll.push(
                    Math.min(r.score||0, 50));
        });
        var moy = scoresAll.length > 0
            ? (scoresAll.reduce(
                function(a,b){return a+b;},0)
                / scoresAll.length).toFixed(1)
            : 0;
        if (statMoyEl)
            statMoyEl.textContent = moy+'/50';

        // Charger quota dans les champs
        var maxBepc = quota.maxBepc || 200;
        var maxBAC  = quota.maxBAC  || 200;
        var elMaxB  = document.getElementById(
            'inputMaxBepc');
        var elMaxBac = document.getElementById(
            'inputMaxBAC');
        if (elMaxB)   elMaxB.value   = maxBepc;
        if (elMaxBac) elMaxBac.value = maxBAC;

        if (cfgBepc.heureDebut && hDebutBepcEl)
            hDebutBepcEl.value = cfgBepc.heureDebut;
        if (cfgBepc.heureFin && hFinBepcEl)
            hFinBepcEl.value   = cfgBepc.heureFin;
        if (cfgBepc.type && typeConcoursBepcEl)
            typeConcoursBepcEl.value = cfgBepc.type;
        if (cfgBAC.heureDebut && hDebutBAC_El)
            hDebutBAC_El.value = cfgBAC.heureDebut;
        if (cfgBAC.heureFin && hFinBAC_El)
            hFinBAC_El.value   = cfgBAC.heureFin;
        if (cfgBAC.type && typeConcoursBAC_El)
            typeConcoursBAC_El.value = cfgBAC.type;

        var sbSnap = await db.ref('sujetBepc')
            .once('value');
        if (sbSnap.exists()) {
            sujetBepc = sbSnap.val() || [];
            if (sujetBepc.length > 0)
                afficherQuestionsAdmin('bepc');
        }
        var sbBAC = await db.ref('sujetBAC')
            .once('value');
        if (sbBAC.exists()) {
            sujetBAC = sbBAC.val() || [];
            if (sujetBAC.length > 0)
                afficherQuestionsAdmin('bac');
        }

        demarrerClassementLive();
        demarrerTop10Live();
        chargerListeCandidats();
        demarrerSuiviSalles();

    } catch(e) {
        toast('Erreur chargement admin','error');
    }
}

// === SUIVI SALLES EN TEMPS RÉEL ===
function demarrerSuiviSalles() {
    // Nettoyer les places expirées
    // (plus de 20 minutes)
    nettoyerPlacesExpirees('bepc');
    nettoyerPlacesExpirees('bac');

    // Écouter en temps réel
    db.ref('salleBepc').on('value',
        function(snap) {
        var count = snap.numChildren();
        var el = document.getElementById(
            'statSalleBepc');
        if (el) el.textContent = count;
    });
    db.ref('salleBAC').on('value',
        function(snap) {
        var count = snap.numChildren();
        var el = document.getElementById(
            'statSalleBAC');
        if (el) el.textContent = count;
    });
}

async function nettoyerPlacesExpirees(salle) {
    var node = salle === 'bepc'
        ? 'salleBepc' : 'salleBAC';
    try {
        var snap = await db.ref(node)
            .once('value');
        var now  = Date.now();
        var DUREE_MS = 20 * 60 * 1000;
        var updates  = {};
        snap.forEach(function(child) {
            var data = child.val();
            if (data && data.entreeTs
                && (now - data.entreeTs)
                > DUREE_MS) {
                updates[child.key] = null;
            }
        });
        if (Object.keys(updates).length > 0) {
            await db.ref(node).update(updates);
        }
    } catch(e) {}
}

if (btnSaveConfigBepcEl) {
    btnSaveConfigBepcEl.onclick =
        async function() {
        son('click');
        var today = new Date()
            .toISOString().split('T')[0];
        var debut = new Date(
            today + 'T'
            + hDebutBepcEl.value + ':00')
            .getTime();
        var fin = new Date(
            today + 'T'
            + hFinBepcEl.value + ':00')
            .getTime();
        if (fin <= debut) {
            toast('Heure fin > début','error');
            return;
        }

        // Sauvegarder quota BEPC
        var elMaxB = document.getElementById(
            'inputMaxBepc');
        var maxB = elMaxB
            ? parseInt(elMaxB.value)||200 : 200;

        await Promise.all([
            db.ref('configBepc').set({
                type:           typeConcoursBepcEl.value,
                heureDebut:     hDebutBepcEl.value,
                heureFin:       hFinBepcEl.value,
                debutTimestamp: debut,
                finTimestamp:   fin,
                dateCreation:   Date.now()
            }),
            db.ref('configQuota').update({
                maxBepc: maxB
            })
        ]);
        toast('✅ Config BEPC sauvegardée !',
            'success');
        son('success');
    };
}

if (btnSaveConfigBAC_El) {
    btnSaveConfigBAC_El.onclick =
        async function() {
        son('click');
        var today = new Date()
            .toISOString().split('T')[0];
        var debut = new Date(
            today + 'T'
            + hDebutBAC_El.value + ':00')
            .getTime();
        var fin = new Date(
            today + 'T'
            + hFinBAC_El.value + ':00')
            .getTime();
        if (fin <= debut) {
            toast('Heure fin > début','error');
            return;
        }

        // Sauvegarder quota BAC
        var elMaxBac = document.getElementById(
            'inputMaxBAC');
        var maxBac = elMaxBac
            ? parseInt(elMaxBac.value)||200 : 200;

        await Promise.all([
            db.ref('configBAC').set({
                type:           typeConcoursBAC_El.value,
                heureDebut:     hDebutBAC_El.value,
                heureFin:       hFinBAC_El.value,
                debutTimestamp: debut,
                finTimestamp:   fin,
                dateCreation:   Date.now()
            }),
            db.ref('configQuota').update({
                maxBAC: maxBac
            })
        ]);
        toast('✅ Config BAC sauvegardée !',
            'success');
        son('success');
    };
}

// ============================================
// FIN PARTIE 9/24 ✅
// ============================================// ============================================
// PARTIE 10/24 — ADMIN IMPORT JSON + QUESTIONS
// ============================================

var btnAjouterPartieBepc = document.getElementById('btnAjouterPartieBepc');
var btnViderZoneBepc     = document.getElementById('btnViderZoneBepc');
var btnAjouterPartieBAC  = document.getElementById('btnAjouterPartieBAC');
var btnViderZoneBAC      = document.getElementById('btnViderZoneBAC');

function nettoyerPartie(partie) {
    partie = partie.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,' ').trim();
    if (partie.startsWith('[')) partie = partie.substring(1).trim();
    if (partie.endsWith(']'))   partie = partie.slice(0,-1).trim();
    partie = partie.replace(/,\s*$/,'').trim();
    return partie;
}

if (btnAjouterPartieBepc) {
    btnAjouterPartieBepc.onclick = function() {
        son('click');
        var partie = collerJSONBepcEl ? collerJSONBepcEl.value.trim() : '';
        if (!partie) { toast('Colle une partie JSON d\'abord','error'); return; }
        partie = nettoyerPartie(partie);
        if (!partie) { toast('Partie vide','error'); return; }
        jsonCumuleBepc = jsonCumuleBepc==='' ? partie : jsonCumuleBepc+','+partie;
        if (collerJSONBepcEl) collerJSONBepcEl.value = '';
        var infoEl = document.getElementById('infoCumulBepc');
        var nbEl   = document.getElementById('nbCaracteresBepc');
        if (infoEl) infoEl.style.display = 'block';
        if (nbEl)   nbEl.textContent     = jsonCumuleBepc.length;
        toast('Partie BEPC ajoutée !','success'); son('success');
    };
}

if (btnViderZoneBepc) {
    btnViderZoneBepc.onclick = function() {
        son('click');
        jsonCumuleBepc = '';
        if (collerJSONBepcEl) collerJSONBepcEl.value = '';
        var infoEl = document.getElementById('infoCumulBepc');
        if (infoEl) infoEl.style.display = 'none';
        toast('Zone BEPC vidée','success');
    };
}

if (btnCharger50BepcEl) {
    btnCharger50BepcEl.onclick = function() {
        son('click');
        var texte = jsonCumuleBepc !== ''
            ? '[' + jsonCumuleBepc + ']'
            : (collerJSONBepcEl ? collerJSONBepcEl.value.trim() : '');
        if (!texte || texte==='[]') { toast('Colle les questions BEPC','error'); return; }
        jsonCumuleBepc = '';
        var infoEl = document.getElementById('infoCumulBepc');
        if (infoEl) infoEl.style.display = 'none';
        sujetBepc = chargerJSONGenerique(texte);
        if (sujetBepc.length > 0) {
            afficherQuestionsAdmin('bepc');
            if (collerJSONBepcEl) collerJSONBepcEl.value = '';
            if (btnEnvoyer50BepcEl) btnEnvoyer50BepcEl.style.display = 'block';
            toast(sujetBepc.length + ' questions BEPC chargées !','success'); son('success');
        }
    };
}

if (btnEnvoyer50BepcEl) {
    btnEnvoyer50BepcEl.onclick = function() {
        son('click');
        modalTitreEl.textContent = 'Envoyer questions BEPC';
        modalTexteEl.innerHTML   = '<p>Envoyer <b>' + sujetBepc.length + '</b> questions aux candidats BEPC ?</p>';
        modalEl.style.display    = 'flex';
        btnConfirmer.onclick = async function() {
            modalEl.style.display = 'none';
            await db.ref('sujetBepc').set(sujetBepc);
            if (btnEnvoyer50BepcEl) btnEnvoyer50BepcEl.style.display = 'none';
            toast(sujetBepc.length + ' questions BEPC envoyées !','success'); son('success');
        };
        btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
    };
}

if (btnAjouterPartieBAC) {
    btnAjouterPartieBAC.onclick = function() {
        son('click');
        var partie = collerJSONBAC_El ? collerJSONBAC_El.value.trim() : '';
        if (!partie) { toast('Colle une partie JSON d\'abord','error'); return; }
        partie = nettoyerPartie(partie);
        if (!partie) { toast('Partie vide','error'); return; }
        jsonCumuleBAC = jsonCumuleBAC==='' ? partie : jsonCumuleBAC+','+partie;
        if (collerJSONBAC_El) collerJSONBAC_El.value = '';
        var infoEl = document.getElementById('infoCumulBAC');
        var nbEl   = document.getElementById('nbCaracteresBAC');
        if (infoEl) infoEl.style.display = 'block';
        if (nbEl)   nbEl.textContent     = jsonCumuleBAC.length;
        toast('Partie BAC ajoutée !','success'); son('success');
    };
}

if (btnViderZoneBAC) {
    btnViderZoneBAC.onclick = function() {
        son('click');
        jsonCumuleBAC = '';
        if (collerJSONBAC_El) collerJSONBAC_El.value = '';
        var infoEl = document.getElementById('infoCumulBAC');
        if (infoEl) infoEl.style.display = 'none';
        toast('Zone BAC vidée','success');
    };
}

if (btnCharger50BAC_El) {
    btnCharger50BAC_El.onclick = function() {
        son('click');
        var texte = jsonCumuleBAC !== ''
            ? '[' + jsonCumuleBAC + ']'
            : (collerJSONBAC_El ? collerJSONBAC_El.value.trim() : '');
        if (!texte || texte==='[]') { toast('Colle les questions BAC','error'); return; }
        jsonCumuleBAC = '';
        var infoEl = document.getElementById('infoCumulBAC');
        if (infoEl) infoEl.style.display = 'none';
        sujetBAC = chargerJSONGenerique(texte);
        if (sujetBAC.length > 0) {
            afficherQuestionsAdmin('bac');
            if (collerJSONBAC_El) collerJSONBAC_El.value = '';
            if (btnEnvoyer50BAC_El) btnEnvoyer50BAC_El.style.display = 'block';
            toast(sujetBAC.length + ' questions BAC chargées !','success'); son('success');
        }
    };
}

if (btnEnvoyer50BAC_El) {
    btnEnvoyer50BAC_El.onclick = function() {
        son('click');
        modalTitreEl.textContent = 'Envoyer questions BAC';
        modalTexteEl.innerHTML   = '<p>Envoyer <b>' + sujetBAC.length + '</b> questions aux candidats BAC ?</p>';
        modalEl.style.display    = 'flex';
        btnConfirmer.onclick = async function() {
            modalEl.style.display = 'none';
            await db.ref('sujetBAC').set(sujetBAC);
            if (btnEnvoyer50BAC_El) btnEnvoyer50BAC_El.style.display = 'none';
            toast(sujetBAC.length + ' questions BAC envoyées !','success'); son('success');
        };
        btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
    };
}

function afficherQuestionsAdmin(salle) {
    var sujet   = salle==='bepc' ? sujetBepc        : sujetBAC;
    var listeEl = salle==='bepc' ? listeQuestionsBepcEl : listeQuestionsBAC_El;
    if (!listeEl) return;
    listeEl.innerHTML = '';

    sujet.forEach(function(q, idx) {
        var div  = document.createElement('div');
        div.className = 'question-edit';
        var html = '<div style="font-size:12px;font-weight:800;color:var(--blue);margin-bottom:10px">Q'+(idx+1)+'/'+sujet.length+' — '+salle.toUpperCase()+'</div>'
            + '<textarea data-idx="'+idx+'" data-salle="'+salle+'">'+(q.texte||'')+'</textarea>'
            + '<input type="text" placeholder="Explication" data-expl="'+idx+'" data-salle="'+salle+'" value="'+(q.explication||'').replace(/"/g,'&quot;')+'" style="padding:10px 14px;margin:6px 0;">';

        for (var ri=0; ri<4; ri++) {
            var rep = (q.reponses && q.reponses[ri]) ? q.reponses[ri] : {};
            html += '<div class="reponse-edit">'
                + '<input type="checkbox" '+(rep.correct?'checked':'')+' data-q="'+idx+'" data-r="'+ri+'" data-salle="'+salle+'">'
                + '<input type="text" placeholder="Réponse ABCD'[ri]+'" value="'+(rep.texte||'').replace(/"/g,'&quot;')+'" data-q="'+idx+'" data-r="'+ri+'" data-salle="'+salle+'">'
                + '</div>';
        }
        html += '<button class="btn-del" onclick="supprimerQuestion(\''+salle+'\','+idx+')">Supprimer</button>';
        div.innerHTML = html;

        div.querySelectorAll('textarea').forEach(function(ta) {
            ta.oninput = function() {
                var i=parseInt(this.dataset.idx), s=this.dataset.salle;
                var arr = s==='bepc'?sujetBepc:sujetBAC;
                if (arr[i]) arr[i].texte = this.value;
            };
        });
        div.querySelectorAll('input[data-expl]').forEach(function(inp) {
            inp.oninput = function() {
                var i=parseInt(this.dataset.expl), s=this.dataset.salle;
                var arr = s==='bepc'?sujetBepc:sujetBAC;
                if (arr[i]) arr[i].explication = this.value;
            };
        });
        div.querySelectorAll('.reponse-edit input[type="text"]').forEach(function(inp) {
            inp.oninput = function() {
                var q2=parseInt(this.dataset.q), r2=parseInt(this.dataset.r), s=this.dataset.salle;
                var arr = s==='bepc'?sujetBepc:sujetBAC;
                if (!arr[q2]) return;
                if (!arr[q2].reponses[r2]) arr[q2].reponses[r2] = {};
                arr[q2].reponses[r2].texte = this.value;
            };
        });
        div.querySelectorAll('.reponse-edit input[type="checkbox"]').forEach(function(cb) {
            cb.onchange = function() {
                var q2=parseInt(this.dataset.q), r2=parseInt(this.dataset.r), s=this.dataset.salle;
                var arr = s==='bepc'?sujetBepc:sujetBAC;
                if (!arr[q2]) return;
                if (!arr[q2].reponses[r2]) arr[q2].reponses[r2] = {};
                arr[q2].reponses[r2].correct = this.checked;
            };
        });
        listeEl.appendChild(div);
    });
}

window.supprimerQuestion = function(salle, idx) {
    son('click');
    if (confirm('Supprimer cette question ?')) {
        if (salle==='bepc') sujetBepc.splice(idx,1); else sujetBAC.splice(idx,1);
        afficherQuestionsAdmin(salle);
        toast('Question supprimée','success');
    }
};

if (btnAjouterQBepcEl) {
    btnAjouterQBepcEl.onclick = function() {
        son('click');
        sujetBepc.push({ texte:'', explication:'', reponses:[
            {texte:'',correct:false},{texte:'',correct:false},
            {texte:'',correct:false},{texte:'',correct:false}
        ]});
        afficherQuestionsAdmin('bepc');
    };
}
if (btnAjouterQBAC_El) {
    btnAjouterQBAC_El.onclick = function() {
        son('click');
        sujetBAC.push({ texte:'', explication:'', reponses:[
            {texte:'',correct:false},{texte:'',correct:false},
            {texte:'',correct:false},{texte:'',correct:false}
        ]});
        afficherQuestionsAdmin('bac');
    };
}
if (btnSaveSujetBepcEl) {
    btnSaveSujetBepcEl.onclick = async function() {
        son('click');
        if (sujetBepc.length===0) { toast('Aucune question BEPC','error'); return; }
        await db.ref('sujetBepc').set(sujetBepc);
        toast('Sujet BEPC sauvegardé !','success'); son('success');
    };
}
if (btnSaveSujetBAC_El) {
    btnSaveSujetBAC_El.onclick = async function() {
        son('click');
        if (sujetBAC.length===0) { toast('Aucune question BAC','error'); return; }
        await db.ref('sujetBAC').set(sujetBAC);
        toast('Sujet BAC sauvegardé !','success'); son('success');
    };
}

// ============================================
// FIN PARTIE 10/24 ✅
// ============================================// ============================================
// PARTIE 11/24 — ADMIN CANDIDATS + TOP10
// ============================================

function demarrerClassementLive() {
    db.ref('resultatsBepc').on('value', function(snap) {
        var results = [];
        snap.forEach(function(child) {
            var v = child.val();
            if (v && v.prenom) results.push(Object.assign({key:child.key}, v));
        });
        results.sort(function(a,b){ return b.score - a.score; });
        if (!top10BepcEl) return;
        if (results.length === 0) {
            top10BepcEl.innerHTML = '<p style="color:var(--muted);text-align:center;">Aucun résultat BEPC</p>'; return;
        }
        top10BepcEl.innerHTML = results.slice(0,10).map(function(r,i) {
            var nom = ((r.prenom||'') + ' ' + (r.nom||'')).trim() || 'Candidat';
            var med = i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1);
            return '<div class="classement-item"><span class="rang">'+med+'</span><div class="cl-nom">'+nom+'</div><span class="cl-score">'+Math.min(r.score||0,50)+'/50</span></div>';
        }).join('');
    });

    db.ref('resultatsBAC').on('value', function(snap) {
        var results = [];
        snap.forEach(function(child) {
            var v = child.val();
            if (v && v.prenom) results.push(Object.assign({key:child.key}, v));
        });
        results.sort(function(a,b){ return b.score - a.score; });
        if (!top10BAC_El) return;
        if (results.length === 0) {
            top10BAC_El.innerHTML = '<p style="color:var(--muted);text-align:center;">Aucun résultat BAC</p>'; return;
        }
        top10BAC_El.innerHTML = results.slice(0,10).map(function(r,i) {
            var nom = ((r.prenom||'') + ' ' + (r.nom||'')).trim() || 'Candidat';
            var med = i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1);
            return '<div class="classement-item"><span class="rang">'+med+'</span><div class="cl-nom">'+nom+'</div><span class="cl-score">'+Math.min(r.score||0,50)+'/50</span></div>';
        }).join('');
    });
}

function demarrerTop10Live() {
    db.ref('top10Permanent').on('value', function(snap) {
        var results = [];
        snap.forEach(function(child) { results.push(Object.assign({key:child.key}, child.val())); });
        results.sort(function(a,b){ return b.score - a.score; });
        if (!top10PermanentEl) return;
        if (results.length === 0) {
            top10PermanentEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted)">🌟 Hall of Fame vide</div>'; return;
        }
        var html = '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:12px">Meilleurs scores tous concours</div>';
        results.forEach(function(r,i){ html += ligneClassement(r,i); });
        top10PermanentEl.innerHTML = html;
    });
}

function chargerListeCandidats() {
    db.ref('users').on('value', function(snap) {
        if (!listeCandidatsEl) return;
        var users = [];
        snap.forEach(function(child) { users.push(Object.assign({key:child.key}, child.val())); });
        users.sort(function(a,b){ return (b.xp||0) - (a.xp||0); });

        if (users.length === 0) {
            listeCandidatsEl.innerHTML = '<p style="text-align:center;color:var(--muted)">Aucun candidat</p>'; return;
        }

        var nbPayes = users.filter(function(u){ return u.accesPaye; }).length;
        listeCandidatsEl.innerHTML =
            '<div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;">'
            + '<span style="background:rgba(34,197,94,0.15);color:var(--green);padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700">✅ '+nbPayes+' payés</span>'
            + '<span style="background:rgba(239,68,68,0.15);color:var(--red);padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700">❌ '+(users.length-nbPayes)+' non payés</span>'
            + '</div>'
            + users.map(function(u) {
                var paye = u.accesPaye === true;
                return '<div class="candidat-item">'
                    + '<div style="flex:1;min-width:0">'
                    + '<div class="candidat-nom">'+(u.prenom||'?')+' '+(u.nom||'?')+'</div>'
                    + '<div class="candidat-email">'+(u.email||'?')+'</div>'
                    + '<div class="candidat-meta">Niv.'+(u.niveau||1)+' · '+(u.xp||0)+' XP · '+(u.concoursFaits||0)+' concours</div></div>'
                    + '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">'
                    + '<div style="font-size:12px;font-weight:800;color:'+(paye?'var(--green)':'var(--red)')+'">'+(paye?'✅ Payé':'❌ Non payé')+'</div>'
                    + (paye
                        ? '<button onclick="revoquerAcces(\''+u.key+'\')" style="background:rgba(239,68,68,0.15);border:1px solid var(--red);color:var(--red);padding:5px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;width:auto;min-height:auto;margin:0;font-family:Poppins,sans-serif">Révoquer</button>'
                        : '<button onclick="activerAcces(\''+u.key+'\')" style="background:var(--green);color:white;padding:5px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;width:auto;min-height:auto;margin:0;font-family:Poppins,sans-serif">Activer</button>')
                    + '</div></div>';
            }).join('');
    });
}

window.activerAcces = async function(userKey) {
    son('click');
    await db.ref('users/' + userKey).update({ accesPaye:true, datePaiement:Date.now() });
    toast('Accès activé !','success'); son('success');
};

window.revoquerAcces = async function(userKey) {
    son('click');
    modalTitreEl.textContent = 'Révoquer accès';
    modalTexteEl.innerHTML   = '<p>Révoquer l\'accès de ce candidat ?</p>';
    modalEl.style.display    = 'flex';
    btnConfirmer.onclick = async function() {
        modalEl.style.display = 'none';
        await db.ref('users/' + userKey).update({ accesPaye:false });
        toast('Accès révoqué','success');
    };
    btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
};

if (btnActiverTous) {
    btnActiverTous.onclick = async function() {
        son('click');
        modalTitreEl.textContent = 'Activer tous';
        modalTexteEl.innerHTML   = '<p>Activer l\'accès de <b>tous</b> les candidats ?</p>';
        modalEl.style.display    = 'flex';
        btnConfirmer.onclick = async function() {
            modalEl.style.display = 'none';
            var snap    = await db.ref('users').once('value');
            var updates = {};
            snap.forEach(function(child) {
                updates[child.key+'/accesPaye']    = true;
                updates[child.key+'/datePaiement'] = Date.now();
            });
            await db.ref('users').update(updates);
            toast('Tous activés !','success'); son('success');
        };
        btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
    };
}

if (btnResetTop10) {
    btnResetTop10.onclick = function() {
        son('click');
        modalTitreEl.textContent = 'Reset Hall of Fame';
        modalTexteEl.innerHTML   = '<p>Supprimer tout le Hall of Fame ?<br><b style="color:var(--red)">Irréversible</b>.</p>';
        modalEl.style.display    = 'flex';
        btnConfirmer.onclick = async function() {
            modalEl.style.display = 'none';
            await db.ref('top10Permanent').remove();
            toast('Hall of Fame réinitialisé','success'); son('success');
        };
        btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
    };
}

if (btnNouveauConcours) {
    btnNouveauConcours.onclick = function() {
        son('click');
        modalTitreEl.textContent = 'Nouveau Concours';
        modalTexteEl.innerHTML =
            '<div style="display:flex;flex-direction:column;gap:10px;">'
            + '<button id="btnNvConserve" style="padding:14px;background:var(--blue);color:white;border:none;border-radius:12px;font-family:Poppins,sans-serif;font-size:14px;font-weight:700;cursor:pointer;">✅ Conserver les paiements</button>'
            + '<button id="btnNvReinitialise" style="padding:14px;background:var(--orange);color:white;border:none;border-radius:12px;font-family:Poppins,sans-serif;font-size:14px;font-weight:700;cursor:pointer;">🔄 Réinitialiser paiements</button>'
            + '</div>';
        modalEl.style.display      = 'flex';
        btnConfirmer.style.display = 'none';
        btnAnnuler.textContent     = 'Annuler';
        btnAnnuler.onclick = function() {
            modalEl.style.display      = 'none';
            btnConfirmer.style.display = '';
            btnAnnuler.textContent     = 'Annuler';
        };

        setTimeout(function() {
            var btnC = document.getElementById('btnNvConserve');
            var btnR = document.getElementById('btnNvReinitialise');
            if (btnC) {
                btnC.onclick = async function() {
                    modalEl.style.display = 'none';
                    btnConfirmer.style.display = '';
                    btnAnnuler.textContent     = 'Annuler';
                    await db.ref('resultatsBepc').remove();
                    await db.ref('resultatsBAC').remove();
                    await db.ref('sessionsBepc').remove();
                    await db.ref('sessionsBAC').remove();
                    copieSubmise = false;
                    toast('Nouveau concours prêt ! Paiements conservés.','success'); son('success');
                };
            }
            if (btnR) {
                btnR.onclick = async function() {
                    modalEl.style.display = 'none';
                    btnConfirmer.style.display = '';
                    btnAnnuler.textContent     = 'Annuler';
                    await db.ref('resultatsBepc').remove();
                    await db.ref('resultatsBAC').remove();
                    await db.ref('sessionsBepc').remove();
                    await db.ref('sessionsBAC').remove();
                    var snap    = await db.ref('users').once('value');
                    var updates = {};
                    snap.forEach(function(child) { updates[child.key+'/accesPaye'] = false; });
                    await db.ref('users').update(updates);
                    copieSubmise = false;
                    toast('Prêt ! Paiements réinit.','success'); son('success');
                };
            }
        }, 100);
    };
}

if (btnLogoutAdmin) {
    btnLogoutAdmin.onclick = function() { son('click'); showPage(pageAccueil); toast('Déconnecté','success'); };
}

// ============================================
// FIN PARTIE 11/24 ✅
// ============================================// ============================================
// PARTIE 12/24 — CHOIX SALLE + QUOTA 20 MIN
// ============================================

if (btnExam) {
    btnExam.onclick = function() {
        son('click');
        if (modalChoixSalle)
            modalChoixSalle.style.display = 'flex';
    };
}
if (btnAnnulerChoixSalle) {
    btnAnnulerChoixSalle.onclick = function() {
        son('click');
        if (modalChoixSalle)
            modalChoixSalle.style.display = 'none';
    };
}
if (btnChoixBepc) {
    btnChoixBepc.onclick = function() {
        son('click');
        if (modalChoixSalle)
            modalChoixSalle.style.display = 'none';
        salleActive = 'bepc';
        entrerDansSalle('bepc');
    };
}
if (btnChoixBAC) {
    btnChoixBAC.onclick = function() {
        son('click');
        if (modalChoixSalle)
            modalChoixSalle.style.display = 'none';
        salleActive = 'bac';
        entrerDansSalle('bac');
    };
}
if (btnRetourSalleAttenteBepc) {
    btnRetourSalleAttenteBepc.onclick =
        function() {
        son('click');
        if (salleAttenteBepcEl)
            salleAttenteBepcEl.style.display =
                'none';
        chargerMenu(userData);
    };
}
if (btnRetourSalleAttenteBac) {
    btnRetourSalleAttenteBac.onclick =
        function() {
        son('click');
        if (salleAttenteBacEl)
            salleAttenteBacEl.style.display =
                'none';
        chargerMenu(userData);
    };
}
if (btnRetourSalleRetard) {
    btnRetourSalleRetard.onclick = function() {
        son('click');
        var el = document.getElementById(
            'salle-retard');
        if (el) el.style.display = 'none';
        chargerMenu(userData);
    };
}

function cacherToutSauf() {
    if (salleAttenteBepcEl)
        salleAttenteBepcEl.style.display = 'none';
    if (salleAttenteBacEl)
        salleAttenteBacEl.style.display  = 'none';
    var srEl = document.getElementById(
        'salle-retard');
    if (srEl) srEl.style.display = 'none';
    if (questionsEl)
        questionsEl.style.display  = 'none';
    if (attenteEl)
        attenteEl.style.display    = 'none';
    if (resultatEl)
        resultatEl.style.display   = 'none';
    var footer = document.querySelector(
        '#page-exam .footer');
    var header = document.querySelector(
        '#page-exam .header');
    var subhead = document.querySelector(
        '#page-exam .subheader');
    if (footer)  footer.style.display  = 'none';
    if (header)  header.style.display  = 'none';
    if (subhead) subhead.style.display = 'none';
}

// === VÉRIFIER QUOTA SALLE ===
async function verifierQuotaSalle(salle) {
    var salleNode = salle === 'bepc'
        ? 'salleBepc' : 'salleBAC';
    var quotaKey  = salle === 'bepc'
        ? 'maxBepc' : 'maxBAC';
    var DUREE_MS  = 20 * 60 * 1000;
    var now       = Date.now();

    try {
        var results = await Promise.all([
            db.ref(salleNode).once('value'),
            db.ref('configQuota').once('value')
        ]);

        var salleSnap = results[0];
        var quotaSnap = results[1];
        var quota     = quotaSnap.val() || {};
        var maxPlaces = quota[quotaKey] || 200;

        // Compter et nettoyer les places
        // expirées (plus de 20 min)
        var updates     = {};
        var actifs      = 0;
        var dejaPresent = false;

        salleSnap.forEach(function(child) {
            var data = child.val();
            if (!data) return;

            // C'est déjà moi ?
            if (child.key === user) {
                dejaPresent = true;
                actifs++;
                return;
            }

            // Place expirée ?
            var age = now - (data.entreeTs || 0);
            if (age > DUREE_MS) {
                // Supprimer place expirée
                updates[child.key] = null;
            } else {
                actifs++;
            }
        });

        // Appliquer les suppressions
        if (Object.keys(updates).length > 0) {
            await db.ref(salleNode)
                .update(updates);
            actifs -= Object.keys(updates).length;
            if (actifs < 0) actifs = 0;
        }

        return {
            ok:          dejaPresent
                || actifs < maxPlaces,
            actifs:      actifs,
            max:         maxPlaces,
            dejaPresent: dejaPresent
        };

    } catch(e) {
        // En cas d'erreur réseau
        // on laisse entrer
        return { ok: true, actifs: 0,
            max: 200, dejaPresent: false };
    }
}

// === ENREGISTRER DANS LA SALLE ===
async function enregistrerDansSalle(salle) {
    var salleNode = salle === 'bepc'
        ? 'salleBepc' : 'salleBAC';
    try {
        await db.ref(
            salleNode + '/' + user).set({
            entreeTs:  Date.now(),
            prenom:    userData.prenom || '',
            nom:       userData.nom    || ''
        });
        // Programmer suppression auto
        // après 20 min
        setTimeout(async function() {
            try {
                await db.ref(
                    salleNode + '/' + user)
                    .remove();
            } catch(e) {}
        }, 20 * 60 * 1000);
    } catch(e) {}
}

// === QUITTER LA SALLE ===
async function quitterSalle(salle) {
    var salleNode = salle === 'bepc'
        ? 'salleBepc' : 'salleBAC';
    try {
        await db.ref(
            salleNode + '/' + user).remove();
    } catch(e) {}
}

// === AFFICHER MESSAGE SALLE PLEINE ===
function afficherSallePleine(salle,
    actifs, max) {
    showPage(pageMenu);

    modalTitreEl.textContent =
        '⏳ Salle complète';
    modalTexteEl.innerHTML =
        '<div style="text-align:center;'
        +'padding:10px 0;">'
        +'<div style="font-size:56px;'
        +'margin-bottom:14px;">😔</div>'
        +'<p style="font-weight:800;'
        +'font-size:16px;color:var(--text);'
        +'margin-bottom:10px;">'
        +'La salle '
        +salle.toUpperCase()
        +' est complète</p>'
        +'<div style="background:'
        +'rgba(249,115,22,0.1);border:1.5px '
        +'solid rgba(249,115,22,0.3);'
        +'border-radius:14px;padding:14px;'
        +'margin-bottom:14px;">'
        +'<div style="font-size:24px;'
        +'font-weight:900;color:var(--orange);">'
        +actifs+' / '+max+'</div>'
        +'<div style="font-size:12px;'
        +'color:var(--muted);margin-top:4px;">'
        +'participants actifs</div></div>'
        +'<p style="color:var(--muted);'
        +'font-size:13px;line-height:1.8;">'
        +'Les places se libèrent après '
        +'<b>20 minutes</b>.<br>'
        +'En attendant, entraîne-toi pour<br>'
        +'être prêt au prochain concours !'
        +'</p></div>';

    modalEl.style.display      = 'flex';
    btnConfirmer.style.display = 'block';
    btnConfirmer.textContent   =
        '🎯 S\'entraîner maintenant';
    btnConfirmer.style.background =
        'linear-gradient(135deg,#1a6b3c,#22c55e)';

    btnConfirmer.onclick = function() {
        modalEl.style.display         = 'none';
        btnConfirmer.textContent      = 'Confirmer';
        btnConfirmer.style.background = '';
        btnAnnuler.textContent        = 'Annuler';
        afficherPageEntrainement();
    };

    btnAnnuler.textContent = '← Retour';
    btnAnnuler.onclick = function() {
        modalEl.style.display         = 'none';
        btnConfirmer.textContent      = 'Confirmer';
        btnConfirmer.style.background = '';
        btnAnnuler.textContent        = 'Annuler';
    };
}

async function entrerDansSalle(salle) {
    var configNode  = salle === 'bepc'
        ? 'configBepc'    : 'configBAC';
    var sujetNode   = salle === 'bepc'
        ? 'sujetBepc'     : 'sujetBAC';
    var resultNode  = salle === 'bepc'
        ? 'resultatsBepc' : 'resultatsBAC';
    var sessionNode = salle === 'bepc'
        ? 'sessionsBepc'  : 'sessionsBAC';

    // Vérifier paiement
    var userSnap = await db.ref(
        'users/' + user).once('value');
    var uFresh   = userSnap.val() || {};

    if (!uFresh.accesPaye) {
        modalTitreEl.textContent =
            'Accès au concours';
        modalTexteEl.innerHTML =
            '<div style="text-align:center;'
            +'padding:10px 0">'
            +'<div style="font-size:50px;'
            +'margin-bottom:16px">💳</div>'
            +'<p style="font-weight:800;'
            +'font-size:16px;margin-bottom:12px">'
            +'Accès payant : 100 FCFA</p>'
            +'<p style="color:var(--muted);'
            +'font-size:13px;line-height:1.7;">'
            +'Orange Money au :<br><br>'
            +'<span style="font-size:22px;'
            +'font-weight:900;'
            +'color:var(--green)">55 24 04 31'
            +'</span><br><br>'
            +'Envoie la capture WhatsApp.'
            +'</p></div>';
        modalEl.style.display      = 'flex';
        btnConfirmer.style.display = 'none';
        btnAnnuler.textContent     = 'Fermer';
        btnAnnuler.onclick = function() {
            modalEl.style.display      = 'none';
            btnConfirmer.style.display = '';
            btnAnnuler.textContent     = 'Annuler';
        };
        return;
    }

    // Vérifier config
    var configSnap = await db.ref(configNode)
        .once('value');
    configActuelle = configSnap.val();

    if (!configActuelle
        || !configActuelle.debutTimestamp
        || !configActuelle.finTimestamp) {
        modalTitreEl.textContent =
            'Salle non disponible';
        modalTexteEl.innerHTML =
            '<div style="text-align:center;'
            +'padding:16px 0;">'
            +'<div style="font-size:48px;'
            +'margin-bottom:12px;">🚫</div>'
            +'<p style="font-weight:800;'
            +'font-size:15px;margin-bottom:10px;">'
            +'Aucun concours '
            +salle.toUpperCase()
            +' configuré</p>'
            +'<p style="color:var(--muted);'
            +'font-size:13px;">'
            +'L\'admin n\'a pas encore '
            +'programmé de concours.</p></div>';
        modalEl.style.display      = 'flex';
        btnConfirmer.style.display = 'none';
        btnAnnuler.textContent     = '← Retour';
        btnAnnuler.onclick = function() {
            modalEl.style.display      = 'none';
            btnConfirmer.style.display = '';
            btnAnnuler.textContent     = 'Annuler';
            salleActive = '';
            chargerMenu(userData);
        };
        return;
    }

    var sujetSnap = await db.ref(sujetNode)
        .once('value');
    questionsData = sujetSnap.val() || [];

    if (questionsData.length === 0) {
        modalTitreEl.textContent =
            'Salle non disponible';
        modalTexteEl.innerHTML =
            '<div style="text-align:center;'
            +'padding:16px 0;">'
            +'<div style="font-size:48px;'
            +'margin-bottom:12px;">📭</div>'
            +'<p style="font-weight:800;'
            +'font-size:15px;margin-bottom:10px;">'
            +'Aucune question '
            +salle.toUpperCase()+'</p>'
            +'<p style="color:var(--muted);'
            +'font-size:13px;">'
            +'L\'admin n\'a pas encore '
            +'chargé les questions.</p></div>';
        modalEl.style.display      = 'flex';
        btnConfirmer.style.display = 'none';
        btnAnnuler.textContent     = '← Retour';
        btnAnnuler.onclick = function() {
            modalEl.style.display      = 'none';
            btnConfirmer.style.display = '';
            btnAnnuler.textContent     = 'Annuler';
            salleActive = '';
            chargerMenu(userData);
        };
        return;
    }

    var now = Date.now();
    finTimestamp = configActuelle.finTimestamp;

    var salleBadge = document.getElementById(
        'salleBadgeResultat');
    if (salleBadge) {
        salleBadge.innerHTML =
            '<span style="display:inline-block;'
            +'padding:5px 16px;'
            +'border-radius:20px;'
            +'font-size:13px;font-weight:800;'
            +(salle==='bepc'
                ?'background:rgba(59,130,246,0.1);'
                +'border:1.5px solid '
                +'rgba(59,130,246,0.3);'
                +'color:var(--blue);">📘 BEPC'
                :'background:rgba(26,107,60,0.1);'
                +'border:1.5px solid '
                +'rgba(26,107,60,0.3);'
                +'color:var(--primary);">📗 BAC')
            +'</span>';
    }

    // CAS 1 : Pas encore commencé
    if (now < configActuelle.debutTimestamp) {
        showPage(pageExam);
        cacherToutSauf();
        var salleAtEl = salle==='bepc'
            ? salleAttenteBepcEl
            : salleAttenteBacEl;
        var hEl = document.getElementById(
            salle==='bepc'
            ? 'heureDebutAffichBepc'
            : 'heureDebutAffichBac');
        var tEl = document.getElementById(
            salle==='bepc'
            ? 'timerDebutBepc'
            : 'timerDebutBac');
        if (salleAtEl)
            salleAtEl.style.display = 'block';
        if (hEl)
            hEl.textContent = new Date(
                configActuelle.debutTimestamp)
            .toLocaleTimeString('fr-FR',{
                hour:'2-digit',minute:'2-digit'
            });
        var intvAt = setInterval(function() {
            var reste =
                configActuelle.debutTimestamp
                - Date.now();
            if (reste <= 0) {
                clearInterval(intvAt);
                if (salleAtEl)
                    salleAtEl.style.display
                        = 'none';
                finTimestamp =
                    configActuelle.finTimestamp;
                // Vérifier quota au démarrage
                verifierEtLancer(
                    salle, resultNode,
                    sessionNode);
                return;
            }
            var h=Math.floor(reste/3600000);
            var m=Math.floor(
                (reste%3600000)/60000);
            var s=Math.floor(
                (reste%60000)/1000);
            if (tEl) tEl.textContent =
                pad(h)+':'+pad(m)+':'+pad(s);
        }, 1000);
        return;
    }

    // CAS 2 : Concours terminé
    if (now > configActuelle.finTimestamp) {
        // Libérer la place si elle existe
        await quitterSalle(salle);
        var resSnapFin = await db.ref(
            resultNode + '/' + user)
            .once('value');
        if (resSnapFin.exists()) {
            var resFin = resSnapFin.val();
            if (resFin.timestamp >=
                configActuelle.debutTimestamp
                && resFin.prenom) {
                showPage(pageExam);
                cacherToutSauf();
                var hdr = document.querySelector(
                    '#page-exam .header');
                if (hdr)
                    hdr.style.display = 'flex';
                reponsesFinales =
                    resFin.reponses || {};
                afficherResultat(
                    resFin.score,
                    resFin.bonnes,
                    resFin.partielles,
                    resFin.fausses,
                    resFin.xp,
                    salle, resultNode);
            } else {
                toast('Concours '
                    +salle.toUpperCase()
                    +' terminé','error');
                chargerMenu(userData);
            }
        } else {
            toast('Concours '
                +salle.toUpperCase()
                +' terminé','error');
            chargerMenu(userData);
        }
        return;
    }

    // CAS 3 : Résultat existant
    var resSnap2 = await db.ref(
        resultNode + '/' + user)
        .once('value');
    if (resSnap2.exists()) {
        var res2 = resSnap2.val();
        if (res2.timestamp >=
            configActuelle.debutTimestamp) {
            showPage(pageExam);
            cacherToutSauf();
            reponsesFinales =
                res2.reponses || {};
            if (now < finTimestamp) {
                afficherAttenteDepuisResultatExistant(
                    res2, salle, resultNode);
            } else {
                var hdr2 = document.querySelector(
                    '#page-exam .header');
                if (hdr2)
                    hdr2.style.display = 'flex';
                afficherResultat(
                    res2.score, res2.bonnes,
                    res2.partielles, res2.fausses,
                    res2.xp, salle, resultNode);
            }
            return;
        } else {
            await db.ref(
                resultNode+'/' +user).remove();
            await db.ref(
                sessionNode+'/'+user).remove();
            toast('Nouveau concours !','success');
        }
    }

    // CAS 4 : Retard > 5 min
    var tempsEcoule =
        now - configActuelle.debutTimestamp;
    if (Math.floor(tempsEcoule/60000) > 5) {
        showPage(pageExam);
        cacherToutSauf();
        var srEl2 = document.getElementById(
            'salle-retard');
        if (srEl2) {
            srEl2.style.display = 'block';
            var trEl = document.getElementById(
                'timerRetard');
            var intvRet = setInterval(
                function() {
                var reste =
                    finTimestamp - Date.now();
                if (reste <= 0) {
                    clearInterval(intvRet);
                    return;
                }
                var mr = Math.floor(
                    reste/60000);
                var sr = Math.floor(
                    (reste%60000)/1000);
                if (trEl)
                    trEl.textContent =
                        pad(mr)+':'+pad(sr);
            }, 1000);

            var btnCR = document.getElementById(
                'btnCommencerRetard');
            if (btnCR) {
                btnCR.onclick = async function() {
                    clearInterval(intvRet);
                    srEl2.style.display = 'none';
                    nbSorties   = 0;
                    copieSubmise = false;
                    enExamen    = false;
                    // Vérifier quota même en retard
                    await verifierEtLancer(
                        salle, resultNode,
                        sessionNode);
                };
            }
        }
        return;
    }

    // CAS 5 : Lancer direct avec quota
    nbSorties    = 0;
    copieSubmise = false;
    enExamen     = false;
    showPage(pageExam);
    cacherToutSauf();
    await verifierEtLancer(
        salle, resultNode, sessionNode);
}

// === VÉRIFIER QUOTA ET LANCER ===
async function verifierEtLancer(
    salle, resultNode, sessionNode) {

    // Afficher chargement
    cacherToutSauf();
    var loading = document.createElement('div');
    loading.id  = 'loadingQuota';
    loading.style.cssText =
        'text-align:center;padding:60px 20px;';
    loading.innerHTML =
        '<div class="loader"></div>'
        +'<p style="color:var(--muted);'
        +'margin-top:16px;font-weight:600;">'
        +'Vérification de la salle...</p>';
    if (pageExam) pageExam.appendChild(loading);

    var resultat =
        await verifierQuotaSalle(salle);

    // Supprimer le chargement
    var ld = document.getElementById(
        'loadingQuota');
    if (ld && ld.parentNode)
        ld.parentNode.removeChild(ld);

    if (!resultat.ok) {
        // Salle pleine
        afficherSallePleine(
            salle,
            resultat.actifs,
            resultat.max);
        return;
    }

    // Place disponible → enregistrer
    // et lancer
    await enregistrerDansSalle(salle);
    lancerExamen(salle, resultNode, sessionNode);
}

// ============================================
// FIN PARTIE 12/24 ✅
// ============================================// ============================================
// PARTIE 13/24 — LANCER EXAMEN + QUESTIONS
// CORRECTION : réponses actives + footer fixe
// ============================================

async function lancerExamen(salle, resultNode,
    sessionNode) {
    enExamen = true;
    _salleAntiTriche   = salle;
    _resultNodeGlobal  = resultNode;
    _sessionNodeGlobal = sessionNode;

    // Cacher tout sauf les éléments d'examen
    cacherToutSauf();

    // Afficher les éléments d'examen
    if (questionsEl)
        questionsEl.style.display = 'block';

    var footer  = document.querySelector(
        '#page-exam .footer');
    var header  = document.querySelector(
        '#page-exam .header');
    var subhead = document.querySelector(
        '#page-exam .subheader');
    if (footer)  footer.style.display  = 'flex';
    if (header)  header.style.display  = 'flex';
    if (subhead) subhead.style.display = 'flex';

    if (nomConcoursEl)
        nomConcoursEl.textContent =
            (salle==='bepc'
                ? '📘 BEPC — '
                : '📗 BAC — ')
            + (configActuelle.type
                || 'Concours Blanc Bonogo');

    var dureeMin = Math.round(
        (configActuelle.finTimestamp
        - configActuelle.debutTimestamp)
        / 60000);
    if (heureConcoursEl)
        heureConcoursEl.textContent =
            'Durée : ' + dureeMin + ' min';

    var sessionSnap = await db.ref(
        sessionNode + '/' + user)
        .once('value');
    var session = sessionSnap.val();

    if (session
        && session.finTimestamp === finTimestamp
        && !session.termine) {
        reponsesUser = session.reponses || {};
        nbSorties    = session.nbSorties || 0;
        var repConv  = {};
        Object.keys(reponsesUser)
            .forEach(function(qi) {
            var val = reponsesUser[qi];
            if (val !== null
                && val !== undefined) {
                repConv[qi] =
                    (typeof val==='object'
                    && !Array.isArray(val))
                    ? Object.values(val) : val;
            }
        });
        reponsesUser = repConv;

        if (session.bloque
            || nbSorties >= MAX_SORTIES) {
            afficherBlocageDevourAvecAttente(
                salle, resultNode, sessionNode);
            return;
        }

        if (nbSorties > 0) {
            modalTitreEl.textContent =
                'Reprise de session';
            modalTexteEl.innerHTML =
                '<div style="text-align:center;'
                +'padding:10px 0">'
                +'<div style="font-size:40px;'
                +'margin-bottom:12px">📋</div>'
                +'<p style="font-weight:700;'
                +'margin-bottom:10px">'
                +'Ton concours a été interrompu.'
                +'</p>'
                +'<div style="background:'
                +'rgba(239,68,68,0.1);border:1.5px'
                +' solid rgba(239,68,68,0.3);'
                +'border-radius:12px;padding:12px;">'
                +'<span style="color:var(--red);'
                +'font-weight:800;font-size:14px">'
                +'Sorties : ' + nbSorties
                + ' / ' + MAX_SORTIES
                +'</span></div></div>';
            modalEl.style.display      = 'flex';
            btnConfirmer.style.display = 'none';
            btnAnnuler.textContent =
                'Reprendre le concours';
            btnAnnuler.onclick = function() {
                modalEl.style.display      = 'none';
                btnConfirmer.style.display = '';
                btnAnnuler.textContent     = 'Annuler';
                continuerExamen(salle,
                    resultNode, sessionNode);
            };
        } else {
            continuerExamen(
                salle, resultNode, sessionNode);
        }
    } else {
        reponsesUser = {};
        nbSorties    = 0;
        await db.ref(
            sessionNode + '/' + user).set({
            debutTimestamp: Date.now(),
            finTimestamp:   finTimestamp,
            reponses:       {},
            nbSorties:      0,
            termine:        false,
            bloque:         false
        });
        continuerExamen(
            salle, resultNode, sessionNode);
    }
}

function continuerExamen(salle,
    resultNode, sessionNode) {
    alertesTimer = {
        30:false, 20:false,
        10:false, 5:false
    };
    afficherQuestions();
    demarrerTimer();
    demarrerAntiTriche(
        salle, resultNode, sessionNode);
    demarrerTimerSecurite(
        salle, resultNode, sessionNode);
}

function afficherQuestions() {
    if (!questionsEl) return;
    questionsEl.innerHTML = '';

    questionsData.forEach(function(q, qi) {
        var block = document.createElement('div');
        block.className = 'question-block';
        block.id = 'q-' + qi;

        var texteConv =
            convertirMath(q.texte || '');

        // === CORRECTION RÉPONSES INACTIVES ===
        // Utiliser des div cliquables
        // au lieu de label+checkbox
        var html =
            '<div class="question-numero">'
            +'QUESTION '+(qi+1)+' / '
            +questionsData.length+'</div>'
            +'<div class="question-texte">'
            +texteConv+'</div>'
            +'<div class="reponses-liste">';

        (q.reponses||[]).forEach(
            function(r, ri) {
            var repUser = reponsesUser[qi];
            var repCh   =
                repUser===undefined ? []
                : (Array.isArray(repUser)
                    ? repUser : [repUser]);
            var sel = repCh.indexOf(ri) !== -1;
            var repT = convertirMath(
                r.texte || '');
            var lettres = ['A','B','C','D'];

            // DIV cliquable au lieu de label
            html +=
                '<div class="rep-item'
                +(sel?' selected':'')
                +'" data-q="'+qi
                +'" data-r="'+ri+'">'
                +'<span class="rep-lettre">'
                +lettres[ri]+'</span>'
                +'<span class="rep-texte">'
                +repT+'</span>'
                +'</div>';
        });

        html += '</div>';
        block.innerHTML = html;

        // Brancher les clics sur les div
        block.querySelectorAll('.rep-item')
            .forEach(function(div) {
            div.addEventListener(
                'click', function() {
                son('click');
                var q2 = parseInt(
                    this.dataset.q);
                var r2 = parseInt(
                    this.dataset.r);

                var current = [];
                if (Array.isArray(
                    reponsesUser[q2]))
                    current =
                        reponsesUser[q2]
                        .slice();
                else if (
                    reponsesUser[q2]
                    !== undefined)
                    current =
                        [reponsesUser[q2]];

                var idx = current.indexOf(r2);
                if (idx === -1)
                    current.push(r2);
                else
                    current.splice(idx, 1);

                if (current.length > 0)
                    reponsesUser[q2] = current;
                else
                    delete reponsesUser[q2];

                // Mettre à jour visuellement
                var parentListe =
                    this.closest(
                        '.reponses-liste');
                if (parentListe) {
                    parentListe
                    .querySelectorAll(
                        '.rep-item')
                    .forEach(function(item, li) {
                        if (current.indexOf(li)
                            !== -1)
                            item.classList
                                .add('selected');
                        else
                            item.classList
                                .remove('selected');
                    });
                }

                // Mettre à jour compteur
                var rep = 0;
                for (var i = 0;
                    i < questionsData.length;
                    i++) {
                    var rv = reponsesUser[i];
                    if (rv !== undefined
                        && !(Array.isArray(rv)
                        && rv.length === 0))
                        rep++;
                }
                if (restantEl)
                    restantEl.textContent =
                        rep + '/'
                        + questionsData.length;
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
            if (timerEl)
                timerEl.textContent = '00:00';
            return;
        }
        var min = Math.floor(reste / 60000);
        var sec = Math.floor(
            (reste % 60000) / 1000);
        if (timerEl)
            timerEl.textContent =
                pad(min) + ':' + pad(sec);
        if (min <= 5 && timerEl)
            timerEl.classList.add('warning');
        [30,20,10,5].forEach(function(m) {
            if (min === m && !alertesTimer[m]) {
                alertesTimer[m] = true;
                toast('⏰ '+m+' min restantes !',
                    'warning');
                son('alerte');
            }
        });
    }, 1000);
}

async function sauvegarderSession(sessionNode) {
    if (!user || !sessionNode) return;
    try {
        await db.ref(
            sessionNode + '/' + user).update({
            reponses:  reponsesUser,
            nbSorties: nbSorties,
            lastSave:  Date.now()
        });
    } catch(e) {}
}

setInterval(async function() {
    if (enExamen && !copieSubmise && user
        && Object.keys(reponsesUser).length > 0) {
        await sauvegarderSession(
            _sessionNodeGlobal);
    }
}, 30000);

// ============================================
// FIN PARTIE 13/24 ✅
// ============================================// ============================================
// PARTIE 14/24 — ANTI-TRICHE
// ============================================

function demarrerAntiTriche(salle, resultNode, sessionNode) {
    _salleAntiTriche   = salle;
    _resultNodeGlobal  = resultNode;
    _sessionNodeGlobal = sessionNode;
    document.addEventListener('visibilitychange', gererVisibilite);
    window.addEventListener('blur',  gererBlur);
    window.addEventListener('focus', gererFocus);
}

function gererVisibilite() {
    if (!enExamen || copieSubmise) return;
    if (document.hidden) {
        derniereFocus = Date.now();
        if (sortieTimeout) clearTimeout(sortieTimeout);
        sortieTimeout = setTimeout(function() {
            if (document.hidden) compterSortie();
        }, DELAI_SORTIE_MS);
    } else {
        if (sortieTimeout) { clearTimeout(sortieTimeout); sortieTimeout = null; }
    }
}

function gererBlur() {
    if (!enExamen || copieSubmise) return;
    derniereFocus = Date.now();
    if (sortieTimeout) clearTimeout(sortieTimeout);
    sortieTimeout = setTimeout(function() {
        if (document.hidden || document.visibilityState === 'hidden') compterSortie();
    }, DELAI_SORTIE_MS);
}

function gererFocus() {
    if (!enExamen || copieSubmise) return;
    if (sortieTimeout) { clearTimeout(sortieTimeout); sortieTimeout = null; }
}

function compterSortie() {
    if (!enExamen || copieSubmise) return;
    nbSorties++;
    sauvegarderSession(_sessionNodeGlobal);
    son('sortie');
    if (nbSorties >= MAX_SORTIES) {
        afficherAvertissementSortie(true);
        setTimeout(function() {
            afficherBlocageDevourAvecAttente(_salleAntiTriche, _resultNodeGlobal, _sessionNodeGlobal);
        }, 3000);
    } else {
        afficherAvertissementSortie(false);
    }
}

function afficherAvertissementSortie(bloque) {
    modalTitreEl.textContent = bloque ? '🚨 Accès bloqué !' : '⚠️ Sortie détectée !';
    modalTexteEl.innerHTML =
        '<div style="text-align:center;padding:10px 0;">'
        + '<div style="font-size:40px;margin-bottom:12px;">' + (bloque?'🚫':'⚠️') + '</div>'
        + '<div style="background:rgba(239,68,68,0.1);border:1.5px solid rgba(239,68,68,0.3);border-radius:12px;padding:14px;margin-bottom:14px;">'
        + '<span style="color:var(--red);font-weight:800;font-size:16px;">Sorties : ' + nbSorties + ' / ' + MAX_SORTIES + '</span></div>'
        + (bloque
            ? '<p style="color:var(--red);font-weight:700;font-size:14px;">Ta copie va être soumise automatiquement.</p>'
            : '<p style="color:var(--muted);font-size:13px;line-height:1.7;"><b style="color:var(--orange)">Note :</b> Éteindre l\'écran moins de 40 secondes ne compte pas comme sortie.<br>Encore <b style="color:var(--red)">' + (MAX_SORTIES-nbSorties) + ' sortie(s)</b> autorisée(s).</p>')
        + '</div>';
    modalEl.style.display      = 'flex';
    btnConfirmer.style.display = 'none';
    btnAnnuler.textContent     = bloque ? 'Fermer' : 'Compris !';
    btnAnnuler.onclick = function() {
        modalEl.style.display      = 'none';
        btnConfirmer.style.display = '';
        btnAnnuler.textContent     = 'Annuler';
    };
}

async function afficherBlocageDevourAvecAttente(salle, resultNode, sessionNode) {
    enExamen = false; copieSubmise = true; devourBloque = true;
    await db.ref(sessionNode + '/' + user).update({ bloque:true, nbSorties:nbSorties, termine:true });
    await soumettreBloque(salle, resultNode, sessionNode);
}

async function soumettreBloque(salle, resultNode, sessionNode) {
    var resultat = calculerScore(reponsesUser);
    var xpG      = calcXp(resultat.score, 50);
    try {
        var xpActuel  = userData.xp || 0;
        var newXp     = xpActuel + xpG;
        var newNiv    = Math.floor(newXp / 100) + 1;
        var newNbConc = (userData.concoursFaits || 0) + 1;
        var entreeHisto = {
            salle: salle.toUpperCase(),
            type:  configActuelle.type || ('Concours Blanc ' + salle.toUpperCase()),
            score: resultat.score, bonnes: resultat.bonnes,
            partielles: resultat.partielles, fausses: resultat.fausses,
            xp: xpG, nbSorties: nbSorties, timestamp: Date.now(), bloque: true
        };
        await db.ref(resultNode + '/' + user).set(Object.assign({}, entreeHisto, {
            prenom: userData.prenom||'', nom: userData.nom||'', reponses: reponsesFinales
        }));
        var histoActuel = userData.historique || [];
        if (!Array.isArray(histoActuel)) histoActuel = [];
        var dejaPresent = histoActuel.some(function(h) {
            return h && h.timestamp === entreeHisto.timestamp;
        });
        if (!dejaPresent) {
            histoActuel.unshift(entreeHisto);
            if (histoActuel.length > 50) histoActuel = histoActuel.slice(0, 50);
        }
        await db.ref('users/' + user).update({ xp:newXp, niveau:newNiv, concoursFaits:newNbConc, historique:histoActuel });
        userData.xp = newXp; userData.niveau = newNiv;
        userData.concoursFaits = newNbConc; userData.historique = histoActuel;
    } catch(e) {}
    afficherAttente(resultat.score, resultat.bonnes, resultat.partielles, resultat.fausses, xpG, salle, resultNode);
}

function demarrerTimerSecurite(salle, resultNode, sessionNode) {
    var intvSec = setInterval(async function() {
        if (!enExamen || copieSubmise) { clearInterval(intvSec); return; }
        var reste = finTimestamp - Date.now();
        if (reste <= 0) {
            clearInterval(intvSec);
            if (!copieSubmise) await soumettreEtAttendre(salle, resultNode, sessionNode);
        }
    }, 5000);
}

// ============================================
// FIN PARTIE 14/24 ✅
// ============================================// ============================================
// PARTIE 15/24 — CALCULER SCORE + SOUMETTRE
// ============================================

function getBonnesIdx(q) {
    if (!q || !q.reponses) return [];
    return q.reponses.map(function(r, ri) {
        return r && r.correct ? ri : -1;
    }).filter(function(x) { return x !== -1; });
}

function calculerScore(reponses) {
    var bonnes = 0, partielles = 0, fausses = 0, scoreReel = 0;
    questionsData.forEach(function(q, qi) {
        var repUser = reponses[qi];
        if (repUser===undefined || repUser===null || (Array.isArray(repUser) && repUser.length===0)) {
            fausses++;
            reponsesFinales[qi] = { statut:'vide', user:[], bonnes:getBonnesIdx(q) };
            return;
        }
        var userChoix  = Array.isArray(repUser) ? repUser : [repUser];
        var bonnesIdx  = getBonnesIdx(q);
        if (bonnesIdx.length === 0) {
            fausses++;
            reponsesFinales[qi] = { statut:'vide', user:userChoix, bonnes:[] };
            return;
        }
        var bonnesChoisies    = userChoix.filter(function(r){ return bonnesIdx.indexOf(r) !== -1; });
        var mauvaisesChoisies = userChoix.filter(function(r){ return bonnesIdx.indexOf(r) === -1; });
        var statut;
        if (mauvaisesChoisies.length > 0) {
            statut = 'fausse'; fausses++;
        } else if (bonnesChoisies.length === bonnesIdx.length) {
            statut = 'bonne'; bonnes++; scoreReel += 1;
        } else if (bonnesChoisies.length > 0) {
            statut = 'partielle'; partielles++; scoreReel += 0.5;
        } else {
            statut = 'vide'; fausses++;
        }
        reponsesFinales[qi] = { statut:statut, user:userChoix, bonnes:bonnesIdx };
    });
    return { score:Math.round(scoreReel), scoreReel:scoreReel, bonnes:bonnes, partielles:partielles, fausses:fausses };
}

if (btnNonRep) {
    btnNonRep.onclick = function() {
        son('click');
        var nonRep = [];
        questionsData.forEach(function(q, qi) {
            var rv = reponsesUser[qi];
            if (rv===undefined || (Array.isArray(rv) && rv.length===0)) nonRep.push(qi+1);
        });
        if (nonRep.length === 0) { toast('✅ Toutes répondues !','success'); return; }
        modalTitreEl.textContent = '📋 Questions non répondues';
        modalTexteEl.innerHTML =
            '<p style="color:var(--muted);margin-bottom:12px;font-size:13px;">' + nonRep.length + ' question(s) sans réponse :</p>'
            + '<div style="display:flex;flex-wrap:wrap;gap:8px;">'
            + nonRep.map(function(n) {
                return '<button onclick="allerQuestion('+n+')" style="padding:8px 14px;background:rgba(239,68,68,0.1);border:1.5px solid var(--red);color:var(--red);border-radius:10px;font-weight:800;font-size:14px;cursor:pointer;font-family:Poppins,sans-serif;min-height:auto;width:auto;margin:0;">Q'+n+'</button>';
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
    var el = document.getElementById('q-' + (num-1));
    if (el) el.scrollIntoView({ behavior:'smooth', block:'center' });
};

if (btnFinir) {
    btnFinir.onclick = function() {
        son('click');
        var nonRep = [];
        questionsData.forEach(function(q, qi) {
            var rv = reponsesUser[qi];
            if (rv===undefined || (Array.isArray(rv) && rv.length===0)) nonRep.push(qi+1);
        });
        var msgNR = nonRep.length > 0
            ? '<div style="background:rgba(249,115,22,0.1);border:1.5px solid rgba(249,115,22,0.3);border-radius:12px;padding:12px;margin:12px 0;"><span style="color:var(--orange);font-weight:800;">⚠️ ' + nonRep.length + ' question(s) sans réponse</span></div>'
            : '<div style="background:rgba(34,197,94,0.1);border:1.5px solid rgba(34,197,94,0.3);border-radius:12px;padding:12px;margin:12px 0;"><span style="color:var(--green);font-weight:800;">✅ Toutes répondues</span></div>';
        modalTitreEl.textContent = 'Terminer le concours ?';
        modalTexteEl.innerHTML   = '<p style="color:var(--muted);font-size:13px;margin-bottom:8px;">Remettre ta copie ?</p>' + msgNR + '<p style="color:var(--muted);font-size:12px;">Cette action est irréversible.</p>';
        modalEl.style.display    = 'flex';
        btnConfirmer.onclick = async function() {
            modalEl.style.display = 'none';
            await soumettreEtAttendre(_salleAntiTriche, _resultNodeGlobal, _sessionNodeGlobal);
        };
        btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
    };
}

async function soumettreEtAttendre(salle, resultNode, sessionNode) {
    if (copieSubmise) return;
    copieSubmise = true; enExamen = false;
    if (timerInt) clearInterval(timerInt);
    document.removeEventListener('visibilitychange', gererVisibilite);
    window.removeEventListener('blur',  gererBlur);
    window.removeEventListener('focus', gererFocus);

    var resultat = calculerScore(reponsesUser);
    var xpG      = calcXp(resultat.score, 50);

    try {
        var xpActuel  = userData.xp || 0;
        var newXp     = xpActuel + xpG;
        var newNiv    = Math.floor(newXp / 100) + 1;
        var newNbConc = (userData.concoursFaits || 0) + 1;
        var newMoy    = Math.round(((userData.moyenne||0) * (newNbConc-1) + resultat.score) / newNbConc);
        var entreeHisto = {
            salle: salle.toUpperCase(),
            type:  configActuelle.type || ('Concours Blanc ' + salle.toUpperCase()),
            score: resultat.score, bonnes: resultat.bonnes,
            partielles: resultat.partielles, fausses: resultat.fausses,
            xp: xpG, nbSorties: nbSorties, timestamp: Date.now()
        };

        await db.ref(resultNode + '/' + user).set(Object.assign({}, entreeHisto, {
            prenom: userData.prenom||'', nom: userData.nom||'', reponses: reponsesFinales
        }));
        await db.ref(sessionNode + '/' + user).update({ termine: true });

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

        await db.ref('users/' + user).update({
            xp: newXp, niveau: newNiv, concoursFaits: newNbConc,
            moyenne: newMoy, historique: histoActuel
        });
        userData.xp = newXp; userData.niveau = newNiv;
        userData.concoursFaits = newNbConc; userData.moyenne = newMoy;
        userData.historique = histoActuel;

        await verifierBadges(resultat.score, nbSorties);
        await verifierTop10(resultat.score, userData.prenom||'', userData.nom||'');

    } catch(err) {
        var pending = {
            prenom: userData.prenom||'', nom: userData.nom||'',
            score: resultat.score, bonnes: resultat.bonnes,
            partielles: resultat.partielles, fausses: resultat.fausses,
            reponses: reponsesFinales, xp: xpG, timestamp: Date.now()
        };
        localStorage.setItem('bb_pending_' + salle + '_' + user, JSON.stringify(pending));
        toast('Hors ligne — résultat sauvegardé', 'error');
    }

    afficherAttente(resultat.score, resultat.bonnes, resultat.partielles, resultat.fausses, xpG, salle, resultNode);
}

// ============================================
// FIN PARTIE 15/24 ✅
// ============================================// ============================================
// PARTIE 16/24 — RÉSULTAT + COURBE
// ============================================

async function afficherResultat(score, bonnes, partielles, fausses, xpG, salle, resultNode) {
    cacherToutSauf();
    if (resultatEl) resultatEl.style.display = 'block';

    var scoreSur50 = Math.min(score, 50);
    var pct        = getPct(scoreSur50, 50);
    var men        = getMention(scoreSur50);

    if (scoreEl)       scoreEl.textContent       = scoreSur50 + '/50';
    if (xpGagneEl)     xpGagneEl.textContent     = '+' + (xpG||0);
    if (bonnesEl)      bonnesEl.textContent       = bonnes     || 0;
    if (partiellesEl)  partiellesEl.textContent   = partielles || 0;
    if (faussesEl)     faussesEl.textContent      = fausses    || 0;

    if (mentionResultatEl) {
        mentionResultatEl.textContent = men;
        mentionResultatEl.className   = 'mention-tag ' + getMentionTagClass(scoreSur50);
    }

    var rangInfo = getTitreRang(userData.xp || 0);
    var trEl     = document.getElementById('titreRangRes');
    if (trEl) trEl.textContent = rangInfo.emoji + ' ' + rangInfo.titre;

    if (sortiesInfoEl) {
        if (nbSorties > 0) {
            sortiesInfoEl.style.display = 'block';
            sortiesInfoEl.innerHTML = '<div style="background:rgba(249,115,22,0.1);border:1.5px solid rgba(249,115,22,0.3);border-radius:12px;padding:10px;margin:8px 0;font-size:13px;color:var(--orange);">⚠️ ' + nbSorties + ' sortie(s) détectée(s)</div>';
        } else {
            sortiesInfoEl.style.display = 'none';
        }
    }

    try {
        var snapAll = await db.ref(resultNode).once('value');
        var results = [];
        snapAll.forEach(function(child) {
            var v = child.val();
            if (v && v.prenom) results.push(Object.assign({key:child.key}, v));
        });
        results.sort(function(a,b){ return b.score - a.score || (a.timestamp||0) - (b.timestamp||0); });
        var monRang = results.findIndex(function(r){ return r.key === user; }) + 1;
        if (monRangResEl) {
            var med = monRang===1?'🥇':monRang===2?'🥈':monRang===3?'🥉':'#'+monRang;
            monRangResEl.innerHTML =
                '<div style="background:rgba(26,107,60,0.1);border:1.5px solid rgba(26,107,60,0.3);border-radius:16px;padding:14px;margin:12px 0;">'
                + '<div style="font-size:28px;margin-bottom:4px;">' + med + '</div>'
                + '<div style="font-weight:800;font-size:14px;">Rang ' + monRang + ' sur ' + results.length + ' candidats</div></div>';
        }
    } catch(e) {}

    afficherCourbeEvolutionResultat();

    if (btnCorrection) { btnCorrection.onclick = function(){ son('click'); afficherCorrection(); }; }
    if (btnVoirClass)  { btnVoirClass.onclick  = function(){ son('click'); afficherClassement(); }; }
    if (btnRetourMenu) { btnRetourMenu.onclick  = function(){ son('click'); chargerMenu(userData); }; }

    var btnWA = document.getElementById('btnPartageWA');
    if (btnWA) {
        btnWA.onclick = function() {
            son('click');
            var msg = '🎓 *Concours Blanc Bonogo*\nSalle : ' + (salle==='bepc'?'📘 BEPC':'📗 BAC')
                + '\nScore : *' + scoreSur50 + '/50*\nRésultat : *' + pct + '%*\n' + men
                + '\n\n📲 *Télécharge l\'app :*\nhttps://median.co/share/qdlqmbo';
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
        var snap = await db.ref('users/' + user).once('value');
        var d    = snap.val() || {};
        var histo = d.historique || [];
        if (!Array.isArray(histo)) histo = [];

        var vus = {};
        var histoUnique = [];
        histo.forEach(function(h) {
            if (!h) return;
            var cle = (h.timestamp||0) + '_' + (h.salle||'') + '_' + (h.score||0);
            if (!vus[cle]) { vus[cle] = true; histoUnique.push(h); }
        });

        var tries = histoUnique.slice().sort(function(a,b){ return (a.timestamp||0) - (b.timestamp||0); }).slice(-10);
        if (tries.length < 2) { el.style.display = 'none'; return; }
        el.style.display = 'block';

        var scores = tries.map(function(r){ return Math.min(r.score||0, 50); });
        var W=300, H=120, pL=30, pR=20, pT=20, pB=30;
        var gW=W-pL-pR, gH=H-pT-pB, n=scores.length;

        var pts = scores.map(function(s,i) {
            return { x: n>1 ? pL+(i/(n-1))*gW : pL+gW/2, y: pT+gH-(s/50)*gH, s:s };
        });
        var poly = pts.map(function(p){ return p.x+','+p.y; }).join(' ');
        var area = pL+','+(pT+gH)+' '+poly+' '+pts[pts.length-1].x+','+(pT+gH);

        var refs = '';
        [0,25,50].forEach(function(v) {
            var yR = pT+gH-(v/50)*gH;
            refs += '<line x1="'+pL+'" y1="'+yR+'" x2="'+(W-pR)+'" y2="'+yR+'" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4"/>'
                  + '<text x="'+(pL-4)+'" y="'+(yR+4)+'" text-anchor="end" font-size="9" fill="#94a3b8">'+v+'</text>';
        });

        var diff     = scores[scores.length-1] - scores[0];
        var tendance = diff>0
            ? '<div style="color:var(--primary);font-size:12px;font-weight:700;margin-top:8px;text-align:center;">📈 +'+diff+' pts de progression</div>'
            : diff<0
            ? '<div style="color:var(--orange);font-size:12px;font-weight:700;margin-top:8px;text-align:center;">📉 '+diff+' pts</div>'
            : '<div style="color:var(--muted);font-size:12px;font-weight:700;margin-top:8px;text-align:center;">➡️ Score stable</div>';

        el.innerHTML =
            '<div style="font-weight:800;font-size:13px;margin-bottom:12px;display:flex;align-items:center;gap:6px;">📈 Évolution de tes scores <span style="font-size:11px;color:var(--muted);font-weight:600;">('+n+' derniers)</span></div>'
            + '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" style="width:100%;max-width:100%;overflow:visible;">'
            + refs
            + '<polygon points="'+area+'" fill="rgba(26,107,60,0.08)"/>'
            + '<polyline points="'+poly+'" fill="none" stroke="#1a6b3c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
            + pts.map(function(p,i) {
                var c = p.s>=40?'#22c55e':p.s>=25?'#3b82f6':p.s>=15?'#f97316':'#ef4444';
                var last = i===pts.length-1;
                return '<circle cx="'+p.x+'" cy="'+p.y+'" r="'+(last?6:4)+'" fill="'+c+'" stroke="white" stroke-width="2"/>'
                     + '<text x="'+p.x+'" y="'+(p.y-10)+'" text-anchor="middle" font-size="'+(last?11:9)+'" fill="'+c+'" font-weight="'+(last?900:700)+'">'+p.s+'</text>';
            }).join('')
            + '</svg>' + tendance;
    } catch(e) {
        var el2 = document.getElementById('courbeEvolution');
        if (el2) el2.style.display = 'none';
    }
}

function afficherCorrection() {
    if (!correctionEl) return;
    correctionEl.innerHTML = '';
    questionsData.forEach(function(q, qi) {
        var info   = reponsesFinales[qi] || {};
        var statut = info.statut || 'vide';
        var uRep   = info.user   || [];
        var bRep   = info.bonnes || [];
        if (!Array.isArray(uRep)) uRep = [uRep];
        if (!Array.isArray(bRep)) bRep = [bRep];

        var ico = statut==='bonne'?'✅':statut==='partielle'?'⚠️':statut==='fausse'?'❌':'⬜';
        var cb  = statut==='bonne'?'var(--green)':statut==='partielle'?'var(--orange)':statut==='fausse'?'var(--red)':'var(--border)';

        var block = document.createElement('div');
        block.className = 'correction-block';
        block.style.borderLeft = '4px solid ' + cb;

        var html =
            '<div class="correction-header"><span class="corr-num">Q'+(qi+1)+'</span>'
            + '<span class="corr-statut">' + ico + ' ' + (statut==='bonne'?'Bonne':statut==='partielle'?'Partielle':statut==='fausse'?'Fausse':'Non répondu') + '</span></div>'
            + '<div class="corr-texte">' + (q.texte||'') + '</div>'
            + '<div class="corr-reps">';

        (q.reponses || []).forEach(function(r, ri) {
            var estB = bRep.indexOf(ri) !== -1;
            var estC = uRep.indexOf(ri) !== -1;
            var cls  = '', pref = '';
            if (estB && estC)       { cls='rep-bonne-choisie';   pref='✅ '; }
            else if (estB && !estC) { cls='rep-bonne-manquee';   pref='✅ '; }
            else if (!estB && estC) { cls='rep-mauvaise-choisie';pref='❌ '; }
            html += '<div class="corr-rep ' + cls + '"><span class="corr-lettre">' + 'ABCD'[ri] + '</span><span>' + pref + (r.texte||'') + '</span></div>';
        });
        html += '</div>';
        if (q.explication) html += '<div class="corr-explication">💡 ' + q.explication + '</div>';
        block.innerHTML = html;
        correctionEl.appendChild(block);
    });

    var btnPDF2 = document.createElement('button');
    btnPDF2.className   = 'btn-primary';
    btnPDF2.style.marginTop = '16px';
    btnPDF2.textContent = '📄 Télécharger correction PDF';
    btnPDF2.onclick     = telechargerCorrectionPDF;
    correctionEl.appendChild(btnPDF2);
    correctionEl.scrollIntoView({ behavior:'smooth' });
}

// ============================================
// FIN PARTIE 16/24 ✅
// ============================================// ============================================
// PARTIE 17/24 — ATTENTE + PDF
// ============================================

function afficherAttente(score, bonnes, partielles, fausses, xpG, salle, resultNode) {
    cacherToutSauf();
    if (attenteEl) {
        attenteEl.innerHTML =
            '<div class="card center" style="margin-top:20px;">'
            + '<div class="loader"></div>'
            + '<h2>✅ Copie envoyée</h2>'
            + '<p style="color:var(--muted);font-size:14px;">Attends la fin de l\'heure pour voir ta note</p>'
            + '<div class="timer-big" id="timerAttente">--:--</div>'
            + '<p style="color:var(--muted);font-size:12px;margin-top:10px;">Tu peux fermer et revenir plus tard.</p>'
            + '<button id="btnRetourAttenteMenu" class="btn-outline btn-small" style="margin-top:16px;">← Retour au menu</button>'
            + '</div>';
        attenteEl.style.display = 'block';

        var btnRA = document.getElementById('btnRetourAttenteMenu');
        if (btnRA) {
            btnRA.onclick = function() {
                son('click');
                clearInterval(intvAt2);
                chargerMenu(userData);
            };
        }
    }

    var intvAt2 = setInterval(function() {
        var reste = finTimestamp - Date.now();
        var tEl   = document.getElementById('timerAttente');
        if (reste <= 0) {
            clearInterval(intvAt2);
            if (attenteEl) attenteEl.style.display = 'none';
            afficherResultat(score, bonnes, partielles, fausses, xpG, salle, resultNode);
            return;
        }
        var min = Math.floor(reste / 60000);
        var sec = Math.floor((reste % 60000) / 1000);
        if (tEl) tEl.textContent = pad(min) + ':' + pad(sec);
    }, 1000);
}

function afficherAttenteDepuisResultatExistant(res, salle, resultNode) {
    cacherToutSauf();
    if (attenteEl) {
        attenteEl.innerHTML =
            '<div class="card center" style="margin-top:20px;">'
            + '<div class="loader"></div>'
            + '<h2>✅ Copie envoyée</h2>'
            + '<p style="color:var(--muted);font-size:14px;">Attends la fin de l\'heure pour voir ta note</p>'
            + '<div class="timer-big" id="timerAttente">--:--</div>'
            + '<p style="color:var(--muted);font-size:12px;margin-top:10px;">Tu peux fermer et revenir plus tard.</p>'
            + '<button id="btnRetourAttenteMenu" class="btn-outline btn-small" style="margin-top:16px;">← Retour au menu</button>'
            + '</div>';
        attenteEl.style.display = 'block';

        var btnRA = document.getElementById('btnRetourAttenteMenu');
        if (btnRA) {
            btnRA.onclick = function() {
                son('click');
                clearInterval(intvEx);
                chargerMenu(userData);
            };
        }
    }

    var intvEx = setInterval(function() {
        var reste = finTimestamp - Date.now();
        var tEl   = document.getElementById('timerAttente');
        if (reste <= 0) {
            clearInterval(intvEx);
            if (attenteEl) attenteEl.style.display = 'none';
            reponsesFinales = res.reponses || {};
            afficherResultat(res.score, res.bonnes, res.partielles, res.fausses, res.xp, salle, resultNode);
            return;
        }
        var min = Math.floor(reste / 60000);
        var sec = Math.floor((reste % 60000) / 1000);
        if (tEl) tEl.textContent = pad(min) + ':' + pad(sec);
    }, 1000);
}

function telechargerCorrectionPDF() {
    son('click');
    var scoreFinal = scoreEl        ? scoreEl.textContent        : '?';
    var dateAuj    = formatDate(Date.now());
    var nomCand    = userDisplay    || 'Candidat';
    var typeConc   = configActuelle ? (configActuelle.type || 'Concours Blanc Bonogo') : 'Concours Blanc Bonogo';
    var nbB        = bonnesEl       ? bonnesEl.textContent       : '0';
    var nbP        = partiellesEl   ? partiellesEl.textContent   : '0';
    var nbF        = faussesEl      ? faussesEl.textContent      : '0';
    var salleLabel = salleActive === 'bepc' ? '📘 BEPC' : '📗 BAC';

    var contenu =
        '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Correction — ' + nomCand + '</title>'
        + '<style>body{font-family:Arial,sans-serif;color:#1e293b;padding:20px;font-size:13px;max-width:800px;margin:0 auto;}'
        + 'h1{color:#0a0f1e;font-size:20px;text-align:center;margin-bottom:4px;}'
        + '.info{text-align:center;margin-bottom:16px;color:#64748b;font-size:12px;border-bottom:2px solid #e2e8f0;padding-bottom:12px;}'
        + '.score-box{text-align:center;background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;padding:14px;margin-bottom:20px;}'
        + '.score-num{font-size:32px;font-weight:900;color:#eab308;}'
        + '.q-block{margin-bottom:14px;border-radius:8px;padding:12px;border-left:4px solid #94a3b8;background:#f8fafc;}'
        + '.q-block.correct{border-left-color:#22c55e;background:#f0fdf4;}'
        + '.q-block.incorrect{border-left-color:#ef4444;background:#fef2f2;}'
        + '.q-block.partiel{border-left-color:#f97316;background:#fff7ed;}'
        + '.rep{font-size:12px;padding:4px 7px;border-radius:5px;margin-bottom:3px;}'
        + '.rep.bon{background:#dcfce7;color:#166534;font-weight:700;}'
        + '.rep.faux{background:#fee2e2;color:#991b1b;font-weight:700;}'
        + '.explication{margin-top:8px;padding:9px 11px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:7px;font-size:11px;color:#1e40af;line-height:1.6;}'
        + '.print-btn{display:block;width:100%;padding:14px;background:#22c55e;color:white;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:20px;}'
        + '@media print{.print-btn{display:none !important;}}'
        + '</style></head><body>'
        + '<button class="print-btn" onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>'
        + '<h1>Concours Blanc Bonogo</h1>'
        + '<div class="info">Candidat : <b>' + nomCand + '</b> | Salle : <b>' + salleLabel + '</b> | Date : <b>' + dateAuj + '</b></div>'
        + '<div class="score-box"><div class="score-num">' + scoreFinal + '</div>'
        + '<div style="display:flex;justify-content:center;gap:16px;margin-top:8px;font-size:12px;">'
        + '<span style="color:#22c55e">✅ ' + nbB + ' bonne(s)</span>'
        + '<span style="color:#f97316">⚠️ ' + nbP + ' partielle(s)</span>'
        + '<span style="color:#ef4444">❌ ' + nbF + ' fausse(s)</span></div></div>'
        + '<div style="font-weight:800;font-size:14px;margin-bottom:12px;">Correction détaillée</div>';

    questionsData.forEach(function(q, qi) {
        var info   = reponsesFinales[qi] || {};
        var statut = info.statut || 'vide';
        var uRep   = info.user   || [];
        var bRep   = info.bonnes || [];
        if (!Array.isArray(uRep)) uRep = [uRep];
        if (!Array.isArray(bRep)) bRep = [bRep];
        var cls = statut==='bonne'?'correct':statut==='partielle'?'partiel':statut==='fausse'?'incorrect':'';
        var ico2 = statut==='bonne'?'✅ Bonne':statut==='partielle'?'⚠️ Partielle':statut==='fausse'?'❌ Fausse':'⬜ Non répondu';
        contenu += '<div class="q-block ' + cls + '">'
            + '<div style="font-size:10px;font-weight:800;color:#64748b;margin-bottom:5px;">Q'+(qi+1)+' — '+ico2+'</div>'
            + '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:8px;line-height:1.5;">'+(q.texte||'')+'</div>';
        (q.reponses || []).forEach(function(r, ri) {
            var eB = bRep.indexOf(ri) !== -1;
            var eC = uRep.indexOf(ri) !== -1;
            var rc = '', pr = '';
            if (eB && eC)       { rc='bon';  pr='✅ '; }
            else if (eB && !eC) { rc='';     pr='✅ '; }
            else if (!eB && eC) { rc='faux'; pr='❌ '; }
            contenu += '<div class="rep ' + rc + '">' + 'ABCD'[ri] + '. ' + pr + (r.texte||'') + '</div>';
        });
        if (q.explication) contenu += '<div class="explication"><b>💡 Explication :</b> ' + q.explication + '</div>';
        contenu += '</div>';
    });

    contenu += '<div style="text-align:center;margin-top:24px;font-size:10px;color:#94a3b8;">Concours Blanc Bonogo | Généré le ' + dateAuj + ' | Contact : 55 24 04 31</div></body></html>';

    var nomFich = 'Correction_Bonogo_' + salleActive.toUpperCase() + '_' + nomCand.replace(/\s+/g,'_') + '_' + Date.now() + '.html';

    try {
        var blob   = new Blob([contenu], { type:'text/html;charset=utf-8' });
        var reader = new FileReader();
        reader.onload = function(e) {
            var a = document.createElement('a');
            a.href = e.target.result; a.download = nomFich;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            setTimeout(function(){ document.body.removeChild(a); }, 1000);
        };
        reader.readAsDataURL(blob);
        toast('Téléchargement en cours...', 'success'); son('success');
    } catch(e) {
        try {
            var fen = window.open('', '_blank');
            if (fen) { fen.document.write(contenu); fen.document.close(); setTimeout(function(){ fen.print(); }, 800); }
        } catch(e2) { toast('Erreur : ' + e2.message, 'error'); }
    }
}

// ============================================
// FIN PARTIE 17/24 ✅
// ============================================// ============================================
// PARTIE 18/24 — NOTIFICATIONS PUSH + OFFLINE
// ============================================

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(function(reg) { swRegistration = reg; })
        .catch(function(e) {});
}

function demanderPermissionNotif() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') return;
    if (Notification.permission === 'denied')  return;
    setTimeout(function() {
        Notification.requestPermission().then(function(perm) {
            if (perm === 'granted') toast('Notifications activées !', 'success');
        }).catch(function() {});
    }, 2000);
}

function envoyerNotif(titre, message) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    try {
        if (swRegistration) {
            swRegistration.showNotification(titre, {
                body: message, icon: './icon-192.png',
                badge: './icon-192.png', vibrate: [200,100,200],
                tag: 'bonogo-' + Date.now()
            });
        } else {
            new Notification(titre, { body:message, icon:'./icon-192.png' });
        }
    } catch(e) {}
}

function notifResultatDisponible(score, total) {
    var pct = Math.round((score / total) * 100);
    envoyerNotif('Ton résultat est disponible !', 'Score : ' + score + '/' + total + ' (' + pct + '%)');
}

function notifBadge(emoji, nomBadge) {
    envoyerNotif(emoji + ' Badge débloqué !', 'Félicitations ! Tu as obtenu : ' + nomBadge);
}

function planifierNotifs30min(config, label) {
    if (!config || !config.debutTimestamp) return;
    var maintenant = Date.now();
    var debutTs    = config.debutTimestamp;
    var reste30min = debutTs - 30*60*1000 - maintenant;
    var resteDebut = debutTs - maintenant;

    if (reste30min > 0) {
        setTimeout(function() {
            envoyerNotif('⏰ Concours dans 30 minutes !', label + ' commence dans 30 min. Prépare-toi !');
            toast('⏰ ' + label + ' dans 30 min !', 'warning');
            son('alerte');
        }, reste30min);
    }
    if (resteDebut > 0 && resteDebut < 3600000) {
        setTimeout(function() {
            envoyerNotif('🚀 ' + label + ' commence !', 'Ouvre Bonogo et bonne chance !');
            toast('🚀 ' + label + ' a commencé !', 'success');
            son('alerte');
        }, resteDebut);
    }
}

function surveillerDebutConcours() {
    if (timeoutNotif5min)  clearTimeout(timeoutNotif5min);
    if (timeoutNotifDebut) clearTimeout(timeoutNotifDebut);
    if (timeoutNotif30min) clearTimeout(timeoutNotif30min);

    ['configBepc','configBAC'].forEach(function(node) {
        db.ref(node).once('value').then(function(snap) {
            var config = snap.val();
            if (!config || !config.debutTimestamp) return;
            var label   = config.type || (node==='configBepc' ? 'Concours BEPC' : 'Concours BAC');
            var resteMs = config.debutTimestamp - Date.now();
            if (resteMs <= 0) return;

            planifierNotifs30min(config, label);

            var avant5 = resteMs - 300000;
            if (avant5 > 0) {
                setTimeout(function() {
                    envoyerNotif(label + ' dans 5 minutes !', 'Prépare-toi. Le concours commence bientôt.');
                    toast(label + ' dans 5 min !', 'warning');
                    son('alerte');
                }, avant5);
            }
            setTimeout(function() {
                envoyerNotif('🚀 ' + label + ' commence !', 'Ouvre Bonogo et bonne chance!');
                toast(label + ' a commencé !', 'success');
                son('alerte');
            }, resteMs);
        }).catch(function() {});
    });
}

window.addEventListener('beforeunload', function(e) {
    if (enExamen && !copieSubmise) {
        e.preventDefault();
        e.returnValue = 'Tu es en plein concours !';
        return e.returnValue;
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalEl && modalEl.style.display !== 'none') {
        modalEl.style.display      = 'none';
        btnConfirmer.style.display = '';
        btnAnnuler.textContent     = 'Annuler';
    }
});

window.addEventListener('online', async function() {
    toast('Connexion rétablie !', 'success');
    ['bepc','bac'].forEach(async function(s) {
        var key     = 'bb_pending_' + s + '_' + user;
        var pending = localStorage.getItem(key);
        if (pending) {
            try {
                var data = JSON.parse(pending);
                var node = s==='bepc' ? 'resultatsBepc' : 'resultatsBAC';
                await db.ref(node + '/' + user).set(data);
                localStorage.removeItem(key);
                toast('Résultat ' + s.toUpperCase() + ' synchronisé !', 'success');
            } catch(e) {}
        }
    });
});

async function verifierEtatAuDemarrage() {
    if (!user) return;
    ['bepc','bac'].forEach(async function(s) {
        var key     = 'bb_pending_' + s + '_' + user;
        var pending = localStorage.getItem(key);
        if (pending && navigator.onLine) {
            try {
                var data = JSON.parse(pending);
                var node = s==='bepc' ? 'resultatsBepc' : 'resultatsBAC';
                await db.ref(node + '/' + user).set(data);
                localStorage.removeItem(key);
            } catch(e) {}
        }
    });
}

// Écouter suppression résultats
['resultatsBepc','resultatsBAC'].forEach(function(node) {
    db.ref(node).on('child_removed', function(snap) {
        if (snap.key === user) {
            copieSubmise = false;
            toast('Nouveau concours disponible !', 'success');
            son('success');
        }
    });
});

// Écouter sujets temps réel
db.ref('sujetBepc').on('value', function(snap) {
    var data = snap.val();
    if (data && Array.isArray(data) && !enExamen && salleActive==='bepc') questionsData = data;
});
db.ref('sujetBAC').on('value', function(snap) {
    var data = snap.val();
    if (data && Array.isArray(data) && !enExamen && salleActive==='bac') questionsData = data;
});

// ============================================
// FIN PARTIE 18/24 ✅
// ============================================// ============================================
// PARTIE 19/24 — ENTRAÎNEMENT CONFIG + ADMIN
// ============================================

window.switchOngletEntr = function(niv) {
    ongletActif = niv;
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
};

window.genererQuestionsIA = function(matiere, label, textareaId) {
    son('click');
    modalTitreEl.textContent = '✨ Générer avec Claude';
    modalTexteEl.innerHTML =
        '<p style="margin-bottom:14px;">Combien de questions pour <b>' + label + '</b> ?</p>'
        + '<div style="display:flex;flex-direction:column;gap:10px;">'
        + [10,20,30,40].map(function(nb,i) {
            var colors = ['#3b82f6,#1d4ed8','#8b5cf6,#7c3aed','#1a6b3c,#22c55e','#f97316,#ea580c'];
            return '<button id="gen'+nb+'" style="padding:14px;background:linear-gradient(135deg,'+colors[i]+');color:white;border:none;border-radius:12px;font-family:Poppins,sans-serif;font-size:15px;font-weight:700;cursor:pointer;">'+nb+' questions</button>';
        }).join('')
        + '</div>';
    modalEl.style.display      = 'flex';
    btnConfirmer.style.display = 'none';
    btnAnnuler.textContent     = 'Annuler';
    btnAnnuler.onclick = function() {
        modalEl.style.display      = 'none';
        btnConfirmer.style.display = '';
        btnAnnuler.textContent     = 'Annuler';
    };

    setTimeout(function() {
        [10,20,30,40].forEach(function(nb) {
            var btn = document.getElementById('gen' + nb);
            if (!btn) return;
            btn.onclick = function() {
                modalEl.style.display      = 'none';
                btnConfirmer.style.display = '';
                btnAnnuler.textContent     = 'Annuler';

                var prompt = 'Génère exactement ' + nb + ' questions QCM pour les examens burkinabès (ENSOA,IDS,ENAM,ENAREF,BEPC,BAC) en matière de ' + label + '.\n'
                    + 'Format JSON strict :\n[\n  {\n    "texte":"Question",\n    "reponses":[\n'
                    + '      {"texte":"Réponse A","correct":false},\n      {"texte":"Réponse B","correct":true},\n'
                    + '      {"texte":"Réponse C","correct":false},\n      {"texte":"Réponse D","correct":false}\n    ],\n'
                    + '    "explication":"..."\n  }\n]\nIMPORTANT : Mélange les positions des bonnes réponses. Commence DIRECTEMENT par [';

                if (navigator.clipboard) navigator.clipboard.writeText(prompt).catch(function() {});

                modalTitreEl.textContent = '✨ ' + nb + ' questions — ' + label;
                modalTexteEl.innerHTML =
                    '<p style="font-size:13px;color:var(--muted);margin-bottom:14px;line-height:1.7;">'
                    + '1️⃣ Copie ce prompt<br>2️⃣ Colle dans <b>claude.ai</b> et envoie<br>3️⃣ Reviens coller le JSON</p>'
                    + '<button id="btnCopierPrompt" style="width:100%;padding:14px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:white;border:none;border-radius:12px;font-family:Poppins,sans-serif;font-size:14px;font-weight:700;cursor:pointer;">📋 Copier le prompt</button>';
                modalEl.style.display      = 'flex';
                btnConfirmer.style.display = 'none';
                btnAnnuler.textContent     = 'OK, je vais générer';
                btnAnnuler.onclick = function() {
                    modalEl.style.display      = 'none';
                    btnConfirmer.style.display = '';
                    btnAnnuler.textContent     = 'Annuler';
                    var ta   = document.getElementById(textareaId);
                    var btnC = document.getElementById('btnChargerColle_' + matiere);
                    if (ta)   { ta.style.display = 'block'; ta.placeholder = 'Colle ici les ' + nb + ' questions JSON...'; ta.focus(); }
                    if (btnC) btnC.style.display = 'block';
                };

                setTimeout(function() {
                    var btnCp = document.getElementById('btnCopierPrompt');
                    if (btnCp) {
                        btnCp.onclick = function() {
                            if (navigator.clipboard) navigator.clipboard.writeText(prompt).then(function() { toast('Prompt copié !', 'success'); });
                        };
                    }
                }, 100);
            };
        });
    }, 100);
};

window.chargerDepuisColle = function(matiere, textareaId, infoId) {
    son('click');
    var ta  = document.getElementById(textareaId);
    var iEl = document.getElementById(infoId);
    if (!ta || !ta.value.trim()) { toast('Colle le JSON d\'abord', 'error'); return; }
    var data = chargerJSONGenerique(ta.value.trim());
    if (data.length > 0) {
        sujetsEntrAdmin[matiere] = data;
        if (iEl) { iEl.textContent = '✅ ' + data.length + ' questions chargées !'; iEl.style.color = 'var(--primary)'; }
        toast(data.length + ' questions chargées !', 'success'); son('success');
    }
};

window.envoyerSujetEntr = async function(matiere, infoId) {
    var iEl = document.getElementById(infoId);
    if (!sujetsEntrAdmin[matiere] || sujetsEntrAdmin[matiere].length === 0) {
        toast('Charge les questions d\'abord !', 'error'); return;
    }
    try {
        await db.ref('sujetsEntrainement/' + matiere).set(sujetsEntrAdmin[matiere]);
        await db.ref('sujetsEntrVersion/'  + matiere).set(Date.now());
        toast('Envoyé aux élèves !', 'success'); son('success');
        if (iEl) { iEl.textContent = '🚀 Envoyé !'; iEl.style.color = 'var(--primary)'; }
    } catch(e) { toast('Erreur envoi : ' + e.message, 'error'); }
};

// ============================================
// FIN PARTIE 19/24 ✅
// ============================================// ============================================
// PARTIE 20/24 — PAGE ENTRAÎNEMENT CANDIDAT
// CORRECTION PAGE BLANCHE
// ============================================

async function afficherPageEntrainement() {
    // Cacher toutes les pages d'abord
    [pageAccueil, pageMenu, pageAdminLogin, pageExam, pageAdmin,
     pageHistorique, pageStats, pageQuizEntr, pageResultatEntr
    ].forEach(function(el) { if (el) el.style.display = 'none'; });

    // Vérifier que la page existe
    if (!pageEntrainement) {
        toast('Erreur : page entraînement introuvable', 'error');
        return;
    }

    pageEntrainement.style.display = 'block';
    window.scrollTo(0, 0);

    // Réinitialiser onglets
    ongletActif = 'bepc';
    var ob  = document.getElementById('ongletBepc');
    var ob2 = document.getElementById('ongletBac');
    var sb  = document.getElementById('sectBepc');
    var sb2 = document.getElementById('sectBac');

    if (ob)  ob.classList.add('active');
    if (ob2) ob2.classList.remove('active');
    if (sb)  sb.style.display  = 'block';
    if (sb2) sb2.style.display = 'none';

    // Rebrancher clics onglets
    if (ob) {
        ob.onclick = function() {
            son('click'); ongletActif = 'bepc';
            if (ob)  ob.classList.add('active');
            if (ob2) ob2.classList.remove('active');
            if (sb)  sb.style.display  = 'block';
            if (sb2) sb2.style.display = 'none';
        };
    }
    if (ob2) {
        ob2.onclick = function() {
            son('click'); ongletActif = 'bac';
            if (ob2) ob2.classList.add('active');
            if (ob)  ob.classList.remove('active');
            if (sb2) sb2.style.display = 'block';
            if (sb)  sb.style.display  = 'none';
        };
    }

    // Rebrancher bouton retour
    var btnRetEntr = document.getElementById('btnRetourMenuEntr');
    if (btnRetEntr) {
        btnRetEntr.onclick = function() { son('click'); chargerMenu(userData); };
    }

    // Stats globales
    try {
        var snap = await db.ref('entrainement/' + user).once('value');
        statsEntrainement = snap.val() || {};
    } catch(e) { statsEntrainement = {}; }

    var totalBon = 0, totalAll = 0;
    Object.keys(statsEntrainement).forEach(function(k) {
        var s = statsEntrainement[k];
        if (s && s.total > 0) { totalBon += s.bon||0; totalAll += s.total; }
    });
    var pctG  = totalAll > 0 ? Math.round((totalBon / totalAll) * 100) : 0;
    var sGEl  = document.getElementById('entrScoreGlobal');
    var pGEl  = document.getElementById('entrProgressGlobal');
    if (sGEl) sGEl.textContent   = pctG + '%';
    if (pGEl) pGEl.style.width   = pctG + '%';

    // Charger grilles
    try {
        var results    = await Promise.all([
            db.ref('sujetsEntrainement').once('value'),
            db.ref('sujetsEntrVersion').once('value')
        ]);
        var matDispos = results[0].val() || {};
        var versions  = results[1].val() || {};
        chargerGrilleNiveau('bepc', matDispos, versions);
        chargerGrilleNiveau('bac',  matDispos, versions);
    } catch(e) {
        var msg = '<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--red);">⚠️ Erreur. Vérifie ta connexion.</div>';
        var gb   = document.getElementById('grilleBepc');
        var gbac = document.getElementById('grilleBac');
        if (gb)   gb.innerHTML   = msg;
        if (gbac) gbac.innerHTML = msg;
    }
}

function chargerGrilleNiveau(niveau, matDispos, versions) {
    var grilleId = niveau === 'bepc' ? 'grilleBepc' : 'grilleBac';
    var grille   = document.getElementById(grilleId);
    if (!grille) return;
    grille.innerHTML = '';
    var liste  = MATIERES_ENTR[niveau];
    var aucune = true;

    liste.forEach(function(mat) {
        var qRaw = matDispos[mat.id];
        var nb   = qRaw ? (Array.isArray(qRaw) ? qRaw.length : Object.keys(qRaw).length) : 0;
        if (nb === 0) return;
        aucune = false;

        var stats     = statsEntrainement[mat.id] || { bon:0, total:0, indexActuel:0 };
        var pct       = stats.total > 0 ? Math.round((stats.bon / stats.total) * 100) : 0;
        var pctColor  = pct>=70 ? 'var(--primary)' : pct>=40 ? 'var(--orange)' : 'var(--red)';
        var vSrv      = versions[mat.id] || 0;
        var vLoc      = stats.version    || 0;
        var nouveau   = vSrv > vLoc;
        var idx       = stats.indexActuel || 0;
        var nbRounds  = Math.ceil(nb / 10);
        var roundFait = Math.floor(idx / 10);
        var termine   = idx >= nb && !nouveau;

        var badge = '';
        if (nouveau) {
            badge = '<span style="position:absolute;top:10px;right:10px;background:rgba(249,115,22,0.15);border:1px solid rgba(249,115,22,0.4);border-radius:20px;padding:3px 8px;font-size:10px;font-weight:800;color:var(--orange);">🆕 Nouveau</span>';
        } else if (termine) {
            badge = '<span style="position:absolute;top:10px;right:10px;background:rgba(26,107,60,0.1);border:1px solid rgba(26,107,60,0.3);border-radius:20px;padding:3px 8px;font-size:10px;font-weight:800;color:var(--primary);">✅ Terminé</span>';
        } else if (idx > 0) {
            badge = '<span style="position:absolute;top:10px;right:10px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:20px;padding:3px 8px;font-size:10px;font-weight:800;color:var(--blue);">▶ Round '+(roundFait+1)+'/'+nbRounds+'</span>';
        }

        var roundsHtml = '';
        if (nbRounds > 1) {
            roundsHtml = '<div style="display:flex;gap:4px;margin-top:6px;justify-content:center;">';
            for (var ri=0; ri<nbRounds; ri++) {
                var fait    = ri < roundFait;
                var enCours = ri === roundFait && !termine;
                roundsHtml += '<div style="width:20px;height:6px;border-radius:3px;background:' + (fait?'var(--primary)':enCours?'var(--orange)':'#e2e8f0') + '"></div>';
            }
            roundsHtml += '</div>';
        }

        var card = document.createElement('button');
        card.className = 'matiere-card ' + mat.css;
        card.innerHTML =
            badge
            + '<span class="matiere-emoji">' + mat.emoji + '</span>'
            + '<span class="matiere-nom">'   + mat.label + '</span>'
            + '<span class="matiere-nb">'
            + (termine
                ? '✅ ' + nbRounds + ' round(s) faits'
                : idx > 0
                ? 'Round ' + (roundFait+1) + '/' + nbRounds
                : nb + ' question' + (nb>1?'s':'') + ' · ' + nbRounds + ' round' + (nbRounds>1?'s':''))
            + '</span>'
            + roundsHtml
            + (stats.total > 0 ? '<span class="matiere-score-pct" style="color:'+pctColor+';top:auto;bottom:12px;">'+pct+'%</span>' : '')
            + '<div class="matiere-score-bar"><div class="matiere-score-fill" style="width:'+(stats.total>0?pct:0)+'%;background:'+pctColor+'"></div></div>';

        (function(matCopy, qRawCopy, vSrvCopy, termineCopy, idxCopy) {
            card.onclick = function() {
                son('click');
                var questions = Array.isArray(qRawCopy) ? qRawCopy : Object.values(qRawCopy);
                if (termineCopy) afficherModalFinMatiere(matCopy, questions, vSrvCopy);
                else lancerQuizMatiere(matCopy, questions, idxCopy, vSrvCopy);
            };
        })(mat, qRaw, vSrv, termine, idx);

        grille.appendChild(card);
    });

    if (aucune) {
        grille.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px 20px;">'
            + '<div style="font-size:40px;margin-bottom:10px;">📚</div>'
            + '<p style="font-weight:700;color:var(--text);margin-bottom:6px;">Aucun sujet disponible</p>'
            + '<p style="color:var(--muted);font-size:12px;">L\'admin doit charger les questions.</p></div>';
    }
}

function afficherModalFinMatiere(mat, questions, versionServeur) {
    var nb      = questions.length;
    var nbRounds = Math.ceil(nb / 10);
    var stats   = statsEntrainement[mat.id] || { bon:0, total:0 };
    var pct     = stats.total > 0 ? Math.round((stats.bon / stats.total) * 100) : 0;

    modalTitreEl.textContent = '✅ ' + mat.label + ' terminé !';
    modalTexteEl.innerHTML =
        '<div style="text-align:center;">'
        + '<div style="font-size:48px;margin-bottom:10px;">🎉</div>'
        + '<p style="font-weight:800;color:var(--text);font-size:16px;margin-bottom:6px;">' + nbRounds + ' round(s) complété(s) !</p>'
        + '<div style="background:rgba(26,107,60,0.1);border:1.5px solid rgba(26,107,60,0.3);border-radius:14px;padding:14px;margin:12px 0;">'
        + '<div style="font-size:26px;font-weight:900;color:var(--primary);">' + stats.bon + '/' + stats.total + '</div>'
        + '<div style="font-size:13px;color:var(--muted);margin-top:4px;">' + pct + '% de réussite globale</div></div></div>';

    modalEl.style.display      = 'flex';
    btnAnnuler.textContent     = '← Retour';
    btnConfirmer.style.display = 'block';
    btnConfirmer.textContent   = '🔄 Recommencer depuis Round 1';
    btnConfirmer.style.background = 'linear-gradient(135deg,#f97316,#ea580c)';

    btnConfirmer.onclick = async function() {
        modalEl.style.display         = 'none';
        btnConfirmer.textContent      = 'Confirmer';
        btnConfirmer.style.background = '';
        btnAnnuler.textContent        = 'Annuler';
        if (user) {
            try {
                await db.ref('entrainement/' + user + '/' + mat.id).update({
                    indexActuel: 0, bon: 0, total: 0, version: versionServeur
                });
                statsEntrainement[mat.id] = { bon:0, total:0, indexActuel:0, version:versionServeur };
            } catch(e) {}
        }
        lancerQuizMatiere(mat, questions, 0, versionServeur);
    };

    btnAnnuler.onclick = function() {
        modalEl.style.display         = 'none';
        btnConfirmer.textContent      = 'Confirmer';
        btnConfirmer.style.background = '';
        btnAnnuler.textContent        = 'Annuler';
    };
}

function lancerQuizMatiere(mat, questionsRaw, startIndex, versionServeur) {
    matiereActuelle   = mat.id;
    questionsEntr     = Array.isArray(questionsRaw) ? questionsRaw : Object.values(questionsRaw);
    indexQuestionEntr = startIndex || 0;
    scoreEntr         = 0;

    var roundActuel  = Math.floor(indexQuestionEntr / 10);
    var debutRound   = roundActuel * 10;
    var finRound     = Math.min(debutRound + 10, questionsEntr.length);
    var nbRoundsTotal = Math.ceil(questionsEntr.length / 10);

    if (user && versionServeur) {
        db.ref('entrainement/' + user + '/' + mat.id).update({ version: versionServeur }).catch(function() {});
    }

    var nomEl = document.getElementById('quizMatiereNom');
    if (nomEl) nomEl.textContent = mat.emoji + ' ' + mat.label;

    window._roundActuel     = roundActuel;
    window._debutRound      = debutRound;
    window._finRound        = finRound;
    window._nbRoundsTotal   = nbRoundsTotal;
    window._matCourante     = mat;
    window._versionCourante = versionServeur;
    window._scoreRound      = 0;

    var subHeaderEl = document.getElementById('quizRoundLabel');
    if (subHeaderEl) {
        subHeaderEl.textContent = 'Round ' + (roundActuel+1) + '/' + nbRoundsTotal + ' · Questions ' + (debutRound+1) + '-' + finRound;
    }

    // Cacher toutes les pages et afficher quiz
    [pageAccueil, pageMenu, pageAdminLogin, pageExam, pageAdmin,
     pageHistorique, pageStats, pageEntrainement, pageResultatEntr
    ].forEach(function(el) { if (el) el.style.display = 'none'; });

    var zoneRes = document.getElementById('quizRoundResult');
    if (zoneRes) zoneRes.style.display = 'none';

    var quizCard = document.getElementById('quizQuestionCard');
    var quizNav  = document.getElementById('quizNav');
    if (quizCard) quizCard.style.display = '';
    if (quizNav)  quizNav.style.display  = '';

    if (!pageQuizEntr) { toast('Erreur : page quiz introuvable', 'error'); return; }
    pageQuizEntr.style.display = 'block';
    window.scrollTo(0, 0);

    setTimeout(function() { afficherQuestionEntr(); }, 50);
}

// ============================================
// FIN PARTIE 20/24 ✅
// ============================================// ============================================
// PARTIE 21/24 — QUIZ ENTRAÎNEMENT
// ============================================

function afficherQuestionEntr() {
    var total  = questionsEntr.length;
    var idx    = indexQuestionEntr;
    var debutR = window._debutRound || 0;
    var finR   = window._finRound   || Math.min(10, total);

    if (idx >= finR)    { afficherResultatRound(); return; }
    if (idx >= total)   { terminerQuizEntr();      return; }

    var q = questionsEntr[idx];
    if (!q) { terminerQuizEntr(); return; }

    var posRound = idx - debutR;
    var nbRound  = finR - debutR;
    var pct      = Math.round((posRound / nbRound) * 100);

    var fillEl       = document.getElementById('quizProgressFill');
    var txtEl        = document.getElementById('quizProgressTxt');
    var numEl        = document.getElementById('quizQNum');
    var texteEl      = document.getElementById('quizQTexte');
    var feedbackEl   = document.getElementById('quizFeedback');
    var scoreBadgeEl = document.getElementById('quizScoreBadge');
    var subHeaderEl  = document.getElementById('quizRoundLabel');

    if (fillEl)       fillEl.style.width    = pct + '%';
    if (txtEl)        txtEl.textContent     = 'Q' + (posRound+1) + '/' + nbRound;
    if (numEl)        numEl.textContent     = 'Question ' + (posRound+1);
    if (texteEl)      texteEl.textContent   = q.texte || '';
    if (feedbackEl)   feedbackEl.style.display = 'none';
    if (scoreBadgeEl) scoreBadgeEl.textContent = (window._scoreRound||0) + ' ✅';
    if (subHeaderEl) {
        var rA = window._roundActuel   || 0;
        var rT = window._nbRoundsTotal || 1;
        subHeaderEl.textContent = 'Round ' + (rA+1) + '/' + rT + ' · Q' + (posRound+1) + '/' + nbRound;
    }

    var repEl = document.getElementById('quizReponses');
    if (!repEl) return;
    repEl.innerHTML = '';

    var reponses = q.reponses;
    if (!reponses || !Array.isArray(reponses) || reponses.length === 0) {
        repEl.innerHTML = '<div style="color:var(--red);text-align:center;padding:20px;">⚠️ Pas de réponses disponibles</div>';
        return;
    }

    reponses.forEach(function(r, ri) {
        if (!r || !r.texte || r.texte.trim() === '') return;
        var btn    = document.createElement('button');
        btn.className = 'quiz-rep-btn';
        var lettre = document.createElement('span');
        lettre.className   = 'quiz-rep-lettre';
        lettre.textContent = 'ABCD'[ri];
        var texte  = document.createElement('span');
        texte.textContent  = r.texte;
        btn.appendChild(lettre);
        btn.appendChild(texte);
        (function(ri2) {
            btn.onclick = function() {
                if (btn.disabled) return;
                validerReponseEntr(ri2, q);
            };
        })(ri);
        repEl.appendChild(btn);
    });

    var card = document.getElementById('quizQuestionCard');
    if (card) {
        card.style.animation = 'none';
        void card.offsetHeight;
        card.style.animation = 'fadeUp 0.3s ease';
    }
    window.scrollTo({ top:0, behavior:'smooth' });
}

function validerReponseEntr(riChoisi, q) {
    son('click');
    var bonnesRep = [];
    if (q.reponses && Array.isArray(q.reponses)) {
        q.reponses.forEach(function(r, ri) {
            if (r && r.correct === true) bonnesRep.push(ri);
        });
    }

    var estBonne = bonnesRep.indexOf(riChoisi) !== -1;
    var btns     = document.querySelectorAll('#quizReponses .quiz-rep-btn');
    btns.forEach(function(btn, ri) {
        btn.disabled = true;
        if (ri===riChoisi && estBonne)         btn.classList.add('correct');
        else if (ri===riChoisi && !estBonne)   btn.classList.add('incorrect');
        else if (bonnesRep.indexOf(ri) !== -1) btn.classList.add('manquee');
    });

    if (estBonne) {
        window._scoreRound = (window._scoreRound || 0) + 1;
        scoreEntr++;
        son('entr_success');
    } else {
        son('entr_error');
    }

    var feedEl   = document.getElementById('quizFeedback');
    var feedIco  = document.getElementById('quizFeedbackIco');
    var feedTxt  = document.getElementById('quizFeedbackTxt');
    var feedExpl = document.getElementById('quizExplication');
    var sbEl     = document.getElementById('quizScoreBadge');

    if (sbEl)     sbEl.textContent     = (window._scoreRound||0) + ' ✅';
    if (feedIco)  feedIco.textContent  = estBonne ? '✅' : '❌';
    if (feedTxt) {
        feedTxt.textContent = estBonne ? 'Bonne réponse !' : 'Mauvaise réponse !';
        feedTxt.style.color = estBonne ? 'var(--primary)' : 'var(--red)';
    }
    if (feedExpl) feedExpl.textContent = (q.explication && q.explication.trim()) ? q.explication : 'Consulte ton cours.';
    if (feedEl)   feedEl.style.display = 'block';

    indexQuestionEntr++;

    if (user) {
        var ancien = statsEntrainement[matiereActuelle] || { bon:0, total:0 };
        var update = {
            bon:   (ancien.bon||0)   + (estBonne?1:0),
            total: (ancien.total||0) + 1,
            indexActuel: indexQuestionEntr,
            lastDate: Date.now()
        };
        statsEntrainement[matiereActuelle] = update;
        db.ref('entrainement/' + user + '/' + matiereActuelle).update(update).catch(function(){});
    }

    setTimeout(function() {
        var fb = document.getElementById('quizFeedback');
        if (fb) fb.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }, 150);
}

var btnQuizSuivant = document.getElementById('btnQuizSuivant');
if (btnQuizSuivant) {
    btnQuizSuivant.onclick = function() {
        son('click');
        var finR = window._finRound || questionsEntr.length;
        if (indexQuestionEntr >= finR)              afficherResultatRound();
        else if (indexQuestionEntr >= questionsEntr.length) terminerQuizEntr();
        else                                        afficherQuestionEntr();
    };
}

// ============================================
// FIN PARTIE 21/24 ✅
// ============================================// ============================================
// PARTIE 22/24 — RÉSULTAT ROUND + FIN QUIZ
// ============================================

function afficherResultatRound() {
    var scoreR  = window._scoreRound  || 0;
    var debutR  = window._debutRound  || 0;
    var finR    = window._finRound    || Math.min(10, questionsEntr.length);
    var nbR     = finR - debutR;
    var rActuel = window._roundActuel || 0;
    var rTotal  = window._nbRoundsTotal || 1;
    var pct     = Math.round((scoreR / nbR) * 100);
    var estDernier = finR >= questionsEntr.length;

    var emoji   = pct>=80?'🎉':pct>=60?'👍':pct>=40?'💪':'📚';
    var mention = pct>=80?'Excellent !':pct>=60?'Bien !':pct>=40?'À améliorer':'Continue !';
    var mColor  = pct>=80?'var(--primary)':pct>=60?'#ca8a04':pct>=40?'var(--orange)':'var(--red)';

    var pageQuiz = document.getElementById('page-quiz-entr');
    if (!pageQuiz) return;

    var quizCard = document.getElementById('quizQuestionCard');
    var quizFeed = document.getElementById('quizFeedback');
    var quizNav  = document.getElementById('quizNav');
    if (quizCard) quizCard.style.display = 'none';
    if (quizFeed) quizFeed.style.display = 'none';
    if (quizNav)  quizNav.style.display  = 'none';

    var zoneRes = document.getElementById('quizRoundResult');
    if (!zoneRes) {
        zoneRes    = document.createElement('div');
        zoneRes.id = 'quizRoundResult';
        pageQuiz.appendChild(zoneRes);
    }
    zoneRes.style.display = 'block';

    var roundsBar = '';
    for (var ri=0; ri<rTotal; ri++) {
        var couleur = ri<=rActuel ? 'var(--primary)' : '#e2e8f0';
        roundsBar += '<div style="flex:1;height:8px;border-radius:4px;background:'+couleur+'"></div>';
    }

    var stG   = statsEntrainement[matiereActuelle] || { bon:0, total:0 };
    var pctG  = stG.total > 0 ? Math.round((stG.bon / stG.total) * 100) : 0;

    zoneRes.innerHTML =
        '<div style="padding:20px 16px;">'
        + '<div style="display:flex;gap:6px;margin-bottom:20px;">' + roundsBar + '</div>'
        + '<div style="text-align:center;margin-bottom:20px;">'
        + '<div style="font-size:13px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Round '+(rActuel+1)+'/'+rTotal+' terminé</div>'
        + '<div style="font-size:52px;margin-bottom:8px;">'+emoji+'</div></div>'
        + '<div style="background:linear-gradient(135deg,#1a6b3c,#22c55e);border-radius:20px;padding:24px;text-align:center;margin-bottom:16px;">'
        + '<div style="font-size:14px;color:rgba(255,255,255,0.8);font-weight:700;margin-bottom:8px;">Ton score ce round</div>'
        + '<div style="font-size:48px;font-weight:900;color:white;line-height:1;">'+scoreR+'/'+nbR+'</div>'
        + '<div style="font-size:22px;color:rgba(255,255,255,0.9);font-weight:800;margin-top:6px;">'+pct+'%</div>'
        + '<div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:20px;padding:6px 16px;margin-top:10px;font-size:14px;font-weight:800;color:white;">'+mention+'</div></div>'
        + '<div style="background:white;border-radius:16px;padding:16px;margin-bottom:16px;box-shadow:0 2px 10px rgba(0,0,0,0.06);">'
        + '<div style="font-size:13px;font-weight:700;color:var(--muted);margin-bottom:10px;">📊 Progression globale</div>'
        + '<div style="display:flex;justify-content:space-between;margin-bottom:6px;">'
        + '<span style="font-weight:700;">Total : '+stG.bon+'/'+stG.total+'</span>'
        + '<span style="color:'+(pctG>=60?'var(--primary)':pctG>=40?'var(--orange)':'var(--red)')+';font-weight:800;">'+pctG+'%</span></div>'
        + '<div style="background:#f1f5f9;border-radius:99px;height:8px;">'
        + '<div style="background:'+(pctG>=60?'var(--primary)':pctG>=40?'var(--orange)':'var(--red)')+';border-radius:99px;height:8px;width:'+pctG+'%"></div></div></div>'
        + '<div style="display:flex;flex-direction:column;gap:12px;">'
        + (estDernier
            ? '<button id="btnVoirResultatFinal" style="padding:16px;background:linear-gradient(135deg,#1a6b3c,#22c55e);color:white;border:none;border-radius:14px;font-family:Poppins,sans-serif;font-size:16px;font-weight:800;cursor:pointer;width:100%;">🏆 Voir mon résultat final</button>'
            : '<button id="btnRoundSuivant" style="padding:16px;background:linear-gradient(135deg,#1a6b3c,#22c55e);color:white;border:none;border-radius:14px;font-family:Poppins,sans-serif;font-size:16px;font-weight:800;cursor:pointer;width:100%;">▶ Round '+(rActuel+2)+'/'+rTotal+' — Continuer !</button>')
        + '<button id="btnPauseRound" style="padding:14px;background:white;color:var(--text);border:2px solid var(--border);border-radius:14px;font-family:Poppins,sans-serif;font-size:14px;font-weight:700;cursor:pointer;width:100%;">⏸ Pause — Continuer plus tard</button>'
        + '<button id="btnMenuRound" style="padding:14px;background:transparent;color:var(--muted);border:none;font-family:Poppins,sans-serif;font-size:13px;font-weight:600;cursor:pointer;width:100%;">← Retour aux matières</button>'
        + '</div></div>';

    setTimeout(function() {
        var btnRS = document.getElementById('btnRoundSuivant');
        if (btnRS) {
            btnRS.onclick = function() {
                son('click');
                var nouveauDebut = window._finRound;
                var nouveauFin   = Math.min(nouveauDebut + 10, questionsEntr.length);
                window._roundActuel++;
                window._debutRound  = nouveauDebut;
                window._finRound    = nouveauFin;
                window._scoreRound  = 0;
                if (quizCard) quizCard.style.display = '';
                if (quizNav)  quizNav.style.display  = '';
                zoneRes.style.display = 'none';
                var subH = document.getElementById('quizRoundLabel');
                if (subH) subH.textContent = 'Round '+(window._roundActuel+1)+'/'+window._nbRoundsTotal+' · Q1/'+(nouveauFin-nouveauDebut);
                afficherQuestionEntr();
                window.scrollTo({ top:0, behavior:'smooth' });
            };
        }

        var btnVRF = document.getElementById('btnVoirResultatFinal');
        if (btnVRF) {
            btnVRF.onclick = function() {
                son('click');
                zoneRes.style.display = 'none';
                if (quizCard) quizCard.style.display = '';
                if (quizNav)  quizNav.style.display  = '';
                terminerQuizEntr();
            };
        }

        var btnPause = document.getElementById('btnPauseRound');
        if (btnPause) {
            btnPause.onclick = function() {
                son('click');
                toast('✅ Progression sauvegardée !', 'success');
                zoneRes.style.display = 'none';
                if (quizCard) quizCard.style.display = '';
                if (quizNav)  quizNav.style.display  = '';
                chargerMenu(userData);
            };
        }

        var btnMenu = document.getElementById('btnMenuRound');
        if (btnMenu) {
            btnMenu.onclick = function() {
                son('click');
                zoneRes.style.display = 'none';
                if (quizCard) quizCard.style.display = '';
                if (quizNav)  quizNav.style.display  = '';
                afficherPageEntrainement();
            };
        }
    }, 100);

    son('niveau');
    window.scrollTo({ top:0, behavior:'smooth' });
}

// ============================================
// FIN PARTIE 22/24 ✅
// ============================================// ============================================
// PARTIE 23/24 — TERMINER QUIZ + NAVIGATION
// ============================================

async function terminerQuizEntr() {
    var stats  = statsEntrainement[matiereActuelle] || { bon:0, total:0 };
    var bon    = stats.bon   || scoreEntr;
    var total  = stats.total || questionsEntr.length;
    var faux   = Math.max(0, total - bon);
    var pct    = total > 0 ? Math.round((bon / total) * 100) : 0;
    var xpGain = scoreEntr * 2;

    if (xpGain > 0 && user) {
        try {
            var xpA  = userData.xp || 0;
            var newXp = xpA + xpGain;
            var newN  = Math.floor(newXp / 100) + 1;
            await db.ref('users/' + user).update({ xp:newXp, niveau:newN });
            userData.xp     = newXp;
            userData.niveau = newN;
        } catch(e) {}
    }

    var matCfg = window._matCourante;
    if (!matCfg) {
        ['bepc','bac'].forEach(function(niv) {
            MATIERES_ENTR[niv].forEach(function(m) {
                if (m.id === matiereActuelle) matCfg = m;
            });
        });
    }
    if (!matCfg) matCfg = { label: matiereActuelle, emoji:'📝' };

    var rTotal  = window._nbRoundsTotal || 1;
    var emoji   = pct>=80?'🎉':pct>=60?'👍':pct>=40?'💪':'📚';
    var mention = pct>=80?'Excellent !':pct>=60?'Bien !':pct>=40?'À améliorer':'Continue tes efforts !';
    var mColor  = pct>=80?'var(--primary)':pct>=60?'#ca8a04':pct>=40?'var(--orange)':'var(--red)';
    var conseil = pct>=80 ? '🌟 Excellent ! Tu maîtrises ' + matCfg.label + ' !'
        : pct>=60 ? '👍 Bon niveau ! Revois les ratées.'
        : pct>=40 ? '💪 Tu progresses. Relis tes cours !'
        : '📚 Continue à t\'entraîner !';

    var eEl   = document.getElementById('entrResultatEmoji');
    var tEl2  = document.getElementById('entrResultatTitre');
    var sEl   = document.getElementById('entrScoreFinal');
    var pEl   = document.getElementById('entrPctFinal');
    var mEl   = document.getElementById('entrMention');
    var bEl   = document.getElementById('entrNbBon');
    var fEl   = document.getElementById('entrNbFaux');
    var xEl   = document.getElementById('entrXpGagne');
    var cEl   = document.getElementById('entrConseil');
    var subEl = document.getElementById('entrResultatSub');

    if (eEl)   eEl.textContent   = emoji;
    if (tEl2)  tEl2.textContent  = matCfg.label;
    if (sEl)   sEl.textContent   = bon + '/' + total;
    if (pEl)   pEl.textContent   = pct + '%';
    if (mEl)   { mEl.textContent = mention; mEl.style.background = mColor+'18'; mEl.style.color = mColor; }
    if (bEl)   bEl.textContent   = bon;
    if (fEl)   fEl.textContent   = faux;
    if (xEl)   xEl.textContent   = '+' + xpGain;
    if (cEl)   cEl.textContent   = conseil;
    if (subEl) subEl.textContent = rTotal + ' round(s) · ' + questionsEntr.length + ' questions';

    window._roundActuel = 0; window._debutRound = 0;
    window._finRound    = 0; window._nbRoundsTotal = 1; window._scoreRound = 0;

    // Cacher quiz et afficher résultat
    [pageAccueil, pageMenu, pageAdminLogin, pageExam, pageAdmin,
     pageHistorique, pageStats, pageEntrainement, pageQuizEntr
    ].forEach(function(el) { if (el) el.style.display = 'none'; });

    if (pageResultatEntr) pageResultatEntr.style.display = 'block';
    window.scrollTo(0, 0);
    son('entr_fin');
}

// === NAVIGATION ENTRAÎNEMENT ===
var btnQuitterQuiz = document.getElementById('btnQuitterQuiz');
if (btnQuitterQuiz) {
    btnQuitterQuiz.onclick = function() {
        son('click');
        modalTitreEl.textContent = 'Quitter le quiz ?';
        modalTexteEl.innerHTML   = '<p style="color:var(--muted);">Ta progression est sauvegardée.<br>Tu pourras continuer au même round plus tard.</p>';
        modalEl.style.display    = 'flex';
        btnConfirmer.onclick = function() {
            modalEl.style.display    = 'none';
            var zR = document.getElementById('quizRoundResult');
            var qC = document.getElementById('quizQuestionCard');
            var qN = document.getElementById('quizNav');
            if (zR) zR.style.display = 'none';
            if (qC) qC.style.display = '';
            if (qN) qN.style.display = '';
            afficherPageEntrainement();
        };
        btnAnnuler.onclick = function() { modalEl.style.display = 'none'; };
    };
}

var btnRecommencer = document.getElementById('btnRecommencer');
if (btnRecommencer) {
    btnRecommencer.onclick = async function() {
        son('click');
        var mat = window._matCourante;
        if (!mat) {
            ['bepc','bac'].forEach(function(niv) {
                MATIERES_ENTR[niv].forEach(function(m) {
                    if (m.id === matiereActuelle) mat = m;
                });
            });
        }
        if (!mat) return;
        if (user) {
            try {
                await db.ref('entrainement/' + user + '/' + matiereActuelle).update({ indexActuel:0, bon:0, total:0 });
                statsEntrainement[matiereActuelle] = { bon:0, total:0, indexActuel:0 };
            } catch(e) {}
        }
        try {
            var snap = await db.ref('sujetsEntrainement/' + matiereActuelle).once('value');
            var data = snap.val();
            if (data) lancerQuizMatiere(mat, data, 0, 0);
            else      toast('Questions introuvables', 'error');
        } catch(e) { toast('Erreur chargement', 'error'); }
    };
}

var btnAutreMatiere = document.getElementById('btnAutreMatiere');
if (btnAutreMatiere) {
    btnAutreMatiere.onclick = function() { son('click'); afficherPageEntrainement(); };
}

var btnRetourMenuEntrRes = document.getElementById('btnRetourMenuEntrRes');
if (btnRetourMenuEntrRes) {
    btnRetourMenuEntrRes.onclick = function() { son('click'); chargerMenu(userData); };
}

// ============================================
// FIN PARTIE 23/24 ✅
// ============================================// ============================================
// PARTIE 24/24 — ÉVÉNEMENTS FINAUX
// ============================================

// === SWITCH ONGLETS ADMIN ===
window.switchOngletAdmin = function(niv) {
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
};

// === PARTAGER APP ===
function partagerApp() {
    son('click');
    var msg = '🇧🇫 *Concours Blanc Bonogo*\nPrépare tes concours BEPC, BAC, ENSOA, IDS, ENAM, ENAREF !\n\n'
        + '📲 Télécharge l\'app :\nhttps://median.co/share/qdlqmbo\n\n'
        + '✅ Sujets type concours\n✅ Entraînement par matière\n✅ Classement en temps réel\n✅ Corrections détaillées';
    if (navigator.share) {
        navigator.share({ title:'Concours Blanc Bonogo', text:msg, url:'https://median.co/share/qdlqmbo' })
            .catch(function() { ouvrirWhatsApp(msg); });
    } else {
        ouvrirWhatsApp(msg);
    }
}

function ouvrirWhatsApp(msg) {
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}

// === SERVICE WORKER ===
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./service-worker.js')
            .then(function(reg) { console.log('SW OK:', reg.scope); })
            .catch(function(e)  { console.log('SW erreur:', e); });
    });
}

// === LOG FINAL ===
console.log('Concours Blanc Bonogo ✅ — 24 parties | Page blanche corrigée | Connexion rapide | Retour Android OK');

// ============================================
// FIN PARTIE 24/24 ✅ — SCRIPT COMPLET
// ============================================
