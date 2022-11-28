import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day9Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 9).pipe(
      switchMap((input) => {
        const heightMap = this.utilService
          .rowInputToStringArray(input)
          .map((a) => a.split('').map((b) => Number.parseInt(b)));
        const result = this.findLowPoints(heightMap);
        return this.aocClient.postAnswer(2021, 9, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 9).pipe(
      switchMap((input) => {
        const heightMap = this.utilService
          .rowInputToStringArray(input)
          .map((a) => a.split('').map((b) => Number.parseInt(b)));
        const result = this.findBasins(heightMap);
        return this.aocClient.postAnswer(2021, 9, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.findLowPoints([
        [2, 1, 9, 9, 9, 4, 3, 2, 1, 0],
        [3, 9, 8, 7, 8, 9, 4, 9, 2, 1],
        [9, 8, 5, 6, 7, 8, 9, 8, 9, 2],
        [8, 7, 6, 7, 8, 9, 6, 7, 8, 9],
        [9, 8, 9, 9, 9, 6, 5, 6, 7, 8],
      ]) === 15;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.findBasins([
        [2, 1, 9, 9, 9, 4, 3, 2, 1, 0],
        [3, 9, 8, 7, 8, 9, 4, 9, 2, 1],
        [9, 8, 5, 6, 7, 8, 9, 8, 9, 2],
        [8, 7, 6, 7, 8, 9, 6, 7, 8, 9],
        [9, 8, 9, 9, 9, 6, 5, 6, 7, 8],
      ]) === 1134;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private findLowPoints(heightMap: number[][]): number {
    let riskLevel = 0;

    for (let i = 0; i < heightMap.length; i++) {
      for (let j = 0; j < heightMap[i].length; j++) {
        const height = heightMap[i][j];

        const lowerThanAdjacent =
          (i === 0 || height < heightMap[i - 1][j]) &&
          (j === 0 || height < heightMap[i][j - 1]) &&
          (i === heightMap.length - 1 || height < heightMap[i + 1][j]) &&
          (j === heightMap[i].length - 1 || height < heightMap[i][j + 1]);

        riskLevel += lowerThanAdjacent ? 1 + height : 0;
      }
    }

    return riskLevel;
  }

  private findBasins(heightMap: number[][]): number {
    const foundBasins = [];

    for (let i = 0; i < heightMap.length; i++) {
      for (let j = 0; j < heightMap[i].length; j++) {
        const height = heightMap[i][j];

        if (height === 9 || foundBasins.flat().includes(this.getKey(i, j))) {
          continue;
        }

        const basin = [];
        this.searchNeighbour(i, j, basin, heightMap);
        foundBasins.push(basin);
      }
    }

    return foundBasins
      .sort((a, b) => (a.length < b.length ? 1 : -1))
      .slice(0, 3)
      .map((a) => a.length)
      .reduce((a, b) => a * b, 1);
  }

  private searchNeighbour(
    i: number,
    j: number,
    basin: number[],
    heightMap: number[][]
  ) {
    basin.push(this.getKey(i, j));
    if (
      i > 0 &&
      !basin.includes(this.getKey(i - 1, j)) &&
      heightMap[i - 1][j] !== 9
    ) {
      this.searchNeighbour(i - 1, j, basin, heightMap);
    }

    if (
      j > 0 &&
      !basin.includes(this.getKey(i, j - 1)) &&
      heightMap[i][j - 1] !== 9
    ) {
      this.searchNeighbour(i, j - 1, basin, heightMap);
    }

    if (
      i < heightMap.length - 1 &&
      !basin.includes(this.getKey(i + 1, j)) &&
      heightMap[i + 1][j] !== 9
    ) {
      this.searchNeighbour(i + 1, j, basin, heightMap);
    }

    if (
      j < heightMap[i].length - 1 &&
      !basin.includes(this.getKey(i, j + 1)) &&
      heightMap[i][j + 1] !== 9
    ) {
      this.searchNeighbour(i, j + 1, basin, heightMap);
    }
  }

  private getKey(i: number, j: number) {
    return i * 101 + j;
  }
}
