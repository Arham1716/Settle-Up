import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { DeviceTokenModule } from 'src/device-token/device-token.module';

@Module({
  imports: [DeviceTokenModule],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
