import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { ViewModule } from './modules/view/view.module';
import { FortuneModule } from './modules/fortune/fortune.module';
import { DownloadModule } from './modules/download/download.module';

@Module({
  imports: [
    // ====== @route-section: business-modules START ======
    FortuneModule,
    DownloadModule,
    // ====== @route-section: business-modules END ======

    // ⚠️ @route-order: last
    ViewModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
