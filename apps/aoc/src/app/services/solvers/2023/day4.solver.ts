import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Status } from '../../../models/status.model';
import { AocClientService } from '../../aoc-client.service';
import { UtilService } from '../../util.service';
import { IDaySolver } from './solver.service';

@Injectable({
  providedIn: 'root',
})
export class Day4Solver implements IDaySolver {
  constructor(
    private aocClient: AocClientService,
    private utilService: UtilService,
  ) {}

  solve_part_one(): Observable<Status> {
    return this.aocClient.getInput(2023, 4).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.scratchCards(parsedInput);
        return this.aocClient.postAnswer(2023, 4, 1, result);
      }),
    );
  }

  solve_part_two(): Observable<Status> {
    return this.aocClient.getInput(2023, 4).pipe(
      switchMap((input) => {
        const parsedInput = this.utilService.rowInputToStringArray(input);
        const result = this.realScratchCards(parsedInput);
        return this.aocClient.postAnswer(2023, 4, 2, result);
      }),
    );
  }

  test_part_one(): Observable<Status> {
    const test =
      this.scratchCards([
        'Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53',
        'Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19',
        'Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1',
        'Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83',
        'Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36',
        'Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11',
      ]) === 13;
    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  test_part_two(): Observable<Status> {
    const test =
      this.realScratchCards([
        'Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53',
        'Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19',
        'Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1',
        'Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83',
        'Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36',
        'Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11',
      ]) === 30;

    return test ? of(Status.SOLVED) : of(Status.ERROR);
  }

  private scratchCards(cards: string[]) {
    let sum = 0;
    for (const card of cards) {
      const cardSplit = card.split(': ');
      const numberSplit = cardSplit[1].split(' | ');
      const winningNumbers = numberSplit[0]
        .split(' ')
        .filter((n) => n !== '')
        .map((n) => parseInt(n));
      const numbers = numberSplit[1]
        .split(' ')
        .filter((n) => n !== '')
        .map((n) => parseInt(n));
      let cardPoints = 0;
      for (const n of numbers) {
        if (winningNumbers.includes(n)) {
          cardPoints = cardPoints === 0 ? 1 : cardPoints * 2;
        }
      }
      sum += cardPoints;
    }
    return sum;
  }

  private realScratchCards(cards: string[]) {
    const sum = new Map<number, number>();
    const originalCards = this.parseOriginalCards(cards);
    for (let i = 0; i < originalCards.length; i++) {
      const originalCard = originalCards[i];
      let numberOfCards = sum.get(i) ?? 0;
      numberOfCards++;
      sum.set(i, numberOfCards);

      let winnings = 0;
      for (const number of originalCard.numbers) {
        if (originalCard.winningNumbers.includes(number)) {
          winnings++;
        }
      }

      for (let j = 0; j < winnings; j++) {
        const cardIndex = i + j + 1;
        let sumCard = sum.get(cardIndex) ?? 0;
        sumCard += numberOfCards;
        sum.set(cardIndex, sumCard);
      }
    }
    return [...sum.values()].reduce((partialSum, a) => partialSum + a, 0);
  }

  private parseOriginalCards(cards: string[]) {
    const parsedCards = [];
    for (const card of cards) {
      const cardSplit = card.split(': ');
      const numberSplit = cardSplit[1].split(' | ');
      const winningNumbers = numberSplit[0]
        .split(' ')
        .filter((n) => n !== '')
        .map((n) => parseInt(n));
      const numbers = numberSplit[1]
        .split(' ')
        .filter((n) => n !== '')
        .map((n) => parseInt(n));
      parsedCards.push({ winningNumbers, numbers });
    }
    return parsedCards;
  }
}
