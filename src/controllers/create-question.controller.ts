import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/auth/current-user-decorator";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import type { UserPayload } from "@/auth/jwt.strategy";
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe";
import { PrismaService } from "@/prisma/prisma.service";
import { z } from "zod";

const createQuestionBodySchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
})

type CreateQuestionBody = z.infer<typeof createQuestionBodySchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(createQuestionBodySchema)) body: CreateQuestionBody
  ) {
    const { title, content } = body;
    const userId = user.sub

    const slug = this.convertToSlug(title);
    
    await this.prisma.question.create({
      data: {
        authorId: userId,
        title,
        content,
        slug,
      }
    })
  }

  private convertToSlug(title: string): string {
  return title
    .normalize('NFD') // separa acentos das letras
    .replace(/[\u0300-\u036f]/g, '') // remove os acentos
    .toLowerCase()
    .replace(/\s+/g, '-') // substitui espaços por hífen
    .replace(/[^\w\-]+/g, '') // remove caracteres não alfanuméricos exceto hífen
    .replace(/\-\-+/g, '-') // substitui múltiplos hífens por um só
    .replace(/^-+|-+$/g, ''); // remove hífens do início/fim
}
}