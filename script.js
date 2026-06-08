// ============================================
// CONCOURS BLANC BONOGO — SCRIPT COMPLET
// 2 SALLES : BEPC + BAC
// PARTIE 1/15 — FIREBASE + VARIABLES
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
                if (splash.parentNode)
                    splash.parentNode.removeChild(splash);
            }, 500);
        }
        var saved = localStorage.getItem('bb_user');
        if (saved) autoLogin(saved);
    }, 2500);
});

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
var alertesTimer    = { 30:false, 20:false, 10:false, 5:false };
var copieSubmise    = false;
var reponsesFinales = {};
var configActuelle  = null;

// === SALLE ACTIVE ===
var salleActive        = '';
var _salleAntiTriche   = '';
var _resultNodeGlobal  = '';
var _sessionNodeGlobal = '';

// === ANTI-TRICHE ===
var nbSorties        = 0;
var MAX_SORTIES      = 4;
var sortieTimeout    = null;
var derniereFocus    = Date.now();
var devourBloque     = false;
var enExamen         = false;
var dernierMouvement = Date.now();

// === JSON CUMULÉ 2 SALLES ===
var jsonCumuleBepc = '';
var jsonCumuleBAC  = '';

// === SUJETS ADMIN 2 SALLES ===
var sujetBepc = [];
var sujetBAC  = [];

// === COUNTDOWN ===
var countdownVraiConcours = null;

// === NOTIFICATIONS ===
var timeoutNotif5min  = null;
var timeoutNotifDebut = null;

// === BADGES ===
var BADGES_LIST = [
    { id:'premier',   emoji:'🎯', nom:'Premier Concours',
        desc:'Passe ton 1er concours' },
    { id:'streak7',   emoji:'🔥', nom:'Série 7 jours',
        desc:'Connecte-toi 7 jours d\'affilée' },
    { id:'niveau10',  emoji:'⭐', nom:'Niveau 10',
        desc:'Atteins le niveau 10' },
    { id:'perfect',   emoji:'💯', nom:'Sans Faute',
        desc:'Obtiens 50/50' },
    { id:'rapide',    emoji:'⚡', nom:'Éclair',
        desc:'Finis 1h avant la fin' },
    { id:'assidu',    emoji:'📅', nom:'Assidu',
        desc:'Passe 5 concours' },
    { id:'elite',     emoji:'👑', nom:'Élite',
        desc:'Moyenne supérieure à 40/50' },
    { id:'resistant', emoji:'🛡️', nom:'Résistant',
        desc:'Aucune sortie détectée' },
    { id:'top3',      emoji:'🏅', nom:'Top 3',
        desc:'Termine dans le top 3' },
    { id:'top10all',  emoji:'🌟', nom:'Légende Top 10',
        desc:'Entre au Hall of Fame permanent' }
];

// === DATES CONCOURS ===
var DATES_CONCOURS = [
    { nom:'ENSOA',   date:'2025-07-15', emoji:'🎖️' },
    { nom:'IDS',     date:'2025-08-10', emoji:'🏥' },
    { nom:'ENAM',    date:'2025-09-05', emoji:'⚖️' },
    { nom:'ENAREF',  date:'2025-10-20', emoji:'💼' },
    { nom:'DOUANES', date:'2025-11-15', emoji:'🛃' },
    { nom:'POLICE',  date:'2025-12-01', emoji:'👮' }
];

// ============================================
// FIN PARTIE 1/15 ✅
// ============================================// ============================================
// PARTIE 2/15 — RÉFÉRENCES DOM
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
var timerAttenteEl     = document.getElementById('timerAttente');
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

// === ADMIN — BEPC ===
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

// === ADMIN — BAC ===
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

// === ADMIN — GÉNÉRAL ===
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
var btnRetourSalleAttenteBepc =
    document.getElementById('btnRetourSalleAttenteBepc');
var btnRetourSalleAttenteBac  =
    document.getElementById('btnRetourSalleAttenteBac');
var btnRetourSalleRetard      =
    document.getElementById('btnRetourSalleRetard');

// ============================================
// FIN PARTIE 2/15 ✅
// ============================================// ============================================
// PARTIE 3/15 — AUDIO + UTILITAIRES
// ============================================

// === AUDIO ===
function initAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext
                || window.webkitAudioContext)();
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
                o.frequency.value = 800; g.gain.value = 0.06;
                o.start(); o.stop(audioCtx.currentTime + 0.07);
                break;
            case 'success':
                o.frequency.setValueAtTime(
                    400, audioCtx.currentTime);
                o.frequency.linearRampToValueAtTime(
                    1200, audioCtx.currentTime + 0.3);
                g.gain.value = 0.12;
                o.start(); o.stop(audioCtx.currentTime + 0.4);
                break;
            case 'error':
                o.frequency.value = 220; g.gain.value = 0.15;
                o.start(); o.stop(audioCtx.currentTime + 0.3);
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
                }); return;
            case 'sortie':
                o.frequency.setValueAtTime(
                    500, audioCtx.currentTime);
                o.frequency.linearRampToValueAtTime(
                    150, audioCtx.currentTime + 0.5);
                g.gain.value = 0.2;
                o.start(); o.stop(audioCtx.currentTime + 0.5);
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
                }); return;
            case 'top1':
                [523,784,1047,1319,1047,1319]
                    .forEach(function(f, i) {
                    var ot = audioCtx.createOscillator();
                    var gt = audioCtx.createGain();
                    ot.connect(gt);
                    gt.connect(audioCtx.destination);
                    ot.frequency.value = f;
                    gt.gain.value = 0.14;
                    ot.start(audioCtx.currentTime + i * 0.14);
                    ot.stop(
                        audioCtx.currentTime + i * 0.14 + 0.12);
                }); return;
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
                    oe.stop(
                        audioCtx.currentTime + i * 0.12 + 0.15);
                }); return;
            case 'entr_error':
                o.type = 'sine';
                o.frequency.setValueAtTime(
                    380, audioCtx.currentTime);
                o.frequency.linearRampToValueAtTime(
                    220, audioCtx.currentTime + 0.18);
                g.gain.value = 0.07;
                o.start(); o.stop(audioCtx.currentTime + 0.18);
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
                    of2.stop(
                        audioCtx.currentTime + i * 0.1 + 0.12);
                }); return;
            default:
                o.frequency.value = 500; g.gain.value = 0.06;
                o.start(); o.stop(audioCtx.currentTime + 0.1);
        }
    } catch(e) {}
}

// === SHOW PAGE ===
function showPage(p) {
    [
        pageAccueil, pageMenu, pageAdminLogin,
        pageExam, pageAdmin, pageHistorique,
        pageStats, pageEntrainement,
        pageQuizEntr, pageResultatEntr
    ].forEach(function(el) {
        if (el) el.style.display = 'none';
    });
    if (p) p.style.display = 'block';
    window.scrollTo(0, 0);
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
    try { return btoa(unescape(encodeURIComponent(str))); }
    catch(e) { return btoa(str); }
}

function niveau(xpVal) {
    return Math.floor(xpVal / 100) + 1;
}

function calcXp(sc, tot) {
    return Math.floor((sc / (tot || 50)) * 50);
}

function cleanEmail(e) {
    return e.toLowerCase()
        .replace(/\./g, '_dot_')
        .replace(/@/g, '_at_')
        .replace(/[^a-z0-9_]/g, '');
}

function formatDate(ts) {
    var d = new Date(ts);
    return d.toLocaleDateString('fr-FR', {
        day:'2-digit', month:'short', year:'numeric'
    }) + ' ' + d.toLocaleTimeString('fr-FR', {
        hour:'2-digit', minute:'2-digit'
    });
}

function initiales(p, n) {
    return ((p || '?')[0] + (n || '?')[0]).toUpperCase();
}

function getPct(sc, tot) {
    return (!tot || isNaN(sc))
        ? 0 : Math.round((sc / tot) * 100);
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

function getTitreRang(xp) {
    if (xp >= 2000) return {
        titre:'Général',    emoji:'⭐⭐⭐', couleur:'#facc15'};
    if (xp >= 1500) return {
        titre:'Colonel',    emoji:'⭐⭐',   couleur:'#f97316'};
    if (xp >= 1000) return {
        titre:'Capitaine',  emoji:'🎖️',   couleur:'#8b5cf6'};
    if (xp >=  600) return {
        titre:'Lieutenant', emoji:'🏅',    couleur:'#3b82f6'};
    if (xp >=  300) return {
        titre:'Sergent',    emoji:'💪',    couleur:'#22c55e'};
    if (xp >=  100) return {
        titre:'Caporal',    emoji:'🎯',    couleur:'#94a3b8'};
    return {
        titre:'Recrue',     emoji:'🪖',    couleur:'#64748b'};
}

function afficherBadgeAnimation(emoji, nom) {
    var div = document.createElement('div');
    div.className = 'badge-popup';
    div.innerHTML =
        '<div style="font-size:50px;margin-bottom:12px">'
        + emoji + '</div>'
        + '<div style="font-size:16px;margin-bottom:6px">'
        + 'Badge obtenu !</div>'
        + '<div style="font-size:13px;opacity:0.85">'
        + nom + '</div>';
    document.body.appendChild(div);
    son('niveau');
    setTimeout(function() {
        div.classList.add('show');
    }, 30);
    setTimeout(function() {
        div.classList.remove('show');
        setTimeout(function() {
            if (div.parentNode)
                div.parentNode.removeChild(div);
        }, 420);
    }, 2800);
}

// === CONVERSION MATH ===
function convertirMath(texte) {
    if (!texte) return '';
    var exposants = {
        '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴',
        '5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
        '+':'⁺','-':'⁻','a':'ᵃ','b':'ᵇ','c':'ᶜ',
        'n':'ⁿ','x':'ˣ','y':'ʸ','z':'ᶻ'
    };
    var indices = {
        '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄',
        '5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',
        'n':'ₙ','x':'ₓ','a':'ₐ','e':'ₑ','i':'ᵢ'
    };
    var result = texte;
    result = result.replace(/\b1\/2\b/g,'½')
        .replace(/\b1\/4\b/g,'¼')
        .replace(/\b3\/4\b/g,'¾')
        .replace(/\b1\/3\b/g,'⅓')
        .replace(/\b2\/3\b/g,'⅔');
    result = result.replace(
        /\^\(([^)]+)\)/g, function(m, inner) {
        return inner.split('').map(function(c) {
            return exposants[c] || c;
        }).join('');
    });
    result = result.replace(
        /\^(-?[a-zA-Z0-9]+)/g, function(m, exp) {
        return exp.split('').map(function(c) {
            return exposants[c] || c;
        }).join('');
    });
    result = result.replace(
        /_([a-zA-Z0-9]+)/g, function(m, idx) {
        return idx.split('').map(function(c) {
            return indices[c] || c;
        }).join('');
    });
    result = result
        .replace(/sqrt\(([^)]+)\)/g,'√($1)')
        .replace(/√\(([^)]+)\)/g,'√$1')
        .replace(/\bpi\b/gi,'π')
        .replace(/\binfini\b/gi,'∞')
        .replace(/\+-/g,'±')
        .replace(/\bdelta\b/gi,'Δ')
        .replace(/\balpha\b/gi,'α')
        .replace(/\bbeta\b/gi,'β')
        .replace(/\bgamma\b/gi,'γ')
        .replace(/\btheta\b/gi,'θ')
        .replace(/\bsigma\b/gi,'σ')
        .replace(/\bomega\b/gi,'ω')
        .replace(/\bmu\b/gi,'μ')
        .replace(/->/g,'→')
        .replace(/<-/g,'←')
        .replace(/!=/g,'≠');
    result = result.replace(
        /([A-Z][a-z]?)(\d+)/g,
        function(m, elem, num) {
        return elem + num.split('').map(function(c) {
            return indices[c] || c;
        }).join('');
    });
    return result;
}

// === CHARGER JSON GÉNÉRIQUE ===
function chargerJSONGenerique(texte) {
    function normaliserQuestion(q, i) {
        var reps;
        if (q.reponses && Array.isArray(q.reponses)) {
            reps = q.reponses.map(function(r, ri) {
                if (typeof r === 'string') {
                    return {
                        texte:   r,
                        correct: q.correct === ri
                            || q.correct === 'ABCD'[ri]
                    };
                }
                return {
                    texte:   r.texte || r.reponse
                        || r.text || r.label || '',
                    correct: r.correct || r.bonne
                        || r.isCorrect || false
                };
            });
        } else {
            reps = ['A','B','C','D'].map(function(l, ri) {
                return {
                    texte:   q[l] || '',
                    correct: q.correct === l
                        || q.correct === ri
                        || q.reponse === l
                };
            });
        }
        while (reps.length < 4)
            reps.push({ texte:'', correct:false });
        return {
            texte:       q.texte || q.question
                || q.enonce || ('Question ' + (i + 1)),
            reponses:    reps.slice(0, 4),
            explication: q.explication || q.explanation
                || q.correction || ''
        };
    }
    try {
        var tp = texte
            .replace(
                /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,
                ' ')
            .replace(/,\s*\]/g, ']')
            .replace(/,\s*\}/g, '}')
            .trim();
        if (!tp.startsWith('[')) tp = '[' + tp;
        if (!tp.endsWith(']')) {
            var last = tp.lastIndexOf('}');
            if (last !== -1)
                tp = tp.substring(0, last + 1) + ']';
            else {
                toast('JSON invalide', 'error');
                return [];
            }
        }
        var data = JSON.parse(tp);
        if (!Array.isArray(data) || data.length === 0) {
            toast('Format JSON invalide', 'error');
            return [];
        }
        return data.map(normaliserQuestion);
    } catch(e) {
        toast('Erreur JSON : ' + e.message, 'error');
        son('error');
        return [];
    }
}

// ============================================
// FIN PARTIE 3/15 ✅
// ============================================// ============================================
// PARTIE 4/15 — AUTH
// ============================================

// === NAVIGATION FORMULAIRES ===
if (btnShowInscription) {
    btnShowInscription.onclick = function() {
        son('click');
        formConnexion.style.display   = 'none';
        formInscription.style.display = 'block';
        formReset.style.display       = 'none';
    };
}
if (btnShowConnexion) {
    btnShowConnexion.onclick = function() {
        son('click');
        formInscription.style.display = 'none';
        formConnexion.style.display   = 'block';
        formReset.style.display       = 'none';
    };
}
if (btnShowReset) {
    btnShowReset.onclick = function() {
        son('click');
        formConnexion.style.display   = 'none';
        formReset.style.display       = 'block';
        formInscription.style.display = 'none';
    };
}
if (btnRetourConnexion) {
    btnRetourConnexion.onclick = function() {
        son('click');
        formReset.style.display     = 'none';
        formConnexion.style.display = 'block';
    };
}

// === INSCRIPTION ===
if (btnInscription) {
    btnInscription.onclick = async function() {
        son('click');
        var n = nomInput.value.trim();
        var p = prenomInput.value.trim();
        var e = emailInscription.value.trim().toLowerCase();
        var m = mdpInscription.value.trim();

        if (n.length < 2 || p.length < 2) {
            erreurInscription.textContent =
                '⚠️ Nom et Prénom requis (2 car. min)';
            son('error'); return;
        }
        if (!e.includes('@') || !e.includes('.')) {
            erreurInscription.textContent =
                '⚠️ Gmail invalide';
            son('error'); return;
        }
        if (m.length < 4) {
            erreurInscription.textContent =
                '⚠️ Mot de passe 4 caractères minimum';
            son('error'); return;
        }

        erreurInscription.textContent = '⏳ Création...';
        var userKey = cleanEmail(e);
        var snap = await db.ref('users/' + userKey)
            .once('value');

        if (snap.exists()) {
            erreurInscription.textContent =
                '⚠️ Ce Gmail a déjà un compte';
            son('error'); return;
        }

        await db.ref('users/' + userKey).set({
            nom:n, prenom:p, email:e, mdp:hash(m),
            xp:0, niveau:1, streak:0,
            dernierJour:Date.now(), badges:{},
            concoursFaits:0, totalScore:0,
            moyenne:0, historique:[],
            dateInscription:Date.now(),
            top10All:false, accesPaye:false
        });

        erreurInscription.textContent = '';
        toast('✅ Compte créé ! Connecte-toi', 'success');
        son('success');
        nomInput.value = ''; prenomInput.value = '';
        emailInscription.value = '';
        mdpInscription.value = '';
        formInscription.style.display = 'none';
        formConnexion.style.display   = 'block';
    };
}

// === RESET MOT DE PASSE ===
if (btnReset) {
    btnReset.onclick = async function() {
        son('click');
        var e = emailReset.value.trim().toLowerCase();
        var m = nouveauMdp.value.trim();

        if (!e.includes('@') || !e.includes('.')) {
            erreurReset.textContent = '⚠️ Gmail invalide';
            son('error'); return;
        }
        if (m.length < 4) {
            erreurReset.textContent =
                '⚠️ Mot de passe 4 caractères minimum';
            son('error'); return;
        }

        erreurReset.textContent = '⏳ Vérification...';
        var userKey = cleanEmail(e);
        var snap = await db.ref('users/' + userKey)
            .once('value');

        if (!snap.exists()) {
            erreurReset.textContent =
                "⚠️ Ce Gmail n'existe pas";
            son('error'); return;
        }

        await db.ref('users/' + userKey)
            .update({ mdp:hash(m) });
        erreurReset.textContent = '';
        toast('✅ Mot de passe changé !', 'success');
        son('success');
        emailReset.value = '';
        nouveauMdp.value = '';
        formReset.style.display     = 'none';
        formConnexion.style.display = 'block';
    };
}

// === CONNEXION ===
if (btnLogin) {
    btnLogin.onclick = async function() {
        son('click');
        var e = emailInput.value.trim().toLowerCase();
        var m = mdpInput.value.trim();

        if (!e.includes('@') || m.length < 4) {
            erreurEl.textContent =
                '⚠️ Gmail valide + mot de passe requis';
            son('error'); return;
        }

        erreurEl.textContent = '⏳ Connexion...';
        var userKey = cleanEmail(e);
        var snap = await db.ref('users/' + userKey)
            .once('value');

        if (!snap.exists() ||
            snap.val().mdp !== hash(m)) {
            erreurEl.textContent =
                '⚠️ Gmail ou mot de passe incorrect';
            son('error'); return;
        }

        var d   = snap.val();
        var now = Date.now();
        var dernier = new Date(d.dernierJour || now)
            .setHours(0,0,0,0);
        var auj = new Date(now).setHours(0,0,0,0);
        var diff = (auj - dernier) / 86400000;
        if (diff === 1)    d.streak = (d.streak || 0) + 1;
        else if (diff > 1) d.streak = 1;

        await db.ref('users/' + userKey).update({
            dernierJour:now, streak:d.streak
        });

        user        = userKey;
        userDisplay = (d.prenom||'') + ' ' + (d.nom||'');
        userData    = d;
        erreurEl.textContent = '';
        son('success');
        localStorage.setItem('bb_user', user);
        startPresence();
        chargerMenu(d);
    };
}

// === AUTO LOGIN ===
async function autoLogin(savedKey) {
    try {
        var snap = await db.ref('users/' + savedKey)
            .once('value');
        if (!snap.exists()) {
            localStorage.removeItem('bb_user');
            return;
        }
        var d       = snap.val();
        user        = savedKey;
        userDisplay = (d.prenom||'') + ' ' + (d.nom||'');
        userData    = d;
        startPresence();
        chargerMenu(d);
        setTimeout(verifierEtatAuDemarrage, 1000);
    } catch(e) {
        localStorage.removeItem('bb_user');
    }
}

// === ENTER SUR INPUTS ===
document.addEventListener('DOMContentLoaded', function() {
    if (mdpInput) {
        mdpInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && btnLogin)
                btnLogin.click();
        });
    }
    if (adminPassEl) {
        adminPassEl.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && btnLoginAdmin)
                btnLoginAdmin.click();
        });
    }
    if (formInscription)
        formInscription.style.display = 'none';
    if (formReset)
        formReset.style.display = 'none';
    if (formConnexion)
        formConnexion.style.display = 'block';
});

// ============================================
// FIN PARTIE 4/15 ✅
// ============================================// ============================================
// PARTIE 5/15 — PRÉSENCE + MENU + DÉCONNEXION
// ============================================

// === PRÉSENCE EN LIGNE ===
function startPresence() {
    if (presenceRef) presenceRef.remove();
    presenceRef = db.ref('online/' + user);
    presenceRef.set({
        nom: userDisplay,
        ts:  firebase.database.ServerValue.TIMESTAMP
    });
    presenceRef.onDisconnect().remove();
}

db.ref('online').on('value', function(snap) {
    var count = snap.numChildren();
    if (onlineCount)     onlineCount.textContent     = count;
    if (onlineCountMenu) onlineCountMenu.textContent = count;
    if (statOnlineEl)    statOnlineEl.textContent    = count;
    if (enLigneEl)       enLigneEl.textContent       = '🟢 ' + count;
});

