import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { DeviceTokenModule } from 'src/device-token/device-token.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [PrismaModule, FirebaseModule, DeviceTokenModule, SettingsModule],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
