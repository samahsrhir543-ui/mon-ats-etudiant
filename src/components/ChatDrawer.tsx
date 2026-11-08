import React, { useState, useEffect, useRef } from 'react';
import type { Candidat, ChatMessage, AuthUser, CannedTemplate } from '../types';
import { CANNED_TEMPLATES } from '../services/chatService';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  candidats: Candidat[];
  activeCandidateId: number | null;
  onSelectCandidate: (candidateId: number) => void;
  messages: ChatMessage[];
  onSendMessage: (candidateId: number, text: string, type?: 'text' | 'template' | 'interview_invite') => void;
  onMarkAsRead: (candidateId: number) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  candidats,
  activeCandidateId,
  onSelectCandidate,
  messages,
  onSendMessage,
  onMarkAsRead,
}) => {
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTemplatesMenu, setShowTemplatesMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Candidat sélectionné
  const selectedCandidate = candidats.find(c => c.id === activeCandidateId) || candidats[0];

  // Filtrer les messages pour le candidat actif
  const currentMessages = messages.filter(
    m => m.candidateId === (selectedCandidate ? selectedCandidate.id : -1)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Auto-scroll vers le dernier message
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, currentMessages.length, activeCandidateId]);

  // Marquer comme lu à l'ouverture de la conversation
  useEffect(() => {
    if (isOpen && selectedCandidate) {
      onMarkAsRead(selectedCandidate.id);
    }
  }, [isOpen, selectedCandidate?.id]);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedCandidate) return;

    onSendMessage(selectedCandidate.id, inputText.trim(), 'text');
    setInputText('');
    setShowTemplatesMenu(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleApplyTemplate = (tmpl: CannedTemplate) => {
    if (!selectedCandidate) return;
    const content = tmpl.getContent(selectedCandidate.nom, selectedCandidate.poste);
    setInputText(content);
    setShowTemplatesMenu(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = '110px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Liste de candidats filtrée
  const filteredCandidates = candidats.filter(c => {
    const text = searchTerm.toLowerCase();
    return c.nom.toLowerCase().includes(text) || c.poste.toLowerCase().includes(text);
  });

  const getUnreadCount = (candId: number) => {
    return messages.filter(
      m => m.candidateId === candId && m.senderRole === 'candidate' && !m.readByRecruiter
    ).length;
  };

  const getLastMessage = (candId: number) => {
    const candMsgs = messages
      .filter(m => m.candidateId === candId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return candMsgs[0];
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
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(3px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {/* TIROIR PRINCIPAL (SLIDE-OVER DRAWER) */}
      <div style={{
        width: '100%',
        maxWidth: '920px',
        height: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 35px rgba(0,0,0,0.25)',
        boxSizing: 'border-box'
      }}>
        {/* EN-TÊTE SUPÉRIEUR DU TIROIR */}
        <div style={{
          padding: '14px 20px',
          backgroundColor: '#0f172a',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1e293b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              backgroundColor: '#2563eb',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>
              💬
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                Messagerie Candidats & Échanges RH en Direct
              </h2>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Connecté en tant que : {currentUser.name} (Recruteur)
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

        {/* CORPS : 2 COLONNES (LISTE CANDIDATS + ZONE DE CHAT) */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          
          {/* ======================================================== */}
          {/* COLONNE GAUCHE : LISTE DES CONVERSATIONS                */}
          {/* ======================================================== */}
          <div style={{
            width: '310px',
            borderRight: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}>
            {/* Recherche candidat */}
            <div style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <input
                type="text"
                placeholder="Rechercher un candidat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            {/* Liste déroulante des conversations */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredCandidates.map((cand) => {
                const isSelected = selectedCandidate && selectedCandidate.id === cand.id;
                const unread = getUnreadCount(cand.id);
                const lastMsg = getLastMessage(cand.id);

                return (
                  <div
                    key={cand.id}
                    onClick={() => onSelectCandidate(cand.id)}
                    style={{
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                      borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent',
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {/* Avatar Initials */}
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? '#2563eb' : '#cbd5e1',
                      color: isSelected ? 'white' : '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      flexShrink: 0
                    }}>
                      {cand.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: unread > 0 ? '700' : '600', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cand.nom}
                        </span>
                        {lastMsg && (
                          <span style={{ fontSize: '10px', color: '#94a3b8', flexShrink: 0 }}>
                            {formatTime(lastMsg.timestamp)}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '11px', color: '#2563eb', marginBottom: '3px', fontWeight: '500' }}>
                        {cand.poste}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '11px',
                          color: unread > 0 ? '#0f172a' : '#64748b',
                          fontWeight: unread > 0 ? '600' : 'normal',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '170px'
                        }}>
                          {lastMsg ? (lastMsg.senderRole === 'recruiter' ? 'Vous : ' : '') + lastMsg.text : 'Aucun message'}
                        </span>

                        {unread > 0 && (
                          <span style={{
                            backgroundColor: '#2563eb',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            flexShrink: 0
                          }}>
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* COLONNE DROITE : CONVERSATION ACTIVE                    */}
          {/* ======================================================== */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: '#ffffff' }}>
            
            {/* EN-TÊTE DU CANDIDAT SÉLECTIONNÉ */}
            {selectedCandidate ? (
              <div style={{
                padding: '12px 20px',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#1e293b',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {selectedCandidate.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
                      {selectedCandidate.nom}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span>{selectedCandidate.poste} ({selectedCandidate.niveau})</span>
                      <span>•</span>
                      <span style={{ color: '#2563eb' }}>{selectedCandidate.email}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{
                    backgroundColor: selectedCandidate.statut === 'Retenu' ? '#dcfce7' : selectedCandidate.statut === 'Refusé' ? '#fee2e2' : '#fef9c3',
                    color: selectedCandidate.statut === 'Retenu' ? '#166534' : selectedCandidate.statut === 'Refusé' ? '#991b1b' : '#854d0e',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {selectedCandidate.statut}
                  </span>
                  <span style={{
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    Matching {selectedCandidate.scoreMatch}%
                  </span>
                </div>
              </div>
            ) : null}

            {/* FLUX DES MESSAGES (MESSAGE STREAM) */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              backgroundColor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              {currentMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto 0', fontSize: '13px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>✉️</div>
                  Aucun message pour le moment.<br />
                  Envoyez un message ou utilisez un modèle pour démarrer l'échange !
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isRecruiter = msg.senderRole === 'recruiter';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isRecruiter ? 'flex-end' : 'flex-start',
                        maxWidth: '82%',
                        alignSelf: isRecruiter ? 'flex-end' : 'flex-start'
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
                        <strong style={{ color: isRecruiter ? '#2563eb' : '#0f172a' }}>
                          {isRecruiter ? 'Vous (Recruteur)' : msg.senderName}
                        </strong>
                        <span>{formatTime(msg.timestamp)}</span>
                      </div>

                      {/* BULLE DU MESSAGE */}
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: isRecruiter ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        backgroundColor: isRecruiter ? '#2563eb' : '#ffffff',
                        color: isRecruiter ? '#ffffff' : '#1e293b',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        border: isRecruiter ? 'none' : '1px solid #e2e8f0',
                        fontSize: '13px',
                        lineHeight: '1.45',
                        whiteSpace: 'pre-line',
                        wordBreak: 'break-word'
                      }}>
                        {msg.type === 'interview_invite' && (
                          <div style={{
                            fontSize: '11px',
                            fontWeight: 'bold',
                            backgroundColor: isRecruiter ? 'rgba(255,255,255,0.2)' : '#fef3c7',
                            color: isRecruiter ? '#ffffff' : '#92400e',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginBottom: '6px'
                          }}>
                            📅 Invitation Entretien
                          </div>
                        )}
                        <div>{msg.text}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* BARRE DES MODÈLES PRÉ-DÉFINIS (CANNED TEMPLATES) */}
            <div style={{
              padding: '8px 16px',
              backgroundColor: '#f1f5f9',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', flexShrink: 0 }}>
                ⚡ Modèles RH :
              </span>
              {CANNED_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '14px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#334155',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.borderColor = '#2563eb';
                    (e.target as HTMLElement).style.color = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.borderColor = '#cbd5e1';
                    (e.target as HTMLElement).style.color = '#334155';
                  }}
                >
                  {tmpl.label}
                </button>
              ))}
            </div>

            {/* BARRE DE SAISIE DE MESSAGE (AUTO-EXPANDING INPUT BAR) */}
            <form onSubmit={handleSend} style={{
              padding: '12px 16px',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-end'
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputText}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder={`Répondre à ${selectedCandidate ? selectedCandidate.nom : 'candidat'} (Entrée pour envoyer, Maj+Entrée nouvelle ligne)...`}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'none',
                    maxHeight: '120px',
                    minHeight: '40px',
                    boxSizing: 'border-box',
                    backgroundColor: '#f8fafc'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim()}
                style={{
                  backgroundColor: inputText.trim() ? '#2563eb' : '#94a3b8',
                  color: 'white',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: inputText.trim() ? 'pointer' : 'not-allowed',
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
      </div>
    </div>
  );
};
