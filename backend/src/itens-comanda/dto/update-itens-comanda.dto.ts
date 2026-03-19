import { StatusPreparo } from '@prisma/client';

export class UpdateItemStatusDto {
  status: StatusPreparo;
}