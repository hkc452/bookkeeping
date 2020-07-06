<template>
  <div class="container">
    <div class="check">
      <Form :model="formItem" :label-width="80">
        <Row>
          <Col span="8">
            <FormItem label="选择年月">
              <DatePicker
                v-model="formItem.month"
                type="month"
                placeholder="请选择月份"
                @on-change="check(1)"
              ></DatePicker>
            </FormItem>
          </Col>
          <Col span="8">
            <FormItem label="选择分类">
              <Select
                v-model="formItem.category"
                clearable
                style="width: 200px;"
                @on-change="check(1)"
              >
                <Option
                  v-for="item in categories"
                  :key="item._id"
                  :value="item._id"
                  >{{ item.name }}</Option
                >
              </Select>
            </FormItem>
          </Col>
          <Col span="8">
            <Button @click="resetCheck">重置</Button>
            <Button type="success" @click="toggleDialog">新增账单</Button>
            <Button type="primary" @click="toggleTypeDialog">新增类型</Button>
          </Col>
        </Row>
      </Form>
    </div>
    <h2 class="text-right m10">总收入:{{ income }} 总支出:{{ outcome }}</h2>
    <Table :loading="loading" :columns="columns" :data="bills"></Table>
    <div class="page clear">
      <Page
        :page-size="limit"
        show-total
        class="fr"
        :total="total"
        :current.sync="page"
        @on-change="check"
      />
    </div>
    <Modal v-model="showDialog" title="新增账单" :closable="false">
      <Form
        ref="formValidate"
        :rules="ruleValidate"
        :model="addFormItem"
        :label-width="80"
      >
        <FormItem prop="amount" label="金额">
          <Input
            v-model="addFormItem.amount"
            style="width: 200px;"
            type="number"
            placeholder="请输入账单金额..."
          />
        </FormItem>
        <FormItem prop="category" label="分类">
          <Select
            v-model="addFormItem.category"
            clearable
            style="width: 200px;"
            @on-change="changeCategory"
          >
            <Option
              v-for="item in categories"
              :key="item._id"
              :value="item._id"
              >{{ item.name }}</Option
            >
          </Select>
        </FormItem>
        <FormItem label="收支类型">
          <Select v-model="addFormItem.type" disabled style="width: 200px;">
            <Option v-for="item in types" :key="item.type" :value="item.type">{{
              item.name
            }}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer" class="m10">
        <Button @click="resetDialog">取消</Button>
        <Button type="primary" :loading="loadingDialog" @click="ok">
          确定
        </Button>
      </div>
    </Modal>
    <Modal v-model="showTypeDialog" title="新增类型" :closable="false">
      <Form
        ref="formTypeValidate"
        :rules="typeFormRules"
        :model="addTypeForm"
        :label-width="80"
      >
        <FormItem prop="name" label="名字">
          <Input
            v-model="addTypeForm.name"
            style="width: 200px;"
            placeholder="请输入类型名字..."
          />
        </FormItem>
        <FormItem prop="type" label="收支类型">
          <Select
            v-model="addTypeForm.type"
            placeholder="请选择收支类型..."
            style="width: 200px;"
          >
            <Option v-for="item in types" :key="item.type" :value="item.type">{{
              item.name
            }}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer" class="m10">
        <Button @click="resetTypeDialog">取消</Button>
        <Button type="primary" :loading="loadingTypeDialog" @click="okType">
          确定
        </Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import axios from 'axios'
