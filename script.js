// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V5 FINAL
// PARTIE 1/8 : FIREBASE + SPLASH + VARIABLES + UTILS
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
var user          = null;
var userDisplay   = '';
var userData      = {};
var questionsData = [];
var reponsesUser  = {};
var finTimestamp  = 0;
var timerInt      = null;
var presenceRef   = null;
var audioCtx      = null;
var sujetActuel   = [];
var alertesTimer  = {30:false, 20:false, 10:false, 5:false};
var copieSubmise  = false;
var reponsesFinales = {};

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

function son(type) {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var o = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.frequency.value = type === 'click' ? 800 : type === 'success' ? 1200 : 300;
        g.gain.value = 0.1;
        o.start(); o.stop(audioCtx.currentTime + 0.1);
    } catch(e) {}
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

// === FIN PARTIE 1/8 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V5 FINAL
// PARTIE 2/8 : CONNEXION + INSCRIPTION + RESET MDP
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
        historique: [], dateInscription: Date.now()
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
    nomMenu.textContent = 'Salut ' + userDisplay + '!';
    niv.textContent    = d.niveau;
    xp.textContent     = d.xp;
    streak.textContent = d.streak;
    showPage(pageMenu);
}

// === DÉCONNEXION ===
btnLogout.onclick = function() {
    son('click');
    if (presenceRef) presenceRef.remove();
    if (timerInt) clearInterval(timerInt);
    user = null; userDisplay = ''; userData = {};
    copieSubmise = false; reponsesFinales = {};
    email.value=''; mdp.value='';
    showPage(pageAccueil);
};

// === FIN PARTIE 2/8 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V5 FINAL
// PARTIE 3/8 : PRESENCE + ADMIN LOGIN + BADGES + CLASSEMENT
// ============================================

// === PRÉSENCE EN LIGNE ===
function startPresence() {
    if (presenceRef) presenceRef.remove();
    presenceRef = db.ref('online/' + user);
    presenceRef.set(true);
    presenceRef.onDisconnect().remove();
    db.ref('online').on('value', snap => {
        var count = snap.numChildren();
        if (enLigne)       enLigne.textContent       = '🟢 ' + count;
        if (onlineCount)   onlineCount.textContent   = count;
        if (statOnline)    statOnline.textContent    = count;
        if (onlineAttente) onlineAttente.textContent = count;
    });
}

// === ADMIN LOGIN ===
btnAdmin.onclick    = function() { son('click'); showPage(pageAdminLogin); };
btnRetour.onclick   = function() { son('click'); showPage(pageAccueil); };
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
btnLogoutAdmin.onclick = function() { son('click'); showPage(pageAccueil); };

// === BADGES ===
btnBadges.onclick = async function() {
    son('click');
    var snap = await db.ref('users/' + user + '/badges').once('value');
    var badges = snap.val() || {};

    var badgeList = [
        { key:'premier',  emoji:'🎯', nom:'Premier Concours',  desc:'Terminer son 1er concours' },
        { key:'streak7',  emoji:'🔥', nom:'Série 7 jours',     desc:'7 jours consécutifs connecté' },
        { key:'niveau10', emoji:'⭐', nom:'Niveau 10',          desc:'Atteindre le niveau 10' },
        { key:'perfect',  emoji:'💯', nom:'Sans Faute',         desc:'Obtenir 50/50' },
        { key:'rapide',   emoji:'⚡', nom:'Éclair',             desc:'Finir avec +1h restante' },
        { key:'assidu',   emoji:'📅', nom:'Assidu',             desc:'5 concours ou plus passés' },
        { key:'top3',     emoji:'🏅', nom:'Top 3',              desc:'Être dans le top 3 général' },
        { key:'elite',    emoji:'👑', nom:'Élite',              desc:'Moyenne supérieure à 40/50' }
    ];

    var nbObtenu = badgeList.filter(b => badges[b.key]).length;

    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:999;overflow-y:auto;padding:15px';
    overlay.innerHTML = `
        <div style="max-width:600px;margin:0 auto">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid var(--border)">
                <button onclick="this.closest('div[style]').remove()" style="background:var(--border);color:var(--text);padding:10px 18px;border-radius:10px;font-size:14px;font-weight:700;min-height:auto;width:auto;margin:0">←</button>
                <h2 style="margin:0">🎖️ Mes Badges</h2>
            </div>
            <div class="card center" style="margin-bottom:15px">
                <div style="font-size:40px;margin-bottom:10px">🎖️</div>
                <div style="font-size:28px;font-weight:900;color:var(--yellow)">${nbObtenu}/${badgeList.length}</div>
                <div style="color:var(--muted);font-size:14px">badges obtenus</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
                ${badgeList.map(b => {
                    var has = badges[b.key];
                    return `<div style="background:var(--card);border:2px solid ${has ? 'var(--yellow)' : 'var(--border)'};border-radius:14px;padding:15px;text-align:center;${has ? 'background:rgba(250,204,21,0.07)' : ''}">
                        <div style="font-size:36px;margin-bottom:8px">${b.emoji}</div>
                        <div style="font-size:13px;font-weight:700;margin-bottom:4px">${b.nom}</div>
                        <div style="font-size:11px;color:var(--muted)">${b.desc}</div>
                        <span style="display:inline-block;margin-top:8px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${has ? 'rgba(250,204,21,0.2)' : 'rgba(148,163,184,0.1)'};color:${has ? 'var(--yellow)' : 'var(--muted)'}">${has ? '✅ Obtenu' : '🔒 Verrouillé'}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    document.body.appendChild(overlay);
};

