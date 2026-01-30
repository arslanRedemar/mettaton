const StringService = require('../../../../src/domain/usecases/StringService');

describe('StringService', () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      getAllStrings: jest.fn().mockReturnValue([]),
      getString: jest.fn().mockReturnValue(null),
      setString: jest.fn(),
      deleteString: jest.fn().mockReturnValue(true),
    };
    service = new StringService(mockRepository);
    service.loadFromDatabase();
  });

  describe('get()', () => {
    it('should return default static string', () => {
      const result = service.get('interactionCreate.executionError');
      expect(result).toBe('❌ 명령어 실행 중 오류가 발생했습니다.');
    });

    it('should resolve template parameters', () => {
      const result = service.get('ready.loginSuccess', { tag: 'Bot#1234' });
      expect(result).toBe('✅ 로그인 성공: Bot#1234');
    });

    it('should resolve multiple occurrences of same parameter', () => {
      mockRepository.getAllStrings.mockReturnValue([
        { key: 'ready.loginSuccess', value: '{tag} - {tag}', params: '["tag"]' },
      ]);
      service.loadFromDatabase();
      const result = service.get('ready.loginSuccess', { tag: 'Bot' });
      expect(result).toBe('Bot - Bot');
    });

    it('should return DB override when present', () => {
      mockRepository.getAllStrings.mockReturnValue([
        { key: 'interactionCreate.executionError', value: 'Custom error!', params: null },
      ]);
      service.loadFromDatabase();
      const result = service.get('interactionCreate.executionError');
      expect(result).toBe('Custom error!');
    });

    it('should return missing marker for unknown key', () => {
      const result = service.get('nonexistent.key');
      expect(result).toBe('[missing string: nonexistent.key]');
    });
  });

  describe('setString()', () => {
    it('should persist override and update cache', () => {
      mockRepository.getString.mockReturnValue({
        value: 'New value',
        params: null,
      });
      service.setString('interactionCreate.executionError', 'New value');
      expect(mockRepository.setString).toHaveBeenCalledWith(
        'interactionCreate.executionError',
        'New value',
        null
      );
      expect(service.get('interactionCreate.executionError')).toBe('New value');
    });

    it('should throw for unknown key', () => {
      expect(() => service.setString('unknown.key', 'value')).toThrow('Unknown string key: unknown.key');
    });
  });

  describe('resetString()', () => {
    it('should delete override and revert to default', () => {
      mockRepository.getAllStrings.mockReturnValue([
        { key: 'interactionCreate.executionError', value: 'Override', params: null },
      ]);
      service.loadFromDatabase();
      expect(service.get('interactionCreate.executionError')).toBe('Override');

      service.resetString('interactionCreate.executionError');
      expect(mockRepository.deleteString).toHaveBeenCalledWith('interactionCreate.executionError');
      expect(service.get('interactionCreate.executionError')).toBe('❌ 명령어 실행 중 오류가 발생했습니다.');
    });
  });

  describe('getAllKeys()', () => {
    it('should return all 14 default keys', () => {
      const keys = service.getAllKeys();
      expect(keys.length).toBe(14);
    });

    it('should mark overridden keys', () => {
      mockRepository.getAllStrings.mockReturnValue([
        { key: 'ready.loginSuccess', value: 'Custom login: {tag}', params: '["tag"]' },
      ]);
      service.loadFromDatabase();
      const keys = service.getAllKeys();
      const loginKey = keys.find((k) => k.key === 'ready.loginSuccess');
      expect(loginKey.isOverridden).toBe(true);
      expect(loginKey.currentValue).toBe('Custom login: {tag}');
    });

    it('should show default value for non-overridden keys', () => {
      const keys = service.getAllKeys();
      const errorKey = keys.find((k) => k.key === 'interactionCreate.executionError');
      expect(errorKey.isOverridden).toBe(false);
      expect(errorKey.currentValue).toBe(errorKey.defaultValue);
    });
  });

  describe('getDefault()', () => {
    it('should return default for known key', () => {
      const def = service.getDefault('ready.loginSuccess');
      expect(def).not.toBeNull();
      expect(def.params).toEqual(['tag']);
    });

    it('should return null for unknown key', () => {
      expect(service.getDefault('unknown.key')).toBeNull();
    });
  });
});
