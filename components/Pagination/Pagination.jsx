import Button from "components/Button"
import { usePagination, DOTS } from "./usePagination"
import style from 'styles/Pagination.module.scss'

const Pagination = ({
    onPageChange,
    totalCount,
    siblingCount = 1,
    currentPage,
    pageSize,
    className
}) => {
    const paginationRange = usePagination({
        currentPage,
        totalCount,
        siblingCount,
        pageSize
    })

    if (currentPage === 0 || paginationRange.length < 2) {
        return null
    }

    const onNext = () => {
        onPageChange(currentPage + 1)
    }

    const onPrevious = () => {
        onPageChange(currentPage - 1)
    }

    let lastPage = paginationRange[paginationRange.length - 1]

    const styleBtn = {
        styleIcon: {
            display: 'flex',
            margin: '0',
            fontSize: '13px'
        },
        style: {
            padding: '7px 7.5px',
            margin: '0 5px',
            borderRadius: '500px'
        }
    }

    return (
        <ul className={style['wrapp-pagination']}>
            {/* left arrow */}
            <Button
                {...styleBtn}
                classBtn={currentPage === 1 ? 'disable-pagination' : 'pagination-arrow'}
                click={()=>{
                    if(currentPage !== 1){
                        onPrevious()
                    }
                }}
                icon='fa-solid fa-arrow-left'
            />
            {paginationRange.map((pageNumber, idx) => {
                if (pageNumber === DOTS) {
                    return <li key={idx} className={style['pagination-item-dots']}>&#8230;</li>
                }

                return (
                    <Button
                        key={idx}
                        style={{
                            padding: '6px 9.5px',
                            margin: '0 3px',
                            borderRadius: '500px'
                        }}
                        classBtn={pageNumber === currentPage ? 'pagination-number-active': 'pagination-number'}
                        name={pageNumber}
                        click={()=>onPageChange(pageNumber)}
                    />
                )
            })}
            {/* right arrow */}
            <Button
                {...styleBtn}
                classBtn={currentPage === lastPage ? 'disable-pagination' : 'pagination-arrow'}
                click={()=>{
                    if(currentPage !== lastPage){
                        onNext()
                    }
                }}
                icon='fa-solid fa-arrow-right'
            />
        </ul>
    )
}

export default Pagination