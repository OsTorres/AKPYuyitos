export function transformDate(date) {
    var year = new Date(date).getFullYear()
    var month = '' + (new Date(date).getMonth() + 1)
    var day = '' + new Date(date).getDate()

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    return `${year}-${month}-${day}`
}