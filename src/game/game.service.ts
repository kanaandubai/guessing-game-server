/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Player {
  id: string;
  name: string;
  points: number;
  guess?: {
    points: number;
    multiplier: number;
  };
  totalPoints: number;
}

@Injectable()
export class GameService {
  private players: Player[] = [];
  private multiplier: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  private targetMultiplier: number = this.generateRandomMultiplier();
  private speed: number = 1; // Speed of the multiplier increase  private currentTurn: number = 0;
  private currentTurn: number = 0;
  private roundResult: { name: string; multiplier: number } = { name: '', multiplier: 0 };

setRoundResult(result: { name: string; multiplier: number }): void {
  this.roundResult = result;
}


  constructor() {
    this.addAutoPlayers();
  }
  

  getSpeed(): number {
    return this.speed;
  }

  getCurrentTurn(): number {
    return this.currentTurn;
  }

  incrementTurn(): void {
    this.currentTurn++;
  }

  resetTurn(): void {
    this.currentTurn = 0;
  }

  private generateRandomMultiplier(): number {
    return Math.floor(Math.random() * 10) + 1; // Random multiplier between 1 and 10
  }

  private addAutoPlayers() {
    for (let i = 1; i <= 4; i++) {
      this.players.push({
        id: `auto-${i}`,
        name: `AutoPlayer ${i}`,
        points: 100,
        totalPoints: 0,
      });
    }
  }

  getPlayers(): Player[] {
    return this.players;
  }

  addPlayer(id: string, name: string, points: number): void {
    this.players.push({ id, name, points, totalPoints: 0 });
  }

  getMultiplierUpdates(): Observable<number> {
    return this.multiplier.asObservable();
  }

  getCurrentMultiplier(): number {
    return this.multiplier.getValue();
  }

  getTargetMultiplier(): number {
    return this.targetMultiplier;
  }

  setMultiplier(value: number): void {
    this.multiplier.next(value);
  }

  setSpeed(value: number): void {
    this.speed = value;
  }

  startRound(): void {
    this.targetMultiplier = this.generateRandomMultiplier();
    this.multiplier.next(1); // Reset multiplier to 1 at the start of each round
    this.incrementTurn(); // Increment the turn at the start of each round

    // Simulate multiplier increase based on speed
    const interval = setInterval(() => {
      let currentMultiplier = this.multiplier.getValue();
      if (currentMultiplier >= this.targetMultiplier) {
        clearInterval(interval);
        this.endRound();
      } else {
        currentMultiplier += this.speed;
        this.multiplier.next(currentMultiplier);
      }
    }, 1000 / this.speed);
  }

  makeGuess(playerId: string, guess: { points: number, multiplier: number }): void {
    const player = this.players.find(player => player.id === playerId);
    if (player) {
      player.guess = guess;
    }
  }

  private endRound(): void {
    const currentMultiplier = this.multiplier.getValue();
    this.players.forEach(player => {
      if (player.guess) {
        if (player.guess.multiplier === currentMultiplier) {
          player.points += player.guess.points * currentMultiplier;
        } else {
          player.points -= player.guess.points;
        }
        player.totalPoints += player.points;
        player.guess = undefined; // Clear guess after the round
      }
    });

    // Notify clients about the end of the round
  }

  getRanking(): Player[] {
    return this.players.sort((a, b) => b.totalPoints - a.totalPoints);
  }
}
