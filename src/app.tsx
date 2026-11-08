import React, { useState, useEffect } from 'react';
import type { AuthUser, Candidat, ChatMessage, ApplicationPayload, JobOpening } from './types';
import { LoginPage } from './components/LoginPage';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { CandidatePortal } from './components/CandidatePortal';
import { CareersPage } from './components/CareersPage';
import { loadChatMessages, saveChatMessages } from './services/chatService';
import { ACTIVE_JOB_OPENINGS } from './data/jobOpenings';

const INITIAL_CANDIDATS: Candidat[] = [
  { 
    id: 1, 
    nom: 'Mohamed Alami', 
    poste: 'Chargé(e) de Recrutement & Sourcing RH', 
    niveau: 'Confirmé',
    email: 'mohamed.alami@email.com', 
    statut: 'En attente', 
    notes: 'Sourcing, conduite d entretiens et gestion ATS', 
    tags: ['Sourcing', 'GPEC'],
    dateEntretien: '2026-11-05T14:00', 
    cvNom: 'CV_Mohamed_Recrutement.pdf', 
    cvUrl: '',
    scoreMatch: 88,
    etoiles: 4
  },
  { 
    id: 2, 
    nom: 'Sara Srhir', 
    poste: 'Gestionnaire Paie & SIRH Confirmé(e)', 
    niveau: 'Senior',
    email: 'sara.srhir@email.com', 
    statut: 'Retenu', 
    notes: 'Bulletins de paie, déclarations DSN et SIRH', 
    tags: ['DSN', 'SIRH', 'Excel'],
    dateEntretien: '2026-11-10T10:30', 
    cvNom: 'CV_Sara_Paie.pdf', 
    cvUrl: '',
    scoreMatch: 95,
    etoiles: 5
  }
];

