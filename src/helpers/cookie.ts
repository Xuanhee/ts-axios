const cookie = {
    read(name: string): string | null {
        // 匹配正则表达式， 采用构造函数('')的方式创建正则的话，需要用\来对特殊字符进行转义
        // 正则表达式中()表示捕获
        const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'))
        // 返回值是一个数组, 索引0是整个匹配的内容,剩下索引是括号内依次对应的,最后是index捕获开始位置 和input匹配内容
        return match ? decodeURIComponent(match[3]) : null
    }
}
export default cookie