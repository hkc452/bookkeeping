'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/getBill', controller.home.getBill);
  router.get('/getCategories', controller.home.getCategories);
  router.post('/addBill', controller.home.addBill);
  router.post('/addCategory', controller.home.addCategory);
};
