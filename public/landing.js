document.addEventListener('DOMContentLoaded',()=>{

    const signup=document.getElementById('signup')
    const signin=document.getElementById('signin')
    signup.addEventListener('click',()=>{
        window.location.href='/sign_up'
    })
    signin.addEventListener('click',()=>{
        window.location.href='/sign_in'
    })
})