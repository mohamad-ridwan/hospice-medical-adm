import { backendUrl } from "lib/api/backendUrl"

export const useFetch = async (path, method, data)=>{
    return await new Promise((resolve, reject)=>{
        fetch(`${backendUrl}/${path}`, {
            method: method,
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(res=>res.json())
        .then(res=>resolve(res))
        .catch(err=>reject(err))
    })
}