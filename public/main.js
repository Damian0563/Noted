
document.addEventListener('DOMContentLoaded',()=>{

    let pointer=document.getElementById('pointer')
    pointer.innerText=document.getElementsByClassName('note')[0].innerText
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
    
    let notes = Array.from(document.getElementsByClassName('note')).map(note => note.innerHTML);
    for(note of notes){
        document.getElementById(`${note}`).addEventListener('click',()=>{
            pointer.innerText=note;
        })
    }

    fetch('/grab',{
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            "file_name":pointer.innerText
        })
    }).then(response=>response.json())
    .then(data=>{
        document.getElementById('input').value=data.text;
    })
    .catch(e=>console.error(e))
})


