import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day10Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 10).pipe(
      switchMap((input) => {
        const result = this.getSignalStrength(
          this.utilService.rowInputToStringArray(input)
        );
        return this.aocClient.postAnswer(2022, 10, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 10).pipe(
      switchMap((input) => {
        const result = this.getMessage(
          this.utilService.rowInputToStringArray(input)
        );
        console.log(result);
        return of(Status.ERROR);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test = this.getSignalStrength(PART_ONE_TEST) === 13140;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    console.log(this.getMessage(PART_ONE_TEST));
    const test = false;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  getSignalStrength(instructions: string[]): number {
    const readingCycles = [20, 60, 100, 140, 180, 220];
    let cycle = 0;
    let registerValue = 1;
    let instructionIndex = 0;

    let signalStrength = 0;

    let nextReading = readingCycles.shift();
    let instruction = instructions[instructionIndex];
    let valueToAdd;
    let valueToAddCycle;
    while (instructionIndex < instructions.length) {
      cycle++;
      if (valueToAddCycle === cycle) {
        registerValue += valueToAdd;
        valueToAdd = undefined;
        valueToAddCycle = undefined;
        instructionIndex++;
        instruction = instructions[instructionIndex];
      }

      if (nextReading === cycle) {
        signalStrength += nextReading * registerValue;
        nextReading = readingCycles.shift();
      }
      if (valueToAdd) {
        continue;
      }
      if (instruction === 'noop') {
        instructionIndex++;
        instruction = instructions[instructionIndex];
      } else if (instruction.startsWith('addx')) {
        const value = +instruction.split(' ')[1];
        valueToAdd = value;
        valueToAddCycle = cycle + 2;
      }
    }

    return signalStrength;
  }

  getMessage(instructions: string[]): string[] {
    const message = [];
    let messageRow = '';
    let cycle = 0;
    let registerValue = 1;
    let instructionIndex = 0;
    let instruction = instructions[instructionIndex];
    let valueToAdd;
    let valueToAddCycle;
    while (instructionIndex < instructions.length) {
      cycle++;
      if (valueToAddCycle === cycle) {
        registerValue += valueToAdd;
        valueToAdd = undefined;
        valueToAddCycle = undefined;
        instructionIndex++;
        instruction = instructions[instructionIndex];
      }

      if (
        registerValue - 1 <= (cycle - 1) % 40 &&
        registerValue + 1 >= (cycle - 1) % 40
      ) {
        messageRow += '#';
      } else {
        messageRow += '.';
      }
      if (cycle % 40 === 0) {
        message.push(messageRow);
        messageRow = '';
      }

      if (valueToAdd) {
        continue;
      }
      if (instruction === 'noop') {
        instructionIndex++;
        instruction = instructions[instructionIndex];
      } else if (instruction.startsWith('addx')) {
        const value = +instruction.split(' ')[1];
        valueToAdd = value;
        valueToAddCycle = cycle + 2;
      }
    }
    return message;
  }
}

const PART_ONE_TEST = [
  'addx 15',
  'addx -11',
  'addx 6',
  'addx -3',
  'addx 5',
  'addx -1',
  'addx -8',
  'addx 13',
  'addx 4',
  'noop',
  'addx -1',
  'addx 5',
  'addx -1',
  'addx 5',
  'addx -1',
  'addx 5',
  'addx -1',
  'addx 5',
  'addx -1',
  'addx -35',
  'addx 1',
  'addx 24',
  'addx -19',
  'addx 1',
  'addx 16',
  'addx -11',
  'noop',
  'noop',
  'addx 21',
  'addx -15',
  'noop',
  'noop',
  'addx -3',
  'addx 9',
  'addx 1',
  'addx -3',
  'addx 8',
  'addx 1',
  'addx 5',
  'noop',
  'noop',
  'noop',
  'noop',
  'noop',
  'addx -36',
  'noop',
  'addx 1',
  'addx 7',
  'noop',
  'noop',
  'noop',
  'addx 2',
  'addx 6',
  'noop',
  'noop',
  'noop',
  'noop',
  'noop',
  'addx 1',
  'noop',
  'noop',
  'addx 7',
  'addx 1',
  'noop',
  'addx -13',
  'addx 13',
  'addx 7',
  'noop',
  'addx 1',
  'addx -33',
  'noop',
  'noop',
  'noop',
  'addx 2',
  'noop',
  'noop',
  'noop',
  'addx 8',
  'noop',
  'addx -1',
  'addx 2',
  'addx 1',
  'noop',
  'addx 17',
  'addx -9',
  'addx 1',
  'addx 1',
  'addx -3',
  'addx 11',
  'noop',
  'noop',
  'addx 1',
  'noop',
  'addx 1',
  'noop',
  'noop',
  'addx -13',
  'addx -19',
  'addx 1',
  'addx 3',
  'addx 26',
  'addx -30',
  'addx 12',
  'addx -1',
  'addx 3',
  'addx 1',
  'noop',
  'noop',
  'noop',
  'addx -9',
  'addx 18',
  'addx 1',
  'addx 2',
  'noop',
  'noop',
  'addx 9',
  'noop',
  'noop',
  'noop',
  'addx -1',
  'addx 2',
  'addx -37',
  'addx 1',
  'addx 3',
  'noop',
  'addx 15',
  'addx -21',
  'addx 22',
  'addx -6',
  'addx 1',
  'noop',
  'addx 2',
  'addx 1',
  'noop',
  'addx -10',
  'noop',
  'noop',
  'addx 20',
  'addx 1',
  'addx 2',
  'addx 2',
  'addx -6',
  'addx -11',
  'noop',
  'noop',
  'noop',
];
