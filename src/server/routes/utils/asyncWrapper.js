// 这个是专门给 每个route的async handler用的, 每个此类handler内遇到出错, 必须在 req 上加上:
// req.errObj = {statusCode: non-200, message: '****}
// 然后 throw 'error occured'.
// 该route 必须额外定义一个同名/同method 的route, 确保error发生后该, 本middleware会被触发.

// credit:
// https://tech.boldare.com/async-await-with-express/

module.exports =fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
      .catch((err) => { // 直接写成：.catch(next), 压根不会触发 next, 一定要这么写,不知啥原因.
        console.log('native err, mainly from 3rd party: ', err)
        console.log('WTF, req.errObj: ', req.errObj)
        next()
      });
};