// === CLASSEMENT ANIMÉ ===
btnClassement.onclick = async function() {
    son('click');

    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:999;overflow-y:auto;padding:15px';
    overlay.innerHTML = `
        <div style="max-width:600px;margin:0 auto">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid var(--border)">
                <button onclick="this.closest('div[style]').remove()" style="background:var(--border);color:var(--text);padding:10px 18px;border-radius:10px;font-size:14px;font-weight:700;min-height:auto;width:auto;margin:0">←</button>
                <h2 style="margin:0">🏆 Classement Général</h2>
            </div>
            <div id="clContent" style="text-align:center;padding:30px">
                <div class="loader"></div>
                <p style="color:var(--muted);margin-top:10px">Chargement...</p>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    var snap = await db.ref('resultats').orderByChild('score').limitToLast(50).once('value');
    var results = [];
    snap.forEach(child => results.push({ key: child.key, ...child.val() }));
    results.sort((a, b) => b.score - a.score || a.timestamp - b.timestamp);

    var snapAll = await db.ref('users').once('value');
    var total = snapAll.numChildren();
    var monIdx = results.findIndex(r => r.key === user);

    var clContent = overlay.querySelector('#clContent');

    if (results.length === 0) {
        clContent.innerHTML = `<div style="font-size:60px;margin-bottom:15px">🏆</div>
            <p style="color:var(--muted);font-size:16px">Aucun résultat pour l'instant</p>`;
        return;
    }

    // Mon rang
    var monRangHtml = '';
    if (monIdx >= 0) {
        monRangHtml = `<div style="background:linear-gradient(135deg,rgba(250,204,21,.15),rgba(249,115,22,.1));border:2px solid var(--yellow);border-radius:14px;padding:15px 20px;margin-bottom:15px;text-align:center;font-weight:700">
            Ma position: <span style="font-size:32px;font-weight:900;color:var(--yellow);display:block">#${monIdx+1}</span>
            <small style="color:var(--muted);font-size:13px">sur ${total} candidats inscrits</small>
        </div>`;
    }

    // Liste animée
    var lignes = results.map((r, i) => {
        var isMe = r.key === user;
        var med = i===0?'🥇':i===1?'🥈':i===2?'🥉':`<span style="font-size:15px;font-weight:800">#${i+1}</span>`;
        var pct = Math.round((r.score/50)*100);
        return `<div class="cl-item" style="display:flex;justify-content:space-between;align-items:center;background:${isMe?'linear-gradient(135deg,rgba(250,204,21,.15),rgba(249,115,22,.1))':'var(--bg)'};padding:14px 15px;border-radius:12px;margin-bottom:8px;border:2px solid ${isMe?'var(--yellow)':'var(--border)'};font-weight:600;opacity:0;transform:translateX(-20px);transition:all 0.3s ease ${i*0.05}s">
            <span style="font-size:20px;font-weight:900;color:var(--yellow);min-width:40px">${med}</span>
            <div style="flex:1;margin:0 10px">
                <div>${r.prenom} ${r.nom} ${isMe?'<span style="color:var(--yellow);font-size:11px">◀ Moi</span>':''}</div>
                <div style="font-size:11px;color:var(--muted)">${pct}% · ${r.bonnes||0}✅ ${r.partielles||0}⚠️ ${r.fausses||0}❌</div>
            </div>
            <span style="font-size:17px;font-weight:800;color:${isMe?'var(--yellow)':'var(--green)'}">${r.score}/50</span>
        </div>`;
    }).join('');

    clContent.innerHTML = monRangHtml + lignes;

    // Animation entrée
    setTimeout(() => {
        overlay.querySelectorAll('.cl-item').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateX(0)';
        });
    }, 100);
};

// === HISTORIQUE ===
async function afficherHistorique() {
    son('click');
    var snap = await db.ref('users/' + user + '/historique').once('value');
    var histo = snap.val() || [];
    if (!Array.isArray(histo)) histo = Object.values(histo);
    histo.sort((a, b) => b.timestamp - a.timestamp);

    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:999;overflow-y:auto;padding:15px';

    var contenu = histo.length === 0
        ? `<div style="text-align:center;padding:40px;color:var(--muted)">
            <div style="font-size:60px;margin-bottom:15px">📋</div>
            <div style="font-size:16px;font-weight:700">Aucun concours passé</div>
            <div style="font-size:14px;margin-top:8px">Lance ton premier concours !</div>
           </div>`
        : histo.map(h => {
            var note = parseFloat(h.score);
            var pct  = Math.round((note/50)*100);
            var color = pct>=70?'var(--green)':pct>=50?'var(--yellow)':'var(--red)';
            var emoji = pct>=70?'🟢':pct>=50?'🟡':'🔴';
            return `<div style="background:var(--card);border:2px solid var(--border);border-radius:14px;padding:15px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
                <div style="flex:1">
                    <div style="font-size:12px;color:var(--muted);font-weight:600">${formatDate(h.timestamp)}</div>
                    <div style="font-size:15px;font-weight:700;margin:3px 0">${h.type||'Concours Blanc Bonogo'}</div>
                    <div style="font-size:13px;color:var(--muted)">${emoji} ${h.bonnes||0} bonnes · ⚠️ ${h.partielles||0} partielles · ❌ ${h.fausses||0} fausses</div>
                    <div style="font-size:12px;color:var(--purple);font-weight:700;margin-top:4px">+${h.xp||0} XP gagné</div>
                </div>
                <div style="text-align:right">
                    <div style="font-size:26px;font-weight:900;color:${color}">${note}/50</div>
                    <div style="font-size:12px;color:var(--muted);font-weight:700">${pct}%</div>
                </div>
            </div>`;
        }).join('');

    overlay.innerHTML = `
        <div style="max-width:600px;margin:0 auto">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid var(--border)">
                <button onclick="this.closest('div[style]').remove()" style="background:var(--border);color:var(--text);padding:10px 18px;border-radius:10px;font-size:14px;font-weight:700;min-height:auto;width:auto;margin:0">←</button>
                <h2 style="margin:0">📋 Mon Historique</h2>
            </div>
            ${contenu}
        </div>`;
    document.body.appendChild(overlay);
}

