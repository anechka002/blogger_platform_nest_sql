import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { CoreModule } from './core/core.module';
import { TestingModule } from './modules/testing/testing.module';
import { configModule } from './dynamic-config-module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI!,
      // 'mongodb+srv://root:IxpPPVB4v9UahUlg@clustermongodb.98xltqo.mongodb.net/blogger_platform',
    ),
    configModule,
    UserAccountsModule,
    BloggersPlatformModule,
    TestingModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
