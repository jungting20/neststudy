import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

const mockUserRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockConfigService4 = {
  get: jest.fn(),
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService4,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = {
        email: 'email@codefactory.ai',
        password: '123123',
      };

      const hashRounds = 10;
      const hashedPassword = 'sadksaldjsad';

      const result = {
        id: 1,
        email: createUserDto.email,
        password: hashedPassword,
      };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(mockConfigService4, 'get').mockReturnValue(hashRounds);
      jest.spyOn(bcrypt, 'hash').mockImplementation((password, rounds) => {
        return hashedPassword;
      });
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValueOnce(result);

      const createUser = await userService.create(createUserDto);

      expect(createUser).toEqual(result);
      expect(mockUserRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: {
          email: createUserDto.email,
        },
      });
      expect(mockUserRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: {
          email: createUserDto.email,
        },
      });
      expect(mockConfigService4.get).toHaveBeenCalledWith(expect.anything());
      expect(bcrypt.hash).toHaveBeenCalledWith(
        createUserDto.password,
        hashRounds,
      );
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        email: createUserDto.email,
        password: hashedPassword,
      });
    });

    it('should throw a BadRequestException if email already exists', async () => {
      const createUserDto = {
        email: 'email@codefactory.ai',
        password: '123123',
      };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValueOnce({
        id: 1,
        email: createUserDto.email,
      });

      expect(userService.create(createUserDto)).rejects.toThrowError(
        BadRequestException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: createUserDto.email,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        {
          id: 1,
          name: 'John Doe',
        },
      ];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await userService.findAll();
      expect(result).toEqual(users);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = {
        id: 1,
        email: 'email@codefactory.ai',
      };

      // mockUserRepository.findOne.mockResolvedValue(user);

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);
      const result = await userService.findOne(1);
      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);
      expect(userService.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
      });
      // expect(mockUserRepository.findOne).toHaveBeenCalledWith({});
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUdo = {
        email: 'email@codefactory.ai',
        password: '123123',
      };
      const hashROunds = 10;
      const hashedPassword = 'sadasd';
      const user = {
        id: 1,
        email: 'email@codefactory.ai',
        password: hashedPassword,
      };

      jest.spyOn(mockUserRepository, 'findOne').mockReturnValueOnce(user);
      jest.spyOn(mockConfigService4, 'get').mockReturnValue(hashROunds);
      jest.spyOn(bcrypt, 'hash').mockImplementation((password, rounds) => {
        return hashedPassword;
      });
      jest.spyOn(mockUserRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(mockUserRepository, 'findOne').mockReturnValueOnce({
        ...user,
        password: hashedPassword,
      });

      const result = await userService.update(1, updateUdo);

      expect(result).toEqual({ ...user, password: hashedPassword });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(updateUdo.password, hashROunds);
      expect(mockConfigService4.get).toHaveBeenCalledWith(expect.anything());
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        ...updateUdo,
        password: hashedPassword,
      });
    });

    it('should throw a NotFoundException if user update is not found', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);
      const updateUdo = {
        email: 'email@codefactory.ai',
        password: '123123',
      };
      expect(userService.update(999, updateUdo)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
      });
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  }),
    // it('', async () => {});

    describe('remove', () => {
      it('should delete a user', async () => {
        const id = 999;

        jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue({
          id: 1,
        });
        jest.spyOn(mockUserRepository, 'delete').mockResolvedValue(id);

        const result = await userService.remove(id);
        expect(result).toEqual(id);
      });

      it('should throw a NotFoundException if user is not found', async () => {
        jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

        expect(userService.remove(999)).rejects.toThrow(NotFoundException);
        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
          where: {
            id: 999,
          },
        });
      });
    });
});