// === STATS ===
async function afficherStats() {
    son('click');
    var snap = await db.ref('users/' + user).once('value');
    var d = snap.val() || {};
    var histo = d.historique || [];
    if (!Array.isArray(histo)) histo = Object.values(histo);

    var total  = histo.length;
    var scores = histo.map(h => parseFloat(h.score)||0);
    var moy    = total>0?(scores.reduce((a,b)=>a+b,0)/total).toFixed(1):0;
    var best   = total>0?Math.max(...scores):0;
    var worst  = total>0?Math.min(...scores):0;
    var reussis= scores.filter(s=>s>=25).length;
    var taux   = total>0?Math.round((reussis/total)*100):0;
    var xpActuel = d.xp||0;
    var xpCourant = xpActuel%100;
    var pctNiv = Math.min(100, xpCourant);
    var niveauActuel = d.niveau||1;

    var graphe = total>1 ? `
        <div class="card">
            <h2 style="margin-bottom:15px">📈 Évolution (10 derniers)</h2>
            <div style="display:flex;align-items:flex-end;gap:4px;height:100px;padding:15px 0 5px">
                ${scores.slice(-10).map(s => {
                    var h = Math.max(8,Math.round((s/50)*100));
                    var c = s>=35?'var(--green)':s>=25?'var(--yellow)':'var(--red)';
                    return `<div style="flex:1;background:${c};height:${h}%;border-radius:4px 4px 0 0;position:relative;min-height:8px">
                        <div style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:9px;color:var(--muted)">${s}</div>
                    </div>`;
                }).join('')}
            </div>
            <div style="text-align:center;font-size:13px;color:var(--muted);margin-top:8px">
                Progression: <b style="color:${scores[scores.length-1]>=scores[0]?'var(--green)':'var(--red)'}">${scores[scores.length-1]>=scores[0]?'+':''}${(scores[scores.length-1]-scores[0]).toFixed(1)} pts</b>
            </div>
        </div>` : '';

    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:999;overflow-y:auto;padding:15px';
    overlay.innerHTML = `
        <div style="max-width:600px;margin:0 auto">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid var(--border)">
                <button onclick="this.closest('div[style]').remove()" style="background:var(--border);color:var(--text);padding:10px 18px;border-radius:10px;font-size:14px;font-weight:700;min-height:auto;width:auto;margin:0">←</button>
                <h2 style="margin:0">📊 Mes Statistiques</h2>
            </div>
            <div class="card">
                <h2 style="margin-bottom:15px">⚡ Niveau & XP</h2>
                <div style="text-align:center;margin-bottom:10px">
                    <span style="font-size:42px;font-weight:900;color:var(--yellow)">Niv. ${niveauActuel}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);font-weight:600">
                    <span>${xpCourant}/100 XP</span><span>→ Niv. ${niveauActuel+1}</span>
                </div>
                <div style="background:var(--border);border-radius:10px;height:12px;margin:8px 0 4px;overflow:hidden">
                    <div style="height:100%;background:linear-gradient(90deg,var(--yellow),var(--orange));border-radius:10px;width:${pctNiv}%;transition:width .6s ease"></div>
                </div>
                <div style="text-align:center;font-size:13px;color:var(--muted);font-weight:600">${pctNiv}% vers niveau suivant · Total: ${xpActuel} XP</div>
            </div>
            <div class="card">
                <h2 style="margin-bottom:15px">🎯 Performances</h2>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">
                    <div style="background:var(--bg);border:2px solid var(--border);border-radius:14px;padding:18px;text-align:center">
                        <span style="font-size:28px;font-weight:900;color:var(--yellow);display:block;margin-bottom:4px">${total}</span>
                        <span style="font-size:12px;color:var(--muted);font-weight:600">Concours passés</span>
                    </div>
                    <div style="background:var(--bg);border:2px solid var(--border);border-radius:14px;padding:18px;text-align:center">
                        <span style="font-size:28px;font-weight:900;color:var(--yellow);display:block;margin-bottom:4px">${moy}/50</span>
                        <span style="font-size:12px;color:var(--muted);font-weight:600">Score moyen</span>
                    </div>
                    <div style="background:var(--bg);border:2px solid var(--border);border-radius:14px;padding:18px;text-align:center">
                        <span style="font-size:28px;font-weight:900;color:var(--yellow);display:block;margin-bottom:4px">${best}/50</span>
                        <span style="font-size:12px;color:var(--muted);font-weight:600">Meilleur score</span>
                    </div>
                    <div style="background:var(--bg);border:2px solid var(--border);border-radius:14px;padding:18px;text-align:center">
                        <span style="font-size:28px;font-weight:900;color:var(--yellow);display:block;margin-bottom:4px">${taux}%</span>
                        <span style="font-size:12px;color:var(--muted);font-weight:600">Taux réussite</span>
                    </div>
                    <div style="background:var(--bg);border:2px solid var(--border);border-radius:14px;padding:18px;text-align:center">
                        <span style="font-size:28px;font-weight:900;color:var(--yellow);display:block;margin-bottom:4px">${worst}/50</span>
                        <span style="font-size:12px;color:var(--muted);font-weight:600">Score le plus bas</span>
                    </div>
                    <div style="background:var(--bg);border:2px solid var(--border);border-radius:14px;padding:18px;text-align:center">
                        <span style="font-size:28px;font-weight:900;color:var(--yellow);display:block;margin-bottom:4px">${d.streak||0}🔥</span>
                        <span style="font-size:12px;color:var(--muted);font-weight:600">Jours consécutifs</span>
                    </div>
                </div>
            </div>
            ${graphe}
            <div class="card">
                <h2 style="margin-bottom:15px">🗓️ Activité</h2>
                <div style="background:var(--bg);border-radius:12px;padding:14px;display:flex;justify-content:space-between;margin-bottom:8px">
                    <span style="font-weight:600">Membre depuis</span>
                    <span style="color:var(--yellow);font-weight:700">${d.dateInscription?new Date(d.dateInscription).toLocaleDateString('fr-FR'):'N/A'}</span>
                </div>
                <div style="background:var(--bg);border-radius:12px;padding:14px;display:flex;justify-content:space-between;margin-bottom:8px">
                    <span style="font-weight:600">Total XP</span>
                    <span style="color:var(--purple);font-weight:700">${xpActuel} XP</span>
                </div>
                <div style="background:var(--bg);border-radius:12px;padding:14px;display:flex;justify-content:space-between">
                    <span style="font-weight:600">Dernière connexion</span>
                    <span style="color:var(--green);font-weight:700">${d.dernierJour?new Date(d.dernierJour).toLocaleDateString('fr-FR'):'N/A'}</span>
                </div>
            </div>
        </div>`;
    document.body.appendChild(overlay);
}

// === FIN PARTIE 3/8 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V5 FINAL
// PARTIE 4/8 : ADMIN PANEL + CONFIG + QUESTIONS
// ============================================

// === ADMIN PANEL ===
async function loadAdmin() {
    status.textContent = '🟢 Connecté Firebase';

    db.ref('users').on('value', snap => {
        statCandidats.textContent = snap.numChildren();
    });

    db.ref('resultats').on('value', snap => {
        statConcours.textContent = snap.numChildren();
        var total = 0, count = 0;
        snap.forEach(child => {
            total += parseFloat(child.val().score||0);
            count++;
        });
        statMoy.textContent = count>0?(total/count).toFixed(1):0;
    });

    db.ref('configConcours').on('value', snap => {
        var cfg = snap.val();
        if (cfg) {
            typeConcours.value = cfg.type||'Concours Blanc Bonogo';
            hDebut.value = cfg.heureDebut||'08:00';
            hFin.value   = cfg.heureFin||'09:30';
        }
    });

    db.ref('sujetActuel').on('value', snap => {
        sujetActuel = snap.val()||[];
        afficherQuestionsAdmin();
    });

    db.ref('users').on('value', snap => {
        var html = '';
        snap.forEach(child => {
            var u = child.val();
            var date = new Date(u.dernierJour).toLocaleDateString('fr-FR');
            html += `<div class="eleve-item">
                <strong>${u.prenom} ${u.nom}</strong><br>
                ${u.email}<br>
                Niveau ${u.niveau} · ${u.xp} XP · Moy: ${u.moyenne}/50<br>
                🔥 ${u.streak}j · ${u.concoursFaits} concours · Vu: ${date}
            </div>`;
        });
        listeCandidats.innerHTML = html||'<p style="text-align:center;color:var(--muted)">Aucun candidat</p>';
    });

    db.ref('resultats').orderByChild('score').limitToLast(10).on('value', snap => {
        var results = [];
        snap.forEach(child => results.push(child.val()));
        results.sort((a,b) => b.score - a.score);
        top10.innerHTML = results.map((r,i) => {
            var med = i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1);
            return `<div class="classement-item">
                <span class="rang">${med}</span>
                <span class="nom">${r.prenom} ${r.nom}</span>
                <span class="score">${r.score}/50</span>
            </div>`;
        }).join('')||'<p style="text-align:center;color:var(--muted)">Aucun résultat</p>';
    });
}

// === SAUVER CONFIG ===
btnSaveConfig.onclick = async function() {
    son('click');
    var type = typeConcours.value;
    var debut = hDebut.value, fin = hFin.value;
    if (!debut||!fin) { toast('Remplis les heures','error'); return; }

    var today = new Date();
    var dP = debut.split(':'), fP = fin.split(':');
    var dDate = new Date(today.getFullYear(),today.getMonth(),today.getDate(),+dP[0],+dP[1]);
    var fDate = new Date(today.getFullYear(),today.getMonth(),today.getDate(),+fP[0],+fP[1]);
    if (fDate<=dDate) { toast('Heure fin après début','error'); return; }

    await db.ref('configConcours').set({
        type, heureDebut:debut, heureFin:fin,
        debutTimestamp:dDate.getTime(),
        finTimestamp:fDate.getTime()
    });
    toast('✅ Config sauvegardée!','success');
};

