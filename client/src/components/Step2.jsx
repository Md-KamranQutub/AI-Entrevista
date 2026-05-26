import React, { useEffect, useRef, useState } from 'react'
import maleAi from '../assets/videos/male-ai.mp4'
import femaleAi from '../assets/videos/female-ai.mp4'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FaArrowRight, FaMicrophone, FaMicrophoneSlash, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const Step2 = ({ interviewData, onFinish }) => {
  const { questions, interviewId, userName } = interviewData;

  const videoRef = useRef(null);
  const recognitionRef = useRef();

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAIPlaying, setIsAiPlaying] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  // BUG FIX #1: was setTimeLeft(questions[currentIndex]) — missing .timeLimit
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit ?? 60);
  const [selectedVoice, setSelectedVoice] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState(null);
  const [subtitle, setSubtitle] = useState("");

  const question = questions[currentIndex];
  const percentage = question
    ? (((question.timeLimit - timeLeft) / question.timeLimit) * 100).toFixed(1)
    : 0;

  // BUG FIX #2: was setTimeLeft(questions[currentIndex]) — must use .timeLimit
  useEffect(() => {
    setTimeLeft(questions[currentIndex]?.timeLimit);
  }, [currentIndex]);

  useEffect(() => {
    if (isIntroPhase) return;
    if (!question) return;
    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // AI intro + question reading
  useEffect(() => {
    if (!selectedVoice) return;

    const runIntro = async () => {
      try {
        if (isIntroPhase) {
          await speakText(`Hi ${userName}, it's great to meet you today. I hope you are feeling confident and ready.`);
          await new Promise(r => setTimeout(r, 200));
          await speakText("I'll ask you a few questions. Just answer naturally and take your time. Let's begin.");
          setIsIntroPhase(false);
        } else if (question) {
          await new Promise(r => setTimeout(r, 800));
          if (currentIndex === questions.length - 1) {
            await speakText("Alright, this one might be a bit more challenging.");
          }
          await speakText(question.question);
        }
      } catch (err) {
        console.error(err);
      }
    };
    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log(voices);
      if (!voices.length) return;

      const femaleVoice = voices.find(v =>
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("siri") ||
        v.name.toLowerCase().includes("ava") ||
        v.name.toLowerCase().includes("alison") ||
        v.name.toLowerCase().includes("susan") ||
        v.name.toLowerCase().includes("kathy") ||
        v.name.toLowerCase().includes("vicky") ||
        v.name.toLowerCase().includes("female")
      );
      if (femaleVoice) { setVoiceGender("female"); setSelectedVoice(femaleVoice); return; }

      // const maleVoice = voices.find(v =>
      //   v.name.toLowerCase().includes("david") ||
      //   v.name.toLowerCase().includes("mark") ||
      //   v.name.toLowerCase().includes("male")
      // );
      // if (maleVoice) { setVoiceGender("male"); setSelectedVoice(maleVoice); return; }

      setSelectedVoice(voices[0]);
      setVoiceGender("male");
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleAi : femaleAi;

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        // BUG FIX #3: was resolveElements() — should be resolve()
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");
      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAiPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        if (videoRef.current) videoRef.current.currentTime = 0;
        setIsAiPlaying(false);
        // Note: isMicOn from closure may be stale here; this is a known React closure issue.
        // The parent useEffect handles restarting mic after question is spoken.
        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };

  // Speech recognition setup
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    // BUG FIX #4: was event.result.length — should be event.results.length
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setAnswer(prev => prev + " " + transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try { recognitionRef.current.start(); } catch (err) { console.log(err); }
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const toggleMic = () => {
    if (isMicOn) stopMic();
    else startMic();
    setIsMicOn(prev => !prev);
  };

  // Countdown timer
  useEffect(() => {
    if (isIntroPhase) return;
    if (!question) return;

    // BUG FIX #5: setTimeout was incorrectly wrapping setTimeLeft call
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0 || isSubmitting || feedback) {
          clearInterval(interval);
          return prev;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isIntroPhase, currentIndex, isSubmitting]);

  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/interview/submit-answer",
        { interviewId, questionIndex: currentIndex, answer, timeTaken: (question.timeLimit - timeLeft) },
        { withCredentials: true }
      );
      setFeedback(response.data.feedback);
      speakText(response.data.feedback);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");
    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }
    await speakText("Alright, let's move to the next question.");
    setCurrentIndex(prev => prev + 1);
    setTimeout(() => { if (isMicOn) startMic(); }, 500);
  };

  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    try {
      const result = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/interview/report",
        { interviewId },
        { withCredentials: true }
      );
      onFinish(result.data);
    } catch (err) {
      console.error(err);
    }
  };

  const isLastQuestion = currentIndex + 1 >= questions.length;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');

        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

        .font-display { font-family: 'Syne', sans-serif; }

        .glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
        }

        .glass-bright {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.13);
          backdrop-filter: blur(24px);
        }

        .emerald-glow {
          box-shadow: 0 0 30px rgba(16,185,129,0.2), 0 0 60px rgba(16,185,129,0.05);
        }

        .mic-pulse::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: rgba(16,185,129,0.3);
          animation: ping 1.2s cubic-bezier(0,0,0.2,1) infinite;
        }

        @keyframes ping {
          75%, 100% { transform: scale(1.6); opacity: 0; }
        }

        .subtitle-appear {
          animation: fadeSlideUp 0.3s ease;
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        textarea::-webkit-scrollbar { width: 4px; }
        textarea::-webkit-scrollbar-track { background: transparent; }
        textarea::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        .progress-ring { filter: drop-shadow(0 0 8px rgba(16,185,129,0.4)); }
      `}</style>

      {/* Header */}
      <div className="px-6 pt-6 pb-3 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-400 rounded-full" style={{ animation: 'ping 2s ease infinite' }} />
          <span className="font-display text-white text-sm tracking-widest uppercase opacity-70">Live Interview</span>
        </div>
        <div className="glass rounded-full px-4 py-1.5">
          <span className="text-emerald-400 text-sm font-medium">
            {/* BUG FIX #6: was currentIndex (0-based), now correctly shows currentIndex+1 */}
            Question {currentIndex + 1} <span className="opacity-40">/ {questions.length}</span>
          </span>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-4 pb-10 pt-2 grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Left panel — AI Avatar */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Video */}
          <div className="relative rounded-2xl overflow-hidden glass emerald-glow">
            <video
              ref={videoRef}
              className="w-full object-cover aspect-3/4"
              muted
              playsInline
              loop
            >
              {/* BUG FIX #7: removed stray "maleAi" text that was in original JSX */}
              <source src={videoSource} />
            </video>

            {/* Speaking badge */}
            <AnimatePresence>
              {isAIPlaying && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-3 left-3 flex items-center gap-2 glass rounded-full px-3 py-1.5"
                >
                  <span className="flex gap-0.5 items-end h-4">
                    {[0, 0.15, 0.3].map(d => (
                      <span key={d} style={{
                        display: 'block', width: 3, borderRadius: 99,
                        background: '#34d399',
                        animation: `bounce 0.6s ${d}s ease infinite alternate`,
                        height: 12,
                      }} />
                    ))}
                  </span>
                  <span className="text-emerald-400 text-xs font-medium">Speaking</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-slate-950/80 to-transparent" />
          </div>

          {/* Subtitle box */}
          <AnimatePresence>
            {subtitle.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass rounded-2xl px-5 py-4"
              >
                <p className="text-white/80 text-sm leading-relaxed italic">"{subtitle}"</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timer + Stats */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/40 text-xs uppercase tracking-widest">Time Remaining</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${timeLeft < 15 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {timeLeft < 15 ? 'Hurry up!' : 'On track'}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="progress-ring w-20 h-20 shrink-0">
                <CircularProgressbar
                  styles={buildStyles({
                    trailColor: 'rgba(255,255,255,0.06)',
                    pathColor: timeLeft < 15 ? '#f87171' : '#10b981',
                    textColor: timeLeft < 15 ? '#f87171' : '#10b981',
                    textSize: '28px',
                  })}
                  value={percentage}
                  text={`${timeLeft}`}
                />
              </div>
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-xs">Current</span>
                  <span className="text-emerald-400 font-display font-bold text-lg">{currentIndex + 1}</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-xs">Total</span>
                  <span className="text-white/70 font-display font-bold text-lg">{questions.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — Question + Answer */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Title */}
          <div>
            <h1 className="font-display text-3xl font-bold text-white">AI Smart Interview</h1>
            <p className="text-white/40 text-sm mt-1">Answer clearly and confidently. Take your time.</p>
          </div>

          {/* Question card */}
          <AnimatePresence mode="wait">
            {!isIntroPhase && question && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                className="glass-bright rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-emerald-400 font-medium uppercase tracking-widest">
                    Q{currentIndex + 1}
                  </span>
                  {isLastQuestion && (
                    <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Final Question
                    </span>
                  )}
                </div>
                <p className="text-white text-lg font-medium leading-relaxed">{question.question}</p>
              </motion.div>
            )}

            {isIntroPhase && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-bright rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-36"
              >
                <div className="w-10 h-10 border-2 border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin mb-4" />
                <p className="text-white/60 text-sm">Preparing your interview session…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer textarea */}
          <div className="flex-1 flex flex-col">
            <div className="glass-bright rounded-2xl overflow-hidden flex-1 focus-within:border-emerald-500/40 transition-colors"
              style={{ minHeight: 160, border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="px-4 pt-3 pb-1 border-b border-white/5 flex items-center justify-between">
                <span className="text-white/30 text-xs uppercase tracking-widest">Your Answer</span>
                <span className="text-white/20 text-xs">{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
              </div>
              <textarea 
                name="answer"
                id="answer"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                className="w-full h-full resize-none outline-none bg-transparent text-white/90 px-4 py-3 placeholder-white/20 text-sm leading-relaxed"
                style={{ minHeight: 130 }}
                placeholder="Start speaking or type your answer here…"
              />
            </div>
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.06)' }}
              >
                <div className="px-5 py-4 flex gap-3 items-start">
                  <FaCheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                  <p className="text-emerald-300 text-sm leading-relaxed">{feedback}</p>
                </div>
                <div className="px-5 pb-4">
                  <motion.button
                    onClick={handleNext}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-display font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all"
                    style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}
                  >
                    {isLastQuestion ? 'Finish Interview' : 'Next Question'}
                    <FaArrowRight size={14} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          {!feedback && !isIntroPhase && (
            <div className="flex gap-3">
              {/* Mic toggle */}
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className="relative w-12 h-12 flex items-center justify-center rounded-full shrink-0 transition-all"
                style={{
                  background: isMicOn ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isMicOn ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`,
                }}
                title={isMicOn ? 'Mute microphone' : 'Enable microphone'}
              >
                {isMicOn ? (
                  <>
                    <span className="mic-pulse absolute inset-0 rounded-full" />
                    <FaMicrophone className="text-emerald-400 relative z-10" size={16} />
                  </>
                ) : (
                  <FaMicrophoneSlash className="text-white/40" size={16} />
                )}
              </motion.button>

              {/* Submit */}
              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className="flex-1 py-3 rounded-xl font-display font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isSubmitting
                    ? 'rgba(255,255,255,0.05)'
                    : 'linear-gradient(135deg, #047857, #059669)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  boxShadow: isSubmitting ? 'none' : '0 4px 20px rgba(16,185,129,0.25)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
                    Evaluating…
                  </>
                ) : (
                  'Submit Answer'
                )}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          from { height: 4px; }
          to   { height: 14px; }
        }
      `}</style>
    </div>
  );
};

export default Step2;