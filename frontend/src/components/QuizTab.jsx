import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://127.0.0.1:8000/v1';

function QuizTab({ documents }) {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleGenerateQuiz = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const response = await axios.post(`${API_BASE}/quiz/generate`, {
        topic: topic || 'general',
        num_questions: numQuestions,
        difficulty: difficulty
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      setQuiz({
        ...response.data,
        time: elapsed
      });
      setCurrentQuestion(0);
      setUserAnswers({});
      setShowResults(false);
      toast.success('Quiz generated!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion]: answer
    });
  };

  const handleCheckAnswers = () => {
    setShowResults(true);
    const correct = quiz.questions.filter((q, idx) => 
      userAnswers[idx] === q.answer
    ).length;
    toast.success(`You got ${correct}/${quiz.questions.length} correct!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">📝 Generate Quiz from Your Documents</h2>
        <p className="text-slate-300">
          Create study questions automatically using AI
        </p>
      </div>

      {/* Quiz Settings */}
      {!quiz && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quiz Settings:</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Topic (optional):
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="transformer architecture"
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Number of Questions:
                </label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  disabled={loading}
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Difficulty:
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Question Type:
                </label>
                <select
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="mcq">Multiple Choice</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={handleGenerateQuiz}
              disabled={loading}
              className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Generating Quiz...</span>
                </>
              ) : (
                <>
                  <span>🎯</span>
                  <span>Generate Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Quiz Display */}
      {quiz && quiz.questions && (
        <div className="space-y-6">
          {/* Quiz Header */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                📋 Generated Quiz ({quiz.questions.length} questions)
              </h3>
              <span className="text-sm text-slate-400">{quiz.time}s</span>
            </div>
            <div className="mt-4 flex gap-2">
              {quiz.questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentQuestion === idx
                      ? 'bg-purple-500 text-white'
                      : userAnswers[idx]
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Current Question */}
          {quiz.questions[currentQuestion] && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <div className="mb-4">
                <span className="text-sm text-slate-500">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </span>
                <h4 className="text-xl font-semibold text-white mt-2">
                  {quiz.questions[currentQuestion].question}
                </h4>
              </div>

              <div className="space-y-3">
                {quiz.questions[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(String.fromCharCode(65 + idx))}
                    disabled={showResults}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      showResults
                        ? String.fromCharCode(65 + idx) === quiz.questions[currentQuestion].answer
                          ? 'bg-green-500/20 border-green-500 text-green-400'
                          : userAnswers[currentQuestion] === String.fromCharCode(65 + idx)
                          ? 'bg-red-500/20 border-red-500 text-red-400'
                          : 'bg-slate-900/50 border-slate-700 text-slate-400'
                        : userAnswers[currentQuestion] === String.fromCharCode(65 + idx)
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {option}
                  </button>
                ))}
              </div>

              {showResults && quiz.questions[currentQuestion].explanation && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-400 mb-1">Explanation:</p>
                  <p className="text-sm text-slate-300">{quiz.questions[currentQuestion].explanation}</p>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                {currentQuestion === quiz.questions.length - 1 && !showResults ? (
                  <button
                    onClick={handleCheckAnswers}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    ✓ Check Answers
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
                    disabled={currentQuestion === quiz.questions.length - 1}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setQuiz(null)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              🔄 Generate New Quiz
            </button>
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
              📥 Export Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizTab;
