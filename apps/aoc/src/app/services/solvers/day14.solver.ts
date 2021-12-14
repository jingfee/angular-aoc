import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../models/status.model';
import { AocClientService } from '../aoc-client.service';
import { UtilService } from '../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day14Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 14).pipe(
      switchMap((input) => {
        const split = input.split('\n\n');
        const instructions = this.parseInstructions(split[1].split('\n'));
        const result = this.runPolymerSteps(split[0], instructions, 10);
        return this.aocClient.postAnswer(2021, 14, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 14).pipe(
      switchMap((input) => {
        const split = input.split('\n\n');
        const instructions = this.parseInstructions(split[1].split('\n'));
        const result = this.runPolymerSteps(split[0], instructions, 40);
        return this.aocClient.postAnswer(2021, 14, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const instructions = this.parseInstructions([
      'CH -> B',
      'HH -> N',
      'CB -> H',
      'NH -> C',
      'HB -> C',
      'HC -> B',
      'HN -> C',
      'NN -> C',
      'BH -> H',
      'NC -> B',
      'NB -> B',
      'BN -> B',
      'BB -> N',
      'BC -> B',
      'CC -> N',
      'CN -> C',
    ]);
    const test = this.runPolymerSteps('NNCB', instructions, 10) === 1588;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const instructions = this.parseInstructions([
      'CH -> B',
      'HH -> N',
      'CB -> H',
      'NH -> C',
      'HB -> C',
      'HC -> B',
      'HN -> C',
      'NN -> C',
      'BH -> H',
      'NC -> B',
      'NB -> B',
      'BN -> B',
      'BB -> N',
      'BC -> B',
      'CC -> N',
      'CN -> C',
    ]);
    const test =
      this.runPolymerSteps('NNCB', instructions, 40) === 2188189693529;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseInstructions(
    instructionStrings: string[]
  ): PolymerInstruction[] {
    const instructions = [];

    for (const instructionString of instructionStrings) {
      if (instructionString === '') {
        continue;
      }
      const split = instructionString.split(' -> ');
      instructions.push({
        pair: split[0],
        output: split[1],
      });
    }

    return instructions;
  }

  private runPolymerSteps(
    template: string,
    instructions: PolymerInstruction[],
    steps: number
  ): number {
    const charCount = this.initCount(instructions, template);
    let polymerPairs = this.initPairs(template, instructions);
    for (let i = 0; i < steps; i++) {
      const newPolymerPairs = this.initPolymerPairs(instructions);

      for (const [key, value] of Object.entries(polymerPairs)) {
        if (value === 0) {
          continue;
        }
        const instructionMatch = instructions.find(
          (a) => a.pair[0] === key[0] && a.pair[1] === key[1]
        );

        newPolymerPairs[`${key[0]}${instructionMatch.output}`] += value;
        newPolymerPairs[`${instructionMatch.output}${key[1]}`] += value;
        charCount[instructionMatch.output] += value;
      }
      polymerPairs = newPolymerPairs;
    }

    return (
      Math.max(...Object.entries(charCount).map((a) => a[1])) -
      Math.min(...Object.entries(charCount).map((a) => a[1]))
    );
  }

  private initPolymerPairs(instructions: PolymerInstruction[]) {
    const pairs = [];
    for (const instruction of instructions) {
      pairs[instruction.pair] = 0;
    }
    return pairs;
  }

  private initCount(instructions: PolymerInstruction[], template: string) {
    const count = [];

    for (const instruction of instructions) {
      count[instruction.output] = (
        template.match(new RegExp(instruction.output, 'g')) || []
      ).length;
    }
    return count;
  }

  private initPairs(
    template: string,
    instructions: PolymerInstruction[]
  ): number[] {
    const pairs = this.initPolymerPairs(instructions);
    for (let i = 0; i < template.length - 1; i++) {
      pairs[template[i] + template[i + 1]]++;
    }
    return pairs;
  }
}

class PolymerInstruction {
  pair: string;
  output: string;
}
