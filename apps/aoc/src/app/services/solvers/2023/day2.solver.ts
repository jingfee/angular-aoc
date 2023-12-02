import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day2Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 2).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.possibleGames(parsedInput);
        return this.aocClient.postAnswer(2023, 2, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 2).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.minimumSetOfCubes(parsedInput);
        return this.aocClient.postAnswer(2023, 2, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.possibleGames([
        'Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green',
        'Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue',
        'Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red',
        'Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red',
        'Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green',
      ]) === 8;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.minimumSetOfCubes([
        'Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green',
        'Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue',
        'Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red',
        'Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red',
        'Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green',
      ]) === 2286;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private possibleGames(games: string[]) {
    const availableCubes = {
      red: 12,
      green: 13,
      blue: 14,
    };

    let possibleGameSum = 0;

    for (const game of games) {
      const gameSplit = game.split(': ');
      const gameIndex = parseInt(gameSplit[0].replace('Game ', ''));

      const sets = gameSplit[1].split('; ');
      let possible = true;
      for (const set of sets) {
        const setCubes = set.split(', ');
        for (const cubes of setCubes) {
          const cubeSplit = cubes.split(' ');
          if (availableCubes[cubeSplit[1]] < parseInt(cubeSplit[0])) {
            possible = false;
            break;
          }
        }
        if (!possible) {
          break;
        }
      }
      possibleGameSum += possible ? gameIndex : 0;
    }

    return possibleGameSum;
  }

  private minimumSetOfCubes(games: string[]) {
    let setPowerSum = 0;

    for (const game of games) {
      const gameSplit = game.split(': ');

      const sets = gameSplit[1].split('; ');
      const minValues = {
        green: 0,
        blue: 0,
        red: 0,
      };
      for (const set of sets) {
        const setCubes = set.split(', ');
        for (const cubes of setCubes) {
          const cubeSplit = cubes.split(' ');
          const quantity = parseInt(cubeSplit[0]);
          const color = cubeSplit[1];
          minValues[color] =
            minValues[color] < quantity ? quantity : minValues[color];
        }
      }
      setPowerSum += minValues['green'] * minValues['blue'] * minValues['red'];
    }

    return setPowerSum;
  }
}
