import React, { useState } from 'react';
import type { JobOpening, ApplicationPayload, AuthUser } from '../types';
import { ACTIVE_JOB_OPENINGS } from '../data/jobOpenings';

interface CareersPageProps {
  jobs?: JobOpening[];
  onBackToLogin: () => void;
  onSubmitApplication: (payload: ApplicationPayload) => AuthUser;
  onDirectLoginAsCandidate: (user: AuthUser) => void;
}

export const CareersPage: React.FC<CareersPageProps> = ({
  jobs = ACTIVE_JOB_OPENINGS,
  onBackToLogin,
  onSubmitApplication,
  onDirectLoginAsCandidate,
}) => {
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);

  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartement, setFilterDepartement] = useState<string>('Tous');
  const [filterContrat, setFilterContrat] = useState<string>('Tous');
  const [filterLocalisation, setFilterLocalisation] = useState<string>('Tous');

  // Champs formulaire
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [niveau, setNiveau] = useState<'Junior' | 'Confirmé' | 'Senior'>('Confirmé');
  const [pretentionSalariale, setPretentionSalariale] = useState('42 000 MAD / mois');
  const [preavis, setPreavis] = useState('Immédiat (disponible)');
  const [reponseQuestion, setReponseQuestion] = useState('');
  const [motivation, setMotivation] = useState('');

  // Téléversement & Drag and drop
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState('');

  // Confirmation post-candidature
  const [submittedUser, setSubmittedUser] = useState<AuthUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrage des offres
  const filteredJobs = jobs.filter(job => {
    const matchSearch =
      job.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.competencesCles.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.descriptionCourte.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDep = filterDepartement === 'Tous' || job.departement === filterDepartement;
    const matchContrat = filterContrat === 'Tous' || job.typeContrat === filterContrat;
    const matchLoc = filterLocalisation === 'Tous' || job.localisation.toLowerCase().includes(filterLocalisation.toLowerCase());

    return matchSearch && matchDep && matchContrat && matchLoc;
  });

  const handleOpenJob = (job: JobOpening) => {
    setSelectedJob(job);
    setNiveau(job.experienceRequise);
    setReponseQuestion('');
    setSubmittedUser(null);
    setFileError('');
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
    setSubmittedUser(null);
  };

  const handleFileProcess = (file: File) => {
    setFileError('');
    const validExtensions = ['.pdf', '.docx', '.doc'];
    const fileName = file.name.toLowerCase();
    const isValidType = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidType) {
      setFileError('Format non supporté. Veuillez déposer un document PDF ou Word (.docx).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('Le fichier dépasse la limite autorisée de 5 Mo.');
      return;
    }

    setCvFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!nom.trim() || !email.trim()) {
      alert('Veuillez renseigner votre nom et votre adresse email.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const payload: ApplicationPayload = {
        jobId: selectedJob.id,
        jobTitre: selectedJob.titre,
        nom: nom.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
        linkedinUrl: linkedinUrl.trim(),
        niveau,
        pretentionSalariale,
        preavis,
        reponseQuestion: reponseQuestion.trim(),
        motivation: motivation.trim(),
        cvFile,
        cvNom: cvFile ? cvFile.name : `CV_${nom.replace(/\s+/g, '_')}.pdf`
      };

      const newUser = onSubmitApplication(payload);
      setIsSubmitting(false);
      setSubmittedUser(newUser);
    }, 400);
  };

  return (
    <div style={{
      fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      color: '#1e293b'
    }}>
      {/* ======================================================== */}
      {/* HEADER DE LA PAGE CARRIÈRES PUBLIQUE                     */}
      {/* ======================================================== */}
      <header style={{
        backgroundColor: '#0f172a',
        color: 'white',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1e293b',
        boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            backgroundColor: '#2563eb',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            boxShadow: '0 6px 14px rgba(37,99,235,0.35)'
          }}>
            ⚡
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.3px' }}>
              Mon ATS • Portail Carrières
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
              Rejoignez une équipe en pleine expansion • Nos opportunités en cours
            </p>
          </div>
        </div>

        <button
          onClick={onBackToLogin}
          style={{
            backgroundColor: '#334155',
            color: 'white',
            border: '1px solid #475569',
            padding: '9px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#475569';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#334155';
          }}
        >
          <span>Espace Connexion (RH & Candidat)</span>
          <span>→</span>
        </button>
      </header>

      {/* ======================================================== */}
      {/* HERO BANNER & RECHERCHE                                  */}
      {/* ======================================================== */}
      <section style={{
        backgroundColor: '#0f172a',
        backgroundImage: 'radial-gradient(at 10% 20%, #1e1b4b 0, transparent 50%), radial-gradient(at 90% 80%, #172554 0, transparent 50%)',
        color: 'white',
        padding: '50px 24px 60px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <span style={{
            display: 'inline-block',
            backgroundColor: 'rgba(37, 99, 235, 0.25)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: '#93c5fd',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px'
          }}>
            💼 Nous recrutons activement
          </span>
          <h2 style={{
            fontSize: '34px',
            fontWeight: '800',
            margin: '0 0 14px 0',
            color: '#ffffff',
            lineHeight: '1.25'
          }}>
            Construisez l'avenir des Ressources Humaines avec nous
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#94a3b8',
            margin: '0 auto 30px auto',
            maxWidth: '650px',
            lineHeight: '1.5'
          }}>
            Explorez nos postes ouverts, découvrez les missions détaillées et postulez directement en ligne avec création instantanée de votre compte candidat.
          </p>

          {/* BARRE DE RECHERCHE FLOTTANTE */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '8px',
            borderRadius: '14px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            maxWidth: '720px',
            margin: '0 auto'
          }}>
            <span style={{ paddingLeft: '12px', fontSize: '18px' }}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher par titre de poste, mots-clés (ex: Sourcing, Paie, DSN)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                color: '#1e293b',
                padding: '10px 4px'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', paddingRight: '8px' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* ZONE DE FILTRES & LISTING DES OFFRES                     */}
      {/* ======================================================== */}
      <main style={{ maxWidth: '1140px', margin: '-24px auto 60px auto', padding: '0 24px' }}>
        
        {/* BARRE DE FILTRES */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
          marginBottom: '28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          alignItems: 'center'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
              Département
            </label>
            <select
              value={filterDepartement}
              onChange={(e) => setFilterDepartement(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
            >
              <option value="Tous">Tous les départements</option>
              <option value="Recrutement & Talent">Recrutement & Talent</option>
              <option value="Paie & SIRH">Paie & SIRH</option>
              <option value="Ressources Humaines">Ressources Humaines</option>
              <option value="Formation & Développement">Formation & Développement</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
              Type de Contrat
            </label>
            <select
              value={filterContrat}
              onChange={(e) => setFilterContrat(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
            >
              <option value="Tous">Tous les contrats</option>
              <option value="CDI">CDI (Plein temps)</option>
              <option value="CDD">CDD</option>
              <option value="Stage">Stage (PFE / Césure)</option>
              <option value="Alternance">Alternance</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
              Localisation
            </label>
            <select
              value={filterLocalisation}
              onChange={(e) => setFilterLocalisation(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
            >
              <option value="Tous">Toutes les localisations</option>
              <option value="Paris">Paris / Île-de-France</option>
              <option value="Lyon">Lyon</option>
              <option value="Remote">Remote / Télétravail</option>
            </select>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Postes actifs :</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb' }}>
              {filteredJobs.length} offre{filteredJobs.length > 1 ? 's' : ''} trouvée{filteredJobs.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* GRILLE DES OFFRES EN DOSSIERS STYLE APP */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filteredJobs.length === 0 ? (
            <div style={{
              gridColumn: '1/-1',
              backgroundColor: '#ffffff',
              padding: '50px 20px',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px dashed #cbd5e1'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0f172a' }}>Aucune offre ne correspond à vos filtres</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Essayez de réinitialiser vos critères de recherche.</p>
              <button
                onClick={() => { setSearchQuery(''); setFilterDepartement('Tous'); setFilterContrat('Tous'); setFilterLocalisation('Tous'); }}
                style={{ marginTop: '16px', backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            filteredJobs.map((job) => {
              // Couleur par département
              const depColor: Record<string, string> = {
                'Recrutement & Talent': '#2563eb',
                'Paie & SIRH': '#7c3aed',
                'Ressources Humaines': '#059669',
                'Formation & Développement': '#ea580c',
                'Relations Sociales': '#dc2626',
                'Direction Générale & Support': '#0891b2',
              };
              const color = depColor[job.departement] || '#334155';

              // Couleur claire (fond avant du dossier)
              const lightColor: Record<string, string> = {
                '#2563eb': 'rgba(37,99,235,0.80)',
                '#7c3aed': 'rgba(124,58,237,0.80)',
                '#059669': 'rgba(5,150,105,0.80)',
                '#ea580c': 'rgba(234,88,12,0.80)',
                '#dc2626': 'rgba(220,38,38,0.80)',
                '#0891b2': 'rgba(8,145,178,0.80)',
                '#334155': 'rgba(51,65,85,0.80)',
              };
              const frontColor = lightColor[color] || 'rgba(51,65,85,0.80)';

              return (
                <div
                  key={job.id}
                  onClick={() => handleOpenJob(job)}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    style={{
                      borderRadius: '20px',
                      overflow: 'hidden',
                      boxShadow: `0 8px 24px ${color}30, 0 2px 8px rgba(0,0,0,0.08)`,
                      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                      position: 'relative',
                      minHeight: '280px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px) scale(1.01)';
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 40px ${color}40, 0 6px 14px rgba(0,0,0,0.12)`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${color}30, 0 2px 8px rgba(0,0,0,0.08)`;
                    }}
                  >
                    {/* ── ZONE SUPÉRIEURE : fond coloré + documents qui dépassent ── */}
                    <div style={{
                      backgroundColor: color,
                      padding: '20px 20px 0 20px',
                      minHeight: '130px',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      {/* Documents qui sortent du dossier */}
                      <div style={{ position: 'relative', width: '130px', height: '90px', marginBottom: '-10px' }}>
                        {/* Doc 3 (arrière) */}
                        <div style={{
                          position: 'absolute',
                          right: '0px',
                          bottom: '0px',
                          width: '80px',
                          height: '78px',
                          backgroundColor: 'rgba(255,255,255,0.55)',
                          borderRadius: '8px 8px 0 0',
                          transform: 'rotate(6deg)',
                          transformOrigin: 'bottom center',
                        }}>
                          <div style={{ padding: '8px 8px 0 8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <div style={{ height: '5px', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '3px', width: '80%' }} />
                            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '3px', width: '60%' }} />
                            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '3px', width: '70%' }} />
                          </div>
                        </div>
                        {/* Doc 2 (milieu) */}
                        <div style={{
                          position: 'absolute',
                          left: '18px',
                          bottom: '0px',
                          width: '80px',
                          height: '84px',
                          backgroundColor: 'rgba(255,255,255,0.72)',
                          borderRadius: '8px 8px 0 0',
                          transform: 'rotate(-3deg)',
                          transformOrigin: 'bottom center',
                        }}>
                          <div style={{ padding: '8px 8px 0 8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <div style={{ height: '5px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '3px', width: '75%' }} />
                            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '3px', width: '55%' }} />
                            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '3px', width: '65%' }} />
                          </div>
                        </div>
                        {/* Doc 1 (devant) */}
                        <div style={{
                          position: 'absolute',
                          left: '32px',
                          bottom: '0px',
                          width: '80px',
                          height: '88px',
                          backgroundColor: 'rgba(255,255,255,0.92)',
                          borderRadius: '8px 8px 0 0',
                        }}>
                          <div style={{ padding: '10px 8px 0 8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <div style={{ height: '5px', backgroundColor: `${color}80`, borderRadius: '3px', width: '80%' }} />
                            <div style={{ height: '4px', backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: '3px', width: '60%' }} />
                            <div style={{ height: '4px', backgroundColor: 'rgba(0,0,0,0.10)', borderRadius: '3px', width: '70%' }} />
                            <div style={{ height: '4px', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '3px', width: '50%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── ZONE INFÉRIEURE : flap avant du dossier ── */}
                    <div style={{
                      background: `linear-gradient(160deg, ${frontColor} 0%, ${color} 100%)`,
                      padding: '18px 20px 20px 20px',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}>
                      {/* Badge type contrat */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          backgroundColor: 'rgba(255,255,255,0.22)',
                          color: 'white',
                          padding: '2px 10px',
                          borderRadius: '20px',
                          fontSize: '10px',
                          fontWeight: '700',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                        }}>
                          {job.typeContrat}
                        </span>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)' }}>
                          {job.datePublication}
                        </span>
                      </div>

                      {/* Titre du poste */}
                      <h3 style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: '800',
                        color: 'white',
                        lineHeight: '1.3',
                        textShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}>
                        {job.titre}
                      </h3>

                      {/* Localisation */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '12px' }}>📍</span>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>
                          {job.localisation}
                        </span>
                      </div>

                      {/* Mots-clés */}
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {job.competencesCles.slice(0, 4).map((k) => (
                          <span key={k} style={{
                            backgroundColor: 'rgba(255,255,255,0.18)',
                            color: 'rgba(255,255,255,0.9)',
                            padding: '1px 8px',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontWeight: '600',
                          }}>
                            #{k}
                          </span>
                        ))}
                      </div>

                      {/* Footer : bouton postuler */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 'auto',
                        paddingTop: '10px',
                        borderTop: '1px solid rgba(255,255,255,0.18)',
                      }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
                          {job.departement}
                        </span>
                        <button
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.20)',
                            color: 'white',
                            border: '1.5px solid rgba(255,255,255,0.50)',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          Postuler →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* ======================================================== */}
      {/* MODAL / SPLIT VIEW : DÉTAIL DU POSTE + FORMULAIRE        */}
      {/* ======================================================== */}
      {selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '1080px',
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
              padding: '16px 24px',
              backgroundColor: '#0f172a',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #1e293b'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {selectedJob.departement} • {selectedJob.typeContrat}
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '17px', color: '#ffffff' }}>
                  {selectedJob.titre}
                </h3>
              </div>

              <button
                onClick={handleCloseModal}
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

            {/* ÉCRAN DE CONFIRMATION SI POSTULÉ (AUTO-ONBOARDING) */}
            {submittedUser ? (
              <div style={{
                padding: '48px 32px',
                textAlign: 'center',
                backgroundColor: '#ffffff',
                overflowY: 'auto'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  margin: '0 auto 20px auto'
                }}>
                  ✓
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
                  Candidature transmise avec succès !
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '580px', margin: '0 auto 24px auto', lineHeight: '1.5' }}>
                  Votre profil pour le poste de <strong>{selectedJob.titre}</strong> a été injecté directement dans l'ATS des recruteurs.
                </p>

                {/* ENCART COMPTE AUTO-GÉNÉRÉ */}
                <div style={{
                  maxWidth: '520px',
                  margin: '0 auto 30px auto',
                  padding: '20px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '12px',
                  border: '1px solid #bfdbfe',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e40af', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ⚡ Compte Candidat Auto-Provisionné
                  </div>
                  <div style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: '1.5' }}>
                    Un espace sécurisé a été créé pour votre adresse : <strong>{submittedUser.email}</strong>.<br />
                    Vous pouvez suivre l'avancement de votre dossier, confirmer des entretiens et échanger en direct avec l'équipe RH via le chat.
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button
                    onClick={() => onDirectLoginAsCandidate(submittedUser)}
                    style={{
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>Accéder directement à mon Espace Candidat</span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={handleCloseModal}
                    style={{
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Consulter d'autres offres
                  </button>
                </div>
              </div>
            ) : (
              /* LAYOUT SPLIT : DÉTAILS À GAUCHE, FORMULAIRE À DROITE */
              <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.15fr', flex: 1, minHeight: 0 }}>
                
                {/* GAUCHE : DÉTAILS DU POSTE */}
                <div style={{
                  padding: '24px 28px',
                  backgroundColor: '#f8fafc',
                  borderRight: '1px solid #e2e8f0',
                  overflowY: 'auto'
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                        📍 {selectedJob.localisation}
                      </span>
                      {selectedJob.salaire && (
                        <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                          💰 {selectedJob.salaire}
                        </span>
                      )}
                      <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>
                        Niveau : {selectedJob.experienceRequise}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                      {selectedJob.descriptionCourte}
                    </p>
                  </div>

                  {/* RESPONSABILITÉS */}
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>
                      Missions Principales :
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
                      {selectedJob.responsabilites.map((m, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  {/* PROFIL RECHERCHÉ */}
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>
                      Profil Recherché :
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
                      {selectedJob.profilRecherche.map((p, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* COMPÉTENCES CLÉS ATS */}
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#0f172a', fontWeight: '700' }}>
                      Mots-Clés & Compétences évalués :
                    </h4>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {selectedJob.competencesCles.map(c => (
                        <span key={c} style={{ backgroundColor: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* DROITE : FORMULAIRE DYNAMIQUE DE CANDIDATURE */}
                <div style={{
                  padding: '24px 28px',
                  backgroundColor: '#ffffff',
                  overflowY: 'auto'
                }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>
                    Déposer votre candidature en ligne
                  </h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>
                    Votre compte candidat sera automatiquement créé pour suivre les retours de l'équipe RH.
                  </p>

                  <form onSubmit={handleSubmitApplication} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    
                    {/* ÉTAT CIVIL */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                          Nom complet * :
                        </label>
                        <input
                          type="text"
                          required
                          value={nom}
                          onChange={(e) => setNom(e.target.value)}
                          placeholder="Ex: Yasmine Tazi"
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                          Adresse Email * :
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="yasmine@email.com"
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                          Téléphone :
                        </label>
                        <input
                          type="tel"
                          value={telephone}
                          onChange={(e) => setTelephone(e.target.value)}
                          placeholder="+212 6 12 34 56 78"
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                          Profil LinkedIn / Portfolio :
                        </label>
                        <input
                          type="url"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          placeholder="https://linkedin.com/in/profil"
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    {/* DRAG AND DROP ZONE CV */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                        Curriculum Vitae (PDF, DOCX jusqu'à 5 Mo) * :
                      </label>
                      
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                        style={{
                          border: isDragOver ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
                          backgroundColor: isDragOver ? '#eff6ff' : '#f8fafc',
                          borderRadius: '8px',
                          padding: '16px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onClick={() => document.getElementById('cv-upload-input')?.click()}
                      >
                        <input
                          id="cv-upload-input"
                          type="file"
                          accept=".pdf,.docx,.doc"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileProcess(e.target.files[0]);
                            }
                          }}
                        />

                        {cvFile ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>📄</span>
                            <div style={{ textAlign: 'left' }}>
                              <strong style={{ fontSize: '12px', color: '#2563eb', display: 'block' }}>{cvFile.name}</strong>
                              <small style={{ fontSize: '10px', color: '#64748b' }}>{(cvFile.size / 1024).toFixed(1)} Ko • Fichier prêt</small>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setCvFile(null); }}
                              style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', marginLeft: '8px' }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: '24px', marginBottom: '4px' }}>📁</div>
                            <div style={{ fontSize: '12px', color: '#334155', fontWeight: '600' }}>
                              Glissez-déposez votre CV ici ou <span style={{ color: '#2563eb', textDecoration: 'underline' }}>parcourez vos fichiers</span>
                            </div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                              Formats acceptés : PDF, DOCX (Max 5 Mo)
                            </div>
                          </div>
                        )}
                      </div>

                      {fileError && (
                        <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>
                          ⚠️ {fileError}
                        </div>
                      )}
                    </div>

                    {/* QUESTIONS DE SCREENING & DISPONIBILITÉ */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                          Prétentions salariales annuelles :
                        </label>
                        <input
                          type="text"
                          value={pretentionSalariale}
                          onChange={(e) => setPretentionSalariale(e.target.value)}
                          placeholder="Ex: 8 000 MAD - 12 000 MAD"
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                          Délai de préavis / Disponibilité :
                        </label>
                        <select
                          value={preavis}
                          onChange={(e) => setPreavis(e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                        >
                          <option value="Immédiat (disponible)">Immédiat (sans préavis)</option>
                          <option value="1 mois">1 mois de préavis</option>
                          <option value="2 mois">2 mois de préavis</option>
                          <option value="3 mois">3 mois de préavis</option>
                        </select>
                      </div>
                    </div>

                    {/* QUESTION SPÉCIFIQUE DU POSTE */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#1e40af', marginBottom: '4px' }}>
                        Question de présélection :
                      </label>
                      <div style={{ fontSize: '12px', color: '#334155', marginBottom: '6px', fontStyle: 'italic' }}>
                        « {selectedJob.screeningQuestion} »
                      </div>
                      <textarea
                        rows={2}
                        value={reponseQuestion}
                        onChange={(e) => setReponseQuestion(e.target.value)}
                        placeholder="Votre réponse concise pour l'équipe RH..."
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      />
                    </div>

                    {/* BOUTON SOUMISSION */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        marginTop: '4px',
                        backgroundColor: isSubmitting ? '#93c5fd' : '#2563eb',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {isSubmitting ? (
                        <span>Envoi et création du compte candidat...</span>
                      ) : (
                        <>
                          <span>Valider ma Candidature & Créer mon Compte</span>
                          <span>→</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
