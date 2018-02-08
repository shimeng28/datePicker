(function(global, factory){
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.DatePicker = factory())
}(window, function() {
  const util = {
    classSuffix: (function() {
      let seq = 1001010100;

      return {
        get: function() {
          return seq++;
        },
        set: function(newSeq) {
          seq = newSeq;
        },
      };
    })(),
    getTime: function() {
      return parseInt(new Date().getTime(), 10);
    },
    isLeapYear: function(year) {
      return ((year % 100) && !(year % 4)) || (!(year % 100) && !(year % 400));
    },
    getTopPos: function(ele) {
      return ele.getBoundingClientRect().top;
    },
    getCell: function(index) {
      const cells = ['年', '月', '日'];
      return cells[index];
    },
    renderYearList: function(begin, end) {
      end = end || begin + 100;
      let result = '';
      for (let i = begin; i < end + 1; i++) {
        result += '<div>'+ i + '</div>'
      }
      return result;
    },
    renderMonthList: function() {
      let result = '';
      for (let i = 1; i < 13; i++){
        result +='<div>' + i + '</div>'
      }
      return result;
    },
    renderDayList: function() {
      let result = '';
      for (let i = 1; i < 32; i++) {
        result += '<div>' + i + '</div>'
      }
      return result;
    },
    defaultConfig: function() {
      let date = new Date();
      date = new Date([date.getFullYear(), date.getMonth() + 1, date.getDate()]);
      return {
        currDate: date,
        minDate: date,
        title: '选择时间',
        container: 'body',
        onConfirm: () => {},
        onCancel: () => {},
      };
    },
    browserVendor: function(ele, styleStr, value) {
      const vendors = ['t', 'WebkitT', 'MozT', 'msT', 'OT'];
      let styleKey;

      const eleStyle = ele.style;
      vendors.forEach((prefix) => {
        styleKey = prefix + styleStr.substr(1);
        eleStyle[styleKey] = value;
      });
    },
  }

  /**
   * scroller构造函数
   * @param {string} id
   * @param {Object} params
   */
  function Scroller(id, params) {
    this.scroller = document.querySelector(id);
    this.childNode = this.scroller.childNodes[0];
    this.options = {
      step: true,
      defaultPlace: 0,
      callback: () => {},
    };
    this.options = Object.assign(this.options, params);

    this.startPageY = 0;
    this.startTime = 0;
    this.endTime = 0;
    this.offsetTop = 0;

    // 上一个滚动被选中的元素
    this.lastChoseEle = null;
    this.scrollerHeight = this.scroller.clientHeight;
    this.childNodeHeight = this.childNode.clientHeight;
    this.scrollHeight = this.childNodeHeight - this.scrollerHeight;

    const childNodes = this.childNode.childNodes;
    this.stepLen = childNodes.length > 0 ? childNodes[0].clientHeight : 0;

    let defaultPlace = this.options.defaultPlace ? this.options.defaultPlace : 0;

    // 如果是步长模式，则默认显示第一次选中的元素
    if (this.stepLen) {
      // 3是因为多加了3个div作为填充
      const index = Math.floor(defaultPlace / this.stepLen);
      // 重新计算默认滚动位置
      defaultPlace = index * this.stepLen;
      const defaultEle = this.childNode.childNodes[index + 3];
      defaultEle.classList.add('choseEle');
      this.lastChoseEle = defaultEle;
    }


    this.scrollTo(0, defaultPlace);

    this._start();
    this._move();
    this._end();
  }

  Scroller.prototype = {
    _start: function() {
      const self = this;
      this.scroller.addEventListener('touchstart', function(e) {
        e.stopPropagation();
        e.preventDefault();

        self.startTime = util.getTime();
        const touches = e.touches ? e.touches[0] : e;
        self.startPageY = touches.pageY;

        util.browserVendor(self.childNode, 'transition', 'none');
      }, false);
    },
    _move: function() {
      const self = this;
      this.scroller.addEventListener('touchmove', function(e) {
        e.stopPropagation();
        e.preventDefault();

        const timeStamp = util.getTime();
        const touches = e.touches ? e.touches[0] : e;
        // 小于0 往上滚动 大于0 往下滚动
        const diffPageY = touches.pageY - self.startPageY;

        let movePageY = diffPageY + self.offsetTop;
        // 距离小于10px不滚动
        if (timeStamp - self.endTime > 300 && Math.abs(diffPageY) < 10) {
          return;
        }

        if (movePageY > 0) {
          movePageY /= 3;
        } else if (Math.abs(movePageY) > Math.abs(self.scrollHegiht)) {
          movePageY = Math.abs(self.scrollHegiht) - Math.abs(movePageY);
          movePageY = movePageY / 3 - self.scrollHeight;
        }
        util.browserVendor(self.childNode, 'transform', 'translate(0, ' + movePageY + 'px)');

      }, false);
    },
    _end: function() {
      const self = this;
      this.scroller.addEventListener('touchend', function(e) {
        e.stopPropagation();
        e.preventDefault();
        self.endTime = util.getTime();
        const duration = self.endTime - self.startTime;

        const touches = e.changedTouches ? e.changedTouches[0] : e;
        // 本次滚动的偏移位置
        const offsetHeight = touches.pageY - self.startPageY;
        // 总偏移位置
        self.offsetTop += offsetHeight;
        if ((self.offsetTop > 0) || Math.abs(self.offsetTop) > Math.abs(self.scrollHeight)) {
          util.browserVendor(self.childNode, 'transition', 'all 500ms');
        } else if (duration < 300) {
          const speed = Math.abs(offsetHeight) / duration;
          let moveTime = duration * speed * 20;
          moveTime = moveTime > 2000 ? 2000 : moveTime;

          self.offsetTop += offsetHeight * speed * 10;

          util.browserVendor(self.childNode, 'transitionProperty', 'all');
          util.browserVendor(self.childNode, 'transitionDuration', moveTime + 'ms');
          util.browserVendor(self.childNode, 'transitionTimingFunction', 'cubic-bezier(0.1, 0.57. 0.1, 1)');
        } else {
          util.browserVendor(self.childNode, 'transition', 'all 500ms');
        }

        if (self.offsetTop > 0) {
          self.offsetTop = 0;
        } else if( Math.abs(self.offsetTop) > Math.abs(self.scrollHeight)) {
          self.offsetTop = -self.scrollHeight;
        }
        // 步长模式
        if (self.options.step && self.stepLen > 0) {
          const nowEndY = self.offsetTop;
          const h = Math.abs(nowEndY % self.stepLen);

          const halfHeight = self.stepLen / 2;
          // 如果超过一半的高度，向上滚动一行
          const moveY = (h >= halfHeight) ? (nowEndY -self.stepLen + h) : (nowEndY + h);

          const index = parseInt(Math.abs(moveY) / self.stepLen);
          self.offsetTop = moveY;
          util.browserVendor(self.childNode, 'transform', 'translate(0, ' + self.offsetTop + 'px)');
          self.options.callback({
            stepLen: self.stepLen,
            num: index,
            nodes: self.childNode.childNodes,
            scroller: self,
          });
        }

      });
    },
    scrollTo: function(x, y, time) {
      const self = this;
      if (time && time > 0) {
        util.browserVendor(this.childNode, 'transitionProperty', 'all');
        util.browserVendor(this.childNode, 'transitionDuration', time + 'ms');
        util.browserVendor(this.childNode, 'transitionPTimingFunction', 'cubic-bezier(0.1, 0.57, 0.1, 1');
      } else {
        util.browserVendor(this.childNode, 'transition', 'none');
      }
      y = -y;
      this.offsetTop = y;
      util.browserVendor(this.childNode, 'transform', 'translate(0, ' + y + 'px)');
    }
  };


  /**
   * 定义DatePicker的参数
   * @param {Object} options
   */
  function DatePicker(options) {
    const defaultOpt = util.defaultConfig();
    this.opt = Object.assign({}, defaultOpt, options);

    let currDate = this.opt.currDate;
    const minDate = this.opt.minDate;
    // 如果当前的日期小于最小的日期
    if (currDate.getTime() < minDate.getTime()) {
      currDate = minDate;
    }

    // 如果没有自定义最大日期
    if (!this.opt.maxDate) {
      this.opt.maxDate = new Date([currDate.getFullYear() + 100, 12, 31]);
    }
    const maxDate = this.opt.maxDate;
    this.minDateList = [minDate.getFullYear(), minDate.getMonth() + 1, minDate.getDate()];
    this.currDateList = [currDate.getFullYear(), currDate.getMonth() + 1, currDate.getDate()];
    this.maxDateList = [maxDate.getFullYear(), maxDate.getMonth() + 1, maxDate.getDate()];
    this.opt.minDate = new Date(this.minDateList);
    this.opt.currDate = new Date(this.currDateList);
    this.opt.maxDate = new Date(this.maxDateList);

    this.dateOffsetTopBase = [minDate.getFullYear(), 1, 1];

    this.classSuffix = util.classSuffix.get();
    this.scrollerList = [];
    this.init();
  }

  const fn = DatePicker.prototype;
  /**
   * 启动函数
   */
  fn.init = function() {
    this.renderDateWrap();
    this.renderYear();
    this.addEvent();
    this.initScroll();

    if (!this.opt.show) {
      this.hide();
    }
    return this;
  };
  fn.renderDateWrap = function() {
    let datePicker = '<div class="date-mask-wrap" id="date-mask' + this.classSuffix + '"></div><div id="date-container'+ this.classSuffix +'" class="date-container-wrap">';

    let titleBar = '<div id="date-title-bar' + this.classSuffix + '" class="date-title-bar-wrap">'
                   + '<div class="data-cancel">取消</div>'
                   + '<div>'
                     + this.opt.title
                   + '</div>'
                   + '<div class="data-ok">确定</div>'
                 + '</div>';

    let content = '<div class="date-content-wrap">';

    let year = '<div class="date-year" id="date-scroll1' + this.classSuffix + '"></div>';

    let month = '<div class="date-month" id="date-scroll2' + this.classSuffix + '">'
      +  '<div>'
        + '<div></div>'
        + '<div></div>'
        + '<div></div>'
        +  util.renderMonthList()
        + '<div></div>'
        + '<div></div>'
      + '</div>'
      + '</div>';
    let day = '<div class="date-day" id="date-scroll3' + this.classSuffix + '">'
      +  '<div>'
        + '<div></div>'
        + '<div></div>'
        + '<div></div>'
        + util.renderDayList()
        + '<div></div>'
        + '<div></div>'
      + '</div>'
      + '</div>';

    content += ('<div class="data-chose-top-border"></div><div class="data-chose-bottom-border"></div><div class="date-cell date-year-cell">年</div><div class="date-cell date-month-cell">月</div><div class="date-cell date-day-cell">日</div>' +year + month + day + '</div>');

    datePicker += (titleBar + content + '</div>');
    const domFragment = document.createElement('div');
    domFragment.innerHTML = datePicker;
    const container = document.querySelector(this.opt.container)
    container.insertBefore(domFragment, container.childNodes[0]);
  };
  /**
   * 年份需要限制显示，月份和日期不用
   */
  fn.renderYear = function() {
    const {minDateList, maxDateList} = this;
    let result = '<div>'
      + '<div></div>'
      + '<div></div>'
      + '<div></div>'
        + util.renderYearList(minDateList[0], maxDateList[0])
      + '<div></div>'
      + '<div></div>'
    + '</div>';
    document.querySelector('#date-scroll1' + this.classSuffix).innerHTML = result;
  };
  fn.addEvent = function() {
    const self = this;
    /**
     * 日期选择器 打开关闭事件
     */
    document.getElementById('date-container' + this.classSuffix).addEventListener('click', (function() {
      const dateTitleBar = document.querySelector('#date-title-bar' + self.classSuffix);
      const okBtn = dateTitleBar.querySelector('.data-ok');
      const cancelBtn = dateTitleBar.querySelector('.data-cancel');

      return function(ev) {
        ev.stopPropagation();
        ev.preventDefault();

        let target = ev.target || ev.srcElement;
        switch(target) {
          case okBtn:
            self.opt.onConfirm(self.currDateList.join('-'));
            self.hide();
          break;
          case cancelBtn:
            self.opt.onCancel();
            self.hide();
          break;
          default:
          break;
        }
      }
    })());

    document.addEventListener('click', function(e) {
      e.stopPropagation();
      self.opt.onCancel();
      self.hide();
    }, false);
  };
  fn.show = function(e) {
    const ele = document.querySelector('#date-container' + this.classSuffix);
    const mask = document.querySelector('#date-mask' + this.classSuffix);
    ele.style.zIndex = 9999;
    mask.style.zIndex = 9998;
  };
  fn.hide = function(e) {
    const ele = document.querySelector('#date-container' + this.classSuffix);
    const mask = document.querySelector('#date-mask' + this.classSuffix);
    mask.style.zIndex = 1;
    ele.style.zIndex = -1;
  };
  fn.initScroll = function() {
    const {currDateList, dateOffsetTopBase, scrollerList} = this;
    const wrapper = document.querySelector('#date-scroll1' + this.classSuffix).childNodes[0];
    const itemHeight = wrapper.childNodes[0].clientHeight;
    const self = this;
    for (let i = 0; i < 3; i++) {
      scrollerList.push(new Scroller('#date-scroll' + (i + 1) + this.classSuffix, {
        step: itemHeight,
        callback: self.scrollEnd(i),
        defaultPlace: (currDateList[i] - dateOffsetTopBase[i]) * itemHeight,
      }));
    }
  };
  /**
   *
   * @param {object} params 可以包括minDate, maxDate, currDate
   */
  fn.setDateLimit = function(params) {
    this.opt = Object.assign({
      ...this.opt,
      ...params,
    });

    let {minDate, currDate, maxDate} = this.opt;
    // 如果当前的日期小于最小的日期
    if (currDate.getTime() < minDate.getTime()) {
      currDate = minDate;
    }
    this.scrollerList.forEach((scroller) => {
      if (scroller.lastChoseEle) {
        scroller.lastChoseEle.classList.remove('choseEle')
      }
    });
    // 重新计算日期
    this.minDateList = [minDate.getFullYear(), minDate.getMonth() + 1, minDate.getDate()];
    this.currDateList = [currDate.getFullYear(), currDate.getMonth() + 1, currDate.getDate()];
    this.maxDateList = [maxDate.getFullYear(), maxDate.getMonth() + 1, maxDate.getDate()];
    this.opt.minDate = new Date(this.minDateList);
    this.opt.currDate = new Date(this.currDateList);
    this.opt.maxDate = new Date(this.maxDateList);

    this.dateOffsetTopBase = [minDate.getFullYear(), 1, 1];

    this.scrollerList = [];

    this.renderYear();

    this.initScroll();
  };
  /**
   * 滚动结束的回调
   * @param {Object} params
   *  self 当前的环境
   *  index 选中的元素的index
   */
  fn.scrollEnd = function(index) {
    const self = this;
    let isCriticalPoint = false;
    return function(params) {
      const {scroller, num, nodes, stepLen} = params;
      let {minDateList, currDateList, maxDateList, scrollerList, dateOffsetTopBase} = self;
      let {minDate, currDate, maxDate} = self.opt;

      let choseScroller = scroller, type = index;
      let data;
      // 年份
      if (index === 0) {
        data = minDateList[0] + num;
      } else {
        data = 1 + num;
      }

      currDateList[index] = data;
      currDate = new Date(currDateList);

      // 30天的月份
      let maxThirtyDays = currDateList;
      if (([1,3,5,7,8,10,12]).indexOf(currDateList[1]) === -1) {
        maxThirtyDays = [currDateList[0], currDateList[1], 30];
      }
      if (currDate.getTime() > new Date(maxThirtyDays)) {
        // 月份为30天的超过日期 直接修改天数
        currDateList = maxThirtyDays;
        choseScroller = scrollerList[2];
        type = 2;
      }

      currDate = new Date(currDateList);


      // 闰年
      let maxLeaf = currDateList;
      if (util.isLeapYear(currDateList[0]) && currDateList[1] === 2) {
        maxLeaf = [currDateList[0], 2, 29];
      } else if (currDateList[1] === 2) {
        maxLeaf = [currDateList[0], 2, 28];
      }
      if (currDate.getTime() > new Date(maxLeaf).getTime()) {
        // 月份为2月的超过日期 直接修改天数
        currDateList[2] = maxLeaf[2];
        choseScroller = scrollerList[2];
        type = 2;
      }

      // 日期超过限制
      for (let i = 0; i < 3; i++) {
        currDate = new Date(currDateList);
        if (currDate.getTime() < minDate.getTime()) {
          currDateList[i] = minDateList[i];
        } else if (currDate.getTime() > maxDate.getTime()) {
          currDateList[i] = maxDateList[i];
        } else {
          break;
        }
        choseScroller = scrollerList[i];
        type = i;
      }

      self.currDateList = currDateList;
      // 如果日期超过限制 调整
      self.adjustDate(type, choseScroller, stepLen);


      // 要多调整一次
      if (choseScroller !== scroller) {
        if (choseScroller.lastChoseEle) {
          scroller.lastChoseEle.classList.remove('choseEle')
        }
        let curr = currDateList[index] - dateOffsetTopBase[index];
         // 元素list最上面有三个占位置的元素
        const choseElePos = curr + 3;
        const node = nodes[choseElePos];
        scroller.lastChoseEle = node;
        setTimeout(self.chooseDateEle(node, type), 100);
      }
    }
  };
  /**
   *
   * @param {number} type 1: 年 2：月 3：日
   * @param {Scroller} scroller
   * @param {number} stepLen
   */
  fn.adjustDate = function(type, scroller, stepLen) {
    const {currDateList, dateOffsetTopBase} = this;

    if (scroller.lastChoseEle) {
      scroller.lastChoseEle.classList.remove('choseEle')
    }

    const curr = currDateList[type] - dateOffsetTopBase[type];
    scroller.scrollTo(0, curr * stepLen);
     // 元素list最上面有三个占位置的元素
    const choseElePos = curr + 3;
    const node = scroller.childNode.childNodes[choseElePos];
    scroller.lastChoseEle = node;
    setTimeout(this.chooseDateEle(node, type), 100);
  };
  fn.checkInThityDays = function() {
    let maxThirtyDays;
    if (!(currDateList[1] % 2)) {
      maxThirtyDays = [currDateList[0], currDateList[1], 30];
    }
    if (currDate.getTime() > new Date(maxThirtyDays)) {
      currDateList[2] = maxThirtyDays[2];
    }
  };
  /**
   *  标记被选择的元素
   * @param {htmlElement} node
   * @param {number} index
   */
  fn.chooseDateEle = function(node, index) {
    const self = this;
    return function() {
      const nodeTop = util.getTopPos(node);
      const topBorder = util.getTopPos(document.querySelector('#date-container' + self.classSuffix).querySelector('.data-chose-top-border'));
      const bottomBorder = util.getTopPos(document.querySelector('#date-container' + self.classSuffix).querySelector('.data-chose-bottom-border'));
      if (topBorder <= nodeTop && nodeTop <= bottomBorder) {
        node.classList.add('choseEle');
      } else {
        setTimeout(self.chooseDateEle(node), 10);
      }
    }
  };
  return DatePicker;
}));

