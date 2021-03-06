var sliderWidth = 0; // 需要设置slider的宽度，用于计算中间位置
var time = 0;
var touchDot = 0;//触摸时的原点
var touchDotH = 0;//触摸时的原点y轴
var interval = "";
var flag_hd = true;
var curAccId = 1;
var app = getApp();

Page({
  data: {
    ownList: [],
    servantList: [],
    pageHeight: 400,
    model: app.globalData.model,
    inputShowed: false, // 搜索输入框是否显示  
    inputVal: "", // 搜索的内容  
  },
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageHeight: res.windowHeight - 121,
          model: app.globalData.model
        });
      }
    });
    var servantList = getApp().globalData.servantList;
    var account = wx.getStorageSync('account');
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        curAccId = account[i].id;
      }
    }
    var item = wx.getStorageSync('srv_list' + "_" + curAccId);
    if(item == undefined || item == ""){
      item = [];
    }
    var ownList = [];
    for (var i = 0; i < servantList.length; i++) {
      if (item.indexOf(servantList[i].id) < 0) {
        //var servant_info = wx.getStorageSync('srv_' + servantList[i].id + "_" + curAccId);
        var id = servantList[i].id + "";
        var allSkillInfo = wx.getStorageSync('srvSkill' + "_" + curAccId);
        if (allSkillInfo == undefined || allSkillInfo == '') {
          allSkillInfo = new Object();
        }
        var servant_info = allSkillInfo[id];
        if (servant_info == undefined || servant_info == '') {
          servant_info = [0, 1, 1, 1];//默认灵基/技能等级
        }
        servantList[i].choose = 0;
        servantList[i].rank = servant_info[0];
        servantList[i].skill = [servant_info[1], servant_info[2], servant_info[3]];
        servantList[i].tarRank = 4;
        servantList[i].tarSkill = [10, 10, 10];
        ownList.push(servantList[i])
      }
    }
    wx.showLoading({
      title: '加载中...',
    });
    this.setData({
      servantList: ownList,
      ownList: ownList
    },wx.hideLoading());
  },
  switchServant: function () {
    var that = this;
    wx.showActionSheet({
      itemList: ['全部', '五星', '四星', '其他'],
      success: function (res) {
        if (!res.cancel) {
          var id = res.tapIndex;
          var servantList = that.data.ownList;
          var temp = [];
          var item = wx.getStorageSync('srv_list' + "_" + curAccId);
          for (var i = 0; i < servantList.length; i++) {
            servantList[i].flag = 0;
            if (item.indexOf(servantList[i].id) >= 0) {
              servantList[i].flag = 1;
            }
            var rarity = parseInt(servantList[i].rarity);
            if (id == 1 && rarity == 5) {
              temp.push(servantList[i]);
            } else if (id == 2 && rarity == 4) {
              temp.push(servantList[i]);
            } else if (id == 3 && rarity < 4) {
              temp.push(servantList[i]);
            } else if (id == 0) {
              temp.push(servantList[i]);
            }
          }
          that.setData({
            servantList: temp
          })
        }
      }
    })

  },
  addInSetting: function (e) {
    var id = e.currentTarget.dataset.index;
    var servantList = this.data.servantList;
    for (var i = 0; i < servantList.length; i++) {
      if (servantList[i].id == id) {
        servantList[i].choose = servantList[i].choose == 1 ? 0 : 1;
      }
    }
    var ownList = this.data.ownList;
    for (var i = 0; i < ownList.length; i++) {
      if (ownList[i].id == id) {
        ownList[i].choose = ownList[i].choose == 1 ? 0 : 1;
      }
    }
    this.setData({
      servantList: servantList,
      ownList: ownList
    });
  },
  confirmSetting: function (e) {
    var ownList = this.data.ownList;
    var item = wx.getStorageSync('srv_list' + "_" + curAccId);
    if (item == undefined || item == "") {
      item = [];
    }
    for (var i = 0; i < ownList.length; i++) {
      if (ownList[i].choose == 1){
        item.push(ownList[i].id);
      }
    }
    if(item.length == 0){
      wx.showToast({
        title: '请选择英灵',
        image: '/images/warning.png',
        icon: 'success'
      });
      return;
    }
    wx.setStorageSync('srv_list' + "_" + curAccId, item);
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.setData({
      flag:1
    })
    wx.navigateBack();
    wx.showModal({
      title: '关注成功',
      content: '已成功关注，可以点击英灵头像进行技能设置',
      confirmText: '我知道了',
      showCancel: false
    })
  },

  // 点击叉叉icon 清除输入内容，并加载数据  
  clearInput: function () {
    this.setData({
      inputVal: "",
      servantList: this.data.ownList
    });
  },

  // 输入内容时 把当前内容赋值给 查询的关键字，并显示搜索记录  
  inputTyping: function (e) {
    var that = this;
    var key = e.detail.value;
    var servantList = that.data.ownList;
    var temp = [];
    var item = wx.getStorageSync('srv_list' + "_" + curAccId);
    for (var i = 0; i < servantList.length; i++) {
      if (servantList[i].name.indexOf(key) >= 0) {
        temp.push(servantList[i]);
      } else if (servantList[i].sex.indexOf(key) >= 0) {
        temp.push(servantList[i]);
      }
    }
    that.setData({
      servantList: temp
    });
  },
  inputChange: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  }
  
});