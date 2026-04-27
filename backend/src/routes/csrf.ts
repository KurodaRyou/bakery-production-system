import { Route, Get, Controller, Request } from '@tsoa/runtime';
import express from 'express';
import { createCsrfToken } from '../middleware/csrf';

@Route('csrf-token')
export class CsrfController extends Controller {
  @Get()
  public async getCsrfToken(
    @Request() req: express.Request,
  ): Promise<{ csrfToken: string }> {
    const res = req.res!;
    const token = createCsrfToken(req, res);
    return { csrfToken: token };
  }
}