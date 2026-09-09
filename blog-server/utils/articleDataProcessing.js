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
    return item
  })
}

module.exports = articleDataProcessing
