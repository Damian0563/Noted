document.addEventListener('DOMContentLoaded',()=>{
    if(window.location.pathname=='/sign_up'){
        const submit=document.getElementById('submit')
        submit.addEventListener('click',()=>{
            const mail=document.getElementById('mail').value
            const username=document.getElementById('username').value
            const password=document.getElementById('password').value
            document.getElementById('mail').value=''
            document.getElementById('username').value=''
            document.getElementById('password').value=''
            fetch('/sign_up',{
                method:"POST",
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    "mail":mail,
                    "username":username,
                    "password":password,
                })
            })
            .then(response=>{
                if(!response.ok){
                    throw new Error('Invalid request')
                }
                if(response.status===200){
                    window.location.href='/'
                }else if(response.status===400){
                    console.log('Invalid request')
                }
            })
            .catch(e=>console.error(e))
        })
    }else if(window.location.pathname=='/sign_in'){
        const signin=document.getElementById('submit2')
        signin.addEventListener('click',()=>{
            const mail=document.getElementById('mail').value
            const password=document.getElementById('password').value
            document.getElementById('mail').value=''
            document.getElementById('password').value=''
            fetch('/sign_in',{
                method:"POST",
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    "mail":mail,
                    "password":password
                })
            }).then(response=>{
                if(!response.ok){
                    throw new Error('Invalid request')
                }
                return response.json()
            })
            .then(data=>{
                if(data.id!==undefined){
                    window.location.href=`/noted/${data.id}`
                }else{
                    document.getElementById('popup').style.display='none'
                    document.getElementById('x').addEventListener('click',()=>{
                        document.getElementById('popup').style.display='grid'
                    })
                }
            })
            .catch(e=>console.error(e))
        })
    }
})