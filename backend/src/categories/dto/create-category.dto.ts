import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CATEGORY_COLORS, CATEGORY_NAME_MAX_LENGTH } from '../category.entity';
import type { CategoryColor } from '../category.entity';

export class CreateCategoryDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(CATEGORY_NAME_MAX_LENGTH)
  name: string;

  @IsOptional()
  @IsIn(CATEGORY_COLORS)
  color?: CategoryColor;
}
