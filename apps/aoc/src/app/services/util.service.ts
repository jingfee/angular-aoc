import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  commaInputToStringArray(input: string): string[] {
    return input.split(', ');
  }

  commaInputToNumberArray(input: string): number[] {
    return input.split(',').map((i) => Number.parseInt(i));
  }

  rowInputToStringArray(
    input: string,
    includeEmpty: boolean = false
  ): string[] {
    return input.split('\n').filter((x) => (includeEmpty ? true : x !== ''));
  }

  rowInputToNumberArray(input: string): number[] {
    return input.split('\n').map((i) => Number.parseInt(i));
  }

  rowInputToNumberMatrix(input: string): number[][] {
    return input
      .split('\n')
      .map((i) => i.split('').map((j) => Number.parseInt(j)))
      .filter((a) => a.length > 0);
  }
}
