import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day23Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 23).pipe(
      switchMap((input) => {
        const parsed = this.parse(
          this.utilService.rowInputToStringArray(input),
          10
        );
        const elves = parsed[0];
        const rowLength = parsed[1];
        this.doRounds(elves, 10, rowLength);
        const result = this.emptyGround(elves, rowLength);
        return this.aocClient.postAnswer(2022, 23, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 23).pipe(
      switchMap((input) => {
        const parsed = this.parse(
          this.utilService.rowInputToStringArray(input),
          1000000
        );
        const elves = parsed[0];
        const rowLength = parsed[1];
        const result = this.doRounds(elves, 1000000, rowLength);
        return this.aocClient.postAnswer(2022, 23, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const parsed = this.parse(
      [
        '....#..',
        '..###.#',
        '#...#.#',
        '.#...##',
        '#.###..',
        '##.#.##',
        '.#..#..',
      ],
      10
    );
    const elves = parsed[0];
    const rowLength = parsed[1];
    this.doRounds(elves, 10, rowLength);
    const test = this.emptyGround(elves, rowLength) === 110;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const parsed = this.parse(
      [
        '....#..',
        '..###.#',
        '#...#.#',
        '.#...##',
        '#.###..',
        '##.#.##',
        '.#..#..',
      ],
      100000
    );
    const elves = parsed[0];
    const rowLength = parsed[1];
    const test = this.doRounds(elves, 100000, rowLength) === 20;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  parse(input: string[], rounds: number): [Set<number>, number] {
    const elves = new Set<number>();
    const rowLength = input[0].length + 2 * rounds;
    for (const [y, line] of input.entries()) {
      for (const [x, c] of Object.entries(line)) {
        if (c === '#') {
          elves.add(this.fromCoordinate(+x + rounds, y + rounds, rowLength));
        }
      }
    }
    return [elves, rowLength];
  }

  doRounds(elves: Set<number>, rounds: number, rowLength: number): number {
    const priority = ['N', 'S', 'W', 'E'];
    for (let i = 0; i < rounds; i++) {
      const proposals = new Set<number>();
      const doubles = new Set<number>();
      const moves = new Map<number, number[]>();

      for (const elf of elves) {
        const [x, y] = this.toCoordinate(elf, rowLength);

        //Check North
        const n = this.fromCoordinate(x, y - 1, rowLength);
        const ne = this.fromCoordinate(x + 1, y - 1, rowLength);
        const e = this.fromCoordinate(x + 1, y, rowLength);
        const se = this.fromCoordinate(x + 1, y + 1, rowLength);
        const s = this.fromCoordinate(x, y + 1, rowLength);
        const sw = this.fromCoordinate(x - 1, y + 1, rowLength);
        const w = this.fromCoordinate(x - 1, y, rowLength);
        const nw = this.fromCoordinate(x - 1, y - 1, rowLength);
        if (
          !(
            elves.has(n) ||
            elves.has(ne) ||
            elves.has(e) ||
            elves.has(se) ||
            elves.has(s) ||
            elves.has(sw) ||
            elves.has(w) ||
            elves.has(nw)
          )
        ) {
          continue;
        }

        for (const direction of priority) {
          if (
            direction === 'N' &&
            !(elves.has(nw) || elves.has(n) || elves.has(ne))
          ) {
            if (proposals.has(n)) {
              doubles.add(n);
              moves.set(n, [...moves.get(n), elf]);
            } else {
              proposals.add(n);
              moves.set(n, [elf]);
            }
            break;
          }
          if (
            direction === 'S' &&
            !(elves.has(sw) || elves.has(s) || elves.has(se))
          ) {
            if (proposals.has(s)) {
              doubles.add(s);
              moves.set(s, [...moves.get(s), elf]);
            } else {
              proposals.add(s);
              moves.set(s, [elf]);
            }
            break;
          }
          if (
            direction === 'W' &&
            !(elves.has(nw) || elves.has(w) || elves.has(sw))
          ) {
            if (proposals.has(w)) {
              doubles.add(w);
              moves.set(w, [...moves.get(w), elf]);
            } else {
              proposals.add(w);
              moves.set(w, [elf]);
            }
            break;
          }
          if (
            direction === 'E' &&
            !(elves.has(ne) || elves.has(e) || elves.has(se))
          ) {
            if (proposals.has(e)) {
              doubles.add(e);
              moves.set(e, [...moves.get(e), elf]);
            } else {
              proposals.add(e);
              moves.set(e, [elf]);
            }
            break;
          }
        }
      }
      if (proposals.size === 0) {
        return i + 1;
      }
      for (const move of moves.values()) {
        for (const m of move) {
          elves.delete(m);
        }
      }
      for (const double of doubles) {
        proposals.delete(double);
        const move = moves.get(double);
        for (const d of move) {
          elves.add(d);
        }
      }
      for (const p of proposals) {
        elves.add(p);
      }
      const p = priority.shift();
      priority.push(p);

      //this.printElves(elves, rowLength);
    }
    return -1;
  }

  emptyGround(elves: Set<number>, rowLength: number): number {
    let minX = Number.MAX_VALUE;
    let maxX = 0;
    let minY = Number.MAX_VALUE;
    let maxY = 0;

    for (const elf of elves) {
      const [x, y] = this.toCoordinate(elf, rowLength);
      if (x > maxX) {
        maxX = x;
      }
      if (x < minX) {
        minX = x;
      }
      if (y > maxY) {
        maxY = y;
      }
      if (y < minY) {
        minY = y;
      }
    }
    return (maxX - minX + 1) * (maxY - minY + 1) - elves.size;
  }

  printElves(elves: Set<number>, rowLength: number) {
    const elfArray = [];
    for (const elf of elves) {
      elfArray.push(this.toCoordinate(elf, rowLength));
    }
    console.log(elves);
    for (let i = 0; i < 26; i++) {
      let row = '';
      for (let j = 0; j < 25; j++) {
        if (elfArray.some((e) => e[0] === j && e[1] === i)) {
          row += '#';
        } else {
          row += '.';
        }
      }
      console.log(row);
    }
  }

  private toCoordinate(number: number, rowLength: number): [number, number] {
    const x = number % rowLength;
    const y = (number - x) / rowLength;
    return [x, y];
  }

  private fromCoordinate(x: number, y: number, rowLength: number): number {
    return y * rowLength + x;
  }
}
