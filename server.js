require('dotenv').config()
const {CheckDuplicates,SaveUser,VerifyCredentials,GetIdByName,GetNotes,SaveNote,GetText,DeleteNote,UpdateNote}=require('./database.js')
const express=require('express');
const session=require('express-session')
const path=require('path')
const app=express();
const email_validator=require('deep-email-validator')
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
app.set('view engine','ejs')
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(
    session({
        secret: process.env.SECRET,
        resave: false, 
        saveUninitialized: true,
        cookie: {
        maxAge: 1000 * 60 * 60,
        secure: false, 
        httpOnly: true,
        },
    })
);


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
    if (!req.session.userId) {
        return res.redirect('/')
    }
    if(req.query.sort=='false'){
        const notes = await GetNotes(req.session.userId);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        let names = notes.map(note => note.Notes.length ? note.Notes[0].Name : null).filter(Boolean);
        let dates=notes.map(note=>note.Notes.length?note.Notes[0].Date.toLocaleDateString('en-US', options):null).filter(Boolean)
        res.render('main.ejs', { notes: names, id: req.session.userId, dates:dates });
    }else if(req.query.sort=='true'){ 
        const notes = await GetNotes(req.session.userId);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        let tuple=notes.map(note=>note.Notes.length? [note.Notes[0].Name,note.Notes[0].Date]:null).filter(Boolean)
        const sorted=tuple.sort((a,b)=>new Date(b[1])-new Date(a[1]))
        let dates=[]
        let names=[]
        sorted.forEach(element => {
            dates.push(element[1].toLocaleDateString('en-US',options))
            names.push(element[0])
        });
        res.render('main.ejs', { notes: names, id: req.session.userId, dates:dates });
    }
    else{
        return res.redirect('/')
    }
 
})

app.post('/sign_in', async(req,res)=>{
    const isValid = await VerifyCredentials(req.body);
    if (isValid) {
        const userId = await GetIdByName(req.body.mail);
        req.session.userId = userId;
        res.status(200).json({ message: 'Signed in', id: userId });
    } else {
        res.status(400).json({ message: "Invalid credentials" });
    }
})

app.post('/save',async(req,res)=>{
    if (!req.session.userId) {
        return res.redirect('/')
    }
    //console.log(req.body)
    await SaveNote(req.body);
    res.status(200).json({ message: "Success" });
})

app.post('/grab',async(req,res)=>{
    const text=await GetText(req.body.file_name)
    res.send({"text":text})
})


app.post('/update', async(req,res)=>{
    await UpdateNote(req.body);
    res.status(200).send({message: "Success"})
})


app.post('/delete',async(req,res)=>{
    if (!req.session.userId){
        return res.redirect('/')
    }
    await DeleteNote({ ...req.body, userId: req.session.userId });
    res.status(200).json({ message: `Note ${req.body.delete} deleted successfully` });
})

app.post('/signout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Error signing out",ok:false });
        }
        res.clearCookie('connect.sid'); // Removes session cookie
        res.status(200).json({ message: "Signed out successfully",ok:true });
    });
});


app.post('/chat', async(req,res)=>{
    const result=await model.generateContent(req.body.content);
    res.status(200).send({message:result.response.text()})
})

app.post('/dictate', async(req,res)=>{
    (async () => {
        const { SpeechlyClient } = await import('@speechly/browser-client');
        
        // You can now use SpeechlyClient here
        const client = new SpeechlyClient({ appId: process.env.SECRET });
      })();
    
      res.send(200).json("Listening...")
})


app.listen(process.env.PORT,()=>{
    console.log('Server running on port',process.env.PORT)
});

async function CheckMailValidity(mail){
    const result=await email_validator.validate(mail)
    return result.reason!="regex"?true:false;
}





