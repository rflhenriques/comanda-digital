import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';

export class UpdateItenDto extends PartialType(CreateItemDto) {}
