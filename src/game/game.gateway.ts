// src/game/game.gateway.ts
/* eslint-disable prettier/prettier */
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {
    this.gameService.getMultiplierUpdates().subscribe(multiplier => {
      if (this.server) {
        this.server.emit('multiplier', multiplier);
      }
    });
  }

  afterInit(server: Server) {
    console.log('Initialized');
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { playerId: string; name: string; points: number }): void {
    this.gameService.addPlayer(data.playerId, data.name, data.points);
    this.server.emit('players', this.gameService.getPlayers());
  }
  @SubscribeMessage('roundResult')
  handleRoundResult(@MessageBody() result: { name: string; multiplier: number }): void {
    this.gameService.setRoundResult(result);
  }
  
  @SubscribeMessage('guess')
  handleGuess(@MessageBody() data: { playerId: string; guess: { points: number; multiplier: number } }): void {
    this.gameService.makeGuess(data.playerId, data.guess);
    this.server.emit('players', this.gameService.getPlayers());
  }

  @SubscribeMessage('chat')
  handleChat(@MessageBody() data: { playerId: string; message: string }): void {
    const player = this.gameService.getPlayers().find(p => p.id === data.playerId);
    if (player) {
      this.server.emit('chat', { player: player.name, message: data.message });
    }
  }

  @SubscribeMessage('setSpeed')
  handleSetSpeed(@MessageBody() data: { speed: number }): void {
    this.gameService.setSpeed(data.speed);
  }

  @SubscribeMessage('startRound')
  handleStartRound(): void {
    this.gameService.startRound();
    this.emitMultiplierUpdates();
  }

  private emitMultiplierUpdates() {
    const interval = setInterval(() => {
      const multiplier = this.gameService.getCurrentMultiplier();
      this.server.emit('multiplier', multiplier);

      if (multiplier >= this.gameService.getTargetMultiplier()) {
        clearInterval(interval);
      }
    }, 1000 / this.gameService.getSpeed());
  }
}
