import { AppModule } from "@/app.module"
import { PrismaService } from "@/prisma/prisma.service"
import type { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import request from "supertest"

describe('Create fetch recent questions (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /questions', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'johndoe-fetch@example.com',
        password: 'pasword123'
      }
    })

    const access_token = jwt.sign({sub: user.id})

    await prisma.question.createMany({
      data: [
        {
          title: 'Questions 01',
          slug: 'question-01',
          content: 'Questions content',
          authorId: user.id
        },
        {
          title: 'Questions 02',
          slug: 'question-02',
          content: 'Questions content',
          authorId: user.id
        },
        {
          title: 'Questions 03',
          slug: 'question-03',
          content: 'Questions content',
          authorId: user.id
        }
      ]
    })

    const response = await request(app.getHttpServer()).get('/questions').set('Authorization', `Bearer ${access_token}`).send()

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      questions: [
        expect.objectContaining({ title: 'Questions 01', }),
        expect.objectContaining({ title: 'Questions 02', }),
        expect.objectContaining({ title: 'Questions 03', })
      ]
    })
  })
})