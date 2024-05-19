/* eslint-disable prettier/prettier */
// src/game/game.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { GameService, Player } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('join')
  joinGame(@Body() body: { playerId: string; name: string; points: number }): void {
    this.gameService.addPlayer(body.playerId, body.name, body.points);
  }

  @Post('startRound')
  startRound(): void {
    this.gameService.startRound();
  }

  @Post('guess')
  makeGuess(@Body() body: { playerId: string; guess: { points: number; multiplier: number } }): void {
    this.gameService.makeGuess(body.playerId, body.guess);
  }

  @Get('round-number')
  getRoundNumber(): string {
    return this.gameService.getCurrentTurn().toString();
  }

  @Get('players')
  getPlayers(): Player[] {
    return this.gameService.getPlayers();
  }

  @Get('currentTurn')
  getCurrentTurn(): string | null {
    return this.gameService.getCurrentTurn().toString();
  }
}
