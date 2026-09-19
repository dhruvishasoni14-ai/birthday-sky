import React, { useState } from 'react';
import { useSky } from '../../context/SkyContext';
import { X, Plus, ArrowLeft, User, AlertCircle } from 'lucide-react';

export const NebulaWordModal: React.FC = () => {
  const { activeModal, setActiveModal, nebulaWords, addNebulaWord, currentUser, setAuthNotice } = useSky();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [word, setWord] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (activeModal !== 'nebula') return null;

  const close = () => {
    setActiveModal(null);
    setIsAdding(false);
    setSelectedId(null);
    setWord('');
    setReason('');
    setError(null);
  };

  const openAdd = () => {
    if (!currentUser) {
      setAuthNotice('Please Log In or Sign Up to add a Nebula Word.');
      setActiveModal('auth');
      return;
    }
    setError(null);
    setIsAdding(true);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanWord = word.trim().replace(/\s+/g, ' ');
    if (!cleanWord) return setError('Enter a word first.');
    if (cleanWord.split(' ').length > 1) return setError('Please enter one word only.');
    if (!reason.trim()) return setError('Tell us why you chose this word.');
    const result = addNebulaWord(cleanWord, reason.trim());
    if (!result.success) return setError(result.error || 'Unable to add this word.');
    setWord(''); setReason(''); setError(null); setIsAdding(false);
  };

  const selected = nebulaWords.find((item) => item.id === selectedId);

  return (
    <div className="modal-backdrop nebula-modal-backdrop" onClick={close}>
      <section className="nebula-word-modal glass-panel animate-scale-in" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="nebula-title">
        <header className="nebula-word-header">
          <div>
            <span className="nebula-word-eyebrow">Birthday Sky</span>
            <h2 id="nebula-title">Nebula</h2>
            <p>Describe Sum in one word</p>
          </div>
          {!isAdding && !selected && <button type="button" className="nebula-add-button" onClick={openAdd}><Plus size={16} /> Add Word</button>}
          <button type="button" className="nebula-close-button" onClick={close} aria-label="Close Nebula"><X size={20} /></button>
        </header>

        {isAdding ? (
          <form className="nebula-form" onSubmit={submit}>
            <button type="button" className="nebula-back-button" onClick={() => { setIsAdding(false); setError(null); }}><ArrowLeft size={16} /> Back to Nebula</button>
            <div className="nebula-form-field"><label htmlFor="nebula-word">Word</label><input id="nebula-word" value={word} onChange={(event) => setWord(event.target.value)} placeholder="One word" maxLength={32} autoFocus /></div>
            <div className="nebula-form-field"><label htmlFor="nebula-reason">Why did you choose this word for her?</label><textarea id="nebula-reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Share your reason" rows={5} maxLength={500} /></div>
            {currentUser && <div className="nebula-contributor"><Avatar src={currentUser.avatarUrl} name={currentUser.username} /><span>{currentUser.username}</span></div>}
            {error && <div className="nebula-error" role="alert"><AlertCircle size={16} /> {error}</div>}
            <button type="submit" className="nebula-continue-button">Continue</button>
          </form>
        ) : selected ? (
          <article className="nebula-description-view">
            <button type="button" className="nebula-back-button" onClick={() => setSelectedId(null)}><ArrowLeft size={16} /> Back to words</button>
            <h3>{selected.word}</h3>
            <div className="nebula-author"><Avatar src={selected.creatorAvatar} name={selected.creatorName} /><span>{selected.creatorName}</span></div>
            <p>{selected.explanation}</p>
          </article>
        ) : (
          <main className="nebula-word-list">
            {nebulaWords.length === 0 ? <div className="nebula-empty-state"><h3>No words yet</h3><p>Be the first to describe Sum in one word.</p><button type="button" className="nebula-continue-button" onClick={openAdd}><Plus size={16} /> Add Word</button></div> : nebulaWords.map((item) => <button type="button" className="nebula-word-card" key={item.id} onClick={() => setSelectedId(item.id)}><strong>{item.word}</strong><span className="nebula-author"><Avatar src={item.creatorAvatar} name={item.creatorName} /><span>{item.creatorName}</span></span></button>)}
          </main>
        )}
      </section>
    </div>
  );
};

function Avatar({ src, name }: { src?: string; name?: string }) {
  if (src?.startsWith('emoji:')) return <span className="nebula-avatar nebula-avatar-fallback">{src.replace('emoji:', '')}</span>;
  return src ? <img className="nebula-avatar" src={src} alt={`${name || 'Author'} profile`} /> : <span className="nebula-avatar nebula-avatar-fallback"><User size={14} /></span>;
}
