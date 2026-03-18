import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
// import { User } from './entities/user.entity';

const mockUserService = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return correct value', async () => {
      const createUserDto: CreateUserDto = {
        email: 'email@codefactory.ai',
        password: '123123',
      };
      const user = {
        id: 1,
        email: 'email@codefactory.ai',
        password: '123123',
      };
      jest.spyOn(userService, 'create').mockResolvedValue(user as User);
      const result = await controller.create(createUserDto);

      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    const users = [
      {
        id: 1,
        email: 'email@codefactory.ai',
        password: '123123',
      },
    ];

    it('shouuld return a list of users', async () => {
      jest.spyOn(userService, 'findAll').mockResolvedValue(users as User[]);

      const result = await controller.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    const user = {
      id: 1,
      email: 'email@codefactory.ai',
      password: '123123',
    };
    it('잘 찾아야함', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue(user as User);
      const result = await controller.findAll();
      expect(userService.findOne).toHaveBeenCalledWith({
        id: 1,
      });
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    const id = 1;
    const userDto = {
      email: 'email@codefactory.ai',
    };

    const user = {
      id: 1,
      email: 'email@codefactory.ai',
      password: '123123',
    };

    it('업데이트 해야함', async () => {
      jest.spyOn(userService, 'update').mockResolvedValue({
        id: +id,
        email: 'email@codefactory.ai',
        password: '123123',
      } as User);

      const result = await controller.update('' + id, userDto);
      expect(userService.update).toHaveBeenCalledWith({
        id: 1,
      });
      expect(result).toEqual(user);
    });
  });

  describe('remove', () => {
    const id = 1;

    const user = {
      id: 1,
      email: 'email@codefactory.ai',
      password: '123123',
    };

    it('업데이트 해야함', async () => {
      jest.spyOn(userService, 'remove').mockResolvedValue(id);

      const result = await controller.remove(String(id));
      expect(userService.remove).toHaveBeenCalledWith({
        id: 1,
      });
      expect(result).toEqual(user);
    });
  });
});
