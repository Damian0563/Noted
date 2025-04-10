document.addEventListener('DOMContentLoaded',()=>{
    try{
        let pointer=document.getElementById('pointer')
        pointer.innerText=document.getElementsByClassName('note')[0].id
    }catch(e){
        document.getElementById('input').value='';
    }
    document.getElementById('signout').addEventListener('click',async()=>{
        try{
            const response=await fetch('/signout',{
                method:"POST",
                headers:{'Content-Type':'application/json'}
            }).then(response=>response.json())
            if(response.ok){
                localStorage.removeItem('userId');
                window.location.href='/'
            }
        }catch(e){
            console.error(e)
        }
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
    document.getElementById('save').addEventListener('click',async()=>{
        const file_name=document.getElementById('pointer').innerHTML
        const content=document.getElementById('input').value
        const id=document.getElementById('usr_id').value
        await fetch('/save',{
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
        window.location.href=window.location.href
    })
    
    let notes = Array.from(document.getElementsByClassName('note')).map(note => note.id);
    //console.log(notes)
    if (notes.length===0) document.getElementById('input').value='';
    else{
        notes.forEach(note => {
            document.getElementById(`${note}`).addEventListener('click',()=>{
                pointer.innerText=document.getElementById(`${note}`).value;
                document.getElementById(`${note}`).style.backgroundColor='blueviolet'
                notes.forEach(note=>{
                    if(document.getElementById(`${note}`).value!=pointer.innerText) document.getElementById(`${note}`).style.backgroundColor='white'
                })
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
                edit.addEventListener('click',async()=>{
                    pointer.innerText=document.getElementById(`${note}`).value
                    document.getElementById(`${note}`).setAttribute("readOnly","true");
                    document.getElementById(`edit${note}`).src='/edit.png'
    
                    //document.getElementById(`${note})`).value=pointer.innerText
                    document.getElementById(`${note}`).id=pointer.innerText
                    
                    document.getElementById(`edit${note}`).id=`edit${pointer.innerText}`
                    const usr_id=document.getElementById('usr_id').value
                    await fetch('/update',{
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
    
            delet.addEventListener('click',async()=>{
                await fetch('/delete',{
                    method:"POST",
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({
                        "delete": note,
                        "id": document.getElementById('usr_id').value,
                    })
                }).then(response=>response.json())
                .then(() => window.location.reload())
                .catch(e=>console.error(e))
            })
        });
    }
    
    document.getElementById('sort').addEventListener('click',()=>{
        const params=new URLSearchParams(window.location.search)
        let value=params.get('sort')=='true'?'false':'true'
        fetch(`/noted/${document.getElementById('usr_id').value}?sort=${value}`,{
            method:"GET",
            headers:{'Content-Type':'application/json'},
        }).then(window.location.href=`/noted/${document.getElementById('usr_id').value}?sort=${value}`)
        .catch(e=>console.error(e))
    })

    document.getElementById('submit').addEventListener('click',()=>{
        const question=document.getElementById('prompt_input').value
        document.getElementById('prompt_input').value=''
        let prompt=document.createElement('div')
        prompt.classList.add('me')
        prompt.innerText=question
        document.getElementById('talk').appendChild(prompt)
        let box=document.getElementById('talk')
        let img=box.querySelector('img')
        box.removeChild(img)
        fetch('/chat',{
            method:"POST",
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({"content":question})
        }).then(response=>response.json())
        .then(data=>{ 
            let answer=document.createElement('div')
            answer.classList.add('response')
            answer.innerText=data.message
            document.getElementById('talk').appendChild(answer)
        })
        .catch(e=>console.error(e))
    })

    document.getElementById('download').addEventListener('click',async()=>{
        try{
            const { Document, Packer, Paragraph, TextRun } = window.docx;
            const filename = document.getElementById('pointer').innerText.trim()
            const text_content = document.getElementById('input').value;
            const doc = new Document({
                sections: [
                    {
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: text_content,
                                        break: 1
                                    })
                                ]
                            })
                        ]
                    }
                ]
            });
            const blob = await Packer.toBlob(doc);
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename.endsWith('.docx') ? filename : filename + ".docx";
            link.click();

            URL.revokeObjectURL(link.href);
        }catch(e){
            console.error(e)
        }
    })

    let isDictating = false;

    document.getElementById('dictate').addEventListener('click', async () => {
        const button = document.getElementById('dictate');
        if (!isDictating) {
            // Start dictating
            button.innerText = 'Stop dictating';
            button.style.backgroundColor = 'white';
            button.style.border = '1rem solid white';
            button.style.color = 'red';
        } else {
            // Stop dictating
            button.innerText = 'Dictate';
            button.style.backgroundColor = 'blueviolet'; // correct color name (not 'blue violet')
            button.style.border = '1rem solid blueviolet';
            button.style.color = 'white';
        }
        isDictating = !isDictating;
    });


    fetch('/grab',{
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            "file_name":pointer.innerText
        })
    }).then(response=>response.json())
    .then(data=>{
        document.getElementById(`${pointer.innerText}`).style.backgroundColor='blueviolet'
        if (pointer.innerText==''){
            document.getElementById('input').value=''
        }else{
            if(data.text!='') document.getElementById('input').value=data.text
            else document.getElementById('input').value=''
        };
    })
    .catch(e=>console.error(e))
})


