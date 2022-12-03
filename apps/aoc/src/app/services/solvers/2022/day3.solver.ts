import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day3Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 3).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.prioritySum(parsedInput);
        return this.aocClient.postAnswer(2022, 3, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 3).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.badge(parsedInput);
        return this.aocClient.postAnswer(2022, 3, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.prioritySum([
        'vJrwpWtwJgWrhcsFMMfFFhFp',
        'jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL',
        'PmmdzqPrVvPwwTWBwg',
        'wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn',
        'ttgJtRGJQctTZtZT',
        'CrZsJsPPZsGzwwsLwLmpwMDw',
      ]) === 157;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.badge([
        'vJrwpWtwJgWrhcsFMMfFFhFp',
        'jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL',
        'PmmdzqPrVvPwwTWBwg',
        'wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn',
        'ttgJtRGJQctTZtZT',
        'CrZsJsPPZsGzwwsLwLmpwMDw',
      ]) === 70;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private prioritySum(contents: string[]): number {
    let prioritySum = 0;
    for (const content of contents) {
      const size = content.length;
      const comp_1 = Array.from(content.substring(0, size / 2));
      const comp_2 = Array.from(content.substring(size / 2));
      const common_item = comp_1.find((c1) => comp_2.includes(c1));
      prioritySum += this.getPriority(common_item);
    }
    return prioritySum;
  }

  private badge(contents: string[]): number {
    let prioritySum = 0;
    for (let groupIndex = 0; groupIndex < contents.length; groupIndex += 3) {
      const elf_1 = Array.from(contents[groupIndex]);
      const elf_2 = Array.from(contents[groupIndex + 1]);
      const elf_3 = Array.from(contents[groupIndex + 2]);
      const badge = elf_1.find(
        (e1) => elf_2.includes(e1) && elf_3.includes(e1)
      );
      prioritySum += this.getPriority(badge);
    }
    return prioritySum;
  }

  private getPriority(char: string): number {
    const charCode = char.charCodeAt(0);
    return char === char.toUpperCase() ? charCode - 38 : charCode - 96;
  }
}
