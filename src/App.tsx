import React, { useState, useEffect } from 'react';
import { Timer, Users, Settings, Trophy, Play, Crown, Sparkles, Star, Award, ToggleLeft, ToggleRight, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import type { Team, Question, GameState } from './types';

const TEAM_COLORS = [
  'bg-[#FF3355]',
  'bg-[#45CAFF]',
  'bg-[#FFD700]',
  'bg-[#8A2BE2]',
  'bg-[#FF69B4]',
  'bg-[#00FF7F]',
  'bg-[#FF8C00]',
  'bg-[#4B0082]',
];

function App() {
  const createDummyQuestions = (): Question[] => {
    const questions = [
      // Easy Questions (1-10) - 2 points each
      { question: "Who built the ark?", answer: "Noah" },
      { question: "What is the first book of the Bible?", answer: "Genesis" },
      { question: "How many days did God take to create the world?", answer: "6 days (rested on the 7th)" },
      { question: "Who was swallowed by a big fish?", answer: "Jonah" },
      { question: "What is the shortest verse in the Bible?", answer: "Jesus wept (John 11:35)" },
      { question: "What did Jesus turn water into at the wedding?", answer: "Wine" },
      { question: "What was the name of the garden where Adam and Eve lived?", answer: "The Garden of Eden" },
      { question: "Who killed Goliath?", answer: "David" },
      { question: "How many disciples did Jesus have?", answer: "12" },
      { question: "What is the symbol of God's promise to Noah?", answer: "A rainbow" },

      // Medium Questions (11-20) - 3 points each
      { question: "Which two people in the Bible never died?", answer: "Enoch and Elijah" },
      { question: "What did God use to speak to Moses in the wilderness?", answer: "A burning bush" },
      { question: "What did Jesus feed 5,000 people with?", answer: "5 loaves and 2 fish" },
      { question: "Who was the first king of Israel?", answer: "Saul" },
      { question: "Which apostle walked on water with Jesus?", answer: "Peter" },
      { question: "What fruit did Eve eat in the garden?", answer: "The Bible doesn't specify—it just says 'fruit.'" },
      { question: "How many books are in the New Testament?", answer: "27" },
      { question: "What was Paul's name before he became a Christian?", answer: "Saul" },
      { question: "Who was thrown into a lion's den?", answer: "Daniel" },
      { question: "What is the last book of the Bible?", answer: "Revelation" },

      // Hard Questions (21-30) - 4 points each
      { question: "Who was the left-handed judge who killed Eglon?", answer: "Ehud" },
      { question: "What is the longest chapter in the Bible?", answer: "Psalm 119" },
      { question: "Which prophet saw a vision of a valley of dry bones?", answer: "Ezekiel" },
      { question: "What was the occupation of Luke?", answer: "Doctor/Physician" },
      { question: "How many people were saved on Noah's Ark?", answer: "8" },
      { question: "In what language was most of the Old Testament written?", answer: "Hebrew" },
      { question: "Who interpreted Pharaoh's dreams in Egypt?", answer: "Joseph" },
      { question: "Which king saw the writing on the wall?", answer: "King Belshazzar" },
      { question: "What city did Jonah try to flee to instead of going to Nineveh?", answer: "Tarshish" },
      { question: "What was the name of the mountain where Moses received the Ten Commandments?", answer: "Mount Sinai" },
    ];

    return questions.map((q, index) => ({
      number: index + 1,
      isAnswered: false,
      category: index < 10 ? 'easy' : index < 20 ? 'medium' : 'hard',
      points: index < 10 ? 2 : index < 20 ? 3 : 4,
      question: q.question,
      answer: q.answer,
    }));
  };

  const createInitialTeams = (count: number): Team[] => {
    return Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      name: `Team ${index + 1}`,
      score: 0,
      color: TEAM_COLORS[index % TEAM_COLORS.length],
    }));
  };

  const [gameState, setGameState] = useState<GameState>({
    currentTeam: 1,
    selectedQuestion: null,
    teams: createInitialTeams(3),
    questions: createDummyQuestions(),
    timer: null,
    passingPhase: false,
    availablePassTeams: [],
    isConfiguring: true,
    isManualMode: true,
  });

  const [teamCount, setTeamCount] = useState<number>(3);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [showWinners, setShowWinners] = useState<boolean>(false);
  const [winnerRevealStep, setWinnerRevealStep] = useState<number>(0);

  useEffect(() => {
    if (showWinners) {
      const revealSequence = [
        { delay: 1000, step: 1 }, // Show podium
        { delay: 2000, step: 2 }, // Show 3rd place
        { delay: 2000, step: 3 }, // Show 2nd place
        { delay: 2000, step: 4 }, // Show 1st place
      ];

      revealSequence.forEach(({ delay, step }, index) => {
        setTimeout(() => {
          setWinnerRevealStep(step);
        }, revealSequence.slice(0, index + 1).reduce((acc, curr) => acc + curr.delay, 0));
      });
    }
  }, [showWinners]);

  useEffect(() => {
    if (!gameState.isManualMode && gameState.timer !== null && gameState.timer > 0) {
      const timerId = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          timer: prev.timer! - 1,
        }));
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (!gameState.isManualMode && gameState.timer === 0) {
      handleWrongAnswer();
    }
  }, [gameState.timer, gameState.isManualMode]);

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      teams: createInitialTeams(teamCount),
      isConfiguring: false,
    }));
  };

  const selectQuestion = (number: number) => {
    if (gameState.questions.find(q => q.number === number)?.isAnswered) return;
    
    setGameState(prev => ({
      ...prev,
      selectedQuestion: number,
      timer: prev.isManualMode ? null : 30,
      passingPhase: false,
      availablePassTeams: [],
    }));
  };

  const selectTeam = (teamId: number) => {
    if (!gameState.isManualMode) return;
    
    setGameState(prev => ({
      ...prev,
      currentTeam: teamId,
    }));
  };

  const updateTeamScore = (teamId: number, newScore: number) => {
    if (!gameState.isManualMode) return;

    setGameState(prev => ({
      ...prev,
      teams: prev.teams.map(team =>
        team.id === teamId
          ? { ...team, score: Math.max(0, newScore) }
          : team
      ),
    }));
  };

  const toggleGameMode = () => {
    setGameState(prev => ({
      ...prev,
      isManualMode: !prev.isManualMode,
      timer: null,
    }));
  };

  const moveToNextTeam = () => {
    setGameState(prev => ({
      ...prev,
      currentTeam: (prev.currentTeam % prev.teams.length) + 1,
    }));
  };

  const handleCorrectAnswer = (teamId: number) => {
    const question = gameState.questions.find(q => q.number === gameState.selectedQuestion);
    if (!question) return;

    const points = gameState.passingPhase ? 1 : question.points;

    setGameState(prev => ({
      ...prev,
      teams: prev.teams.map(team => 
        team.id === teamId 
          ? { ...team, score: team.score + points }
          : team
      ),
      questions: prev.questions.map(q =>
        q.number === prev.selectedQuestion
          ? { ...q, isAnswered: true }
          : q
      ),
      selectedQuestion: null,
      timer: null,
      passingPhase: false,
      availablePassTeams: [],
    }));

    moveToNextTeam();
  };

  const handleWrongAnswer = () => {
    if (!gameState.passingPhase) {
      const otherTeams = gameState.teams
        .filter(team => team.id !== gameState.currentTeam)
        .map(team => team.id);
      setGameState(prev => ({
        ...prev,
        passingPhase: true,
        timer: prev.isManualMode ? null : 15,
        availablePassTeams: otherTeams,
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        selectedQuestion: null,
        timer: null,
        passingPhase: false,
        availablePassTeams: [],
      }));
      moveToNextTeam();
    }
  };

  const endGame = () => {
    setShowWinners(true);
    setWinnerRevealStep(0);
  };

  if (showWinners) {
    const sortedTeams = [...gameState.teams].sort((a, b) => b.score - a.score);
    const [first, second, third] = sortedTeams;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2B1055] via-[#4B0082] to-[#7597DE] gradient-animate flex items-center justify-center p-8 overflow-hidden">
        {winnerRevealStep === 4 && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
            gravity={0.2}
          />
        )}
        
        <div className="relative w-full max-w-4xl mx-auto">
          <AnimatePresence>
            {winnerRevealStep >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-center"
              >
                <h1 className="text-6xl font-black text-white mb-12 tracking-tight flex items-center justify-center gap-4">
                  <Trophy className="w-16 h-16 text-[#FFD700] animate-glow" />
                  Final Results
                </h1>

                <div className="flex justify-center items-end gap-8 mb-16 h-[500px]">
                  {/* Second Place */}
                  {winnerRevealStep >= 3 && (
                    <motion.div
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: "spring", damping: 12 }}
                      className="w-72"
                    >
                      <div className={`glass-effect rounded-2xl p-8 ${second.color} bg-opacity-20 transform translate-y-20`}>
                        <Star className="w-12 h-12 text-[#C0C0C0] mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">{second.name}</h2>
                        <p className="text-5xl font-black text-white">{second.score}</p>
                        <div className="mt-4 text-2xl font-bold text-white/80">2nd Place</div>
                      </div>
                    </motion.div>
                  )}

                  {/* First Place */}
                  {winnerRevealStep >= 4 && (
                    <motion.div
                      initial={{ y: -100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: "spring", damping: 12 }}
                      className="w-72"
                    >
                      <div className={`glass-effect rounded-2xl p-8 ${first.color} bg-opacity-20`}>
                        <Crown className="w-16 h-16 text-[#FFD700] mx-auto mb-4 animate-bounce-slow" />
                        <h2 className="text-4xl font-bold text-white mb-2">{first.name}</h2>
                        <p className="text-6xl font-black text-white">{first.score}</p>
                        <div className="mt-4 text-3xl font-bold text-white/80">Champion!</div>
                      </div>
                    </motion.div>
                  )}

                  {/* Third Place */}
                  {winnerRevealStep >= 2 && (
                    <motion.div
                      initial={{ x: 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: "spring", damping: 12 }}
                      className="w-72"
                    >
                      <div className={`glass-effect rounded-2xl p-8 ${third.color} bg-opacity-20 transform translate-y-32`}>
                        <Award className="w-12 h-12 text-[#CD7F32] mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">{third.name}</h2>
                        <p className="text-5xl font-black text-white">{third.score}</p>
                        <div className="mt-4 text-2xl font-bold text-white/80">3rd Place</div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {winnerRevealStep >= 4 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={() => window.location.reload()}
                    className="glass-effect px-8 py-4 rounded-xl text-xl font-bold text-white
                      hover:bg-white/10 transition-all duration-300"
                  >
                    Play Again
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2B1055] via-[#4B0082] to-[#7597DE] gradient-animate flex items-center justify-center p-4 overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1445112098124-3e76dd67983c?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
          <div className="relative z-10 text-center space-y-8">
            <div className="animate-float">
              <Crown className="w-24 h-24 text-[#FFD700] mx-auto mb-4 animate-glow" />
              <h1 className="text-7xl font-black text-white mb-4 tracking-tight">
                Church Quiz Game
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Test your knowledge, compete with friends, and have fun learning about the Bible!
              </p>
            </div>
            <button
              onClick={() => setShowIntro(false)}
              className="glass-effect px-12 py-6 rounded-2xl text-2xl font-bold
                bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] gradient-animate
                text-white shadow-xl hover:shadow-2xl transform hover:scale-105 
                transition-all duration-500 ease-out flex items-center gap-3"
            >
              <Play className="w-8 h-8" />
              Start Your Journey
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.isConfiguring) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2B1055] via-[#4B0082] to-[#7597DE] gradient-animate p-8 flex items-center justify-center">
        <div className="max-w-xl w-full glass-effect p-12 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] gradient-animate" />
          <div className="flex items-center gap-4 mb-12">
            <Settings className="w-12 h-12 text-[#FFD700] animate-spin-slow" />
            <h1 className="text-4xl font-black text-white tracking-tight">
              Game Setup
            </h1>
          </div>
          <div className="space-y-8">
            <div>
              <label className="block text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Users className="w-8 h-8 text-[#FFD700]" />
                How many teams are playing?
              </label>
              <input
                type="number"
                min="2"
                max="8"
                value={teamCount}
                onChange={(e) => setTeamCount(Math.min(8, Math.max(2, parseInt(e.target.value) || 2)))}
                className="w-full bg-white/5 border-2 border-white/30 rounded-2xl px-8 py-6 text-3xl
                  focus:outline-none focus:border-[#FFD700] transition-all duration-300
                  text-white placeholder-white/50"
              />
            </div>
            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] gradient-animate
                py-6 rounded-2xl text-2xl font-black text-white shadow-xl hover:shadow-2xl
                transform hover:scale-105 transition-all duration-500 ease-out
                flex items-center justify-center gap-3"
            >
              <Sparkles className="w-8 h-8" />
              Begin the Adventure!
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedQuestionData = gameState.questions.find(q => q.number === gameState.selectedQuestion);
  const sortedTeams = [...gameState.teams].sort((a, b) => b.score - a.score);
  const leaderTeam = sortedTeams[0];
  const currentTeam = gameState.teams.find(team => team.id === gameState.currentTeam);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B1055] via-[#4B0082] to-[#7597DE] gradient-animate p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Crown className="w-12 h-12 text-[#FFD700] animate-glow" />
            <h1 className="text-4xl font-black text-white tracking-tight">
              Church Quiz
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={toggleGameMode}
              className="flex items-center gap-2 text-white font-bold px-4 py-2 rounded-xl glass-effect"
            >
              {gameState.isManualMode ? (
                <ToggleLeft className="w-6 h-6 text-[#FFD700]" />
              ) : (
                <ToggleRight className="w-6 h-6 text-[#FFD700]" />
              )}
              {gameState.isManualMode ? 'Manual Mode' : 'Auto Mode'}
            </button>
            <button
              onClick={endGame}
              className="flex items-center gap-2 text-white font-bold px-4 py-2 rounded-xl glass-effect
                bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] bg-opacity-20"
            >
              <Flag className="w-6 h-6" />
              End Game
            </button>
            {gameState.timer !== null && (
              <div className="glass-effect flex items-center gap-4 px-8 py-4 rounded-2xl">
                <Timer className="w-10 h-10 text-[#FFD700]" />
                <span className="text-4xl font-black text-white tabular-nums">
                  {gameState.timer}s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {gameState.teams.map(team => (
            <div
              key={team.id}
              onClick={() => selectTeam(team.id)}
              className={`team-card glass-effect rounded-xl p-4
                ${team.color} bg-opacity-20
                ${team.id === gameState.currentTeam ? 'selected' : ''}
                ${gameState.isManualMode ? 'hover:border-[#FFD700]/50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {team === leaderTeam && (
                    <Crown className="w-6 h-6 text-[#FFD700] animate-glow" />
                  )}
                  <h2 className="text-xl font-bold text-white">
                    {team.name}
                  </h2>
                </div>
                {gameState.isManualMode && (
                  <input
                    type="number"
                    value={team.score}
                    onChange={(e) => updateTeamScore(team.id, parseInt(e.target.value) || 0)}
                    className="score-control"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>
              {!gameState.isManualMode && (
                <div className="flex items-center gap-2 mt-2">
                  <Trophy className={`w-6 h-6 ${team.color.replace('bg-', 'text-')}`} />
                  <p className="text-2xl font-bold text-white tabular-nums">
                    {team.score}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Question Board */}
        <div className="question-board">
          {/* Question Numbers */}
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="value-row">
              {Array.from({ length: 6 }, (_, col) => {
                const number = row * 6 + col + 1;
                const question = gameState.questions[number - 1];
                return (
                  <button
                    key={col}
                    onClick={() => selectQuestion(number)}
                    disabled={question.isAnswered || gameState.selectedQuestion !== null}
                    className={`question-card text-3xl md:text-4xl
                      ${number <= 10 ? 'easy-question' : number <= 20 ? 'medium-question' : 'hard-question'}`}
                  >
                    {number}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Question Modal */}
        {gameState.selectedQuestion && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 z-50">
            <div className="modal-content glass-effect max-w-3xl w-full rounded-3xl p-12 relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] gradient-animate" />
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <Award className="w-12 h-12 text-[#FFD700]" />
                  <div>
                    <h3 className="text-4xl font-black text-white tracking-tight">
                      Question {gameState.selectedQuestion}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xl font-bold flex items-center gap-2">
                        <span className={
                          selectedQuestionData?.category === 'easy'
                            ? 'text-green-400'
                            : selectedQuestionData?.category === 'medium'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }>
                          {selectedQuestionData?.category.charAt(0).toUpperCase() + selectedQuestionData?.category.slice(1)}
                        </span>
                        <span className="text-[#FFD700]">
                          • {selectedQuestionData?.points} points
                          {gameState.passingPhase && ' (Pass: 1 point)'}
                        </span>
                      </span>
                      {gameState.passingPhase ? (
                        <span className="text-xl text-white/70">• Pass Phase</span>
                      ) : (
                        <span className="text-xl text-white/70">• {currentTeam?.name}'s Turn</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <p className="text-3xl text-white leading-relaxed">
                    {selectedQuestionData?.question}
                  </p>
                </div>

                {gameState.isManualMode ? (
                  <div className="space-y-6">
                    {!gameState.passingPhase ? (
                      // Initial answer phase - show Correct/Wrong for current team
                      <div className="flex gap-6">
                        <button
                          onClick={() => handleCorrectAnswer(gameState.currentTeam)}
                          className="flex-1 bg-gradient-to-r from-emerald-400 to-green-600 
                            py-6 rounded-2xl text-2xl font-black text-white
                            hover:shadow-xl hover:shadow-emerald-500/20
                            transform hover:scale-105 transition-all duration-300"
                        >
                          Correct
                        </button>
                        <button
                          onClick={handleWrongAnswer}
                          className="flex-1 bg-gradient-to-r from-red-400 to-rose-600
                            py-6 rounded-2xl text-2xl font-black text-white
                            hover:shadow-xl hover:shadow-rose-500/20
                            transform hover:scale-105 transition-all duration-300"
                        >
                          Wrong
                        </button>
                      </div>
                    ) : (
                      // Pass phase - show other teams and wrong button
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {gameState.availablePassTeams.map(teamId => {
                            const team = gameState.teams.find(t => t.id === teamId);
                            return (
                              <button
                                key={teamId}
                                onClick={() => handleCorrectAnswer(teamId)}
                                className={`py-4 rounded-xl text-xl font-bold text-white
                                  ${team?.color} bg-opacity-20 hover:bg-opacity-40
                                  transition-all duration-300`}
                              >
                                {team?.name}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={handleWrongAnswer}
                          className="w-full bg-gradient-to-r from-red-400 to-rose-600
                            py-4 rounded-xl text-xl font-bold text-white
                            hover:shadow-xl hover:shadow-rose-500/20
                            transition-all duration-300"
                        >
                          No One Got It
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-6 justify-center">
                    <button
                      onClick={() => handleCorrectAnswer(gameState.passingPhase 
                        ? gameState.availablePassTeams[0] 
                        : gameState.currentTeam)}
                      className="flex-1 bg-gradient-to-r from-emerald-400 to-green-600 
                        py-6 rounded-2xl text-2xl font-black text-white
                        hover:shadow-xl hover:shadow-emerald-500/20
                        transform hover:scale-105 transition-all duration-300"
                    >
                      Correct
                    </button>
                    <button
                      onClick={handleWrongAnswer}
                      className="flex-1 bg-gradient-to-r from-red-400 to-rose-600
                        py-6 rounded-2xl text-2xl font-black text-white
                        hover:shadow-xl hover:shadow-rose-500/20
                        transform hover:scale-105 transition-all duration-300"
                    >
                      Wrong
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;