// === COMPTE À REBOURS VRAI CONCOURS ===
function afficherComptesARebours() {
    var conteneur = document.getElementById('compteRebours');
    if (!conteneur) return;
    var maintenant = Date.now();
    var prochainConcours = null;
    var minJours = Infinity;

    DATES_CONCOURS.forEach(function(c) {
        var dateTs = new Date(
            c.date + 'T00:00:00').getTime();
        var diff = dateTs - maintenant;
        if (diff > 0) {
            var jours  = Math.floor(diff / 86400000);
            var heures = Math.floor(
                (diff % 86400000) / 3600000);
            if (jours < minJours) {
                minJours = jours;
                prochainConcours = {
                    nom:c.nom, emoji:c.emoji,
                    jours:jours, heures:heures
                };
            }
        }
    });

    var html = '';
    if (prochainConcours) {
        html = '<div class="compte-rebours-card">'
            + '<div class="cr-header">'
            + '<span class="cr-emoji">'
            + prochainConcours.emoji + '</span>'
            + '<div>'
            + '<div class="cr-titre">Prochain concours</div>'
            + '<div class="cr-nom">'
            + prochainConcours.nom + '</div>'
            + '</div></div>'
            + '<div class="cr-chiffres">'
            + '<div class="cr-bloc">'
            + '<span class="cr-val">'
            + prochainConcours.jours + '</span>'
            + '<span class="cr-lab">jours</span>'
            + '</div>'
            + '<div class="cr-sep">:</div>'
            + '<div class="cr-bloc">'
            + '<span class="cr-val">'
            + prochainConcours.heures + '</span>'
            + '<span class="cr-lab">heures</span>'
            + '</div></div>'
            + '<div class="cr-message">'
            + (prochainConcours.jours <= 7
                ? '🔥 Plus que '
                + prochainConcours.jours + ' jours !'
                : prochainConcours.jours <= 30
                ? '💪 ' + prochainConcours.jours
                + ' jours restants. Continue !'
                : '📚 ' + prochainConcours.jours
                + ' jours pour te préparer.')
            + '</div></div>';
    } else {
        html = '<div class="compte-rebours-card">'
            + '<div style="text-align:center;'
            + 'color:var(--muted);font-size:13px;">'
            + '📅 Aucun concours prévu</div></div>';
    }
    conteneur.innerHTML = html;
}

function demarrerComptesARebours() {
    afficherComptesARebours();
    if (countdownVraiConcours)
        clearInterval(countdownVraiConcours);
    countdownVraiConcours = setInterval(
        afficherComptesARebours, 60000);
}

// === CHARGER MENU ===
function chargerMenu(d) {
    var p = d.prenom || '';
    var n = d.nom    || '';

    if (nomMenuEl)    nomMenuEl.textContent    = p + ' ' + n;
    if (avatarMenuEl) avatarMenuEl.textContent = initiales(p,n);
    if (nivEl)        nivEl.textContent        = d.niveau || 1;
    if (xpEl)         xpEl.textContent         = d.xp || 0;
    if (streakEl)     streakEl.textContent      = d.streak || 0;

    var xpTotal  = d.xp || 0;
    var rangInfo = getTitreRang(xpTotal);
    var titreMenuEl =
        document.getElementById('titreMenuRang');
    if (titreMenuEl) {
        titreMenuEl.textContent =
            rangInfo.emoji + ' ' + rangInfo.titre;
        titreMenuEl.style.color = rangInfo.couleur;
    }

    showPage(pageMenu);
    demanderPermissionNotif();
    surveillerDebutConcours();
    demarrerComptesARebours();
}

// === DÉCONNEXION ===
if (btnLogout) {
    btnLogout.onclick = function() {
        son('click');
        modalTitreEl.textContent = 'Déconnexion';
        modalTexteEl.innerHTML =
            '<p>Tu veux vraiment te déconnecter ?</p>';
        modalEl.style.display = 'flex';

        btnConfirmer.onclick = function() {
            modalEl.style.display = 'none';
            if (presenceRef) presenceRef.remove();
            if (countdownVraiConcours)
                clearInterval(countdownVraiConcours);
            localStorage.removeItem('bb_user');
            user = null; userData = {};
            if (emailInput) emailInput.value = '';
            if (mdpInput)   mdpInput.value   = '';
            showPage(pageAccueil);
            toast('Déconnecté', 'success');
        };
        btnAnnuler.onclick = function() {
            modalEl.style.display = 'none';
        };
    };
}

// === NAVIGATION MENU ===
var btnEntrainement =
    document.getElementById('btnEntrainement');
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
if (btnRetourMenuHist) {
    btnRetourMenuHist.onclick = function() {
        son('click'); showPage(pageMenu);
    };
}

if (btnStats) {
    btnStats.onclick = function() {
        son('click');
        afficherStats();
        showPage(pageStats);
    };
}
if (btnRetourMenuStats) {
    btnRetourMenuStats.onclick = function() {
        son('click'); showPage(pageMenu);
    };
}

// ============================================
// FIN PARTIE 5/15 ✅
// ============================================// ============================================
// PARTIE 6/15 — HISTORIQUE + STATS + BADGES
// ============================================

async function afficherHistorique() {
    var box = document.getElementById('contenuHistorique');
    if (!box) return;
    box.innerHTML =
        '<div class="loading-box">'
        + '<div class="loader"></div>'
        + '<p>Chargement...</p></div>';

    var snap  = await db.ref('users/' + user).once('value');
    var d     = snap.val() || {};
    var histo = d.historique || [];
    if (!Array.isArray(histo))
        histo = Object.values(histo);

    if (histo.length === 0) {
        box.innerHTML =
            '<div style="text-align:center;padding:60px 20px;">'
            + '<div style="font-size:50px;margin-bottom:15px">'
            + '📋</div>'
            + '<p style="font-size:16px;font-weight:700;'
            + 'color:var(--text)">Aucun concours passé</p>'
            + '<p style="font-size:13px;margin-top:8px;'
            + 'color:var(--muted)">Lance ton premier concours !</p>'
            + '</div>';
        return;
    }

    histo = histo.slice().reverse();
    var html = '<div class="histo-resume">'
        + histo.length + ' concours passé(s)</div>';

    histo.forEach(function(h, i) {
        var scoreVal = typeof h.score === 'number'
            ? h.score : 0;
        var totalVal = typeof h.total === 'number'
            && h.total > 0 ? h.total : 50;
        var bonnesV  = typeof h.bonnes === 'number'
            ? h.bonnes : scoreVal;
        var partV    = typeof h.partielles === 'number'
            ? h.partielles : 0;
        var faussesV = typeof h.fausses === 'number'
            ? h.fausses : (totalVal - bonnesV - partV);
        var xpV      = typeof h.xp === 'number'
            ? h.xp : 0;
        var sortiesV = typeof h.sorties === 'number'
            ? h.sorties : 0;
        var typeV    = h.type || h.typeConcours
            || 'Concours Blanc Bonogo';
        var salleV   = h.salle === 'bepc' ? ' 📘 BEPC'
            : h.salle === 'bac' ? ' 📗 BAC' : '';
        var dateV    = h.date || (h.timestamp
            ? formatDate(h.timestamp) : 'Date inconnue');
        var pct      = getPct(scoreVal, totalVal);
        var mentCls  = getMentionClass(scoreVal);
        var tagCls   = getMentionTagClass(scoreVal);
        var mention  = getMention(scoreVal);

        html += '<div class="histo-card ' + mentCls
            + '" style="animation-delay:'
            + (i * 0.04) + 's">'
            + '<div class="histo-top">'
            + '<div>'
            + '<div class="histo-type-label">'
            + typeV + salleV + '</div>'
            + '<div class="histo-date-label">'
            + dateV + '</div>'
            + '</div>'
            + '<div class="histo-score-big">'
            + '<span class="score-num">'
            + scoreVal + '/' + totalVal + '</span>'
            + '<span class="score-pct">'
            + pct + '%</span>'
            + '</div></div>'
            + '<div class="histo-details-row">'
            + '<span class="histo-badge b-bon">✅ '
            + bonnesV + '</span>'
            + '<span class="histo-badge b-part">⚠️ '
            + partV + '</span>'
            + '<span class="histo-badge b-faux">❌ '
            + faussesV + '</span>'
            + '<span class="histo-badge b-xp">💰 +'
            + xpV + ' XP</span>'
            + (sortiesV > 0
                ? '<span class="histo-badge b-sortie">⚠️ '
                + sortiesV + ' sortie(s)</span>' : '')
            + '</div>'
            + '<span class="mention-tag ' + tagCls + '">'
            + mention + '</span>'
            + '</div>';
    });
    box.innerHTML = html;
}

// === STATS ===
async function afficherStats() {
    var box = document.getElementById('contenuStats');
    if (!box) return;
    box.innerHTML =
        '<div class="loading-box">'
        + '<div class="loader"></div>'
        + '<p>Chargement...</p></div>';

    var snap  = await db.ref('users/' + user).once('value');
    var d     = snap.val() || {};
    var histo = d.historique || [];
    if (!Array.isArray(histo))
        histo = Object.values(histo);

    var totalConcours = histo.length;
    var totalScore = 0, meilleur = 0, pire = 50;
    histo.forEach(function(h) {
        var s   = typeof h.score === 'number'
            ? h.score : 0;
        var tot = typeof h.total === 'number'
            && h.total > 0 ? h.total : 50;
        totalScore += s;
        if (s > meilleur) meilleur = s;
        if (s < pire)     pire     = s;
    });

    var moyenne      = totalConcours > 0
        ? (totalScore / totalConcours).toFixed(1) : 0;
    var moyPct       = getPct(parseFloat(moyenne), 50);
    var badgeCount   = Object.keys(
        d.badges || {}).length;
    var xpTotal      = d.xp     || 0;
    var niveauVal    = d.niveau || 1;
    var xpDansNiveau = xpTotal % 100;
    var streakVal    = d.streak || 0;
    var pfMoy        = moyPct >= 70 ? ''
        : moyPct >= 40 ? 'pf-yellow' : 'pf-red';
    var rangInfo     = getTitreRang(xpTotal);

    var entrData = {};
    try {
        var entrSnap = await db.ref(
            'entrainement/' + user).once('value');
        entrData = entrSnap.val() || {};
    } catch(e) {}
    var entrTotal = 0, entrBon = 0;
    Object.keys(entrData).forEach(function(k) {
        var s = entrData[k];
        if (s && s.total > 0) {
            entrTotal += s.total;
            entrBon   += s.bon;
        }
    });
    var entrPct = entrTotal > 0
        ? Math.round((entrBon / entrTotal) * 100) : 0;

    var html =
        '<div style="background:linear-gradient('
        + '135deg,#1a6b3c,#22c55e);border-radius:16px;'
        + 'padding:16px;margin-bottom:16px;'
        + 'text-align:center;">'
        + '<div style="font-size:28px;margin-bottom:4px;">'
        + rangInfo.emoji + '</div>'
        + '<div style="font-size:18px;font-weight:800;'
        + 'color:white;">' + rangInfo.titre + '</div>'
        + '<div style="font-size:12px;'
        + 'color:rgba(255,255,255,0.7);margin-top:4px;">'
        + xpTotal + ' XP au total</div>'
        + '</div>'
        + '<div class="stats-grid-2">'
        + statCard('🎯', totalConcours,
            'Concours passés')
        + statCard('⭐', niveauVal,
            'Niveau actuel')
        + statCard('💰', xpTotal,
            'XP total')
        + statCard('🏆', badgeCount,
            'Badges obtenus')
        + statCard('📈', meilleur + '/50',
            'Meilleur score')
        + statCard('📉',
            totalConcours > 0 ? pire + '/50' : '--',
            'Plus bas score')
        + '</div>'
        + progressBar(
            'Niveau ' + niveauVal + ' — XP',
            xpDansNiveau + '/100 XP',
            xpDansNiveau, '')
        + progressBar(
            'Moyenne concours',
            moyenne + '/50 (' + moyPct + '%)',
            moyPct, pfMoy)
        + progressBar(
            '🎯 Taux entraînement',
            entrBon + '/' + entrTotal
            + ' (' + entrPct + '%)',
            entrPct,
            entrPct >= 70 ? ''
            : entrPct >= 40 ? 'pf-yellow' : 'pf-red')
        + '<div class="progress-wrap"'
        + ' style="text-align:center">'
        + '<div class="progress-title"'
        + ' style="margin-bottom:10px">'
        + '🔥 Série actuelle</div>'
        + '<div style="font-size:44px;font-weight:900;'
        + 'color:var(--orange)">'
        + streakVal
        + '<span style="font-size:16px"> jours</span>'
        + '</div></div>';

    box.innerHTML = html;
}

function statCard(emoji, val, label) {
    return '<div class="stat-card">'
        + '<span class="stat-card-emoji">'
        + emoji + '</span>'
        + '<span class="stat-card-val">'
        + val   + '</span>'
        + '<span class="stat-card-label">'
        + label + '</span>'
        + '</div>';
}

function progressBar(title, valTxt, pct, pfClass) {
    return '<div class="progress-wrap">'
        + '<div class="progress-header">'
        + '<span class="progress-title">'
        + title  + '</span>'
        + '<span class="progress-val">'
        + valTxt + '</span>'
        + '</div>'
        + '<div class="progress-track">'
        + '<div class="progress-fill ' + pfClass
        + '" style="width:' + pct + '%"></div>'
        + '</div></div>';
}

