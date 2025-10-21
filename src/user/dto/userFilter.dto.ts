import { IsNumber } from '@nestjs/class-validator';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class userFilterDto {

  search: string;

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  page: number | undefined;

  @Transform(({ value }) => {
    const x = parseInt(value);
    return x;
  })
  @IsOptional()
  limit: number | undefined;

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  identityStatus : number;

}
