import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../models/status.model';
import { AocClientService } from '../aoc-client.service';
import { UtilService } from '../util.service';
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
    return this.aocClient.getInput(2021, 11).pipe(
      switchMap((input) => {
        const initialLevels = this.utilService.rowInputToStringArray(input);
        const octopuses = this.parseOctopuses(initialLevels);
        const result = this.simulate(octopuses, 100);
        return this.aocClient.postAnswer(2021, 11, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 11).pipe(
      switchMap((input) => {
        const initialLevels = this.utilService.rowInputToStringArray(input);
        const octopuses = this.parseOctopuses(initialLevels);
        const result = this.simulate(octopuses, Number.MAX_VALUE, true);
        return this.aocClient.postAnswer(2021, 11, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const octopuses = this.parseOctopuses([
      '5483143223',
      '2745854711',
      '5264556173',
      '6141336146',
      '6357385478',
      '4167524645',
      '2176841721',
      '6882881134',
      '4846848554',
      '5283751526',
    ]);
    const test = this.simulate(octopuses, 100) === 1656;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const octopuses = this.parseOctopuses([
      '5483143223',
      '2745854711',
      '5264556173',
      '6141336146',
      '6357385478',
      '4167524645',
      '2176841721',
      '6882881134',
      '4846848554',
      '5283751526',
    ]);
    const test = this.simulate(octopuses, Number.MAX_VALUE, true) === 195;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseOctopuses(initialLevels: string[]): Octopus[] {
    const octopuses = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const energy = initialLevels[i][j];

        const adjacent = [];
        for (let i_adj = i - 1; i_adj <= i + 1; i_adj++) {
          for (let j_adj = j - 1; j_adj <= j + 1; j_adj++) {
            if (
              i_adj < 0 ||
              j_adj < 0 ||
              i_adj > 9 ||
              j_adj > 9 ||
              (i_adj === i && j_adj === j)
            ) {
              continue;
            }
            adjacent.push(i_adj * 10 + j_adj);
          }
        }

        octopuses.push({
          energy,
          adjacent,
        });
      }
    }

    return octopuses;
  }

  private simulate(
    octopuses: Octopus[],
    steps: number,
    breakAtFirstSyncFlash: boolean = false
  ): number {
    let flashes = 0;

    for (let i = 0; i < steps; i++) {
      for (const octopus of octopuses) {
        octopus.energy++;
      }

      let flashedOctopuses = octopuses.filter((o) => o.energy > 9);
      while (flashedOctopuses.length > 0) {
        for (const flashedOctopus of flashedOctopuses) {
          flashedOctopus.hasFlashed = true;
          flashes++;
          for (const adjacent of flashedOctopus.adjacent) {
            octopuses[adjacent].energy++;
          }
          flashedOctopuses = octopuses.filter(
            (o) => o.energy > 9 && !o.hasFlashed
          );
        }
      }

      if (octopuses.every((o) => o.hasFlashed)) {
        return i + 1;
      }

      for (const flashedOctopus of octopuses.filter((o) => o.hasFlashed)) {
        flashedOctopus.energy = 0;
        flashedOctopus.hasFlashed = false;
      }
    }

    return flashes;
  }
}

class Octopus {
  public energy: number;
  public hasFlashed: boolean;
  public adjacent: number[];
}
