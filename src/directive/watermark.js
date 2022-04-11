/*
 * @Author: Jason Liu
 * @Date: 2022-03-08 15:51:32
 * @Desc: 水印
 */
import Vue from 'vue'

Vue.directive('watermark', (el, binding) => {
    el.style.position = "fixed";
    el.style.top = "0";
    el.style.left = "0";
    el.style.right = "0";
    el.style.zIndex = 1;
    el.style.bottom = "0";
    el.style.pointerEvents = "none";

    function addWaterMarker(str, parentNode, font, textColor) { // 水印文字，父元素，字体，文字颜色
        const waterMarkText = localStorage.getItem("waterMarkText")
        var can = document.createElement('canvas');
        parentNode.appendChild(can);
        can.width = 400;
        can.height = 260;
        can.style.display = 'none';
        var cans = can.getContext('2d');
        cans.rotate(-20 * Math.PI / 260);
        cans.font = font || "14px Microsoft JhengHei";
        cans.fillStyle = textColor || "rgba(0, 0, 0, 0.1)";
        cans.textAlign = 'center';
        cans.textBaseline = 'Middle';
        cans.fillText(str || waterMarkText, can.width / 3, can.height / 2);
        parentNode.style.backgroundImage = "url(" + can.toDataURL("image/png") + ")";
    }
    addWaterMarker(binding.value.text, el, binding.value.font, binding.value.textColor)
})