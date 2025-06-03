// import { DynamicModule, Global, Module, forwardRef } from '@nestjs/common';
// import { LoggerService } from './logger.service';
// import { UserService } from '../user/user.service'; // assuming you have it

// @Global()
// @Module({})
// export class LoggerModule {
//   static forRootAsync(): DynamicModule {
//     return {
//       module: LoggerModule,
//       imports: [forwardRef(() => require('../user/user.module').UserModule)],
//       providers: [
//         {
//           provide: LoggerService,
//           inject: [UserService],
//           useFactory: async (userService: UserService) => {
//             await new Promise((res) => setTimeout(res, 100));
//             return new LoggerService('DEBUG', userService);
//           },
//         },
//       ],
//       exports: [LoggerService],
//     };
//   }
// }

import { DynamicModule, Global, Module, forwardRef } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { UserModule } from '../user/user.module';
import { UserService } from 'src/user/user.service';

@Global()
@Module({})
export class LoggerModule {
  static forRootAsync(): DynamicModule {
    return {
      module: LoggerModule,
      imports: [forwardRef(() => UserModule)],
      providers: [
        {
          provide: LoggerService,
          inject: [UserService],
          useFactory: async (userService) => {
            await new Promise((res) => setTimeout(res, 50));
            return new LoggerService('DEBUG', userService);
          },
        },
      ],
      exports: [LoggerService],
    };
  }
}

