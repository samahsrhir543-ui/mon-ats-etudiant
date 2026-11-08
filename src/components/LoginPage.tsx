import React, { useState } from 'react';
import type { AuthUser, Candidat } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  candidats: Candidat[];
  onGoToCareers: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  candidats,
  onGoToCareers
}) => {
  const [activeRole, setActiveRole] = useState<'recruiter' | 'candidate'>('candidate');

  // État Recruteur
  const [recruiterEmail, setRecruiterEmail] = useState('recruteur@ats.com');
  const [recruiterPassword, setRecruiterPassword] = useState('admin123');
  const [showRecruiterPassword, setShowRecruiterPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [recruiterError, setRecruiterError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // État Candidat
  const [candidateEmail, setCandidateEmail] = useState('mohamed.alami@email.com');
  const [candidatePassword, setCandidatePassword] = useState('candidat123');
  const [candidateError, setCandidateError] = useState('');

  const handleRecruiterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecruiterError('');

    if (!recruiterEmail.trim()) {
      setRecruiterError('Veuillez renseigner votre adresse email.');
      return;
    }
    if (!recruiterPassword) {
      setRecruiterError('Veuillez renseigner votre mot de passe.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      if (recruiterPassword.length < 4) {
        setRecruiterError('Le mot de passe doit contenir au moins 4 caractères.');
        return;
      }

      const recruiterUser: AuthUser = {
        id: 'rec-001',
        email: recruiterEmail.trim(),
        name: recruiterEmail.includes('admin') ? 'Administrateur RH' : 'Équipe Recrutement & RH',
        role: 'recruiter',
        title: 'Talent Acquisition Specialist',
      };

      onLoginSuccess(recruiterUser);
    }, 350);
  };

  const handleQuickRecruiterLogin = (email = 'recruteur@ats.com', pass = 'admin123') => {
    setRecruiterEmail(email);
    setRecruiterPassword(pass);
    setRecruiterError('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({
        id: 'rec-001',
        email,
        name: 'Sarah Benani (Talent Lead)',
        role: 'recruiter',
        title: 'Responsable Recrutement RH',
      });
    }, 250);
  };

  const handleCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCandidateError('');

    if (!candidateEmail.trim()) {
      setCandidateError('Veuillez renseigner votre adresse email candidat.');
      return;
    }

    const matchedCandidat = candidats.find(
      c => c.email.toLowerCase() === candidateEmail.trim().toLowerCase()
    );

    if (!matchedCandidat) {
      setCandidateError(`Aucun dossier trouvé pour "${candidateEmail}". Consultez notre page Carrières pour postuler à une offre.`);
      return;
    }

    const candidateUser: AuthUser = {
      id: String(matchedCandidat.id),
      email: candidateEmail.trim(),
      name: matchedCandidat.nom,
      role: 'candidate',
      title: matchedCandidat.poste,
    };

    onLoginSuccess(candidateUser);
  };

  const handleQuickCandidateSelect = (candidat: Candidat) => {
    setCandidateEmail(candidat.email);
    setCandidateError('');
    onLoginSuccess({
      id: String(candidat.id),
      email: candidat.email,
      name: candidat.nom,
      role: 'candidate',
      title: candidat.poste,
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      backgroundImage: 'radial-gradient(at 0% 0%, #1e1b4b 0, transparent 50%), radial-gradient(at 100% 100%, #172554 0, transparent 50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
      boxSizing: 'border-box'
    }}>
      
      {/* BOUTON RAPIDE VERS L'ESPACE CARRIÈRES PUBLIQUE */}
      <div style={{ marginBottom: '16px' }}>
        <button
          type="button"
          onClick={onGoToCareers}
          style={{
            backgroundColor: 'rgba(37, 99, 235, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: '#93c5fd',
            padding: '8px 18px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(37, 99, 235, 0.3)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(37, 99, 235, 0.15)';
          }}
        >
          <span>🌟 Vous cherchez un emploi ? Découvrez nos offres (/careers)</span>
          <span>→</span>
        </button>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* BANDEAU EN-TÊTE DE LA MARQUE */}
        <div style={{
          backgroundColor: '#0f172a',
          padding: '28px 32px 24px 32px',
          color: 'white',
          textAlign: 'center',
          borderBottom: '1px solid #1e293b'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            backgroundColor: '#2563eb',
            borderRadius: '12px',
            marginBottom: '12px',
            fontSize: '24px',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.35)'
          }}>
            ⚡
          </div>
          <h1 style={{
            margin: '0 0 6px 0',
            fontSize: '22px',
            fontWeight: '700',
            color: '#f8fafc',
            letterSpacing: '-0.3px'
          }}>
            Solution ATS & E-RH
          </h1>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#94a3b8'
          }}>
            Portail d'Authentification & Contrôle d'Accès Sécurisé
          </p>
        </div>

        {/* SÉLECTEUR DE RÔLE (DUAL-ROLE SWITCHER) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: '#f1f5f9',
          padding: '6px',
          gap: '6px',
          margin: '20px 24px 16px 24px',
          borderRadius: '10px'
        }}>
          <button
            type="button"
            onClick={() => { setActiveRole('recruiter'); setRecruiterError(''); }}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeRole === 'recruiter' ? '#ffffff' : 'transparent',
              color: activeRole === 'recruiter' ? '#1e293b' : '#64748b',
              fontWeight: activeRole === 'recruiter' ? '700' : '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: activeRole === 'recruiter' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>💼</span>
            <span>Espace Recruteur</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveRole('candidate'); setCandidateError(''); }}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeRole === 'candidate' ? '#ffffff' : 'transparent',
              color: activeRole === 'candidate' ? '#1e293b' : '#64748b',
              fontWeight: activeRole === 'candidate' ? '700' : '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: activeRole === 'candidate' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🎓</span>
            <span>Espace Candidat</span>
          </button>
        </div>

        {/* CORPS DU FORMULAIRE */}
        <div style={{ padding: '8px 28px 28px 28px' }}>
          
          {/* ========================================================= */}
          {/* FLOW 1 : AUTHENTIFICATION RECRUTEUR                        */}
          {/* ========================================================= */}
          {activeRole === 'recruiter' && (
            <div>
              <div style={{
                marginBottom: '18px',
                padding: '10px 14px',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                borderLeft: '4px solid #2563eb'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e40af', marginBottom: '2px' }}>
                  Accès Recruteur / Équipe RH
                </div>
                <div style={{ fontSize: '12px', color: '#3b82f6', lineHeight: '1.4' }}>
                  Saisissez vos identifiants pour être redirigé directement vers le tableau de bord ATS complet.
                </div>
              </div>

              {recruiterError && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>⚠️</span>
                  <span>{recruiterError}</span>
                </div>
              )}

              <form onSubmit={handleRecruiterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Adresse Email professionnelle :
                  </label>
                  <input
                    type="email"
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                    placeholder="recruteur@ats.com"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                      Mot de passe :
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowRecruiterPassword(!showRecruiterPassword)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '11px',
                        color: '#2563eb',
                        cursor: 'pointer',
                        padding: 0,
                        fontWeight: '600'
                      }}
                    >
                      {showRecruiterPassword ? 'Masquer' : 'Afficher'}
                    </button>
                  </div>
                  <input
                    type={showRecruiterPassword ? 'text' : 'password'}
                    value={recruiterPassword}
                    onChange={(e) => setRecruiterPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Rester connecté</span>
                  </label>

                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Sécurisé TLS 256-bit
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: isSubmitting ? '#93c5fd' : '#2563eb',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  {isSubmitting ? 'Connexion en cours...' : 'Se connecter au Dashboard ATS →'}
                </button>
              </form>

              {/* DÉMO RAPIDE 1-CLIC POUR LE RECRUTEUR */}
              <div style={{
                marginTop: '22px',
                padding: '14px',
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                border: '1px dashed #cbd5e1'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                  💡 Accès rapide Démo Recruteur (1 Clic)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Identifiants test : <code>recruteur@ats.com</code> / <code>admin123</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickRecruiterLogin('recruteur@ats.com', 'admin123')}
                    style={{
                      backgroundColor: '#0f172a',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Tester Connexion RH ⚡
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FLOW 2 : AUTHENTIFICATION CANDIDAT                        */}
          {/* ========================================================= */}
          {activeRole === 'candidate' && (
            <div>
              <div style={{
                marginBottom: '16px',
                padding: '10px 14px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                borderLeft: '4px solid #059669'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#166534', marginBottom: '2px' }}>
                  Espace Suivi de Candidature
                </div>
                <div style={{ fontSize: '12px', color: '#15803d', lineHeight: '1.4' }}>
                  Connectez-vous pour suivre l'avancement de votre dossier et échanger avec votre recruteur.
                </div>
              </div>

              {candidateError && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  marginBottom: '16px'
                }}>
                  ⚠️ {candidateError}
                </div>
              )}

              <form onSubmit={handleCandidateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Email utilisé lors de votre candidature :
                  </label>
                  <input
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="votre.email@domaine.com"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Mot de passe / Code d'accès :
                  </label>
                  <input
                    type="password"
                    value={candidatePassword}
                    onChange={(e) => setCandidatePassword(e.target.value)}
                    placeholder="candidat123"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    backgroundColor: '#059669',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(5,150,105,0.25)'
                  }}
                >
                  Consulter Mon Espace Candidat →
                </button>
              </form>

              {/* SÉLECTEUR RAPIDE CANDIDATS DÉMO */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Candidats démo enregistrés :
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {candidats.slice(0, 3).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleQuickCandidateSelect(c)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      <div>
                        <strong>{c.nom}</strong> — <span style={{ color: '#64748b' }}>{c.poste}</span>
                      </div>
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        backgroundColor: c.statut === 'Retenu' ? '#dcfce7' : '#fef9c3',
                        color: c.statut === 'Retenu' ? '#166534' : '#854d0e',
                        fontWeight: 'bold'
                      }}>
                        {c.statut}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ==================================================== */}
              {/* ENCART DÉDIÉ : DÉCOUVRIR LES OFFRES & POSTULER       */}
              {/* REMPLACE LE BOUTON '+ DÉPOSER UN DOSSIER' INLINE     */}
              {/* ==================================================== */}
              <div style={{
                marginTop: '22px',
                padding: '16px',
                backgroundColor: '#eff6ff',
                borderRadius: '10px',
                border: '1.5px dashed #60a5fa',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e40af', marginBottom: '4px' }}>
                  🌟 Vous cherchez un emploi ?
                </div>
                <p style={{ fontSize: '12px', color: '#3b82f6', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                  Explorez nos offres actives et déposez votre candidature sur notre portail Carrières dédié.
                </p>
                <button
                  type="button"
                  onClick={onGoToCareers}
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                  }}
                >
                  <span>Consulter la Page Carrières (/careers)</span>
                  <span>→</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* PIED DE PAGE DE LA CARTE */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '14px 28px',
          textAlign: 'center',
          fontSize: '11px',
          color: '#64748b'
        }}>
          Contrôle d'accès basé sur les rôles (RBAC) • Portail Recruteur & Espace Candidat
        </div>
      </div>
    </div>
  );
};
