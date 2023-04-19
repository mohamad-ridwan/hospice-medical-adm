// huruf
// bold
const bold = '/?b?;'
const boldResult = '<strong>something</strong>'
// slash
const slash = '[//];'
const slashResult = '<em>something</em>'
// bold slash
const boldSlash = '[b//];'
const boldSlashResult = '<em><strong>something</strong></em>'
// underline
const underline = '[??*u];'
const underlineResult = '<u>something</u>'
// slash underline
const slashUnderline = '[??*u*//];'
const slashUnderlineResult = '<u><em>something</em></u>'
// bold slash underline
const boldSlashUnderline = '[??*u*//*b];'
const boldSlashUnderlineResult = '<u><em><strong>something</strong></em></u>'
// jarak enter
// space paragraph
const space1 = '&=1'
const space1Result = '<br/>'
const space2 = '&=2'
const space2Result = '<br/><br/>'
const space3 = '&=3'
const space3Result3 = '<br/><br/><br/>'
// list
// create wrapp list
const wrappList = '[[-@;]];'
const wrappListResult = `<br/><ul class="container-list-body-content"><li class="list-body-content"><span class="text-list">something</span></li></ul><br/>`
// child create wrapp list (default)
const childList = '[-@;];'
const childListResult = `<li class="list-body-content"><span class="text-list">something</span></li>`


export const symbolicGenerate = {
    huruf: {
        bold: {
            bold,
            boldResult
        },
        slash: {
            slash,
            slashResult
        },
        boldSlash: {
            boldSlash,
            boldSlashResult
        },
        underline:{
            underline,
            underlineResult
        },
        slashUnderline:{
            slashUnderline,
            slashUnderlineResult
        },
        boldSlashUnderline: {
            boldSlashUnderline,
            boldSlashUnderlineResult
        }
    },
    enter:{
        enter1: {
            space1,
            space1Result
        },
        enter2: {
            space2,
            space2Result
        },
        enter3: {
            space3,
            space3Result3
        }
    },
    createList:{
        container: {
            wrappList,
            wrappListResult,
            childList: {
                childList,
                childListResult
            }
        }
    }
}