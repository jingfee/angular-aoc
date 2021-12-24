import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../models/status.model';
import { AocClientService } from '../aoc-client.service';
import { UtilService } from '../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day20Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 20).pipe(
      switchMap((input) => {
        const split = input.split('\n\n');
        const algorithm = this.createEnhancementAlgorithm(split[0]);
        const startPicture = this.createPictureFromInput(split[1]);
        const pictureAfterAlgorithm = this.runAlgorithm(
          startPicture,
          algorithm,
          2
        );
        const result = pictureAfterAlgorithm
          .map((a) => a.filter((b) => b).length)
          .reduce((a, b) => a + b);
        return this.aocClient.postAnswer(2021, 20, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 20).pipe(
      switchMap((input) => {
        const split = input.split('\n\n');
        const algorithm = this.createEnhancementAlgorithm(split[0]);
        const startPicture = this.createPictureFromInput(split[1]);
        const pictureAfterAlgorithm = this.runAlgorithm(
          startPicture,
          algorithm,
          50
        );
        const result = pictureAfterAlgorithm
          .map((a) => a.filter((b) => b).length)
          .reduce((a, b) => a + b);
        return this.aocClient.postAnswer(2021, 20, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const algorithm = this.createEnhancementAlgorithm(
      '..#.#..#####.#.#.#.###.##.....###.##.#..###.####..#####..#....#..#..##..###..######.###...####..#..#####..##..#.#####...##.#.#..#.##..#.#......#.###.######.###.####...#.##.##..#..#..#####.....#.#....###..#.##......#.....#..#..#..##..#...##.######.####.####.#.#...#.......#..#.#.#...####.##.#......#..#...##.#.##..#...##.#.##..###.#......#.#.......#.#.#.####.###.##...#.....####.#..#..#.##.#....##..#.####....##...##..#...#......#.#.......#.......##..####..#...#.#.#...##..#.#..###..#####........#..####......#..#'
    );
    const picture = this.createPictureFromInput(
      '#..#.\n#....\n##..#\n..#..\n..###'
    );
    const newPicture = this.runAlgorithm(picture, algorithm, 2);
    const test =
      newPicture
        .map((a) => a.filter((b) => b).length)
        .reduce((a, b) => a + b) === 35;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const algorithm = this.createEnhancementAlgorithm(
      '..#.#..#####.#.#.#.###.##.....###.##.#..###.####..#####..#....#..#..##..###..######.###...####..#..#####..##..#.#####...##.#.#..#.##..#.#......#.###.######.###.####...#.##.##..#..#..#####.....#.#....###..#.##......#.....#..#..#..##..#...##.######.####.####.#.#...#.......#..#.#.#...####.##.#......#..#...##.#.##..#...##.#.##..###.#......#.#.......#.#.#.####.###.##...#.....####.#..#..#.##.#....##..#.####....##...##..#...#......#.#.......#.......##..####..#...#.#.#...##..#.#..###..#####........#..####......#..#'
    );
    const picture = this.createPictureFromInput(
      '#..#.\n#....\n##..#\n..#..\n..###'
    );
    const newPicture = this.runAlgorithm(picture, algorithm, 50);
    const test =
      newPicture
        .map((a) => a.filter((b) => b).length)
        .reduce((a, b) => a + b) === 3351;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private createPictureFromInput(pictureInput: string): boolean[][] {
    const picture = [];
    for (const pictureRow of pictureInput.split('\n')) {
      if (pictureRow === '') {
        continue;
      }
      const row = [];
      for (const char of pictureRow) {
        row.push(char === '#' ? true : false);
      }
      picture.push(row);
    }
    return picture;
  }

  private createEnhancementAlgorithm(algorithmString: string) {
    const enhancementAlgorithm = [];
    for (const char of algorithmString) {
      enhancementAlgorithm.push(char === '#' ? true : false);
    }
    return enhancementAlgorithm;
  }

  private padPicture(picture: boolean[][], infPixels: boolean): boolean[][] {
    const padded = [];
    for (let i = -1; i < picture.length + 1; i++) {
      const paddedRow = [];
      for (let j = -1; j < picture[0].length + 1; j++) {
        if (
          i === -1 ||
          j === -1 ||
          i === picture.length ||
          j === picture[0].length
        ) {
          paddedRow.push(infPixels);
        } else {
          paddedRow.push(picture[i][j]);
        }
      }
      padded.push(paddedRow);
    }
    return padded;
  }

  private runAlgorithm(
    picture: boolean[][],
    enhancementAlgorithm: boolean[],
    steps: number
  ): boolean[][] {
    let infPixels = false;
    for (let s = 0; s < steps; s++) {
      const input = this.padPicture(picture, infPixels);
      const newPicture = [];

      for (let i = 0; i < input.length; i++) {
        const newRow = [];
        for (let j = 0; j < input[0].length; j++) {
          newRow.push(
            enhancementAlgorithm[this.getPixelDecimal(input, j, i, infPixels)]
          );
        }
        newPicture.push(newRow);
      }

      picture = newPicture;
      infPixels = infPixels
        ? enhancementAlgorithm[511]
        : enhancementAlgorithm[0];
    }

    return picture;
  }

  private getPixelDecimal(
    picture: boolean[][],
    x: number,
    y: number,
    infPixel: boolean
  ) {
    let binary = '';
    for (let i = y - 1; i <= y + 1; i++) {
      for (let j = x - 1; j <= x + 1; j++) {
        if (
          i === -1 ||
          j === -1 ||
          i === picture.length ||
          j === picture[0].length
        ) {
          binary += infPixel ? '1' : '0';
        } else {
          binary += picture[i][j] ? '1' : '0';
        }
      }
    }
    return Number.parseInt(binary, 2);
  }
}
