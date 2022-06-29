
module.exports = {
    slice: (array1, array2) => {
        var data = []
        for (var i = 0; i < array1.length; i++) {
            for (var j = 0; j < array2.length; j++) {
                if(array1[i] == array2[j]){
                    data.push(array1[i])
                }
            }
        }
        return data
    }
}