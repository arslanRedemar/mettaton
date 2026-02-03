/**
 * Bot UI String Management Service
 * Manages DB overrides via in-memory cache with default fallback
 */
class StringService {
  constructor(repository) {
    this.repository = repository;
    this.cache = new Map();
    this.defaults = new Map();
    this._registerDefaults();
  }

  _registerDefaults() {
    const defs = {
      // ===== Interface strings =====
      'ready.loginSuccess': { value: '✅ 로그인 성공: {tag}', params: ['tag'] },
      'guildMemberAdd.welcome': { value: '🎉 환영합니다, <@{memberId}> 님! 서버에 오신 걸 환영해요!', params: ['memberId'] },
      'interactionCreate.commandNotFound': { value: '명령어를 찾을 수 없음: {name}', params: ['name'] },
      'interactionCreate.commandError': { value: '명령어 실행 오류: {name}', params: ['name'] },
      'interactionCreate.executionError': { value: '❌ 명령어 실행 중 오류가 발생했습니다.', params: null },
      'messageCreate.moonCommand': { value: '!달위상', params: null },
      'messageCreate.moonLoading': { value: '⏳ 달력 가져오는 중...', params: null },
      'messageCreate.moonTitle': { value: '🌙 달 위상 달력', params: null },
      'messageCreate.moonDescription': { value: '서울 기준 달력입니다.', params: null },
      'messageCreate.moonFooter': { value: '출처: Rhythm of Nature', params: null },
      'messageCreate.moonError': { value: '⚠️ 달력 가져오기에 실패했습니다.', params: null },
      'messageCreate.moonErrorLog': { value: '⚠️ 달력 전송 오류:', params: null },
      'messageDelete.questionDeleted': { value: '질문이 관리자에 의해 삭제됨.', params: null },
      'messageDelete.scheduleDeleted': { value: '일정이 관리자에 의해 삭제됨.', params: null },

      // ===== Schedule controller strings =====
      'schedule.registerSuccess': { value: '✅ 일정이 등록되었습니다.', params: null },
      'schedule.registerFail': { value: '❌ 일정 등록 실패:\n', params: null },
      'schedule.emptyTitle': { value: '제목이 비어 있습니다.', params: null },
      'schedule.emptyLocation': { value: '장소가 비어 있습니다.', params: null },
      'schedule.emptyTeacher': { value: '주최자가 비어 있습니다.', params: null },
      'schedule.invalidDate': { value: '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)', params: null },
      'schedule.invalidStartTime': { value: '시작 시간 형식이 올바르지 않습니다. (HH:mm)', params: null },
      'schedule.invalidEndTime': { value: '종료 시간 형식이 올바르지 않습니다. (HH:mm)', params: null },
      'schedule.embedTitle': { value: '📖 [{id}] {title}', params: ['id', 'title'] },
      'schedule.embedDescription': { value: '장소: {location}\n시각: {date} {start} ~ {end}\n주최자: {teacher}\n인원: {attendeeInfo}', params: ['location', 'date', 'start', 'end', 'teacher', 'attendeeInfo'] },
      'schedule.deleteNotFound': { value: '❌ 일정 ID {id}를 찾을 수 없습니다.', params: ['id'] },
      'schedule.deleteSuccess': { value: '🗑 일정 [{title}] 삭제 완료', params: ['title'] },
      'schedule.deleteMessageFail': { value: '일정 메시지 삭제 실패:', params: null },
      'schedule.listEmpty': { value: '📭 등록된 일정이 없습니다.', params: null },
      'schedule.listTitle': { value: '📚 현재 등록된 일정 목록', params: null },
      'schedule.listFieldValue': { value: '날짜: {date} {start}~{end}\n장소: {location}\n주최자: {teacher}\n참석자: {attendeeInfo}', params: ['date', 'start', 'end', 'location', 'teacher', 'attendeeInfo'] },
      'schedule.notFound': { value: '❌ 해당 ID의 일정이 없습니다.', params: null },
      'schedule.attendSuccess': { value: '✅ 일정 #{id} 참석 등록 완료', params: ['id'] },
      'schedule.cancelNotAttending': { value: '⚠️ 당신은 이 일정에 참석 등록되어 있지 않습니다.', params: null },
      'schedule.cancelSuccess': { value: '✅ 일정 **[{title}]** 참석이 취소되었습니다.', params: ['title'] },

      // ===== Question controller strings =====
      'question.registerSuccess': { value: '✅ 질문이 등록되었습니다.', params: null },
      'question.channelMessage': { value: '❓ **질문 #{id}**\n{question}\n작성자: <@{author}>', params: ['id', 'question', 'author'] },
      'question.channelMessageAnswered': { value: '❓ **질문 #{id}**\n{question}\n작성자: <@{author}>\n\n✅ **답변:** {answer}\n(답변자: <@{answeredBy}>)', params: ['id', 'question', 'author', 'answer', 'answeredBy'] },
      'question.embedTitle': { value: '❓ 질문 #{id}', params: ['id'] },
      'question.embedDescription': { value: '{question}\n\n작성자: <@{author}>\n참석자: {attendeeInfo}', params: ['question', 'author', 'attendeeInfo'] },
      'question.embedDescriptionAnswered': { value: '{question}\n\n작성자: <@{author}>\n\n✅ **답변:** {answer}\n(답변자: <@{answeredBy}>)\n참석자: {attendeeInfo}', params: ['question', 'author', 'answer', 'answeredBy', 'attendeeInfo'] },
      'question.deleteNotFound': { value: '❌ 질문 ID {id}를 찾을 수 없습니다.', params: ['id'] },
      'question.deleteSuccess': { value: '🗑 질문 #{id} 삭제 완료', params: ['id'] },
      'question.deleteMessageFail': { value: '질문 메시지 삭제 실패:', params: null },
      'question.listEmpty': { value: '📭 등록된 질문이 없습니다.', params: null },
      'question.listTitle': { value: '💬 현재 질문 목록', params: null },
      'question.listFieldValue': { value: '작성자: <@{author}>\n상태: {status}\n참석자: {attendeeInfo}', params: ['author', 'status', 'attendeeInfo'] },
      'question.statusAnswered': { value: '✅ 답변완료', params: null },
      'question.statusUnanswered': { value: '❌ 미답변', params: null },
      'question.answerNotFound': { value: '❌ 해당 ID의 질문이 없습니다.', params: null },
      'question.answerSuccess': { value: '✅ 질문 #{id}에 답변 등록 완료', params: ['id'] },

      // ===== Meeting controller strings =====
      'meeting.invalidTimeFormat': { value: '❌ 시간 형식이 올바르지 않습니다. (예: 23:00)', params: null },
      'meeting.configSaved': { value: '✅ 수행 모임 설정이 저장되었습니다.\n\n📢 알림 채널: <#{channel}>\n⏰ 알림 시각: {scheduleTime}\n🕐 모임 시각: {startTime} ~ {endTime}\n📍 장소: {location}\n📝 활동 내용: {activity}\n상태: {status}', params: ['channel', 'scheduleTime', 'startTime', 'endTime', 'location', 'activity', 'status'] },
      'meeting.noConfig': { value: '❌ 먼저 `/수행설정 설정` 명령어로 설정을 완료해주세요.', params: null },
      'meeting.enableSuccess': { value: '✅ 수행 모임 알림이 활성화되었습니다.', params: null },
      'meeting.noConfigExists': { value: '❌ 설정된 수행 모임이 없습니다.', params: null },
      'meeting.disableSuccess': { value: '⏸️ 수행 모임 알림이 비활성화되었습니다.', params: null },
      'meeting.noConfigView': { value: '❌ 설정된 수행 모임이 없습니다. `/수행설정 설정` 명령어로 설정해주세요.', params: null },
      'meeting.configDisplay': { value: '📋 **현재 수행 모임 설정**\n\n📢 알림 채널: <#{channel}>\n⏰ 알림 시각: {scheduleTime}\n🕐 모임 시각: {startTime} ~ {endTime}\n📍 장소: {location}\n📝 활동 내용: {activity}\n상태: {status}', params: ['channel', 'scheduleTime', 'startTime', 'endTime', 'location', 'activity', 'status'] },
      'meeting.statusEnabled': { value: '✅ 활성화', params: null },
      'meeting.statusDisabled': { value: '⏸️ 비활성화', params: null },

      // ===== Inactive member management strings =====
      'inactive.listEmpty': { value: '✅ 비활동 회원이 없습니다.', params: null },
      'inactive.listHeader': { value: '📋 {days}일 이상 비활동 회원 ({count}명):', params: ['days', 'count'] },
      'inactive.listItem': { value: '<@{memberId}> - 마지막 활동: {lastActive}', params: ['memberId', 'lastActive'] },
      'inactive.kickConfirm': { value: '⚠️ {count}명의 비활동 회원을 추방합니다. 계속하시겠습니까?', params: ['count'] },
      'inactive.kickProgress': { value: '⏳ 추방 진행 중... ({current}/{total})', params: ['current', 'total'] },
      'inactive.kickSuccess': { value: '✅ {count}명의 비활동 회원이 추방되었습니다.', params: ['count'] },
      'inactive.kickPartialFail': { value: '⚠️ {success}명 추방 완료, {fail}명 추방 실패 (권한 부족 등)', params: ['success', 'fail'] },
      'inactive.kickNoTarget': { value: '✅ 추방할 비활동 회원이 없습니다.', params: null },
      'inactive.configSaved': { value: '✅ 비활동 기준이 {days}일로 설정되었습니다.', params: ['days'] },
      'inactive.configDisplay': { value: '📋 현재 비활동 기준: {days}일', params: ['days'] },
      'inactive.kickCancelled': { value: '❌ 추방이 취소되었습니다.', params: null },
      'inactive.kickTimeout': { value: '⏰ 시간이 초과되어 추방이 취소되었습니다.', params: null },

      // ===== Sync command strings =====
      'sync.complete': {
        value: '✅ 동기화가 완료되었습니다.\n\n'
          + '**회원 활동 동기화:**\n'
          + '- 추가된 회원: {membersAdded}명\n'
          + '- 제거된 회원: {membersRemoved}명\n\n'
          + '**강의 참석자 정리:**\n'
          + '- 제거된 강의 참석 기록: {lectureAttendeesRemoved}건\n'
          + '- 제거된 질문 참석 기록: {questionAttendeesRemoved}건\n\n'
          + '**메시지 ID 검증:**\n'
          + '- 정리된 강의 메시지: {lectureMessagesCleaned}건\n'
          + '- 정리된 질문 메시지: {questionMessagesCleaned}건\n'
          + '- 정리된 수행 메시지: {practiceMessagesCleaned}건\n'
          + '- 정리된 퀴즈 메시지: {quizMessagesCleaned}건\n\n'
          + '**포인트 정리:**\n'
          + '- 제거된 포인트 기록: {pointsRemoved}건\n'
          + '- 제거된 누적 로그: {accumulationLogsRemoved}건\n\n'
          + '**수행 계획 정리:**\n'
          + '- 제거된 수행 계획: {practicesRemoved}건\n'
          + '- 제거된 수행 기록: {practiceRecordsRemoved}건\n\n'
          + '**퀴즈 이력 정리:**\n'
          + '- 정리된 퀴즈 이력: {quizHistoryCleaned}건',
        params: ['membersAdded', 'membersRemoved', 'lectureAttendeesRemoved', 'questionAttendeesRemoved', 'lectureMessagesCleaned', 'questionMessagesCleaned', 'practiceMessagesCleaned', 'quizMessagesCleaned', 'pointsRemoved', 'accumulationLogsRemoved', 'practicesRemoved', 'practiceRecordsRemoved', 'quizHistoryCleaned'],
      },
      'sync.error': { value: '❌ 동기화 중 오류가 발생했습니다: {error}', params: ['error'] },

      // ===== Point controller strings =====
      'point.myPoints': { value: '💰 **내 포인트**\n현재 포인트: **{points}점**', params: ['points'] },
      'point.noPoints': { value: '💰 **내 포인트**\n현재 포인트: **0점**\n\n활동을 통해 포인트를 모아보세요!', params: null },
      'point.rankingTitle': { value: '🏆 **포인트 랭킹**', params: null },
      'point.rankingItem': { value: '**{rank}위** - <@{memberId}>: {points}점', params: ['rank', 'memberId', 'points'] },
      'point.rankingEmpty': { value: '🏆 **포인트 랭킹**\n\n아직 포인트를 획득한 회원이 없습니다.', params: null },
      'point.configSaved': { value: '✅ 포인트 설정이 저장되었습니다.\n\n활동당 포인트: {pointsPerAction}점\n쿨다운: {cooldownMinutes}분', params: ['pointsPerAction', 'cooldownMinutes'] },
      'point.configDisplay': { value: '📋 **현재 포인트 설정**\n\n활동당 포인트: {pointsPerAction}점\n쿨다운: {cooldownMinutes}분', params: ['pointsPerAction', 'cooldownMinutes'] },
      'point.adjustSuccess': { value: '✅ <@{memberId}>의 포인트를 {amount}점 조정했습니다.\n새 포인트: {newPoints}점', params: ['memberId', 'amount', 'newPoints'] },
      'point.setSuccess': { value: '✅ <@{memberId}>의 포인트를 {newPoints}점으로 설정했습니다.', params: ['memberId', 'newPoints'] },
      'point.resetUserConfirm': { value: '⚠️ <@{memberId}>의 포인트를 초기화하시겠습니까?', params: ['memberId'] },
      'point.resetUserSuccess': { value: '✅ <@{memberId}>의 포인트가 초기화되었습니다.', params: ['memberId'] },
      'point.resetAllConfirm': { value: '⚠️ 모든 회원의 포인트를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다!', params: null },
      'point.resetAllSuccess': { value: '✅ 모든 회원의 포인트가 초기화되었습니다.', params: null },
      'point.resetCancelled': { value: '❌ 초기화가 취소되었습니다.', params: null },
      'point.resetTimeout': { value: '⏰ 시간이 초과되어 초기화가 취소되었습니다.', params: null },
      'point.userNotFound': { value: '❌ <@{memberId}> 회원의 포인트 기록을 찾을 수 없습니다.', params: ['memberId'] },

      // ===== Personal Practice strings =====
      'personalPractice.registerSuccess': { value: '✅ 개인 수행 계획이 등록되었습니다. (ID: {planId})', params: ['planId'] },
      'personalPractice.embedTitle': { value: '📝 개인 수행 계획', params: null },
      'personalPractice.embedDescription': {
        value: '수행자: {user}\n수행 내용: {content}\n매일 목표: {dailyGoal}{unit}\n기간: {startDate} ~ {endDate}\n진행률: {completed}/{totalDays}일 ({percentage}%)',
        params: ['user', 'content', 'dailyGoal', 'unit', 'startDate', 'endDate', 'completed', 'totalDays', 'percentage'],
      },
      'personalPractice.embedFooter': { value: '✅ 리액션 또는 /개인수행 체크 로 오늘의 수행을 기록하세요!', params: null },
      'personalPractice.invalidDateFormat': { value: '❌ 날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)', params: null },
      'personalPractice.endBeforeStart': { value: '❌ 종료일은 시작일 이후여야 합니다.', params: null },
      'personalPractice.startInPast': { value: '❌ 시작일은 오늘 이후여야 합니다.', params: null },
      'personalPractice.exceedsMaxDuration': { value: '❌ 계획 기간은 최대 1년(365일)까지 등록 가능합니다.', params: null },
      'personalPractice.graphTitle': { value: '📊 {user}님의 \'{content}\' 수행 현황', params: ['user', 'content'] },
      'personalPractice.graphProgress': { value: '전체 진행률: {completed}/{totalDays}일 ({percentage}%)', params: ['completed', 'totalDays', 'percentage'] },
      'personalPractice.graphError': { value: '❌ 그래프 생성 중 오류가 발생했습니다.', params: null },
      'personalPractice.editSuccess': { value: '✅ 수행 계획이 수정되었습니다. (ID: {planId})', params: ['planId'] },
      'personalPractice.deleteSuccess': { value: '✅ 수행 계획이 삭제되었습니다. (ID: {planId})', params: ['planId'] },
      'personalPractice.deleteMessageFail': { value: '수행 계획 메시지 삭제 실패:', params: null },
      'personalPractice.checkSuccess': { value: '✅ \'{content}\' 오늘의 수행이 기록되었습니다! ({completed}/{totalDays}일, {percentage}%)', params: ['content', 'completed', 'totalDays', 'percentage'] },
      'personalPractice.alreadyChecked': { value: 'ℹ️ 오늘은 이미 \'{content}\' 수행 체크가 되어 있습니다.', params: ['content'] },
      'personalPractice.outsidePeriod': { value: '❌ 오늘은 수행 계획 기간({startDate} ~ {endDate})에 포함되지 않습니다.', params: ['startDate', 'endDate'] },
      'personalPractice.notOwner': { value: '❌ 본인의 수행 계획만 수정/삭제할 수 있습니다.', params: null },
      'personalPractice.notFound': { value: '❌ 해당 수행 계획을 찾을 수 없습니다.', params: null },
      'personalPractice.alreadyEnded': { value: '❌ 이미 종료된 수행 계획입니다.', params: null },

      // ===== Quiz controller strings =====
      'quiz.registerSuccess': { value: '✅ 퀴즈 #{id} 등록 완료 [{category}]', params: ['id', 'category'] },
      'quiz.registerDuplicate': { value: '⚠️ 동일한 문제가 이미 존재합니다.', params: null },
      'quiz.registerInvalidAnswer': { value: '❌ 정답 번호는 1~5 사이여야 합니다.', params: null },
      'quiz.registerCategoryNotFound': { value: '❌ 카테고리 \'{category}\'가 존재하지 않습니다. /퀴즈설정 카테고리추가로 먼저 등록하세요.', params: ['category'] },
      'quiz.bulkSuccess': { value: '✅ {count}개의 문제가 등록되었습니다. (실패: {failCount}건)', params: ['count', 'failCount'] },
      'quiz.bulkFormatError': { value: '❌ JSON 파일 형식이 올바르지 않습니다. 아래 형식을 참고하세요.', params: null },
      'quiz.bulkEmpty': { value: '❌ 등록할 문제가 없습니다.', params: null },
      'quiz.listTitle': { value: '📋 등록된 퀴즈 목록 (총 {total}문제)', params: ['total'] },
      'quiz.listItem': { value: '#{id} [{category}] {questionPreview} - {status}', params: ['id', 'category', 'questionPreview', 'status'] },
      'quiz.listStatusPublished': { value: '출제완료', params: null },
      'quiz.listStatusPending': { value: '미출제', params: null },
      'quiz.listEmpty': { value: '📭 등록된 퀴즈가 없습니다.', params: null },
      'quiz.statsTitle': { value: '📊 퀴즈 통계', params: null },
      'quiz.statsItem': { value: '#{id} [{category}] 참여: {participants}명 / 정답률: {correctRate}%', params: ['id', 'category', 'participants', 'correctRate'] },
      'quiz.statsEmpty': { value: '📭 출제된 퀴즈가 없습니다.', params: null },
      'quiz.statusTitle': { value: '📊 퀴즈 현황', params: null },
      'quiz.statusInfo': { value: '총 문제: {total} / 미출제: {remaining} / 출제완료: {published}\n출제 시간: {quizTime} / 해설 공개: {explanationTime}\n출제 채널: <#{channelId}>', params: ['total', 'remaining', 'published', 'quizTime', 'explanationTime', 'channelId'] },
      'quiz.statusToday': { value: '오늘의 문제: #{id} [{category}]', params: ['id', 'category'] },
      'quiz.statusNoToday': { value: '오늘은 아직 출제되지 않았습니다.', params: null },
      'quiz.editSuccess': { value: '✅ 퀴즈 #{id} 수정 완료', params: ['id'] },
      'quiz.editNotFound': { value: '❌ 퀴즈 #{id}를 찾을 수 없습니다.', params: ['id'] },
      'quiz.editAlreadyPublished': { value: '⚠️ 이미 출제된 문제입니다. 수정하시겠습니까?', params: null },
      'quiz.configTimeSet': { value: '✅ 출제 시간: {quizTime} / 해설 공개: {explanationTime}', params: ['quizTime', 'explanationTime'] },
      'quiz.configChannelSet': { value: '✅ 출제 채널이 <#{channelId}>로 설정되었습니다.', params: ['channelId'] },
      'quiz.configEnabled': { value: '✅ 퀴즈 출제가 활성화되었습니다.', params: null },
      'quiz.configDisabled': { value: '⏸️ 퀴즈 출제가 비활성화되었습니다.', params: null },
      'quiz.configCategoryAdded': { value: '✅ 카테고리 \'{category}\'가 추가되었습니다.', params: ['category'] },
      'quiz.configCategoryRemoved': { value: '✅ 카테고리 \'{category}\'가 삭제되었습니다.', params: ['category'] },
      'quiz.configCategoryList': { value: '📋 등록된 카테고리: {categories}', params: ['categories'] },
      'quiz.configCategoryInUse': { value: '❌ \'{category}\' 카테고리에 {count}개의 문제가 등록되어 있어 삭제할 수 없습니다.', params: ['category', 'count'] },
      'quiz.configInvalidTime': { value: '❌ 시간 형식이 올바르지 않습니다. HH:MM 형식으로 입력하세요.', params: null },
      'quiz.deleteConfirm': { value: '⚠️ 퀴즈 #{id}를 삭제합니다. 계속하시겠습니까?', params: ['id'] },
      'quiz.deleteSuccess': { value: '🗑️ 퀴즈 #{id} 삭제 완료', params: ['id'] },
      'quiz.deleteNotFound': { value: '❌ 퀴즈 #{id}를 찾을 수 없습니다.', params: ['id'] },
      'quiz.deleteCancelled': { value: '취소되었습니다.', params: null },
      'quiz.resetConfirm': { value: '⚠️ 출제 이력을 초기화합니다. 문제 데이터는 유지됩니다. 계속하시겠습니까?', params: null },
      'quiz.resetSuccess': { value: '✅ 출제 이력이 초기화되었습니다. ({count}건 초기화)', params: ['count'] },
      'quiz.resetCancelled': { value: '초기화가 취소되었습니다.', params: null },
      'quiz.resetTimeout': { value: '초기화 요청이 시간 초과되었습니다.', params: null },
      'quiz.answerSuccess': { value: '✅ {option}번으로 답변이 제출되었습니다.', params: ['option'] },
      'quiz.answerUpdated': { value: '✅ 답변이 {option}번으로 수정되었습니다.', params: ['option'] },
      'quiz.answerNoQuiz': { value: '❌ 현재 출제된 문제가 없습니다.', params: null },
      'quiz.answerClosed': { value: '❌ 답변이 마감되었습니다. (해설 공개 완료)', params: null },
      'quiz.answerInvalid': { value: '❌ 1~5 사이의 번호를 입력하세요.', params: null },
      'quiz.myAnswerTitle': { value: '📝 오늘의 퀴즈 내 답변', params: null },
      'quiz.myAnswerInfo': { value: '선택한 답: {option}번\n제출 시각: {submittedAt}', params: ['option', 'submittedAt'] },
      'quiz.myAnswerNone': { value: '아직 답변을 제출하지 않았습니다.', params: null },
      'quiz.myAnswerNoQuiz': { value: '❌ 현재 출제된 문제가 없습니다.', params: null },
      'quiz.publishTitle': { value: '📝 오늘의 문제 #{id}', params: ['id'] },
      'quiz.publishCategory': { value: '[{category}]', params: ['category'] },
      'quiz.publishQuestion': { value: '{question}', params: ['question'] },
      'quiz.publishOption': { value: '{num}. {option}', params: ['num', 'option'] },
      'quiz.publishFooter': { value: '/답변 [번호]로 답변을 제출하세요! (해설 공개: {explanationTime})', params: ['explanationTime'] },
      'quiz.publishAllUsed': { value: '모든 문제가 출제되었습니다. 출제 이력을 초기화하고 재출제합니다.', params: null },
      'quiz.publishNoQuestions': { value: '등록된 문제가 없어 출제를 건너뜁니다.', params: null },
      'quiz.explanationTitle': { value: '📖 문제 #{id} 해설', params: ['id'] },
      'quiz.explanationAnswer': { value: '정답: {answer}번', params: ['answer'] },
      'quiz.explanationBody': { value: '{explanation}', params: ['explanation'] },
      'quiz.explanationStats': { value: '참여자: {participants}명 / 정답률: {correctRate}%', params: ['participants', 'correctRate'] },
      'quiz.explanationPoints': { value: '참가 포인트(150P): {participantCount}명 지급\n정답 포인트(200P): {correctCount}명 지급', params: ['participantCount', 'correctCount'] },
      'quiz.noPermission': { value: '❌ 관리자만 사용할 수 있는 명령어입니다.', params: null },
      'quiz.channelNotSet': { value: '❌ 출제 채널이 설정되지 않았습니다. /퀴즈설정 채널로 설정하세요.', params: null },
    };

    for (const [key, def] of Object.entries(defs)) {
      this.defaults.set(key, def);
    }
  }

