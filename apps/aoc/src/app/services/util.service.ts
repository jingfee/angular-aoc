import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  commaInputToStringArray(input: string): string[] {
    return input.split(', ');
  }

  rowInputToStringArray(input: string): string[] {
    return input.split('\n').filter((x) => x !== '');
  }

  rowInputToNumberArray(input: string): number[] {
    return input.split('\n').map((i) => Number.parseInt(i));
  }
}
