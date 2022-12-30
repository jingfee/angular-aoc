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
export class Day24Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 24).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const parsed = this.parse(parsedInput);
        const result = this.fewestMinutes(
          parsed[0],
          parsed[1],
          parsed[2],
          parsedInput.length,
          parsedInput[0].length,
          false
        );
        return this.aocClient.postAnswer(2022, 24, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 24).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const parsed = this.parse(parsedInput);
        const result = this.fewestMinutes(
          parsed[0],
          parsed[1],
          parsed[2],
          parsedInput.length,
          parsedInput[0].length,
          true
        );
        return this.aocClient.postAnswer(2022, 24, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const parsed = this.parse([
      '#.######',
      '#>>.<^<#',
      '#.<..<<#',
      '#>v.><>#',
      '#<^v^^>#',
      '######.#',
    ]);
    const test =
      this.fewestMinutes(parsed[0], parsed[1], parsed[2], 6, 8, false) === 18;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const parsed = this.parse([
      '#.######',
      '#>>.<^<#',
      '#.<..<<#',
      '#>v.><>#',
      '#<^v^^>#',
      '######.#',
    ]);
    const test =
      this.fewestMinutes(parsed[0], parsed[1], parsed[2], 6, 8, true) === 54;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parse(
    input: string[]
  ): [[number, number], [number, number], Map<number, string[]>] {
    let start;
    let end;
    const blizzards = new Map<number, string[]>();
    for (const [y, line] of input.entries()) {
      for (const [x, c] of Object.entries(line)) {
        if (y === 0 && c === '.') {
          start = [+x, y];
        }
        if (y === input.length - 1 && c === '.') {
          end = [+x, y];
        }

        if (c !== '.' && c !== '#') {
          blizzards.set(this.fromCoordinate(+x, y, line.length), [c]);
        }
      }
    }

    return [start, end, blizzards];
  }

  private fewestMinutes(
    start: [x: number, y: number],
    end: [x: number, y: number],
    blizzards: Map<number, string[]>,
    maxY: number,
    maxX: number,
    backAgain: boolean
  ): number {
    const queue = new ChunkedQueue();
    const state = new State();
    const visited = [new Map<number, Set<number>>()];
    state.position = start;
    state.blizzards = blizzards;
    state.minutes = 0;
    state.trip = 0;
    queue.enqueue(state);

    while (queue.size() > 0) {
      const currentState = queue.dequeue();

      const newBlizzards = this.moveBlizzards(
        currentState.blizzards,
        maxY,
        maxX
      );
      if (backAgain) {
        if (currentState.trip === 0) {
          if (
            currentState.position[0] === end[0] &&
            currentState.position[1] === end[1] - 1
          ) {
            queue.enqueue({
              blizzards: newBlizzards,
              position: end,
              minutes: currentState.minutes + 1,
              trip: 1,
            });
            if (visited.length === 1) {
              visited.push(new Map<number, Set<number>>());
            }
            continue;
          }
        } else if (currentState.trip === 1) {
          if (
            currentState.position[0] === start[0] &&
            currentState.position[1] === start[1] + 1
          ) {
            queue.enqueue({
              blizzards: newBlizzards,
              position: start,
              minutes: currentState.minutes + 1,
              trip: 2,
            });
            if (visited.length === 2) {
              visited.push(new Map<number, Set<number>>());
            }
            continue;
          }
        } else if (currentState.trip === 2) {
          if (
            currentState.position[0] === end[0] &&
            currentState.position[1] === end[1] - 1
          ) {
            return currentState.minutes + 1;
          }
        }
      } else {
        if (
          currentState.position[0] === end[0] &&
          currentState.position[1] === end[1] - 1
        ) {
          return currentState.minutes + 1;
        }
      }

      const currentPos = this.fromCoordinate(
        currentState.position[0],
        currentState.position[1],
        maxX
      );
      if (visited[currentState.trip].has(currentState.minutes)) {
        if (
          visited[currentState.trip].get(currentState.minutes).has(currentPos)
        ) {
          continue;
        } else {
          visited[currentState.trip].get(currentState.minutes).add(currentPos);
        }
      } else {
        const s = new Set<number>();
        s.add(currentPos);
        visited[currentState.trip].set(currentState.minutes, s);
      }

      const up = currentPos - maxX;
      const right = currentPos + 1;
      const down = currentPos + maxX;
      const left = currentPos - 1;
      // UP
      if (currentState.position[1] > 1 && !newBlizzards.has(up)) {
        queue.enqueue({
          blizzards: newBlizzards,
          position: [currentState.position[0], currentState.position[1] - 1],
          minutes: currentState.minutes + 1,
          trip: currentState.trip,
        });
      }
      // RIGHT
      if (
        currentState.position[1] > 0 &&
        currentState.position[1] < maxY - 1 &&
        currentState.position[0] < maxX - 2 &&
        !newBlizzards.has(right)
      ) {
        queue.enqueue({
          blizzards: newBlizzards,
          position: [currentState.position[0] + 1, currentState.position[1]],
          minutes: currentState.minutes + 1,
          trip: currentState.trip,
        });
      }
      // DOWN
      if (currentState.position[1] < maxY - 2 && !newBlizzards.has(down)) {
        queue.enqueue({
          blizzards: newBlizzards,
          position: [currentState.position[0], currentState.position[1] + 1],
          minutes: currentState.minutes + 1,
          trip: currentState.trip,
        });
      }
      // LEFT
      if (
        currentState.position[1] > 0 &&
        currentState.position[1] < maxY - 1 &&
        currentState.position[0] > 1 &&
        !newBlizzards.has(left)
      ) {
        queue.enqueue({
          blizzards: newBlizzards,
          position: [currentState.position[0] - 1, currentState.position[1]],
          minutes: currentState.minutes + 1,
          trip: currentState.trip,
        });
      }
      if (!newBlizzards.has(currentPos)) {
        queue.enqueue({
          blizzards: newBlizzards,
          position: currentState.position,
          minutes: currentState.minutes + 1,
          trip: currentState.trip,
        });
      }
    }
    return undefined;
  }

  private moveBlizzards(
    blizzards: Map<number, string[]>,
    maxY: number,
    maxX: number
  ): Map<number, string[]> {
    const newBlizzards = new Map<number, string[]>();
    for (const blizzardsOnPosition of blizzards) {
      for (const blizzard of blizzardsOnPosition[1]) {
        const blizzardCoordinates = this.toCoordinate(
          blizzardsOnPosition[0],
          maxX
        );
        const newBlizzard = blizzardCoordinates;
        switch (blizzard) {
          case '^': {
            if (newBlizzard[1] === 1) {
              newBlizzard[1] = maxY - 2;
            } else {
              newBlizzard[1]--;
            }
            break;
          }
          case '>': {
            if (newBlizzard[0] === maxX - 2) {
              newBlizzard[0] = 1;
            } else {
              newBlizzard[0]++;
            }
            break;
          }
          case 'v': {
            if (newBlizzard[1] === maxY - 2) {
              newBlizzard[1] = 1;
            } else {
              newBlizzard[1]++;
            }
            break;
          }
          case '<': {
            if (newBlizzard[0] === 1) {
              newBlizzard[0] = maxX - 2;
            } else {
              newBlizzard[0]--;
            }
            break;
          }
        }
        const coordinateIndex = this.fromCoordinate(
          newBlizzard[0],
          newBlizzard[1],
          maxX
        );
        const prev = newBlizzards.get(coordinateIndex);
        if (prev) {
          prev.push(blizzard);
          newBlizzards.set(coordinateIndex, prev);
        } else {
          newBlizzards.set(coordinateIndex, [blizzard]);
        }
      }
    }
    return newBlizzards;
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

class State {
  position: [x: number, y: number];
  blizzards: Map<number, string[]>;
  minutes: number;
  trip: number;
}