// === IMPORT 50 QUESTIONS (MULTI-FORMAT) ===
btnCharger50.onclick = function() {
    son('click');
    try {
        var qs = JSON.parse(collerJSON.value);
        if (!Array.isArray(qs)) {
            toast('Format invalide : tableau JSON requis','error');
            return;
        }
        if (qs.length !== 50) {
            toast('Il faut exactement 50 questions. Tu as '+qs.length,'warning');
            return;
        }

        // Convertir automatiquement selon le format détecté
        sujetActuel = qs.map(function(q) {

            // Format 1 : déjà au bon format {texte, reponses:[]}
            if (q.texte && q.reponses && Array.isArray(q.reponses)) {
                return q;
            }

            // Format 2 : ton format {question, options:[], reponse}
            if (q.question && q.options && q.reponse) {
                return {
                    texte: q.question,
                    reponses: q.options.map(function(opt) {
                        return {
                            texte: opt,
                            correct: opt === q.reponse
                        };
                    })
                };
            }

            // Format 3 : {text, choices:[], answer}
            if (q.text && q.choices && q.answer) {
                return {
                    texte: q.text,
                    reponses: q.choices.map(function(opt) {
                        return {
                            texte: opt,
                            correct: opt === q.answer
                        };
                    })
                };
            }

            // Format 4 : {enonce, propositions:[], bonne_reponse}
            if (q.enonce && q.propositions && q.bonne_reponse) {
                return {
                    texte: q.enonce,
                    reponses: q.propositions.map(function(opt) {
                        return {
                            texte: opt,
                            correct: opt === q.bonne_reponse
                        };
                    })
                };
            }

            return q;
        });

        afficherQuestionsAdmin();
        collerJSON.value = '';
        btnEnvoyer50.style.display = 'block';
        toast('✅ 50 questions chargées et converties!','success');

    } catch(e) {
        toast('Erreur JSON : '+e.message,'error');
    }
};

btnEnvoyer50.onclick = async function() {
    son('click');
    if (!confirm('Envoyer les 50 questions aux élèves maintenant?')) return;
    await db.ref('sujetActuel').set(sujetActuel);
    btnEnvoyer50.style.display = 'none';
    toast('🚀 50 QUESTIONS ENVOYÉES AUX ÉLÈVES!','success');
};

// === AFFICHER QUESTIONS ADMIN ===
function afficherQuestionsAdmin() {
    listeQuestions.innerHTML = '';
    sujetActuel.forEach((q, idx) => {
        var div = document.createElement('div');
        div.className = 'question-edit';
        div.innerHTML = `
            <strong>Question ${idx+1}</strong>
            <textarea placeholder="Énoncé" data-idx="${idx}">${q.texte||''}</textarea>
            ${[0,1,2,3].map(ri=>`
            <div class="reponse-edit">
                <input type="checkbox" ${q.reponses[ri]?.correct?'checked':''} data-q="${idx}" data-r="${ri}">
                <input type="text" placeholder="Réponse ${'ABCD'[ri]}" value="${q.reponses[ri]?.texte||''}" data-q="${idx}" data-r="${ri}">
            </div>`).join('')}
            <button class="btn-del" onclick="supprimerQuestion(${idx})">🗑️ Supprimer</button>`;
        listeQuestions.appendChild(div);
    });

    document.querySelectorAll('.question-edit textarea').forEach(ta => {
        ta.oninput = function() {
            var i = parseInt(this.dataset.idx);
            if (!sujetActuel[i]) sujetActuel[i]={texte:'',reponses:[{},{},{},{}]};
            sujetActuel[i].texte = this.value;
        };
    });

    document.querySelectorAll('.reponse-edit input[type="text"]').forEach(inp => {
        inp.oninput = function() {
            var q=parseInt(this.dataset.q), r=parseInt(this.dataset.r);
            if (!sujetActuel[q]) sujetActuel[q]={texte:'',reponses:[{},{},{},{}]};
            if (!sujetActuel[q].reponses[r]) sujetActuel[q].reponses[r]={};
            sujetActuel[q].reponses[r].texte = this.value;
        };
    });

    document.querySelectorAll('.reponse-edit input[type="checkbox"]').forEach(cb => {
        cb.onchange = function() {
            var q=parseInt(this.dataset.q), r=parseInt(this.dataset.r);
            if (!sujetActuel[q]) sujetActuel[q]={texte:'',reponses:[{},{},{},{}]};
            if (!sujetActuel[q].reponses[r]) sujetActuel[q].reponses[r]={};
            sujetActuel[q].reponses[r].correct = this.checked;
        };
    });
}

function supprimerQuestion(idx) {
    son('click');
    if (confirm('Supprimer cette question?')) {
        sujetActuel.splice(idx,1);
        afficherQuestionsAdmin();
    }
}

btnAjouterQ.onclick = function() {
    son('click');
    if (sujetActuel.length>=50) { toast('Maximum 50 questions','warning'); return; }
    sujetActuel.push({texte:'',reponses:[
        {texte:'',correct:false},{texte:'',correct:false},
        {texte:'',correct:false},{texte:'',correct:false}
    ]});
    afficherQuestionsAdmin();
};

btnSaveSujet.onclick = async function() {
    son('click');
    var invalide = sujetActuel.some(q =>
        !q.texte || q.reponses.filter(r=>r.texte).length<2 || !q.reponses.some(r=>r.correct)
    );
    if (invalide) { toast('Chaque question: énoncé + 2 réponses + 1 correcte minimum','error'); return; }
    await db.ref('sujetActuel').set(sujetActuel);
    toast('✅ Sujet sauvegardé!','success');
};

// === FIN PARTIE 4/8 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V5 FINAL
// PARTIE 5/8 : LANCER CONCOURS + SALLE ATTENTE + TIMER
// ============================================

// === LANCER CONCOURS ===
btnExam.onclick = async function() {
    son('click');
    var configSnap = await db.ref('configConcours').once('value');
    var config = configSnap.val();
    if (!config) { toast('Aucun concours configuré','error'); return; }

    var now = Date.now();

    // Vérifier si déjà soumis
    var resSnap = await db.ref('resultats/' + user).once('value');
    if (resSnap.exists() && resSnap.val().timestamp >= config.debutTimestamp) {
        // Déjà soumis — afficher page attente ou résultat
        questionsData = (await db.ref('sujetActuel').once('value')).val() || [];
        finTimestamp = config.finTimestamp;
        nomConcours.textContent   = '📝 ' + config.type;
        heureConcours.textContent = 'Fin: ' + config.heureFin;
        showPage(pageExam);
        salleAttente.style.display = 'none';
        questions.style.display   = 'none';
        document.querySelector('.footer').style.display = 'none';

        if (now < config.finTimestamp) {
            // Heure pas encore finie = page attente
            attente.style.display  = 'block';
            resultat.style.display = 'none';
            demarrerTimerAttente(config.finTimestamp);
            // Écouter fin de l'heure
            attendreFin(config.finTimestamp, resSnap.val());
        } else {
            // Heure finie = afficher résultat
            attente.style.display  = 'none';
            var r = resSnap.val();
            afficherResultatFinal(r);
        }
        return;
    }

    var sujetSnap = await db.ref('sujetActuel').once('value');
    if (!sujetSnap.exists() || !sujetSnap.val() || sujetSnap.val().length===0) {
        toast('Aucun sujet disponible','error'); return;
    }

    questionsData = sujetSnap.val();
    finTimestamp  = config.finTimestamp;
    nomConcours.textContent   = '📝 ' + config.type;
    heureConcours.textContent = 'Fin: ' + config.heureFin;
    copieSubmise = false;
    reponsesFinales = {};

    // Salle d'attente
    if (now < config.debutTimestamp) {
        showPage(pageExam);
        salleAttente.style.display = 'block';
        questions.style.display   = 'none';
        document.querySelector('.footer').style.display = 'none';
        heureDebutAffich.textContent = config.heureDebut;

        var attenteInt = setInterval(function() {
            var reste = config.debutTimestamp - Date.now();
            if (reste <= 0) {
                clearInterval(attenteInt);
                salleAttente.style.display = 'none';
                questions.style.display   = 'block';
                document.querySelector('.footer').style.display = 'flex';
                afficherQuestionsConcours();
                demarrerTimer();
                toast('🚀 Le concours commence!','success');
                return;
            }
            var h = Math.floor(reste/3600000);
            var m = Math.floor((reste%3600000)/60000);
            var s = Math.floor((reste%60000)/1000);
            timerDebut.textContent =
                (h<10?'0':'')+h+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s;
        }, 1000);
        return;
    }

    // Concours terminé
    if (now > config.finTimestamp) {
        toast('Le concours est terminé','error'); return;
    }

    // Lancer direct
    salleAttente.style.display = 'none';
    questions.style.display   = 'block';
    document.querySelector('.footer').style.display = 'flex';
    afficherQuestionsConcours();
    showPage(pageExam);
    demarrerTimer();
};

