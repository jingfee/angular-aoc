import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  commaInputToStringArray(input: string): string[] {
    return input.split(', ');
  }

  rowInputToStringArray(input: string): string[] {
    return input.split('\n');
  }

  rowInputToNumberArray(input: string): number[] {
    return input.split('\n').map((i) => Number.parseInt(i));
  }
}
