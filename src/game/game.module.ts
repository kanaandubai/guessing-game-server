/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [PlayerModule],
  providers: [GameService, GameGateway],
  controllers: [GameController]
})
export class GameModule {}
