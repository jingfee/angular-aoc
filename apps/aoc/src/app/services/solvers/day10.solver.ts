import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../models/status.model';
import { AocClientService } from '../aoc-client.service';
import { UtilService } from '../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day10Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 10).pipe(
      switchMap((input) => {
        const lines = this.utilService.rowInputToStringArray(input);
        const result = this.getScores(lines).errorScore;
        return this.aocClient.postAnswer(2021, 10, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 10).pipe(
      switchMap((input) => {
        const lines = this.utilService.rowInputToStringArray(input);
        const result = this.getScores(lines).autoCompleteScore;
        return this.aocClient.postAnswer(2021, 10, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.getScores([
        '[({(<(())[]>[[{[]{<()<>>',
        '[(()[<>])]({[<{<<[]>>(',
        '{([(<{}[<>[]}>{[]{[(<()>',
        '(((({<>}<{<{<>}{[]{[]{}',
        '[[<[([]))<([[{}[[()]]]',
        '[{[{({}]{}}([{[{{{}}([]',
        '{<[[]]>}<{[{[{[]{()[[[]',
        '[<(<(<(<{}))><([]([]()',
        '<{([([[(<>()){}]>(<<{{',
        '<{([{{}}[<[[[<>{}]]]>[]]',
      ]).errorScore === 26397;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.getScores([
        '[({(<(())[]>[[{[]{<()<>>',
        '[(()[<>])]({[<{<<[]>>(',
        '{([(<{}[<>[]}>{[]{[(<()>',
        '(((({<>}<{<{<>}{[]{[]{}',
        '[[<[([]))<([[{}[[()]]]',
        '[{[{({}]{}}([{[{{{}}([]',
        '{<[[]]>}<{[{[{[]{()[[[]',
        '[<(<(<(<{}))><([]([]()',
        '<{([([[(<>()){}]>(<<{{',
        '<{([{{}}[<[[[<>{}]]]>[]]',
      ]).autoCompleteScore === 288957;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private getScores(lines: string[]): {
    errorScore: number;
    autoCompleteScore: number;
  } {
    let errorScore = 0;
    const autoCompleteScores = [];
    for (const line of lines) {
      const scores = this.getScoresForLine(line);
      errorScore += scores.errorScore;
      if (scores.autoCompleteScore > 0) {
        autoCompleteScores.push(scores.autoCompleteScore);
      }
    }
    const mid = Math.floor(autoCompleteScores.length / 2);
    const autoCompleteScore = autoCompleteScores
      .sort((a, b) => (a > b ? 1 : -1))
      .slice(mid, mid + 1)[0];
    return { errorScore, autoCompleteScore };
  }

  private getScoresForLine(line: string): {
    errorScore: number;
    autoCompleteScore: number;
  } {
    let currentOpen = undefined;
    const stackOpen = [];
    for (const c of line) {
      if (['(', '[', '{', '<'].includes(c)) {
        if (currentOpen) {
          stackOpen.push(currentOpen);
        }
        currentOpen = c;
      } else {
        const errorScore = this.checkClosingCharAndReturnErrorScore(
          currentOpen,
          c
        );
        if (errorScore > 0) {
          return { errorScore, autoCompleteScore: 0 };
        }
        currentOpen = stackOpen.pop();
      }
    }

    stackOpen.push(currentOpen);

    let autoCompleteScore = 0;
    for (const openChar of stackOpen.reverse()) {
      autoCompleteScore *= 5;
      autoCompleteScore += this.getAutoCompleteScore(openChar);
    }

    return { errorScore: 0, autoCompleteScore };
  }

  private checkClosingCharAndReturnErrorScore(
    currentOpen: string,
    currentChar: string
  ): number {
    if (currentChar === ')' && currentOpen !== '(') {
      return 3;
    } else if (currentChar === ']' && currentOpen !== '[') {
      return 57;
    } else if (currentChar === '}' && currentOpen !== '{') {
      return 1197;
    } else if (currentChar === '>' && currentOpen !== '<') {
      return 25137;
    } else {
      return 0;
    }
  }

  private getAutoCompleteScore(char: string): number {
    switch (char) {
      case '(':
        return 1;
      case '[':
        return 2;
      case '{':
        return 3;
      case '<':
        return 4;
      default:
        return undefined;
    }
  }
}
