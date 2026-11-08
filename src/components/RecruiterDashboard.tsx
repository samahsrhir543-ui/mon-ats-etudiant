import React, { useState, useEffect } from 'react';
import type { AuthUser, Candidat, ChatMessage, JobOpening } from '../types';
import { ChatDrawer } from './ChatDrawer';
import { CreateJobOfferModal } from './CreateJobOfferModal';

interface RecruiterDashboardProps {
  user: AuthUser;
  candidats: Candidat[];
  setCandidats: React.Dispatch<React.SetStateAction<Candidat[]>>;
  jobs: JobOpening[];
  onAddJob: (job: JobOpening) => void;
  onDeleteJob?: (jobId: string) => void;
  onLogout: () => void;
  onSwitchToCandidatePreview?: (candidat: Candidat) => void;
  onViewCareersPage?: () => void;
  messages: ChatMessage[];
  onSendMessage: (candidateId: number, text: string, type?: 'text' | 'template' | 'interview_invite') => void;
  onMarkAsRead: (candidateId: number) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  user,
  candidats,
  setCandidats,
  jobs,
  onAddJob,
  onDeleteJob,
  onLogout,
  onSwitchToCandidatePreview,
  onViewCareersPage,
  messages,
  onSendMessage,
  onMarkAsRead,
}) => {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [poste, setPoste] = useState('Chargé(e) de Recrutement & Sourcing RH');
  const [niveau, setNiveau] = useState<'Junior' | 'Confirmé' | 'Senior'>('Confirmé');
  const [fichierCV, setFichierCV] = useState<File | null>(null);

  const [filtreStatut, setFiltreStatut] = useState<string>('Tous');
  const [filtrePoste, setFiltrePoste] = useState<string>('Tous');
  const [filtreNiveau, setFiltreNiveau] = useState<string>('Tous');
  const [critereTri, setCritereTri] = useState<'score' | 'recence' | 'nom'>('score');
  const [recherche, setRecherche] = useState('');
  const [nouveauTagInput, setNouveauTagInput] = useState<Record<number, string>>({});

  // --- ÉTAT DU CHAT & MODALE OFFRE D'EMPLOI ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatCandidateId, setActiveChatCandidateId] = useState<number | null>(null);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);

  // --- ÉTATS D'AFFICHAGE DES PHASES DE PARAMÉTRAGE ---
  const [afficherDashboard, setAfficherDashboard] = useState(true);
  const [afficherOffres, setAfficherOffres] = useState(true);
  const [afficherPhaseMotsCles, setAfficherPhaseMotsCles] = useState(false);
  const [afficherPhaseScore, setAfficherPhaseScore] = useState(false);

  // --- PHASE 1 : DICTIONNAIRE DES MOTS-CLÉS PAR POSTE ---
  const [motsClesPostes, setMotsClesPostes] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('mots_cles_postes_v21');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      'Chargé(e) de Recrutement & Sourcing RH': ['recrutement', 'sourcing', 'entretien', 'ats', 'profil', 'talent', 'rh', 'gpec'],
      'Gestionnaire Paie & SIRH': ['paie', 'sirh', 'bulletin', 'charges', 'cotisations', 'excel', 'déclarations', 'dsn'],
      'Gestionnaire Paie & SIRH Confirmé(e)': ['paie', 'sirh', 'bulletin', 'charges', 'cotisations', 'excel', 'déclarations', 'dsn'],
      'Assistant(e) Ressources Humaines': ['administratif', 'contrat', 'intégration', 'accueil', 'courrier', 'dossier', 'rh', 'congés'],
      'Responsable Formation & Développement des Compétences': ['formation', 'plan', 'compétences', 'opco', 'budget', 'stage', 'développement'],
      'Talent Acquisition & Employer Branding (Stage / PFE)': ['recrutement', 'talent', 'sourcing', 'marque employeur', 'linkedin', 'communication']
    };
  });
  const [nouveauMotInput, setNouveauMotInput] = useState<Record<string, string>>({});
  const [nouveauPosteNom, setNouveauPosteNom] = useState('');

  // --- PHASE 2 : PARAMÉTRAGE DÉTAILLÉ DU SCORE ---
  const [scoreBase, setScoreBase] = useState<number>(30);
  const [pointsParMot, setPointsParMot] = useState<number>(8);
  const [bonusMotDansCV, setBonusMotDansCV] = useState<number>(6);
  const [bonusMotDansNotes, setBonusMotDansNotes] = useState<number>(4);
  const [bonusJunior, setBonusJunior] = useState<number>(0);
  const [bonusConfirme, setBonusConfirme] = useState<number>(8);
  const [bonusSenior, setBonusSenior] = useState<number>(15);
  const [pointsParTag, setPointsParTag] = useState<number>(5);
  const [scoreMin, setScoreMin] = useState<number>(20);
  const [scoreMax, setScoreMax] = useState<number>(100);

  useEffect(() => {
    localStorage.setItem('mots_cles_postes_v21', JSON.stringify(motsClesPostes));
  }, [motsClesPostes]);

  // AJOUT D'UNE NOUVELLE OFFRE CRÉÉE PAR LE RECRUTEUR
  const handleCreateJobOffer = (newJob: JobOpening) => {
    onAddJob(newJob);

    // Enregistrer automatiquement les mots-clés dans le dictionnaire ATS
    if (newJob.competencesCles.length > 0) {
      setMotsClesPostes(prev => ({
        ...prev,
        [newJob.titre]: newJob.competencesCles
      }));
    }

    setPoste(newJob.titre);
  };

  const handleOpenChat = (candId?: number) => {
    if (candId) {
      setActiveChatCandidateId(candId);
    } else if (!activeChatCandidateId && candidats.length > 0) {
      setActiveChatCandidateId(candidats[0].id);
    }
    setIsChatOpen(true);
  };

  const getCandidateUnreadCount = (candId: number) => {
    return messages.filter(
      m => m.candidateId === candId && m.senderRole === 'candidate' && !m.readByRecruiter
    ).length;
  };

  const totalUnreadMessages = messages.filter(
    m => m.senderRole === 'candidate' && !m.readByRecruiter
  ).length;

  // GESTION MOTS-CLÉS
  const ajouterMotCleAuPoste = (posteCle: string) => {
    const motSaisi = nouveauMotInput[posteCle]?.trim().toLowerCase();
    if (!motSaisi) return;
    if (!motsClesPostes[posteCle]?.includes(motSaisi)) {
      setMotsClesPostes({ ...motsClesPostes, [posteCle]: [...(motsClesPostes[posteCle] || []), motSaisi] });
    }
    setNouveauMotInput({ ...nouveauMotInput, [posteCle]: '' });
  };

  const supprimerMotCleDuPoste = (posteCle: string, motAEffacer: string) => {
    setMotsClesPostes({
      ...motsClesPostes,
      [posteCle]: (motsClesPostes[posteCle] || []).filter(m => m !== motAEffacer)
    });
  };

  const ajouterNouveauPoste = (e: React.FormEvent) => {
    e.preventDefault();
    const nomFormate = nouveauPosteNom.trim();
    if (!nomFormate || motsClesPostes[nomFormate]) return;
    setMotsClesPostes({ ...motsClesPostes, [nomFormate]: [] });
    setNouveauPosteNom('');
  };

  const supprimerPoste = (posteCle: string) => {
    if (Object.keys(motsClesPostes).length <= 1) return;
    const clone = { ...motsClesPostes };
    delete clone[posteCle];
    setMotsClesPostes(clone);
    if (poste === posteCle) setPoste(Object.keys(clone)[0]);
  };

  // ALGORITHME DE SCORE MULTICRITÈRE
  const calculerScoreCV = (
    nomCandidat: string, 
    notesRH: string, 
    nomFichier: string, 
    posteVise: string, 
    level: string, 
    tagsCandidat: string[] = []
  ): number => {
    const motsCles = motsClesPostes[posteVise] || [];
    let points = scoreBase;

    motsCles.forEach((mot) => {
      const motMinuscule = mot.toLowerCase();
      if (`${nomCandidat} ${notesRH} ${nomFichier}`.toLowerCase().includes(motMinuscule)) {
        points += pointsParMot;
      }
      if (nomFichier.toLowerCase().includes(motMinuscule)) {
        points += bonusMotDansCV;
      }
      if (notesRH.toLowerCase().includes(motMinuscule)) {
        points += bonusMotDansNotes;
      }
    });

    if (level === 'Senior') points += bonusSenior;
    else if (level === 'Confirmé') points += bonusConfirme;
    else if (level === 'Junior') points += bonusJunior;

    points += tagsCandidat.length * pointsParTag;

    if (points < scoreMin) points = scoreMin;
    if (points > scoreMax) points = scoreMax;

    return points;
  };

  useEffect(() => {
    setCandidats(prev => prev.map(c => ({
      ...c,
      scoreMatch: calculerScoreCV(c.nom, c.notes, c.cvNom, c.poste, c.niveau, c.tags)
    })));
  }, [scoreBase, pointsParMot, bonusMotDansCV, bonusMotDansNotes, bonusJunior, bonusConfirme, bonusSenior, pointsParTag, scoreMin, scoreMax, motsClesPostes]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFichierCV(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !email) return;

    let cvUrl = '';
    let cvNom = '';
    if (fichierCV) {
      cvNom = fichierCV.name;
      cvUrl = URL.createObjectURL(fichierCV);
    }

    const scoreCalcule = calculerScoreCV(nom, '', cvNom, poste, niveau, []);
    const nouveauCandidat: Candidat = {
      id: Date.now(),
      nom,
      poste,
      niveau,
      email,
      statut: 'En attente',
      notes: '',
      tags: [],
      dateEntretien: '',
      cvNom: cvNom || 'Aucun CV joint',
      cvUrl: cvUrl,
      scoreMatch: scoreCalcule,
      etoiles: 3
    };

    setCandidats([nouveauCandidat, ...candidats]);
    setNom('');
    setEmail('');
    setFichierCV(null);
  };

  const ajouterTag = (id: number) => {
    const texteTag = nouveauTagInput[id]?.trim();
    if (!texteTag) return;
    setCandidats(candidats.map(c => {
      if (c.id === id && !c.tags.includes(texteTag)) {
        const nouveauxTags = [...c.tags, texteTag];
        const nouveauScore = calculerScoreCV(c.nom, c.notes, c.cvNom, c.poste, c.niveau, nouveauxTags);
        return { ...c, tags: nouveauxTags, scoreMatch: nouveauScore };
      }
      return c;
    }));
    setNouveauTagInput({ ...nouveauTagInput, [id]: '' });
  };

  const supprimerTag = (candidatId: number, tagAEffacer: string) => {
    setCandidats(candidats.map(c => {
      if (c.id === candidatId) {
        const nouveauxTags = c.tags.filter(t => t !== tagAEffacer);
        const nouveauScore = calculerScoreCV(c.nom, c.notes, c.cvNom, c.poste, c.niveau, nouveauxTags);
        return { ...c, tags: nouveauxTags, scoreMatch: nouveauScore };
      }
      return c;
    }));
  };

  const supprimerCandidat = (id: number) => {
    setCandidats(candidats.filter((c) => c.id !== id));
  };

  const changerStatut = (id: number, nouveauStatut: 'En attente' | 'Retenu' | 'Refusé') => {
    setCandidats(candidats.map(c => c.id === id ? { ...c, statut: nouveauStatut } : c));
  };

  const modifierNotes = (id: number, nouvellesNotes: string) => {
    setCandidats(candidats.map(c => {
      if (c.id === id) {
        const nouveauScore = calculerScoreCV(c.nom, nouvellesNotes, c.cvNom, c.poste, c.niveau, c.tags);
        return { ...c, notes: nouvellesNotes, scoreMatch: nouveauScore };
      }
      return c;
    }));
  };

  const planifierEntretien = (id: number, date: string) => {
    setCandidats(candidats.map(c => c.id === id ? { ...c, dateEntretien: date } : c));
  };

  const modifierEtoiles = (id: number, etoiles: number) => {
    setCandidats(candidats.map(c => c.id === id ? { ...c, etoiles } : c));
  };

  const exporterCSV = () => {
    const entetes = "ID,Nom,Email,Poste,Niveau,Statut,Pertinence %,Evaluation Etoiles,Tags,Date Entretien,Fichier CV,Notes\n";
    const lignes = candidats.map(c => 
      `"${c.id}","${c.nom}","${c.email}","${c.poste}","${c.niveau}","${c.statut}","${c.scoreMatch}%","${c.etoiles}/5","${c.tags.join(';')}","${c.dateEntretien}","${c.cvNom}","${c.notes.replace(/"/g, '""')}"`
    ).join("\n");

    const blob = new Blob(["\uFEFF" + entetes + lignes], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.setAttribute('href', url);
    lien.setAttribute('download', `reporting_ats_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
  };

  const envoyerEmail = (candidat: Candidat, type: 'entretien' | 'refus') => {
    let sujet = "";
    let corps = "";
    if (type === 'entretien') {
      sujet = encodeURIComponent(`Invitation à un entretien RH - Poste : ${candidat.poste}`);
      corps = encodeURIComponent(
        `Bonjour ${candidat.nom},\n\nSuite à l'examen de votre candidature pour le poste de ${candidat.poste}, nous avons le plaisir de vous inviter à un entretien RH.\n\n` +
        (candidat.dateEntretien ? `Date prévue : ${new Date(candidat.dateEntretien).toLocaleString('fr-FR')}\n\n` : '') +
        `Merci de nous confirmer votre disponibilité.\n\nCordialement,\nService Recrutement & E-RH`
      );
    } else {
      sujet = encodeURIComponent(`Suivi de votre candidature - Poste : ${candidat.poste}`);
      corps = encodeURIComponent(
        `Bonjour ${candidat.nom},\n\nNous vous remercions pour votre intérêt pour le poste de ${candidat.poste}.\n\n` +
        `Après étude de votre dossier, nous sommes au regret de vous informer que votre profil n'a pas été retenu.\n\n` +
        `Cordialement,\nService Recrutement & E-RH`
      );
    }
    window.open(`mailto:${candidat.email}?subject=${sujet}&body=${corps}`, '_blank');
  };

  const genererQuestionsEntretien = (posteVise: string, level: string): string[] => {
    if (posteVise.includes('Recrutement')) {
      return [
        `Comment menez-vous une stratégie de sourcing multicanal pour un profil ${level} ?`,
        `Quels indicateurs (KPI) suivez-vous pour mesurer l'efficacité du processus de recrutement ?`,
        `Comment gérez-vous une négociation salariale délicate avec un candidat validé ?`
      ];
    } else if (posteVise.includes('Paie')) {
      return [
        `Quelle est votre maîtrise des déclarations sociales nominatives (DSN) et des charges ?`,
        `Comment procédez-vous au contrôle rigoureux des variables de paie mensuelles ?`,
        `Comment gérez-vous la veille juridique et sociale en cas de modification du code du travail ?`
      ];
    }
    return [
      `Quelles sont vos motivations pour rejoindre notre département RH en tant que ${level} ?`,
      `Comment organisez-vous votre charge de travail administrative au quotidien ?`,
      `Décrivez une situation complexe que vous avez résolue avec succès.`
    ];
  };

  const getStatutColor = (statut: string) => {
    if (statut === 'Retenu') return '#16a34a';
    if (statut === 'Refusé') return '#dc2626';
    return '#ca8a04';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#ca8a04';
    return '#dc2626';
  };

  const totalCandidats = candidats.length;
  const nbQualifies = candidats.filter(c => c.scoreMatch >= 80).length;
  const nbEntretiens = candidats.filter(c => c.dateEntretien !== '').length;
  const nbRetenus = candidats.filter(c => c.statut === 'Retenu').length;
  const tauxConversion = totalCandidats > 0 ? Math.round((nbRetenus / totalCandidats) * 100) : 0;
  const scoreMoyen = totalCandidats > 0 ? Math.round(candidats.reduce((acc, c) => acc + c.scoreMatch, 0) / totalCandidats) : 0;

  const candidatsFiltresEtTries = candidats
    .filter(c => {
      const matchStatut = filtreStatut === 'Tous' || c.statut === filtreStatut;
      const matchPoste = filtrePoste === 'Tous' || c.poste === filtrePoste;
      const matchNiveau = filtreNiveau === 'Tous' || c.niveau === filtreNiveau;
      const texteRecherche = recherche.toLowerCase();
      const matchTexte = 
        c.nom.toLowerCase().includes(texteRecherche) ||
        c.email.toLowerCase().includes(texteRecherche) ||
        c.poste.toLowerCase().includes(texteRecherche) ||
        c.tags.some(t => t.toLowerCase().includes(texteRecherche));

      return matchStatut && matchPoste && matchNiveau && matchTexte;
    })
    .sort((a, b) => {
      if (critereTri === 'score') return b.scoreMatch - a.scoreMatch;
      if (critereTri === 'nom') return a.nom.localeCompare(b.nom);
      return b.id - a.id;
    });

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', padding: '24px', backgroundColor: '#f1f5f9', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* BARRE SUPÉRIEURE DE SESSION & ACTIONS */}
      <div style={{
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        padding: '10px 20px',
        borderRadius: '10px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '3px 8px',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '11px',
            textTransform: 'uppercase'
          }}>
            💼 Espace Recruteur
          </span>
          <span>
            Connecté en tant que : <strong>{user.name}</strong> ({user.email})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* BOUTON CRÉER MANUELLEMENT UNE OFFRE D'EMPLOI */}
          <button
            onClick={() => setIsCreateJobModalOpen(true)}
            style={{
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
              transition: 'all 0.15s ease'
            }}
          >
            <span>+ Publier une Offre</span>
            <span>🚀</span>
          </button>

          {/* BOUTON TIROIR MESSAGES RH AVEC BADGE NON LU */}
          <button
            onClick={() => handleOpenChat()}
            style={{
              backgroundColor: totalUnreadMessages > 0 ? '#2563eb' : '#334155',
              color: 'white',
              border: totalUnreadMessages > 0 ? '1px solid #60a5fa' : '1px solid #475569',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: totalUnreadMessages > 0 ? '0 0 12px rgba(37,99,235,0.4)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>💬 Messagerie Candidats</span>
            {totalUnreadMessages > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                {totalUnreadMessages} non lu{totalUnreadMessages > 1 ? 's' : ''}
              </span>
            )}
          </button>

          {/* LIEN VERS L'ESPACE CARRIÈRES PUBLIQUE */}
          {onViewCareersPage && (
            <button
              onClick={onViewCareersPage}
              style={{
                backgroundColor: '#334155',
                color: '#93c5fd',
                border: '1px solid #475569',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              🌐 Voir Page Carrières
            </button>
          )}

          {candidats.length > 0 && onSwitchToCandidatePreview && (
            <button
              onClick={() => onSwitchToCandidatePreview(candidats[0])}
              style={{
                backgroundColor: '#334155',
                color: '#cbd5e1',
                border: '1px solid #475569',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              👁️ Espace Candidat ({candidats[0].nom})
            </button>
          )}

          <button
            onClick={onLogout}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Se déconnecter</span>
            <span>🚪</span>
          </button>
        </div>
      </div>

      {/* EN-TÊTE PRINCIPAL DU DASHBOARD — supprimé */}

      {/* ======================================================== */}
      {/* SECTION GESTION DES OFFRES D'EMPLOI PUBLIÉES             */}
      {/* ======================================================== */}
      {afficherOffres && (
        <section style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', border: '2px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            <div>
              <h2 style={{ fontSize: '16px', margin: 0, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📋 Offres d'Emploi Actives sur le Portail Carrières</span>
                <span style={{ fontSize: '12px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px' }}>
                  {jobs.length} en ligne
                </span>
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Créez manuellement de nouveaux postes pour les publier sur l'espace carrières et les associer au moteur de scoring.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setIsCreateJobModalOpen(true)}
                style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>+ Nouvelle Offre</span>
              </button>

              {onViewCareersPage && (
                <button
                  onClick={onViewCareersPage}
                  style={{ backgroundColor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '8px 14px', borderRadius: '6px', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
                >
                  👁️ Aperçu Public (/careers)
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px' }}>
            {jobs.map((job) => {
              const nbCandidatsPoste = candidats.filter(c => c.poste === job.titre || c.jobId === job.id).length;

              const depColor: Record<string, string> = {
                'Recrutement & Talent': '#2563eb',
                'Paie & SIRH': '#7c3aed',
                'Ressources Humaines': '#059669',
                'Formation & Développement': '#ea580c',
                'Relations Sociales': '#dc2626',
                'Direction Générale & Support': '#0891b2',
              };
              const color = depColor[job.departement] || '#334155';

              const lightColor: Record<string, string> = {
                '#2563eb': 'rgba(37,99,235,0.82)',
                '#7c3aed': 'rgba(124,58,237,0.82)',
                '#059669': 'rgba(5,150,105,0.82)',
                '#ea580c': 'rgba(234,88,12,0.82)',
                '#dc2626': 'rgba(220,38,38,0.82)',
                '#0891b2': 'rgba(8,145,178,0.82)',
                '#334155': 'rgba(51,65,85,0.82)',
              };
              const frontColor = lightColor[color] || 'rgba(51,65,85,0.82)';

              return (
                <div key={job.id}>
                  <div
                    style={{
                      borderRadius: '18px',
                      overflow: 'hidden',
                      boxShadow: `0 6px 20px ${color}28, 0 2px 6px rgba(0,0,0,0.07)`,
                      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                      minHeight: '260px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 36px ${color}38, 0 4px 12px rgba(0,0,0,0.10)`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px ${color}28, 0 2px 6px rgba(0,0,0,0.07)`;
                    }}
                  >
                    {/* Zone supérieure : fond coloré + documents */}
                    <div style={{
                      backgroundColor: color,
                      padding: '18px 18px 0 18px',
                      minHeight: '110px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      <div style={{ position: 'relative', width: '120px', height: '80px', marginBottom: '-8px' }}>
                        {/* Doc arrière */}
                        <div style={{ position: 'absolute', right: '0', bottom: '0', width: '74px', height: '72px', backgroundColor: 'rgba(255,255,255,0.50)', borderRadius: '7px 7px 0 0', transform: 'rotate(6deg)', transformOrigin: 'bottom center' }}>
                          <div style={{ padding: '7px 7px 0 7px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: '2px', width: '75%' }} />
                            <div style={{ height: '3px', backgroundColor: 'rgba(255,255,255,0.38)', borderRadius: '2px', width: '55%' }} />
                          </div>
                        </div>
                        {/* Doc milieu */}
                        <div style={{ position: 'absolute', left: '16px', bottom: '0', width: '74px', height: '78px', backgroundColor: 'rgba(255,255,255,0.68)', borderRadius: '7px 7px 0 0', transform: 'rotate(-3deg)', transformOrigin: 'bottom center' }}>
                          <div style={{ padding: '7px 7px 0 7px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: '2px', width: '70%' }} />
                            <div style={{ height: '3px', backgroundColor: 'rgba(255,255,255,0.48)', borderRadius: '2px', width: '52%' }} />
                          </div>
                        </div>
                        {/* Doc devant */}
                        <div style={{ position: 'absolute', left: '30px', bottom: '0', width: '74px', height: '84px', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: '7px 7px 0 0' }}>
                          <div style={{ padding: '9px 7px 0 7px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ height: '4px', backgroundColor: `${color}70`, borderRadius: '2px', width: '78%' }} />
                            <div style={{ height: '3px', backgroundColor: 'rgba(0,0,0,0.10)', borderRadius: '2px', width: '58%' }} />
                            <div style={{ height: '3px', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '2px', width: '68%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Zone inférieure : flap */}
                    <div style={{
                      background: `linear-gradient(150deg, ${frontColor} 0%, ${color} 100%)`,
                      padding: '16px 18px 16px 18px',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      {/* Badge contrat + date */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ backgroundColor: 'rgba(255,255,255,0.20)', color: 'white', padding: '2px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>
                          {job.typeContrat}
                        </span>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)' }}>
                          {job.datePublication}
                        </span>
                      </div>

                      {/* Titre */}
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'white', lineHeight: '1.3', textShadow: '0 1px 3px rgba(0,0,0,0.18)' }}>
                        {job.titre}
                      </h3>

                      {/* Localisation */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '11px' }}>📍</span>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>
                          {job.localisation}{job.salaire ? ` • 💰 ${job.salaire}` : ''}
                        </span>
                      </div>

                      {/* Tags */}
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {job.competencesCles.slice(0, 4).map(k => (
                          <span key={k} style={{ backgroundColor: 'rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.90)', padding: '1px 7px', borderRadius: '5px', fontSize: '10px', fontWeight: '600' }}>
                            #{k}
                          </span>
                        ))}
                      </div>

                      {/* Footer : candidats + actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.18)' }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          👥 {nbCandidatsPoste} candidat{nbCandidatsPoste > 1 ? 's' : ''}
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => { setFiltrePoste(job.titre); setPoste(job.titre); }}
                            style={{ backgroundColor: 'rgba(255,255,255,0.20)', color: 'white', border: '1.5px solid rgba(255,255,255,0.45)', padding: '4px 10px', borderRadius: '14px', fontSize: '10px', cursor: 'pointer', fontWeight: '700' }}
                          >
                            Filtrer
                          </button>
                          {onDeleteJob && jobs.length > 1 && (
                            <button
                              onClick={() => onDeleteJob(job.id)}
                              style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.30)', color: 'white', padding: '4px 8px', borderRadius: '14px', fontSize: '10px', cursor: 'pointer', fontWeight: '700' }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* --- TABLEAU DE BORD DÉTAILLÉ --- */}
      {afficherDashboard && (
        <section style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '16px', margin: '0 0 16px 0', color: '#0f172a' }}>
            Tableau de Bord Détaillé & Indicateurs Analytiques
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>TOTAL CANDIDATS</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>{totalCandidats}</p>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #8b5cf6' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>SCORE MOYEN</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#8b5cf6' }}>{scoreMoyen}%</p>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #ca8a04' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>ENTRETIENS</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#ca8a04' }}>{nbEntretiens}</p>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>RETENUS</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#16a34a' }}>{nbRetenus}</p>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>TAUX CONVERSION</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#0284c7' }}>{tauxConversion}%</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <strong style={{ fontSize: '13px', color: '#334155', display: 'block', marginBottom: '12px' }}>
                Répartition des Profils par Phase du Processus
              </strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', marginBottom: '3px' }}>
                    <span>Phase 1 : Sourcing ({totalCandidats})</span><span>100%</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', backgroundColor: '#2563eb' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', marginBottom: '3px' }}>
                    <span>Phase 2 : Qualifiés ≥80% ({nbQualifies})</span>
                    <span>{totalCandidats > 0 ? Math.round((nbQualifies / totalCandidats) * 100) : 0}%</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${totalCandidats > 0 ? (nbQualifies / totalCandidats) * 100 : 0}%`, height: '100%', backgroundColor: '#8b5cf6' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', marginBottom: '3px' }}>
                    <span>Phase 3 : Entretiens ({nbEntretiens})</span>
                    <span>{totalCandidats > 0 ? Math.round((nbEntretiens / totalCandidats) * 100) : 0}%</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${totalCandidats > 0 ? (nbEntretiens / totalCandidats) * 100 : 0}%`, height: '100%', backgroundColor: '#ca8a04' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', marginBottom: '3px' }}>
                    <span>Phase 4 : Retenus ({nbRetenus})</span><span>{tauxConversion}%</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${tauxConversion}%`, height: '100%', backgroundColor: '#16a34a' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <strong style={{ fontSize: '13px', color: '#334155', display: 'block', marginBottom: '12px' }}>
                Volumétrie des Candidatures par Poste
              </strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.keys(motsClesPostes).map((p) => {
                  const nbPourPoste = candidats.filter(c => c.poste === p).length;
                  const pctPoste = totalCandidats > 0 ? Math.round((nbPourPoste / totalCandidats) * 100) : 0;
                  return (
                    <div key={p}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', marginBottom: '3px' }}>
                        <span>{p} ({nbPourPoste})</span><span>{pctPoste}%</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pctPoste}%`, height: '100%', backgroundColor: '#0284c7' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- PHASE DES MOTS-CLÉS (RÉFÉRENTIEL PAR POSTE) --- */}
      {afficherPhaseMotsCles && (
        <section style={{ backgroundColor: '#ffffff', border: '2px solid #7c3aed', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(124,58,237,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #7c3aed', paddingBottom: '8px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#7c3aed' }}>
                Phase de Référentiel : Gestion des Mots-Clés par Poste
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Définissez les mots-clés clés pour chaque fiche de poste afin d'alimenter l'algorithme de matching
              </p>
            </div>

            <form onSubmit={ajouterNouveauPoste} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Nouveau poste..."
                value={nouveauPosteNom}
                onChange={(e) => setNouveauPosteNom(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
              <button type="submit" style={{ backgroundColor: '#7c3aed', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                + Créer Poste
              </button>
            </form>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {Object.entries(motsClesPostes).map(([posteNom, mots]) => (
              <div key={posteNom} style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>{posteNom}</strong>
                  {Object.keys(motsClesPostes).length > 1 && (
                    <button 
                      onClick={() => supprimerPoste(posteNom)}
                      style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                    >
                      Supprimer Poste
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {mots.map(m => (
                    <span key={m} style={{ backgroundColor: '#ede9fe', color: '#6d28d9', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {m}
                      <button onClick={() => supprimerMotCleDuPoste(posteNom, m)} style={{ border: 'none', background: 'none', color: '#6d28d9', cursor: 'pointer', padding: 0, fontSize: '10px', fontWeight: 'bold' }}>X</button>
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <input 
                    type="text"
                    placeholder="+ Ajouter un mot-clé..."
                    value={nouveauMotInput[posteNom] || ''}
                    onChange={(e) => setNouveauMotInput({ ...nouveauMotInput, [posteNom]: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ajouterMotCleAuPoste(posteNom); } }}
                    style={{ flex: 1, padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                  />
                  <button onClick={() => ajouterMotCleAuPoste(posteNom)} style={{ backgroundColor: '#7c3aed', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Ajouter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- PHASE DE PARAMÉTRAGE DU SCORE --- */}
      {afficherPhaseScore && (
        <section style={{ backgroundColor: '#ffffff', border: '2px solid #2563eb', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(37,99,235,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #2563eb', paddingBottom: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', color: '#2563eb' }}>
              Phase de Paramétrage du Score & Pondération Multicritère
            </h2>
            <button onClick={() => setAfficherPhaseScore(false)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
              Fermer
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '14px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#1e40af' }}>1. Barème & Emplacement</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600' }}>Score de base (%) :</label>
                  <input type="number" value={scoreBase} onChange={(e) => setScoreBase(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600' }}>Points / Mot-clé standard :</label>
                  <input type="number" value={pointsParMot} onChange={(e) => setPointsParMot(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600' }}>Bonus si mot dans Nom CV :</label>
                  <input type="number" value={bonusMotDansCV} onChange={(e) => setBonusMotDansCV(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600' }}>Bonus si mot dans Notes RH :</label>
                  <input type="number" value={bonusMotDansNotes} onChange={(e) => setBonusMotDansNotes(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#166534' }}>2. Bonus Expérience</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600' }}>Junior :</label>
                  <input type="number" value={bonusJunior} onChange={(e) => setBonusJunior(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600' }}>Confirmé :</label>
                  <input type="number" value={bonusConfirme} onChange={(e) => setBonusConfirme(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600' }}>Senior :</label>
                  <input type="number" value={bonusSenior} onChange={(e) => setBonusSenior(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#fefce8', padding: '14px', borderRadius: '8px', border: '1px solid #fef08a' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#854d0e' }}>3. Compétences & Bornes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600' }}>Points / Tag :</label>
                  <input type="number" value={pointsParTag} onChange={(e) => setPointsParTag(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600' }}>Min (%) :</label>
                    <input type="number" value={scoreMin} onChange={(e) => setScoreMin(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600' }}>Max (%) :</label>
                    <input type="number" value={scoreMax} onChange={(e) => setScoreMax(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FILTRES GLOBAUX */}
      <section style={{ backgroundColor: 'white', padding: '16px', borderRadius: '10px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <input type="text" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher nom, email..." style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
          <select value={filtrePoste} onChange={(e) => setFiltrePoste(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
            <option value="Tous">Tous les postes</option>
            {Object.keys(motsClesPostes).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filtreNiveau} onChange={(e) => setFiltreNiveau(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
            <option value="Tous">Tous les niveaux</option>
            <option value="Junior">Junior</option>
            <option value="Confirmé">Confirmé</option>
            <option value="Senior">Senior</option>
          </select>
          <select value={critereTri} onChange={(e) => setCritereTri(e.target.value as any)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #2563eb', fontWeight: 'bold', color: '#2563eb', fontSize: '12px' }}>
            <option value="score">Pertinence (%)</option>
            <option value="recence">Plus Récents</option>
            <option value="nom">Par Nom (A-Z)</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['Tous', 'En attente', 'Retenu', 'Refusé'].map((statut) => (
            <button
              key={statut}
              onClick={() => setFiltreStatut(statut)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: filtreStatut === statut ? '#2563eb' : '#f1f5f9',
                color: filtreStatut === statut ? 'white' : '#475569',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              {statut} ({statut === 'Tous' ? candidats.length : candidats.filter(c => c.statut === statut).length})
            </button>
          ))}
        </div>
      </section>

      {/* --- PHASES DE RECRUTEMENT --- */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px' }}>
          {/* PHASE 1 : SOURCING */}
          <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
            <h2 style={{ fontSize: '15px', margin: '0 0 16px 0', borderBottom: '2px solid #2563eb', paddingBottom: '8px', color: '#2563eb' }}>
              Phase 1 : Sourcing & Réception
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '12px' }}>Nom complet :</label>
                <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Sara Srhir" required style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '12px' }}>Email :</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: sara@email.com" required style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '12px' }}>Poste visé :</label>
                <select value={poste} onChange={(e) => setPoste(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                  {Object.keys(motsClesPostes).map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '12px' }}>Niveau d'expérience :</label>
                <select value={niveau} onChange={(e) => setNiveau(e.target.value as any)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                  <option value="Junior">Junior (0-2 ans)</option>
                  <option value="Confirmé">Confirmé (2-5 ans)</option>
                  <option value="Senior">Senior (+5 ans)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '12px' }}>Document CV (PDF) :</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ width: '100%', fontSize: '12px' }} />
              </div>
              <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                Enregistrer le Candidat
              </button>
            </form>
          </section>

          {/* PHASE 2 : QUALIFICATION & RANKING */}
          <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', borderTop: '4px solid #8b5cf6' }}>
            <h2 style={{ fontSize: '15px', margin: '0 0 12px 0', borderBottom: '2px solid #8b5cf6', paddingBottom: '8px', color: '#7c3aed' }}>
              Phase 2 : Qualification & Ranking (%)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
              {candidatsFiltresEtTries.map((c) => {
                const unread = getCandidateUnreadCount(c.id);
                return (
                  <div key={c.id} style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '14px' }}>{c.nom}</strong> — <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '12px' }}>{c.poste}</span>
                      <br />
                      <small style={{ color: '#64748b', fontSize: '11px' }}>{c.email} | {c.niveau}</small>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ backgroundColor: getScoreColor(c.scoreMatch) + '15', color: getScoreColor(c.scoreMatch), border: `1px solid ${getScoreColor(c.scoreMatch)}`, padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '12px' }}>
                        {c.scoreMatch}%
                      </span>

                      {/* BOUTON CHAT DIRECT */}
                      <button
                        onClick={() => handleOpenChat(c.id)}
                        title="Ouvrir la messagerie avec ce candidat"
                        style={{
                          backgroundColor: unread > 0 ? '#eff6ff' : '#ffffff',
                          color: '#2563eb',
                          border: unread > 0 ? '1px solid #2563eb' : '1px solid #cbd5e1',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>💬</span>
                        {unread > 0 && (
                          <span style={{ backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', padding: '1px 5px', fontSize: '10px' }}>
                            {unread}
                          </span>
                        )}
                      </button>

                      {onSwitchToCandidatePreview && (
                        <button
                          onClick={() => onSwitchToCandidatePreview(c)}
                          title="Voir son Espace Candidat"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                        >
                          👁️
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* PHASE 3 : ENTRETIENS */}
        <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', borderTop: '4px solid #ca8a04' }}>
          <h2 style={{ fontSize: '15px', margin: '0 0 16px 0', borderBottom: '2px solid #ca8a04', paddingBottom: '8px', color: '#a16207' }}>
            Phase 3 : Planification & Guide de Questions d'Entretien
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {candidatsFiltresEtTries.map((c) => {
              const questionsRecommandees = genererQuestionsEntretien(c.poste, c.niveau);
              const unread = getCandidateUnreadCount(c.id);
              return (
                <div key={c.id} style={{ border: '1px solid #e2e8f0', padding: '14px', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{c.nom}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{c.poste} ({c.niveau})</span>
                      <button
                        onClick={() => handleOpenChat(c.id)}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: '600'
                        }}
                      >
                        💬 Chat {unread > 0 && `(${unread})`}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Date d'entretien :</span>
                    <input type="datetime-local" value={c.dateEntretien} onChange={(e) => planifierEntretien(c.id, e.target.value)} style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', flex: 1 }} />
                  </div>

                  <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e40af', display: 'block', marginBottom: '4px' }}>
                      Questions suggérées pour cet entretien :
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#1e3a8a' }}>
                      {questionsRecommandees.map((q, idx) => <li key={idx} style={{ marginBottom: '2px' }}>{q}</li>)}
                    </ul>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => envoyerEmail(c, 'entretien')} style={{ flex: 1, backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Envoyer Convocation Email
                    </button>
                    <button onClick={() => handleOpenChat(c.id)} style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Inviter via Chat 💬
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PHASE 4 : DÉCISION FINALE */}
        <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', borderTop: '4px solid #16a34a' }}>
          <h2 style={{ fontSize: '15px', margin: '0 0 16px 0', borderBottom: '2px solid #16a34a', paddingBottom: '8px', color: '#15803d' }}>
            Phase 4 : Décisions Finales & Évaluation par Étoiles
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {candidatsFiltresEtTries.map((c) => {
              const unread = getCandidateUnreadCount(c.id);
              return (
                <div key={c.id} style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '15px' }}>{c.nom}</strong> — <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{c.poste}</span>
                      <br />
                      <small style={{ color: '#64748b' }}>{c.email} | Statut : <span style={{ color: getStatutColor(c.statut), fontWeight: 'bold' }}>{c.statut}</span></small>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => handleOpenChat(c.id)}
                        style={{
                          backgroundColor: '#ffffff',
                          border: unread > 0 ? '1px solid #2563eb' : '1px solid #cbd5e1',
                          color: '#2563eb',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>💬 Échanger</span>
                        {unread > 0 && (
                          <span style={{ backgroundColor: '#2563eb', color: 'white', padding: '1px 5px', borderRadius: '8px', fontSize: '10px' }}>
                            {unread}
                          </span>
                        )}
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>Note :</span>
                        <select value={c.etoiles} onChange={(e) => modifierEtoiles(c.id, Number(e.target.value))} style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                          <option value={1}>1 / 5</option>
                          <option value={2}>2 / 5</option>
                          <option value={3}>3 / 5</option>
                          <option value={4}>4 / 5</option>
                          <option value={5}>5 / 5</option>
                        </select>
                      </div>

                      <select value={c.statut} onChange={(e) => changerStatut(c.id, e.target.value as any)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold' }}>
                        <option value="En attente">En attente</option>
                        <option value="Retenu">Retenu</option>
                        <option value="Refusé">Refusé</option>
                      </select>

                      <button onClick={() => supprimerCandidat(c.id)} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                        Supprimer
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <small style={{ fontWeight: 'bold', color: '#475569', fontSize: '11px' }}>Tags compétences :</small>
                    {c.tags.map(t => (
                      <span key={t} style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {t}
                        <button onClick={() => supprimerTag(c.id, t)} style={{ border: 'none', background: 'none', color: '#1e40af', cursor: 'pointer', padding: 0, fontSize: '10px' }}>X</button>
                      </span>
                    ))}
                    <input type="text" placeholder="+ Ajouter tag" value={nouveauTagInput[c.id] || ''} onChange={(e) => setNouveauTagInput({ ...nouveauTagInput, [c.id]: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ajouterTag(c.id); } }} style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', width: '90px' }} />
                  </div>

                  <div>
                    <input type="text" value={c.notes} onChange={(e) => modifierNotes(c.id, e.target.value)} placeholder="Notes d'évaluation et commentaires de décision finale..." style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: '#ffffff' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* TIROIR DÉROULANT DU CHAT CANDIDATS (SLIDE-OVER DRAWER) */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={user}
        candidats={candidats}
        activeCandidateId={activeChatCandidateId}
        onSelectCandidate={(id) => setActiveChatCandidateId(id)}
        messages={messages}
        onSendMessage={onSendMessage}
        onMarkAsRead={onMarkAsRead}
      />

      {/* MODALE DE CRÉATION MANUELLE D'OFFRE D'EMPLOI */}
      <CreateJobOfferModal
        isOpen={isCreateJobModalOpen}
        onClose={() => setIsCreateJobModalOpen(false)}
        onCreateJob={handleCreateJobOffer}
        onViewCareersPage={onViewCareersPage}
      />
    </div>
  );
};
