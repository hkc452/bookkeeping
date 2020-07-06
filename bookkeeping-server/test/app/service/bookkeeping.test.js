'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const dayjs = require('dayjs');
describe('get()', () => {
  it('返回指定月份的账单', async () => {
    // 创建 ctx
    const ctx = app.mockContext();
    const day = await ctx.service.bookkeeping.getMaxDay();
    assert(day);
  });
});
