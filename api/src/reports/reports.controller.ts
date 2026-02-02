import { Controller, Get, UseGuards, Header, Res, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import type { Response } from 'express';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Dashboard accessible by both OWNER and ADMIN
  @Get('dashboard')
  getDashboard() {
    return this.reportsService.getDashboardSummary();
  }

  @Get('finance')
  getFinance(@Query() query: { startDate?: string; endDate?: string }) {
    return this.reportsService.getMonthlyFinanceSummary(
      query.startDate,
      query.endDate,
    );
  }

  @Roles(Role.OWNER)
  @Get('export')
  @Header('Content-Type', 'text/csv')
  @Header(
    'Content-Disposition',
    'attachment; filename="laporan_laundry_2026.csv"',
  )
  async export(
    @Res() res: Response,
    @Query() query: { startDate?: string; endDate?: string },
  ) {
    const csv = await this.reportsService.exportTransactions(
      query.startDate,
      query.endDate,
    );
    return res.send(csv);
  }
}
