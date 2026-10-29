import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { CATEGORY_NAME_MAX_LENGTH } from '../category.entity';

const trimName = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const normalizeColor = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toLowerCase() : value;

export class UpdateCategoryDto {
  @IsOptional()
  @Transform(trimName)
  @IsString()
  @IsNotEmpty()
  @MaxLength(CATEGORY_NAME_MAX_LENGTH)
  name?: string;

  @IsOptional()
  @Transform(normalizeColor)
  @Matches(/^#[0-9a-f]{6}$/i, {
    message: 'Color must be a hex value like #1a2b3c',
  })
  color?: string;
}
