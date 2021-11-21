import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  inputToStringArray(input: string): string[] {
    return input.split(', ');
  }
}