export function App() {
  // GESTION DE LA VUE ACTIVE QUAND NON CONNECTÉ ('auth' | 'careers')
  const [publicView, setPublicView] = useState<'auth' | 'careers'>(() => {
    return window.location.hash === '#careers' ? 'careers' : 'auth';
  });

  // GESTION DU RÉPERTOIRE DES OFFRES D'EMPLOI
  const [jobs, setJobs] = useState<JobOpening[]>(() => {
    const saved = localStorage.getItem('ats_job_openings_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    // Migration depuis v1 en conservant les offres personnalisées créées par le recruteur
    const v1Saved = localStorage.getItem('ats_job_openings_v1');
    if (v1Saved) {
      try {
        const parsed: JobOpening[] = JSON.parse(v1Saved);
        const customJobs = parsed.filter(p => !ACTIVE_JOB_OPENINGS.some(a => a.id === p.id));
        return [...ACTIVE_JOB_OPENINGS, ...customJobs];
      } catch (e) { console.error(e); }
    }
    return ACTIVE_JOB_OPENINGS;
  });

  useEffect(() => {
    localStorage.setItem('ats_job_openings_v2', JSON.stringify(jobs));
  }, [jobs]);

  const handleAddJob = (newJob: JobOpening) => {
    setJobs(prev => [newJob, ...prev]);
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
  };

  // GESTION DU REPOSITOIRE CANDIDATS
  const [candidats, setCandidats] = useState<Candidat[]>(() => {
    const saved = localStorage.getItem('candidats_ats_v21');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_CANDIDATS;
  });

  useEffect(() => {
    localStorage.setItem('candidats_ats_v21', JSON.stringify(candidats));
  }, [candidats]);

  // GESTION DE LA MESSAGERIE EN TEMPS RÉEL (CHAT)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return loadChatMessages();
  });

  // Synchronisation inter-onglets du chat et des données
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ats_chat_messages_v1' && e.newValue) {
        try {
          setMessages(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Erreur synchro chat', err);
        }
      }
      if (e.key === 'candidats_ats_v21' && e.newValue) {
        try {
          setCandidats(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Erreur synchro candidats', err);
        }
      }
      if (e.key === 'ats_job_openings_v2' && e.newValue) {
        try {
          setJobs(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Erreur synchro jobs', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Écoute de l'ancre URL (#careers)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#careers') {
        setPublicView('careers');
      } else if (window.location.hash === '#login' || window.location.hash === '') {
        setPublicView('auth');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // GESTION DE LA SESSION UTILISATEUR & RÔLE (RBAC)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const savedSession = localStorage.getItem('ats_auth_session');
    if (savedSession) {
      try { return JSON.parse(savedSession); } catch (e) { console.error(e); }
    }
    return null;
  });

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem('ats_auth_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ats_auth_session');
    setPublicView('auth');
    window.location.hash = '';
  };

  const handleSendMessage = (
    candidateId: number,
    text: string,
    type: 'text' | 'template' | 'interview_invite' = 'text'
  ) => {
    const isRecruiter = currentUser?.role === 'recruiter';
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      candidateId,
      recruiterId: isRecruiter && currentUser ? currentUser.id : 'rec-001',
      senderRole: isRecruiter ? 'recruiter' : 'candidate',
      senderName: currentUser ? currentUser.name : 'Équipe Recrutement RH',
      text,
      timestamp: new Date().toISOString(),
      readByRecruiter: isRecruiter,
      readByCandidate: !isRecruiter,
      type
    };

    setMessages(prev => {
      const updated = [...prev, newMsg];
      saveChatMessages(updated);
      return updated;
    });
  };

  const handleMarkAsReadByRecruiter = (candidateId: number) => {
    setMessages(prev => {
      let changed = false;
      const updated = prev.map(m => {
        if (m.candidateId === candidateId && !m.readByRecruiter) {
          changed = true;
          return { ...m, readByRecruiter: true };
        }
        return m;
      });
      if (changed) saveChatMessages(updated);
      return changed ? updated : prev;
    });
  };

  const handleMarkAsReadByCandidate = (candidateId: number) => {
    setMessages(prev => {
      let changed = false;
      const updated = prev.map(m => {
        if (m.candidateId === candidateId && !m.readByCandidate) {
          changed = true;
          return { ...m, readByCandidate: true };
        }
        return m;
      });
      if (changed) saveChatMessages(updated);
      return changed ? updated : prev;
    });
  };

  // CALCUL DU MATCHING SCORE LORS DE LA CANDIDATURE
  const calculerScorePourCandidature = (nomCand: string, posteVise: string, level: string, cvNom: string): number => {
    let score = 50;
    if (level === 'Senior') score += 25;
    else if (level === 'Confirmé') score += 18;
    else score += 10;

    if (cvNom && cvNom !== 'Aucun CV joint') score += 12;
    if (posteVise.toLowerCase().includes('recrutement')) score += 8;
    if (posteVise.toLowerCase().includes('paie')) score += 10;
    if (posteVise.toLowerCase().includes('rh')) score += 6;

    return Math.min(Math.max(score, 30), 96);
  };

  // SOUMISSION D'UNE CANDIDATURE DEPUIS LA PAGE CARRIÈRES
  const handleApplicationSubmit = (payload: ApplicationPayload): AuthUser => {
    const scoreCalcule = calculerScorePourCandidature(
      payload.nom,
      payload.jobTitre,
      payload.niveau,
      payload.cvNom
    );

    const nouveau: Candidat = {
      id: Date.now(),
      nom: payload.nom,
      poste: payload.jobTitre,
      niveau: payload.niveau,
      email: payload.email,
      telephone: payload.telephone,
      linkedinUrl: payload.linkedinUrl,
      statut: 'En attente',
      notes: `Prétentions: ${payload.pretentionSalariale} | Préavis: ${payload.preavis} | Screening: "${payload.reponseQuestion}" ${payload.motivation ? `| Note: "${payload.motivation}"` : ''}`,
      tags: ['Portail Carrières', payload.niveau],
      dateEntretien: '',
      cvNom: payload.cvNom,
      cvUrl: payload.cvFile ? URL.createObjectURL(payload.cvFile) : '',
      scoreMatch: scoreCalcule,
      etoiles: 3,
      jobId: payload.jobId,
      pretentionSalariale: payload.pretentionSalariale,
      preavis: payload.preavis,
      reponseScreening: payload.reponseQuestion
    };

    // Injecter dans le repositoire de l'ATS
    setCandidats(prev => [nouveau, ...prev]);

    // Message d'accueil automatique du recruteur dans le chat
    const initialMsg: ChatMessage = {
      id: `msg-${Date.now()}-welcome`,
      candidateId: nouveau.id,
      recruiterId: 'rec-001',
      senderRole: 'recruiter',
      senderName: 'Sarah Benani (Talent Lead)',
      text: `Bonjour ${payload.nom}, bienvenue sur notre espace recrutement ! Nous avons bien reçu votre candidature pour l'offre "${payload.jobTitre}". Notre équipe RH étudie votre profil avec intérêt.`,
      timestamp: new Date().toISOString(),
      readByRecruiter: true,
      readByCandidate: false,
      type: 'template'
    };

    setMessages(prev => {
      const updated = [...prev, initialMsg];
      saveChatMessages(updated);
      return updated;
    });

    const candidateUser: AuthUser = {
      id: String(nouveau.id),
      email: payload.email,
      name: payload.nom,
      role: 'candidate',
      title: payload.jobTitre,
    };

    return candidateUser;
  };

  const handleUpdateCandidateCV = (cvNom: string) => {
    if (!currentUser) return;
    setCandidats(prev => prev.map(c => {
      if (c.email.toLowerCase() === currentUser.email.toLowerCase() || String(c.id) === currentUser.id) {
        return { ...c, cvNom };
      }
      return c;
    }));
  };

  const handleSwitchToCandidatePreview = (candidat: Candidat) => {
    const previewUser: AuthUser = {
      id: String(candidat.id),
      email: candidat.email,
      name: candidat.nom,
      role: 'candidate',
      title: candidat.poste,
    };
    handleLoginSuccess(previewUser);
  };

  // ========================================================
  // 1. GESTION DES UTILISATEURS AUTHENTIFIÉS
  // ========================================================
  if (currentUser) {
    if (currentUser.role === 'recruiter') {
      return (
        <RecruiterDashboard
          user={currentUser}
          candidats={candidats}
          setCandidats={setCandidats}
          jobs={jobs}
          onAddJob={handleAddJob}
          onDeleteJob={handleDeleteJob}
          onLogout={handleLogout}
          onSwitchToCandidatePreview={handleSwitchToCandidatePreview}
          onViewCareersPage={() => {
            window.location.hash = '#careers';
            setPublicView('careers');
            setCurrentUser(null);
          }}
          messages={messages}
          onSendMessage={handleSendMessage}
          onMarkAsRead={handleMarkAsReadByRecruiter}
        />
      );
    }

    const matchedCandidate = candidats.find(
      c => c.email.toLowerCase() === currentUser.email.toLowerCase() || String(c.id) === currentUser.id
    );

    return (
      <CandidatePortal
        user={currentUser}
        candidat={matchedCandidate}
        onLogout={handleLogout}
        onUpdateCandidateCV={handleUpdateCandidateCV}
        messages={messages}
        onSendMessage={handleSendMessage}
        onMarkAsReadByCandidate={handleMarkAsReadByCandidate}
      />
    );
  }

  // ========================================================
  // 2. UTILISATEURS NON AUTHENTIFIÉS : CARRIÈRES OU LOGIN
  // ========================================================
  if (publicView === 'careers') {
    return (
      <CareersPage
        jobs={jobs}
        onBackToLogin={() => {
          setPublicView('auth');
          window.location.hash = '';
        }}
        onSubmitApplication={handleApplicationSubmit}
        onDirectLoginAsCandidate={(user) => {
          handleLoginSuccess(user);
          window.location.hash = '';
        }}
      />
    );
  }

  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      candidats={candidats}
      onGoToCareers={() => {
        setPublicView('careers');
        window.location.hash = '#careers';
      }}
    />
  );
}

export default App;