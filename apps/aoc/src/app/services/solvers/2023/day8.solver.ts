import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day8Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 8).pipe(
      switchMap((input) => {
        const parsedInput = this.parseNodes(
          this.utilService.rowInputToStringArray(input),
        );
        const result = this.findZZZ(parsedInput.nodes, parsedInput.path);
        return this.aocClient.postAnswer(2023, 8, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 8).pipe(
      switchMap((input) => {
        const parsedInput = this.parseNodes(
          this.utilService.rowInputToStringArray(input),
        );
        const result = this.findZGhost(
          parsedInput.nodes,
          parsedInput.path,
          parsedInput.startNodes,
        );
        return this.aocClient.postAnswer(2023, 8, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const parsed1 = this.parseNodes([
      'RL',
      'AAA = (BBB, CCC)',
      'BBB = (DDD, EEE)',
      'CCC = (ZZZ, GGG)',
      'DDD = (DDD, DDD)',
      'EEE = (EEE, EEE)',
      'GGG = (GGG, GGG)',
      'ZZZ = (ZZZ, ZZZ)',
    ]);
    const parsed2 = this.parseNodes([
      'LLR',
      'AAA = (BBB, BBB)',
      'BBB = (AAA, ZZZ)',
      'ZZZ = (ZZZ, ZZZ)',
    ]);

    const test =
      this.findZZZ(parsed1.nodes, parsed1.path) === 2 &&
      this.findZZZ(parsed2.nodes, parsed2.path) === 6;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const parsed = this.parseNodes([
      'LR',
      '11A = (11B, XXX)',
      '11B = (XXX, 11Z)',
      '11Z = (11B, XXX)',
      '22A = (22B, XXX)',
      '22B = (22C, 22C)',
      '22C = (22Z, 22Z)',
      '22Z = (22B, 22B)',
      'XXX = (XXX, XXX)',
    ]);
    const test =
      this.findZGhost(parsed.nodes, parsed.path, parsed.startNodes) === 6;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseNodes(input: string[]) {
    const path = input[0];
    const nodes = new Map<string, { left: string; right: string }>();
    const startNodes = [];
    for (let i = 1; i < input.length; i++) {
      const nodeSplit = input[i].split(' = ');
      const destinationSplit = nodeSplit[1]
        .replace('(', '')
        .replace(')', '')
        .split(', ');
      nodes.set(nodeSplit[0], {
        left: destinationSplit[0],
        right: destinationSplit[1],
      });
      if (nodeSplit[0].endsWith('A')) {
        startNodes.push(nodeSplit[0]);
      }
    }
    return { path, nodes, startNodes };
  }

  private findZZZ(
    nodes: Map<string, { left: string; right: string }>,
    path: string,
  ) {
    let steps = 0;
    let currentNode = 'AAA';
    while (currentNode !== 'ZZZ') {
      const direction = path[steps % path.length];
      currentNode =
        direction === 'L'
          ? nodes.get(currentNode).left
          : nodes.get(currentNode).right;
      steps++;
    }
    return steps;
  }

  private findZGhost(
    nodes: Map<string, { left: string; right: string }>,
    path: string,
    startNodes: string[],
  ) {
    const stepsToReach = [];
    for (let currentNode of startNodes) {
      let steps = 0;
      while (!currentNode.endsWith('Z')) {
        const direction = path[steps % path.length];
        currentNode =
          direction === 'L'
            ? nodes.get(currentNode).left
            : nodes.get(currentNode).right;
        steps++;
      }
      stepsToReach.push(steps);
    }

    return this.LCM(stepsToReach);
  }

  private LCM(arr) {
    let res = arr[0];

    for (let i = 1; i < arr.length; i++) {
      res = (res * arr[i]) / this.gcd(res, arr[i]);
    }

    return res;
  }

  private gcd(a, b) {
    if (b === 0) return a;
    return this.gcd(b, a % b);
  }
}
