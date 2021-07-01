//https://gist.github.com/twmbx/2321921670c7e95f6fad164fbdf3170e#gistcomment-3053587
function poll(fn, timeout, interval) {
  const endTime = Number(new Date()) + (timeout || 2000)
  interval = interval || 100

  const checkCondition = (resolve, reject) => {
    let ajax = fn()
    ajax.then((data) => {
      if (data) {
        resolve(data.data)
      } else if (Number(new Date()) < endTime) {
        setTimeout(checkCondition, interval, resolve, reject)
      } else {
        reject(new Error('time out for ' + fn + ' : ' + arguments))
      }
    })
  }
  return new Promise(checkCondition)
}

export { poll }
