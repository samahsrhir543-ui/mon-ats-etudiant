import type { ChatMessage, CannedTemplate } from '../types';

export const CANNED_TEMPLATES: CannedTemplate[] = [
  {
    id: 'interview_request',
    label: '📅 Invitation Entretien RH',
    description: 'Proposer un créneau d entretien',
    badge: 'Entretien',
    getContent: (nom, poste) =>
      `Bonjour ${nom},\n\nSuite à l'examen de votre profil pour le poste de ${poste}, nous serions ravis de planifier un premier échange RH de 30 minutes.\n\nSeriez-vous disponible cette semaine pour convenir d'un créneau en visioconférence ?\n\nBien cordialement,\nL'équipe Recrutement`
  },
  {
    id: 'followup',
    label: '🔄 Relance Dossier / Dispos',
    description: 'Demander des compléments d informations',
    badge: 'Relance',
    getContent: (nom, poste) =>
      `Bonjour ${nom},\n\nNous faisons le suivi de votre candidature au poste de ${poste}. Avez-vous eu l'opportunité de consulter nos derniers messages et confirmer vos disponibilités ?\n\nRestant à votre écoute,\nL'équipe Recrutement`
  },
  {
    id: 'confirm_receipt',
    label: '✅ Accusé de Réception Dossier',
    description: 'Rassurer le candidat sur la bonne prise en compte',
    badge: 'Réception',
    getContent: (nom, poste) =>
      `Bonjour ${nom},\n\nNous vous confirmons la bonne prise en compte de votre candidature pour l'opportunité de ${poste}. Notre équipe talent étudie vos compétences et reviendra vers vous très prochainement.\n\nCordialement,\nService E-RH`
  },
  {
    id: 'tech_case',
    label: '💻 Test / Cas Pratique',
    description: 'Inviter à l étape de mise en situation',
    badge: 'Évaluation',
    getContent: (nom, poste) =>
      `Bonjour ${nom},\n\nDans le cadre de l'évaluation technique pour le poste de ${poste}, nous vous invitons à réaliser une courte mise en situation professionnelle.\n\nMerci de nous faire signe dès que vous êtes prêt(e) à démarrer le cas pratique.\n\nBien à vous,\nL'équipe Recrutement`
  },
  {
    id: 'offer_update',
    label: '🎉 Étape Suivante & Offre',
    description: 'Féliciter pour le passage d étape',
    badge: 'Sélection',
    getContent: (nom, poste) =>
      `Bonjour ${nom},\n\nExcellente nouvelle ! L'équipe a été particulièrement enthousiaste suite à nos récents échanges pour le poste de ${poste}. Nous souhaitons vous faire avancer vers la phase de proposition finale.\n\nÀ très vite pour les détails !`
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    candidateId: 1,
    recruiterId: 'rec-001',
    senderRole: 'recruiter',
    senderName: 'Sarah Benani (Talent Lead)',
    text: "Bonjour Mohamed, bienvenue dans notre processus de recrutement pour le poste de Chargé(e) de Recrutement. Votre profil nous intéresse vivement !",
    timestamp: '2026-11-02T10:15:00.000Z',
    readByRecruiter: true,
    readByCandidate: true,
    type: 'text'
  },
  {
    id: 'msg-2',
    candidateId: 1,
    recruiterId: 'rec-001',
    senderRole: 'candidate',
    senderName: 'Mohamed Alami',
    text: "Bonjour Sarah ! Merci pour ce retour rapide. Je reste à votre entière disposition pour échanger sur mes expériences en sourcing et ATS.",
    timestamp: '2026-11-02T11:30:00.000Z',
    readByRecruiter: true,
    readByCandidate: true,
    type: 'text'
  },
  {
    id: 'msg-3',
    candidateId: 1,
    recruiterId: 'rec-001',
    senderRole: 'recruiter',
    senderName: 'Sarah Benani (Talent Lead)',
    text: "Nous avons fixé un entretien RH le 05 novembre à 14h00. Avez-vous bien reçu l'invitation ?",
    timestamp: '2026-11-02T14:20:00.000Z',
    readByRecruiter: true,
    readByCandidate: true,
    type: 'interview_invite'
  },
  {
    id: 'msg-4',
    candidateId: 1,
    recruiterId: 'rec-001',
    senderRole: 'candidate',
    senderName: 'Mohamed Alami',
    text: "Oui bien reçu ! Le créneau est parfaitement noté dans mon agenda. À très bientôt.",
    timestamp: '2026-11-02T15:05:00.000Z',
    readByRecruiter: true,
    readByCandidate: true,
    type: 'text'
  },
  // Conversation Sara Srhir (id: 2)
  {
    id: 'msg-5',
    candidateId: 2,
    recruiterId: 'rec-001',
    senderRole: 'recruiter',
    senderName: 'Sarah Benani (Talent Lead)',
    text: "Bonjour Sara, félicitations ! Votre profil pour le poste de Gestionnaire Paie & SIRH a obtenu un score de pertinence exceptionnel de 95%.",
    timestamp: '2026-11-03T09:00:00.000Z',
    readByRecruiter: true,
    readByCandidate: true,
    type: 'text'
  },
  {
    id: 'msg-6',
    candidateId: 2,
    recruiterId: 'rec-001',
    senderRole: 'candidate',
    senderName: 'Sara Srhir',
    text: "Bonjour Sarah, merci beaucoup ! J'ai bien noté l'entretien du 10 novembre à 10h30.",
    timestamp: '2026-11-03T10:45:00.000Z',
    readByRecruiter: true,
    readByCandidate: true,
    type: 'text'
  },
  {
    id: 'msg-7',
    candidateId: 2,
    recruiterId: 'rec-001',
    senderRole: 'candidate',
    senderName: 'Sara Srhir',
    text: "J'ai également mis à jour mon CV avec mes dernières missions de déclarations DSN et SIRH. N'hésitez pas si vous avez la moindre question !",
    timestamp: '2026-11-03T16:20:00.000Z',
    readByRecruiter: false, // Non lu par le recruteur pour tester le badge !
    readByCandidate: true,
    type: 'text'
  }
];

export const loadChatMessages = (): ChatMessage[] => {
  const saved = localStorage.getItem('ats_chat_messages_v1');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Erreur de parsing des messages de chat', e);
    }
  }
  return INITIAL_CHAT_MESSAGES;
};

export const saveChatMessages = (messages: ChatMessage[]) => {
  localStorage.setItem('ats_chat_messages_v1', JSON.stringify(messages));
};
