// src/common/pipes/trim-and-lowercase.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class TrimAndLowercasePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Only apply to strings
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
    // If the parameter is not a string, let it pass or throw specific error based on expectation
    // For a route parameter, you'd likely expect a string.
    throw new BadRequestException(`Validation failed: '${metadata.data}' must be a string.`);
  }
}