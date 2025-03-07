require('dotenv').config()
const {CheckDuplicates,SaveUser,VerifyCredentials,GetIdByName,GetNotes,SaveNote}=require('./database.js')
const express=require('express');
const path=require('path')
const app=express();
const email_validator=require('deep-email-validator')
app.set('view engine','ejs')
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.get('/',(req,res)=>{
    res.render('landing_page.ejs')
})

app.get('/sign_up',(req,res)=>{
    res.render('sign_up.ejs')
})

app.post('/sign_up', async(req,res)=>{
    if(await CheckDuplicates(req.body)){
        const username=req.body.username;
        const mail=req.body.mail;
        if(await CheckMailValidity(mail)){
            console.log('Mail valid')
            const password=req.body.password;
            await SaveUser(username,password,mail);
            res.status(200).json({message:"Success"})
        }
        else{
            res.status(400).json({message:"failure"}) 
        }
    }else{
        res.status(400).json({message:"failure"})
    }
})

app.get('/sign_in',(req,res)=>{
    res.render('sign_in.ejs')
})

app.get('/noted/:id',async (req,res)=>{
    notes=await GetNotes(req.params.id);
    console.log(notes)
    res.render('main.ejs',{notes:notes,id:req.params.id})
})

app.post('/sign_in', async(req,res)=>{
    if(await VerifyCredentials(req.body)){
        res.status(200).json({message:'Signed in',id:await GetIdByName(req.body.mail)})
    }else{
        res.status(400).json({message:"Invalid credentials"})
    }
})

app.post('/save',async(req,res)=>{
    SaveNote(req.body)
    res.status(200).send({message:"Success"})
})

app.listen(process.env.PORT,()=>{
    console.log('Server running on port',process.env.PORT)
});

async function CheckMailValidity(mail){
    const result=await email_validator.validate(mail)
    return result.reason!="regex"?true:false;
}





