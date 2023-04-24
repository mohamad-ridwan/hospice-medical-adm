import { backendUrl } from "lib/api/backendUrl"

async function fetchJwtToken(path, method, token){
    return await new Promise((resolve, reject)=>{
        fetch(`${backendUrl}/${path}`, {
            method: method,
            mode: 'cors',
            headers: {
                "Jwt-Token": token
            }
        })
        .then(res=>res.json())
        .then(res=>resolve(res))
        .catch(err=>reject(err))
    })
}

export default fetchJwtToken