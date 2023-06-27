// index.ts
// 获取应用实例
const app = getApp<IAppOption>()

import { TFT, CAREER, KIND} from './Tft'
import {NUM} from './Num'

var kindToKey = {
  0: 'cost',
  1: 'kind',
  2: 'career'
}

const COLOR = {
  1:'#bbbbbbe0',
  2:'#14cc73e0',
  3:'#54c3ffe0',
  4:'#de0ebde0',
  5:'#ffc430e0',
}

var allKind = {
  0: [
    1,2,3,4,5   
  ],
  1: KIND,
  2: CAREER,
}

const MAX_AMOUT = 28
const MOVE_SPEED = 1.8


Page({
  data: {
    currentTab: 0,
    currentKind: 0,
    imgList : [],
    taskList: [],
    attrList: [],
    amount: 0,
    showpage: false,
    checked: false,
    currentClickImgName: "",
    myPosTb:{},
    currentCareerList:[],
    currentDescList:[],
    clickId:0,
    heroDescList:[],
    NUM:NUM,
    longPressId: -1,
    pre_x:0,
    pre_y:0,
    
  },
  onLoad() {
    this.initData()
    this.doChooseKind(0)
    
    
  },
  initData(){
    let tempPosTb = {}
    for(let i=0;i<MAX_AMOUT;i++){
      tempPosTb[i] = {}
    }
    this.setData({
      myPosTb:tempPosTb,
    })
  },
  onShareAppMessage(){
    const promise = new Promise(resolve => {
      setTimeout(() => {
        resolve({
          title: '云顶之弈阵容推荐'
        })
      }, 2000)
    })
    return {
      title: '云顶之弈阵容推荐',
      path: '/page/user?id=123',
      promise 
    }
  },
  kindClick(e){
    let currentKind = Number(e.currentTarget.id)
    this.doChooseKind(currentKind)
  },

  doChooseKind(currentKind:number){
    let tempTaskList = allKind[currentKind]
    this.setData({
      currentKind : currentKind,
      taskList:tempTaskList,
    })
    this.doChooseHandle(0,allKind[currentKind][0])
  },

  handleClick(e) {
    let currentTab = e.currentTarget.dataset.index
    this.doChooseHandle(currentTab, e.currentTarget.id)
  },

  doChooseHandle(currentTab:any, handle:any){
    var tempList = []
    var key = kindToKey[this.data.currentKind]
    for (let i in TFT){
      TFT[i].color = COLOR[TFT[i].cost]
      if (key=='cost'){
        if(TFT[i][key] == handle){
          tempList.push(TFT[i])
        }
      }
      else {
        if(TFT[i][key].indexOf(handle) != -1){
          tempList.push(TFT[i])
        }
      }
    } 
    tempList = tempList.sort((n1,n2)=>n1.cost - n2.cost)
    let currentDescList = []
    let currentCareerList = []
    if (key!='cost'){
      let tempDescList = NUM[handle].NumDesc
      for(let i=0;i<Object.keys(tempDescList).length;i++){
        currentDescList.push(tempDescList[i])
      }
     
      currentCareerList = NUM[handle].desc.split("#n")
    }
    this.setData({
      currentTab:currentTab,
      currentCareerList: currentCareerList,
      currentDescList:currentDescList,
      imgList:tempList,  
    })
  },

  imgClick(e){
    var heroId = e.currentTarget.id
    var tempAmount = this.data.amount
    if (tempAmount >= MAX_AMOUT){
      return
    }
    tempAmount += 1
    this.setData({
      amount:tempAmount,
    })
    this.refreshPos(this.data.imgList[heroId])
    this.refreshFetters()
  },
  refreshPos(info:any){
    let tempPosTb = this.data.myPosTb
    for (let i = 0;i < MAX_AMOUT; i++){
      if (Object.keys(tempPosTb[i]).length == 0){
        tempPosTb[i] = Object.assign({},info)
        break
      }
    }
    this.setData({
      myPosTb:tempPosTb,
    })
  },

  refreshFetters(){ //显示羁绊
    let tempTb = {}
    for (let key in this.data.myPosTb){
      if (Object.keys(this.data.myPosTb[key]).length != 0 && !(this.data.myPosTb[key].name in tempTb)){
        tempTb[this.data.myPosTb[key].name] = this.data.myPosTb[key]
      }
    }
    var attrTb = {}
    for(let key in tempTb){
      var careerList = tempTb[key].career
      var kindList = tempTb[key].kind
      var allList = careerList.concat(kindList)
      for(var j=0;j<allList.length;j++){
        if (allList[j] != ""){
          if (!(allList[j] in attrTb)){
            attrTb[allList[j]] = 0
          }
          attrTb[allList[j]] += 1 
        }     
      }
    }
    var tempAttrList = []
    for(var item in attrTb){
      var dic = {
        name:item,
        count:attrTb[item],
        hasAchieve:false,
        maxcount:0
      }
      var tempDescList = []
      if (item in NUM){
        tempDescList = NUM[item].NumDesc
      }
      
      for(var i=0;i<Object.keys(tempDescList).length;i++){
        if (i == 0){
          if (dic.count < tempDescList[i].num){
            dic.maxcount = tempDescList[i].num
          }
        }
        if(dic.count>=tempDescList[i].num){
          dic.maxcount=tempDescList[i].num
          if (!dic.hasAchieve){
            dic.hasAchieve = true
          }
          
        }
      }
      tempAttrList.push(dic)
      
    }

    this.setData({
      attrList: tempAttrList,
    })
  },

  resetClick(e){
    this.setData({
      attrList:[],
      amount: 0,
    })
    this.initData()
  },
  
  heroClick(e){
    let id = e.currentTarget.id
    let tempHero = this.data.myPosTb[id]
    if (Object.keys(tempHero).length != 0){
      let heroDescList = tempHero.skillDesc.split("#n")
      this.setData({
        showpage:true,
        clickId:id,
        heroDescList:heroDescList,
      })
    }
    
  },

  

  heroTouchStart(e){
    let id = e.currentTarget.id
    this.setData({
      longPressId:Number(id),
      pre_x:e.changedTouches[0].clientX,
      pre_y:e.changedTouches[0].clientY,
    })
  },

  heroTouchMove(e){
    let x = (e.changedTouches[0].clientX - this.data.pre_x)*MOVE_SPEED
    let y = (e.changedTouches[0].clientY - this.data.pre_y)*MOVE_SPEED
    let tempTb = this.data.myPosTb
    tempTb[this.data.longPressId].flow_x = x
    tempTb[this.data.longPressId].flow_y = y 
 
    this.setData({
      myPosTb:tempTb 
    })
  },

  heroTouchEnd(e){
    let x = (e.changedTouches[0].clientX - this.data.pre_x)*MOVE_SPEED
    let y = (e.changedTouches[0].clientY - this.data.pre_y)*MOVE_SPEED
    let id = this.data.longPressId
   
    let offSetY = Math.round(y / 75)
    // 处理边缘
     //上
     if ((id>=0 && id < 7 && offSetY == -1)|| Math.floor(id/7)+offSetY == -1){
      offSetY = Math.ceil(y / 75)
    }
    //下
    if ((id>=21 && id < 28 && offSetY == 1)|| Math.floor(id/7)+offSetY == 4){
      offSetY = Math.floor(y / 75)
    }
    
    //处理偏移
    if (Math.abs(offSetY) == 1 || Math.abs(offSetY) == 3){
      if (offSetY > 0){
        if ((id >= 0 && id < 7) || (id >=14 && id < 21)){
          x -= 45
        }
        else if (id >=7 && id < 14 && offSetY == 1){
          x += 45
        }
      }
      else{
        if ((id >= 7 && id < 14) || (id >=21 && id < 28)){
          x += 45
        }
        else if (id >= 14 && id < 21 && offSetY == -1){
          x -= 45
        }
      }
    }
    let offSetX = Math.round(x / 90)
    // 处理边缘
    //左
    if ((id%7 == 0 && offSetX == -1) ||(id + offSetX) == -1 ){
      offSetX = Math.ceil(x / 90)
    }
    //右
    if (((id+1)%7 == 0 && offSetX == 1)|| (id + offSetX) == 7){
      offSetX = Math.floor(x / 90)
    }
   
    
    let offSet = offSetX + offSetY * 7
    let tempTb = this.data.myPosTb
    delete tempTb[this.data.longPressId].flow_x
    delete tempTb[this.data.longPressId].flow_y
    let tempId = offSet + id
    if (tempId>=0 && tempId<MAX_AMOUT && (id%7 + offSetX >=0 && id%7 + offSetX < 7)&& (Math.floor(id/7)+offSetY >=0 && Math.floor(id/7)+offSetY < 4)){
      let tempInfo = tempTb[id]
      tempTb[id] = tempTb[id + offSet]
      tempTb[id + offSet] = tempInfo
      this.setData({
        longPressId:-1,
        myPosTb:tempTb,
        pre_x:0,
        pre_y:0,
      })
    }
    else{
      tempTb[id] = {}
      let amount = this.data.amount -1
      this.setData({
        longPressId:-1,
        myPosTb:tempTb,
        pre_x:0,
        pre_y:0,
        amount:amount,
      })
      this.refreshFetters()
    }
    
    
  },
  catchTouchMove(){
    //避免穿透
  },

  deleteHero(){
    var id = this.data.clickId
    let tempTb = this.data.myPosTb
    tempTb[id] = {}
    var tempAmount = this.data.amount
    tempAmount -= 1
    this.setData({
      amount:tempAmount,
      myPosTb:tempTb,
      showpage:false,
    })
    this.refreshFetters()

  },
  backMain(){
    this.setData({
      showpage:false,
    })
  }
  
})
