import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(':year/day/:day/input')
  getInput(@Param() params) {
    return this.appService.getInput(params.year, params.day);
  }

  @Post(':year/day/:day/answer')
  postAnswer(@Body() answer, @Param() params) {
    return this.appService.sendAnswer(
      params.year,
      params.day,
      answer.level,
      answer.answer
    );
  }
}
