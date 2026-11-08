import React, { useState } from 'react';
import type { JobOpening } from '../types';

interface CreateJobOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateJob: (job: JobOpening) => void;
  onViewCareersPage?: () => void;
}

export const CreateJobOfferModal: React.FC<CreateJobOfferModalProps> = ({
  isOpen,
  onClose,
  onCreateJob,
  onViewCareersPage,
}) => {
  const [titre, setTitre] = useState('');
  const [departement, setDepartement] = useState('Ressources Humaines');
  const [typeContrat, setTypeContrat] = useState('CDI');
  const [localisation, setLocalisation] = useState('Paris (Hybride - 2j remote)');
  const [salaire, setSalaire] = useState('8 000 MAD - 12 000 MAD / mois');
  const [experienceRequise, setExperienceRequise] = useState<'Junior' | 'Confirmé' | 'Senior'>('Confirmé');
  const [descriptionCourte, setDescriptionCourte] = useState('');
  const [responsabilitesText, setResponsabilitesText] = useState(
    "Participer au déploiement de la stratégie RH de l'entreprise.\nAccompagner les managers opérationnels dans leurs problématiques quotidiennes.\nPiloter des projets transverses d'amélioration continue et de fidélisation des talents."
  );
  const [profilRechercheText, setProfilRechercheText] = useState(
    "Formation Bac+4/5 spécialisée en Ressources Humaines ou Droit Social.\nExpérience probante de 3 ans minimum sur un périmètre similaire.\nCapacité d'écoute, leadership, diplomatie et sens du travail en équipe."
  );
  const [motsCles, setMotsCles] = useState<string[]>(['rh', 'gestion', 'projet', 'social', 'management']);
  const [nouveauMotCle, setNouveauMotCle] = useState('');
  const [screeningQuestion, setScreeningQuestion] = useState(
    "Quelle est votre plus grande réussite professionnelle dans la conduite d'un projet RH ?"
  );
  const [successCreatedJob, setSuccessCreatedJob] = useState<JobOpening | null>(null);

  if (!isOpen) return null;

  const handleAddKeyword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = nouveauMotCle.trim().toLowerCase();
    if (clean && !motsCles.includes(clean)) {
      setMotsCles([...motsCles, clean]);
      setNouveauMotCle('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setMotsCles(motsCles.filter(k => k !== keyword));
  };

  const handleQuickTemplate = (templateType: 'hrbp' | 'sirh' | 'relations_sociales') => {
    if (templateType === 'hrbp') {
      setTitre('Human Resources Business Partner (HRBP)');
      setDepartement('Ressources Humaines');
      setTypeContrat('CDI');
      setLocalisation('Paris (Hybride)');
      setSalaire('10 000 MAD - 14 000 MAD / mois');
      setExperienceRequise('Senior');
      setDescriptionCourte('Devenez le partenaire stratégique des directions opérationnelles pour accompagner la croissance de nos équipes.');
      setResponsabilitesText(
        "Conseiller et accompagner les managers dans la gestion de leurs équipes et carrières.\nDéployer les processus RH annuels (people reviews, entretiens annuels, plans de succession).\nPiloter les plans de recrutement et de rétention en lien avec les chargés de recrutement.\nGérer les situations disciplinaires et individuelles complexes en conformité avec le droit du travail."
      );
      setProfilRechercheText(
        "Bac+5 RH ou Grande École avec 5+ ans d'expérience en tant qu'HRBP ou Responsable RH.\nExcellente vision business et posture de conseil auprès de profils C-Level.\nAisance relationnelle, négociation et sens de la confidentialité."
      );
      setMotsCles(['hrbp', 'partenaire', 'stratégie', 'management', 'talent', 'revue', 'carrière', 'rh']);
      setScreeningQuestion('Comment abordez-vous la résolution d un désaccord managérial sur une décision de promotion ou de mobilité ?');
    } else if (templateType === 'sirh') {
      setTitre('Chef(fe) de Projet SIRH & Digitalisation RH');
      setDepartement('Paie & SIRH');
      setTypeContrat('CDI');
      setLocalisation('Lyon / Remote partiel');
      setSalaire('9 000 MAD - 13 000 MAD / mois');
      setExperienceRequise('Confirmé');
      setDescriptionCourte('Pilotez le déploiement, l interconnexion et l optimisation continue de nos outils digitaux RH et paie.');
      setResponsabilitesText(
        "Recueillir les besoins métiers et rédiger les cahiers des charges fonctionnels pour le SIRH.\nParamétrer et administrer les modules (Congés, Paie, GTA, Recrutement ATS, Entretiens).\nCoordonner les phases de recette, de migration de données et de tests utilisateurs.\nFormer et accompagner les utilisateurs finaux dans l adoption des solutions numériques."
      );
      setProfilRechercheText(
        "Bac+4/5 en Systèmes d Information ou Gestion RH avec appétence forte pour la tech.\n3 à 5 ans d expérience en gestion de projets SIRH (Workday, Lucca, Cegid, Silae ou SAP).\nExcellentes compétences analytiques, rigueur méthodologique et pédagogie."
      );
      setMotsCles(['sirh', 'projet', 'digital', 'recette', 'outils', 'gta', 'paie', 'données']);
      setScreeningQuestion('Quelles méthodes appliquez-vous pour garantir la qualité et l intégrité des données lors d une migration SIRH ?');
    } else {
      setTitre('Responsable Relations Sociales & CSE');
      setDepartement('Ressources Humaines');
      setTypeContrat('CDI');
      setLocalisation('Paris (Présentiel / Hybride)');
      setSalaire('12 000 MAD - 18 000 MAD / mois');
      setExperienceRequise('Senior');
      setDescriptionCourte('Animez le dialogue social, préparez les réunions du CSE et négociez les accords collectifs d entreprise.');
      setResponsabilitesText(
        "Co-animer les réunions ordinaires et extraordinaires avec les instances représentatives du personnel (CSE, CSSCT).\nPréparer et mener les négociations obligatoires (NAO, égalité pro, télétravail, GEPP).\nAssurer une veille juridique continue et conseiller la direction sur l application du droit social.\nSuperviser les élections professionnelles et entretenir un climat social constructif et serein."
      );
      setProfilRechercheText(
        "Master 2 en Droit Social / Droit du Travail avec minimum 5 ans d expérience sur un poste dédié.\nExpérience avérée de la négociation d accords d entreprise et des relations syndicales.\nExcellente maîtrise du code du travail, diplomatie, fermeté et sens politique."
      );
      setMotsCles(['cse', 'dialogue', 'syndicats', 'accords', 'droit', 'social', 'négociation', 'nao']);
      setScreeningQuestion('Racontez-nous une négociation d accord collectif délicate que vous avez menée à terme avec succès.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) return;

    const responsabilites = responsabilitesText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const profilRecherche = profilRechercheText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const newJob: JobOpening = {
      id: `job-${Date.now()}`,
      titre: titre.trim(),
      departement,
      typeContrat,
      localisation: localisation.trim(),
      salaire: salaire.trim() || undefined,
      experienceRequise,
      descriptionCourte: descriptionCourte.trim() || `Opportunité de ${titre.trim()} au sein de notre équipe en développement.`,
      responsabilites: responsabilites.length > 0 ? responsabilites : ['Participer aux missions clés du département RH.'],
      profilRecherche: profilRecherche.length > 0 ? profilRecherche : ['Expérience pertinente et motivation pour le poste.'],
      competencesCles: motsCles.length > 0 ? motsCles : ['rh', 'recrutement'],
      screeningQuestion: screeningQuestion.trim() || 'Pourquoi souhaitez-vous rejoindre notre entreprise pour ce poste ?',
      datePublication: "À l'instant"
    };

    onCreateJob(newJob);
    setSuccessCreatedJob(newJob);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(3px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '920px',
        maxHeight: '92vh',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        
        {/* EN-TÊTE MODALE */}
        <div style={{
          padding: '18px 24px',
          backgroundColor: '#0f172a',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1e293b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#2563eb',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>
              💼
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 'bold' }}>
                Créer & Publier une Nouvelle Offre d'Emploi
              </h2>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Diffusion instantanée sur l'Espace Carrières (/careers) & paramétrage ATS
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: '#334155',
              border: 'none',
              color: 'white',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* ÉCRAN DE CONFIRMATION DE CRÉATION */}
        {successCreatedJob ? (
          <div style={{
            padding: '44px 32px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            overflowY: 'auto'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#dcfce7',
              color: '#166534',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px',
              margin: '0 auto 16px auto'
            }}>
              ✓
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
              Offre d'emploi publiée avec succès !
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '580px', margin: '0 auto 20px auto' }}>
              L'annonce pour <strong>« {successCreatedJob.titre} »</strong> est maintenant en ligne sur votre portail Carrières et prête à recevoir des candidatures.
            </p>

            <div style={{
              maxWidth: '500px',
              margin: '0 auto 24px auto',
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div><strong>Département :</strong> {successCreatedJob.departement} • {successCreatedJob.typeContrat}</div>
              <div><strong>Localisation :</strong> {successCreatedJob.localisation}</div>
              {successCreatedJob.salaire && (
                <div><strong>Rémunération :</strong> {successCreatedJob.salaire}</div>
              )}
              <div><strong>Mots-clés injectés dans l'ATS :</strong> {successCreatedJob.competencesCles.join(', ')}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {onViewCareersPage && (
                <button
                  onClick={() => { onClose(); onViewCareersPage(); }}
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  👁️ Voir l'offre sur la Page Carrières
                </button>
              )}

              <button
                onClick={() => {
                  setSuccessCreatedJob(null);
                  setTitre('');
                  setDescriptionCourte('');
                }}
                style={{
                  backgroundColor: '#0f172a',
                  color: 'white',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                + Créer une autre offre
              </button>

              <button
                onClick={onClose}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          /* FORMULAIRE DE CRÉATION D'OFFRE */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            
            {/* BARRE DE MODÈLES RAPIDES */}
            <div style={{
              padding: '10px 24px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              overflowX: 'auto'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', flexShrink: 0 }}>
                ⚡ Pré-remplir avec un modèle RH :
              </span>
              <button
                type="button"
                onClick={() => handleQuickTemplate('hrbp')}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '14px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#2563eb',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                + HRBP (Business Partner)
              </button>
              <button
                type="button"
                onClick={() => handleQuickTemplate('sirh')}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '14px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#7c3aed',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                + Chef de Projet SIRH
              </button>
              <button
                type="button"
                onClick={() => handleQuickTemplate('relations_sociales')}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '14px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#059669',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                + Relations Sociales & CSE
              </button>
            </div>

            {/* CORPS DES CHAMPS SCROLLABLE */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              
              {/* LIGNE 1 : TITRE & DÉPARTEMENT */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Intitulé du poste à pourvoir * :
                  </label>
                  <input
                    type="text"
                    required
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    placeholder="Ex: Responsable Relations Sociales & CSE"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Département / Direction :
                  </label>
                  <select
                    value={departement}
                    onChange={(e) => setDepartement(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="Ressources Humaines">Ressources Humaines</option>
                    <option value="Recrutement & Talent">Recrutement & Talent</option>
                    <option value="Paie & SIRH">Paie & SIRH</option>
                    <option value="Formation & Développement">Formation & Développement</option>
                    <option value="Relations Sociales">Relations Sociales</option>
                    <option value="Direction Générale & Support">Direction Générale & Support</option>
                  </select>
                </div>
              </div>

              {/* LIGNE 2 : CONTRAT, LOCALISATION, SALAIRE, EXPÉRIENCE */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Type de contrat :
                  </label>
                  <select
                    value={typeContrat}
                    onChange={(e) => setTypeContrat(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  >
                    <option value="CDI">CDI (Plein temps)</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage (PFE / Césure)</option>
                    <option value="Alternance">Alternance / Apprentissage</option>
                    <option value="Freelance">Freelance / Indépendant</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Localisation :
                  </label>
                  <input
                    type="text"
                    value={localisation}
                    onChange={(e) => setLocalisation(e.target.value)}
                    placeholder="Paris (Hybride - 2j remote)"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Fourchette salariale :
                  </label>
                  <input
                    type="text"
                    value={salaire}
                    onChange={(e) => setSalaire(e.target.value)}
                    placeholder="8 000 MAD - 12 000 MAD / mois"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Expérience requise :
                  </label>
                  <select
                    value={experienceRequise}
                    onChange={(e) => setExperienceRequise(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                  >
                    <option value="Junior">Junior (0-2 ans)</option>
                    <option value="Confirmé">Confirmé (2-5 ans)</option>
                    <option value="Senior">Senior (+5 ans)</option>
                  </select>
                </div>
              </div>

              {/* LIGNE 3 : DESCRIPTION COURTE D'ACCROCHE */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Description courte d'accroche (affichée sur la carte d'offre) :
                </label>
                <input
                  type="text"
                  value={descriptionCourte}
                  onChange={(e) => setDescriptionCourte(e.target.value)}
                  placeholder="Ex: Rejoignez notre pôle RH pour piloter l'ensemble des négociations collectives et le climat social."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              {/* LIGNE 4 : MISSIONS & PROFIL (2 COLONNES) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Missions & Responsabilités principales (1 par ligne) :
                  </label>
                  <textarea
                    rows={4}
                    value={responsabilitesText}
                    onChange={(e) => setResponsabilitesText(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Profil recherché & Compétences requises (1 par ligne) :
                  </label>
                  <textarea
                    rows={4}
                    value={profilRechercheText}
                    onChange={(e) => setProfilRechercheText(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              {/* LIGNE 5 : MOTS-CLÉS & SCORING ATS */}
              <div style={{ backgroundColor: '#eff6ff', padding: '14px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e40af' }}>
                    Mots-Clés ATS & Critères de Matching Automatique :
                  </label>
                  <span style={{ fontSize: '11px', color: '#3b82f6' }}>
                    Ces mots-clés alimentent directement le score de matching des CVs
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {motsCles.map(k => (
                    <span key={k} style={{ backgroundColor: '#2563eb', color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      #{k}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(k)}
                        style={{ border: 'none', background: 'none', color: 'white', cursor: 'pointer', padding: 0, fontSize: '11px', fontWeight: 'bold' }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="+ Ajouter un mot-clé (ex: cse, négociations, paie)..."
                    value={nouveauMotCle}
                    onChange={(e) => setNouveauMotCle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddKeyword();
                      }
                    }}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddKeyword()}
                    style={{ backgroundColor: '#1e40af', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              {/* LIGNE 6 : QUESTION DE PRÉSÉLECTION CANDIDAT */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Question de présélection (posée aux candidats lors de leur candidature) :
                </label>
                <input
                  type="text"
                  value={screeningQuestion}
                  onChange={(e) => setScreeningQuestion(e.target.value)}
                  placeholder="Ex: Quelle est votre expérience dans l'animation des réunions CSE ?"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

            </div>

            {/* PIED DU FORMULAIRE : BOUTONS D'ACTION */}
            <div style={{
              padding: '14px 24px',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>

              <button
                type="submit"
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                }}
              >
                <span>Publier l'Offre d'Emploi</span>
                <span>🚀</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
