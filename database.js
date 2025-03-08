bcrypt=require('bcrypt')
mongo=require('mongoose')
require ('dotenv').config()

const UserSchema=new mongo.Schema({
    Username:String,
    Email:String,
    Password:String
})
const User=mongo.model('User',UserSchema)
const NoteSchema=new mongo.Schema({
    Username:String,
    Notes:[
        {
            Name:String,
            Date: { type: Date, default: Date.now },
            Content: String,
        }
    ]
})
const Note=mongo.model('Note',NoteSchema)


async function CheckDuplicates(body){
    try{
        await mongo.connect(process.env.DB)
        const mail=body.mail
        const username=body.username
        await mongo.connect(process.env.DB)
    
        const case1= await User.findOne({Username:username})
        const case2=await User.findOne({Email:mail})
        if(case1===null && case2===null){
            await mongo.connection.close()
            return true;
        }
        await mongo.connection.close()
        return false;
    }catch(e){
        await mongo.connection.close()
        console.error(e);
        return false
    }
}

async function hash(password,salt){
    try {
        const hash = await bcrypt.hash(password, salt);
        //console.log("Hashed Password:", hash);
        return hash;
      } catch (err) {
        console.error(err);
      }
}

async function SaveUser(username,password,mail){
    try{
        await mongo.connect(process.env.DB)
        const salts=10
        const hashed=await hash(password,salts)
        const new_user=new User({
            Username:username,
            Email:mail,
            Password:hashed,
        })
        await new_user.save();
    }catch(e){
        console.error('Console ',e)
    }finally{
        await mongo.connection.close()
    }

}

async function VerifyCredentials(body) {
    const mail=body.mail
    const password=body.password
    try{
        await mongo.connect(process.env.DB)
        const user=await User.findOne({Email:mail})
        if(user===null){
            await mongo.connection.close()
            return false
        }
        const result= await bcrypt.compare(password,user.Password)
        await mongo.connection.close()
        return result
    }catch(e){
        await mongo.connection.close()
        return false;
    }
}

async function GetIdByName(mail) {
    await mongo.connect(process.env.DB)
    const user=await User.findOne({Email:mail})
    await mongo.connection.close()
    const result=user._id.toString()
    return result
}

async function GetNotes(id){
    try{
        await mongo.connect(process.env.DB)
        username=await User.findOne({"_id":id}).Username
        notes=await Note.find({"Username":username})
        return notes;
    }catch(e){
        console.error(e);
    }finally{
        await mongo.connection.close()
    }
}

async function SaveNote(body){
    try{
        await mongo.connect(process.env.DB)
        username=await User.findOne({"_id":body.id}).Username
        update= await Note.findOne({"Username":username,"Name":body.file_name})
        console.log(update)
        if(!update){
            const saved=new Note({
                Username:username,
                Notes:[
                    {
                        Name:body.file_name,
                        Content:body.content,
                    }
                ]
            })
            await saved.save()
        }else{
            await Note.updateOne({Username:username},{$set:{Content:body.content,Date:new Date()}})
        }
    }catch(e){
        console.error(e);
    }finally{
        await mongo.connection.close()
    }
}

async function GetText(name){
    try{
        await mongo.connect(process.env.DB)
        const query=await Note.findOne({"Notes.Name":name});
        const text=query.Notes.find(note => note.Name === name).Content
        return text
    }catch(e){
        console.error(e)
    }finally{
        await mongo.connection.close()
    }
}


module.exports={
    CheckDuplicates,
    SaveUser,
    VerifyCredentials,
    GetIdByName,
    GetNotes,
    SaveNote,
    GetText
}