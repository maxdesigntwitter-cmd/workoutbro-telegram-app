import { PrismaClient } from '@prisma/client';
import { UserLevel, MaterialCategory, SubscriptionStatus } from '../types';
import { UserStateType } from '../types';

export class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // User management
  async createOrUpdateUser(telegramId: number, userData: {
    username?: string;
    firstName?: string;
    lastName?: string;
    source?: string;
  }) {
    return await this.prisma.user.upsert({
      where: { telegramId: BigInt(telegramId) },
      update: {
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        lastSeen: new Date(),
      },
      create: {
        telegramId: BigInt(telegramId),
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        source: userData.source,
        level: UserLevel.FREE,
        lastSeen: new Date(),
      },
    });
  }

  async getUserByTelegramId(telegramId: number) {
    return await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });
  }

  async updateUserLevel(userId: number, level: string, expiresAt?: Date) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        level,
        since: new Date(),
        expiresAt,
      },
    });
  }

  async getExpiringUsers(daysBeforeExpire: number) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysBeforeExpire);

    return await this.prisma.user.findMany({
      where: {
        level: {
          in: [UserLevel.BASE, UserLevel.BRO, UserLevel.PRO],
        },
        expiresAt: {
          lte: targetDate,
        },
      },
    });
  }

  async getExpiredUsers() {
    return await this.prisma.user.findMany({
      where: {
        level: {
          in: [UserLevel.BASE, UserLevel.BRO, UserLevel.PRO],
        },
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  // Invite links
  async createInviteLink(level: string, userId?: number, expiresAt?: Date, maxUses?: number) {
    const link = await this.prisma.inviteLink.create({
      data: {
        link: this.generateInviteLink(),
        level,
        userId,
        expiresAt,
        maxUses: maxUses || 1,
      },
    });
    return link;
  }

  async useInviteLink(link: string) {
    const inviteLink = await this.prisma.inviteLink.findUnique({
      where: { link },
    });

    if (!inviteLink || inviteLink.isUsed) {
      return null;
    }

    if (inviteLink.expiresAt && inviteLink.expiresAt < new Date()) {
      return null;
    }

    if (inviteLink.maxUses && inviteLink.currentUses >= inviteLink.maxUses) {
      return null;
    }

    await this.prisma.inviteLink.update({
      where: { id: inviteLink.id },
      data: {
        currentUses: inviteLink.currentUses + 1,
        isUsed: inviteLink.maxUses ? inviteLink.currentUses + 1 >= inviteLink.maxUses : true,
      },
    });

    return inviteLink;
  }

  // Materials
  async getMaterialsByCategory(category: string, userLevel: string) {
    return await this.prisma.material.findMany({
      where: {
        category,
        level: {
          in: this.getAccessibleLevels(userLevel),
        },
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async recordMaterialAccess(userId: number, materialId: number) {
    return await this.prisma.userMaterial.upsert({
      where: {
        userId_materialId: {
          userId,
          materialId,
        },
      },
      update: {
        accessedAt: new Date(),
      },
      create: {
        userId,
        materialId,
        accessedAt: new Date(),
      },
    });
  }

  // Subscriptions
  async createSubscription(data: {
    userId: number;
    level: string;
    tributeId?: string;
    amount?: number;
    currency?: string;
    startDate: Date;
    endDate: Date;
  }) {
    return await this.prisma.subscription.create({
      data: {
        userId: data.userId,
        level: data.level,
        tributeId: data.tributeId,
        amount: data.amount,
        currency: data.currency,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'ACTIVE',
      },
    });
  }

  async updateSubscriptionStatus(tributeId: string, status: string) {
    return await this.prisma.subscription.updateMany({
      where: { tributeId },
      data: { status },
    });
  }

  // Audit logs
  async logUserAction(userId: number, action: string, level: string, metadata?: any) {
    return await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        level,
        metadata,
      },
    });
  }

  // Analytics
  async getUserAnalytics() {
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.user.count({
      where: {
        lastSeen: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    const newUsersToday = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const levelCounts = await this.prisma.user.groupBy({
      by: ['level'],
      _count: {
        level: true,
      },
    });

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      levelCounts: levelCounts.reduce((acc, item) => {
        acc[item.level as UserLevel] = item._count.level;
        return acc;
      }, {} as Record<UserLevel, number>),
    };
  }

  // Helper methods
  private generateInviteLink(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private getAccessibleLevels(userLevel: string): string[] {
    switch (userLevel) {
      case UserLevel.PRO:
        return [UserLevel.FREE, UserLevel.BASE, UserLevel.BRO, UserLevel.PRO];
      case UserLevel.BRO:
        return [UserLevel.FREE, UserLevel.BASE, UserLevel.BRO];
      case UserLevel.BASE:
        return [UserLevel.FREE, UserLevel.BASE];
      case UserLevel.FREE:
      default:
        return [UserLevel.FREE];
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export const db = new DatabaseService();
