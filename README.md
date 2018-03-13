# datePicker
移动端 日历组件

# usage

```js
let pickerOpen = false;
const datePickerStart = new DatePicker({
	title: '选择开始时间',
	show: false,
	onConfirm: (currDateStr) => {
		pickerOpen = false;
		document.querySelector('#date-picker-start').innerHTML = currDateStr;
		datePickerEnd.setDateLimit({
			minDate: new Date(currDateStr),
		});
	},
	onCancel: () => {
		pickerOpen = false;
	},
});
const datePickerEnd = new DatePicker({
	title: '选择结束时间',
	show: false,
	onConfirm: (currDateStr) => {
		pickerOpen = false;
		document.querySelector('#date-picker-end').innerHTML = currDateStr;
		datePickerStart.setDateLimit({
			maxDate: new Date(currDateStr),
		});
	},
	onCancel: () => {
		pickerOpen = false;
	},
});
let startListener = function(e) {
	e.stopPropagation();
	if (pickerOpen) {
		return false;
	}
	datePickerStart.show();
	pickerOpen = true;
};
let endListener = function(e) {
	e.stopPropagation();
	if (pickerOpen) {
		return false;
	}
	datePickerEnd.show();
	pickerOpen = true;
};
document.querySelector('#date-picker-start').addEventListener('click', startListener, false);
document.querySelector('#date-picker-end').addEventListener('click', endListener, false);
```
