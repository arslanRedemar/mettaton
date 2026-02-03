-- Quiz Feature Interface Strings Migration
-- This script populates bot_strings table with all quiz-related interface strings
-- Run this after database initialization

-- CREATE - Register
INSERT OR REPLACE INTO bot_strings (key, value, params) VALUES
('quiz.registerSuccess', '✅ 퀴즈 #{id} 등록 완료 [{category}]', 'id,category'),
('quiz.registerDuplicate', '⚠️ 동일한 문제가 이미 존재합니다.', NULL),
('quiz.registerInvalidAnswer', '❌ 정답 번호는 1~5 사이여야 합니다.', NULL),
('quiz.registerCategoryNotFound', '❌ 카테고리 ''{category}''가 존재하지 않습니다. /퀴즈설정 카테고리추가로 먼저 등록하세요.', 'category');

-- CREATE - Bulk Register
INSERT OR REPLACE INTO bot_strings (key, value, params) VALUES
('quiz.bulkSuccess', '✅ {count}개의 문제가 등록되었습니다. (실패: {failCount}건)', 'count,failCount'),
('quiz.bulkFormatError', '❌ JSON 파일 형식이 올바르지 않습니다. 아래 형식을 참고하세요.', NULL),
('quiz.bulkEmpty', '❌ 등록할 문제가 없습니다.', NULL);

-- READ - List
INSERT OR REPLACE INTO bot_strings (key, value, params) VALUES
('quiz.listTitle', '📋 등록된 퀴즈 목록 (총 {total}문제)', 'total'),
('quiz.listItem', '#{id} [{category}] {questionPreview} - {status}', 'id,category,questionPreview,status'),
('quiz.listStatusPublished', '출제완료', NULL),
('quiz.listStatusPending', '미출제', NULL),
('quiz.listEmpty', '📭 등록된 퀴즈가 없습니다.', NULL);

-- READ - Statistics
INSERT OR REPLACE INTO bot_strings (key, value, params) VALUES
('quiz.statsTitle', '📊 퀴즈 통계', NULL),
('quiz.statsItem', '#{id} [{category}] 참여: {participants}명 / 정답률: {correctRate}%', 'id,category,participants,correctRate'),
('quiz.statsEmpty', '📭 출제된 퀴즈가 없습니다.', NULL);

