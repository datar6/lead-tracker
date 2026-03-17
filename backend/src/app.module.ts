import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DrizzleModule } from './database/index.js';
import { LeadsModule } from './leads/leads.module.js';

@Module({
  imports: [DrizzleModule, LeadsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
