import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../models/status.model';
import { AocClientService } from '../aoc-client.service';
import { UtilService } from '../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day4Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 4).pipe(
      switchMap((input) => {
        const parsed = this.parseInput(input);
        const result = this.findFirstWinner(parsed.draw, parsed.boards);
        return this.aocClient.postAnswer(2021, 4, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 4).pipe(
      switchMap((input) => {
        const parsed = this.parseInput(input);
        const result = this.findLastWinner(parsed.draw, parsed.boards);
        return this.aocClient.postAnswer(2021, 4, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const parsed = this.parseInput(
      '7,4,9,5,11,17,23,2,0,14,21,24,10,16,13,6,15,25,12,22,18,20,8,19,3,26,1\n\n22 13 17 11  0\n8  2 23  4 24\n21  9 14 16  7\n6 10  3 18  5\n1 12 20 15 19\n\n3 15  0  2 22\n9 18 13 17  5\n19  8  7 25 23\n20 11 10 24  4\n14 21 16 12  6\n\n14 21 17 24  4\n10 16 15  9 19\n18  8 23 26 20\n22 11 13  6  5\n 2  0 12  3  7'
    );
    const test = this.findFirstWinner(parsed.draw, parsed.boards) === 4512;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const parsed = this.parseInput(
      '7,4,9,5,11,17,23,2,0,14,21,24,10,16,13,6,15,25,12,22,18,20,8,19,3,26,1\n\n22 13 17 11  0\n8  2 23  4 24\n21  9 14 16  7\n6 10  3 18  5\n1 12 20 15 19\n\n3 15  0  2 22\n9 18 13 17  5\n19  8  7 25 23\n20 11 10 24  4\n14 21 16 12  6\n\n14 21 17 24  4\n10 16 15  9 19\n18  8 23 26 20\n22 11 13  6  5\n 2  0 12  3  7'
    );
    const test = this.findLastWinner(parsed.draw, parsed.boards) === 1924;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseInput(input: string): { draw: number[]; boards: string[][] } {
    const split = input.split('\n\n');

    const draw = split[0].split(',').map((x) => Number.parseInt(x));
    const boards = [];

    for (let i = 1; i < split.length; i++) {
      boards.push(split[i].split('\n'));
    }

    return { draw, boards };
  }

  private findFirstWinner(draw: number[], bingoBoards: string[][]): number {
    const boards = bingoBoards.map(
      (boardString) => new BingoBoard(boardString)
    );

    for (const number of draw) {
      for (const board of boards) {
        const points = board.mark(number);

        if (points > -1) {
          return points;
        }
      }
    }

    return 0;
  }

  private findLastWinner(draw: number[], bingoBoards: string[][]): number {
    const boards = bingoBoards.map(
      (boardString) => new BingoBoard(boardString)
    );

    let winners = 0;

    for (const number of draw) {
      for (const board of boards) {
        if (board.won) {
          continue;
        }

        const points = board.mark(number);
        if (points > -1) {
          winners++;
          if (winners === bingoBoards.length) {
            return points;
          }
        }
      }
    }

    return 0;
  }
}

class BingoBoard {
  public board: { number: number; marked: boolean }[][];
  public won: boolean;

  constructor(boardString: string[]) {
    this.board = [];
    for (const rowString of boardString) {
      if (rowString === '') {
        continue;
      }
      const row = [];
      for (const cellString of rowString.trim().split(' ')) {
        if (cellString === '') {
          continue;
        }
        row.push({
          number: Number.parseInt(cellString),
          marked: false,
        });
      }
      this.board.push(row);
    }
  }

  public mark(number: number): number {
    for (const row of this.board) {
      for (const cell of row) {
        if (cell.number === number) {
          cell.marked = true;
        }
      }
    }

    if (this.hasWon()) {
      this.won = true;
      return this.points(number);
    } else {
      return -1;
    }
  }

  private hasWon(): boolean {
    let hasVertical = false;
    for (let i = 0; i < this.board.length; i++) {
      hasVertical = this.board.every((r) => r[i].marked);
      if (hasVertical) {
        break;
      }
    }

    return this.board.some((r) => r.every((c) => c.marked)) || hasVertical;
  }

  private points(number: number): number {
    let unmarked = 0;
    for (const row of this.board) {
      for (const cell of row) {
        if (!cell.marked) {
          unmarked += cell.number;
        }
      }
    }

    return unmarked * number;
  }
}
