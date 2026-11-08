export type UserRole = 'recruiter' | 'candidate';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  title?: string;
  avatar?: string;
}

export interface Candidat {
  id: number;
  nom: string;
  poste: string;
  niveau: 'Junior' | 'Confirmé' | 'Senior';
  email: string;
  telephone?: string;
  linkedinUrl?: string;
  statut: 'En attente' | 'Retenu' | 'Refusé';
  notes: string;
  tags: string[];
  dateEntretien: string;
  cvNom: string;
  cvUrl: string;
  scoreMatch: number;
  etoiles: number;
  jobId?: string;
  pretentionSalariale?: string;
  preavis?: string;
  reponseScreening?: string;
}

export interface ChatMessage {
  id: string;
  candidateId: number;
  recruiterId: string;
  senderRole: 'recruiter' | 'candidate';
  senderName: string;
  text: string;
  timestamp: string;
  readByRecruiter: boolean;
  readByCandidate: boolean;
  type?: 'text' | 'template' | 'interview_invite';
}

export interface CannedTemplate {
  id: string;
  label: string;
  description: string;
  badge: string;
  getContent: (candidatName: string, poste: string) => string;
}

export interface JobOpening {
  id: string;
  titre: string;
  departement: string;
  localisation: string;
  typeContrat: string;
  salaire?: string;
  experienceRequise: 'Junior' | 'Confirmé' | 'Senior';
  descriptionCourte: string;
  responsabilites: string[];
  profilRecherche: string[];
  competencesCles: string[];
  screeningQuestion: string;
  datePublication: string;
}

export interface ApplicationPayload {
  jobId: string;
  jobTitre: string;
  nom: string;
  email: string;
  telephone: string;
  linkedinUrl?: string;
  niveau: 'Junior' | 'Confirmé' | 'Senior';
  pretentionSalariale: string;
  preavis: string;
  reponseQuestion: string;
  motivation: string;
  cvFile?: File | null;
  cvNom: string;
}
