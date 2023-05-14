import { AdminModule as AdminJsModule } from '@adminjs/nestjs';
import { Database, Resource } from '@adminjs/prisma';
import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DMMFClass } from '@prisma/client/runtime';
import AdminJS from 'adminjs';

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
                  actions: {
                    new: {
                      before: async (request) => {
                        const { categoryName } = request.payload;

                        if (categoryName) {
                          const category = await prisma.category.create({
                            data: { name: categoryName },
                          });
                          request.payload = {
                            ...request.payload,
                            categoryId: category.id,
                          };
                        }

                        return request;
                      },
                    },
                  },
                  properties: {
                    content: {
                      type: 'richtext', // Enable the rich text editor
                      custom: {
                        format: 'markdown', // Specify the format as Markdown
                      },
                    },
                    'category.name': {
                      isVisible: {
                        list: true,
                        filter: true,
                        show: true,
                        edit: false,
                        new: true,
                      },
                    },
                    categoryId: {
                      type: 'reference',
                      reference: 'Category',
                      isVisible: {
                        list: false,
                        filter: true,
                        show: false,
                        edit: false,
                        new: false,
                      },
                    },
                    category: {
                      type: 'reference',
                      reference: 'Category',
                      isVisible: {
                        list: false,
                        filter: false,
                        show: true,
                        edit: true,
                        new: false,
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
