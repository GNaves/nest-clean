import { AppModule } from "@/app.module"
import { PrismaService } from "@/prisma/prisma.service"
import type { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { hash } from "bcryptjs"
import request from "supertest"

describe('Authenticate (e2e)', () => {
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

  test('[POST] /sessions', async () => {
    await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'johndoe1@exemple.com',
        password: await hash('pasword123', 8)
      }
    })

    const response = await request(app.getHttpServer()).post('/sessions').send({
      name: 'John Doe',
      email: 'johndoe1@exemple.com'
    })

    expect(response.statusCode).toBe(201)

    const userOnDatabse = await prisma.user.findUnique({
      where: {
        email: 'johndoe1@exemple.com',
      }
    })

    expect(userOnDatabse).toBeTruthy()
    expect(response.body).toEqual({
      access_token: expect.any(String)
    })
  })
})