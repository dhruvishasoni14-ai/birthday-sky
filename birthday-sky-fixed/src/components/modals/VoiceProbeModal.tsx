import React, { useState, useRef, useEffect } from 'react';
import { useSky } from '../../context/SkyContext';
import { VoiceNote } from '../../types/celestial';
import { X, Upload, Mic, Square, Play, Pause, Radio, Volume2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { findSafeSkyPosition } from '../../utils/objectPlacement';

const NOTE_COLORS = [
  '#3b82f6', // Cosmic Blue
  '#a855f7', // Deep Purple
  '#ec4899', // Nebula Pink
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f59e0b'  // Amber Gold
];

export const VoiceProbeModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    voiceNotes,
    activeVoiceNoteId,
    addVoiceNote,
    markVoiceNoteHeard,
    currentUser,
    wishes,
    stories,
    secretStars
  } = useSky();

  const activeNote = voiceNotes.find((v) => v.id === activeVoiceNoteId);
  const isCreating = !activeNote;

  const [title, setTitle] = useState('Happy Birthday Voice Message 🛰️');
  const [contributor, setContributor] = useState(currentUser ? currentUser.username : '');
  const [selectedColor, setSelectedColor] = useState(activeNote?.noteColor || '#3b82f6');

  const [audioUrl, setAudioUrl] = useState<string | null>(activeNote?.audioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeNote) {
      setSelectedColor(activeNote.noteColor || '#3b82f6');
      setAudioUrl(activeNote.audioUrl || null);
    } else {
      setAudioUrl(null);
      setSelectedColor('#3b82f6');
      if (currentUser?.username) setContributor(currentUser.username);
    }
  }, [activeNote, currentUser]);

  if (activeModal !== 'voice-probe') return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Could not access microphone. You can upload an audio file instead.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      if (activeNote && !activeNote.heard) {
        markVoiceNoteHeard(activeNote.id);
      }
    }
  };

  const handleSaveProbe = () => {
    const position = findSafeSkyPosition('voice', [
      ...wishes.map((item) => ({ x: item.x, y: item.y, kind: 'wish' as const })),
      ...stories.map((item) => ({ x: item.x, y: item.y, kind: 'story' as const })),
      ...voiceNotes.map((item) => ({ x: item.x, y: item.y, kind: 'voice' as const })),
      ...secretStars.map((item) => ({ x: item.x, y: item.y, kind: 'secret' as const }))
    ]);
    const posX = position.x;
    const posY = position.y;

    const newProbe: VoiceNote = {
      id: `probe-${Date.now()}`,
      creatorId: currentUser?.id,
      creatorAvatar: currentUser?.avatarUrl,
      title: title || 'Space Probe Voice Note',
      contributor: contributor || (currentUser ? currentUser.username : 'Cosmic Traveler'),
      audioUrl: audioUrl || undefined,
      noteColor: selectedColor,
      x: posX,
      y: posY,
      heard: false,
      createdAt: Date.now()
    };

    addVoiceNote(newProbe);
    setActiveModal(null);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content voice-probe-window glass-panel animate-scale-in">
        <div className="probe-modal-header">
          <div className="probe-header-title">
            <Radio size={22} color={selectedColor} />
            <div>
              <h2>{isCreating ? 'Deploy Space Probe' : 'Voice Transmission'}</h2>
              <span className="probe-status-pill">● SIGNAL CONNECTED</span>
            </div>
          </div>
          <button
            type="button"
            className="close-modal-btn"
            onClick={() => setActiveModal(null)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="voice-probe-body">
          <div
            className="voice-transmission-card"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${selectedColor}44 0%, ${selectedColor}18 60%, #0d1117 100%)`,
              borderColor: selectedColor,
              boxShadow: `0 0 35px ${selectedColor}33`
            }}
          >
            {isCreating ? (
              <div className="probe-form-fields" style={{ width: '100%' }}>
                <label className="input-label">Transmission Title</label>
                <input
                  type="text"
                  className="studio-text-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Voice note..."
                />

                <label className="input-label" style={{ marginTop: '10px' }}>
                  Contributor Name
                </label>
                <input
                  type="text"
                  className="studio-text-input"
                  value={contributor}
                  onChange={(e) => setContributor(e.target.value)}
                  placeholder="Your Name"
                />

                <label className="input-label" style={{ marginTop: '10px' }}>
                  Colour Theme
                </label>
                <div className="note-color-row">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-dot-large ${selectedColor === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setSelectedColor(c)}
                    />
                  ))}
                </div>

                <div className="audio-actions-box">
                  <div className="audio-buttons-row">
                    {!isRecording ? (
                      <button
                        type="button"
                        className="record-btn"
                        onClick={startRecording}
                      >
                        <Mic size={16} />
                        <span>Record</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="stop-record-btn animate-pulse"
                        onClick={stopRecording}
                      >
                        <Square size={16} />
                        <span>Stop ({recordingSeconds}s)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      className="secondary-action-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={16} />
                      <span>Upload Audio</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      hidden
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="probe-view-info">
                <div className="probe-sender-tag" style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>
                  FROM: <strong>{activeNote.contributor || 'A Friend'}</strong>
                </div>
                <h3>{activeNote.title || 'Voice Note'}</h3>
              </div>
            )}

            {audioUrl ? (
              <div className="audio-player-wrapper">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                />

                <button
                  type="button"
                  className="play-pause-circle-btn"
                  style={{ backgroundColor: selectedColor }}
                  onClick={togglePlayback}
                >
                  {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '3px' }} />}
                </button>

                <div className="audio-waveform-bars">
                  {[40, 75, 30, 90, 60, 100, 45, 80, 50, 95, 35, 70, 85, 60].map((h, idx) => (
                    <div
                      key={idx}
                      className={`waveform-bar ${isPlaying ? 'animating' : ''}`}
                      style={{
                        height: isPlaying ? `${h}%` : '25%',
                        backgroundColor: selectedColor,
                        animationDelay: `${idx * 0.08}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-audio-yet-box">
                <Volume2 size={22} />
                <span>Record a voice note or upload an audio file</span>
              </div>
            )}
          </div>
        </div>

        {isCreating && (
          <div className="studio-footer">
            <span className="footer-info">
              Deploy your probe into the sky for this session ✦
            </span>
            <button
              type="button"
              className="continue-button"
              disabled={!audioUrl}
              onClick={handleSaveProbe}
            >
              <span>Launch Space Probe</span>
              <Sparkles size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