// === AFFICHER QUESTIONS ===
function afficherQuestionsConcours() {
    questions.innerHTML = '';
    reponsesUser = {};
    alertesTimer = {30:false, 20:false, 10:false, 5:false};

    questionsData.forEach((q, idx) => {
        var div = document.createElement('div');
        div.className = 'question-block';
        div.innerHTML = `
            <div class="question-numero">Question ${idx+1}/${questionsData.length}</div>
            <div class="question-texte">${q.texte}</div>
            <div class="reponses-liste">
                ${q.reponses.map((r,ridx) => r.texte?`
                    <label>
                        <input type="checkbox" data-q="${idx}" data-r="${ridx}">
                        <span>${r.texte}</span>
                    </label>`:''
                ).join('')}
            </div>`;
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
                reponsesUser[q] = reponsesUser[q].filter(x => x!==r);
            }
            var count = Object.keys(reponsesUser).filter(k=>reponsesUser[k].length>0).length;
            restant.textContent = count+'/'+questionsData.length;
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
            // Temps écoulé = soumettre automatiquement
            if (!copieSubmise) {
                toast('⏰ Temps écoulé! Copie envoyée automatiquement','warning');
                soumettreEtAttendre();
            }
            return;
        }
        var min = Math.floor(reste/60000);
        var sec = Math.floor((reste%60000)/1000);
        timer.textContent = min+':'+(sec<10?'0':'')+sec;

        if (min===30&&sec===0&&!alertesTimer[30]) {
            alertesTimer[30]=true;
            toast('⚠️ Il vous reste 30 minutes','warning');
            son('click');
        }
        if (min===20&&sec===0&&!alertesTimer[20]) {
            alertesTimer[20]=true;
            toast('⚠️ Il vous reste 20 minutes','warning');
            son('click');
        }
        if (min===10&&sec===0&&!alertesTimer[10]) {
            alertesTimer[10]=true;
            toast('🔥 Il vous reste 10 minutes!','error');
            son('error');
            timer.classList.add('warning');
        }
        if (reste<=5000&&reste>0&&!alertesTimer[5]) {
            alertesTimer[5]=true;
            son('error');
        }
        if (min<5) timer.classList.add('warning');
    }
    maj();
    timerInt = setInterval(maj, 1000);
}

// === TIMER ATTENTE (après soumission) ===
function demarrerTimerAttente(finTs) {
    var intv = setInterval(function() {
        var reste = finTs - Date.now();
        if (reste <= 0) {
            clearInterval(intv);
            if (timerAttente) timerAttente.textContent = '00:00';
            return;
        }
        var min = Math.floor(reste/60000);
        var sec = Math.floor((reste%60000)/1000);
        if (timerAttente) timerAttente.textContent = min+':'+(sec<10?'0':'')+sec;
    }, 1000);
}

// === ATTENDRE FIN DE L'HEURE ===
function attendreFin(finTs, resultatSauvegarde) {
    var reste = finTs - Date.now();
    if (reste <= 0) {
        afficherResultatFinal(resultatSauvegarde);
        return;
    }
    setTimeout(function() {
        attente.style.display  = 'none';
        afficherResultatFinal(resultatSauvegarde);
        toast('🎉 L\'heure est terminée! Voici ton résultat!','success');
        son('success');
    }, reste);
}

// === BOUTON NON RÉPONDU ===
btnNonRep.onclick = function() {
    son('click');
    var nonRep = [];
    for (var i=0; i<questionsData.length; i++) {
        if (!reponsesUser[i]||reponsesUser[i].length===0) nonRep.push(i+1);
    }
    if (nonRep.length===0) {
        toast('✅ Toutes les questions sont répondues','success');
    } else {
        toast('📋 Non répondues: '+nonRep.join(', '),'warning');
        var first = document.querySelectorAll('.question-block')[nonRep[0]-1];
        if (first) first.scrollIntoView({behavior:'smooth',block:'center'});
    }
};

// === TERMINER CONCOURS ===
btnFinir.onclick = function() {
    son('click');
    var count = Object.keys(reponsesUser).filter(k=>reponsesUser[k].length>0).length;
    var msg = `Tu as répondu à ${count}/${questionsData.length} questions.`;
    msg += count<questionsData.length
        ? '\n\nVeux-tu vraiment terminer?'
        : "\n\nConfirmer l'envoi?";
    msg += '\n\n⚠️ La correction sera visible à la fin de l\'heure seulement.';

    modalTitre.textContent = 'Terminer le concours';
    modalTexte.textContent = msg;
    modal.style.display = 'flex';

    btnConfirmer.onclick = function() {
        modal.style.display = 'none';
        soumettreEtAttendre();
    };
    btnAnnuler.onclick = function() {
        modal.style.display = 'none';
    };
};

// === FIN PARTIE 5/8 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V5 FINAL
// PARTIE 6/8 : SOUMETTRE + CORRIGER + BADGES + HISTORIQUE
// ============================================