// === BADGES ===
if (btnBadges) {
    btnBadges.onclick = function() {
        son('click');
        var badges = userData.badges || {};
        modalTitreEl.textContent = 'Mes Badges';
        var html = '<div class="badges-grid">';
        BADGES_LIST.forEach(function(b) {
            var obtenu = !!badges[b.id];
            html +=
                '<div class="badge-card '
                + (obtenu ? 'obtenu' : '') + '">'
                + '<span class="badge-card-emoji">'
                + b.emoji + '</span>'
                + '<div class="badge-card-nom">'
                + b.nom   + '</div>'
                + '<div class="badge-card-desc">'
                + b.desc  + '</div>'
                + (obtenu
                    ? '<span class="badge-card-ok">'
                    + 'Obtenu</span>' : '')
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
}

// === CLASSEMENT ===
if (btnClassement) {
    btnClassement.onclick = function() {
        son('click');
        modalTitreEl.textContent = 'Classement';
        modalTexteEl.innerHTML =
            '<div style="display:flex;'
            + 'flex-direction:column;'
            + 'gap:10px;margin-top:8px;">'
            + '<button id="btnClassBepc"'
            + ' style="padding:14px;background:'
            + 'linear-gradient(135deg,#3b82f6,#1d4ed8);'
            + 'color:white;border:none;border-radius:12px;'
            + 'font-family:Poppins,sans-serif;font-size:15px;'
            + 'font-weight:700;cursor:pointer;">'
            + '📘 Classement BEPC</button>'
            + '<button id="btnClassBAC"'
            + ' style="padding:14px;background:'
            + 'linear-gradient(135deg,#1a6b3c,#22c55e);'
            + 'color:white;border:none;border-radius:12px;'
            + 'font-family:Poppins,sans-serif;font-size:15px;'
            + 'font-weight:700;cursor:pointer;">'
            + '📗 Classement BAC</button>'
            + '</div>';
        modalEl.style.display      = 'flex';
        btnConfirmer.style.display = 'none';
        btnAnnuler.textContent     = 'Fermer';
        btnAnnuler.onclick = function() {
            modalEl.style.display      = 'none';
            btnConfirmer.style.display = '';
            btnAnnuler.textContent     = 'Annuler';
        };
        setTimeout(function() {
            var bB = document.getElementById(
                'btnClassBepc');
            var bA = document.getElementById(
                'btnClassBAC');
            if (bB) bB.onclick = function() {
                afficherClassementModal('bepc');
            };
            if (bA) bA.onclick = function() {
                afficherClassementModal('bac');
            };
        }, 100);
    };
}

async function afficherClassementModal(salle) {
    var label = salle === 'bepc'
        ? '📘 BEPC' : '📗 BAC';
    modalTitreEl.textContent =
        'Classement ' + label;
    modalTexteEl.innerHTML =
        '<div class="loading-box">'
        + '<div class="loader"></div></div>';
    modalEl.style.display      = 'flex';
    btnConfirmer.style.display = 'none';
    btnAnnuler.textContent     = 'Fermer';
    btnAnnuler.onclick = function() {
        modalEl.style.display      = 'none';
        btnConfirmer.style.display = '';
        btnAnnuler.textContent     = 'Annuler';
    };

    var node = salle === 'bepc'
        ? 'resultatsBepc' : 'resultatsBAC';
    var snap = await db.ref(node)
        .orderByChild('score')
        .limitToLast(50)
        .once('value');
    var results = [];
    snap.forEach(function(child) {
        results.push(
            Object.assign({key:child.key}, child.val()));
    });
    results.sort(function(a, b) {
        return b.score - a.score
            || a.timestamp - b.timestamp;
    });

    var monIdx = results.findIndex(function(r) {
        return r.key === user;
    });
    var html = '';

    if (monIdx >= 0) {
        html +=
            '<div style="background:rgba(250,204,21,0.08);'
            + 'border:2px solid rgba(250,204,21,0.3);'
            + 'border-radius:16px;padding:18px;'
            + 'margin-bottom:18px;text-align:center">'
            + '<div style="font-size:11px;font-weight:700;'
            + 'color:var(--muted);text-transform:uppercase;'
            + 'margin-bottom:8px">Ma position</div>'
            + '<div style="font-size:48px;font-weight:900;'
            + 'color:var(--yellow);line-height:1;'
            + 'margin-bottom:6px">'
            + '#' + (monIdx + 1) + '</div>'
            + '<div style="font-size:13px;color:var(--muted)">'
            + (results[monIdx].score || 0)
            + '/50 pts</div>'
            + '</div>';
    }

    html += '<div style="max-height:350px;overflow-y:auto;">';
    results.slice(0, 25).forEach(function(r, i) {
        html += ligneClassement(r, i, false);
    });
    html += '</div>';
    modalTexteEl.innerHTML = html;
}

function ligneClassement(r, i, isTop10) {
    var med = i===0?'🥇':i===1?'🥈':i===2?'🥉'
        :'#'+(i+1);
    var p          = r.prenom || '';
    var n          = r.nom    || '';
    var nomAffiche = (p||n)
        ? (p+' '+n).trim()
        : (r.pseudo || 'Candidat');
    var isMe = r.key === user;
    var sc   = (typeof r.score === 'number')
        ? r.score : 0;

    return '<div class="classement-item'
        + (isMe ? ' is-me' : '') + '" '
        + 'style="' + (isMe
            ? 'border-color:var(--yellow);'
            + 'background:rgba(250,204,21,0.07)'
            : '') + '">'
        + '<span class="rang">' + med + '</span>'
        + '<div style="flex:1;min-width:0">'
        + '<div class="cl-nom">'
        + nomAffiche + (isMe ? ' 👈' : '') + '</div>'
        + '<div class="cl-meta">'
        + (r.sorties > 0
            ? r.sorties + ' sortie(s) ' : '')
        + (isTop10 && r.date ? r.date : '')
        + '</div></div>'
        + '<span class="cl-score" style="'
        + (isMe ? 'color:var(--yellow)' : '') + '">'
        + sc + '/50</span>'
        + '</div>';
}

// ============================================
// FIN PARTIE 6/15 ✅
// ============================================// ============================================
// PARTIE 7/15 — ADMIN LOGIN + CONFIG + IMPORT
// ============================================

// === ADMIN LOGIN ===
if (btnAdmin) {
    btnAdmin.onclick = function() {
        son('click'); showPage(pageAdminLogin);
    };
}
if (btnRetour) {
    btnRetour.onclick = function() {
        son('click'); showPage(pageAccueil);
    };
}

var tentativesAdmin    = 0;
var derniereTentAdmin  = 0;
var MAX_TENTATIVES_ADM = 3;
var BLOCAGE_ADMIN_MS   = 10 * 60 * 1000;

if (btnLoginAdmin) {
    btnLoginAdmin.onclick = async function() {
        son('click');
        var now = Date.now();
        if (tentativesAdmin >= MAX_TENTATIVES_ADM) {
            var tempsRestant =
                BLOCAGE_ADMIN_MS
                - (now - derniereTentAdmin);
            if (tempsRestant > 0) {
                var min = Math.ceil(
                    tempsRestant / 60000);
                if (erreurAdmin)
                    erreurAdmin.textContent =
                        'Trop de tentatives. Attends '
                        + min + ' min.';
                son('error'); return;
            } else {
                tentativesAdmin = 0;
            }
        }
        var mdpSaisi = adminPassEl
            ? adminPassEl.value.trim() : '';
        if (!mdpSaisi) {
            if (erreurAdmin)
                erreurAdmin.textContent =
                    'Entre le mot de passe';
            son('error'); return;
        }
        if (mdpSaisi === '2305') {
            tentativesAdmin = 0;
            if (erreurAdmin)
                erreurAdmin.textContent = '';
            if (adminPassEl) adminPassEl.value = '';
            toast('Accès admin accordé', 'success');
            son('success');
            showPage(pageAdmin);
            chargerAdmin();
        } else {
            tentativesAdmin++;
            derniereTentAdmin = now;
            var restantes =
                MAX_TENTATIVES_ADM - tentativesAdmin;
            if (erreurAdmin) {
                erreurAdmin.textContent = restantes > 0
                    ? 'Mot de passe incorrect. '
                    + restantes + ' essai(s) restant(s).'
                    : 'Compte bloqué 10 minutes.';
            }
            son('error');
        }
    };
}

// === CHARGER ADMIN ===
async function chargerAdmin() {
    if (statusEl) {
        statusEl.textContent      = '🟢 Connecté';
        statusEl.style.background =
            'rgba(34,197,94,0.2)';
        statusEl.style.color      = 'var(--green)';
    }
    try {
        var usersSnap   = await db.ref('users')
            .once('value');
        var resBepcSnap = await db.ref('resultatsBepc')
            .once('value');
        var resBACSnap  = await db.ref('resultatsBAC')
            .once('value');
        var cfgBepcSnap = await db.ref('configBepc')
            .once('value');
        var cfgBACSnap  = await db.ref('configBAC')
            .once('value');

        var users   = usersSnap.val()   || {};
        var resBepc = resBepcSnap.val() || {};
        var resBAC  = resBACSnap.val()  || {};
        var cfgBepc = cfgBepcSnap.val() || {};
        var cfgBAC  = cfgBACSnap.val()  || {};

        if (statCandidatsEl)
            statCandidatsEl.textContent =
                Object.keys(users).length;

        var totalRes = Object.keys(resBepc).length
            + Object.keys(resBAC).length;
        if (statConcoursEl)
            statConcoursEl.textContent = totalRes;

        var scoresAll = Object.values(resBepc)
            .concat(Object.values(resBAC))
            .map(function(r) { return r.score || 0; });
        var moy = scoresAll.length > 0
            ? (scoresAll.reduce(function(a,b) {
                return a+b;
            }, 0) / scoresAll.length).toFixed(1)
            : 0;
        if (statMoyEl)
            statMoyEl.textContent = moy + '/50';

        if (cfgBepc.heureDebut && hDebutBepcEl)
            hDebutBepcEl.value = cfgBepc.heureDebut;
        if (cfgBepc.heureFin && hFinBepcEl)
            hFinBepcEl.value = cfgBepc.heureFin;
        if (cfgBepc.type && typeConcoursBepcEl)
            typeConcoursBepcEl.value = cfgBepc.type;

        if (cfgBAC.heureDebut && hDebutBAC_El)
            hDebutBAC_El.value = cfgBAC.heureDebut;
        if (cfgBAC.heureFin && hFinBAC_El)
            hFinBAC_El.value = cfgBAC.heureFin;
        if (cfgBAC.type && typeConcoursBAC_El)
            typeConcoursBAC_El.value = cfgBAC.type;

        var sujetBepcSnap = await db.ref('sujetBepc')
            .once('value');
        if (sujetBepcSnap.exists()) {
            sujetBepc = sujetBepcSnap.val() || [];
            if (sujetBepc.length > 0)
                afficherQuestionsAdmin('bepc');
        }
        var sujetBACSnap = await db.ref('sujetBAC')
            .once('value');
        if (sujetBACSnap.exists()) {
            sujetBAC = sujetBACSnap.val() || [];
            if (sujetBAC.length > 0)
                afficherQuestionsAdmin('bac');
        }

        demarrerClassementLive();
        demarrerTop10Live();

    } catch(e) {
        toast('Erreur chargement admin', 'error');
    }
}

// === SAUVER CONFIG BEPC ===
if (btnSaveConfigBepcEl) {
    btnSaveConfigBepcEl.onclick = async function() {
        son('click');
        var now   = new Date();
        var today = now.toISOString().split('T')[0];
        var debut = new Date(
            today + 'T' + hDebutBepcEl.value
            + ':00').getTime();
        var fin   = new Date(
            today + 'T' + hFinBepcEl.value
            + ':00').getTime();
        if (fin <= debut) {
            toast('Heure fin doit être après début',
                'error');
            return;
        }
        await db.ref('configBepc').set({
            type:           typeConcoursBepcEl.value,
            heureDebut:     hDebutBepcEl.value,
            heureFin:       hFinBepcEl.value,
            debutTimestamp: debut,
            finTimestamp:   fin,
            dateCreation:   Date.now()
        });
        toast('✅ Config BEPC sauvegardée !', 'success');
        son('success');
    };
}

// === SAUVER CONFIG BAC ===
if (btnSaveConfigBAC_El) {
    btnSaveConfigBAC_El.onclick = async function() {
        son('click');
        var now   = new Date();
        var today = now.toISOString().split('T')[0];
        var debut = new Date(
            today + 'T' + hDebutBAC_El.value
            + ':00').getTime();
        var fin   = new Date(
            today + 'T' + hFinBAC_El.value
            + ':00').getTime();
        if (fin <= debut) {
            toast('Heure fin doit être après début',
                'error');
            return;
        }
        await db.ref('configBAC').set({
            type:           typeConcoursBAC_El.value,
            heureDebut:     hDebutBAC_El.value,
            heureFin:       hFinBAC_El.value,
            debutTimestamp: debut,
            finTimestamp:   fin,
            dateCreation:   Date.now()
        });
        toast('✅ Config BAC sauvegardée !', 'success');
        son('success');
    };
}

// === IMPORT JSON BEPC ===
var btnAjouterPartieBepc =
    document.getElementById('btnAjouterPartieBepc');
var btnViderZoneBepc =
    document.getElementById('btnViderZoneBepc');

if (btnAjouterPartieBepc) {
    btnAjouterPartieBepc.onclick = function() {
        son('click');
        var partie = collerJSONBepcEl
            ? collerJSONBepcEl.value.trim() : '';
        if (!partie) {
            toast('Colle une partie du JSON d\'abord',
                'error');
            return;
        }
        partie = partie.replace(
            /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,
            ' ').trim();
        if (partie.startsWith('['))
            partie = partie.substring(1).trim();
        if (partie.endsWith(']'))
            partie = partie.slice(0,-1).trim();
        partie = partie.replace(/,\s*$/, '').trim();
        if (!partie) {
            toast('Partie vide', 'error'); return;
        }
        jsonCumuleBepc = jsonCumuleBepc === ''
            ? partie : jsonCumuleBepc + ',' + partie;
        if (collerJSONBepcEl)
            collerJSONBepcEl.value = '';
        var infoEl =
            document.getElementById('infoCumulBepc');
        var nbEl =
            document.getElementById('nbCaracteresBepc');
        if (infoEl) infoEl.style.display = 'block';
        if (nbEl)
            nbEl.textContent = jsonCumuleBepc.length;
        toast('Partie BEPC ajoutée !', 'success');
        son('success');
    };
}

if (btnViderZoneBepc) {
    btnViderZoneBepc.onclick = function() {
        son('click');
        jsonCumuleBepc = '';
        if (collerJSONBepcEl)
            collerJSONBepcEl.value = '';
        var infoEl =
            document.getElementById('infoCumulBepc');
        if (infoEl) infoEl.style.display = 'none';
        toast('Zone BEPC vidée', 'success');
    };
}

if (btnCharger50BepcEl) {
    btnCharger50BepcEl.onclick = function() {
        son('click');
        var texte = jsonCumuleBepc !== ''
            ? '[' + jsonCumuleBepc + ']'
            : (collerJSONBepcEl
                ? collerJSONBepcEl.value.trim() : '');
        if (!texte || texte === '[]') {
            toast('Colle les questions BEPC d\'abord',
                'error');
            return;
        }
        jsonCumuleBepc = '';
        var infoEl =
            document.getElementById('infoCumulBepc');
        if (infoEl) infoEl.style.display = 'none';
        sujetBepc = chargerJSONGenerique(texte);
        if (sujetBepc.length > 0) {
            afficherQuestionsAdmin('bepc');
            if (collerJSONBepcEl)
                collerJSONBepcEl.value = '';
            if (btnEnvoyer50BepcEl)
                btnEnvoyer50BepcEl.style.display =
                    'block';
            toast(sujetBepc.length
                + ' questions BEPC chargées !',
                'success');
            son('success');
        }
    };
}

if (btnEnvoyer50BepcEl) {
    btnEnvoyer50BepcEl.onclick = function() {
        son('click');
        modalTitreEl.textContent =
            'Envoyer questions BEPC';
        modalTexteEl.innerHTML =
            '<p>Envoyer <b>' + sujetBepc.length
            + '</b> questions aux candidats BEPC ?</p>';
        modalEl.style.display = 'flex';
        btnConfirmer.onclick = async function() {
            modalEl.style.display = 'none';
            await db.ref('sujetBepc').set(sujetBepc);
            if (btnEnvoyer50BepcEl)
                btnEnvoyer50BepcEl.style.display = 'none';
            toast(sujetBepc.length
                + ' questions BEPC envoyées !',
                'success');
            son('success');
        };
        btnAnnuler.onclick = function() {
            modalEl.style.display = 'none';
        };
    };
}

// === IMPORT JSON BAC ===
var btnAjouterPartieBAC =
    document.getElementById('btnAjouterPartieBAC');
var btnViderZoneBAC =
    document.getElementById('btnViderZoneBAC');

if (btnAjouterPartieBAC) {
    btnAjouterPartieBAC.onclick = function() {
        son('click');
        var partie = collerJSONBAC_El
            ? collerJSONBAC_El.value.trim() : '';
        if (!partie) {
            toast('Colle une partie du JSON d\'abord',
                'error');
            return;
        }
        partie = partie.replace(
            /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,
            ' ').trim();
        if (partie.startsWith('['))
            partie = partie.substring(1).trim();
        if (partie.endsWith(']'))
            partie = partie.slice(0,-1).trim();
        partie = partie.replace(/,\s*$/, '').trim();
        if (!partie) {
            toast('Partie vide', 'error'); return;
        }
        jsonCumuleBAC = jsonCumuleBAC === ''
            ? partie : jsonCumuleBAC + ',' + partie;
        if (collerJSONBAC_El)
            collerJSONBAC_El.value = '';
        var infoEl =
            document.getElementById('infoCumulBAC');
        var nbEl =
            document.getElementById('nbCaracteresBAC');
        if (infoEl) infoEl.style.display = 'block';
        if (nbEl)
            nbEl.textContent = jsonCumuleBAC.length;
        toast('Partie BAC ajoutée !', 'success');
        son('success');
    };
}

if (btnViderZoneBAC) {
    btnViderZoneBAC.onclick = function() {
        son('click');
        jsonCumuleBAC = '';
        if (collerJSONBAC_El)
            collerJSONBAC_El.value = '';
        var infoEl =
            document.getElementById('infoCumulBAC');
        if (infoEl) infoEl.style.display = 'none';
        toast('Zone BAC vidée', 'success');
    };
}

if (btnCharger50BAC_El) {
    btnCharger50BAC_El.onclick = function() {
        son('click');
        var texte = jsonCumuleBAC !== ''
            ? '[' + jsonCumuleBAC + ']'
            : (collerJSONBAC_El
                ? collerJSONBAC_El.value.trim() : '');
        if (!texte || texte === '[]') {
            toast('Colle les questions BAC d\'abord',
                'error');
            return;
        }
        jsonCumuleBAC = '';
        var infoEl =
            document.getElementById('infoCumulBAC');
        if (infoEl) infoEl.style.display = 'none';
        sujetBAC = chargerJSONGenerique(texte);
        if (sujetBAC.length > 0) {
            afficherQuestionsAdmin('bac');
            if (collerJSONBAC_El)
                collerJSONBAC_El.value = '';
            if (btnEnvoyer50BAC_El)
                btnEnvoyer50BAC_El.style.display =
                    'block';
            toast(sujetBAC.length
                + ' questions BAC chargées !',
                'success');
            son('success');
        }
    };
}

if (btnEnvoyer50BAC_El) {
    btnEnvoyer50BAC_El.onclick = function() {
        son('click');
        modalTitreEl.textContent =
            'Envoyer questions BAC';
        modalTexteEl.innerHTML =
            '<p>Envoyer <b>' + sujetBAC.length
            + '</b> questions aux candidats BAC ?</p>';
        modalEl.style.display = 'flex';
        btnConfirmer.onclick = async function() {
            modalEl.style.display = 'none';
            await db.ref('sujetBAC').set(sujetBAC);
            if (btnEnvoyer50BAC_El)
                btnEnvoyer50BAC_El.style.display = 'none';
            toast(sujetBAC.length
                + ' questions BAC envoyées !',
                'success');
            son('success');
        };
        btnAnnuler.onclick = function() {
            modalEl.style.display = 'none';
        };
    };
}

// ============================================
// FIN PARTIE 7/15 ✅
// ============================================// ============================================
// PARTIE 8/15 — ADMIN QUESTIONS + TOP10
// ============================================

// === AFFICHER QUESTIONS ADMIN ===
function afficherQuestionsAdmin(salle) {
    var sujet   = salle === 'bepc' ? sujetBepc : sujetBAC;
    var listeEl = salle === 'bepc'
        ? listeQuestionsBepcEl : listeQuestionsBAC_El;
    if (!listeEl) return;
    listeEl.innerHTML = '';

    sujet.forEach(function(q, idx) {
        var div = document.createElement('div');
        div.className = 'question-edit';

        var html =
            '<div style="font-size:12px;font-weight:800;'
            + 'color:var(--blue);text-transform:uppercase;'
            + 'letter-spacing:1px;margin-bottom:10px">'
            + 'Q' + (idx+1) + '/' + sujet.length
            + ' — ' + salle.toUpperCase() + '</div>'
            + '<textarea placeholder="Énoncé" '
            + 'data-idx="' + idx + '" '
            + 'data-salle="' + salle + '">'
            + (q.texte||'') + '</textarea>'
            + '<input type="text" '
            + 'placeholder="Explication (facultatif)" '
            + 'data-expl="' + idx + '" '
            + 'data-salle="' + salle + '" '
            + 'value="'
            + (q.explication||'')
                .replace(/"/g,'&quot;')
            + '" style="padding:10px 14px;margin:6px 0;">';

        for (var ri = 0; ri < 4; ri++) {
            var rep = (q.reponses && q.reponses[ri])
                ? q.reponses[ri] : {};
            html +=
                '<div class="reponse-edit">'
                + '<input type="checkbox" '
                + (rep.correct ? 'checked' : '')
                + ' data-q="' + idx + '"'
                + ' data-r="' + ri + '"'
                + ' data-salle="' + salle + '"'
                + ' title="Bonne réponse">'
                + '<input type="text" '
                + 'placeholder="Réponse '
                + 'ABCD'[ri] + '" value="'
                + (rep.texte||'')
                    .replace(/"/g,'&quot;')
                + '" data-q="' + idx + '"'
                + ' data-r="' + ri + '"'
                + ' data-salle="' + salle + '">'
                + '</div>';
        }

        html +=
            '<button class="btn-del" '
            + 'onclick="supprimerQuestion(\''
            + salle + '\',' + idx + ')">'
            + 'Supprimer</button>';
        div.innerHTML = html;
        listeEl.appendChild(div);
    });

    listeEl.querySelectorAll('textarea')
        .forEach(function(ta) {
        ta.oninput = function() {
            var i = parseInt(this.dataset.idx);
            var s = this.dataset.salle;
            var arr = s==='bepc' ? sujetBepc : sujetBAC;
            if (arr[i]) arr[i].texte = this.value;
        };
    });

    listeEl.querySelectorAll('input[data-expl]')
        .forEach(function(inp) {
        inp.oninput = function() {
            var i = parseInt(this.dataset.expl);
            var s = this.dataset.salle;
            var arr = s==='bepc' ? sujetBepc : sujetBAC;
            if (arr[i]) arr[i].explication = this.value;
        };
    });

    listeEl.querySelectorAll(
        '.reponse-edit input[type="text"]')
        .forEach(function(inp) {
        inp.oninput = function() {
            var q = parseInt(this.dataset.q);
            var r = parseInt(this.dataset.r);
            var s = this.dataset.salle;
            var arr = s==='bepc' ? sujetBepc : sujetBAC;
            if (!arr[q]) return;
            if (!arr[q].reponses[r])
                arr[q].reponses[r] = {};
            arr[q].reponses[r].texte = this.value;
        };
    });

    listeEl.querySelectorAll(
        '.reponse-edit input[type="checkbox"]')
        .forEach(function(cb) {
        cb.onchange = function() {
            var q = parseInt(this.dataset.q);
            var r = parseInt(this.dataset.r);
            var s = this.dataset.salle;
            var arr = s==='bepc' ? sujetBepc : sujetBAC;
            if (!arr[q]) return;
            if (!arr[q].reponses[r])
                arr[q].reponses[r] = {};
            arr[q].reponses[r].correct = this.checked;
        };
    });
}

window.supprimerQuestion = function(salle, idx) {
    son('click');
    if (confirm('Supprimer cette question ?')) {
        if (salle === 'bepc')
            sujetBepc.splice(idx, 1);
        else
            sujetBAC.splice(idx, 1);
        afficherQuestionsAdmin(salle);
        toast('Question supprimée', 'success');
    }
};

if (btnAjouterQBepcEl) {
    btnAjouterQBepcEl.onclick = function() {
        son('click');
        sujetBepc.push({
            texte:'', explication:'',
            reponses:[
                {texte:'',correct:false},
                {texte:'',correct:false},
                {texte:'',correct:false},
                {texte:'',correct:false}
            ]
        });
        afficherQuestionsAdmin('bepc');
        toast('Question BEPC ajoutée', 'success');
    };
}

if (btnAjouterQBAC_El) {
    btnAjouterQBAC_El.onclick = function() {
        son('click');
        sujetBAC.push({
            texte:'', explication:'',
            reponses:[
                {texte:'',correct:false},
                {texte:'',correct:false},
                {texte:'',correct:false},
                {texte:'',correct:false}
            ]
        });
        afficherQuestionsAdmin('bac');
        toast('Question BAC ajoutée', 'success');
    };
}

if (btnSaveSujetBepcEl) {
    btnSaveSujetBepcEl.onclick = async function() {
        son('click');
        if (sujetBepc.length === 0) {
            toast('Aucune question BEPC', 'error');
            return;
        }
        await db.ref('sujetBepc').set(sujetBepc);
        toast('Sujet BEPC sauvegardé ! ('
            + sujetBepc.length + ' questions)',
            'success');
        son('success');
    };
}

if (btnSaveSujetBAC_El) {
    btnSaveSujetBAC_El.onclick = async function() {
        son('click');
        if (sujetBAC.length === 0) {
            toast('Aucune question BAC', 'error');
            return;
        }
        await db.ref('sujetBAC').set(sujetBAC);
        toast('Sujet BAC sauvegardé ! ('
            + sujetBAC.length + ' questions)',
            'success');
        son('success');
    };
}

// === TOP 10 LIVE ===
function demarrerClassementLive() {
    db.ref('resultatsBepc').on('value', function(snap) {
        var results = [];
        snap.forEach(function(child) {
            results.push(
                Object.assign(
                    {key:child.key}, child.val()));
        });
        results.sort(function(a, b) {
            return b.score - a.score
                || a.timestamp - b.timestamp;
        });
        if (!top10BepcEl) return;
        if (results.length === 0) {
            top10BepcEl.innerHTML =
                '<p style="text-align:center;'
                + 'color:var(--muted)">'
                + 'Aucun résultat BEPC</p>';
            return;
        }
        top10BepcEl.innerHTML =
            results.slice(0, 10).map(function(r, i) {
            var nom = ((r.prenom||'')
                +' '+(r.nom||'')).trim()
                || 'Candidat';
            var med = i===0?'🥇':i===1?'🥈'
                :i===2?'🥉':'#'+(i+1);
            return '<div class="classement-item">'
                + '<span class="rang">'
                + med + '</span>'
                + '<div class="cl-nom">'
                + nom + '</div>'
                + '<span class="cl-score">'
                + (r.score||0) + '/50</span>'
                + '</div>';
        }).join('');
    });

    db.ref('resultatsBAC').on('value', function(snap) {
        var results = [];
        snap.forEach(function(child) {
            results.push(
                Object.assign(
                    {key:child.key}, child.val()));
        });
        results.sort(function(a, b) {
            return b.score - a.score
                || a.timestamp - b.timestamp;
        });
        if (!top10BAC_El) return;
        if (results.length === 0) {
            top10BAC_El.innerHTML =
                '<p style="text-align:center;'
                + 'color:var(--muted)">'
                + 'Aucun résultat BAC</p>';
            return;
        }
        top10BAC_El.innerHTML =
            results.slice(0, 10).map(function(r, i) {
            var nom = ((r.prenom||'')
                +' '+(r.nom||'')).trim()
                || 'Candidat';
            var med = i===0?'🥇':i===1?'🥈'
                :i===2?'🥉':'#'+(i+1);
            return '<div class="classement-item">'
                + '<span class="rang">'
                + med + '</span>'
                + '<div class="cl-nom">'
                + nom + '</div>'
                + '<span class="cl-score">'
                + (r.score||0) + '/50</span>'
                + '</div>';
        }).join('');
    });
}

// === TOP 10 PERMANENT ===
function demarrerTop10Live() {
    db.ref('top10Permanent').on('value',
        function(snap) {
        var results = [];
        snap.forEach(function(child) {
            results.push(
                Object.assign(
                    {key:child.key}, child.val()));
        });
        results.sort(function(a, b) {
            return b.score - a.score;
        });
        if (!top10PermanentEl) return;
        if (results.length === 0) {
            top10PermanentEl.innerHTML =
                '<div style="text-align:center;'
                + 'padding:30px;color:var(--muted)">'
                + '🌟 Hall of Fame vide</div>';
            return;
        }
        var html =
            '<div style="font-size:11px;'
            + 'font-weight:700;color:var(--muted);'
            + 'text-transform:uppercase;'
            + 'letter-spacing:1px;margin-bottom:12px">'
            + 'Meilleurs scores tous concours</div>';
        results.forEach(function(r, i) {
            html += ligneClassement(r, i, true);
        });
        top10PermanentEl.innerHTML = html;
    });
}

if (btnResetTop10) {
    btnResetTop10.onclick = function() {
        son('click');
        modalTitreEl.textContent = 'Reset Hall of Fame';
        modalTexteEl.innerHTML =
            '<p>Supprimer tout le Hall of Fame ?<br>'
            + 'Cette action est '
            + '<b style="color:var(--red)">'
            + 'irréversible</b>.</p>';
        modalEl.style.display = 'flex';
        btnConfirmer.onclick = async function() {
            modalEl.style.display = 'none';
            await db.ref('top10Permanent').remove();
            toast('Hall of Fame réinitialisé',
                'success');
            son('success');
        };
        btnAnnuler.onclick = function() {
            modalEl.style.display = 'none';
        };
    };
}

// === LISTE CANDIDATS ===
db.ref('users').on('value', function(snap) {
    if (!listeCandidatsEl) return;
    var users = [];
    snap.forEach(function(child) {
        users.push(
            Object.assign(
                {key:child.key}, child.val()));
    });
    users.sort(function(a, b) {
        return (b.xp||0) - (a.xp||0);
    });

    if (users.length === 0) {
        listeCandidatsEl.innerHTML =
            '<p style="text-align:center;'
            + 'color:var(--muted)">Aucun candidat</p>';
        return;
    }

    var nbPayes = users.filter(function(u) {
        return u.accesPaye;
    }).length;
    var nbNonPaye = users.length - nbPayes;

    listeCandidatsEl.innerHTML =
        '<div style="display:flex;gap:10px;'
        + 'margin-bottom:12px;flex-wrap:wrap;">'
        + '<span style="background:rgba(34,197,94,0.15);'
        + 'color:var(--green);padding:5px 12px;'
        + 'border-radius:20px;font-size:12px;'
        + 'font-weight:700">✅ '
        + nbPayes + ' payés</span>'
        + '<span style="background:rgba(239,68,68,0.15);'
        + 'color:var(--red);padding:5px 12px;'
        + 'border-radius:20px;font-size:12px;'
        + 'font-weight:700">❌ '
        + nbNonPaye + ' non payés</span>'
        + '</div>'
        + users.map(function(u) {
            var paye = u.accesPaye === true;
            return '<div class="candidat-item">'
                + '<div style="flex:1;min-width:0">'
                + '<div class="candidat-nom">'
                + (u.prenom||'?') + ' '
                + (u.nom||'?') + '</div>'
                + '<div class="candidat-email">'
                + (u.email||'?') + '</div>'
                + '<div class="candidat-meta">'
                + 'Niv.' + (u.niveau||1)
                + ' · ' + (u.xp||0) + ' XP'
                + ' · ' + (u.concoursFaits||0)
                + ' concours</div>'
                + '</div>'
                + '<div style="display:flex;'
                + 'flex-direction:column;'
                + 'align-items:flex-end;'
                + 'gap:6px;flex-shrink:0">'
                + '<div style="font-size:12px;'
                + 'font-weight:800;color:'
                + (paye ? 'var(--green)'
                    : 'var(--red)') + '">'
                + (paye ? '✅ Payé'
                    : '❌ Non payé') + '</div>'
                + (paye
                    ? '<button onclick="revoquerAcces(\''
                    + u.key + '\')" '
                    + 'style="background:'
                    + 'rgba(239,68,68,0.15);'
                    + 'border:1px solid var(--red);'
                    + 'color:var(--red);'
                    + 'padding:5px 10px;'
                    + 'border-radius:8px;'
                    + 'font-size:11px;font-weight:700;'
                    + 'cursor:pointer;width:auto;'
                    + 'min-height:auto;margin:0;'
                    + 'font-family:Poppins,sans-serif">'
                    + 'Révoquer</button>'
                    : '<button onclick="activerAcces(\''
                    + u.key + '\')" '
                    + 'style="background:var(--green);'
                    + 'color:white;padding:5px 10px;'
                    + 'border-radius:8px;'
                    + 'font-size:11px;font-weight:700;'
                    + 'cursor:pointer;width:auto;'
                    + 'min-height:auto;margin:0;'
                    + 'font-family:Poppins,sans-serif">'
                    + 'Activer</button>')
                + '</div></div>';
        }).join('');
});

window.activerAcces = async function(userKey) {
    son('click');
    await db.ref('users/' + userKey).update({
        accesPaye:    true,
        datePaiement: Date.now()
    });
    toast('Accès activé !', 'success');
    son('success');
};

window.revoquerAcces = async function(userKey) {
    son('click');
    modalTitreEl.textContent = 'Révoquer l\'accès';
    modalTexteEl.innerHTML =
        '<p>Révoquer l\'accès de ce candidat ?</p>';
    modalEl.style.display = 'flex';
    btnConfirmer.onclick = async function() {
        modalEl.style.display = 'none';
        await db.ref('users/' + userKey)
            .update({ accesPaye:false });
        toast('Accès révoqué', 'success');
    };
    btnAnnuler.onclick = function() {
        modalEl.style.display = 'none';
    };
};

if (btnActiverTous) {
    btnActiverTous.onclick = async function() {
        son('click');
        modalTitreEl.textContent =
            'Activer tous les candidats';
        modalTexteEl.innerHTML =
            '<p>Activer l\'accès de <b>tous</b> '
            + 'les candidats inscrits ?</p>';
        modalEl.style.display = 'flex';
        btnConfirmer.onclick = async function() {
            modalEl.style.display = 'none';
            var snap = await db.ref('users')
                .once('value');
            var updates = {};
            snap.forEach(function(child) {
                updates[child.key + '/accesPaye'] =
                    true;
                updates[child.key + '/datePaiement'] =
                    Date.now();
            });
            await db.ref('users').update(updates);
            toast('Tous les candidats sont activés !',
                'success');
            son('success');
        };
        btnAnnuler.onclick = function() {
            modalEl.style.display = 'none';
        };
    };
}

// === NOUVEAU CONCOURS ===
if (btnNouveauConcours) {
    btnNouveauConcours.onclick = function() {
        son('click');
        modalTitreEl.textContent = 'Nouveau Concours';
        modalTexteEl.innerHTML =
            '<p style="margin-bottom:14px">'
            + 'Choisir comment réinitialiser :</p>'
            + '<div style="display:flex;'
            + 'flex-direction:column;gap:10px">'
            + '<button id="btnNvConserve" '
            + 'style="background:var(--blue);'
            + 'color:white;padding:14px;border:none;'
            + 'border-radius:12px;'
            + 'font-family:Poppins,sans-serif;'
            + 'font-size:14px;font-weight:700;'
            + 'cursor:pointer;">'
            + '✅ Conserver les paiements</button>'
            + '<button id="btnNvReinitialise" '
            + 'style="background:var(--orange);'
            + 'color:white;padding:14px;border:none;'
            + 'border-radius:12px;'
            + 'font-family:Poppins,sans-serif;'
            + 'font-size:14px;font-weight:700;'
            + 'cursor:pointer;">'
            + '🔄 Réinitialiser les paiements'
            + '</button></div>';
        modalEl.style.display      = 'flex';
        btnConfirmer.style.display = 'none';
        btnAnnuler.textContent     = 'Annuler';
        btnAnnuler.onclick = function() {
            modalEl.style.display      = 'none';
            btnConfirmer.style.display = '';
            btnAnnuler.textContent     = 'Annuler';
        };

        setTimeout(function() {
            var btnC =
                document.getElementById('btnNvConserve');
            var btnR =
                document.getElementById(
                    'btnNvReinitialise');

            if (btnC) btnC.onclick = async function() {
                modalEl.style.display      = 'none';
                btnConfirmer.style.display = '';
                btnAnnuler.textContent     = 'Annuler';
                await db.ref('resultatsBepc').remove();
                await db.ref('resultatsBAC').remove();
                await db.ref('sessionsBepc').remove();
                await db.ref('sessionsBAC').remove();
                copieSubmise = false;
                toast('Nouveau concours prêt ! '
                    + 'Paiements conservés.',
                    'success');
                son('success');
            };

            if (btnR) btnR.onclick = async function() {
                modalEl.style.display      = 'none';
                btnConfirmer.style.display = '';
                btnAnnuler.textContent     = 'Annuler';
                await db.ref('resultatsBepc').remove();
                await db.ref('resultatsBAC').remove();
                await db.ref('sessionsBepc').remove();
                await db.ref('sessionsBAC').remove();
                var snap = await db.ref('users')
                    .once('value');
                var updates = {};
                snap.forEach(function(child) {
                    updates[child.key + '/accesPaye'] =
                        false;
                });
                await db.ref('users').update(updates);
                copieSubmise = false;
                toast('Nouveau concours prêt ! '
                    + 'Paiements réinitialisés.',
                    'success');
                son('success');
            };
        }, 100);
    };
}

if (btnLogoutAdmin) {
    btnLogoutAdmin.onclick = function() {
        son('click');
        showPage(pageAccueil);
        toast('Déconnecté', 'success');
    };
}

// ============================================
// FIN PARTIE 8/15 ✅
// ============================================// ============================================
// PARTIE 9/15 — CHOIX SALLE + ENTRER
// ============================================

// === MODAL CHOIX SALLE ===
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

// === BOUTONS RETOUR SALLES ===
if (btnRetourSalleAttenteBepc) {
    btnRetourSalleAttenteBepc.onclick = function() {
        son('click');
        if (salleAttenteBepcEl)
            salleAttenteBepcEl.style.display = 'none';
        chargerMenu(userData);
    };
}

if (btnRetourSalleAttenteBac) {
    btnRetourSalleAttenteBac.onclick = function() {
        son('click');
        if (salleAttenteBacEl)
            salleAttenteBacEl.style.display = 'none';
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

// === CACHER TOUT SAUF ===
function cacherToutSauf() {
    if (salleAttenteBepcEl)
        salleAttenteBepcEl.style.display = 'none';
    if (salleAttenteBacEl)
        salleAttenteBacEl.style.display  = 'none';
    var salleRetardEl =
        document.getElementById('salle-retard');
    if (salleRetardEl)
        salleRetardEl.style.display = 'none';
    if (questionsEl)
        questionsEl.style.display  = 'none';
    if (attenteEl)
        attenteEl.style.display    = 'none';
    if (resultatEl)
        resultatEl.style.display   = 'none';
    var footer  = document.querySelector('.footer');
    var header  = document.querySelector('.header');
    var subhead = document.querySelector('.subheader');
    if (footer)  footer.style.display  = 'none';
    if (header)  header.style.display  = 'none';
    if (subhead) subhead.style.display = 'none';
}

// === ENTRER DANS UNE SALLE ===
async function entrerDansSalle(salle) {
    var configNode  = salle === 'bepc'
        ? 'configBepc'    : 'configBAC';
    var sujetNode   = salle === 'bepc'
        ? 'sujetBepc'     : 'sujetBAC';
    var resultNode  = salle === 'bepc'
        ? 'resultatsBepc'  : 'resultatsBAC';
    var sessionNode = salle === 'bepc'
        ? 'sessionsBepc'   : 'sessionsBAC';

    // Vérification paiement
    var userSnap = await db.ref('users/' + user)
        .once('value');
    var userDataFresh = userSnap.val() || {};

    if (!userDataFresh.accesPaye) {
        modalTitreEl.textContent = 'Accès au concours';
        modalTexteEl.innerHTML =
            '<div style="text-align:center;'
            + 'padding:10px 0">'
            + '<div style="font-size:50px;'
            + 'margin-bottom:16px">💳</div>'
            + '<p style="font-weight:800;font-size:16px;'
            + 'margin-bottom:12px">'
            + 'Accès payant : 100 FCFA</p>'
            + '<p style="color:var(--muted);'
            + 'font-size:13px;line-height:1.7;'
            + 'margin-bottom:16px">'
            + 'Envoie <b style="color:var(--yellow)">'
            + '100 FCFA</b> par Orange Money au :<br><br>'
            + '<span style="font-size:22px;'
            + 'font-weight:900;color:var(--green)">'
            + '55 24 04 31</span><br><br>'
            + 'Envoie la capture WhatsApp au même '
            + 'numéro.<br>'
            + 'Ton accès sera activé dans les '
            + 'minutes qui suivent.</p>'
            + '</div>';
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

    var configSnap = await db.ref(configNode)
        .once('value');
    configActuelle = configSnap.val();

    if (!configActuelle) {
        toast('Aucun concours '
            + salle.toUpperCase() + ' configuré',
            'error');
        return;
    }

    var sujetSnap = await db.ref(sujetNode)
        .once('value');
    questionsData = sujetSnap.val() || [];

    if (questionsData.length === 0) {
        toast('Aucune question pour '
            + salle.toUpperCase(), 'error');
        return;
    }

    var now = Date.now();
    finTimestamp = configActuelle.finTimestamp;

    // Badge salle
    var salleBadge =
        document.getElementById('salleBadgeResultat');
    if (salleBadge) {
        salleBadge.innerHTML =
            '<span style="display:inline-block;'
            + 'padding:5px 16px;border-radius:20px;'
            + 'font-size:13px;font-weight:800;'
            + (salle === 'bepc'
                ? 'background:rgba(59,130,246,0.1);'
                + 'border:1.5px solid '
                + 'rgba(59,130,246,0.3);'
                + 'color:var(--blue);">📘 Salle BEPC'
                : 'background:rgba(26,107,60,0.1);'
                + 'border:1.5px solid '
                + 'rgba(26,107,60,0.3);'
                + 'color:var(--primary);">📗 Salle BAC')
            + '</span>';
    }

    // CAS 1 : Pas encore commencé
    if (now < configActuelle.debutTimestamp) {
        showPage(pageExam);
        cacherToutSauf();
        var salleAttenteEl = salle === 'bepc'
            ? salleAttenteBepcEl : salleAttenteBacEl;
        var hEl = document.getElementById(
            salle === 'bepc'
            ? 'heureDebutAffichBepc'
            : 'heureDebutAffichBac');
        var tEl = document.getElementById(
            salle === 'bepc'
            ? 'timerDebutBepc' : 'timerDebutBac');

        if (salleAttenteEl)
            salleAttenteEl.style.display = 'block';
        if (hEl) hEl.textContent =
            new Date(configActuelle.debutTimestamp)
            .toLocaleTimeString('fr-FR', {
                hour:'2-digit', minute:'2-digit'
            });

        var intvAttente = setInterval(function() {
            var reste =
                configActuelle.debutTimestamp
                - Date.now();
            if (reste <= 0) {
                clearInterval(intvAttente);
                if (salleAttenteEl)
                    salleAttenteEl.style.display =
                        'none';
                finTimestamp =
                    configActuelle.finTimestamp;
                lancerExamen(
                    salle, resultNode, sessionNode);
                return;
            }
            var h = Math.floor(reste / 3600000);
            var m = Math.floor(
                (reste % 3600000) / 60000);
            var s = Math.floor(
                (reste % 60000) / 1000);
            if (tEl)
                tEl.textContent =
                    pad(h)+':'+pad(m)+':'+pad(s);
        }, 1000);
        return;
    }

    // CAS 2 : Concours terminé
    if (now > configActuelle.finTimestamp) {
        var resSnapFin = await db.ref(
            resultNode + '/' + user).once('value');
        if (resSnapFin.exists()) {
            var resFin = resSnapFin.val();
            if (resFin.timestamp >=
                configActuelle.debutTimestamp) {
                showPage(pageExam);
                cacherToutSauf();
                var header =
                    document.querySelector('.header');
                if (header)
                    header.style.display = 'flex';
                reponsesFinales =
                    resFin.reponses || {};
                afficherResultat(
                    resFin.score, resFin.bonnes,
                    resFin.partielles, resFin.fausses,
                    resFin.xp, salle, resultNode);
            } else {
                toast('Ce concours '
                    + salle.toUpperCase()
                    + ' est terminé', 'error');
            }
        } else {
            toast('Ce concours '
                + salle.toUpperCase()
                + ' est terminé', 'error');
        }
        return;
    }

    // CAS 3 : Résultat existant en cours
    var resSnap2 = await db.ref(
        resultNode + '/' + user).once('value');
    if (resSnap2.exists()) {
        var res2 = resSnap2.val();
        if (res2.timestamp >=
            configActuelle.debutTimestamp) {
            showPage(pageExam);
            cacherToutSauf();
            reponsesFinales = res2.reponses || {};
            if (now < finTimestamp) {
                afficherAttenteDepuisResultatExistant(
                    res2, salle, resultNode);
            } else {
                var header =
                    document.querySelector('.header');
                if (header)
                    header.style.display = 'flex';
                afficherResultat(
                    res2.score, res2.bonnes,
                    res2.partielles, res2.fausses,
                    res2.xp, salle, resultNode);
            }
            return;
        } else {
            await db.ref(
                resultNode + '/' + user).remove();
            await db.ref(
                sessionNode + '/' + user).remove();
            toast('Nouveau concours détecté !',
                'success');
        }
    }

    // CAS 4 : Retard > 5 min
    var tempsEcoule =
        now - configActuelle.debutTimestamp;
    var retardMin = Math.floor(tempsEcoule / 60000);

    if (retardMin > 5) {
        showPage(pageExam);
        cacherToutSauf();
        var salleRetardEl =
            document.getElementById('salle-retard');
        if (salleRetardEl) {
            salleRetardEl.style.display = 'block';
            var timerRetardEl =
                document.getElementById('timerRetard');
            var intvRetard = setInterval(function() {
                var reste = finTimestamp - Date.now();
                if (reste <= 0) {
                    clearInterval(intvRetard);
                    return;
                }
                var mr = Math.floor(reste / 60000);
                var sr = Math.floor(
                    (reste % 60000) / 1000);
                if (timerRetardEl)
                    timerRetardEl.textContent =
                        pad(mr) + ':' + pad(sr);
            }, 1000);

            var btnCR = document.getElementById(
                'btnCommencerRetard');
            if (btnCR) {
                btnCR.onclick = function() {
                    clearInterval(intvRetard);
                    salleRetardEl.style.display = 'none';
                    nbSorties    = 0;
                    copieSubmise = false;
                    enExamen     = false;
                    lancerExamen(
                        salle, resultNode, sessionNode);
                };
            }
        }
        return;
    }

    // CAS 5 : Lancer directement
    nbSorties    = 0;
    copieSubmise = false;
    enExamen     = false;
    showPage(pageExam);
    cacherToutSauf();
    lancerExamen(salle, resultNode, sessionNode);
}

// ============================================
// FIN PARTIE 9/15 ✅
// ============================================// ============================================
// PARTIE 10/15 — LANCER EXAMEN + QUESTIONS
// ============================================

async function lancerExamen(salle, resultNode,
    sessionNode) {
    enExamen = true;
    _salleAntiTriche   = salle;
    _resultNodeGlobal  = resultNode;
    _sessionNodeGlobal = sessionNode;

    cacherToutSauf();
    if (questionsEl)
        questionsEl.style.display  = 'block';
    var footer  = document.querySelector('.footer');
    var header  = document.querySelector('.header');
    var subhead = document.querySelector('.subheader');
    if (footer)  footer.style.display  = 'flex';
    if (header)  header.style.display  = 'flex';
    if (subhead) subhead.style.display = 'flex';

    if (nomConcoursEl)
        nomConcoursEl.textContent =
            (salle === 'bepc' ? '📘 BEPC — ' : '📗 BAC — ')
            + (configActuelle.type
                || 'Concours Blanc Bonogo');
    var dureeMin = Math.round(
        (configActuelle.finTimestamp
        - configActuelle.debutTimestamp) / 60000);
    if (heureConcoursEl)
        heureConcoursEl.textContent =
            'Durée : ' + dureeMin + ' min';

    var sessionSnap = await db.ref(
        sessionNode + '/' + user).once('value');
    var session = sessionSnap.val();

    if (session
        && session.finTimestamp === finTimestamp
        && !session.termine) {

        reponsesUser = session.reponses || {};
        nbSorties    = session.nbSorties || 0;

        var repConverti = {};
        Object.keys(reponsesUser).forEach(
            function(qi) {
            var val = reponsesUser[qi];
            if (val !== null && val !== undefined) {
                repConverti[qi] =
                    (typeof val === 'object'
                    && !Array.isArray(val))
                    ? Object.values(val) : val;
            }
        });
        reponsesUser = repConverti;

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
                + 'padding:10px 0">'
                + '<div style="font-size:40px;'
                + 'margin-bottom:12px">📋</div>'
                + '<p style="font-weight:700;'
                + 'margin-bottom:10px">'
                + 'Ton concours a été interrompu.</p>'
                + '<div style="background:'
                + 'rgba(239,68,68,0.1);border:1.5px '
                + 'solid rgba(239,68,68,0.3);'
                + 'border-radius:12px;padding:12px;">'
                + '<span style="color:var(--red);'
                + 'font-weight:800;font-size:14px">'
                + 'Sorties : ' + nbSorties
                + ' / ' + MAX_SORTIES + '</span>'
                + '</div></div>';
            modalEl.style.display      = 'flex';
            btnConfirmer.style.display = 'none';
            btnAnnuler.textContent =
                'Reprendre le concours';
            btnAnnuler.onclick = function() {
                modalEl.style.display      = 'none';
                btnConfirmer.style.display = '';
                btnAnnuler.textContent     = 'Annuler';
                continuerExamen(
                    salle, resultNode, sessionNode);
            };
        } else {
            continuerExamen(
                salle, resultNode, sessionNode);
        }
    } else {
        reponsesUser = {};
        nbSorties    = 0;
        await db.ref(sessionNode + '/' + user).set({
            debutTimestamp: Date.now(),
            finTimestamp:   finTimestamp,
            reponses:       {},
            nbSorties:      0,
            termine:        false,
            bloque:         false
        });
        continuerExamen(salle, resultNode, sessionNode);
    }
}

function continuerExamen(salle, resultNode,
    sessionNode) {
    alertesTimer = {
        30:false, 20:false, 10:false, 5:false
    };
    afficherQuestions();
    demarrerTimer();
    demarrerAntiTriche(salle, resultNode, sessionNode);
    demarrerTimerSecurite(
        salle, resultNode, sessionNode);
}

// === AFFICHER QUESTIONS ===
function afficherQuestions() {
    questionsEl.innerHTML = '';
    questionsData.forEach(function(q, qi) {
        var block = document.createElement('div');
        block.className = 'question-block';
        block.id = 'q-' + qi;

        var texteConverti =
            convertirMath(q.texte || '');
        var html =
            '<div class="question-numero">'
            + 'Question ' + (qi+1) + ' / '
            + questionsData.length + '</div>'
            + '<div class="question-texte">'
            + texteConverti + '</div>'
            + '<div class="reponses-liste">';

        (q.reponses || []).forEach(function(r, ri) {
            var repUser = reponsesUser[qi];
            var reponsesChoisies =
                repUser === undefined ? []
                : (Array.isArray(repUser)
                    ? repUser : [repUser]);
            var sel =
                reponsesChoisies.indexOf(ri) !== -1;
            var repTexte =
                convertirMath(r.texte || '');
            html +=
                '<label class="'
                + (sel ? 'selected' : '')
                + '" data-q="' + qi
                + '" data-r="' + ri + '">'
                + '<input type="checkbox" '
                + (sel ? 'checked' : '') + '>'
                + '<span>' + 'ABCD'[ri]
                + '. ' + repTexte + '</span>'
                + '</label>';
        });
        html += '</div>';
        block.innerHTML = html;

        block.querySelectorAll('label')
            .forEach(function(lbl) {
            lbl.onclick = function() {
                son('click');
                var q2 = parseInt(this.dataset.q);
                var r2 = parseInt(this.dataset.r);
                var current = [];
                if (Array.isArray(reponsesUser[q2]))
                    current = reponsesUser[q2].slice();
                else if (reponsesUser[q2] !== undefined)
                    current = [reponsesUser[q2]];
                var idx = current.indexOf(r2);
                if (idx === -1) current.push(r2);
                else current.splice(idx, 1);
                if (current.length > 0)
                    reponsesUser[q2] = current;
                else
                    delete reponsesUser[q2];
                block.querySelectorAll('label')
                    .forEach(function(l, li) {
                    var checked =
                        current.indexOf(li) !== -1;
                    l.classList.toggle(
                        'selected', checked);
                    var cb = l.querySelector(
                        'input[type="checkbox"]');
                    if (cb) cb.checked = checked;
                });
                var rep = 0;
                for (var i = 0;
                    i < questionsData.length; i++) {
                    var rv = reponsesUser[i];
                    if (rv !== undefined
                        && !(Array.isArray(rv)
                            && rv.length === 0))
                        rep++;
                }
                if (restantEl)
                    restantEl.textContent =
                        rep + '/' + questionsData.length;
            };
        });
        questionsEl.appendChild(block);
    });
}

// === TIMER EXAMEN ===
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
        var sec = Math.floor(
            (reste % 60000) / 1000);
        if (timerEl)
            timerEl.textContent =
                pad(min) + ':' + pad(sec);
        if (min <= 5 && timerEl)
            timerEl.classList.add('warning');
        [30, 20, 10, 5].forEach(function(m) {
            if (min === m && !alertesTimer[m]) {
                alertesTimer[m] = true;
                toast('⏰ ' + m
                    + ' minutes restantes !',
                    'warning');
                son('alerte');
            }
        });
    }, 1000);
}

// === SAUVEGARDE SESSION ===
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

// Auto-save toutes les 30 secondes
setInterval(async function() {
    if (enExamen && !copieSubmise && user
        && Object.keys(reponsesUser).length > 0) {
        await sauvegarderSession(_sessionNodeGlobal);
    }
}, 30000);

// ============================================
// FIN PARTIE 10/15 ✅
// ============================================// ============================================
// PARTIE 11/15 — ANTI-TRICHE + BLOCAGE
// ============================================

// === DÉTECTION MOUVEMENT ===
document.addEventListener('touchstart',
    function() { dernierMouvement = Date.now(); },
    { passive:true });
document.addEventListener('touchmove',
    function() { dernierMouvement = Date.now(); },
    { passive:true });
document.addEventListener('mousemove',
    function() { dernierMouvement = Date.now(); });
document.addEventListener('keydown',
    function() { dernierMouvement = Date.now(); });
document.addEventListener('click',
    function() { dernierMouvement = Date.now(); });

// === ANTI-TRICHE ===
function demarrerAntiTriche(salle, resultNode,
    sessionNode) {
    _salleAntiTriche   = salle;
    _resultNodeGlobal  = resultNode;
    _sessionNodeGlobal = sessionNode;
    document.addEventListener(
        'visibilitychange', gererSortie);
    window.addEventListener('blur',  gererSortie);
    window.addEventListener('focus', gererRetour);
}

function gererSortie() {
    if (copieSubmise || devourBloque || !enExamen)
        return;
    if (document.hidden) {
        if (!sortieTimeout) {
            sortieTimeout = setTimeout(
                async function() {
                sortieTimeout = null;
                var inactivite =
                    Date.now() - dernierMouvement;
                if (inactivite > 60000) return;
                nbSorties++;
                son('sortie');
                await sauvegarderSession(
                    _sessionNodeGlobal);
                if (nbSorties >= MAX_SORTIES) {
                    afficherBlocageDevourAvecAttente(
                        _salleAntiTriche,
                        _resultNodeGlobal,
                        _sessionNodeGlobal);
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
    var ancien =
        document.getElementById('avertissement-sortie');
    if (ancien && ancien.parentNode)
        ancien.parentNode.removeChild(ancien);

    var div = document.createElement('div');
    div.id  = 'avertissement-sortie';
    div.style.cssText =
        'position:fixed;top:0;left:0;right:0;'
        + 'bottom:0;background:rgba(0,0,0,0.92);'
        + 'z-index:5000;display:flex;'
        + 'align-items:center;'
        + 'justify-content:center;padding:20px;';

    div.innerHTML =
        '<div style="background:var(--card);'
        + 'border:2px solid var(--red);'
        + 'border-radius:20px;padding:30px 24px;'
        + 'max-width:400px;width:100%;'
        + 'text-align:center;">'
        + '<div style="font-size:50px;'
        + 'margin-bottom:16px">⚠️</div>'
        + '<h2 style="font-size:20px;font-weight:800;'
        + 'color:var(--red);margin-bottom:12px">'
        + 'Sortie détectée</h2>'
        + '<p style="color:var(--muted);font-size:13px;'
        + 'line-height:1.6;margin-bottom:20px">'
        + 'Toute sortie est enregistrée et peut '
        + 'entraîner la suspension de ton devoir.</p>'
        + '<div style="background:rgba(239,68,68,0.1);'
        + 'border:1.5px solid rgba(239,68,68,0.25);'
        + 'border-radius:12px;padding:14px;'
        + 'margin-bottom:20px">'
        + '<div style="font-size:28px;font-weight:900;'
        + 'color:var(--red);">'
        + nbSorties + ' / ' + MAX_SORTIES + '</div>'
        + '<div style="font-size:12px;'
        + 'color:var(--muted);margin-top:4px">'
        + (MAX_SORTIES - nbSorties)
        + ' sortie(s) restante(s)</div>'
        + '</div>'
        + '<button id="btnReprendreExamen" '
        + 'style="width:100%;padding:16px;'
        + 'background:var(--green);color:white;'
        + 'border:none;border-radius:12px;'
        + 'font-family:Poppins,sans-serif;'
        + 'font-size:15px;font-weight:700;'
        + 'cursor:pointer;">'
        + 'Reprendre le concours</button>'
        + '</div>';

    document.body.appendChild(div);
    son('error');

    document.getElementById('btnReprendreExamen')
        .onclick = function() {
        if (div.parentNode)
            div.parentNode.removeChild(div);
    };
}

function afficherBlocageDevourAvecAttente(salle,
    resultNode, sessionNode) {
    devourBloque = true;
    enExamen     = false;
    clearInterval(timerInt);

    var ancien =
        document.getElementById('avertissement-sortie');
    if (ancien && ancien.parentNode)
        ancien.parentNode.removeChild(ancien);

    cacherToutSauf();

    db.ref(sessionNode + '/' + user).update({
        nbSorties:nbSorties, bloque:true
    });

    var div = document.createElement('div');
    div.style.cssText =
        'padding:40px 20px;text-align:center;'
        + 'margin-top:40px;';
    div.innerHTML =
        '<div style="font-size:60px;'
        + 'margin-bottom:20px">🚫</div>'
        + '<h2 style="color:var(--red);'
        + 'margin-bottom:14px;font-size:22px;'
        + 'font-weight:800;">Devoir suspendu</h2>'
        + '<p style="font-weight:700;'
        + 'margin-bottom:10px;font-size:15px;">'
        + 'Tu as atteint le maximum de sorties ('
        + MAX_SORTIES + ').</p>'
        + '<p style="color:var(--muted);'
        + 'margin-bottom:8px;font-size:13px;'
        + 'line-height:1.6;">'
        + 'Tes réponses ont été sauvegardées.<br>'
        + 'Ta note sera calculée à la fin.</p>'
        + '<div style="background:var(--card);'
        + 'border:2px solid var(--border);'
        + 'border-radius:16px;padding:16px;'
        + 'margin:20px auto;max-width:280px;">'
        + '<div style="font-size:12px;'
        + 'color:var(--muted);margin-bottom:6px;">'
        + 'Temps restant</div>'
        + '<div id="timerBlocage" class="timer-big" '
        + 'style="font-size:36px;">--:--</div>'
        + '</div>';

    pageExam.appendChild(div);
    son('error');

    var intv = setInterval(async function() {
        var reste = finTimestamp - Date.now();
        var tb = document.getElementById('timerBlocage');
        if (tb) {
            tb.textContent =
                pad(Math.max(0,
                    Math.floor(reste / 60000)))
                + ':' + pad(Math.max(0,
                    Math.floor(
                        (reste % 60000) / 1000)));
        }
        if (reste <= 0) {
            clearInterval(intv);
            await soumettreBloque(
                salle, resultNode, sessionNode);
        }
    }, 1000);
}

async function soumettreBloque(salle, resultNode,
    sessionNode) {
    if (copieSubmise) return;
    copieSubmise = true;
    var nbB = 0, nbP = 0, nbF = 0, repFin = {};

    questionsData.forEach(function(q, qi) {
        var repUser = reponsesUser[qi];
        var bonnesReponses = [];
        (q.reponses||[]).forEach(function(r, ri) {
            if (r.correct) bonnesReponses.push(ri);
        });
        if (repUser === undefined
            || (Array.isArray(repUser)
                && repUser.length === 0)) {
            nbF++;
            repFin[qi] = {
                user:[], bonnes:bonnesReponses,
                statut:'vide'
            };
            return;
        }
        var rep = Array.isArray(repUser)
            ? repUser : [repUser];
        var toutessBonnes = bonnesReponses.every(
            function(b) {
                return rep.indexOf(b) !== -1;
            });
        var aucuneFausse = rep.every(function(r) {
            return bonnesReponses.indexOf(r) !== -1;
        });
        var auMoinsUneBonne = rep.some(function(r) {
            return bonnesReponses.indexOf(r) !== -1;
        });
        if (toutessBonnes && aucuneFausse) {
            nbB++;
            repFin[qi] = {
                user:rep, bonnes:bonnesReponses,
                statut:'bonne'
            };
        } else if (auMoinsUneBonne && aucuneFausse) {
            nbP++;
            repFin[qi] = {
                user:rep, bonnes:bonnesReponses,
                statut:'partielle'
            };
        } else {
            nbF++;
            repFin[qi] = {
                user:rep, bonnes:bonnesReponses,
                statut:'fausse'
            };
        }
    });

    var scoreFinal =
        Math.round((nbB + nbP * 0.5) * 10) / 10;
    var xpGagneVal =
        calcXp(scoreFinal, questionsData.length || 50);

    try {
        await db.ref(resultNode + '/' + user).set({
            score:scoreFinal,
            total:questionsData.length,
            bonnes:nbB, partielles:nbP, fausses:nbF,
            xp:xpGagneVal, bloque:true,
            sorties:nbSorties,
            timestamp:Date.now(),
            pseudo:userDisplay,
            prenom:userData.prenom || '',
            nom:userData.nom || '',
            salle:salle,
            reponses:repFin
        });
        await db.ref(sessionNode + '/' + user)
            .update({ termine:true });
    } catch(e) {}

    reponsesFinales = repFin;
    afficherResultat(
        scoreFinal, nbB, nbP, nbF, xpGagneVal,
        salle, resultNode);
}

// === TIMER SÉCURITÉ ===
function demarrerTimerSecurite(salle, resultNode,
    sessionNode) {
    var timerSec = setInterval(async function() {
        if (copieSubmise) {
            clearInterval(timerSec); return;
        }
        if (!enExamen) return;
        if (finTimestamp > 0
            && Date.now() >= finTimestamp) {
            clearInterval(timerSec);
            enExamen = false;
            clearInterval(timerInt);
            toast('Temps écoulé !', 'warning');
            await soumettreEtAttendre(
                salle, resultNode, sessionNode);
        }
    }, 10000);
}

// ============================================
// FIN PARTIE 11/15 ✅
// ============================================// ============================================
// PARTIE 12/15 — BOUTONS EXAMEN + SOUMETTRE
// ============================================

// === BOUTON NON RÉPONDU ===
if (btnNonRep) {
    btnNonRep.onclick = function() {
        son('click');
        var nonRep = [];
        for (var i = 0;
            i < questionsData.length; i++) {
            var r = reponsesUser[i];
            if (r === undefined
                || (Array.isArray(r)
                    && r.length === 0))
                nonRep.push(i);
        }
        if (nonRep.length === 0) {
            toast('Toutes les questions '
                + 'sont répondues !', 'success');
            return;
        }
        var el = document.getElementById(
            'q-' + nonRep[0]);
        if (el) {
            el.scrollIntoView({
                behavior:'smooth', block:'center'
            });
            el.style.border =
                '3px solid var(--yellow)';
            setTimeout(function() {
                el.style.border =
                    '2px solid var(--border)';
            }, 2000);
        }
        modalTitreEl.textContent =
            'Questions non répondues';
        var html =
            '<p style="margin-bottom:12px">Tu as '
            + '<b style="color:var(--yellow)">'
            + nonRep.length
            + '</b> question(s) sans réponse :</p>'
            + '<div style="display:flex;'
            + 'flex-wrap:wrap;gap:8px;'
            + 'max-height:200px;overflow-y:auto;'
            + 'background:var(--bg);padding:12px;'
            + 'border-radius:12px;">';
        nonRep.forEach(function(idx) {
            html +=
                '<span onclick="scrollVersQuestion('
                + idx + ')" '
                + 'style="background:var(--yellow);'
                + 'color:var(--bg);padding:6px 12px;'
                + 'border-radius:20px;font-weight:800;'
                + 'font-size:13px;cursor:pointer;">'
                + 'Q' + (idx + 1) + '</span>';
        });
        html += '</div>'
            + '<p style="margin-top:10px;'
            + 'font-size:12px;color:var(--muted);">'
            + 'Clique sur un numéro pour y aller.'
            + '</p>';
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
}

window.scrollVersQuestion = function(idx) {
    modalEl.style.display      = 'none';
    btnConfirmer.style.display = '';
    btnAnnuler.textContent     = 'Annuler';
    var el = document.getElementById('q-' + idx);
    if (el) {
        el.scrollIntoView({
            behavior:'smooth', block:'center'
        });
        el.style.border = '3px solid var(--yellow)';
        setTimeout(function() {
            el.style.border =
                '2px solid var(--border)';
        }, 2000);
    }
};

// === BOUTON TERMINER ===
if (btnFinir) {
    btnFinir.onclick = function() {
        son('click');
        var rep = 0;
        for (var i = 0;
            i < questionsData.length; i++) {
            var r = reponsesUser[i];
            if (r !== undefined
                && !(Array.isArray(r)
                    && r.length === 0))
                rep++;
        }
        var total = questionsData.length;
        modalTitreEl.textContent =
            'Terminer le concours';
        modalTexteEl.innerHTML =
            '<p>Tu as répondu à '
            + '<b style="color:var(--yellow)">'
            + rep + '/' + total
            + '</b> questions.</p>'
            + (rep < total
                ? '<p style="color:var(--orange);'
                + 'margin-top:8px;">Il reste <b>'
                + (total - rep)
                + '</b> question(s) sans réponse.</p>'
                : '<p style="color:var(--green);'
                + 'margin-top:8px;">'
                + 'Toutes les questions sont '
                + 'répondues !</p>')
            + '<p style="margin-top:12px;'
            + 'color:var(--muted);">'
            + 'Une fois soumis, tu ne pourras plus '
            + 'modifier tes réponses.</p>'
            + '<p style="margin-top:10px;'
            + 'font-weight:800">'
            + 'Confirmer la soumission ?</p>';
        modalEl.style.display = 'flex';
        btnConfirmer.onclick = async function() {
            modalEl.style.display = 'none';
            await soumettreEtAttendre(
                _salleAntiTriche,
                _resultNodeGlobal,
                _sessionNodeGlobal);
        };
        btnAnnuler.onclick = function() {
            modalEl.style.display = 'none';
        };
    };
}

// === SOUMETTRE ET ATTENDRE ===
async function soumettreEtAttendre(salle,
    resultNode, sessionNode) {
    if (copieSubmise) return;
    copieSubmise = true;
    enExamen     = false;
    clearInterval(timerInt);

    document.removeEventListener(
        'visibilitychange', gererSortie);
    window.removeEventListener('blur',  gererSortie);
    window.removeEventListener('focus', gererRetour);

    var nbBonnes = 0, nbPartielles = 0,
        nbFausses = 0;
    reponsesFinales = {};

    questionsData.forEach(function(q, qi) {
        var repUser = reponsesUser[qi];
        var bonnesReponses = [];
        (q.reponses||[]).forEach(function(r, ri) {
            if (r.correct) bonnesReponses.push(ri);
        });

        if (repUser === undefined
            || (Array.isArray(repUser)
                && repUser.length === 0)) {
            nbFausses++;
            reponsesFinales[qi] = {
                user:[], bonnes:bonnesReponses,
                statut:'vide'
            };
            return;
        }

        var rep = Array.isArray(repUser)
            ? repUser : [repUser];
        var toutessBonnes = bonnesReponses.every(
            function(b) {
                return rep.indexOf(b) !== -1;
            });
        var aucuneFausse = rep.every(function(r) {
            return bonnesReponses.indexOf(r) !== -1;
        });
        var auMoinsUneBonne = rep.some(function(r) {
            return bonnesReponses.indexOf(r) !== -1;
        });

        if (toutessBonnes && aucuneFausse) {
            nbBonnes++;
            reponsesFinales[qi] = {
                user:rep, bonnes:bonnesReponses,
                statut:'bonne'
            };
        } else if (auMoinsUneBonne && aucuneFausse) {
            nbPartielles++;
            reponsesFinales[qi] = {
                user:rep, bonnes:bonnesReponses,
                statut:'partielle'
            };
        } else {
            nbFausses++;
            reponsesFinales[qi] = {
                user:rep, bonnes:bonnesReponses,
                statut:'fausse'
            };
        }
    });

    var scoreFinal = Math.round(
        (nbBonnes + nbPartielles * 0.5) * 10) / 10;
    var xpGagneVal =
        calcXp(scoreFinal, questionsData.length);
    var timestamp  = Date.now();

    try {
        await db.ref(resultNode + '/' + user).set({
            score:scoreFinal,
            total:questionsData.length,
            bonnes:nbBonnes,
            partielles:nbPartielles,
            fausses:nbFausses,
            xp:xpGagneVal,
            timestamp:timestamp,
            pseudo:userDisplay,
            prenom:userData.prenom || '',
            nom:userData.nom    || '',
            sorties:nbSorties,
            bloque:false,
            salle:salle,
            reponses:reponsesFinales
        });
        await db.ref(sessionNode + '/' + user)
            .update({ termine:true });
    } catch(e) {
        localStorage.setItem(
            'bb_pending_' + salle + '_' + user,
            JSON.stringify({
                score:scoreFinal,
                total:questionsData.length,
                bonnes:nbBonnes,
                partielles:nbPartielles,
                fausses:nbFausses,
                xp:xpGagneVal,
                timestamp:timestamp,
                pseudo:userDisplay,
                prenom:userData.prenom || '',
                nom:userData.nom || '',
                sorties:nbSorties,
                bloque:false,
                salle:salle,
                reponses:reponsesFinales
            }));
        toast('Connexion perdue. '
            + 'Résultat sauvegardé localement.',
            'warning');
    }

    // Mise à jour stats utilisateur
    try {
        var newXp  = (userData.xp || 0) + xpGagneVal;
        var newNiv = niveau(newXp);
        var oldNiv = userData.niveau || 1;

        var freshSnap = await db.ref(
            'users/' + user + '/historique')
            .once('value');
        var histo = freshSnap.val() || [];
        if (!Array.isArray(histo))
            histo = Object.values(histo);

        histo.push({
            score:scoreFinal,
            total:questionsData.length,
            bonnes:nbBonnes,
            partielles:nbPartielles,
            fausses:nbFausses,
            xp:xpGagneVal,
            sorties:nbSorties,
            salle:salle,
            type:configActuelle
                ? (configActuelle.type
                    || 'Concours Blanc Bonogo')
                : 'Concours Blanc Bonogo',
            timestamp:timestamp,
            date:formatDate(timestamp),
            pct:getPct(scoreFinal,
                questionsData.length) + '%'
        });

        var nbConcours    = histo.length;
        var totalScoreAll = histo.reduce(
            function(a, h) {
            return a + (typeof h.score === 'number'
                ? h.score : 0);
        }, 0);
        var newMoyenne = parseFloat(
            (totalScoreAll / nbConcours).toFixed(1));

        var badges = userData.badges || {};

        if (nbConcours === 1) {
            badges.premier = true;
            afficherBadgeAnimation(
                '🎯', 'Premier Concours !');
        }
        if (nbConcours >= 5 && !badges.assidu) {
            badges.assidu = true;
            afficherBadgeAnimation('📅', 'Assidu !');
        }
        if (scoreFinal === 50 && !badges.perfect) {
            badges.perfect = true;
            afficherBadgeAnimation(
                '💯', 'Sans Faute !');
        }
        if (newNiv >= 10 && !badges.niveau10) {
            badges.niveau10 = true;
            afficherBadgeAnimation(
                '⭐', 'Niveau 10 !');
        }
        if (nbSorties === 0 && !badges.resistant)
            badges.resistant = true;
        if (newMoyenne > 40 && !badges.elite) {
            badges.elite = true;
            afficherBadgeAnimation('👑', 'Élite !');
        }
        if ((userData.streak||0) >= 7
            && !badges.streak7) {
            badges.streak7 = true;
            afficherBadgeAnimation(
                '🔥', 'Série 7 jours !');
        }

        var updates = {
            xp:newXp, niveau:newNiv,
            concoursFaits:nbConcours,
            totalScore:totalScoreAll,
            moyenne:newMoyenne,
            historique:histo,
            badges:badges
        };
        await db.ref('users/' + user)
            .update(updates);
        userData = Object.assign(userData, updates);

        if (newNiv > oldNiv) {
            toast('NIVEAU ' + newNiv + ' ATTEINT !',
                'success');
            son('niveau');
        }
    } catch(e) {
        console.warn('Erreur stats:', e);
    }

    try {
        await verifierTop10(scoreFinal);
    } catch(e) {}

    var now = Date.now();
    if (now < finTimestamp) {
        afficherAttente(
            scoreFinal, nbBonnes, nbPartielles,
            nbFausses, xpGagneVal,
            salle, resultNode);
    } else {
        afficherResultat(
            scoreFinal, nbBonnes, nbPartielles,
            nbFausses, xpGagneVal,
            salle, resultNode);
    }
}

// === ATTENTE APRÈS SOUMISSION ===
function afficherAttente(score, bonnes, partielles,
    fausses, xpG, salle, resultNode) {
    cacherToutSauf();
    if (attenteEl) attenteEl.style.display = 'block';
    var intv = setInterval(function() {
        var reste = finTimestamp - Date.now();
        if (reste <= 0) {
            clearInterval(intv);
            if (attenteEl)
                attenteEl.style.display = 'none';
            afficherResultat(
                score, bonnes, partielles,
                fausses, xpG, salle, resultNode);
            return;
        }
        var min = Math.floor(reste / 60000);
        var sec = Math.floor(
            (reste % 60000) / 1000);
        if (timerAttenteEl)
            timerAttenteEl.textContent =
                min + ':' + pad(sec);
    }, 1000);
}

function afficherAttenteDepuisResultatExistant(
    res, salle, resultNode) {
    cacherToutSauf();
    if (attenteEl) attenteEl.style.display = 'block';
    var intv = setInterval(function() {
        var reste = finTimestamp - Date.now();
        if (reste <= 0) {
            clearInterval(intv);
            if (attenteEl)
                attenteEl.style.display = 'none';
            reponsesFinales = res.reponses || {};
            afficherResultat(
                res.score, res.bonnes,
                res.partielles, res.fausses,
                res.xp, salle, resultNode);
            return;
        }
        var min = Math.floor(reste / 60000);
        var sec = Math.floor(
            (reste % 60000) / 1000);
        if (timerAttenteEl)
            timerAttenteEl.textContent =
                min + ':' + pad(sec);
    }, 1000);
}

// ============================================
// FIN PARTIE 12/15 ✅
// ============================================// ============================================
// PARTIE 13/15 — RÉSULTAT + COURBE + TOP10
// ============================================

async function afficherResultat(score, bonnes,
    partiel, fausses, xpG, salle, resultNode) {
    cacherToutSauf();
    var header = document.querySelector('.header');
    if (header) header.style.display = 'flex';
    if (resultatEl) resultatEl.style.display = 'block';

    var total = questionsData.length || 50;
    var pct   = getPct(score, total);

    if (scoreEl)
        scoreEl.textContent = score + '/' + total;
    if (xpGagneEl)
        xpGagneEl.textContent = xpG;
    if (bonnesEl)
        bonnesEl.textContent = bonnes;
    if (partiellesEl)
        partiellesEl.textContent = partiel;
    if (faussesEl)
        faussesEl.textContent = fausses;
    if (mentionResultatEl)
        mentionResultatEl.textContent =
            getMention(score);

    if (sortiesInfoEl) {
        if (nbSorties > 0) {
            sortiesInfoEl.style.display = 'block';
            sortiesInfoEl.textContent =
                '⚠️ ' + nbSorties
                + ' sortie(s) détectée(s)';
        } else {
            sortiesInfoEl.style.display = 'none';
        }
    }

    if (timerEl) {
        timerEl.textContent = pct + '%';
        timerEl.style.background =
            pct >= 60 ? 'var(--green)'
            : pct >= 40 ? 'var(--orange)'
            : 'var(--red)';
        timerEl.classList.remove('warning');
    }

    if (nomConcoursEl)
        nomConcoursEl.textContent =
            'Résultats — '
            + (salle === 'bepc'
                ? '📘 BEPC' : '📗 BAC');

    // Rang Firebase
    if (monRangResEl) {
        monRangResEl.textContent = '';
        try {
            var snap = await db.ref(resultNode)
                .orderByChild('score')
                .once('value');
            var results = [];
            snap.forEach(function(child) {
                results.push(Object.assign(
                    {key:child.key}, child.val()));
            });
            results.sort(function(a, b) {
                return b.score - a.score
                    || a.timestamp - b.timestamp;
            });
            var monRang = results.findIndex(
                function(r) { return r.key === user; });
            if (monRang >= 0) {
                var rangEmoji =
                    monRang === 0 ? '🥇'
                    : monRang === 1 ? '🥈'
                    : monRang === 2 ? '🥉'
                    : '#' + (monRang + 1);
                monRangResEl.textContent =
                    'Rang : ' + rangEmoji
                    + ' / ' + results.length
                    + ' candidats';
                if (monRang < 3) {
                    await db.ref(
                        'users/' + user
                        + '/badges/top3').set(true);
                    userData.badges =
                        userData.badges || {};
                    userData.badges.top3 = true;
                }
                if (monRang === 0) son('top1');
            }
        } catch(e) {}
    }

    // Titre rang XP
    var xpTotal  = userData.xp || 0;
    var rangInfo = getTitreRang(xpTotal);
    var titreEl2 =
        document.getElementById('titreRangRes');
    if (titreEl2) {
        titreEl2.textContent =
            rangInfo.emoji + ' ' + rangInfo.titre;
        titreEl2.style.color = rangInfo.couleur;
    }

    afficherCourbeEvolution();

    // Bouton WhatsApp
    var btnWA =
        document.getElementById('btnPartageWA');
    if (btnWA) {
        btnWA.onclick = function() {
            var msg =
                '🇧🇫 *Concours Blanc Bonogo*\n'
                + 'J\'ai obtenu *' + score + '/'
                + total + '* (' + pct + '%) !\n'
                + '✅ ' + bonnes + ' bonnes '
                + '⚠️ ' + partiel + ' partielles '
                + '❌ ' + fausses + ' fausses\n'
                + getMention(score) + '\n'
                + (salle === 'bepc'
                    ? '📘 Salle BEPC'
                    : '📗 Salle BAC') + '\n'
                + '📱 Télécharge l\'app '
                + 'Concours Blanc Bonogo !';
            window.open(
                'https://wa.me/?text='
                + encodeURIComponent(msg),
                '_blank');
            son('click');
        };
    }

    notifResultatDisponible(score, total);
    son('success');
}

// === COURBE D'ÉVOLUTION ===
async function afficherCourbeEvolution() {
    var conteneur =
        document.getElementById('courbeEvolution');
    if (!conteneur) return;

    conteneur.innerHTML =
        '<div style="text-align:center;padding:20px;">'
        + '<div class="loader" style="width:30px;'
        + 'height:30px;border-width:3px;"></div>'
        + '<p style="color:var(--muted);'
        + 'font-size:12px;margin-top:8px;">'
        + 'Chargement courbe...</p></div>';

    try {
        var snap = await db.ref('users/' + user)
            .once('value');
        var d     = snap.val() || {};
        var histo = d.historique || [];
        if (!Array.isArray(histo))
            histo = Object.values(histo);

        if (histo.length < 2) {
            conteneur.innerHTML =
                '<div style="text-align:center;'
                + 'padding:16px;color:var(--muted);'
                + 'font-size:12px;">'
                + '📈 La courbe apparaîtra après '
                + '2 concours.</div>';
            return;
        }

        var derniers = histo.slice(-8);
        var W = Math.min(
            conteneur.offsetWidth - 32, 340);
        var H = 140;
        var padG = 30, padD = 10,
            padH = 15, padB = 30;
        var largeur = W - padG - padD;
        var hauteur = H - padH - padB;
        var nb      = derniers.length;

        var points = derniers.map(function(h, i) {
            var sc  = typeof h.score === 'number'
                ? h.score : 0;
            var tot = typeof h.total === 'number'
                && h.total > 0 ? h.total : 50;
            return {
                x: padG + (i / (nb-1)) * largeur,
                y: padH + hauteur - (sc/tot) * hauteur,
                score:sc, total:tot,
                pct:getPct(sc, tot)
            };
        });

        var polyline = points.map(function(p) {
            return p.x + ',' + p.y;
        }).join(' ');

        var airePoints = polyline
            + ' ' + points[points.length-1].x
            + ',' + (padH + hauteur)
            + ' ' + padG + ',' + (padH + hauteur);

        var grille = '';
        [0, 25, 50, 75, 100].forEach(function(pct) {
            var yG = padH + hauteur
                - (pct/100) * hauteur;
            grille +=
                '<line x1="' + padG
                + '" y1="' + yG
                + '" x2="' + (W-padD)
                + '" y2="' + yG
                + '" stroke="rgba(100,116,139,0.15)"'
                + ' stroke-width="1"/>'
                + '<text x="' + (padG-4)
                + '" y="' + (yG+4)
                + '" text-anchor="end"'
                + ' font-size="8"'
                + ' fill="rgba(100,116,139,0.6)">'
                + pct + '%</text>';
        });

        var cercles = '';
        var labelsX = '';
        points.forEach(function(p, i) {
            var couleur = p.pct >= 70 ? '#22c55e'
                : p.pct >= 40 ? '#f97316'
                : '#ef4444';
            cercles +=
                '<circle cx="' + p.x
                + '" cy="' + p.y
                + '" r="5" fill="' + couleur
                + '" stroke="white"'
                + ' stroke-width="2"/>'
                + '<text x="' + p.x
                + '" y="' + (p.y - 9)
                + '" text-anchor="middle"'
                + ' font-size="9"'
                + ' font-weight="700"'
                + ' fill="' + couleur + '">'
                + p.score + '/' + p.total
                + '</text>';
            labelsX +=
                '<text x="' + p.x
                + '" y="' + (H - 6)
                + '" text-anchor="middle"'
                + ' font-size="8"'
                + ' fill="rgba(100,116,139,0.7)">'
                + 'C' + (histo.length - nb + i + 1)
                + '</text>';
        });

        var diff = points[points.length-1].pct
            - points[0].pct;
        var tendance = diff > 5
            ? '📈 +' + Math.round(diff)
            + '% de progression !'
            : diff < -5
            ? '📉 ' + Math.round(diff)
            + '% de régression'
            : '➡️ Score stable';
        var couleurTendance = diff > 5 ? '#22c55e'
            : diff < -5 ? '#ef4444' : '#94a3b8';

        conteneur.innerHTML =
            '<div style="font-size:13px;'
            + 'font-weight:800;color:var(--text);'
            + 'margin-bottom:10px;">'
            + '📈 Courbe d\'évolution</div>'
            + '<svg width="' + W + '" height="' + H
            + '" style="overflow:visible;">'
            + '<defs><linearGradient '
            + 'id="gradCourbe" x1="0" y1="0"'
            + ' x2="0" y2="1">'
            + '<stop offset="0%"'
            + ' stop-color="#1a6b3c"'
            + ' stop-opacity="0.3"/>'
            + '<stop offset="100%"'
            + ' stop-color="#1a6b3c"'
            + ' stop-opacity="0.02"/>'
            + '</linearGradient></defs>'
            + grille
            + '<polygon points="' + airePoints
            + '" fill="url(#gradCourbe)"/>'
            + '<polyline points="' + polyline
            + '" fill="none" stroke="#1a6b3c"'
            + ' stroke-width="2.5"'
            + ' stroke-linejoin="round"'
            + ' stroke-linecap="round"/>'
            + cercles + labelsX
            + '</svg>'
            + '<div style="text-align:center;'
            + 'margin-top:8px;font-size:12px;'
            + 'font-weight:700;color:'
            + couleurTendance + ';">'
            + tendance + '</div>';

    } catch(e) {
        conteneur.innerHTML =
            '<div style="color:var(--muted);'
            + 'font-size:12px;padding:12px;'
            + 'text-align:center;">'
            + 'Courbe indisponible.</div>';
    }
}

// === TOP 10 PERMANENT ===
async function verifierTop10(score) {
    var snap = await db.ref('top10Permanent')
        .once('value');
    var top  = [];
    snap.forEach(function(child) {
        top.push(
            Object.assign(
                {key:child.key}, child.val()));
    });
    top.sort(function(a, b) {
        return b.score - a.score;
    });

    var monIdx = top.findIndex(function(r) {
        return r.key === user;
    });

    if (monIdx >= 0) {
        if (score > top[monIdx].score) {
            await db.ref(
                'top10Permanent/' + user).update({
                score: score,
                date:  formatDate(Date.now())
            });
        }
    } else if (top.length < 10
        || score > (top[top.length-1]
            || {score:0}).score) {

        await db.ref('top10Permanent/' + user).set({
            score:  score,
            prenom: userData.prenom || '',
            nom:    userData.nom    || '',
            pseudo: userDisplay,
            date:   formatDate(Date.now()),
            salle:  salleActive
        });

        if (top.length >= 10) {
            await db.ref(
                'top10Permanent/'
                + top[top.length-1].key).remove();
        }

        afficherBadgeAnimation(
            '🌟', 'Top 10 Permanent !');
        await db.ref('users/' + user).update({
            top10All:          true,
            'badges/top10all': true
        });
        userData.badges = userData.badges || {};
        userData.badges.top10all = true;
    }
}

// === CORRECTION ===
if (btnCorrection) {
    btnCorrection.onclick = function() {
        son('click');
        if (correctionEl.innerHTML !== '') {
            correctionEl.innerHTML = '';
            btnCorrection.textContent =
                '📖 Voir la Correction';
            return;
        }
        btnCorrection.textContent = '❌ Masquer';
        var html = '';

        questionsData.forEach(function(q, qi) {
            var info = reponsesFinales[qi] || {};
            var statut    = info.statut || 'vide';
            var userRep   = info.user   || [];
            var bonnesRep = info.bonnes || [];
            var explication = q.explication || '';

            if (!Array.isArray(userRep))
                userRep   = [userRep];
            if (!Array.isArray(bonnesRep))
                bonnesRep = [bonnesRep];

            var cls =
                statut==='bonne'     ? 'correct'
                : statut==='partielle' ? 'partiel'
                : statut==='fausse'    ? 'incorrect'
                : 'vide';
            var ico =
                statut==='bonne'     ? '✅'
                : statut==='partielle' ? '⚠️'
                : statut==='fausse'    ? '❌' : '⬜';

            html +=
                '<div class="question-correction '
                + cls + '">'
                + '<div class="corr-entete">'
                + '<span class="corr-num">'
                + 'Q' + (qi+1) + '</span>'
                + '<span class="corr-ico">'
                + ico + '</span>'
                + (bonnesRep.length > 1
                    ? '<span style="font-size:10px;'
                    + 'background:var(--orange);'
                    + 'color:white;padding:2px 8px;'
                    + 'border-radius:10px;'
                    + 'margin-left:8px">'
                    + bonnesRep.length
                    + ' rep. attendues</span>'
                    : '')
                + '</div>'
                + '<div class="corr-question">'
                + (q.texte||'') + '</div>';

            (q.reponses||[]).forEach(
                function(r, ri) {
                var estBonne =
                    bonnesRep.indexOf(ri) !== -1;
                var estChoisie =
                    userRep.indexOf(ri) !== -1;
                var repCls = '', prefix = '';

                if (estBonne && estChoisie) {
                    repCls  = 'cr-user-bon';
                    prefix  = '✅ ';
                } else if (estBonne && !estChoisie) {
                    repCls  = 'cr-bonne';
                    prefix  = '✅ ';
                } else if (!estBonne && estChoisie) {
                    repCls  = 'cr-user-faux';
                    prefix  = '❌ ';
                }

                html +=
                    '<div class="corr-rep-ligne '
                    + repCls + '">'
                    + '<div class="corr-bulle-sm">'
                    + 'ABCD'[ri] + '</div>'
                    + '<span>' + prefix
                    + (r.texte||'') + '</span>'
                    + '</div>';
            });

            if (explication) {
                html +=
                    '<div class="corr-explication">'
                    + '<span '
                    + 'class="corr-explication-titre">'
                    + '💡 Explication</span>'
                    + explication + '</div>';
            }
            html += '</div>';
        });

        correctionEl.innerHTML = html;

        var btnPdf = document.createElement('button');
        btnPdf.className     = 'btn-green';
        btnPdf.style.cssText = 'margin:16px 0 30px;';
        btnPdf.innerHTML =
            '📄 Télécharger la correction PDF';
        btnPdf.onclick = function() {
            telechargerCorrectionPDF();
        };
        correctionEl.appendChild(btnPdf);
        correctionEl.scrollIntoView({
            behavior:'smooth'
        });
    };
}

if (btnVoirClass) {
    btnVoirClass.onclick = function() {
        son('click');
        afficherClassementModal(salleActive || 'bepc');
    };
}

if (btnRetourMenu) {
    btnRetourMenu.onclick = function() {
        son('click');
        enExamen = false;
        if (timerInt) clearInterval(timerInt);
        document.removeEventListener(
            'visibilitychange', gererSortie);
        window.removeEventListener(
            'blur',  gererSortie);
        window.removeEventListener(
            'focus', gererRetour);
        correctionEl.innerHTML = '';
        if (btnCorrection)
            btnCorrection.textContent =
                '📖 Correction';
        chargerMenu(userData);
    };
}

// ============================================
// FIN PARTIE 13/15 ✅
// ============================================// ============================================
// PARTIE 14/15 — PDF + NOTIFICATIONS
// ============================================

function telechargerCorrectionPDF() {
    son('click');
    var scoreFinal = scoreEl
        ? scoreEl.textContent : '?';
    var dateAuj     = formatDate(Date.now());
    var nomCandidat = userDisplay || 'Candidat';
    var typeConcours = configActuelle
        ? (configActuelle.type
            || 'Concours Blanc Bonogo')
        : 'Concours Blanc Bonogo';
    var nbB = bonnesEl
        ? bonnesEl.textContent     : '0';
    var nbP = partiellesEl
        ? partiellesEl.textContent : '0';
    var nbF = faussesEl
        ? faussesEl.textContent    : '0';
    var salleLabel = salleActive === 'bepc'
        ? '📘 BEPC' : '📗 BAC';

    var contenu =
        '<!DOCTYPE html><html lang="fr"><head>'
        + '<meta charset="UTF-8">'
        + '<title>Correction — '
        + nomCandidat + '</title>'
        + '<style>'
        + 'body{font-family:Arial,sans-serif;'
        + 'color:#1e293b;padding:20px;'
        + 'font-size:13px;max-width:800px;'
        + 'margin:0 auto;}'
        + 'h1{color:#0a0f1e;font-size:20px;'
        + 'text-align:center;margin-bottom:4px;}'
        + '.info{text-align:center;margin-bottom:16px;'
        + 'color:#64748b;font-size:12px;'
        + 'border-bottom:2px solid #e2e8f0;'
        + 'padding-bottom:12px;}'
        + '.score-box{text-align:center;'
        + 'background:#f8fafc;'
        + 'border:2px solid #e2e8f0;'
        + 'border-radius:12px;padding:14px;'
        + 'margin-bottom:20px;}'
        + '.score-num{font-size:32px;'
        + 'font-weight:900;color:#eab308;}'
        + '.q-block{margin-bottom:14px;'
        + 'border-radius:8px;padding:12px;'
        + 'border-left:4px solid #94a3b8;'
        + 'background:#f8fafc;}'
        + '.q-block.correct{border-left-color:#22c55e;'
        + 'background:#f0fdf4;}'
        + '.q-block.incorrect{border-left-color:#ef4444;'
        + 'background:#fef2f2;}'
        + '.q-block.partiel{border-left-color:#f97316;'
        + 'background:#fff7ed;}'
        + '.rep{font-size:12px;padding:4px 7px;'
        + 'border-radius:5px;margin-bottom:3px;'
        + 'display:flex;align-items:flex-start;'
        + 'gap:5px;}'
        + '.rep.bon{background:#dcfce7;'
        + 'color:#166534;font-weight:700;}'
        + '.rep.faux{background:#fee2e2;'
        + 'color:#991b1b;font-weight:700;}'
        + '.rep.bonne-manquee{background:#dcfce7;'
        + 'color:#166534;}'
        + '.rep-bulle{width:18px;min-width:18px;'
        + 'height:18px;border-radius:50%;'
        + 'background:#e2e8f0;display:inline-flex;'
        + 'align-items:center;'
        + 'justify-content:center;'
        + 'font-size:9px;font-weight:800;}'
        + '.explication{margin-top:8px;'
        + 'padding:9px 11px;background:#eff6ff;'
        + 'border:1px solid #bfdbfe;'
        + 'border-radius:7px;font-size:11px;'
        + 'color:#1e40af;line-height:1.6;}'
        + '.print-btn{display:block;width:100%;'
        + 'padding:14px;background:#22c55e;'
        + 'color:white;border:none;'
        + 'border-radius:10px;font-size:15px;'
        + 'font-weight:700;cursor:pointer;'
        + 'margin-bottom:20px;'
        + 'font-family:Arial,sans-serif;}'
        + '@media print{'
        + '.print-btn{display:none !important;}'
        + 'body{padding:10px;}'
        + '.q-block{page-break-inside:avoid;}}'
        + '</style></head><body>';

    contenu +=
        '<button class="print-btn"'
        + ' onclick="window.print()">'
        + '🖨️ Imprimer / Enregistrer en PDF'
        + '</button>';

    contenu +=
        '<h1>Concours Blanc Bonogo</h1>'
        + '<div class="info">Candidat : <b>'
        + nomCandidat + '</b> | Salle : <b>'
        + salleLabel + '</b> | Date : <b>'
        + dateAuj + '</b></div>'
        + '<div class="score-box">'
        + '<div class="score-num">'
        + scoreFinal + '</div>'
        + '<div style="display:flex;'
        + 'justify-content:center;gap:16px;'
        + 'margin-top:8px;font-size:12px;'
        + 'flex-wrap:wrap;">'
        + '<span style="color:#22c55e">✅ '
        + nbB + ' bonne(s)</span>'
        + '<span style="color:#f97316">⚠️ '
        + nbP + ' partielle(s)</span>'
        + '<span style="color:#ef4444">❌ '
        + nbF + ' fausse(s)</span>'
        + '</div></div>'
        + '<div style="font-weight:800;'
        + 'font-size:14px;margin-bottom:12px;">'
        + 'Correction détaillée</div>';

    questionsData.forEach(function(q, qi) {
        var info      = reponsesFinales[qi] || {};
        var statut    = info.statut || 'vide';
        var userRep   = info.user   || [];
        var bonnesRep = info.bonnes || [];
        if (!Array.isArray(userRep))
            userRep   = [userRep];
        if (!Array.isArray(bonnesRep))
            bonnesRep = [bonnesRep];

        var cls =
            statut==='bonne'     ? 'correct'
            : statut==='partielle' ? 'partiel'
            : statut==='fausse'    ? 'incorrect'
            : 'vide';
        var ico =
            statut==='bonne'     ? '✅ Bonne'
            : statut==='partielle' ? '⚠️ Partielle'
            : statut==='fausse'    ? '❌ Fausse'
            : '⬜ Non répondu';

        contenu +=
            '<div class="q-block ' + cls + '">'
            + '<div style="font-size:10px;'
            + 'font-weight:800;color:#64748b;'
            + 'text-transform:uppercase;'
            + 'margin-bottom:5px;">'
            + 'Q' + (qi+1) + ' / '
            + questionsData.length
            + ' — ' + ico + '</div>'
            + '<div style="font-size:13px;'
            + 'font-weight:700;color:#1e293b;'
            + 'margin-bottom:8px;line-height:1.5;">'
            + (q.texte||'') + '</div>';

        (q.reponses||[]).forEach(function(r, ri) {
            var estBonne =
                bonnesRep.indexOf(ri) !== -1;
            var estChoisie =
                userRep.indexOf(ri) !== -1;
            var repClass = 'neutre', prefix = '';

            if (estBonne && estChoisie) {
                repClass = 'bon'; prefix = '✅ ';
            } else if (estBonne && !estChoisie) {
                repClass = 'bonne-manquee';
                prefix   = '✅ ';
            } else if (!estBonne && estChoisie) {
                repClass = 'faux'; prefix = '❌ ';
            }

            contenu +=
                '<div class="rep ' + repClass + '">'
                + '<span class="rep-bulle">'
                + 'ABCD'[ri] + '</span>'
                + '<span>' + prefix
                + (r.texte||'') + '</span></div>';
        });

        if (q.explication) {
            contenu +=
                '<div class="explication"><b>'
                + '💡 Explication :</b> '
                + q.explication + '</div>';
        }
        contenu += '</div>';
    });

    contenu +=
        '<div style="text-align:center;'
        + 'margin-top:24px;font-size:10px;'
        + 'color:#94a3b8;">'
        + 'Concours Blanc Bonogo | Généré le '
        + dateAuj
        + ' | Contact : 55 24 04 31'
        + '</div></body></html>';

    var nomFichier =
        'Correction_Bonogo_'
        + salleActive.toUpperCase() + '_'
        + nomCandidat.replace(/\s+/g, '_')
        + '_' + Date.now() + '.html';

    try {
        var blob = new Blob([contenu], {
            type:'text/html;charset=utf-8'
        });
        var reader = new FileReader();
        reader.onload = function(e) {
            var a = document.createElement('a');
            a.href     = e.target.result;
            a.download = nomFichier;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
            }, 1000);
        };
        reader.readAsDataURL(blob);
        toast('Téléchargement en cours...',
            'success');
        son('success');

        setTimeout(function() {
            modalTitreEl.textContent =
                'Correction téléchargée !';
            modalTexteEl.innerHTML =
                '<div style="text-align:left;'
                + 'font-size:14px;line-height:1.9">'
                + '<p style="font-weight:700;'
                + 'color:var(--green);'
                + 'margin-bottom:12px;">'
                + 'Fichier .html téléchargé ✅</p>'
                + '<ol style="padding-left:18px;'
                + 'color:var(--muted);font-size:13px;'
                + 'line-height:2;">'
                + '<li>Ouvre <b>Mes fichiers</b>'
                + ' → <b>Téléchargements</b></li>'
                + '<li>Appuie sur <b>'
                + nomFichier + '</b></li>'
                + '<li>Le fichier s\'ouvre dans Chrome</li>'
                + '<li>Appuie sur <b>Imprimer</b></li>'
                + '<li>Sélectionne <b>'
                + 'Enregistrer en PDF</b></li>'
                + '<li>Ton PDF est prêt ✅</li>'
                + '</ol></div>';
            modalEl.style.display      = 'flex';
            btnConfirmer.style.display = 'none';
            btnAnnuler.textContent     = 'OK compris !';
            btnAnnuler.onclick = function() {
                modalEl.style.display      = 'none';
                btnConfirmer.style.display = '';
                btnAnnuler.textContent     = 'Annuler';
            };
        }, 1500);

    } catch(e) {
        try {
            var fenetre = window.open('', '_blank');
            if (fenetre) {
                fenetre.document.write(contenu);
                fenetre.document.close();
                setTimeout(function() {
                    fenetre.print();
                }, 800);
                toast('Appuie sur Imprimer '
                    + 'puis Enregistrer en PDF',
                    'success');
            }
        } catch(e2) {
            toast('Erreur : ' + e2.message, 'error');
        }
    }
}

// === NOTIFICATIONS ===
function demanderPermissionNotif() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') return;
    if (Notification.permission === 'denied')  return;
    setTimeout(function() {
        Notification.requestPermission()
            .then(function(permission) {
            if (permission === 'granted')
                toast('Notifications activées !',
                    'success');
        }).catch(function() {});
    }, 2000);
}

function envoyerNotif(titre, message) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted')
        return;
    try {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready
                .then(function(reg) {
                reg.showNotification(titre, {
                    body:    message,
                    icon:    './icone.svg',
                    badge:   './icone.svg',
                    vibrate: [200, 100, 200],
                    tag:     'bonogo-' + Date.now()
                });
            }).catch(function() {
                new Notification(titre, {
                    body:message, icon:'./icone.svg'
                });
            });
        } else {
            new Notification(titre, {
                body:message, icon:'./icone.svg'
            });
        }
    } catch(e) {}
}

function notifResultatDisponible(score, total) {
    var pct = Math.round((score / total) * 100);
    envoyerNotif(
        'Ton résultat est disponible !',
        'Score : ' + score + '/' + total
        + ' (' + pct + '%)');
}

function notifBadge(emoji, nomBadge) {
    envoyerNotif(
        emoji + ' Badge débloqué !',
        'Félicitations ! Tu as obtenu : ' + nomBadge);
}

function surveillerDebutConcours() {
    if (timeoutNotif5min)
        clearTimeout(timeoutNotif5min);
    if (timeoutNotifDebut)
        clearTimeout(timeoutNotifDebut);

    ['configBepc', 'configBAC'].forEach(
        function(node) {
        db.ref(node).once('value')
            .then(function(snap) {
            var config = snap.val();
            if (!config || !config.debutTimestamp)
                return;
            var resteMs =
                config.debutTimestamp - Date.now();
            if (resteMs <= 0) return;
            var avant5min = resteMs - 300000;
            if (avant5min > 0) {
                setTimeout(function() {
                    envoyerNotif(
                        'Concours dans 5 minutes !',
                        'Prépare-toi. '
                        + 'Le concours Bonogo '
                        + 'commence bientôt.');
                    toast('Concours dans 5 min !',
                        'warning');
                    son('alerte');
                }, avant5min);
            }
            setTimeout(function() {
                envoyerNotif(
                    'Le concours commence !',
                    'Ouvre Concours Blanc Bonogo '
                    + 'et bonne chance !');
                toast('Le concours a commencé !',
                    'success');
                son('alerte');
            }, resteMs);
        }).catch(function() {});
    });
}

// === ÉVÉNEMENTS NAVIGATEUR ===
window.addEventListener('beforeunload',
    function(e) {
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

window.addEventListener('online', async function() {
    toast('Connexion rétablie !', 'success');
    ['bepc', 'bac'].forEach(async function(s) {
        var key =
            'bb_pending_' + s + '_' + user;
        var pending = localStorage.getItem(key);
        if (pending) {
            try {
                var data = JSON.parse(pending);
                var node = s === 'bepc'
                    ? 'resultatsBepc'
                    : 'resultatsBAC';
                await db.ref(node + '/' + user)
                    .set(data);
                localStorage.removeItem(key);
                toast('Résultat '
                    + s.toUpperCase()
                    + ' synchronisé !', 'success');
            } catch(e) {}
        }
    });
});

async function verifierEtatAuDemarrage() {
    if (!user) return;
    ['bepc', 'bac'].forEach(async function(s) {
        var key =
            'bb_pending_' + s + '_' + user;
        var pending = localStorage.getItem(key);
        if (pending && navigator.onLine) {
            try {
                var data = JSON.parse(pending);
                var node = s === 'bepc'
                    ? 'resultatsBepc'
                    : 'resultatsBAC';
                await db.ref(node + '/' + user)
                    .set(data);
                localStorage.removeItem(key);
            } catch(e) {}
        }
    });
}

// Écouter suppression résultats
['resultatsBepc', 'resultatsBAC'].forEach(
    function(node) {
    db.ref(node).on('child_removed', function(snap) {
        if (snap.key === user) {
            copieSubmise = false;
            toast('Nouveau concours disponible !',
                'success');
            son('success');
        }
    });
});

// Écouter Firebase temps réel
db.ref('sujetBepc').on('value', function(snap) {
    var data = snap.val();
    if (data && Array.isArray(data) && !enExamen
        && salleActive === 'bepc')
        questionsData = data;
});

db.ref('sujetBAC').on('value', function(snap) {
    var data = snap.val();
    if (data && Array.isArray(data) && !enExamen
        && salleActive === 'bac')
        questionsData = data;
});

// ============================================
// FIN PARTIE 14/15 ✅
// ============================================// ============================================
// PARTIE 15/15 — ENTRAÎNEMENT COMPLET
// ============================================

// === CONFIG MATIÈRES ===
var MATIERES_ENTR = {
    bepc: [
        { id:'bepc_maths',    label:'Mathématiques',
            emoji:'📐', css:'mat-maths'    },
        { id:'bepc_francais', label:'Français',
            emoji:'✍️', css:'mat-francais' },
        { id:'bepc_histgeo',  label:'Histoire-Géo',
            emoji:'📜', css:'mat-histoire' },
        { id:'bepc_svt',      label:'SVT',
            emoji:'🌿', css:'mat-svt'      },
        { id:'bepc_pc',       label:'Physique-Chimie',
            emoji:'⚡', css:'mat-pc'       },
        { id:'bepc_cg',       label:'Culture Générale',
            emoji:'🌐', css:'mat-cg'       },
        { id:'bepc_actu',     label:'Actualités',
            emoji:'📰', css:'mat-actu'     },
        { id:'bepc_info',     label:'Schycotech',
            emoji:'💻', css:'mat-info'     }
    ],
    bac: [
        { id:'bac_maths',    label:'Mathématiques',
            emoji:'📐', css:'mat-maths'    },
        { id:'bac_francais', label:'Français',
            emoji:'✍️', css:'mat-francais' },
        { id:'bac_histoire', label:'Histoire',
            emoji:'📜', css:'mat-histoire' },
        { id:'bac_geo',      label:'Géographie',
            emoji:'🌍', css:'mat-geo'      },
        { id:'bac_svt',      label:'SVT',
            emoji:'🌿', css:'mat-svt'      },
        { id:'bac_pc',       label:'Physique-Chimie',
            emoji:'⚡', css:'mat-pc'       },
        { id:'bac_cg',       label:'Culture Générale',
            emoji:'🌐', css:'mat-cg'       },
        { id:'bac_info',     label:'Schycotech',
            emoji:'💻', css:'mat-info'     },
        { id:'bac_philo',    label:'Philosophie',
            emoji:'💭', css:'mat-philo'    },
        { id:'bac_actu',     label:'Actualités',
            emoji:'📰', css:'mat-actu'     }
    ]
};

// === VARIABLES ENTRAÎNEMENT ===
var matiereActuelle    = '';
var questionsEntr      = [];
var indexQuestionEntr  = 0;
var scoreEntr          = 0;
var statsEntrainement  = {};
var sujetsEntrAdmin    = {};
var ongletActif        = 'bepc';

// === SWITCH ONGLET ===
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

// === ADMIN — GÉNÉRER AVEC CLAUDE ===
window.genererQuestionsIA = function(
    matiere, label, textareaId) {
    son('click');
    modalTitreEl.textContent =
        '✨ Générer avec Claude';
    modalTexteEl.innerHTML =
        '<p style="margin-bottom:14px;">'
        + 'Combien de questions pour <b>'
        + label + '</b> ?</p>'
        + '<div style="display:flex;'
        + 'flex-direction:column;gap:10px;">'
        + '<button id="gen10" style="padding:14px;'
        + 'background:linear-gradient('
        + '135deg,#3b82f6,#1d4ed8);color:white;'
        + 'border:none;border-radius:12px;'
        + 'font-family:Poppins,sans-serif;'
        + 'font-size:15px;font-weight:700;'
        + 'cursor:pointer;">10 questions</button>'
        + '<button id="gen20" style="padding:14px;'
        + 'background:linear-gradient('
        + '135deg,#8b5cf6,#7c3aed);color:white;'
        + 'border:none;border-radius:12px;'
        + 'font-family:Poppins,sans-serif;'
        + 'font-size:15px;font-weight:700;'
        + 'cursor:pointer;">20 questions</button>'
        + '<button id="gen30" style="padding:14px;'
        + 'background:linear-gradient('
        + '135deg,#1a6b3c,#22c55e);color:white;'
        + 'border:none;border-radius:12px;'
        + 'font-family:Poppins,sans-serif;'
        + 'font-size:15px;font-weight:700;'
        + 'cursor:pointer;">30 questions</button>'
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
        [10, 20, 30].forEach(function(nb) {
            var btn =
                document.getElementById('gen' + nb);
            if (btn) btn.onclick = function() {
                modalEl.style.display      = 'none';
                btnConfirmer.style.display = '';
                btnAnnuler.textContent     = 'Annuler';
                afficherInstructionsGeneration(
                    matiere, label, nb, textareaId);
            };
        });
    }, 100);
};

function afficherInstructionsGeneration(
    matiere, label, nb, textareaId) {
    var prompt =
        'Génère exactement ' + nb
        + ' questions QCM pour les examens '
        + 'et concours burkinabès '
        + '(ENSOA, IDS, ENAM, ENAREF, BEPC, BAC) '
        + 'en matière de ' + label + '.\n'
        + 'Format JSON strict :\n'
        + '[\n  {\n'
        + '    "texte": "La question",\n'
        + '    "reponses": [\n'
        + '      {"texte": "Rep A", "correct": false},\n'
        + '      {"texte": "Rep B", "correct": true},\n'
        + '      {"texte": "Rep C", "correct": false},\n'
        + '      {"texte": "Rep D", "correct": false}\n'
        + '    ],\n'
        + '    "explication": "Explication courte"\n'
        + '  }\n]\n'
        + 'Commence DIRECTEMENT par [';

    if (navigator.clipboard)
        navigator.clipboard.writeText(prompt)
            .catch(function() {});

    modalTitreEl.textContent =
        '✨ ' + nb + ' questions — ' + label;
    modalTexteEl.innerHTML =
        '<p style="font-size:13px;'
        + 'color:var(--muted);margin-bottom:14px;'
        + 'line-height:1.7;">'
        + '1️⃣ Copie ce prompt<br>'
        + '2️⃣ Colle dans <b>claude.ai</b>'
        + ' et envoie<br>'
        + '3️⃣ Reviens ici et colle le JSON'
        + '</p>'
        + '<button id="btnCopierPrompt" '
        + 'style="width:100%;padding:14px;'
        + 'background:linear-gradient('
        + '135deg,#8b5cf6,#7c3aed);color:white;'
        + 'border:none;border-radius:12px;'
        + 'font-family:Poppins,sans-serif;'
        + 'font-size:14px;font-weight:700;'
        + 'cursor:pointer;">'
        + '📋 Copier le prompt</button>';

    modalEl.style.display      = 'flex';
    btnConfirmer.style.display = 'none';
    btnAnnuler.textContent     = 'OK, je vais générer';
    btnAnnuler.onclick = function() {
        modalEl.style.display      = 'none';
        btnConfirmer.style.display = '';
        btnAnnuler.textContent     = 'Annuler';
        var ta = document.getElementById(textareaId);
        var btnC = document.getElementById(
            'btnChargerColle_' + matiere);
        if (ta) {
            ta.style.display = 'block';
            ta.placeholder   =
                'Colle ici les ' + nb
                + ' questions JSON générées...';
            ta.focus();
        }
        if (btnC) btnC.style.display = 'block';
    };

    setTimeout(function() {
        var btnCp =
            document.getElementById('btnCopierPrompt');
        if (btnCp) {
            btnCp.onclick = function() {
                if (navigator.clipboard)
                    navigator.clipboard
                        .writeText(prompt)
                        .then(function() {
                        toast('Prompt copié !',
                            'success');
                    });
            };
        }
    }, 100);
}

// === ADMIN — CHARGER DEPUIS TEXTAREA ===
window.chargerDepuisColle = function(
    matiere, textareaId, infoId) {
    son('click');
    var ta  = document.getElementById(textareaId);
    var infoEl = document.getElementById(infoId);
    if (!ta || !ta.value.trim()) {
        toast('Colle le JSON généré d\'abord',
            'error');
        return;
    }
    var data = chargerJSONGenerique(
        ta.value.trim());
    if (data.length > 0) {
        sujetsEntrAdmin[matiere] = data;
        if (infoEl) {
            infoEl.textContent =
                '✅ ' + data.length
                + ' questions chargées !';
            infoEl.style.color = 'var(--primary)';
        }
        toast(data.length
            + ' questions chargées !', 'success');
        son('success');
    }
};

// === ADMIN — CHARGER DEPUIS FICHIER ===
window.chargerSujetEntr = function(
    matiere, fileInputId, infoId) {
    var fileInput =
        document.getElementById(fileInputId);
    var infoEl = document.getElementById(infoId);
    if (!fileInput || !fileInput.files[0]) {
        toast('Choisis un fichier .json d\'abord',
            'error');
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var data = chargerJSONGenerique(
            e.target.result);
        if (data.length > 0) {
            sujetsEntrAdmin[matiere] = data;
            if (infoEl) {
                infoEl.textContent =
                    '✅ ' + data.length
                    + ' questions chargées';
                infoEl.style.color = 'var(--primary)';
            }
            toast(data.length
                + ' questions chargées !',
                'success');
            son('success');
        }
    };
    reader.readAsText(fileInput.files[0], 'UTF-8');
};

// === ADMIN — ENVOYER SUJET ===
window.envoyerSujetEntr = async function(
    matiere, infoId) {
    var infoEl = document.getElementById(infoId);
    if (!sujetsEntrAdmin[matiere]
        || sujetsEntrAdmin[matiere].length === 0) {
        toast('Charge les questions d\'abord !',
            'error');
        return;
    }
    try {
        await db.ref(
            'sujetsEntrainement/' + matiere)
            .set(sujetsEntrAdmin[matiere]);
        await db.ref(
            'sujetsEntrVersion/' + matiere)
            .set(Date.now());
        toast('Envoyé aux élèves !', 'success');
        son('success');
        if (infoEl) {
            infoEl.textContent = '🚀 Envoyé !';
            infoEl.style.color = 'var(--primary)';
        }
    } catch(e) {
        toast('Erreur envoi : ' + e.message, 'error');
    }
};

// === CANDIDAT — AFFICHER PAGE ENTRAÎNEMENT ===
async function afficherPageEntrainement() {
    showPage(
        document.getElementById('page-entrainement'));
    ongletActif = 'bepc';
    switchOngletEntr('bepc');

    try {
        var snap = await db.ref(
            'entrainement/' + user).once('value');
        statsEntrainement = snap.val() || {};
    } catch(e) {
        statsEntrainement = {};
    }

    var totalBon = 0, totalAll = 0;
    Object.keys(statsEntrainement).forEach(
        function(k) {
        var s = statsEntrainement[k];
        if (s && s.total > 0) {
            totalBon += s.bon;
            totalAll += s.total;
        }
    });
    var pctGlobal = totalAll > 0
        ? Math.round((totalBon / totalAll) * 100)
        : 0;
    var sGEl =
        document.getElementById('entrScoreGlobal');
    var pGEl =
        document.getElementById('entrProgressGlobal');
    if (sGEl) sGEl.textContent = pctGlobal + '%';
    if (pGEl) pGEl.style.width = pctGlobal + '%';

    try {
        var snapMat = await db.ref(
            'sujetsEntrainement').once('value');
        var matDispos = snapMat.val() || {};
        var snapVer = await db.ref(
            'sujetsEntrVersion').once('value');
        var versions = snapVer.val() || {};
        chargerGrilleNiveau(
            'bepc', matDispos, versions);
        chargerGrilleNiveau(
            'bac',  matDispos, versions);
    } catch(e) {
        var msg =
            '<div style="grid-column:1/-1;'
            + 'text-align:center;padding:30px;'
            + 'color:var(--red);">'
            + 'Erreur. Vérifie ta connexion.</div>';
        ['grilleBepc','grilleBac'].forEach(
            function(id) {
            var g = document.getElementById(id);
            if (g) g.innerHTML = msg;
        });
    }
}

// === CHARGER GRILLE NIVEAU ===
function chargerGrilleNiveau(niveau,
    matDispos, versions) {
    var grille = document.getElementById(
        niveau === 'bepc'
        ? 'grilleBepc' : 'grilleBac');
    if (!grille) return;
    grille.innerHTML = '';
    var liste  = MATIERES_ENTR[niveau];
    var aucune = true;

    liste.forEach(function(mat) {
        var qRaw = matDispos[mat.id];
        var nb   = qRaw
            ? (Array.isArray(qRaw)
                ? qRaw.length
                : Object.keys(qRaw).length)
            : 0;
        if (nb === 0) return;
        aucune = false;

        var stats = statsEntrainement[mat.id]
            || { bon:0, total:0, indexActuel:0 };
        var pct = stats.total > 0
            ? Math.round(
                (stats.bon / stats.total) * 100)
            : 0;
        var pctColor = pct >= 70 ? 'var(--primary)'
            : pct >= 40 ? 'var(--orange)'
            : 'var(--red)';
        var vSrv = versions[mat.id] || 0;
        var vLoc = stats.version    || 0;
        var nouveau = vSrv > vLoc;
        var idx     = stats.indexActuel || 0;
        var termine = idx >= nb && !nouveau;

        var badge = '';
        if (nouveau) {
            badge =
                '<span style="position:absolute;'
                + 'top:10px;right:10px;'
                + 'background:rgba(249,115,22,0.15);'
                + 'border:1px solid '
                + 'rgba(249,115,22,0.4);'
                + 'border-radius:20px;'
                + 'padding:3px 8px;'
                + 'font-size:10px;font-weight:800;'
                + 'color:var(--orange);">'
                + '🆕 Nouveau</span>';
        } else if (termine) {
            badge =
                '<span style="position:absolute;'
                + 'top:10px;right:10px;'
                + 'background:rgba(26,107,60,0.1);'
                + 'border:1px solid '
                + 'rgba(26,107,60,0.3);'
                + 'border-radius:20px;'
                + 'padding:3px 8px;'
                + 'font-size:10px;font-weight:800;'
                + 'color:var(--primary);">'
                + '✅ Terminé</span>';
        } else if (idx > 0) {
            badge =
                '<span style="position:absolute;'
                + 'top:10px;right:10px;'
                + 'background:rgba(59,130,246,0.1);'
                + 'border:1px solid '
                + 'rgba(59,130,246,0.3);'
                + 'border-radius:20px;'
                + 'padding:3px 8px;'
                + 'font-size:10px;font-weight:800;'
                + 'color:var(--blue);">'
                + '▶ Continuer</span>';
        }

        var card = document.createElement('button');
        card.className = 'matiere-card ' + mat.css;
        card.innerHTML =
            badge
            + '<span class="matiere-emoji">'
            + mat.emoji + '</span>'
            + '<span class="matiere-nom">'
            + mat.label + '</span>'
            + '<span class="matiere-nb">'
            + (termine ? '✅ Toutes faites'
                : idx > 0
                ? (idx + '/' + nb + ' faites')
                : (nb + ' question'
                    + (nb > 1 ? 's' : '')))
            + '</span>'
            + (stats.total > 0
                ? '<span class="matiere-score-pct"'
                + ' style="color:' + pctColor
                + ';top:auto;bottom:12px;">'
                + pct + '%</span>'
                : '')
            + '<div class="matiere-score-bar">'
            + '<div class="matiere-score-fill"'
            + ' style="width:'
            + (stats.total > 0 ? pct : 0)
            + '%;background:' + pctColor
            + '"></div></div>';

        card.onclick = function() {
            son('click');
            var questions = Array.isArray(qRaw)
                ? qRaw : Object.values(qRaw);
            if (termine) {
                afficherModalFinMatiere(
                    mat, questions, vSrv);
            } else {
                lancerQuizMatiere(
                    mat, questions, idx, vSrv);
            }
        };
        grille.appendChild(card);
    });

    if (aucune) {
        grille.innerHTML =
            '<div style="grid-column:1/-1;'
            + 'text-align:center;padding:30px 20px;">'
            + '<div style="font-size:40px;'
            + 'margin-bottom:10px;">📚</div>'
            + '<p style="font-weight:700;'
            + 'color:var(--text);margin-bottom:6px;">'
            + 'Aucun sujet disponible</p>'
            + '<p style="color:var(--muted);'
            + 'font-size:12px;">'
            + 'L\'admin doit charger les questions.'
            + '</p></div>';
    }
}

// === MODAL FIN MATIÈRE ===
function afficherModalFinMatiere(mat, questions,
    versionServeur) {
    modalTitreEl.textContent =
        '✅ ' + mat.label + ' terminé !';
    modalTexteEl.innerHTML =
        '<div style="text-align:center;">'
        + '<div style="font-size:48px;'
        + 'margin-bottom:10px;">🎉</div>'
        + '<p style="font-weight:700;'
        + 'color:var(--text);margin-bottom:6px;">'
        + 'Tu as fait toutes les questions !</p>'
        + '<p style="color:var(--muted);'
        + 'font-size:13px;line-height:1.6;'
        + 'margin-bottom:14px;">'
        + 'L\'admin va bientôt charger '
        + 'de nouveaux sujets.</p>'
        + '</div>';
    modalEl.style.display      = 'flex';
    btnAnnuler.textContent     = '← Retour';
    btnConfirmer.style.display = 'block';
    btnConfirmer.textContent   =
        '🔄 Recommencer à zéro';
    btnConfirmer.style.background =
        'linear-gradient(135deg,#f97316,#ea580c)';

    btnConfirmer.onclick = async function() {
        modalEl.style.display           = 'none';
        btnConfirmer.textContent        = 'Confirmer';
        btnConfirmer.style.background   = '';
        btnAnnuler.textContent          = 'Annuler';
        if (user) {
            try {
                await db.ref(
                    'entrainement/' + user
                    + '/' + mat.id).update({
                    indexActuel: 0,
                    bon:         0,
                    total:       0,
                    version:     versionServeur
                });
                statsEntrainement[mat.id] = {
                    bon:0, total:0,
                    indexActuel:0,
                    version:versionServeur
                };
            } catch(e) {}
        }
        lancerQuizMatiere(
            mat, questions, 0, versionServeur);
    };

    btnAnnuler.onclick = function() {
        modalEl.style.display           = 'none';
        btnConfirmer.textContent        = 'Confirmer';
        btnConfirmer.style.background   = '';
        btnAnnuler.textContent          = 'Annuler';
    };
}

// === LANCER QUIZ PAR MATIÈRE ===
function lancerQuizMatiere(mat, questionsRaw,
    startIndex, versionServeur) {
    matiereActuelle   = mat.id;
    questionsEntr     = Array.isArray(questionsRaw)
        ? questionsRaw
        : Object.values(questionsRaw);
    indexQuestionEntr = startIndex || 0;
    scoreEntr         = 0;

    if (user && versionServeur) {
        db.ref('entrainement/' + user
            + '/' + mat.id)
            .update({ version:versionServeur })
            .catch(function() {});
    }

    var nomEl =
        document.getElementById('quizMatiereNom');
    if (nomEl)
        nomEl.textContent =
            mat.emoji + ' ' + mat.label;

    showPage(
        document.getElementById('page-quiz-entr'));
    afficherQuestionEntr();
        }// === AFFICHER QUESTION ===
function afficherQuestionEntr() {
    var total = questionsEntr.length;
    var idx   = indexQuestionEntr;
    var q     = questionsEntr[idx];
    if (!q) { terminerQuizEntr(); return; }

    var pct = Math.round((idx / total) * 100);
    var fillEl =
        document.getElementById('quizProgressFill');
    var txtEl =
        document.getElementById('quizProgressTxt');
    var numEl =
        document.getElementById('quizQNum');
    var texteEl =
        document.getElementById('quizQTexte');
    var feedbackEl =
        document.getElementById('quizFeedback');
    var reponsesEl =
        document.getElementById('quizReponses');
    var scoreBadgeEl =
        document.getElementById('quizScoreBadge');

    if (fillEl)
        fillEl.style.width = pct + '%';
    if (txtEl)
        txtEl.textContent =
            'Q' + (idx+1) + '/' + total;
    if (numEl)
        numEl.textContent = 'Question ' + (idx+1);
    if (texteEl)
        texteEl.textContent = q.texte || '';
    if (feedbackEl)
        feedbackEl.style.display = 'none';
    if (scoreBadgeEl)
        scoreBadgeEl.textContent = scoreEntr + ' ✅';

    if (!reponsesEl) return;
    reponsesEl.innerHTML = '';

    (q.reponses || []).forEach(function(r, ri) {
        if (!r.texte) return;
        var btn = document.createElement('button');
        btn.className = 'quiz-rep-btn';
        btn.innerHTML =
            '<span class="quiz-rep-lettre">'
            + 'ABCD'[ri] + '</span>'
            + '<span>' + (r.texte||'') + '</span>';
        btn.onclick = function() {
            validerReponseEntr(ri, q);
        };
        reponsesEl.appendChild(btn);
    });

    var card =
        document.getElementById('quizQuestionCard');
    if (card) {
        card.style.animation = 'none';
        card.offsetHeight;
        card.style.animation = 'fadeUp 0.3s ease';
    }
    window.scrollTo({ top:0, behavior:'smooth' });
}

// === VALIDER RÉPONSE ===
function validerReponseEntr(riChoisi, q) {
    son('click');
    var bonnesReponses = [];
    (q.reponses||[]).forEach(function(r, ri) {
        if (r.correct) bonnesReponses.push(ri);
    });
    var estBonne =
        bonnesReponses.indexOf(riChoisi) !== -1;

    document.querySelectorAll('.quiz-rep-btn')
        .forEach(function(btn, ri) {
        btn.disabled = true;
        if (ri === riChoisi && estBonne)
            btn.classList.add('correct');
        else if (ri === riChoisi && !estBonne)
            btn.classList.add('incorrect');
        else if (bonnesReponses.indexOf(ri) !== -1)
            btn.classList.add('manquee');
    });

    if (estBonne) {
        scoreEntr++;
        son('entr_success');
    } else {
        son('entr_error');
    }

    var feedbackEl =
        document.getElementById('quizFeedback');
    var feedIco =
        document.getElementById('quizFeedbackIco');
    var feedTxt =
        document.getElementById('quizFeedbackTxt');
    var feedExpl =
        document.getElementById('quizExplication');
    var scoreBadgeEl =
        document.getElementById('quizScoreBadge');

    if (scoreBadgeEl)
        scoreBadgeEl.textContent = scoreEntr + ' ✅';
    if (feedIco)
        feedIco.textContent = estBonne ? '✅' : '❌';
    if (feedTxt) {
        feedTxt.textContent = estBonne
            ? 'Bonne réponse !'
            : 'Mauvaise réponse !';
        feedTxt.style.color = estBonne
            ? 'var(--primary)' : 'var(--red)';
    }
    if (feedExpl)
        feedExpl.textContent = q.explication
            || 'Consulte ton cours pour cette réponse.';
    if (feedbackEl)
        feedbackEl.style.display = 'block';

    indexQuestionEntr++;

    if (user) {
        var ancien =
            statsEntrainement[matiereActuelle]
            || { bon:0, total:0 };
        var update = {
            bon:         ancien.bon
                + (estBonne ? 1 : 0),
            total:       ancien.total + 1,
            indexActuel: indexQuestionEntr,
            lastDate:    Date.now()
        };
        statsEntrainement[matiereActuelle] = update;
        db.ref('entrainement/' + user
            + '/' + matiereActuelle)
            .update(update)
            .catch(function() {});
    }

    setTimeout(function() {
        if (feedbackEl)
            feedbackEl.scrollIntoView({
                behavior:'smooth', block:'nearest'
            });
    }, 100);
}

// === BOUTON SUIVANT ===
var btnQuizSuivant =
    document.getElementById('btnQuizSuivant');
if (btnQuizSuivant) {
    btnQuizSuivant.onclick = function() {
        son('click');
        if (indexQuestionEntr
            >= questionsEntr.length)
            terminerQuizEntr();
        else
            afficherQuestionEntr();
    };
}

// === TERMINER QUIZ ===
async function terminerQuizEntr() {
    var stats =
        statsEntrainement[matiereActuelle]
        || { bon:0, total:0 };
    var bon   = stats.bon   || scoreEntr;
    var total = stats.total || questionsEntr.length;
    var faux  = total - bon;
    var pct   = total > 0
        ? Math.round((bon / total) * 100) : 0;
    var xpGain = scoreEntr * 2;

    if (xpGain > 0 && user) {
        try {
            var xpActuel = userData.xp || 0;
            var newXp    = xpActuel + xpGain;
            var newNiv   =
                Math.floor(newXp / 100) + 1;
            await db.ref('users/' + user).update({
                xp:newXp, niveau:newNiv
            });
            userData.xp     = newXp;
            userData.niveau = newNiv;
        } catch(e) {}
    }

    var matConfig = null;
    ['bepc','bac'].forEach(function(niv) {
        MATIERES_ENTR[niv].forEach(function(m) {
            if (m.id === matiereActuelle)
                matConfig = m;
        });
    });
    if (!matConfig)
        matConfig = {
            label:matiereActuelle, emoji:'📝'
        };

    var emoji   = pct >= 80 ? '🎉'
        : pct >= 60 ? '👍'
        : pct >= 40 ? '💪' : '📚';
    var mention = pct >= 80 ? 'Excellent !'
        : pct >= 60 ? 'Bien !'
        : pct >= 40 ? 'À améliorer'
        : 'Continue tes efforts !';
    var mColor  = pct >= 80 ? 'var(--primary)'
        : pct >= 60 ? '#ca8a04'
        : pct >= 40 ? 'var(--orange)' : 'var(--red)';
    var conseil = pct >= 80
        ? '🌟 Excellent ! Tu maîtrises bien '
        + matConfig.label + '. Continue !'
        : pct >= 60
        ? '👍 Bon niveau ! Revois les questions ratées.'
        : pct >= 40
        ? '💪 Tu progresses. Relis tes cours !'
        : '📚 Cette matière nécessite du travail. '
        + 'Recommence !';

    var emojiEl =
        document.getElementById('entrResultatEmoji');
    var titreEl =
        document.getElementById('entrResultatTitre');
    var scoreEl2 =
        document.getElementById('entrScoreFinal');
    var pctEl =
        document.getElementById('entrPctFinal');
    var mentionEl =
        document.getElementById('entrMention');
    var bonEl =
        document.getElementById('entrNbBon');
    var fauxEl =
        document.getElementById('entrNbFaux');
    var xpEl2 =
        document.getElementById('entrXpGagne');
    var conseilEl =
        document.getElementById('entrConseil');

    if (emojiEl)   emojiEl.textContent   = emoji;
    if (titreEl)   titreEl.textContent   = matConfig.label;
    if (scoreEl2)  scoreEl2.textContent  = bon+'/'+total;
    if (pctEl)     pctEl.textContent     = pct+'%';
    if (mentionEl) {
        mentionEl.textContent      = mention;
        mentionEl.style.background = mColor + '18';
        mentionEl.style.color      = mColor;
    }
    if (bonEl)     bonEl.textContent     = bon;
    if (fauxEl)    fauxEl.textContent    = faux;
    if (xpEl2)     xpEl2.textContent     = '+' + xpGain;
    if (conseilEl) conseilEl.textContent = conseil;

    showPage(
        document.getElementById('page-resultat-entr'));
    son('entr_fin');
}

// === NAVIGATION ENTRAÎNEMENT ===
var btnRetourMenuEntr =
    document.getElementById('btnRetourMenuEntr');
if (btnRetourMenuEntr) {
    btnRetourMenuEntr.onclick = function() {
        son('click'); chargerMenu(userData);
    };
}

var btnQuitterQuiz =
    document.getElementById('btnQuitterQuiz');
if (btnQuitterQuiz) {
    btnQuitterQuiz.onclick = function() {
        son('click');
        modalTitreEl.textContent = 'Quitter le quiz ?';
        modalTexteEl.innerHTML =
            '<p style="color:var(--muted);">'
            + 'Ta progression est sauvegardée.<br>'
            + 'Tu pourras continuer plus tard.</p>';
        modalEl.style.display = 'flex';
        btnConfirmer.onclick = function() {
            modalEl.style.display = 'none';
            afficherPageEntrainement();
        };
        btnAnnuler.onclick = function() {
            modalEl.style.display = 'none';
        };
    };
}

var btnRecommencer =
    document.getElementById('btnRecommencer');
if (btnRecommencer) {
    btnRecommencer.onclick = async function() {
        son('click');
        var mat = null;
        ['bepc','bac'].forEach(function(niv) {
            MATIERES_ENTR[niv].forEach(function(m) {
                if (m.id === matiereActuelle)
                    mat = m;
            });
        });
        if (!mat) return;
        if (user) {
            try {
                await db.ref(
                    'entrainement/' + user
                    + '/' + matiereActuelle).update({
                    indexActuel:0, bon:0, total:0
                });
                statsEntrainement[matiereActuelle] =
                    { bon:0, total:0, indexActuel:0 };
            } catch(e) {}
        }
        try {
            var snap = await db.ref(
                'sujetsEntrainement/'
                + matiereActuelle).once('value');
            var data = snap.val();
            if (data)
                lancerQuizMatiere(mat, data, 0, 0);
        } catch(e) {
            toast('Erreur chargement', 'error');
        }
    };
}

var btnAutreMatiere =
    document.getElementById('btnAutreMatiere');
if (btnAutreMatiere) {
    btnAutreMatiere.onclick = function() {
        son('click');
        afficherPageEntrainement();
    };
}

var btnRetourMenuEntrRes =
    document.getElementById('btnRetourMenuEntrRes');
if (btnRetourMenuEntrRes) {
    btnRetourMenuEntrRes.onclick = function() {
        son('click'); chargerMenu(userData);
    };
}

// ============================================
console.log(
    'Concours Blanc Bonogo — 2 Salles v3 ✅');
// ============================================
// FIN PARTIE 15/15 — SCRIPT COMPLET ✅
// ============================================
