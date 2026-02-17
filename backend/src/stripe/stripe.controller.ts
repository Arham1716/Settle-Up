import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('payments')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-session')
  async createSession(@Body() body: { amount: number }) {
    const session = await this.stripeService.createCheckoutSession(body.amount);
    return { sessionId: session.id };
  }
}
