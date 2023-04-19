import styleContUpload from 'styles/ContainerUpload.module.scss'

function ContainerInputUpload({
    children,
    style
}) {
    return (
        <>
            <div className={styleContUpload['container-input-upload']}>
                <div className={styleContUpload['center-input-upload']} style={style}>
                    {children}
                </div>
            </div>
        </>
    )
}

export default ContainerInputUpload