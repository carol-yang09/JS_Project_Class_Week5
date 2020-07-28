// 匯入 vee-validate 語系檔案
import zh_TW from './zh_TW.js';

// 把語系檔案 加入至 vee-validate 的設定檔案
VeeValidate.localize('tw', zh_TW)

// 自定義 vee-validate 錯誤 className
VeeValidate.configure({
  classes: {
    valid: 'is-valid',
    invalid: 'is-invalid',
  }
});

// $、千分位，過濾器
Vue.filter('currency', (num) => {
  const n = Number(num);
  const part = n.toString().replace(/(\d{1,3})(?=(\d{3})+$)/g, '$1,');
  return `$ ${part}`;
});

// loading 元件
Vue.component('loading', VueLoading);

// vee-validate input 驗證
Vue.component('ValidationProvider', VeeValidate.ValidationProvider);

// vee-validate form 驗證
Vue.component('ValidationObserver', VeeValidate.ValidationObserver);

// pagination 元件
Vue.component('pagination', {
  template: '#pagination',
  props: ['pages'],
  methods: {
    changePage(page) {
      this.$emit('get-products', page);
    },
  },
});

new Vue({
  el: '#app',
  data: {
    // loading 效果
    isLoading: false,
    products: [],
    pagination: {},
    carts: {},
    cartTotal: 0,
    form: {
      name: '',
      email: '',
      tel: '',
      address: '',
      payment: '',
      message: '',
    },
    uuid: '7e04c7a2-2bef-47b1-8b3a-5ab4c09e67b3',
  },
  methods: {
    // 取得所有商品
    getProducts(page = 1) {
      const vm = this;
      const apiUrl = `https://course-ec-api.hexschool.io/api/${vm.uuid}/ec/products?page=${page}`;
      vm.isLoading = true;
      axios.get(apiUrl).then((res) => {
        vm.products = res.data.data;
        vm.pagination = res.data.meta.pagination;
        vm.isLoading = false;
      });
    },
    // 取得購物車列表
    getCart() {
      const vm = this;
      const apiUrl = `https://course-ec-api.hexschool.io/api/${vm.uuid}/ec/shopping`;
      vm.isLoading = true;
      axios.get(apiUrl).then((res) => {
        vm.carts = res.data.data;
        let total = 0;
        vm.carts.forEach((item) => {
          total += Number(item.product.price * item.quantity);
        });
        vm.cartTotal = total;
        vm.isLoading = false;
      }).catch((error) => {
        console.log('錯誤', error.response.data.errors);
        vm.isLoading = false;
      });
    },
    // 加入購物車
    addToCart(id, quantity = 1) {
      const vm = this;
      const apiUrl = `https://course-ec-api.hexschool.io/api/${vm.uuid}/ec/shopping`;
      const cart = {
        product: id,
        quantity,
      };
      vm.isLoading = true;
      axios.post(apiUrl, cart).then(() => {
        vm.getCart();
      }).catch((error) => {
        console.log('錯誤', error.response.data.errors);
        vm.isLoading = false;
      });
    },
    // 修改商品購買數量
    updateQuantity(id, quantity) {
      const vm = this;
      const apiUrl = `https://course-ec-api.hexschool.io/api/${vm.uuid}/ec/shopping`;
      // 數量需大於 0
      if (quantity <= 0) { return };
      const cart = {
        product: id,
        quantity,
      };
      vm.isLoading = true;
      axios.patch(apiUrl, cart).then(() => {
        vm.getCart();
      }).catch((error) => {
        console.log('錯誤', error.response.data.errors);
        vm.isLoading = false;
      });
    },
    // 刪除購物車單一商品
    removeCartItem(id) {
      const vm = this;
      const apiUrl = `https://course-ec-api.hexschool.io/api/${vm.uuid}/ec/shopping/${id}`;
      vm.isLoading = true;
      axios.delete(apiUrl, {product: id}).then(() => {
        vm.getCart();
      }).catch((error) => {
        console.log('錯誤', error.response.data.errors);
        vm.isLoading = false;
      });
    },
    // 刪除全部購物車商品
    removeAllCart() {
      const vm = this;
      const apiUrl = `https://course-ec-api.hexschool.io/api/${vm.uuid}/ec/shopping/all/product`;
      vm.isLoading = true;
      axios.delete(apiUrl).then(() => {
        vm.getCart();
      }).catch((error) => {
        console.log('錯誤', error.response.data.errors);
        vm.isLoading = false;
      });
    },
    // 建立訂單
    craeteOrder() {
      const vm = this;
      const apiUrl = `https://course-ec-api.hexschool.io/api/${vm.uuid}/ec/orders`;
      vm.isLoading = true;
      axios.post(apiUrl, vm.form).then(() => {
        $('#modal').modal('show');
        vm.isLoading = false;
        vm.getCart();
      }).catch((error) => {
        console.log('錯誤', error.response.data.errors);
        vm.isLoading = false;
      });
    },
  },
  created() {
    this.getProducts();
    this.getCart();
  },
});