const articleDataProcessing = (data) => {
  return data.map((item) => {
    item.topping = item.topping === 1
    item.hidden = item.hidden === 1
    if (item.label) {
      item.label = item.label.split(',')
    } else {
      item.label = []
    }
    item.labelIds = item.labelIds ? item.labelIds.split(',').map(Number) : []
    item.topicId = item.topic_id === null ? null : Number(item.topic_id)
    item.topicOrder = Number(item.topic_order || 0)
    delete item.topic_id
    delete item.topic_order
    return item
  })
}

module.exports = articleDataProcessing
