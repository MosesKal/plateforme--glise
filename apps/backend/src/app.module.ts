import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
// Alias : notre ScheduleModule (programme de l'église) porte le même nom.
import { ScheduleModule as CronModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ExtensionsModule } from './extensions/extensions.module';
import { EventsModule } from './events/events.module';
import { GalleryModule } from './gallery/gallery.module';
import { LeadersModule } from './leaders/leaders.module';
import { ContactModule } from './contact/contact.module';
import { SermonsModule } from './sermons/sermons.module';
import { TestimoniesModule } from './testimonies/testimonies.module';
import { DepartmentsModule } from './departments/departments.module';
import { ScheduleModule } from './schedule/schedule.module';
import { UploadModule } from './upload/upload.module';
import { PagesModule } from './pages/pages.module';
import { StorageModule } from './storage/storage.module';
import { TeachingsModule } from './teachings/teachings.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CronModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ExtensionsModule,
    EventsModule,
    GalleryModule,
    LeadersModule,
    ContactModule,
    SermonsModule,
    TestimoniesModule,
    DepartmentsModule,
    ScheduleModule,
    UploadModule,
    PagesModule,
    StorageModule,
    TeachingsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