import dayjs from 'dayjs'
export default {
  components: {},
  async asyncData() {
    const [{ data: bills }, { data: categories }] = await Promise.all([
      axios.get('http://127.0.0.1:7001/getBill'),
      axios.get('http://127.0.0.1:7001/getCategories'),
    ])
    let result = {}
    if (bills.code === 10000) {
      result = { ...result, ...bills.data }
    }
    if (categories.code === 10000) {
      result = { ...result, categories: categories.data.categories }
    }
    return result
  },
  data() {
    return {
      income: 0,
      outcome: 0,
      bills: [],
      page: 1,
      total: 0,
      limit: 10,
      columns: [
        {
          title: '时间',
          key: 'time',
        },
        {
          title: '金额',
          key: 'amount',
        },
        {
          title: '收支类型',
          render: (h, params) => {
            const text = params.row.type === 1 ? '收入' : '支出'
            return h('span', null, text)
          },
        },
        {
          title: '类型',
          render: (h, params) => {
            const text = this.categories.find(
              (item) => item._id === params.row.category
            )
            return h('span', null, text ? text.name : '')
          },
        },
      ],
      categories: [],
      formItem: {
        month: '',
        category: '',
      },
      loading: false,
      showDialog: false,
      addFormItem: {
        amount: 0,
        type: undefined,
        category: '',
      },
      ruleValidate: {
        category: [
          {
            trigger: 'change',
            validator: (rule, value, callback) => {
              callback(value !== '' ? undefined : new Error('分类不能为空'))
            },
          },
        ],
        amount: [
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              callback(value > 0 ? undefined : new Error('金额要大于0'))
            },
          },
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (/\d+\.\d{3,}/.test(value)) {
                callback(new Error('金额要最多两位小数点'))
              } else {
                callback()
              }
            },
          },
        ],
      },
      types: [
        { type: 0, name: '支出' },
        { type: 1, name: '收入' },
      ],
      loadingDialog: false,
      showTypeDialog: false,
      loadingTypeDialog: false,
      addTypeForm: {
        type: undefined,
        name: '',
      },
      typeFormRules: {
        type: [
          {
            type: 'number',
            required: true,
            trigger: 'change',
            message: '支出类型不能为空',
          },
        ],
        name: [
          {
            type: 'string',
            required: true,
            trigger: 'blur',
            message: '类型名字不能为空',
          },
        ],
      },
    }
  },
  methods: {
    async check(page = 1) {
      this.loading = true
      const params = {
        page,
      }
      if (this.formItem.month) {
        const selectDate = dayjs(this.formItem.month)
        params.year = selectDate.year()
        params.month = selectDate.month() + 1
      }
      if (this.formItem.category) {
        params.category = this.formItem.category
      }
      const {
        data: { code, data },
      } = await axios.get('http://127.0.0.1:7001/getBill', {
        params,
      })
      if (code === 10000) {
        this.bills = data.bills
        this.total = data.total
        this.income = data.income || 0
        this.outcome = data.outcome || 0
        this.page = page
      }
      this.loading = false
    },
    ok() {
      this.$refs.formValidate.validate(async (valid) => {
        if (valid) {
          this.loadingDialog = true
          const { data } = await axios.post('http://127.0.0.1:7001/addBill', {
            amount: this.addFormItem.amount,
            type: this.addFormItem.type,
            time: Date.now(),
            category: this.addFormItem.category,
          })
          this.resetDialog()
          if (data.code === 10000) {
            this.resetFormItem()
            this.$Message.success('添加账单成功')
            await this.check()
          } else {
            this.$Message.error(data.msg)
          }
        }
      })
    },
    resetCheck() {
      this.resetFormItem()
      this.check()
    },
    resetFormItem() {
      this.formItem = {
        month: '',
        category: '',
      }
    },
    okType() {
      this.$refs.formTypeValidate.validate(async (valid) => {
        if (valid) {
          this.loadingTypeDialog = true
          const { data } = await axios.post(
            'http://127.0.0.1:7001/addCategory',
            {
              name: this.addTypeForm.name,
              type: this.addTypeForm.type,
            }
          )
          this.resetTypeDialog()
          if (data.code === 10000) {
            this.resetFormItem()
            const {
              data: { categories },
            } = data
            this.categories = categories
            this.$Message.success('添加分类成功')
          } else {
            this.$Message.error(data.msg)
          }
        }
      })
    },
    resetTypeDialog() {
      this.$refs.formTypeValidate.resetFields()
      this.loadingTypeDialog = false
      this.showTypeDialog = false
      this.addTypeForm = {
        type: undefined,
        name: '',
      }
    },
    resetDialog() {
      this.$refs.formValidate.resetFields()
      this.loadingDialog = false
      this.showDialog = false
      this.addFormItem = {
        amount: 0,
        type: undefined,
        category: '',
      }
    },
    toggleDialog() {
      this.showDialog = true
    },
    toggleTypeDialog() {
      this.showTypeDialog = true
    },
    changeCategory(value) {
      const category = this.categories.find((item) => item._id === value)
      if (category) {
        this.addFormItem.type = category.type
      } else {
        this.addFormItem.type = undefined
      }
    },
  },
  head() {
    return {
      title: '简易记账本',
    }
  },
}
</script>

<style lang="less">
.container {
  margin: 50px 100px;
  .page {
    margin-top: 10px;
  }
}
.clear {
  overflow: hidden;
}
.fr {
  float: right;
}
.m10 {
  margin: 10px 0;
}
.text-right {
  text-align: right;
}
</style>