// === SOUMETTRE ET ATTENDRE ===
async function soumettreEtAttendre() {
    if (copieSubmise) return;
    copieSubmise = true;

    if (timerInt) clearInterval(timerInt);

    // Sauvegarder les réponses
    reponsesFinales = JSON.parse(JSON.stringify(reponsesUser));

    // Calculer score immédiatement
    var scoreTotal=0, bonnesRep=0, partiellesRep=0, faussesRep=0;

    questionsData.forEach((q, idx) => {
        var repUser    = reponsesFinales[idx] || [];
        var repCorrect = [];
        q.reponses.forEach((r,ri) => { if (r.correct) repCorrect.push(ri); });

        if (repUser.length===0) {
            faussesRep++;
        } else {
            var nbOk  = repUser.filter(r => repCorrect.includes(r)).length;
            var nbMau = repUser.filter(r => !repCorrect.includes(r)).length;
            if (nbMau===0 && nbOk===repCorrect.length) { scoreTotal++; bonnesRep++; }
            else if (nbOk>0 && nbMau===0) { scoreTotal+=0.5; partiellesRep++; }
            else faussesRep++;
        }
    });

    var xpGagné = calcXp(scoreTotal, questionsData.length);

    // Récupérer données user
    var snapUser = await db.ref('users/' + user).once('value');
    var dataUser = snapUser.val();
    var configSnap = await db.ref('configConcours').once('value');
    var config = configSnap.val() || {};

    var newXp            = (dataUser.xp||0) + xpGagné;
    var newNiveau        = niveau(newXp);
    var newConcoursFaits = (dataUser.concoursFaits||0) + 1;
    var newMoyenne       = (((parseFloat(dataUser.moyenne)||0) * (dataUser.concoursFaits||0)) + scoreTotal) / newConcoursFaits;

    // Badges
    var badges = dataUser.badges || {};
    if (newConcoursFaits===1)              badges.premier  = true;
    if ((dataUser.streak||0)>=7)           badges.streak7  = true;
    if (newNiveau>=10)                     badges.niveau10 = true;
    if (scoreTotal===questionsData.length) badges.perfect  = true;
    if ((finTimestamp-Date.now())>3600000) badges.rapide   = true;
    if (newConcoursFaits>=5)              badges.assidu   = true;
    if (newMoyenne>40)                     badges.elite    = true;

    // Historique
    var histo = dataUser.historique || [];
    if (!Array.isArray(histo)) histo = Object.values(histo);
    histo.push({
        timestamp  : Date.now(),
        score      : scoreTotal,
        xp         : xpGagné,
        bonnes     : bonnesRep,
        partielles : partiellesRep,
        fausses    : faussesRep,
        type       : config.type || 'Concours Blanc Bonogo'
    });

    // Sauver dans Firebase
    await db.ref('users/' + user).update({
        xp            : newXp,
        niveau        : newNiveau,
        concoursFaits : newConcoursFaits,
        moyenne       : parseFloat(newMoyenne.toFixed(1)),
        badges        : badges,
        historique    : histo
    });

    await db.ref('resultats/' + user).set({
        key       : user,
        pseudo    : user,
        prenom    : dataUser.prenom,
        nom       : dataUser.nom,
        score     : scoreTotal,
        xp        : xpGagné,
        bonnes    : bonnesRep,
        partielles: partiellesRep,
        fausses   : faussesRep,
        timestamp : Date.now()
    });

    // Vérifier top 3
    var snapClass = await db.ref('resultats').orderByChild('score').limitToLast(3).once('value');
    var top3keys = [];
    snapClass.forEach(c => top3keys.push(c.key));
    if (top3keys.includes(user)) {
        badges.top3 = true;
        await db.ref('users/' + user + '/badges').update({ top3: true });
    }

    // Mettre à jour userData local
    userData = {
        ...dataUser,
        xp: newXp, niveau: newNiveau,
        concoursFaits: newConcoursFaits,
        moyenne: newMoyenne.toFixed(1),
        badges, historique: histo
    };

    // Résultat à afficher plus tard
    var resultatData = {
        score     : scoreTotal,
        xp        : xpGagné,
        bonnes    : bonnesRep,
        partielles: partiellesRep,
        fausses   : faussesRep,
        newNiveau : newNiveau,
        oldNiveau : dataUser.niveau||1
    };

    // Afficher page attente
    questions.style.display = 'none';
    document.querySelector('.footer').style.display = 'none';
    attente.style.display  = 'block';
    resultat.style.display = 'none';

    toast('✅ Copie envoyée! Résultat à la fin de l\'heure.','success');
    son('success');

    // Démarrer timer attente
    demarrerTimerAttente(finTimestamp);

    // Attendre la fin de l'heure pour afficher résultat
    var resteAvantFin = finTimestamp - Date.now();
    if (resteAvantFin <= 0) {
        attente.style.display = 'none';
        afficherResultatFinal(resultatData);
    } else {
        setTimeout(function() {
            attente.style.display = 'none';
            afficherResultatFinal(resultatData);
            toast('🎉 L\'heure est terminée! Voici ton résultat!','success');
            son('success');
        }, resteAvantFin);
    }
}

// === AFFICHER RÉSULTAT FINAL ===
async function afficherResultatFinal(r) {
    // Récupérer rang
    var allSnap = await db.ref('resultats').orderByChild('score').once('value');
    var allRes  = [];
    allSnap.forEach(c => allRes.push({ key:c.key, score:c.val().score }));
    allRes.sort((a,b) => b.score - a.score);
    var monRang = allRes.findIndex(x => x.key===user) + 1;

    // Afficher
    score.textContent      = r.score + '/50';
    xpGagne.textContent    = r.xp;
    bonnes.textContent     = r.bonnes;
    partielles.textContent = r.partielles;
    fausses.textContent    = r.fausses;

    // Rang
    var rangEl = document.getElementById('monRangRes');
    if (rangEl) rangEl.textContent = monRang>0 ? '🏅 Rang #'+monRang+' sur '+allRes.length : '';

    attente.style.display  = 'none';
    resultat.style.display = 'block';

    // Notif nouveau niveau
    if (r.newNiveau && r.newNiveau > (r.oldNiveau||1)) {
        setTimeout(() => toast('🎉 NIVEAU '+r.newNiveau+' ATTEINT!','success'), 1200);
    }

    // Mettre à jour menu
    niv.textContent    = userData.niveau;
    xp.textContent     = userData.xp;
    streak.textContent = userData.streak||0;
}

// === FIN PARTIE 6/8 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V5 FINAL
// PARTIE 7/8 : CORRECTION DÉTAILLÉE + BOUTONS RÉSULTAT
// ============================================