-- READ - Status
INSERT OR REPLACE INTO bot_strings (key, value, params) VALUES
('quiz.statusTitle', '📊 퀴즈 현황', NULL),
('quiz.statusInfo', '총 문제: {total} / 미출제: {remaining} / 출제완료: {published}
출제 시간: {quizTime} / 해설 공개: {explanationTime}
출제 채널: <#{channelId}>', 'total,remaining,published,quizTime,explanationTime,channelId'),
('quiz.statusToday', '오늘의 문제: #{id} [{category}]', 'id,category'),
('quiz.statusNoToday', '오늘은 아직 출제되지 않았습니다.', NULL);

-- UPDATE - Edit
INSERT OR REPLACE INTO bot_strings (key, value, params) VALUES
('quiz.editSuccess', '✅ 퀴즈 #{id} 수정 완료', 'id'),
('quiz.editNotFound', '❌ 퀴즈 #{id}를 찾을 수 없습니다.', 'id'),
('quiz.editAlreadyPublished', '⚠️ 이미 출제된 문제입니다. 수정하시겠습니까?', NULL);

-- UPDATE - Config
INSERT OR REPLACE INTO bot_strings (key, value, params) VALUES
('quiz.configTimeSet', '✅ 출제 시간: {quizTime} / 해설 공개: {explanationTime}', 'quizTime,explanationTime'),
('quiz.configChannelSet', '✅ 출제 채널이 <#{channelId}>로 설정되었습니다.', 'channelId'),
('quiz.configEnabled', '✅ 퀴즈 출제가 활성화되었습니다.', NULL),
('quiz.configDisabled', '⏸️ 퀴즈 출제가 비활성화되었습니다.', NULL),
('quiz.configCategoryAdded', '✅ 카테고리 ''{category}''가 추가되었습니다.', 'category'),
('quiz.configCategoryRemoved', '✅ 카테고리 ''{category}''가 삭제되었습니다.', 'category'),
('quiz.configCategoryList', '📋 등록된 카테고리: {categories}', 'categories'),
('quiz.configCategoryInUse', '❌ ''{category}'' 카테고리에 {count}개의 문제가 등록되어 있어 삭제할 수 없습니다.', 'category,count'),
('quiz.configInvalidTime', '❌ 시간 형식이 올바르지 않습니다. HH:MM 형식으로 입력하세요.', NULL);

-- DELETE - Delete
INSERT OR REPLACE INTO bot_strings (key, value, params) VALUES
('quiz.deleteConfirm', '⚠️ 퀴즈 #{id}를 삭제합니다. 계속하시겠습니까?', 'id'),
('quiz.deleteSuccess', '🗑️ 퀴즈 #{id} 삭제 완료', 'id'),
('quiz.deleteNotFound', '❌ 퀴즈 #{id}를 찾을 수 없습니다.', 'id'),
('quiz.deleteCancelled', '취소되었습니다.', NULL);

-- DELETE - Reset History
INSERT OR REPLACE INTO bot_strings (key, value, params) VALUES
('quiz.resetConfirm', '⚠️ 출제 이력을 초기화합니다. 문제 데이터는 유지됩니다. 계속하시겠습니까?', NULL),
('quiz.resetSuccess', '✅ 출제 이력이 초기화되었습니다. ({count}건 초기화)', 'count'),
('quiz.resetCancelled', '초기화가 취소되었습니다.', NULL),
('quiz.resetTimeout', '초기화 요청이 시간 초과되었습니다.', NULL);

-- Answer
INSERT OR REPLACE INTO bot_strings (key, value, params) VALUES
('quiz.answerSuccess', '✅ {option}번으로 답변이 제출되었습니다.', 'option'),
('quiz.answerUpdated', '✅ 답변이 {option}번으로 수정되었습니다.', 'option'),
('quiz.answerNoQuiz', '❌ 현재 출제된 문제가 없습니다.', NULL),
('quiz.answerClosed', '❌ 답변이 마감되었습니다. (해설 공개 완료)', NULL),
('quiz.answerInvalid', '❌ 1~5 사이의 번호를 입력하세요.', NULL);

-- My Answer
INSERT OR REPLACE INTO bot_strings (key, value, params) VALUES
('quiz.myAnswerTitle', '📝 오늘의 퀴즈 내 답변', NULL),
('quiz.myAnswerInfo', '선택한 답: {option}번
제출 시각: {submittedAt}', 'option,submittedAt'),
('quiz.myAnswerNone', '아직 답변을 제출하지 않았습니다.', NULL),
('quiz.myAnswerNoQuiz', '❌ 현재 출제된 문제가 없습니다.', NULL);

-- Auto Publish (Scheduler)
INSERT OR REPLACE INTO bot_strings (key, value, params) VALUES
('quiz.publishTitle', '📝 오늘의 문제 #{id}', 'id'),
('quiz.publishCategory', '[{category}]', 'category'),
('quiz.publishQuestion', '{question}', 'question'),
('quiz.publishOption', '{num}. {option}', 'num,option'),
('quiz.publishFooter', '/답변 [번호]로 답변을 제출하세요! (해설 공개: {explanationTime})', 'explanationTime'),
('quiz.publishAllUsed', '모든 문제가 출제되었습니다. 출제 이력을 초기화하고 재출제합니다.', NULL),
('quiz.publishNoQuestions', '등록된 문제가 없어 출제를 건너뜁니다.', NULL);

-- Explanation Reveal (Scheduler)
INSERT OR REPLACE INTO bot_strings (key, value, params) VALUES
('quiz.explanationTitle', '📖 문제 #{id} 해설', 'id'),
('quiz.explanationAnswer', '정답: {answer}번', 'answer'),
('quiz.explanationBody', '{explanation}', 'explanation'),
('quiz.explanationStats', '참여자: {participants}명 / 정답률: {correctRate}%', 'participants,correctRate'),
('quiz.explanationPoints', '참가 포인트(150P): {participantCount}명 지급
정답 포인트(200P): {correctCount}명 지급', 'participantCount,correctCount');

-- Common
INSERT OR REPLACE INTO bot_strings (key, value, params) VALUES
('quiz.noPermission', '❌ 관리자만 사용할 수 있는 명령어입니다.', NULL),
('quiz.channelNotSet', '❌ 출제 채널이 설정되지 않았습니다. /퀴즈설정 채널로 설정하세요.', NULL);

-- Update timestamp
UPDATE bot_strings SET updated_at = CURRENT_TIMESTAMP WHERE key LIKE 'quiz.%';
