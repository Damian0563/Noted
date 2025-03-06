

document.addEventListener('DOMContentLoaded',()=>{

    document.getElementById('signout').addEventListener('click',()=>{
        window.location.href='/'
    })
    document.getElementById('add').addEventListener('click',()=>{
        const container = document.getElementById('my_notes');
        const newDiv = document.createElement('div');
        newDiv.textContent = 'New Note';
        newDiv.classList.add('note');
        container.appendChild(newDiv);
    })
})