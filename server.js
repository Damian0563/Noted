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
        secret: "9f8w908w392349238402342304edjfsa", // Change this to a secure key
        resave: false, // Prevents resaving session if unmodified
        saveUninitialized: true, // Saves new sessions even if unmodified
        cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
        secure: false, // Set to true in production with HTTPS
        httpOnly: true, // Prevents client-side JS from accessing the cookie
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
        return res.status(401).json({ message: "Unauthorized - Please sign in" });
    }
    const notes = await GetNotes(req.session.userId);
    let names = notes.map(note => note.Notes.length ? note.Notes[0].Name : null).filter(Boolean);
    
    res.render('main.ejs', { notes: names, id: req.session.userId });
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
    // SaveNote(req.body)
    // res.status(200).send({message:"Success"})
    if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized - Please sign in" });
    }
    await SaveNote({ ...req.body, userId: req.session.userId });
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
    // await DeleteNote(req.body)
    // console.log(`Note ${req.body.delete} deleted successfuly`)
    // res.status(200).send({message:`Note ${req.body.delete} deleted successfuly`})
    if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized - Please sign in" });
    }
    await DeleteNote({ ...req.body, userId: req.session.userId });
    res.status(200).json({ message: `Note ${req.body.delete} deleted successfully` });
})

app.post('/signout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Error signing out" });
        }
        res.clearCookie('connect.sid'); // Removes session cookie
        res.status(200).json({ message: "Signed out successfully" });
    });
});


app.post('/chat', async(req,res)=>{
    const result=await model.generateContent(req.body.content);
    //console.log(result.response.text())
    res.status(200).send({message:result.response.text()})
})


app.listen(process.env.PORT,()=>{
    console.log('Server running on port',process.env.PORT)
});

async function CheckMailValidity(mail){
    const result=await email_validator.validate(mail)
    return result.reason!="regex"?true:false;
}





