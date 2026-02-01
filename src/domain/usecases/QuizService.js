const QuizQuestion = require('../entities/QuizQuestion');
const QuizConfig = require('../entities/QuizConfig');
const QuizCategory = require('../entities/QuizCategory');
const QuizPublishHistory = require('../entities/QuizPublishHistory');
const QuizAnswer = require('../entities/QuizAnswer');

/**
 * Quiz Service
 * Handles business logic for daily quiz management
 */
class QuizService {
  /**
   * @param {Object} quizRepository - Quiz repository implementation
   * @param {Object} [pointAccumulationService] - Point accumulation service (optional)
   */
  constructor(quizRepository, pointAccumulationService = null) {
    this.repository = quizRepository;
    this.pointService = pointAccumulationService;
  }

  // ========== Question Management ==========

  /**
   * Register a new quiz question
   * @param {Object} params - Question parameters
   * @returns {QuizQuestion} - Created question
   */
  registerQuestion({
    category,
    question,
    option1,
    option2,
    option3,
    option4,
    option5,
    answer,
    explanation,
    createdBy,
  }) {
    // Validate answer
    if (!QuizQuestion.isValidAnswer(answer)) {
      throw new Error('INVALID_ANSWER');
    }

    // Check if category exists
    const categoryEntity = this.repository.getCategoryByName(category);
    if (!categoryEntity) {
      throw new Error('CATEGORY_NOT_FOUND');
    }

    // Check for duplicate
    if (this.repository.isDuplicateQuestion(question)) {
      throw new Error('DUPLICATE_QUESTION');
    }

    const quizQuestion = new QuizQuestion({
      category,
      question,
      option1,
      option2,
      option3,
      option4,
      option5,
      answer,
      explanation,
      createdBy,
    });

    return this.repository.addQuizQuestion(quizQuestion);
  }

  /**
   * Bulk register questions from JSON array
   * @param {Array<Object>} questionsData - Array of question objects
   * @param {string} createdBy - Creator user ID
   * @returns {{success: number, failed: number, errors: Array<{index: number, error: string}>}}
   */
  bulkRegisterQuestions(questionsData, createdBy) {
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    questionsData.forEach((data, index) => {
      try {
        // Validate format
        if (!data.category || !data.question || !Array.isArray(data.options) || data.options.length !== 5 || !data.answer || !data.explanation) {
          throw new Error('INVALID_FORMAT');
        }

        this.registerQuestion({
          category: data.category,
          question: data.question,
          option1: data.options[0],
          option2: data.options[1],
          option3: data.options[2],
          option4: data.options[3],
          option5: data.options[4],
          answer: data.answer,
          explanation: data.explanation,
          createdBy,
        });

        results.success += 1;
      } catch (error) {
        results.failed += 1;
        results.errors.push({
          index,
          error: error.message,
        });
      }
    });

    return results;
  }

  /**
   * Get all questions
   * @returns {Array<{question: QuizQuestion, isPublished: boolean}>}
   */
  getAllQuestions() {
    const questions = this.repository.getAllQuizQuestions();
    const publishedIds = new Set(
      this.repository.getAllPublishHistory().map((h) => h.questionId)
    );

    return questions.map((q) => ({
      question: q,
      isPublished: publishedIds.has(q.id),
    }));
  }

  /**
   * Get question by ID
   * @param {number} id - Question ID
   * @returns {QuizQuestion|null}
   */
  getQuestionById(id) {
    return this.repository.getQuizQuestionById(id);
  }

  /**
   * Update a question
   * @param {number} id - Question ID
   * @param {Object} updates - Fields to update
   * @returns {boolean} - Success status
   */
  updateQuestion(id, updates) {
    const question = this.repository.getQuizQuestionById(id);
    if (!question) {
      throw new Error('QUESTION_NOT_FOUND');
    }

    // Validate answer if provided
    if (updates.answer !== undefined && !QuizQuestion.isValidAnswer(updates.answer)) {
      throw new Error('INVALID_ANSWER');
    }

    // Check category exists if changing
    if (updates.category) {
      const categoryEntity = this.repository.getCategoryByName(updates.category);
      if (!categoryEntity) {
        throw new Error('CATEGORY_NOT_FOUND');
      }
    }

    // Apply updates
    Object.assign(question, updates);

    return this.repository.updateQuizQuestion(question);
  }

  /**
   * Delete a question
   * @param {number} id - Question ID
   * @returns {boolean} - Success status
   */
  deleteQuestion(id) {
    const question = this.repository.getQuizQuestionById(id);
    if (!question) {
      throw new Error('QUESTION_NOT_FOUND');
    }

    return this.repository.deleteQuizQuestion(id);
  }

  /**
   * Get quiz statistics
   * @returns {Array<{question: QuizQuestion, participants: number, correctRate: number}>}
   */
  getQuizStatistics() {
    const publishHistory = this.repository.getAllPublishHistory();

    return publishHistory.map((history) => {
      const question = this.repository.getQuizQuestionById(history.questionId);
      const participants = this.repository.getParticipantCount(history.questionId);
      const correctCount = this.repository.getCorrectAnswerCount(history.questionId);
      const correctRate = participants > 0 ? Math.round((correctCount / participants) * 100) : 0;

      return {
        question,
        participants,
        correctRate,
      };
    });
  }

