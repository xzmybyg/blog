const articleDataProcessing = (data)=>{
    return data.map(item => {
        item.topping = item.topping === 1;
        if (item.label) {
            item.label = item.label.split(',')
        }
        return item
    })
}

module.exports = articleDataProcessing