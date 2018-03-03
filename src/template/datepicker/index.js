
/**
* 左滑
* @param {object} e 事件对象
* @returns {boolean} 布尔值
*/
function isLeftSlide(e) {
	const { startX, startY } = this.data.gesture;
	if (this.slideLock) {
		const t = e.touches[ 0 ];
		const deltaX = t.clientX - startX;
		const deltaY = t.clientY - startY;

		if (deltaX < -20 && deltaX > -40 && deltaY < 8 && deltaY > -8) {
			this.slideLock = false;
			return true;
		} else {
			return false;
		}
	}
}
/**
* 右滑
* @param {object} e 事件对象
* @returns {boolean} 布尔值
*/
function isRightSlide(e) {
	const { startX, startY } = this.data.gesture;
	if (this.slideLock) {
		const t = e.touches[ 0 ];
		const deltaX = t.clientX - startX;
		const deltaY = t.clientY - startY;

		if (deltaX > 20 && deltaX < 40 && deltaY < 8 && deltaY > -8) {
			this.slideLock = false;
			return true;
		} else {
			return false;
		}
	}
}

const conf = {
	/**
	 * 计算指定月份共多少天
	 * @param {number} year 年份
	 * @param {number} month  月份
	 */
	getThisMonthDays(year, month) {
		return new Date(year, month, 0).getDate();
	},
	/**
	 * 计算指定月份第一天星期几
	 * @param {number} year 年份
	 * @param {number} month  月份
	 */
	getFirstDayOfWeek(year, month) {
		return new Date(Date.UTC(year, month - 1, 1)).getDay();
	},
	/**
	 * 计算日历第一排应该空多少格子
	 * @param {number} year 年份
	 * @param {number} month  月份
	 */
	calculateEmptyGrids(year, month) {
		const firstDayOfWeek = conf.getFirstDayOfWeek(year, month);
		let empytGrids = [];
		if (firstDayOfWeek > 0) {
			for (let i = 0; i < firstDayOfWeek; i++) {
				empytGrids.push(i);
			}
			this.setData({
				'datepicker.hasEmptyGrid': true,
				'datepicker.empytGrids': empytGrids,
			});
		} else {
			this.setData({
				'datepicker.hasEmptyGrid': false,
				'datepicker.empytGrids': [],
			});
		}
	},
	/**
	 * 设置日历面板数据
	 * @param {number} year 年份
	 * @param {number} month  月份
	 * @param {number} [curDate] 应为选中状态的日期
	 */
	calculateDays(year, month, curDate) {
		let days = [];
		let date = [];
		const thisMonthDays = conf.getThisMonthDays(year, month);
		const selectedDay = this.data.datepicker.selectedDay && this.data.datepicker.selectedDay.slice();
		if (selectedDay && selectedDay.length) {
			selectedDay.map(item => {
				if (year === item.year && month === item.month) {
					date.push(item.day);
				}
			});
		}
		for (let i = 1; i <= thisMonthDays; i++) {
			days.push({
				day: i,
				choosed: curDate && curDate instanceof Array ? date.includes(i) : i === curDate,
				year,
				month,
			});
		}
		const selectedDays = {
			'datepicker.days': days,
		};
		if (curDate && curDate instanceof Array) {
			if (!curDate.length) return;
			let tmp = [];
			curDate.map(item => {
				tmp.push({
					day: +item,
					choosed: true,
					year,
					month,
				});
			});
			selectedDays[ 'datepicker.selectedDay' ] = tmp;
		} else if (curDate && !isNaN(curDate)) {
			selectedDays[ 'datepicker.selectedDay' ] = [ {
				day: +curDate,
				choosed: true,
				year,
				month,
			} ];
		}
		this.setData(selectedDays);
	},
	/**
	 * 初始化日历选择器
	 * @param {number} curYear 年
	 * @param {number} curMonth 月
	 * @param {number} curDate 日
	 */
	init(curYear, curMonth, curDate) {
		const self = _getCurrentPage();
		if (!curYear || !curMonth || !curDate) {
			const date = new Date();
			curYear = date.getFullYear();
			curMonth = date.getMonth() + 1;
			curDate = date.getDate();
		}
		const weeksCh = [ '日', '一', '二', '三', '四', '五', '六' ];
		self.setData({
			'datepicker.curYear': curYear,
			'datepicker.curMonth': curMonth,
			'datepicker.weeksCh': weeksCh,
			'datepicker.hasEmptyGrid': false,
			'datepicker.showDatePicker': true,
		});
		conf.calculateEmptyGrids.call(self, curYear, curMonth);
		conf.calculateDays.call(self, curYear, curMonth, curDate);
	},
	/**
	 * 点击输入框调起日历选择器
	 * @param {object} e  事件对象
	 */
	showDatepicker(e) {
		const value = e.detail.value;
		if (value && typeof value === 'string') {
			const days = value.split(' ');
			let year = 0;
			let month = 0;
			let tmp = [];
			if (days && days.length > 1) {
				const first = days[ 0 ].split('-');
				year = +first[0];
				month = +first[1];
				days.map(item => {
					const d = item.split('-');
					if (+d[ 0 ] === year && +d[ 1 ] === month) {
						tmp.push(d[ 2 ]);
					}
				});
			}
			conf.init(+year, +month, tmp.length === 1 ? tmp[ 0 ] : tmp);
		} else {
			conf.init();
		}
	},
	/**
	 * 当输入日期时
	 * @param {object} e  事件对象
	 */
	onInputDate(e) {
		this.inputTimer && clearTimeout(this.inputTimer);
		this.inputTimer = setTimeout(() => {
			console.log(e);
			const v = e.detail.value;
			const _v = (v && v.split('-')) || [];
			const RegExpYear = /^\d{4}$/;
			const RegExpMonth = /^(([0]?[1-9])|([1][0-2]))$/;
			const RegExpDay = /^(([0]?[1-9])|([1-2][0-9])|(3[0-1]))$/;
			if (_v && _v.length === 3) {
				if (RegExpYear.test(_v[0]) && RegExpMonth.test(_v[1]) && RegExpDay.test(_v[2])) {
					conf.init(+_v[0], +_v[1], +_v[2]);
				}
			}
		}, 500);
	},
	/**
	 * 计算当前日历面板月份的前一月数据
	 */
	choosePrevMonth() {
		const { curYear, curMonth, selectedDay } = this.data.datepicker;
		let newMonth = curMonth - 1;
		let newYear = curYear;
		if (newMonth < 1) {
			newYear = curYear - 1;
			newMonth = 12;
		}

		let choosedDate = [];
		if (selectedDay && selectedDay.length) {
			selectedDay.map(item => {
				if (item.year === newYear && item.month === newMonth) {
					choosedDate.push(item.day);
				}
			});
		}

		conf.calculateDays.call(this, newYear, newMonth, choosedDate);
		conf.calculateEmptyGrids.call(this, newYear, newMonth);

		this.setData({
			'datepicker.curYear': newYear,
			'datepicker.curMonth': newMonth,
		});
	},
	/**
	 * 计算当前日历面板月份的后一月数据
	 */
	chooseNextMonth() {
		const { curYear, curMonth, selectedDay } = this.data.datepicker;
		let newMonth = curMonth + 1;
		let newYear = curYear;
		if (newMonth > 12) {
			newYear = curYear + 1;
			newMonth = 1;
		}
		let choosedDate = [];
		if (selectedDay && selectedDay.length) {
			selectedDay.map(item => {
				if (item.year === newYear && item.month === newMonth) {
					choosedDate.push(item.day);
				}
			});
		}
		conf.calculateDays.call(this, newYear, newMonth, choosedDate);
		conf.calculateEmptyGrids.call(this, newYear, newMonth);

		this.setData({
			'datepicker.curYear': newYear,
			'datepicker.curMonth': newMonth
		});
	},
	/**
	 * 切换月份
	 * @param {object} e 事件对象
	 */
	handleCalendar(e) {
		const handle = e.currentTarget.dataset.handle;
		if (handle === 'prev') {
			conf.choosePrevMonth.call(this);
		} else {
			conf.chooseNextMonth.call(this);
		}
	},
	/**
	 * 选择具体日期
	 * @param {object} e  事件对象
	 */
	tapDayItem(e) {
		const idx = e.currentTarget.dataset.idx;
		let { curYear, curMonth, days, selectedDay = [] } = this.data.datepicker;
		const key = `datepicker.days[${idx}].choosed`;
		if (this.config.type === 'multiSelect') {
			if (!days[ idx ].choosed) selectedDay.push(days[ idx ]);
			if (days[ idx ].choosed) selectedDay = selectedDay.filter(item => item.day !== days[ idx ].day);
			selectedDay.sort((a, b) => new Date(a.year, a.month + 1, a.day).getTime() - new Date(b.year, b.month + 1, b.day).getTime());
			let selectedValue = '';
			selectedDay.map(item => {
				const separator = this.config.separator;
				selectedValue += `${item.year}${separator}${item.month}${separator}${item.day} `;
			});
			this.setData({
				[ key ]: !days[ idx ].choosed,
				'datepicker.selectedDay': selectedDay,
				'datepicker.selectedValue': selectedValue.replace(/\s$/, ''),
			});
		} else if (this.config.type === 'normal' && !days[ idx ].choosed) {
			const selectedValue = `${curYear}-${curMonth}-${days[ idx ].day}`;
			const prev = days.filter(item => item.choosed)[ 0 ];
			const prevKey = prev && `datepicker.days[${prev.day - 1}].choosed`;
			this.setData({
				[ prevKey ]: false,
				[ key ]: true,
				'datepicker.selectedValue': selectedValue,
				'datepicker.selectedDay': [ days[ idx ] ],
			});
		}
	},
	/**
	 * 关闭日历选择器
	 */
	closeDatePicker() {
		this.setData({
			'datepicker.showDatePicker': false,
		});
	},
	touchstart(e) {
		const t = e.touches[ 0 ];
		const startX = t.clientX;
		const startY = t.clientY;
		this.slideLock = true; // 滑动事件加锁
		this.setData({
			'gesture.startX': startX,
			'gesture.startY': startY
		});
	},
	touchmove(e) {
		if (isLeftSlide.call(this, e)) {
			conf.chooseNextMonth.call(this);
		}
		if (isRightSlide.call(this, e)) {
			conf.choosePrevMonth.call(this);
		}
	}
};

function _getCurrentPage() {
	const pages = getCurrentPages();
	const last = pages.length - 1;
	return pages[ last ];
}

export default (config = {}) => {
	const self = _getCurrentPage();
	if (!config.type) config.type = 'normal';
	if (!config.separator) config.separator = '-';
	self.config = config;
	self.setData({
		datepicker: {
			showDatePicker: false,
			showInput: (config.showInput === true || config.showInput === undefined),
			placeholder: config.placeholder || '请选择日期',
		}
	});
	self.touchstart = conf.touchstart.bind(self);
	self.touchmove = conf.touchmove.bind(self);
	self.showDatepicker = conf.showDatepicker.bind(self);
	self.onInputDate = conf.onInputDate.bind(self);
	self.closeDatePicker = conf.closeDatePicker.bind(self);
	self.tapDayItem = conf.tapDayItem.bind(self);
	self.handleCalendar = conf.handleCalendar.bind(self);
};

/**
 * 获取已选择的日期
*/
export const getSelectedDay = () => {
	const self = _getCurrentPage();
	return self.data.datepicker.selectedDay;
};
