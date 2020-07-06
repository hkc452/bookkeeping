'use strict';
const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }
  // 获取账单
  async getBill() {
    const { ctx } = this;
    ctx.logger.info('test ctx.request.body', ctx.request.body);
    ctx.logger.info('test ctx.request.query', ctx.request.query);
    try {
      const result = await ctx.service.bookkeeping.getBill(ctx.request.query) || [];
      ctx.body = {
        code: 10000,
        data: result,
      };
    } catch (error) {
      ctx.logger.info('getBill controller', error);
      ctx.body = {
        code: 10001,
        msg: '获取账单失败',
      };
    }
  }
  // 获取分类
  async getCategories() {
    const { ctx } = this;
    try {
      const categories = await ctx.service.bookkeeping.getCategories() || [];
      ctx.body = {
        code: 10000,
        data: {
          categories,
        },
      };
    } catch (error) {
      ctx.logger.info('getCategories controller', error);
      ctx.body = {
        code: 10001,
        msg: '获取种类失败',
      };
    }
  }
  // 添加账单
  async addBill() {
    const { ctx } = this;
    ctx.logger.info('addBill', ctx.request.body);
    try {
      await ctx.service.bookkeeping.addBill(ctx.request.body);
      ctx.body = {
        code: 10000,
      };
    } catch (error) {
      ctx.logger.info('addBill controller', error);
      ctx.body = {
        code: 10001,
        msg: '添加账单失败',
      };
    }
  }
  // 添加分类
  async addCategory() {
    const { ctx } = this;
    ctx.logger.info('addCategory', ctx.request.body);
    try {
      const { body } = ctx.request;
      const isExit = await ctx.service.bookkeeping.findCategory(body.name);
      if (isExit) throw new Error('存在重名');
      await ctx.service.bookkeeping.addCategory(body);
      // 添加完毕同时返回新的分类
      const categories = await ctx.service.bookkeeping.getCategories() || [];
      ctx.body = {
        code: 10000,
        data: {
          total: categories.length,
          categories,
        },
      };
    } catch (error) {
      ctx.logger.info('addCategory controller', error);
      ctx.body = {
        code: 10001,
        msg: '添加分类失败,存在重名或其他原因',
      };
    }
  }
}

module.exports = HomeController;
