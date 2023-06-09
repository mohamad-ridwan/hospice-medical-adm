import style from 'styles/TableFilter.module.scss'
import { range } from 'lodash'
import getYear from 'date-fns/getYear'
import getMonth from 'date-fns/getMonth'
import Input from 'components/Input'
import SelectCategory from 'components/SelectCategory'

function TableFilter({
    placeholder,
    nameInput,
    valueInput,
    changeInput,
    dataBlogCategory,
    selected,
    changeCalendar,
    displayOnCalendar,
    handleCategory,
    dataSortCategory,
    handleSortCategory,
    displaySortDate
}) {
    const yearsCalendar = range(1900, getYear(new Date()) + 1, 1)
    const monthsCalendar = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    return (
        <div className={style['wrapp']}>
            {/* left */}
            <div className={style['left']}>
                <div className={style['search']}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <Input
                        styleInputText={{
                            background: 'transparent',
                            border: 'none',
                            margin: '0'
                        }}
                        nameInput={nameInput}
                        placeholder={placeholder}
                        valueInput={valueInput}
                        changeInput={changeInput}
                    />
                </div>
                <div className={style['search']} style={{
                    marginTop: '8px',
                    display: displayOnCalendar ? 'flex' : 'none'
                }}>
                    <i className="fa-solid fa-calendar-days"></i>
                    <Input
                        styleInputText={{
                            display: 'none'
                        }}
                        onCalendar={true}
                        placeholderCalendar='Search Date'
                        classCalendar='search-date'
                        selected={selected}
                        changeCalendar={changeCalendar}
                        renderCustomHeader={({
                            date,
                            changeYear,
                            changeMonth,
                            decreaseMonth,
                            increaseMonth,
                            prevMonthButtonDisabled,
                            nextMonthButtonDisabled,
                        }) => (
                            <div
                                style={{
                                    margin: 10,
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} style={{
                                    width: '30px',
                                }}>
                                    {"<"}
                                </button>
                                <select
                                    value={getYear(date)}
                                    onChange={({ target: { value } }) => changeYear(value)}
                                >
                                    {yearsCalendar.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={monthsCalendar[getMonth(date)]}
                                    onChange={({ target: { value } }) =>
                                        changeMonth(monthsCalendar.indexOf(value))
                                    }
                                >
                                    {monthsCalendar.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>

                                <button onClick={increaseMonth} disabled={nextMonthButtonDisabled} style={{
                                    width: '30px',
                                }}>
                                    {">"}
                                </button>
                            </div>
                        )}
                    />
                </div>
            </div>

            {/* right */}
            <div className={style['right']}>
                <SelectCategory
                    styleWrapp={{
                        margin: '0'
                    }}
                    styleTitle={{
                        display: 'none'
                    }}
                    styleCategory={{
                        margin: '10px 0 5px 0'
                    }}
                    idSelect='filterDateTable'
                    dataBlogCategory={dataBlogCategory}
                    handleCategory={handleCategory}
                />
                {displaySortDate && (
                    <SelectCategory
                        styleWrapp={{
                            margin: '0'
                        }}
                        styleTitle={{
                            display: 'none'
                        }}
                        styleCategory={{
                            margin: '5px 0'
                        }}
                        idSelect='sortDateTable'
                        dataBlogCategory={dataSortCategory}
                        handleCategory={handleSortCategory}
                    />
                )}
            </div>
        </div>
    )
}

export default TableFilter