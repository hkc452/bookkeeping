'use strict';
const Service = require('egg').Service;
const { v4: v4uuid} = require('uuid');
const dayjs = require('dayjs');
class BookKeepingService extends Service {
  // 获取账单，limit、skip 分页，
  async getBill(params = {}) {
    const LIMIT = 10;
    this.ctx.logger.info('test service getBill', params);
    const { year, month, category = '' } = params;
    const isDur = year && month;
    const options = {};
    const monthLen = dayjs(`${year}-${month}-01`).daysInMonth();
    const begin = dayjs(`${year}-${month}-01`).valueOf();
    const end = dayjs(`${year}-${month}-${monthLen}`).valueOf();
    const page = params.page || 1;
    if (isDur) {
      // 时间也是字符串
      options.time = {
        $gte: begin,
        $lte: end,
      };
    }
    if (category) {
      options.category = category;
    }
    const bills = await this.ctx.model.Bill.find(options)
      .limit(LIMIT)
      .skip((page - 1) * LIMIT)
      .sort(category ? '-amount -time' : '-time -amount');
    bills.map(bill => {
      bill.time = dayjs(+bill.time).format('YYYY-MM-DD HH:mm:ss');
      return bill;
    });
    const total = await this.ctx.model.Bill.find(options).count();

    const inOpts = {};
    inOpts.query = options;
    inOpts.map = function() {
      // 转化成数字
      emit(+this.type, +this.amount);
    };
    inOpts.reduce = function(key, vals) {
      return Array.sum(vals);
    };
    const { results = [] } = await this.ctx.model.Bill.mapReduce(inOpts);
    this.ctx.logger.info('income', results);
    return {
      bills,
      total,
      page,
      limit: LIMIT,
      ...results.reduce((res, result) => {
        if (result._id === 1) {
          res.income = result.value.toFixed(2);
        }
        if (result._id === 0) {
          res.outcome = result.value.toFixed(2);
        }
        return res;
      }, {}),
    };
  }

  async getCategories() {
    const categories = await this.ctx.model.Categories.find();
    return categories;
  }

  //   新增账单
  async addBill(params = {}) {
    this.ctx.logger.info('service addBill', params);
    await this.ctx.model.Bill.create(params);
    this.ctx.logger.info('service addBill success');
  }
  // 新增分类
  async addCategory(params = {}) {
    this.ctx.logger.info('service addCategory', params);
    await this.ctx.model.Categories.create({
      ...params,
      _id: v4uuid(),
    });
    this.ctx.logger.info('service addCategory success');
  }
  // 查找分类名
  async findCategory(name = '') {
    this.ctx.logger.info('service findCategory', name);
    const category = await this.ctx.model.Categories.findOne({ name });
    this.ctx.logger.info('service findCategory success');
    return category;
  }

  // 获取当前数据中最大时间
  async getMaxDay() {
    let timestamp = await this.ctx.model.Bill.findOne().sort('-time -amout');
    this.ctx.logger.info('getMaxDay timestamp', timestamp);
    timestamp = dayjs(Number(timestamp.time));
    timestamp = {
      days: timestamp.daysInMonth(),
      month: timestamp.month() + 1,
      year: timestamp.year(),
    };
    this.ctx.logger.info('getMaxDay', timestamp);
    return timestamp;
  }
}
module.exports = BookKeepingService;
