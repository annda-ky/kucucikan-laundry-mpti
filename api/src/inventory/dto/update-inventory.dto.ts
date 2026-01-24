import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryItemDto } from './create-inventory-item.dto.';

export class UpdateInventoryDto extends PartialType(CreateInventoryItemDto) {}
