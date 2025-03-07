
document.addEventListener('DOMContentLoaded',()=>{

    let pointer=document.getElementById('pointer').textContent
    pointer=document.getElementsByClassName('note')[0].innerHTML
    document.getElementById('signout').addEventListener('click',()=>{
        window.location.href='/'
    })
    document.getElementById('add').addEventListener('click', () => {
        const container = document.getElementById('my_notes');
        const notes = Array.from(container.getElementsByClassName('note'));
        const existingNote = notes.some(note => note.textContent === 'New Note');
    
        if (!existingNote) {
            const newDiv = document.createElement('div');
            newDiv.textContent = 'New Note';
            newDiv.classList.add('note');
            container.appendChild(newDiv);
            document.getElementById('pointer').textContent = 'New Note';
        }
    });
    document.getElementById('save').addEventListener('click',()=>{
        const file_name=document.getElementById('pointer').innerHTML
        const content=document.getElementById('input').value
        const id=document.getElementById('usr_id').value
        console.log(content)
        fetch('/save',{
            method:"POST",
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                "file_name":file_name,
                "content":content,
                "id":id
            })
        }).then(response=>response.json())
        .catch(e=>console.error(e))
    })
    

    fetch('/grab',{
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            "file_name":pointer
        })
    }).then(response=>response.json())
    .then(data=>console.log(data))
    .catch(e=>console.error(e))
})


