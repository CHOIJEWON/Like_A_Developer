import { AdminModule as AdminJsModule } from '@adminjs/nestjs';
import { Database, Resource } from '@adminjs/prisma';
import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DMMFClass } from '@prisma/client/runtime';
import AdminJS from 'adminjs';
import { PrismaModule } from 'src/prisma/prisma.module';

AdminJS.registerAdapter({ Database, Resource });

const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'password',
};

const authenticate = async (email: string, password: string) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

@Module({
  imports: [
    PrismaModule,
    AdminJsModule.createAdminAsync({
      useFactory: () => {
        const prisma = new PrismaClient();
        const dmmf = (prisma as any)._baseDmmf as DMMFClass;
        return {
          adminJsOptions: {
            rootPath: '/admin',
            resources: [
              {
                resource: { model: dmmf.modelMap.User, client: prisma },
                options: {},
              },
              {
                resource: { model: dmmf.modelMap.Post, client: prisma },
                options: {
                  properties: {
                    content: {
                      type: 'richtext',
                      custom: {
                        format: 'markdown',
                      },
                    },
                    category: {
                      type: 'reference',
                      reference: 'Category',
                      isVisible: {
                        new: true,
                        list: true,
                        filter: true,
                        show: true,
                        edit: true,
                      },
                    },
                  },
                },
              },
              {
                resource: { model: dmmf.modelMap.Category, client: prisma },
                options: {},
              },
            ],
          },
          auth: {
            authenticate,
            cookieName: 'adminjs',
            cookiePassword: 'secret',
          },
          sessionOptions: {
            resave: true,
            saveUninitialized: true,
            secret: 'secret',
          },
        };
      },
    }),
  ],
})
export class AdminModule {}
