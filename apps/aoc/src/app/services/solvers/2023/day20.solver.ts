import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';
import { ChunkedQueue } from 'lite-fifo';

@Injectable({
  providedIn: 'root',
})
export class Day20Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 20).pipe(
      switchMap((input) => {
        const parsed = this.parse(
          this.utilService.rowInputToStringArray(input),
        );
        const result = this.button(parsed);
        return this.aocClient.postAnswer(2023, 20, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 20).pipe(
      switchMap((input) => {
        return this.aocClient.postAnswer(2023, 20, 2, undefined);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const modules = this.parse([
      'broadcaster -> a, b, c',
      '%a -> b',
      '%b -> c',
      '%c -> inv',
      '&inv -> a',
    ]);
    const modules2 = this.parse([
      'broadcaster -> a',
      '%a -> inv, con',
      '&inv -> b',
      '%b -> con',
      '&con -> output',
    ]);
    const test =
      this.button(modules) === 32000000 && this.button(modules2) === 11687500;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test = false;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parse(input: string[]) {
    const modules = new Map<string, Module>();
    for (const line of input) {
      const split = line.split(' -> ');
      const module = {} as Module;
      if (split[0] === 'broadcaster') {
        module.name = split[0];
        module.type = ModuleType.Broadcaster;
      } else if (split[0].startsWith('&')) {
        module.name = split[0].substring(1);
        module.type = ModuleType.Conjunction;
      } else if (split[0].startsWith('%')) {
        module.name = split[0].substring(1);
        module.type = ModuleType.Flipflop;
        module.on = false;
      }
      module.signals = [];
      module.outputs = [];

      const outputSplit = split[1].split(', ');
      for (const output of outputSplit) {
        module.outputs.push(output);
      }
      modules.set(module['name'], module);
    }
    for (const conjunction of [...modules.values()]) {
      if (conjunction.type === ModuleType.Conjunction) {
        const outputsTo = [...modules.values()].filter((m) =>
          m.outputs.includes(conjunction.name),
        );
        for (const o of outputsTo) {
          conjunction.signals[o.name] = 0;
        }
      }
    }
    return modules;
  }

  private button(modules: Map<string, Module>) {
    const signalCount = {
      0: 0,
      1: 0,
    };
    for (let i = 0; i < 10000; i++) {
      const queue = new ChunkedQueue();
      const broadcaster = modules.get('broadcaster');
      broadcaster.signals['button'] = SignalType.Low;
      queue.enqueue({
        module: broadcaster,
        sender: 'button',
        signal: SignalType.Low,
      });
      signalCount[0]++;
      while (queue.size() > 0) {
        const current = queue.dequeue();
        let signalToSend;

        if (current.module.type === ModuleType.Broadcaster) {
          signalToSend = current.signal;
        } else if (current.module.type === ModuleType.Flipflop) {
          if (current.signal === SignalType.High) {
            continue;
          }

          if (current.module.on) {
            signalToSend = SignalType.Low;
            current.module.on = false;
          } else {
            signalToSend = SignalType.High;
            current.module.on = true;
          }
        } else if (current.module.type === ModuleType.Conjunction) {
          current.module.signals[current.sender] = current.signal;
          signalToSend = Object.values(current.module.signals).every(
            (s) => s === SignalType.High,
          )
            ? SignalType.Low
            : SignalType.High;
        }

        for (const output of current.module.outputs) {
          if (
            signalToSend === SignalType.High &&
            current.module.name === 'qz'
          ) {
            console.log('qz', i + 1);
          }
          if (
            signalToSend === SignalType.High &&
            current.module.name === 'cq'
          ) {
            console.log('cq', i + 1);
          }
          if (
            signalToSend === SignalType.High &&
            current.module.name === 'jx'
          ) {
            console.log('jx', i + 1);
          }
          if (
            signalToSend === SignalType.High &&
            current.module.name === 'tt'
          ) {
            console.log('tt', i + 1);
          }
          signalCount[signalToSend]++;
          const outputModule = modules.get(output);
          if (outputModule) {
            queue.enqueue({
              module: outputModule,
              sender: current.module.name,
              signal: signalToSend,
            });
          }
        }
      }
    }
    return signalCount[SignalType.Low] * signalCount[SignalType.High];
  }
}

interface Module {
  name: string;
  type: ModuleType;
  signals: SignalType[];
  outputs: string[];
  on?: boolean;
}

enum ModuleType {
  Broadcaster,
  Flipflop,
  Conjunction,
}

enum SignalType {
  Low,
  High,
}
