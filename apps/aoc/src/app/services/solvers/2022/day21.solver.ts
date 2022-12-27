import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import TinyQueue from 'tinyqueue';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day21Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 21).pipe(
      switchMap((input) => {
        const monkeys = this.parse(
          this.utilService.rowInputToStringArray(input)
        );
        const result = monkeys.find((m) => m.name === 'root').shout;
        return this.aocClient.postAnswer(2022, 21, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 21).pipe(
      switchMap((input) => {
        const result = this.monkeyShoutWithHuman(
          this.parse(this.utilService.rowInputToStringArray(input))
        );
        return this.aocClient.postAnswer(2022, 21, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const monkeys = this.parse([
      'root: pppw + sjmn',
      'dbpl: 5',
      'cczh: sllz + lgvd',
      'zczc: 2',
      'ptdq: humn - dvpt',
      'dvpt: 3',
      'lfqf: 4',
      'humn: 5',
      'ljgn: 2',
      'sjmn: drzm * dbpl',
      'sllz: 4',
      'pppw: cczh / lfqf',
      'lgvd: ljgn * ptdq',
      'drzm: hmdt - zczc',
      'hmdt: 32',
    ]);
    const test = monkeys.find((m) => m.name === 'root').shout === 152;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const monkeys = this.parse([
      'root: pppw + sjmn',
      'dbpl: 5',
      'cczh: sllz + lgvd',
      'zczc: 2',
      'ptdq: humn - dvpt',
      'dvpt: 3',
      'lfqf: 4',
      'humn: 5',
      'ljgn: 2',
      'sjmn: drzm * dbpl',
      'sllz: 4',
      'pppw: cczh / lfqf',
      'lgvd: ljgn * ptdq',
      'drzm: hmdt - zczc',
      'hmdt: 32',
    ]);
    const test = this.monkeyShoutWithHuman(monkeys) === 301;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parse(input: string[]): Monkey[] {
    const monkeys = [];
    for (const line of input) {
      let split = line.split(': ');
      const monkey = new Monkey();
      monkey.name = split[0];
      if (isNaN(split[1] as unknown as number)) {
        split = split[1].split(' ');
        monkey.dependsOn = [split[0], split[2]];
        monkey.operator = split[1];
      } else {
        monkey.depth = 0;
        monkey.shout = +split[1];
      }
      monkeys.push(monkey);
    }
    this.setMonkeyDepth(monkeys);
    this.monkeyShout(monkeys);
    return monkeys;
  }

  private setMonkeyDepth(monkeys: Monkey[]) {
    const queue = new TinyQueue<Monkey>();
    const depthZero = monkeys.filter((m) => m.depth === 0);
    for (const m of depthZero) {
      m.depth = 0;
      m.dependsOnHuman = m.name === 'humn';
      queue.push(m);
    }

    while (queue.length > 0) {
      const monkey = queue.pop();
      const depends = monkeys.filter((m) => m.dependsOn?.includes(monkey.name));
      for (const d of depends) {
        if (!d.dependsOnHuman) {
          d.dependsOnHuman = monkey.dependsOnHuman;
        }
        if (d.depth && d.depth > monkey.depth + 1) {
          continue;
        }
        d.depth = monkey.depth + 1;

        queue.push(d);
      }
    }
  }

  private monkeyShout(monkeys: Monkey[]) {
    monkeys.sort((a, b) => (a.depth > b.depth ? 1 : -1));
    for (const monkey of monkeys) {
      if (monkey.shout) {
        continue;
      }

      const d1 = monkeys.find((m) => m.name === monkey.dependsOn[0]);
      const d2 = monkeys.find((m) => m.name === monkey.dependsOn[1]);

      switch (monkey.operator) {
        case '+': {
          monkey.shout = d1.shout + d2.shout;
          break;
        }
        case '-': {
          monkey.shout = d1.shout - d2.shout;
          break;
        }
        case '*': {
          monkey.shout = d1.shout * d2.shout;
          break;
        }
        case '/': {
          monkey.shout = d1.shout / d2.shout;
          break;
        }
      }
    }
  }

  private monkeyShoutWithHuman(monkeys: Monkey[]): number {
    let current = monkeys.find((m) => m.name === 'root');
    const d1 = monkeys.find(
      (m) => current.dependsOn.includes(m.name) && m.dependsOnHuman
    );
    const d2 = monkeys.find(
      (m) => current.dependsOn.includes(m.name) && !m.dependsOnHuman
    );
    let value = d2.shout;
    current = d1;
    while (current.name !== 'humn') {
      const d1 = monkeys.find((m) => m.name === current.dependsOn[0]);
      const d2 = monkeys.find((m) => m.name === current.dependsOn[1]);
      switch (current.operator) {
        case '+': {
          if (d1.dependsOnHuman) {
            value = value - d2.shout;
          } else {
            value = value - d1.shout;
          }
          break;
        }
        case '-': {
          if (d1.dependsOnHuman) {
            value = value + d2.shout;
          } else {
            value = d1.shout - value;
          }
          break;
        }
        case '*': {
          if (d1.dependsOnHuman) {
            value = value / d2.shout;
          } else {
            value = value / d1.shout;
          }
          break;
        }
        case '/': {
          if (d1.dependsOnHuman) {
            value = value * d2.shout;
          } else {
            value = d1.shout / value;
          }
          break;
        }
      }
      current = d1.dependsOnHuman ? d1 : d2;
    }
    return value;
  }
}

class Monkey {
  name: string;
  shout?: number;
  dependsOn?: string[];
  operator?: string;
  depth: number;
  dependsOnHuman: boolean;
}