  /**
   * Get quiz status overview
   * @returns {Object} - Status information
   */
  getQuizStatus() {
    const allQuestions = this.repository.getAllQuizQuestions();
    const publishedCount = this.repository.getPublishedQuestionCount();
    const unpublishedCount = allQuestions.length - publishedCount;
    const config = this.repository.getQuizConfig() || new QuizConfig({});
    const todayHistory = this.repository.getTodayPublishHistory();

    return {
      total: allQuestions.length,
      published: publishedCount,
      remaining: unpublishedCount,
      quizTime: config.quizTime,
      explanationTime: config.explanationTime,
      channelId: config.quizChannelId,
      todayQuestion: todayHistory ? this.repository.getQuizQuestionById(todayHistory.questionId) : null,
    };
  }

  // ========== Category Management ==========

  /**
   * Get all categories
   * @returns {QuizCategory[]}
   */
  getAllCategories() {
    return this.repository.getAllCategories();
  }

  /**
   * Add a category
   * @param {string} name - Category name
   * @returns {QuizCategory}
   */
  addCategory(name) {
    if (!QuizCategory.isValidName(name)) {
      throw new Error('INVALID_CATEGORY_NAME');
    }

    // Check if already exists
    if (this.repository.getCategoryByName(name)) {
      throw new Error('CATEGORY_ALREADY_EXISTS');
    }

    const category = new QuizCategory({ name });
    return this.repository.addCategory(category);
  }

  /**
   * Delete a category
   * @param {string} name - Category name
   * @returns {boolean}
   */
  deleteCategory(name) {
    const category = this.repository.getCategoryByName(name);
    if (!category) {
      throw new Error('CATEGORY_NOT_FOUND');
    }

    // Check if category has questions
    const questionCount = this.repository.getQuestionCountByCategory(name);
    if (questionCount > 0) {
      const error = new Error('CATEGORY_IN_USE');
      error.questionCount = questionCount;
      throw error;
    }

    return this.repository.deleteCategory(name);
  }

  // ========== Configuration ==========

  /**
   * Get quiz configuration
   * @returns {QuizConfig}
   */
  getConfig() {
    return this.repository.getQuizConfig() || new QuizConfig({});
  }

  /**
   * Update quiz configuration
   * @param {Object} updates - Configuration updates
   * @returns {boolean}
   */
  updateConfig(updates) {
    let config = this.repository.getQuizConfig();
    if (!config) {
      config = new QuizConfig({});
    }

    // Validate time formats if provided
    if (updates.quizTime && !QuizConfig.isValidTime(updates.quizTime)) {
      throw new Error('INVALID_TIME_FORMAT');
    }
    if (updates.explanationTime && !QuizConfig.isValidTime(updates.explanationTime)) {
      throw new Error('INVALID_TIME_FORMAT');
    }

    // Apply updates
    Object.assign(config, updates);

    return this.repository.updateQuizConfig(config);
  }

  // ========== Auto-Publishing ==========

  /**
   * Publish today's quiz (scheduled task)
   * @returns {Object|null} - {question: QuizQuestion, history: QuizPublishHistory} or null if skipped
   */
  publishTodayQuiz() {
    const config = this.repository.getQuizConfig();
    if (!config || !config.enabled) {
      console.log('[QuizService] Quiz auto-publish disabled');
      return null;
    }

    if (!config.hasChannel()) {
      console.log('[QuizService] Quiz channel not configured');
      return null;
    }

    // Check if already published today
    const today = QuizPublishHistory.getTodayDate();
    const existingHistory = this.repository.getPublishHistoryByDate(today);
    if (existingHistory) {
      console.log('[QuizService] Quiz already published today');
      return null;
    }

    // Get unpublished questions
    let unpublishedQuestions = this.repository.getUnpublishedQuestions();

    // If all questions published, reset history
    if (unpublishedQuestions.length === 0) {
      const resetCount = this.repository.deleteAllPublishHistory();
      console.log(`[QuizService] All questions used. Reset ${resetCount} publish records`);
      unpublishedQuestions = this.repository.getUnpublishedQuestions();

      if (unpublishedQuestions.length === 0) {
        console.log('[QuizService] No questions available after reset');
        return null;
      }
    }

    // Select random question
    const randomIndex = Math.floor(Math.random() * unpublishedQuestions.length);
    const selectedQuestion = unpublishedQuestions[randomIndex];

    // Create publish history
    const history = new QuizPublishHistory({
      questionId: selectedQuestion.id,
      publishedDate: today,
    });

    const savedHistory = this.repository.addPublishHistory(history);

    console.log(`[QuizService] Published quiz #${selectedQuestion.id} for ${today}`);
    return {
      question: selectedQuestion,
      history: savedHistory,
    };
  }

