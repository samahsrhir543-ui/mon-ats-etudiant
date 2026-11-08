import React, { useState, useEffect, useRef } from 'react';
import type { AuthUser, Candidat, ChatMessage } from '../types';

interface CandidatePortalProps {
  user: AuthUser;
  candidat: Candidat | undefined;
  onLogout: () => void;
  onUpdateCandidateCV?: (cvNom: string) => void;
  messages: ChatMessage[];
  onSendMessage: (candidateId: number, text: string, type?: 'text' | 'template' | 'interview_invite') => void;
  onMarkAsReadByCandidate: (candidateId: number) => void;
}

export const CandidatePortal: React.FC<CandidatePortalProps> = ({
  user,
  candidat,
  onLogout,
  onUpdateCandidateCV,
  messages,
  onSendMessage,
  onMarkAsReadByCandidate,
}) => {
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [presenceConfirmee, setPresenceConfirmee] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null);

  const currentCandidat = candidat || {
    id: 1,
    nom: user.name,
    poste: user.title || 'Candidat',
    niveau: 'Confirmé' as const,
    email: user.email,
    statut: 'En attente' as const,
    notes: '',
    tags: ['Candidat'],
    dateEntretien: '',
    cvNom: 'Mon_CV.pdf',
    cvUrl: '',
    scoreMatch: 75,
    etoiles: 3,
  };

  // Filtrer les messages pour ce candidat
  const candidateMessages = messages.filter(
    m => m.candidateId === currentCandidat.id
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Nombre de messages non lus par le candidat
  const unreadCount = candidateMessages.filter(
    m => m.senderRole === 'recruiter' && !m.readByCandidate
  ).length;

  // Auto-scroll vers le bas lorsque le tiroir est ouvert ou qu'un message arrive
  useEffect(() => {
    if (isChatDrawerOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [candidateMessages.length, isChatDrawerOpen]);

  // Ouverture du tiroir de discussion
  const handleOpenChatDrawer = () => {
    setIsChatDrawerOpen(true);
    onMarkAsReadByCandidate(currentCandidat.id);
  };

  const handleCloseChatDrawer = () => {
    setIsChatDrawerOpen(false);
  };

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    if (onUpdateCandidateCV) {
      onUpdateCandidateCV(selectedFile.name);
    }
    setUploadSuccess(true);

    // Notifier automatiquement l'équipe RH via le chat
    onSendMessage(
      currentCandidat.id,
      `Bonjour, j'ai mis à jour mon document CV : "${selectedFile.name}".`,
      'text'
    );
    setTimeout(() => setUploadSuccess(false), 4000);
  };

  const handleSendCandidateMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    onSendMessage(currentCandidat.id, chatInput.trim(), 'text');
    setChatInput('');

    if (chatTextareaRef.current) {
      chatTextareaRef.current.style.height = 'auto';
    }
  };

  const handleQuickCandidateReply = (text: string) => {
    onSendMessage(currentCandidat.id, text, 'text');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendCandidateMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 110)}px`;
  };

  const getStepIndex = () => {
    if (currentCandidat.statut === 'Retenu' || currentCandidat.statut === 'Refusé') return 3;
    if (currentCandidat.dateEntretien) return 2;
    if (currentCandidat.scoreMatch > 0) return 1;
    return 0;
  };

  const currentStep = getStepIndex();

  const getStatusColor = (statut: string) => {
    if (statut === 'Retenu') return '#16a34a';
    if (statut === 'Refusé') return '#dc2626';
    return '#d97706';
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div style={{
      fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      color: '#1e293b'
    }}>
      {/* ======================================================== */}
      {/* BARRE DE NAVIGATION (HEADER / NAVBAR CANDIDAT)           */}
      {/* ======================================================== */}
      <header style={{
        backgroundColor: '#0f172a',
        color: 'white',
        padding: '14px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* LOGO & TITRE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            backgroundColor: '#059669',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '18px',
            boxShadow: '0 4px 10px rgba(5,150,105,0.3)'
          }}>
            🎓
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
              Mon Espace Candidat
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
              Portail de suivi de candidature & échanges RH
            </p>
          </div>
        </div>

        {/* SECTION DROITE DU HEADER : INFOS, ICÔNE CHAT & DÉCONNEXION */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          
          {/* IDENTITÉ CANDIDAT */}
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>{currentCandidat.nom}</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{currentCandidat.email}</span>
          </div>

          <span style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            Candidat
          </span>

          {/* ==================================================== */}
          {/* ICÔNE DE CHAT DANS L'EN-TÊTE AVEC BADGE NOTIFICATION */}
          {/* ==================================================== */}
          <button
            type="button"
            onClick={handleOpenChatDrawer}
            title={unreadCount > 0 ? `${unreadCount} nouveau(x) message(s) de l'équipe RH` : "Ouvrir la messagerie avec l'équipe RH"}
            style={{
              position: 'relative',
              backgroundColor: isChatDrawerOpen ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: isChatDrawerOpen ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.15)',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = isChatDrawerOpen ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            {/* Icône SVG MessageSquare / Bulle de discussion */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>

            {/* Pastille / Badge rouge dynamique des messages non lus */}
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: '800',
                minWidth: '18px',
                height: '18px',
                padding: '0 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #0f172a',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.5)',
                boxSizing: 'border-box',
                animation: 'pulse 1.8s infinite'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* BOUTON DÉCONNEXION */}
          <button
            onClick={onLogout}
            style={{
              backgroundColor: '#334155',
              color: 'white',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#475569';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#334155';
            }}
          >
            <span>Déconnexion</span>
            <span>🚪</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* CORPS PRINCIPAL DE LA PAGE CANDIDAT                      */}
      {/* ======================================================== */}
      <main style={{ maxWidth: '1020px', margin: '28px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        
        {/* CARTE STATUT SYNTHÉTIQUE DU DOSSIER */}
        <section style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '22px 26px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Candidature en cours
            </span>
            <h2 style={{ margin: '3px 0 6px 0', fontSize: '22px', color: '#0f172a' }}>
              {currentCandidat.poste} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>({currentCandidat.niveau})</span>
            </h2>
            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span>Dossier #{currentCandidat.id}</span>
              <span>•</span>
              <span>CV enregistré : <strong style={{ color: '#2563eb' }}>{currentCandidat.cvNom}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Statut décisionnel</span>
              <span style={{
                backgroundColor: `${getStatusColor(currentCandidat.statut)}15`,
                color: getStatusColor(currentCandidat.statut),
                border: `1.5px solid ${getStatusColor(currentCandidat.statut)}`,
                padding: '5px 14px',
                borderRadius: '16px',
                fontWeight: 'bold',
                fontSize: '13px',
                display: 'inline-block'
              }}>
                ● {currentCandidat.statut}
              </span>
            </div>

            {/* BOUTON RAPIDE VERS LE CHAT RH */}
            <button
              onClick={handleOpenChatDrawer}
              style={{
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>💬 Contacter RH</span>
              {unreadCount > 0 && (
                <span style={{ backgroundColor: '#ef4444', color: 'white', borderRadius: '10px', padding: '1px 6px', fontSize: '10px' }}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </section>

        {/* PARCOURS DE RECRUTEMENT / STEPPER DÉTAILLÉ */}
        <section style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '15px', color: '#0f172a', margin: '0 0 16px 0', fontWeight: '700' }}>
            Progression des étapes de votre recrutement :
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { label: '1. Dépôt de candidature', desc: 'Dossier reçu et enregistré' },
              { label: '2. Analyse du profil', desc: 'Matching des compétences' },
              { label: '3. Entretien RH', desc: currentCandidat.dateEntretien ? `Prévu le ${new Date(currentCandidat.dateEntretien).toLocaleDateString('fr-FR')}` : 'À planifier' },
              { label: '4. Décision finale', desc: currentCandidat.statut === 'Retenu' ? 'Candidature Retenue !' : currentCandidat.statut === 'Refusé' ? 'Non retenue' : 'En attente' }
            ].map((step, idx) => {
              const isPassed = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div
                  key={idx}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: isCurrent ? '#eff6ff' : isPassed ? '#f8fafc' : '#f1f5f9',
                    border: isCurrent ? '2px solid #2563eb' : isPassed ? '1px solid #cbd5e1' : '1px dashed #e2e8f0'
                  }}
                >
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: isCurrent ? '#2563eb' : isPassed ? '#059669' : '#94a3b8',
                    marginBottom: '4px'
                  }}>
                    {isPassed && !isCurrent ? '✓ Validé' : isCurrent ? '⏳ En cours' : '○ À venir'}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: isPassed ? '#0f172a' : '#64748b', marginBottom: '2px' }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {step.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ALERTE ENTRETIEN RH PROGRAMMÉ */}
        {currentCandidat.dateEntretien && (
          <section style={{
            backgroundColor: '#fefce8',
            border: '2px solid #eab308',
            borderRadius: '12px',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(234,179,8,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '32px' }}>📅</div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#854d0e', fontWeight: '700' }}>
                  Entretien RH Programmé !
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#713f12' }}>
                  Votre entretien est fixé au : <strong>{new Date(currentCandidat.dateEntretien).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}</strong>
                </p>
                <small style={{ color: '#854d0e', marginTop: '4px', display: 'block' }}>
                  Lieu : Visioconférence RH (invitation transmise à {currentCandidat.email})
                </small>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setPresenceConfirmee(true);
                  onSendMessage(currentCandidat.id, `Bonjour, je confirme ma présence à l'entretien du ${new Date(currentCandidat.dateEntretien).toLocaleString('fr-FR')}.`, 'text');
                }}
                disabled={presenceConfirmee}
                style={{
                  backgroundColor: presenceConfirmee ? '#16a34a' : '#ca8a04',
                  color: 'white',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: presenceConfirmee ? 'default' : 'pointer'
                }}
              >
                {presenceConfirmee ? '✓ Présence Confirmée' : 'Confirmer ma Présence'}
              </button>

              <button
                onClick={handleOpenChatDrawer}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#854d0e',
                  border: '1px solid #fef08a',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                💬 Préciser un créneau
              </button>
            </div>
          </section>
        )}

        {/* SECTION GESTION DU DOCUMENT CV */}
        <section style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>
            📄 Mon Document CV Déposé
          </h3>

          <div style={{
            padding: '14px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Fichier actuellement enregistré dans votre dossier :</div>
              <strong style={{ fontSize: '14px', color: '#2563eb' }}>{currentCandidat.cvNom || 'Aucun document'}</strong>
            </div>

            <span style={{ fontSize: '11px', backgroundColor: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
              Actif dans l'ATS
            </span>
          </div>

          {uploadSuccess && (
            <div style={{
              backgroundColor: '#dcfce7',
              color: '#166534',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              marginBottom: '14px',
              border: '1px solid #bbf7d0'
            }}>
              ✓ Votre nouveau CV a été mis à jour et notifié à l'équipe RH !
            </div>
          )}

          <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>
              Remplacer par un nouveau CV (PDF ou Word) :
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                style={{ fontSize: '12px' }}
              />
              <button
                type="submit"
                disabled={!selectedFile}
                style={{
                  backgroundColor: selectedFile ? '#2563eb' : '#94a3b8',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: selectedFile ? 'pointer' : 'not-allowed'
                }}
              >
                Mettre à jour mon CV
              </button>
            </div>
          </form>
        </section>

      </main>

      {/* ======================================================== */}
      {/* VOLET COULISSANT LATÉRAL DE DISCUSSION (CHAT DRAWER)     */}
      {/* S'ouvre sans recharger ni masquer la page principale      */}
      {/* ======================================================== */}
      {isChatDrawerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(2px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* FOND CLIQUABLE POUR FERMER */}
          <div
            style={{ flex: 1 }}
            onClick={handleCloseChatDrawer}
          />

          {/* TIROIR LATÉRAL */}
          <div style={{
            width: '100%',
            maxWidth: '460px',
            height: '100%',
            backgroundColor: '#ffffff',
            boxShadow: '-8px 0 30px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box'
          }}>
            {/* EN-TÊTE DU VOLET DE DISCUSSION */}
            <div style={{
              padding: '16px 20px',
              backgroundColor: '#0f172a',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #1e293b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    RH
                  </div>
                  {/* Pastille En ligne */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    border: '2px solid #0f172a'
                  }} />
                </div>

                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700' }}>
                    Équipe Recrutement RH (Sarah Benani)
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    🟢 En ligne • Talent Acquisition Lead
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseChatDrawer}
                title="Fermer la discussion"
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
                  justifyContent: 'center',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#475569';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#334155';
                }}
              >
                ✕
              </button>
            </div>

            {/* FLUX DES MESSAGES */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              backgroundColor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              {candidateMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto 0', fontSize: '13px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                  Bienvenue dans votre messagerie avec le recruteur !<br />
                  Posez une question ou confirmez vos disponibilités.
                </div>
              ) : (
                candidateMessages.map((msg) => {
                  const isMe = msg.senderRole === 'candidate';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        alignSelf: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '6px',
                        marginBottom: '3px',
                        fontSize: '11px',
                        color: '#64748b'
                      }}>
                        <strong style={{ color: isMe ? '#059669' : '#2563eb' }}>
                          {isMe ? 'Vous' : msg.senderName}
                        </strong>
                        <span>{formatTime(msg.timestamp)}</span>
                      </div>

                      <div style={{
                        padding: '12px 16px',
                        borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        backgroundColor: isMe ? '#059669' : '#ffffff',
                        color: isMe ? '#ffffff' : '#1e293b',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        border: isMe ? 'none' : '1px solid #e2e8f0',
                        fontSize: '13px',
                        lineHeight: '1.45',
                        whiteSpace: 'pre-line',
                        wordBreak: 'break-word'
                      }}>
                        {msg.type === 'interview_invite' && (
                          <div style={{
                            fontSize: '11px',
                            fontWeight: 'bold',
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginBottom: '6px'
                          }}>
                            📅 Invitation Entretien RH
                          </div>
                        )}
                        <div>{msg.text}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* SUGGESTIONS DE RÉPONSES RAPIDES */}
            <div style={{
              padding: '8px 16px',
              backgroundColor: '#f1f5f9',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', flexShrink: 0 }}>
                ⚡ Suggestions :
              </span>
              {[
                "📅 Je confirme ma disponibilité pour l'entretien.",
                "📄 J'ai mis à jour mon CV.",
                "🙏 Merci pour votre retour !",
                "❓ Avez-vous besoin d'autres éléments ?"
              ].map((sugg, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickCandidateReply(sugg)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '14px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#334155',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.borderColor = '#059669';
                    (e.target as HTMLElement).style.color = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.borderColor = '#cbd5e1';
                    (e.target as HTMLElement).style.color = '#334155';
                  }}
                >
                  {sugg}
                </button>
              ))}
            </div>

            {/* BARRE DE SAISIE */}
            <form onSubmit={handleSendCandidateMessage} style={{
              padding: '12px 16px',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-end'
            }}>
              <textarea
                ref={chatTextareaRef}
                rows={1}
                value={chatInput}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez à l'équipe RH (Entrée pour envoyer)..."
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'none',
                  maxHeight: '100px',
                  minHeight: '40px',
                  boxSizing: 'border-box',
                  backgroundColor: '#f8fafc'
                }}
              />

              <button
                type="submit"
                disabled={!chatInput.trim()}
                style={{
                  backgroundColor: chatInput.trim() ? '#059669' : '#94a3b8',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '40px',
                  flexShrink: 0
                }}
              >
                <span>Envoyer</span>
                <span>➤</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
