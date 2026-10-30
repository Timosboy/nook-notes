import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';
import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(1, 60)
  name: string;

  @IsString()
  @Length(8, 72)
  declare password: string;
}
