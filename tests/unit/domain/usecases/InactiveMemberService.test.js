const InactiveMemberService = require('../../../../src/domain/usecases/InactiveMemberService');
const MemberActivity = require('../../../../src/domain/entities/MemberActivity');

describe('InactiveMemberService', () => {
  let mockRepository;
  let service;

  beforeEach(() => {
    mockRepository = {
      getInactiveDays: jest.fn(),
      setInactiveDays: jest.fn(),
      updateMemberActivity: jest.fn(),
      getAllMemberActivities: jest.fn(),
    };
    service = new InactiveMemberService(mockRepository);
  });

  describe('getInactiveDays', () => {
    it('should return inactive days from repository', () => {
      mockRepository.getInactiveDays.mockReturnValue(90);

      const result = service.getInactiveDays();

      expect(result).toBe(90);
      expect(mockRepository.getInactiveDays).toHaveBeenCalledTimes(1);
    });
  });

  describe('setInactiveDays', () => {
    it('should set inactive days in repository for valid values', () => {
      service.setInactiveDays(60);

      expect(mockRepository.setInactiveDays).toHaveBeenCalledWith(60);
    });

    it('should throw error for days less than 1', () => {
      expect(() => service.setInactiveDays(0)).toThrow('Inactive days must be between 1 and 365');
      expect(mockRepository.setInactiveDays).not.toHaveBeenCalled();
    });

    it('should throw error for days greater than 365', () => {
      expect(() => service.setInactiveDays(366)).toThrow('Inactive days must be between 1 and 365');
      expect(mockRepository.setInactiveDays).not.toHaveBeenCalled();
    });

    it('should accept boundary values 1 and 365', () => {
      service.setInactiveDays(1);
      expect(mockRepository.setInactiveDays).toHaveBeenCalledWith(1);

      service.setInactiveDays(365);
      expect(mockRepository.setInactiveDays).toHaveBeenCalledWith(365);
    });
  });

  describe('recordActivity', () => {
    it('should call repository updateMemberActivity', () => {
      const userId = '123456789';

      service.recordActivity(userId);

      expect(mockRepository.updateMemberActivity).toHaveBeenCalledWith(userId);
    });
  });

  describe('getInactiveMembers', () => {
    it('should return only inactive members based on threshold', () => {
      mockRepository.getInactiveDays.mockReturnValue(90);

      const now = new Date();
      const activeDate = new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000); // 50 days ago
      const inactiveDate = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000); // 100 days ago

      const activeMember = new MemberActivity({ userId: '111', lastActiveAt: activeDate });
      const inactiveMember = new MemberActivity({ userId: '222', lastActiveAt: inactiveDate });

      mockRepository.getAllMemberActivities.mockReturnValue([activeMember, inactiveMember]);

      const result = service.getInactiveMembers();

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('222');
    });

    it('should return empty array when all members are active', () => {
      mockRepository.getInactiveDays.mockReturnValue(90);

      const now = new Date();
      const activeDate = new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000); // 50 days ago

      const activeMember1 = new MemberActivity({ userId: '111', lastActiveAt: activeDate });
      const activeMember2 = new MemberActivity({ userId: '222', lastActiveAt: activeDate });

      mockRepository.getAllMemberActivities.mockReturnValue([activeMember1, activeMember2]);

      const result = service.getInactiveMembers();

      expect(result).toHaveLength(0);
    });
  });

  describe('getKickableInactiveMembers', () => {
    it('should exclude bots from kickable list', () => {
      mockRepository.getInactiveDays.mockReturnValue(90);
      mockRepository.getAllMemberActivities.mockReturnValue([]);

      const mockGuild = {
        ownerId: 'owner123',
        members: {
          me: { roles: { highest: { position: 10 } } },
          cache: new Map([
            ['bot1', { id: 'bot1', user: { bot: true }, roles: { highest: { position: 5 } } }],
            ['user1', { id: 'user1', user: { bot: false }, roles: { highest: { position: 5 } } }],
          ]),
        },
      };

      const result = service.getKickableInactiveMembers(mockGuild);

      expect(result).toHaveLength(1);
      expect(result[0].member.id).toBe('user1');
    });

    it('should exclude server owner from kickable list', () => {
      mockRepository.getInactiveDays.mockReturnValue(90);
      mockRepository.getAllMemberActivities.mockReturnValue([]);

      const mockGuild = {
        ownerId: 'owner123',
        members: {
          me: { roles: { highest: { position: 10 } } },
          cache: new Map([
            ['owner123', { id: 'owner123', user: { bot: false }, roles: { highest: { position: 5 } } }],
            ['user1', { id: 'user1', user: { bot: false }, roles: { highest: { position: 5 } } }],
          ]),
        },
      };

      const result = service.getKickableInactiveMembers(mockGuild);

      expect(result).toHaveLength(1);
      expect(result[0].member.id).toBe('user1');
    });

    it('should exclude members with higher or equal role position than bot', () => {
      mockRepository.getInactiveDays.mockReturnValue(90);
      mockRepository.getAllMemberActivities.mockReturnValue([]);

      const mockGuild = {
        ownerId: 'owner123',
        members: {
          me: { roles: { highest: { position: 10 } } },
          cache: new Map([
            ['admin1', { id: 'admin1', user: { bot: false }, roles: { highest: { position: 15 } } }],
            ['mod1', { id: 'mod1', user: { bot: false }, roles: { highest: { position: 10 } } }],
            ['user1', { id: 'user1', user: { bot: false }, roles: { highest: { position: 5 } } }],
          ]),
        },
      };

      const result = service.getKickableInactiveMembers(mockGuild);

      expect(result).toHaveLength(1);
      expect(result[0].member.id).toBe('user1');
    });

    it('should include members with no activity record', () => {
      mockRepository.getInactiveDays.mockReturnValue(90);
      mockRepository.getAllMemberActivities.mockReturnValue([]);

      const mockGuild = {
        ownerId: 'owner123',
        members: {
          me: { roles: { highest: { position: 10 } } },
          cache: new Map([
            ['user1', { id: 'user1', user: { bot: false }, roles: { highest: { position: 5 } } }],
          ]),
        },
      };

      const result = service.getKickableInactiveMembers(mockGuild);

      expect(result).toHaveLength(1);
      expect(result[0].member.id).toBe('user1');
      expect(result[0].activity).toBeUndefined();
    });
  });

  describe('getInactiveMembersList', () => {
    it('should return formatted list with lastActive dates', () => {
      mockRepository.getInactiveDays.mockReturnValue(90);

      const now = new Date();
      const inactiveDate = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000); // 100 days ago

      const inactiveMember = new MemberActivity({ userId: 'user1', lastActiveAt: inactiveDate });
      mockRepository.getAllMemberActivities.mockReturnValue([inactiveMember]);

      const mockGuild = {
        ownerId: 'owner123',
        members: {
          cache: new Map([
            ['user1', { id: 'user1', user: { bot: false } }],
          ]),
        },
      };

      const result = service.getInactiveMembersList(mockGuild);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('user1');
      expect(result[0].lastActive).toBeTruthy();
    });

    it('should show "기록 없음" for members with no activity', () => {
      mockRepository.getInactiveDays.mockReturnValue(90);
      mockRepository.getAllMemberActivities.mockReturnValue([]);

      const mockGuild = {
        ownerId: 'owner123',
        members: {
          cache: new Map([
            ['user1', { id: 'user1', user: { bot: false } }],
          ]),
        },
      };

      const result = service.getInactiveMembersList(mockGuild);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('user1');
      expect(result[0].lastActive).toBe('기록 없음');
    });
  });

  describe('getKickReason', () => {
    it('should return formatted kick reason with days', () => {
      mockRepository.getInactiveDays.mockReturnValue(90);

      const reason = service.getKickReason();

      expect(reason).toBe('비활동 90일 이상');
    });

    it('should use current threshold days', () => {
      mockRepository.getInactiveDays.mockReturnValue(60);

      const reason = service.getKickReason();

      expect(reason).toBe('비활동 60일 이상');
    });
  });
});
