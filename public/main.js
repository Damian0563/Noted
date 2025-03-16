
document.addEventListener('DOMContentLoaded',()=>{

    document.getElementById('signout').addEventListener('click',()=>{
        window.location.href='/'
    })
    document.getElementById('add').addEventListener('click', () => {
        const container = document.getElementById('my_notes');
        const notes = Array.from(container.getElementsByClassName('note'));
        const existingNote = notes.some(note => note.value === 'New Note');
        if (!existingNote) {
            const newDiv = document.createElement('div');
            newDiv.classList.add('wrapper');

            const newNoteInput = document.createElement('input');
            newNoteInput.classList.add('note');
            newNoteInput.value = 'New Note';  // Set the default value for the note
            newNoteInput.id = 'New Note';  // Unique id for the note input, you may change as needed
            newNoteInput.readOnly = true;  // Make the note input read-only initially

            const editButton = document.createElement('div');
            editButton.classList.add('edit');
            editButton.id = 'New Noteedit';  // Unique id for the edit button
            const editIcon = document.createElement('img');
            editIcon.src = '/edit.png';  // Edit icon source
            editIcon.alt = 'edit';
            editIcon.classList.add('sprite');
            editButton.appendChild(editIcon);

            const deleteButton = document.createElement('div');
            deleteButton.classList.add('delete');
            deleteButton.id = 'New Noteddelete';  // Unique id for the delete button
            const deleteIcon = document.createElement('img');
            deleteIcon.src = '/delete.png';  // Delete icon source
            deleteIcon.alt = 'delete';
            deleteIcon.classList.add('sprite');
            deleteButton.appendChild(deleteIcon);

            newDiv.appendChild(newNoteInput);
            newDiv.appendChild(editButton);
            newDiv.appendChild(deleteButton);
            container.appendChild(newDiv);
            const pointer = document.getElementById('pointer');
            pointer.textContent = 'New Note';
            const inputField = document.getElementById('input');
            inputField.value = '';
        }
    });
    let pointer=document.getElementById('pointer')
    pointer.innerText=document.getElementsByClassName('note')[0].id
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
    
    let notes = Array.from(document.getElementsByClassName('note')).map(note => note.id);
    notes.forEach(note => {
        document.getElementById(`${note}`).addEventListener('click',()=>{
            pointer.innerText=document.getElementById(`${note}`).value;
            fetch('/grab',{
                method:"POST",
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    "file_name":pointer.innerText,
                })
            }).then(response=>response.json())
            .then(data=>{
                document.getElementById('input').value=data.text;
            })
            .catch(e=>console.error(e))
        })
        let edit=document.getElementById(`${note}edit`)
        let delet=document.getElementById(`${note}delete`)
        edit.addEventListener('click',()=>{
            const old=document.getElementById(`${note}`).value
            document.getElementById(`${note}`).removeAttribute("readOnly");
            document.getElementById(`edit${note}`).src='/save.png'
            edit.addEventListener('click',()=>{
                pointer.innerText=document.getElementById(`${note}`).value
                document.getElementById(`${note}`).setAttribute("readOnly","true");
                document.getElementById(`edit${note}`).src='/edit.png'

                //document.getElementById(`${note})`).value=pointer.innerText
                document.getElementById(`${note}`).id=pointer.innerText
                
                document.getElementById(`edit${note}`).id=`edit${pointer.innerText}`
                const usr_id=document.getElementById('usr_id').value
                fetch('/update',{
                    method:"POST",
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({
                        new:pointer.innerText,
                        old:old,
                        id:usr_id,
                    })
                }).then(response=>response.json())
                .catch(e=>console.error(e))
                window.location.href=window.location.href
            })
        })

        delet.addEventListener('click',()=>{
            fetch('/delete',{
                method:"POST",
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    "delete": note,
                    "id": document.getElementById('usr_id').value,
                })
            }).then(response=>response.json())
            .then(data=>data)
            .catch(e=>console.error(e))
        })
    });

    document.getElementById('submit').addEventListener('click',()=>{
        const question=document.getElementById('prompt_input').value
        fetch('/chat',{
            method:"POST",
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({"content":question})
        }).then(response=>response.json())
        .then(data=>{
            document.getElementById('response').value=data.text
        })
        .catch(e=>console.error(e))
    })




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


