import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import TinyQueue from 'tinyqueue';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class Day19Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 19).pipe(
      switchMap((input) => {
        const blueprints = this.parse(
          this.utilService.rowInputToStringArray(input)
        );
        const result = this.blueprintQuality(blueprints);
        return this.aocClient.postAnswer(2022, 19, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 19).pipe(
      switchMap((input) => {
        const blueprints = this.parse(
          this.utilService.rowInputToStringArray(input)
        );
        const result = this.largestGeodes(blueprints);
        return this.aocClient.postAnswer(2022, 19, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const blueprints = this.parse([
      'Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.',
      'Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.',
    ]);
    const test = this.blueprintQuality(blueprints) === 33;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const blueprints = this.parse([
      'Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.',
      'Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.',
    ]);
    const test =
      this.blueprintGeodes(blueprints[0], 32) === 56 &&
      this.blueprintGeodes(blueprints[1], 32) === 62;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parse(input: string[]): Blueprint[] {
    const blueprints = [];
    for (const line of input) {
      const blueprint = new Blueprint();
      const split = line.split(':');
      blueprint.id = +split[0].substring(10);
      blueprint.robots = [];
      blueprint.maxBuild = [0, 0, 0, Number.MAX_VALUE];

      const robotSplit = split[1].split(' Each').slice(1);
      for (const [index, robotString] of robotSplit.entries()) {
        const robot = new Robot();
        const costSplit = robotString.split(' costs ')[1].split(' and ');
        robot.collect = index;
        robot.cost = [];
        for (let cost of costSplit) {
          cost = cost.trim();
          if (cost.endsWith('.')) {
            cost = cost.substring(0, cost.length - 1);
          }
          const s = cost.split(' ');
          const m =
            s[1] === 'ore'
              ? Material.Ore
              : s[1] === 'clay'
              ? Material.Clay
              : s[1] === 'obsidian'
              ? Material.Obsidian
              : s[1] === 'geode'
              ? Material.Geode
              : undefined;
          robot.cost.push({ amount: +s[0], material: m });
          if (+s[0] > blueprint.maxBuild[m]) {
            blueprint.maxBuild[m] = +s[0];
          }
        }
        blueprint.robots.push(robot);
      }
      blueprints.push(blueprint);
    }
    return blueprints;
  }

  private blueprintQuality(blueprints: Blueprint[]): number {
    let sum = 0;
    for (const blueprint of blueprints) {
      sum += blueprint.id * this.blueprintGeodes(blueprint, 24);
    }
    return sum;
  }

  private largestGeodes(blueprints: Blueprint[]): number {
    let mul = 1;
    blueprints = blueprints.slice(0, 3);
    for (const blueprint of blueprints) {
      mul *= this.blueprintGeodes(blueprint, 32);
    }
    return mul;
  }

  private blueprintGeodes(blueprint: Blueprint, minutes: number): number {
    const start = new Gamestate();
    const queue = new TinyQueue<Gamestate>();
    queue.push(start);
    let best = 0;
    while (queue.length > 0) {
      const state = queue.pop();

      let geodes = state.resources[Material.Geode];
      for (let i = state.minute; i < minutes; i++) {
        geodes +=
          (minutes - i) * (state.robots[Material.Geode] + (i - state.minute));
      }
      if (best >= geodes) {
        continue;
      }

      const possibleBuilds = [];

      for (const robot of blueprint.robots) {
        if (
          state.robots[robot.collect] * (minutes - state.minute) +
            state.resources[robot.collect] >=
          (minutes - state.minute) * blueprint.maxBuild[robot.collect]
        ) {
          continue;
        }
        if (blueprint.maxBuild[robot.collect] <= state.robots[robot.collect]) {
          continue;
        }

        if (robot.cost.every((c) => state.robots[c.material] > 0)) {
          const costs = blueprint.robots[robot.collect].cost;
          let minutesToComplete = 0;
          for (const cost of costs) {
            let m = Math.ceil(
              (cost.amount - state.resources[cost.material]) /
                state.robots[cost.material]
            );
            m = m < 0 ? 1 : m + 1;
            if (m > minutesToComplete) {
              minutesToComplete = m;
            }
          }
          if (minutesToComplete + state.minute > minutes) {
            continue;
          }

          const newState = new Gamestate();
          newState.minute = state.minute + minutesToComplete;
          newState.resources = [...state.resources];
          newState.prevState = [...state.prevState, state];
          for (const rIndex of newState.resources.keys()) {
            newState.resources[rIndex] +=
              minutesToComplete * state.robots[rIndex];
            const c = costs.find((a) => a.material === rIndex);
            if (c) {
              newState.resources[rIndex] -= c.amount;
            }
          }
          newState.robots = [...state.robots];
          newState.robots[robot.collect]++;
          possibleBuilds.push(newState);
        }
      }

      if (possibleBuilds.length === 0) {
        const minutesToEnd = minutes - state.minute;
        const geodesAtEnd =
          state.resources[Material.Geode] +
          minutesToEnd * state.robots[Material.Geode];
        if (geodesAtEnd > best) {
          best = geodesAtEnd;
        }
        continue;
      }
      for (const possibleBuild of possibleBuilds) {
        queue.push(possibleBuild);
      }
    }
    return best;
  }
}

enum Material {
  Ore,
  Clay,
  Obsidian,
  Geode,
}

class Robot {
  cost: { material: Material; amount: number }[];
  collect: Material;
}

class Blueprint {
  id: number;
  robots: Robot[];
  maxBuild: number[];
}

class Gamestate {
  minute: number;
  robots: number[];
  resources: number[];
  prevState: Gamestate[];

  constructor() {
    this.minute = 0;
    this.resources = [0, 0, 0, 0];
    this.robots = [1, 0, 0, 0];
    this.prevState = [];
  }
}
