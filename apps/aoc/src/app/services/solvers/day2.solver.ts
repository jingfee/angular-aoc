import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../models/status.model';
import { AocClientService } from '../aoc-client.service';
import { UtilService } from '../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day2Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 2).pipe(
      switchMap((input) => {
        const instructions = this.utilService.rowInputToStringArray(input);
        const result = this.calculatePosition(instructions);
        return this.aocClient.postAnswer(2021, 2, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 2).pipe(
      switchMap((input) => {
        const instructions = this.utilService.rowInputToStringArray(input);
        const result = this.calculatePositionWithAim(instructions);
        return this.aocClient.postAnswer(2021, 2, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.calculatePosition([
        'forward 5',
        'down 5',
        'forward 8',
        'up 3',
        'down 8',
        'forward 2',
      ]) === 150;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.calculatePositionWithAim([
        'forward 5',
        'down 5',
        'forward 8',
        'up 3',
        'down 8',
        'forward 2',
      ]) === 900;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private calculatePosition(instructions: string[]): number {
    let horizontal = 0;
    let depth = 0;

    for (const instruction of instructions) {
      const instruction_split = instruction.split(' ');
      const range = Number.parseInt(instruction_split[1]);
      switch (instruction_split[0]) {
        case 'forward': {
          horizontal += range;
          break;
        }
        case 'up': {
          depth -= range;
          break;
        }
        case 'down': {
          depth += range;
          break;
        }
      }
    }

    return horizontal * depth;
  }

  private calculatePositionWithAim(instructions: string[]): number {
    let horizontal = 0;
    let depth = 0;
    let aim = 0;

    for (const instruction of instructions) {
      const instruction_split = instruction.split(' ');
      const range = Number.parseInt(instruction_split[1]);
      switch (instruction_split[0]) {
        case 'forward': {
          horizontal += range;
          depth += aim * range;
          break;
        }
        case 'up': {
          aim -= range;
          break;
        }
        case 'down': {
          aim += range;
          break;
        }
      }
    }

    return horizontal * depth;
  }
}
