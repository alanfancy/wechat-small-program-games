Component({
  properties:{
      dlgTitle:{
        type: String,
        value:"温馨提示",
        observer: function (newVal, oldVal) { }
      },
      isClose:{
        type: Boolean,
        value:true,
        observer: function (newVal, oldVal) { }
      },
      btns: {
        type: Array, 
        value: [{ state: 0, cls: '', txt: '取消' }, { state: 1, cls: '',txt:'确定'}],
        observer: function (newVal, oldVal) { }
      },
  },
  data:{

  },
  methods:{

  }
})