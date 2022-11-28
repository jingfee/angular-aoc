import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';
import Heap from 'heap';

@Injectable({
  providedIn: 'root',
})
export class Day23Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2021, 23).pipe(
      switchMap(() => {
        const pods = [
          new Amphipod(1, 4, 1, 2, false),
          new Amphipod(1, 4, 2, 2, false),
          new Amphipod(10, 6, 2, 4, false),
          new Amphipod(10, 8, 2, 4, false),
          new Amphipod(100, 2, 2, 6, false),
          new Amphipod(100, 6, 1, 6, false),
          new Amphipod(1000, 2, 1, 8, false),
          new Amphipod(1000, 8, 1, 8, false),
        ];
        const result = this.solve(pods);
        return this.aocClient.postAnswer(2021, 23, 1, result);
      })
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2021, 23).pipe(
      switchMap(() => {
        const pods = [
          new Amphipod(1, 4, 1, 2, false),
          new Amphipod(1, 4, 4, 2, false),
          new Amphipod(1, 6, 3, 2, false),
          new Amphipod(1, 8, 2, 2, false),
          new Amphipod(10, 4, 3, 4, false),
          new Amphipod(10, 6, 2, 4, false),
          new Amphipod(10, 6, 4, 4, false),
          new Amphipod(10, 8, 4, 4, false),
          new Amphipod(100, 2, 4, 6, false),
          new Amphipod(100, 4, 2, 6, false),
          new Amphipod(100, 6, 1, 6, false),
          new Amphipod(100, 8, 3, 6, false),
          new Amphipod(1000, 2, 1, 8, false),
          new Amphipod(1000, 2, 2, 8, false),
          new Amphipod(1000, 2, 3, 8, false),
          new Amphipod(1000, 8, 1, 8, false),
        ];
        const result = this.solveB(pods);
        return this.aocClient.postAnswer(2021, 23, 2, result);
      })
    );
  }

  test_part_one(): Observable<Status> {
    const pods = [
      new Amphipod(1, 2, 2, 2, true),
      new Amphipod(1, 8, 2, 2, false),
      new Amphipod(10, 2, 1, 4, false),
      new Amphipod(10, 6, 1, 4, false),
      new Amphipod(100, 4, 1, 6, false),
      new Amphipod(100, 6, 2, 6, true),
      new Amphipod(1000, 4, 2, 8, false),
      new Amphipod(1000, 8, 1, 8, false),
    ];
    const test = this.solve(pods) === 12521;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const pods = [
      new Amphipod(1, 2, 4, 2, true),
      new Amphipod(1, 6, 3, 2, false),
      new Amphipod(1, 8, 2, 2, false),
      new Amphipod(1, 8, 4, 2, false),
      new Amphipod(10, 2, 1, 4, false),
      new Amphipod(10, 4, 3, 4, false),
      new Amphipod(10, 6, 1, 4, false),
      new Amphipod(10, 6, 2, 4, false),
      new Amphipod(100, 4, 1, 6, false),
      new Amphipod(100, 4, 2, 6, false),
      new Amphipod(100, 6, 4, 6, true),
      new Amphipod(100, 8, 3, 6, false),
      new Amphipod(1000, 2, 2, 8, false),
      new Amphipod(1000, 2, 3, 8, false),
      new Amphipod(1000, 4, 4, 8, false),
      new Amphipod(1000, 8, 1, 8, false),
    ];
    const test = this.solveB(pods) === 44169;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private solve(pods: Amphipod[]): number {
    const distance = [];
    const queue = new Heap(function (a, b) {
      return a.alt - b.alt;
    });
    distance[this.getIndex(pods)] = 0;
    queue.push({ item: pods, alt: 0 });

    while (queue.size() > 0) {
      const queue_pods = queue.pop().item;
      const minDistance =
        distance[this.getIndex(queue_pods)] ?? Number.MAX_VALUE;

      for (const possibleMove of this.getPossibleMoves(queue_pods)) {
        const alt = minDistance + possibleMove[1];
        const neighBourDistance =
          distance[this.getIndex(possibleMove[0])] ?? Number.MAX_VALUE;
        if (alt < neighBourDistance) {
          distance[this.getIndex(possibleMove[0])] = alt;
          queue.push({ item: possibleMove[0], alt });
        }
      }
    }
    return distance[43229040];
  }

  private solveB(pods: Amphipod[]): number {
    const distance = [];
    const queue = new Heap(function (a, b) {
      return a.alt - b.alt;
    });
    distance[this.getIndexLarge(pods)] = 0;
    queue.push({ item: pods, alt: 0 });

    while (queue.size() > 0) {
      const queue_pods = queue.pop().item;
      const minDistance =
        distance[this.getIndexLarge(queue_pods)] ?? Number.MAX_VALUE;

      for (const possibleMove of this.getPossibleMoves(queue_pods)) {
        const alt = minDistance + possibleMove[1];
        const neighBourDistance =
          distance[this.getIndexLarge(possibleMove[0])] ?? Number.MAX_VALUE;
        if (alt < neighBourDistance) {
          distance[this.getIndexLarge(possibleMove[0])] = alt;
          queue.push({ item: possibleMove[0], alt });
        }
      }
    }
    return distance[9190573701264480];
  }

  private getPossibleMoves(pods: Amphipod[]): [Amphipod[], number][] {
    const states = [];

    for (const [index, pod] of pods.entries()) {
      if (pod.isComplete) {
        continue;
      }
      for (let destination = 0; destination < 11; destination++) {
        const newPod = pod.canGoTo(
          destination,
          pods.filter((v, i) => i !== index)
        );
        if (newPod) {
          const newPods = [...pods];
          newPods[index] = newPod[0];
          states.push([newPods, newPod[1]]);
        }
      }
    }

    return states;
  }

  private getIndex(pods: Amphipod[]) {
    return (
      this.getPositionIndex([pods[0], pods[1]]) * Math.pow(121, 3) +
      this.getPositionIndex([pods[2], pods[3]]) * Math.pow(121, 2) +
      this.getPositionIndex([pods[4], pods[5]]) * 121 +
      this.getPositionIndex([pods[6], pods[7]])
    );
  }

  private getIndexLarge(pods: Amphipod[]) {
    return (
      this.getPositionIndex([pods[0], pods[1], pods[2], pods[3]]) *
        Math.pow(14641, 3) +
      this.getPositionIndex([pods[4], pods[5], pods[6], pods[7]]) *
        Math.pow(14641, 2) +
      this.getPositionIndex([pods[8], pods[9], pods[10], pods[11]]) * 14641 +
      this.getPositionIndex([pods[12], pods[13], pods[14], pods[15]])
    );
  }

  private getPositionIndex(pods: Amphipod[]) {
    pods.sort((a, b) => (a.position > b.position ? 1 : -1));
    let i = 0;
    for (const [index, pod] of pods.entries()) {
      i += pod.position * Math.pow(11, pods.length - index - 1);
    }
    return i;
  }
}

