import { AppModule } from "@/app.module"
import { PrismaService } from "@/prisma/prisma.service"
import type { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"

describe('Create account (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] /accounts', async () => {
    const response = await request(app.getHttpServer()).post('/accounts').send({
      name: 'John Doe',
      email: 'johndoe1@exemple.com',
      password: 'pasword123'
    })

    expect(response.statusCode).toBe(201)

    const userOnDatabse = await prisma.user.findUnique({
      where: {
        email: 'johndoe1@exemple.com',
      }
    })

    expect(userOnDatabse).toBeTruthy()
  })
})