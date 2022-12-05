import { Injectable } from '@angular/core';
import { parse } from 'path';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day5Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 5).pipe(
      switchMap((input) => {
        const parsedInput = this.parseProcedures(
          this.utilService.rowInputToStringArray(input)
        );
        const result = this.rearrange(
          parsedInput.stacks,
          parsedInput.procedures,
          true
        );
        return this.aocClient.postAnswer(2022, 5, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 5).pipe(
      switchMap((input) => {
        const parsedInput = this.parseProcedures(
          this.utilService.rowInputToStringArray(input)
        );
        const result = this.rearrange(
          parsedInput.stacks,
          parsedInput.procedures,
          false
        );
        return this.aocClient.postAnswer(2022, 5, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const parsed = this.parseProcedures([
      '    [D]    ',
      '[N] [C]    ',
      '[Z] [M] [P]',
      ' 1   2   3 ',
      '',
      'move 1 from 2 to 1',
      'move 3 from 1 to 3',
      'move 2 from 2 to 1',
      'move 1 from 1 to 2',
    ]);
    const test =
      this.rearrange(parsed.stacks, parsed.procedures, true) === 'CMZ';

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const parsed = this.parseProcedures([
      '    [D]    ',
      '[N] [C]    ',
      '[Z] [M] [P]',
      ' 1   2   3 ',
      '',
      'move 1 from 2 to 1',
      'move 3 from 1 to 3',
      'move 2 from 2 to 1',
      'move 1 from 1 to 2',
    ]);
    const test =
      this.rearrange(parsed.stacks, parsed.procedures, false) === 'MCD';

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseProcedures(input: string[]): {
    stacks: string[][];
    procedures: string[];
  } {
    const stacks = [];
    const procedures = [];

    for (const line of input.reverse()) {
      if (line.includes('[')) {
        let crateIndex = 0;
        for (let readIndex = 1; readIndex < line.length; readIndex += 4) {
          if (stacks.length <= crateIndex) {
            stacks.push([]);
          }
          if (line[readIndex] !== ' ') {
            stacks[crateIndex].push(line[readIndex]);
          }
          crateIndex++;
        }
      } else if (line.startsWith('move')) {
        procedures.push(line);
      }
    }
    procedures.reverse();

    return { stacks, procedures };
  }

  private rearrange(
    stacks: string[][],
    procedures: string[],
    reverse: boolean
  ): string {
    for (const procedure of procedures) {
      const split = procedure.split(' ');
      const amount = +split[1];
      const from = +split[3];
      const to = +split[5];

      const top = stacks[from - 1].splice(
        stacks[from - 1].length - amount,
        amount
      );
      if (reverse) {
        top.reverse();
      }
      stacks[to - 1].push(...top);
    }

    let topCrates = '';
    for (const stack of stacks) {
      topCrates += stack[stack.length - 1];
    }
    return topCrates;
  }
}
