import { useState } from 'react'
import { symbolicGenerate } from 'lib/symbolicGenerate/symbolicGenerate'
import styleGuide from 'styles/Guide.module.scss'

function Guide({
    style,
    closeGuide
}) {
    const { huruf, enter, createList } = symbolicGenerate
    const [listPanduan, setListPanduan] = useState([
        {
            name: '<strong>teks bold</strong>',
            code: huruf.bold.bold
        },
        {
            name: '<em>teks italic</em>',
            code: huruf.slash.slash
        },
        {
            name: '<em><strong>teks bold italic</strong></em>',
            code: huruf.boldSlash.boldSlash
        },
        {
            name: '<u>teks underline</u>',
            code: huruf.underline.underline
        },
        {
            name: '<u><em>teks underline + italic</em></u>',
            code: huruf.slashUnderline.slashUnderline
        },
        {
            name: '<u><em><strong>teks underline + italic + bold</strong></em></u>',
            code: huruf.boldSlashUnderline.boldSlashUnderline
        },
        {
            name: 'enter 1 - 3 paragraph',
            code: `${enter.enter1.space1} (1 nomor atau sampai 3)`
        },
        {
            name: 'wadah list',
            code: `${createList.container.wrappList}`
        },
        {
            name: 'list child or list children one by one',
            code: `${createList.container.childList.childList}`
        }
    ])
    const RenderHTML = ({ text }) => {
        return <p dangerouslySetInnerHTML={{ __html: text }}></p>
    }

    return (
        <div className={styleGuide['wrapp-guide']} style={style}
        onClick={closeGuide}
        >
            <div className={styleGuide['container-guide']}
            onClick={(e)=>e.stopPropagation()}
            >
                <h1>Panduan Input</h1>
                <ul className={styleGuide['list-panduan']}>
                    {listPanduan.map((list, index) => (
                        <li className={styleGuide['name-panduan']} key={index}>
                            <RenderHTML
                                text={`${list.name} = ${list.code}`}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default Guide