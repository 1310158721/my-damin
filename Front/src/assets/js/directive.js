import Vue from 'vue';
import store from '@/store';
import { Message } from 'element-ui';

Vue.directive('permission', {
  // 当绑定该指令的元素插入到 DOM 中时，第一个参数为绑定的 DOM 元素
  inserted (el, binding) {
    const { value } = binding;
    const { permission } = store.state.userInfo;
    if (permission.includes(value)) {
      return false;
    } else {
      el.style.display = 'none';
      return true;
    }
  }
});

Vue.prototype.$hasPermission = function (checkPermission) {
  const checkPermissionArr = checkPermission.replace(/ /g, '').split(',');
  const { permission } = store.state.userInfo;
  let canShow = false;
  checkPermissionArr.map((i) => {
    if (permission.includes(i)) {
      canShow = true;
    }
  });
  return canShow;
}

Vue.directive('clipboard', {
  inserted (el, binding) {
    el.style.cursor = 'pointer';
    // 兼容外部元素点击事件，在点击事件后执行（可以通过外部元素设置属性来获取数据）
    el.onclick = () => {
      const { value } = binding;
      if (!value && !el.getAttribute('data-clipboard')) {
        Message.error('复制内容不能为空');
        return false;
      }
      
      // 指令有传值则取该值，没有则取指令绑定元素的 clipboard-data 属性值
      const clipBoardData = value || el.getAttribute('data-clipboard');
      const inputDom = document.createElement('input');
      inputDom.value = clipBoardData;
      document.body.appendChild(inputDom);
      inputDom.select();
      document.execCommand('Copy');
      Message.success('复制成功');
      inputDom.remove();
    }
  }
});
