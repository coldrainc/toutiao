// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
var db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {// 使用没有更新，使用where更新成功
    return await db.collection('comments')
        .where({
            new_id: event.new_id
        })
        .update({
            data: {
                comments: event.comms
            }
        });
}