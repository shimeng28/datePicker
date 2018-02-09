'use strict';

var pickerOpen = false;

var datePickerStart = new DatePicker({
	title: '选择开始时间',
	show: false,
	maxDate: new Date('3200-12-31'),
	onConfirm: function onConfirm(currDateStr) {
		pickerOpen = false;
		document.querySelector('#date-picker-start').innerHTML = currDateStr;
		datePickerEnd.setDateLimit({
			minDate: new Date(currDateStr)
		});
	},
	onCancel: function onCancel() {
		pickerOpen = false;
	}
});
var datePickerEnd = new DatePicker({
	title: '选择结束时间',
	show: false,
	onConfirm: function onConfirm(currDateStr) {
		pickerOpen = false;
		document.querySelector('#date-picker-end').innerHTML = currDateStr;
		datePickerStart.setDateLimit({
			maxDate: new Date(currDateStr)
		});
	},
	onCancel: function onCancel() {
		pickerOpen = false;
	}
});

var startListener = function startListener(e) {
	e.stopPropagation();
	if (pickerOpen) {
		return false;
	}
	datePickerStart.show();
	pickerOpen = true;
};
var endListener = function endListener(e) {
	e.stopPropagation();
	if (pickerOpen) {
		return false;
	}
	datePickerEnd.show();
	pickerOpen = true;
};
document.querySelector('#date-picker-start').addEventListener('click', startListener, false);
document.querySelector('#date-picker-end').addEventListener('click', endListener, false);