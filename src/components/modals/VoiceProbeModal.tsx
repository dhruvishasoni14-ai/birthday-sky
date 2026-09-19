import React, { useState, useRef, useEffect } from 'react';
import { useSky } from '../../context/SkyContext';
import { VoiceNote } from '../../types/celestial';
import {
  X,
  Upload,
  Mic,
  Square,
  Play,
  Pause,
  Radio,
  Volume2,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { findSafeSkyPosition } from '../../utils/objectPlacement';

const NOTE_COLORS = [
  '#3b82f6',
  '#a855f7',
  '#ec4899',
  '#10b981',
  '#06b6d4',
  '#f59e0b'
];

const DEFAULT_TITLE = 'Happy Birthday Voice Message 🛰️';

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

  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /*
   * RESET WHENEVER A NEW PROBE IS OPENED
   * This guarantees clicking + always gives a completely fresh studio.
   */
  useEffect(() => {
    if (activeModal !== 'voice-probe') return;

    if (!activeNote) {
      setTitle('');
      setSelectedColor('#3b82f6');
      setAudioUrl(null);
      setIsPlaying(false);
      setIsRecording(false);
      setRecordingSeconds(0);
      setAudioProgress(0);
      setAudioDuration(0);
    } else {
      setTitle(activeNote.title || '');
      setSelectedColor(activeNote.noteColor || '#3b82f6');
      setAudioUrl(activeNote.audioUrl || null);
      setIsPlaying(false);
      setIsRecording(false);
      setRecordingSeconds(0);
      setAudioProgress(0);
      setAudioDuration(0);
    }
  }, [activeModal, activeNote]);

  /*
   * CLEAN UP RECORDING TIMER WHEN MODAL UNMOUNTS/CLOSES
   */
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  if (activeModal !== 'voice-probe') return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const url = URL.createObjectURL(file);

    setAudioUrl(url);
    setAudioProgress(0);
    setAudioDuration(0);
    setIsPlaying(false);

    e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm'
        });

        const url = URL.createObjectURL(audioBlob);

        setAudioUrl(url);
        setAudioProgress(0);
        setAudioDuration(0);
        setIsPlaying(false);
      };

      mediaRecorder.start();

      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      alert(
        'Could not access microphone. You can upload an audio file instead.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();

      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());

      mediaRecorderRef.current = null;

      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();

      if (activeNote && !activeNote.heard) {
        markVoiceNoteHeard(activeNote.id);
      }
    }
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;

    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration || 0;

    setAudioProgress(duration ? (current / duration) * 100 : 0);
  };

  const handleAudioLoaded = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;

    const value = Number(e.target.value);
    const duration = audioRef.current.duration || 0;

    audioRef.current.currentTime = (value / 100) * duration;
    setAudioProgress(value);
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetStudio = () => {
    setTitle('');
    setSelectedColor('#3b82f6');
    setAudioUrl(null);
    setIsPlaying(false);
    setIsRecording(false);
    setRecordingSeconds(0);
    setAudioProgress(0);
    setAudioDuration(0);

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());

      mediaRecorderRef.current = null;
    }

    audioChunksRef.current = [];
  };

  const handleSaveProbe = () => {
    if (!audioUrl) return;

    const position = findSafeSkyPosition('voice', [
      ...wishes.map((item) => ({
        x: item.x,
        y: item.y,
        kind: 'wish' as const
      })),
      ...stories.map((item) => ({
        x: item.x,
        y: item.y,
        kind: 'story' as const
      })),
      ...voiceNotes.map((item) => ({
        x: item.x,
        y: item.y,
        kind: 'voice' as const
      })),
      ...secretStars.map((item) => ({
        x: item.x,
        y: item.y,
        kind: 'secret' as const
      }))
    ]);

    const newProbe: VoiceNote = {
      id: `probe-${Date.now()}`,
      creatorId: currentUser?.id,
      creatorAvatar: currentUser?.avatarUrl,
      title: title.trim() || 'Space Probe Voice Note',
      contributor: currentUser?.username || 'Cosmic Traveler',
      audioUrl,
      noteColor: selectedColor,
      x: position.x,
      y: position.y,
      heard: false,
      createdAt: Date.now()
    };

    addVoiceNote(newProbe);

    /*
     * RESET EVERYTHING AFTER SUBMISSION
     * The next + click opens a completely empty probe studio.
     */
    resetStudio();

    setActiveModal(null);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => setActiveModal(null)}
    >
      <div
        className="modal-content voice-probe-window glass-panel animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '28px',
          boxSizing: 'border-box'
        }}
      >
        <div
          className="probe-modal-header"
          style={{
            padding: '0 0 20px',
            marginBottom: '22px',
            borderBottom: `1px solid ${selectedColor}44`
          }}
        >
          <div className="probe-header-title">
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${selectedColor}18`,
                border: `1px solid ${selectedColor}44`,
                boxShadow: `0 0 18px ${selectedColor}22`
              }}
            >
              <Radio size={21} color={selectedColor} />
            </div>

            <div style={{ marginLeft: '12px' }}>
              <h2 style={{ margin: 0 }}>
                {isCreating
                  ? 'Deploy Space Probe'
                  : 'Voice Transmission'}
              </h2>

              <span className="probe-status-pill">
                ● SIGNAL CONNECTED
              </span>
            </div>
          </div>

          <button
            type="button"
            className="close-modal-btn"
            onClick={() => setActiveModal(null)}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className="voice-probe-body"
          style={{
            padding: '0 4px'
          }}
        >
          <div
            className="voice-transmission-card"
            style={{
              background: `radial-gradient(circle at 50% 20%, ${selectedColor}38 0%, ${selectedColor}12 55%, #0d1117 100%)`,
              borderColor: selectedColor,
              boxShadow: `0 0 35px ${selectedColor}22`,
              borderRadius: '20px',
              padding: '24px',
              boxSizing: 'border-box'
            }}
          >
            {isCreating ? (
              <div
                className="probe-form-fields"
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <label
                  className="input-label"
                  style={{
                    marginTop: '2px',
                    marginBottom: '2px'
                  }}
                >
                  Transmission Title
                </label>

                <input
                  type="text"
                  className="studio-text-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your transmission a title..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '13px 15px',
                    borderRadius: '12px',
                    border: `1px solid ${selectedColor}44`,
                    background: 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    outline: 'none'
                  }}
                />

                <label
                  className="input-label"
                  style={{
                    marginTop: '12px',
                    marginBottom: '2px'
                  }}
                >
                  Accent Color
                </label>

                <div
                  className="note-color-row"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    padding: '8px 2px 4px'
                  }}
                >
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Choose accent color ${c}`}
                      className={`color-dot-large ${selectedColor === c ? 'active' : ''
                        }`}
                      style={{
                        backgroundColor: c,
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        border:
                          selectedColor === c
                            ? '3px solid #ffffff'
                            : '2px solid transparent',
                        boxShadow:
                          selectedColor === c
                            ? `0 0 14px ${c}99`
                            : `0 0 8px ${c}44`,
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedColor(c)}
                    />
                  ))}
                </div>

                <div
                  className="audio-actions-box"
                  style={{
                    marginTop: '14px',
                    padding: '18px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.045)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <div
                    className="audio-buttons-row"
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
                    {!isRecording ? (
                      <button
                        type="button"
                        className="record-btn"
                        onClick={startRecording}
                        style={{
                          borderRadius: '12px',
                          padding: '11px 16px'
                        }}
                      >
                        <Mic size={16} />
                        <span>Record</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="stop-record-btn animate-pulse"
                        onClick={stopRecording}
                        style={{
                          borderRadius: '12px',
                          padding: '11px 16px'
                        }}
                      >
                        <Square size={16} />
                        <span>Stop ({recordingSeconds}s)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      className="secondary-action-btn"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        borderRadius: '12px',
                        padding: '11px 16px'
                      }}
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
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '13px',
                    padding: '4px 4px 16px'
                  }}
                >
                  {activeNote.creatorAvatar ? (
                    <img
                      src={activeNote.creatorAvatar}
                      alt=""
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `2px solid ${selectedColor}`,
                        boxShadow: `0 0 14px ${selectedColor}55`
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `${selectedColor}20`,
                        border: `2px solid ${selectedColor}`,
                        color: selectedColor,
                        fontWeight: 800
                      }}
                    >
                      {(activeNote.contributor || 'A')
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}

                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        opacity: 0.55,
                        letterSpacing: '1.6px',
                        marginBottom: '3px'
                      }}
                    >
                      TRANSMISSION FROM
                    </div>

                    <strong
                      style={{
                        fontSize: '15px',
                        fontWeight: 700
                      }}
                    >
                      {activeNote.contributor || 'A Friend'}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    height: '1px',
                    background: `linear-gradient(90deg, transparent, ${selectedColor}66, transparent)`,
                    margin: '0 4px 20px'
                  }}
                />

                <h3
                  style={{
                    margin: 0,
                    padding: '0 8px',
                    fontFamily:
                      'Georgia, "Times New Roman", serif',
                    fontSize: '24px',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    letterSpacing: '0.2px',
                    color: '#ffffff',
                    textAlign: 'center',
                    textShadow: `0 0 18px ${selectedColor}33`
                  }}
                >
                  {activeNote.title || 'Voice Note'}
                </h3>

                <div
                  style={{
                    height: '1px',
                    background: `linear-gradient(90deg, transparent, ${selectedColor}44, transparent)`,
                    margin: '20px 4px 0'
                  }}
                />
              </div>
            )}

            {audioUrl ? (
              <div
                style={{
                  marginTop: '20px',
                  padding: '20px',
                  borderRadius: '18px',
                  background: 'rgba(7, 9, 22, 0.72)',
                  border: `1px solid ${selectedColor}30`,
                  boxShadow: `inset 0 0 30px ${selectedColor}08`
                }}
              >
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onLoadedMetadata={handleAudioLoaded}
                  onTimeUpdate={handleAudioTimeUpdate}
                  onEnded={() => {
                    setIsPlaying(false);
                    setAudioProgress(0);
                  }}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <button
                    type="button"
                    onClick={togglePlayback}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    style={{
                      flexShrink: 0,
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      border: `1px solid ${selectedColor}aa`,
                      background: `linear-gradient(135deg, ${selectedColor}, #8b5cf6)`,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: `0 0 22px ${selectedColor}66`,
                      transition:
                        'transform .2s ease, box-shadow .2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        'scale(1.08)';
                      e.currentTarget.style.boxShadow =
                        `0 0 30px ${selectedColor}88`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow =
                        `0 0 22px ${selectedColor}66`;
                    }}
                  >
                    {isPlaying ? (
                      <Pause size={21} fill="currentColor" />
                    ) : (
                      <Play
                        size={21}
                        fill="currentColor"
                        style={{ marginLeft: '3px' }}
                      />
                    )}
                  </button>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0
                    }}
                  >
                    <div
                      style={{
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        marginBottom: '5px'
                      }}
                    >
                      {[
                        28, 48, 35, 65, 45, 82, 54, 72,
                        40, 92, 58, 76, 44, 68, 36, 60,
                        48, 78, 42, 88, 52, 70
                      ].map((h, i) => {
                        const active =
                          audioProgress >= (i / 22) * 100;

                        return (
                          <span
                            key={i}
                            style={{
                              flex: 1,
                              maxWidth: '7px',
                              height: `${h}%`,
                              borderRadius: '999px',
                              background: active
                                ? selectedColor
                                : 'rgba(255,255,255,0.16)',
                              boxShadow: active
                                ? `0 0 8px ${selectedColor}77`
                                : 'none',
                              transform:
                                isPlaying && active
                                  ? 'scaleY(1.12)'
                                  : 'scaleY(1)',
                              transition:
                                'background .15s ease, transform .15s ease'
                            }}
                          />
                        );
                      })}
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={audioProgress}
                      onChange={handleSeek}
                      aria-label="Audio progress"
                      style={{
                        width: '100%',
                        accentColor: selectedColor,
                        cursor: 'pointer'
                      }}
                    />

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '3px',
                        fontSize: '11px',
                        opacity: 0.55
                      }}
                    >
                      <span>
                        {formatTime(
                          audioDuration *
                          (audioProgress / 100)
                        )}
                      </span>

                      <span>{formatTime(audioDuration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="no-audio-yet-box"
                style={{
                  marginTop: '18px',
                  padding: '22px 18px',
                  borderRadius: '15px',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.035)',
                  border: '1px dashed rgba(255,255,255,0.12)'
                }}
              >
                <Volume2 size={22} />

                <span>
                  Record a voice note or upload an audio file
                </span>
              </div>
            )}
          </div>
        </div>

        {isCreating && (
          <div
            className="studio-footer"
            style={{
              marginTop: '24px',
              padding: '18px 4px 0',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}
          >
            <span className="footer-info">
              Deploy your probe into the sky for this session ✦
            </span>

            <button
              type="button"
              className="continue-button"
              disabled={!audioUrl}
              onClick={handleSaveProbe}
              style={{
                borderRadius: '14px',
                padding: '12px 18px',
                boxShadow: audioUrl
                  ? `0 0 20px ${selectedColor}44`
                  : 'none'
              }}
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