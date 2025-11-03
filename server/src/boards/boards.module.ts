import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BoardsController } from "./boards.controller";
import { BoardsService } from "./boards.service";
import { CardsController } from "./cards/cards.controller";
import { CardsService } from "./cards/cards.service";
import { Board } from "./entities/board.entity";
import { Card } from "./cards/entities/card.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Board, Card])],
  controllers: [BoardsController, CardsController],
  providers: [BoardsService, CardsService],
  exports: [BoardsService, CardsService],
})
export class BoardsModule {}

