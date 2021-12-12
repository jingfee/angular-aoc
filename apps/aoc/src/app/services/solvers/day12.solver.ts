import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../models/status.model';
import { AocClientService } from '../aoc-client.service';
import { UtilService } from '../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day12Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 12).pipe(
      switchMap((input) => {
        const cavePaths = this.utilService.rowInputToStringArray(input);
        const result = this.findPaths(this.parseCaves(cavePaths), false);
        return this.aocClient.postAnswer(2021, 12, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 12).pipe(
      switchMap((input) => {
        const cavePaths = this.utilService.rowInputToStringArray(input);
        const result = this.findPaths(this.parseCaves(cavePaths), true);
        return this.aocClient.postAnswer(2021, 12, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test1 =
      this.findPaths(
        this.parseCaves([
          'start-A',
          'start-b',
          'A-c',
          'A-b',
          'b-d',
          'A-end',
          'b-end',
        ]),
        false
      ) === 10;

    const test2 =
      this.findPaths(
        this.parseCaves([
          'dc-end',
          'HN-start',
          'start-kj',
          'dc-start',
          'dc-HN',
          'LN-dc',
          'HN-end',
          'kj-sa',
          'kj-HN',
          'kj-dc',
        ]),
        false
      ) === 19;

    const test3 =
      this.findPaths(
        this.parseCaves([
          'fs-end',
          'he-DX',
          'fs-he',
          'start-DX',
          'pj-DX',
          'end-zg',
          'zg-sl',
          'zg-pj',
          'pj-he',
          'RW-he',
          'fs-DX',
          'pj-RW',
          'zg-RW',
          'start-pj',
          'he-WI',
          'zg-he',
          'pj-fs',
          'start-RW',
        ]),
        false
      ) === 226;

    return test1 && test2 && test3 ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test1 =
      this.findPaths(
        this.parseCaves([
          'start-A',
          'start-b',
          'A-c',
          'A-b',
          'b-d',
          'A-end',
          'b-end',
        ]),
        true
      ) === 36;

    const test2 =
      this.findPaths(
        this.parseCaves([
          'dc-end',
          'HN-start',
          'start-kj',
          'dc-start',
          'dc-HN',
          'LN-dc',
          'HN-end',
          'kj-sa',
          'kj-HN',
          'kj-dc',
        ]),
        true
      ) === 103;

    const test3 =
      this.findPaths(
        this.parseCaves([
          'fs-end',
          'he-DX',
          'fs-he',
          'start-DX',
          'pj-DX',
          'end-zg',
          'zg-sl',
          'zg-pj',
          'pj-he',
          'RW-he',
          'fs-DX',
          'pj-RW',
          'zg-RW',
          'start-pj',
          'he-WI',
          'zg-he',
          'pj-fs',
          'start-RW',
        ]),
        true
      ) === 3509;

    return test1 && test2 && test3 ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseCaves(cavePaths: string[]): Cave[] {
    const caves: Cave[] = [];

    for (const cavePath of cavePaths) {
      const split = cavePath.split('-');

      let cave1 = caves.find((c) => c.name === split[0]);
      if (!cave1) {
        cave1 = {
          name: split[0],
          isBig: split[0] === split[0].toUpperCase(),
          neighbours: [],
        };

        caves.push(cave1);
      }

      let cave2 = caves.find((c) => c.name === split[1]);
      if (!cave2) {
        cave2 = {
          name: split[1],
          isBig: split[1] === split[1].toUpperCase(),
          neighbours: [],
        };

        caves.push(cave2);
      }

      cave1.neighbours.push(cave2);
      cave2.neighbours.push(cave1);
    }

    return caves;
  }

  private findPaths(caves: Cave[], allowSmallCavesTwice: boolean): number {
    const start = caves.find((c) => c.name === 'start');

    const possiblePaths = [[start]];
    const foundPaths = [];

    while (possiblePaths.length > 0) {
      const currentPath = possiblePaths.shift();
      const currentCave = currentPath[currentPath.length - 1];

      for (const neighbour of currentCave.neighbours) {
        if (
          neighbour.name === 'start' ||
          (!neighbour.isBig &&
            currentPath.filter((c) => c.name === neighbour.name).length > 0 &&
            (!allowSmallCavesTwice ||
              this.hasVisitedSmallCaveTwice(currentPath)))
        ) {
          continue;
        }

        if (neighbour.name === 'end') {
          foundPaths.push([...currentPath, neighbour]);
          continue;
        }

        possiblePaths.push([...currentPath, neighbour]);
      }
    }

    return foundPaths.length;
  }

  private hasVisitedSmallCaveTwice(path: Cave[]): boolean {
    const smallCavesInPath = path.filter((c) => !c.isBig);
    return new Set(smallCavesInPath).size !== smallCavesInPath.length;
  }
}

class Cave {
  public name: string;
  public isBig: boolean;
  public neighbours: Cave[];
}
