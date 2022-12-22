/* eslint-disable no-constant-condition */
import { Injectable } from '@angular/core';
import { MinQueue } from 'heapify';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day16Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2022, 16).pipe(
      switchMap((input) => {
        const parsed = this.parseValves(
          this.utilService.rowInputToStringArray(input)
        );
        const distances = this.mapDistances(parsed);
        const result = this.getBestPressureRelease(parsed, distances);
        return this.aocClient.postAnswer(2022, 16, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2022, 16).pipe(
      switchMap((input) => {
        const parsed = this.parseValves(
          this.utilService.rowInputToStringArray(input)
        );
        const distances = this.mapDistances(parsed);
        const result = this.getBestPressureReleaseWithElephant(
          parsed,
          distances
        );
        return this.aocClient.postAnswer(2022, 16, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const parsed = this.parseValves([
      'Valve AA has flow rate=0; tunnels lead to valves DD, II, BB',
      'Valve BB has flow rate=13; tunnels lead to valves CC, AA',
      'Valve CC has flow rate=2; tunnels lead to valves DD, BB',
      'Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE',
      'Valve EE has flow rate=3; tunnels lead to valves FF, DD',
      'Valve FF has flow rate=0; tunnels lead to valves EE, GG',
      'Valve GG has flow rate=0; tunnels lead to valves FF, HH',
      'Valve HH has flow rate=22; tunnel leads to valve GG',
      'Valve II has flow rate=0; tunnels lead to valves AA, JJ',
      'Valve JJ has flow rate=21; tunnel leads to valve II',
    ]);
    const distances = this.mapDistances(parsed);
    const test = this.getBestPressureRelease(parsed, distances) === 1651;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    // SOLUTION DOESN'T WORK WITH TEST CASE FOR THIS DAY
    const parsed = this.parseValves([
      'Valve AA has flow rate=0; tunnels lead to valves DD, II, BB',
      'Valve BB has flow rate=13; tunnels lead to valves CC, AA',
      'Valve CC has flow rate=2; tunnels lead to valves DD, BB',
      'Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE',
      'Valve EE has flow rate=3; tunnels lead to valves FF, DD',
      'Valve FF has flow rate=0; tunnels lead to valves EE, GG',
      'Valve GG has flow rate=0; tunnels lead to valves FF, HH',
      'Valve HH has flow rate=22; tunnel leads to valve GG',
      'Valve II has flow rate=0; tunnels lead to valves AA, JJ',
      'Valve JJ has flow rate=21; tunnel leads to valve II',
    ]);
    const distances = this.mapDistances(parsed);
    const test =
      this.getBestPressureReleaseWithElephant(parsed, distances) === 1707;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private parseValves(input: string[]): Valve[] {
    const valves = [];
    for (const [i, line] of input.entries()) {
      const valve = new Valve();
      valves.push(valve);

      const split = line.split(' ');
      valve.name = split[1];
      valve.id = i;
      const flowRateSplit = split[4].split('=')[1];
      valve.flowRate = +flowRateSplit.substring(0, flowRateSplit.length - 1);
      valve.leadsTo = [];
      for (
        let neighbourIndex = 9;
        neighbourIndex < split.length;
        neighbourIndex++
      ) {
        let neighbour = split[neighbourIndex];
        if (neighbour.endsWith(',')) {
          neighbour = neighbour.substring(0, neighbour.length - 1);
        }
        valve.leadsTo.push(neighbour);
      }
    }
    return valves;
  }

  private getBestPressureRelease(valves: Valve[], distances): number {
    const routes = [];
    this.getPossibleRoutes(
      valves.filter((v) => v.flowRate > 0),
      valves.find((v) => v.name === 'AA'),
      routes,
      [],
      0,
      distances,
      30
    );
    let bestRelease = 0;
    for (const route of routes) {
      let minute = 0;
      let current = 'AA';
      let release = 0;
      while (minute < 30) {
        const next = route.shift();
        if (!next) {
          break;
        }
        const steps = distances[current][next];
        if (minute + steps >= 29) {
          break;
        }
        current = next;
        minute += steps + 1;
        const valve = valves.find((v) => v.name === current);
        release += (30 - minute) * valve.flowRate;
      }
      if (release > bestRelease) {
        bestRelease = release;
      }
    }
    return bestRelease;
  }

  private getBestPressureReleaseWithElephant(
    valves: Valve[],
    distances
  ): number {
    const bestRelease = [0, 0];
    let bestVisited = [];
    for (let i = 0; i < 2; i++) {
      const routes = [];
      this.getPossibleRoutes(
        valves.filter((v) => v.flowRate > 0 && !bestVisited.includes(v.name)),
        valves.find((v) => v.name === 'AA'),
        routes,
        [],
        0,
        distances,
        26
      );
      for (const route of routes) {
        const routeCopy = [...route];
        let release = 0;
        let minute = 0;
        let current = 'AA';
        while (minute < 26) {
          const next = route.shift();
          if (!next) {
            break;
          }
          const steps = distances[current][next];
          if (minute + steps >= 25) {
            break;
          }
          current = next;
          minute += steps + 1;
          const valve = valves.find((v) => v.name === current);
          release += (26 - minute) * valve.flowRate;
        }
        if (release > bestRelease[i]) {
          bestRelease[i] = release;
          bestVisited = routeCopy;
        }
      }
    }

    return bestRelease.reduce((a, b) => a + b);
  }

  private getPossibleRoutes(
    valves: Valve[],
    current: Valve,
    routes: string[][],
    subRoute: string[],
    minutesSpent: number,
    distances,
    maxMinutes
  ) {
    if (subRoute.length === valves.length) {
      routes.push(subRoute);
    }
    const possibleNext = valves.filter(
      (v) => v.name !== current.name && !subRoute.includes(v.name)
    );
    for (const nextValve of possibleNext) {
      const d = distances[current.name][nextValve.name];
      if (d + 1 + minutesSpent >= maxMinutes) {
        routes.push(subRoute);
      } else {
        this.getPossibleRoutes(
          valves,
          nextValve,
          routes,
          [...subRoute, nextValve.name],
          d + 1 + minutesSpent,
          distances,
          maxMinutes
        );
      }
    }
  }

  private mapDistances(valves: Valve[]) {
    const valvesWithFlowRate = valves.filter(
      (v) => v.flowRate > 0 || v.name === 'AA'
    );
    const distances = {};

    for (const valveFrom of valvesWithFlowRate) {
      distances[valveFrom.name] = {};
      for (const valveTo of valvesWithFlowRate) {
        if (valveFrom.name === valveTo.name || valveTo.name === 'AA') {
          continue;
        }
        const d = this.getDistance(valves, distances, valveFrom, valveTo);
        distances[valveFrom.name][valveTo.name] = d;
      }
    }

    return distances;
  }

  private getDistance(
    valves: Valve[],
    distances,
    from: Valve,
    to: Valve
  ): number {
    const visited = [];
    const queue = new MinQueue();
    for (const n of from.leadsTo) {
      const v = valves.find((v) => v.name === n);
      queue.push(v.id, 1);
    }
    while (queue.size > 0) {
      const currentDistance = queue.peekPriority();
      const current = queue.pop();
      const currentValve = valves.find((v) => v.id === current);
      visited.push(currentValve.name);
      if (currentValve.name === to.name) {
        return currentDistance;
      }
      const distancesFrom = distances[from.name];
      const distanceTo = distancesFrom ? distancesFrom[to.name] : undefined;
      if (distanceTo) {
        return currentDistance + distanceTo;
      }

      for (const nx of currentValve.leadsTo) {
        if (visited.includes(nx)) {
          continue;
        }

        const next = valves.find((v) => v.name === nx);
        queue.push(next.id, currentDistance + 1);
      }
    }
    return Number.MAX_VALUE;
  }
}

class Valve {
  public name: string;
  public id: number;
  public flowRate: number;
  public leadsTo: string[];
}