// === BOUTON CORRECTION ===
btnCorrection.onclick = function() {
    son('click');
    correction.innerHTML = '';

    // Utiliser reponsesFinales (sauvegardées au moment de la soumission)
    var repAUtiliser = Object.keys(reponsesFinales).length > 0
        ? reponsesFinales
        : reponsesUser;

    questionsData.forEach((q, idx) => {
        var repUser    = repAUtiliser[idx] || [];
        var repCorrect = [];
        q.reponses.forEach((r,ri) => { if (r.correct) repCorrect.push(ri); });

        var nbOk  = repUser.filter(r => repCorrect.includes(r)).length;
        var nbMau = repUser.filter(r => !repCorrect.includes(r)).length;
        var isCorrect = repUser.length>0 && nbMau===0 && nbOk===repCorrect.length;
        var isPartiel = nbOk>0 && nbMau===0 && nbOk<repCorrect.length;

        var div = document.createElement('div');
        div.className = 'question-correction '+(isCorrect?'correct':isPartiel?'partiel':'incorrect');

        var icon = isCorrect?'✅':isPartiel?'⚠️':'❌';
        var pts  = isCorrect?'1 pt':isPartiel?'0.5 pt':'0 pt';

        var repUserText    = repUser.length>0
            ? repUser.map(r => q.reponses[r]?.texte||'?').join(', ')
            : 'Aucune réponse';
        var repCorrectText = repCorrect.map(r => q.reponses[r]?.texte||'?').join(', ');

        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <div style="font-weight:800">${icon} Question ${idx+1}</div>
                <div style="font-size:13px;font-weight:700;color:${isCorrect?'var(--green)':isPartiel?'var(--yellow)':'var(--red)'}">${pts}</div>
            </div>
            <div style="margin-bottom:10px;font-size:15px;line-height:1.5">${q.texte}</div>
            <div style="background:var(--bg);padding:10px;border-radius:8px;margin-bottom:6px;font-size:13px">
                <strong>Ta réponse:</strong> 
                <span style="color:${isCorrect?'var(--green)':isPartiel?'var(--yellow)':'var(--red)'}">${repUserText}</span>
            </div>
            <div style="background:var(--bg);padding:10px;border-radius:8px;font-size:13px">
                <strong>Bonne réponse:</strong> 
                <span style="color:var(--green)">${repCorrectText}</span>
            </div>`;
        correction.appendChild(div);
    });

    // Scroll vers correction
    correction.scrollIntoView({behavior:'smooth'});
};

// === VOIR CLASSEMENT DEPUIS RÉSULTAT ===
btnVoirClass.onclick = async function() {
    son('click');
    attente.style.display  = 'none';
    resultat.style.display = 'none';
    showPage(pageMenu);

    // Ouvrir classement animé
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:999;overflow-y:auto;padding:15px';
    overlay.innerHTML = `
        <div style="max-width:600px;margin:0 auto">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid var(--border)">
                <button onclick="this.closest('div[style]').remove()" style="background:var(--border);color:var(--text);padding:10px 18px;border-radius:10px;font-size:14px;font-weight:700;min-height:auto;width:auto;margin:0">←</button>
                <h2 style="margin:0">🏆 Classement Final</h2>
            </div>
            <div id="clFinalContent" style="text-align:center;padding:30px">
                <div class="loader"></div>
                <p style="color:var(--muted);margin-top:10px">Chargement classement...</p>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    var snap = await db.ref('resultats').orderByChild('score').limitToLast(50).once('value');
    var results = [];
    snap.forEach(child => results.push({key:child.key, ...child.val()}));
    results.sort((a,b) => b.score - a.score || a.timestamp - b.timestamp);

    var snapAll = await db.ref('users').once('value');
    var total   = snapAll.numChildren();
    var monIdx  = results.findIndex(r => r.key===user);

    var clFinalContent = overlay.querySelector('#clFinalContent');

    var monRangHtml = '';
    if (monIdx>=0) {
        monRangHtml = `
            <div style="background:linear-gradient(135deg,rgba(250,204,21,.2),rgba(249,115,22,.1));border:2px solid var(--yellow);border-radius:14px;padding:20px;margin-bottom:20px;text-align:center;animation:pulse 2s infinite">
                <div style="font-size:14px;font-weight:700;color:var(--muted);margin-bottom:5px">🎯 Ma Position</div>
                <div style="font-size:48px;font-weight:900;color:var(--yellow)">#${monIdx+1}</div>
                <div style="font-size:13px;color:var(--muted)">sur ${total} candidats inscrits</div>
                <div style="font-size:20px;font-weight:800;color:var(--green);margin-top:8px">${results[monIdx].score}/50 pts</div>
            </div>`;
    }

    if (results.length===0) {
        clFinalContent.innerHTML = `<p style="color:var(--muted)">Aucun résultat</p>`;
        return;
    }

    var lignes = results.map((r,i) => {
        var isMe = r.key===user;
        var med  = i===0?'🥇':i===1?'🥈':i===2?'🥉':`<span style="font-size:15px;font-weight:800">#${i+1}</span>`;
        var pct  = Math.round((r.score/50)*100);
        return `<div class="cl-item" style="display:flex;justify-content:space-between;align-items:center;background:${isMe?'linear-gradient(135deg,rgba(250,204,21,.15),rgba(249,115,22,.1))':'var(--card)'};padding:14px 15px;border-radius:12px;margin-bottom:8px;border:2px solid ${isMe?'var(--yellow)':'var(--border)'};font-weight:600;opacity:0;transform:translateY(15px);transition:all 0.4s ease ${i*0.06}s">
            <span style="font-size:20px;font-weight:900;color:var(--yellow);min-width:40px">${med}</span>
            <div style="flex:1;margin:0 10px">
                <div style="font-size:15px">${r.prenom} ${r.nom} ${isMe?'<span style="color:var(--yellow);font-size:11px;font-weight:800">◀ MOI</span>':''}</div>
                <div style="font-size:11px;color:var(--muted);margin-top:2px">${pct}% · ✅${r.bonnes||0} ⚠️${r.partielles||0} ❌${r.fausses||0}</div>
            </div>
            <div style="text-align:right">
                <div style="font-size:18px;font-weight:900;color:${isMe?'var(--yellow)':'var(--green)'}">${r.score}/50</div>
            </div>
        </div>`;
    }).join('');

    clFinalContent.innerHTML = monRangHtml + lignes;

    // Animation entrée progressive
    setTimeout(() => {
        overlay.querySelectorAll('.cl-item').forEach(el => {
            el.style.opacity    = '1';
            el.style.transform  = 'translateY(0)';
        });
    }, 150);
};

// === RETOUR MENU ===
btnRetourMenu.onclick = function() {
    son('click');
    attente.style.display   = 'none';
    resultat.style.display  = 'none';
    questions.style.display = 'none';
    correction.innerHTML    = '';
    document.querySelector('.footer').style.display = 'none';
    copieSubmise  = false;
    reponsesFinales = {};
    showPage(pageMenu);

    // Rafraîchir stats menu
    db.ref('users/' + user).once('value').then(snap => {
        var d = snap.val();
        if (d) {
            niv.textContent    = d.niveau;
            xp.textContent     = d.xp;
            streak.textContent = d.streak;
        }
    });
};

// === FIN PARTIE 7/8 ===// ============================================
// CONCOURS BLANC BONOGO - SCRIPT V5 FINAL
// PARTIE 8/8 : BOUTONS MENU + NOUVEAU CONCOURS + INIT
// ============================================

// === BOUTONS MENU PRINCIPAL ===
btnBadges.onclick = async function() {
    son('click');
    var snap = await db.ref('users/' + user + '/badges').once('value');
    var badges = snap.val() || {};

    var badgeList = [
        { key:'premier',  emoji:'🎯', nom:'Premier Concours',  desc:'Terminer son 1er concours' },
        { key:'streak7',  emoji:'🔥', nom:'Série 7 jours',     desc:'7 jours consécutifs connecté' },
        { key:'niveau10', emoji:'⭐', nom:'Niveau 10',          desc:'Atteindre le niveau 10' },
        { key:'perfect',  emoji:'💯', nom:'Sans Faute',         desc:'Obtenir 50/50' },
        { key:'rapide',   emoji:'⚡', nom:'Éclair',             desc:'Finir avec +1h restante' },
        { key:'assidu',   emoji:'📅', nom:'Assidu',             desc:'5 concours ou plus passés' },
        { key:'top3',     emoji:'🏅', nom:'Top 3',              desc:'Être dans le top 3 général' },
        { key:'elite',    emoji:'👑', nom:'Élite',              desc:'Moyenne supérieure à 40/50' }
    ];

    var nbObtenu = badgeList.filter(b => badges[b.key]).length;

    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:999;overflow-y:auto;padding:15px';
    overlay.innerHTML = `
        <div style="max-width:600px;margin:0 auto">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid var(--border)">
                <button onclick="this.closest('[style]').remove()" style="background:var(--border);color:var(--text);padding:10px 18px;border-radius:10px;font-size:14px;font-weight:700;min-height:auto;width:auto;margin:0">←</button>
                <h2 style="margin:0">🎖️ Mes Badges</h2>
            </div>
            <div class="card center" style="margin-bottom:15px">
                <div style="font-size:40px;margin-bottom:10px">🎖️</div>
                <div style="font-size:28px;font-weight:900;color:var(--yellow)">${nbObtenu}/${badgeList.length}</div>
                <div style="color:var(--muted);font-size:14px">badges obtenus</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
                ${badgeList.map(b => {
                    var has = badges[b.key];
                    return `<div style="background:var(--card);border:2px solid ${has?'var(--yellow)':'var(--border)'};border-radius:14px;padding:15px;text-align:center;${has?'background:rgba(250,204,21,0.07)':''}">
                        <div style="font-size:36px;margin-bottom:8px">${b.emoji}</div>
                        <div style="font-size:13px;font-weight:700;margin-bottom:4px">${b.nom}</div>
                        <div style="font-size:11px;color:var(--muted)">${b.desc}</div>
                        <span style="display:inline-block;margin-top:8px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${has?'rgba(250,204,21,0.2)':'rgba(148,163,184,0.1)'};color:${has?'var(--yellow)':'var(--muted)'}">${has?'✅ Obtenu':'🔒 Verrouillé'}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    document.body.appendChild(overlay);
};

// === CLASSEMENT DEPUIS MENU ===
btnClassement.onclick = async function() {
    son('click');

    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:999;overflow-y:auto;padding:15px';
    overlay.innerHTML = `
        <div style="max-width:600px;margin:0 auto">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid var(--border)">
                <button onclick="this.closest('[style]').remove()" style="background:var(--border);color:var(--text);padding:10px 18px;border-radius:10px;font-size:14px;font-weight:700;min-height:auto;width:auto;margin:0">←</button>
                <h2 style="margin:0">🏆 Classement Général</h2>
            </div>
            <div id="clMenuContent" style="text-align:center;padding:30px">
                <div class="loader"></div>
                <p style="color:var(--muted);margin-top:10px">Chargement...</p>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    var snap = await db.ref('resultats').orderByChild('score').limitToLast(50).once('value');
    var results = [];
    snap.forEach(child => results.push({key:child.key, ...child.val()}));
    results.sort((a,b) => b.score - a.score || a.timestamp - b.timestamp);

    var snapAll = await db.ref('users').once('value');
    var total   = snapAll.numChildren();
    var monIdx  = results.findIndex(r => r.key===user);
    var clContent = overlay.querySelector('#clMenuContent');

    if (results.length===0) {
        clContent.innerHTML = `
            <div style="font-size:60px;margin-bottom:15px">🏆</div>
            <p style="color:var(--muted);font-size:16px">Aucun résultat pour l'instant</p>
            <p style="color:var(--muted);font-size:14px">Passe le concours pour apparaître ici!</p>`;
        return;
    }

    var monRangHtml = '';
    if (monIdx>=0) {
        monRangHtml = `
            <div style="background:linear-gradient(135deg,rgba(250,204,21,.15),rgba(249,115,22,.1));border:2px solid var(--yellow);border-radius:14px;padding:15px 20px;margin-bottom:15px;text-align:center;font-weight:700">
                Ma position: <span style="font-size:32px;font-weight:900;color:var(--yellow);display:block">#${monIdx+1}</span>
                <small style="color:var(--muted);font-size:13px">sur ${total} candidats inscrits</small>
            </div>`;
    }

    var lignes = results.map((r,i) => {
        var isMe = r.key===user;
        var med  = i===0?'🥇':i===1?'🥈':i===2?'🥉':`<span style="font-size:15px;font-weight:800">#${i+1}</span>`;
        var pct  = Math.round((r.score/50)*100);
        return `<div class="cl-item" style="display:flex;justify-content:space-between;align-items:center;background:${isMe?'linear-gradient(135deg,rgba(250,204,21,.15),rgba(249,115,22,.1))':'var(--card)'};padding:14px 15px;border-radius:12px;margin-bottom:8px;border:2px solid ${isMe?'var(--yellow)':'var(--border)'};font-weight:600;opacity:0;transform:translateX(-20px);transition:all 0.3s ease ${i*0.05}s">
            <span style="font-size:20px;font-weight:900;color:var(--yellow);min-width:40px">${med}</span>
            <div style="flex:1;margin:0 10px">
                <div>${r.prenom} ${r.nom} ${isMe?'<span style="color:var(--yellow);font-size:11px">◀ Moi</span>':''}</div>
                <div style="font-size:11px;color:var(--muted)">${pct}% · ✅${r.bonnes||0} ⚠️${r.partielles||0} ❌${r.fausses||0}</div>
            </div>
            <span style="font-size:17px;font-weight:800;color:${isMe?'var(--yellow)':'var(--green)'}">${r.score}/50</span>
        </div>`;
    }).join('');

    clContent.innerHTML = monRangHtml + lignes;

    setTimeout(() => {
        overlay.querySelectorAll('.cl-item').forEach(el => {
            el.style.opacity   = '1';
            el.style.transform = 'translateX(0)';
        });
    }, 100);
};

