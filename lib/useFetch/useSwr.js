import { backendUrl } from 'lib/api/backendUrl'
import useSWR from 'swr'

function useSwr(path, method, dataBody){
    const fetcher = (url) => fetch(url, {
        method: method,
        body: JSON.stringify(dataBody)
    }).then((res) => res.json())

    const {data, error, isLoading} = useSWR(`${backendUrl}/${path}`, fetcher)

    return {
        data,
        error,
        isLoading
    }
}

export default useSwr