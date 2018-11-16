// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
let db = cloud.database();
let comments = db.collection('comments');
// 云函数入口函数
exports.main = async (event, context) => {
  let img = comments[0];
  return await comments.where({
    new_id: event.new_id
  }).update({
    data: {
      image: event.fileID
    }
  })
}