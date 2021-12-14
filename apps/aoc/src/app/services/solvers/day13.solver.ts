import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../models/status.model';
import { AocClientService } from '../aoc-client.service';
import { UtilService } from '../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day13Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 13).pipe(
      switchMap((input) => {
        const split = input.split('\n\n');
        const paper = this.parseDots(split[0].split('\n'));
        const result = this.countAfterFirstFold(paper, split[1].split('\n')[0]);
        return this.aocClient.postAnswer(2021, 13, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 13).pipe(
      switchMap((input) => {
        const split = input.split('\n\n');
        let paper = this.parseDots(split[0].split('\n'));
        const foldInstructions = split[1].split('\n');
        for (const fold of foldInstructions) {
          if (fold === '') {
            continue;
          }
          const foldLine = Number.parseInt(fold.split('=')[1]);
          paper = fold.includes('x')
            ? this.foldX(paper, foldLine)
            : this.foldY(paper, foldLine);
        }
        console.log(paper);
        return of(Status.SOLVED);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.countAfterFirstFold(
        this.parseDots([
          '6,10',
          '0,14',
          '9,10',
          '0,3',
          '10,4',
          '4,11',
          '6,0',
          '6,12',
          '4,1',
          '0,13',
          '10,12',
          '3,4',
          '3,0',
          '8,4',
          '1,10',
          '2,14',
          '8,10',
          '9,0',
        ]),
        'fold along y=7'
      ) === 17;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test = false;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseDots(dots: string[]): string[][] {
    const paper = [];
    const dotsParsed = dots.map((a) => {
      const split = a.split(',');
      return { x: Number.parseInt(split[0]), y: Number.parseInt(split[1]) };
    });

    const maxX = Math.max(...dotsParsed.map((a) => a.x));
    const maxY = Math.max(...dotsParsed.map((a) => a.y));

    for (let y = 0; y < maxY + 1; y++) {
      const paperLine = [];
      for (let x = 0; x < maxX + 1; x++) {
        if (dotsParsed.find((a) => a.x === x && a.y === y)) {
          paperLine.push('#');
        } else {
          paperLine.push('.');
        }
      }
      paper.push(paperLine);
    }

    return paper;
  }

  private countAfterFirstFold(paper: string[][], firstFold: string): number {
    const foldLine = Number.parseInt(firstFold.split('=')[1]);
    const foldedPaper = firstFold.includes('x')
      ? this.foldX(paper, foldLine)
      : this.foldY(paper, foldLine);
    return foldedPaper
      .map((a) => a.filter((x) => x === '#').length)
      .reduce((a, b) => a + b);
  }

  private foldX(paper: string[][], foldLine: number) {
    const folded: string[][] = [];

    for (let y = 0; y < paper.length; y++) {
      const foldedY = [];
      for (let x = 0; x < foldLine; x++) {
        foldedY.push(paper[y][x]);
      }
      for (let x = foldLine + 1; x < paper[y].length; x++) {
        if (paper[y][x] === '#') {
          foldedY[2 * foldLine - x] = '#';
        }
      }
      folded.push(foldedY);
    }

    return folded;
  }

  private foldY(paper: string[][], foldLine: number) {
    const folded: string[][] = [];

    for (let y = 0; y < foldLine; y++) {
      const foldedY = [];
      for (let x = 0; x < paper[y].length; x++) {
        foldedY.push(paper[y][x]);
      }
      folded.push(foldedY);
    }
    for (let y = foldLine + 1; y < paper.length; y++) {
      const foldedY = folded[2 * foldLine - y];

      for (let x = 0; x < paper[y].length; x++) {
        if (paper[y][x] === '#') {
          foldedY[x] = '#';
        }
      }

      folded[2 * foldLine - y] = foldedY;
    }

    return folded;
  }
}
