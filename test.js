let { format, between, StringMap } = require('./index')
let { runer, each } = require('@soei/tools');
console.log(`
// 输出: ${format('new Date-[name]-{1-4}', {
    name: 3
})}
`)

console.log(
    runer(function (a, z) {
        return `this is ${this.name} ${a} ${z}`;
    }, {
        name: 'loop'
    }, 1, 2))

console.log(
    format("ssl:{1-4}-{99-999}{name>2,+name + 2, +age - 1}-{now}-{counted}", {
        name: "1",
        age: 1,
        counted() {
            return 1
        }
    })
)

console.log(
    format("query:?-?-?-?-{[0]>+1,1,2}", +new Date, 1 > 2)
)
console.log(
    format("http://query.com/s?name=?", {
        name: 'loop'
    })
)

console.log(between("{1-40}"))





// let NM = new StringMap(['name', 'age', 'sex', 'height'].join('|'));
// let NM = new StringMap(['name', 'age', 'sex', 'height']);
let NM = new StringMap('name,age,sex,height');
console.log(NM.map);
console.log(NM.$mode);
let toUrl = NM.toString({
    name: 'Tom',
    age: 3
})


console.log(toUrl)
toUrl = NM.toString({
    name: 1235,
    height: 30
})
console.log(toUrl)
console.log(NM.data(toUrl), NM.data('jerry/13//130cm'))

let _NM = new StringMap('$-id-sid-count-id3----', '-');
let N = _NM.toString({
    id: 'Tom',
    sid: 31,
    $: '$'
})
console.log(N, _NM.data('$-name-001-2---'), _NM.toString({ id: 1 }));
console.log(N, _NM.data('1-$-name-00122-2---'), _NM.toString({ id: 'soei' }));
// console.log(_NM.data('3'), _NM.toString({ $: 3 }));
// console.log(_NM.toString({ $: 3 }));
console.log(_NM.data('3'), _NM.toString({}));

let runn = async () => {
    function asyncFx() {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve('ok')
            }, 1000)
            // throw new Error('error')
        })
    }

    let a = await asyncFx().then((data) => {
        return { ok: data }
    }).catch(() => {
        return { ok: -1 }
    })
    console.log(a, '-----------------')
}
runn();



(async () => {
    let a = await new Promise(function (resolve, reject) {
        let a = 1 / 0
        resolve(a);
    }).catch(() => {
        return { ok: -1 }
    })
    console.log(a, '-----------------')
})();
console.log(
    format(`
        你的: ?
        我 的 : ?
        `, {
        你的: "是你的",
        的: "是你的",
        age: 1,
        counted() {
            return 1
        }
    })
)