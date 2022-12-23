import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';
import TinyQueue from 'tinyqueue';

@Injectable({
  providedIn: 'root',
})
export class Day18Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 18).pipe(
      switchMap((input) => {
        const result = this.getExposed(
          this.parse(this.utilService.rowInputToStringArray(input))
        );
        return this.aocClient.postAnswer(2022, 18, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 18).pipe(
      switchMap((input) => {
        const result = this.getExposedOutside(
          this.parse(this.utilService.rowInputToStringArray(input))
        );
        return this.aocClient.postAnswer(2022, 18, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.getExposed(this.parse(['1,1,1', '2,1,1'])) === 10 &&
      this.getExposed(
        this.parse([
          '2,2,2',
          '1,2,2',
          '3,2,2',
          '2,1,2',
          '2,3,2',
          '2,2,1',
          '2,2,3',
          '2,2,4',
          '2,2,6',
          '1,2,5',
          '3,2,5',
          '2,1,5',
          '2,3,5',
        ])
      ) === 64;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.getExposedOutside(
        this.parse([
          '2,2,2',
          '1,2,2',
          '3,2,2',
          '2,1,2',
          '2,3,2',
          '2,2,1',
          '2,2,3',
          '2,2,4',
          '2,2,6',
          '1,2,5',
          '3,2,5',
          '2,1,5',
          '2,3,5',
        ])
      ) === 58;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parse(input: string[]): Cube[] {
    const cubes = [];
    for (const line of input) {
      const split = line.split(',');
      const cube = new Cube();
      cube.x = +split[0];
      cube.y = +split[1];
      cube.z = +split[2];
      cubes.push(cube);
    }
    return cubes;
  }

  private getExposed(cubes: Cube[]): number {
    const connectedCubes = [];

    for (const cube of cubes) {
      for (const con of connectedCubes) {
        if (cube.x === con.x && cube.y === con.y && cube.z === con.z - 1) {
          cube.exposed = cube.exposed.filter((e) => e !== 4);
          con.exposed = con.exposed.filter((e) => e !== 5);
        }
        if (cube.x === con.x && cube.y === con.y && cube.z === con.z + 1) {
          cube.exposed = cube.exposed.filter((e) => e !== 5);
          con.exposed = con.exposed.filter((e) => e !== 4);
        }
        if (cube.x === con.x && cube.z === con.z && cube.y === con.y - 1) {
          cube.exposed = cube.exposed.filter((e) => e !== 0);
          con.exposed = con.exposed.filter((e) => e !== 1);
        }
        if (cube.x === con.x && cube.z === con.z && cube.y === con.y + 1) {
          cube.exposed = cube.exposed.filter((e) => e !== 1);
          con.exposed = con.exposed.filter((e) => e !== 0);
        }
        if (cube.z === con.z && cube.y === con.y && cube.x === con.x - 1) {
          cube.exposed = cube.exposed.filter((e) => e !== 3);
          con.exposed = con.exposed.filter((e) => e !== 2);
        }
        if (cube.z === con.z && cube.y === con.y && cube.x === con.x + 1) {
          cube.exposed = cube.exposed.filter((e) => e !== 2);
          con.exposed = con.exposed.filter((e) => e !== 3);
        }
      }
      connectedCubes.push(cube);
    }

    return cubes.map((c) => c.exposed.length).reduce((a, b) => a + b);
  }

  private getExposedOutside(cubes: Cube[]): number {
    const connectedAirCubes = [];
    const queue = new TinyQueue<Cube>();

    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let minZ = Number.MAX_VALUE;
    let maxX = 0;
    let maxY = 0;
    let maxZ = 0;
    for (const cube of cubes) {
      if (cube.x > maxX) {
        maxX = cube.x;
      }
      if (cube.x < minX) {
        minX = cube.x;
      }
      if (cube.y > maxY) {
        maxY = cube.y;
      }
      if (cube.y < minY) {
        minY = cube.y;
      }
      if (cube.z > maxZ) {
        maxZ = cube.z;
      }
      if (cube.z < minZ) {
        minZ = cube.z;
      }
    }

    const start = new Cube();
    start.x = minX - 1;
    start.y = minY - 1;
    start.z = minZ - 1;
    start.exposed = [0, 3, 4];

    queue.push(start);

    while (queue.length > 0) {
      const current = queue.pop();

      if (
        connectedAirCubes.some(
          (a) => a.x === current.x && a.y === current.y && a.z === current.z
        )
      ) {
        continue;
      }

      for (const con of connectedAirCubes) {
        if (
          current.x === con.x &&
          current.y === con.y &&
          current.z === con.z - 1
        ) {
          current.exposed = current.exposed.filter((e) => e !== 4);
          con.exposed = con.exposed.filter((e) => e !== 5);
        }
        if (
          current.x === con.x &&
          current.y === con.y &&
          current.z === con.z + 1
        ) {
          current.exposed = current.exposed.filter((e) => e !== 5);
          con.exposed = con.exposed.filter((e) => e !== 4);
        }
        if (
          current.x === con.x &&
          current.z === con.z &&
          current.y === con.y - 1
        ) {
          current.exposed = current.exposed.filter((e) => e !== 0);
          con.exposed = con.exposed.filter((e) => e !== 1);
        }
        if (
          current.x === con.x &&
          current.z === con.z &&
          current.y === con.y + 1
        ) {
          current.exposed = current.exposed.filter((e) => e !== 1);
          con.exposed = con.exposed.filter((e) => e !== 0);
        }
        if (
          current.z === con.z &&
          current.y === con.y &&
          current.x === con.x - 1
        ) {
          current.exposed = current.exposed.filter((e) => e !== 3);
          con.exposed = con.exposed.filter((e) => e !== 2);
        }
        if (
          current.z === con.z &&
          current.y === con.y &&
          current.x === con.x + 1
        ) {
          current.exposed = current.exposed.filter((e) => e !== 2);
          con.exposed = con.exposed.filter((e) => e !== 3);
        }
      }
      connectedAirCubes.push(current);

      //1. CHECK UP
      if (
        current.y < maxY + 1 &&
        !connectedAirCubes.some(
          (a) => a.x === current.x && a.y === current.y + 1 && a.z === current.z
        ) &&
        !cubes.some(
          (a) => a.x === current.x && a.y === current.y + 1 && a.z === current.z
        )
      ) {
        const next = new Cube();
        next.x = current.x;
        next.y = current.y + 1;
        next.z = current.z;
        this.filterExposed(next, { maxX, minX, maxY, minY, maxZ, minZ });
        queue.push(next);
      }
      //2. CHECK DOWN
      if (
        current.y > minY - 1 &&
        !connectedAirCubes.some(
          (a) => a.x === current.x && a.y === current.y - 1 && a.z === current.z
        ) &&
        !cubes.some(
          (a) => a.x === current.x && a.y === current.y - 1 && a.z === current.z
        )
      ) {
        const next = new Cube();
        next.x = current.x;
        next.y = current.y - 1;
        next.z = current.z;
        this.filterExposed(next, { maxX, minX, maxY, minY, maxZ, minZ });
        queue.push(next);
      }
      //3. CHECK LEFT
      if (
        current.x > minX - 1 &&
        !connectedAirCubes.some(
          (a) => a.x === current.x - 1 && a.y === current.y && a.z === current.z
        ) &&
        !cubes.some(
          (a) => a.x === current.x - 1 && a.y === current.y && a.z === current.z
        )
      ) {
        const next = new Cube();
        next.x = current.x - 1;
        next.y = current.y;
        next.z = current.z;
        this.filterExposed(next, { maxX, minX, maxY, minY, maxZ, minZ });
        queue.push(next);
      }
      //4. CHECK RIGHT
      if (
        current.x < maxX + 1 &&
        !connectedAirCubes.some(
          (a) => a.x === current.x + 1 && a.y === current.y && a.z === current.z
        ) &&
        !cubes.some(
          (a) => a.x === current.x + 1 && a.y === current.y && a.z === current.z
        )
      ) {
        const next = new Cube();
        next.x = current.x + 1;
        next.y = current.y;
        next.z = current.z;
        this.filterExposed(next, { maxX, minX, maxY, minY, maxZ, minZ });
        queue.push(next);
      }
      //5. CHECK FRONT
      if (
        current.z < maxZ + 1 &&
        !connectedAirCubes.some(
          (a) => a.x === current.x && a.y === current.y && a.z === current.z + 1
        ) &&
        !cubes.some(
          (a) => a.x === current.x && a.y === current.y && a.z === current.z + 1
        )
      ) {
        const next = new Cube();
        next.x = current.x;
        next.y = current.y;
        next.z = current.z + 1;
        this.filterExposed(next, { maxX, minX, maxY, minY, maxZ, minZ });
        queue.push(next);
      }
      //6. ChECK BACK
      if (
        current.z > minZ - 1 &&
        !connectedAirCubes.some(
          (a) => a.x === current.x && a.y === current.y && a.z === current.z - 1
        ) &&
        !cubes.some(
          (a) => a.x === current.x && a.y === current.y && a.z === current.z - 1
        )
      ) {
        const next = new Cube();
        next.x = current.x;
        next.y = current.y;
        next.z = current.z - 1;
        this.filterExposed(next, { maxX, minX, maxY, minY, maxZ, minZ });
        queue.push(next);
      }
    }

    return connectedAirCubes
      .map((c) => c.exposed.length)
      .reduce((a, b) => a + b);
  }

  private filterExposed(cube: Cube, limits) {
    if (cube.y === limits.maxY + 1) {
      cube.exposed = cube.exposed.filter((e) => e !== 0);
    }
    if (cube.y === limits.minY - 1) {
      cube.exposed = cube.exposed.filter((e) => e !== 1);
    }
    if (cube.x === limits.minX - 1) {
      cube.exposed = cube.exposed.filter((e) => e !== 2);
    }
    if (cube.x === limits.maxX + 1) {
      cube.exposed = cube.exposed.filter((e) => e !== 3);
    }
    if (cube.z === limits.maxZ + 1) {
      cube.exposed = cube.exposed.filter((e) => e !== 4);
    }
    if (cube.z === limits.minZ - 1) {
      cube.exposed = cube.exposed.filter((e) => e !== 5);
    }
  }
}

class Cube {
  public x: number;
  public y: number;
  public z: number;
  public exposed: number[];

  constructor() {
    this.exposed = [0, 1, 2, 3, 4, 5];
  }
  //0: UP, 1: DOWN, 2: LEFT, 3: RIGHT, 4: FRONT, 5: BACK
}