class Amphipod {
  energy: number;
  // hallway: 0 1 3 5 7 9 10
  // rooms: 2 4 6 8
  position: number;
  roomPosition: number;
  target: number;
  maxRoomPosition = 4; //change to 2 for part A
  isComplete: boolean;

  constructor(
    energy: number,
    position: number,
    roomPosition: number,
    target: number,
    isComplete: boolean
  ) {
    this.energy = energy;
    this.position = position;
    this.roomPosition = roomPosition;
    this.target = target;
    this.isComplete = isComplete;
  }

  isInRoom(position?: number) {
    return position !== undefined
      ? [2, 4, 6, 8].includes(position)
      : this.roomPosition > 0;
  }

  canGoTo(destination: number, otherPods: Amphipod[]): [Amphipod, number] {
    //if isinroom
    //destination is hallway || target
    //target is not occupied
    //no amphipods in way

    //if isinhallway
    //destination is target
    //target is not occupied
    //no amphipods in way

    const isPositionRoom = this.isInRoom();
    const isDestinationRoom = this.isInRoom(destination);

    if (
      this.position === destination ||
      (isPositionRoom && isDestinationRoom && destination !== this.target) ||
      (!isPositionRoom && destination !== this.target) ||
      (destination === this.target &&
        otherPods.filter((op) => op.position === destination).length >
          this.maxRoomPosition - 1) ||
      (isPositionRoom &&
        this.maxRoomPosition - this.roomPosition <
          otherPods.filter((op) => op.position === this.position).length)
    ) {
      return undefined;
    }

    const steps = Array.from(
      { length: Math.abs(this.position - destination) + 1 },
      (_, i) => i + Math.min(this.position, destination)
    );

    if (
      steps
        .filter((s) => !this.isInRoom(s))
        .some((s) => otherPods.map((op) => op.position).includes(s))
    ) {
      return undefined;
    } else {
      const otherPodsInRoom = otherPods.filter(
        (op) => op.position === destination
      );
      if (
        otherPodsInRoom.length > 0 &&
        otherPodsInRoom.some((op) => !op.isComplete)
      ) {
        return undefined;
      }

      const otherPodsInRoomLength = isDestinationRoom
        ? otherPodsInRoom.length
        : this.maxRoomPosition;
      const newRoomPosition = this.maxRoomPosition - otherPodsInRoomLength;
      const numberOfSteps =
        steps.length + this.roomPosition - 1 + newRoomPosition;
      const newPod = new Amphipod(
        this.energy,
        destination,
        newRoomPosition,
        this.target,
        destination === this.target
      );
      return [newPod, numberOfSteps * this.energy];
    }
  }
}
