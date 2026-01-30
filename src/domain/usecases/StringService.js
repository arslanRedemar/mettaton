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
      'messageDelete.lectureDeleted': { value: '강의가 관리자에 의해 삭제됨.', params: null },
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
