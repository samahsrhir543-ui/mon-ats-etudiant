import type { JobOpening } from '../types';

export const ACTIVE_JOB_OPENINGS: JobOpening[] = [
  {
    id: 'job-recrutement',
    titre: 'Chargé(e) de Recrutement & Sourcing RH',
    departement: 'Recrutement & Talent',
    localisation: 'Paris (Hybride - 2j télétravail)',
    typeContrat: 'CDI',
    experienceRequise: 'Confirmé',
    descriptionCourte: 'Prenez en main la stratégie de sourcing multicanal, la conduite des entretiens et le pilotage de l ATS pour nos équipes en forte croissance.',
    responsabilites: [
      'Définir les besoins en recrutement en étroite collaboration avec les managers opérationnels.',
      'Rédiger et multidiffuser les annonces d emploi sur les plateformes cibles et job boards.',
      'Sourcer proactivement des profils qualifiés sur LinkedIn Recruiter, GitHub et viviers internes.',
      'Mener les préqualifications téléphoniques et les entretiens de sélection RH.',
      'Suivre les KPI clés (taux de conversion, délai de recrutement, satisfaction candidats) dans l ATS.'
    ],
    profilRecherche: [
      'Formation Bac+4/5 en Ressources Humaines, École de Commerce ou équivalent.',
      'Expérience confirmée de 2 à 5 ans en cabinet de recrutement ou en entreprise dynamique.',
      'Maîtrise éprouvée des outils ATS modernes et des techniques de sourcing booléen avancées.',
      'Excellente communication orale et écrite, rigueur et aisance relationnelle.'
    ],
    competencesCles: ['Recrutement', 'Sourcing', 'Entretien', 'ATS', 'Profil', 'Talent', 'RH', 'GPEC'],
    screeningQuestion: 'Quelle stratégie de sourcing multicanal mettriez-vous en place pour identifier des profils en pénurie de talents ?',
    datePublication: 'Il y a 2 jours'
  },
  {
    id: 'job-paie',
    titre: 'Gestionnaire Paie & SIRH Confirmé(e)',
    departement: 'Paie & SIRH',
    localisation: 'Lyon (Télétravail partiel)',
    typeContrat: 'CDI',
    experienceRequise: 'Senior',
    descriptionCourte: 'Garantissez la fiabilité et la conformité du cycle complet de paie (350+ collaborateurs) et administrez le SIRH d entreprise.',
    responsabilites: [
      'Collecter, contrôler et saisir l ensemble des éléments variables de paie mensuels.',
      'Établir et contrôler les bulletins de paie dans le respect des règles légales et conventionnelles.',
      'Établir les déclarations sociales nominatives (DSN) mensuelles et annuelles.',
      'Gérer l administration du personnel : entrées/sorties, contrats, soldes de tout compte, attestations.',
      'Participer aux projets d optimisation et d interconnexion du SIRH d entreprise.'
    ],
    profilRecherche: [
      'De formation Bac+2/3 spécialisée en Paie, Comptabilité ou Gestion des RH.',
      '5 ans minimum d expérience en gestion autonome d un portefeuille de paie multi-sites.',
      'Excellente maîtrise d Excel et d un logiciel de paie de référence (Silae, ADP ou Sage).',
      'Rigueur absolue, sens de la confidentialité et veille sociale proactive.'
    ],
    competencesCles: ['Paie', 'SIRH', 'Bulletin', 'Charges', 'Cotisations', 'Excel', 'Déclarations', 'DSN'],
    screeningQuestion: 'Comment organisez-vous vos contrôles de paie et votre veille sur les évolutions réglementaires DSN ?',
    datePublication: 'Il y a 4 jours'
  },
  {
    id: 'job-assistant-rh',
    titre: 'Assistant(e) Ressources Humaines',
    departement: 'Ressources Humaines',
    localisation: 'Paris (Présentiel / Hybride)',
    typeContrat: 'CDD',
    experienceRequise: 'Junior',
    descriptionCourte: 'Accompagnez l équipe RH dans la gestion administrative quotidienne des collaborateurs et les parcours d intégration onboarding.',
    responsabilites: [
      'Rédiger les contrats de travail, avenants et conventions de stage.',
      'Organiser l accueil et le parcours d intégration des nouveaux collaborateurs (Onboarding).',
      'Suivre les visites médicales, les congés payés, arrêts maladie et absences.',
      'Participer à l organisation des événements internes et de la communication RH.',
      'Tenir à jour les dossiers du personnel et les registres légaux.'
    ],
    profilRecherche: [
      'Bac+2/3 en Gestion des RH ou Administration des Entreprises.',
      'Première expérience (stage, alternance ou 1ère année d exercice) en service RH.',
      'Organisation méthodique, polyvalence, enthousiasme et sens du service.',
      'Bonne maîtrise du pack Office (Word, Excel, PowerPoint).'
    ],
    competencesCles: ['Administratif', 'Contrat', 'Intégration', 'Accueil', 'Courrier', 'Dossier', 'RH', 'Congés'],
    screeningQuestion: 'Quelles actions mettez-vous en œuvre pour réussir l intégration (onboarding) d un nouveau collaborateur dès son premier jour ?',
    datePublication: 'Il y a 1 semaine'
  },
  {
    id: 'job-formation',
    titre: 'Responsable Formation & Développement des Compétences',
    departement: 'Formation & Développement',
    localisation: 'Remote / Flex-Office',
    typeContrat: 'CDI',
    experienceRequise: 'Senior',
    descriptionCourte: 'Pilotez la politique de formation professionnelle, le plan de développement des compétences et les relations avec les OPCO.',
    responsabilites: [
      'Recueillir et analyser les besoins en formation auprès des managers et des comités RH.',
      'Bâtir, budgétiser et déployer le plan de développement des compétences annuel.',
      'Sélectionner et négocier avec les organismes de formation externes et concevoir des parcours internes.',
      'Optimiser les financements auprès des OPCO et dispositifs publics (FNE, Pro-A, CPF).',
      'Mesurer l efficacité et le ROI des actions de formation dispensées.'
    ],
    profilRecherche: [
      'Bac+5 en Ingénierie de la Formation, Psychologie du Travail ou Management RH.',
      '5+ ans d expérience dans la gestion de plans de formation de grande envergure.',
      'Excellente connaissance de l écosystème formation professionnelle et des financements OPCO.',
      'Leadership pédagogique, force de proposition et esprit d innovation.'
    ],
    competencesCles: ['Formation', 'Plan', 'Compétences', 'OPCO', 'Budget', 'Stage', 'Développement'],
    screeningQuestion: 'Comment mesurez-vous l impact réel et la montée en compétences suite à un plan de formation managérial ?',
    datePublication: 'Il y a 3 jours'
  },
  {
    id: 'job-talent-intern',
    titre: 'Talent Acquisition & Employer Branding (Stage / PFE)',
    departement: 'Recrutement & Talent',
    localisation: 'Paris (Hybride)',
    typeContrat: 'Stage',
    experienceRequise: 'Junior',
    descriptionCourte: 'Prenez part aux recrutements de stagiaires, alternants et profils juniors tout en animant la marque employeur sur les réseaux.',
    responsabilites: [
      'Assister les recruteurs seniors sur la publication d annonces et le pré-screening.',
      'Participer aux forums écoles et événements carrières universitaires.',
      'Créer du contenu valorisant la vie d entreprise pour LinkedIn et Welcome to the Jungle.',
      'Suivre l expérience candidat du premier contact jusqu à l intégration.'
    ],
    profilRecherche: [
      'Étudiant(e) en Master RH, Communication ou Grande École en recherche de stage de fin d études (6 mois).',
      'Passionné(e) par l univers du recrutement, les nouvelles technologies et la marque employeur.',
      'Dynamisme, esprit d initiative, curiosité et qualités rédactionnelles.'
    ],
    competencesCles: ['Recrutement', 'Talent', 'Sourcing', 'Marque Employeur', 'LinkedIn', 'Communication'],
    screeningQuestion: 'Qu est-ce qui selon vous fait une expérience candidat mémorable et positive lors d un processus de sélection ?',
    datePublication: 'Il y a 5 jours'
  }
];
