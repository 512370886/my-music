// 在min和max之间返回一个随机数，其中包含max也包括min
function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
// 洗牌函数，把一个数组原先的顺序打乱，重新排序
export function shuffle (arr) {
  let _arr = arr.slice() // 新的数组被赋值为传入的数组的副本， arr.slice()一个数组的副本，为消除洗牌后原来的数组顺序不能改变，没有副作用
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}
// 节流函数
export function debounce (func, delay) {
  let timer // 定义一个计时器
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
