import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day11Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 11).pipe(
      switchMap((input) => {
        const result = this.monkeyRounds(
          this.parseMonkeys(this.utilService.rowInputToStringArray(input)),
          true,
          20
        );
        return this.aocClient.postAnswer(2022, 11, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 11).pipe(
      switchMap((input) => {
        const result = this.monkeyRounds(
          this.parseMonkeys(this.utilService.rowInputToStringArray(input)),
          false,
          10000
        );
        return this.aocClient.postAnswer(2022, 11, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.monkeyRounds(
        this.parseMonkeys([
          'Monkey 0:',
          '  Starting items: 79, 98',
          '  Operation: new = old * 19',
          '  Test: divisible by 23',
          '    If true: throw to monkey 2',
          '    If false: throw to monkey 3',
          '',
          'Monkey 1:',
          '  Starting items: 54, 65, 75, 74',
          '  Operation: new = old + 6',
          '  Test: divisible by 19',
          '    If true: throw to monkey 2',
          '    If false: throw to monkey 0',
          '',
          'Monkey 2:',
          '  Starting items: 79, 60, 97',
          '  Operation: new = old * old',
          '  Test: divisible by 13',
          '    If true: throw to monkey 1',
          '    If false: throw to monkey 3',
          '',
          'Monkey 3:',
          '  Starting items: 74',
          '  Operation: new = old + 3',
          '  Test: divisible by 17',
          '    If true: throw to monkey 0',
          '    If false: throw to monkey 1',
        ]),
        true,
        20
      ) === 10605;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.monkeyRounds(
        this.parseMonkeys([
          'Monkey 0:',
          '  Starting items: 79, 98',
          '  Operation: new = old * 19',
          '  Test: divisible by 23',
          '    If true: throw to monkey 2',
          '    If false: throw to monkey 3',
          '',
          'Monkey 1:',
          '  Starting items: 54, 65, 75, 74',
          '  Operation: new = old + 6',
          '  Test: divisible by 19',
          '    If true: throw to monkey 2',
          '    If false: throw to monkey 0',
          '',
          'Monkey 2:',
          '  Starting items: 79, 60, 97',
          '  Operation: new = old * old',
          '  Test: divisible by 13',
          '    If true: throw to monkey 1',
          '    If false: throw to monkey 3',
          '',
          'Monkey 3:',
          '  Starting items: 74',
          '  Operation: new = old + 3',
          '  Test: divisible by 17',
          '    If true: throw to monkey 0',
          '    If false: throw to monkey 1',
        ]),
        false,
        10000
      ) === 2713310158;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  monkeyRounds(
    monkeys: Monkey[],
    divideWorry: boolean,
    rounds: number
  ): number {
    const inspections = Array.from({ length: monkeys.length }, () => 0);
    let mod = 1;
    for (const monkey of monkeys) {
      mod *= monkey.test;
    }
    for (let i = 0; i < rounds; i++) {
      for (const [activeMonkeyId, monkey] of monkeys.entries()) {
        const activeMonkey = monkeys[activeMonkeyId];
        for (const item of activeMonkey.items) {
          if (divideWorry) {
            const worryLevel = Math.floor(
              (activeMonkey.operationAddition
                ? item + activeMonkey.operationAddition
                : activeMonkey.operationMultiplicationOld
                ? item * item
                : item * activeMonkey.operationMultiplication) / 3
            );
            const targetMonkeyId =
              worryLevel % activeMonkey.test === 0
                ? activeMonkey.trueThrow
                : activeMonkey.falseThrow;
            const targetMonkey = monkeys[Number(targetMonkeyId)];
            targetMonkey.items.push(worryLevel);
          } else {
            const worryLevel =
              (activeMonkey.operationAddition
                ? item + activeMonkey.operationAddition
                : activeMonkey.operationMultiplicationOld
                ? item * item
                : item * activeMonkey.operationMultiplication) % mod;
            const targetMonkeyId =
              worryLevel % activeMonkey.test === 0
                ? activeMonkey.trueThrow
                : activeMonkey.falseThrow;
            const targetMonkey = monkeys[Number(targetMonkeyId)];
            targetMonkey.items.push(worryLevel);
          }
          inspections[activeMonkeyId]++;
        }
        activeMonkey.items = [];
      }
    }

    inspections.sort((a, b) => (a < b ? 1 : -1));
    return inspections[0] * inspections[1];
  }

  parseMonkeys(input: string[]): Monkey[] {
    const monkeys = [];
    let currentMonkey;
    for (const line of input) {
      if (line.startsWith('Monkey')) {
        currentMonkey = new Monkey();
        monkeys.push(currentMonkey);
      } else if (line.includes('Starting items')) {
        const split = line.split(': ');
        const items = split[1].split(', ');
        currentMonkey.items = items.map((i) => +i);
      } else if (line.includes('Operation') && line.includes('+')) {
        const split = line.split('+ ');
        currentMonkey.operationAddition = +split[1];
      } else if (line.includes('Operation') && line.includes('* old')) {
        currentMonkey.operationMultiplicationOld = true;
      } else if (line.includes('Operation') && line.includes('*')) {
        const split = line.split('* ');
        currentMonkey.operationMultiplication = +split[1];
      } else if (line.includes('Test: ')) {
        const split = line.split('by ');
        currentMonkey.test = +split[1];
      } else if (line.includes('If true')) {
        const split = line.split('monkey ');
        currentMonkey.trueThrow = +split[1];
      } else if (line.includes('If false')) {
        const split = line.split('monkey ');
        currentMonkey.falseThrow = +split[1];
      }
    }
    return monkeys;
  }
}

class Monkey {
  items: number[];
  operationAddition?: number;
  operationMultiplication?: number;
  operationMultiplicationOld: boolean;
  test: number;
  trueThrow: number;
  falseThrow: bigint;
}