// === HISTORIQUE DEPUIS MENU ===
document.addEventListener('DOMContentLoaded', function() {
    var btnHisto = document.getElementById('btnHistorique');
    if (btnHisto) btnHisto.onclick = function() { afficherHistorique(); };

    var btnStats = document.getElementById('btnMesStats');
    if (btnStats) btnStats.onclick = function() { afficherStats(); };
});

// === NOUVEAU CONCOURS (Admin) ===
// Réinitialise les résultats pour permettre un nouveau concours
var btnNouveauConcours = document.getElementById('btnNouveauConcours');
if (btnNouveauConcours) {
    btnNouveauConcours.onclick = async function() {
        son('click');
        modalTitre.textContent = '⚠️ Nouveau Concours';
        modalTexte.textContent = 'Cela va supprimer TOUS les résultats du classement.\nLes élèves pourront repasser le concours.\n\nContinuer?';
        modal.style.display = 'flex';

        btnConfirmer.onclick = async function() {
            modal.style.display = 'none';
            await db.ref('resultats').remove();
            toast('✅ Résultats réinitialisés! Nouveau concours prêt.','success');
            son('success');
        };
        btnAnnuler.onclick = function() {
            modal.style.display = 'none';
        };
    };
}

// === MODAL GLOBAL ===
window.onclick = function(e) {
    if (e.target === modal) modal.style.display = 'none';
};

// === FIN PARTIE 8/8 ===
// SCRIPT V5 COMPLET - CONCOURS BLANC BONOGO
// ✅ Firebase quiz-pro-max
// ✅ Connexion / Inscription / Reset MDP
// ✅ Classement animé
// ✅ Historique par candidat
// ✅ Statistiques avec graphe
// ✅ 8 Badges
// ✅ Correction à la fin de l'heure seulement
// ✅ Multi-format JSON (question/options/reponse)
// ✅ Nouveau concours admin
