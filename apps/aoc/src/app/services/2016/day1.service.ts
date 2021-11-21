import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs';
import { AocClientService } from '../aoc-client.service';
import { UtilService } from '../util.service';

@Injectable({
  providedIn: 'root',
})
export class Day1Service {
  constructor(
    private clientService: AocClientService,
    private utilService: UtilService
  ) {}

  solve_part_one() {
    return this.clientService.getInput(2016, 1).pipe(
      map((input) =>
        this.getBlockAwaysFromHq(this.utilService.inputToStringArray(input))
      ),
      switchMap((answer) => this.clientService.postAnswer(2016, 1, 1, answer))
    );
  }

  solve_part_two() {
    return this.clientService.getInput(2016, 1).pipe(
      map((input) =>
        this.getBlockAwaysFromHq(
          this.utilService.inputToStringArray(input),
          true
        )
      ),
      switchMap((answer) => this.clientService.postAnswer(2016, 1, 2, answer))
    );
  }

  getBlockAwaysFromHq(
    instructions: string[],
    breakAtFirstDuplicate: boolean = false
  ): number {
    const visitedLocations = new Set([JSON.stringify({ x: 0, y: 0 })]);
    const currentCoordinates: { x: number; y: number } = { x: 0, y: 0 };
    let currentDirection = 0;
    for (const instruction of instructions) {
      currentDirection += instruction[0] === 'R' ? 1 : 3;
      currentDirection = currentDirection % 4;
      const steps = Number.parseInt(instruction.slice(1));

      for (let i = 0; i < steps; i++) {
        switch (currentDirection) {
          case 0:
            currentCoordinates.y++;
            break;
          case 1:
            currentCoordinates.x++;
            break;
          case 2:
            currentCoordinates.y--;
            break;
          case 3:
            currentCoordinates.x--;
            break;
        }
        console.log(currentCoordinates);

        if (
          breakAtFirstDuplicate &&
          visitedLocations.has(
            JSON.stringify({
              x: currentCoordinates.x,
              y: currentCoordinates.y,
            })
          )
        ) {
          return (
            Math.abs(currentCoordinates.x) + Math.abs(currentCoordinates.y)
          );
        }
        visitedLocations.add(
          JSON.stringify({
            x: currentCoordinates.x,
            y: currentCoordinates.y,
          })
        );
      }
    }

    return Math.abs(currentCoordinates.x) + Math.abs(currentCoordinates.y);
  }
}