  /**
   * Reveal explanation and award points (scheduled task)
   * @returns {Object|null} - {question, participants, correctCount} or null if skipped
   */
  revealExplanation() {
    const today = QuizPublishHistory.getTodayDate();
    const history = this.repository.getPublishHistoryByDate(today);

    if (!history) {
      console.log('[QuizService] No quiz published today');
      return null;
    }

    if (history.isExplanationRevealed()) {
      console.log('[QuizService] Explanation already revealed');
      return null;
    }

    const question = this.repository.getQuizQuestionById(history.questionId);
    if (!question) {
      console.error(`[QuizService] Question #${history.questionId} not found`);
      return null;
    }

    // Award points to participants
    const unawardedAnswers = this.repository.getUnawardedAnswers(history.questionId);
    let participantCount = 0;
    let correctCount = 0;

    if (this.pointService) {
      unawardedAnswers.forEach((answer) => {
        try {
          if (answer.isCorrect) {
            // Award correct answer points (200P)
            const result = this.pointService.tryAccumulate(answer.userId, 'QUIZ_CORRECT');
            if (result) {
              answer.awardPoints(result.pointsAdded);
              correctCount += 1;
            }
          } else {
            // Award participation points (150P)
            const result = this.pointService.tryAccumulate(answer.userId, 'QUIZ_PARTICIPATE');
            if (result) {
              answer.awardPoints(result.pointsAdded);
              participantCount += 1;
            }
          }

          // Update answer with awarded points
          this.repository.upsertAnswer(answer);
        } catch (error) {
          console.error(`[QuizService] Point award error for user ${answer.userId}:`, error);
        }
      });
    }

    // Mark explanation as revealed
    history.revealExplanation();
    this.repository.updatePublishHistory(history);

    const totalParticipants = this.repository.getParticipantCount(history.questionId);
    const totalCorrect = this.repository.getCorrectAnswerCount(history.questionId);
    const correctRate = totalParticipants > 0 ? Math.round((totalCorrect / totalParticipants) * 100) : 0;

    console.log(`[QuizService] Explanation revealed for quiz #${question.id}. Participants: ${totalParticipants}, Correct: ${totalCorrect}`);

    return {
      question,
      participants: totalParticipants,
      correctCount: totalCorrect,
      correctRate,
      participantCount,
    };
  }

  // ========== Answer Management ==========

  /**
   * Submit an answer to today's quiz
   * @param {string} userId - Discord user ID
   * @param {number} selectedOption - Selected option (1-5)
   * @returns {{isNew: boolean, isCorrect: boolean}} - Submission result
   */
  submitAnswer(userId, selectedOption) {
    // Validate option
    if (!QuizAnswer.isValidOption(selectedOption)) {
      throw new Error('INVALID_OPTION');
    }

    // Get today's quiz
    const today = QuizPublishHistory.getTodayDate();
    const history = this.repository.getPublishHistoryByDate(today);

    if (!history) {
      throw new Error('NO_QUIZ_TODAY');
    }

    // Check if explanation already revealed
    if (history.isExplanationRevealed()) {
      throw new Error('ANSWER_CLOSED');
    }

    const question = this.repository.getQuizQuestionById(history.questionId);
    if (!question) {
      throw new Error('QUESTION_NOT_FOUND');
    }

    // Check if answer is correct
    const isCorrect = question.isCorrect(selectedOption);

    // Check if user already answered
    const existingAnswer = this.repository.getAnswerByQuestionAndUser(history.questionId, userId);
    const isNew = !existingAnswer;

    // Create or update answer
    const answer = existingAnswer || new QuizAnswer({
      questionId: history.questionId,
      userId,
      selectedOption,
      isCorrect,
    });

    if (!isNew) {
      answer.updateAnswer(selectedOption, isCorrect);
    }

    this.repository.upsertAnswer(answer);

    return { isNew, isCorrect };
  }

  /**
   * Get user's answer for today's quiz
   * @param {string} userId - Discord user ID
   * @returns {QuizAnswer|null}
   */
  getUserAnswer(userId) {
    const today = QuizPublishHistory.getTodayDate();
    const history = this.repository.getPublishHistoryByDate(today);

    if (!history) {
      return null;
    }

    return this.repository.getAnswerByQuestionAndUser(history.questionId, userId);
  }

  /**
   * Reset all publish history
   * @returns {number} - Number of deleted records
   */
  resetPublishHistory() {
    return this.repository.deleteAllPublishHistory();
  }

  /**
   * Get today's quiz question
   * @returns {QuizQuestion|null}
   */
  getTodayQuestion() {
    const history = this.repository.getTodayPublishHistory();
    if (!history) return null;
    return this.repository.getQuizQuestionById(history.questionId);
  }

  /**
   * Get today's publish history
   * @returns {QuizPublishHistory|null}
   */
  getTodayHistory() {
    return this.repository.getTodayPublishHistory();
  }
}

module.exports = QuizService;
