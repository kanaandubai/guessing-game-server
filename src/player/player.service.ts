/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayerService {
  private players = new Map<string, { name: string, score: number }>();

  addPlayer(playerId: string, name: string, score: number = 0) {
    this.players.set(playerId, { name, score });
  }

  updateScore(playerId: string, score: number) {
    if (this.players.has(playerId)) {
      this.players.get(playerId).score = score;
    }
  }

  getPlayer(playerId: string) {
    return this.players.get(playerId);
  }

  getPlayers() {
    return Array.from(this.players.entries());
  }
}
