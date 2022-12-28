import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class Day22Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 22).pipe(
      switchMap((input) => {
        const parsed = this.parse(
          this.utilService.rowInputToStringArray(input)
        );
        const result = this.walkMap(parsed[0], parsed[1], false);
        return this.aocClient.postAnswer(2022, 22, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 22).pipe(
      switchMap((input) => {
        const parsed = this.parse(
          this.utilService.rowInputToStringArray(input)
        );
        const result = this.walkMap(parsed[0], parsed[1], true);
        return this.aocClient.postAnswer(2022, 22, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const parsed = this.parse([
      '        ...#',
      '        .#..',
      '        #...',
      '        ....',
      '...#.......#',
      '........#...',
      '..#....#....',
      '..........#.',
      '        ...#....',
      '        .....#..',
      '        .#......',
      '        ......#.',
      '10R5L5R10L4R5L5',
    ]);
    const test = this.walkMap(parsed[0], parsed[1], false) === 6032;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const parsed = this.parse([
      '        ...#',
      '        .#..',
      '        #...',
      '        ....',
      '...#.......#',
      '........#...',
      '..#....#....',
      '..........#.',
      '        ...#....',
      '        .....#..',
      '        .#......',
      '        ......#.',
      '10R5L5R10L4R5L5',
    ]);
    const test = this.walkMap(parsed[0], parsed[1], true) === 5031;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parse(input: string[]): [string[][], Direction[]] {
    const map = [];
    const directions = [];

    const mapInput = input.slice(0, input.length - 1);
    const directionInput = input.slice(input.length - 1, input.length)[0];

    const rowLength = _.max(mapInput.map((m) => m.length)) + 2;
    map.push(Array.from({ length: rowLength }, () => ' '));
    for (const [y, line] of mapInput.entries()) {
      map.push(Array.from({ length: rowLength }, () => ' '));
      for (const [x, c] of Object.entries(line)) {
        map[+y + 1][+x + 1] = c;
      }
    }
    map.push(Array.from({ length: rowLength }, () => ' '));

    let currentNumber = '';
    for (const c of directionInput) {
      if (c === 'L' || c === 'R') {
        directions.push({ steps: +currentNumber, turn: c } as Direction);
        currentNumber = '';
      } else {
        currentNumber += c;
      }
    }
    directions.push({ steps: +currentNumber } as Direction);

    return [map, directions];
  }

  private walkMap(
    map: string[][],
    directions: Direction[],
    cube: boolean
  ): number {
    let facing = Facing.Right as Facing;
    let x = map[1].findIndex((m) => m === '.');
    let y = 1;
    for (const direction of directions) {
      for (let step = 0; step < direction.steps; step++) {
        let nextX;
        let nextY;
        let nextFacing = facing;
        switch (facing) {
          case Facing.Right: {
            nextX = x + 1;
            nextY = y;
            if (map[nextY][nextX] === ' ') {
              if (cube) {
                [nextX, nextY, nextFacing] = this.changeSide(x, y, facing);
              } else {
                nextX = map[nextY].findIndex((m) => m !== ' ');
              }
            }
            break;
          }
          case Facing.Down: {
            nextX = x;
            nextY = y + 1;
            if (map[nextY][nextX] === ' ') {
              if (cube) {
                [nextX, nextY, nextFacing] = this.changeSide(x, y, facing);
              } else {
                nextY = map.findIndex((m) => m[nextX] !== ' ');
              }
            }
            break;
          }
          case Facing.Left: {
            nextX = x - 1;
            nextY = y;
            if (map[nextY][nextX] === ' ') {
              if (cube) {
                [nextX, nextY, nextFacing] = this.changeSide(x, y, facing);
              } else {
                nextX = _.findLastIndex(map[nextY], (m) => m !== ' ');
              }
            }
            break;
          }
          case Facing.Up: {
            nextX = x;
            nextY = y - 1;
            if (map[nextY][nextX] === ' ') {
              if (cube) {
                [nextX, nextY, nextFacing] = this.changeSide(x, y, facing);
              } else {
                nextY = _.findLastIndex(map, (m) => m[nextX] !== ' ');
              }
            }
            break;
          }
        }
        if (map[nextY][nextX] === '.') {
          x = nextX;
          y = nextY;
          facing = nextFacing;
        }
      }

      if (direction.turn) {
        switch (facing) {
          case Facing.Right: {
            facing = direction.turn === 'R' ? Facing.Down : Facing.Up;
            break;
          }
          case Facing.Down: {
            facing = direction.turn === 'R' ? Facing.Left : Facing.Right;
            break;
          }
          case Facing.Left: {
            facing = direction.turn === 'R' ? Facing.Up : Facing.Down;
            break;
          }
          case Facing.Up: {
            facing = direction.turn === 'R' ? Facing.Right : Facing.Left;
            break;
          }
        }
      }
    }
    return 1000 * y + 4 * x + facing;
  }

  private changeSide(
    x: number,
    y: number,
    facing: Facing
  ): [number, number, Facing] {
    //From side 1
    if (x >= 51 && x <= 100 && y >= 1 && y <= 50) {
      switch (facing) {
        case Facing.Right: {
          return [x + 1, y, Facing.Right];
        }
        case Facing.Down: {
          return [x, y + 1, Facing.Down];
        }
        case Facing.Left: {
          return [x - 50, 151 - y, Facing.Right];
        }
        case Facing.Up: {
          return [y, x + 100, Facing.Right];
        }
      }
    }
    //From side 2
    if (x >= 101 && x <= 150 && y >= 1 && y <= 50) {
      switch (facing) {
        case Facing.Right: {
          return [x - 50, 151 - y, Facing.Left];
        }
        case Facing.Down: {
          return [y + 50, x - 50, Facing.Left];
        }
        case Facing.Left: {
          return [x - 1, y, Facing.Left];
        }
        case Facing.Up: {
          return [x - 100, y + 199, Facing.Up];
        }
      }
    }
    //From side 3
    if (x >= 51 && x <= 100 && y >= 51 && y <= 100) {
      switch (facing) {
        case Facing.Right: {
          return [y + 50, x - 50, Facing.Up];
        }
        case Facing.Down: {
          return [x, y + 1, Facing.Down];
        }
        case Facing.Left: {
          return [y - 50, x + 50, Facing.Down];
        }
        case Facing.Up: {
          return [x, y - 1, Facing.Up];
        }
      }
    }
    //From side 4
    if (x >= 51 && x <= 100 && y >= 101 && y <= 150) {
      switch (facing) {
        case Facing.Right: {
          return [x + 50, 151 - y, Facing.Left];
        }
        case Facing.Down: {
          return [y - 100, x + 100, Facing.Left];
        }
        case Facing.Left: {
          return [x - 1, y, Facing.Left];
        }
        case Facing.Up: {
          return [x, y - 1, Facing.Up];
        }
      }
    }
    //From side 5
    if (x >= 1 && x <= 50 && y >= 101 && y <= 150) {
      switch (facing) {
        case Facing.Right: {
          return [x + 1, y, Facing.Right];
        }
        case Facing.Down: {
          return [x, y + 1, Facing.Down];
        }
        case Facing.Left: {
          return [x + 50, 151 - y, Facing.Right];
        }
        case Facing.Up: {
          return [y - 50, x + 50, Facing.Right];
        }
      }
    }
    //From side 6
    if (x >= 1 && x <= 50 && y >= 151 && y <= 200) {
      switch (facing) {
        case Facing.Right: {
          return [y - 100, x + 100, Facing.Up];
        }
        case Facing.Down: {
          return [x + 100, y - 199, Facing.Down];
        }
        case Facing.Left: {
          return [y - 100, x, Facing.Down];
        }
        case Facing.Up: {
          return [x, y - 1, Facing.Up];
        }
      }
    }
    return undefined;
  }

  private changeSideTest(
    x: number,
    y: number,
    facing: Facing
  ): [number, number, Facing] {
    //From side 1
    if (x >= 9 && x <= 12 && y >= 1 && y <= 4) {
      switch (facing) {
        case Facing.Right: {
          return [x + 4, 13 - y, Facing.Left];
        }
        case Facing.Down: {
          return [x, y + 1, Facing.Down];
        }
        case Facing.Left: {
          return [y + 4, x - 4, Facing.Down];
        }
        case Facing.Up: {
          return [13 - x, y + 4, Facing.Down];
        }
      }
    }
    //From side 2
    if (x >= 1 && x <= 4 && y >= 5 && y <= 8) {
      switch (facing) {
        case Facing.Right: {
          return [x + 1, y, Facing.Right];
        }
        case Facing.Down: {
          return [y + 1, 13 - x, Facing.Up];
        }
        case Facing.Left: {
          return [21 - y, x + 11, Facing.Up];
        }
        case Facing.Up: {
          return [13 - x, y - 4, Facing.Down];
        }
      }
    }
    //From side 3
    if (x >= 5 && x <= 8 && y >= 5 && y <= 8) {
      switch (facing) {
        case Facing.Right: {
          return [x + 1, y, Facing.Right];
        }
        case Facing.Down: {
          return [y + 1, 17 - x, Facing.Right];
        }
        case Facing.Left: {
          return [x - 1, y, Facing.Left];
        }
        case Facing.Up: {
          return [y + 4, x - 4, Facing.Right];
        }
      }
    }
    //From side 4
    if (x >= 9 && x <= 12 && y >= 5 && y <= 8) {
      switch (facing) {
        case Facing.Right: {
          return [21 - y, x - 3, Facing.Down];
        }
        case Facing.Down: {
          return [x, y + 1, Facing.Down];
        }
        case Facing.Left: {
          return [x - 1, y, Facing.Left];
        }
        case Facing.Up: {
          return [x, y - 1, Facing.Up];
        }
      }
    }
    //From side 5
    if (x >= 9 && x <= 12 && y >= 9 && y <= 12) {
      switch (facing) {
        case Facing.Right: {
          return [x + 1, y, Facing.Right];
        }
        case Facing.Down: {
          return [13 - x, y - 4, Facing.Up];
        }
        case Facing.Left: {
          return [17 - y, x - 1, Facing.Up];
        }
        case Facing.Up: {
          return [x, y - 1, Facing.Up];
        }
      }
    }
    //From side 6
    if (x >= 13 && x <= 16 && y >= 9 && y <= 12) {
      switch (facing) {
        case Facing.Right: {
          return [x - 4, 13 - y, Facing.Left];
        }
        case Facing.Down: {
          return [y - 11, 21 - x, Facing.Up];
        }
        case Facing.Left: {
          return [x - 1, y, Facing.Left];
        }
        case Facing.Up: {
          return [y + 3, 21 - x, Facing.Left];
        }
      }
    }
    return undefined;
  }
}

enum Facing {
  Right,
  Down,
  Left,
  Up,
}

class Direction {
  steps: number;
  turn: string;
}
