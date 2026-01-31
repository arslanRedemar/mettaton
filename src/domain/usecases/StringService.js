/**
 * 봇 UI 문자열 관리 서비스
 * DB 오버라이드를 메모리 캐시로 관리하며, 기본값 fallback 제공
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
          + '- 제거된 참석 기록: {attendeesRemoved}건\n\n'
          + '**메시지 ID 검증:**\n'
          + '- 정리된 강의 메시지: {lectureMessagesCleaned}건\n'
          + '- 정리된 질문 메시지: {questionMessagesCleaned}건',
        params: ['membersAdded', 'membersRemoved', 'attendeesRemoved', 'lectureMessagesCleaned', 'questionMessagesCleaned'],
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
    };

    for (const [key, def] of Object.entries(defs)) {
      this.defaults.set(key, def);
    }
  }

  loadFromDatabase() {
    this.cache.clear();
    const rows = this.repository.getAllStrings();
    for (const row of rows) {
      this.cache.set(row.key, {
        value: row.value,
        params: row.params ? JSON.parse(row.params) : null,
      });
    }
  }

  refreshKey(key) {
    const row = this.repository.getString(key);
    if (row) {
      this.cache.set(key, {
        value: row.value,
        params: row.params ? JSON.parse(row.params) : null,
      });
    } else {
      this.cache.delete(key);
    }
  }

  get(key, replacements = {}) {
    const entry = this.cache.get(key) || this.defaults.get(key);
    if (!entry) {
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
      throw new Error(`Unknown string key: ${key}`);
    }
    this.repository.setString(key, value, def.params);
    this.refreshKey(key);
  }

  resetString(key) {
    this.repository.deleteString(key);
    this.cache.delete(key);
  }
}

module.exports = StringService;
