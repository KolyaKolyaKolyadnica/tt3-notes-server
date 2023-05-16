import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserDtoBody {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  password: string;

  @IsString()
  username?: string;

  // activationLink: boolean; // Наверное по ошибке осталось
}
export class UserLoginDtoBody {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  password: string;
}
export class UserDto {
  id: string;
  email: string;
  username: string;
  isActivated: boolean;

  constructor(model) {
    this.id = model._id;
    this.email = model.email;
    this.username = model.username;
    this.isActivated = model.isActivated;
  }
}

// {
//   readonly parentId: string | null;
//   childrenId: string[];
//   text: string;
// }