  loadFromDatabase() {
    this.cache.clear();
    try {
      const rows = this.repository.getAllStrings();
      for (const row of rows) {
        this.cache.set(row.key, {
          value: row.value,
          params: row.params ? JSON.parse(row.params) : null,
        });
      }
      console.log(`[string-service/load] Loaded ${rows.length} string overrides from database`);
    } catch (error) {
      console.error(`[string-service/load] ${error.constructor.name}: Failed to load strings from database:`, error);
      throw error;
    }
  }

  refreshKey(key) {
    try {
      const row = this.repository.getString(key);
      if (row) {
        this.cache.set(key, {
          value: row.value,
          params: row.params ? JSON.parse(row.params) : null,
        });
        console.log(`[string-service/refresh] Cache refreshed for key: ${key}`);
      } else {
        this.cache.delete(key);
        console.log(`[string-service/refresh] Cache cleared for key: ${key} (reverted to default)`);
      }
    } catch (error) {
      console.error(`[string-service/refresh] ${error.constructor.name}: Failed to refresh key "${key}":`, error);
      throw error;
    }
  }

  get(key, replacements = {}) {
    const entry = this.cache.get(key) || this.defaults.get(key);
    if (!entry) {
      console.log(`[string-service/get] Missing string key: ${key}`);
      return `[missing string: ${key}]`;
    }
    let result = entry.value;
    for (const [param, val] of Object.entries(replacements)) {
      result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), val);
    }
    return result;
  }

  getDefault(key) {
    return this.defaults.get(key) || null;
  }

  getAllKeys() {
    const keys = [];
    for (const [key, def] of this.defaults) {
      const override = this.cache.get(key);
      keys.push({
        key,
        currentValue: override ? override.value : def.value,
        defaultValue: def.value,
        params: def.params,
        isOverridden: !!override,
      });
    }
    return keys;
  }

  setString(key, value) {
    const def = this.defaults.get(key);
    if (!def) {
      console.log(`[string-service/set] Unknown string key: ${key}`);
      throw new Error(`Unknown string key: ${key}`);
    }
    try {
      this.repository.setString(key, value, def.params);
      this.refreshKey(key);
      console.log(`[string-service/set] String updated: ${key}`);
    } catch (error) {
      console.error(`[string-service/set] ${error.constructor.name}: Failed to set string "${key}":`, error);
      throw error;
    }
  }

  resetString(key) {
    try {
      const deleted = this.repository.deleteString(key);
      this.cache.delete(key);
      if (deleted) {
        console.log(`[string-service/reset] String reset to default: ${key}`);
      } else {
        console.log(`[string-service/reset] No override found for: ${key} (already default)`);
      }
    } catch (error) {
      console.error(`[string-service/reset] ${error.constructor.name}: Failed to reset string "${key}":`, error);
      throw error;
    }
  }
}

module.exports = StringService;
